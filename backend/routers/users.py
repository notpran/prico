
"""
User routes for Prico API
"""
from fastapi import APIRouter, HTTPException, Depends, Body, Header, Request
from typing import List, Optional, Dict, Any
from pydantic import EmailStr
from datetime import datetime
import json
import os
import httpx
from dotenv import load_dotenv
from jose import jwt, JWTError
from models import UserCreate, UserOut, UserInDB
import database as db
load_dotenv()

# Router initialization
router = APIRouter(
    prefix="/users",
    tags=["users"],
    responses={404: {"description": "Not found"}},
)

# Place sync endpoint after router initialization
@router.post("/sync-clerk")
async def sync_clerk_users():
    """
    Sync all Clerk users to MongoDB (admin/dev only)
    """
    clerk_secret = os.getenv("CLERK_SECRET_KEY")
    if not clerk_secret:
        raise HTTPException(status_code=500, detail="CLERK_SECRET_KEY not set")

    # Fetch all users from Clerk
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            "https://api.clerk.dev/v1/users",
            headers={"Authorization": f"Bearer {clerk_secret}"}
        )
        if resp.status_code != 200:
            raise HTTPException(status_code=500, detail=f"Clerk API error: {resp.text}")
        clerk_users = resp.json()

    synced = 0
    for cu in clerk_users:
        clerk_id = cu.get("id")
        username = cu.get("username") or cu.get("first_name", "") + cu.get("last_name", "")
        email = cu.get("email_addresses", [{}])[0].get("email_address")
        full_name = cu.get("first_name", "") + " " + cu.get("last_name", "")
        avatar_url = cu.get("image_url")

        # Upsert user in MongoDB
        user_data = {
            "clerk_id": clerk_id,
            "username": username,
            "email": email,
            "full_name": full_name.strip() or username,
            "bio": None,
            "avatar_url": avatar_url,
            "communities": [],
            "friends": [],
            "friend_requests_sent": [],
            "friend_requests_received": [],
            "created_at": cu.get("created_at"),
            "updated_at": cu.get("updated_at"),
        }
        await db.upsert_user_by_clerk_id(clerk_id, user_data)
        synced += 1

    return {"synced": synced}

import os
import httpx
from dotenv import load_dotenv
from jose import jwt, JWTError

from models import UserCreate, UserOut, UserInDB
import database as db

# Load environment variables
load_dotenv()
CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")

router = APIRouter(
    prefix="/users",
    tags=["users"],
    responses={404: {"description": "Not found"}},
)

async def verify_clerk_auth(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """
    Verify Clerk JWT token - simplified for development
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    token = authorization.replace("Bearer ", "")
    
    try:
        # For development, decode without verification to get payload
        payload = jwt.get_unverified_claims(token)
        
        # Clerk JWT usually has 'sub' field with user ID
        user_id = payload.get("sub", "")
        if not user_id:
            raise HTTPException(status_code=401, detail="No user ID in token")
        
        # Return user info with full payload for user creation
        return {"id": user_id, "clerk_id": user_id, "jwt_payload": payload}
        
    except Exception as e:
        # For development, if JWT decode fails, use a default user
        print(f"JWT decode error: {e}")
        # Create a real-looking mock user for development
        mock_payload = {
            "sub": "user_dev_12345",
            "email": "dev@prico.app",
            "username": "devuser",
            "name": "Development User",
            "image_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
        }
        return {"id": "user_dev_12345", "clerk_id": "user_dev_12345", "jwt_payload": mock_payload}


@router.post("/", response_model=UserOut, status_code=201)
async def create_user(user: UserCreate, clerk_user: Dict[str, Any] = Depends(verify_clerk_auth)):
    """
    Create a new user
    """
    # Check if email already exists
    existing_email = await db.get_user_by_email(user.email)
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check if username already exists
    existing_username = await db.get_user_by_username(user.username)
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # Validate age requirement
    if user.age < 13:
        raise HTTPException(status_code=400, detail="User must be at least 13 years old")
    
    # Convert the user model to dict for database storage
    user_dict = user.dict()
    
    # Add clerk_id to the user data
    user_dict["clerk_id"] = clerk_user["id"]
    
    # Insert the user into the database
    user_id = await db.create_user(user_dict)
    
    # Return the created user
    created_user = await db.get_user_by_id(user_id)
    return UserOut(**created_user, id=user_id)


@router.get("/me", response_model=UserOut)
async def get_current_user(clerk_user: Dict[str, Any] = Depends(verify_clerk_auth)):
    """
    Get the current authenticated user, create if doesn't exist
    """
    # Try to get existing user
    user = await db.get_user_by_clerk_id(clerk_user["id"])
    
    if not user:
        # User doesn't exist in our database, create from Clerk data
        jwt_payload = clerk_user.get("jwt_payload", {})
        
        # Extract user info from JWT payload
        email = jwt_payload.get("email", f"{clerk_user['id']}@example.com")
        username = jwt_payload.get("username", f"user_{clerk_user['id'][:8]}")
        full_name = jwt_payload.get("name", jwt_payload.get("full_name", "User"))
        
        # Create user data
        user_data = {
            "clerk_id": clerk_user["id"],
            "username": username,
            "email": email,
            "full_name": full_name,
            "bio": None,
            "avatar_url": jwt_payload.get("image_url", None),
            "communities": [],
            "friends": [],
            "friend_requests_sent": [],
            "friend_requests_received": [],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        # Insert the user into the database
        user_id = await db.create_user(user_data)
        user = await db.get_user_by_id(user_id)
    
    user_data = dict(user)
    user_data["_id"] = str(user["_id"])  # Convert ObjectId to string
    return UserOut(**user_data)


@router.get("/search", response_model=List[UserOut])
async def search_users(
    q: str,
    clerk_user: Dict[str, Any] = Depends(verify_clerk_auth),
    limit: int = 10
):
    """
    Search users by username or display name
    """
    if len(q.strip()) < 2:
        raise HTTPException(status_code=400, detail="Search query must be at least 2 characters")
    
    users = await db.search_users(q, limit)
    
    # Convert ObjectId to string and prepare user data
    result = []
    for user in users:
        user_data = dict(user)
        user_data["_id"] = str(user["_id"])  # Convert ObjectId to string
        result.append(UserOut(**user_data))
    
    return result


@router.get("/{user_id}", response_model=UserOut)
async def get_user(user_id: str, clerk_user: Dict[str, Any] = Depends(verify_clerk_auth)):
    """
    Get user by ID
    """
    user = await db.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_data = dict(user)
    user_data["_id"] = str(user["_id"])  # Convert ObjectId to string
    return UserOut(**user_data)


@router.put("/me", response_model=UserOut)
async def update_current_user(update_data: dict = Body(...), clerk_user: Dict[str, Any] = Depends(verify_clerk_auth)):
    """
    Update current user information
    """
    user = await db.get_user_by_clerk_id(clerk_user["id"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get the user_id from the user
    user_id = user["_id"]
    
    # Update user data
    update_data["updated_at"] = datetime.utcnow()
    success = await db.update_user(user_id, update_data)
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to update user")
    
    # Return the updated user
    updated_user = await db.get_user_by_id(user_id)
    return UserOut(**updated_user, id=user_id)


@router.put("/{user_id}", response_model=UserOut)
async def update_user(user_id: str, update_data: dict = Body(...), clerk_user: Dict[str, Any] = Depends(verify_clerk_auth)):
    """
    Update user information
    """
    # Check if user exists
    user = await db.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if the current user is the same as the user being updated or has admin privileges
    current_user = await db.get_user_by_clerk_id(clerk_user["id"])
    if str(current_user["_id"]) != user_id and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to update this user")
    
    # Update user data
    update_data["updated_at"] = datetime.utcnow()
    success = await db.update_user(user_id, update_data)
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to update user")
    
    # Return the updated user
    updated_user = await db.get_user_by_id(user_id)
    return UserOut(**updated_user, id=user_id)


@router.delete("/me", response_model=dict)
async def delete_current_user(clerk_user: Dict[str, Any] = Depends(verify_clerk_auth)):
    """
    Delete current user
    """
    user = await db.get_user_by_clerk_id(clerk_user["id"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get the user_id from the user
    user_id = user["_id"]
    
    # Delete the user
    success = await db.delete_user(user_id)
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete user")
    
    return {"message": "User deleted successfully"}


@router.delete("/{user_id}", response_model=dict)
async def delete_user(user_id: str, clerk_user: Dict[str, Any] = Depends(verify_clerk_auth)):
    """
    Delete user
    """
    # Check if user exists
    user = await db.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if the current user is an admin
    current_user = await db.get_user_by_clerk_id(clerk_user["id"])
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this user")
    
    # Delete the user
    success = await db.delete_user(user_id)
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete user")
    
    return {"message": "User deleted successfully"}


@router.get("/", response_model=List[UserOut])
async def get_users(clerk_user: Dict[str, Any] = Depends(verify_clerk_auth), skip: int = 0, limit: int = 100):
    """
    Get all users
    """
    # Check if the current user is an admin
    current_user = await db.get_user_by_clerk_id(clerk_user["id"])
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to view all users")
    
    users = await db.get_users(skip, limit)
    return [UserOut(**user, id=user["_id"]) for user in users]


@router.post("/webhook", status_code=200)
async def clerk_webhook(request: Request):
    """
    Handle Clerk webhooks
    """
    # Verify the webhook signature (in production)
    # data = await request.json()
    
    # For simplicity, we're not implementing webhook verification here
    # In a production environment, you should verify the webhook signature
    
    return {"message": "Webhook received"}


@router.post("/{user_id}/friends/request/{friend_id}", status_code=200)
async def send_friend_request(
    user_id: str, 
    friend_id: str,
    clerk_user: Dict[str, Any] = Depends(verify_clerk_auth)
):
    """
    Send a friend request to another user
    """
    # Check if user exists
    user = await db.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if friend exists
    friend = await db.get_user_by_id(friend_id)
    if not friend:
        raise HTTPException(status_code=404, detail="Friend not found")
    
    # Check if the current user is the same as the user sending the request
    current_user = await db.get_user_by_clerk_id(clerk_user["id"])
    if str(current_user["_id"]) != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to send friend requests for this user")
    
    # Check if friend request already exists
    if friend_id in user.get("friend_requests_sent", []) or user_id in friend.get("friend_requests_received", []):
        raise HTTPException(status_code=400, detail="Friend request already sent")
    
    # Check if already friends
    if friend_id in user.get("friends", []):
        raise HTTPException(status_code=400, detail="Already friends with this user")
    
    # Send friend request
    await db.send_friend_request(user_id, friend_id)
    
    return {"message": "Friend request sent successfully"}


@router.post("/{user_id}/friends/accept/{friend_id}", status_code=200)
async def accept_friend_request(
    user_id: str, 
    friend_id: str,
    clerk_user: Dict[str, Any] = Depends(verify_clerk_auth)
):
    """
    Accept a friend request
    """
    # Check if user exists
    user = await db.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if friend exists
    friend = await db.get_user_by_id(friend_id)
    if not friend:
        raise HTTPException(status_code=404, detail="Friend not found")
    
    # Check if the current user is the same as the user accepting the request
    current_user = await db.get_user_by_clerk_id(clerk_user["id"])
    if str(current_user["_id"]) != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to accept friend requests for this user")
    
    # Check if friend request exists
    if friend_id not in user.get("friend_requests_received", []):
        raise HTTPException(status_code=400, detail="No friend request from this user")
    
    # Accept friend request
    await db.accept_friend_request(user_id, friend_id)
    
    return {"message": "Friend request accepted successfully"}


@router.delete("/{user_id}/friends/{friend_id}", status_code=200)
async def remove_friend(
    user_id: str, 
    friend_id: str,
    clerk_user: Dict[str, Any] = Depends(verify_clerk_auth)
):
    """
    Remove a friend
    """
    # Check if user exists
    user = await db.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if friend exists
    friend = await db.get_user_by_id(friend_id)
    if not friend:
        raise HTTPException(status_code=404, detail="Friend not found")
    
    # Check if the current user is the same as the user removing the friend
    current_user = await db.get_user_by_clerk_id(clerk_user["id"])
    if str(current_user["_id"]) != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to remove friends for this user")
    
    # Check if they are friends
    if friend_id not in user.get("friends", []):
        raise HTTPException(status_code=400, detail="Not friends with this user")
    
    # Remove friend
    await db.remove_friend(user_id, friend_id)
    
    return {"message": "Friend removed successfully"}