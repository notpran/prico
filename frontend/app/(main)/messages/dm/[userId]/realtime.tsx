"use client";
import { useEffect, useRef, useState, useCallback } from 'react';
import { useRealtime } from '@/hooks/useRealtime';
import { api } from '@/lib/api';
import { useAuth } from '@clerk/nextjs';

export default function DmClient({ conversation, initialMessages }: { conversation: any, initialMessages: any[] }) {
  const { userId } = useAuth();
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [typingUsers, setTypingUsers] = useState<Record<string, number>>({});
  const [presence, setPresence] = useState<Record<string, string>>({});
  const [nameMap, setNameMap] = useState<Record<string, string>>({});
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const wsRef = useRealtime({
    onMessage: (evt) => {
      if (evt.type === 'message.new' && evt.conversation_id === String(conversation._id)) {
        setMessages(m => [...m, evt.message]);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 10);
      } else if (evt.type === 'typing' && evt.conversation_id === String(conversation._id)) {
        if (evt.user_id !== userId) {
          setTypingUsers(t => ({ ...t, [evt.user_id]: Date.now() }));
        }
      } else if (evt.type === 'presence') {
        setPresence(p => ({ ...p, [evt.user_id]: evt.status }));
      } else if (evt.type === 'conversation.read' && evt.conversation_id === String(conversation._id)) {
        // could update read markers UI later
      }
    }
  });

  // Cleanup stale typing indicators
  useEffect(() => {
    const i = setInterval(() => {
      setTypingUsers(t => {
        const now = Date.now();
        const next: Record<string, number> = {};
        Object.entries(t).forEach(([k, v]) => { if (now - v < 2500) next[k] = v; });
        return next;
      });
    }, 1500);
    return () => clearInterval(i);
  }, []);

  // Initial scroll & mark read
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'instant' as any });
    api.messages.markRead(conversation._id).catch(() => {});
  }, [conversation._id]);

  // Fetch participant usernames (naive: search by id pattern) -- placeholder improvement required
  useEffect(() => {
    const others = conversation.participant_ids || [];
    (async () => {
      const map: Record<string, string> = {};
      for (const id of others) {
        map[id] = id; // fallback; real implementation would query user detail endpoint
      }
      setNameMap(map);
    })();
  }, [conversation.participant_ids]);

  const send = useCallback(async () => {
    if (!input.trim()) return;
    const optimistic = { _id: 'tmp-' + Date.now(), sender_id: userId, content: input, optimistic: true } as any;
    setMessages(m => [...m, optimistic]);
    const toSend = input;
    setInput('');
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 5);
    try {
      const msg = await api.messages.send(conversation._id, toSend);
      setMessages(m => m.map(x => x === optimistic ? msg : x));
      api.messages.markRead(conversation._id).catch(()=>{});
    } catch {
      setMessages(m => m.filter(x => x !== optimistic));
      setInput(toSend);
    }
  }, [input, userId, conversation._id]);

  // Typing events
  useEffect(() => {
    if (!wsRef.current) return;
    if (!input) return; // only when non-empty
    const ws = wsRef.current;
    ws.send(JSON.stringify({ type: 'typing', conversation_id: String(conversation._id) }));
  }, [input, conversation._id, wsRef]);

  // Mark read when window gains focus or new messages arrive
  useEffect(() => {
    const handler = () => api.messages.markRead(conversation._id).catch(()=>{});
    window.addEventListener('focus', handler);
    return () => window.removeEventListener('focus', handler);
  }, [conversation._id]);
  useEffect(() => { api.messages.markRead(conversation._id).catch(()=>{}); }, [messages.length, conversation._id]);

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      <div className="flex-1 overflow-y-auto space-y-2 border rounded p-3 bg-background">
        {messages.map(m => (
          <div key={m._id} className="text-sm flex items-start gap-2">
            <span className="font-medium">
              {nameMap[m.sender_id] || m.sender_id}{m.optimistic ? '…' : ''}
            </span>
            <span>{m.content}</span>
          </div>
        ))}
        {Object.keys(typingUsers).length > 0 && <div className="text-xs text-muted-foreground">Someone is typing…</div>}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') send(); }} className="flex-1 border rounded px-2 py-1 bg-background" placeholder="Type a message" />
        <button onClick={send} className="px-3 py-1 border rounded">Send</button>
      </div>
    </div>
  );
}
