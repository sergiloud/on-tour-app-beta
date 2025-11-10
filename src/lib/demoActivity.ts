export interface ActivityItem {
  icon: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'show' | 'finance' | 'travel' | 'document' | 'team';
}

// Mock activity data - in a real app this would come from a backend
const mockActivities: ActivityItem[] = [
  {
    icon: '🎵',
    title: 'Berlin Arena Show Confirmed',
    description: 'Show status changed from pending to confirmed',
    timestamp: '2 hours ago',
    type: 'show'
  },
  {
    icon: '💰',
    title: 'Payment Received',
    description: '€45,000 payment processed for Munich show',
    timestamp: '4 hours ago',
    type: 'finance'
  },
  {
    icon: '📄',
    title: 'Contract Uploaded',
    description: 'New venue contract added to documents',
    timestamp: '1 day ago',
    type: 'document'
  },
  {
    icon: '✈️',
    title: 'Flight Booked',
    description: 'Return flights confirmed for European tour',
    timestamp: '2 days ago',
    type: 'travel'
  },
  {
    icon: '👤',
    title: 'Team Member Added',
    description: 'Sarah Johnson joined the production team',
    timestamp: '3 days ago',
    type: 'team'
  }
];

export function getRecentActivity(sinceTimestamp: number): ActivityItem[] {
  // In a real app, this would filter activities since the given timestamp
  // For demo purposes, return a subset of activities
  const now = Date.now();
  const timeDiff = now - sinceTimestamp;

  // If it's been more than a day, show some activities
  if (timeDiff > 24 * 60 * 60 * 1000) {
    return mockActivities.slice(0, 3);
  }

  // If it's been more than an hour, show fewer activities
  if (timeDiff > 60 * 60 * 1000) {
    return mockActivities.slice(0, 2);
  }

  // If recent visit, show just the most recent
  if (timeDiff > 0) {
    return mockActivities.slice(0, 1);
  }

  // First visit or very recent
  return [];
}