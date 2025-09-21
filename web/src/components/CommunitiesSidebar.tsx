import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Plus, Hash, Lock, Users, Settings } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Community } from '../api/communities';

interface CommunitiesSidebarProps {
  className?: string;
}

export const CommunitiesSidebar: React.FC<CommunitiesSidebarProps> = ({ className }) => {
  const { 
    communities, 
    currentCommunity, 
    setCurrentCommunity, 
    loadingCommunities,
    createCommunity 
  } = useApp();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCommunityData, setNewCommunityData] = useState({
    name: '',
    description: '',
    type: 'public' as 'public' | 'private',
    category: 'general',
    tags: [] as string[]
  });

  const handleCreateCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCommunity(newCommunityData);
      setShowCreateForm(false);
      setNewCommunityData({
        name: '',
        description: '',
        type: 'public',
        category: 'general',
        tags: []
      });
    } catch (error) {
      console.error('Failed to create community:', error);
    }
  };

  const handleCommunitySelect = (community: Community) => {
    setCurrentCommunity(community);
  };

  return (
    <div className={`${className} bg-slate-800 border-r border-slate-700 flex flex-col`}>
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-semibold">Communities</h2>
          <Button
            onClick={() => setShowCreateForm(true)}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white hover:bg-slate-700"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Create Community Form */}
      {showCreateForm && (
        <div className="p-4 border-b border-slate-700 bg-slate-750">
          <form onSubmit={handleCreateCommunity} className="space-y-3">
            <Input
              placeholder="Community name"
              value={newCommunityData.name}
              onChange={(e) => setNewCommunityData(prev => ({ ...prev, name: e.target.value }))}
              className="bg-slate-700 border-slate-600 text-white text-sm"
              required
            />
            <Input
              placeholder="Description"
              value={newCommunityData.description}
              onChange={(e) => setNewCommunityData(prev => ({ ...prev, description: e.target.value }))}
              className="bg-slate-700 border-slate-600 text-white text-sm"
              required
            />
            <select
              value={newCommunityData.type}
              onChange={(e) => setNewCommunityData(prev => ({ ...prev, type: e.target.value as 'public' | 'private' }))}
              className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white text-sm"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
            <div className="flex gap-2">
              <Button
                type="submit"
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-xs"
              >
                Create
              </Button>
              <Button
                type="button"
                onClick={() => setShowCreateForm(false)}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white text-xs"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Communities List */}
      <div className="flex-1 overflow-y-auto">
        {loadingCommunities ? (
          <div className="p-4 text-center text-gray-400">
            <p>Loading communities...</p>
          </div>
        ) : communities.length === 0 ? (
          <div className="p-4 text-center text-gray-400">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No communities yet</p>
            <p className="text-xs mt-1">Create your first community!</p>
          </div>
        ) : (
          <div className="p-2">
            {communities.map((community) => (
              <button
                key={community._id}
                onClick={() => handleCommunitySelect(community)}
                className={`w-full p-3 rounded-lg text-left transition-colors mb-1 ${
                  currentCommunity?._id === community._id
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {community.type === 'private' ? (
                      <Lock className="w-4 h-4" />
                    ) : (
                      <Hash className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{community.name}</p>
                    <p className="text-xs opacity-75 truncate">{community.description}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700">
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-gray-400 hover:text-white hover:bg-slate-700 justify-start"
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </div>
    </div>
  );
};