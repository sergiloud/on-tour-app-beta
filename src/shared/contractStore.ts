/**
 * Contract Store - Gestión de contratos y documentos
 * Patrón similar a contactStore
 */

import type { Contract, ContractFilters, ContractStats } from '../types/contract';
import { logger } from '../lib/logger';

class ContractStore {
  private contracts: Map<string, Contract> = new Map();
  private listeners: Set<() => void> = new Set();
  private cachedContracts: Contract[] = [];
  private cachedStats: ContractStats | null = null;

  constructor() {
    this.loadFromLocalStorage();
    this.updateCache();
    
    // Listen for storage events (cross-tab and real-time sync)
    window.addEventListener('storage', (e) => {
      if (e.key === 'on-tour-contracts' && e.newValue) {
        try {
          const data = JSON.parse(e.newValue) as Contract[];
          this.contracts = new Map(data.map((contract) => [contract.id, contract]));
          this.updateCache();
          this.listeners.forEach((listener) => listener());
          logger.info('[ContractStore] Synced from storage event', { count: data.length });
        } catch (error) {
          logger.error('[ContractStore] Error syncing from storage event', error as Error);
        }
      }
    });
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.saveToLocalStorage();
    this.updateCache();
    this.listeners.forEach((listener) => listener());
  }

  private updateCache(): void {
    this.cachedContracts = Array.from(this.contracts.values());
    this.cachedStats = null; // Invalidate stats cache
  }

  private loadFromLocalStorage(): void {
    try {
      const stored = localStorage.getItem('on-tour-contracts');
      if (stored) {
        const data = JSON.parse(stored) as Contract[];
        this.contracts = new Map(data.map((contract) => [contract.id, contract]));
        this.updateCache();
      }
    } catch (error) {
      logger.error('[ContractStore] Error loading from localStorage', error as Error);
    }
  }

  private saveToLocalStorage(): void {
    try {
      const data = Array.from(this.contracts.values());
      localStorage.setItem('on-tour-contracts', JSON.stringify(data));
    } catch (error) {
      logger.error('[ContractStore] Error saving to localStorage', error as Error, { count: this.contracts.size });
    }
  }

  // CRUD Operations
  getAll(): Contract[] {
    return this.cachedContracts;
  }

  getById(id: string): Contract | undefined {
    return this.contracts.get(id);
  }

  getByShowId(showId: string): Contract[] {
    return this.cachedContracts.filter(c => c.showId === showId);
  }

  add(contract: Contract): void {
    this.contracts.set(contract.id, contract);
    this.notify();
  }

  setAll(contracts: Contract[]): void {
    this.contracts.clear();
    contracts.forEach(contract => {
      this.contracts.set(contract.id, contract);
    });
    this.notify();
  }

  update(id: string, updates: Partial<Contract>): void {
    const contract = this.contracts.get(id);
    if (contract) {
      const updated = {
        ...contract,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.contracts.set(id, updated);
      this.notify();
    }
  }

  delete(id: string): void {
    this.contracts.delete(id);
    this.notify();
  }

  // Search and filter
  search(filters: ContractFilters): Contract[] {
    let filtered = this.cachedContracts;

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(search) ||
        c.description?.toLowerCase().includes(search) ||
        c.parties.some(p => p.name.toLowerCase().includes(search))
      );
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(c => c.status === filters.status);
    }

    if (filters.category) {
      filtered = filtered.filter(c => c.category === filters.category);
    }

    if (filters.tags.length > 0) {
      filtered = filtered.filter(c =>
        filters.tags.some(tag => c.tags.includes(tag))
      );
    }

    if (filters.showId) {
      filtered = filtered.filter(c => c.showId === filters.showId);
    }

    return filtered;
  }

  // Stats
  getStats(): ContractStats {
    if (this.cachedStats) return this.cachedStats;

    const byStatus: Record<string, number> = {
      draft: 0,
      pending: 0,
      signed: 0,
      expired: 0,
      cancelled: 0,
    };

    const byCategory: Record<string, number> = {};
    let totalValue = 0;
    let expiringSoon = 0;

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    this.cachedContracts.forEach(contract => {
      // Count by status
      byStatus[contract.status] = (byStatus[contract.status] || 0) + 1;

      // Count by category
      if (contract.category) {
        byCategory[contract.category] = (byCategory[contract.category] || 0) + 1;
      }

      // Sum total value
      if (contract.amount) {
        totalValue += contract.amount;
      }

      // Count expiring soon
      if (contract.expirationDate) {
        const expirationDate = new Date(contract.expirationDate);
        if (expirationDate > now && expirationDate <= thirtyDaysFromNow) {
          expiringSoon++;
        }
      }
    });

    this.cachedStats = {
      total: this.cachedContracts.length,
      byStatus: byStatus as Record<any, number>,
      byCategory,
      totalValue,
      expiringSoon,
    };

    return this.cachedStats;
  }

  // Export/Import
  exportToJSON(): string {
    return JSON.stringify(this.cachedContracts, null, 2);
  }

  importFromJSON(json: string): void {
    try {
      const data = JSON.parse(json) as Contract[];
      this.setAll(data);
    } catch (error) {
      logger.error('[ContractStore] Error importing JSON', error as Error);
      throw error;
    }
  }
}

export const contractStore = new ContractStore();
