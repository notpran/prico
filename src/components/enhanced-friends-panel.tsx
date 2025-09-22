import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent } from './ui/card';
import { 
  Users, 
  UserPlus, 
  MessageCircle, 
  Search,
  Check,
  X,
  Clock,
  Settings,
  Phone,
  Video
} from 'lucide-react';

interface EnhancedFriendsPanelProps {
  onSelectDM: (conversationId: string, otherUser: any) => void;
  selectedConversation?: string;
}

export function EnhancedFriendsPanel({ onSelectDM, selectedConversation }: EnhancedFriendsPanelProps) {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('dms');

  // Mock data for development - will be replaced with Convex queries
  const friends = [
    {
      _id: '1',
      displayName: 'Alice Johnson',
      username: 'alice',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
      status: 'online',
      customStatus: 'Building something amazing! 🚀',
      mutualFriends: 5
    },
    {
      _id: '2',
      displayName: 'Bob Smith',
      username: 'bob',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
      status: 'away',
      customStatus: 'In a coding session',
      mutualFriends: 3
    },
    {
      _id: '3',
      displayName: 'Charlie Brown',
      username: 'charlie',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=charlie',
      status: 'offline',
      customStatus: null,
      mutualFriends: 8
    }
  ];

  const directMessageConversations = [
    {
      _id: 'dm1',
      otherUser: friends[0],
      lastMessage: {
        content: 'Hey! Want to collaborate on this new project?',
        createdAt: Date.now() - 300000,
        senderId: '1'
      },
      lastMessageAt: Date.now() - 300000,
      unreadCount: 2
    },
    {
      _id: 'dm2',
      otherUser: friends[1],
      lastMessage: {
        content: 'The code review looks good, let\'s merge it!',
        createdAt: Date.now() - 3600000,
        senderId: '2'
      },
      lastMessageAt: Date.now() - 3600000,
      unreadCount: 0
    }
  ];

  const pendingRequests = [
    {
      _id: 'req1',
      requester: {
        _id: '4',
        displayName: 'Diana Prince',
        username: 'diana',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=diana'
      },
      createdAt: Date.now() - 7200000
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    return date.toLocaleDateString();
  };

  const handleStartDM = (conversationId: string, otherUser: any) => {
    onSelectDM(conversationId, otherUser);
  };

  const handleAcceptRequest = (requestId: string) => {
    console.log('Accepting friend request:', requestId);
    // Will implement with Convex mutation
  };

  const handleDeclineRequest = (requestId: string) => {
    console.log('Declining friend request:', requestId);
    // Will implement with Convex mutation
  };

  const onlineCount = friends.filter(f => f.status === 'online').length;

  return (
    <div className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold text-lg">Friends</h2>
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search friends..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-gray-400"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 bg-slate-700 mx-4 mt-2">
          <TabsTrigger value="dms" className="text-white data-[state=active]:bg-slate-600">
            <MessageCircle className="w-4 h-4 mr-1" />
            Messages
          </TabsTrigger>
          <TabsTrigger value="friends" className="text-white data-[state=active]:bg-slate-600">
            <Users className="w-4 h-4 mr-1" />
            All
          </TabsTrigger>
          <TabsTrigger value="requests" className="text-white data-[state=active]:bg-slate-600 relative">
            <Clock className="w-4 h-4 mr-1" />
            Pending
            {pendingRequests.length > 0 && (
              <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs h-5 w-5 p-0 flex items-center justify-center">
                {pendingRequests.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* DMs Tab */}
        <TabsContent value="dms" className="flex-1 m-0">
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {directMessageConversations
                .filter(conv => 
                  !searchQuery || 
                  conv.otherUser.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  conv.otherUser.username.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((conversation) => (
                <Button
                  key={conversation._id}
                  variant={selectedConversation === conversation._id ? "secondary" : "ghost"}
                  className={`w-full justify-start text-left h-auto p-3 ${
                    selectedConversation === conversation._id 
                      ? 'bg-slate-600' 
                      : 'hover:bg-slate-700'
                  }`}
                  onClick={() => handleStartDM(conversation._id, conversation.otherUser)}
                >
                  <div className="flex items-center space-x-3 w-full">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={conversation.otherUser.avatarUrl} />
                        <AvatarFallback>
                          {conversation.otherUser.displayName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-800 ${getStatusColor(conversation.otherUser.status)}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-white text-sm font-medium truncate">
                          {conversation.otherUser.displayName}
                        </p>
                        <div className="flex items-center space-x-2">
                          {conversation.lastMessageAt && (
                            <span className="text-gray-400 text-xs">
                              {formatTime(conversation.lastMessageAt)}
                            </span>
                          )}
                          {conversation.unreadCount > 0 && (
                            <Badge className="bg-blue-500 text-white text-xs h-5 w-5 p-0 flex items-center justify-center">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {conversation.lastMessage && (
                        <p className="text-gray-400 text-xs truncate">
                          {conversation.lastMessage.content}
                        </p>
                      )}
                      {conversation.otherUser.customStatus && (
                        <p className="text-gray-500 text-xs truncate italic">
                          {conversation.otherUser.customStatus}
                        </p>
                      )}
                    </div>
                  </div>
                </Button>
              ))}
              
              {directMessageConversations.length === 0 && (
                <div className="text-center text-gray-400 py-12">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium mb-2">No conversations yet</p>
                  <p className="text-sm">Start a chat with your friends!</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Friends Tab */}
        <TabsContent value="friends" className="flex-1 m-0">
          <div className="p-4 border-b border-slate-700">
            <p className="text-gray-400 text-sm">
              {onlineCount} of {friends.length} friends online
            </p>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {friends
                .filter(friend => 
                  !searchQuery || 
                  friend.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  friend.username.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .sort((a, b) => {
                  // Sort online friends first
                  if (a.status === 'online' && b.status !== 'online') return -1;
                  if (b.status === 'online' && a.status !== 'online') return 1;
                  return a.displayName.localeCompare(b.displayName);
                })
                .map((friend) => (
                <div key={friend._id} className="flex items-center justify-between p-3 hover:bg-slate-700 rounded group">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={friend.avatarUrl} />
                        <AvatarFallback>{friend.displayName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-800 ${getStatusColor(friend.status)}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{friend.displayName}</p>
                      <p className="text-gray-400 text-xs">@{friend.username}</p>
                      {friend.customStatus && (
                        <p className="text-gray-500 text-xs truncate italic">{friend.customStatus}</p>
                      )}
                      {friend.mutualFriends > 0 && (
                        <p className="text-gray-500 text-xs">{friend.mutualFriends} mutual friends</p>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleStartDM(`dm-${friend._id}`, friend)}
                      className="text-gray-400 hover:text-white h-8 w-8 p-0"
                      title="Send message"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-gray-400 hover:text-white h-8 w-8 p-0"
                      title="Voice call"
                    >
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-gray-400 hover:text-white h-8 w-8 p-0"
                      title="Video call"
                    >
                      <Video className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {friends.length === 0 && (
                <div className="text-center text-gray-400 py-12">
                  <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium mb-2">No friends yet</p>
                  <p className="text-sm">Search for users to add as friends!</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Pending Requests Tab */}
        <TabsContent value="requests" className="flex-1 m-0">
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-2">
              {pendingRequests.map((request) => (
                <Card key={request._id} className="bg-slate-700 border-slate-600">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={request.requester.avatarUrl} />
                          <AvatarFallback>{request.requester.displayName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-white text-sm font-medium">{request.requester.displayName}</p>
                          <p className="text-gray-400 text-xs">@{request.requester.username}</p>
                          <p className="text-gray-500 text-xs">{formatTime(request.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleAcceptRequest(request._id)}
                          className="bg-green-600 hover:bg-green-700 h-8"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeclineRequest(request._id)}
                          className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white h-8"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Decline
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {pendingRequests.length === 0 && (
                <div className="text-center text-gray-400 py-12">
                  <Clock className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium mb-2">No pending requests</p>
                  <p className="text-sm">All caught up!</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}