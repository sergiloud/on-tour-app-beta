/**
 * CSV Parser Tests
 * Unit tests for show CSV import validation
 *
 * @module importer.csv.parser.test
 */

import { describe, it, expect } from 'vitest';
import { parseShowsCSV, generateCSVTemplate, mergeShowWithExisting } from '../lib/importers/csvParser';
import type { Show } from '../lib/shows';

describe('CSV Parser - Valid Formats', () => {
    it('should parse valid CSV with all required fields', () => {
        const csv = `id,city,country,date,fee,feeCurrency,status
show-001,London,GB,2025-07-15,10000,GBP,confirmed
show-002,Berlin,DE,2025-08-20,12000,EUR,pending`;

        const result = parseShowsCSV(csv);

        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(2);
        expect(result.errors).toHaveLength(0);
        expect(result.stats.valid).toBe(2);
        expect(result.stats.invalid).toBe(0);

        const [show1, show2] = result.data;
        expect(show1.id).toBe('show-001');
        expect(show1.city).toBe('London');
        expect(show1.country).toBe('GB');
        expect(show1.fee).toBe(10000);
        expect(show1.feeCurrency).toBe('GBP');
        expect(show1.status).toBe('confirmed');

        expect(show2.id).toBe('show-002');
        expect(show2.feeCurrency).toBe('EUR');
    });

    it('should parse CSV with optional fields', () => {
        const csv = `id,city,country,date,fee,status,venue,promoter,whtPct,notes
show-003,Paris,FR,2025-09-01,15000,confirmed,Rex Club,ABC Promo,10,VIP package included`;

        const result = parseShowsCSV(csv);

        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(1);

        const show = result.data[0];
        expect(show.venue).toBe('Rex Club');
        expect(show.promoter).toBe('ABC Promo');
        expect(show.whtPct).toBe(10);
        expect(show.notes).toBe('VIP package included');
    });

    it('should handle mixed case headers', () => {
        const csv = `ID,City,COUNTRY,Date,Fee,Status
show-004,Madrid,ES,2025-10-10,8000,pending`;

        const result = parseShowsCSV(csv, { normalizeHeaders: true });

        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(1);
        expect(result.data[0].city).toBe('Madrid');
    });

    it('should parse boolean paid field correctly', () => {
        const csv = `id,city,country,date,fee,status,paid
show-005,Rome,IT,2025-11-15,9000,confirmed,true
show-006,Milan,IT,2025-11-20,9500,confirmed,false
show-007,Turin,IT,2025-11-25,8500,confirmed,1
show-008,Naples,IT,2025-11-30,8000,confirmed,yes`;

        const result = parseShowsCSV(csv);

        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(4);
        expect(result.data[0].paid).toBe(true);
        expect(result.data[1].paid).toBe(false);
        expect(result.data[2].paid).toBe(true);
        expect(result.data[3].paid).toBe(true);
    });

    it('should default feeCurrency to EUR if not specified', () => {
        const csv = `id,city,country,date,fee,status
show-009,Barcelona,ES,2025-12-01,11000,confirmed`;

        const result = parseShowsCSV(csv);

        expect(result.success).toBe(true);
        expect(result.data[0].feeCurrency).toBe('EUR');
    });

    it('should skip empty lines', () => {
        const csv = `id,city,country,date,fee,status

show-010,Lisbon,PT,2026-01-10,7000,pending

`;

        const result = parseShowsCSV(csv, { skipEmptyLines: true });

        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(1);
        expect(result.stats.skipped).toBeGreaterThanOrEqual(2);
    });
});

describe('CSV Parser - Date Normalization', () => {
    it('should normalize DD/MM/YYYY format', () => {
        const csv = `id,city,country,date,fee,status
show-011,Dublin,IE,15/07/2025,6000,confirmed`;

        const result = parseShowsCSV(csv, { normalizeDates: true });

        expect(result.success).toBe(true);
        expect(result.data[0].date).toBe('2025-07-15');
    });

    it('should normalize DD-MM-YYYY format', () => {
        const csv = `id,city,country,date,fee,status
show-012,Vienna,AT,20-08-2025,9000,confirmed`;

        const result = parseShowsCSV(csv, { normalizeDates: true });

        expect(result.success).toBe(true);
        expect(result.data[0].date).toBe('2025-08-20');
    });

    it('should accept already-normalized ISO dates', () => {
        const csv = `id,city,country,date,fee,status
show-013,Zurich,CH,2025-09-25,12000,confirmed`;

        const result = parseShowsCSV(csv, { normalizeDates: true });

        expect(result.success).toBe(true);
        expect(result.data[0].date).toBe('2025-09-25');
    });
});

describe('CSV Parser - Country Code Normalization', () => {
    it('should normalize full country names to ISO codes', () => {
        const csv = `id,city,country,date,fee,status
show-014,New York,United States,2025-07-15,15000,confirmed
show-015,Los Angeles,USA,2025-07-20,16000,confirmed
show-016,Chicago,US,2025-07-25,14000,confirmed`;

        const result = parseShowsCSV(csv, { normalizeCountries: true });

        expect(result.success).toBe(true);
        expect(result.data[0].country).toBe('US');
        expect(result.data[1].country).toBe('US');
        expect(result.data[2].country).toBe('US');
    });

    it('should normalize UK variations', () => {
        const csv = `id,city,country,date,fee,status
show-017,London,United Kingdom,2025-08-01,10000,confirmed
show-018,Manchester,UK,2025-08-05,9000,confirmed
show-019,Birmingham,England,2025-08-10,8500,confirmed`;

        const result = parseShowsCSV(csv, { normalizeCountries: true });

        expect(result.success).toBe(true);
        expect(result.data.every(s => s.country === 'GB')).toBe(true);
    });

    it('should preserve existing 2-letter codes', () => {
        const csv = `id,city,country,date,fee,status
show-020,Amsterdam,NL,2025-09-01,11000,confirmed`;

        const result = parseShowsCSV(csv, { normalizeCountries: true });

        expect(result.success).toBe(true);
        expect(result.data[0].country).toBe('NL');
    });
});

describe('CSV Parser - Validation Errors', () => {
    it('should reject missing required fields', () => {
        const csv = `id,city,country,date,fee,status
show-021,Brussels,,2025-10-01,8000,confirmed`;

        const result = parseShowsCSV(csv);

        expect(result.success).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.errors[0].type).toBe('validation');
        expect(result.errors[0].field).toContain('country');
    });

    it('should reject invalid date formats', () => {
        const csv = `id,city,country,date,fee,status
show-022,Copenhagen,DK,2025-13-45,7000,confirmed`;

        const result = parseShowsCSV(csv);

        expect(result.success).toBe(false);
        expect(result.errors.some(e => e.field === 'date')).toBe(true);
    });

    it('should reject negative fees', () => {
        const csv = `id,city,country,date,fee,status
show-023,Oslo,NO,2025-11-01,-5000,confirmed`;

        const result = parseShowsCSV(csv);

        expect(result.success).toBe(false);
        expect(result.errors.some(e => e.field === 'fee')).toBe(true);
    });

    it('should reject invalid currency codes', () => {
        const csv = `id,city,country,date,fee,feeCurrency,status
show-024,Stockholm,SE,2025-12-01,10000,SEK,confirmed`;

        const result = parseShowsCSV(csv);

        expect(result.success).toBe(false);
        expect(result.errors.some(e => e.field === 'feeCurrency')).toBe(true);
    });

    it('should reject invalid status values', () => {
        const csv = `id,city,country,date,fee,status
show-025,Helsinki,FI,2026-01-01,8000,maybe`;

        const result = parseShowsCSV(csv);

        expect(result.success).toBe(false);
        expect(result.errors.some(e => e.field === 'status')).toBe(true);
    });

    it('should reject invalid withholding tax percentage', () => {
        const csv = `id,city,country,date,fee,status,whtPct
show-026,Warsaw,PL,2026-02-01,7000,confirmed,150`;

        const result = parseShowsCSV(csv);

        expect(result.success).toBe(false);
        expect(result.errors.some(e => e.field === 'whtPct')).toBe(true);
    });

    it('should reject out-of-range latitude', () => {
        const csv = `id,city,country,date,fee,status,lat,lng
show-027,Prague,CZ,2026-03-01,9000,confirmed,95.0,14.4`;

        const result = parseShowsCSV(csv);

        expect(result.success).toBe(false);
        expect(result.errors.some(e => e.field === 'lat')).toBe(true);
    });

    it('should reject out-of-range longitude', () => {
        const csv = `id,city,country,date,fee,status,lat,lng
show-028,Budapest,HU,2026-04-01,8500,confirmed,47.5,200.0`;

        const result = parseShowsCSV(csv);

        expect(result.success).toBe(false);
        expect(result.errors.some(e => e.field === 'lng')).toBe(true);
    });
});

describe('CSV Parser - Malformed CSV', () => {
    it('should handle CSV with mismatched columns', () => {
        const csv = `id,city,country,date,fee,status
show-029,Athens,GR,2026-05-01,7500
show-030,Thessaloniki,GR,2026-05-05,7000,confirmed`;

        const result = parseShowsCSV(csv);

        // First row should fail (missing status), second should pass
        expect(result.stats.valid).toBe(1);
        expect(result.stats.invalid).toBe(1);
    });

    it('should handle CSV with extra columns', () => {
        const csv = `id,city,country,date,fee,status,extraColumn
show-031,Sofia,BG,2026-06-01,6500,confirmed,ignored`;

        const result = parseShowsCSV(csv);

        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(1);
        // Extra column should be ignored
    });

    it('should handle completely empty CSV', () => {
        const csv = ``;

        const result = parseShowsCSV(csv);

        expect(result.data).toHaveLength(0);
        expect(result.stats.total).toBe(0);
    });

    it('should handle CSV with only headers', () => {
        const csv = `id,city,country,date,fee,status`;

        const result = parseShowsCSV(csv);

        expect(result.data).toHaveLength(0);
        expect(result.stats.total).toBe(0);
    });
});

describe('CSV Parser - Warnings', () => {
    it('should warn about missing lat/lng', () => {
        const csv = `id,city,country,date,fee,status
show-032,Bucharest,RO,2026-07-01,7000,confirmed`;

        const result = parseShowsCSV(csv);

        expect(result.success).toBe(true);
        expect(result.warnings.length).toBeGreaterThan(0);
        expect(result.warnings.some(w => w.includes('lat/lng'))).toBe(true);
    });

    it('should warn about missing venue', () => {
        const csv = `id,city,country,date,fee,status
show-033,Zagreb,HR,2026-08-01,6500,confirmed`;

        const result = parseShowsCSV(csv);

        expect(result.success).toBe(true);
        expect(result.warnings.some(w => w.includes('venue'))).toBe(true);
    });
});

describe('mergeShowWithExisting', () => {
    it('should preserve existing geocoding when lat/lng missing in import', () => {
        const imported = {
            id: 'show-100',
            city: 'Belgrade',
            country: 'RS',
            date: '2026-09-01',
            fee: 7500,
            status: 'confirmed' as const,
        };

        const existing: Show = {
            id: 'show-100',
            city: 'Belgrade',
            country: 'RS',
            date: '2026-09-01',
            fee: 7000,
            status: 'pending',
            lat: 44.8176,
            lng: 20.4569,
        };

        const merged = mergeShowWithExisting(imported, existing);

        expect(merged.lat).toBe(44.8176);
        expect(merged.lng).toBe(20.4569);
        expect(merged.fee).toBe(7500); // Updated from import
        expect(merged.status).toBe('confirmed'); // Updated from import
    });

    it('should use imported lat/lng if provided', () => {
        const imported = {
            id: 'show-101',
            city: 'Ljubljana',
            country: 'SI',
            date: '2026-10-01',
            fee: 6000,
            status: 'confirmed' as const,
            lat: 46.0569,
            lng: 14.5058,
        };

        const existing: Show = {
            id: 'show-101',
            city: 'Ljubljana',
            country: 'SI',
            date: '2026-10-01',
            fee: 6000,
            status: 'confirmed',
            lat: 0,
            lng: 0,
        };

        const merged = mergeShowWithExisting(imported, existing);

        expect(merged.lat).toBe(46.0569);
        expect(merged.lng).toBe(14.5058);
    });

    it('should default to 0,0 if no geocoding available', () => {
        const imported = {
            id: 'show-102',
            city: 'Sarajevo',
            country: 'BA',
            date: '2026-11-01',
            fee: 5500,
            status: 'pending' as const,
        };

        const merged = mergeShowWithExisting(imported, undefined);

        expect(merged.lat).toBe(0);
        expect(merged.lng).toBe(0);
    });
});

describe('generateCSVTemplate', () => {
    it('should generate valid CSV template', () => {
        const template = generateCSVTemplate();

        expect(template).toContain('id,city,country,date,fee');
        expect(template).toContain('demo-2025-07-15-fabric-london');
        expect(template).toContain('London');
        expect(template).toContain('GB');

        // Should be parseable
        const result = parseShowsCSV(template);
        expect(result.success).toBe(true);
        expect(result.data.length).toBeGreaterThan(0);
    });
});
