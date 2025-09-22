'use client'

import React, { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { AdvancedLandingPage } from '@/components/advanced-landing-page';
import { AuthenticationFlow } from '@/components/authentication-flow';
import { Dashboard } from '@/components/dashboard';
import { ClientOnly, AuthChecker } from '@/components/client-only';

export default function HomePage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();
  const [currentView, setCurrentView] = useState<'landing' | 'auth' | 'dashboard' | 'demo'>('landing');
  const [demoUser, setDemoUser] = useState<any>(null);

  // Redirect to dashboard if user is authenticated
  useEffect(() => {
    if (isLoaded && user && currentView !== 'demo') {
      // Small delay to prevent hydration issues
      const timeout = setTimeout(() => {
        router.push('/dashboard');
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [user, isLoaded, router, currentView]);

  const handleGetStarted = () => {
    router.push('/sign-up');
  };

  const handleLogin = () => {
    router.push('/sign-in');
  };

  const handleDemo = () => {
    // Create a demo user and go directly to dashboard
    const demoUserData = {
      id: 'demo',
      name: 'Demo User',
      email: 'demo@prico.dev',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
      status: 'online' as const,
      username: 'demo',
      displayName: 'Demo User',
    };
    setDemoUser(demoUserData);
    setCurrentView('demo');
  };

  const handleLogout = async () => {
    if (currentView === 'demo') {
      setDemoUser(null);
      setCurrentView('landing');
    } else {
      await signOut();
      router.push('/');
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (currentView === 'demo' && demoUser) {
    return (
      <ClientOnly>
        <Dashboard user={demoUser} onLogout={handleLogout} />
      </ClientOnly>
    );
  }

  return (
    <ClientOnly>
      <AdvancedLandingPage 
        onGetStarted={handleGetStarted} 
        onLogin={handleLogin}
        onDemo={handleDemo}
      />
    </ClientOnly>
  );
}