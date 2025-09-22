async def get_user_by_clerk_id(clerk_id: str) -> Optional[Dict[str, Any]]:
    """
    Get user by Clerk ID
    """
    users_collection = await get_collection("users")
    user = await users_collection.find_one({"clerk_id": clerk_id})
    return user


async def get_users(skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
    """
    Get all users with pagination
    """
    users_collection = await get_collection("users")
    users = await users_collection.find().skip(skip).limit(limit).to_list(length=limit)
    return users


async def delete_user(user_id: str) -> bool:
    """
    Delete a user
    """
    users_collection = await get_collection("users")
    result = await users_collection.delete_one({"_id": ObjectId(user_id)})
    return result.deleted_count > 0


async def send_friend_request(user_id: str, friend_id: str) -> bool:
    """
    Send a friend request
    """
    users_collection = await get_collection("users")
    
    # Add to user's sent requests
    user_result = await users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$addToSet": {"friend_requests_sent": friend_id}}
    )
    
    # Add to friend's received requests
    friend_result = await users_collection.update_one(
        {"_id": ObjectId(friend_id)},
        {"$addToSet": {"friend_requests_received": user_id}}
    )
    
    return user_result.modified_count > 0 and friend_result.modified_count > 0


async def accept_friend_request(user_id: str, friend_id: str) -> bool:
    """
    Accept a friend request
    """
    users_collection = await get_collection("users")
    
    # Add to user's friends
    user_result = await users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {
            "$addToSet": {"friends": friend_id},
            "$pull": {"friend_requests_received": friend_id}
        }
    )
    
    # Add to friend's friends and remove from sent requests
    friend_result = await users_collection.update_one(
        {"_id": ObjectId(friend_id)},
        {
            "$addToSet": {"friends": user_id},
            "$pull": {"friend_requests_sent": user_id}
        }
    )
    
    return user_result.modified_count > 0 and friend_result.modified_count > 0


async def remove_friend(user_id: str, friend_id: str) -> bool:
    """
    Remove a friend
    """
    users_collection = await get_collection("users")
    
    # Remove from user's friends
    user_result = await users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$pull": {"friends": friend_id}}
    )
    
    # Remove from friend's friends
    friend_result = await users_collection.update_one(
        {"_id": ObjectId(friend_id)},
        {"$pull": {"friends": user_id}}
    )
    
    return user_result.modified_count > 0 and friend_result.modified_count > 0