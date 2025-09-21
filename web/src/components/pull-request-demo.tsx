import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { 
  GitPullRequest, 
  MessageSquare, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Minus,
  Eye,
  GitBranch,
  Clock,
  Zap
} from 'lucide-react';

export function PullRequestDemo() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [showDiff, setShowDiff] = useState(false);

  const steps = [
    {
      title: 'Add user authentication system',
      status: 'open',
      author: 'Sarah Chen',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
      branch: 'feature/auth-system',
      commits: 3,
      additions: 127,
      deletions: 45,
      comments: 0,
      approvals: 0,
      checks: 'pending'
    },
    {
      title: 'Add user authentication system',
      status: 'review',
      author: 'Sarah Chen',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
      branch: 'feature/auth-system',
      commits: 3,
      additions: 127,
      deletions: 45,
      comments: 2,
      approvals: 1,
      checks: 'running'
    },
    {
      title: 'Add user authentication system',
      status: 'approved',
      author: 'Sarah Chen',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
      branch: 'feature/auth-system',
      commits: 3,
      additions: 127,
      deletions: 45,
      comments: 3,
      approvals: 2,
      checks: 'passed'
    },
    {
      title: 'Add user authentication system',
      status: 'merged',
      author: 'Sarah Chen',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
      branch: 'feature/auth-system',
      commits: 3,
      additions: 127,
      deletions: 45,
      comments: 4,
      approvals: 2,
      checks: 'passed'
    }
  ];

  const reviewComments = [
    {
      user: 'Alex Johnson',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
      comment: 'Great work on the validation logic! Just one small suggestion on error handling.',
      time: '2 hours ago',
      line: 42
    },
    {
      user: 'Emily Rodriguez',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily',
      comment: 'LGTM! The token expiration handling is perfect 👍',
      time: '1 hour ago',
      line: null
    },
    {
      user: 'David Kim',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
      comment: 'Approved! Ready to merge once CI passes.',
      time: '30 min ago',
      line: null
    }
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;

    const timer = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % steps.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [isAutoPlaying, steps.length]);

  const currentPR = steps[currentStep];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-500';
      case 'review': return 'bg-cyan-500';
      case 'approved': return 'bg-blue-500';
      case 'merged': return 'bg-indigo-600';
      default: return 'bg-gray-600';
    }
  };

  const getCheckStatus = (checks: string) => {
    switch (checks) {
      case 'pending': return { icon: Clock, color: 'text-blue-400', text: 'Pending' };
      case 'running': return { icon: AlertCircle, color: 'text-cyan-400', text: 'Running' };
      case 'passed': return { icon: CheckCircle, color: 'text-green-400', text: 'Passed' };
      default: return { icon: AlertCircle, color: 'text-red-400', text: 'Failed' };
    }
  };

  const checkStatus = getCheckStatus(currentPR.checks);

  return (
    <Card 
      className="glass-ultra border-blue-500/30 gpu-accelerated ultra-smooth"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.div 
              className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg neon-glow-blue"
              animate={{ rotate: currentStep === 3 ? 360 : 0 }}
              transition={{ duration: 0.5 }}
            >
              <GitPullRequest className="h-5 w-5 text-white" />
            </motion.div>
            <div>
              <CardTitle className="text-white text-lg font-orbitron">Pull Request Review</CardTitle>
              <p className="text-sm text-blue-300 font-inter">GitHub-like workflow with live updates</p>
            </div>
          </div>
          <motion.div 
            className="flex space-x-2"
            animate={{ scale: currentStep === 3 ? [1, 1.1, 1] : 1 }}
            transition={{ duration: 0.5, repeat: currentStep === 3 ? 2 : 0 }}
          >
            <Button 
              size="sm" 
              variant="outline" 
              className="border-blue-500/30 text-blue-300 hover:bg-blue-500/20 font-inter"
              onClick={() => setShowDiff(!showDiff)}
            >
              <Eye className="h-3 w-3 mr-1" />
              {showDiff ? 'Hide' : 'View'} Diff
            </Button>
          </motion.div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* PR Header */}
        <motion.div
          key={`pr-header-${currentStep}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-start space-x-4 p-4 glass-dark rounded-lg border border-blue-500/30"
        >
          <Avatar className="h-12 w-12 border-2 border-blue-500/50 neon-glow-blue">
            <AvatarImage src={currentPR.avatar} alt={currentPR.author} />
            <AvatarFallback className="bg-blue-600 text-white font-orbitron">
              {currentPR.author.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-blue-100 text-lg font-inter">{currentPR.title}</h3>
                <div className="flex items-center space-x-3 text-sm text-blue-300 mt-1 font-inter">
                  <span>#{currentStep + 1}</span>
                  <span>by {currentPR.author}</span>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <GitBranch className="h-3 w-3" />
                    <span className="font-mono">{currentPR.branch}</span>
                  </div>
                </div>
              </div>
              <motion.div
                key={`status-badge-${currentStep}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Badge className={`${getStatusColor(currentPR.status)} text-white capitalize font-inter electric-pulse`}>
                  {currentPR.status}
                </Badge>
              </motion.div>
            </div>

            {/* Stats */}
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-1 text-green-400">
                <Plus className="h-3 w-3" />
                <span className="font-mono">{currentPR.additions}</span>
              </div>
              <div className="flex items-center space-x-1 text-red-400">
                <Minus className="h-3 w-3" />
                <span className="font-mono">{currentPR.deletions}</span>
              </div>
              <div className="flex items-center space-x-1 text-blue-300 font-inter">
                <MessageSquare className="h-3 w-3" />
                <span>{currentPR.comments} comments</span>
              </div>
              <div className="flex items-center space-x-1 text-blue-300 font-inter">
                <span>👍 {currentPR.approvals} approvals</span>
              </div>
            </div>

            {/* Checks Status */}
            <div className="flex items-center space-x-2">
              <motion.div
                animate={{ 
                  rotate: currentPR.checks === 'running' ? 360 : 0,
                  scale: currentPR.checks === 'passed' ? [1, 1.1, 1] : 1
                }}
                transition={{ 
                  duration: currentPR.checks === 'running' ? 2 : 0.5,
                  repeat: currentPR.checks === 'running' ? Infinity : 0
                }}
              >
                <checkStatus.icon className={`h-4 w-4 ${checkStatus.color}`} />
              </motion.div>
              <span className={`text-sm ${checkStatus.color} font-inter`}>
                All checks {checkStatus.text.toLowerCase()}
              </span>
              {currentPR.checks === 'passed' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center space-x-1"
                >
                  <Zap className="h-3 w-3 text-green-400" />
                  <span className="text-xs text-green-400 font-inter">Ready to merge!</span>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Code Diff (when expanded) */}
        <AnimatePresence>
          {showDiff && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="glass-dark rounded-lg border border-blue-500/30 overflow-hidden"
            >
              <div className="p-4 border-b border-blue-500/30">
                <div className="flex items-center justify-between">
                  <span className="text-blue-100 font-mono">src/auth/AuthService.js</span>
                  <Badge variant="outline" className="border-blue-500/30 text-blue-300 font-mono">
                    +127 -45
                  </Badge>
                </div>
              </div>
              <div className="p-4 space-y-1 font-mono text-sm max-h-60 overflow-y-auto">
                <div className="flex">
                  <span className="w-8 text-blue-400 text-right mr-4">23</span>
                  <span className="text-red-400">-  const login = (credentials) {'=> {'}</span>
                </div>
                <div className="flex">
                  <span className="w-8 text-blue-400 text-right mr-4">24</span>
                  <span className="text-green-400">+  const login = async (credentials) {'=> {'}</span>
                </div>
                <div className="flex">
                  <span className="w-8 text-blue-400 text-right mr-4">25</span>
                  <span className="text-green-400">+    try {'{'}</span>
                </div>
                <div className="flex">
                  <span className="w-8 text-blue-400 text-right mr-4">26</span>
                  <span className="text-blue-200">      const response = await fetch('/api/auth/login', {'{'}</span>
                </div>
                <div className="flex">
                  <span className="w-8 text-blue-400 text-right mr-4">27</span>
                  <span className="text-blue-200">        method: 'POST',</span>
                </div>
                <div className="flex">
                  <span className="w-8 text-blue-400 text-right mr-4">28</span>
                  <span className="text-green-400">+        headers: {'{'} 'Content-Type': 'application/json' {'}'},</span>
                </div>
                <div className="flex">
                  <span className="w-8 text-blue-400 text-right mr-4">29</span>
                  <span className="text-blue-200">        body: JSON.stringify(credentials)</span>
                </div>
                <div className="flex">
                  <span className="w-8 text-blue-400 text-right mr-4">30</span>
                  <span className="text-blue-200">      {'}'});</span>
                </div>
                <div className="flex">
                  <span className="w-8 text-blue-400 text-right mr-4">31</span>
                  <span className="text-green-400">+    {'}'} catch (error) {'{'}</span>
                </div>
                <div className="flex">
                  <span className="w-8 text-blue-400 text-right mr-4">32</span>
                  <span className="text-green-400">+      throw new AuthError('Login failed', error);</span>
                </div>
                <div className="flex">
                  <span className="w-8 text-blue-400 text-right mr-4">33</span>
                  <span className="text-green-400">+    {'}'}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Review Comments */}
        <div className="space-y-4">
          <h4 className="text-blue-100 font-orbitron">Review Comments</h4>
          <div className="space-y-3">
            <AnimatePresence>
              {reviewComments.slice(0, Math.min(currentPR.comments, 3)).map((comment, index) => (
                <motion.div
                  key={`comment-${index}-${currentStep}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex space-x-3 p-3 glass-dark rounded-lg border border-blue-500/20"
                >
                  <Avatar className="h-8 w-8 border-2 border-blue-500/30">
                    <AvatarImage src={comment.avatar} alt={comment.user} />
                    <AvatarFallback className="bg-blue-600 text-white text-xs font-orbitron">
                      {comment.user.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-blue-100 text-sm font-inter">{comment.user}</span>
                      <span className="text-xs text-blue-400 font-mono">{comment.time}</span>
                      {comment.line && (
                        <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-300 font-mono">
                          Line {comment.line}
                        </Badge>
                      )}
                    </div>
                    <p className="text-blue-200 text-sm font-inter">{comment.comment}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Action Buttons */}
        <motion.div 
          className="flex items-center justify-between pt-4 border-t border-blue-500/30"
          key={`actions-${currentStep}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center space-x-2 text-sm text-blue-300 font-inter">
            <span>PR #{currentStep + 1}</span>
            <span>•</span>
            <span>{currentPR.commits} commits</span>
            <span>•</span>
            <span>Updated 2 hours ago</span>
          </div>
          
          <div className="flex space-x-2">
            {currentPR.status === 'approved' && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white neon-glow-cyan font-inter">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Merge Pull Request
                </Button>
              </motion.div>
            )}
            {currentPR.status === 'merged' && (
              <Badge className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white electric-pulse font-inter">
                <CheckCircle className="h-3 w-3 mr-1" />
                Merged successfully!
              </Badge>
            )}
            {currentPR.status !== 'merged' && currentPR.status !== 'approved' && (
              <Button variant="outline" className="border-blue-500/30 text-blue-300 hover:bg-blue-500/20 font-inter">
                <MessageSquare className="h-4 w-4 mr-2" />
                Add Review
              </Button>
            )}
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
}