import React, { useState, useEffect } from 'react';
import { AdvancedLandingPage } from './components/advanced-landing-page';
import { AuthenticationFlow } from './components/authentication-flow';
import { Dashboard } from './components/dashboard';

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'auth' | 'dashboard' | 'demo'>('landing');
  const [user, setUser] = useState<any>(null);

  // Performance optimization: Apply theme class to body
  useEffect(() => {
    document.body.className = 'dark font-inter';
    return () => {
      document.body.className = '';
    };
  }, []);

  const handleGetStarted = () => {
    setCurrentView('auth');
  };

  const handleLogin = (userData: any) => {
    setUser(userData);
    setCurrentView('dashboard');
  };

  const handleDemo = () => {
    // Create a demo user and go directly to dashboard
    const demoUser = {
      id: 'demo',
      name: 'Demo User',
      email: 'demo@prico.dev',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
      status: 'online'
    };
    setUser(demoUser);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('landing');
  };

  if (currentView === 'landing') {
    return (
      <AdvancedLandingPage 
        onGetStarted={handleGetStarted} 
        onLogin={() => setCurrentView('auth')}
        onDemo={handleDemo}
      />
    );
  }

  if (currentView === 'auth') {
    return <AuthenticationFlow onLogin={handleLogin} onBack={() => setCurrentView('landing')} />;
  }

  return <Dashboard user={user} onLogout={handleLogout} />;
}