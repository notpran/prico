"""
Prico Database Models for MongoDB
"""
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum
from bson import ObjectId


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
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")


class UserRole(str, Enum):
    OWNER = "owner"
    ADMIN = "admin"
    MODERATOR = "moderator"
    MEMBER = "member"


class ChannelType(str, Enum):
    TEXT = "text"
    VOICE = "voice"
    VIDEO = "video"


class Visibility(str, Enum):
    PUBLIC = "public"
    PRIVATE = "private"


class PullRequestStatus(str, Enum):
    OPEN = "open"
    MERGED = "merged"
    CLOSED = "closed"


class UserBase(BaseModel):
    email: EmailStr
    username: str
    display_name: Optional[str] = None
    age: int
    about_me: Optional[str] = None
    role: str = "user"  # Default role is "user"
    badges: List[str] = []
    friends: List[str] = []
    friend_requests_sent: List[str] = []
    friend_requests_received: List[str] = []
    projects: List[str] = []
    communities: List[str] = []
    clerk_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class UserCreate(UserBase):
    # We don't need password here since Clerk handles authentication
    pass


class UserInDB(UserBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class UserOut(UserBase):
    id: str

    class Config:
        orm_mode = True


class Role(BaseModel):
    user_id: PyObjectId
    role: UserRole


class Channel(BaseModel):
    channel_id: PyObjectId = Field(default_factory=PyObjectId)
    name: str
    type: ChannelType


class CommunityBase(BaseModel):
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    owner_id: PyObjectId
    roles: List[Role] = []
    members: List[PyObjectId] = []
    channels: List[Channel] = []
    visibility: Visibility
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class CommunityCreate(CommunityBase):
    pass


class CommunityInDB(CommunityBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class CommunityOut(CommunityBase):
    id: str

    class Config:
        orm_mode = True


class Reaction(BaseModel):
    emoji: str
    user_id: PyObjectId


class MessageBase(BaseModel):
    sender_id: PyObjectId
    channel_id: Optional[PyObjectId] = None
    dm_id: Optional[PyObjectId] = None
    content: str
    attachments: List[str] = []
    reactions: List[Reaction] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class MessageCreate(MessageBase):
    pass


class MessageInDB(MessageBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class MessageOut(MessageBase):
    id: str

    class Config:
        orm_mode = True


class File(BaseModel):
    path: str
    content: str


class ProjectBase(BaseModel):
    owner_id: PyObjectId
    name: str
    description: Optional[str] = None
    visibility: Visibility
    files: List[File] = []
    contributors: List[PyObjectId] = []
    forks: List[PyObjectId] = []
    pull_requests: List[PyObjectId] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class ProjectCreate(ProjectBase):
    pass


class ProjectInDB(ProjectBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class ProjectOut(ProjectBase):
    id: str

    class Config:
        orm_mode = True


class PullRequestBase(BaseModel):
    project_id: PyObjectId
    creator_id: PyObjectId
    changes: Dict[str, Any]
    status: PullRequestStatus
    created_at: datetime = Field(default_factory=datetime.utcnow)


class PullRequestCreate(PullRequestBase):
    pass


class PullRequestInDB(PullRequestBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class PullRequestOut(PullRequestBase):
    id: str

    class Config:
        orm_mode = True


class NotificationType(str, Enum):
    FRIEND_REQUEST = "friend_request"
    MENTION = "mention"
    PR_UPDATE = "pr_update"
    COMMUNITY_ALERT = "community_alert"


class NotificationBase(BaseModel):
    user_id: PyObjectId
    type: NotificationType
    content: str
    read: bool = False
    related_id: Optional[PyObjectId] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class NotificationCreate(NotificationBase):
    pass


class NotificationInDB(NotificationBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class NotificationOut(NotificationBase):
    id: str

    class Config:
        orm_mode = True