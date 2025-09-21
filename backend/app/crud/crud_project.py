from app.db.session import database
from app.models.all import Project, RepoFile, PullRequest
from app.schemas.all import ProjectCreate, RepoFileCreate, PullRequestCreate

async def create_project(project: ProjectCreate, owner_id: str):
    db_project = Project(**project.dict(), owner_id=owner_id)
    await database.projects.insert_one(db_project.dict(by_alias=True))
    return db_project

async def get_project(project_id: str):
    return await database.projects.find_one({"_id": project_id})

async def get_projects_by_owner(owner_id: str):
    return await database.projects.find({"owner_id": owner_id}).to_list(100)

async def create_repo_file(file: RepoFileCreate, project_id: str):
    db_file = RepoFile(**file.dict(), project_id=project_id)
    await database.repo_files.insert_one(db_file.dict(by_alias=True))
    return db_file

async def get_repo_files_by_project(project_id: str):
    return await database.repo_files.find({"project_id": project_id}).to_list(1000)

async def create_pull_request(pr: PullRequestCreate, project_id: str, author_id: str):
    db_pr = PullRequest(**pr.dict(), project_id=project_id, author_id=author_id)
    await database.pull_requests.insert_one(db_pr.dict(by_alias=True))
    return db_pr

async def get_pull_requests_by_project(project_id: str):
    return await database.pull_requests.find({"project_id": project_id}).to_list(100)
