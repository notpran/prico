'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { socketManager } from '../../../lib/socket';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';

interface Message {
  _id: string;
  content: string;
  authorId: string;
  createdAt: string;
  attachments?: { _id: string; filename: string; url: string }[];
}

export default function ChatPage() {
  const { channelId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [optimisticMessages, setOptimisticMessages] = useState<{ tempId: string; content: string; attachments?: string[] }[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socketManager.connect();
    socketManager.joinChannel(channelId as string);

    // Fetch initial messages
    fetchMessages();

    // Listen for new messages
    socketManager.onMessageCreated((data) => {
      setMessages((prev) => [...prev, data.message]);
      // Remove optimistic message
      setOptimisticMessages((prev) => prev.filter((m) => m.tempId !== data.tempId));
    });

    return () => {
      socketManager.leaveChannel(channelId as string);
      socketManager.offMessageCreated();
    };
  }, [channelId]);

  const fetchMessages = async (before?: string) => {
    setLoading(true);
    const url = before
      ? `/api/channels/${channelId}/messages?before=${before}&limit=20`
      : `/api/channels/${channelId}/messages?limit=20`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (before) {
        setMessages((prev) => [...data, ...prev]);
      } else {
        setMessages(data);
      }
      if (data.length < 20) {
        setHasMore(false);
      }
    }
    setLoading(false);
  };

  const loadMore = () => {
    if (messages.length > 0) {
      fetchMessages(messages[0]._id);
    }
  };

  const [attachments, setAttachments] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  const sendMessage = async () => {
    if (!input.trim() && attachments.length === 0) return;

    const tempId = Date.now().toString();

    // Upload attachments
    const attachmentIds: string[] = [];
    for (const file of attachments) {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        attachmentIds.push(data._id);
      }
    }

    const optimisticMessage = { tempId, content: input, attachments: attachmentIds };

    // Add optimistic message
    setOptimisticMessages((prev) => [...prev, optimisticMessage]);

    // Send via socket
    socketManager.sendMessage(channelId as string, tempId, input, attachmentIds);

    setInput('');
    setAttachments([]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, optimisticMessages]);

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto p-4">
        {hasMore && (
          <Button onClick={loadMore} disabled={loading} className="mb-4">
            {loading ? 'Loading...' : 'Load More'}
          </Button>
        )}
        {messages.map((msg) => (
          <div key={msg._id} className="mb-2">
            <strong>{msg.authorId}:</strong> {msg.content}
            {msg.attachments && msg.attachments.map((att) => (
              <div key={att._id}>
                <a href={att.url} target="_blank" rel="noopener noreferrer">{att.filename}</a>
              </div>
            ))}
          </div>
        ))}
        {optimisticMessages.map((msg) => (
          <div key={msg.tempId} className="mb-2 opacity-50">
            <strong>You:</strong> {msg.content}
            {msg.attachments && msg.attachments.map((attId) => (
              <div key={attId}>Attachment uploading...</div>
            ))}
            (sending...)
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t">
        <div className="flex flex-col">
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="mb-2"
          />
          <div className="flex">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              className="flex-1"
            />
            <Button onClick={sendMessage} className="ml-2">
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}