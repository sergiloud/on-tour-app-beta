// Real API Integration Service for Finance Dashboard
class RealAPIService {
  constructor() {
    this.exchangeRateAPI = 'https://api.exchangerate-api.com/v4/latest/';
    this.fallbackExchangeAPI = 'https://api.fixer.io/latest';
    this.cryptoAPI = 'https://api.coingecko.com/api/v3/simple/price';
    this.newsAPI = 'https://newsapi.org/v2/everything';
    
    // Cache settings
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    
    // Rate limiting
    this.rateLimiter = new Map();
    this.rateLimitWindow = 60 * 1000; // 1 minute
    this.maxRequestsPerWindow = 100;
    
    this.initializeService();
  }

  async initializeService() {
    console.log('🌐 Initializing Real API Service...');
    
    // Test API connectivity
    await this.testAPIConnectivity();
    
    // Setup offline detection
    this.setupOfflineDetection();
    
    // Initialize background sync
    this.setupBackgroundSync();
    
    console.log('✅ Real API Service initialized');
  }

  async testAPIConnectivity() {
    const apis = [
      { name: 'Exchange Rate API', url: this.exchangeRateAPI + 'EUR', critical: true },
      { name: 'Crypto API', url: this.cryptoAPI + '?ids=bitcoin&vs_currencies=usd', critical: false }
    ];

    for (const api of apis) {
      try {
        const response = await fetch(api.url, { 
          method: 'GET',
          timeout: 5000,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'OnTourApp/1.0'
          }
        });
        
        if (response.ok) {
          console.log(`✅ ${api.name} is accessible`);
        } else {
          console.warn(`⚠️  ${api.name} returned status ${response.status}`);
        }
      } catch (error) {
        console.error(`❌ ${api.name} failed:`, error.message);
        if (api.critical) {
          console.warn('Critical API unavailable, falling back to cached data');
        }
      }
    }
  }

  setupOfflineDetection() {
    this.isOnline = navigator.onLine;
    
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('🌐 Connection restored, syncing data...');
      this.syncOfflineData();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('📱 Offline mode activated');
    });
  }

  setupBackgroundSync() {
    // Sync exchange rates every 5 minutes
    setInterval(() => {
      if (this.isOnline) {
        this.updateExchangeRates();
      }
    }, 5 * 60 * 1000);

    // Sync financial news every 30 minutes
    setInterval(() => {
      if (this.isOnline) {
        this.fetchFinancialNews();
      }
    }, 30 * 60 * 1000);
  }

  // Exchange Rate API Integration
  async getExchangeRates(baseCurrency = 'EUR') {
    const cacheKey = `exchange_rates_${baseCurrency}`;
    
    // Check cache first
    if (this.isCacheValid(cacheKey)) {
      console.log('📦 Using cached exchange rates');
      return this.cache.get(cacheKey).data;
    }

    if (!this.isOnline) {
      console.log('📱 Offline: using last cached rates');
      const cached = this.cache.get(cacheKey);
      return cached ? cached.data : this.getFallbackRates(baseCurrency);
    }

    try {
      // Rate limiting check
      if (!this.checkRateLimit('exchange_rates')) {
        throw new Error('Rate limit exceeded');
      }

      const response = await fetch(`${this.exchangeRateAPI}${baseCurrency}`, {
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();
      
      // Process and enhance the data
      const processedRates = {
        base: data.base,
        date: data.date,
        timestamp: Date.now(),
        rates: data.rates,
        metadata: {
          provider: 'exchangerate-api.com',
          lastUpdated: new Date().toISOString(),
          rateCount: Object.keys(data.rates).length
        }
      };

      // Cache the result
      this.cache.set(cacheKey, {
        data: processedRates,
        timestamp: Date.now()
      });

      console.log(`💱 Exchange rates updated for ${baseCurrency}`);
      return processedRates;

    } catch (error) {
      console.error('❌ Exchange rate API failed:', error);
      
      // Try fallback API
      return await this.getFallbackExchangeRates(baseCurrency);
    }
  }

  async getFallbackExchangeRates(baseCurrency) {
    try {
      console.log('🔄 Trying fallback exchange rate API...');
      
      // Use a different API as fallback
      const response = await fetch(`https://api.fixer.io/latest?base=${baseCurrency}&access_key=YOUR_FIXER_KEY`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Fallback API successful');
        return data;
      }
    } catch (error) {
      console.error('❌ Fallback API also failed:', error);
    }

    // Final fallback to static rates
    return this.getFallbackRates(baseCurrency);
  }

  getFallbackRates(baseCurrency) {
    const staticRates = {
      'EUR': {
        'USD': 1.0856, 'GBP': 0.8321, 'JPY': 161.23, 'CAD': 1.5123, 
        'AUD': 1.6789, 'CHF': 0.9456, 'CNY': 7.8234, 'SEK': 11.2345
      },
      'USD': {
        'EUR': 0.9211, 'GBP': 0.7661, 'JPY': 148.52, 'CAD': 1.3928,
        'AUD': 1.5456, 'CHF': 0.8712, 'CNY': 7.2089, 'SEK': 10.3456
      },
      'GBP': {
        'EUR': 1.2017, 'USD': 1.3051, 'JPY': 193.82, 'CAD': 1.8167,
        'AUD': 2.0178, 'CHF': 1.1367, 'CNY': 9.4123, 'SEK': 13.5123
      }
    };

    return {
      base: baseCurrency,
      date: new Date().toISOString().split('T')[0],
      timestamp: Date.now(),
      rates: staticRates[baseCurrency] || staticRates['EUR'],
      metadata: {
        provider: 'fallback-static',
        lastUpdated: new Date().toISOString(),
        note: 'Using cached/static rates due to API unavailability'
      }
    };
  }

  // Cryptocurrency Price Integration
  async getCryptoPrices(coins = ['bitcoin', 'ethereum']) {
    const cacheKey = `crypto_prices_${coins.join(',')}`;
    
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey).data;
    }

    if (!this.isOnline) {
      const cached = this.cache.get(cacheKey);
      return cached ? cached.data : {};
    }

    try {
      const coinsParam = coins.join(',');
      const response = await fetch(
        `${this.cryptoAPI}?ids=${coinsParam}&vs_currencies=usd,eur&include_24hr_change=true`
      );

      if (!response.ok) {
        throw new Error(`Crypto API returned ${response.status}`);
      }

      const data = await response.json();
      
      this.cache.set(cacheKey, {
        data: data,
        timestamp: Date.now()
      });

      console.log('₿ Crypto prices updated');
      return data;

    } catch (error) {
      console.error('❌ Crypto API failed:', error);
      return {};
    }
  }

  // Financial News Integration
  async fetchFinancialNews(query = 'finance OR economy OR currency', limit = 10) {
    const cacheKey = `financial_news_${query}`;
    
    if (this.isCacheValid(cacheKey, 30 * 60 * 1000)) { // 30 min cache for news
      return this.cache.get(cacheKey).data;
    }

    if (!this.isOnline) {
      const cached = this.cache.get(cacheKey);
      return cached ? cached.data : { articles: [] };
    }

    try {
      // Note: You'll need to get a free API key from newsapi.org
      const response = await fetch(
        `${this.newsAPI}?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=${limit}&apiKey=YOUR_NEWS_API_KEY`
      );

      if (!response.ok) {
        throw new Error(`News API returned ${response.status}`);
      }

      const data = await response.json();
      
      // Filter and enhance news data
      const processedNews = {
        articles: data.articles.map(article => ({
          title: article.title,
          description: article.description,
          url: article.url,
          publishedAt: article.publishedAt,
          source: article.source.name,
          relevanceScore: this.calculateNewsRelevance(article)
        })).sort((a, b) => b.relevanceScore - a.relevanceScore),
        totalResults: data.totalResults,
        lastUpdated: new Date().toISOString()
      };

      this.cache.set(cacheKey, {
        data: processedNews,
        timestamp: Date.now()
      });

      console.log('📰 Financial news updated');
      return processedNews;

    } catch (error) {
      console.error('❌ News API failed:', error);
      return { articles: [] };
    }
  }

  calculateNewsRelevance(article) {
    const keywords = ['finance', 'economy', 'market', 'currency', 'investment', 'profit', 'revenue'];
    const text = (article.title + ' ' + (article.description || '')).toLowerCase();
    
    return keywords.reduce((score, keyword) => {
      return score + (text.includes(keyword) ? 1 : 0);
    }, 0);
  }

  // Economic Indicators Integration
  async getEconomicIndicators() {
    const cacheKey = 'economic_indicators';
    
    if (this.isCacheValid(cacheKey, 60 * 60 * 1000)) { // 1 hour cache
      return this.cache.get(cacheKey).data;
    }

    try {
      // Mock economic data - in real implementation, use World Bank or FRED API
      const indicators = {
        gdpGrowth: { value: 2.1, change: 0.3, period: 'Q2 2025' },
        inflation: { value: 3.2, change: -0.1, period: 'Aug 2025' },
        unemployment: { value: 4.8, change: -0.2, period: 'Aug 2025' },
        interestRate: { value: 4.5, change: 0.0, period: 'Sep 2025' },
        marketIndices: {
          sp500: { value: 4567.89, change: 1.23, changePercent: 0.027 },
          nasdaq: { value: 14234.56, change: -45.67, changePercent: -0.32 },
          dow: { value: 34567.12, change: 234.56, changePercent: 0.68 }
        },
        commodities: {
          gold: { value: 1987.65, change: 12.34, unit: 'USD/oz' },
          oil: { value: 87.23, change: -2.45, unit: 'USD/barrel' },
          copper: { value: 3.87, change: 0.12, unit: 'USD/lb' }
        },
        lastUpdated: new Date().toISOString()
      };

      this.cache.set(cacheKey, {
        data: indicators,
        timestamp: Date.now()
      });

      return indicators;

    } catch (error) {
      console.error('❌ Economic indicators failed:', error);
      return null;
    }
  }

  // Real Accounting Data Integration
  async syncAccountingData() {
    console.log('💼 Syncing accounting data...');
    
    try {
      // In real implementation, integrate with QuickBooks, Xero, or similar
      const accountingData = await this.fetchQuickBooksData();
      
      // Process and store the data
      const processedData = this.processAccountingData(accountingData);
      
      // Update local storage
      localStorage.setItem('accounting_sync', JSON.stringify({
        data: processedData,
        timestamp: Date.now()
      }));

      console.log('✅ Accounting data synced successfully');
      return processedData;

    } catch (error) {
      console.error('❌ Accounting sync failed:', error);
      return null;
    }
  }

  async fetchQuickBooksData() {
    // Mock QuickBooks API integration
    // In real implementation, use QuickBooks Online API
    return {
      expenses: [
        { id: 1, date: '2025-09-10', amount: 1250, category: 'Travel', vendor: 'Airline Co', description: 'Flight to Berlin' },
        { id: 2, date: '2025-09-11', amount: 890, category: 'Accommodation', vendor: 'Hotel Berlin', description: '3 nights accommodation' },
        { id: 3, date: '2025-09-12', amount: 340, category: 'Equipment', vendor: 'Music Store', description: 'Guitar strings and picks' }
      ],
      income: [
        { id: 1, date: '2025-09-13', amount: 8500, category: 'Performance', client: 'Berlin Music Hall', description: 'Live performance' },
        { id: 2, date: '2025-09-14', amount: 1200, category: 'Merchandise', client: 'Venue Sales', description: 'T-shirts and albums' }
      ],
      bankAccounts: [
        { id: 1, name: 'Business Checking', balance: 45670.23, currency: 'EUR' },
        { id: 2, name: 'Savings', balance: 23450.67, currency: 'EUR' }
      ]
    };
  }

  processAccountingData(rawData) {
    return {
      totalExpenses: rawData.expenses.reduce((sum, exp) => sum + exp.amount, 0),
      totalIncome: rawData.income.reduce((sum, inc) => sum + inc.amount, 0),
      netProfit: rawData.income.reduce((sum, inc) => sum + inc.amount, 0) - 
                 rawData.expenses.reduce((sum, exp) => sum + exp.amount, 0),
      expensesByCategory: this.groupByCategory(rawData.expenses),
      incomeByCategory: this.groupByCategory(rawData.income),
      totalBankBalance: rawData.bankAccounts.reduce((sum, acc) => sum + acc.balance, 0),
      transactionCount: rawData.expenses.length + rawData.income.length,
      lastUpdated: new Date().toISOString()
    };
  }

  groupByCategory(transactions) {
    return transactions.reduce((acc, transaction) => {
      const category = transaction.category;
      if (!acc[category]) {
        acc[category] = { total: 0, count: 0, transactions: [] };
      }
      acc[category].total += transaction.amount;
      acc[category].count += 1;
      acc[category].transactions.push(transaction);
      return acc;
    }, {});
  }

  // Utility methods
  isCacheValid(key, customExpiry = null) {
    const cached = this.cache.get(key);
    if (!cached) return false;
    
    const expiry = customExpiry || this.cacheExpiry;
    return (Date.now() - cached.timestamp) < expiry;
  }

  checkRateLimit(apiType) {
    const now = Date.now();
    const windowStart = now - this.rateLimitWindow;
    
    if (!this.rateLimiter.has(apiType)) {
      this.rateLimiter.set(apiType, []);
    }
    
    const requests = this.rateLimiter.get(apiType);
    
    // Remove old requests outside the window
    const recentRequests = requests.filter(timestamp => timestamp > windowStart);
    
    if (recentRequests.length >= this.maxRequestsPerWindow) {
      console.warn(`⚠️  Rate limit exceeded for ${apiType}`);
      return false;
    }
    
    // Add current request
    recentRequests.push(now);
    this.rateLimiter.set(apiType, recentRequests);
    
    return true;
  }

  async syncOfflineData() {
    console.log('🔄 Syncing offline data...');
    
    const offlineQueue = JSON.parse(localStorage.getItem('offline_queue') || '[]');
    
    for (const item of offlineQueue) {
      try {
        await this.processOfflineItem(item);
      } catch (error) {
        console.error('Failed to sync offline item:', error);
      }
    }
    
    localStorage.removeItem('offline_queue');
    console.log('✅ Offline data synced');
  }

  async processOfflineItem(item) {
    switch (item.type) {
      case 'expense':
        await this.submitExpense(item.data);
        break;
      case 'income':
        await this.submitIncome(item.data);
        break;
      default:
        console.warn('Unknown offline item type:', item.type);
    }
  }

  // Public API for dashboard integration
  async updateExchangeRates() {
    const rates = await this.getExchangeRates();
    
    // Emit event for dashboard to listen
    window.dispatchEvent(new CustomEvent('exchangeRatesUpdated', {
      detail: rates
    }));
    
    return rates;
  }

  async getFinancialSummary() {
    const [rates, accountingData, economicData, cryptoPrices] = await Promise.allSettled([
      this.getExchangeRates(),
      this.syncAccountingData(),
      this.getEconomicIndicators(),
      this.getCryptoPrices()
    ]);

    return {
      exchangeRates: rates.status === 'fulfilled' ? rates.value : null,
      accounting: accountingData.status === 'fulfilled' ? accountingData.value : null,
      economic: economicData.status === 'fulfilled' ? economicData.value : null,
      crypto: cryptoPrices.status === 'fulfilled' ? cryptoPrices.value : null,
      timestamp: Date.now(),
      isOnline: this.isOnline
    };
  }

  // Health check for all APIs
  async performHealthCheck() {
    const results = {
      exchangeRate: false,
      crypto: false,
      news: false,
      accounting: false,
      timestamp: new Date().toISOString()
    };

    try {
      await this.getExchangeRates();
      results.exchangeRate = true;
    } catch (error) {
      console.error('Exchange rate health check failed:', error);
    }

    try {
      await this.getCryptoPrices(['bitcoin']);
      results.crypto = true;
    } catch (error) {
      console.error('Crypto health check failed:', error);
    }

    return results;
  }
}

// Export for use in dashboard
// --- Singleton & compatibility named exports ---
// Some orchestrator code expects functional exports: init, fetchExpenses, fetchGoals, fetchShows, fetchSettings, getFXRates.
// Provide a lightweight singleton with noop/stub methods until real endpoints are wired.
const __realApiSingleton = new RealAPIService();

// Initialization hook (currently just returns singleton)
export function init(){ return __realApiSingleton; }

// Placeholder data fetchers – in real implementation these would hit backend endpoints.
export async function fetchExpenses(){
  // Try to surface any synced accounting expenses if available
  try {
    const sync = JSON.parse(localStorage.getItem('accounting_sync')||'{}');
    const raw = sync.data?.expenses || [];
    // Normalize sign convention: expenses negative, incomes positive
    return raw.map(r => ({ ...r, amount: Math.sign(r.amount) < 0 ? r.amount : -Math.abs(r.amount), type: 'expense' }));
  } catch(e){ return []; }
}
export async function fetchGoals(){ return []; }
export async function fetchShows(){ return []; }
export async function fetchSettings(){ return { currency: 'EUR' }; }
export async function getFXRates(params){
  try { return await __realApiSingleton.getExchangeRates(params?.base || 'EUR'); } catch(e){ return {}; }
}

export default RealAPIService;
