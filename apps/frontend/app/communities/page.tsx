"use client";
import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Button } from '../../components/ui/button';
import Link from 'next/link';

type Community = { _id: string; name: string; description?: string; members?: number };

export default function CommunitiesPage() {
  const [items, setItems] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'public'|'private'>('public');
  const { getToken, isSignedIn } = useAuth();

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000/api';
    fetch(`${base}/communities`)
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((d) => setItems(d.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">Communities</h2>
        <Button onClick={() => setOpen(true)} disabled={!isSignedIn}>Create Community</Button>
      </div>
      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-muted-foreground">No communities yet.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((c) => (
            <li key={c._id} className="rounded border p-4">
              <div className="font-medium"><Link href={`/community/${c._id}`} className="hover:underline">{c.name}</Link></div>
              {c.description && <div className="text-muted-foreground text-sm">{c.description}</div>}
              <div className="text-xs text-muted-foreground mt-2">{c.members ?? 0} members</div>
            </li>
          ))}
        </ul>
      )}
      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded border p-4 w-full max-w-sm space-y-3">
            <h3 className="font-semibold">Create Community</h3>
            <div className="space-y-2">
              <div className="space-y-1">
                <label className="text-sm">Name</label>
                <input className="w-full border rounded px-2 py-1 bg-background" value={name} onChange={e=>setName(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-sm">Description</label>
                <textarea className="w-full border rounded px-2 py-1 bg-background" value={description} onChange={e=>setDescription(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-sm">Visibility</label>
                <select className="w-full border rounded px-2 py-1 bg-background" value={visibility} onChange={e=>setVisibility(e.target.value as any)}>
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={()=>setOpen(false)}>Cancel</Button>
              <Button onClick={async ()=>{
                const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000/api';
                const token = await getToken();
                const res = await fetch(`${base}/communities`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
                  body: JSON.stringify({ name, description, visibility })
                });
                if (res.ok) {
                  const id = (await res.json()).id as string;
                  setItems(prev => [{ _id: id, name, description, members: 1 }, ...prev]);
                  setOpen(false); setName(''); setDescription(''); setVisibility('public');
                }
              }}>Create</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
