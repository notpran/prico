import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { MessageCircle, Code, Send, Circle } from 'lucide-react';

export function ChatPreviewDemo() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      user: 'Sarah',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
      content: 'Hey team! Just pushed the new authentication system 🚀',
      time: '10:30 AM',
      type: 'text'
    },
    {
      id: 2,
      user: 'Alex',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
      content: 'Nice work! I\'m reviewing the PR now',
      time: '10:31 AM',
      type: 'text'
    }
  ]);

  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const newMessages = [
    {
      user: 'David',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
      content: 'Found a small bug in the login form validation',
      type: 'text'
    },
    {
      user: 'Sarah',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
      content: `// Quick fix for the validation
const validateForm = (data) => {
  if (!data.email?.includes('@')) {
    return { error: 'Invalid email' };
  }
  return { valid: true };
};`,
      type: 'code'
    },
    {
      user: 'Alex',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
      content: 'Perfect! That should fix it. Testing now... ✅',
      type: 'text'
    },
    {
      user: 'Emily',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily',
      content: 'Great teamwork everyone! 🎉',
      type: 'text'
    }
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;

    let messageIndex = 0;
    let messageIdCounter = Date.now();
    
    const addMessage = () => {
      if (messageIndex >= newMessages.length) {
        // Reset after all messages
        setTimeout(() => {
          setMessages(prev => prev.slice(0, 2));
          messageIndex = 0;
        }, 3000);
        return;
      }

      const newMessage = newMessages[messageIndex];
      
      // Show typing indicator
      setTypingUsers([newMessage.user]);
      
      setTimeout(() => {
        setTypingUsers([]);
        setMessages(prev => [...prev, {
          id: messageIdCounter++, // Use incremental counter for truly unique IDs
          ...newMessage,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        messageIndex++;
        
        // Schedule next message
        setTimeout(addMessage, 2000);
      }, 1500);
    };

    const timer = setTimeout(addMessage, 2000);
    return () => clearTimeout(timer);
  }, [isAutoPlaying]); // Remove messages from dependency array to prevent recreation

  return (
    <Card 
      className="glass-ultra border-blue-500/30 h-full ultra-smooth gpu-accelerated"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg neon-glow-blue">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-white font-orbitron">Prico Live Chat</CardTitle>
              <p className="text-sm text-blue-300 font-inter">Dev Team • 4 members</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className="bg-green-500 text-white electric-pulse">
              <Circle className="w-2 h-2 mr-1 fill-current" />
              4 online
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Chat Messages */}
        <div className="h-80 overflow-y-auto space-y-3 pr-2">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ 
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                  rotateX: [5, 0],
                }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ 
                  duration: 0.6,
                  type: "spring",
                  stiffness: 200,
                  damping: 20
                }}
                className="flex items-start space-x-3 gpu-accelerated"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Avatar className="h-8 w-8 border-2 border-blue-500/50 neon-glow-blue">
                    <AvatarImage src={message.avatar} alt={message.user} />
                    <AvatarFallback className="bg-blue-600 text-white text-xs font-orbitron">
                      {message.user.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
                
                <div className="flex-1 space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-100 text-sm font-orbitron">{message.user}</span>
                    <span className="text-xs text-blue-400 font-mono">{message.time}</span>
                  </div>
                  
                  <motion.div
                    className={`rounded-lg p-3 max-w-xs ultra-smooth ${
                      message.type === 'code'
                        ? 'glass-dark border border-blue-500/30 neon-glow-cyan'
                        : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white neon-glow-blue'
                    }`}
                    whileHover={{ y: -2, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {message.type === 'code' ? (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-xs text-blue-300">
                          <Code className="h-3 w-3" />
                          <span className="font-mono">JavaScript</span>
                        </div>
                        <pre className="text-sm text-cyan-300 overflow-x-auto font-mono">
                          <code>{message.content}</code>
                        </pre>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap font-inter">{message.content}</p>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicators */}
          <AnimatePresence>
            {typingUsers.map((user, index) => (
              <motion.div
                key={`typing-${user}-${Date.now()}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center space-x-3"
              >
                <Avatar className="h-8 w-8 neon-glow-electric">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.toLowerCase()}`} />
                  <AvatarFallback className="bg-blue-600 text-white text-xs font-orbitron">
                    {user.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="glass-dark rounded-lg px-4 py-2 border border-blue-500/30">
                  <div className="flex space-x-1">
                    <motion.div
                      className="w-2 h-2 bg-blue-400 rounded-full"
                      animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-blue-400 rounded-full"
                      animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-blue-400 rounded-full"
                      animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Message Input */}
        <motion.div 
          className="flex items-center space-x-3 p-3 glass-dark rounded-lg border border-blue-500/30 ultra-smooth"
          whileHover={{ borderColor: "rgb(59, 130, 246)" }}
        >
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 bg-transparent text-blue-100 placeholder:text-blue-400 outline-none font-inter"
            readOnly
          />
          <motion.button
            className="p-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-lg text-white ultra-smooth neon-glow-blue"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Send className="h-4 w-4" />
          </motion.button>
        </motion.div>

        {/* Online Users */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2 text-blue-300">
            <Circle className="w-2 h-2 text-green-400 fill-current electric-pulse" />
            <span className="font-inter">4 members online</span>
          </div>
          <div className="flex -space-x-2">
            {['sarah', 'alex', 'david', 'emily'].map((seed, index) => (
              <motion.div
                key={`avatar-${seed}-${index}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.2, zIndex: 10 }}
                className="gpu-accelerated"
              >
                <Avatar className="h-6 w-6 border-2 border-blue-900/50 hover-tilt">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`} />
                  <AvatarFallback className="text-xs bg-blue-600 text-white font-orbitron">
                    {seed.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}