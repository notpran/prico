'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';

interface AdaptiveConfig {
  enableAnimations: boolean;
  enableParticles: boolean;
  enableBlur: boolean;
  particleCount: number;
  animationDuration: number;
  framerMotionConfig: {
    type: string;
    stiffness: number;
    damping: number;
    mass: number;
  };
}

interface PerformanceContextType {
  quality: 'high' | 'medium' | 'low';
  fps: number;
  memoryUsage: number;
  enableAnimations: boolean;
  enableParticles: boolean;
  enableBlur: boolean;
  adaptiveConfig: AdaptiveConfig;
}

const PerformanceContext = createContext<PerformanceContextType | null>(null);

export function PerformanceProvider({ children }: { children: React.ReactNode }) {
  const { quality, fps, memoryUsage } = usePerformanceMonitor();
  const [adaptiveConfig, setAdaptiveConfig] = useState<AdaptiveConfig>({
    enableAnimations: true,
    enableParticles: true,
    enableBlur: true,
    particleCount: 60,
    animationDuration: 0.3,
    framerMotionConfig: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
      mass: 0.5,
    }
  });

  // Update adaptive configuration based on performance
  useEffect(() => {
    const config: AdaptiveConfig = {
      enableAnimations: quality !== 'low' && fps > 30,
      enableParticles: quality === 'high' && fps > 45,
      enableBlur: quality !== 'low' && memoryUsage < 400,
      particleCount: quality === 'high' ? 60 : quality === 'medium' ? 30 : 15,
      animationDuration: quality === 'low' ? 0.6 : quality === 'medium' ? 0.4 : 0.3,
      framerMotionConfig: {
        type: quality === 'low' ? 'tween' : 'spring',
        stiffness: quality === 'low' ? 100 : quality === 'medium' ? 200 : 300,
        damping: quality === 'low' ? 20 : quality === 'medium' ? 25 : 30,
        mass: quality === 'low' ? 1 : 0.5,
      }
    };
    setAdaptiveConfig(config);
  }, [quality, fps, memoryUsage]);

  const value: PerformanceContextType = {
    quality,
    fps,
    memoryUsage,
    enableAnimations: adaptiveConfig.enableAnimations,
    enableParticles: adaptiveConfig.enableParticles,
    enableBlur: adaptiveConfig.enableBlur,
    adaptiveConfig,
  };

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  );
}

export function usePerformanceContext() {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformanceContext must be used within a PerformanceProvider');
  }
  return context;
}

// HOC for performance-aware components
export function withPerformanceAwareness<T extends object>(
  Component: React.ComponentType<T>,
  options: {
    fallbackComponent?: React.ComponentType<T>;
    memoryThreshold?: number;
    skipOnLowFps?: boolean;
  } = {}
) {
  return React.memo((props: T) => {
    const { quality, fps, memoryUsage, enableAnimations } = usePerformanceContext();

    // Render fallback if memory usage is too high
    if (options.memoryThreshold && memoryUsage > options.memoryThreshold) {
      return options.fallbackComponent ? 
        <options.fallbackComponent {...props} /> : 
        <div className="text-gray-500 text-sm">Content optimized for performance</div>;
    }

    // Skip rendering if FPS is too low
    if (options.skipOnLowFps && fps < 20) {
      return <div className="bg-gray-200 animate-pulse h-20 w-full rounded" />;
    }

    // Pass performance state as props
    const enhancedProps = {
      ...props,
      performanceMode: quality,
      enableAnimations,
      quality,
    } as T;

    return <Component {...enhancedProps} />;
  });
}