import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { TypingIndicator } from './typing-indicator';
import { 
  Send, 
  Paperclip, 
  Smile, 
  Phone, 
  Video, 
  MoreVertical,
  Code,
  Circle,
  Search,
  Zap
} from 'lucide-react';

interface ChatInterfaceProps {
  user: any;
  selectedChat?: any;
}

export function ChatInterface({ user, selectedChat }: ChatInterfaceProps) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'Sarah Chen',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
      content: 'Hey! Can you take a look at this React component I\'m working on?',
      timestamp: '10:30 AM',
      isOwn: false,
      type: 'text'
    },
    {
      id: '2',
      sender: 'You',
      avatar: user.avatar,
      content: 'Sure! Share the code snippet.',
      timestamp: '10:31 AM',
      isOwn: true,
      type: 'text'
    },
    {
      id: '3',
      sender: 'Sarah Chen',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
      content: `const UserCard = ({ user }) => {
  return (
    <div className="user-card">
      <img src={user.avatar} alt={user.name} />
      <h3>{user.name}</h3>
      <p>{user.role}</p>
    </div>
  );
};`,
      timestamp: '10:32 AM',
      isOwn: false,
      type: 'code'
    },
    {
      id: '4',
      sender: 'You',
      avatar: user.avatar,
      content: 'Looks good! You might want to add some error handling for the avatar image.',
      timestamp: '10:33 AM',
      isOwn: true,
      type: 'text'
    }
  ]);

  const [conversations] = useState([
    {
      id: '1',
      name: 'Sarah Chen',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
      lastMessage: 'Can you review my React component?',
      time: '2 min ago',
      unread: 2,
      status: 'online'
    },
    {
      id: '2',
      name: 'Dev Team',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=team',
      lastMessage: 'New deployment is ready for testing',
      time: '15 min ago',
      unread: 0,
      status: 'online'
    },
    {
      id: '3',
      name: 'Alex Johnson',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
      lastMessage: 'Great work on the API integration!',
      time: '1 hour ago',
      unread: 1,
      status: 'away'
    },
    {
      id: '4',
      name: 'Project Alpha',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alpha',
      lastMessage: 'Meeting rescheduled to tomorrow',
      time: '2 hours ago',
      unread: 0,
      status: 'offline'
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Simulate typing indicator
  useEffect(() => {
    let typingTimer: NodeJS.Timeout;
    if (message.length > 0) {
      setIsTyping(true);
      typingTimer = setTimeout(() => setIsTyping(false), 2000);
    } else {
      setIsTyping(false);
    }
    return () => clearTimeout(typingTimer);
  }, [message]);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        sender: 'You',
        avatar: user.avatar,
        content: message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwn: true,
        type: 'text'
      };
      setMessages([...messages, newMessage]);
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-400';
      case 'away': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const currentChat = selectedChat || conversations[0];

  return (
    <div className="h-full flex" style={{ background: '#0E0E10' }}>
      {/* Chat List */}
      <div className="w-80 glass-dark border-r border-purple-500/20 flex flex-col">
        <div className="p-4 border-b border-purple-500/20">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-cyan-400" />
            <Input
              placeholder="Search conversations..."
              className="pl-10 glass border-cyan-400/30 text-white placeholder:text-gray-400 focus:border-cyan-400 focus:ring-cyan-400/50"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.map((conversation) => (
            <motion.div
              key={conversation.id}
              className={`flex items-center space-x-3 p-4 cursor-pointer border-b border-purple-500/10 hover:bg-purple-500/10 transition-all duration-300 wobble-hover ${
                currentChat.id === conversation.id ? 'bg-purple-500/20 neon-glow-purple' : ''
              }`}
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative">
                <Avatar className="h-12 w-12 hover-tilt">
                  <AvatarImage src={conversation.avatar} alt={conversation.name} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-cyan-500 text-white">
                    {conversation.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <Circle 
                  className={`absolute -bottom-1 -right-1 h-4 w-4 ${getStatusColor(conversation.status)} fill-current`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-white truncate">{conversation.name}</p>
                  <span className="text-xs text-gray-400">{conversation.time}</span>
                </div>
                <p className="text-sm text-gray-400 truncate">{conversation.lastMessage}</p>
              </div>
              {conversation.unread > 0 && (
                <Badge variant="secondary" className="bg-gradient-to-r from-pink-500 to-red-500 text-white pulse-glow">
                  {conversation.unread}
                </Badge>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-purple-500/20 glass-dark">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Avatar className="h-10 w-10 hover-tilt">
                  <AvatarImage src={currentChat.avatar} alt={currentChat.name} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-cyan-500 text-white">
                    {currentChat.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <Circle 
                  className={`absolute -bottom-1 -right-1 h-3 w-3 ${getStatusColor(currentChat.status)} fill-current`}
                />
              </div>
              <div>
                <h3 className="text-white">{currentChat.name}</h3>
                <p className="text-sm text-gray-400 capitalize">{currentChat.status}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-cyan-400 hover:neon-glow-cyan transition-all">
                <Phone className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-cyan-400 hover:neon-glow-cyan transition-all">
                <Video className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-cyan-400 hover:neon-glow-cyan transition-all">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <motion.div 
              key={msg.id} 
              className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className={`flex space-x-3 max-w-[70%] ${msg.isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <Avatar className="h-8 w-8 flex-shrink-0 hover-tilt">
                  <AvatarImage src={msg.avatar} alt={msg.sender} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-cyan-500 text-white text-xs">
                    {msg.sender.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className={`flex flex-col ${msg.isOwn ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm text-gray-400">{msg.sender}</span>
                    <span className="text-xs text-gray-500">{msg.timestamp}</span>
                  </div>
                  <motion.div
                    className={`rounded-lg p-3 chat-bubble ${
                      msg.isOwn
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white neon-glow-purple'
                        : 'glass text-white border border-cyan-400/30'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    {msg.type === 'code' ? (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Code className="h-4 w-4 text-cyan-400" />
                          <span className="text-sm opacity-75 terminal-glow">Code snippet</span>
                        </div>
                        <pre className="bg-black/50 p-3 rounded text-sm overflow-x-auto border border-cyan-400/30 terminal-glow">
                          <code>{msg.content}</code>
                        </pre>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
          
          {/* Typing Indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex justify-start"
              >
                <TypingIndicator userName="Sarah Chen" />
              </motion.div>
            )}
          </AnimatePresence>
          
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-purple-500/20 glass-dark">
          <div className="flex items-end space-x-3">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-cyan-400 hover:neon-glow-cyan transition-all">
                <Paperclip className="h-5 w-5" />
              </Button>
            </motion.div>
            <div className="flex-1">
              <Input
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="glass border-cyan-400/30 text-white placeholder:text-gray-400 focus:border-cyan-400 focus:ring-cyan-400/50 resize-none"
              />
            </div>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-cyan-400 hover:neon-glow-cyan transition-all">
                <Smile className="h-5 w-5" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={handleSendMessage}
                className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white btn-neon neon-glow-purple"
                disabled={!message.trim()}
              >
                <Send className="h-5 w-5 mr-2" />
                <Zap className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}