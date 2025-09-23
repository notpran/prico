from typing import Optional, List, Dict, Any, Union
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from bson import ObjectId
from datetime import datetime
from enum import Enum

# Custom ObjectId field for MongoDB
class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, _schema_generator):
        return {"type": "string"}


# Enums
class UserRole(str, Enum):
    ADMIN = "admin"
    OWNER = "owner"
    MODERATOR = "moderator"
    MEMBER = "member"


class ChannelType(str, Enum):
    TEXT = "text"
    VOICE = "voice"
    VIDEO = "video"


class Visibility(str, Enum):
    PUBLIC = "public"
    PRIVATE = "private"
    INTERNAL = "internal"


class PullRequestStatus(str, Enum):
    OPEN = "open"
    MERGED = "merged"
    CLOSED = "closed"


# User Models
class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: str
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    age: Optional[int] = None
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_schema_extra": {
            "example": {
                "username": "johndoe",
                "email": "johndoe@example.com",
                "full_name": "John Doe",
                "bio": "Software developer and tech enthusiast",
                "avatar_url": "https://example.com/avatar.jpg"
            }
        }
    }

class UserCreate(UserBase):
    password: Optional[str] = None
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "username": "johndoe",
                "email": "johndoe@example.com",
                "full_name": "John Doe",
                "bio": "Software developer and tech enthusiast",
                "avatar_url": "https://example.com/avatar.jpg",
                "password": "securepassword123"
            }
        }
    }

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    
    model_config = {
        "arbitrary_types_allowed": True
    }

class UserInDB(UserBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    clerk_id: Optional[str] = None
    hashed_password: Optional[str] = None
    communities: Optional[List[PyObjectId]] = []
    friends: Optional[List[PyObjectId]] = []
    friend_requests_sent: Optional[List[PyObjectId]] = []
    friend_requests_received: Optional[List[PyObjectId]] = []
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str},
        "from_attributes": True
    }

class UserOut(BaseModel):
    id: str = Field(alias="_id")
    username: str
    email: EmailStr
    full_name: str
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    communities: Optional[List[str]] = []
    friends: Optional[List[str]] = []
    friend_requests_sent: Optional[List[str]] = []
    friend_requests_received: Optional[List[str]] = []
    created_at: datetime
    
    model_config = {
        "populate_by_name": True,
        "from_attributes": True,
        "json_schema_extra": {
            "example": {
                "_id": "60d5ec9af682fbd3e8a93795",
                "username": "johndoe",
                "email": "johndoe@example.com",
                "full_name": "John Doe",
                "bio": "Software developer and tech enthusiast",
                "avatar_url": "https://example.com/avatar.jpg",
                "created_at": "2023-09-30T12:00:00"
            }
        }
    }

# Community Models
class CommunityBase(BaseModel):
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    banner: Optional[str] = None
    visibility: str = "public"  # public, private
    owner_id: PyObjectId
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

class CommunityCreate(CommunityBase):
    members: Optional[List[PyObjectId]] = []
    roles: Optional[List[Dict[str, Any]]] = []
    channels: Optional[List[Dict[str, Any]]] = []

class CommunityUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    banner: Optional[str] = None
    visibility: Optional[str] = None
    
    model_config = {
        "arbitrary_types_allowed": True
    }

class CommunityInDB(CommunityBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    members: List[PyObjectId] = []
    roles: List[Dict[str, Any]] = []
    channels: List[Dict[str, Any]] = []
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str},
        "from_attributes": True
    }

class CommunityOut(BaseModel):
    id: str = Field(alias="_id")
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    banner: Optional[str] = None
    visibility: str
    owner_id: str
    members: List[str] = []
    roles: List[Dict[str, Any]] = []
    channels: List[Dict[str, Any]] = []
    created_at: datetime
    updated_at: datetime
    
    model_config = {
        "populate_by_name": True,
        "from_attributes": True
    }

# Message Models
class MessageBase(BaseModel):
    sender_id: PyObjectId
    content: str
    attachments: Optional[List[Dict[str, Any]]] = []
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

class MessageCreate(MessageBase):
    channel_id: Optional[PyObjectId] = None
    dm_id: Optional[PyObjectId] = None

class MessageInDB(MessageBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    channel_id: Optional[PyObjectId] = None
    dm_id: Optional[PyObjectId] = None
    reactions: List[Dict[str, Any]] = []
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str},
        "from_attributes": True
    }

class MessageOut(BaseModel):
    id: str = Field(alias="_id")
    sender_id: str
    content: str
    channel_id: Optional[str] = None
    dm_id: Optional[str] = None
    attachments: List[Dict[str, Any]] = []
    reactions: List[Dict[str, Any]] = []
    created_at: datetime
    updated_at: datetime
    
    model_config = {
        "populate_by_name": True,
        "from_attributes": True
    }

# Project Models
class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    banner: Optional[str] = None
    visibility: str = "public"  # public, private
    owner_id: PyObjectId
    community_id: Optional[PyObjectId] = None
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

class ProjectCreate(ProjectBase):
    members: Optional[List[PyObjectId]] = []
    roles: Optional[List[Dict[str, Any]]] = []
    files: Optional[List[Dict[str, Any]]] = []

class ProjectInDB(ProjectBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    members: List[PyObjectId] = []
    roles: List[Dict[str, Any]] = []
    files: List[Dict[str, Any]] = []
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str},
        "from_attributes": True
    }

class ProjectOut(BaseModel):
    id: str = Field(alias="_id")
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    banner: Optional[str] = None
    visibility: str
    owner_id: str
    community_id: Optional[str] = None
    members: List[str] = []
    roles: List[Dict[str, Any]] = []
    files: List[Dict[str, Any]] = []
    created_at: datetime
    updated_at: datetime
    
    model_config = {
        "populate_by_name": True,
        "from_attributes": True
    }

# Notification Models
class NotificationBase(BaseModel):
    user_id: PyObjectId
    type: str  # friend_request, community_invite, message, etc
    content: str
    related_id: Optional[str] = None
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

class NotificationCreate(NotificationBase):
    pass

class NotificationInDB(NotificationBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    read: bool = False
    created_at: datetime = Field(default_factory=datetime.now)
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str},
        "from_attributes": True
    }

class NotificationOut(BaseModel):
    id: str = Field(alias="_id")
    user_id: str
    type: str
    content: str
    related_id: Optional[str] = None
    read: bool
    created_at: datetime
    
    model_config = {
        "populate_by_name": True,
        "from_attributes": True
    }

# Pull Request Models
class PullRequestBase(BaseModel):
    title: str
    description: Optional[str] = None
    creator_id: PyObjectId
    project_id: PyObjectId
    source_branch: str
    target_branch: str = "main"
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

class PullRequestCreate(PullRequestBase):
    changes: Dict[str, Any] = {}
    status: PullRequestStatus = PullRequestStatus.OPEN

class PullRequestInDB(PullRequestBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    changes: Dict[str, Any] = {}
    status: PullRequestStatus = PullRequestStatus.OPEN
    comments: List[Dict[str, Any]] = []
    reviewers: List[PyObjectId] = []
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str},
        "from_attributes": True
    }

class PullRequestOut(BaseModel):
    id: str = Field(alias="_id")
    title: str
    description: Optional[str] = None
    creator_id: str
    project_id: str
    source_branch: str
    target_branch: str
    changes: Dict[str, Any] = {}
    status: PullRequestStatus
    comments: List[Dict[str, Any]] = []
    reviewers: List[str] = []
    created_at: datetime
    updated_at: datetime
    
    model_config = {
        "populate_by_name": True,
        "from_attributes": True
    }
