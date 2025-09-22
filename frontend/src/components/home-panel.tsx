import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { 
  MessageCircle, 
  GitPullRequest, 
  Code, 
  Clock,
  ArrowRight,
  Star,
  GitBranch,
  Users
} from 'lucide-react';

interface HomePanelProps {
  user: any;
  onProjectSelect: (project: any) => void;
  onChatSelect: (chat: any) => void;
}

export function HomePanel({ user, onProjectSelect, onChatSelect }: HomePanelProps) {
  const recentChats = [
    {
      id: '1',
      name: 'Sarah Chen',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
      lastMessage: 'Can you review my React component?',
      time: '2 min ago',
      unread: 2
    },
    {
      id: '2',
      name: 'Dev Team',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=team',
      lastMessage: 'New deployment is ready for testing',
      time: '15 min ago',
      unread: 0
    },
    {
      id: '3',
      name: 'Alex Johnson',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
      lastMessage: 'Great work on the API integration!',
      time: '1 hour ago',
      unread: 1
    }
  ];

  const recentProjects = [
    {
      id: '1',
      name: 'E-commerce Platform',
      description: 'Full-stack React + Node.js application',
      techStack: ['React', 'Node.js', 'PostgreSQL'],
      lastCommit: '2 hours ago',
      status: 'In Progress',
      collaborators: 4,
      stars: 12
    },
    {
      id: '2',
      name: 'Chat Application',
      description: 'Real-time messaging app with WebSocket',
      techStack: ['Vue.js', 'Socket.io', 'MongoDB'],
      lastCommit: '1 day ago',
      status: 'Review',
      collaborators: 2,
      stars: 8
    },
    {
      id: '3',
      name: 'AI Dashboard',
      description: 'Analytics dashboard with ML insights',
      techStack: ['Python', 'FastAPI', 'React'],
      lastCommit: '3 days ago',
      status: 'Complete',
      collaborators: 6,
      stars: 23
    }
  ];

  const pendingPullRequests = [
    {
      id: '1',
      title: 'Add user authentication system',
      project: 'E-commerce Platform',
      author: 'Sarah Chen',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
      status: 'Open',
      changes: '+127 -45'
    },
    {
      id: '2',
      title: 'Fix responsive design issues',
      project: 'Chat Application',
      author: 'Alex Johnson',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
      status: 'Review',
      changes: '+23 -12'
    }
  ];

  return (
    <div className="h-full overflow-auto bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Header */}
        <div className="space-y-2">
          <h1 className="text-3xl text-white">Welcome back, {user.name}!</h1>
          <p className="text-gray-400">Here's what's happening with your projects and conversations.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Messages */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg text-white">Recent Messages</CardTitle>
              <MessageCircle className="h-5 w-5 text-indigo-400" />
            </CardHeader>
            <CardContent className="space-y-3">
              {recentChats.map((chat) => (
                <div 
                  key={chat.id} 
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-700 cursor-pointer transition-colors"
                  onClick={() => onChatSelect(chat)}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={chat.avatar} alt={chat.name} />
                    <AvatarFallback className="bg-indigo-600 text-white">
                      {chat.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-white text-sm truncate">{chat.name}</p>
                      <span className="text-xs text-gray-400">{chat.time}</span>
                    </div>
                    <p className="text-sm text-gray-400 truncate">{chat.lastMessage}</p>
                  </div>
                  {chat.unread > 0 && (
                    <Badge variant="secondary" className="bg-red-600 text-white">
                      {chat.unread}
                    </Badge>
                  )}
                </div>
              ))}
              <Button 
                variant="ghost" 
                className="w-full text-indigo-400 hover:text-indigo-300 hover:bg-slate-700"
                onClick={() => onChatSelect(null)}
              >
                View all chats
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Active Projects */}
          <Card className="bg-slate-800 border-slate-700 lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg text-white">Active Projects</CardTitle>
              <Code className="h-5 w-5 text-teal-400" />
            </CardHeader>
            <CardContent className="space-y-4">
              {recentProjects.map((project) => (
                <div 
                  key={project.id}
                  className="p-4 border border-slate-600 rounded-lg hover:border-slate-500 cursor-pointer transition-colors"
                  onClick={() => onProjectSelect(project)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-white mb-1">{project.name}</h3>
                      <p className="text-sm text-gray-400">{project.description}</p>
                    </div>
                    <Badge 
                      variant={project.status === 'Complete' ? 'default' : 'secondary'}
                      className={
                        project.status === 'Complete' 
                          ? 'bg-green-600' 
                          : project.status === 'Review' 
                          ? 'bg-yellow-600' 
                          : 'bg-blue-600'
                      }
                    >
                      {project.status}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {project.techStack.map((tech) => (
                      <Badge key={tech} variant="outline" className="text-xs border-slate-600 text-gray-300">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {project.lastCommit}
                      </span>
                      <span className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {project.collaborators}
                      </span>
                      <span className="flex items-center">
                        <Star className="h-4 w-4 mr-1" />
                        {project.stars}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              <Button 
                variant="ghost" 
                className="w-full text-teal-400 hover:text-teal-300 hover:bg-slate-700"
                onClick={() => onProjectSelect(null)}
              >
                View all projects
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Pull Requests */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg text-white">Pending Pull Requests</CardTitle>
            <GitPullRequest className="h-5 w-5 text-purple-400" />
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingPullRequests.map((pr) => (
              <div 
                key={pr.id}
                className="flex items-center space-x-3 p-3 border border-slate-600 rounded-lg hover:border-slate-500 cursor-pointer transition-colors"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={pr.avatar} alt={pr.author} />
                  <AvatarFallback className="bg-purple-600 text-white text-xs">
                    {pr.author.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-white text-sm">{pr.title}</h4>
                    <Badge 
                      variant={pr.status === 'Open' ? 'default' : 'secondary'}
                      className={pr.status === 'Open' ? 'bg-green-600' : 'bg-yellow-600'}
                    >
                      {pr.status}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-gray-400 mt-1">
                    <span>{pr.project}</span>
                    <span>by {pr.author}</span>
                    <span className="flex items-center">
                      <GitBranch className="h-3 w-3 mr-1" />
                      {pr.changes}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            <Button 
              variant="ghost" 
              className="w-full text-purple-400 hover:text-purple-300 hover:bg-slate-700"
            >
              View all pull requests
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}