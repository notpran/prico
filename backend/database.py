"""
Database utility functions for Prico
"""
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from typing import List, Optional, Dict, Any
from bson import ObjectId
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB connection
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "prico_db")


async def get_database() -> AsyncIOMotorDatabase:
    """
    Get database connection
    """
    client = AsyncIOMotorClient(MONGODB_URL)
    return client[DB_NAME]


async def get_collection(collection_name: str):
    """
    Get collection from database
    """
    db = await get_database()
    return db[collection_name]


# User operations
async def create_user(user_data: Dict[str, Any]) -> str:
    """
    Create a new user
    """
    users_collection = await get_collection("users")
    result = await users_collection.insert_one(user_data)
    return str(result.inserted_id)


async def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    """
    Get user by ID
    """
    users_collection = await get_collection("users")
    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    return user


async def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """
    Get user by email
    """
    users_collection = await get_collection("users")
    user = await users_collection.find_one({"email": email})
    return user


async def get_user_by_username(username: str) -> Optional[Dict[str, Any]]:
    """
    Get user by username
    """
    users_collection = await get_collection("users")
    user = await users_collection.find_one({"username": username})
    return user


async def update_user(user_id: str, update_data: Dict[str, Any]) -> bool:
    """
    Update user data
    """
    users_collection = await get_collection("users")
    result = await users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": update_data}
    )
    return result.modified_count > 0


async def get_user_by_clerk_id(clerk_id: str) -> Optional[Dict[str, Any]]:
    """
    Get user by Clerk ID
    """
    users_collection = await get_collection("users")
    user = await users_collection.find_one({"clerk_id": clerk_id})
    return user


async def get_users(skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
    """
    Get all users with pagination
    """
    users_collection = await get_collection("users")
    users = await users_collection.find().skip(skip).limit(limit).to_list(length=limit)
    return users


async def delete_user(user_id: str) -> bool:
    """
    Delete a user
    """
    users_collection = await get_collection("users")
    result = await users_collection.delete_one({"_id": ObjectId(user_id)})
    return result.deleted_count > 0


async def send_friend_request(user_id: str, friend_id: str) -> bool:
    """
    Send a friend request
    """
    users_collection = await get_collection("users")
    
    # Add to user's sent requests
    user_result = await users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$addToSet": {"friend_requests_sent": friend_id}}
    )
    
    # Add to friend's received requests
    friend_result = await users_collection.update_one(
        {"_id": ObjectId(friend_id)},
        {"$addToSet": {"friend_requests_received": user_id}}
    )
    
    return user_result.modified_count > 0 and friend_result.modified_count > 0


async def accept_friend_request(user_id: str, friend_id: str) -> bool:
    """
    Accept a friend request
    """
    users_collection = await get_collection("users")
    
    # Add to user's friends
    user_result = await users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {
            "$addToSet": {"friends": friend_id},
            "$pull": {"friend_requests_received": friend_id}
        }
    )
    
    # Add to friend's friends and remove from sent requests
    friend_result = await users_collection.update_one(
        {"_id": ObjectId(friend_id)},
        {
            "$addToSet": {"friends": user_id},
            "$pull": {"friend_requests_sent": user_id}
        }
    )
    
    return user_result.modified_count > 0 and friend_result.modified_count > 0


async def remove_friend(user_id: str, friend_id: str) -> bool:
    """
    Remove a friend
    """
    users_collection = await get_collection("users")
    
    # Remove from user's friends
    user_result = await users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$pull": {"friends": friend_id}}
    )
    
    # Remove from friend's friends
    friend_result = await users_collection.update_one(
        {"_id": ObjectId(friend_id)},
        {"$pull": {"friends": user_id}}
    )
    
    return user_result.modified_count > 0 and friend_result.modified_count > 0


# Community operations
async def create_community(community_data: Dict[str, Any]) -> str:
    """
    Create a new community
    """
    communities_collection = await get_collection("communities")
    result = await communities_collection.insert_one(community_data)
    return str(result.inserted_id)


async def get_community_by_id(community_id: str) -> Optional[Dict[str, Any]]:
    """
    Get community by ID
    """
    communities_collection = await get_collection("communities")
    community = await communities_collection.find_one({"_id": ObjectId(community_id)})
    return community


async def update_community(community_id: str, update_data: Dict[str, Any]) -> bool:
    """
    Update community data
    """
    communities_collection = await get_collection("communities")
    result = await communities_collection.update_one(
        {"_id": ObjectId(community_id)},
        {"$set": update_data}
    )
    return result.modified_count > 0


async def get_communities_by_user(user_id: str) -> List[Dict[str, Any]]:
    """
    Get communities for a user
    """
    communities_collection = await get_collection("communities")
    communities = await communities_collection.find(
        {"members": ObjectId(user_id)}
    ).to_list(None)
    return communities


# Message operations
async def create_message(message_data: Dict[str, Any]) -> str:
    """
    Create a new message
    """
    messages_collection = await get_collection("messages")
    result = await messages_collection.insert_one(message_data)
    return str(result.inserted_id)


async def get_channel_messages(channel_id: str, limit: int = 50, skip: int = 0) -> List[Dict[str, Any]]:
    """
    Get messages for a channel
    """
    messages_collection = await get_collection("messages")
    messages = await messages_collection.find(
        {"channel_id": ObjectId(channel_id)}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(None)
    return messages


async def get_dm_messages(dm_id: str, limit: int = 50, skip: int = 0) -> List[Dict[str, Any]]:
    """
    Get messages for a DM
    """
    messages_collection = await get_collection("messages")
    messages = await messages_collection.find(
        {"dm_id": ObjectId(dm_id)}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(None)
    return messages


# Project operations
async def create_project(project_data: Dict[str, Any]) -> str:
    """
    Create a new project
    """
    projects_collection = await get_collection("projects")
    result = await projects_collection.insert_one(project_data)
    return str(result.inserted_id)


async def get_project_by_id(project_id: str) -> Optional[Dict[str, Any]]:
    """
    Get project by ID
    """
    projects_collection = await get_collection("projects")
    project = await projects_collection.find_one({"_id": ObjectId(project_id)})
    return project


async def update_project(project_id: str, update_data: Dict[str, Any]) -> bool:
    """
    Update project data
    """
    projects_collection = await get_collection("projects")
    result = await projects_collection.update_one(
        {"_id": ObjectId(project_id)},
        {"$set": update_data}
    )
    return result.modified_count > 0


async def get_projects_by_user(user_id: str) -> List[Dict[str, Any]]:
    """
    Get projects for a user
    """
    projects_collection = await get_collection("projects")
    projects = await projects_collection.find(
        {"owner_id": ObjectId(user_id)}
    ).to_list(None)
    return projects


# Pull request operations
async def create_pull_request(pr_data: Dict[str, Any]) -> str:
    """
    Create a new pull request
    """
    prs_collection = await get_collection("pullRequests")
    result = await prs_collection.insert_one(pr_data)
    return str(result.inserted_id)


async def get_pull_request_by_id(pr_id: str) -> Optional[Dict[str, Any]]:
    """
    Get pull request by ID
    """
    prs_collection = await get_collection("pullRequests")
    pr = await prs_collection.find_one({"_id": ObjectId(pr_id)})
    return pr


async def update_pull_request(pr_id: str, update_data: Dict[str, Any]) -> bool:
    """
    Update pull request data
    """
    prs_collection = await get_collection("pullRequests")
    result = await prs_collection.update_one(
        {"_id": ObjectId(pr_id)},
        {"$set": update_data}
    )
    return result.modified_count > 0


async def get_pull_requests_by_project(project_id: str) -> List[Dict[str, Any]]:
    """
    Get pull requests for a project
    """
    prs_collection = await get_collection("pullRequests")
    prs = await prs_collection.find(
        {"project_id": ObjectId(project_id)}
    ).to_list(None)
    return prs


# Notification operations
async def create_notification(notification_data: Dict[str, Any]) -> str:
    """
    Create a new notification
    """
    notifications_collection = await get_collection("notifications")
    result = await notifications_collection.insert_one(notification_data)
    return str(result.inserted_id)


async def get_notifications_by_user(user_id: str, read: Optional[bool] = None) -> List[Dict[str, Any]]:
    """
    Get notifications for a user
    """
    notifications_collection = await get_collection("notifications")
    query = {"user_id": ObjectId(user_id)}
    
    if read is not None:
        query["read"] = read
        
    notifications = await notifications_collection.find(query).sort("created_at", -1).to_list(None)
    return notifications


async def mark_notification_as_read(notification_id: str) -> bool:
    """
    Mark notification as read
    """
    notifications_collection = await get_collection("notifications")
    result = await notifications_collection.update_one(
        {"_id": ObjectId(notification_id)},
        {"$set": {"read": True}}
    )
    return result.modified_count > 0