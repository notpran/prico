import { apiClient } from './client';

export interface Repository {
  _id: string;
  name: string;
  description: string;
  isPrivate: boolean;
  owner: string;
  collaborators: string[];
  forks: string[];
  commits: Commit[];
  createdAt: string;
  updatedAt: string;
}

export interface Commit {
  sha: string;
  message: string;
  author: {
    name: string;
    email: string;
  };
  timestamp: string;
  changes: {
    added: string[];
    modified: string[];
    deleted: string[];
  };
}

export interface PullRequest {
  _id: string;
  title: string;
  description: string;
  status: 'open' | 'closed' | 'merged';
  sourceRepo: string;
  targetRepo: string;
  sourceBranch: string;
  targetBranch: string;
  author: string;
  reviewers: string[];
  commits: string[];
  diff: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRepoData {
  name: string;
  description: string;
  isPrivate: boolean;
}

export interface CreatePullRequestData {
  title: string;
  description: string;
  targetRepo: string;
  sourceBranch: string;
  targetBranch: string;
}

export const gitApi = {
  // Repository operations
  async createRepo(data: CreateRepoData): Promise<Repository> {
    return apiClient.post('/git/repos', data);
  },

  async getAllRepos(): Promise<Repository[]> {
    return apiClient.get('/git/repos');
  },

  async getRepoById(id: string): Promise<Repository> {
    return apiClient.get(`/git/repos/${id}`);
  },

  async updateRepo(id: string, data: Partial<CreateRepoData>): Promise<Repository> {
    return apiClient.put(`/git/repos/${id}`, data);
  },

  async deleteRepo(id: string): Promise<{ message: string }> {
    return apiClient.delete(`/git/repos/${id}`);
  },

  async forkRepo(id: string): Promise<Repository> {
    return apiClient.post(`/git/repos/${id}/fork`);
  },

  async addCollaborator(repoId: string, userId: string): Promise<{ message: string }> {
    return apiClient.post(`/git/repos/${repoId}/collaborators`, { userId });
  },

  async removeCollaborator(repoId: string, userId: string): Promise<{ message: string }> {
    return apiClient.delete(`/git/repos/${repoId}/collaborators/${userId}`);
  },

  // Commit operations
  async getCommits(repoId: string): Promise<Commit[]> {
    return apiClient.get(`/git/repos/${repoId}/commits`);
  },

  async createCommit(repoId: string, data: { message: string; files: any[] }): Promise<Commit> {
    return apiClient.post(`/git/repos/${repoId}/commits`, data);
  },

  // Pull request operations
  async createPullRequest(data: CreatePullRequestData): Promise<PullRequest> {
    return apiClient.post('/git/pull-requests', data);
  },

  async getAllPullRequests(): Promise<PullRequest[]> {
    return apiClient.get('/git/pull-requests');
  },

  async getPullRequestById(id: string): Promise<PullRequest> {
    return apiClient.get(`/git/pull-requests/${id}`);
  },

  async updatePullRequestStatus(
    id: string, 
    status: 'open' | 'closed' | 'merged'
  ): Promise<PullRequest> {
    return apiClient.put(`/git/pull-requests/${id}/status`, { status });
  },

  async addReviewer(pullRequestId: string, userId: string): Promise<{ message: string }> {
    return apiClient.post(`/git/pull-requests/${pullRequestId}/reviewers`, { userId });
  },

  async removeReviewer(pullRequestId: string, userId: string): Promise<{ message: string }> {
    return apiClient.delete(`/git/pull-requests/${pullRequestId}/reviewers/${userId}`);
  }
};