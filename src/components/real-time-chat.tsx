'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/lib/socket-context';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Send, 
  Smile, 
  Hash, 
  Users, 
  MoreVertical,
  Reply,
  Heart,
  ThumbsUp,
  Laugh,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  userId: string;
  userName: string;
  timestamp: string;
  avatar?: string;
  reactions?: Reaction[];
  replies?: Message[];
}

interface Reaction {
  messageId: string;
  emoji: string;
  userId: string;
  userName: string;
  timestamp: string;
}

interface TypingUser {
  userId: string;
  userName: string;
  isTyping: boolean;
}

interface RealTimeChatProps {
  communityId?: string;
  channelId?: string;
  channelName?: string;
  isDM?: boolean;
  recipientId?: string;
  recipientName?: string;
}

export function RealTimeChat({ 
  communityId = 'demo-community',
  channelId = 'general', 
  channelName = 'general',
  isDM = false,
  recipientId,
  recipientName 
}: RealTimeChatProps) {
  const { user } = useUser();
  const { socket, isConnected, joinChannel, sendMessage, addReaction, startTyping, stopTyping } = useSocket();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Join channel when component mounts
  useEffect(() => {
    if (isConnected && !isDM) {
      joinChannel(communityId, channelId);
    }
  }, [isConnected, communityId, channelId, isDM, joinChannel]);

  // Listen for real-time events
  useEffect(() => {
    const handleNewMessage = (event: any) => {
      const message: Message = event.detail;
      setMessages(prev => [...prev, message]);
    };

    const handleUserTyping = (event: any) => {
      const data: TypingUser = event.detail;
      
      if (data.userId === user?.id) return; // Don't show own typing
      
      setTypingUsers(prev => {
        const filtered = prev.filter(u => u.userId !== data.userId);
        if (data.isTyping) {
          return [...filtered, data];
        }
        return filtered;
      });
    };

    const handleMessageReaction = (event: any) => {
      const reaction: Reaction = event.detail;
      setMessages(prev => prev.map(msg => {
        if (msg.id === reaction.messageId) {
          const reactions = msg.reactions || [];
          const existingReaction = reactions.find(r => r.userId === reaction.userId && r.emoji === reaction.emoji);
          
          if (existingReaction) {
            // Remove reaction if it already exists
            return {
              ...msg,
              reactions: reactions.filter(r => !(r.userId === reaction.userId && r.emoji === reaction.emoji))
            };
          } else {
            // Add new reaction
            return {
              ...msg,
              reactions: [...reactions, reaction]
            };
          }
        }
        return msg;
      }));
    };

    const handleChannelHistory = (event: any) => {
      const { channelId: historyChannelId, messages: historyMessages } = event.detail;
      if (historyChannelId === channelId) {
        setMessages(historyMessages);
      }
    };

    window.addEventListener('socket-new-message', handleNewMessage);
    window.addEventListener('socket-user-typing', handleUserTyping);
    window.addEventListener('socket-message-reaction', handleMessageReaction);
    window.addEventListener('socket-channel-history', handleChannelHistory);

    return () => {
      window.removeEventListener('socket-new-message', handleNewMessage);
      window.removeEventListener('socket-user-typing', handleUserTyping);
      window.removeEventListener('socket-message-reaction', handleMessageReaction);
      window.removeEventListener('socket-channel-history', handleChannelHistory);
    };
  }, [user?.id, channelId]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !user) return;

    sendMessage(communityId, channelId, newMessage.trim());
    setNewMessage('');
    setIsTyping(false);
    stopTyping(communityId, channelId);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    if (!isTyping && e.target.value.length > 0) {
      setIsTyping(true);
      startTyping(communityId, channelId);
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Stop typing after 1 second of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      stopTyping(communityId, channelId);
    }, 1000);
  };

  const handleReaction = (messageId: string, emoji: string) => {
    addReaction(messageId, emoji, communityId, channelId);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const quickReactions = ['👍', '❤️', '😂', '😮', '😢', '😡'];

  return (
    <Card className="h-full flex flex-col bg-slate-900/50 border-slate-700">
      {/* Header */}
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isDM ? (
              <>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${recipientId}`} />
                  <AvatarFallback>{recipientName?.[0]}</AvatarFallback>
                </Avatar>
                <span className="text-white">{recipientName}</span>
              </>
            ) : (
              <>
                <Hash className="h-6 w-6 text-blue-400" />
                <span className="text-white">{channelName}</span>
              </>
            )}
            <div className="flex items-center space-x-2">
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs",
                  isConnected 
                    ? "border-green-500 text-green-400" 
                    : "border-red-500 text-red-400"
                )}
              >
                <Activity className="h-3 w-3 mr-1" />
                {isConnected ? 'Connected' : 'Connecting...'}
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>

      <Separator className="bg-slate-700" />

      {/* Messages */}
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full px-4">
          <div className="space-y-4 py-4">
            {messages.map((message) => (
              <div key={message.id} className="group relative">
                <div className="flex items-start space-x-3">
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarImage src={message.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.userId}`} />
                    <AvatarFallback>{message.userName[0]}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold text-white text-sm">
                        {message.userName}
                      </span>
                      <span className="text-gray-400 text-xs">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                    
                    <div className="text-gray-300 text-sm whitespace-pre-wrap">
                      {message.content}
                    </div>
                    
                    {/* Reactions */}
                    {message.reactions && message.reactions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {Object.entries(
                          message.reactions.reduce((acc, reaction) => {
                            if (!acc[reaction.emoji]) {
                              acc[reaction.emoji] = [];
                            }
                            acc[reaction.emoji].push(reaction);
                            return acc;
                          }, {} as Record<string, Reaction[]>)
                        ).map(([emoji, reactions]) => (
                          <Button
                            key={emoji}
                            variant="outline"
                            size="sm"
                            className="h-6 px-2 text-xs bg-slate-800 border-slate-600 hover:bg-slate-700"
                            onClick={() => handleReaction(message.id, emoji)}
                          >
                            {emoji} {reactions.length}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Quick reactions on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex space-x-1">
                      {quickReactions.map((emoji) => (
                        <Button
                          key={emoji}
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:bg-slate-700"
                          onClick={() => handleReaction(message.id, emoji)}
                        >
                          {emoji}
                        </Button>
                      ))}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-slate-700"
                      >
                        <Reply className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Typing indicators */}
            {typingUsers.length > 0 && (
              <div className="flex items-center space-x-2 text-gray-400 text-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-75" />
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-150" />
                </div>
                <span>
                  {typingUsers.length === 1
                    ? `${typingUsers[0].userName} is typing...`
                    : `${typingUsers.length} people are typing...`
                  }
                </span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>

      <Separator className="bg-slate-700" />

      {/* Message input */}
      <div className="p-4">
        <div className="flex items-center space-x-2">
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={isDM ? `Message ${recipientName}...` : `Message #${channelName}...`}
            className="flex-1 bg-slate-800 border-slate-600 focus:border-blue-500 text-white placeholder-gray-400"
            disabled={!isConnected}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || !isConnected}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}