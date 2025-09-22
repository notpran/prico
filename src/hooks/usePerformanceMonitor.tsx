'use client';

import React from 'react';
import { useEffect, useRef, useState, useCallback } from 'react';

interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage: number;
  renderTime: number;
  quality: 'high' | 'medium' | 'low';
}

interface PerformanceConfig {
  targetFps: number;
  maxMemoryMB: number;
  enableAdaptiveQuality: boolean;
  enableMemoryMonitoring: boolean;
}

const defaultConfig: PerformanceConfig = {
  targetFps: 60,
  maxMemoryMB: 512,
  enableAdaptiveQuality: true,
  enableMemoryMonitoring: true,
};

export function usePerformanceMonitor(config: Partial<PerformanceConfig> = {}) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    frameTime: 16.67,
    memoryUsage: 0,
    renderTime: 0,
    quality: 'high'
  });

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const framesRef = useRef<number[]>([]);
  const animationFrameRef = useRef<number>();
  const configRef = useRef({ ...defaultConfig, ...config });

  const measureFrame = useCallback(() => {
    const now = performance.now();
    const deltaTime = now - lastTimeRef.current;
    
    frameCountRef.current++;
    framesRef.current.push(deltaTime);
    
    // Keep only last 60 frames for calculation
    if (framesRef.current.length > 60) {
      framesRef.current.shift();
    }
    
    // Calculate metrics every second
    if (frameCountRef.current % 60 === 0) {
      const avgFrameTime = framesRef.current.reduce((a, b) => a + b, 0) / framesRef.current.length;
      const fps = Math.round(1000 / avgFrameTime);
      
      let memoryUsage = 0;
      if (configRef.current.enableMemoryMonitoring && 'memory' in performance) {
        const memory = (performance as any).memory;
        memoryUsage = memory.usedJSHeapSize / (1024 * 1024); // Convert to MB
      }
      
      // Adaptive quality based on performance
      let quality: 'high' | 'medium' | 'low' = 'high';
      if (configRef.current.enableAdaptiveQuality) {
        if (fps < 30 || memoryUsage > configRef.current.maxMemoryMB * 0.8) {
          quality = 'low';
        } else if (fps < 45 || memoryUsage > configRef.current.maxMemoryMB * 0.6) {
          quality = 'medium';
        }
      }
      
      setMetrics({
        fps,
        frameTime: avgFrameTime,
        memoryUsage,
        renderTime: avgFrameTime,
        quality
      });
    }
    
    lastTimeRef.current = now;
    animationFrameRef.current = requestAnimationFrame(measureFrame);
  }, []);

  useEffect(() => {
    const startMonitoring = () => {
      animationFrameRef.current = requestAnimationFrame(measureFrame);
    };
    
    startMonitoring();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [measureFrame]);

  return metrics;
}

// Hook for adaptive animations based on performance
export function useAdaptiveAnimation(baseConfig: any = {}) {
  const { quality, fps } = usePerformanceMonitor();

  const adaptiveConfig = {
    ...baseConfig,
    // Reduce animation complexity based on performance
    transition: {
      ...baseConfig.transition,
      duration: quality === 'low' ? (baseConfig.transition?.duration || 0.3) * 1.5 : 
               quality === 'medium' ? (baseConfig.transition?.duration || 0.3) * 1.2 : 
               baseConfig.transition?.duration || 0.3,
      type: quality === 'low' ? 'tween' : baseConfig.transition?.type || 'spring',
      stiffness: quality === 'low' ? 100 : 
                quality === 'medium' ? 200 : 
                baseConfig.transition?.stiffness || 300,
      damping: quality === 'low' ? 20 : 
              quality === 'medium' ? 25 : 
              baseConfig.transition?.damping || 30,
    },
    // Disable expensive effects on low performance
    animate: fps < 30 ? false : baseConfig.animate,
    whileHover: quality === 'low' ? undefined : baseConfig.whileHover,
    whileTap: quality === 'low' ? undefined : baseConfig.whileTap,
  };

  return adaptiveConfig;
}

// Performance-aware component wrapper
export function withPerformanceOptimization<T extends object>(
  Component: React.ComponentType<T>,
  options: {
    enableLazyRender?: boolean;
    memoryThreshold?: number;
    skipAnimationsOnLowFps?: boolean;
  } = {}
) {
  return React.memo((props: T) => {
    const { quality, fps, memoryUsage } = usePerformanceMonitor();
    const [shouldRender, setShouldRender] = useState(!options.enableLazyRender);

    useEffect(() => {
      if (options.enableLazyRender) {
        // Delay rendering if performance is poor
        const delay = quality === 'low' ? 100 : quality === 'medium' ? 50 : 0;
        const timer = setTimeout(() => setShouldRender(true), delay);
        return () => clearTimeout(timer);
      }
    }, [quality]);

    // Skip rendering if memory usage is too high
    if (options.memoryThreshold && memoryUsage > options.memoryThreshold) {
      return <div className="text-gray-500 text-sm">Content hidden to preserve memory</div>;
    }

    // Skip animations if FPS is too low
    if (options.skipAnimationsOnLowFps && fps < 30) {
      return <Component {...props} />;
    }

    if (!shouldRender) {
      return <div className="animate-pulse bg-gray-200 h-20 w-full rounded" />;
    }

    return <Component {...props} />;
  });
}