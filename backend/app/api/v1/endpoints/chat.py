from fastapi import APIRouter, Depends, HTTPException
from app import schemas
from app.crud import crud_chat
from app.api import deps
from app.models import User
from datetime import datetime

router = APIRouter()

@router.post("/rooms")
async def create_room(
    *,
    room_in: schemas.ChatRoomCreate,
    current_user: User = Depends(deps.get_current_user),
):
    return await crud_chat.create_chat_room(chat_room_data=room_in.dict(), owner_id=current_user.id)

@router.get("/rooms/{room_id}/messages")
async def get_messages(
    room_id: str,
    current_user: User = Depends(deps.get_current_user),
):
    # Check if user is a member of the room
    room = await crud_chat.get_chat_room(room_id)
    if not room or current_user.id not in room["member_ids"]:
        raise HTTPException(status_code=403, detail="Not a member of this room")
    return await crud_chat.get_chat_messages(room_id)

@router.post("/rooms/{room_id}/messages")
async def send_message(
    room_id: str,
    *,
    message_in: schemas.MessageCreate,
    current_user: User = Depends(deps.get_current_user),
):
    # Check if user is a member of the room
    room = await crud_chat.get_chat_room(room_id)
    if not room or current_user.id not in room["member_ids"]:
        raise HTTPException(status_code=403, detail="Not a member of this room")
    
    message_data = {
        "room_id": room_id,
        "sender_id": current_user.id,
        "content": message_in.content,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    return await crud_chat.save_message(message_data)

@router.get("/messages/{project_id}")
async def get_project_messages(
    project_id: str,
    current_user: User = Depends(deps.get_current_user)
):
    """
    Get messages for a project.
    """
    messages = await crud_chat.get_chat_messages(project_id)
    return messages
