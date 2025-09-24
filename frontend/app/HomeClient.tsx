"use client";
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';

export default function HomeClient() {
  const { user } = useUser();
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-semibold">Welcome{user ? `, ${user.username || user.firstName || ''}` : ''}</h1>
      <p className="text-sm text-muted-foreground">Quick links:</p>
      <ul className="list-disc list-inside space-y-1 text-sm">
        <li><Link className="underline" href="/friends">Friends</Link></li>
        <li><Link className="underline" href="/messages">Direct Messages</Link></li>
      </ul>
      {!user && <p className="text-xs text-muted-foreground">Please sign in to access messaging features.</p>}
    </div>
  );
}
