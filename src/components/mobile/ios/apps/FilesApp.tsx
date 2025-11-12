import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FileText, Image, FileVideo, FileAudio, Download, Search, FolderOpen, File } from 'lucide-react';
import { usePullToRefresh } from '../../../../hooks/usePullToRefresh';
import { haptic } from '../../../../lib/haptics';

interface FileItem {
  id: string;
  name: string;
  type: 'contract' | 'invoice' | 'rider' | 'photo' | 'video' | 'other';
  category: string;
  size: string;
  date: string;
  url?: string;
}

const mockFiles: FileItem[] = [
  {
    id: '1',
    name: 'Venue Contract - Madrid Arena.pdf',
    type: 'contract',
    category: 'Contracts',
    size: '2.4 MB',
    date: '2024-11-15'
  },
  {
    id: '2',
    name: 'Technical Rider 2024.pdf',
    type: 'rider',
    category: 'Riders',
    size: '1.8 MB',
    date: '2024-11-10'
  },
  {
    id: '3',
    name: 'Invoice #1234 - Barcelona Show.pdf',
    type: 'invoice',
    category: 'Invoices',
    size: '156 KB',
    date: '2024-11-08'
  },
  {
    id: '4',
    name: 'Stage Setup Photo.jpg',
    type: 'photo',
    category: 'Photos',
    size: '3.2 MB',
    date: '2024-11-05'
  },
  {
    id: '5',
    name: 'Soundcheck Recording.mp4',
    type: 'video',
    category: 'Videos',
    size: '45 MB',
    date: '2024-11-01'
  },
  {
    id: '6',
    name: 'Contract - Lisbon Festival.pdf',
    type: 'contract',
    category: 'Contracts',
    size: '1.9 MB',
    date: '2024-10-28'
  },
  {
    id: '7',
    name: 'Insurance Policy.pdf',
    type: 'other',
    category: 'Documents',
    size: '890 KB',
    date: '2024-10-20'
  },
  {
    id: '8',
    name: 'Backstage Photos.jpg',
    type: 'photo',
    category: 'Photos',
    size: '2.1 MB',
    date: '2024-10-15'
  }
];

export const FilesApp: React.FC = () => {
  const [files, setFiles] = useState(mockFiles);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);

  const handleRefresh = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    haptic('success');
  };

  const { isRefreshing } = usePullToRefresh({ onRefresh: handleRefresh });

  const categories = useMemo(() => {
    const cats = new Set(files.map(f => f.category));
    return ['all', ...Array.from(cats)];
  }, [files]);

  const filteredFiles = useMemo(() => {
    return files.filter(file => {
      const matchesCategory = selectedCategory === 'all' || file.category === selectedCategory;
      const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [files, selectedCategory, searchQuery]);

  const getFileIcon = (type: FileItem['type']) => {
    switch (type) {
      case 'contract':
      case 'invoice':
      case 'rider':
        return FileText;
      case 'photo':
        return Image;
      case 'video':
        return FileVideo;
      default:
        return File;
    }
  };

  const getFileColor = (type: FileItem['type']) => {
    switch (type) {
      case 'contract':
        return 'from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-400';
      case 'invoice':
        return 'from-green-500/20 to-green-600/20 border-green-500/30 text-green-400';
      case 'rider':
        return 'from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-400';
      case 'photo':
        return 'from-pink-500/20 to-pink-600/20 border-pink-500/30 text-pink-400';
      case 'video':
        return 'from-red-500/20 to-red-600/20 border-red-500/30 text-red-400';
      default:
        return 'from-gray-500/20 to-gray-600/20 border-gray-500/30 text-gray-400';
    }
  };

  const handleDownload = (file: FileItem) => {
    haptic('success');
    console.log('Downloading:', file.name);
  };

  return (
    <div className="h-full bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white flex flex-col">
      {/* Header - Desktop Style */}
      <div className="sticky top-0 z-10 bg-gray-900/60 backdrop-blur-xl border-b border-white/10 px-5 pt-5 pb-4">
        <h1 className="text-xl font-bold tracking-tight">Files</h1>
        
        {/* Search */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 pl-10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          <Search className="absolute left-3 top-3.5 w-4 h-4 text-white/40" />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                haptic('selection');
              }}
              className={`px-4 py-2 rounded-lg capitalize whitespace-nowrap transition-all touch-optimized ${
                selectedCategory === category
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Files List */}
      <div className="flex-1 overflow-y-auto px-5 py-4 smooth-scroll">
        {isRefreshing && (
          <div className="text-center py-4">
            <div className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin-optimized" />
          </div>
        )}

        <div className="space-y-2">
          {filteredFiles.map((file, index) => {
            const Icon = getFileIcon(file.type);
            return (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  delay: Math.min(index * 0.025, 0.15),
                  duration: 0.18,
                  ease: 'easeOut',
                }}
                onClick={() => {
                  setSelectedFile(file);
                  haptic('light');
                }}
                className={`bg-gradient-to-br ${getFileColor(file.type)} border rounded-lg px-4 py-3 cursor-pointer hover:scale-[0.98] transition-transform card-list-item touch-optimized`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{file.name}</h3>
                    <p className="text-xs text-white/60">{file.size} • {file.date}</p>
                  </div>
                  <FolderOpen className="w-5 h-5 text-white/40 flex-shrink-0" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* File Detail Modal */}
      {selectedFile && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end"
          onClick={() => setSelectedFile(null)}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-gray-900 rounded-t-2xl px-5 py-5"
          >
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6" />
            
            <div className="flex items-start gap-3 mb-5">
              {(() => {
                const Icon = getFileIcon(selectedFile.type);
                return (
                  <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${getFileColor(selectedFile.type)} border flex items-center justify-center`}>
                    <Icon className="w-8 h-8" />
                  </div>
                );
              })()}
              <div className="flex-1">
                <h2 className="text-sm font-bold mb-1">{selectedFile.name}</h2>
                <p className="text-sm text-white/60">{selectedFile.category}</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between py-3 border-b border-white/10">
                <span className="text-white/60">Size</span>
                <span className="font-semibold">{selectedFile.size}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-white/10">
                <span className="text-white/60">Date</span>
                <span className="font-semibold">{selectedFile.date}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-white/10">
                <span className="text-white/60">Type</span>
                <span className="font-semibold capitalize">{selectedFile.type}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleDownload(selectedFile)}
                className="bg-blue-500 hover:bg-blue-600 rounded-lg py-2.5 font-semibold text-sm flex items-center justify-center gap-2 transition-all"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              <button
                onClick={() => setSelectedFile(null)}
                className="bg-white/10 rounded-lg py-2.5 font-semibold text-sm hover:bg-white/20 transition-all"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};
