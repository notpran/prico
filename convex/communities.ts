import { v } from 'convex/values';
import { query, mutation } from './_generated/server';

// Helper function to generate invite code
function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Get user's communities
export const getUserCommunities = query({
  args: { userId: v.id('users') },
  handler: async (ctx, { userId }) => {
    const memberships = await ctx.db
      .query('communityMembers')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect();

    const communities = await Promise.all(
      memberships.map(async (membership) => {
        const community = await ctx.db.get(membership.communityId);
        if (!community) return null;

        return {
          ...community,
          membershipRole: membership.role,
          membershipJoinedAt: membership.joinedAt,
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
    let communities = await ctx.db
      .query('communities')
      .withIndex('by_public', (q) => q.eq('isPublic', true))
      .collect();

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

    return filtered.slice(0, limit);
  }
});

// Get community by slug
export const getCommunityBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return await ctx.db
      .query('communities')
      .withIndex('by_slug', (q) => q.eq('slug', slug))
      .first();
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
    tags: v.array(v.string())
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
      tags: args.tags,
      memberCount: 1,
      settings: {
        allowInvites: true,
        requireApproval: false,
        allowDiscovery: true,
        defaultRole: 'member'
      },
      rules: [],
      createdAt: now,
      updatedAt: now
    });

    // Add owner as member
    await ctx.db.insert('communityMembers', {
      communityId: communityId,
      userId: args.ownerId,
      role: 'owner',
      joinedAt: now,
      permissions: ['invite', 'kick', 'ban', 'manage_channels', 'manage_roles'],
      isActive: true
    });

    // Create default channels
    const generalChannelId = await ctx.db.insert('channels', {
      communityId: communityId,
      name: 'general',
      type: 'text',
      description: 'General discussion',
      position: 0,
      isPrivate: false,
      permissions: [
        {
          roleId: 'everyone',
          allow: ['read', 'write'],
          deny: []
        }
      ],
      messageCount: 0,
      createdAt: now
    });

    return { communityId, generalChannelId };
  }
});

// Join community
export const joinCommunity = mutation({
  args: {
    communityId: v.id('communities'),
    userId: v.id('users')
  },
  handler: async (ctx, args) => {
    // Check if user is already a member
    const existingMembership = await ctx.db
      .query('communityMembers')
      .filter((q) => q.eq(q.field('communityId'), args.communityId))
      .filter((q) => q.eq(q.field('userId'), args.userId))
      .first();

    if (existingMembership) {
      throw new Error('User is already a member of this community');
    }

    const community = await ctx.db.get(args.communityId);
    if (!community) {
      throw new Error('Community not found');
    }

    // Check if community requires approval
    if (community.settings.requireApproval) {
      // For now, auto-approve. In a real app, you'd have pending status
    }

    const now = Date.now();
    await ctx.db.insert('communityMembers', {
      communityId: args.communityId,
      userId: args.userId,
      role: 'member',
      joinedAt: now,
      permissions: [],
      isActive: true
    });

    // Update member count
    await ctx.db.patch(args.communityId, {
      memberCount: community.memberCount + 1
    });

    return true;
  }
});

// Leave community
export const leaveCommunity = mutation({
  args: {
    communityId: v.id('communities'),
    userId: v.id('users')
  },
  handler: async (ctx, args) => {
    const membership = await ctx.db
      .query('communityMembers')
      .filter((q) => q.eq(q.field('communityId'), args.communityId))
      .filter((q) => q.eq(q.field('userId'), args.userId))
      .first();

    if (!membership) {
      throw new Error('User is not a member of this community');
    }

    if (membership.role === 'owner') {
      throw new Error('Community owner cannot leave the community');
    }

    // Remove membership
    await ctx.db.delete(membership._id);

    // Update member count
    const community = await ctx.db.get(args.communityId);
    if (community) {
      await ctx.db.patch(args.communityId, {
        memberCount: Math.max(0, community.memberCount - 1)
      });
    }

    return true;
  }
});

// Get community members
export const getCommunityMembers = query({
  args: { communityId: v.id('communities') },
  handler: async (ctx, { communityId }) => {
    const members = await ctx.db
      .query('communityMembers')
      .withIndex('by_community', (q) => q.eq('communityId', communityId))
      .collect();

    const membersWithUsers = await Promise.all(
      members.map(async (member) => {
        const user = await ctx.db.get(member.userId);
        return {
          ...member,
          user
        };
      })
    );

    return membersWithUsers.filter(m => m.user);
  }
});