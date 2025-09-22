import React from 'react';
import { motion } from 'framer-motion';

interface TypingIndicatorProps {
  userName?: string;
  className?: string;
}

export function TypingIndicator({ userName = "Someone", className = "" }: TypingIndicatorProps) {
  return (
    <div className={`flex items-center space-x-2 px-4 py-3 glass rounded-2xl neon-glow-blue ${className}`}>
      <div className="flex items-center space-x-1">
        <motion.div
          className="w-2 h-2 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full typing-dots"
          animate={{
            y: [0, -8, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            repeatType: "loop",
            delay: 0
          }}
        />
        <motion.div
          className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full typing-dots"
          animate={{
            y: [0, -8, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            repeatType: "loop",
            delay: 0.2
          }}
        />
        <motion.div
          className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full typing-dots"
          animate={{
            y: [0, -8, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            repeatType: "loop",
            delay: 0.4
          }}
        />
      </div>
      <span className="text-sm text-gray-300">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {userName} is typing...
        </motion.span>
      </span>
    </div>
  );
}