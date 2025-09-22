import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { 
  Users, 
  Plus, 
  Circle,
  Code,
  Calendar,
  Clock,
  MessageCircle
} from 'lucide-react';

interface RightSidebarProps {
  user: any;
  currentView: string;
}

export function RightSidebar({ user, currentView }: RightSidebarProps) {
  const activeCollaborators: any[] = [];

  const liveSessions: any[] = [];

  const upcomingEvents: any[] = [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-400';
      case 'away': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'coding': return <Code className="h-4 w-4" />;
      case 'review': return <MessageCircle className="h-4 w-4" />;
      case 'meeting': return <Users className="h-4 w-4" />;
      default: return <Circle className="h-4 w-4" />;
    }
  };

  return (
    <div className="w-80 bg-slate-800 border-l border-slate-700 p-4 space-y-6 overflow-y-auto">
      {/* Active Collaborators */}
      <Card className="bg-slate-700 border-slate-600">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-sm">Active Collaborators</CardTitle>
            <Circle className="h-3 w-3 text-green-400 fill-current" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {activeCollaborators.map((collaborator) => (
            <div key={collaborator.id} className="flex items-center space-x-3">
              <div className="relative">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={collaborator.avatar} alt={collaborator.name} />
                  <AvatarFallback className="bg-indigo-600 text-white text-xs">
                    {collaborator.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <Circle 
                  className={`absolute -bottom-1 -right-1 h-3 w-3 ${getStatusColor(collaborator.status)} fill-current`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm truncate">{collaborator.name}</p>
                <p className="text-xs text-gray-400 truncate">{collaborator.activity}</p>
                <p className="text-xs text-gray-500 truncate">{collaborator.project}</p>
              </div>
            </div>
          ))}
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-indigo-400 hover:text-indigo-300 hover:bg-slate-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Invite Collaborator
          </Button>
        </CardContent>
      </Card>

      {/* Live Coding Sessions */}
      {currentView === 'projects' && (
        <Card className="bg-slate-700 border-slate-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-sm">Live Sessions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {liveSessions.map((session) => (
              <div key={session.id} className="p-3 bg-slate-600 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getSessionTypeIcon(session.type)}
                    <span className="text-white text-sm">{session.name}</span>
                  </div>
                  <Badge variant="secondary" className="bg-green-600 text-white text-xs">
                    LIVE
                  </Badge>
                </div>
                <div className="text-xs text-gray-400 space-y-1">
                  <p>{session.project}</p>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {session.participants} participants
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {session.duration}
                    </span>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Join Session
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="bg-slate-700 border-slate-600">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-sm">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start text-gray-300 hover:text-white hover:bg-slate-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start text-gray-300 hover:text-white hover:bg-slate-600"
          >
            <Users className="h-4 w-4 mr-2" />
            Create Team
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start text-gray-300 hover:text-white hover:bg-slate-600"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Start Chat
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start text-gray-300 hover:text-white hover:bg-slate-600"
          >
            <Code className="h-4 w-4 mr-2" />
            Live Coding
          </Button>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card className="bg-slate-700 border-slate-600">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-sm">Today's Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcomingEvents.map((event) => (
            <div key={event.id} className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                  {getSessionTypeIcon(event.type)}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm">{event.title}</p>
                <div className="flex items-center space-x-2 text-xs text-gray-400">
                  <span className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {event.time}
                  </span>
                  <span className="flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    {event.participants}
                  </span>
                </div>
              </div>
            </div>
          ))}
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-indigo-400 hover:text-indigo-300 hover:bg-slate-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Schedule Meeting
          </Button>
        </CardContent>
      </Card>

      {/* Project Stats */}
      {currentView === 'projects' && (
        <Card className="bg-slate-700 border-slate-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-sm">Project Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Active Projects</span>
              <span className="text-white">3</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Open Pull Requests</span>
              <span className="text-white">7</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Code Reviews</span>
              <span className="text-white">2</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Team Members</span>
              <span className="text-white">12</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}