import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { RealTimeChat } from './real-time-chat';
import { 
  Hash, 
  Volume2, 
  Settings, 
  UserPlus, 
  Users
} from 'lucide-react';

interface ChatInterfaceProps {
  user: any;
  selectedChat?: any;
}

export function ChatInterface({ user, selectedChat }: ChatInterfaceProps) {
  const [selectedChannel, setSelectedChannel] = useState<any>(null);
  const [members, setMembers] = useState([
    { 
      id: '1', 
      name: 'Alice Johnson', 
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice', 
      status: 'online',
      role: 'Admin'
    },
    { 
      id: '2', 
      name: 'Bob Smith', 
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob', 
      status: 'away',
      role: 'Member'
    },
    { 
      id: '3', 
      name: 'Charlie Brown', 
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=charlie', 
      status: 'offline',
      role: 'Member'
    },
  ]);

  // Mock community data
  const mockCommunity = {
    id: selectedChat?.id || 'demo-community',
    name: selectedChat?.name || 'Demo Community',
    channels: [
      { 
        id: 'general', 
        name: 'general', 
        type: 'text' as const,
        description: 'General discussion'
      },
      { 
        id: 'random', 
        name: 'random', 
        type: 'text' as const,
        description: 'Random conversations'
      },
      { 
        id: 'dev-chat', 
        name: 'dev-chat', 
        type: 'text' as const,
        description: 'Development discussions'
      },
      { 
        id: 'voice-general', 
        name: 'General Voice', 
        type: 'voice' as const,
        description: 'General voice channel'
      },
    ]
  };

  useEffect(() => {
    // Auto-select the first text channel
    if (!selectedChannel && mockCommunity.channels.length > 0) {
      const firstTextChannel = mockCommunity.channels.find(c => c.type === 'text');
      if (firstTextChannel) {
        setSelectedChannel(firstTextChannel);
      }
    }
  }, [selectedChannel, mockCommunity.channels]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="flex h-screen bg-slate-900">
      {/* Channel Sidebar */}
      <div className="w-60 bg-slate-800 border-r border-slate-700 flex flex-col">
        {/* Community Header */}
        <div className="p-4 border-b border-slate-700">
          <h2 className="text-white font-semibold text-lg">{mockCommunity.name}</h2>
          <p className="text-gray-400 text-sm">Welcome to the community!</p>
        </div>

        {/* Channels */}
        <ScrollArea className="flex-1">
          <div className="p-3 space-y-1">
            <div className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-2">
              Text Channels
            </div>
            
            {mockCommunity.channels.filter(c => c.type === 'text').map((channel) => (
              <Button
                key={channel.id}
                variant={selectedChannel?.id === channel.id ? "secondary" : "ghost"}
                className={`w-full justify-start text-left h-8 px-2 ${
                  selectedChannel?.id === channel.id 
                    ? 'bg-slate-600 text-white' 
                    : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                }`}
                onClick={() => setSelectedChannel(channel)}
              >
                <Hash className="w-4 h-4 mr-2" />
                {channel.name}
              </Button>
            ))}

            <div className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-2 mt-4">
              Voice Channels
            </div>
            
            {mockCommunity.channels.filter(c => c.type === 'voice').map((channel) => (
              <Button
                key={channel.id}
                variant="ghost"
                className="w-full justify-start text-left h-8 px-2 text-gray-300 hover:bg-slate-700 hover:text-white"
              >
                <Volume2 className="w-4 h-4 mr-2" />
                {channel.name}
              </Button>
            ))}
          </div>
        </ScrollArea>

        {/* User Panel */}
        <div className="p-3 border-t border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-800 bg-green-500`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{user?.displayName || user?.name}</p>
                <p className="text-gray-400 text-xs">Online</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChannel ? (
          <RealTimeChat
            communityId={mockCommunity.id}
            channelId={selectedChannel.id}
            channelName={selectedChannel.name}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Hash className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Welcome to {mockCommunity.name}</h3>
              <p className="text-gray-400">Select a channel to start chatting</p>
            </div>
          </div>
        )}
      </div>

      {/* Members Sidebar */}
      <div className="w-60 bg-slate-800 border-l border-slate-700">
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold">Members</h3>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <UserPlus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-3 space-y-2">
            {members.map((member) => (
              <div key={member.id} className="flex items-center space-x-3 p-2 rounded hover:bg-slate-700 transition-colors">
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-800 ${getStatusColor(member.status)}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{member.name}</p>
                  <div className="flex items-center space-x-1">
                    <Badge variant="secondary" className="text-xs">
                      {member.role}
                    </Badge>
                    <span className="text-gray-400 text-xs capitalize">{member.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}