"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';

type Item = { id: string; name: string; description?: string; visibility?: string };

export default function ProjectsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000/api';
    fetch(`${base}/projects`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setItems(d.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight">Projects</h2>
      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-muted-foreground">No projects found.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(p => (
            <li key={p.id} className="rounded border p-4 space-y-1">
              <div className="font-medium">
                <Link href={`/projects/${p.id}`} className="hover:underline">{p.name}</Link>
              </div>
              {p.description && <div className="text-sm text-muted-foreground">{p.description}</div>}
              {p.visibility && <div className="text-xs text-muted-foreground">{p.visibility}</div>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
