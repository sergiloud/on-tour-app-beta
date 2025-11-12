import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FileText, Search, Plus, Pin, Trash2, Edit } from 'lucide-react';
import { usePullToRefresh } from '../../../../hooks/usePullToRefresh';
import { haptic } from '../../../../lib/haptics';

interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

const mockNotes: Note[] = [
  {
    id: '1',
    title: 'Tour Setlist Ideas',
    content: 'Opening: Song A\nMiddle: Song B, Song C\nEncore: Song D\n\nConsider adding acoustic section...',
    category: 'Planning',
    isPinned: true,
    createdAt: '2024-11-01',
    updatedAt: '2024-11-15'
  },
  {
    id: '2',
    title: 'Venue Contact Notes',
    content: 'Madrid Arena - Ask about backstage catering\nBarcelona Club - Confirm load-in time\nLisbon - Need extra security',
    category: 'Venues',
    isPinned: true,
    createdAt: '2024-10-28',
    updatedAt: '2024-11-10'
  },
  {
    id: '3',
    title: 'Merch Ideas',
    content: 'T-shirt designs:\n- Black with logo\n- White limited edition\n- Tour dates back print\n\nHoodies, posters, vinyl?',
    category: 'Merchandise',
    isPinned: false,
    createdAt: '2024-10-20',
    updatedAt: '2024-10-25'
  },
  {
    id: '4',
    title: 'Technical Requirements',
    content: 'Sound:\n- 48 channel mixing console\n- Wireless mics (6)\n- In-ear monitors (8)\n\nLighting:\n- Moving heads (12)\n- LED par cans\n- Fog machine',
    category: 'Technical',
    isPinned: false,
    createdAt: '2024-10-15',
    updatedAt: '2024-10-15'
  },
  {
    id: '5',
    title: 'Social Media Ideas',
    content: 'Instagram:\n- Behind the scenes videos\n- Meet & greet photos\n- Tour announcement\n\nTikTok:\n- Soundcheck clips\n- Fan reactions',
    category: 'Marketing',
    isPinned: false,
    createdAt: '2024-10-10',
    updatedAt: '2024-11-05'
  }
];

export const NotesApp: React.FC = () => {
  const [notes, setNotes] = useState(mockNotes);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleRefresh = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    haptic('success');
  };

  const { isRefreshing } = usePullToRefresh({ onRefresh: handleRefresh });

  const filteredNotes = useMemo(() => {
    let filtered = notes;
    
    if (searchQuery) {
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort: pinned first, then by updated date
    return filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [notes, searchQuery]);

  const togglePin = (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    haptic('selection');
    setNotes(prev => prev.map(n =>
      n.id === noteId ? { ...n, isPinned: !n.isPinned } : n
    ));
  };

  const deleteNote = (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    haptic('warning');
    setNotes(prev => prev.filter(n => n.id !== noteId));
    if (selectedNote?.id === noteId) {
      setSelectedNote(null);
    }
  };

  const getPreview = (content: string) => {
    return content.length > 100 ? content.substring(0, 100) + '...' : content;
  };

  return (
    <div className="h-full bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white flex flex-col">
      {/* Header - Desktop Style */}
      <div className="sticky top-0 z-10 bg-gray-900/60 backdrop-blur-xl border-b border-white/10 px-5 pt-5 pb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">Notes</h1>
          <button
            onClick={() => haptic('light')}
            className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center hover:bg-yellow-600 transition-colors"
          >
            <Plus className="w-5 h-5 text-black" />
          </button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 pl-10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
          />
          <Search className="absolute left-3 top-3.5 w-4 h-4 text-white/40" />
        </div>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto px-5 py-4 smooth-scroll">
        {isRefreshing && (
          <div className="text-center py-4">
            <div className="inline-block w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin-optimized" />
          </div>
        )}

        <div className="space-y-2">
          {filteredNotes.map((note, index) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                delay: Math.min(index * 0.025, 0.15),
                duration: 0.18,
                ease: 'easeOut',
              }}
              onClick={() => {
                setSelectedNote(note);
                haptic('light');
              }}
              className={`bg-gradient-to-br ${
                note.isPinned
                  ? 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30'
                  : 'from-orange-500/20 to-orange-600/20 border-orange-500/30'
              } border rounded-lg px-4 py-3 cursor-pointer hover:scale-[0.98] transition-transform relative card-list-item touch-optimized`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {note.isPinned && <Pin className="w-4 h-4 text-yellow-400 fill-yellow-400 flex-shrink-0" />}
                    <h3 className="font-semibold truncate">{note.title}</h3>
                  </div>
                  <p className="text-xs text-white/60 mb-2">{note.category}</p>
                </div>
                <div className="flex gap-2 ml-2">
                  <button
                    onClick={(e) => togglePin(note.id, e)}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Pin className={`w-4 h-4 ${note.isPinned ? 'text-yellow-400 fill-yellow-400' : 'text-white/40'}`} />
                  </button>
                  <button
                    onClick={(e) => deleteNote(note.id, e)}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
              
              <p className="text-sm text-white/80 line-clamp-2 mb-2">{getPreview(note.content)}</p>
              
              <div className="flex items-center justify-between text-xs text-white/40">
                <span>{note.updatedAt}</span>
                <FileText className="w-3 h-3" />
              </div>
            </motion.div>
          ))}
        </div>

        {filteredNotes.length === 0 && (
          <div className="text-center py-12 text-white/40">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No notes found</p>
          </div>
        )}
      </div>

      {/* Note Detail Modal */}
      {selectedNote && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end"
          onClick={() => setSelectedNote(null)}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            onClick={(e) => e.stopPropagation()}
              className="w-full bg-gray-900 rounded-t-2xl px-5 py-5 max-h-[80vh] overflow-y-auto"
          >
              <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-5" />            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {selectedNote.isPinned && <Pin className="w-5 h-5 text-yellow-400 fill-yellow-400" />}
                <h2 className="text-sm font-bold">{selectedNote.title}</h2>
              </div>
              <button
                onClick={() => {
                  setIsEditing(!isEditing);
                  haptic('light');
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Edit className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3 mb-4 text-sm text-white/60">
              <span className="px-3 py-1 rounded-full bg-white/10">{selectedNote.category}</span>
              <span>Updated {selectedNote.updatedAt}</span>
            </div>

            <div className="bg-white/5 rounded-lg px-4 py-3 mb-5 min-h-[200px]">
              <pre className="text-sm whitespace-pre-wrap font-sans">{selectedNote.content}</pre>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  togglePin(selectedNote.id, {} as React.MouseEvent);
                }}
                className="bg-white/10 rounded-lg py-2.5 font-semibold text-sm hover:bg-white/20 transition-all flex items-center justify-center gap-2"
              >
                <Pin className={`w-4 h-4 ${selectedNote.isPinned ? 'fill-current' : ''}`} />
                {selectedNote.isPinned ? 'Unpin' : 'Pin'}
              </button>
              <button
                onClick={() => setSelectedNote(null)}
                className="bg-yellow-500 hover:bg-yellow-600 rounded-lg py-2.5 font-semibold text-sm transition-all"
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
