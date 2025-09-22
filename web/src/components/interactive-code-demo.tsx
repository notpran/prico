import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { 
  Play, 
  Copy, 
  FileCode, 
  Users, 
  Zap,
  Circle,
  MousePointer2
} from 'lucide-react';

export function InteractiveCodeDemo() {
  const [code, setCode] = useState(`function UserCard({ user }) {
  const [isOnline, setIsOnline] = useState(false);
  
  useEffect(() => {
    // Simulate real-time status
    const interval = setInterval(() => {
      setIsOnline(prev => !prev);
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="user-card">
      <img src={user.avatar} alt={user.name} />
      <h3>{user.name}</h3>
      <span className={isOnline ? 'online' : 'offline'}>
        {isOnline ? '🟢 Online' : '⚪ Offline'}
      </span>
    </div>
  );
}`);

  const [activeLine, setActiveLine] = useState(null);
  const [cursors, setCursors] = useState([
    { id: 1, line: 5, col: 12, user: 'Sarah', color: '#3B82F6' },
    { id: 2, line: 15, col: 8, user: 'Alex', color: '#06B6D4' }
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Simulate collaborative cursors moving
    const interval = setInterval(() => {
      setCursors(prev => prev.map(cursor => ({
        ...cursor,
        line: Math.max(1, Math.min(20, cursor.line + (Math.random() > 0.5 ? 1 : -1))),
        col: Math.max(1, Math.min(50, cursor.col + Math.floor(Math.random() * 6 - 3)))
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
  };

  const runCode = () => {
    setIsRunning(true);
    setTimeout(() => setIsRunning(false), 2000);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
  };

  const lines = code.split('\n');

  return (
    <Card className="glass-ultra border-blue-500/30 overflow-hidden gpu-accelerated ultra-smooth">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg neon-glow-blue">
              <FileCode className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-white text-lg font-orbitron">Live Code Editor</CardTitle>
              <p className="text-sm text-blue-300 font-inter">Real-time collaborative editing</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className="bg-green-500 text-white electric-pulse">
              <Circle className="w-2 h-2 mr-1 fill-current" />
              Live
            </Badge>
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-blue-300 font-mono">3</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* File Tabs */}
        <div className="flex space-x-2 border-b border-blue-500/30 pb-2">
          <motion.div
            className="flex items-center space-x-2 px-3 py-1 glass-dark rounded-t-lg text-white text-sm border border-blue-500/30 font-inter"
            whileHover={{ y: -2 }}
          >
            <FileCode className="h-3 w-3" />
            <span>UserCard.jsx</span>
          </motion.div>
          <div className="flex items-center space-x-2 px-3 py-1 text-blue-400 text-sm cursor-pointer hover:text-white ultra-smooth font-inter">
            <FileCode className="h-3 w-3" />
            <span>App.jsx</span>
          </div>
        </div>

        {/* Collaborative Cursors Display */}
        <div className="flex items-center space-x-4 text-sm">
          <span className="text-blue-300 font-inter">Active collaborators:</span>
          {cursors.map((cursor) => (
            <motion.div
              key={`cursor-${cursor.id}-${cursor.user}`}
              className="flex items-center space-x-2"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div 
                className="w-3 h-3 rounded-full neon-glow-electric"
                style={{ backgroundColor: cursor.color }}
              />
              <span className="text-blue-200 font-inter">{cursor.user}</span>
              <MousePointer2 
                className="h-3 w-3"
                style={{ color: cursor.color }}
              />
            </motion.div>
          ))}
        </div>

        {/* Code Editor */}
        <div className="relative">
          <div className="glass-dark rounded-lg overflow-hidden border border-blue-500/30">
            {/* Editor Header */}
            <div className="flex items-center justify-between px-4 py-2 glass-ultra border-b border-blue-500/30">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                <div className="w-3 h-3 bg-green-500 rounded-full" />
              </div>
              <div className="flex items-center space-x-2">
                <Button size="sm" onClick={copyCode} className="glass-dark hover:bg-blue-500/20 text-blue-200 border border-blue-500/30">
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </Button>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    size="sm" 
                    onClick={runCode}
                    disabled={isRunning}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white neon-glow-cyan"
                  >
                    <Play className="h-3 w-3 mr-1" />
                    {isRunning ? 'Running...' : 'Run'}
                  </Button>
                </motion.div>
              </div>
            </div>

            {/* Code Area with Syntax Highlighting Simulation */}
            <div className="relative">
              <div className="flex">
                {/* Line Numbers */}
                <div className="glass-ultra px-3 py-4 text-blue-400 text-sm font-mono select-none">
                  {lines.map((_, index) => (
                    <div key={`line-${index}`} className="leading-6">
                      {index + 1}
                    </div>
                  ))}
                </div>

                {/* Code Content */}
                <div className="flex-1 relative">
                  <textarea
                    ref={editorRef}
                    value={code}
                    onChange={handleCodeChange}
                    className="w-full h-80 bg-transparent text-blue-100 font-mono text-sm p-4 resize-none outline-none leading-6"
                    spellCheck="false"
                  />
                  
                  {/* Collaborative Cursors */}
                  {cursors.map((cursor) => (
                    <motion.div
                      key={`live-cursor-${cursor.id}`}
                      className="absolute pointer-events-none"
                      style={{
                        top: `${cursor.line * 1.5}rem`,
                        left: `${cursor.col * 0.6}rem`,
                      }}
                      animate={{
                        opacity: [1, 0.3, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                    >
                      <div 
                        className="w-0.5 h-6 rounded neon-glow-electric"
                        style={{ backgroundColor: cursor.color }}
                      />
                      <div 
                        className="absolute -top-6 left-0 px-2 py-1 rounded text-xs text-white whitespace-nowrap font-inter"
                        style={{ backgroundColor: cursor.color }}
                      >
                        {cursor.user}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Live Preview */}
              <AnimatePresence>
                {isRunning && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="absolute inset-0 glass-ultra backdrop-blur-sm flex items-center justify-center"
                  >
                    <div className="text-center space-y-4">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"
                      />
                      <p className="text-blue-100 font-inter">Compiling and running...</p>
                      <div className="glass-dark rounded-lg p-4 border border-blue-500/30">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10 border-2 border-blue-500/50">
                            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=demo" />
                            <AvatarFallback className="bg-blue-600 text-white font-orbitron">JD</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="text-blue-100 font-inter">John Doe</h3>
                            <motion.span
                              className="text-green-400 text-sm flex items-center font-inter"
                              animate={{ opacity: [1, 0.5, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            >
                              <Circle className="w-2 h-2 mr-1 fill-current" />
                              Online
                            </motion.span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Editor Stats */}
        <div className="flex items-center justify-between text-sm text-blue-300">
          <div className="flex items-center space-x-4 font-inter">
            <span>Lines: {lines.length}</span>
            <span>Characters: {code.length}</span>
            <span>Language: JavaScript</span>
          </div>
          <div className="flex items-center space-x-2">
            <Zap className="h-4 w-4 text-cyan-400" />
            <span className="font-inter">Auto-save enabled</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}