import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Folder, 
  File, 
  Plus, 
  Search,
  Settings,
  GitBranch,
  Clock,
  Users,
  Star,
  Eye,
  Code,
  Terminal,
  Play,
  Save,
  Download,
  Upload,
  Share,
  Trash2,
  Edit,
  Copy,
  ExternalLink,
  Globe,
  Lock,
  Zap
} from 'lucide-react';

interface Project {
  _id: string;
  name: string;
  description: string;
  slug: string;
  language: string;
  framework?: string;
  technology: string[];
  status: 'planning' | 'active' | 'completed' | 'archived';
  isPublic: boolean;
  contributorCount: number;
  lastActivity: number;
  repository?: {
    url: string;
    provider: string;
    owner: string;
    name: string;
    branch: string;
  };
  stats: {
    commitCount: number;
    linesOfCode: number;
  };
}

interface ProjectFile {
  _id: string;
  name: string;
  path: string;
  content: string;
  language: string;
  size: number;
  lastModifiedAt: number;
  lastModifiedBy: string;
}

interface CollaborativeWorkspaceProps {
  onSelectProject: (projectId: string, project: Project) => void;
  selectedProject?: string;
}

export function CollaborativeWorkspace({ onSelectProject, selectedProject }: CollaborativeWorkspaceProps) {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('my-projects');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const [fileContent, setFileContent] = useState('');
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    slug: '',
    language: 'javascript',
    framework: '',
    isPublic: true,
    repository: ''
  });

  // Mock data for development
  const userProjects: Project[] = [
    {
      _id: 'proj1',
      name: 'React Dashboard',
      description: 'Modern admin dashboard built with React and TypeScript',
      slug: 'react-dashboard',
      language: 'TypeScript',
      framework: 'React',
      technology: ['react', 'typescript', 'tailwindcss', 'vite'],
      status: 'active',
      isPublic: true,
      contributorCount: 3,
      lastActivity: Date.now() - 3600000,
      repository: {
        url: 'https://github.com/user/react-dashboard',
        provider: 'github',
        owner: 'user',
        name: 'react-dashboard',
        branch: 'main'
      },
      stats: {
        commitCount: 127,
        linesOfCode: 15420
      }
    },
    {
      _id: 'proj2',
      name: 'Node.js API',
      description: 'RESTful API with authentication and real-time features',
      slug: 'nodejs-api',
      language: 'JavaScript',
      framework: 'Express',
      technology: ['nodejs', 'express', 'mongodb', 'socket.io'],
      status: 'active',
      isPublic: false,
      contributorCount: 2,
      lastActivity: Date.now() - 7200000,
      stats: {
        commitCount: 89,
        linesOfCode: 8340
      }
    }
  ];

  const mockFiles: ProjectFile[] = [
    {
      _id: 'file1',
      name: 'App.tsx',
      path: 'src/App.tsx',
      content: `import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </div>
  );
}

export default App;`,
      language: 'typescript',
      size: 456,
      lastModifiedAt: Date.now() - 3600000,
      lastModifiedBy: 'John Doe'
    }
  ];

  const currentProject = userProjects.find(p => p._id === selectedProject);

  return (
    <div className="flex-1 flex bg-slate-900">
      {/* Sidebar */}
      <div className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-lg">Projects</h2>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-gray-400"
            />
          </div>
        </div>

        {/* Project list */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-2">
            {userProjects.map((project) => (
              <Card 
                key={project._id} 
                className={`bg-slate-700 border-slate-600 cursor-pointer transition-colors ${
                  selectedProject === project._id ? 'ring-2 ring-blue-500' : 'hover:bg-slate-600'
                }`}
                onClick={() => onSelectProject(project._id, project)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-sm">{project.name}</CardTitle>
                    <Badge variant="outline" className="text-xs">{project.language}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-300 text-xs mb-2 line-clamp-2">{project.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        {project.contributorCount}
                      </span>
                      <span className="flex items-center">
                        <GitBranch className="w-3 h-3 mr-1" />
                        {project.stats.commitCount}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {selectedProject && currentProject ? (
          <>
            {/* Project header */}
            <div className="p-4 border-b border-slate-700 bg-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div>
                    <h1 className="text-white text-xl font-semibold">{currentProject.name}</h1>
                    <p className="text-gray-400 text-sm">{currentProject.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Share className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="outline" size="icon">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* File explorer and editor */}
            <div className="flex-1 flex">
              {/* File explorer */}
              <div className="w-64 bg-slate-800 border-r border-slate-700">
                <div className="p-3 border-b border-slate-700">
                  <h3 className="text-white text-sm font-medium">Files</h3>
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-2">
                    {mockFiles.map((file) => (
                      <Button
                        key={file._id}
                        variant={selectedFile?._id === file._id ? "secondary" : "ghost"}
                        className="w-full justify-start text-left h-8 mb-1"
                        onClick={() => {
                          setSelectedFile(file);
                          setFileContent(file.content);
                        }}
                      >
                        <div className="flex items-center space-x-2">
                          <File className="w-3 h-3" />
                          <span className="text-sm">{file.name}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Code editor */}
              <div className="flex-1 flex flex-col">
                {selectedFile ? (
                  <>
                    {/* Editor header */}
                    <div className="p-3 border-b border-slate-700 bg-slate-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <File className="w-4 h-4" />
                          <span className="text-white text-sm font-medium">{selectedFile.name}</span>
                        </div>
                        <Button variant="outline" size="sm">
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                      </div>
                    </div>

                    {/* Editor content */}
                    <div className="flex-1 bg-slate-900">
                      <Textarea
                        value={fileContent}
                        onChange={(e) => setFileContent(e.target.value)}
                        className="w-full h-full resize-none border-none bg-transparent text-white font-mono text-sm leading-6 p-4"
                        style={{ minHeight: '100%' }}
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center bg-slate-900 text-gray-400">
                    <div className="text-center">
                      <Code className="w-16 h-16 mx-auto mb-4 opacity-30" />
                      <h3 className="text-lg font-medium mb-2">Select a file to edit</h3>
                      <p>Choose a file from the explorer to start coding</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-slate-900 text-gray-400">
            <div className="text-center">
              <Folder className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-medium mb-2">Select a project</h3>
              <p>Choose a project to start working on it</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}