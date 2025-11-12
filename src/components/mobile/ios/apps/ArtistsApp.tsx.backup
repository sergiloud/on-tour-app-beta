import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Mic, Phone, Mail, MapPin, Star, Music, Users, Calendar } from 'lucide-react';
import { usePullToRefresh } from '../../../../hooks/usePullToRefresh';
import { haptic } from '../../../../lib/haptics';

interface Artist {
  id: string;
  name: string;
  genre: string;
  rating: number;
  contact: {
    email: string;
    phone: string;
    manager?: string;
  };
  requirements: string[];
  pastShows: number;
  lastShow?: string;
  status: 'active' | 'pending' | 'archived';
}

const mockArtists: Artist[] = [
  {
    id: '1',
    name: 'The Electric Dreams',
    genre: 'Electronic',
    rating: 4.8,
    contact: {
      email: 'booking@electricdreams.com',
      phone: '+34 612 345 678',
      manager: 'Maria García'
    },
    requirements: ['Professional sound system', 'LED wall', 'Green room'],
    pastShows: 12,
    lastShow: '2024-11-01',
    status: 'active'
  },
  {
    id: '2',
    name: 'Jazz Collective',
    genre: 'Jazz',
    rating: 4.9,
    contact: {
      email: 'info@jazzcollective.com',
      phone: '+34 623 456 789',
      manager: 'John Smith'
    },
    requirements: ['Acoustic setup', 'Piano', 'Catering for 8'],
    pastShows: 8,
    lastShow: '2024-10-28',
    status: 'active'
  },
  {
    id: '3',
    name: 'Rock Revolution',
    genre: 'Rock',
    rating: 4.7,
    contact: {
      email: 'contact@rockrev.com',
      phone: '+34 634 567 890'
    },
    requirements: ['Large stage', 'Pyrotechnics', 'Security detail'],
    pastShows: 15,
    lastShow: '2024-10-15',
    status: 'active'
  },
  {
    id: '4',
    name: 'Acoustic Soul',
    genre: 'Folk',
    rating: 4.6,
    contact: {
      email: 'bookings@acousticsoul.com',
      phone: '+34 645 678 901',
      manager: 'Laura Martínez'
    },
    requirements: ['Intimate setting', 'Quality microphones', 'Merchandise table'],
    pastShows: 6,
    lastShow: '2024-09-20',
    status: 'pending'
  },
  {
    id: '5',
    name: 'Hip Hop Nation',
    genre: 'Hip Hop',
    rating: 4.5,
    contact: {
      email: 'management@hhnation.com',
      phone: '+34 656 789 012'
    },
    requirements: ['DJ equipment', 'Backstage access', 'VIP area'],
    pastShows: 10,
    lastShow: '2024-08-10',
    status: 'active'
  }
];

export const ArtistsApp: React.FC = () => {
  const [artists, setArtists] = useState(mockArtists);
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);

  const handleRefresh = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    haptic('success');
  };

  const { isRefreshing } = usePullToRefresh({ onRefresh: handleRefresh });

  const genres = useMemo(() => {
    const genreSet = new Set(artists.map(a => a.genre));
    return ['all', ...Array.from(genreSet)];
  }, [artists]);

  const filteredArtists = useMemo(() => {
    return artists.filter(artist => {
      const matchesGenre = selectedGenre === 'all' || artist.genre === selectedGenre;
      const matchesSearch = artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           artist.genre.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesGenre && matchesSearch;
    });
  }, [artists, selectedGenre, searchQuery]);

  const getStatusColor = (status: Artist['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'archived': return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="h-full bg-gradient-to-b from-gray-900 to-black text-white flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-white/10">
        <h1 className="text-2xl font-bold mb-4">Artists</h1>
        
        {/* Search */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search artists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          <Music className="absolute left-3 top-3.5 w-4 h-4 text-white/40" />
        </div>

        {/* Genre Filter */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => {
                setSelectedGenre(genre);
                haptic('selection');
              }}
              className={`px-4 py-2 rounded-lg capitalize whitespace-nowrap transition-all ${
                selectedGenre === genre
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Artists List */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {isRefreshing && (
          <div className="text-center py-4">
            <div className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        <div className="space-y-3">
          {filteredArtists.map((artist, index) => (
            <motion.div
              key={artist.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => {
                setSelectedArtist(artist);
                haptic('light');
              }}
              className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-2xl p-4 cursor-pointer hover:scale-[0.98] transition-transform"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Mic className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{artist.name}</h3>
                    <p className="text-xs text-white/60">{artist.genre}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="font-semibold">{artist.rating}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-white/60">
                  <Calendar className="w-4 h-4" />
                  <span>{artist.pastShows} shows</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(artist.status)}`}>
                  {artist.status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Artist Detail Modal */}
      {selectedArtist && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end"
          onClick={() => setSelectedArtist(null)}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-gradient-to-b from-gray-800 to-gray-900 rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto"
          >
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6" />
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Mic className="w-10 h-10" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{selectedArtist.name}</h2>
                <p className="text-white/60">{selectedArtist.genre}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="font-semibold">{selectedArtist.rating}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ml-2 ${getStatusColor(selectedArtist.status)}`}>
                    {selectedArtist.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white/5 rounded-xl p-4 mb-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Contact Information
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-white/60" />
                  <a href={`mailto:${selectedArtist.contact.email}`} className="text-blue-400">
                    {selectedArtist.contact.email}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-white/60" />
                  <a href={`tel:${selectedArtist.contact.phone}`} className="text-blue-400">
                    {selectedArtist.contact.phone}
                  </a>
                </div>
                {selectedArtist.contact.manager && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-white/60" />
                    <span>Manager: {selectedArtist.contact.manager}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-white/5 rounded-xl p-4 mb-4">
              <h3 className="font-semibold mb-3">Requirements</h3>
              <div className="space-y-2">
                {selectedArtist.requirements.map((req, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    <span>{req}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-4">
                <div className="text-sm text-white/60 mb-1">Past Shows</div>
                <div className="text-2xl font-bold">{selectedArtist.pastShows}</div>
              </div>
              {selectedArtist.lastShow && (
                <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-4">
                  <div className="text-sm text-white/60 mb-1">Last Show</div>
                  <div className="text-lg font-bold">{selectedArtist.lastShow}</div>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedArtist(null)}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl py-3 font-semibold hover:from-blue-600 hover:to-blue-700 transition-all"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};
