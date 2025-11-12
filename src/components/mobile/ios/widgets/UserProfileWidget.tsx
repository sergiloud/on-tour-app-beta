import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Camera, Mail, Phone, MapPin, Edit3, Check } from 'lucide-react';

interface UserProfileWidgetProps {
  className?: string;
}

export const UserProfileWidget: React.FC<UserProfileWidgetProps> = ({ className = '' }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Sergi Recio',
    role: 'Tour Manager',
    email: 'sergi@ontour.app',
    phone: '+34 600 000 000',
    location: 'Madrid, España',
  });

  const handleSave = () => {
    setIsEditing(false);
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([10, 50, 10]);
    }
  };

  return (
    <div className={`relative bg-gradient-to-br from-accent-500/20 to-purple-500/20 backdrop-blur-md rounded-[28px] border border-white/10 overflow-hidden shadow-xl p-4 gpu-accelerate ${className}`}>
      {/* Header with Edit Button */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-white tracking-tight">Mi Perfil</h2>
        <motion.button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
          whileTap={{ scale: 0.95 }}
        >
          {isEditing ? (
            <Check className="w-4 h-4 text-accent-500" strokeWidth={2.5} />
          ) : (
            <Edit3 className="w-4 h-4 text-white/70" strokeWidth={2} />
          )}
        </motion.button>
      </div>

      {/* Avatar Section */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-500 to-purple-500 flex items-center justify-center shadow-lg">
            <User className="w-10 h-10 text-white" strokeWidth={2} />
          </div>
          <motion.button
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-accent-500 flex items-center justify-center shadow-lg border-2 border-ink-900"
            whileTap={{ scale: 0.9 }}
          >
            <Camera className="w-3.5 h-3.5 text-black" strokeWidth={2.5} />
          </motion.button>
        </div>

        <div className="flex-1">
          {isEditing ? (
            <>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-white font-bold text-lg mb-1 focus:outline-none focus:border-accent-500"
              />
              <input
                type="text"
                value={profile.role}
                onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white/70 text-sm focus:outline-none focus:border-accent-500"
              />
            </>
          ) : (
            <>
              <h3 className="text-lg font-bold text-white">{profile.name}</h3>
              <p className="text-sm text-white/70">{profile.role}</p>
            </>
          )}
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-2.5">
        {/* Email */}
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
            <Mail className="w-4 h-4 text-blue-400" strokeWidth={2} />
          </div>
          {isEditing ? (
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="flex-1 bg-transparent text-white text-sm focus:outline-none"
            />
          ) : (
            <span className="text-sm text-white/90">{profile.email}</span>
          )}
        </div>

        {/* Phone */}
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10">
          <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
            <Phone className="w-4 h-4 text-green-400" strokeWidth={2} />
          </div>
          {isEditing ? (
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className="flex-1 bg-transparent text-white text-sm focus:outline-none"
            />
          ) : (
            <span className="text-sm text-white/90">{profile.phone}</span>
          )}
        </div>

        {/* Location */}
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-4 h-4 text-purple-400" strokeWidth={2} />
          </div>
          {isEditing ? (
            <input
              type="text"
              value={profile.location}
              onChange={(e) => setProfile({ ...profile, location: e.target.value })}
              className="flex-1 bg-transparent text-white text-sm focus:outline-none"
            />
          ) : (
            <span className="text-sm text-white/90">{profile.location}</span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/10">
        <div className="text-center">
          <p className="text-xl font-bold text-white">24</p>
          <p className="text-[10px] text-white/60 font-medium">Shows</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-white">12</p>
          <p className="text-[10px] text-white/60 font-medium">Ciudades</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-white">€15K</p>
          <p className="text-[10px] text-white/60 font-medium">Facturado</p>
        </div>
      </div>
    </div>
  );
};
