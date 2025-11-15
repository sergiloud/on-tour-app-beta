/**
 * Contract types for show contracts and documents
 */

export type ContractStatus = 'draft' | 'pending' | 'signed' | 'expired' | 'cancelled';

export interface ContractParty {
  name: string;
  role: 'artist' | 'promoter' | 'venue' | 'agent' | 'other';
  email?: string;
  phone?: string;
  signedAt?: string;
  ipAddress?: string;
}

export interface Contract {
  id: string;
  showId?: string; // Link to show
  title: string;
  description?: string;
  status: ContractStatus;
  
  // File information
  fileUrl?: string; // URL to the PDF file (localStorage blob or cloud URL)
  fileName?: string;
  fileSize?: number; // in bytes
  fileMimeType?: string;
  
  // Contract details
  amount?: number;
  currency?: 'EUR' | 'USD' | 'GBP' | 'AUD';
  date?: string; // Contract date
  effectiveDate?: string; // When contract becomes active
  expirationDate?: string; // When contract expires
  
  // Parties
  parties: ContractParty[];
  
  // E-signature
  requiresSignature: boolean;
  signatureProvider?: 'docusign' | 'hellosign' | 'manual' | 'none';
  signatureUrl?: string; // URL for e-signature flow
  
  // Tags and categorization
  tags: string[];
  category?: 'show' | 'tour' | 'recording' | 'publishing' | 'endorsement' | 'other';
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  
  // Notes and reminders
  notes?: string;
  reminders?: ContractReminder[];
}

export interface ContractReminder {
  id: string;
  date: string;
  message: string;
  sent: boolean;
}

export interface ContractFilters {
  search: string;
  status: ContractStatus | 'all';
  category?: string;
  tags: string[];
  showId?: string;
}

export interface ContractStats {
  total: number;
  byStatus: Record<ContractStatus, number>;
  byCategory: Record<string, number>;
  totalValue: number;
  expiringSoon: number; // contracts expiring in next 30 days
}
