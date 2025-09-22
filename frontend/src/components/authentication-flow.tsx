cd /workspaces/prico/frontend && npm run devimport React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ArrowLeft, Github, Mail, Eye, EyeOff } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface AuthenticationFlowProps {
  onLogin: (userData: any) => void;
  onBack: () => void;
}

export function AuthenticationFlow({ onLogin, onBack }: AuthenticationFlowProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent, type: 'login' | 'signup') => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = type === 'signup' ? '/api/auth/signup' : '/api/auth/login';
      const body = type === 'signup' 
        ? {
            email: formData.email,
            username: formData.name.toLowerCase().replace(/\s/g, ''),
            displayName: formData.name,
            password: formData.password,
            confirmPassword: formData.confirmPassword,
            age: 25 // default
          }
        : {
            identifier: formData.email,
            password: formData.password
          };

      const response = await fetch(`http://localhost:3000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        const userData = {
          id: '1', // from token or response
          name: formData.name || 'User',
          email: formData.email,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.email}`,
          status: 'online'
        };
        onLogin(userData);
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error(error);
      alert('Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    setLoading(true);
    setTimeout(() => {
      const userData = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
        status: 'online'
      };
      onLogin(userData);
      setLoading(false);
    }, 1500);
  };

  const handleGuestLogin = () => {
    const userData = {
      id: 'guest',
      name: 'Guest User',
      email: 'guest@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest',
      status: 'online'
    };
    onLogin(userData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left side - Illustration */}
        <div className="hidden md:block space-y-6">
          <div className="relative">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1582138825658-fb952c08b282?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHx0ZWFtJTIwcHJvZ3JhbW1pbmclMjBjb21wdXRlcnxlbnwxfHx8fDE3NTg0NDczNDV8MA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Team collaboration"
              className="w-full rounded-2xl shadow-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/60 to-transparent rounded-2xl" />
          </div>
          <div className="text-center space-y-4">
            <h2 className="text-3xl text-white">Join the Future of Collaboration</h2>
            <p className="text-gray-300">
              Connect with developers worldwide and build amazing projects together.
            </p>
          </div>
        </div>

        {/* Right side - Auth Form */}
        <Card className="bg-black/40 backdrop-blur-sm border-indigo-500/20">
          <CardHeader className="space-y-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="self-start text-gray-400 hover:text-white p-0"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to landing
            </Button>
            <div>
              <CardTitle className="text-2xl text-white">Welcome to CodeChat</CardTitle>
              <CardDescription className="text-gray-400">
                Sign in to your account or create a new one
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-slate-800">
                <TabsTrigger value="login" className="text-white data-[state=active]:bg-indigo-600">
                  Login
                </TabsTrigger>
                <TabsTrigger value="signup" className="text-white data-[state=active]:bg-indigo-600">
                  Sign Up
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4">
                <form onSubmit={(e) => handleSubmit(e, 'login')} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="bg-slate-800 border-slate-600 text-white placeholder:text-gray-400"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="bg-slate-800 border-slate-600 text-white placeholder:text-gray-400 pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                    disabled={loading}
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={(e) => handleSubmit(e, 'signup')} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-slate-800 border-slate-600 text-white placeholder:text-gray-400"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-white">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="bg-slate-800 border-slate-600 text-white placeholder:text-gray-400"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-white">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="bg-slate-800 border-slate-600 text-white placeholder:text-gray-400"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-white">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="bg-slate-800 border-slate-600 text-white placeholder:text-gray-400"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                    disabled={loading}
                  >
                    {loading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-600" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-900 px-2 text-gray-400">Or continue with</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                variant="outline"
                onClick={() => handleSocialLogin('github')}
                className="w-full border-gray-600 text-white hover:bg-gray-800"
                disabled={loading}
              >
                <Github className="w-4 h-4 mr-2" />
                GitHub
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSocialLogin('google')}
                className="w-full border-gray-600 text-white hover:bg-gray-800"
                disabled={loading}
              >
                <Mail className="w-4 h-4 mr-2" />
                Google
              </Button>
            </div>

            <div className="text-center">
              <Button
                variant="link"
                onClick={handleGuestLogin}
                className="text-teal-400 hover:text-teal-300"
              >
                Continue as Guest
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}