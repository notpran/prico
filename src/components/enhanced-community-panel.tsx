'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useUserCommunities, usePublicCommunities, useCommunityChannels } from '@/hooks/use-api-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { RealTimeChat } from './real-time-chat';
import { CreateCommunityModal } from './create-community-modal';
import { FriendManagementModal } from './friend-management-modal';
import { 
  Hash, 
  Users, 
  Plus, 
  Search,
  Settings,
  Crown,
  Shield,
  UserPlus,
  Lock,
  Globe,
  Volume2,
  MoreVertical,
  Star,
  Calendar,
  MapPin
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Community {
  _id?: string; // Convex ID
  id: string;   // Fallback ID
  name: string;
  description: string;
  avatar?: string;
  banner?: string;
  memberCount: number;
  isPublic: boolean;
  tags: string[];
  owner?: {
    id: string;
    name: string;
    avatar: string;
  };
  role?: 'owner' | 'admin' | 'moderator' | 'member';
  unreadCount?: number;
  lastActivity?: string;
}

interface Channel {
  id: string;
  name: string;
  description?: string;
  type: 'text' | 'voice' | 'announcement';
  position?: number;
  isPrivate?: boolean;
  isNsfw?: boolean;
  topic?: string;
  communityId?: string;
  createdAt?: string;
  createdBy?: string;
  unreadCount?: number;
  lastMessage?: {
    content: string;
    author: string;
    timestamp: string;
  };
}

interface EnhancedCommunityPanelProps {
  onSelectChannel: (communityId: string, channelId: string, channelName: string) => void;
  selectedCommunity?: string;
  selectedChannel?: string;
}

export function EnhancedCommunityPanel({ 
  onSelectChannel, 
  selectedCommunity, 
  selectedChannel 
}: EnhancedCommunityPanelProps) {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('my-communities');
  const [selectedCommunityData, setSelectedCommunityData] = useState<Community | null>(null);
  const [showCreateCommunity, setShowCreateCommunity] = useState(false);
  const [showJoinCommunity, setShowJoinCommunity] = useState(false);

  // Use real API data
  const { communities: apiUserCommunities, isLoading: loadingUserCommunities } = useUserCommunities();
  const { communities: apiPublicCommunities, isLoading: loadingPublicCommunities } = usePublicCommunities();
  const { channels: apiChannels, isLoading: loadingChannels } = useCommunityChannels(selectedCommunityData?.id || '');

  // Use only real API data - no fallbacks
  const myCommunities = apiUserCommunities || [];
  const publicCommunities = apiPublicCommunities || [];
  const channels = apiChannels || [];

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'voice':
        return Volume2;
      case 'announcement':
        return Hash;
      default:
        return Hash;
    }
  };

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'owner':
        return Crown;
      case 'admin':
        return Shield;
      case 'moderator':
        return Star;
      default:
        return null;
    }
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'owner':
        return 'text-yellow-400';
      case 'admin':
        return 'text-red-400';
      case 'moderator':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  const handleCommunitySelect = (community: Community) => {
    setSelectedCommunityData(community);
    // Auto-select general channel
    const generalChannel = channels.find((c: Channel) => c.name === 'general');
    if (generalChannel) {
      onSelectChannel(community.id, generalChannel.id, generalChannel.name);
    }
  };

  const handleChannelSelect = (channel: Channel) => {
    if (selectedCommunityData) {
      onSelectChannel(selectedCommunityData._id || selectedCommunityData.id, channel.id, channel.name);
    }
  };

  const filteredMyCommunities = myCommunities.filter((community: Community) =>
    community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    community.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredPublicCommunities = publicCommunities.filter((community: Community) =>
    community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    community.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const textChannels = channels.filter((c: Channel) => c.type === 'text' || c.type === 'announcement');
  const voiceChannels = channels.filter((c: Channel) => c.type === 'voice');

  // If a community is selected, show channel view
  if (selectedCommunityData) {
    return (
      <div className="h-full flex">
        {/* Channel Sidebar */}
        <div className="w-60 bg-slate-800/50 border-r border-slate-700 flex flex-col">
          {/* Community Header */}
          <div className="p-4 border-b border-slate-700">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCommunityData(null)}
                className="text-gray-400 hover:text-white"
              >
                ←
              </Button>
              <Avatar className="h-8 w-8">
                <AvatarImage src={selectedCommunityData.avatar} />
                <AvatarFallback>{selectedCommunityData.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold text-white text-sm">{selectedCommunityData.name}</h3>
                <div className="flex items-center space-x-1">
                  {selectedCommunityData.isPublic ? (
                    <Globe className="h-3 w-3 text-green-400" />
                  ) : (
                    <Lock className="h-3 w-3 text-yellow-400" />
                  )}
                  <span className="text-xs text-gray-400">
                    {selectedCommunityData.memberCount} members
                  </span>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Channels */}
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
              {/* Text Channels */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Text Channels
                  </span>
                  <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <div className="space-y-1">
                  {textChannels.map((channel: Channel) => {
                    const Icon = getChannelIcon(channel.type);
                    return (
                      <button
                        key={channel.id}
                        onClick={() => handleChannelSelect(channel)}
                        className={cn(
                          "w-full flex items-center space-x-2 px-2 py-1 rounded hover:bg-slate-700 transition-colors text-left",
                          selectedChannel === channel.id ? "bg-slate-600" : ""
                        )}
                      >
                        <Icon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-300 flex-1">{channel.name}</span>
                        {channel.unreadCount && channel.unreadCount > 0 && (
                          <Badge variant="destructive" className="h-4 w-4 p-0 text-xs">
                            {channel.unreadCount}
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Voice Channels */}
              {voiceChannels.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Voice Channels
                    </span>
                    <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="space-y-1">
                    {voiceChannels.map((channel: Channel) => {
                      const Icon = getChannelIcon(channel.type);
                      return (
                        <button
                          key={channel.id}
                          onClick={() => handleChannelSelect(channel)}
                          className={cn(
                            "w-full flex items-center space-x-2 px-2 py-1 rounded hover:bg-slate-700 transition-colors text-left",
                            selectedChannel === channel.id ? "bg-slate-600" : ""
                          )}
                        >
                          <Icon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-300">{channel.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="flex-1">
          {selectedChannel ? (
            <RealTimeChat
              communityId={selectedCommunityData?._id || selectedCommunityData?.id || ''}
              channelId={selectedChannel}
              channelName={channels.find((c: Channel) => c.id === selectedChannel)?.name || 'Channel'}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              <div className="text-center">
                <Hash className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Select a channel to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-white">Communities</h1>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search communities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-800 border-slate-600 text-white placeholder-gray-400"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2 bg-slate-800">
          <TabsTrigger value="my-communities" className="data-[state=active]:bg-blue-600">
            <Users className="h-4 w-4 mr-2" />
            My Communities
            <Badge variant="outline" className="ml-2 text-xs">
              {myCommunities.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="discover" className="data-[state=active]:bg-blue-600">
            <Globe className="h-4 w-4 mr-2" />
            Discover
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 mt-4">
          <TabsContent value="my-communities" className="h-full">
            <ScrollArea className="h-full">
              <div className="space-y-3">
                {filteredMyCommunities.map((community: Community) => {
                  const RoleIcon = getRoleIcon(community.role);
                  return (
                    <Card
                      key={community.id}
                      className={cn(
                        "cursor-pointer transition-colors border-slate-700 hover:bg-slate-800/50",
                        community.unreadCount && community.unreadCount > 0 && "bg-blue-900/20 border-blue-700"
                      )}
                      onClick={() => handleCommunitySelect(community)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={community.avatar} />
                            <AvatarFallback>{community.name[0]}</AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-white truncate">
                                  {community.name}
                                </span>
                                {RoleIcon && (
                                  <RoleIcon className={cn("h-4 w-4", getRoleColor(community.role))} />
                                )}
                                {community.isPublic ? (
                                  <Globe className="h-3 w-3 text-green-400" />
                                ) : (
                                  <Lock className="h-3 w-3 text-yellow-400" />
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-400">
                                  {community.lastActivity}
                                </span>
                                {community.unreadCount && community.unreadCount > 0 && (
                                  <Badge variant="destructive" className="h-5 w-5 p-0 text-xs">
                                    {community.unreadCount}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            <p className="text-sm text-gray-400 truncate mb-2">
                              {community.description}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex flex-wrap gap-1">
                                {community.tags.slice(0, 2).map((tag: string) => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {community.tags.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{community.tags.length - 2}
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="flex items-center space-x-1 text-xs text-gray-500">
                                <Users className="h-3 w-3" />
                                <span>{community.memberCount}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                
                {filteredMyCommunities.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No communities found</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="discover" className="h-full">
            <ScrollArea className="h-full">
              <div className="space-y-3">
                {filteredPublicCommunities.map((community: Community) => (
                  <Card
                    key={community.id}
                    className="cursor-pointer transition-colors border-slate-700 hover:bg-slate-800/50"
                    onClick={() => handleCommunitySelect(community)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={community.avatar} />
                          <AvatarFallback>{community.name[0]}</AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-white truncate">
                                {community.name}
                              </span>
                              <Globe className="h-3 w-3 text-green-400" />
                            </div>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                              <UserPlus className="h-4 w-4 mr-1" />
                              Join
                            </Button>
                          </div>
                          
                          <p className="text-sm text-gray-400 truncate mb-2">
                            {community.description}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-1">
                              {community.tags.slice(0, 3).map((tag: string) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <Users className="h-3 w-3" />
                              <span>{community.memberCount}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>

      {/* Create/Join Community Buttons */}
      <div className="space-y-2">
        <CreateCommunityModal 
          trigger={
            <Button className="w-full bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Community
            </Button>
          }
          onSuccess={(communityId) => {
            console.log('Community created:', communityId);
            // Refresh communities list here
          }}
        />
        
        <FriendManagementModal 
          trigger={
            <Button variant="outline" className="w-full border-slate-600">
              <UserPlus className="h-4 w-4 mr-2" />
              Manage Friends
            </Button>
          }
        />
        
        <Button variant="outline" className="w-full border-slate-600">
          <Plus className="h-4 w-4 mr-2" />
          Join with Invite Code
        </Button>
      </div>
    </div>
  );
}