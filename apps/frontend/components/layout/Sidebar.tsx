import React from 'react';
import Link from 'next/link';

export function Sidebar() {
  return (
    <aside className="w-56 border-r hidden md:flex flex-col p-3 gap-2 bg-background/60">
      <div className="text-xs uppercase tracking-wider text-muted-foreground px-2">Navigation</div>
      <Link className="px-2 py-1 rounded hover:bg-accent/60 text-sm" href="/dashboard">Dashboard</Link>
      <Link className="px-2 py-1 rounded hover:bg-accent/60 text-sm" href="/communities">Communities</Link>
      <Link className="px-2 py-1 rounded hover:bg-accent/60 text-sm" href="/projects">Projects</Link>
      <Link className="px-2 py-1 rounded hover:bg-accent/60 text-sm" href="/profile/me">My Profile</Link>
    </aside>
  );
}
