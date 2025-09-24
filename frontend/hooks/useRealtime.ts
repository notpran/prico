"use client";
import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';

interface UseRealtimeOptions {
  onMessage?: (evt: any) => void;
}

export function useRealtime({ onMessage }: UseRealtimeOptions = {}) {
  const { getToken } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const retryRef = useRef<number>(0);
  const closedRef = useRef<boolean>(false);

  const cleanup = () => {
    if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    heartbeatRef.current = null;
  };

  const connect = useCallback(async () => {
    if (closedRef.current) return;
    const token = await getToken();
    const urlBase = process.env.NEXT_PUBLIC_WS_BASE || 'ws://localhost:8000/ws';
    const wsUrl = `${urlBase}?token=${encodeURIComponent(token || '')}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    ws.onopen = () => {
      retryRef.current = 0; // reset backoff
      cleanup();
      heartbeatRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping', t: Date.now() }));
        }
      }, 25_000);
    };
    ws.onmessage = (e) => {
      try { const data = JSON.parse(e.data); onMessage?.(data); } catch {}
    };
    ws.onclose = () => {
      cleanup();
      if (closedRef.current) return;
      const delay = Math.min(1000 * Math.pow(2, retryRef.current++), 15_000);
      setTimeout(connect, delay);
    };
    ws.onerror = () => { ws.close(); };
  }, [getToken, onMessage]);

  useEffect(() => {
    closedRef.current = false;
    connect();
    return () => {
      closedRef.current = true;
      cleanup();
      wsRef.current?.close();
    };
  }, [connect]);

  const send = useCallback((data: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
      return true;
    }
    return false;
  }, []);

  return { wsRef, send };
}
