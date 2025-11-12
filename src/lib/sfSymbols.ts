/**
 * SF Symbols Icon Mapping
 * Consistent icon system matching iOS design language
 * Using lucide-react with SF Symbols visual style
 */

import {
  Home,
  Calendar,
  DollarSign,
  Map,
  Settings,
  Plus,
  Check,
  X,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  MoreHorizontal,
  MoreVertical,
  Edit,
  Trash2,
  Share2,
  Download,
  Upload,
  Bell,
  User,
  Users,
  Music,
  Plane,
  MapPin,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Info,
  HelpCircle,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Mail,
  Phone,
  MessageSquare,
  Send,
  Star,
  Heart,
  Bookmark,
  Flag,
  Tag,
  Folder,
  File,
  FileText,
  Image,
  Camera,
  Video,
  Mic,
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  Maximize,
  Minimize,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  LogOut,
  LogIn,
  Copy,
  Clipboard,
  Link,
  ExternalLink,
  Menu,
  Grid,
  List,
  Layers,
  Package,
  ShoppingCart,
  CreditCard,
  Wallet,
  Building,
  Briefcase,
  Award,
  Target,
  Activity,
  BarChart,
  PieChart,
  LineChart,
} from 'lucide-react';

/**
 * SF Symbols Icon Categories
 * Organized by functional purpose
 */
export const sfSymbols = {
  // Navigation
  navigation: {
    home: Home,
    calendar: Calendar,
    finance: DollarSign,
    map: Map,
    settings: Settings,
    back: ChevronLeft,
    forward: ChevronRight,
    up: ChevronUp,
    down: ChevronDown,
  },

  // Actions
  actions: {
    add: Plus,
    edit: Edit,
    delete: Trash2,
    share: Share2,
    download: Download,
    upload: Upload,
    search: Search,
    filter: Filter,
    more: MoreHorizontal,
    moreVertical: MoreVertical,
    refresh: RefreshCw,
    copy: Copy,
    paste: Clipboard,
  },

  // Status
  status: {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
    help: HelpCircle,
    check: Check,
    close: X,
  },

  // Communication
  communication: {
    notification: Bell,
    mail: Mail,
    phone: Phone,
    message: MessageSquare,
    send: Send,
  },

  // User
  user: {
    profile: User,
    team: Users,
    logout: LogOut,
    login: LogIn,
  },

  // Content
  content: {
    music: Music,
    travel: Plane,
    location: MapPin,
    time: Clock,
    file: File,
    document: FileText,
    folder: Folder,
    image: Image,
    camera: Camera,
    video: Video,
    audio: Mic,
  },

  // Business
  business: {
    trending: TrendingUp,
    analytics: BarChart,
    chart: LineChart,
    pie: PieChart,
    activity: Activity,
    target: Target,
    award: Award,
    briefcase: Briefcase,
    building: Building,
  },

  // Commerce
  commerce: {
    cart: ShoppingCart,
    card: CreditCard,
    wallet: Wallet,
    package: Package,
    tag: Tag,
  },

  // Media Controls
  media: {
    play: Play,
    pause: Pause,
    previous: SkipBack,
    next: SkipForward,
    repeat: Repeat,
    shuffle: Shuffle,
    volumeOn: Volume2,
    volumeOff: VolumeX,
  },

  // View Controls
  view: {
    grid: Grid,
    list: List,
    layers: Layers,
    maximize: Maximize,
    minimize: Minimize,
    zoomIn: ZoomIn,
    zoomOut: ZoomOut,
    show: Eye,
    hide: EyeOff,
  },

  // Security
  security: {
    lock: Lock,
    unlock: Unlock,
  },

  // Social
  social: {
    star: Star,
    heart: Heart,
    bookmark: Bookmark,
    flag: Flag,
    link: Link,
    externalLink: ExternalLink,
  },
} as const;

/**
 * Icon weight presets matching SF Symbols
 */
export const iconWeights = {
  ultralight: 1,
  thin: 1.5,
  light: 2,
  regular: 2,
  medium: 2.5,
  semibold: 2.5,
  bold: 3,
  heavy: 3.5,
  black: 4,
} as const;

/**
 * SF Symbols rendering modes
 */
export const iconModes = {
  // Monochrome - single color (default)
  monochrome: 'currentColor',
  
  // Hierarchical - opacity variations
  hierarchical: {
    primary: 'currentColor',
    secondary: 'opacity-70',
    tertiary: 'opacity-40',
  },
  
  // Palette - multiple colors
  palette: {
    primary: 'text-accent-500',
    secondary: 'text-blue-400',
    tertiary: 'text-purple-400',
  },
} as const;

/**
 * Get icon component by category and name
 */
export const getIcon = (category: keyof typeof sfSymbols, name: string) => {
  const categoryIcons = sfSymbols[category];
  if (!categoryIcons) return null;
  return (categoryIcons as any)[name];
};
