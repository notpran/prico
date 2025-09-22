"""
Project routes for Prico API
"""
from fastapi import APIRouter, HTTPException, Depends, Body, File, UploadFile
from typing import List, Optional, Dict, Any
from datetime import datetime
from bson import ObjectId

from models import ProjectCreate, ProjectOut, ProjectInDB, PullRequestCreate, PullRequestOut, Visibility
import database as db

router = APIRouter(
    prefix="/projects",
    tags=["projects"],
    responses={404: {"description": "Not found"}},
)


@router.post("/", response_model=ProjectOut, status_code=201)
async def create_project(project: ProjectCreate):
    """
    Create a new project
    """
    # Check if owner exists
    owner = await db.get_user_by_id(str(project.owner_id))
    if not owner:
        raise HTTPException(status_code=404, detail="Owner not found")
    
    # Convert the project model to dict for database storage
    project_dict = project.dict()
    
    # Insert the project into the database
    project_id = await db.create_project(project_dict)
    
    # Update user's projects list
    user_projects = owner.get("projects", [])
    user_projects.append(ObjectId(project_id))
    await db.update_user(str(project.owner_id), {"projects": user_projects})
    
    # Return the created project
    created_project = await db.get_project_by_id(project_id)
    return ProjectOut(**created_project, id=project_id)


@router.get("/", response_model=List[ProjectOut])
async def get_public_projects(skip: int = 0, limit: int = 10):
    """
    Get public projects
    """
    projects_collection = await db.get_collection("projects")
    projects = await projects_collection.find(
        {"visibility": Visibility.PUBLIC}
    ).skip(skip).limit(limit).to_list(None)
    
    return [ProjectOut(**project, id=str(project["_id"])) for project in projects]


@router.get("/user/{user_id}", response_model=List[ProjectOut])
async def get_user_projects(user_id: str):
    """
    Get projects for a user
    """
    # Check if user exists
    user = await db.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    projects = await db.get_projects_by_user(user_id)
    return [ProjectOut(**project, id=str(project["_id"])) for project in projects]


@router.get("/{project_id}", response_model=ProjectOut)
async def get_project(project_id: str):
    """
    Get project by ID
    """
    project = await db.get_project_by_id(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return ProjectOut(**project, id=project_id)


@router.put("/{project_id}", response_model=ProjectOut)
async def update_project(project_id: str, update_data: dict = Body(...)):
    """
    Update project information
    """
    # Check if project exists
    project = await db.get_project_by_id(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Prevent updating critical fields
    if "owner_id" in update_data:
        raise HTTPException(status_code=400, detail="Cannot update owner_id")
    
    # Update project data
    update_data["updated_at"] = datetime.utcnow()
    success = await db.update_project(project_id, update_data)
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to update project")
    
    # Return updated project
    updated_project = await db.get_project_by_id(project_id)
    return ProjectOut(**updated_project, id=project_id)


@router.post("/{project_id}/files", status_code=201)
async def add_file_to_project(project_id: str, file_data: dict = Body(...)):
    """
    Add or update a file in a project
    """
    # Check if project exists
    project = await db.get_project_by_id(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Validate file data
    if "path" not in file_data:
        raise HTTPException(status_code=400, detail="File path is required")
    
    if "content" not in file_data:
        raise HTTPException(status_code=400, detail="File content is required")
    
    # Check if file already exists
    files = project.get("files", [])
    file_exists = False
    for i, file in enumerate(files):
        if file["path"] == file_data["path"]:
            file_exists = True
            files[i] = file_data
            break
    
    if not file_exists:
        files.append(file_data)
    
    # Update project files
    await db.update_project(project_id, {
        "files": files,
        "updated_at": datetime.utcnow()
    })
    
    return {"message": "File added/updated successfully"}


@router.delete("/{project_id}/files", status_code=200)
async def delete_file_from_project(project_id: str, path: str):
    """
    Delete a file from a project
    """
    # Check if project exists
    project = await db.get_project_by_id(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check if file exists
    files = project.get("files", [])
    updated_files = [file for file in files if file["path"] != path]
    
    if len(files) == len(updated_files):
        raise HTTPException(status_code=404, detail="File not found")
    
    # Update project files
    await db.update_project(project_id, {
        "files": updated_files,
        "updated_at": datetime.utcnow()
    })
    
    return {"message": "File deleted successfully"}


@router.post("/{project_id}/fork/{user_id}", response_model=ProjectOut, status_code=201)
async def fork_project(project_id: str, user_id: str):
    """
    Fork a project
    """
    # Check if project exists
    project = await db.get_project_by_id(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check if project is public
    if project["visibility"] != Visibility.PUBLIC:
        raise HTTPException(status_code=403, detail="Cannot fork private projects")
    
    # Check if user exists
    user = await db.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Create new project as fork
    fork_data = {
        "owner_id": ObjectId(user_id),
        "name": f"{project['name']}-fork",
        "description": project.get("description", ""),
        "visibility": project["visibility"],
        "files": project.get("files", []),
        "contributors": [ObjectId(user_id)],
        "forks": [],
        "pull_requests": [],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    # Insert fork into database
    fork_id = await db.create_project(fork_data)
    
    # Update user's projects list
    user_projects = user.get("projects", [])
    user_projects.append(ObjectId(fork_id))
    await db.update_user(user_id, {"projects": user_projects})
    
    # Update original project's forks list
    project_forks = project.get("forks", [])
    project_forks.append(ObjectId(fork_id))
    await db.update_project(project_id, {"forks": project_forks})
    
    # Return the forked project
    forked_project = await db.get_project_by_id(fork_id)
    return ProjectOut(**forked_project, id=fork_id)


@router.post("/{project_id}/pull-requests", response_model=PullRequestOut, status_code=201)
async def create_pull_request(project_id: str, pull_request: PullRequestCreate):
    """
    Create a pull request
    """
    # Check if project exists
    project = await db.get_project_by_id(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check if creator exists
    creator = await db.get_user_by_id(str(pull_request.creator_id))
    if not creator:
        raise HTTPException(status_code=404, detail="Creator not found")
    
    # Convert the pull request model to dict for database storage
    pr_dict = pull_request.dict()
    
    # Insert the pull request into the database
    pr_id = await db.create_pull_request(pr_dict)
    
    # Update project's pull requests list
    project_prs = project.get("pull_requests", [])
    project_prs.append(ObjectId(pr_id))
    await db.update_project(project_id, {"pull_requests": project_prs})
    
    # Create notification for project owner
    notification_data = {
        "user_id": str(project["owner_id"]),
        "type": "pr_update",
        "content": f"New pull request created by {creator['username']} for {project['name']}",
        "related_id": pr_id,
        "created_at": datetime.utcnow()
    }
    
    await db.create_notification(notification_data)
    
    # Return the created pull request
    created_pr = await db.get_pull_request_by_id(pr_id)
    return PullRequestOut(**created_pr, id=pr_id)


@router.get("/{project_id}/pull-requests", response_model=List[PullRequestOut])
async def get_project_pull_requests(project_id: str):
    """
    Get pull requests for a project
    """
    # Check if project exists
    project = await db.get_project_by_id(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    prs = await db.get_pull_requests_by_project(project_id)
    return [PullRequestOut(**pr, id=str(pr["_id"])) for pr in prs]


@router.put("/pull-requests/{pr_id}", response_model=PullRequestOut)
async def update_pull_request_status(pr_id: str, status: str = Body(..., embed=True)):
    """
    Update pull request status
    """
    # Check if pull request exists
    pr = await db.get_pull_request_by_id(pr_id)
    if not pr:
        raise HTTPException(status_code=404, detail="Pull request not found")
    
    # Validate status
    if status not in [PullRequestStatus.OPEN, PullRequestStatus.MERGED, PullRequestStatus.CLOSED]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    # Update pull request status
    await db.update_pull_request(pr_id, {"status": status})
    
    # If merging, apply changes to the project
    if status == PullRequestStatus.MERGED:
        project = await db.get_project_by_id(str(pr["project_id"]))
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Apply changes - simplified implementation
        # In a real system, this would involve more complex git-like operations
        changes = pr.get("changes", {})
        
        # Create notification for PR creator
        notification_data = {
            "user_id": str(pr["creator_id"]),
            "type": "pr_update",
            "content": f"Your pull request for {project['name']} was merged",
            "related_id": pr_id,
            "created_at": datetime.utcnow()
        }
        
        await db.create_notification(notification_data)
    
    # Return updated pull request
    updated_pr = await db.get_pull_request_by_id(pr_id)
    return PullRequestOut(**updated_pr, id=pr_id)