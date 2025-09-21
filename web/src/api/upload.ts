import { apiClient } from './client';

export interface UploadResponse {
  message: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  url: string;
}

export const uploadApi = {
  async uploadFile(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    return apiClient.upload<UploadResponse>('/upload', formData);
  },

  async uploadMultipleFiles(files: File[]): Promise<UploadResponse[]> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    
    return apiClient.upload<UploadResponse[]>('/upload/multiple', formData);
  },

  getFileUrl(filename: string): string {
    return `http://localhost:3001/uploads/${filename}`;
  }
};