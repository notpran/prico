import { apiClient } from './client';

export interface Community {
  _id: string;
  name: string;
  description: string;
  type: 'public' | 'private';
  category: string;
  tags: string[];
  owner: string;
  admins: string[];
  moderators: string[];
  members: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommunityData {
  name: string;
  description: string;
  type: 'public' | 'private';
  category: string;
  tags: string[];
}

export interface CommunityMember {
  userId: string;
  role: 'owner' | 'admin' | 'moderator' | 'member';
}

export const communitiesApi = {
  async create(data: CreateCommunityData): Promise<Community> {
    return apiClient.post('/communities', data);
  },

  async getAll(): Promise<Community[]> {
    return apiClient.get('/communities');
  },

  async getById(id: string): Promise<Community> {
    return apiClient.get(`/communities/${id}`);
  },

  async update(id: string, data: Partial<CreateCommunityData>): Promise<Community> {
    return apiClient.put(`/communities/${id}`, data);
  },

  async delete(id: string): Promise<{ message: string }> {
    return apiClient.delete(`/communities/${id}`);
  },

  async join(id: string): Promise<{ message: string }> {
    return apiClient.post(`/communities/${id}/join`);
  },

  async leave(id: string): Promise<{ message: string }> {
    return apiClient.post(`/communities/${id}/leave`);
  },

  async updateMemberRole(
    communityId: string, 
    userId: string, 
    role: 'admin' | 'moderator' | 'member'
  ): Promise<{ message: string }> {
    return apiClient.put(`/communities/${communityId}/members/${userId}/role`, { role });
  },

  async removeMember(communityId: string, userId: string): Promise<{ message: string }> {
    return apiClient.delete(`/communities/${communityId}/members/${userId}`);
  }
};