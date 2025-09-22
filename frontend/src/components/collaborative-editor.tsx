import React, { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco';

interface CollaborativeEditorProps {
  roomId: string;
  language?: string;
  value?: string;
}

export function CollaborativeEditor({ roomId, language = 'javascript', value = '' }: CollaborativeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const ydocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<WebsocketProvider | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    // Initialize Yjs document
    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    // Connect to Yjs WebSocket provider
    const provider = new WebsocketProvider('ws://localhost:3000/yjs', roomId, ydoc);
    providerRef.current = provider;

    // Create Monaco editor
    const editor = monaco.editor.create(editorRef.current, {
      value,
      language,
      theme: 'vs-dark',
      automaticLayout: true,
    });
    monacoRef.current = editor;

    // Bind Yjs to Monaco
    const binding = new MonacoBinding(ydoc.getText('monaco'), editor.getModel()!, provider.awareness, provider);

    return () => {
      if (monacoRef.current) {
        monacoRef.current.dispose();
      }
      if (providerRef.current) {
        providerRef.current.destroy();
      }
      if (ydocRef.current) {
        ydocRef.current.destroy();
      }
    };
  }, [roomId, language, value]);

  return <div ref={editorRef} style={{ height: '400px', width: '100%' }} />;
}