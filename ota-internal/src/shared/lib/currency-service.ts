// Multi-currency engine for international tour financial management
// Handles real-time rates, offline caching, and currency conversion

import type { CurrencyCode, Money, ExchangeRate, CurrencyPreferences } from '../../types/finance';

interface ExchangeRateAPI {
  base: string;
  date: string;
  rates: Record<string, number>;
}

interface CachedRate extends ExchangeRate {
  cachedAt: Date;
  expiresAt: Date;
}

export class CurrencyService {
  private static instance: CurrencyService;
  private rates: Map<string, CachedRate> = new Map();
  private baseCurrency: CurrencyCode = 'EUR';
  private apiKey: string | null = null;
  private lastFetch: Date | null = null;
  private isOnline: boolean = navigator.onLine;

  // Cache settings
  private readonly CACHE_DURATION = 4 * 60 * 60 * 1000; // 4 hours
  private readonly OFFLINE_CACHE_KEY = 'ota:currency-rates:v1';
  private readonly PREFERENCES_KEY = 'ota:currency-preferences:v1';

  private constructor() {
    this.setupEventListeners();
    this.loadCachedRates();
    this.loadPreferences();
  }

  public static getInstance(): CurrencyService {
    if (!CurrencyService.instance) {
      CurrencyService.instance = new CurrencyService();
    }
    return CurrencyService.instance;
  }

  private setupEventListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.refreshRatesIfStale();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  public setBaseCurrency(currency: CurrencyCode): void {
    this.baseCurrency = currency;
    this.savePreferences();
  }

  public getBaseCurrency(): CurrencyCode {
    return this.baseCurrency;
  }

  public setApiKey(key: string): void {
    this.apiKey = key;
  }

  /**
   * Convert amount to base currency
   */
  public async convertToBase(money: Money): Promise<number> {
    if (money.currency === this.baseCurrency) {
      return money.amount;
    }

    const rate = await this.getRate(money.currency, this.baseCurrency);
    return money.amount * rate;
  }

  /**
   * Convert between any two currencies
   */
  public async convert(amount: number, from: CurrencyCode, to: CurrencyCode): Promise<Money> {
    if (from === to) {
      return {
        amount,
        currency: to,
        baseCurrencyAmount: from === this.baseCurrency ? amount : await this.convertToBase({ amount, currency: from, baseCurrencyAmount: 0 })
      };
    }

    const rate = await this.getRate(from, to);
    const convertedAmount = amount * rate;
    const baseCurrencyAmount = to === this.baseCurrency 
      ? convertedAmount 
      : await this.convertToBase({ amount: convertedAmount, currency: to, baseCurrencyAmount: 0 });

    return {
      amount: convertedAmount,
      currency: to,
      exchangeRate: rate,
      baseCurrencyAmount,
      exchangeRateDate: new Date()
    };
  }

  /**
   * Get exchange rate between two currencies
   */
  public async getRate(from: CurrencyCode, to: CurrencyCode): Promise<number> {
    if (from === to) return 1;

    const cacheKey = `${from}-${to}`;
    const cached = this.rates.get(cacheKey);

    // Use cached rate if valid
    if (cached && cached.expiresAt > new Date()) {
      return cached.rate;
    }

    // Try to fetch fresh rate if online
    if (this.isOnline) {
      try {
        const freshRate = await this.fetchRate(from, to);
        this.cacheRate(from, to, freshRate);
        return freshRate;
      } catch (error) {
        console.warn('Failed to fetch fresh exchange rate:', error);
      }
    }

    // Fall back to cached rate even if expired
    if (cached) {
      console.warn(`Using expired exchange rate for ${from}-${to}`);
      return cached.rate;
    }

    // Final fallback - use approximate rates for common currencies
    const fallbackRate = this.getFallbackRate(from, to);
    if (fallbackRate) {
      console.warn(`Using fallback exchange rate for ${from}-${to}: ${fallbackRate}`);
      return fallbackRate;
    }

    throw new Error(`No exchange rate available for ${from} to ${to}`);
  }

  /**
   * Pre-cache rates for a tour (offline preparation)
   */
  public async cacheRatesForTour(currencies: CurrencyCode[], tourDates: Date[]): Promise<void> {
    if (!this.isOnline) {
      console.warn('Cannot cache rates while offline');
      return;
    }

    const uniqueCurrencies = [...new Set([...currencies, this.baseCurrency])];
    const ratePairs: Array<[CurrencyCode, CurrencyCode]> = [];

    // Generate all currency pair combinations
    for (let i = 0; i < uniqueCurrencies.length; i++) {
      for (let j = 0; j < uniqueCurrencies.length; j++) {
        if (i !== j) {
          ratePairs.push([uniqueCurrencies[i], uniqueCurrencies[j]]);
        }
      }
    }

    // Fetch rates for all pairs
    const fetchPromises = ratePairs.map(async ([from, to]) => {
      try {
        const rate = await this.fetchRate(from, to);
        this.cacheRate(from, to, rate);
      } catch (error) {
        console.warn(`Failed to cache rate for ${from}-${to}:`, error);
      }
    });

    await Promise.allSettled(fetchPromises);
    console.log(`Cached exchange rates for ${ratePairs.length} currency pairs`);
  }

  /**
   * Fetch live exchange rate from API
   */
  private async fetchRate(from: CurrencyCode, to: CurrencyCode): Promise<number> {
    // Use exchangerate-api.com (free tier: 1500 requests/month)
    const baseUrl = 'https://api.exchangerate-api.com/v4/latest';
    
    try {
      const response = await fetch(`${baseUrl}/${from}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: ExchangeRateAPI = await response.json();
      
      if (!data.rates[to]) {
        throw new Error(`Rate not found for ${to}`);
      }

      this.lastFetch = new Date();
      return data.rates[to];
    } catch (error) {
      // Fallback to alternative API if primary fails
      return await this.fetchRateFromFallbackAPI(from, to);
    }
  }

  /**
   * Fallback API for exchange rates
   */
  private async fetchRateFromFallbackAPI(from: CurrencyCode, to: CurrencyCode): Promise<number> {
    // Use fixer.io as fallback (requires API key for production)
    if (!this.apiKey) {
      throw new Error('No API key configured for fallback exchange rate service');
    }

    const response = await fetch(
      `https://api.fixer.io/latest?access_key=${this.apiKey}&base=${from}&symbols=${to}`
    );

    if (!response.ok) {
      throw new Error(`Fallback API failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success || !data.rates[to]) {
      throw new Error('Invalid response from fallback API');
    }

    return data.rates[to];
  }

  /**
   * Cache exchange rate with expiration
   */
  private cacheRate(from: CurrencyCode, to: CurrencyCode, rate: number): void {
    const now = new Date();
    const cacheKey = `${from}-${to}`;
    
    const cachedRate: CachedRate = {
      from,
      to,
      rate,
      date: now,
      source: 'api',
      cachedAt: now,
      expiresAt: new Date(now.getTime() + this.CACHE_DURATION)
    };

    this.rates.set(cacheKey, cachedRate);
    this.persistRatesToStorage();
  }

  /**
   * Get hardcoded fallback rates for major currencies
   */
  private getFallbackRate(from: CurrencyCode, to: CurrencyCode): number | null {
    // Approximate rates as of 2025 - update periodically
    const fallbackRates: Record<string, number> = {
      'EUR-USD': 1.08,
      'USD-EUR': 0.93,
      'EUR-GBP': 0.86,
      'GBP-EUR': 1.16,
      'EUR-JPY': 157.0,
      'JPY-EUR': 0.0064,
      'USD-GBP': 0.80,
      'GBP-USD': 1.25,
      'USD-JPY': 145.0,
      'JPY-USD': 0.0069,
      'EUR-CHF': 0.96,
      'CHF-EUR': 1.04,
      'EUR-CAD': 1.47,
      'CAD-EUR': 0.68,
      'EUR-AUD': 1.64,
      'AUD-EUR': 0.61,
      'EUR-SEK': 11.2,
      'SEK-EUR': 0.089,
      'EUR-NOK': 11.8,
      'NOK-EUR': 0.085,
      'EUR-DKK': 7.46,
      'DKK-EUR': 0.134,
      'EUR-PLN': 4.28,
      'PLN-EUR': 0.234,
      'EUR-CZK': 24.5,
      'CZK-EUR': 0.041,
      'EUR-HUF': 390.0,
      'HUF-EUR': 0.0026
    };

    return fallbackRates[`${from}-${to}`] || null;
  }

  /**
   * Load cached rates from localStorage
   */
  private loadCachedRates(): void {
    try {
      const cached = localStorage.getItem(this.OFFLINE_CACHE_KEY);
      if (cached) {
        const data = JSON.parse(cached);
        for (const [key, rate] of Object.entries(data)) {
          const rateObj = rate as any;
          this.rates.set(key, {
            from: rateObj.from,
            to: rateObj.to,
            rate: rateObj.rate,
            date: new Date(rateObj.date),
            source: rateObj.source,
            cachedAt: new Date(rateObj.cachedAt),
            expiresAt: new Date(rateObj.expiresAt)
          });
        }
      }
    } catch (error) {
      console.warn('Failed to load cached exchange rates:', error);
    }
  }

  /**
   * Persist rates to localStorage for offline use
   */
  private persistRatesToStorage(): void {
    try {
      const ratesObject = Object.fromEntries(this.rates.entries());
      localStorage.setItem(this.OFFLINE_CACHE_KEY, JSON.stringify(ratesObject));
    } catch (error) {
      console.warn('Failed to persist exchange rates:', error);
    }
  }

  /**
   * Load user currency preferences
   */
  private loadPreferences(): void {
    try {
      const prefs = localStorage.getItem(this.PREFERENCES_KEY);
      if (prefs) {
        const preferences: CurrencyPreferences = JSON.parse(prefs);
        this.baseCurrency = preferences.baseCurrency;
      }
    } catch (error) {
      console.warn('Failed to load currency preferences:', error);
    }
  }

  /**
   * Save user currency preferences
   */
  private savePreferences(): void {
    try {
      const preferences: CurrencyPreferences = {
        baseCurrency: this.baseCurrency,
        displayCurrencies: ['EUR', 'USD', 'GBP'], // Default display currencies
        autoConversion: true,
        rateUpdateFrequency: 'daily'
      };
      localStorage.setItem(this.PREFERENCES_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.warn('Failed to save currency preferences:', error);
    }
  }

  /**
   * Refresh rates if cache is stale
   */
  private async refreshRatesIfStale(): Promise<void> {
    if (!this.isOnline) return;

    const now = new Date();
    const staleThreshold = new Date(now.getTime() - this.CACHE_DURATION);

    if (!this.lastFetch || this.lastFetch < staleThreshold) {
      // Refresh commonly used currency pairs
      const commonPairs: Array<[CurrencyCode, CurrencyCode]> = [
        ['EUR', 'USD'], ['USD', 'EUR'],
        ['EUR', 'GBP'], ['GBP', 'EUR'],
        ['USD', 'GBP'], ['GBP', 'USD']
      ];

      const refreshPromises = commonPairs.map(async ([from, to]) => {
        try {
          await this.fetchRate(from, to);
        } catch (error) {
          // Ignore individual failures during bulk refresh
        }
      });

      await Promise.allSettled(refreshPromises);
    }
  }

  /**
   * Format money amount with currency symbol
   */
  public formatMoney(money: Money, options?: {
    showCurrency?: boolean;
    precision?: number;
    locale?: string;
  }): string {
    const { showCurrency = true, precision = 2, locale = 'en-EU' } = options || {};

    const formatter = new Intl.NumberFormat(locale, {
      style: showCurrency ? 'currency' : 'decimal',
      currency: money.currency,
      minimumFractionDigits: precision,
      maximumFractionDigits: precision
    });

    return formatter.format(money.amount);
  }

  /**
   * Get available currencies for the application
   */
  public getAvailableCurrencies(): CurrencyCode[] {
    return ['EUR', 'USD', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'SEK', 'NOK', 'DKK', 'PLN', 'CZK', 'HUF'];
  }

  /**
   * Get currency display name and symbol
   */
  public getCurrencyInfo(code: CurrencyCode) {
    const currencies: Record<CurrencyCode, { name: string; symbol: string }> = {
      'EUR': { name: 'Euro', symbol: '€' },
      'USD': { name: 'US Dollar', symbol: '$' },
      'GBP': { name: 'British Pound', symbol: '£' },
      'JPY': { name: 'Japanese Yen', symbol: '¥' },
      'CAD': { name: 'Canadian Dollar', symbol: 'C$' },
      'AUD': { name: 'Australian Dollar', symbol: 'A$' },
      'CHF': { name: 'Swiss Franc', symbol: 'CHF' },
      'SEK': { name: 'Swedish Krona', symbol: 'kr' },
      'NOK': { name: 'Norwegian Krone', symbol: 'kr' },
      'DKK': { name: 'Danish Krone', symbol: 'kr' },
      'PLN': { name: 'Polish Złoty', symbol: 'zł' },
      'CZK': { name: 'Czech Koruna', symbol: 'Kč' },
      'HUF': { name: 'Hungarian Forint', symbol: 'Ft' }
    };

    return currencies[code] || { name: code, symbol: code };
  }

  /**
   * Clear all cached rates (for testing/reset)
   */
  public clearCache(): void {
    this.rates.clear();
    localStorage.removeItem(this.OFFLINE_CACHE_KEY);
  }

  /**
   * Get cache statistics
   */
  public getCacheStats() {
    const now = new Date();
    let expired = 0;
    let valid = 0;

    for (const rate of this.rates.values()) {
      if (rate.expiresAt > now) {
        valid++;
      } else {
        expired++;
      }
    }

    return {
      totalCached: this.rates.size,
      validRates: valid,
      expiredRates: expired,
      lastFetch: this.lastFetch,
      isOnline: this.isOnline,
      baseCurrency: this.baseCurrency
    };
  }
}

// Singleton instance
export const currencyService = CurrencyService.getInstance();
