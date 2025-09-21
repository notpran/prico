from datetime import datetime
from app.db.session import database
from typing import List

async def save_message(message_data: dict):
    message_data["timestamp"] = datetime.utcnow()
    result = await database.messages.insert_one(message_data)
    message_data["_id"] = result.inserted_id
    return message_data

async def get_chat_messages(room_id: str) -> List[dict]:
    cursor = database.messages.find({"room_id": room_id}).sort("timestamp", 1)
    messages = await cursor.to_list(length=100)
    return messages

async def create_chat_room(chat_room_data: dict, owner_id: str):
    chat_room_data["member_ids"] = [owner_id]
    chat_room_data["created_at"] = datetime.utcnow()
    result = await database.chat_rooms.insert_one(chat_room_data)
    chat_room_data["_id"] = result.inserted_id
    return chat_room_data

async def get_chat_room(room_id: str):
    return await database.chat_rooms.find_one({"_id": room_id})
