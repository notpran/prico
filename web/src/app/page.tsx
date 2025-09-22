'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    fetch('/api/auth/me')
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        return null;
      })
      .then(userData => {
        setUser(userData);
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {!user ? (
        <div>
          <Link href="/auth/login">Sign In</Link>
          <Link href="/auth/signup">Sign Up</Link>
          <h1>Welcome to Prico</h1>
          <p>Please sign in to continue</p>
        </div>
      ) : (
        <div>
          <p>Welcome, {user.displayName || user.username}!</p>
          <button onClick={() => {
            document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            window.location.reload();
          }}>Sign Out</button>
          <h1>Welcome to Prico</h1>
          <Link href="/communities">Browse Communities</Link>
        </div>
      )}
    </div>
  );
}