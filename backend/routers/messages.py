"""
Messages and DM routes for Prico API
"""
from fastapi import APIRouter, HTTPException, Depends, Body
from typing import List, Optional, Dict, Any
from datetime import datetime
import os
from dotenv import load_dotenv

from models import MessageCreate, MessageOut, MessageInDB
import database as db
from routers.users import verify_clerk_auth

# Load environment variables
load_dotenv()

router = APIRouter(
    prefix="/messages",
    tags=["messages"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=MessageOut, status_code=201)
async def create_message(
    message: MessageCreate,
    clerk_user: Dict[str, Any] = Depends(verify_clerk_auth)
):
    """
    Create a new message (DM or channel message)
    """
    # Get current user
    current_user = await db.get_user_by_clerk_id(clerk_user["id"])
    if not current_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Create message data
    message_data = message.dict()
    message_data["sender_id"] = current_user["_id"]
    message_data["created_at"] = datetime.utcnow()
    message_data["updated_at"] = datetime.utcnow()
    
    # If it's a DM, verify participants
    if message.dm_id:
        dm = await db.get_dm_by_id(str(message.dm_id))
        if not dm:
            raise HTTPException(status_code=404, detail="DM not found")
        
        # Check if user is a participant in the DM
        if current_user["_id"] not in dm["participants"]:
            raise HTTPException(status_code=403, detail="Not authorized to send messages in this DM")
    
    # Create the message
    message_id = await db.create_message(message_data)
    
    # Get the created message
    created_message = await db.get_message_by_id(message_id)
    
    return MessageOut(**created_message, id=message_id)


@router.get("/dm/{dm_id}", response_model=List[MessageOut])
async def get_dm_messages(
    dm_id: str,
    skip: int = 0,
    limit: int = 50,
    clerk_user: Dict[str, Any] = Depends(verify_clerk_auth)
):
    """
    Get messages for a DM
    """
    # Get current user
    current_user = await db.get_user_by_clerk_id(clerk_user["id"])
    if not current_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if DM exists and user is a participant
    dm = await db.get_dm_by_id(dm_id)
    if not dm:
        raise HTTPException(status_code=404, detail="DM not found")
    
    if current_user["_id"] not in dm["participants"]:
        raise HTTPException(status_code=403, detail="Not authorized to view this DM")
    
    # Get messages
    messages = await db.get_dm_messages(dm_id, limit, skip)
    
    return [MessageOut(**msg, id=str(msg["_id"])) for msg in messages]


@router.post("/dm", status_code=201)
async def create_or_get_dm(
    participant_id: str = Body(..., embed=True),
    clerk_user: Dict[str, Any] = Depends(verify_clerk_auth)
):
    """
    Create a new DM or get existing DM between two users
    """
    # Get current user
    current_user = await db.get_user_by_clerk_id(clerk_user["id"])
    if not current_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if the other participant exists
    other_user = await db.get_user_by_id(participant_id)
    if not other_user:
        raise HTTPException(status_code=404, detail="Participant not found")
    
    # Check if they are friends
    if participant_id not in current_user.get("friends", []):
        raise HTTPException(status_code=403, detail="Can only DM friends")
    
    # Check if DM already exists
    existing_dm = await db.get_dm_by_participants([current_user["_id"], other_user["_id"]])
    if existing_dm:
        return {"dm_id": str(existing_dm["_id"]), "message": "DM already exists"}
    
    # Create new DM
    dm_data = {
        "participants": [current_user["_id"], other_user["_id"]],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    dm_id = await db.create_dm(dm_data)
    return {"dm_id": dm_id, "message": "DM created successfully"}


@router.get("/dms", status_code=200)
async def get_user_dms(
    clerk_user: Dict[str, Any] = Depends(verify_clerk_auth)
):
    """
    Get all DMs for the current user
    """
    # Get current user
    current_user = await db.get_user_by_clerk_id(clerk_user["id"])
    if not current_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get user's DMs
    dms = await db.get_user_dms(current_user["_id"])
    
    # Enrich DMs with participant info and last message
    enriched_dms = []
    for dm in dms:
        # Get other participant info
        other_participant_id = None
        for participant_id in dm["participants"]:
            if participant_id != current_user["_id"]:
                other_participant_id = participant_id
                break
        
        if other_participant_id:
            other_user = await db.get_user_by_id(str(other_participant_id))
            if other_user:
                # Get last message
                last_messages = await db.get_dm_messages(str(dm["_id"]), limit=1)
                last_message = last_messages[0] if last_messages else None
                
                enriched_dms.append({
                    "dm_id": str(dm["_id"]),
                    "participant": {
                        "id": str(other_user["_id"]),
                        "username": other_user["username"],
                        "display_name": other_user.get("display_name"),
                        "avatar_url": other_user.get("avatar_url")
                    },
                    "last_message": {
                        "content": last_message["content"],
                        "created_at": last_message["created_at"],
                        "sender_id": str(last_message["sender_id"])
                    } if last_message else None,
                    "updated_at": dm["updated_at"]
                })
    
    return enriched_dms