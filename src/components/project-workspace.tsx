import React, { useState } from 'react';
import { useUserProjects } from '@/hooks/use-api-data';
import { CreateProjectModal } from './create-project-modal';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Code, 
  GitBranch, 
  GitPullRequest, 
  Users, 
  Star,
  Eye,
  MessageSquare,
  Plus,
  Play,
  Settings,
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText
} from 'lucide-react';

interface ProjectWorkspaceProps {
  user: any;
  selectedProject?: any;
}

export function ProjectWorkspace({ user, selectedProject }: ProjectWorkspaceProps) {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Use real projects data
  const { projects, isLoading } = useUserProjects();

  const pullRequests: any[] = [];

  const codeFiles: any[] = [];

  // Use the selected project or the first project from the list
  const currentProject = selectedProject || (projects.length > 0 ? projects[0] : null);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'tsx':
      case 'ts':
        return <FileText className="h-4 w-4 text-blue-400" />;
      case 'css':
        return <FileText className="h-4 w-4 text-green-400" />;
      case 'json':
        return <FileText className="h-4 w-4 text-yellow-400" />;
      default:
        return <FileText className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-green-600 text-white">Open</Badge>;
      case 'review':
        return <Badge className="bg-yellow-600 text-white">Review</Badge>;
      case 'merged':
        return <Badge className="bg-purple-600 text-white">Merged</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getCheckIcon = (status: string) => {
    switch (status) {
      case 'passing':
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-400" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-400" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="h-full overflow-auto bg-slate-900">
      {!currentProject ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-gray-400">
            <Code className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h2 className="text-xl font-semibold mb-2">No Project Selected</h2>
            <p className="mb-6">Select a project to view its workspace or create a new one</p>
            
            <div className="space-y-3">
              <CreateProjectModal 
                trigger={
                  <Button className="bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Project
                  </Button>
                }
                onSuccess={(projectId) => {
                  console.log('Project created:', projectId);
                  // Refresh projects and potentially select the new project
                }}
              />
              
              <p className="text-sm text-gray-500">
                Or browse existing projects from the sidebar
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
      {/* Project Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-indigo-600 rounded-lg">
                  <Code className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl text-white">{currentProject?.name || 'Untitled Project'}</h1>
                  <p className="text-gray-400">{currentProject?.description || 'No description available'}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {currentProject?.techStack?.map((tech: string) => (
                  <Badge key={tech} variant="outline" className="border-slate-600 text-gray-300">
                    {tech}
                  </Badge>
                )) || []}
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-gray-400">
                <span className="flex items-center">
                  <Star className="h-4 w-4 mr-1" />
                  {currentProject?.stars || 0} stars
                </span>
                <span className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  {currentProject?.watchers || 0} watching
                </span>
                <span className="flex items-center">
                  <GitBranch className="h-4 w-4 mr-1" />
                  {currentProject?.branches || 0} branches
                </span>
                <span className="flex items-center">
                  <GitPullRequest className="h-4 w-4 mr-1" />
                  {currentProject?.openPRs || 0} open PRs
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <CreateProjectModal 
                trigger={
                  <Button variant="outline" className="border-slate-600 text-gray-300 hover:bg-slate-700">
                    <Plus className="h-4 w-4 mr-2" />
                    New Project
                  </Button>
                }
                onSuccess={(projectId) => {
                  console.log('Project created:', projectId);
                }}
              />
              <Button variant="outline" className="border-slate-600 text-gray-300 hover:bg-slate-700">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Live
              </Button>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <Play className="h-4 w-4 mr-2" />
                Start Coding
              </Button>
              <Button variant="outline" className="border-slate-600 text-gray-300 hover:bg-slate-700">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800 max-w-md">
            <TabsTrigger value="overview" className="text-white data-[state=active]:bg-indigo-600">
              Overview
            </TabsTrigger>
            <TabsTrigger value="code" className="text-white data-[state=active]:bg-indigo-600">
              Code
            </TabsTrigger>
            <TabsTrigger value="pulls" className="text-white data-[state=active]:bg-indigo-600">
              Pull Requests
            </TabsTrigger>
            <TabsTrigger value="team" className="text-white data-[state=active]:bg-indigo-600">
              Team
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Project Stats */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Project Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Commits</span>
                    <span className="text-white">142</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Lines of Code</span>
                    <span className="text-white">12,543</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Last Update</span>
                    <span className="text-white">{currentProject?.lastCommit || 'Never'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Issues</span>
                    <span className="text-white">3 open</span>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="bg-slate-800 border-slate-700 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-white">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center text-gray-400 py-8">
                    No activity to display
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="code" className="space-y-6 mt-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white">Files</CardTitle>
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  New File
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {codeFiles.map((file) => (
                    <div 
                      key={file.name}
                      className="flex items-center space-x-3 p-3 hover:bg-slate-700 rounded-lg cursor-pointer transition-colors"
                    >
                      <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center">
                        <Code className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white">{file.name}</p>
                        <p className="text-sm text-gray-400">{file.path}</p>
                      </div>
                      <Badge variant="outline" className="border-slate-600 text-gray-300">
                        {file.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pulls" className="space-y-6 mt-6">
            <div className="space-y-4">
              {pullRequests.map((pr) => (
                <Card key={pr.id} className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={pr.avatar} alt={pr.author} />
                          <AvatarFallback className="bg-indigo-600 text-white">
                            {pr.author.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-white">{pr.title}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                            <span>#{pr.id}</span>
                            <span>by {pr.author}</span>
                            <span>{pr.createdAt}</span>
                          </div>
                          <div className="flex items-center space-x-3 mt-2">
                            <Badge variant="outline" className="border-slate-600 text-gray-300">
                              {pr.branch}
                            </Badge>
                            <span className="text-sm text-gray-400">{pr.changes}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(pr.status)}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4 text-gray-400">
                        <span className="flex items-center">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          {pr.comments}
                        </span>
                        <span className="flex items-center">
                          {getCheckIcon(pr.checks)}
                          <span className="ml-1 capitalize">{pr.checks}</span>
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="border-slate-600 text-gray-300 hover:bg-slate-700">
                          Review
                        </Button>
                        {pr.status === 'open' && (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                            Merge
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="team" className="space-y-6 mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(currentProject?.collaborators || []).map((collaborator: any, index: number) => (
                <Card key={index} className="bg-slate-800 border-slate-700">
                  <CardContent className="p-4 text-center">
                    <Avatar className="h-16 w-16 mx-auto mb-3">
                      <AvatarImage src={collaborator.avatar} alt={collaborator.name} />
                      <AvatarFallback className="bg-indigo-600 text-white text-lg">
                        {collaborator.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="text-white mb-1">{collaborator.name}</h3>
                    <p className="text-sm text-gray-400 mb-4">Frontend Developer</p>
                    <div className="flex space-x-2">
                      <Button size="sm" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white">
                        Message
                      </Button>
                      <Button size="sm" variant="outline" className="border-slate-600 text-gray-300 hover:bg-slate-700">
                        Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <Card className="bg-slate-800 border-slate-700 border-dashed">
                <CardContent className="p-4 text-center">
                  <div className="h-16 w-16 mx-auto mb-3 bg-slate-700 rounded-full flex items-center justify-center">
                    <Plus className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-gray-400 mb-1">Invite Member</h3>
                  <p className="text-sm text-gray-500 mb-4">Add a new collaborator</p>
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    <Users className="h-4 w-4 mr-2" />
                    Invite
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
        </>
      )}
    </div>
  );
}