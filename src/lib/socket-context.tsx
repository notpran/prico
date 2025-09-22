'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useUser } from '@clerk/nextjs';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinCommunity: (communityId: string) => void;
  joinChannel: (communityId: string, channelId: string) => void;
  sendMessage: (communityId: string, channelId: string, content: string) => void;
  addReaction: (messageId: string, emoji: string, communityId: string, channelId: string) => void;
  startTyping: (communityId: string, channelId: string) => void;
  stopTyping: (communityId: string, channelId: string) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  joinCommunity: () => {},
  joinChannel: () => {},
  sendMessage: () => {},
  addReaction: () => {},
  startTyping: () => {},
  stopTyping: () => {},
});

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const { user } = useUser();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user) return;

    const socketInstance = io('http://localhost:3001', {
      auth: {
        token: 'demo-token', // In real app, use actual JWT token
        userId: user.id,
        userName: user.fullName || user.username || 'User',
      },
      transports: ['websocket', 'polling'],
    });

    socketInstance.on('connect', () => {
      console.log('✅ Connected to Socket.IO server');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('❌ Disconnected from Socket.IO server');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('❌ Socket.IO connection error:', error);
      setIsConnected(false);
    });

    // Listen for real-time events
    socketInstance.on('new-message', (message) => {
      console.log('📨 New message received:', message);
      // Dispatch custom event for components to listen to
      window.dispatchEvent(new CustomEvent('socket-new-message', { detail: message }));
    });

    socketInstance.on('user-typing', (data) => {
      console.log('⌨️ User typing:', data);
      window.dispatchEvent(new CustomEvent('socket-user-typing', { detail: data }));
    });

    socketInstance.on('message-reaction', (reaction) => {
      console.log('😀 Message reaction:', reaction);
      window.dispatchEvent(new CustomEvent('socket-message-reaction', { detail: reaction }));
    });

    socketInstance.on('user-joined', (data) => {
      console.log('👋 User joined:', data);
      window.dispatchEvent(new CustomEvent('socket-user-joined', { detail: data }));
    });

    socketInstance.on('user-left', (data) => {
      console.log('👋 User left:', data);
      window.dispatchEvent(new CustomEvent('socket-user-left', { detail: data }));
    });

    socketInstance.on('channel-history', (data) => {
      console.log('📚 Channel history:', data);
      window.dispatchEvent(new CustomEvent('socket-channel-history', { detail: data }));
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [user]);

  const joinCommunity = (communityId: string) => {
    if (socket) {
      socket.emit('join-community', communityId);
    }
  };

  const joinChannel = (communityId: string, channelId: string) => {
    if (socket) {
      socket.emit('join-channel', { communityId, channelId });
    }
  };

  const sendMessage = (communityId: string, channelId: string, content: string) => {
    if (socket && user) {
      socket.emit('send-message', {
        communityId,
        channelId,
        content,
        avatar: user.imageUrl,
      });
    }
  };

  const addReaction = (messageId: string, emoji: string, communityId: string, channelId: string) => {
    if (socket) {
      socket.emit('add-reaction', { messageId, emoji, communityId, channelId });
    }
  };

  const startTyping = (communityId: string, channelId: string) => {
    if (socket) {
      socket.emit('typing-start', { communityId, channelId });
      
      // Clear any existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Auto-stop typing after 3 seconds
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(communityId, channelId);
      }, 3000);
    }
  };

  const stopTyping = (communityId: string, channelId: string) => {
    if (socket) {
      socket.emit('typing-stop', { communityId, channelId });
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    }
  };

  const value: SocketContextType = {
    socket,
    isConnected,
    joinCommunity,
    joinChannel,
    sendMessage,
    addReaction,
    startTyping,
    stopTyping,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}