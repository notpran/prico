import { Router } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../../middleware/authMiddleware';
import { createRepo, commit, forkRepo, createPullRequest, getPullRequestDiff } from '../../services/gitService';
import { PullRequest } from '../../models/PullRequest';

const router = Router();

// Create a new repository
router.post('/repos', authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
        const { name } = req.body;
        const userId = req.userId!;
        const repo = await createRepo(name, userId);
        res.status(201).json(repo);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Commit to a repository
router.post('/repos/:id/commits', authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
        const { id } = req.params;
        const { message, files } = req.body;
        const userId = req.userId!;
        await commit(id, userId, message, files);
        res.status(201).json({ message: 'Commit created' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Fork a repository
router.post('/repos/:id/forks', authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId!;
        const repo = await forkRepo(id, userId);
        res.status(201).json(repo);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Create a pull request
router.post('/pull-requests', authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
        const { sourceRepoId, targetRepoId, sourceBranch, targetBranch, title, description } = req.body;
        const authorId = req.userId!;
        const pr = await createPullRequest(sourceRepoId, targetRepoId, sourceBranch, targetBranch, title, description, authorId);
        res.status(201).json(pr);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Get pull requests for a repo
router.get('/repos/:id/pull-requests', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const prs = await PullRequest.find({ targetRepo: id }).populate('authorId', 'displayName');
        res.json(prs);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Get diff for a pull request
router.get('/pull-requests/:id/diff', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const diff = await getPullRequestDiff(id);
        res.json(diff);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});


export default router;
