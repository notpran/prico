import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface Cursor3DProps {
  className?: string;
}

export function Cursor3D({ className = '' }: Cursor3DProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isClicking, setIsClicking] = useState(false);
  const [trail, setTrail] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const [isVisible, setIsVisible] = useState(false);
  const trailId = useRef(0);
  const rafRef = useRef<number>();

  useEffect(() => {
    let trailTimeout: NodeJS.Timeout;

    const handleMouseMove = (e: MouseEvent) => {
      const newPosition = { x: e.clientX, y: e.clientY };
      
      // Use RAF for smooth updates
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      
      rafRef.current = requestAnimationFrame(() => {
        setMousePosition(newPosition);
        setIsVisible(true);

        // Optimized trail with reduced frequency
        if (trailId.current % 3 === 0) { // Only add every 3rd movement
          const newTrailPoint = { 
            x: newPosition.x, 
            y: newPosition.y, 
            id: trailId.current++ 
          };
          
          setTrail(prevTrail => {
            const updatedTrail = [...prevTrail, newTrailPoint];
            return updatedTrail.slice(-4); // Keep only last 4 points for performance
          });
        }
        trailId.current++;

        // Clear trail after inactivity
        clearTimeout(trailTimeout);
        trailTimeout = setTimeout(() => {
          setTrail([]);
        }, 150);
      });
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    // Passive event listeners for better performance
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mousedown', handleMouseDown, { passive: true });
    document.addEventListener('mouseup', handleMouseUp, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    document.addEventListener('mouseenter', handleMouseEnter, { passive: true });

    // Hardware accelerated cursor hiding
    document.body.style.cursor = 'none';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.body.style.cursor = 'auto';
      clearTimeout(trailTimeout);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className={`fixed top-0 left-0 pointer-events-none z-50 ${className}`}
         style={{ transform: 'translateZ(0)', willChange: 'transform' }}>
      {/* Optimized trail particles with hardware acceleration */}
      {trail.map((point) => (
        <motion.div
          key={point.id}
          initial={{ opacity: 0.4, scale: 0.8 }}
          animate={{ opacity: 0, scale: 0.2 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="absolute w-1 h-1 rounded-full bg-gradient-to-r from-purple-400 to-cyan-400"
          style={{
            left: point.x - 2,
            top: point.y - 2,
            transform: 'translateZ(0)',
            willChange: 'transform, opacity',
          }}
        />
      ))}

      {/* Simplified main cursor with hardware acceleration */}
      <motion.div
        className="absolute w-4 h-4 border-2 border-purple-400 rounded-full"
        animate={{ 
          x: mousePosition.x - 8, 
          y: mousePosition.y - 8,
          scale: isClicking ? 1.5 : 1
        }}
        transition={{ 
          type: "spring", 
          stiffness: 800, 
          damping: 35,
          mass: 0.3
        }}
        style={{
          transform: 'translateZ(0)',
          willChange: 'transform',
          backfaceVisibility: 'hidden',
        }}
      />

      {/* Click ripple effect with reduced complexity */}
      {isClicking && (
        <motion.div
          className="absolute border border-purple-400 rounded-full"
          style={{
            left: mousePosition.x - 20,
            top: mousePosition.y - 20,
            transform: 'translateZ(0)',
          }}
          initial={{ width: 0, height: 0, opacity: 0.6 }}
          animate={{ width: 40, height: 40, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      )}
    </div>
  );
}