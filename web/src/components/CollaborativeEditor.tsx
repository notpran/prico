import React, { useRef, useEffect } from 'react';
import * as Y from 'yjs';
import { MonacoBinding } from 'y-monaco';
import * as monaco from 'monaco-editor';
import { SocketIOProvider } from 'y-socket.io';
import { socketManager } from '../api/socket';
import { documentsApi } from '../api/documents';

interface CollaborativeEditorProps {
  documentId: string;
  language?: string;
  onSave?: (content: string) => void;
}

const CollaborativeEditor: React.FC<CollaborativeEditorProps> = ({ 
  documentId, 
  language = 'javascript',
  onSave 
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const editorInstanceRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    const initializeEditor = async () => {
      try {
        // Load document content from API
        const document = await documentsApi.getById(documentId);
        
        const ydoc = new Y.Doc();
        
        // Use socketManager's socket instance for collaboration
        if (socketManager.isConnected()) {
          const provider = new SocketIOProvider(
            'http://localhost:3001',
            `document:${documentId}`, 
            ydoc,
            {
              auth: { token: localStorage.getItem('accessToken') }
            }
          );
          
          const ytext = ydoc.getText('monaco');

          const editor = monaco.editor.create(editorRef.current!, {
            value: document.content,
            language: document.language || language,
            theme: 'vs-dark',
            automaticLayout: true,
            fontSize: 14,
            wordWrap: 'on',
            minimap: { enabled: false },
          });

          editorInstanceRef.current = editor;

          const monacoBinding = new MonacoBinding(
            ytext,
            editor.getModel()!,
            new Set([editor]),
            provider.awareness
          );

          // Join document for collaboration
          socketManager.joinDocument(documentId);

          // Auto-save on content change with debounce
          let saveTimeout: number;
          editor.onDidChangeModelContent(() => {
            if (onSave) {
              clearTimeout(saveTimeout);
              saveTimeout = window.setTimeout(() => {
                onSave(editor.getValue());
              }, 1000); // Save after 1 second of inactivity
            }
          });

          return () => {
            clearTimeout(saveTimeout);
            socketManager.leaveDocument(documentId);
            monacoBinding.destroy();
            editor.dispose();
            provider.destroy();
          };
        }
      } catch (error) {
        console.error('Failed to initialize collaborative editor:', error);
      }
    };

    initializeEditor();

    return () => {
      if (editorInstanceRef.current) {
        editorInstanceRef.current.dispose();
      }
    };
  }, [documentId, language, onSave]);

  return <div ref={editorRef} style={{ height: '100%', width: '100%' }} />;
};

export default CollaborativeEditor;
