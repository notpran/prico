"use client";
import { useEffect, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';

interface UseRealtimeOptions {
  onMessage?: (evt: any) => void;
}

export function useRealtime({ onMessage }: UseRealtimeOptions = {}) {
  const { getToken } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const token = await getToken();
      const urlBase = process.env.NEXT_PUBLIC_WS_BASE || 'ws://localhost:8000/ws';
      const wsUrl = `${urlBase}?token=${encodeURIComponent(token || '')}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      ws.onmessage = (e) => {
        if (!active) return;
        try { const data = JSON.parse(e.data); onMessage?.(data); } catch {}
      };
      ws.onclose = () => { /* could add retry */ };
    })();
    return () => { active = false; wsRef.current?.close(); };
  }, [getToken, onMessage]);

  return wsRef;
}
