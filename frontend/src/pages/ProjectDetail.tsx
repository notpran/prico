import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProject, getProjectFiles, type Project, type RepoFile } from '../services/project';
import FileViewer from '../components/FileViewer';
import Chat from '../components/Chat';
import './ProjectDetail.css';

const ProjectDetail: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [files, setFiles] = useState<RepoFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<RepoFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!projectId) return;

    const fetchProjectData = async () => {
      try {
        setLoading(true);
        const projectData = await getProject(projectId);
        setProject(projectData);
        const filesData = await getProjectFiles(projectId);
        setFiles(filesData);
      } catch (err) {
        setError('Failed to fetch project details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId]);

  const getLanguage = (fileName: string) => {
    const extension = fileName.split('.').pop();
    switch (extension) {
      case 'js':
        return 'javascript';
      case 'ts':
        return 'typescript';
      case 'py':
        return 'python';
      case 'java':
        return 'java';
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      default:
        return 'plaintext';
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  if (!project) {
    return <div>Project not found.</div>;
  }

  return (
    <div className="project-detail-container">
      <div className="sidebar">
        <header className="project-detail-header">
          <h1>{project.name}</h1>
          <p>{project.description}</p>
        </header>
        <div className="file-list">
          <h2>Files</h2>
          {files.length > 0 ? (
            <ul>
              {files.map((file) => (
                <li key={file.id} onClick={() => setSelectedFile(file)}>
                  {file.name}
                </li>
              ))}
            </ul>
          ) : (
            <p>No files in this project yet.</p>
          )}
        </div>
      </div>
      <main className="main-content">
        {selectedFile ? (
          <FileViewer
            fileName={selectedFile.name}
            fileContent={selectedFile.content}
            language={getLanguage(selectedFile.name)}
          />
        ) : (
          <div className="no-file-selected">
            <p>Select a file to view its content.</p>
          </div>
        )}
      </main>
      <div className="chat-sidebar">
        <Chat />
      </div>
    </div>
  );
};

export default ProjectDetail;
