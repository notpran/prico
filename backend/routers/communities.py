"""
Community routes for Prico API
"""
from fastapi import APIRouter, HTTPException, Depends, Body
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

from models import CommunityCreate, CommunityOut, CommunityInDB, UserRole, ChannelType
import database as db

router = APIRouter(
    prefix="/communities",
    tags=["communities"],
    responses={404: {"description": "Not found"}},
)


@router.post("/", response_model=CommunityOut, status_code=201)
async def create_community(community: CommunityCreate):
    """
    Create a new community
    """
    # Check if owner exists
    owner = await db.get_user_by_id(str(community.owner_id))
    if not owner:
        raise HTTPException(status_code=404, detail="Owner not found")
    
    # Convert the community model to dict for database storage
    community_dict = community.dict()
    
    # Add owner to members list if not already there
    if community.owner_id not in community_dict.get("members", []):
        community_dict["members"] = [community.owner_id] + community_dict.get("members", [])
    
    # Add owner role
    owner_role = {"user_id": community.owner_id, "role": UserRole.OWNER}
    community_dict["roles"] = [owner_role] + community_dict.get("roles", [])
    
    # Create general channel if no channels exist
    if not community_dict.get("channels"):
        channel_id = ObjectId()
        community_dict["channels"] = [{
            "channel_id": channel_id,
            "name": "general",
            "type": ChannelType.TEXT
        }]
    
    # Insert the community into the database
    community_id = await db.create_community(community_dict)
    
    # Update user's communities list
    user = await db.get_user_by_id(str(community.owner_id))
    user_communities = user.get("communities", [])
    user_communities.append(ObjectId(community_id))
    await db.update_user(str(community.owner_id), {"communities": user_communities})
    
    # Return the created community
    created_community = await db.get_community_by_id(community_id)
    return CommunityOut(**created_community, id=community_id)


@router.get("/{community_id}", response_model=CommunityOut)
async def get_community(community_id: str):
    """
    Get community by ID
    """
    community = await db.get_community_by_id(community_id)
    if not community:
        raise HTTPException(status_code=404, detail="Community not found")
    return CommunityOut(**community, id=community_id)


@router.put("/{community_id}", response_model=CommunityOut)
async def update_community(community_id: str, update_data: dict = Body(...)):
    """
    Update community information
    """
    # Check if community exists
    community = await db.get_community_by_id(community_id)
    if not community:
        raise HTTPException(status_code=404, detail="Community not found")
    
    # Prevent updating critical fields
    if "owner_id" in update_data:
        raise HTTPException(status_code=400, detail="Cannot update owner_id")
    if "roles" in update_data:
        raise HTTPException(status_code=400, detail="Use dedicated endpoints to manage roles")
    if "members" in update_data:
        raise HTTPException(status_code=400, detail="Use dedicated endpoints to manage members")
    if "channels" in update_data:
        raise HTTPException(status_code=400, detail="Use dedicated endpoints to manage channels")
    
    # Update community data
    update_data["updated_at"] = datetime.utcnow()
    success = await db.update_community(community_id, update_data)
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to update community")
    
    # Return updated community
    updated_community = await db.get_community_by_id(community_id)
    return CommunityOut(**updated_community, id=community_id)


@router.post("/{community_id}/join/{user_id}", status_code=200)
async def join_community(community_id: str, user_id: str):
    """
    Join a community
    """
    # Check if community exists
    community = await db.get_community_by_id(community_id)
    if not community:
        raise HTTPException(status_code=404, detail="Community not found")
    
    # Check if community is public
    if community.get("visibility") != "public":
        raise HTTPException(status_code=403, detail="Cannot join private community without invitation")
    
    # Check if user exists
    user = await db.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if user is already a member
    members = community.get("members", [])
    if ObjectId(user_id) in members:
        raise HTTPException(status_code=400, detail="User is already a member of this community")
    
    # Add user to community members
    members.append(ObjectId(user_id))
    await db.update_community(community_id, {"members": members, "updated_at": datetime.utcnow()})
    
    # Add member role
    roles = community.get("roles", [])
    roles.append({"user_id": ObjectId(user_id), "role": UserRole.MEMBER})
    await db.update_community(community_id, {"roles": roles})
    
    # Add community to user's communities list
    user_communities = user.get("communities", [])
    user_communities.append(ObjectId(community_id))
    await db.update_user(user_id, {"communities": user_communities})
    
    # Notify community owner
    notification_data = {
        "user_id": str(community["owner_id"]),
        "type": "community_alert",
        "content": f"{user['username']} joined your community '{community['name']}'",
        "related_id": user_id,
        "created_at": datetime.utcnow()
    }
    
    await db.create_notification(notification_data)
    
    return {"message": "Successfully joined community"}


@router.delete("/{community_id}/leave/{user_id}", status_code=200)
async def leave_community(community_id: str, user_id: str):
    """
    Leave a community
    """
    # Check if community exists
    community = await db.get_community_by_id(community_id)
    if not community:
        raise HTTPException(status_code=404, detail="Community not found")
    
    # Check if user exists
    user = await db.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if user is the owner
    if str(community["owner_id"]) == user_id:
        raise HTTPException(status_code=400, detail="Owner cannot leave community, transfer ownership first")
    
    # Check if user is a member
    members = community.get("members", [])
    if ObjectId(user_id) not in members:
        raise HTTPException(status_code=400, detail="User is not a member of this community")
    
    # Remove user from community members
    members.remove(ObjectId(user_id))
    await db.update_community(community_id, {"members": members, "updated_at": datetime.utcnow()})
    
    # Remove user role
    roles = community.get("roles", [])
    roles = [role for role in roles if str(role["user_id"]) != user_id]
    await db.update_community(community_id, {"roles": roles})
    
    # Remove community from user's communities list
    user_communities = user.get("communities", [])
    if ObjectId(community_id) in user_communities:
        user_communities.remove(ObjectId(community_id))
        await db.update_user(user_id, {"communities": user_communities})
    
    return {"message": "Successfully left community"}


@router.post("/{community_id}/channels", status_code=201)
async def create_channel(community_id: str, channel_data: dict = Body(...)):
    """
    Create a new channel in a community
    """
    # Check if community exists
    community = await db.get_community_by_id(community_id)
    if not community:
        raise HTTPException(status_code=404, detail="Community not found")
    
    # Validate channel data
    if "name" not in channel_data:
        raise HTTPException(status_code=400, detail="Channel name is required")
    
    if "type" not in channel_data:
        raise HTTPException(status_code=400, detail="Channel type is required")
    
    if channel_data["type"] not in [ChannelType.TEXT, ChannelType.VOICE, ChannelType.VIDEO]:
        raise HTTPException(status_code=400, detail="Invalid channel type")
    
    # Create new channel
    channel_id = ObjectId()
    new_channel = {
        "channel_id": channel_id,
        "name": channel_data["name"],
        "type": channel_data["type"]
    }
    
    # Add channel to community
    channels = community.get("channels", [])
    channels.append(new_channel)
    await db.update_community(community_id, {"channels": channels, "updated_at": datetime.utcnow()})
    
    return {"message": "Channel created", "channel_id": str(channel_id)}


@router.delete("/{community_id}/channels/{channel_id}", status_code=200)
async def delete_channel(community_id: str, channel_id: str):
    """
    Delete a channel from a community
    """
    # Check if community exists
    community = await db.get_community_by_id(community_id)
    if not community:
        raise HTTPException(status_code=404, detail="Community not found")
    
    # Check if channel exists
    channels = community.get("channels", [])
    channel_exists = False
    for channel in channels:
        if str(channel["channel_id"]) == channel_id:
            channel_exists = True
            break
    
    if not channel_exists:
        raise HTTPException(status_code=404, detail="Channel not found")
    
    # Remove channel from community
    updated_channels = [channel for channel in channels if str(channel["channel_id"]) != channel_id]
    await db.update_community(community_id, {"channels": updated_channels, "updated_at": datetime.utcnow()})
    
    return {"message": "Channel deleted"}