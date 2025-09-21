import React, { createContext, useContext, useState, useEffect } from 'react';
import { communitiesApi, Community } from '../api/communities';
import { socketManager, Message } from '../api/socket';
import { useAuth } from './AuthContext';

interface AppContextType {
  communities: Community[];
  currentCommunity: Community | null;
  messages: Record<string, Message[]>; // communityId -> messages
  loadingCommunities: boolean;
  error: string | null;
  
  // Community actions
  loadCommunities: () => Promise<void>;
  createCommunity: (data: any) => Promise<void>;
  joinCommunity: (communityId: string) => Promise<void>;
  leaveCommunity: (communityId: string) => Promise<void>;
  setCurrentCommunity: (community: Community | null) => void;
  
  // Message actions
  sendMessage: (communityId: string, content: string) => void;
  loadMessages: (communityId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [currentCommunity, setCurrentCommunity] = useState<Community | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [loadingCommunities, setLoadingCommunities] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load communities when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadCommunities();
    } else {
      setCommunities([]);
      setCurrentCommunity(null);
      setMessages({});
    }
  }, [isAuthenticated]);

  // Set up Socket.IO message listeners
  useEffect(() => {
    const handleNewMessage = (message: Message) => {
      setMessages(prev => ({
        ...prev,
        [message.communityId]: [...(prev[message.communityId] || []), message]
      }));
    };

    socketManager.onMessage(handleNewMessage);

    return () => {
      socketManager.offMessage(handleNewMessage);
    };
  }, []);

  // Join/leave community rooms when current community changes
  useEffect(() => {
    if (currentCommunity) {
      socketManager.joinCommunity(currentCommunity._id);
      loadMessages(currentCommunity._id);
    }

    return () => {
      if (currentCommunity) {
        socketManager.leaveCommunity(currentCommunity._id);
      }
    };
  }, [currentCommunity]);

  const loadCommunities = async () => {
    if (!isAuthenticated) return;
    
    setLoadingCommunities(true);
    setError(null);
    
    try {
      const userCommunities = await communitiesApi.getAll();
      setCommunities(userCommunities);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load communities');
      console.error('Failed to load communities:', error);
    } finally {
      setLoadingCommunities(false);
    }
  };

  const createCommunity = async (data: any) => {
    if (!isAuthenticated) return;
    
    try {
      const newCommunity = await communitiesApi.create(data);
      setCommunities(prev => [...prev, newCommunity]);
      setCurrentCommunity(newCommunity);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create community');
      throw error;
    }
  };

  const joinCommunity = async (communityId: string) => {
    if (!isAuthenticated) return;
    
    try {
      await communitiesApi.join(communityId);
      await loadCommunities(); // Reload to get updated community list
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to join community');
      throw error;
    }
  };

  const leaveCommunity = async (communityId: string) => {
    if (!isAuthenticated) return;
    
    try {
      await communitiesApi.leave(communityId);
      setCommunities(prev => prev.filter(c => c._id !== communityId));
      
      if (currentCommunity?._id === communityId) {
        setCurrentCommunity(null);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to leave community');
      throw error;
    }
  };

  const sendMessage = (communityId: string, content: string) => {
    if (!isAuthenticated || !socketManager.isConnected()) return;
    
    socketManager.sendMessage(communityId, content);
  };

  const loadMessages = (communityId: string) => {
    // Initialize empty message array for community if not exists
    if (!messages[communityId]) {
      setMessages(prev => ({
        ...prev,
        [communityId]: []
      }));
    }
    
    // TODO: Load historical messages from API
    // For now, we only show real-time messages via Socket.IO
  };

  const value: AppContextType = {
    communities,
    currentCommunity,
    messages,
    loadingCommunities,
    error,
    loadCommunities,
    createCommunity,
    joinCommunity,
    leaveCommunity,
    setCurrentCommunity,
    sendMessage,
    loadMessages
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};