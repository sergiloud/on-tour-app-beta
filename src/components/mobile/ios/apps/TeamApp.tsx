import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Plus,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Music,
  DollarSign,
  MoreVertical,
  UserPlus,
  Search
} from 'lucide-react';
import type { AppComponentProps } from '../../../../types/mobileOS';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  avatar?: string;
  status: 'active' | 'away' | 'offline';
  recentActivity?: {
    type: 'show' | 'expense' | 'task';
    description: string;
    time: string;
  };
}

const MOCK_TEAM: TeamMember[] = [
  {
    id: '1',
    name: 'Ana García',
    role: 'Tour Manager',
    email: 'ana@example.com',
    phone: '+34 612 345 678',
    status: 'active',
    recentActivity: {
      type: 'show',
      description: 'Añadió show en Barcelona',
      time: 'hace 2h',
    },
  },
  {
    id: '2',
    name: 'Carlos Ruiz',
    role: 'Sound Engineer',
    email: 'carlos@example.com',
    phone: '+34 623 456 789',
    status: 'active',
    recentActivity: {
      type: 'expense',
      description: 'Registró gasto de €450',
      time: 'hace 4h',
    },
  },
  {
    id: '3',
    name: 'María López',
    role: 'Stage Manager',
    email: 'maria@example.com',
    status: 'away',
    recentActivity: {
      type: 'task',
      description: 'Completó tarea',
      time: 'hace 6h',
    },
  },
  {
    id: '4',
    name: 'David Sánchez',
    role: 'Lighting Designer',
    email: 'david@example.com',
    phone: '+34 645 678 901',
    status: 'offline',
  },
];

export const TeamApp: React.FC<AppComponentProps> = () => {
  const [team, setTeam] = useState<TeamMember[]>(MOCK_TEAM);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status: TeamMember['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-gray-500';
    }
  };

  const getActivityIcon = (type: 'show' | 'expense' | 'task') => {
    switch (type) {
      case 'show':
        return Music;
      case 'expense':
        return DollarSign;
      case 'task':
        return Calendar;
    }
  };

  const filteredTeam = team.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full overflow-y-auto bg-ink-950">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Equipo</h1>
            <p className="text-white/50 text-sm">{team.length} miembros</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-full bg-accent-500 flex items-center justify-center shadow-lg shadow-accent-500/30"
          >
            <UserPlus className="w-5 h-5 text-black" strokeWidth={2.5} />
          </motion.button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar miembro..."
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-accent-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Team List */}
      <div className="px-6 pb-6 space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredTeam.map((member, index) => {
            const ActivityIcon = member.recentActivity ? getActivityIcon(member.recentActivity.type) : null;

            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{
                  delay: index * 0.05,
                  type: 'spring',
                  stiffness: 400,
                  damping: 30,
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedMember(member)}
                className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden cursor-pointer hover:bg-white/10 transition-colors"
              >
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center text-black font-bold shadow-lg">
                        {getInitials(member.name)}
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full ${getStatusColor(member.status)} border-2 border-ink-950`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold text-base mb-0.5 truncate">
                        {member.name}
                      </h3>
                      <p className="text-white/50 text-sm mb-2">{member.role}</p>

                      {/* Recent Activity */}
                      {member.recentActivity && ActivityIcon && (
                        <div className="flex items-center gap-2 bg-white/5 rounded-lg px-2.5 py-1.5">
                          <ActivityIcon className="w-3.5 h-3.5 text-accent-400" strokeWidth={2.5} />
                          <span className="text-xs text-white/60 truncate flex-1">
                            {member.recentActivity.description}
                          </span>
                          <span className="text-[10px] text-white/40">{member.recentActivity.time}</span>
                        </div>
                      )}
                    </div>

                    {/* Menu Button */}
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle menu
                      }}
                      className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0"
                    >
                      <MoreVertical className="w-4 h-4 text-white/40" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredTeam.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/40 text-sm">No se encontraron miembros</p>
          </div>
        )}
      </div>

      {/* Member Detail Modal */}
      <AnimatePresence>
        {selectedMember && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMember(null)}
              className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed inset-x-4 bottom-4 z-[110] bg-ink-900/95 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center text-black font-bold text-2xl shadow-lg">
                      {getInitials(selectedMember.name)}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${getStatusColor(selectedMember.status)} border-2 border-ink-900`} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-1">{selectedMember.name}</h2>
                    <p className="text-white/60">{selectedMember.role}</p>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedMember(null)}
                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
                  >
                    <span className="text-white text-lg">×</span>
                  </motion.button>
                </div>

                {/* Contact Info */}
                <div className="space-y-3 mb-6">
                  <a
                    href={`mailto:${selectedMember.email}`}
                    className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-white/50 text-xs mb-0.5">Email</div>
                      <div className="text-white text-sm">{selectedMember.email}</div>
                    </div>
                  </a>

                  {selectedMember.phone && (
                    <a
                      href={`tel:${selectedMember.phone}`}
                      className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Phone className="w-5 h-5 text-green-400" />
                      </div>
                      <div className="flex-1">
                        <div className="text-white/50 text-xs mb-0.5">Teléfono</div>
                        <div className="text-white text-sm">{selectedMember.phone}</div>
                      </div>
                    </a>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-3 bg-accent-500 text-black font-semibold rounded-xl flex items-center justify-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Enviar mensaje
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 bg-white/10 text-white font-semibold rounded-xl"
                  >
                    Editar
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};