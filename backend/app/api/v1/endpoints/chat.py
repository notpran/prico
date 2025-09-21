from fastapi import APIRouter, Depends, HTTPException
from app import crud, schemas
from app.api import deps
from app.models import User

router = APIRouter()

@router.post("/rooms", response_model=schemas.ChatRoom)
async def create_room(
    *,
    room_in: schemas.ChatRoomCreate,
    current_user: User = Depends(deps.get_current_user),
):
    return await crud.chat.create_chat_room(chat_room=room_in, owner_id=current_user.id)

@router.get("/rooms/{room_id}/messages", response_model=list[schemas.Message])
async def get_messages(
    room_id: str,
    current_user: User = Depends(deps.get_current_user),
):
    # Check if user is a member of the room
    room = await crud.chat.get_chat_room(room_id)
    if current_user.id not in room["member_ids"]:
        raise HTTPException(status_code=403, detail="Not a member of this room")
    return await crud.chat.get_messages_by_room(room_id=room_id)

@router.post("/rooms/{room_id}/messages", response_model=schemas.Message)
async def send_message(
    room_id: str,
    *,
    message_in: schemas.MessageCreate,
    current_user: User = Depends(deps.get_current_user),
):
    # Check if user is a member of the room
    room = await crud.chat.get_chat_room(room_id)
    if current_user.id not in room["member_ids"]:
        raise HTTPException(status_code=403, detail="Not a member of this room")
    return await crud.chat.create_message(message=message_in, room_id=room_id, sender_id=current_user.id)
