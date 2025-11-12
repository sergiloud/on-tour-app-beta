import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Building2, MapPin, Users, Phone, Mail, Wifi, Zap, Calendar } from 'lucide-react';
import { usePullToRefresh } from '../../../../hooks/usePullToRefresh';
import { haptic } from '../../../../lib/haptics';

interface Venue {
  id: string;
  name: string;
  city: string;
  capacity: number;
  type: 'arena' | 'club' | 'festival' | 'theater';
  contact: {
    email: string;
    phone: string;
    manager?: string;
  };
  features: string[];
  pastShows: number;
  rating: number;
  status: 'available' | 'booked' | 'maintenance';
}

const mockVenues: Venue[] = [
  {
    id: '1',
    name: 'Madrid Arena',
    city: 'Madrid',
    capacity: 12000,
    type: 'arena',
    contact: {
      email: 'booking@madridarena.com',
      phone: '+34 912 345 678',
      manager: 'Carlos Ruiz'
    },
    features: ['Professional sound', 'LED screens', 'VIP area', 'Parking'],
    pastShows: 24,
    rating: 4.8,
    status: 'available'
  },
  {
    id: '2',
    name: 'Barcelona Live Club',
    city: 'Barcelona',
    capacity: 800,
    type: 'club',
    contact: {
      email: 'info@bcnlive.com',
      phone: '+34 934 567 890'
    },
    features: ['Intimate setting', 'Bar', 'Dance floor'],
    pastShows: 48,
    rating: 4.6,
    status: 'available'
  },
  {
    id: '3',
    name: 'Lisbon Festival Grounds',
    city: 'Lisbon',
    capacity: 30000,
    type: 'festival',
    contact: {
      email: 'contact@lisbonfest.pt',
      phone: '+351 21 123 4567',
      manager: 'Ana Silva'
    },
    features: ['Multiple stages', 'Food vendors', 'Camping area', 'Medical'],
    pastShows: 12,
    rating: 4.9,
    status: 'booked'
  },
  {
    id: '4',
    name: 'Teatro Real',
    city: 'Madrid',
    capacity: 1800,
    type: 'theater',
    contact: {
      email: 'reservas@teatroreal.es',
      phone: '+34 915 678 901',
      manager: 'Isabel Martín'
    },
    features: ['Acoustic excellence', 'Historic venue', 'Elegant setting'],
    pastShows: 18,
    rating: 4.7,
    status: 'available'
  },
  {
    id: '5',
    name: 'Valencia Music Hall',
    city: 'Valencia',
    capacity: 3500,
    type: 'arena',
    contact: {
      email: 'info@valenciahall.com',
      phone: '+34 963 456 789'
    },
    features: ['Modern facilities', 'Great acoustics', 'Easy access'],
    pastShows: 32,
    rating: 4.5,
    status: 'maintenance'
  }
];

export const VenuesApp: React.FC = () => {
  const [venues, setVenues] = useState(mockVenues);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);

  const handleRefresh = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    haptic('success');
  };

  const { isRefreshing } = usePullToRefresh({ onRefresh: handleRefresh });

  const types = ['all', 'arena', 'club', 'festival', 'theater'];

  const filteredVenues = useMemo(() => {
    return venues.filter(venue => {
      const matchesType = selectedType === 'all' || venue.type === selectedType;
      const matchesSearch = venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           venue.city.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [venues, selectedType, searchQuery]);

  const getStatusColor = (status: Venue['status']) => {
    switch (status) {
      case 'available': return 'bg-green-500/20 text-green-400';
      case 'booked': return 'bg-red-500/20 text-red-400';
      case 'maintenance': return 'bg-yellow-500/20 text-yellow-400';
    }
  };

  const getTypeColor = (type: Venue['type']) => {
    switch (type) {
      case 'arena': return 'from-blue-500/20 to-blue-600/20 border-blue-500/30';
      case 'club': return 'from-purple-500/20 to-purple-600/20 border-purple-500/30';
      case 'festival': return 'from-green-500/20 to-green-600/20 border-green-500/30';
      case 'theater': return 'from-red-500/20 to-red-600/20 border-red-500/30';
    }
  };

  return (
    <div className="h-full bg-gradient-to-b from-gray-900 to-black text-white flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-white/10">
        <h1 className="text-2xl font-bold mb-4">Venues</h1>
        
        {/* Search */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search venues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          <Building2 className="absolute left-3 top-3.5 w-4 h-4 text-white/40" />
        </div>

        {/* Type Filter */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {types.map((type) => (
            <button
              key={type}
              onClick={() => {
                setSelectedType(type);
                haptic('selection');
              }}
              className={`px-4 py-2 rounded-lg capitalize whitespace-nowrap transition-all ${
                selectedType === type
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Venues List */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {isRefreshing && (
          <div className="text-center py-4">
            <div className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        <div className="space-y-3">
          {filteredVenues.map((venue, index) => (
            <motion.div
              key={venue.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => {
                setSelectedVenue(venue);
                haptic('light');
              }}
              className={`bg-gradient-to-br ${getTypeColor(venue.type)} border rounded-2xl p-4 cursor-pointer hover:scale-[0.98] transition-transform`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{venue.name}</h3>
                    <p className="text-xs text-white/60 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {venue.city}
                    </p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(venue.status)}`}>
                  {venue.status}
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-white/60">
                  <Users className="w-4 h-4" />
                  <span>{venue.capacity.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1 text-white/60">
                  <Calendar className="w-4 h-4" />
                  <span>{venue.pastShows} shows</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-yellow-400">★</span>
                  <span>{venue.rating}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Venue Detail Modal */}
      {selectedVenue && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end"
          onClick={() => setSelectedVenue(null)}
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
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <Building2 className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{selectedVenue.name}</h2>
                <p className="text-white/60 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {selectedVenue.city}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-yellow-400">★</span>
                  <span className="font-semibold">{selectedVenue.rating}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ml-2 ${getStatusColor(selectedVenue.status)}`}>
                    {selectedVenue.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-4">
                <div className="text-sm text-white/60 mb-1">Capacity</div>
                <div className="text-xl font-bold">{selectedVenue.capacity.toLocaleString()}</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-4">
                <div className="text-sm text-white/60 mb-1">Past Shows</div>
                <div className="text-xl font-bold">{selectedVenue.pastShows}</div>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-white/5 rounded-xl p-4 mb-4">
              <h3 className="font-semibold mb-3">Contact Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-white/60" />
                  <a href={`mailto:${selectedVenue.contact.email}`} className="text-blue-400">
                    {selectedVenue.contact.email}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-white/60" />
                  <a href={`tel:${selectedVenue.contact.phone}`} className="text-blue-400">
                    {selectedVenue.contact.phone}
                  </a>
                </div>
                {selectedVenue.contact.manager && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-white/60" />
                    <span>Manager: {selectedVenue.contact.manager}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Features */}
            <div className="bg-white/5 rounded-xl p-4 mb-6">
              <h3 className="font-semibold mb-3">Features</h3>
              <div className="grid grid-cols-2 gap-2">
                {selectedVenue.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <Zap className="w-3 h-3 text-blue-400" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setSelectedVenue(null)}
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
