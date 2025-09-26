import { describe, it, expect } from 'vitest';
import { buildGoogleFlightsUrl, buildGoogleFlightsMultiUrl } from '../lib/travel/deeplink';

describe('buildGoogleFlightsUrl (single or round-trip)', () => {
  it('builds a one-way link with params and fallback', () => {
    const { url, fallback } = buildGoogleFlightsUrl({
      from: 'BCN',
      to: 'JFK',
      depart: '2025-03-10',
      adults: 2,
      bags: 1,
      cabin: 'BUSINESS',
      lang: 'es'
    });

    expect(url).toContain('https://www.google.com/travel/flights?hl=es');
    expect(url).toContain('#flt=');
    expect(url).toContain('BCN.JFK.2025-03-10');
    // cabin BUSINESS => t:b, bags 1 => sc:b1, px:2
    expect(url).toContain(';t:b;');
    expect(url).toContain(';sc:b1;');
    expect(url).toContain(';px:2');

    const f = new URL(fallback);
    expect(f.origin + f.pathname).toBe('https://www.google.com/travel/flights');
    expect(f.searchParams.get('hl')).toBe('es');
    const q = decodeURIComponent(f.searchParams.get('q') || '');
    expect(q).toContain('from BCN');
    expect(q).toContain('to JFK');
    expect(q).toContain('on 2025-03-10');
    expect(q).toContain('2 adults');
    expect(q).toContain('1 bags');
    expect(q).toContain('business');
  });

  it('builds a round-trip link joining legs with *', () => {
    const { url } = buildGoogleFlightsUrl({
      from: 'BCN',
      to: 'JFK',
      depart: '2025-06-01',
      back: '2025-06-10',
      adults: 1,
      bags: 0,
      cabin: 'ECONOMY',
      lang: 'en'
    });
    expect(url).toContain('BCN.JFK.2025-06-01*JFK.BCN.2025-06-10');
    // ECONOMY => t:e, bags 0 => sc:b0, px:1
    expect(url).toContain(';t:e;');
    expect(url).toContain(';sc:b0;');
    expect(url).toContain(';px:1');
  });

  it('clamps invalid adults/bags to safe ranges', () => {
    // Lower bounds
    const { url: urlLow } = buildGoogleFlightsUrl({ from: 'BCN', to: 'JFK', depart: '2025-01-01', adults: 0 as any, bags: -3 as any });
    expect(urlLow).toContain(';px:1');
    expect(urlLow).toContain(';sc:b0;');
    // Upper bounds
    const { url: urlHigh } = buildGoogleFlightsUrl({ from: 'BCN', to: 'JFK', depart: '2025-01-01', adults: 99 as any, bags: 99 as any });
    expect(urlHigh).toContain(';px:9');
    expect(urlHigh).toContain(';sc:b5;');
  });
});

describe('buildGoogleFlightsMultiUrl (multi-segment)', () => {
  it('builds multi-leg link with correct hash pieces and fallback query', () => {
    const { url, fallback } = buildGoogleFlightsMultiUrl({
      legs: [
        { from: 'BCN', to: 'JFK', date: '2025-03-10' },
        { from: 'JFK', to: 'SFO', date: '2025-03-12' },
        { from: 'SFO', to: 'HNL', date: '2025-03-15' }
      ],
      adults: 3,
      bags: 2,
      cabin: 'FIRST',
      lang: 'en'
    });
    expect(url).toContain('https://www.google.com/travel/flights?hl=en#flt=');
    expect(url).toContain('BCN.JFK.2025-03-10*JFK.SFO.2025-03-12*SFO.HNL.2025-03-15');
    // FIRST => t:f, bags 2 => sc:b2, px:3
    expect(url).toContain(';t:f;');
    expect(url).toContain(';sc:b2;');
    expect(url).toContain(';px:3');

    const f = new URL(fallback);
    expect(f.searchParams.get('hl')).toBe('en');
    const q = decodeURIComponent(f.searchParams.get('q') || '');
    expect(q).toContain('from BCN to JFK on 2025-03-10');
    expect(q).toContain('from JFK to SFO on 2025-03-12');
    expect(q).toContain('from SFO to HNL on 2025-03-15');
    expect(q).toContain('3 adults');
    expect(q).toContain('2 bags');
    expect(q).toContain('first');
  });
});
