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

  useEffect(() => {
    if (!threeRef.current) return;

    // Enhanced Three.js Scene with Performance Optimizations
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: "high-performance",
      precision: "lowp",
      stencil: false,
      depth: false
    });
    rendererRef.current = renderer;
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = false; // Disabled for performance
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
    threeRef.current.appendChild(renderer.domElement);

    // Create optimized floating geometry with instancing
    const geometries = [
      new THREE.BoxGeometry(0.8, 0.8, 0.8),
      new THREE.TetrahedronGeometry(0.6),
      new THREE.OctahedronGeometry(0.5),
      new THREE.IcosahedronGeometry(0.6)
    ];

    const meshes: THREE.Mesh[] = [];
    const count = 60; // Reduced count for performance
    
    for (let i = 0; i < count; i++) {
      const geometry = geometries[Math.floor(Math.random() * geometries.length)];
      
      // Blue theme colors
      const hue = 0.55 + Math.random() * 0.15; // Blue to cyan range
      const saturation = 0.7 + Math.random() * 0.3;
      const lightness = 0.4 + Math.random() * 0.3;
      
      const material = new THREE.MeshBasicMaterial({ // Using MeshBasicMaterial for performance
        color: new THREE.Color().setHSL(hue, saturation, lightness),
        transparent: true,
        opacity: 0.2 + Math.random() * 0.4,
        wireframe: Math.random() > 0.7 // Some wireframe for variety
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 25
      );
      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      
      // Add animation properties
      (mesh as any).wobbleSpeed = 0.003 + Math.random() * 0.007;
      (mesh as any).wobbleAmplitude = 0.3 + Math.random() * 0.7;
      (mesh as any).rotationSpeed = {
        x: 0.002 + Math.random() * 0.003,
        y: 0.003 + Math.random() * 0.004,
        z: 0.001 + Math.random() * 0.002
      };
      
      scene.add(mesh);
      meshes.push(mesh);
    }

    // Optimized lighting
    const ambientLight = new THREE.AmbientLight(0x1e3a8a, 0.6); // Blue ambient
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0x3b82f6, 0.8); // Blue directional
    directionalLight.position.set(10, 10, 5);
    scene.add(directionalLight);

    camera.position.z = 20;

    // Optimized animation loop with RAF
    let time = 0;
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      time += 0.008; // Slightly slower for smoothness
      
      // Smooth camera parallax
      const targetX = mousePosition.x * 2;
      const targetY = mousePosition.y * 1.5;
      camera.position.x += (targetX - camera.position.x) * 0.03;
      camera.position.y += (targetY - camera.position.y) * 0.03;
      camera.lookAt(0, 0, 0);
      
      // Optimized mesh animations
      meshes.forEach((mesh, index) => {
        const rotSpeed = (mesh as any).rotationSpeed;
        
        // Rotation
        mesh.rotation.x += rotSpeed.x;
        mesh.rotation.y += rotSpeed.y;
        mesh.rotation.z += rotSpeed.z;
        
        // Floating movement
        const wobbleSpeed = (mesh as any).wobbleSpeed;
        const wobbleAmplitude = (mesh as any).wobbleAmplitude;
        const indexOffset = index * 0.1;
        
        mesh.position.y += Math.sin(time * wobbleSpeed + indexOffset) * wobbleAmplitude * 0.01;
        mesh.position.x += Math.cos(time * wobbleSpeed * 0.7 + indexOffset) * wobbleAmplitude * 0.005;
        mesh.position.z += Math.sin(time * 0.4 + indexOffset) * 0.008;
      });
      
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
      
      // Cleanup
      meshes.forEach(mesh => {
        mesh.geometry.dispose();
        if (mesh.material instanceof THREE.Material) {
          mesh.material.dispose();
        }
      });
      
      geometries.forEach(geometry => geometry.dispose());
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