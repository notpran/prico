import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create or update user from Clerk
export const createUser = mutation({
  args: {
    externalId: v.string(),
    email: v.string(),
    username: v.string(),
    displayName: v.string(),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_external_id", (q) => q.eq("externalId", args.externalId))
      .first();

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        username: args.username,
        displayName: args.displayName,
        avatarUrl: args.avatarUrl,
        lastSeen: Date.now(),
      });
      return existingUser._id;
    } else {
      // Create new user
      const userId = await ctx.db.insert("users", {
        externalId: args.externalId,
        email: args.email,
        username: args.username,
        displayName: args.displayName,
        avatarUrl: args.avatarUrl,
        status: "online",
        lastSeen: Date.now(),
        skills: [],
        preferences: {
          theme: "system",
          notifications: {
            directMessages: true,
            friendRequests: true,
            mentions: true,
            communities: true,
            projects: true
          },
          privacy: {
            showOnlineStatus: true,
            allowDirectMessages: "everyone",
            showProfile: "public"
          }
        }
      });
      return userId;
    }
  },
});

// Get user by external ID (Clerk ID)
export const getUserByExternalId = query({
  args: { externalId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_external_id", (q) => q.eq("externalId", args.externalId))
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
    status: v.union(v.literal("online"), v.literal("away"), v.literal("busy"), v.literal("offline")),
    customStatus: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      status: args.status,
      customStatus: args.customStatus,
      lastSeen: Date.now(),
    });
  },
});

// Update user profile
export const updateUserProfile = mutation({
  args: {
    userId: v.id("users"),
    bio: v.optional(v.string()),
    location: v.optional(v.string()),
    website: v.optional(v.string()),
    github: v.optional(v.string()),
    twitter: v.optional(v.string()),
    linkedin: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const updateData: any = { lastSeen: Date.now() };
    if (args.bio !== undefined) updateData.bio = args.bio;
    if (args.location !== undefined) updateData.location = args.location;
    if (args.website !== undefined) updateData.website = args.website;
    if (args.github !== undefined) updateData.github = args.github;
    if (args.twitter !== undefined) updateData.twitter = args.twitter;
    if (args.linkedin !== undefined) updateData.linkedin = args.linkedin;
    if (args.skills !== undefined) updateData.skills = args.skills;

    await ctx.db.patch(args.userId, updateData);
  },
});

// Update user preferences
export const updateUserPreferences = mutation({
  args: {
    userId: v.id("users"),
    preferences: v.object({
      theme: v.union(v.literal('light'), v.literal('dark'), v.literal('system')),
      notifications: v.object({
        directMessages: v.boolean(),
        friendRequests: v.boolean(),
        mentions: v.boolean(),
        communities: v.boolean(),
        projects: v.boolean()
      }),
      privacy: v.object({
        showOnlineStatus: v.boolean(),
        allowDirectMessages: v.union(v.literal('everyone'), v.literal('friends'), v.literal('none')),
        showProfile: v.union(v.literal('public'), v.literal('friends'), v.literal('private'))
      })
    })
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      preferences: args.preferences,
      lastSeen: Date.now(),
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

// Get online users
export const getOnlineUsers = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("users")
      .filter((q) => q.neq(q.field("status"), "offline"))
      .collect();
  },
});