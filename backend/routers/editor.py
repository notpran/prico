"""
Collaborative editor routes and WebSocket for Prico API
"""
from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from typing import Dict, List, Any, Set
import json
from datetime import datetime

import database as db

router = APIRouter(
    prefix="/editor",
    tags=["editor"],
    responses={404: {"description": "Not found"}},
)


class EditorConnectionManager:
    def __init__(self):
        # Structure: {"file_id": {"user_id": {"websocket": websocket, "cursor": position}}}
        self.active_connections: Dict[str, Dict[str, Dict[str, Any]]] = {}
        # For tracking auto-save timers
        self.last_save: Dict[str, datetime] = {}

    async def connect(self, websocket: WebSocket, file_id: str, user_id: str, username: str):
        await websocket.accept()
        
        if file_id not in self.active_connections:
            self.active_connections[file_id] = {}
        
        self.active_connections[file_id][user_id] = {
            "websocket": websocket,
            "cursor": None,
            "username": username
        }
        
        # Send current users to the new user
        current_users = [
            {
                "id": uid, 
                "username": data["username"],
                "cursor": data["cursor"]
            }
            for uid, data in self.active_connections[file_id].items()
            if uid != user_id
        ]
        
        await websocket.send_json({
            "type": "current-users",
            "users": current_users
        })
        
        # Notify other users about the new user
        await self.broadcast_to_file(
            file_id,
            {
                "type": "user-joined",
                "userId": user_id,
                "username": username
            },
            exclude_user=user_id
        )

    def disconnect(self, file_id: str, user_id: str):
        if file_id in self.active_connections and user_id in self.active_connections[file_id]:
            del self.active_connections[file_id][user_id]
            
            # Clean up empty files
            if not self.active_connections[file_id]:
                del self.active_connections[file_id]

    async def send_personal_message(self, message: Dict[str, Any], websocket: WebSocket):
        await websocket.send_json(message)

    async def broadcast_to_file(self, file_id: str, message: Dict[str, Any], exclude_user: str = None):
        if file_id in self.active_connections:
            for user_id, data in self.active_connections[file_id].items():
                if exclude_user is None or user_id != exclude_user:
                    await data["websocket"].send_json(message)

    def update_cursor(self, file_id: str, user_id: str, cursor_position: Any):
        if file_id in self.active_connections and user_id in self.active_connections[file_id]:
            self.active_connections[file_id][user_id]["cursor"] = cursor_position


editor_manager = EditorConnectionManager()


@router.websocket("/ws/{file_id}/{user_id}/{username}")
async def websocket_editor_endpoint(websocket: WebSocket, file_id: str, user_id: str, username: str):
    await editor_manager.connect(websocket, file_id, user_id, username)
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            event_type = message_data.get("type")
            
            if event_type == "change":
                # Broadcast changes to all users in the file
                changes = message_data.get("changes")
                
                if not changes:
                    await editor_manager.send_personal_message(
                        {"error": "Changes are required"}, websocket
                    )
                    continue
                
                # Broadcast changes to other users
                await editor_manager.broadcast_to_file(
                    file_id,
                    {
                        "type": "change",
                        "changes": changes,
                        "origin": message_data.get("origin"),
                        "from": user_id
                    },
                    exclude_user=user_id
                )
                
                # Auto-save to database after receiving changes
                # In a real system, you'd want to throttle this to avoid too frequent saves
                now = datetime.utcnow()
                last_save = editor_manager.last_save.get(file_id)
                
                # Save at most once every 5 seconds
                if not last_save or (now - last_save).total_seconds() > 5:
                    editor_manager.last_save[file_id] = now
                    
                    # Parse file_id to get project_id and file_path
                    try:
                        project_id, file_path = file_id.split(":", 1)
                        
                        # Get current project
                        project = await db.get_project_by_id(project_id)
                        if project:
                            # Get current content
                            current_content = None
                            for file in project.get("files", []):
                                if file["path"] == file_path:
                                    current_content = file["content"]
                                    break
                            
                            # Apply changes to content - simplified implementation
                            # In a real system, this would use operational transforms or CRDT
                            # Here we just replace the whole content
                            if "content" in message_data:
                                new_content = message_data["content"]
                                
                                # Update file in project
                                files = project.get("files", [])
                                file_exists = False
                                
                                for i, file in enumerate(files):
                                    if file["path"] == file_path:
                                        file_exists = True
                                        files[i]["content"] = new_content
                                        break
                                
                                if not file_exists:
                                    files.append({
                                        "path": file_path,
                                        "content": new_content
                                    })
                                
                                # Save to database
                                await db.update_project(project_id, {
                                    "files": files,
                                    "updated_at": datetime.utcnow()
                                })
                    except Exception as e:
                        print(f"Error auto-saving: {e}")
            
            elif event_type == "cursor":
                # Update cursor position
                cursor = message_data.get("cursor")
                
                if cursor is None:
                    await editor_manager.send_personal_message(
                        {"error": "Cursor position is required"}, websocket
                    )
                    continue
                
                # Update cursor in the manager
                editor_manager.update_cursor(file_id, user_id, cursor)
                
                # Broadcast cursor position to other users
                await editor_manager.broadcast_to_file(
                    file_id,
                    {
                        "type": "cursor",
                        "userId": user_id,
                        "username": username,
                        "cursor": cursor
                    },
                    exclude_user=user_id
                )
            
            elif event_type == "undo" or event_type == "redo":
                # Broadcast undo/redo to all users in the file
                await editor_manager.broadcast_to_file(
                    file_id,
                    {
                        "type": event_type,
                        "from": user_id
                    },
                    exclude_user=user_id
                )
            
            else:
                await editor_manager.send_personal_message(
                    {"error": f"Unknown event type: {event_type}"}, websocket
                )
    
    except WebSocketDisconnect:
        editor_manager.disconnect(file_id, user_id)
        # Notify others that user has left
        await editor_manager.broadcast_to_file(
            file_id,
            {
                "type": "user-left",
                "userId": user_id
            }
        )
    except Exception as e:
        print(f"WebSocket editor error: {e}")
        editor_manager.disconnect(file_id, user_id)
        # Notify others that user has left
        await editor_manager.broadcast_to_file(
            file_id,
            {
                "type": "user-left",
                "userId": user_id
            }
        )