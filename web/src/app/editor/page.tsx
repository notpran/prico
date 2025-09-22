'use client';

import { useEffect, useRef } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco';
import Editor from '@monaco-editor/react';

export default function EditorPage() {
  const editorRef = useRef<any>(null);
  const ydocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<WebsocketProvider | null>(null);
  const bindingRef = useRef<MonacoBinding | null>(null);

  useEffect(() => {
    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    const provider = new WebsocketProvider(process.env.NEXT_PUBLIC_Y_WEBSOCKET_URL || 'ws://localhost:1234', 'monaco-demo', ydoc);
    providerRef.current = provider;

    provider.on('status', (event: any) => {
      console.log('WebSocket status:', event.status);
    });

    return () => {
      if (bindingRef.current) {
        bindingRef.current.destroy();
      }
      if (providerRef.current) {
        providerRef.current.destroy();
      }
      if (ydocRef.current) {
        ydocRef.current.destroy();
      }
    };
  }, []);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;

    if (ydocRef.current && providerRef.current) {
      const ytext = ydocRef.current.getText('monaco');
      const binding = new MonacoBinding(ytext, editorRef.current.getModel(), new Set([editorRef.current]), providerRef.current.awareness);
      bindingRef.current = binding;
    }
  };

  return (
    <div className="h-screen">
      <Editor
        height="100%"
        defaultLanguage="javascript"
        defaultValue="// Collaborative Monaco Editor with Yjs
function hello() {
  console.log('Hello, Prico!');
}"
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
        }}
      />
    </div>
  );
}