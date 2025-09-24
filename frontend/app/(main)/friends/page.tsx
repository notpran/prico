"use client";
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';

export default function FriendsPage() {
  const { userId } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = (searchParams.get('q') || '').trim();
  const [loading, setLoading] = useState(false);
  const [friends, setFriends] = useState<any[]>([]);
  const [incoming, setIncoming] = useState<any[]>([]);
  const [outgoing, setOutgoing] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchInput, setSearchInput] = useState(q);

  async function refresh() {
    setLoading(true);
    try {
      const [f, inc, out] = await Promise.all([
        api.friends.list(), api.friends.incoming(), api.friends.outgoing()
      ]);
      setFriends(f); setIncoming(inc); setOutgoing(out);
    } finally { setLoading(false); }
  }

  useEffect(() => { refresh(); }, []);
  useEffect(() => { (async () => { if (q) { try { setSearchResults(await api.users.search(q)); } catch {} } else { setSearchResults([]);} })(); }, [q]);

  async function action(fn: () => Promise<any>) {
    setLoading(true);
    try { await fn(); await refresh(); } finally { setLoading(false); }
  }

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-semibold flex items-center gap-4">Friends {loading && <span className="text-xs text-muted-foreground">Loading…</span>}</h1>
      <div className="flex gap-2">
        <input value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="Search users" className="border px-2 py-1 rounded bg-background" />
        <button className="px-3 py-1 border rounded" onClick={() => router.push(`/friends?q=${encodeURIComponent(searchInput)}`)}>Search</button>
        {q && <button className="px-3 py-1 border rounded" onClick={() => router.push('/friends')}>Clear</button>}
      </div>
      {q && <div>
        <h2 className="font-medium mb-2">Search Results</h2>
        <ul className="space-y-1">
          {searchResults.slice(0,10).map(u => (
            <li key={u._id} className="flex justify-between items-center border rounded px-2 py-1">
              <span>{u.username || u.full_name || u.email}</span>
              {u.clerk_id !== userId && <button disabled={loading} onClick={() => action(() => api.friends.request(u.clerk_id))} className="text-sm px-2 py-1 border rounded">Add</button>}
            </li>
          ))}
          {searchResults.length === 0 && <li className="text-xs text-muted-foreground">No results</li>}
        </ul>
      </div>}
      <div className="grid md:grid-cols-3 gap-6">
        <section>
          <h2 className="font-medium mb-2">Friends</h2>
          <ul className="space-y-1">
            {friends.map(f => (
              <li key={f.friendId} className="flex justify-between items-center border rounded px-2 py-1">
                <span>{f.friendId}</span>
                <Link className="text-sm underline" href={`/messages/dm/${f.friendId}`}>DM</Link>
              </li>
            ))}
            {friends.length === 0 && <li className="text-xs text-muted-foreground">No friends yet</li>}
          </ul>
        </section>
        <section>
          <h2 className="font-medium mb-2">Incoming</h2>
          <ul className="space-y-1">
            {incoming.map(r => (
              <li key={r._id} className="flex justify-between items-center border rounded px-2 py-1">
                <span>{r.requester}</span>
                <div className="flex gap-2">
                  <button disabled={loading} onClick={() => action(() => api.friends.accept(r.requester))} className="text-sm px-2 py-1 border rounded">Accept</button>
                  <button disabled={loading} onClick={() => action(() => api.friends.decline(r.requester))} className="text-sm px-2 py-1 border rounded">Decline</button>
                </div>
              </li>
            ))}
            {incoming.length === 0 && <li className="text-xs text-muted-foreground">No incoming</li>}
          </ul>
        </section>
        <section>
          <h2 className="font-medium mb-2">Outgoing</h2>
          <ul className="space-y-1">
            {outgoing.map(r => (
              <li key={r._id} className="flex justify-between items-center border rounded px-2 py-1">
                <span>{r.recipient}</span>
                <span className="text-xs text-muted-foreground">Pending</span>
              </li>
            ))}
            {outgoing.length === 0 && <li className="text-xs text-muted-foreground">No outgoing</li>}
          </ul>
        </section>
      </div>
    </div>
  );
}
