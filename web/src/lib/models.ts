// src/lib/models.ts - TypeScript interfaces for MongoDB collections

export interface User {
  _id?: string;
  email: string;
  username: string;
  displayName?: string;
  password?: string; // Only for email/password auth
  age: number;
  avatar?: string;
  githubId?: string;
  googleId?: string;
  createdAt: Date;
  lastActiveAt: Date;
  friends: string[]; // Array of user IDs
  friendRequestsSent: string[];
  friendRequestsReceived: string[];
  communityIds: string[];
  projectIds: string[];
  settings: {
    showPublicCommunities: boolean;
    notifications: {
      email: boolean;
      push: boolean;
    };
  };
}

export interface Community {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  iconUrl?: string;
  ownerId: string;
  adminIds: string[];
  memberIds: string[];
  privacy: 'public' | 'private' | 'invite';
  createdAt: Date;
  channels: string[];
}

export interface Channel {
  _id: string;
  communityId?: string;
  name: string;
  type: 'text' | 'voice' | 'thread' | 'dm';
  participantIds?: string[];
  slowModeSeconds?: number;
  pinnedMessageIds: string[];
  createdAt: Date;
}

export interface Message {
  _id: string;
  channelId: string;
  communityId?: string;
  authorId: string;
  content: string;
  renderedHtml?: string;
  attachments?: string[];
  mentions?: string[];
  reactions?: { [emoji: string]: string[] };
  threadParent?: string;
  pinned?: boolean;
  editedAt?: Date;
  deletedAt?: Date | null;
  ephemeralUntil?: Date | null;
  createdAt: Date;
}

export interface Attachment {
  _id: string;
  url: string;
  filename: string;
  contentType: string;
  size: number;
  uploaderId: string;
  projectId?: string;
  createdAt: Date;
}

export interface Project {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  ownerId: string;
  visibility: 'public' | 'private';
  repoPath: string;
  defaultBranch: string;
  forkedFrom?: string;
  stars: string[];
  collaborators: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Commit {
  _id: string;
  projectId: string;
  commitHash: string;
  message: string;
  authorId: string;
  createdAt: Date;
}

export interface PullRequest {
  _id: string;
  projectId: string;
  sourceRepoId: string;
  sourceBranch: string;
  targetRepoId: string;
  targetBranch: string;
  authorId: string;
  title: string;
  description?: string;
  status: 'open' | 'merged' | 'closed' | 'conflict';
  reviewers: string[];
  comments: { authorId: string; body: string; createdAt: Date }[];
  createdAt: Date;
  mergedAt?: Date;
}

export interface Run {
  _id: string;
  userId: string;
  projectId?: string;
  code: string;
  language: string;
  stdin?: string;
  stdout?: string;
  stderr?: string;
  exitCode?: number;
  status: 'queued' | 'running' | 'finished' | 'error';
  createdAt: Date;
  finishedAt?: Date;
}