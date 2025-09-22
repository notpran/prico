'use client';

import { useConvexAuth, useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { useEffect } from 'react';

// Hook to ensure user exists in Convex
export function useEnsureUser() {
  const { user } = useUser();
  const { isAuthenticated } = useConvexAuth();
  const createUser = useMutation(api.users.createUser);
  
  // Get existing user
  const convexUser = useQuery(
    api.users.getUserByClerkId,
    isAuthenticated && user?.id ? { clerkId: user.id } : 'skip'
  );

  useEffect(() => {
    if (isAuthenticated && user && !convexUser) {
      // Create user in Convex if they don't exist
      createUser({
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress || '',
        username: user.username || user.firstName || 'user',
        displayName: user.fullName || user.firstName || 'User',
        avatarUrl: user.imageUrl,
      });
    }
  }, [isAuthenticated, user, convexUser, createUser]);

  return {
    convexUser,
    isLoading: convexUser === undefined && isAuthenticated,
  };
}

export function useUserCommunities() {
  const { convexUser, isLoading: userLoading } = useEnsureUser();
  
  const communities = useQuery(
    api.communities.getUserCommunities,
    convexUser?._id ? { userId: convexUser._id } : 'skip'
  );

  return {
    communities: communities || [],
    isLoading: communities === undefined || userLoading,
    convexUser,
  };
}

export function usePublicCommunities() {
  const { isAuthenticated } = useConvexAuth();
  
  const communities = useQuery(
    api.communities.getPublicCommunities,
    isAuthenticated ? {} : 'skip'
  );

  return {
    communities: communities || [],
    isLoading: communities === undefined,
  };
}

export function useCommunityChannels(communityId?: string) {
  const { isAuthenticated } = useConvexAuth();
  
  const channels = useQuery(
    api.communities.getCommunityChannels,
    isAuthenticated && communityId ? { communityId } : 'skip'
  );

  return {
    channels: channels || [],
    isLoading: channels === undefined,
  };
}

export function useUserFriends() {
  const { convexUser, isLoading: userLoading } = useEnsureUser();

  const friends = useQuery(
    api.friends.getFriends,
    convexUser?._id ? { userId: convexUser._id } : 'skip'
  );

  return {
    friends: friends || [],
    isLoading: friends === undefined || userLoading,
    convexUser,
  };
}

export function useUserProjects() {
  const { convexUser, isLoading: userLoading } = useEnsureUser();

  const projects = useQuery(
    api.projects.getUserProjects,
    convexUser?._id ? { userId: convexUser._id } : 'skip'
  );

  return {
    projects: projects || [],
    isLoading: projects === undefined || userLoading,
    convexUser,
  };
}

export function usePublicProjects(filters?: {
  search?: string;
  technology?: string[];
  language?: string;
  limit?: number;
}) {
  const { isAuthenticated } = useConvexAuth();
  
  const projects = useQuery(
    api.projects.getPublicProjects,
    isAuthenticated ? filters || {} : 'skip'
  );

  return {
    projects: projects || [],
    isLoading: projects === undefined,
  };
}

export function useProject(projectId?: string) {
  const { isAuthenticated } = useConvexAuth();
  
  const project = useQuery(
    api.projects.getProject,
    isAuthenticated && projectId ? { projectId } : 'skip'
  );

  return {
    project,
    isLoading: project === undefined,
  };
}

export function useProjectFiles(projectId?: string) {
  const { isAuthenticated } = useConvexAuth();
  
  const files = useQuery(
    api.projects.getProjectFiles,
    isAuthenticated && projectId ? { projectId } : 'skip'
  );

  return {
    files: files || [],
    isLoading: files === undefined,
  };
}

export function useFriendRequests() {
  const { user } = useUser();
  const { isAuthenticated } = useConvexAuth();
  
  const requests = useQuery(
    api.friends.getFriendRequests,
    isAuthenticated && user?.id ? { userId: user.id } : 'skip'
  );

  return {
    requests: requests || [],
    isLoading: requests === undefined,
  };
}

export function useDirectMessages() {
  const { user } = useUser();
  const { isAuthenticated } = useConvexAuth();
  
  const conversations = useQuery(
    api.directMessages.getUserConversations,
    isAuthenticated && user?.id ? { userId: user.id } : 'skip'
  );

  return {
    conversations: conversations || [],
    isLoading: conversations === undefined,
  };
}

// Mutation hooks for real-time features
export function useCreateCommunity() {
  const { convexUser } = useEnsureUser();
  const createCommunityMutation = useMutation(api.communities.createCommunity);

  return {
    createCommunity: async (data: {
      name: string;
      description: string;
      slug: string;
      isPublic: boolean;
      tags: string[];
    }) => {
      if (!convexUser?._id) throw new Error('User not found');
      
      return await createCommunityMutation({
        ...data,
        ownerId: convexUser._id,
      });
    },
    isLoading: !convexUser,
  };
}

export function useCreateProject() {
  const { convexUser } = useEnsureUser();
  const createProjectMutation = useMutation(api.projects.createProject);

  return {
    createProject: async (data: {
      name: string;
      description: string;
      isPublic: boolean;
      techStack: string[];
      repository?: string;
    }) => {
      if (!convexUser?._id) throw new Error('User not found');
      
      return await createProjectMutation({
        ...data,
        ownerId: convexUser._id,
        repository: data.repository || null,
      });
    },
    isLoading: !convexUser,
  };
}

export function useFriendActions() {
  const { convexUser } = useEnsureUser();
  const sendRequestMutation = useMutation(api.friends.sendFriendRequest);
  const acceptRequestMutation = useMutation(api.friends.acceptFriendRequest);
  const declineRequestMutation = useMutation(api.friends.declineFriendRequest);

  return {
    sendFriendRequest: async (targetUserId: string) => {
      if (!convexUser?._id) throw new Error('User not found');
      
      return await sendRequestMutation({
        userId: convexUser._id,
        friendId: targetUserId,
      });
    },
    acceptFriendRequest: async (requestId: string) => {
      if (!convexUser?._id) throw new Error('User not found');
      
      return await acceptRequestMutation({
        requestId,
      });
    },
    declineFriendRequest: async (requestId: string) => {
      if (!convexUser?._id) throw new Error('User not found');
      
      return await declineRequestMutation({
        requestId,
      });
    },
    isLoading: !convexUser,
  };
}