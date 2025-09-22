import React from 'react';
import { motion } from 'framer-motion';
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
  Zap,
  Search,
  Command,
  Hash,
  Globe
} from 'lucide-react';

interface EnhancedTopNavProps {
  user: any;
  currentView: string;
  onViewChange: (view: 'home' | 'friends' | 'communities' | 'projects' | 'settings') => void;
  onLogout: () => void;
}

export function EnhancedTopNav({ user, currentView, onViewChange, onLogout }: EnhancedTopNavProps) {
  const menuItems = [
    { id: 'home', icon: Home, label: 'Home', badge: null },
    { id: 'friends', icon: MessageCircle, label: 'Friends & DMs', badge: 3 },
    { id: 'communities', icon: Hash, label: 'Communities', badge: 5 },
    { id: 'projects', icon: Folder, label: 'Projects', badge: null },
    { id: 'settings', icon: Settings, label: 'Settings', badge: null },
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
    <div className="h-16 glass-ultra border-b border-blue-500/30 flex items-center px-6 gpu-accelerated">
      <div className="flex items-center justify-between w-full">
        {/* Left Side - Logo and Navigation */}
        <div className="flex items-center space-x-8">
          {/* Logo */}
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
          >
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg neon-glow-blue"
            >
              <Code className="h-6 w-6 text-white" />
            </motion.div>
            <span className="text-2xl gradient-text-electric font-orbitron font-bold">Prico</span>
          </motion.div>

          <Separator orientation="vertical" className="h-8 bg-blue-500/30" />

          {/* Navigation Menu */}
          <nav className="flex items-center space-x-2">
            {menuItems.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant={currentView === item.id ? "secondary" : "ghost"}
                  className={`relative ultra-smooth font-inter ${
                    currentView === item.id 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-500 hover:to-blue-600 neon-glow-blue' 
                      : 'text-blue-200 hover:text-white hover:bg-blue-500/20'
                  }`}
                  onClick={() => onViewChange(item.id as any)}
                >
                  <motion.div
                    animate={currentView === item.id ? { rotate: [0, 360] } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                  </motion.div>
                  {item.label}
                  {item.badge && (
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="ml-2"
                    >
                      <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white pulse-glow text-xs">
                        {item.badge}
                      </Badge>
                    </motion.div>
                  )}
                </Button>
              </motion.div>
            ))}
          </nav>
        </div>

        {/* Center - Search */}
        <div className="flex-1 max-w-md mx-8">
          <motion.div 
            className="relative"
            whileHover={{ scale: 1.02 }}
          >
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-400" />
            <input
              type="text"
              placeholder="Search projects, communities, friends..."
              className="w-full pl-10 pr-4 py-2 glass-dark border border-blue-500/30 rounded-lg text-blue-100 placeholder:text-blue-400 outline-none focus:border-blue-400 ultra-smooth font-inter text-sm"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
              <Command className="h-3 w-3 text-blue-400" />
              <span className="text-xs text-blue-400 font-mono">K</span>
            </div>
          </motion.div>
        </div>

        {/* Right Side - User Actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="ghost"
              size="sm"
              className="relative text-blue-200 hover:text-white hover:bg-blue-500/20 ultra-smooth"
            >
              <Bell className="h-5 w-5" />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -top-1 -right-1"
              >
                <Badge className="w-5 h-5 p-0 bg-gradient-to-r from-cyan-500 to-blue-500 text-white pulse-glow text-xs flex items-center justify-center">
                  8
                </Badge>
              </motion.div>
            </Button>
          </motion.div>

          <Separator orientation="vertical" className="h-8 bg-blue-500/30" />

          {/* User Profile */}
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ x: 2 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <div className="text-right">
              <p className="text-white text-sm font-inter">{user?.firstName || 'User'}</p>
              <p className="text-xs text-blue-300 capitalize font-mono flex items-center">
                <Circle className="w-2 h-2 text-green-400 fill-current mr-1" />
                online
              </p>
            </div>
            <div className="relative">
              <Avatar className="h-9 w-9 hover-tilt neon-glow-cyan border-2 border-blue-500/50">
                <AvatarImage src={user?.imageUrl} alt={user?.firstName || 'User'} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white font-orbitron">
                  {(user?.firstName || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Circle 
                  className="absolute -bottom-0.5 -right-0.5 h-3 w-3 text-green-400 fill-current"
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Logout */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 ultra-smooth group"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden sm:flex items-center font-inter">
                Logout
                <Zap className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
              </span>
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}