
from fastapi import APIRouter, HTTPException, Request
import os
import httpx
import database as db


router = APIRouter(prefix="/sync", tags=["sync"])

@router.post("/clerk")
async def sync_clerk_users(request: Request):
    """
    Sync all Clerk users to MongoDB (admin/dev only)
    """
    clerk_secret = os.getenv("CLERK_SECRET_KEY")
    if not clerk_secret:
        raise HTTPException(status_code=500, detail="CLERK_SECRET_KEY not set")

    # Fetch all users from Clerk
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            "https://api.clerk.dev/v1/users",
            headers={"Authorization": f"Bearer {clerk_secret}"}
        )
        if resp.status_code != 200:
            raise HTTPException(status_code=500, detail=f"Clerk API error: {resp.text}")
        clerk_users = resp.json()

    synced = 0
    for cu in clerk_users:
        clerk_id = cu.get("id")
        first_name = cu.get("first_name") or ""
        last_name = cu.get("last_name") or ""
        username = cu.get("username") or (first_name + last_name)
        email = cu.get("email_addresses", [{}])[0].get("email_address")
        full_name = f"{first_name} {last_name}".strip() or username
        avatar_url = cu.get("image_url")

        # Upsert user in MongoDB
        user_data = {
            "clerk_id": clerk_id,
            "username": username,
            "email": email,
            "full_name": full_name,
            "bio": None,
            "avatar_url": avatar_url,
            "communities": [],
            "friends": [],
            "friend_requests_sent": [],
            "friend_requests_received": [],
            "created_at": cu.get("created_at"),
            "updated_at": cu.get("updated_at"),
        }
        await db.upsert_user_by_clerk_id(clerk_id, user_data)
        synced += 1

    return {"synced": synced}
