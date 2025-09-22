import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

interface Cursor3DProps {
  className?: string;
}

export function Cursor3D({ className = '' }: Cursor3DProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isClicking, setIsClicking] = useState(false);
  const [trail, setTrail] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const [isVisible, setIsVisible] = useState(false);
  const trailId = useRef(0);

  useEffect(() => {
    let trailTimeout: NodeJS.Timeout;

    const handleMouseMove = (e: MouseEvent) => {
      const newPosition = { x: e.clientX, y: e.clientY };
      setMousePosition(newPosition);
      setIsVisible(true);

      // Add to trail
      const newTrailPoint = { 
        x: newPosition.x, 
        y: newPosition.y, 
        id: trailId.current++ 
      };
      
      setTrail(prevTrail => {
        const updatedTrail = [...prevTrail, newTrailPoint];
        return updatedTrail.slice(-8); // Keep last 8 points
      });

      // Clear trail after inactivity
      clearTimeout(trailTimeout);
      trailTimeout = setTimeout(() => {
        setTrail([]);
      }, 100);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    // Hide default cursor
    document.body.style.cursor = 'none';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.body.style.cursor = 'auto';
      clearTimeout(trailTimeout);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className={`fixed top-0 left-0 pointer-events-none z-50 mix-blend-screen ${className}`}>
      {/* Trail particles */}
      {trail.map((point, index) => (
        <motion.div
          key={point.id}
          initial={{ opacity: 0.6, scale: 1 }}
          animate={{ opacity: 0, scale: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-cyan-400"
          style={{
            left: point.x - 4,
            top: point.y - 4,
            boxShadow: '0 0 10px rgba(157, 78, 221, 0.6)',
          }}
        />
      ))}

      {/* Main 3D cursor */}
      <motion.div
        className="absolute"
        animate={{ 
          x: mousePosition.x - 12, 
          y: mousePosition.y - 12,
          rotate: isClicking ? 45 : 0,
          scale: isClicking ? 1.5 : 1
        }}
        transition={{ 
          type: "spring", 
          stiffness: 500, 
          damping: 30,
          mass: 0.5
        }}
      >
        <motion.div
          className="w-6 h-6 relative"
          animate={{
            rotateY: [0, 360],
            rotateX: isClicking ? [0, 180] : 0,
          }}
          transition={{
            rotateY: { duration: 2, repeat: Infinity, ease: "linear" },
            rotateX: { duration: 0.3, ease: "easeInOut" }
          }}
          style={{
            transformStyle: 'preserve-3d',
            perspective: '1000px'
          }}
        >
          {/* Cube faces */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-sm neon-glow-purple opacity-80"
               style={{ transform: 'translateZ(3px)' }} />
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-sm neon-glow-cyan opacity-80"
               style={{ transform: 'rotateY(90deg) translateZ(3px)' }} />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-sm neon-glow-blue opacity-80"
               style={{ transform: 'rotateY(180deg) translateZ(3px)' }} />
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-cyan-500 rounded-sm neon-glow-magenta opacity-80"
               style={{ transform: 'rotateY(-90deg) translateZ(3px)' }} />
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-sm neon-glow-purple opacity-80"
               style={{ transform: 'rotateX(90deg) translateZ(3px)' }} />
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-sm neon-glow-cyan opacity-80"
               style={{ transform: 'rotateX(-90deg) translateZ(3px)' }} />
        </motion.div>
      </motion.div>

      {/* Click ripple effect */}
      {isClicking && (
        <motion.div
          className="absolute border-2 border-purple-400 rounded-full"
          style={{
            left: mousePosition.x - 25,
            top: mousePosition.y - 25,
          }}
          initial={{ width: 0, height: 0, opacity: 0.8 }}
          animate={{ width: 50, height: 50, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      )}
      
      {/* Secondary ripple */}
      {isClicking && (
        <motion.div
          className="absolute border border-cyan-400 rounded-full"
          style={{
            left: mousePosition.x - 40,
            top: mousePosition.y - 40,
          }}
          initial={{ width: 0, height: 0, opacity: 0.6 }}
          animate={{ width: 80, height: 80, opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
        />
      )}
    </div>
  );
}