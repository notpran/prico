import React, { useState } from 'react';
import { TopNav } from './top-nav';
import { ChatInterface } from './enhanced-chat-interface';
import { ProjectWorkspace } from './project-workspace';
import { EnhancedFriendsPanel } from './enhanced-friends-panel';
import { EnhancedCommunityPanel } from './enhanced-community-panel';
import { HomePanel } from './home-panel';
import { RightSidebar } from './right-sidebar';

interface DashboardProps {
  user: any;
  onLogout: () => void;
}

export function Dashboard({ user, onLogout }: DashboardProps) {
  const [currentView, setCurrentView] = useState<'home' | 'chats' | 'friends' | 'communities' | 'projects'>('home');
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [selectedCommunity, setSelectedCommunity] = useState<string | undefined>(undefined);
  const [selectedChannel, setSelectedChannel] = useState<string | undefined>(undefined);

  const handleProjectSelect = (project: any) => {
    setSelectedProject(project);
    setCurrentView('projects');
  };

  const handleChatSelect = (chat: any) => {
    setSelectedChat(chat);
    setCurrentView('chats');
  };

  const renderMainContent = () => {
    switch (currentView) {
      case 'home':
        return (
          <HomePanel 
            user={user} 
            onProjectSelect={handleProjectSelect}
            onChatSelect={handleChatSelect}
          />
        );
      case 'chats':
        return <ChatInterface user={user} selectedChat={selectedChat} />;
      case 'friends':
        return (
          <EnhancedFriendsPanel 
            onSelectDM={(conversationId, otherUser) => {
              setSelectedChat({ id: conversationId, otherUser });
              setCurrentView('chats');
            }}
            selectedConversation={selectedChat?.id}
          />
        );
      case 'communities':
        return (
          <EnhancedCommunityPanel
            onSelectChannel={(communityId, channelId, channelName) => {
              setSelectedCommunity(communityId);
              setSelectedChannel(channelId);
            }}
            selectedCommunity={selectedCommunity}
            selectedChannel={selectedChannel}
          />
        );
      case 'projects':
        return <ProjectWorkspace user={user} selectedProject={selectedProject} />;
      default:
        return (
          <HomePanel 
            user={user} 
            onProjectSelect={handleProjectSelect}
            onChatSelect={handleChatSelect}
          />
        );
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 gpu-accelerated">
      {/* Top Navigation */}
      <TopNav 
        user={user} 
        currentView={currentView} 
        onViewChange={setCurrentView}
        onLogout={onLogout}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <main className="flex-1 overflow-hidden ultra-smooth">
          {renderMainContent()}
        </main>
        
        {/* Right Sidebar */}
        <RightSidebar user={user} currentView={currentView} />
      </div>
    </div>
  );
}