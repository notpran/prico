from fastapi import APIRouter, Depends, HTTPException
from app import schemas
from app.crud import crud_project
from app.api import deps
from app.models import User

router = APIRouter()

@router.post("/")
async def create_project(
    *,
    project_in: schemas.ProjectCreate,
    current_user: User = Depends(deps.get_current_user),
):
    return await crud_project.create_project(project=project_in, owner_id=current_user.id)

@router.get("/")
async def get_projects(
    current_user: User = Depends(deps.get_current_user),
):
    return await crud_project.get_projects_by_owner(owner_id=current_user.id)

@router.get("/{project_id}")
async def get_project(
    project_id: str,
    current_user: User = Depends(deps.get_current_user),
):
    project = await crud_project.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    # TODO: Add check for user access to project
    return project

@router.post("/{project_id}/files")
async def add_file(
    project_id: str,
    *,
    file_in: schemas.RepoFileCreate,
    current_user: User = Depends(deps.get_current_user),
):
    # TODO: Add check for user access to project
    return await crud_project.create_repo_file(file=file_in, project_id=project_id)

@router.get("/{project_id}/files")
async def get_files(
    project_id: str,
    current_user: User = Depends(deps.get_current_user),
):
    # TODO: Add check for user access to project
    return await crud_project.get_repo_files_by_project(project_id=project_id)


@router.post("/{project_id}/pulls")
async def create_pull_request(
    project_id: str,
    *,
    pr_in: schemas.PullRequestCreate,
    current_user: User = Depends(deps.get_current_user),
):
    # TODO: Add check for user access to project
    return await crud_project.create_pull_request(pr=pr_in, project_id=project_id, author_id=current_user.id)

@router.get("/{project_id}/pulls")
async def get_pull_requests(
    project_id: str,
    current_user: User = Depends(deps.get_current_user),
):
    # TODO: Add check for user access to project
    return await crud_project.get_pull_requests_by_project(project_id=project_id)
