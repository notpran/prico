"use client";
import { useEffect, useRef, useState } from 'react';
import { useRealtime } from '@/hooks/useRealtime';
import { api } from '@/lib/api';

export default function DmClient({ conversation, initialMessages }: { conversation: any, initialMessages: any[] }) {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useRealtime({
    onMessage: (evt) => {
      if (evt.type === 'message.new' && evt.conversation_id === String(conversation._id)) {
        setMessages(m => [...m, evt.message]);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 10);
      }
    }
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'instant' as any });
  }, []);

  async function send() {
    if (!input.trim()) return;
    const msg = await api.messages.send(conversation._id, input.trim());
    setMessages(m => [...m, msg]);
    setInput('');
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 5);
  }

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      <div className="flex-1 overflow-y-auto space-y-2 border rounded p-3 bg-background">
        {messages.map(m => (
          <div key={m._id} className="text-sm"><span className="font-medium mr-2">{m.sender_id}</span>{m.content}</div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') send(); }} className="flex-1 border rounded px-2 py-1 bg-background" placeholder="Type a message" />
        <button onClick={send} className="px-3 py-1 border rounded">Send</button>
      </div>
    </div>
  );
}
