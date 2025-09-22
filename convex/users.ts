import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Helper function to verify user ownership
async function verifyUserOwnership(ctx: any, clerkId: string, targetUserId?: string) {
  const currentUser = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", clerkId))
    .first();

  if (!currentUser) {
    throw new Error("User not authenticated");
  }

  // If targetUserId is provided, ensure user can only access their own data or is admin
  if (targetUserId && currentUser._id !== targetUserId && currentUser.role !== 'admin') {
    throw new Error("Access denied: insufficient permissions");
  }

  return currentUser;
}

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
<<<<<<< HEAD
      .withIndex("by_external_id", (q) => q.eq("externalId", args.externalId))
=======
      .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", args.clerkId))
>>>>>>> 745733d (feat: Implement user and community management with ownership validation and enhanced API functions)
      .first();

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        username: args.username,
        displayName: args.displayName,
        avatarUrl: args.avatarUrl,
<<<<<<< HEAD
        lastSeen: Date.now(),
=======
        age: args.age,
        lastActiveAt: Date.now(),
        updatedAt: Date.now(),
>>>>>>> 745733d (feat: Implement user and community management with ownership validation and enhanced API functions)
      });
      return existingUser._id;
    } else {
      // Create new user with default settings
      const userId = await ctx.db.insert("users", {
        externalId: args.externalId,
        email: args.email,
        username: args.username,
        displayName: args.displayName,
        avatarUrl: args.avatarUrl,
<<<<<<< HEAD
        status: "online",
        lastSeen: Date.now(),
        skills: [],
        preferences: {
          theme: "system",
=======
        age: args.age,
        bio: "",
        emailVerified: true,
        createdAt: Date.now(),
        lastActiveAt: Date.now(),
        updatedAt: Date.now(),
        status: "online",
        isActive: true,
        role: "user",
        skills: [],
        preferences: {
          theme: "dark",
>>>>>>> 745733d (feat: Implement user and community management with ownership validation and enhanced API functions)
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

<<<<<<< HEAD
// Get user by external ID (Clerk ID)
export const getUserByExternalId = query({
  args: { externalId: v.string() },
=======
// Get user by Clerk ID with ownership validation
export const getUserByClerkId = query({
  args: { clerkId: v.string() },
>>>>>>> 745733d (feat: Implement user and community management with ownership validation and enhanced API functions)
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
<<<<<<< HEAD
      .withIndex("by_external_id", (q) => q.eq("externalId", args.externalId))
=======
      .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", args.clerkId))
>>>>>>> 745733d (feat: Implement user and community management with ownership validation and enhanced API functions)
      .first();
    
    return user;
  },
});

// Get user by ID (public information only unless owner/admin)
export const getUser = query({
  args: { 
    userId: v.id("users"),
    requestingClerkId: v.optional(v.string()) // To check ownership
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    
    if (!user) return null;
    
    // If no requesting user, return public info only
    if (!args.requestingClerkId) {
      return {
        _id: user._id,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        status: user.preferences?.privacy?.showOnlineStatus ? user.status : 'offline',
        createdAt: user.createdAt
      };
    }
    
    // Get requesting user to check permissions
    const requestingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", args.requestingClerkId))
      .first();
    
    // Return full data if owner or admin
    if (requestingUser && (requestingUser._id === args.userId || requestingUser.role === 'admin')) {
      return user;
    }
    
    // Return limited data for others based on privacy settings
    const privacyLevel = user.preferences?.privacy?.showProfile || 'public';
    if (privacyLevel === 'private') {
      return null;
    }
    
    return {
      _id: user._id,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      location: privacyLevel === 'public' ? user.location : undefined,
      website: privacyLevel === 'public' ? user.website : undefined,
      github: privacyLevel === 'public' ? user.github : undefined,
      skills: user.skills,
      status: user.preferences?.privacy?.showOnlineStatus ? user.status : 'offline',
      createdAt: user.createdAt
    };
  },
});

// Update user profile with ownership validation
export const updateUser = mutation({
  args: {
    clerkId: v.string(),
    updates: v.object({
      displayName: v.optional(v.string()),
      username: v.optional(v.string()),
      bio: v.optional(v.string()),
      location: v.optional(v.string()),
      website: v.optional(v.string()),
      github: v.optional(v.string()),
      twitter: v.optional(v.string()),
      linkedin: v.optional(v.string()),
      skills: v.optional(v.array(v.string())),
      avatarUrl: v.optional(v.string()),
    })
  },
  handler: async (ctx, args) => {
    const user = await verifyUserOwnership(ctx, args.clerkId);
    
    await ctx.db.patch(user._id, {
      ...args.updates,
      updatedAt: Date.now()
    });
    
    return user._id;
  },
});

// Update user status with ownership validation
export const updateUserStatus = mutation({
  args: {
<<<<<<< HEAD
    userId: v.id("users"),
    status: v.union(v.literal("online"), v.literal("away"), v.literal("busy"), v.literal("offline")),
=======
    clerkId: v.string(),
    status: v.union(v.literal("online"), v.literal("offline"), v.literal("away"), v.literal("busy")),
>>>>>>> 745733d (feat: Implement user and community management with ownership validation and enhanced API functions)
    customStatus: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await verifyUserOwnership(ctx, args.clerkId);
    
    await ctx.db.patch(user._id, {
      status: args.status,
      customStatus: args.customStatus,
<<<<<<< HEAD
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
=======
      lastActiveAt: Date.now(),
      updatedAt: Date.now(),
>>>>>>> 745733d (feat: Implement user and community management with ownership validation and enhanced API functions)
    });
    
    return user._id;
  },
});

// Update user preferences with ownership validation
export const updateUserPreferences = mutation({
  args: {
    clerkId: v.string(),
    preferences: v.object({
      theme: v.optional(v.union(v.literal('light'), v.literal('dark'), v.literal('system'))),
      notifications: v.optional(v.object({
        directMessages: v.boolean(),
        friendRequests: v.boolean(),
        mentions: v.boolean(),
        communities: v.boolean(),
        projects: v.boolean()
      })),
      privacy: v.optional(v.object({
        showOnlineStatus: v.boolean(),
        allowDirectMessages: v.union(v.literal('everyone'), v.literal('friends'), v.literal('none')),
        showProfile: v.union(v.literal('public'), v.literal('friends'), v.literal('private'))
      }))
    })
  },
  handler: async (ctx, args) => {
    const user = await verifyUserOwnership(ctx, args.clerkId);
    
    // Merge with existing preferences
    const currentPrefs = user.preferences || {
      theme: 'dark',
      notifications: {
        directMessages: true,
        friendRequests: true,
        mentions: true,
        communities: true,
        projects: true
      },
      privacy: {
        showOnlineStatus: true,
        allowDirectMessages: 'everyone',
        showProfile: 'public'
      }
    };
    
    const updatedPrefs = {
      ...currentPrefs,
      ...args.preferences,
      notifications: args.preferences.notifications 
        ? { ...currentPrefs.notifications, ...args.preferences.notifications }
        : currentPrefs.notifications,
      privacy: args.preferences.privacy
        ? { ...currentPrefs.privacy, ...args.preferences.privacy }
        : currentPrefs.privacy
    };
    
    await ctx.db.patch(user._id, {
      preferences: updatedPrefs,
      updatedAt: Date.now()
    });
    
    return user._id;
  },
});

// Search users by username (with privacy respect)
export const searchUsers = query({
  args: { 
    query: v.string(),
    requestingClerkId: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const users = await ctx.db
      .query("users")
      .withIndex("by_username")
      .collect();
<<<<<<< HEAD

    return users.filter(user =>
      user.username.toLowerCase().includes(args.query.toLowerCase()) ||
      user.displayName.toLowerCase().includes(args.query.toLowerCase())
    ).slice(0, 20); // Limit to 20 results
=======
    
    const filteredUsers = users
      .filter((user: any) => {
        // Only search active users
        if (user.isActive === false) return false;
        
        // Check privacy settings
        const privacyLevel = user.preferences?.privacy?.showProfile || 'public';
        if (privacyLevel === 'private') return false;
        
        // Match search query
        return user.username.toLowerCase().includes(args.query.toLowerCase()) ||
               user.displayName.toLowerCase().includes(args.query.toLowerCase());
      })
      .map((user: any) => ({
        _id: user._id,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        status: user.preferences?.privacy?.showOnlineStatus ? user.status : 'offline',
        createdAt: user.createdAt
      }))
      .slice(0, 20); // Limit to 20 results
    
    return filteredUsers;
  },
});

// Admin function to get all users
export const getAllUsers = query({
  args: { 
    adminClerkId: v.string(),
    limit: v.optional(v.number()),
    offset: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    // Verify admin permissions
    const admin = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", args.adminClerkId))
      .first();
    
    if (!admin || admin.role !== 'admin') {
      throw new Error("Access denied: admin privileges required");
    }
    
    const limit = args.limit || 50;
    const offset = args.offset || 0;
    
    const users = await ctx.db
      .query("users")
      .order("desc")
      .take(limit + offset);
    
    return users.slice(offset);
  },
});

// Delete/deactivate user account
export const deleteUser = mutation({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await verifyUserOwnership(ctx, args.clerkId);
    
    // Soft delete - mark as inactive instead of deleting
    await ctx.db.patch(user._id, {
      isActive: false,
      status: "offline",
      updatedAt: Date.now()
    });
    
    return user._id;
>>>>>>> 745733d (feat: Implement user and community management with ownership validation and enhanced API functions)
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