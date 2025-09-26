// Smart expense categorization engine for tour management
// Uses pattern matching, ML-lite heuristics, and learns from user corrections

import type { ExpenseCategory, FinancialEntity, Money } from '../../types/finance';

interface CategoryPattern {
  category: ExpenseCategory;
  patterns: RegExp[];
  vendorPatterns?: RegExp[];
  amountHeuristics?: {
    min?: number;
    max?: number;
    typical?: number;
  };
  confidence: number; // Base confidence for this pattern
}

interface CategorySuggestion {
  category: ExpenseCategory;
  confidence: number;
  reason: string;
  alternatives?: Array<{
    category: ExpenseCategory;
    confidence: number;
  }>;
}

interface UserCorrection {
  originalSuggestion: ExpenseCategory;
  userChoice: ExpenseCategory;
  description: string;
  vendor?: string;
  amount: number;
  timestamp: Date;
}

export class ExpenseCategorizationEngine {
  private patterns: CategoryPattern[] = [];
  private userCorrections: UserCorrection[] = [];
  private readonly CORRECTIONS_KEY = 'ota:expense-corrections:v1';
  private readonly MIN_CONFIDENCE_THRESHOLD = 0.6;

  constructor() {
    this.initializePatterns();
    this.loadUserCorrections();
  }

  /**
   * Categorize an expense based on description, vendor, and amount
   */
  public categorize(
    description: string,
    amount: number,
    vendor?: string,
    currency: string = 'EUR'
  ): CategorySuggestion {
    const normalizedDesc = description.toLowerCase().trim();
    const normalizedVendor = vendor?.toLowerCase().trim() || '';
    
    // Convert amount to EUR for consistent heuristics
    const eurAmount = this.convertToEUR(amount, currency);
    
    let bestMatch: CategorySuggestion = {
      category: 'other',
      confidence: 0.1,
      reason: 'No pattern matched - defaulting to other'
    };

    const alternatives: Array<{ category: ExpenseCategory; confidence: number }> = [];

    // Check each pattern
    for (const pattern of this.patterns) {
      let confidence = 0;
      const reasons: string[] = [];

      // Text pattern matching
      const descriptionMatch = pattern.patterns.some(p => p.test(normalizedDesc));
      if (descriptionMatch) {
        confidence += 0.4;
        reasons.push('description match');
      }

      // Vendor pattern matching  
      if (pattern.vendorPatterns && normalizedVendor) {
        const vendorMatch = pattern.vendorPatterns.some(p => p.test(normalizedVendor));
        if (vendorMatch) {
          confidence += 0.3;
          reasons.push('vendor match');
        }
      }

      // Amount heuristics
      if (pattern.amountHeuristics) {
        const amountScore = this.calculateAmountScore(eurAmount, pattern.amountHeuristics);
        confidence += amountScore * 0.2;
        if (amountScore > 0.5) {
          reasons.push('amount typical for category');
        }
      }

      // Apply base confidence
      confidence = Math.min(1.0, confidence * pattern.confidence);

      // Check user corrections for learning
      const correctionBoost = this.getUserCorrectionBoost(
        pattern.category,
        normalizedDesc,
        normalizedVendor,
        eurAmount
      );
      confidence += correctionBoost;

      if (confidence > bestMatch.confidence) {
        // Store previous best as alternative
        if (bestMatch.confidence > 0.3) {
          alternatives.push({
            category: bestMatch.category,
            confidence: bestMatch.confidence
          });
        }

        bestMatch = {
          category: pattern.category,
          confidence: Math.min(1.0, confidence),
          reason: reasons.join(', ')
        };
      } else if (confidence > 0.3) {
        alternatives.push({
          category: pattern.category,
          confidence: Math.min(1.0, confidence)
        });
      }
    }

    // Sort alternatives by confidence
    alternatives.sort((a, b) => b.confidence - a.confidence);
    bestMatch.alternatives = alternatives.slice(0, 3);

    return bestMatch;
  }

  /**
   * Learn from user correction
   */
  public recordUserCorrection(
    originalSuggestion: ExpenseCategory,
    userChoice: ExpenseCategory,
    description: string,
    vendor?: string,
    amount?: number
  ): void {
    if (originalSuggestion === userChoice) {
      return; // No correction needed
    }

    const correction: UserCorrection = {
      originalSuggestion,
      userChoice,
      description: description.toLowerCase().trim(),
      vendor: vendor?.toLowerCase().trim(),
      amount: amount || 0,
      timestamp: new Date()
    };

    this.userCorrections.push(correction);
    
    // Keep only recent corrections (last 1000)
    if (this.userCorrections.length > 1000) {
      this.userCorrections = this.userCorrections.slice(-1000);
    }

    this.saveUserCorrections();
  }

  /**
   * Get category suggestions with explanations
   */
  public getSuggestions(
    description: string,
    amount: number,
    vendor?: string,
    currency: string = 'EUR'
  ): CategorySuggestion[] {
    const primary = this.categorize(description, amount, vendor, currency);
    const suggestions = [primary];

    // Add high-confidence alternatives
    if (primary.alternatives) {
      for (const alt of primary.alternatives) {
        if (alt.confidence > 0.5) {
          suggestions.push({
            category: alt.category,
            confidence: alt.confidence,
            reason: `Alternative suggestion based on ${this.getCategoryDescription(alt.category)}`
          });
        }
      }
    }

    return suggestions;
  }

  /**
   * Initialize categorization patterns
   */
  private initializePatterns(): void {
    this.patterns = [
      // Travel - Flights
      {
        category: 'travel-flights',
        patterns: [
          /\b(flight|airline|airport|airfare|ticket|lufthansa|ryanair|easyjet|british airways|klm|air france|delta|united|american airlines)\b/i,
          /\b(boarding|departure|arrival|gate|terminal)\b/i
        ],
        vendorPatterns: [
          /\b(lufthansa|ryanair|easyjet|british airways|klm|air france|delta|united|american|emirates|qatar|turkish)\b/i
        ],
        amountHeuristics: { min: 50, max: 2000, typical: 300 },
        confidence: 1.0
      },

      // Travel - Ground Transportation
      {
        category: 'travel-ground',
        patterns: [
          /\b(taxi|uber|lyft|bus|train|rental car|car hire|transfer|shuttle|metro|subway)\b/i,
          /\b(transport|transportation|fuel|gas|petrol|parking|toll|highway)\b/i
        ],
        vendorPatterns: [
          /\b(uber|lyft|hertz|avis|europcar|sixt|db bahn|sncf|trenitalia)\b/i
        ],
        amountHeuristics: { min: 10, max: 500, typical: 80 },
        confidence: 0.9
      },

      // Accommodation
      {
        category: 'accommodation',
        patterns: [
          /\b(hotel|hostel|airbnb|booking|accommodation|lodging|stay|room|suite)\b/i,
          /\b(marriott|hilton|hyatt|ibis|novotel|holiday inn)\b/i
        ],
        vendorPatterns: [
          /\b(booking\.com|expedia|airbnb|marriott|hilton|hyatt|ibis|novotel|holiday inn)\b/i
        ],
        amountHeuristics: { min: 40, max: 800, typical: 150 },
        confidence: 1.0
      },

      // Production - Sound
      {
        category: 'production-sound',
        patterns: [
          /\b(sound|audio|pa system|microphone|mixer|amplifier|speaker|monitor|in-ear|wireless|dj equipment)\b/i,
          /\b(tech rider|backline|sound check|engineer|foh|monitor engineer)\b/i
        ],
        amountHeuristics: { min: 100, max: 5000, typical: 800 },
        confidence: 0.95
      },

      // Production - Lights
      {
        category: 'production-lights',
        patterns: [
          /\b(light|lighting|led|moving head|par can|strobe|haze|fog|laser|dmx|controller)\b/i,
          /\b(lighting designer|ld|lighting tech|rigging)\b/i
        ],
        amountHeuristics: { min: 200, max: 8000, typical: 1200 },
        confidence: 0.95
      },

      // Production - Stage
      {
        category: 'production-stage',
        patterns: [
          /\b(stage|platform|riser|barrier|truss|rigging|scaffold|deck|carpeting)\b/i,
          /\b(stage manager|crew|setup|breakdown|load in|load out)\b/i
        ],
        amountHeuristics: { min: 300, max: 10000, typical: 2000 },
        confidence: 0.9
      },

      // Crew Fees
      {
        category: 'crew-fees',
        patterns: [
          /\b(crew|technician|engineer|manager|assistant|security|driver|tech)\b/i,
          /\b(salary|wage|fee|payment|crew chief|stage hand)\b/i
        ],
        amountHeuristics: { min: 50, max: 2000, typical: 300 },
        confidence: 0.8
      },

      // Crew Per Diem
      {
        category: 'crew-per-diem',
        patterns: [
          /\b(per diem|meal|food|catering|restaurant|breakfast|lunch|dinner|drinks)\b/i,
          /\b(crew meal|production catering|buy out)\b/i
        ],
        amountHeuristics: { min: 10, max: 200, typical: 40 },
        confidence: 0.85
      },

      // Marketing - Promotion
      {
        category: 'marketing-promotion',
        patterns: [
          /\b(poster|flyer|print|radio|tv|billboard|advertising|promotion|marketing)\b/i,
          /\b(pr agency|publicist|press|media|interview)\b/i
        ],
        amountHeuristics: { min: 50, max: 5000, typical: 500 },
        confidence: 0.8
      },

      // Marketing - Digital
      {
        category: 'marketing-digital',
        patterns: [
          /\b(facebook|instagram|spotify|youtube|google ads|social media|online|digital|web)\b/i,
          /\b(facebook ads|instagram ads|spotify ads|google adwords|social media manager)\b/i
        ],
        vendorPatterns: [
          /\b(facebook|meta|google|spotify|youtube|instagram|tiktok|twitter)\b/i
        ],
        amountHeuristics: { min: 25, max: 3000, typical: 200 },
        confidence: 0.9
      },

      // Merchandise
      {
        category: 'merchandise',
        patterns: [
          /\b(merch|merchandise|t-shirt|shirt|vinyl|cd|poster|sticker|print|production)\b/i,
          /\b(merch table|merch sales|product|inventory)\b/i
        ],
        amountHeuristics: { min: 100, max: 10000, typical: 1000 },
        confidence: 0.85
      },

      // Catering
      {
        category: 'catering',
        patterns: [
          /\b(catering|food|beverage|rider|hospitality|drinks|alcohol|wine|beer|water)\b/i,
          /\b(dressing room|green room|artist catering|production catering)\b/i
        ],
        amountHeuristics: { min: 20, max: 1000, typical: 150 },
        confidence: 0.9
      },

      // Insurance
      {
        category: 'insurance',
        patterns: [
          /\b(insurance|liability|coverage|policy|premium|claim)\b/i,
          /\b(public liability|equipment insurance|travel insurance)\b/i
        ],
        amountHeuristics: { min: 50, max: 2000, typical: 300 },
        confidence: 1.0
      },

      // Visas & Permits
      {
        category: 'visas-permits',
        patterns: [
          /\b(visa|permit|work permit|carnets|customs|immigration|embassy|consulate)\b/i,
          /\b(work visa|tourist visa|schengen|esta|carnet de passage)\b/i
        ],
        amountHeuristics: { min: 20, max: 1000, typical: 150 },
        confidence: 1.0
      },

      // Equipment Rental
      {
        category: 'equipment-rental',
        patterns: [
          /\b(rental|hire|lease|equipment|gear|instrument|piano|drum|guitar|keyboard)\b/i,
          /\b(backline|instrument rental|equipment hire)\b/i
        ],
        amountHeuristics: { min: 50, max: 3000, typical: 400 },
        confidence: 0.9
      },

      // Transportation - Freight
      {
        category: 'transportation-freight',
        patterns: [
          /\b(freight|cargo|shipping|transport|delivery|courier|dhl|fedex|ups)\b/i,
          /\b(equipment transport|gear transport|freight forwarding)\b/i
        ],
        vendorPatterns: [
          /\b(dhl|fedex|ups|tnt|dpd)\b/i
        ],
        amountHeuristics: { min: 30, max: 2000, typical: 300 },
        confidence: 0.9
      },

      // Venue Expenses
      {
        category: 'venue-expenses',
        patterns: [
          /\b(venue|hall|club|festival|theater|arena|stadium|deposit|damage)\b/i,
          /\b(venue fee|room hire|space rental)\b/i
        ],
        amountHeuristics: { min: 100, max: 20000, typical: 2000 },
        confidence: 0.8
      },

      // Admin Fees
      {
        category: 'admin-fees',
        patterns: [
          /\b(admin|administration|processing|transaction|bank|wire|transfer|commission)\b/i,
          /\b(booking fee|service charge|handling fee|processing fee)\b/i
        ],
        amountHeuristics: { min: 5, max: 500, typical: 50 },
        confidence: 0.7
      }
    ];
  }

  /**
   * Calculate amount score based on heuristics
   */
  private calculateAmountScore(amount: number, heuristics: CategoryPattern['amountHeuristics']): number {
    if (!heuristics) return 0;

    const { min = 0, max = Infinity, typical } = heuristics;

    // Amount is outside reasonable range
    if (amount < min || amount > max) {
      return 0;
    }

    // If we have a typical amount, score based on proximity
    if (typical) {
      const distance = Math.abs(amount - typical);
      const range = Math.max(typical - min, max - typical);
      return Math.max(0, 1 - (distance / range));
    }

    // Otherwise, score based on being within range
    return 0.5;
  }

  /**
   * Get confidence boost from user corrections
   */
  private getUserCorrectionBoost(
    category: ExpenseCategory,
    description: string,
    vendor: string,
    amount: number
  ): number {
    let boost = 0;
    const recentCorrections = this.userCorrections.filter(
      c => Date.now() - c.timestamp.getTime() < 30 * 24 * 60 * 60 * 1000 // Last 30 days
    );

    for (const correction of recentCorrections) {
      // Exact description match
      if (correction.description === description && correction.userChoice === category) {
        boost += 0.3;
        continue;
      }

      // Vendor match
      if (correction.vendor === vendor && correction.userChoice === category) {
        boost += 0.2;
        continue;
      }

      // Similar description (basic fuzzy matching)
      if (this.calculateStringSimilarity(correction.description, description) > 0.7 
          && correction.userChoice === category) {
        boost += 0.15;
        continue;
      }

      // Amount range match (within 20%)
      if (correction.amount > 0 && amount > 0) {
        const amountSimilarity = 1 - Math.abs(correction.amount - amount) / Math.max(correction.amount, amount);
        if (amountSimilarity > 0.8 && correction.userChoice === category) {
          boost += 0.1;
        }
      }
    }

    return Math.min(0.4, boost); // Cap the boost
  }

  /**
   * Simple string similarity calculation
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    const words1 = str1.split(/\s+/);
    const words2 = str2.split(/\s+/);
    const allWords = new Set([...words1, ...words2]);
    
    let matches = 0;
    for (const word of allWords) {
      if (words1.includes(word) && words2.includes(word)) {
        matches++;
      }
    }

    return matches / allWords.size;
  }

  /**
   * Convert amount to EUR for consistent heuristics
   */
  private convertToEUR(amount: number, currency: string): number {
    // Simplified conversion - in real implementation, use CurrencyService
    const rates: Record<string, number> = {
      'EUR': 1.0,
      'USD': 0.93,
      'GBP': 1.16,
      'JPY': 0.0064,
      'CAD': 0.68,
      'AUD': 0.61,
      'CHF': 1.04,
      'SEK': 0.089,
      'NOK': 0.085,
      'DKK': 0.134,
      'PLN': 0.234,
      'CZK': 0.041,
      'HUF': 0.0026
    };

    return amount * (rates[currency] || 1.0);
  }

  /**
   * Get human-readable category description
   */
  private getCategoryDescription(category: ExpenseCategory): string {
    const descriptions: Record<ExpenseCategory, string> = {
      'travel-flights': 'flight tickets and airline fees',
      'travel-ground': 'ground transportation and car rental',
      'accommodation': 'hotels and lodging',
      'production-sound': 'sound equipment and audio services',
      'production-lights': 'lighting equipment and services',
      'production-stage': 'stage setup and rigging',
      'crew-fees': 'crew salaries and technician fees',
      'crew-per-diem': 'crew meals and per diem',
      'marketing-promotion': 'traditional marketing and PR',
      'marketing-digital': 'digital advertising and social media',
      'merchandise': 'merchandise production and sales',
      'catering': 'artist and production catering',
      'insurance': 'insurance premiums and coverage',
      'visas-permits': 'visas, permits, and documentation',
      'equipment-rental': 'instrument and equipment rental',
      'transportation-freight': 'equipment shipping and freight',
      'venue-expenses': 'venue fees and related costs',
      'admin-fees': 'administrative and processing fees',
      'other': 'uncategorized expenses'
    };

    return descriptions[category] || 'unknown category';
  }

  /**
   * Load user corrections from storage
   */
  private loadUserCorrections(): void {
    try {
      const stored = localStorage.getItem(this.CORRECTIONS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.userCorrections = parsed.map((c: any) => ({
          ...c,
          timestamp: new Date(c.timestamp)
        }));
      }
    } catch (error) {
      console.warn('Failed to load user corrections:', error);
    }
  }

  /**
   * Save user corrections to storage
   */
  private saveUserCorrections(): void {
    try {
      localStorage.setItem(this.CORRECTIONS_KEY, JSON.stringify(this.userCorrections));
    } catch (error) {
      console.warn('Failed to save user corrections:', error);
    }
  }

  /**
   * Get categorization stats
   */
  public getStats() {
    const categoryCount: Record<string, number> = {};
    const totalCorrections = this.userCorrections.length;

    for (const correction of this.userCorrections) {
      categoryCount[correction.userChoice] = (categoryCount[correction.userChoice] || 0) + 1;
    }

    return {
      totalCorrections,
      categoriesUsed: Object.keys(categoryCount).length,
      mostCorrectedCategory: Object.entries(categoryCount)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'none',
      patternsLoaded: this.patterns.length,
      confidenceThreshold: this.MIN_CONFIDENCE_THRESHOLD
    };
  }

  /**
   * Clear all learned patterns (for testing/reset)
   */
  public clearLearning(): void {
    this.userCorrections = [];
    localStorage.removeItem(this.CORRECTIONS_KEY);
  }
}

// Singleton instance
export const categorizationEngine = new ExpenseCategorizationEngine();
