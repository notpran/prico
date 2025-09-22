import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Search, 
  UserPlus, 
  MessageCircle, 
  MoreVertical,
  Circle,
  Users,
  Clock
} from 'lucide-react';

interface FriendsPanelProps {
  user: any;
}

export function FriendsPanel({ user }: FriendsPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const friends: any[] = [];

  const friendRequests: any[] = [];

    const suggestions: any[] = [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-400';
      case 'away': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full overflow-auto bg-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl text-white">Friends</h1>
            <p className="text-gray-400">Manage your connections and discover new collaborators</p>
          </div>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Friend
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search friends..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-800 border-slate-600 text-white placeholder:text-gray-400"
          />
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800 max-w-md">
            <TabsTrigger value="all" className="text-white data-[state=active]:bg-indigo-600">
              All Friends ({friends.length})
            </TabsTrigger>
            <TabsTrigger value="requests" className="text-white data-[state=active]:bg-indigo-600">
              Requests ({friendRequests.length})
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="text-white data-[state=active]:bg-indigo-600">
              Suggestions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFriends.map((friend) => (
                <Card key={friend.id} className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={friend.avatar} alt={friend.name} />
                            <AvatarFallback className="bg-indigo-600 text-white">
                              {friend.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <Circle 
                            className={`absolute -bottom-1 -right-1 h-4 w-4 ${getStatusColor(friend.status)} fill-current`}
                          />
                        </div>
                        <div>
                          <h3 className="text-white">{friend.name}</h3>
                          <p className="text-sm text-gray-400">{friend.username}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>

                    <p className="text-sm text-gray-300 mb-3 line-clamp-2">{friend.activity}</p>

                    <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                      <span className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {friend.mutualFriends} mutual friends
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {friend.lastSeen}
                      </span>
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                      >
                        <MessageCircle className="h-3 w-3 mr-1" />
                        Message
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-slate-600 text-gray-300 hover:bg-slate-700"
                      >
                        Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="requests" className="space-y-4 mt-6">
            <div className="space-y-4">
              {friendRequests.map((request) => (
                <Card key={request.id} className="bg-slate-800 border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={request.avatar} alt={request.name} />
                          <AvatarFallback className="bg-indigo-600 text-white">
                            {request.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-white">{request.name}</h3>
                          <p className="text-sm text-gray-400">{request.username}</p>
                          <p className="text-xs text-gray-500">
                            {request.mutualFriends} mutual friends • {request.requestDate}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                          Accept
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-slate-600 text-gray-300 hover:bg-slate-700"
                        >
                          Decline
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="suggestions" className="space-y-4 mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {suggestions.map((suggestion) => (
                <Card key={suggestion.id} className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={suggestion.avatar} alt={suggestion.name} />
                        <AvatarFallback className="bg-indigo-600 text-white">
                          {suggestion.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-white">{suggestion.name}</h3>
                        <p className="text-sm text-gray-400">{suggestion.username}</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <p className="text-xs text-gray-400">
                        <Users className="h-3 w-3 inline mr-1" />
                        {suggestion.mutualFriends} mutual friends
                      </p>
                      <p className="text-xs text-gray-500">{suggestion.reason}</p>
                    </div>

                    <Button 
                      size="sm" 
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      <UserPlus className="h-3 w-3 mr-1" />
                      Add Friend
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}