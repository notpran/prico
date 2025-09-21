from app.db.session import database
from app.models.all import ChatRoom, Message
from app.schemas.all import ChatRoomCreate, MessageCreate

async def create_chat_room(chat_room: ChatRoomCreate, owner_id: str):
    db_chat_room = ChatRoom(**chat_room.dict(), member_ids=[owner_id])
    await database.chat_rooms.insert_one(db_chat_room.dict(by_alias=True))
    return db_chat_room

async def get_chat_room(room_id: str):
    return await database.chat_rooms.find_one({"_id": room_id})

async def create_message(message: MessageCreate, room_id: str, sender_id: str):
    db_message = Message(**message.dict(), room_id=room_id, sender_id=sender_id, timestamp=str(datetime.utcnow()))
    await database.messages.insert_one(db_message.dict(by_alias=True))
    return db_message

async def get_messages_by_room(room_id: str):
    return await database.messages.find({"room_id": room_id}).to_list(100)
