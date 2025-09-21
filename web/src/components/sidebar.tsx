import React from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  Home, 
  MessageCircle, 
  Users, 
  Folder, 
  Bell, 
  Settings, 
  LogOut,
  Code,
  Circle,
  Zap
} from 'lucide-react';

interface SidebarProps {
  user: any;
  currentView: string;
  onViewChange: (view: 'home' | 'chats' | 'friends' | 'projects') => void;
  onLogout: () => void;
}

export function Sidebar({ user, currentView, onViewChange, onLogout }: SidebarProps) {
  const menuItems = [
    { id: 'home', icon: Home, label: 'Home', badge: null },
    { id: 'chats', icon: MessageCircle, label: 'Chats', badge: 3 },
    { id: 'friends', icon: Users, label: 'Friends', badge: 2 },
    { id: 'projects', icon: Folder, label: 'Projects', badge: null },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-400';
      case 'busy': return 'text-red-400';
      case 'away': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="w-64 glass-dark border-r border-purple-500/30 flex flex-col" style={{ background: 'rgba(14, 14, 16, 0.9)' }}>
      {/* Header */}
      <div className="p-4 border-b border-purple-500/20">
        <motion.div 
          className="flex items-center space-x-3"
          whileHover={{ scale: 1.05 }}
        >
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
            className="p-2 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-lg neon-glow-purple"
          >
            <Code className="h-6 w-6 text-white" />
          </motion.div>
          <span className="text-xl gradient-text-neon">CodeChat</span>
        </motion.div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-purple-500/20">
        <motion.div 
          className="flex items-center space-x-3"
          whileHover={{ x: 5 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <div className="relative">
            <Avatar className="h-10 w-10 hover-tilt neon-glow-cyan">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-cyan-500 text-white">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Circle 
                className={`absolute -bottom-1 -right-1 h-4 w-4 ${getStatusColor(user.status)} fill-current`}
              />
            </motion.div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white truncate">{user.name}</p>
            <p className="text-sm text-cyan-400 capitalize">{user.status}</p>
          </div>
        </motion.div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant={currentView === item.id ? "secondary" : "ghost"}
              className={`w-full justify-start wobble-hover ${
                currentView === item.id 
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white hover:from-purple-700 hover:to-cyan-700 neon-glow-purple' 
                  : 'text-gray-300 hover:text-cyan-400 hover:bg-purple-500/10'
              }`}
              onClick={() => onViewChange(item.id as any)}
            >
              <motion.div
                animate={currentView === item.id ? { rotate: [0, 360] } : {}}
                transition={{ duration: 0.5 }}
              >
                <item.icon className="h-5 w-5 mr-3" />
              </motion.div>
              {item.label}
              {item.badge && (
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="ml-auto"
                >
                  <Badge variant="secondary" className="bg-gradient-to-r from-pink-500 to-red-500 text-white pulse-glow">
                    {item.badge}
                  </Badge>
                </motion.div>
              )}
            </Button>
          </motion.div>
        ))}
      </nav>

      <Separator className="bg-purple-500/30" />

      {/* Bottom Menu */}
      <div className="p-4 space-y-2">
        <motion.div whileHover={{ x: 5 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-300 hover:text-cyan-400 hover:bg-purple-500/10 wobble-hover"
          >
            <Bell className="h-5 w-5 mr-3" />
            Notifications
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="ml-auto"
            >
              <Badge variant="secondary" className="bg-gradient-to-r from-pink-500 to-red-500 text-white pulse-glow">
                5
              </Badge>
            </motion.div>
          </Button>
        </motion.div>
        
        <motion.div whileHover={{ x: 5 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-300 hover:text-cyan-400 hover:bg-purple-500/10 wobble-hover"
          >
            <Settings className="h-5 w-5 mr-3" />
            Settings
          </Button>
        </motion.div>
        
        <motion.div whileHover={{ x: 5, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant="ghost"
            onClick={onLogout}
            className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10 hover:neon-glow-magenta transition-all"
          >
            <LogOut className="h-5 w-5 mr-3" />
            <span className="flex items-center">
              Logout
              <Zap className="h-4 w-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
            </span>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}