import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Upload, Download, Trash2, Calendar } from 'lucide-react';
import { t } from '../../lib/i18n';

interface DocItem { id: string; name: string; size: number; createdAt: number }
const K_DOCS = 'demo:orgDocs';

function getDocs(): DocItem[] { try { return JSON.parse(localStorage.getItem(K_DOCS)||'[]'); } catch { return []; } }
function setDocs(list: DocItem[]) { try { localStorage.setItem(K_DOCS, JSON.stringify(list)); } catch {} }

const OrgDocuments: React.FC = () => {
  const [docs, setList] = useState<DocItem[]>(getDocs());
  const inputRef = useRef<HTMLInputElement>(null);

  const onUpload = (file: File) => {
    const item: DocItem = { id: `${Date.now()}_${file.name}`, name: file.name, size: file.size, createdAt: Date.now() };
    const next = [item, ...docs];
    setList(next);
    setDocs(next);
  };

  const onDelete = (id: string) => {
    const next = docs.filter(d => d.id !== id);
    setList(next);
    setDocs(next);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="px-4 sm:px-6 flex flex-col gap-4 lg:gap-5 pb-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-slate-900/40 to-slate-800/20 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:shadow-md hover:shadow-accent-500/5">
        <div className="relative px-6 pt-5 pb-4 border-b border-white/10 bg-gradient-to-r from-transparent via-white/5 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 rounded-full bg-gradient-to-b from-accent-500 to-blue-500" />
              <div>
                <h1 className="text-lg font-semibold tracking-tight text-white">
                  {t('org.documents.title') || 'Documents'}
                </h1>
                <p className="text-xs text-white/60 mt-1">Organize and manage your files</p>
              </div>
            </div>

            <motion.button
              onClick={() => inputRef.current?.click()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-500/10 border border-accent-500/20 hover:border-accent-500/40 text-accent-500 font-medium text-sm transition-all"
            >
              <Upload className="w-4 h-4" />
              Upload File
            </motion.button>

            <input
              ref={inputRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onUpload(f);
                if (inputRef.current) inputRef.current.value = '';
              }}
            />
          </div>
        </div>
      </div>

      {/* Documents List */}
      {docs.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-slate-900/40 to-slate-800/20 backdrop-blur-sm transition-all duration-300 p-12 text-center"
        >
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm text-white/70 mb-1">No documents yet</p>
          <p className="text-xs text-white/50 mb-4">Upload files to organize them here</p>
          <motion.button
            onClick={() => inputRef.current?.click()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 rounded-lg bg-accent-500/10 border border-accent-500/20 hover:border-accent-500/40 text-accent-500 font-medium text-sm transition-all inline-flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload File
          </motion.button>
        </motion.div>
      ) : (
        <div className="relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-slate-900/40 to-slate-800/20 backdrop-blur-sm transition-all duration-300">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white/70 tracking-wider">
                    {t('common.name') || 'Name'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white/70 tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white/70 tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-white/70 tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {docs.map((doc, idx) => (
                  <motion.tr
                    key={doc.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-accent-500/10 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4 text-accent-500" />
                        </div>
                        <span className="text-sm font-medium text-white truncate max-w-sm">{doc.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-white/70">{formatSize(doc.size)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-white/70">
                        <Calendar className="w-3 h-3 opacity-50" />
                        {formatDate(doc.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                        >
                          <Download className="w-4 h-4 text-white/60 hover:text-accent-500" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onDelete(doc.id)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-white/60 hover:text-red-400" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upload Button (Mobile) */}
      <motion.button
        onClick={() => inputRef.current?.click()}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="sm:hidden w-full px-4 py-2.5 rounded-lg bg-accent-500/10 border border-accent-500/20 hover:border-accent-500/40 text-accent-500 font-medium text-sm transition-all flex items-center justify-center gap-2"
      >
        <Upload className="w-4 h-4" />
        Upload File
      </motion.button>

      {/* Storage Info */}
      {docs.length > 0 && (
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-slate-900/40 to-slate-800/20 backdrop-blur-sm hover:border-white/20 hover:shadow-md transition-all duration-300 p-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white mb-1">Storage Info</p>
              <p className="text-xs text-white/60">
                {docs.length} file{docs.length !== 1 ? 's' : ''} · {formatSize(docs.reduce((sum, d) => sum + d.size, 0))} total
              </p>
            </div>
            <FileText className="w-8 h-8 opacity-20" />
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default OrgDocuments;
