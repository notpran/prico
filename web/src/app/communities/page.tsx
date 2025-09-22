'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

interface Community {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  memberIds: string[];
}

export default function CommunitiesPage() {
  const { user } = useUser();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [privacy, setPrivacy] = useState('public');

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    const res = await fetch('/api/communities');
    if (res.ok) {
      const data = await res.json();
      setCommunities(data);
    }
  };

  const createCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/communities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, slug, description, privacy }),
    });
    if (res.ok) {
      setName('');
      setSlug('');
      setDescription('');
      fetchCommunities();
    }
  };

  const joinCommunity = async (id: string) => {
    const res = await fetch(`/api/communities/${id}/join`, {
      method: 'POST',
    });
    if (res.ok) {
      fetchCommunities();
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Communities</h1>

      {user && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create Community</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={createCommunity} className="space-y-4">
              <Input
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                placeholder="Slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
              />
              <Input
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <select
                value={privacy}
                onChange={(e) => setPrivacy(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="invite">Invite Only</option>
              </select>
              <Button type="submit">Create</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {communities.map((community) => (
          <Card key={community._id}>
            <CardHeader>
              <CardTitle>{community.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{community.description}</p>
              <p>Members: {community.memberIds.length}</p>
              {user && !community.memberIds.includes(user.id) && (
                <Button onClick={() => joinCommunity(community._id)}>Join</Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}