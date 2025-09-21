from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")

class UserBase(BaseModel):
    email: EmailStr = Field(..., unique=True)
    username: Optional[str] = None
    is_active: bool = True
    is_superuser: bool = False

class UserCreate(UserBase):
    password: str

class UserUpdate(UserBase):
    password: Optional[str] = None

class UserInDBBase(UserBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")

    class Config:
        orm_mode = True
        allow_population_by_field_name = True
        json_encoders = {ObjectId: str}

class User(UserInDBBase):
    pass

class UserInDB(UserInDBBase):
    hashed_password: str

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

