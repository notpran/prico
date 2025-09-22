import React, { useState, useCallback } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Code, 
  Zap, 
  MessageCircle, 
  Users, 
  GitPullRequest, 
  Shield,
  Bell,
  Github,
  Chrome,
  ArrowRight,
  Play,
  Star,
  Sparkles,
  Terminal,
  Rocket,
  Globe,
  Cpu
} from 'lucide-react';
import { InteractiveCodeDemo } from './interactive-code-demo';
import { ChatPreviewDemo } from './chat-preview-demo';
import { PullRequestDemo } from './pull-request-demo';
import { FloatingAvatars } from './floating-avatars';
import { TypingAnimation } from './typing-animation';
import { GlassmorphismNav } from './glassmorphism-nav';
import { OptimizedThreeBackground } from './optimized-three-background';

interface AdvancedLandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
  onDemo: () => void;
}

export function AdvancedLandingPage({ onGetStarted, onLogin, onDemo }: AdvancedLandingPageProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showNotifications, setShowNotifications] = useState(false);
  const { scrollY } = useScroll();
  
  const parallaxY = useTransform(scrollY, [0, 1000], [0, -200]);
  const headerOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  // Optimized mouse movement handler
  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    const x = (event.clientX / window.innerWidth) * 2 - 1;
    const y = -(event.clientY / window.innerHeight) * 2 + 1;
    setMousePosition({ x, y });
  }, []);

  const notifications = [
    { id: 1, text: "🚀 Pull request merged in React App", time: "2m ago" },
    { id: 2, text: "👋 Sarah Chen is now online", time: "5m ago" },
    { id: 3, text: "💬 New message in Dev Team chat", time: "8m ago" }
  ];

  return (
    <div 
      className="relative min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 overflow-hidden gpu-accelerated"
      onMouseMove={handleMouseMove}
    >
      {/* Optimized Three.js Background */}
      <OptimizedThreeBackground mousePosition={mousePosition} />
      
      {/* Glassmorphism Navigation */}
      <GlassmorphismNav onLogin={onLogin} />
      
      {/* Floating Avatars */}
      <FloatingAvatars />
      
      {/* Hero Section */}
      <motion.section 
        className="relative z-10 min-h-screen flex flex-col justify-center items-center px-6"
        style={{ opacity: headerOpacity, y: parallaxY }}
      >
        <div className="max-w-6xl mx-auto text-center space-y-8">
          {/* Animated Headline */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="inline-block"
            >
              <h1 className="text-6xl md:text-8xl font-orbitron font-bold gradient-text-electric mb-4 gpu-accelerated">
                PRICO
              </h1>
              <div className="h-1 w-32 bg-gradient-to-r from-blue-500 to-cyan-500 mx-auto rounded-full neon-glow-blue"></div>
            </motion.div>
            
            <motion.p 
              className="text-xl md:text-2xl text-blue-200 max-w-4xl mx-auto font-inter leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              The ultimate platform for developers to{' '}
              <span className="text-electric font-medium">chat</span>,{' '}
              <span className="text-cyan-400 font-medium">collaborate</span>, and{' '}
              <span className="text-blue-400 font-medium">ship amazing projects</span> together.
            </motion.p>
          </motion.div>
          
          {/* Feature Highlights */}
          <motion.div
            className="flex flex-wrap justify-center gap-4 mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.6 }}
          >
            {[
              { icon: Rocket, text: "Real-time Collaboration" },
              { icon: Globe, text: "Global Community" },
              { icon: Cpu, text: "AI-Powered" }
            ].map((feature, index) => (
              <motion.div
                key={feature.text}
                className="flex items-center space-x-2 glass-ultra px-4 py-2 rounded-full border border-blue-500/30"
                whileHover={{ scale: 1.05, y: -2 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.7 + index * 0.1 }}
              >
                <feature.icon className="h-4 w-4 text-blue-400" />
                <span className="text-blue-200 font-inter text-sm">{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>
          
          {/* CTA Buttons with Enhanced Animations */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 0.6 }}
          >
            <motion.div 
              whileHover={{ scale: 1.05, y: -3 }} 
              whileTap={{ scale: 0.95 }}
              className="relative group"
            >
              <Button 
                size="lg" 
                onClick={onGetStarted}
                className="relative overflow-hidden bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500 hover:from-blue-400 hover:via-blue-500 hover:to-cyan-400 text-white px-10 py-4 text-lg rounded-full shadow-2xl border-0 font-inter font-medium gpu-accelerated ultra-smooth"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                />
                <Zap className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                Get Started
                <Sparkles className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Button>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.05, y: -3 }} 
              whileTap={{ scale: 0.95 }}
              className="group"
            >
              <Button 
                size="lg" 
                variant="outline"
                onClick={onDemo}
                className="group border-2 border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-slate-900 px-10 py-4 text-lg rounded-full glass-ultra font-inter font-medium ultra-smooth"
              >
                <Play className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                Try Demo
              </Button>
            </motion.div>
          </motion.div>

          {/* Notification Bell */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5 }}
          >
            <motion.div
              className="inline-block cursor-pointer"
              whileHover={{ scale: 1.1, y: -2 }}
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <div className="relative p-3 glass-ultra rounded-full border border-blue-500/30 breathe-glow">
                <Bell className="w-6 h-6 text-cyan-400" />
                <motion.div
                  className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <span className="text-white text-xs font-orbitron">3</span>
                </motion.div>
              </div>
            </motion.div>
            
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  className="absolute top-full mt-4 left-1/2 transform -translate-x-1/2 w-80 glass-ultra rounded-2xl border border-blue-500/30 p-4 shadow-2xl"
                >
                  <h3 className="text-white mb-3 font-orbitron">Recent Notifications</h3>
                  <div className="space-y-2">
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: notification.id * 0.1 }}
                        className="flex items-start justify-between p-2 glass-dark rounded-lg border border-blue-500/20"
                      >
                        <p className="text-sm text-blue-200 flex-1 font-inter">{notification.text}</p>
                        <span className="text-xs text-blue-400 ml-2 font-mono">{notification.time}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.section>

      {/* Interactive Features Section */}
      <motion.section 
        className="relative z-10 py-20 px-6"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl gradient-text-electric mb-6 font-orbitron font-bold">
              Experience the Future
            </h2>
            <p className="text-xl text-blue-300 max-w-3xl mx-auto font-inter">
              Interactive demos of our core features. Try them out before you sign up.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Interactive Code Editor Demo */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="lg:col-span-2"
            >
              <InteractiveCodeDemo />
            </motion.div>

            {/* Chat Preview */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <ChatPreviewDemo />
            </motion.div>

            {/* Pull Request Demo */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="lg:col-span-3"
            >
              <PullRequestDemo />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Feature Cards with Enhanced Hover Effects */}
      <motion.section 
        className="relative z-10 py-20 px-6"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: MessageCircle,
                title: "Real-time Collaboration",
                description: "Chat, share code, and collaborate in real-time with syntax highlighting and live cursors.",
                color: "from-blue-500 to-cyan-600"
              },
              {
                icon: GitPullRequest,
                title: "GitHub Integration",
                description: "Seamless pull request management with inline comments and code reviews.",
                color: "from-cyan-500 to-blue-600"
              },
              {
                icon: Terminal,
                title: "Shared Terminal",
                description: "Collaborative terminal access for pair programming and debugging sessions.",
                color: "from-blue-600 to-indigo-600"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group gpu-accelerated"
              >
                <Card className="glass-ultra border-blue-500/30 hover:border-blue-400/50 ultra-smooth h-full">
                  <CardContent className="p-8 text-center space-y-6">
                    <motion.div 
                      className={`w-20 h-20 mx-auto bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center group-hover:rotate-6 ultra-smooth neon-glow-blue`}
                      whileHover={{ rotate: 12, scale: 1.1 }}
                    >
                      <feature.icon className="w-10 h-10 text-white" />
                    </motion.div>
                    <h3 className="text-xl text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-cyan-400 group-hover:bg-clip-text ultra-smooth font-orbitron">
                      {feature.title}
                    </h3>
                    <p className="text-blue-300 group-hover:text-blue-200 ultra-smooth font-inter">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Social Login Section */}
      <motion.section 
        className="relative z-10 py-20 px-6"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-4xl text-white font-orbitron">Ready to start building?</h2>
            <p className="text-blue-300 font-inter text-lg">Connect with your existing accounts and jump right in</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  size="lg"
                  className="group glass-ultra border border-blue-500/30 text-blue-200 hover:text-white hover:bg-blue-500/20 px-8 py-4 font-inter ultra-smooth"
                  onClick={onLogin}
                >
                  <Github className="w-5 h-5 mr-3" />
                  Continue with GitHub
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  size="lg"
                  className="group bg-white hover:bg-gray-100 text-slate-900 px-8 py-4 font-inter ultra-smooth"
                  onClick={onLogin}
                >
                  <Chrome className="w-5 h-5 mr-3" />
                  Continue with Google
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer 
        className="relative z-10 py-12 px-6 border-t border-blue-500/30"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            <div className="flex items-center space-x-3">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg neon-glow-blue"
              >
                <Code className="h-6 w-6 text-white" />
              </motion.div>
              <span className="text-2xl text-white font-orbitron font-bold">Prico</span>
              <Badge className="bg-green-500 text-white font-inter">BETA</Badge>
            </div>
            
            <div className="flex space-x-8 text-blue-300">
              {['About', 'Features', 'Pricing', 'Docs', 'Privacy'].map((link) => (
                <motion.a
                  key={link}
                  href="#"
                  className="hover:text-white ultra-smooth font-inter"
                  whileHover={{ y: -2 }}
                >
                  {link}
                </motion.a>
              ))}
            </div>
            
            <div className="flex items-center space-x-3 text-blue-300">
              <Shield className="w-5 h-5" />
              <span className="text-sm font-inter">Enterprise Security</span>
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
                <span className="text-sm ml-2 font-mono">5.0</span>
              </div>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}