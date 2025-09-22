"""
WebRTC signaling for voice and video chat in Prico
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, List, Any
import json

router = APIRouter(
    prefix="/rtc",
    tags=["rtc"],
    responses={404: {"description": "Not found"}},
)


class RTCConnectionManager:
    def __init__(self):
        # Structure: {"room_id": {"user_id": websocket}}
        self.active_connections: Dict[str, Dict[str, WebSocket]] = {}
        # Structure: {"room_id": [{"id": "user_id", "name": "username"}]}
        self.room_participants: Dict[str, List[Dict[str, str]]] = {}

    async def connect(self, websocket: WebSocket, room_id: str, user_id: str, username: str):
        await websocket.accept()
        
        if room_id not in self.active_connections:
            self.active_connections[room_id] = {}
            self.room_participants[room_id] = []
        
        self.active_connections[room_id][user_id] = websocket
        self.room_participants[room_id].append({"id": user_id, "name": username})
        
        # Notify others in the room about the new participant
        await self.broadcast_to_room(room_id, {
            "type": "user-joined",
            "userId": user_id,
            "username": username,
            "participants": self.room_participants[room_id]
        }, exclude_user=None)  # Send to everyone including the new user

    def disconnect(self, room_id: str, user_id: str):
        if room_id in self.active_connections and user_id in self.active_connections[room_id]:
            del self.active_connections[room_id][user_id]
            
            # Remove user from participants list
            if room_id in self.room_participants:
                self.room_participants[room_id] = [
                    p for p in self.room_participants[room_id] if p["id"] != user_id
                ]
            
            # Clean up empty rooms
            if not self.active_connections[room_id]:
                del self.active_connections[room_id]
                if room_id in self.room_participants:
                    del self.room_participants[room_id]

    async def send_personal_message(self, message: Dict[str, Any], websocket: WebSocket):
        await websocket.send_json(message)

    async def send_direct_message(self, message: Dict[str, Any], room_id: str, user_id: str):
        if (room_id in self.active_connections and 
            user_id in self.active_connections[room_id]):
            await self.active_connections[room_id][user_id].send_json(message)

    async def broadcast_to_room(self, room_id: str, message: Dict[str, Any], exclude_user: str = None):
        if room_id in self.active_connections:
            for user_id, connection in self.active_connections[room_id].items():
                if exclude_user is None or user_id != exclude_user:
                    await connection.send_json(message)


rtc_manager = RTCConnectionManager()


@router.websocket("/ws/{room_id}/{user_id}/{username}")
async def websocket_rtc_endpoint(websocket: WebSocket, room_id: str, user_id: str, username: str):
    await rtc_manager.connect(websocket, room_id, user_id, username)
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            event_type = message_data.get("type")
            
            if event_type == "offer":
                # Send offer to specific user
                target_id = message_data.get("target")
                if not target_id:
                    await rtc_manager.send_personal_message(
                        {"error": "Target user ID is required for offers"}, websocket
                    )
                    continue
                
                # Forward the offer to the target user
                await rtc_manager.send_direct_message(
                    {
                        "type": "offer",
                        "offer": message_data.get("offer"),
                        "from": user_id,
                        "fromName": username
                    },
                    room_id,
                    target_id
                )
            
            elif event_type == "answer":
                # Send answer to specific user
                target_id = message_data.get("target")
                if not target_id:
                    await rtc_manager.send_personal_message(
                        {"error": "Target user ID is required for answers"}, websocket
                    )
                    continue
                
                # Forward the answer to the target user
                await rtc_manager.send_direct_message(
                    {
                        "type": "answer",
                        "answer": message_data.get("answer"),
                        "from": user_id
                    },
                    room_id,
                    target_id
                )
            
            elif event_type == "ice-candidate":
                # Send ICE candidate to specific user
                target_id = message_data.get("target")
                if not target_id:
                    await rtc_manager.send_personal_message(
                        {"error": "Target user ID is required for ICE candidates"}, websocket
                    )
                    continue
                
                # Forward the ICE candidate to the target user
                await rtc_manager.send_direct_message(
                    {
                        "type": "ice-candidate",
                        "candidate": message_data.get("candidate"),
                        "from": user_id
                    },
                    room_id,
                    target_id
                )
            
            elif event_type == "mute":
                # Broadcast mute status to all users in the room
                await rtc_manager.broadcast_to_room(
                    room_id,
                    {
                        "type": "mute",
                        "userId": user_id,
                        "muted": message_data.get("muted", True)
                    }
                )
            
            elif event_type == "video":
                # Broadcast video status to all users in the room
                await rtc_manager.broadcast_to_room(
                    room_id,
                    {
                        "type": "video",
                        "userId": user_id,
                        "enabled": message_data.get("enabled", False)
                    }
                )
            
            elif event_type == "get-participants":
                # Send current participants to the user
                await rtc_manager.send_personal_message(
                    {
                        "type": "participants",
                        "participants": rtc_manager.room_participants.get(room_id, [])
                    },
                    websocket
                )
            
            else:
                await rtc_manager.send_personal_message(
                    {"error": f"Unknown event type: {event_type}"}, websocket
                )
    
    except WebSocketDisconnect:
        rtc_manager.disconnect(room_id, user_id)
        # Notify others that user has left
        await rtc_manager.broadcast_to_room(
            room_id,
            {
                "type": "user-left",
                "userId": user_id,
                "participants": rtc_manager.room_participants.get(room_id, [])
            }
        )
    except Exception as e:
        print(f"WebSocket RTC error: {e}")
        rtc_manager.disconnect(room_id, user_id)
        # Notify others that user has left
        await rtc_manager.broadcast_to_room(
            room_id,
            {
                "type": "user-left",
                "userId": user_id,
                "participants": rtc_manager.room_participants.get(room_id, [])
            }
        )