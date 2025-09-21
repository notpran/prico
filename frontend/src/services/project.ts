import api from './api';

export interface Project {
  id: string;
  name: string;
  description: string;
  owner_id: string;
}

export interface RepoFile {
  id: string;
  name: string;
  content: string;
  project_id: string;
}

export const getProjects = async (): Promise<Project[]> => {
  const token = localStorage.getItem('token');
  const response = await api.get('/project/', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const getProject = async (projectId: string): Promise<Project> => {
  const token = localStorage.getItem('token');
  const response = await api.get(`/project/${projectId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const getProjectFiles = async (projectId: string): Promise<RepoFile[]> => {
  const token = localStorage.getItem('token');
  const response = await api.get(`/project/${projectId}/files`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const createProject = async (name: string, description: string): Promise<Project> => {
  const token = localStorage.getItem('token');
  const response = await api.post('/project/', {
    name,
    description,
  }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
