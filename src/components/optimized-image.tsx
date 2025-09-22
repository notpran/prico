'use client';

import React, { useState, useRef, useEffect, useCallback, CSSProperties } from 'react';
import { useImageCache } from '../lib/image-cache';
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';

export interface OptimizedImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'onLoad' | 'onError' | 'onLoadStart'> {
  src: string;
  alt: string;
  fallback?: string;
  enableHardwareAcceleration?: boolean;
  enableLazyLoading?: boolean;
  quality?: 'low' | 'medium' | 'high';
  onLoad?: () => void;
  onError?: () => void;
  onLoadStart?: () => void;
}

// Optimized loading placeholder
const LOADING_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJhIj48c3RvcCBzdG9wLWNvbG9yPSIjZjNmNGY2IiBvZmZzZXQ9IjAlIi8+PHN0b3Agc3RvcC1jb2xvcj0iI2UxZTVlOSIgb2Zmc2V0PSIxMDAlIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+';

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  fallback,
  enableHardwareAcceleration = true,
  enableLazyLoading = true,
  quality = 'medium',
  onLoad,
  onError,
  onLoadStart,
  className = '',
  style = {},
  ...restProps
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [inView, setInView] = useState(!enableLazyLoading);
  const [currentSrc, setCurrentSrc] = useState(src);
  const imgRef = useRef<HTMLImageElement>(null);
  const performanceMetrics = usePerformanceMonitor();

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!enableLazyLoading || inView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [enableLazyLoading, inView]);

  // Handle image loading
  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    setHasError(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoaded(false);
    onError?.();
  }, [onError]);

  const handleLoadStart = useCallback(() => {
    onLoadStart?.();
  }, [onLoadStart]);

  // Update source when in view
  useEffect(() => {
    if (inView) {
      setCurrentSrc(src);
    } else {
      setCurrentSrc(LOADING_PLACEHOLDER);
    }
  }, [inView, src]);

  const computedStyle: CSSProperties = {
    ...style,
    ...(enableHardwareAcceleration && {
      transform: 'translateZ(0)',
      backfaceVisibility: 'hidden',
      perspective: '1000px',
      willChange: 'transform, opacity',
    }),
    transition: 'opacity 0.3s ease-in-out',
    opacity: isLoaded ? 1 : 0.7,
  };

  const computedClassName = [
    className,
    enableHardwareAcceleration ? 'gpu-accelerated' : '',
    'optimized-image'
  ].filter(Boolean).join(' ');

  return (
    <img
      ref={imgRef}
      src={hasError && fallback ? fallback : currentSrc}
      alt={alt}
      className={computedClassName}
      style={computedStyle}
      onLoad={handleLoad}
      onError={handleError}
      onLoadStart={handleLoadStart}
      loading={enableLazyLoading ? 'lazy' : 'eager'}
      {...restProps}
    />
  );
};

// Specialized avatar component
export interface OptimizedAvatarProps extends Omit<OptimizedImageProps, 'fallback'> {
  size?: number;
  fallback?: string;
}

export const OptimizedAvatar: React.FC<OptimizedAvatarProps> = ({
  size = 40,
  className = '',
  style = {},
  fallback = LOADING_PLACEHOLDER,
  ...props
}) => {
  const avatarStyle: CSSProperties = {
    ...style,
    width: size,
    height: size,
    borderRadius: '50%',
    objectFit: 'cover',
  };

  return (
    <OptimizedImage
      {...props}
      fallback={fallback}
      className={`${className} optimized-avatar`}
      style={avatarStyle}
      enableHardwareAcceleration={true}
      enableLazyLoading={true}
      quality="medium"
    />
  );
};

export default OptimizedImage;