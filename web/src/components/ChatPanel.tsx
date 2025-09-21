import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Send, Phone, Video, Users } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { Message } from '../api/socket';

interface ChatPanelProps {
  className?: string;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ className }) => {
  const { user } = useAuth();
  const { currentCommunity, messages, sendMessage } = useApp();
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentMessages = currentCommunity ? messages[currentCommunity._id] || [] : [];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !currentCommunity) return;

    sendMessage(currentCommunity._id, messageInput.trim());
    setMessageInput('');
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!currentCommunity) {
    return (
      <div className={`${className} flex items-center justify-center bg-slate-900 text-gray-400`}>
        <div className="text-center">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Select a community to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} flex flex-col bg-slate-900`}>
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div>
          <h3 className="text-white font-semibold">{currentCommunity.name}</h3>
          <p className="text-gray-400 text-sm">{currentCommunity.description}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white hover:bg-slate-800"
          >
            <Phone className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white hover:bg-slate-800"
          >
            <Video className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {currentMessages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          currentMessages.map((message: Message) => (
            <div key={message._id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                {message.author.displayName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-medium text-sm">
                    {message.author.displayName}
                  </span>
                  <span className="text-gray-400 text-xs">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
                <div className="text-gray-300 text-sm">
                  {message.content}
                </div>
                {message.fileAttachment && (
                  <div className="mt-2 p-2 bg-slate-800 rounded-md text-sm">
                    <p className="text-blue-400">📎 {message.fileAttachment.originalName}</p>
                    <p className="text-gray-400 text-xs">
                      {(message.fileAttachment.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-700">
        <div className="flex gap-2">
          <Input
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder={`Message ${currentCommunity.name}`}
            className="flex-1 bg-slate-800 border-slate-600 text-white placeholder:text-gray-400"
          />
          <Button
            type="submit"
            disabled={!messageInput.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};