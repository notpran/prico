import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { 
  Hash, 
  Volume2, 
  Lock, 
  Users, 
  Plus, 
  Search,
  Settings,
  Crown,
  Shield,
  ShieldCheck,
  User,
  MessageSquare,
  Calendar,
  Globe,
  Eye,
  Hash as HashIcon,
  Mic
} from 'lucide-react';

interface Community {
  _id: string;
  name: string;
  description: string;
  slug: string;
  iconUrl?: string;
  bannerUrl?: string;
  memberCount: number;
  isPublic: boolean;
  tags: string[];
  membershipRole?: string;
  unreadCount?: number;
}

interface Channel {
  _id: string;
  name: string;
  description?: string;
  type: 'text' | 'voice' | 'announcement' | 'thread';
  isPrivate: boolean;
  messageCount: number;
  lastMessageAt?: number;
}

interface CommunityPanelProps {
  onSelectChannel: (communityId: string, channelId: string, channel: Channel) => void;
  selectedCommunity?: string;
  selectedChannel?: string;
}

export function CommunityPanel({ onSelectChannel, selectedCommunity, selectedChannel }: CommunityPanelProps) {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('my-communities');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCommunityDetails, setSelectedCommunityDetails] = useState<Community | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newCommunity, setNewCommunity] = useState({
    name: '',
    description: '',
    slug: '',
    isPublic: true,
    tags: ''
  });

  // Mock data for development
  const userCommunities: Community[] = [
    {
      _id: 'comm1',
      name: 'React Developers',
      description: 'A community for React developers to share knowledge and collaborate',
      slug: 'react-developers',
      iconUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=react',
      memberCount: 1247,
      isPublic: true,
      tags: ['react', 'javascript', 'frontend'],
      membershipRole: 'admin',
      unreadCount: 3
    },
    {
      _id: 'comm2',
      name: 'TypeScript Masters',
      description: 'Advanced TypeScript patterns and best practices',
      slug: 'typescript-masters',
      iconUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=typescript',
      memberCount: 892,
      isPublic: true,
      tags: ['typescript', 'javascript', 'types'],
      membershipRole: 'member',
      unreadCount: 0
    },
    {
      _id: 'comm3',
      name: 'Private Team',
      description: 'Our internal development team workspace',
      slug: 'private-team',
      iconUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=team',
      memberCount: 12,
      isPublic: false,
      tags: ['private', 'team', 'work'],
      membershipRole: 'owner',
      unreadCount: 1
    }
  ];

  const publicCommunities: Community[] = [
    {
      _id: 'comm4',
      name: 'Open Source Hub',
      description: 'Collaborate on open source projects and find contributors',
      slug: 'open-source-hub',
      iconUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=opensource',
      memberCount: 3456,
      isPublic: true,
      tags: ['opensource', 'collaboration', 'projects']
    },
    {
      _id: 'comm5',
      name: 'Design System',
      description: 'Design systems, UI/UX patterns, and component libraries',
      slug: 'design-system',
      iconUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=design',
      memberCount: 2134,
      isPublic: true,
      tags: ['design', 'ui', 'ux', 'components']
    }
  ];

  const mockChannels: { [key: string]: Channel[] } = {
    'comm1': [
      {
        _id: 'ch1',
        name: 'general',
        description: 'General discussion about React',
        type: 'text',
        isPrivate: false,
        messageCount: 1234,
        lastMessageAt: Date.now() - 300000
      },
      {
        _id: 'ch2',
        name: 'help',
        description: 'Get help with React problems',
        type: 'text',
        isPrivate: false,
        messageCount: 567,
        lastMessageAt: Date.now() - 1800000
      },
      {
        _id: 'ch3',
        name: 'announcements',
        description: 'Important announcements',
        type: 'announcement',
        isPrivate: false,
        messageCount: 23,
        lastMessageAt: Date.now() - 86400000
      },
      {
        _id: 'ch4',
        name: 'voice-chat',
        description: 'Voice discussions',
        type: 'voice',
        isPrivate: false,
        messageCount: 0
      }
    ]
  };

  const handleCreateCommunity = () => {
    console.log('Creating community:', newCommunity);
    // Will implement with Convex mutation
    setShowCreateDialog(false);
    setNewCommunity({ name: '', description: '', slug: '', isPublic: true, tags: '' });
  };

  const handleJoinCommunity = (communityId: string) => {
    console.log('Joining community:', communityId);
    // Will implement with Convex mutation
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="w-3 h-3 text-yellow-400" />;
      case 'admin': return <Shield className="w-3 h-3 text-red-400" />;
      case 'moderator': return <ShieldCheck className="w-3 h-3 text-blue-400" />;
      default: return <User className="w-3 h-3 text-gray-400" />;
    }
  };

  const getChannelIcon = (type: string, isPrivate: boolean) => {
    if (isPrivate) return <Lock className="w-4 h-4" />;
    
    switch (type) {
      case 'voice': return <Volume2 className="w-4 h-4" />;
      case 'announcement': return <MessageSquare className="w-4 h-4" />;
      default: return <Hash className="w-4 h-4" />;
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  const currentCommunity = userCommunities.find(c => c._id === selectedCommunity);
  const currentChannels = selectedCommunity ? mockChannels[selectedCommunity] || [] : [];

  return (
    <div className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold text-lg">Communities</h2>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                <Plus className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700 text-white">
              <DialogHeader>
                <DialogTitle>Create Community</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Community Name</Label>
                  <Input
                    value={newCommunity.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setNewCommunity(prev => ({
                        ...prev,
                        name,
                        slug: generateSlug(name)
                      }));
                    }}
                    placeholder="Enter community name"
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
                <div>
                  <Label>Slug</Label>
                  <Input
                    value={newCommunity.slug}
                    onChange={(e) => setNewCommunity(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="community-slug"
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newCommunity.description}
                    onChange={(e) => setNewCommunity(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your community"
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
                <div>
                  <Label>Tags (comma separated)</Label>
                  <Input
                    value={newCommunity.tags}
                    onChange={(e) => setNewCommunity(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="react, javascript, frontend"
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={newCommunity.isPublic}
                    onChange={(e) => setNewCommunity(prev => ({ ...prev, isPublic: e.target.checked }))}
                  />
                  <Label htmlFor="isPublic">Public community</Label>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleCreateCommunity} className="flex-1">
                    Create Community
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search communities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-gray-400"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        {!selectedCommunity ? (
          // Community browser
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2 bg-slate-700 mx-4 mt-2">
              <TabsTrigger value="my-communities" className="text-white data-[state=active]:bg-slate-600">
                My Communities
              </TabsTrigger>
              <TabsTrigger value="discover" className="text-white data-[state=active]:bg-slate-600">
                Discover
              </TabsTrigger>
            </TabsList>

            <TabsContent value="my-communities" className="flex-1 m-0">
              <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                  {userCommunities
                    .filter(community => 
                      !searchQuery || 
                      community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      community.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
                    )
                    .map((community) => (
                    <Button
                      key={community._id}
                      variant="ghost"
                      className="w-full justify-start text-left h-auto p-3 hover:bg-slate-700"
                      onClick={() => setSelectedCommunityDetails(community)}
                    >
                      <div className="flex items-center space-x-3 w-full">
                        <div className="relative">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={community.iconUrl} />
                            <AvatarFallback>{community.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          {community.unreadCount! > 0 && (
                            <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs h-5 w-5 p-0 flex items-center justify-center">
                              {community.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="text-white text-sm font-medium truncate">{community.name}</p>
                            {getRoleIcon(community.membershipRole!)}
                            {!community.isPublic && <Lock className="w-3 h-3 text-gray-400" />}
                          </div>
                          <p className="text-gray-400 text-xs truncate">{community.description}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-gray-500 text-xs flex items-center">
                              <Users className="w-3 h-3 mr-1" />
                              {community.memberCount.toLocaleString()}
                            </span>
                            <div className="flex space-x-1">
                              {community.tags.slice(0, 2).map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs h-4 px-1">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Button>
                  ))}
                  
                  {userCommunities.length === 0 && (
                    <div className="text-center text-gray-400 py-12">
                      <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
                      <p className="text-lg font-medium mb-2">No communities yet</p>
                      <p className="text-sm">Join or create your first community!</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="discover" className="flex-1 m-0">
              <ScrollArea className="flex-1">
                <div className="p-2 space-y-2">
                  {publicCommunities
                    .filter(community => 
                      !searchQuery || 
                      community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      community.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      community.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
                    )
                    .map((community) => (
                    <Card key={community._id} className="bg-slate-700 border-slate-600">
                      <CardHeader className="pb-2">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={community.iconUrl} />
                            <AvatarFallback>{community.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <CardTitle className="text-white text-sm">{community.name}</CardTitle>
                            <div className="flex items-center space-x-2 text-xs text-gray-400">
                              <Globe className="w-3 h-3" />
                              <span>{community.memberCount.toLocaleString()} members</span>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-gray-300 text-sm mb-3">{community.description}</p>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {community.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs h-5">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleJoinCommunity(community._id)}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                          Join Community
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        ) : (
          // Community channels view
          <div className="flex-1 flex flex-col">
            {/* Community header */}
            <div className="p-4 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedCommunityDetails(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    ← Back
                  </Button>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={currentCommunity?.iconUrl} />
                    <AvatarFallback>{currentCommunity?.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-white font-medium text-sm">{currentCommunity?.name}</h3>
                    <p className="text-gray-400 text-xs">{currentCommunity?.memberCount} members</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Channels */}
            <ScrollArea className="flex-1">
              <div className="p-2">
                <div className="mb-4">
                  <h4 className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-2 px-2">
                    Text Channels
                  </h4>
                  <div className="space-y-1">
                    {currentChannels
                      .filter(channel => channel.type === 'text' || channel.type === 'announcement')
                      .map((channel) => (
                      <Button
                        key={channel._id}
                        variant={selectedChannel === channel._id ? "secondary" : "ghost"}
                        className={`w-full justify-start text-left h-8 px-2 ${
                          selectedChannel === channel._id 
                            ? 'bg-slate-600 text-white' 
                            : 'text-gray-400 hover:text-white hover:bg-slate-700'
                        }`}
                        onClick={() => onSelectChannel(selectedCommunity, channel._id, channel)}
                      >
                        <div className="flex items-center space-x-2">
                          {getChannelIcon(channel.type, channel.isPrivate)}
                          <span className="text-sm">{channel.name}</span>
                          {channel.lastMessageAt && (
                            <span className="text-xs text-gray-500 ml-auto">
                              {formatTime(channel.lastMessageAt)}
                            </span>
                          )}
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-2 px-2">
                    Voice Channels
                  </h4>
                  <div className="space-y-1">
                    {currentChannels
                      .filter(channel => channel.type === 'voice')
                      .map((channel) => (
                      <Button
                        key={channel._id}
                        variant="ghost"
                        className="w-full justify-start text-left h-8 px-2 text-gray-400 hover:text-white hover:bg-slate-700"
                        onClick={() => onSelectChannel(selectedCommunity, channel._id, channel)}
                      >
                        <div className="flex items-center space-x-2">
                          {getChannelIcon(channel.type, channel.isPrivate)}
                          <span className="text-sm">{channel.name}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
}