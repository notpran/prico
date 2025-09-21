from pydantic import BaseModel
from typing import List, Optional

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class User(BaseModel):
    id: str
    username: str
    email: str
    is_active: bool = True
    is_verified: bool = False

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class MessageCreate(BaseModel):
    content: str

class Message(BaseModel):
    id: str
    room_id: str
    sender_id: str
    content: str
    timestamp: str

class ChatRoomCreate(BaseModel):
    name: str
    is_public: bool = True

class ChatRoom(BaseModel):
    id: str
    name: str
    is_public: bool
    member_ids: List[str]

class ProjectCreate(BaseModel):
    name: str
    description: str

class Project(BaseModel):
    id: str
    name: str
    owner_id: str
    description: Optional[str] = None

class RepoFileCreate(BaseModel):
    path: str
    content: str

class RepoFile(BaseModel):
    id: str
    project_id: str
    path: str
    content: str

class PullRequestCreate(BaseModel):
    title: str
    description: str

class PullRequest(BaseModel):
    id: str
    project_id: str
    author_id: str
    title: str
    description: str
    status: str = "open"
