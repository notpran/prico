import Nodegit from 'nodegit';
import path from 'path';
import fs from 'fs/promises';
import { IRepo, Repo } from '../models/Repo';
import { IUser, User } from '../models/User';
import { IPullRequest, PullRequest } from '../models/PullRequest';

const REPOS_DIR = path.resolve(__dirname, '../../repos');

export async function createRepo(repoName: string, userId: string): Promise<IRepo> {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const repoPath = path.join(REPOS_DIR, user.username, repoName);
    await fs.mkdir(repoPath, { recursive: true });

    const gitRepo = await Nodegit.Repository.init(repoPath, 0);

    const repo = new Repo({
        name: repoName,
        ownerId: userId,
        path: repoPath,
    });

    await repo.save();
    return repo;
}

export async function commit(repoId: string, userId: string, message: string, files: { path: string, content: string }[]) {
    const repoDoc = await Repo.findById(repoId);
    if (!repoDoc) throw new Error('Repo not found');

    const gitRepo = await Nodegit.Repository.open(repoDoc.path);
    const index = await gitRepo.refreshIndex();

    for (const file of files) {
        const filePath = path.join(repoDoc.path, file.path);
        await fs.writeFile(filePath, file.content);
        await index.addByPath(file.path);
    }

    await index.write();
    const oid = await index.writeTree();

    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const author = Nodegit.Signature.now(user.displayName, user.email);
    const committer = author;

    const parent = await gitRepo.getHeadCommit().catch(() => null);
    const parents = parent ? [parent] : [];

    await gitRepo.createCommit('HEAD', author, committer, message, oid, parents);
}

export async function forkRepo(repoId: string, userId: string): Promise<IRepo> {
    const parentRepo = await Repo.findById(repoId);
    if (!parentRepo) throw new Error('Parent repo not found');

    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const newRepoPath = path.join(REPOS_DIR, user.username, parentRepo.name);
    await fs.mkdir(newRepoPath, { recursive: true });

    const gitRepo = await Nodegit.Clone.clone(parentRepo.path, newRepoPath);

    const newRepo = new Repo({
        name: parentRepo.name,
        ownerId: userId,
        path: newRepoPath,
        parentRepo: parentRepo._id,
    });

    await newRepo.save();

    parentRepo.forks.push(newRepo._id);
    await parentRepo.save();

    return newRepo;
}

export async function createPullRequest(
    sourceRepoId: string,
    targetRepoId: string,
    sourceBranch: string,
    targetBranch: string,
    title: string,
    description: string,
    authorId: string
): Promise<IPullRequest> {
    const sourceRepo = await Repo.findById(sourceRepoId);
    const targetRepo = await Repo.findById(targetRepoId);

    if (!sourceRepo || !targetRepo) {
        throw new Error('Source or target repo not found');
    }

    // In a real app, you'd want to do more checks here, e.g.,
    // - Check if the branches exist
    // - Check if there are any commits to be merged

    const pullRequest = new PullRequest({
        sourceRepo: sourceRepoId,
        targetRepo: targetRepoId,
        sourceBranch,
        targetBranch,
        title,
        description,
        authorId,
    });

    await pullRequest.save();
    return pullRequest;
}

export async function getPullRequestDiff(prId: string) {
    const pr = await PullRequest.findById(prId).populate('sourceRepo').populate('targetRepo');
    if (!pr) throw new Error('Pull request not found');

    const sourceRepo = await Nodegit.Repository.open((pr.sourceRepo as IRepo).path);
    const targetRepo = await Nodegit.Repository.open((pr.targetRepo as IRepo).path);

    const sourceCommit = await sourceRepo.getBranchCommit(pr.sourceBranch);
    const targetCommit = await targetRepo.getBranchCommit(pr.targetBranch);

    const diff = await Nodegit.Diff.treeToTree(targetRepo, await targetCommit.getTree(), await sourceCommit.getTree());

    const patches = await diff.patches();
    const patchPromises = patches.map(async (patch) => {
        const hunkPromises = (await patch.hunks()).map(async (hunk) => {
            const linePromises = (await hunk.lines()).map(line => ({
                origin: String.fromCharCode(line.origin()),
                content: line.content().trim(),
            }));
            return {
                oldStart: hunk.oldStart(),
                oldLines: hunk.oldLines(),
                newStart: hunk.newStart(),
                newLines: hunk.newLines(),
                lines: await Promise.all(linePromises),
            };
        });
        return {
            oldFile: patch.oldFile().path(),
            newFile: patch.newFile().path(),
            hunks: await Promise.all(hunkPromises),
        };
    });

    return Promise.all(patchPromises);
}

// Other functions like mergePullRequest would go here
