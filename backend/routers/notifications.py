"""
Notifications routes for Prico API
"""
from fastapi import APIRouter, HTTPException, Depends, Body, WebSocket, WebSocketDisconnect
from typing import List, Dict, Any, Optional
from datetime import datetime
from bson import ObjectId

from models import NotificationCreate, NotificationOut
import database as db

router = APIRouter(
    prefix="/notifications",
    tags=["notifications"],
    responses={404: {"description": "Not found"}},
)


class NotificationManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)

    def disconnect(self, websocket: WebSocket, user_id: str):
        if user_id in self.active_connections:
            self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

    async def send_notification(self, notification: Dict[str, Any], user_id: str):
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                await connection.send_json(notification)


notification_manager = NotificationManager()


@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await notification_manager.connect(websocket, user_id)
    try:
        while True:
            # Just keep the connection alive
            # Actual notifications will be sent via the notification_manager
            await websocket.receive_text()
    except WebSocketDisconnect:
        notification_manager.disconnect(websocket, user_id)
    except Exception as e:
        print(f"WebSocket error: {e}")
        notification_manager.disconnect(websocket, user_id)


@router.get("/user/{user_id}", response_model=List[NotificationOut])
async def get_user_notifications(user_id: str, unread_only: bool = False):
    """
    Get notifications for a user
    """
    # Check if user exists
    user = await db.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    read = None if not unread_only else False
    notifications = await db.get_notifications_by_user(user_id, read)
    
    return [NotificationOut(**notification, id=str(notification["_id"])) for notification in notifications]


@router.post("/mark-read/{notification_id}", status_code=200)
async def mark_notification_as_read(notification_id: str):
    """
    Mark notification as read
    """
    success = await db.mark_notification_as_read(notification_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    return {"message": "Notification marked as read"}


# Helper function to send real-time notifications
async def send_notification(notification_data: Dict[str, Any]):
    """
    Send a real-time notification
    """
    # Create notification in database
    notification_id = await db.create_notification(notification_data)
    
    # Send real-time notification
    user_id = str(notification_data["user_id"])
    await notification_manager.send_notification(
        {
            "type": "new_notification",
            "notification": {
                "id": notification_id,
                "type": notification_data["type"],
                "content": notification_data["content"],
                "read": False,
                "created_at": notification_data["created_at"].isoformat()
            }
        },
        user_id
    )
    
    return notification_id