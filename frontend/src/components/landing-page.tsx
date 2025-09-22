import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { MessageCircle, Users, GitPullRequest, Code, Zap, Shield } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export function LandingPage({ onGetStarted, onLogin }: LandingPageProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Three.js Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0.1);
    mountRef.current.appendChild(renderer.domElement);

    // Create floating tiles
    const tiles: THREE.Mesh[] = [];
    const tileGeometry = new THREE.BoxGeometry(1, 1, 0.1);
    
    for (let i = 0; i < 50; i++) {
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL(Math.random() * 0.3 + 0.5, 0.7, 0.5),
        transparent: true,
        opacity: 0.8
      });
      
      const tile = new THREE.Mesh(tileGeometry, material);
      tile.position.set(
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 20
      );
      tile.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      
      scene.add(tile);
      tiles.push(tile);
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    scene.add(directionalLight);

    camera.position.z = 20;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      tiles.forEach((tile, index) => {
        tile.rotation.x += 0.005;
        tile.rotation.y += 0.005;
        tile.position.y += Math.sin(Date.now() * 0.001 + index) * 0.002;
        tile.position.x += Math.cos(Date.now() * 0.001 + index) * 0.001;
      });
      
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Three.js Background */}
      <div ref={mountRef} className="absolute inset-0 z-0" />
      
      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-6 flex justify-between items-center backdrop-blur-sm bg-black/20">
          <div className="flex items-center space-x-2">
            <Code className="h-8 w-8 text-indigo-400" />
            <span className="text-xl font-bold text-white">CodeChat</span>
          </div>
          <Button 
            variant="outline" 
            onClick={onLogin}
            className="border-indigo-400 text-indigo-400 hover:bg-indigo-400 hover:text-white"
          >
            Login
          </Button>
        </header>

        {/* Hero Section */}
        <main className="flex-1 flex flex-col justify-center items-center text-center px-6">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl bg-gradient-to-r from-indigo-400 via-purple-400 to-teal-400 bg-clip-text text-transparent">
                Collaborate, Code & Connect
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto">
                Chat with friends, build projects, and review pull requests — all in one place.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={onGetStarted}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-3 text-lg"
              >
                <Zap className="w-5 h-5 mr-2" />
                Get Started
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-teal-400 text-teal-400 hover:bg-teal-400 hover:text-white px-8 py-3 text-lg"
              >
                View Demo
              </Button>
            </div>
          </div>
        </main>

        {/* Features Section */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl text-center text-white mb-16">
              Everything you need to build together
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="bg-black/40 backdrop-blur-sm border-indigo-500/20 hover:border-indigo-400/50 transition-colors">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl text-white">Real-time Chat</h3>
                  <p className="text-gray-400">
                    Seamless messaging with syntax highlighting, code snippets, and voice calls.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-black/40 backdrop-blur-sm border-teal-500/20 hover:border-teal-400/50 transition-colors">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl text-white">Team Collaboration</h3>
                  <p className="text-gray-400">
                    Live coding sessions with real-time cursors and collaborative editing.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-black/40 backdrop-blur-sm border-purple-500/20 hover:border-purple-400/50 transition-colors">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                    <GitPullRequest className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl text-white">Git Pull Requests</h3>
                  <p className="text-gray-400">
                    Review code, leave comments, and merge pull requests with GitHub-like workflow.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-6 backdrop-blur-sm bg-black/20 border-t border-gray-800">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <Code className="h-6 w-6 text-indigo-400" />
              <span className="text-white">CodeChat</span>
            </div>
            <div className="flex space-x-6 text-gray-400">
              <a href="#" className="hover:text-white transition-colors">About</a>
              <a href="#" className="hover:text-white transition-colors">Docs</a>
              <a href="#" className="hover:text-white transition-colors">GitHub</a>
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            </div>
            <div className="flex items-center space-x-2 text-gray-400">
              <Shield className="w-4 h-4" />
              <span className="text-sm">Secure & Private</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}