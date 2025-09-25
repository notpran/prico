"use client";
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useSocket } from '../hooks/useSocket';
import { getSocket } from '../lib/socket';

type NotificationItem = { id: string; title: string; body?: string; ts: number; read?: boolean };

type Ctx = {
  internalJwt?: string;
  connected: boolean;
  handoffInFlight: boolean;
  notifications: NotificationItem[];
  unreadCount: number;
  markAllRead: () => void;
};

const ClientSessionContext = createContext<Ctx>({ connected: false, handoffInFlight: false, notifications: [], unreadCount: 0, markAllRead: () => {} });

export function ClientSessionProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, getToken, sessionId } = useAuth();
  const { user } = useUser();
  const [internalJwt, setInternalJwt] = useState<string | undefined>();
  const [handoffInFlight, setHandoffInFlight] = useState(false);
  const lastSessionRef = useRef<string | null>(null);

  useEffect(() => {
    async function run() {
      if (!isSignedIn || !user) {
        setInternalJwt(undefined);
        lastSessionRef.current = null;
        return;
      }
      if (sessionId && lastSessionRef.current === sessionId) return; // already handed off
      setHandoffInFlight(true);
      try {
        const token = await getToken();
        const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000/api';
        const username = user.username || user.primaryEmailAddress?.emailAddress?.split('@')[0] || `user_${user.id.slice(-6)}`;
        const email = user.primaryEmailAddress?.emailAddress || `${user.id}@placeholder.dev`;
        const displayName = user.fullName || undefined;
        const age = 18; // placeholder until profile editing is implemented
        const res = await fetch(`${base}/users/me`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
          body: JSON.stringify({ username, email, displayName, age })
        });
        if (!res.ok) throw new Error('handoff failed');
        const data = await res.json();
        if (data.internalJwt) {
          setInternalJwt(data.internalJwt);
          lastSessionRef.current = sessionId || null;
        }
      } catch (e) {
        console.warn('[handoff] failed', e);
      } finally {
        setHandoffInFlight(false);
      }
    }
    run();
  }, [isSignedIn, user, sessionId, getToken]);

  const { connected } = useSocket(internalJwt);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    const s = getSocket();
    if (!s) return;
    const onNew = (n: NotificationItem) => setNotifications((prev) => [{ ...n, read: false }, ...prev].slice(0, 100));
    s.on('notification:new', onNew);
    return () => { s.off('notification:new', onNew); };
  }, [connected]);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);
  const markAllRead = () => setNotifications((prev) => prev.map(n => ({ ...n, read: true })));

  const value = useMemo(() => ({ internalJwt, connected, handoffInFlight, notifications, unreadCount, markAllRead }), [internalJwt, connected, handoffInFlight, notifications, unreadCount]);
  // Optionally expose for legacy helpers (demo):
  if (typeof window !== 'undefined') (window as any).__internalJwt = internalJwt;
  return <ClientSessionContext.Provider value={value}>{children}</ClientSessionContext.Provider>;
}

export function useClientSession() {
  return useContext(ClientSessionContext);
}
