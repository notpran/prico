import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { EnhancedTopNav } from './enhanced-top-nav';
import { EnhancedFriendsPanel } from './enhanced-friends-panel';
import { RealTimeChat } from './real-time-chat';
import { EnhancedCommunityPanel } from './enhanced-community-panel';
import { ProjectWorkspace } from './enhanced-project-workspace';
import { HomePanel } from './home-panel';
import { RightSidebar } from './right-sidebar';

interface EnhancedDashboardProps {
  onLogout: () => void;
}

export function EnhancedDashboard({ onLogout }: EnhancedDashboardProps) {
  const { user } = useUser();
  const [currentView, setCurrentView] = useState<'home' | 'friends' | 'communities' | 'projects' | 'settings'>('home');
  
  // DM/Chat state
  const [selectedDMConversation, setSelectedDMConversation] = useState<string | undefined>();
  const [selectedDMUser, setSelectedDMUser] = useState<any>(null);
  
  // Community state
  const [selectedCommunity, setSelectedCommunity] = useState<string | undefined>();
  const [selectedChannel, setSelectedChannel] = useState<string | undefined>();
  const [selectedChannelData, setSelectedChannelData] = useState<any>(null);
  
  // Project state
  const [selectedProject, setSelectedProject] = useState<string | undefined>();
  const [selectedProjectData, setSelectedProjectData] = useState<any>(null);

  const handleDMSelect = (conversationId: string, otherUser: any) => {
    setSelectedDMConversation(conversationId);
    setSelectedDMUser(otherUser);
    setCurrentView('friends');
  };

  const handleChannelSelect = (communityId: string, channelId: string, channelName: string) => {
    setSelectedCommunity(communityId);
    setSelectedChannel(channelId);
    setSelectedChannelData({ name: channelName });
    setCurrentView('communities');
  };

  const handleProjectSelect = (projectId: string) => {
    setSelectedProject(projectId);
    setCurrentView('projects');
  };

  const handleChatSelect = (chat: any) => {
    if (chat) {
      setSelectedDMConversation(chat.id);
      setSelectedDMUser(chat.otherUser);
    }
    setCurrentView('friends');
  };

  const renderMainContent = () => {
    switch (currentView) {
      case 'home':
        return (
          <div className="flex-1 flex">
            <HomePanel 
              user={user} 
              onProjectSelect={handleProjectSelect}
              onChatSelect={handleChatSelect}
            />
          </div>
        );
        
      case 'friends':
        return (
          <div className="flex-1 flex">
                        <EnhancedFriendsPanel 
              onSelectDM={handleDMSelect}
            />
            <RealTimeChat 
              isDM={true}
              recipientId={selectedDMUser?.id}
              recipientName={selectedDMUser?.name}
            />
          </div>
        );
        
      case 'communities':
        return (
          <div className="flex-1 flex">
                        <EnhancedCommunityPanel
              onSelectChannel={handleChannelSelect}
            />
            {selectedChannel && selectedChannelData ? (
              <div className="flex-1 flex flex-col bg-slate-900">
                {/* Channel header */}
                <div className="p-4 border-b border-slate-700 bg-slate-800">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      {selectedChannelData.type === 'voice' ? '🔊' : '#'}
                      <h1 className="text-white text-xl font-semibold">{selectedChannelData.name}</h1>
                    </div>
                    {selectedChannelData.description && (
                      <span className="text-gray-400 text-sm">— {selectedChannelData.description}</span>
                    )}
                  </div>
                </div>
                
                {/* Channel content */}
                <div className="flex-1 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <div className="text-4xl mb-4">{selectedChannelData.type === 'voice' ? '🔊' : '💬'}</div>
                    <h3 className="text-lg font-medium mb-2">Welcome to #{selectedChannelData.name}</h3>
                    <p>
                      {selectedChannelData.type === 'voice' 
                        ? 'This is a voice channel. Click to join the conversation!'
                        : 'This is the beginning of your conversation in this channel.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-slate-900 text-gray-400">
                <div className="text-center">
                  <div className="text-4xl mb-4">💬</div>
                  <h3 className="text-lg font-medium mb-2">Select a channel</h3>
                  <p>Choose a channel from a community to start the conversation</p>
                </div>
              </div>
            )}
          </div>
        );
        
      case 'projects':
        return (
          <div className="flex-1 flex">
            <ProjectWorkspace
              selectedProject={selectedProject}
              onProjectSelect={handleProjectSelect}
            />
          </div>
        );
        
      case 'settings':
        return (
          <div className="flex-1 flex items-center justify-center bg-slate-900 text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-4">⚙️</div>
              <h3 className="text-lg font-medium mb-2">Settings</h3>
              <p>User preferences and account settings coming soon!</p>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="flex-1 flex">
            <HomePanel 
              user={user} 
              onProjectSelect={handleProjectSelect}
              onChatSelect={handleChatSelect}
            />
          </div>
        );
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* Top Navigation */}
      <EnhancedTopNav 
        user={user} 
        currentView={currentView} 
        onViewChange={setCurrentView}
        onLogout={onLogout}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          {renderMainContent()}
        </main>
        
        {/* Right Sidebar - Only show on home view */}
        {currentView === 'home' && (
          <RightSidebar user={user} currentView={currentView} />
        )}
      </div>
    </div>
  );
}