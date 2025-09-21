import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './FileViewer.css';

interface FileViewerProps {
  fileName: string;
  fileContent: string;
  language: string;
}

const FileViewer: React.FC<FileViewerProps> = ({ fileName, fileContent, language }) => {
  return (
    <div className="file-viewer">
      <h3>{fileName}</h3>
      <SyntaxHighlighter language={language} style={materialDark} showLineNumbers>
        {fileContent}
      </SyntaxHighlighter>
    </div>
  );
};

export default FileViewer;
