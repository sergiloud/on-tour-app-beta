import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link as LinkIcon, ExternalLink, Music, Instagram, Youtube, Twitter, Globe, Plus, Star } from 'lucide-react';
import { usePullToRefresh } from '../../../../hooks/usePullToRefresh';
import { haptic } from '../../../../lib/haptics';

interface QuickLink {
  id: string;
  title: string;
  url: string;
  category: 'streaming' | 'social' | 'tools' | 'other';
  icon?: string;
  isPinned: boolean;
  clicks: number;
}

const mockLinks: QuickLink[] = [
  {
    id: '1',
    title: 'Spotify for Artists',
    url: 'https://artists.spotify.com',
    category: 'streaming',
    isPinned: true,
    clicks: 124
  },
  {
    id: '2',
    title: 'Instagram Profile',
    url: 'https://instagram.com/myband',
    category: 'social',
    isPinned: true,
    clicks: 89
  },
  {
    id: '3',
    title: 'YouTube Channel',
    url: 'https://youtube.com/@myband',
    category: 'social',
    isPinned: false,
    clicks: 56
  },
  {
    id: '4',
    title: 'Apple Music',
    url: 'https://music.apple.com/artist',
    category: 'streaming',
    isPinned: false,
    clicks: 45
  },
  {
    id: '5',
    title: 'Twitter/X',
    url: 'https://twitter.com/myband',
    category: 'social',
    isPinned: false,
    clicks: 34
  },
  {
    id: '6',
    title: 'Official Website',
    url: 'https://mybandofficial.com',
    category: 'other',
    isPinned: true,
    clicks: 78
  },
  {
    id: '7',
    title: 'Bandcamp',
    url: 'https://myband.bandcamp.com',
    category: 'streaming',
    isPinned: false,
    clicks: 23
  },
  {
    id: '8',
    title: 'SoundCloud',
    url: 'https://soundcloud.com/myband',
    category: 'streaming',
    isPinned: false,
    clicks: 19
  }
];

export const LinksApp: React.FC = () => {
  const [links, setLinks] = useState(mockLinks);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleRefresh = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    haptic('success');
  };

  const { isRefreshing } = usePullToRefresh({ onRefresh: handleRefresh });

  const categories = ['all', 'streaming', 'social', 'tools', 'other'];

  const filteredLinks = useMemo(() => {
    let filtered = links;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(link => link.category === selectedCategory);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(link =>
        link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.url.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort: pinned first, then by clicks
    return filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.clicks - a.clicks;
    });
  }, [links, selectedCategory, searchQuery]);

  const getCategoryColor = (category: QuickLink['category']) => {
    switch (category) {
      case 'streaming': return 'from-green-500/20 to-green-600/20 border-green-500/30';
      case 'social': return 'from-blue-500/20 to-blue-600/20 border-blue-500/30';
      case 'tools': return 'from-purple-500/20 to-purple-600/20 border-purple-500/30';
      case 'other': return 'from-gray-500/20 to-gray-600/20 border-gray-500/30';
    }
  };

  const handleLinkClick = (link: QuickLink) => {
    haptic('light');
    // Increment clicks
    setLinks(prev => prev.map(l =>
      l.id === link.id ? { ...l, clicks: l.clicks + 1 } : l
    ));
    // Open link in new tab
    window.open(link.url, '_blank');
  };

  const togglePin = (linkId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    haptic('selection');
    setLinks(prev => prev.map(l =>
      l.id === linkId ? { ...l, isPinned: !l.isPinned } : l
    ));
  };

  return (
    <div className="h-full bg-gradient-to-b from-gray-900 to-black text-white flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Quick Links</h1>
          <button
            onClick={() => haptic('light')}
            className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        
        {/* Search */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search links..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          <LinkIcon className="absolute left-3 top-3.5 w-4 h-4 text-white/40" />
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
              className={`px-4 py-2 rounded-lg capitalize whitespace-nowrap transition-all ${
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

      {/* Links List */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {isRefreshing && (
          <div className="text-center py-4">
            <div className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        <div className="space-y-2">
          {filteredLinks.map((link, index) => (
            <motion.div
              key={link.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => handleLinkClick(link)}
              className={`bg-gradient-to-br ${getCategoryColor(link.category)} border rounded-xl p-4 cursor-pointer hover:scale-[0.98] transition-transform relative`}
            >
              {link.isPinned && (
                <Star
                  className="absolute top-3 right-3 w-4 h-4 text-yellow-400 fill-yellow-400"
                  onClick={(e) => togglePin(link.id, e)}
                />
              )}
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  {link.category === 'streaming' && <Music className="w-6 h-6" />}
                  {link.category === 'social' && <Instagram className="w-6 h-6" />}
                  {link.category === 'tools' && <Globe className="w-6 h-6" />}
                  {link.category === 'other' && <LinkIcon className="w-6 h-6" />}
                </div>
                
                <div className="flex-1 min-w-0 mr-6">
                  <h3 className="font-semibold truncate">{link.title}</h3>
                  <p className="text-xs text-white/60 truncate">{link.url}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-white/40">{link.clicks} clicks</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 capitalize">
                      {link.category}
                    </span>
                  </div>
                </div>
                
                <ExternalLink className="w-5 h-5 text-white/40 flex-shrink-0" />
              </div>
            </motion.div>
          ))}
        </div>

        {filteredLinks.length === 0 && (
          <div className="text-center py-12 text-white/40">
            <LinkIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No links found</p>
          </div>
        )}
      </div>
    </div>
  );
};
