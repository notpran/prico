from pydantic import BaseModel, Field, EmailStr
from typing import Optional
import uuid

class User(BaseModel):
    id: str = Field(default_factory=uuid.uuid4, alias="_id")
    username: str
    email: EmailStr
    hashed_password: str
    is_active: bool = True
    is_verified: bool = False

class Message(BaseModel):
    id: str = Field(default_factory=uuid.uuid4, alias="_id")
    room_id: str
    sender_id: str
    content: str
    timestamp: str

class ChatRoom(BaseModel):
    id: str = Field(default_factory=uuid.uuid4, alias="_id")
    name: str
    is_public: bool = True
    member_ids: list[str] = []

class Project(BaseModel):
    id: str = Field(default_factory=uuid.uuid4, alias="_id")
    name: str
    owner_id: str
    description: Optional[str] = None

class RepoFile(BaseModel):
    id: str = Field(default_factory=uuid.uuid4, alias="_id")
    project_id: str
    path: str
    content: str

class PullRequest(BaseModel):
    id: str = Field(default_factory=uuid.uuid4, alias="_id")
    project_id: str
    author_id: str
    title: str
    description: str
    status: str = "open"
