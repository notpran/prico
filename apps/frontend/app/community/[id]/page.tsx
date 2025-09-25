"use client";
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Button } from '../../../components/ui/button';
import { connectChatSocket, getChatSocket } from '../../../lib/socket';

export default function CommunityPage({ params }: { params: { id: string } }) {
  const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000/api';
  const [data, setData] = useState<any>(null);
  const [channelId, setChannelId] = useState<string>('');
  const [messages, setMessages] = useState<{ id: string; senderId: string; content: string; createdAt: string }[]>([]);
  const [input, setInput] = useState('');
  const [typingUsers, setTypingUsers] = useState<Record<string, number>>({});
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { getToken, isSignedIn } = useAuth();

  useEffect(() => {
    fetch(`${base}/communities/${params.id}`).then(r=>r.json()).then(d=>{
      setData(d);
      const ch = (d.channels && d.channels[0]?.channelId) || 'general';
      setChannelId(ch);
    });
  }, [params.id]);

  useEffect(() => {
    if (!channelId) return;
    fetch(`${base}/communities/${params.id}/channels/${channelId}/messages`).then(r=>r.json()).then(d=>setMessages(d.items||[]));
    // connect dedicated chat namespace with the same internal token (ClientSessionProvider already established the main one)
    const token = (window as any).__internalJwt as string | undefined; // optional future exposure
    const cs = token ? connectChatSocket(token) : getChatSocket();
    if (!cs) return;
    cs.emit('channel:join', channelId);
    const onNew = (m: any) => { if (m && m.content) setMessages(prev => [...prev, m]); };
    const onTyping = (p: any) => {
      if (!p?.userId) return;
      setTypingUsers(prev => ({ ...prev, [p.userId]: Date.now() }));
    };
    const onStopTyping = (p: any) => {
      if (!p?.userId) return;
      setTypingUsers(prev => { const { [p.userId]: _, ...rest } = prev; return rest; });
    };
    cs.on('message:new', onNew);
    cs.on('typing', onTyping);
    cs.on('stop_typing', onStopTyping);
    return () => { cs.off('message:new', onNew); cs.off('typing', onTyping); cs.off('stop_typing', onStopTyping); };
  }, [channelId, params.id]);

  async function handleJoin() {
    const token = await getToken();
    await fetch(`${base}/communities/${params.id}/join`, { method: 'POST', headers: { Authorization: token ? `Bearer ${token}` : '' } });
  }
  async function handleLeave() {
    const token = await getToken();
    await fetch(`${base}/communities/${params.id}/leave`, { method: 'POST', headers: { Authorization: token ? `Bearer ${token}` : '' } });
  }
  async function sendMessage() {
    if (!input.trim()) return;
    try {
      const token = (window as any).__internalJwt as string | undefined;
      const s = token ? connectChatSocket(token) : getChatSocket();
      if (s) s.emit('message:new', { channelId, content: input });
    } catch {}
    setInput('');
  }

  function handleInputChange(v: string) {
    setInput(v);
    const token = (window as any).__internalJwt as string | undefined;
    const s = token ? connectChatSocket(token) : getChatSocket();
    if (!s) return;
    s.emit('typing', { channelId });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      s.emit('stop_typing', { channelId });
    }, 1500);
  }

  if (!data) return <div>Loading…</div>;
  const generalId = useMemo(() => data.channels?.[0]?.channelId || 'general', [data]);

  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: '240px 1fr' }}>
      <aside className="border rounded p-2 h-[70vh] overflow-auto">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="font-medium">{data.name}</div>
            <div className="text-xs text-muted-foreground">{data.membersCount} members</div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleJoin} disabled={!isSignedIn}>Join</Button>
            <Button variant="outline" onClick={handleLeave} disabled={!isSignedIn}>Leave</Button>
          </div>
        </div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Channels</div>
        <ul className="space-y-1">
          {(data.channels||[]).map((c: any) => (
            <li key={c.channelId}>
              <button className={`w-full text-left px-2 py-1 rounded ${channelId === c.channelId ? 'bg-accent' : 'hover:bg-accent/60'}`} onClick={()=>setChannelId(c.channelId)}>
                #{c.name}
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <section className="border rounded flex flex-col h-[70vh]">
        <div className="flex-1 overflow-auto p-3 space-y-2">
          {messages.map(m => (
            <div key={m.id} className="text-sm">
              <span className="text-muted-foreground">{m.senderId.slice(-6)}</span>: {m.content}
            </div>
          ))}
          {Object.keys(typingUsers).length > 0 && (
            <div className="text-xs text-muted-foreground">Someone is typing…</div>
          )}
        </div>
        <div className="border-t p-2 flex gap-2">
          <input
            className="flex-1 border rounded px-2 py-1 bg-background"
            value={input}
            onChange={e=>handleInputChange(e.target.value)}
            onKeyDown={(e)=>{ if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Message #general"
          />
          <Button onClick={sendMessage} disabled={!isSignedIn}>Send</Button>
        </div>
      </section>
    </div>
  );
}
