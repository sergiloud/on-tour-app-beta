import type { AppDefinition, AppComponentProps } from '../types/mobileOS';
import { 
  Music, 
  DollarSign, 
  Plane, 
  Calendar, 
  Users, 
  BarChart3, 
  Settings, 
  FolderOpen, 
  Mic2, 
  Building2, 
  Link, 
  FileText 
} from 'lucide-react';
import { SettingsApp } from '../components/mobile/ios/apps/SettingsApp';

// Placeholder components (will be replaced with actual app wrappers)
const PlaceholderApp: React.FC<AppComponentProps> = () => (
  <div className="flex items-center justify-center h-full p-8">
    <div className="text-center max-w-sm">
      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
        <Building2 className="w-8 h-8 text-white/40" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">En desarrollo</h3>
      <p className="text-white/60 text-sm">Esta funcionalidad estará disponible próximamente</p>
    </div>
  </div>
);

/**
 * Registry of all available apps in the system
 */
export const APP_REGISTRY: Record<string, AppDefinition> = {
  shows: {
    id: 'shows',
    name: 'Shows',
    icon: Music,
    badge: () => {
      // TODO: Get pending shows count
      return null;
    },
    component: PlaceholderApp,
    category: 'productivity',
    isRemovable: true,
    quickActions: [
      { id: 'add', label: 'Add Show', icon: Music, action: () => {} },
      { id: 'calendar', label: 'Calendar', icon: Calendar, action: () => {} },
      { id: 'filter', label: 'Filter', icon: BarChart3, action: () => {} },
    ],
  },

  finance: {
    id: 'finance',
    name: 'Finance',
    icon: DollarSign,
    badge: () => {
      // TODO: Get pending payments count
      return null;
    },
    component: PlaceholderApp,
    category: 'finance',
    isRemovable: true,
    quickActions: [
      { id: 'expense', label: 'Add Expense', icon: DollarSign, action: () => {} },
      { id: 'pl', label: 'P&L Report', icon: BarChart3, action: () => {} },
      { id: 'export', label: 'Export', icon: FileText, action: () => {} },
    ],
  },

  travel: {
    id: 'travel',
    name: 'Travel',
    icon: Plane,
    badge: () => {
      // TODO: Get upcoming trips count
      return null;
    },
    component: PlaceholderApp,
    category: 'travel',
    isRemovable: true,
    quickActions: [
      { id: 'flight', label: 'Add Flight', icon: Plane, action: () => {} },
      { id: 'hotel', label: 'Add Hotel', icon: Building2, action: () => {} },
      { id: 'map', label: 'View Map', icon: Link, action: () => {} },
    ],
  },

  calendar: {
    id: 'calendar',
    name: 'Calendar',
    icon: Calendar,
    badge: () => {
      // TODO: Get today's events count
      return null;
    },
    component: PlaceholderApp,
    category: 'productivity',
    isRemovable: true,
    quickActions: [
      { id: 'today', label: 'Today', icon: Calendar, action: () => {} },
      { id: 'add', label: 'Add Event', icon: Calendar, action: () => {} },
      { id: 'week', label: 'Week View', icon: BarChart3, action: () => {} },
    ],
  },

  contacts: {
    id: 'contacts',
    name: 'Contacts',
    icon: Users,
    badge: () => null,
    component: PlaceholderApp,
    category: 'communication',
    isRemovable: true,
    quickActions: [
      { id: 'add', label: 'Add Contact', icon: Users, action: () => {} },
      { id: 'search', label: 'Search', icon: BarChart3, action: () => {} },
      { id: 'favorites', label: 'Favorites', icon: Users, action: () => {} },
    ],
  },

  reports: {
    id: 'reports',
    name: 'Reports',
    icon: BarChart3,
    badge: () => null,
    component: PlaceholderApp,
    category: 'productivity',
    isRemovable: true,
    quickActions: [
      { id: 'pl', label: 'P&L Report', icon: DollarSign, action: () => {} },
      { id: 'tour', label: 'Tour Summary', icon: Music, action: () => {} },
      { id: 'tax', label: 'Tax Report', icon: FileText, action: () => {} },
    ],
  },

  settings: {
    id: 'settings',
    name: 'Settings',
    icon: Settings,
    badge: () => null,
    component: SettingsApp,
    category: 'settings',
    isRemovable: false,
    quickActions: [
      { id: 'profile', label: 'Profile', icon: Users, action: () => {} },
      { id: 'prefs', label: 'Preferences', icon: Settings, action: () => {} },
      { id: 'logout', label: 'Logout', icon: Link, action: () => {} },
    ],
  },

  files: {
    id: 'files',
    name: 'Files',
    icon: FolderOpen,
    badge: () => null,
    component: PlaceholderApp,
    category: 'productivity',
    isRemovable: true,
    quickActions: [
      { id: 'scan', label: 'Scan Document', icon: FileText, action: () => {} },
      { id: 'upload', label: 'Upload', icon: FolderOpen, action: () => {} },
      { id: 'recent', label: 'Recent', icon: FileText, action: () => {} },
    ],
  },

  artists: {
    id: 'artists',
    name: 'Artists',
    icon: Mic2,
    badge: () => null,
    component: PlaceholderApp,
    category: 'productivity',
    isRemovable: true,
  },

  venues: {
    id: 'venues',
    name: 'Venues',
    icon: Building2,
    badge: () => null,
    component: PlaceholderApp,
    category: 'productivity',
    isRemovable: true,
  },

  links: {
    id: 'links',
    name: 'Links',
    icon: Link,
    badge: () => null,
    component: PlaceholderApp,
    category: 'communication',
    isRemovable: true,
  },

  notes: {
    id: 'notes',
    name: 'Notes',
    icon: FileText,
    badge: () => null,
    component: PlaceholderApp,
    category: 'productivity',
    isRemovable: true,
  },
};

/**
 * Default layout for new users
 */
export const getDefaultLayout = () => ({
  pages: [
    {
      id: 'page-1',
      apps: [
        'shows',
        'finance',
        'travel',
        'calendar',
        'contacts',
        'reports',
        'settings',
        'files',
        'artists',
        'venues',
        'links',
        'notes',
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
    },
  ],
  dock: ['shows', 'finance', 'travel', 'calendar', 'settings'],
  widgets: [],
});
