import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Calendar, DollarSign, MapPin, Users, X, TrendingUp } from 'lucide-react';

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  type: 'show' | 'expense' | 'contact' | 'location';
  icon: any;
  action: () => void;
}

interface SpotlightSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SpotlightSearch: React.FC<SpotlightSearchProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);

  // Mock search results
  const allResults: SearchResult[] = [
    {
      id: '1',
      title: 'Rock Fest Madrid',
      subtitle: 'WiZink Center • 15 Nov',
      type: 'show',
      icon: Calendar,
      action: () => console.log('Open show'),
    },
    {
      id: '2',
      title: 'Hotel Barcelona',
      subtitle: '€350 • Alojamiento',
      type: 'expense',
      icon: DollarSign,
      action: () => console.log('Open expense'),
    },
    {
      id: '3',
      title: 'Madrid',
      subtitle: '5 shows próximos',
      type: 'location',
      icon: MapPin,
      action: () => console.log('Open location'),
    },
    {
      id: '4',
      title: 'Ana García',
      subtitle: 'Tour Assistant',
      type: 'contact',
      icon: Users,
      action: () => console.log('Open contact'),
    },
  ];

  useEffect(() => {
    if (query.trim() === '') {
      // Show recent/suggested when empty
      setResults(allResults.slice(0, 4));
    } else {
      // Filter results
      const filtered = allResults.filter(
        r =>
          r.title.toLowerCase().includes(query.toLowerCase()) ||
          r.subtitle?.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
    }
  }, [query]);

  const getTypeColor = (type: SearchResult['type']) => {
    switch (type) {
      case 'show':
        return { bg: 'bg-blue-500/20', icon: 'text-blue-400' };
      case 'expense':
        return { bg: 'bg-green-500/20', icon: 'text-green-400' };
      case 'location':
        return { bg: 'bg-purple-500/20', icon: 'text-purple-400' };
      case 'contact':
        return { bg: 'bg-orange-500/20', icon: 'text-orange-400' };
    }
  };

  const handleSelect = (result: SearchResult) => {
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    result.action();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50"
            onClick={onClose}
          />

          {/* Search Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed top-20 left-4 right-4 z-50 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden"
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 p-4 border-b border-white/10">
              <Search className="w-5 h-5 text-accent-500" strokeWidth={2.5} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar shows, gastos, contactos..."
                className="flex-1 bg-transparent text-white placeholder-white/40 text-base focus:outline-none"
                autoFocus
              />
              {query && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  onClick={() => setQuery('')}
                  className="p-1 rounded-lg hover:bg-white/10"
                >
                  <X className="w-4 h-4 text-white/60" strokeWidth={2} />
                </motion.button>
              )}
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto">
              {results.length === 0 ? (
                <div className="text-center py-12 text-white/40">
                  <Search className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p className="text-sm font-medium">No se encontraron resultados</p>
                  <p className="text-xs mt-1">Intenta con otro término</p>
                </div>
              ) : (
                <div className="p-2">
                  {!query && (
                    <div className="px-3 py-2 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-white/50" strokeWidth={2} />
                      <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                        Recientes
                      </span>
                    </div>
                  )}
                  <AnimatePresence mode="popLayout">
                    {results.map((result, index) => {
                      const Icon = result.icon;
                      const colors = getTypeColor(result.type);

                      return (
                        <motion.button
                          key={result.id}
                          onClick={() => handleSelect(result)}
                          className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white/10 transition-colors text-left"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.05 }}
                          layout
                        >
                          {/* Icon */}
                          <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                            <Icon className={`w-5 h-5 ${colors.icon}`} strokeWidth={2.5} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{result.title}</p>
                            {result.subtitle && (
                              <p className="text-xs text-white/60 truncate">{result.subtitle}</p>
                            )}
                          </div>

                          {/* Arrow */}
                          <svg className="w-5 h-5 text-white/30 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </motion.button>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Quick Tips */}
            {query === '' && (
              <div className="p-4 border-t border-white/10">
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <kbd className="px-2 py-1 rounded bg-white/10 font-mono text-[10px]">⌘K</kbd>
                  <span>para abrir búsqueda rápida</span>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
