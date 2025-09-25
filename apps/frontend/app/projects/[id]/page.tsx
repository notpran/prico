"use client";
import Editor from '@monaco-editor/react';
import { useEffect, useMemo, useRef, useState } from 'react';

export default function ProjectEditorPage({ params }: { params: { id: string } }) {
  const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000/api';
  const [files, setFiles] = useState<{ path: string }[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const saveTimer = useRef<any>(null);

  useEffect(() => {
    fetch(`${base}/projects/${params.id}/files`).then(r=>r.json()).then(d=>{
      const list = d.files || [];
      setFiles(list);
      setCurrentPath(list[0]?.path || 'README.md');
    });
  }, [params.id]);

  useEffect(() => {
    if (!currentPath) return;
    fetch(`${base}/projects/${params.id}/file?path=${encodeURIComponent(currentPath)}`)
      .then(r=>r.json()).then(d=>setCode(d.content || ''));
  }, [currentPath, params.id]);

  const onChange = (v?: string) => {
    const content = v ?? '';
    setCode(content);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      fetch(`${base}/projects/${params.id}/file`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: currentPath, content })
      }).catch(()=>{});
    }, 800);
  };

  const language = useMemo(() => currentPath.endsWith('.ts') || currentPath.endsWith('.tsx') ? 'typescript' : currentPath.endsWith('.js') ? 'javascript' : 'markdown', [currentPath]);

  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: '240px 1fr' }}>
      <aside className="border rounded p-2 h-[70vh] overflow-auto">
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Files</div>
        <ul className="space-y-1">
          {files.map(f => (
            <li key={f.path}>
              <button className={`w-full text-left px-2 py-1 rounded ${currentPath === f.path ? 'bg-accent' : 'hover:bg-accent/60'}`} onClick={()=>setCurrentPath(f.path)}>
                {f.path}
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <div className="border rounded overflow-hidden">
        <Editor height="70vh" language={language} value={code} onChange={onChange} />
      </div>
    </div>
  );
}
