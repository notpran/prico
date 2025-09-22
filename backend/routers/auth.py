"""
Clerk webhook router for handling auth events
"""
from fastapi import APIRouter, Request, HTTPException, Depends, Header
from typing import Dict, Any, Optional
import json
import os
import hmac
import hashlib
from dotenv import load_dotenv

import database as db

# Load environment variables
load_dotenv()
CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")
CLERK_WEBHOOK_SECRET = os.getenv("CLERK_WEBHOOK_SECRET")

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
    responses={404: {"description": "Not found"}},
)


async def verify_clerk_webhook(
    request: Request,
    svix_id: Optional[str] = Header(None, alias="svix-id"),
    svix_timestamp: Optional[str] = Header(None, alias="svix-timestamp"),
    svix_signature: Optional[str] = Header(None, alias="svix-signature"),
) -> Dict[str, Any]:
    """
    Verify Clerk webhook signature
    """
    # Skip verification in development
    if os.getenv("NODE_ENV") == "development" and not CLERK_WEBHOOK_SECRET:
        body = await request.json()
        return body
    
    if not svix_id or not svix_timestamp or not svix_signature or not CLERK_WEBHOOK_SECRET:
        raise HTTPException(status_code=401, detail="Missing webhook verification headers")

    # Get the request body
    body = await request.body()
    
    # Create the message to sign
    message = f"{svix_id}.{svix_timestamp}.{body.decode('utf-8')}"
    
    # Create the signature
    h = hmac.new(
        key=CLERK_WEBHOOK_SECRET.encode('utf-8'),
        msg=message.encode('utf-8'),
        digestmod=hashlib.sha256
    )
    computed_signature = h.hexdigest()
    
    # Compare signatures
    if computed_signature != svix_signature:
        raise HTTPException(status_code=401, detail="Invalid webhook signature")
    
    # Parse and return the JSON body
    return json.loads(body)


@router.post("/webhook", status_code=200)
async def clerk_webhook(payload: Dict[str, Any] = Depends(verify_clerk_webhook)):
    """
    Handle Clerk webhooks for user management
    """
    try:
        event_type = payload.get("type")
        data = payload.get("data", {})
        
        if event_type == "user.created":
            # User was created in Clerk, create a corresponding user in our database
            user_data = {
                "email": data.get("email_addresses", [{}])[0].get("email_address"),
                "username": data.get("username") or f"user_{data.get('id')}",
                "display_name": data.get("first_name", "") + " " + data.get("last_name", ""),
                "age": 18,  # Default age, to be updated by user
                "clerk_id": data.get("id"),
                "avatar_url": data.get("image_url"),
            }
            
            # Check if user already exists
            existing_user = await db.get_user_by_clerk_id(data.get("id"))
            if existing_user:
                return {"message": "User already exists"}
            
            # Create the user
            user_id = await db.create_user(user_data)
            return {"message": "User created successfully", "user_id": user_id}
            
        elif event_type == "user.updated":
            # User was updated in Clerk, update our database
            clerk_id = data.get("id")
            user = await db.get_user_by_clerk_id(clerk_id)
            
            if not user:
                return {"message": "User not found"}
            
            # Update user data
            update_data = {
                "username": data.get("username") or user.get("username"),
                "display_name": (data.get("first_name", "") + " " + data.get("last_name", "")).strip() or user.get("display_name"),
                "avatar_url": data.get("image_url") or user.get("avatar_url"),
            }
            
            await db.update_user(user["_id"], update_data)
            return {"message": "User updated successfully"}
            
        elif event_type == "user.deleted":
            # User was deleted in Clerk, delete from our database
            clerk_id = data.get("id")
            user = await db.get_user_by_clerk_id(clerk_id)
            
            if not user:
                return {"message": "User not found"}
            
            await db.delete_user(user["_id"])
            return {"message": "User deleted successfully"}
            
        return {"message": f"Event {event_type} processed"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing webhook: {str(e)}")