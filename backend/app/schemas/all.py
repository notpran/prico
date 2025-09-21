from pydantic import BaseModel

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class MessageCreate(BaseModel):
    content: str

class ChatRoomCreate(BaseModel):
    name: str
    is_public: bool

class ProjectCreate(BaseModel):
    name: str
    description: str

class RepoFileCreate(BaseModel):
    path: str
    content: str

class PullRequestCreate(BaseModel):
    title: str
    description: str
