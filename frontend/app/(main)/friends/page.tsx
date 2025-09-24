import { currentUser } from '@clerk/nextjs';
import { api } from '@/lib/api';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import React from 'react';

async function getData() {
  const [friends, incoming, outgoing] = await Promise.all([
    api.friends.list(),
    api.friends.incoming(),
    api.friends.outgoing()
  ]);
  return { friends, incoming, outgoing };
}

export default async function FriendsPage({ searchParams }: { searchParams: { q?: string } }) {
  const user = await currentUser();
  if (!user) redirect('/sign-in');
  const data = await getData();
  const q = searchParams.q?.trim();
  let searchResults: any[] = [];
  if (q) {
    try { searchResults = await api.users.search(q); } catch {}
  }
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-semibold">Friends</h1>
      <form className="flex gap-2" action="" method="get">
        <input name="q" defaultValue={q} placeholder="Search users" className="border px-2 py-1 rounded bg-background" />
        <button className="px-3 py-1 border rounded" type="submit">Search</button>
      </form>
      {q && <div>
        <h2 className="font-medium mb-2">Search Results</h2>
        <ul className="space-y-1">
          {searchResults.slice(0,10).map(u => (
            <li key={u._id} className="flex justify-between items-center border rounded px-2 py-1">
              <span>{u.username || u.full_name || u.email}</span>
              {u.clerk_id !== user.id && <form action={`/api/friends/request/${u.clerk_id}`} method="post">
                <button className="text-sm px-2 py-1 border rounded">Add</button>
              </form>}
            </li>
          ))}
        </ul>
      </div>}
      <div className="grid md:grid-cols-3 gap-6">
        <section>
          <h2 className="font-medium mb-2">Friends</h2>
          <ul className="space-y-1">
            {data.friends.map((f: any) => (
              <li key={f.friendId} className="flex justify-between items-center border rounded px-2 py-1">
                <span>{f.friendId}</span>
                <Link className="text-sm underline" href={`/messages/dm/${f.friendId}`}>DM</Link>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="font-medium mb-2">Incoming</h2>
          <ul className="space-y-1">
            {data.incoming.map((r: any) => (
              <li key={r._id} className="flex justify-between items-center border rounded px-2 py-1">
                <span>{r.requester}</span>
                <div className="flex gap-2">
                  <form action={`/api/friends/accept/${r.requester}`} method="post"><button className="text-sm px-2 py-1 border rounded">Accept</button></form>
                  <form action={`/api/friends/decline/${r.requester}`} method="post"><button className="text-sm px-2 py-1 border rounded">Decline</button></form>
                </div>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="font-medium mb-2">Outgoing</h2>
          <ul className="space-y-1">
            {data.outgoing.map((r: any) => (
              <li key={r._id} className="flex justify-between items-center border rounded px-2 py-1">
                <span>{r.recipient}</span>
                <span className="text-xs text-muted-foreground">Pending</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
