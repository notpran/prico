import { apiClient } from './client';

export interface Document {
  _id: string;
  title: string;
  language: string;
  content: string;
  communityId: string;
  createdBy: string;
  collaborators: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentData {
  title: string;
  language: string;
  content: string;
  communityId: string;
}

export interface ExecutionResult {
  _id: string;
  documentId: string;
  userId: string;
  language: string;
  code: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  output: string;
  error: string | null;
  executionTime: number | null;
  createdAt: string;
  updatedAt: string;
}

export const documentsApi = {
  async create(data: CreateDocumentData): Promise<Document> {
    return apiClient.post('/documents', data);
  },

  async getByCommunity(communityId: string): Promise<Document[]> {
    return apiClient.get(`/documents/community/${communityId}`);
  },

  async getById(id: string): Promise<Document> {
    return apiClient.get(`/documents/${id}`);
  },

  async update(id: string, data: Partial<CreateDocumentData>): Promise<Document> {
    return apiClient.put(`/documents/${id}`, data);
  },

  async delete(id: string): Promise<{ message: string }> {
    return apiClient.delete(`/documents/${id}`);
  },

  async addCollaborator(documentId: string, userId: string): Promise<{ message: string }> {
    return apiClient.post(`/documents/${documentId}/collaborators`, { userId });
  },

  async removeCollaborator(documentId: string, userId: string): Promise<{ message: string }> {
    return apiClient.delete(`/documents/${documentId}/collaborators/${userId}`);
  }
};

export const runsApi = {
  async execute(documentId: string): Promise<ExecutionResult> {
    return apiClient.post(`/runs/execute`, { documentId });
  },

  async getByDocument(documentId: string): Promise<ExecutionResult[]> {
    return apiClient.get(`/runs/document/${documentId}`);
  },

  async getById(id: string): Promise<ExecutionResult> {
    return apiClient.get(`/runs/${id}`);
  },

  async getAll(): Promise<ExecutionResult[]> {
    return apiClient.get('/runs');
  }
};