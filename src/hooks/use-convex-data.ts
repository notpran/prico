'use client';

import { useConvexAuth, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useUser } from '@clerk/nextjs';

export function useUserCommunities() {
  const { user } = useUser();
  const { isAuthenticated } = useConvexAuth();
  
  const communities = useQuery(
    api.communities.getUserCommunities,
    isAuthenticated && user?.id ? { userId: user.id } : 'skip'
  );

  return {
    communities: communities || [],
    isLoading: communities === undefined,
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
  const { user } = useUser();
  const { isAuthenticated } = useConvexAuth();
  
  const friends = useQuery(
    api.friends.getUserFriends,
    isAuthenticated && user?.id ? { userId: user.id } : 'skip'
  );

  return {
    friends: friends || [],
    isLoading: friends === undefined,
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