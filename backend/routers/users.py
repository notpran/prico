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
    Verify Clerk JWT token
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    token = authorization.replace("Bearer ", "")
    
    # Verify token with Clerk
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                "https://api.clerk.dev/v1/me",
                headers={"Authorization": f"Bearer {token}"}
            )
            if response.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid token")
            
            return response.json()
        except Exception as e:
            raise HTTPException(status_code=401, detail=f"Authentication error: {str(e)}")


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
    Get the current authenticated user
    """
    user = await db.get_user_by_clerk_id(clerk_user["id"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserOut(**user, id=user["_id"])


@router.get("/{user_id}", response_model=UserOut)
async def get_user(user_id: str, clerk_user: Dict[str, Any] = Depends(verify_clerk_auth)):
    """
    Get user by ID
    """
    user = await db.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserOut(**user, id=user_id)


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