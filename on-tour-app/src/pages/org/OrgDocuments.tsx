import React, { useRef, useState } from 'react';
import { t } from '../../lib/i18n';

interface DocItem { id: string; name: string; size: number; createdAt: number }
const K_DOCS = 'demo:orgDocs';

function getDocs(): DocItem[] { try { return JSON.parse(localStorage.getItem(K_DOCS)||'[]'); } catch { return []; } }
function setDocs(list: DocItem[]) { try { localStorage.setItem(K_DOCS, JSON.stringify(list)); } catch {} }

const OrgDocuments: React.FC = () => {
  const [docs, setList] = useState<DocItem[]>(getDocs());
  const inputRef = useRef<HTMLInputElement>(null);
  const onUpload = (file: File) => {
    // demo: we don't store file content, only metadata
    const item: DocItem = { id: `${Date.now()}_${file.name}` , name: file.name, size: file.size, createdAt: Date.now() };
    const next = [item, ...docs];
    setList(next); setDocs(next);
  };
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{t('org.documents.title')||'Documents'}</h2>
      <div className="flex items-center gap-2">
        <input ref={inputRef} type="file" className="hidden" onChange={(e)=>{ const f=e.target.files?.[0]; if(f) onUpload(f); if(inputRef.current) inputRef.current.value=''; }} />
        <button className="btn" onClick={()=> inputRef.current?.click()}>{t('common.import')||'Import'}</button>
      </div>
      <ul className="glass rounded border border-white/10 divide-y divide-white/10">
        {docs.map(d => (
          <li key={d.id} className="px-3 py-2 flex items-center justify-between text-sm">
            <span>{d.name}</span>
            <span className="text-xs opacity-70">{(d.size/1024).toFixed(1)} KB · {new Date(d.createdAt).toLocaleString()}</span>
          </li>
        ))}
        {docs.length===0 && <li className="px-3 py-2 text-xs opacity-70">No documents yet</li>}
      </ul>
    </div>
  );
};

export default OrgDocuments;
