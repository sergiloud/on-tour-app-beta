import { ReactNode, ComponentType } from 'react';
import { LucideIcon } from 'lucide-react';

/**
 * Definición de una App en el sistema móvil iOS-style
 */
export interface AppDefinition {
  id: string;
  name: string;
  icon: LucideIcon; // Icono profesional de Lucide
  badge?: () => number | string | null; // Dynamic badge function
  component: React.ComponentType<AppComponentProps>;
  category: AppCategory;
  isRemovable: boolean; // Settings/Profile cannot be removed
  quickActions?: QuickAction[];
}

export type AppCategory = 
  | 'productivity' 
  | 'finance' 
  | 'travel' 
  | 'communication'
  | 'settings' 
  | 'other';

export interface QuickAction {
  id: string;
  label: string;
  icon: LucideIcon;
  action: () => void;
}

/**
 * Props pasados a cada componente de App
 */
export interface AppComponentProps {
  onClose?: () => void;
  isActive?: boolean;
}

/**
 * Layout del home screen (múltiples páginas)
 */
export interface AppLayout {
  pages: AppPage[];
  dock: string[]; // Array of app IDs in dock (max 5)
  widgets: WidgetConfig[];
}

export interface AppPage {
  id: string;
  apps: (string | null)[]; // 20 slots (4 columns x 5 rows)
}

export interface WidgetConfig {
  id: string;
  appId: string;
  type: 'small' | 'medium' | 'large';
  position: { page: number; slot: number };
}

/**
 * Estado global del Mobile OS
 */
export interface MobileOSState {
  currentView: 'home' | 'app' | 'appSwitcher' | 'search' | 'notifications' | 'control';
  openApp: AppDefinition | null;
  recentApps: string[]; // App IDs for app switcher (max 10)
  homeLayout: AppLayout;
  isEditMode: boolean;
  searchQuery: string;
}

/**
 * Resultado de búsqueda Spotlight
 */
export interface SearchResult {
  type: 'app' | 'show' | 'contact' | 'action' | 'setting';
  id: string;
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  onSelect: () => void;
}

/**
 * Notificación en el sistema
 */
export interface Notification {
  id: string;
  appId: string;
  title: string;
  body: string;
  timestamp: Date;
  isRead: boolean;
  action?: () => void;
}

/**
 * Configuración de drag & drop
 */
export interface DragState {
  isDragging: boolean;
  draggedAppId: string | null;
  sourceType: 'grid' | 'dock';
  sourceIndex: number;
  sourcePage?: number;
}
