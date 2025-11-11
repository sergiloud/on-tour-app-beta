/**
 * Venue type for show location management
 */
export interface Venue {
  id: string;
  name: string;
  city?: string;
  country?: string;
  capacity?: number;
  address?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
