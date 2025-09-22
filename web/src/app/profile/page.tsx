'use client';

import { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

interface UserProfile {
  _id: string;
  username: string;
  displayName: string;
  about?: string;
  badges: string[];
  avatarUrl?: string;
  age?: number;
  createdAt: string;
  communityIds: string[];
  projectIds: string[];
}

export default function ProfilePage() {
  const { userId } = useAuth();
  const { user } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [about, setAbout] = useState('');
  const [age, setAge] = useState<number | undefined>();

  useEffect(() => {
    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  const fetchProfile = async () => {
    const res = await fetch('/api/users/profile');
    if (res.ok) {
      const data = await res.json();
      setProfile(data);
      setDisplayName(data.displayName);
      setAbout(data.about || '');
      setAge(data.age);
    }
  };

  const updateProfile = async () => {
    const res = await fetch('/api/users/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName, about, age }),
    });

    if (res.ok) {
      const updated = await res.json();
      setProfile(updated);
      setEditing(false);
    }
  };

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Profile
            <Button onClick={() => setEditing(!editing)}>
              {editing ? 'Cancel' : 'Edit'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <p className="text-gray-600">{profile.username}</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Display Name</label>
            {editing ? (
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            ) : (
              <p>{profile.displayName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">About</label>
            {editing ? (
              <Textarea
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                rows={3}
              />
            ) : (
              <p>{profile.about || 'No bio yet'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Age</label>
            {editing ? (
              <Input
                type="number"
                value={age || ''}
                onChange={(e) => setAge(e.target.value ? parseInt(e.target.value) : undefined)}
              />
            ) : (
              <p>{profile.age || 'Not specified'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Badges</label>
            <div className="flex flex-wrap gap-2">
              {profile.badges.map((badge) => (
                <span key={badge} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                  {badge}
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Stats</label>
            <p>Communities: {profile.communityIds.length}</p>
            <p>Projects: {profile.projectIds.length}</p>
          </div>

          {editing && (
            <Button onClick={updateProfile} className="w-full">
              Save Changes
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}