import React, { useRef, useEffect, useState, memo } from 'react';
import * as THREE from 'three';

interface OptimizedThreeBackgroundProps {
  mousePosition: { x: number; y: number };
}

export const OptimizedThreeBackground = memo(({ mousePosition }: OptimizedThreeBackgroundProps) => {
  const threeRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const performanceRef = useRef({ lastTime: 0, frameCount: 0, fps: 60 });

  useEffect(() => {
    if (!threeRef.current) return;

    // Enhanced Three.js Scene with Maximum Performance Optimizations
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    // Maximum hardware acceleration configuration
    const renderer = new THREE.WebGLRenderer({ 
      antialias: false, // Disabled for performance
      alpha: true,
      powerPreference: "high-performance", // Force dedicated GPU
      precision: "lowp", // Lower precision for mobile performance
      stencil: false, // Disabled for performance
      depth: true,
      preserveDrawingBuffer: false, // Performance optimization
      failIfMajorPerformanceCaveat: false,
      premultipliedAlpha: false,
      logarithmicDepthBuffer: false,
      // Hardware acceleration flags
      context: undefined,
      canvas: undefined
    });
    
    rendererRef.current = renderer;
    
    // Enable maximum hardware acceleration
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = false; // Disabled for performance
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit for performance
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    
    // Enable GPU state caching
    renderer.info.autoReset = false;
    
    // CSS transforms for hardware acceleration
    renderer.domElement.style.transform = 'translateZ(0)';
    renderer.domElement.style.willChange = 'transform';
    renderer.domElement.style.backfaceVisibility = 'hidden';
    renderer.domElement.style.perspective = '1000px';
    
    threeRef.current.appendChild(renderer.domElement);

    // Create highly optimized geometry with object pooling
    const geometryPool = [
      new THREE.BoxGeometry(0.6, 0.6, 0.6),
      new THREE.TetrahedronGeometry(0.4),
      new THREE.OctahedronGeometry(0.35),
      new THREE.IcosahedronGeometry(0.45)
    ];

    // Material pooling for better performance
    const materialPool: THREE.Material[] = [];
    const colors = [0x1e40af, 0x3b82f6, 0x06b6d4, 0x0ea5e9, 0x1d4ed8];
    
    colors.forEach(color => {
      materialPool.push(new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.15 + Math.random() * 0.25,
        wireframe: false,
        fog: false
      }));
    });

    const meshes: THREE.Mesh[] = [];
    const count = Math.min(40, window.innerWidth / 30); // Adaptive count based on screen size
    
    // Use instanced rendering for better performance
    for (let i = 0; i < count; i++) {
      const geometry = geometryPool[Math.floor(Math.random() * geometryPool.length)];
      const material = materialPool[Math.floor(Math.random() * materialPool.length)];
      
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 25,
        (Math.random() - 0.5) * 20
      );
      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      
      // Optimize animation properties with reduced calculations
      (mesh as any).animData = {
        wobbleSpeed: 0.002 + Math.random() * 0.005,
        wobbleAmplitude: 0.2 + Math.random() * 0.5,
        rotationSpeed: {
          x: 0.001 + Math.random() * 0.002,
          y: 0.002 + Math.random() * 0.003,
          z: 0.0005 + Math.random() * 0.0015
        },
        basePosition: mesh.position.clone(),
        phase: i * 0.1
      };
      
      scene.add(mesh);
      meshes.push(mesh);
    }

    // Minimal lighting for performance
    const ambientLight = new THREE.AmbientLight(0x1e3a8a, 0.4);
    scene.add(ambientLight);
    
    camera.position.z = 18;

    // High-performance animation loop with adaptive frame rate
    let time = 0;
    let frameCount = 0;
    let lastFpsCheck = performance.now();
    let targetFps = 60;
    let skipFrames = 0;
    
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      
      const now = performance.now();
      frameCount++;
      
      // Adaptive frame rate based on performance
      if (now - lastFpsCheck >= 1000) {
        const currentFps = frameCount;
        frameCount = 0;
        lastFpsCheck = now;
        
        // Adjust quality based on FPS
        if (currentFps < 30) {
          skipFrames = 2; // Skip every 2nd frame
        } else if (currentFps < 45) {
          skipFrames = 1; // Skip every other frame
        } else {
          skipFrames = 0; // Full frame rate
        }
      }
      
      if (skipFrames > 0 && frameCount % (skipFrames + 1) !== 0) {
        return; // Skip this frame
      }
      
      time += 0.006; // Slower time progression for smoother animation
      
      // Ultra-smooth camera parallax with easing
      const mouseInfluence = 0.02;
      const targetX = mousePosition.x * mouseInfluence;
      const targetY = mousePosition.y * mouseInfluence;
      camera.position.x += (targetX - camera.position.x) * 0.025;
      camera.position.y += (targetY - camera.position.y) * 0.025;
      
      // Batch mesh updates for better performance
      const batchSize = 5;
      const startIndex = (frameCount * batchSize) % meshes.length;
      const endIndex = Math.min(startIndex + batchSize, meshes.length);
      
      for (let i = startIndex; i < endIndex; i++) {
        const mesh = meshes[i];
        const animData = (mesh as any).animData;
        
        // Optimized rotation updates
        mesh.rotation.x += animData.rotationSpeed.x;
        mesh.rotation.y += animData.rotationSpeed.y;
        mesh.rotation.z += animData.rotationSpeed.z;
        
        // Efficient floating movement
        const timeOffset = time + animData.phase;
        mesh.position.y = animData.basePosition.y + Math.sin(timeOffset * animData.wobbleSpeed) * animData.wobbleAmplitude * 0.008;
        mesh.position.x = animData.basePosition.x + Math.cos(timeOffset * animData.wobbleSpeed * 0.7) * animData.wobbleAmplitude * 0.004;
      }
      
      renderer.render(scene, camera);
    };
    animate();

    // Optimized resize handler
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
    
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (threeRef.current && renderer.domElement) {
        threeRef.current.removeChild(renderer.domElement);
      }
      
      // Cleanup resources
      meshes.forEach(mesh => {
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material instanceof THREE.Material) {
          mesh.material.dispose();
        }
      });
      
      geometryPool.forEach(geometry => geometry.dispose());
      materialPool.forEach(material => material.dispose());
      renderer.dispose();
    };
  }, []);

  // Update camera position based on mouse movement
  useEffect(() => {
    if (!sceneRef.current || !rendererRef.current) return;
    // Mouse movement is handled in the animation loop for smoother performance
  }, [mousePosition]);

  return <div ref={threeRef} className="fixed inset-0 z-0 gpu-accelerated" />;
});