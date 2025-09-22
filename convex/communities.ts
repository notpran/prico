import { v } from 'convex/values';
import { query, mutation } from './_generated/server';
import { Id } from './_generated/dataModel';

// Get user's communities
export const getUserCommunities = query({
  args: { userId: v.id('users') },
  handler: async (ctx, { userId }) => {
    const memberships = await ctx.db
      .query('communityMembers')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .filter((q) => q.eq(q.field('isActive'), true))
      .collect();

    const communities = await Promise.all(
      memberships.map(async (membership) => {
        const community = await ctx.db.get(membership.communityId);
        if (!community) return null;

        return {
          ...community,
          membershipRole: membership.role,
          membershipJoinedAt: membership.joinedAt,
          unreadCount: 0 // Will implement real unread counting
        };
      })
    );

    return communities.filter(Boolean);
  }
});

// Get public communities for discovery
export const getPublicCommunities = query({
  args: { 
    limit: v.optional(v.number()),
    search: v.optional(v.string()),
    tags: v.optional(v.array(v.string()))
  },
  handler: async (ctx, { limit = 50, search, tags }) => {
    let query = ctx.db
      .query('communities')
      .withIndex('by_public', (q) => q.eq('isPublic', true));

    const communities = await query.collect();

    let filtered = communities;

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(community => 
        community.name.toLowerCase().includes(searchLower) ||
        community.description.toLowerCase().includes(searchLower) ||
        community.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Apply tags filter
    if (tags && tags.length > 0) {
      filtered = filtered.filter(community =>
        tags.some(tag => community.tags.includes(tag))
      );
    }

    // Sort by member count and recent activity
    filtered.sort((a, b) => {
      return b.memberCount - a.memberCount || b.updatedAt - a.updatedAt;
    });

    return filtered.slice(0, limit);
  }
});

// Create community
export const createCommunity = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    slug: v.string(),
    ownerId: v.id('users'),
    isPublic: v.boolean(),
    tags: v.array(v.string()),
    rules: v.optional(v.array(v.object({
      title: v.string(),
      description: v.string()
    })))
  },
  handler: async (ctx, args) => {
    // Check if slug is already taken
    const existingCommunity = await ctx.db
      .query('communities')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .first();

    if (existingCommunity) {
      throw new Error('Community slug already exists');
    }

    const now = Date.now();
    
    const communityId = await ctx.db.insert('communities', {
      name: args.name,
      description: args.description,
      slug: args.slug,
      ownerId: args.ownerId,
      isPublic: args.isPublic,
      memberCount: 1,
      inviteCode: generateInviteCode(),
      settings: {
        allowInvites: true,
        requireApproval: false,
        allowDiscovery: args.isPublic,
        defaultRole: 'member'
      },
      tags: args.tags,
      rules: args.rules || [],
      createdAt: now,
      updatedAt: now
    });

    // Add owner as member
    await ctx.db.insert('communityMembers', {
      communityId,
      userId: args.ownerId,
      role: 'owner',
      joinedAt: now,
      permissions: ['all'],
      isActive: true
    });

    // Create default channels
    const generalChannelId = await ctx.db.insert('channels', {
      communityId,
      name: 'general',
      description: 'General discussion',
      type: 'text',
      isPrivate: false,
      position: 0,
      permissions: [],
      messageCount: 0,
      createdAt: now
    });

    return { communityId, generalChannelId };
  }
});

// Get communities for a user
export const getUserCommunities = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const communities = await ctx.db
      .query("communities")
      .collect();
    
    return communities.filter(community => 
      community.memberIds.includes(args.userId)
    );
  },
});

// Get public communities
export const getPublicCommunities = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("communities")
      .withIndex("by_privacy", (q) => q.eq("privacy", "public"))
      .collect();
  },
});

// Join a community
export const joinCommunity = mutation({
  args: {
    communityId: v.id("communities"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const community = await ctx.db.get(args.communityId);
    if (!community) {
      throw new Error("Community not found");
    }

    if (community.memberIds.includes(args.userId)) {
      throw new Error("User already in community");
    }

    await ctx.db.patch(args.communityId, {
      memberIds: [...community.memberIds, args.userId],
      updatedAt: Date.now(),
    });
  },
});

// Leave a community
export const leaveCommunity = mutation({
  args: {
    communityId: v.id("communities"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const community = await ctx.db.get(args.communityId);
    if (!community) {
      throw new Error("Community not found");
    }

    if (community.ownerId === args.userId) {
      throw new Error("Owner cannot leave community");
    }

    await ctx.db.patch(args.communityId, {
      memberIds: community.memberIds.filter(id => id !== args.userId),
      adminIds: community.adminIds.filter(id => id !== args.userId),
      updatedAt: Date.now(),
    });
  },
});

// Get community details
export const getCommunity = query({
  args: { communityId: v.id("communities") },
  handler: async (ctx, args) => {
    const community = await ctx.db.get(args.communityId);
    if (!community) return null;

    const channels = await ctx.db
      .query("channels")
      .withIndex("by_community", (q) => q.eq("communityId", args.communityId))
      .collect();

    return {
      ...community,
      channels: channels.sort((a, b) => a.position - b.position),
    };
  },
});