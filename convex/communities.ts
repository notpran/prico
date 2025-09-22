import { v } from 'convex/values';
import { query, mutation } from './_generated/server';

// Helper function to generate invite code
function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Get user's communities
export const getUserCommunities = query({
  args: { userId: v.id('users') },
 import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

// Helper function to verify community access and ownership
async function verifyMembershipOrOwnership(ctx: any, communityId: string, clerkId: string, requiredRole?: string) {
  const user = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', (q: any) => q.eq('clerkId', clerkId))
    .first();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const membership = await ctx.db
    .query('communityMembers')
    .withIndex('by_community', (q: any) => q.eq('communityId', communityId))
    .filter((q: any) => q.eq(q.field('userId'), user._id))
    .first();

  if (!membership && user.role !== 'admin') {
    throw new Error('Access denied: not a member of this community');
  }

  if (requiredRole) {
    const roleHierarchy = ['member', 'moderator', 'admin', 'owner'];
    const userRoleLevel = roleHierarchy.indexOf(membership?.role || 'member');
    const requiredRoleLevel = roleHierarchy.indexOf(requiredRole);
    
    if (userRoleLevel < requiredRoleLevel && user.role !== 'admin') {
      throw new Error(`Access denied: ${requiredRole} role required`);
    }
  }

  return { user, membership };
}

// Get public communities with pagination
export const getPublicCommunities = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    search: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const offset = args.offset || 0;
    
    let communities = await ctx.db
      .query('communities')
      .withIndex('by_public', (q: any) => q.eq('isPublic', true))
      .order('desc')
      .take(limit + offset);

    if (args.search) {
      communities = communities.filter((community: any) =>
        community.name.toLowerCase().includes(args.search!.toLowerCase()) ||
        community.description.toLowerCase().includes(args.search!.toLowerCase())
      );
    }

    return communities.slice(offset).map((community: any) => ({
      _id: community._id,
      name: community.name,
      description: community.description,
      slug: community.slug,
      iconUrl: community.iconUrl,
      bannerUrl: community.bannerUrl,
      memberCount: community.memberCount,
      tags: community.tags,
      createdAt: community.createdAt
    }));
  },
});

// Get user's communities with membership info
export const getUserCommunities = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q: any) => q.eq('clerkId', args.clerkId))
      .first();

    if (!user) {
      throw new Error('User not found');
    }

    const memberships = await ctx.db
      .query('communityMembers')
      .withIndex('by_user', (q: any) => q.eq('userId', user._id))
      .filter((q: any) => q.eq(q.field('isActive'), true))
      .collect();

    const communities = await Promise.all(
      memberships.map(async (membership: any) => {
        const community = await ctx.db.get(membership.communityId);
        return {
          ...community,
          membershipRole: membership.role,
          joinedAt: membership.joinedAt,
          nickname: membership.nickname
        };
      })
    );

    return communities.filter(Boolean);
  },
});

// Get community details with role-based access
export const getCommunity = query({
  args: {
    communityId: v.id('communities'),
    clerkId: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const community = await ctx.db.get(args.communityId);
    
    if (!community) {
      throw new Error('Community not found');
    }

    // Public communities can be viewed by anyone
    if (community.isPublic) {
      return community;
    }

    // Private communities require membership
    if (!args.clerkId) {
      throw new Error('Authentication required for private community');
    }

    const { membership } = await verifyMembershipOrOwnership(ctx, args.communityId, args.clerkId);
    
    return {
      ...community,
      membershipRole: membership?.role,
      joinedAt: membership?.joinedAt
    };
  },
});

// Create new community
export const createCommunity = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    description: v.string(),
    slug: v.string(),
    isPublic: v.boolean(),
    iconUrl: v.optional(v.string()),
    bannerUrl: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    settings: v.optional(v.object({
      allowInvites: v.boolean(),
      requireApproval: v.boolean(),
      allowDiscovery: v.boolean(),
      defaultRole: v.string()
    }))
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q: any) => q.eq('clerkId', args.clerkId))
      .first();

    if (!user) {
      throw new Error('User not authenticated');
    }

    // Check if slug is unique
    const existingCommunity = await ctx.db
      .query('communities')
      .withIndex('by_slug', (q: any) => q.eq('slug', args.slug))
      .first();

    if (existingCommunity) {
      throw new Error('Community slug already exists');
    }

    const defaultSettings = {
      allowInvites: true,
      requireApproval: !args.isPublic,
      allowDiscovery: args.isPublic,
      defaultRole: 'member'
    };

    // Create community
    const communityId = await ctx.db.insert('communities', {
      name: args.name,
      description: args.description,
      slug: args.slug,
      ownerId: user._id,
      iconUrl: args.iconUrl,
      bannerUrl: args.bannerUrl,
      isPublic: args.isPublic,
      memberCount: 1,
      settings: { ...defaultSettings, ...args.settings },
      tags: args.tags || [],
      rules: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    // Add creator as owner
    await ctx.db.insert('communityMembers', {
      communityId,
      userId: user._id,
      role: 'owner',
      joinedAt: Date.now(),
      permissions: ['*'], // All permissions
      isActive: true
    });

    // Create default general channel
    await ctx.db.insert('channels', {
      communityId,
      name: 'general',
      description: 'General discussion',
      type: 'text',
      isPrivate: false,
      position: 0,
      permissions: [],
      messageCount: 0,
      createdAt: Date.now()
    });

    return communityId;
  },
});

// Join community
export const joinCommunity = mutation({
  args: {
    clerkId: v.string(),
    communityId: v.id('communities'),
    inviteCode: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q: any) => q.eq('clerkId', args.clerkId))
      .first();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const community = await ctx.db.get(args.communityId);
    if (!community) {
      throw new Error('Community not found');
    }

    // Check if already a member
    const existingMembership = await ctx.db
      .query('communityMembers')
      .withIndex('by_community', (q: any) => q.eq('communityId', args.communityId))
      .filter((q: any) => q.eq(q.field('userId'), user._id))
      .first();

    if (existingMembership) {
      if (existingMembership.isActive) {
        throw new Error('Already a member of this community');
      } else {
        // Reactivate membership
        await ctx.db.patch(existingMembership._id, {
          isActive: true,
          joinedAt: Date.now()
        });
        return existingMembership._id;
      }
    }

    // Check access requirements
    if (!community.isPublic) {
      if (!args.inviteCode || args.inviteCode !== community.inviteCode) {
        throw new Error('Valid invite code required for private community');
      }
    }

    // Create membership
    const membershipId = await ctx.db.insert('communityMembers', {
      communityId: args.communityId,
      userId: user._id,
      role: community.settings.defaultRole as any,
      joinedAt: Date.now(),
      permissions: [],
      isActive: true
    });

    // Update member count
    await ctx.db.patch(args.communityId, {
      memberCount: community.memberCount + 1,
      updatedAt: Date.now()
    });

    return membershipId;
  },
});

// Leave community
export const leaveCommunity = mutation({
  args: {
    clerkId: v.string(),
    communityId: v.id('communities')
  },
  handler: async (ctx, args) => {
    const { user, membership } = await verifyMembershipOrOwnership(ctx, args.communityId, args.clerkId);

    if (!membership) {
      throw new Error('Not a member of this community');
    }

    if (membership.role === 'owner') {
      throw new Error('Cannot leave community as owner. Transfer ownership first.');
    }

    // Deactivate membership
    await ctx.db.patch(membership._id, {
      isActive: false
    });

    // Update member count
    const community = await ctx.db.get(args.communityId);
    if (community) {
      await ctx.db.patch(args.communityId, {
        memberCount: Math.max(0, community.memberCount - 1),
        updatedAt: Date.now()
      });
    }

    return membership._id;
  },
});

// Update community (owner/admin only)
export const updateCommunity = mutation({
  args: {
    clerkId: v.string(),
    communityId: v.id('communities'),
    updates: v.object({
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      iconUrl: v.optional(v.string()),
      bannerUrl: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
      settings: v.optional(v.object({
        allowInvites: v.optional(v.boolean()),
        requireApproval: v.optional(v.boolean()),
        allowDiscovery: v.optional(v.boolean()),
        defaultRole: v.optional(v.string())
      }))
    })
  },
  handler: async (ctx, args) => {
    await verifyMembershipOrOwnership(ctx, args.communityId, args.clerkId, 'admin');

    const community = await ctx.db.get(args.communityId);
    if (!community) {
      throw new Error('Community not found');
    }

    const updatedSettings = args.updates.settings 
      ? { ...community.settings, ...args.updates.settings }
      : community.settings;

    await ctx.db.patch(args.communityId, {
      ...args.updates,
      settings: updatedSettings,
      updatedAt: Date.now()
    });

    return args.communityId;
  },
});

// Get community channels with access control
export const getCommunityChannels = query({
  args: {
    communityId: v.id('communities'),
    clerkId: v.string()
  },
  handler: async (ctx, args) => {
    const { user, membership } = await verifyMembershipOrOwnership(ctx, args.communityId, args.clerkId);

    const channels = await ctx.db
      .query('channels')
      .withIndex('by_community', (q: any) => q.eq('communityId', args.communityId))
      .order('asc')
      .collect();

    // Filter channels based on permissions
    return channels.filter((channel: any) => {
      if (!channel.isPrivate) return true;
      
      // Check if user has access to private channel
      const hasAccess = channel.permissions.some((perm: any) => {
        return membership?.permissions.includes(perm.roleId) || 
               membership?.role === perm.roleId ||
               membership?.role === 'owner' ||
               membership?.role === 'admin';
      });
      
      return hasAccess;
    });
  },
});sync (ctx, { userId }) => {
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