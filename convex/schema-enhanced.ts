import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  // Users
  users: defineTable({
    externalId: v.string(), // Clerk user ID
    email: v.string(),
    displayName: v.string(),
    username: v.string(),
    avatarUrl: v.optional(v.string()),
    status: v.union(v.literal('online'), v.literal('away'), v.literal('busy'), v.literal('offline')),
    customStatus: v.optional(v.string()),
    lastSeen: v.number(),
    createdAt: v.number(),
    bio: v.optional(v.string()),
    location: v.optional(v.string()),
    website: v.optional(v.string()),
    github: v.optional(v.string()),
    twitter: v.optional(v.string()),
    linkedin: v.optional(v.string()),
    skills: v.array(v.string()),
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
  })
    .index('by_external_id', ['externalId'])
    .index('by_username', ['username'])
    .index('by_email', ['email']),

  // Friendships
  friendships: defineTable({
    requester: v.id('users'),
    addressee: v.id('users'),
    status: v.union(v.literal('pending'), v.literal('accepted'), v.literal('declined'), v.literal('blocked')),
    createdAt: v.number(),
    acceptedAt: v.optional(v.number())
  })
    .index('by_requester', ['requester'])
    .index('by_addressee', ['addressee'])
    .index('by_status', ['status']),

  // Direct Message Conversations
  directMessageConversations: defineTable({
    participants: v.array(v.id('users')),
    lastMessageAt: v.optional(v.number()),
    lastMessage: v.optional(v.string()),
    createdAt: v.number()
  })
    .index('by_participants', ['participants']),

  // Direct Messages
  directMessages: defineTable({
    conversationId: v.id('directMessageConversations'),
    senderId: v.id('users'),
    content: v.string(),
    type: v.union(v.literal('text'), v.literal('file'), v.literal('image'), v.literal('code')),
    fileUrl: v.optional(v.string()),
    fileName: v.optional(v.string()),
    reactions: v.array(v.object({
      emoji: v.string(),
      userId: v.id('users'),
      createdAt: v.number()
    })),
    editedAt: v.optional(v.number()),
    deletedAt: v.optional(v.number()),
    replyTo: v.optional(v.id('directMessages')),
    createdAt: v.number()
  })
    .index('by_conversation', ['conversationId'])
    .index('by_sender', ['senderId']),

  // Communities
  communities: defineTable({
    name: v.string(),
    description: v.string(),
    slug: v.string(),
    ownerId: v.id('users'),
    iconUrl: v.optional(v.string()),
    bannerUrl: v.optional(v.string()),
    isPublic: v.boolean(),
    inviteCode: v.optional(v.string()),
    memberCount: v.number(),
    settings: v.object({
      allowInvites: v.boolean(),
      requireApproval: v.boolean(),
      allowDiscovery: v.boolean(),
      defaultRole: v.string()
    }),
    tags: v.array(v.string()),
    rules: v.array(v.object({
      title: v.string(),
      description: v.string()
    })),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_slug', ['slug'])
    .index('by_owner', ['ownerId'])
    .index('by_public', ['isPublic']),

  // Community Members
  communityMembers: defineTable({
    communityId: v.id('communities'),
    userId: v.id('users'),
    role: v.union(v.literal('owner'), v.literal('admin'), v.literal('moderator'), v.literal('member')),
    joinedAt: v.number(),
    nickname: v.optional(v.string()),
    permissions: v.array(v.string()),
    isActive: v.boolean()
  })
    .index('by_community', ['communityId'])
    .index('by_user', ['userId'])
    .index('by_role', ['role']),

  // Community Channels
  channels: defineTable({
    communityId: v.id('communities'),
    name: v.string(),
    description: v.optional(v.string()),
    type: v.union(v.literal('text'), v.literal('voice'), v.literal('announcement'), v.literal('thread')),
    categoryId: v.optional(v.id('channelCategories')),
    isPrivate: v.boolean(),
    position: v.number(),
    permissions: v.array(v.object({
      roleId: v.string(),
      allow: v.array(v.string()),
      deny: v.array(v.string())
    })),
    lastMessageAt: v.optional(v.number()),
    messageCount: v.number(),
    createdAt: v.number()
  })
    .index('by_community', ['communityId'])
    .index('by_category', ['categoryId'])
    .index('by_type', ['type']),

  // Channel Categories
  channelCategories: defineTable({
    communityId: v.id('communities'),
    name: v.string(),
    position: v.number(),
    collapsed: v.boolean(),
    permissions: v.array(v.object({
      roleId: v.string(),
      allow: v.array(v.string()),
      deny: v.array(v.string())
    })),
    createdAt: v.number()
  })
    .index('by_community', ['communityId']),

  // Channel Messages
  messages: defineTable({
    channelId: v.id('channels'),
    senderId: v.id('users'),
    content: v.string(),
    type: v.union(v.literal('text'), v.literal('file'), v.literal('image'), v.literal('code'), v.literal('system')),
    fileUrl: v.optional(v.string()),
    fileName: v.optional(v.string()),
    reactions: v.array(v.object({
      emoji: v.string(),
      userId: v.id('users'),
      createdAt: v.number()
    })),
    mentions: v.array(v.id('users')),
    editedAt: v.optional(v.number()),
    deletedAt: v.optional(v.number()),
    replyTo: v.optional(v.id('messages')),
    threadId: v.optional(v.id('messages')),
    isPinned: v.boolean(),
    createdAt: v.number()
  })
    .index('by_channel', ['channelId'])
    .index('by_sender', ['senderId'])
    .index('by_thread', ['threadId']),

  // Projects
  projects: defineTable({
    name: v.string(),
    description: v.string(),
    slug: v.string(),
    ownerId: v.id('users'),
    communityId: v.optional(v.id('communities')),
    repository: v.optional(v.object({
      url: v.string(),
      provider: v.union(v.literal('github'), v.literal('gitlab'), v.literal('bitbucket')),
      owner: v.string(),
      name: v.string(),
      branch: v.string()
    })),
    isPublic: v.boolean(),
    technology: v.array(v.string()),
    language: v.string(),
    framework: v.optional(v.string()),
    status: v.union(v.literal('planning'), v.literal('active'), v.literal('completed'), v.literal('archived')),
    settings: v.object({
      allowContributions: v.boolean(),
      requireApproval: v.boolean(),
      autoSync: v.boolean()
    }),
    stats: v.object({
      contributorCount: v.number(),
      commitCount: v.number(),
      linesOfCode: v.number(),
      lastActivity: v.number()
    }),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_slug', ['slug'])
    .index('by_owner', ['ownerId'])
    .index('by_community', ['communityId'])
    .index('by_status', ['status']),

  // Project Contributors
  projectContributors: defineTable({
    projectId: v.id('projects'),
    userId: v.id('users'),
    role: v.union(v.literal('owner'), v.literal('maintainer'), v.literal('contributor'), v.literal('viewer')),
    permissions: v.array(v.string()),
    joinedAt: v.number(),
    lastActivity: v.number(),
    contributionStats: v.object({
      commits: v.number(),
      linesAdded: v.number(),
      linesRemoved: v.number(),
      filesChanged: v.number()
    })
  })
    .index('by_project', ['projectId'])
    .index('by_user', ['userId']),

  // Project Files
  projectFiles: defineTable({
    projectId: v.id('projects'),
    path: v.string(),
    name: v.string(),
    content: v.string(),
    language: v.string(),
    size: v.number(),
    lastModifiedBy: v.id('users'),
    lastModifiedAt: v.number(),
    version: v.number(),
    isDeleted: v.boolean(),
    createdAt: v.number()
  })
    .index('by_project', ['projectId'])
    .index('by_path', ['path']),

  // File Edit Sessions
  fileEditSessions: defineTable({
    fileId: v.id('projectFiles'),
    userId: v.id('users'),
    isActive: v.boolean(),
    cursor: v.object({
      line: v.number(),
      column: v.number()
    }),
    selection: v.optional(v.object({
      start: v.object({ line: v.number(), column: v.number() }),
      end: v.object({ line: v.number(), column: v.number() })
    })),
    lastActivity: v.number(),
    createdAt: v.number()
  })
    .index('by_file', ['fileId'])
    .index('by_user', ['userId']),

  // Notifications
  notifications: defineTable({
    userId: v.id('users'),
    type: v.union(
      v.literal('friend_request'),
      v.literal('friend_accepted'),
      v.literal('direct_message'),
      v.literal('mention'),
      v.literal('community_invite'),
      v.literal('project_invite'),
      v.literal('project_update'),
      v.literal('system')
    ),
    title: v.string(),
    content: v.string(),
    data: v.optional(v.any()),
    isRead: v.boolean(),
    actionUrl: v.optional(v.string()),
    createdAt: v.number()
  })
    .index('by_user', ['userId'])
    .index('by_read', ['isRead']),

  // Voice Channels
  voiceChannels: defineTable({
    channelId: v.id('channels'),
    participants: v.array(v.object({
      userId: v.id('users'),
      joinedAt: v.number(),
      isMuted: v.boolean(),
      isDeafened: v.boolean(),
      isSpeaking: v.boolean()
    })),
    maxParticipants: v.number(),
    isRecording: v.boolean(),
    createdAt: v.number()
  })
    .index('by_channel', ['channelId']),

  // Community Roles
  communityRoles: defineTable({
    communityId: v.id('communities'),
    name: v.string(),
    color: v.string(),
    permissions: v.array(v.string()),
    position: v.number(),
    isDefault: v.boolean(),
    mentionable: v.boolean(),
    memberCount: v.number(),
    createdAt: v.number()
  })
    .index('by_community', ['communityId']),

  // User Activity
  userActivity: defineTable({
    userId: v.id('users'),
    type: v.union(
      v.literal('message'),
      v.literal('voice_join'),
      v.literal('voice_leave'),
      v.literal('project_commit'),
      v.literal('project_create'),
      v.literal('community_join'),
      v.literal('status_change')
    ),
    data: v.any(),
    timestamp: v.number()
  })
    .index('by_user', ['userId'])
    .index('by_type', ['type']),

  // Integration Tokens
  integrationTokens: defineTable({
    userId: v.id('users'),
    provider: v.union(v.literal('github'), v.literal('gitlab'), v.literal('bitbucket'), v.literal('discord')),
    accessToken: v.string(),
    refreshToken: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
    scopes: v.array(v.string()),
    providerUserId: v.string(),
    providerUsername: v.string(),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_user', ['userId'])
    .index('by_provider', ['provider'])
});