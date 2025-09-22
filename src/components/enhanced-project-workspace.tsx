'use client';

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
import { useUserProjects, usePublicProjects, useProject, useProjectFiles } from '../hooks/use-api-data';
import { apiClient } from '@/lib/api';
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
  Zap,
  FolderOpen,
  FileText,
  Image,
  Archive,
  Database,
  Cpu,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  RefreshCw
} from 'lucide-react';

interface ProjectWorkspaceProps {
  selectedProject?: string;
  onProjectSelect?: (projectId: string) => void;
}

interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileTreeNode[];
  size?: number;
  lastModified?: number;
  language?: string;
}

const LANGUAGES = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'PHP', 'Ruby'
];

const FRAMEWORKS = [
  'React', 'Vue.js', 'Angular', 'Next.js', 'Nuxt.js', 'Express.js', 'FastAPI', 'Django', 'Spring Boot'
];

const TECHNOLOGIES = [
  'react', 'vue', 'angular', 'nodejs', 'python', 'java', 'typescript', 'javascript',
  'docker', 'kubernetes', 'aws', 'gcp', 'mongodb', 'postgresql', 'redis', 'elasticsearch'
];

export function ProjectWorkspace({ selectedProject, onProjectSelect }: ProjectWorkspaceProps) {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<'my-projects' | 'explore' | 'workspace'>('my-projects');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [fileContent, setFileContent] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [fileTreeData, setFileTreeData] = useState<FileTreeNode[]>([]);

  // Form state for new project
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    slug: '',
    language: '',
    framework: '',
    technology: [] as string[],
    isPublic: true
  });

  // Hooks
  const { projects: userProjects, isLoading: userProjectsLoading } = useUserProjects();
  const { projects: publicProjects, isLoading: publicProjectsLoading } = usePublicProjects();
  const { data: currentProject, isLoading: projectLoading } = useProject(selectedProject || '');
  const { files: projectFiles, isLoading: filesLoading } = useProjectFiles(selectedProject || '');

  // Build file tree from flat file list
  useEffect(() => {
    if (!projectFiles) return;

    const tree: FileTreeNode[] = [];
    const folderMap = new Map<string, FileTreeNode>();

    projectFiles.forEach((file: any) => {
      const parts = file.path.split('/');
      let currentPath = '';

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isLast = i === parts.length - 1;
        currentPath = currentPath ? `${currentPath}/${part}` : part;

        if (isLast) {
          // It's a file
          const fileNode: FileTreeNode = {
            name: file.name,
            path: file.path,
            type: 'file',
            size: file.size,
            lastModified: file.lastModifiedAt,
            language: file.language
          };

          if (i === 0) {
            tree.push(fileNode);
          } else {
            const parentPath = parts.slice(0, i).join('/');
            const parent = folderMap.get(parentPath);
            if (parent) {
              parent.children = parent.children || [];
              parent.children.push(fileNode);
            }
          }
        } else {
          // It's a folder
          if (!folderMap.has(currentPath)) {
            const folderNode: FileTreeNode = {
              name: part,
              path: currentPath,
              type: 'folder',
              children: []
            };

            folderMap.set(currentPath, folderNode);

            if (i === 0) {
              tree.push(folderNode);
            } else {
              const parentPath = parts.slice(0, i).join('/');
              const parent = folderMap.get(parentPath);
              if (parent) {
                parent.children = parent.children || [];
                parent.children.push(folderNode);
              }
            }
          }
        }
      }
    });

    setFileTreeData(tree);
  }, [projectFiles]);

  const handleCreateProject = async () => {
    if (!user) return;

    try {
      await apiClient.createProject({
        name: newProject.name,
        description: newProject.description,
        isPublic: newProject.isPublic,
        techStack: [newProject.technology, newProject.language, newProject.framework].filter(Boolean),
      });

      setIsCreateDialogOpen(false);
      setNewProject({
        name: '',
        description: '',
        slug: '',
        language: '',
        framework: '',
        technology: [],
        isPublic: true
      });
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js':
      case 'ts':
      case 'jsx':
      case 'tsx':
        return <Code className="w-4 h-4 text-yellow-500" />;
      case 'py':
        return <Code className="w-4 h-4 text-green-500" />;
      case 'java':
      case 'kt':
        return <Code className="w-4 h-4 text-orange-500" />;
      case 'html':
      case 'css':
      case 'scss':
        return <Code className="w-4 h-4 text-blue-500" />;
      case 'md':
      case 'txt':
        return <FileText className="w-4 h-4 text-gray-500" />;
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
        return <Image className="w-4 h-4 text-purple-500" />;
      case 'json':
      case 'xml':
        return <Database className="w-4 h-4 text-green-600" />;
      default:
        return <File className="w-4 h-4 text-gray-400" />;
    }
  };

  const renderFileTree = (nodes: FileTreeNode[], depth = 0) => {
    return nodes.map((node) => (
      <div key={node.path} className="select-none">
        <div
          className={`flex items-center gap-2 px-2 py-1 hover:bg-slate-700 cursor-pointer text-sm ${
            selectedFile === node.path ? 'bg-blue-600' : ''
          }`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => {
            if (node.type === 'folder') {
              toggleFolder(node.path);
            } else {
              setSelectedFile(node.path);
              setActiveTab('workspace');
              // Load file content here
              const file = projectFiles?.find((f: any) => f.path === node.path);
              if (file) {
                setFileContent((file as any).content);
              }
            }
          }}
        >
          {node.type === 'folder' ? (
            <>
              {expandedFolders.has(node.path) ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
              {expandedFolders.has(node.path) ? (
                <FolderOpen className="w-4 h-4 text-blue-400" />
              ) : (
                <Folder className="w-4 h-4 text-blue-400" />
              )}
            </>
          ) : (
            <>
              <span className="w-4" />
              {getFileIcon(node.name)}
            </>
          )}
          <span className="flex-1 truncate">{node.name}</span>
          {node.type === 'file' && node.size && (
            <span className="text-xs text-gray-500">
              {(node.size / 1024).toFixed(1)}KB
            </span>
          )}
        </div>
        {node.type === 'folder' && expandedFolders.has(node.path) && node.children && (
          <div>
            {renderFileTree(node.children, depth + 1)}
          </div>
        )}
      </div>
    ));
  };

  if (activeTab === 'workspace' && selectedProject && currentProject) {
    return (
      <div className="h-full flex">
        {/* File Explorer */}
        <div className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
          <div className="p-3 border-b border-slate-700">
            <h3 className="font-semibold text-white">{(currentProject as any)?.name}</h3>
            <p className="text-xs text-gray-400 truncate">{(currentProject as any)?.description}</p>
          </div>
          
          <div className="p-2 border-b border-slate-700">
            <Button
              size="sm"
              className="w-full"
              onClick={() => setActiveTab('my-projects')}
            >
              <ChevronRight className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-2">
              <div className="text-xs font-medium text-gray-400 mb-2">FILES</div>
              {renderFileTree(fileTreeData)}
            </div>
          </ScrollArea>

          <div className="p-2 border-t border-slate-700">
            <Button size="sm" variant="ghost" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              New File
            </Button>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col">
          {selectedFile ? (
            <>
              <div className="flex items-center justify-between p-3 border-b border-slate-700 bg-slate-800">
                <div className="flex items-center gap-2">
                  {getFileIcon(selectedFile)}
                  <span className="text-sm font-medium text-white">
                    {selectedFile.split('/').pop()}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {(projectFiles?.find((f: any) => f.path === selectedFile) as any)?.language}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost">
                    <Save className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex-1 p-4 bg-slate-900">
                <Textarea
                  value={fileContent}
                  onChange={(e) => setFileContent(e.target.value)}
                  className="w-full h-full font-mono text-sm bg-slate-800 border-slate-600 text-white resize-none"
                  placeholder="Start coding..."
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-slate-900">
              <div className="text-center">
                <Code className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No file selected</h3>
                <p className="text-gray-400">Select a file from the explorer to start editing</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-slate-900 text-white">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Project Workspace</h1>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">Create New Project</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-white">Project Name</Label>
                  <Input
                    value={newProject.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setNewProject(prev => ({
                        ...prev,
                        name,
                        slug: name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')
                      }));
                    }}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="My Awesome Project"
                  />
                </div>
                
                <div>
                  <Label className="text-white">Description</Label>
                  <Textarea
                    value={newProject.description}
                    onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Describe your project..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Language</Label>
                    <Select
                      value={newProject.language}
                      onValueChange={(value) => setNewProject(prev => ({ ...prev, language: value }))}
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map(lang => (
                          <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-white">Framework (Optional)</Label>
                    <Select
                      value={newProject.framework}
                      onValueChange={(value) => setNewProject(prev => ({ ...prev, framework: value }))}
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue placeholder="Select framework" />
                      </SelectTrigger>
                      <SelectContent>
                        {FRAMEWORKS.map(framework => (
                          <SelectItem key={framework} value={framework}>{framework}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="public"
                    checked={newProject.isPublic}
                    onChange={(e) => setNewProject(prev => ({ ...prev, isPublic: e.target.checked }))}
                    className="rounded border-slate-600"
                  />
                  <Label htmlFor="public" className="text-white">Make project public</Label>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="ghost" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateProject} disabled={!newProject.name || !newProject.language}>
                    Create Project
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="my-projects">My Projects</TabsTrigger>
            <TabsTrigger value="explore">Explore</TabsTrigger>
          </TabsList>

          <TabsContent value="my-projects">
            <div className="space-y-4">
              {userProjectsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                </div>
              ) : userProjects.length === 0 ? (
                <div className="text-center py-8">
                  <Folder className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No projects yet</h3>
                  <p className="text-gray-400 mb-4">Create your first project to get started</p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Project
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userProjects.map((project: any) => (
                    <Card key={project._id} className="bg-slate-800 border-slate-700 hover:bg-slate-750 cursor-pointer"
                          onClick={() => {
                            onProjectSelect?.(project._id);
                            setActiveTab('workspace');
                          }}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-white">{project.name}</CardTitle>
                            <p className="text-sm text-gray-400 mt-1">{project.description}</p>
                          </div>
                          <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                            {project.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                          <span>{project.language}</span>
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {project.stats?.contributorCount || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              {project.isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {project.technology?.slice(0, 3).map((tech: string) => (
                            <Badge key={tech} variant="outline" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                          {project.technology?.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{project.technology.length - 3}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="explore">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>
              </div>

              {publicProjectsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {publicProjects.map((project: any) => (
                    <Card key={project._id} className="bg-slate-800 border-slate-700 hover:bg-slate-750">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-white">{project.name}</CardTitle>
                            <p className="text-sm text-gray-400 mt-1">{project.description}</p>
                          </div>
                          <Badge variant="outline">
                            <Globe className="w-3 h-3 mr-1" />
                            Public
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                          <span>{project.language}</span>
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {project.stats?.contributorCount || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <Star className="w-4 h-4" />
                              {project.stats?.commitCount || 0}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {project.technology?.slice(0, 3).map((tech: string) => (
                            <Badge key={tech} variant="outline" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                        <Button size="sm" className="w-full">
                          <Eye className="w-4 h-4 mr-2" />
                          View Project
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}