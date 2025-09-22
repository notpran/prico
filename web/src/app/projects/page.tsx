'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

interface Project {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  visibility: 'public' | 'private';
  stars: string[];
  createdAt: string;
}

export default function ProjectsPage() {
  const { userId } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('private');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const res = await fetch('/api/projects');
    if (res.ok) {
      const data = await res.json();
      setProjects(data);
    }
  };

  const createProject = async () => {
    if (!name.trim()) return;

    setLoading(true);
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, visibility }),
    });

    if (res.ok) {
      const project = await res.json();
      setProjects([project, ...projects]);
      setName('');
      setDescription('');
      setShowCreate(false);
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Button onClick={() => setShowCreate(!showCreate)}>
          {showCreate ? 'Cancel' : 'New Project'}
        </Button>
      </div>

      {showCreate && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create New Project</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Project name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Textarea
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as 'public' | 'private')}
              className="w-full p-2 border rounded"
            >
              <option value="private">Private</option>
              <option value="public">Public</option>
            </select>
            <Button onClick={createProject} disabled={loading}>
              {loading ? 'Creating...' : 'Create Project'}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project._id}>
            <CardHeader>
              <CardTitle>{project.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-2">{project.description}</p>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{project.visibility}</span>
                <span>{project.stars.length} stars</span>
              </div>
              <Button variant="outline" className="mt-2 w-full">
                Open Project
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}