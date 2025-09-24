"use client";

import React, { useState, useEffect } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { 
  Users, 
  UserPlus, 
  MessageCircle, 
  Check, 
  X, 
  Search,
  Send,
  MoreHorizontal
} from "lucide-react";
import UserSync from "./UserSync";

interface User {
  _id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
}

interface FriendRequest {
  _id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
}

interface DM {
  dm_id: string;
  participant: User;
  last_message?: {
    content: string;
    created_at: string;
    sender_id: string;
  };
  updated_at: string;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
}

export default function FriendsClient() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [activeTab, setActiveTab] = useState<"friends" | "requests" | "dms">("friends");
  const [friends, setFriends] = useState<User[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [dms, setDMs] = useState<DM[]>([]);
  const [activeDM, setActiveDM] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchUsername, setSearchUsername] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const getAuthHeaders = async () => {
    const token = await getToken();
    return {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  const fetchFriends = async () => {
    if (!user) return;
    
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}/users/me`, { headers });
      if (response.ok) {
        const userData = await response.json();
        // Friends list would be in the user data - need to fetch friend details
        if (userData.friends && userData.friends.length > 0) {
          const friendsData = await Promise.all(
            userData.friends.map(async (friendId: string) => {
              const friendResponse = await fetch(`${API_BASE}/users/${friendId}`, { headers });
              if (friendResponse.ok) {
                return await friendResponse.json();
              }
              return null;
            })
          );
          setFriends(friendsData.filter(Boolean));
        }
        
        // Fetch friend requests
        if (userData.friend_requests_received && userData.friend_requests_received.length > 0) {
          const requestsData = await Promise.all(
            userData.friend_requests_received.map(async (requesterId: string) => {
              const requesterResponse = await fetch(`${API_BASE}/users/${requesterId}`, { headers });
              if (requesterResponse.ok) {
                return await requesterResponse.json();
              }
              return null;
            })
          );
          setFriendRequests(requestsData.filter(Boolean));
        }
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

  const fetchDMs = async () => {
    if (!user) return;
    
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}/messages/dms`, { headers });
      if (response.ok) {
        const dmsData = await response.json();
        setDMs(dmsData);
      }
    } catch (error) {
      console.error("Error fetching DMs:", error);
    }
  };

  const fetchMessages = async (dmId: string) => {
    if (!user) return;
    
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}/messages/dm/${dmId}`, { headers });
      if (response.ok) {
        const messagesData = await response.json();
        setMessages(messagesData);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const sendFriendRequest = async (friendId: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      const userData = await fetchCurrentUser();
      if (!userData) return;
      
  const response = await fetch(`${API_BASE}/users/${userData._id}/friends/request/${friendId}`, {
        method: "POST",
        headers,
      });
      
      if (response.ok) {
        alert("Friend request sent!");
        setSearchResults([]); // Clear search results
        setSearchUsername(""); // Clear search input
      } else {
        const error = await response.json();
        alert(error.detail || "Failed to send friend request");
      }
    } catch (error) {
      console.error("Error sending friend request:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequestByUsername = async (username: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      // First search for the user by username
      const searchResponse = await fetch(`${API_BASE}/users/search?q=${encodeURIComponent(username)}`, { 
        headers 
      });
      
      if (searchResponse.ok) {
        const results = await searchResponse.json();
        const exactMatch = results.find((u: User) => u.username.toLowerCase() === username.toLowerCase());
        
        if (exactMatch) {
          await sendFriendRequest(exactMatch._id);
        } else {
          alert("User not found");
        }
      } else {
        alert("Failed to search for user");
      }
    } catch (error) {
      console.error("Error sending friend request by username:", error);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (query: string) => {
    if (!user || query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}/users/search?q=${encodeURIComponent(query)}`, { 
        headers 
      });
      if (response.ok) {
        const results = await response.json();
        setSearchResults(results);
      }
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  const fetchCurrentUser = async () => {
    if (!user) return null;
    
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}/users/me`, { headers });
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
    return null;
  };

  const acceptFriendRequest = async (requesterId: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      const userData = await fetchCurrentUser();
      if (!userData) return;
      
  const response = await fetch(`${API_BASE}/users/${userData._id}/friends/accept/${requesterId}`, {
        method: "POST",
        headers,
      });
      
      if (response.ok) {
        alert("Friend request accepted!");
        await fetchFriends(); // Refresh friends and requests
      } else {
        const error = await response.json();
        alert(error.detail || "Failed to accept friend request");
      }
    } catch (error) {
      console.error("Error accepting friend request:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeFriend = async (friendId: string) => {
    if (!user) return;
    
    if (!confirm("Are you sure you want to remove this friend?")) return;
    
    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      const userData = await fetchCurrentUser();
      if (!userData) return;
      
  const response = await fetch(`${API_BASE}/users/${userData._id}/friends/${friendId}`, {
        method: "DELETE",
        headers,
      });
      
      if (response.ok) {
        alert("Friend removed!");
        await fetchFriends(); // Refresh friends list
      } else {
        const error = await response.json();
        alert(error.detail || "Failed to remove friend");
      }
    } catch (error) {
      console.error("Error removing friend:", error);
    } finally {
      setLoading(false);
    }
  };

  const createOrGetDM = async (friendId: string) => {
    if (!user) return;
    
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}/messages/dm`, {
        method: "POST",
        headers,
        body: JSON.stringify({ participant_id: friendId }),
      });
      
      if (response.ok) {
        const result = await response.json();
        setActiveDM(result.dm_id);
        setActiveTab("dms");
        await fetchMessages(result.dm_id);
        await fetchDMs(); // Refresh DMs list
      }
    } catch (error) {
      console.error("Error creating DM:", error);
    }
  };

  const sendMessage = async () => {
    if (!user || !activeDM || !newMessage.trim()) return;
    
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}/messages/`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          content: newMessage,
          dm_id: activeDM,
        }),
      });
      
      if (response.ok) {
        setNewMessage("");
        await fetchMessages(activeDM);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  useEffect(() => {
    if (isLoaded && user) {
      fetchFriends();
      fetchDMs();
    }
  }, [isLoaded, user]);

  useEffect(() => {
    if (activeDM) {
      fetchMessages(activeDM);
    }
  }, [activeDM]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Please sign in to view friends.</div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-background text-foreground">
      <UserSync />
      {/* Sidebar */}
      <div className="w-80 bg-card border-r border-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Users size={24} />
            Friends & DMs
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab("friends")}
            className={`flex-1 p-3 text-sm font-medium transition-colors ${
              activeTab === "friends" 
                ? "bg-accent text-accent-foreground" 
                : "hover:bg-accent/50"
            }`}
          >
            Friends ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`flex-1 p-3 text-sm font-medium transition-colors ${
              activeTab === "requests" 
                ? "bg-accent text-accent-foreground" 
                : "hover:bg-accent/50"
            }`}
          >
            Requests ({friendRequests.length})
          </button>
          <button
            onClick={() => setActiveTab("dms")}
            className={`flex-1 p-3 text-sm font-medium transition-colors ${
              activeTab === "dms" 
                ? "bg-accent text-accent-foreground" 
                : "hover:bg-accent/50"
            }`}
          >
            DMs ({dms.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "friends" && (
            <div className="p-4 space-y-4">
              {/* Add Friend */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Add Friend</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Search username..."
                      value={searchUsername}
                      onChange={(e) => {
                        setSearchUsername(e.target.value);
                        searchUsers(e.target.value);
                      }}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          if (searchResults.length === 1) {
                            sendFriendRequest(searchResults[0]._id);
                          } else if (searchResults.length === 0 && searchUsername.trim()) {
                            // Try to send friend request by username
                            sendFriendRequestByUsername(searchUsername.trim());
                          }
                        }
                      }}
                      className="flex-1 px-3 py-2 bg-input border border-border rounded-md focus:ring-2 focus:ring-ring outline-none"
                    />
                    {(searchUsername.trim() || searchResults.length > 0) && (
                      <button
                        onClick={() => {
                          if (searchResults.length === 1) {
                            sendFriendRequest(searchResults[0]._id);
                          } else if (searchResults.length === 0 && searchUsername.trim()) {
                            sendFriendRequestByUsername(searchUsername.trim());
                          }
                        }}
                        disabled={loading || !searchUsername.trim()}
                        className="px-4 py-2 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground rounded-md flex items-center gap-2"
                      >
                        <UserPlus size={16} />
                        Add
                      </button>
                    )}
                  </div>
                  
                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <div className="bg-card rounded border border-border max-h-48 overflow-y-auto">
                      {searchResults.map((searchUser) => (
                        <div key={searchUser._id} className="flex items-center justify-between p-3 hover:bg-accent/50">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground">
                              {searchUser.full_name?.[0] || searchUser.username[0]}
                            </div>
                            <div>
                              <div className="font-medium">{searchUser.full_name || searchUser.username}</div>
                              <div className="text-sm text-muted-foreground">@{searchUser.username}</div>
                            </div>
                          </div>
                          <button
                            onClick={() => sendFriendRequest(searchUser._id)}
                            disabled={loading}
                            className="px-3 py-1 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground rounded text-sm flex items-center gap-2"
                          >
                            <UserPlus size={14} />
                            Add
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Friends List */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Friends</h3>
                {friends.map((friend) => (
                  <div key={friend._id} className="flex items-center justify-between p-3 bg-card rounded border">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground">
                        {friend.full_name?.[0] || friend.username[0]}
                      </div>
                      <div>
                        <div className="font-medium">{friend.full_name || friend.username}</div>
                        <div className="text-sm text-muted-foreground">@{friend.username}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => createOrGetDM(friend._id)}
                        className="p-2 hover:bg-accent rounded"
                        title="Send message"
                      >
                        <MessageCircle size={16} />
                      </button>
                      <button
                        onClick={() => removeFriend(friend._id)}
                        className="p-2 hover:bg-destructive rounded text-destructive-foreground"
                        title="Remove friend"
                        disabled={loading}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                {friends.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    No friends yet. Add some friends to get started!
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "requests" && (
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Friend Requests</h3>
                {friendRequests.map((request) => (
                  <div key={request._id} className="flex items-center justify-between p-3 bg-card rounded border">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-secondary-foreground">
                        {request.full_name?.[0] || request.username[0]}
                      </div>
                      <div>
                        <div className="font-medium">{request.full_name || request.username}</div>
                        <div className="text-sm text-muted-foreground">@{request.username}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => acceptFriendRequest(request._id)}
                        disabled={loading}
                        className="p-2 hover:bg-green-100 dark:hover:bg-green-900 rounded text-green-600 dark:text-green-400"
                        title="Accept"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => {/* TODO: Decline friend request */}}
                        disabled={loading}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded text-red-600 dark:text-red-400"
                        title="Decline"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                {friendRequests.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    No pending friend requests
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "dms" && (
            <div className="space-y-1">
              {dms.map((dm) => (
                <button
                  key={dm.dm_id}
                  onClick={() => setActiveDM(dm.dm_id)}
                  className={`w-full p-3 text-left hover:bg-accent transition-colors ${
                    activeDM === dm.dm_id ? "bg-accent" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white">
                      {dm.participant.full_name?.[0] || dm.participant.username[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {dm.participant.full_name || dm.participant.username}
                      </div>
                      {dm.last_message && (
                        <div className="text-sm text-muted-foreground truncate">
                          {dm.last_message.content}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
              {dms.length === 0 && (
                <div className="text-center text-muted-foreground py-8 px-4">
                  No DMs yet. Click the message icon next to a friend to start chatting!
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeDM ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-card">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white">
                  {dms.find(dm => dm.dm_id === activeDM)?.participant.full_name?.[0] || 
                   dms.find(dm => dm.dm_id === activeDM)?.participant.username[0]}
                </div>
                <div>
                  <div className="font-medium">
                    {dms.find(dm => dm.dm_id === activeDM)?.participant.full_name || 
                     dms.find(dm => dm.dm_id === activeDM)?.participant.username}
                  </div>
                  <div className="text-sm text-muted-foreground">Direct Message</div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div key={message._id} className="flex gap-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 text-primary-foreground">
                    {message.sender_id === user.id ? user.firstName?.[0] || "You" : "F"}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">
                        {message.sender_id === user.id ? "You" : "Friend"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(message.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-foreground">{message.content}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  className="flex-1 px-4 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring outline-none"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="px-4 py-2 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground rounded-lg"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a DM to start chatting
          </div>
        )}
      </div>
    </div>
  );
}
