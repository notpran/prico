"use client";
import { useEffect, useRef, useState } from 'react';
import { connectSocket } from '../lib/socket';

export function useSocket(token?: string) {
  const [connected, setConnected] = useState(false);
  const tokenRef = useRef(token);
  useEffect(() => { tokenRef.current = token; }, [token]);

  useEffect(() => {
    if (!tokenRef.current) return;
    const s = connectSocket(tokenRef.current);
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);
    return () => {
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
    };
  }, [tokenRef.current]);

  return { connected };
}
