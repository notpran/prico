import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function TypingAnimation() {
  const phrases = [
    "Chat.",
    "Collaborate.", 
    "Build.",
    "Ship."
  ];
  
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const currentPhrase = phrases[currentPhraseIndex];
    
    if (isPaused) {
      const pauseTimeout = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, 1500);
      return () => clearTimeout(pauseTimeout);
    }

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        // Typing
        if (currentText.length < currentPhrase.length) {
          setCurrentText(currentPhrase.slice(0, currentText.length + 1));
        } else {
          setIsPaused(true);
        }
      } else {
        // Deleting
        if (currentText.length > 0) {
          setCurrentText(currentText.slice(0, -1));
        } else {
          setIsDeleting(false);
          setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
        }
      }
    }, isDeleting ? 100 : 150);

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, isPaused, currentPhraseIndex, phrases]);

  return (
    <div className="text-center">
      <motion.h1 
        className="text-5xl md:text-8xl bg-gradient-to-r from-indigo-400 via-purple-400 to-teal-400 bg-clip-text text-transparent"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <span className="inline-block min-w-[200px] md:min-w-[400px] text-left">
          {currentText}
          <motion.span
            className="inline-block w-1 h-16 md:h-24 bg-gradient-to-b from-indigo-400 to-purple-400 ml-2"
            animate={{ opacity: [1, 1, 0, 0] }}
            transition={{ 
              duration: 1.2, 
              repeat: Infinity,
              ease: "steps(2, start)"
            }}
          />
        </span>
      </motion.h1>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.8 }}
        className="mt-4"
      >
        <p className="text-lg md:text-xl text-gray-400">
          The future of development collaboration
        </p>
      </motion.div>
    </div>
  );
}