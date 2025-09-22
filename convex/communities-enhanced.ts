import { v } from 'convex/values';
import { query, mutation } from './_generated/server';

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
    let communityQuery = ctx.db
      .query('communities')
      .withIndex('by_public', (q) => q.eq('isPublic', true));

    const communities = await communityQuery.collect();

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

// Get community details
export const getCommunity = query({
  args: { 
    communityId: v.optional(v.id('communities')),
    slug: v.optional(v.string())
  },
  handler: async (ctx, { communityId, slug }) => {
    let community;
    
    if (communityId) {
      community = await ctx.db.get(communityId);
    } else if (slug) {
      community = await ctx.db
        .query('communities')
        .withIndex('by_slug', (q) => q.eq('slug', slug))
        .first();
    }

    if (!community) return null;

    const owner = await ctx.db.get(community.ownerId);
    
    return {
      ...community,
      owner: owner ? {
        _id: owner._id,
        displayName: owner.displayName,
        username: owner.username,
        avatarUrl: owner.avatarUrl
      } : null
    };
  }
});

// Get community channels
export const getCommunityChannels = query({
  args: { communityId: v.id('communities') },
  handler: async (ctx, { communityId }) => {
    const channels = await ctx.db
      .query('channels')
      .withIndex('by_community', (q) => q.eq('communityId', communityId))
      .collect();

    const categories = await ctx.db
      .query('channelCategories')
      .withIndex('by_community', (q) => q.eq('communityId', communityId))
      .collect();

    // Group channels by category
    const categorizedChannels = categories
      .sort((a, b) => a.position - b.position)
      .map(category => ({
        ...category,
        channels: channels
          .filter(channel => channel.categoryId === category._id)
          .sort((a, b) => a.position - b.position)
      }));

    // Add uncategorized channels
    const uncategorizedChannels = channels
      .filter(channel => !channel.categoryId)
      .sort((a, b) => a.position - b.position);

    return {
      categorizedChannels,
      uncategorizedChannels
    };
  }
});

// Get community members
export const getCommunityMembers = query({
  args: { 
    communityId: v.id('communities'),
    limit: v.optional(v.number()),
    role: v.optional(v.union(v.literal('owner'), v.literal('admin'), v.literal('moderator'), v.literal('member')))
  },
  handler: async (ctx, { communityId, limit = 100, role }) => {
    let memberQuery = ctx.db
      .query('communityMembers')
      .withIndex('by_community', (q) => q.eq('communityId', communityId))
      .filter((q) => q.eq(q.field('isActive'), true));

    if (role) {
      memberQuery = memberQuery.filter((q) => q.eq(q.field('role'), role));
    }

    const memberships = await memberQuery.take(limit);

    const members = await Promise.all(
      memberships.map(async (membership) => {
        const user = await ctx.db.get(membership.userId);
        if (!user) return null;

        return {
          ...user,
          membershipRole: membership.role,
          membershipJoinedAt: membership.joinedAt,
          membershipNickname: membership.nickname,
          membershipPermissions: membership.permissions
        };
      })
    );

    return members.filter(Boolean);
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

    const announcementsChannelId = await ctx.db.insert('channels', {
      communityId,
      name: 'announcements',
      description: 'Important announcements',
      type: 'announcement',
      isPrivate: false,
      position: 1,
      permissions: [],
      messageCount: 0,
      createdAt: now
    });

    return { communityId, generalChannelId, announcementsChannelId };
  }
});

// Join community
export const joinCommunity = mutation({
  args: {
    communityId: v.id('communities'),
    userId: v.id('users'),
    inviteCode: v.optional(v.string())
  },
  handler: async (ctx, { communityId, userId, inviteCode }) => {
    const community = await ctx.db.get(communityId);
    if (!community) {
      throw new Error('Community not found');
    }

    // Check if user is already a member
    const existingMembership = await ctx.db
      .query('communityMembers')
      .withIndex('by_community', (q) => q.eq('communityId', communityId))
      .filter((q) => q.eq(q.field('userId'), userId))
      .first();

    if (existingMembership) {
      if (existingMembership.isActive) {
        throw new Error('User is already a member of this community');
      } else {
        // Reactivate membership
        await ctx.db.patch(existingMembership._id, {
          isActive: true,
          joinedAt: Date.now()
        });
        return { success: true, reactivated: true };
      }
    }

    // Check access permissions
    if (!community.isPublic) {
      if (!inviteCode || inviteCode !== community.inviteCode) {
        throw new Error('Invalid invite code');
      }
    }

    const now = Date.now();

    // Add user as member
    await ctx.db.insert('communityMembers', {
      communityId,
      userId,
      role: 'member',
      joinedAt: now,
      permissions: [],
      isActive: true
    });

    // Update member count
    await ctx.db.patch(communityId, {
      memberCount: community.memberCount + 1,
      updatedAt: now
    });

    return { success: true, reactivated: false };
  }
});

// Leave community
export const leaveCommunity = mutation({
  args: {
    communityId: v.id('communities'),
    userId: v.id('users')
  },
  handler: async (ctx, { communityId, userId }) => {
    const membership = await ctx.db
      .query('communityMembers')
      .withIndex('by_community', (q) => q.eq('communityId', communityId))
      .filter((q) => q.eq(q.field('userId'), userId))
      .filter((q) => q.eq(q.field('isActive'), true))
      .first();

    if (!membership) {
      throw new Error('User is not a member of this community');
    }

    if (membership.role === 'owner') {
      throw new Error('Community owner cannot leave. Transfer ownership first.');
    }

    const community = await ctx.db.get(communityId);
    if (!community) {
      throw new Error('Community not found');
    }

    // Deactivate membership
    await ctx.db.patch(membership._id, {
      isActive: false
    });

    // Update member count
    await ctx.db.patch(communityId, {
      memberCount: Math.max(0, community.memberCount - 1),
      updatedAt: Date.now()
    });

    return { success: true };
  }
});

// Send channel message
export const sendChannelMessage = mutation({
  args: {
    channelId: v.id('channels'),
    senderId: v.id('users'),
    content: v.string(),
    type: v.optional(v.union(v.literal('text'), v.literal('file'), v.literal('image'), v.literal('code'))),
    replyTo: v.optional(v.id('messages')),
    mentions: v.optional(v.array(v.id('users')))
  },
  handler: async (ctx, args) => {
    const channel = await ctx.db.get(args.channelId);
    if (!channel) {
      throw new Error('Channel not found');
    }

    const now = Date.now();

    const messageId = await ctx.db.insert('messages', {
      channelId: args.channelId,
      senderId: args.senderId,
      content: args.content,
      type: args.type || 'text',
      reactions: [],
      mentions: args.mentions || [],
      replyTo: args.replyTo,
      isPinned: false,
      createdAt: now
    });

    // Update channel stats
    await ctx.db.patch(args.channelId, {
      lastMessageAt: now,
      messageCount: channel.messageCount + 1
    });

    return { messageId };
  }
});

// Helper function to generate invite codes
function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}