import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all friends for a user
export const getFriends = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Get friendships where user is requester and status is accepted
    const sentFriendships = await ctx.db
      .query("friendships")
      .withIndex("by_requester", (q) => q.eq("requester", args.userId))
      .filter((q) => q.eq(q.field("status"), "accepted"))
      .collect();

    // Get friendships where user is addressee and status is accepted
    const receivedFriendships = await ctx.db
      .query("friendships")
      .withIndex("by_addressee", (q) => q.eq("addressee", args.userId))
      .filter((q) => q.eq(q.field("status"), "accepted"))
      .collect();

    const friendIds = [
      ...sentFriendships.map(f => f.addressee),
      ...receivedFriendships.map(f => f.requester)
    ];

    const friends = await Promise.all(
      friendIds.map(async (friendId) => {
        const friend = await ctx.db.get(friendId);
        return friend;
      })
    );

    return friends.filter(Boolean);
  },
});

// Get pending friend requests (received by user)
export const getPendingRequests = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const requests = await ctx.db
      .query("friendships")
      .withIndex("by_addressee", (q) => q.eq("addressee", args.userId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    const requestsWithUsers = await Promise.all(
      requests.map(async (request) => {
        const requester = await ctx.db.get(request.requester);
        return {
          ...request,
          requester,
        };
      })
    );

    return requestsWithUsers.filter((r) => r.requester);
  },
});

// Get sent friend requests
export const getSentRequests = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const requests = await ctx.db
      .query("friendships")
      .withIndex("by_requester", (q) => q.eq("requester", args.userId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    const requestsWithUsers = await Promise.all(
      requests.map(async (request) => {
        const addressee = await ctx.db.get(request.addressee);
        return {
          ...request,
          addressee,
        };
      })
    );

    return requestsWithUsers.filter((r) => r.addressee);
  },
});

// Send friend request
export const sendFriendRequest = mutation({
  args: { requesterId: v.id("users"), addresseeId: v.id("users") },
  handler: async (ctx, args) => {
    // Check if friendship already exists
    const existingFriendship = await ctx.db
      .query("friendships")
      .filter((q) =>
        q.or(
          q.and(q.eq(q.field("requester"), args.requesterId), q.eq(q.field("addressee"), args.addresseeId)),
          q.and(q.eq(q.field("requester"), args.addresseeId), q.eq(q.field("addressee"), args.requesterId))
        )
      )
      .first();

    if (existingFriendship) {
      throw new Error("Friendship already exists");
    }

    const now = Date.now();
    const friendshipId = await ctx.db.insert("friendships", {
      requester: args.requesterId,
      addressee: args.addresseeId,
      status: "pending",
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
      acceptedAt: Date.now(),
    });

    return args.friendshipId;
  },
});

// Decline friend request
export const declineFriendRequest = mutation({
  args: { friendshipId: v.id("friendships") },
  handler: async (ctx, args) => {
    const friendship = await ctx.db.get(args.friendshipId);
    if (!friendship) {
      throw new Error("Friendship not found");
    }

    if (friendship.status !== "pending") {
      throw new Error("Friend request is not pending");
    }

    await ctx.db.patch(args.friendshipId, {
      status: "declined",
    });

    return true;
  },
});

// Block user
export const blockUser = mutation({
  args: { requesterId: v.id("users"), addresseeId: v.id("users") },
  handler: async (ctx, args) => {
    // Check if friendship already exists
    const existingFriendship = await ctx.db
      .query("friendships")
      .filter((q) =>
        q.or(
          q.and(q.eq(q.field("requester"), args.requesterId), q.eq(q.field("addressee"), args.addresseeId)),
          q.and(q.eq(q.field("requester"), args.addresseeId), q.eq(q.field("addressee"), args.requesterId))
        )
      )
      .first();

    if (existingFriendship) {
      // Update existing friendship to blocked
      await ctx.db.patch(existingFriendship._id, {
        status: "blocked"
      });
    } else {
      // Create new blocked friendship
      await ctx.db.insert("friendships", {
        requester: args.requesterId,
        addressee: args.addresseeId,
        status: "blocked",
        createdAt: Date.now()
      });
    }

    return true;
  },
});

// Remove friend
export const removeFriend = mutation({
  args: { userId: v.id("users"), friendId: v.id("users") },
  handler: async (ctx, args) => {
    // Find friendship records between these users
    const friendships = await ctx.db
      .query("friendships")
      .filter((q) =>
        q.or(
          q.and(q.eq(q.field("requester"), args.userId), q.eq(q.field("addressee"), args.friendId)),
          q.and(q.eq(q.field("requester"), args.friendId), q.eq(q.field("addressee"), args.userId))
        )
      )
      .collect();

    // Delete all friendship records
    await Promise.all(friendships.map(f => ctx.db.delete(f._id)));

    return true;
  },
});

// Search users by username (excluding current user and existing friends)
export const searchUsers = query({
  args: { query: v.string(), currentUserId: v.id("users") },
  handler: async (ctx, args) => {
    const users = await ctx.db
      .query("users")
      .withIndex("by_username")
      .collect();

    // Get existing friendships
    const friendships = await ctx.db
      .query("friendships")
      .filter((q) =>
        q.or(
          q.eq(q.field("requester"), args.currentUserId),
          q.eq(q.field("addressee"), args.currentUserId)
        )
      )
      .collect();

    const friendIds = new Set([
      ...friendships.map(f => f.requester),
      ...friendships.map(f => f.addressee)
    ]);

    return users.filter(user =>
      user._id !== args.currentUserId &&
      !friendIds.has(user._id) &&
      (user.username.toLowerCase().includes(args.query.toLowerCase()) ||
       user.displayName.toLowerCase().includes(args.query.toLowerCase()))
    ).slice(0, 20);
  },
});