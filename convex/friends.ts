import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all friends for a user
export const getFriends = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const friendships = await ctx.db
      .query("friendships")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("status"), "accepted"))
      .collect();

    const friends = await Promise.all(
      friendships.map(async (friendship) => {
        const friend = await ctx.db.get(friendship.friendId);
        return {
          ...friend,
          friendshipId: friendship._id,
          friendsSince: friendship.createdAt,
        };
      })
    );

    return friends.filter(Boolean);
  },
});

// Get pending friend requests
export const getPendingRequests = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const requests = await ctx.db
      .query("friendships")
      .withIndex("by_friend", (q) => q.eq("friendId", args.userId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    const requestsWithUsers = await Promise.all(
      requests.map(async (request) => {
        const requester = await ctx.db.get(request.userId);
        return {
          ...request,
          requester,
        };
      })
    );

    return requestsWithUsers.filter((r) => r.requester);
  },
});

// Send friend request
export const sendFriendRequest = mutation({
  args: { userId: v.id("users"), friendId: v.id("users") },
  handler: async (ctx, args) => {
    // Check if friendship already exists
    const existingFriendship = await ctx.db
      .query("friendships")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("friendId"), args.friendId))
      .first();

    if (existingFriendship) {
      throw new Error("Friendship already exists");
    }

    // Check reverse friendship
    const reverseFriendship = await ctx.db
      .query("friendships")
      .withIndex("by_user", (q) => q.eq("userId", args.friendId))
      .filter((q) => q.eq(q.field("friendId"), args.userId))
      .first();

    if (reverseFriendship) {
      throw new Error("Friend request already received");
    }

    const now = Date.now();
    const friendshipId = await ctx.db.insert("friendships", {
      userId: args.userId,
      friendId: args.friendId,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });

    // Create notification
    await ctx.db.insert("notifications", {
      userId: args.friendId,
      type: "friend_request",
      title: "New friend request",
      content: "You have a new friend request",
      data: { senderId: args.userId },
      read: false,
      createdAt: now,
    });

    return friendshipId;
  },
});

// Accept friend request
export const acceptFriendRequest = mutation({
  args: { friendshipId: v.id("friendships") },
  handler: async (ctx, args) => {
    const friendship = await ctx.db.get(args.friendshipId);
    if (!friendship) {
      throw new Error("Friendship not found");
    }

    if (friendship.status !== "pending") {
      throw new Error("Friend request is not pending");
    }

    // Update the friendship status
    await ctx.db.patch(args.friendshipId, {
      status: "accepted",
      updatedAt: Date.now(),
    });

    // Create reverse friendship
    await ctx.db.insert("friendships", {
      userId: friendship.friendId,
      friendId: friendship.userId,
      status: "accepted",
      createdAt: friendship.createdAt,
      updatedAt: Date.now(),
    });

    return args.friendshipId;
  },
});

// Decline friend request
export const declineFriendRequest = mutation({
  args: { friendshipId: v.id("friendships") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.friendshipId);
    return true;
  },
});

// Remove friend
export const removeFriend = mutation({
  args: { userId: v.id("users"), friendId: v.id("users") },
  handler: async (ctx, args) => {
    // Find both friendship records
    const friendship1 = await ctx.db
      .query("friendships")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("friendId"), args.friendId))
      .first();

    const friendship2 = await ctx.db
      .query("friendships")
      .withIndex("by_user", (q) => q.eq("userId", args.friendId))
      .filter((q) => q.eq(q.field("friendId"), args.userId))
      .first();

    if (friendship1) await ctx.db.delete(friendship1._id);
    if (friendship2) await ctx.db.delete(friendship2._id);

    return true;
  },
});

// Search users by username
export const searchUsers = query({
  args: { query: v.string(), currentUserId: v.id("users") },
  handler: async (ctx, args) => {
    const users = await ctx.db
      .query("users")
      .withIndex("by_username")
      .filter((q) => 
        q.and(
          q.neq(q.field("_id"), args.currentUserId),
          q.or(
            q.eq(q.field("username"), args.query),
            q.eq(q.field("displayName"), args.query)
          )
        )
      )
      .take(10);

    return users;
  },
});