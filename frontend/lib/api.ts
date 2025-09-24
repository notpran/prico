import { auth } from '@clerk/nextjs';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';

async function request(path: string, options: RequestInit = {}) {
  const { getToken } = auth();
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as any || {})
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(BASE_URL + path, { ...options, headers, cache: 'no-store' });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

export const api = {
  friends: {
    list: () => request('/friends/list'),
    incoming: () => request('/friends/incoming'),
    outgoing: () => request('/friends/outgoing'),
    request: (userId: string) => request(`/friends/request/${userId}`, { method: 'POST' }),
    accept: (userId: string) => request(`/friends/accept/${userId}`, { method: 'POST' }),
    decline: (userId: string) => request(`/friends/decline/${userId}`, { method: 'POST' }),
  },
  users: {
    search: (q: string) => request(`/users/search?q=${encodeURIComponent(q)}`)
  },
  messages: {
    ensureDm: (userId: string) => request(`/messages/dm/${userId}`, { method: 'POST' }),
    listConversations: () => request('/messages/conversations'),
    listMessages: (conversationId: string) => request(`/messages/${conversationId}`),
    send: (conversationId: string, content: string) => request(`/messages/${conversationId}`, { method: 'POST', body: JSON.stringify({ content }) }),
    markRead: (conversationId: string) => request(`/messages/${conversationId}/read`, { method: 'POST' })
  }
};
