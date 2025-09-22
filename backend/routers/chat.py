"""
Chat routes and WebSocket for Prico API
"""
from fastapi import APIRouter, HTTPException, Depends, Body, WebSocket, WebSocketDisconnect
from typing import List, Dict, Any, Optional
from datetime import datetime
from bson import ObjectId
import json

from models import MessageCreate, MessageOut, MessageInDB
import database as db

router = APIRouter(
    prefix="/chat",
    tags=["chat"],
    responses={404: {"description": "Not found"}},
)


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        if client_id not in self.active_connections:
            self.active_connections[client_id] = []
        self.active_connections[client_id].append(websocket)

    def disconnect(self, websocket: WebSocket, client_id: str):
        if client_id in self.active_connections:
            self.active_connections[client_id].remove(websocket)
            if not self.active_connections[client_id]:
                del self.active_connections[client_id]

    async def send_personal_message(self, message: Dict[str, Any], websocket: WebSocket):
        await websocket.send_json(message)

    async def broadcast(self, message: Dict[str, Any], client_id: str):
        if client_id in self.active_connections:
            for connection in self.active_connections[client_id]:
                await connection.send_json(message)


manager = ConnectionManager()


@router.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket, client_id)
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            event_type = message_data.get("type")
            
            if event_type == "new_message":
                # Create a new message
                sender_id = message_data.get("sender_id")
                channel_id = message_data.get("channel_id")
                dm_id = message_data.get("dm_id")
                content = message_data.get("content")
                attachments = message_data.get("attachments", [])
                
                # Validate required fields
                if not sender_id:
                    await manager.send_personal_message(
                        {"error": "sender_id is required"}, websocket
                    )
                    continue
                
                if not (channel_id or dm_id):
                    await manager.send_personal_message(
                        {"error": "Either channel_id or dm_id is required"}, websocket
                    )
                    continue
                
                if not content:
                    await manager.send_personal_message(
                        {"error": "content is required"}, websocket
                    )
                    continue
                
                # Create message object
                message_obj = {
                    "sender_id": ObjectId(sender_id),
                    "content": content,
                    "attachments": attachments,
                    "reactions": [],
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
                
                if channel_id:
                    message_obj["channel_id"] = ObjectId(channel_id)
                    target_id = channel_id
                else:
                    message_obj["dm_id"] = ObjectId(dm_id)
                    target_id = dm_id
                
                # Save message to database
                message_id = await db.create_message(message_obj)
                
                # Broadcast to channel or DM
                await manager.broadcast(
                    {
                        "type": "new_message",
                        "message": {
                            "id": message_id,
                            "sender_id": sender_id,
                            "channel_id": channel_id,
                            "dm_id": dm_id,
                            "content": content,
                            "attachments": attachments,
                            "reactions": [],
                            "created_at": datetime.utcnow().isoformat(),
                            "updated_at": datetime.utcnow().isoformat()
                        }
                    },
                    target_id
                )
            
            elif event_type == "edit_message":
                # Edit an existing message
                message_id = message_data.get("message_id")
                content = message_data.get("content")
                
                # Validate required fields
                if not message_id:
                    await manager.send_personal_message(
                        {"error": "message_id is required"}, websocket
                    )
                    continue
                
                if not content:
                    await manager.send_personal_message(
                        {"error": "content is required"}, websocket
                    )
                    continue
                
                # Update message in database
                # This is a simplified version - in production you would need to check permissions
                messages_collection = await db.get_collection("messages")
                result = await messages_collection.update_one(
                    {"_id": ObjectId(message_id)},
                    {"$set": {"content": content, "updated_at": datetime.utcnow()}}
                )
                
                if result.modified_count == 0:
                    await manager.send_personal_message(
                        {"error": "Message not found or could not be updated"}, websocket
                    )
                    continue
                
                # Get the updated message
                message = await messages_collection.find_one({"_id": ObjectId(message_id)})
                
                # Determine target ID (channel or DM)
                target_id = str(message.get("channel_id", "")) or str(message.get("dm_id", ""))
                
                # Broadcast update
                await manager.broadcast(
                    {
                        "type": "edit_message",
                        "message": {
                            "id": message_id,
                            "content": content,
                            "updated_at": datetime.utcnow().isoformat()
                        }
                    },
                    target_id
                )
            
            elif event_type == "delete_message":
                # Delete a message
                message_id = message_data.get("message_id")
                
                # Validate required fields
                if not message_id:
                    await manager.send_personal_message(
                        {"error": "message_id is required"}, websocket
                    )
                    continue
                
                # Get message to know which channel/DM it belongs to
                messages_collection = await db.get_collection("messages")
                message = await messages_collection.find_one({"_id": ObjectId(message_id)})
                
                if not message:
                    await manager.send_personal_message(
                        {"error": "Message not found"}, websocket
                    )
                    continue
                
                # Delete message from database
                result = await messages_collection.delete_one({"_id": ObjectId(message_id)})
                
                if result.deleted_count == 0:
                    await manager.send_personal_message(
                        {"error": "Failed to delete message"}, websocket
                    )
                    continue
                
                # Determine target ID (channel or DM)
                target_id = str(message.get("channel_id", "")) or str(message.get("dm_id", ""))
                
                # Broadcast deletion
                await manager.broadcast(
                    {
                        "type": "delete_message",
                        "message_id": message_id
                    },
                    target_id
                )
            
            elif event_type == "typing":
                # User is typing
                user_id = message_data.get("user_id")
                channel_id = message_data.get("channel_id")
                dm_id = message_data.get("dm_id")
                
                # Validate required fields
                if not user_id:
                    await manager.send_personal_message(
                        {"error": "user_id is required"}, websocket
                    )
                    continue
                
                if not (channel_id or dm_id):
                    await manager.send_personal_message(
                        {"error": "Either channel_id or dm_id is required"}, websocket
                    )
                    continue
                
                # Determine target ID (channel or DM)
                target_id = channel_id or dm_id
                
                # Broadcast typing indicator
                await manager.broadcast(
                    {
                        "type": "typing",
                        "user_id": user_id
                    },
                    target_id
                )
            
            elif event_type == "reaction":
                # Add/remove reaction to a message
                message_id = message_data.get("message_id")
                user_id = message_data.get("user_id")
                emoji = message_data.get("emoji")
                action = message_data.get("action", "add")  # add or remove
                
                # Validate required fields
                if not message_id or not user_id or not emoji:
                    await manager.send_personal_message(
                        {"error": "message_id, user_id, and emoji are required"}, websocket
                    )
                    continue
                
                # Get message
                messages_collection = await db.get_collection("messages")
                message = await messages_collection.find_one({"_id": ObjectId(message_id)})
                
                if not message:
                    await manager.send_personal_message(
                        {"error": "Message not found"}, websocket
                    )
                    continue
                
                # Update reactions
                reactions = message.get("reactions", [])
                
                if action == "add":
                    # Check if reaction already exists
                    exists = False
                    for reaction in reactions:
                        if reaction["emoji"] == emoji and str(reaction["user_id"]) == user_id:
                            exists = True
                            break
                    
                    if not exists:
                        reactions.append({
                            "emoji": emoji,
                            "user_id": ObjectId(user_id)
                        })
                else:  # remove
                    reactions = [r for r in reactions if not (r["emoji"] == emoji and str(r["user_id"]) == user_id)]
                
                # Update message in database
                await messages_collection.update_one(
                    {"_id": ObjectId(message_id)},
                    {"$set": {"reactions": reactions, "updated_at": datetime.utcnow()}}
                )
                
                # Determine target ID (channel or DM)
                target_id = str(message.get("channel_id", "")) or str(message.get("dm_id", ""))
                
                # Broadcast reaction update
                await manager.broadcast(
                    {
                        "type": "reaction",
                        "message_id": message_id,
                        "reactions": [
                            {"emoji": r["emoji"], "user_id": str(r["user_id"])}
                            for r in reactions
                        ]
                    },
                    target_id
                )
            
            else:
                await manager.send_personal_message(
                    {"error": f"Unknown event type: {event_type}"}, websocket
                )
    
    except WebSocketDisconnect:
        manager.disconnect(websocket, client_id)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket, client_id)


@router.get("/channel/{channel_id}", response_model=List[MessageOut])
async def get_channel_messages(channel_id: str, limit: int = 50, skip: int = 0):
    """
    Get messages for a channel
    """
    messages = await db.get_channel_messages(channel_id, limit, skip)
    return [MessageOut(**msg, id=str(msg["_id"])) for msg in messages]


@router.get("/dm/{dm_id}", response_model=List[MessageOut])
async def get_dm_messages(dm_id: str, limit: int = 50, skip: int = 0):
    """
    Get messages for a DM
    """
    messages = await db.get_dm_messages(dm_id, limit, skip)
    return [MessageOut(**msg, id=str(msg["_id"])) for msg in messages]