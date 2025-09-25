import React from 'react';
import Link from 'next/link';
import { UserButton, SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import { ThemeToggle } from '../../components/ThemeToggle';
import { useClientSession } from '../../components/ClientSessionProvider';
import { NotificationsBell } from '../../components/NotificationsBell';

export function Topbar() {
  const { connected, handoffInFlight } = useClientSession();
  return (
    <header className="h-14 border-b flex items-center px-4 gap-4 bg-background/80 backdrop-blur">
      <Link href="/" className="font-semibold text-lg">Prico</Link>
      <nav className="flex gap-4 text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
        <Link href="/communities" className="hover:text-foreground">Communities</Link>
        <Link href="/projects" className="hover:text-foreground">Projects</Link>
        <Link href="/notifications" className="hover:text-foreground">Notifications</Link>
      </nav>
      <div className="ml-auto flex items-center gap-3">
        <span className={`text-xs ${handoffInFlight ? 'text-amber-600' : connected ? 'text-emerald-600' : 'text-red-600'}`}>
          {handoffInFlight ? 'connecting…' : connected ? 'live' : 'offline'}
        </span>
        <ThemeToggle />
        <NotificationsBell />
        <SignedOut>
          <SignInButton mode="modal" />
        </SignedOut>
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </div>
    </header>
  );
}
