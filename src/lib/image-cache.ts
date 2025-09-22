'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface CacheEntry {
  blob: Blob;
  url: string;
  timestamp: number;
  accessCount: number;
  size: number;
}

interface ImageCacheOptions {
  maxSize: number; // Max cache size in bytes (default: 50MB)
  maxAge: number; // Max age in milliseconds (default: 1 hour)
  compressionQuality: number; // 0-1 for image compression
  enableWebP: boolean;
  enableLazyLoading: boolean;
}

class ConservativeImageCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize: number;
  private maxAge: number;
  private currentSize = 0;
  private compressionQuality: number;
  private enableWebP: boolean;
  
  constructor(options: Partial<ImageCacheOptions> = {}) {
    this.maxSize = options.maxSize || 50 * 1024 * 1024; // 50MB
    this.maxAge = options.maxAge || 60 * 60 * 1000; // 1 hour
    this.compressionQuality = options.compressionQuality || 0.8;
    this.enableWebP = options.enableWebP ?? true;
    
    // Cleanup expired entries every 10 minutes
    setInterval(() => this.cleanup(), 10 * 60 * 1000);
  }

  private async compressImage(blob: Blob): Promise<Blob> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        // Limit max dimensions for memory efficiency
        const maxDim = 1920;
        let { width, height } = img;
        
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height);
          width *= ratio;
          height *= ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Enable hardware acceleration for canvas
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Check for WebP support
        const supportsWebP = () => {
          const canvas = document.createElement('canvas');
          return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
        };
        
        const format = this.enableWebP && supportsWebP() ? 'image/webp' : 'image/jpeg';
        canvas.toBlob(
          (compressedBlob) => resolve(compressedBlob || blob),
          format,
          this.compressionQuality
        );
        
        // Cleanup
        canvas.remove();
      };
      
      img.src = URL.createObjectURL(blob);
    });
  }

  private cleanup() {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    
    // Remove expired entries
    entries.forEach(([key, entry]) => {
      if (now - entry.timestamp > this.maxAge) {
        URL.revokeObjectURL(entry.url);
        this.cache.delete(key);
        this.currentSize -= entry.size;
      }
    });
    
    // If still over size limit, remove least recently used entries
    if (this.currentSize > this.maxSize) {
      const sortedEntries = entries
        .filter(([key]) => this.cache.has(key))
        .sort(([, a], [, b]) => a.accessCount - b.accessCount);
      
      while (this.currentSize > this.maxSize * 0.8 && sortedEntries.length > 0) {
        const [key, entry] = sortedEntries.shift()!;
        URL.revokeObjectURL(entry.url);
        this.cache.delete(key);
        this.currentSize -= entry.size;
      }
    }
  }

  async get(src: string): Promise<string | null> {
    const entry = this.cache.get(src);
    if (entry) {
      entry.accessCount++;
      entry.timestamp = Date.now(); // Update timestamp for LRU
      return entry.url;
    }
    return null;
  }

  async set(src: string, blob: Blob): Promise<string> {
    try {
      // Compress image if it's large
      const processedBlob = blob.size > 100 * 1024 ? await this.compressImage(blob) : blob;
      
      const url = URL.createObjectURL(processedBlob);
      const entry: CacheEntry = {
        blob: processedBlob,
        url,
        timestamp: Date.now(),
        accessCount: 1,
        size: processedBlob.size
      };
      
      // Check if adding this would exceed cache size
      if (this.currentSize + entry.size > this.maxSize) {
        this.cleanup();
      }
      
      this.cache.set(src, entry);
      this.currentSize += entry.size;
      
      return url;
    } catch (error) {
      console.warn('Failed to cache image:', error);
      return URL.createObjectURL(blob);
    }
  }

  clear() {
    this.cache.forEach(entry => URL.revokeObjectURL(entry.url));
    this.cache.clear();
    this.currentSize = 0;
  }

  getStats() {
    return {
      entries: this.cache.size,
      size: this.currentSize,
      maxSize: this.maxSize,
      utilization: (this.currentSize / this.maxSize) * 100
    };
  }
}

// Global cache instance
const globalImageCache = new ConservativeImageCache();

export { ConservativeImageCache, globalImageCache };

// React hook for using the image cache
export function useImageCache(src: string, options: Partial<ImageCacheOptions> = {}) {
  const [cachedSrc, setCachedSrc] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const loadImage = useCallback(async (imageSrc: string) => {
    if (!imageSrc) return;

    try {
      setLoading(true);
      setError(null);

      // Check cache first
      const cached = await globalImageCache.get(imageSrc);
      if (cached) {
        setCachedSrc(cached);
        setLoading(false);
        return;
      }

      // Abort previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      // Fetch and cache the image
      const response = await fetch(imageSrc, {
        signal: abortControllerRef.current.signal,
        headers: {
          'Accept': 'image/webp,image/avif,image/*,*/*;q=0.8'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to load image: ${response.status}`);
      }

      const blob = await response.blob();
      const url = await globalImageCache.set(imageSrc, blob);
      
      setCachedSrc(url);
      setLoading(false);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message);
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadImage(src);
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [src, loadImage]);

  return { src: cachedSrc, loading, error, cache: globalImageCache };
}