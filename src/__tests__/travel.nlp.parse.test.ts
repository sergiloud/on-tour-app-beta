import { describe, it, expect } from 'vitest';
import { parseTravelQuery } from '../features/travel/nlp/parse';

describe('parseTravelQuery', () => {
  it('parses simple EN sentence with dates and options', () => {
    const out = parseTravelQuery('From Madrid to Paris depart 2025-10-12 return 2025-10-18 2 adults 1 bag nonstop business', 'en');
    expect(out.origin).toBe('MAD');
    expect(out.dest).toBe('CDG');
    expect(out.date).toBe('2025-10-12');
    expect(out.retDate).toBe('2025-10-18');
    expect(out.adults).toBe(2);
    expect(out.bags).toBe(1);
    expect(out.nonstop).toBe(true);
    expect(out.cabin).toBe('B');
  });

  it('parses ES sentence with natural date', () => {
    const out = parseTravelQuery('De Barcelona a Nueva York salida 12 octubre 2025 vuelta 20 octubre 2025 1 adulto 2 bultos', 'es');
    expect(out.origin).toBe('BCN');
    // Nueva York will match JFK via city matcher
    expect(out.dest).toBe('JFK');
    expect(out.date).toBe('2025-10-12');
    expect(out.retDate).toBe('2025-10-20');
    expect(out.adults).toBe(1);
    expect(out.bags).toBe(2);
  });

  it('falls back to IATA tokens if present', () => {
    const out = parseTravelQuery('MAD CDG 2025-11-01', 'en');
    expect(out.origin).toBe('MAD');
    expect(out.dest).toBe('CDG');
    expect(out.date).toBe('2025-11-01');
  });

  it('flags return before depart', () => {
    const out = parseTravelQuery('from MAD to CDG 2025-10-10 2025-10-01', 'en');
    expect(out.errors).toBeTruthy();
    expect(out.errors).toContain('return_before_depart');
  });
});
