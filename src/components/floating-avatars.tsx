import React from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';

export function FloatingAvatars() {
  const avatars = [
    {
      name: 'Sarah Chen',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
      initials: 'SC',
      position: { top: '20%', left: '15%' },
      delay: 0
    },
    {
      name: 'Alex Johnson',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
      initials: 'AJ',
      position: { top: '30%', right: '20%' },
      delay: 1
    },
    {
      name: 'Emily Rodriguez',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily',
      initials: 'ER',
      position: { top: '60%', left: '10%' },
      delay: 2
    },
    {
      name: 'David Kim',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
      initials: 'DK',
      position: { top: '70%', right: '15%' },
      delay: 3
    },
    {
      name: 'Lisa Wang',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisa',
      initials: 'LW',
      position: { top: '40%', left: '85%' },
      delay: 4
    },
    {
      name: 'Tom Wilson',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tom',
      initials: 'TW',
      position: { top: '80%', left: '80%' },
      delay: 5
    }
  ];

  return (
    <div className="fixed inset-0 z-5 pointer-events-none overflow-hidden">
      {avatars.map((avatar, index) => (
        <motion.div
          key={`floating-avatar-${avatar.name}-${index}`}
          className="absolute gpu-accelerated"
          style={avatar.position}
          initial={{ opacity: 0, scale: 0, rotate: -180 }}
          animate={{ 
            opacity: [0, 1, 1, 0.7, 1],
            scale: [0, 1.2, 1],
            rotate: [0, 360]
          }}
          transition={{
            duration: 2,
            delay: avatar.delay * 0.5,
            repeat: Infinity,
            repeatType: "reverse",
            repeatDelay: 8
          }}
        >
          <motion.div
            animate={{
              y: [-10, 10, -10],
              x: [-5, 5, -5],
            }}
            transition={{
              duration: 4 + index,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="relative"
          >
            {/* Floating Avatar */}
            <motion.div
              whileHover={{ scale: 1.2, rotate: 15 }}
              className="relative"
            >
              <Avatar className="h-16 w-16 border-4 border-blue-400/30 shadow-2xl backdrop-blur-sm neon-glow-blue">
                <AvatarImage src={avatar.image} alt={avatar.name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white font-orbitron">
                  {avatar.initials}
                </AvatarFallback>
              </Avatar>
              
              {/* Online Status Indicator */}
              <motion.div
                className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-blue-900 flex items-center justify-center electric-pulse"
                animate={{ 
                  scale: [1, 1.2, 1],
                  boxShadow: [
                    '0 0 0 0 rgba(34, 197, 94, 0.7)',
                    '0 0 0 10px rgba(34, 197, 94, 0)',
                    '0 0 0 0 rgba(34, 197, 94, 0)'
                  ]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  delay: avatar.delay * 0.3
                }}
              >
                <div className="w-2 h-2 bg-white rounded-full" />
              </motion.div>
            </motion.div>

            {/* Tooltip */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: avatar.delay * 0.5 + 1 }}
              className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1 glass-ultra text-blue-100 text-sm rounded-lg border border-blue-500/30 whitespace-nowrap font-inter"
            >
              {avatar.name}
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 glass-ultra rotate-45 border-l border-t border-blue-500/30" />
            </motion.div>

            {/* Orbiting Elements */}
            <motion.div
              className="absolute inset-0"
              animate={{ rotate: 360 }}
              transition={{
                duration: 10 + index * 2,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <motion.div
                className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full neon-glow-cyan"
                style={{
                  top: -8,
                  left: '50%',
                  transform: 'translateX(-50%)'
                }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: avatar.delay * 0.2
                }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}