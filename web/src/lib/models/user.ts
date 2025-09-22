export interface User {
  _id: string; // ObjectId as string
  clerkId: string;
  username: string;
  displayName: string;
  email: string;
  about?: string;
  badges: string[];
  avatarUrl?: string;
  age?: number;
  createdAt: Date;
  lastActiveAt?: Date;
  friends: string[]; // ObjectId strings
  friendRequestsSent: string[];
  friendRequestsReceived: string[];
  communityIds: string[];
  projectIds: string[];
  settings: {
    showPublicCommunities: boolean;
    notifications: { email: boolean; push: boolean; };
  };
}

export const userIndexes = [
  { key: { username: 1 }, options: { unique: true } },
  { key: { clerkId: 1 }, options: { unique: true } },
];