import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create or update user from Clerk
export const createUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    username: v.string(),
    displayName: v.string(),
    avatarUrl: v.optional(v.string()),
    age: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        username: args.username,
        displayName: args.displayName,
        avatarUrl: args.avatarUrl,
        age: args.age,
        lastActiveAt: Date.now(),
      });
      return existingUser._id;
    } else {
      // Create new user
      const userId = await ctx.db.insert("users", {
        clerkId: args.clerkId,
        email: args.email,
        username: args.username,
        displayName: args.displayName,
        avatarUrl: args.avatarUrl,
        age: args.age,
        bio: "",
        emailVerified: true,
        createdAt: Date.now(),
        lastActiveAt: Date.now(),
        status: "online",
      });
      return userId;
    }
  },
});

// Get user by Clerk ID
export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});

// Get user by ID
export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

// Update user status
export const updateUserStatus = mutation({
  args: {
    userId: v.id("users"),
    status: v.union(v.literal("online"), v.literal("offline"), v.literal("away")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      status: args.status,
      lastActiveAt: Date.now(),
    });
  },
});

// Search users by username
export const searchUsers = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const users = await ctx.db
      .query("users")
      .withIndex("by_username")
      .collect();
    
    return users.filter(user => 
      user.username.toLowerCase().includes(args.query.toLowerCase()) ||
      user.displayName.toLowerCase().includes(args.query.toLowerCase())
    ).slice(0, 20); // Limit to 20 results
  },
});