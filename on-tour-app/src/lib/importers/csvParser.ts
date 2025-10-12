/**
 * CSV/Excel Parser with Zod Validation
 * Handles show/expense imports with robust error handling
 * Supports: .csv, .xlsx, .xls
 *
 * @module csvParser
 * @author On Tour Dev Team
 */

import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { z } from 'zod';
import type { Show } from '../shows';

// ============================================================================
// ZOD SCHEMAS
// ============================================================================

/**
 * Currency codes supported by the system
 */
const CurrencySchema = z.enum(['EUR', 'USD', 'GBP', 'AUD']);

/**
 * Show status values
 */
const ShowStatusSchema = z.enum([
    'confirmed',
    'pending',
    'offer',
    'canceled',
    'archived',
    'postponed',
]);

/**
 * ISO country code (2-letter alpha code)
 */
const CountryCodeSchema = z.string().length(2).toUpperCase();

/**
 * ISO date string (YYYY-MM-DD format)
 */
const ISODateSchema = z.string().refine(
    (val) => {
        const isoRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!isoRegex.test(val)) return false;
        const date = new Date(val);
        return date instanceof Date && !isNaN(date.getTime());
    },
    { message: 'Date must be in ISO format (YYYY-MM-DD) and valid' }
);

/**
 * Show row schema from CSV
 * Mirrors Show type but makes optional fields nullable for CSV import
 */
export const ShowRowSchema = z.object({
    // Required fields
    id: z.string().min(1, 'ID is required'),
    city: z.string().min(1, 'City is required'),
    country: CountryCodeSchema,
    date: ISODateSchema,
    fee: z.coerce.number().nonnegative('Fee must be non-negative'),
    status: ShowStatusSchema,

    // Optional fields with defaults
    feeCurrency: CurrencySchema.optional().default('EUR'),
    lat: z.coerce.number().min(-90).max(90).optional(),
    lng: z.coerce.number().min(-180).max(180).optional(),
    paid: z
        .union([z.boolean(), z.string()])
        .transform((val) => {
            if (typeof val === 'boolean') return val;
            const lower = val.toLowerCase();
            return lower === 'true' || lower === '1' || lower === 'yes' || lower === 'paid';
        })
        .optional()
        .default(false),

    // Extended metadata
    name: z.string().optional(),
    venue: z.string().optional(),
    promoter: z.string().optional(),
    whtPct: z.coerce.number().min(0).max(100).optional(),
    mgmtAgency: z.string().optional(),
    bookingAgency: z.string().optional(),
    notes: z.string().optional(),
    cost: z.coerce.number().nonnegative().optional(),
    tenantId: z.string().optional(),
    fxRateToBase: z.coerce.number().positive().optional(),
});

export type ShowRow = z.infer<typeof ShowRowSchema>;

// ============================================================================
// PARSE RESULT TYPES
// ============================================================================

export type ParseError = {
    row: number;
    field?: string;
    value?: unknown;
    message: string;
    type: 'validation' | 'format' | 'missing';
};

export type ParseResult<T> = {
    success: boolean;
    data: T[];
    errors: ParseError[];
    warnings: string[];
    stats: {
        total: number;
        valid: number;
        invalid: number;
        skipped: number;
    };
};

// ============================================================================
// NORMALIZATION HELPERS
// ============================================================================

/**
 * Normalize CSV header to match schema keys
 * Handles common variations (e.g., "Fee Currency" -> "feeCurrency")
 */
function normalizeHeader(header: string): string {
    return header
        .trim()
        .toLowerCase()
        .replace(/[\s_-]+(.)/g, (_, char) => char.toUpperCase())
        .replace(/^(.)/, (char) => char.toLowerCase());
}

/**
 * Normalize date string to ISO format (YYYY-MM-DD)
 * Handles common formats: DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD
 */
function normalizeDate(dateStr: string): string {
    const trimmed = dateStr.trim();

    // Already ISO format
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        return trimmed;
    }

    // DD/MM/YYYY or DD-MM-YYYY
    const ddmmyyyy = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/;
    const match1 = trimmed.match(ddmmyyyy);
    if (match1) {
        const [, day, month, year] = match1;
        if (day && month && year) {
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
    }

    // Try parsing as JS Date and convert to ISO
    const date = new Date(trimmed);
    if (!isNaN(date.getTime())) {
        const isoDate = date.toISOString().split('T')[0];
        if (isoDate) return isoDate;
    }

    // Return as-is and let Zod validation catch it
    return trimmed;
}

/**
 * Normalize country code (2-letter ISO)
 * Handles common variations and full country names
 */
function normalizeCountryCode(country: string): string {
    const trimmed = country.trim().toUpperCase();

    // Already 2-letter code
    if (trimmed.length === 2) {
        return trimmed;
    }

    // Common country name mappings
    const countryMap: Record<string, string> = {
        'UNITED STATES': 'US',
        'USA': 'US',
        'AMERICA': 'US',
        'UNITED KINGDOM': 'GB',
        'UK': 'GB',
        'ENGLAND': 'GB',
        'GERMANY': 'DE',
        'FRANCE': 'FR',
        'SPAIN': 'ES',
        'ITALY': 'IT',
        'NETHERLANDS': 'NL',
        'BELGIUM': 'BE',
        'SWITZERLAND': 'CH',
        'AUSTRIA': 'AT',
        'PORTUGAL': 'PT',
        'GREECE': 'GR',
        'POLAND': 'PL',
        'CZECHIA': 'CZ',
        'CZECH REPUBLIC': 'CZ',
        'AUSTRALIA': 'AU',
        'CANADA': 'CA',
        'JAPAN': 'JP',
        'CHINA': 'CN',
        'BRAZIL': 'BR',
        'ARGENTINA': 'AR',
        'CHILE': 'CL',
        'MEXICO': 'MX',
        'COLOMBIA': 'CO',
    };

    return countryMap[trimmed] || trimmed.substring(0, 2);
}

// ============================================================================
// INTELLIGENT COLUMN MAPPING
// ============================================================================

/**
 * Smart column mapping - detects column purpose from various naming conventions
 * Handles: different languages, spaces, underscores, abbreviations, etc.
 */
const COLUMN_MAPPINGS: Record<string, string[]> = {
    // ID / Reference
    id: [
        'id', 'show id', 'showid', 'event id', 'eventid', 'gig id',
        'reference', 'ref', 'código', 'codigo', 'identificador', 'identifier',
        'show code', 'event code', 'núm', 'num', 'number', 'no',
    ],

    // Date fields
    date: [
        'date', 'fecha', 'datum', 'data', 'día', 'dia',
        'show date', 'event date', 'gig date', 'performance date',
        'when', 'day', 'jour', 'giorno', 'tag',
        'date of show', 'date of event', 'date of performance',
    ],

    // Location: City
    city: [
        'city', 'ciudad', 'ville', 'stadt', 'città', 'cidade', 'mesto',
        'location', 'lugar', 'ubicación', 'ubicacion', 'ort', 'luogo',
        'where', 'place', 'locality', 'town', 'municipality',
    ],

    // Location: Country
    country: [
        'country', 'país', 'pais', 'pays', 'land', 'paese', 'nação', 'zemlja',
        'nation', 'iso', 'country code', 'iso code', 'code pays',
        'país/country', 'pais country',
    ],

    // Venue
    venue: [
        'venue', 'lugar', 'location', 'club', 'festival', 'sala', 'recinto',
        'salle', 'local', 'teatro', 'theater', 'theatre', 'hall', 'arena',
        'site', 'facility', 'emplacement', 'veranstaltungsort',
    ],

    // Money: Fee / Guarantee
    fee: [
        'fee', 'artist fee', 'guarantee', 'payment', 'amount', 'total',
        'cache', 'caché', 'honorario', 'pago', 'importe', 'prix', 'prezzo',
        'artist guarantee', 'show fee', 'performance fee', 'gig fee',
        'compensation', 'remuneration', 'pay', 'salary', 'wage',
        'garantía', 'garantia', 'montant', 'betrag', 'importo',
    ],

    // Currency
    feeCurrency: [
        'currency', 'fee currency', 'moneda', 'divisa', 'devise',
        'währung', 'valuta', 'moeda', 'curr', 'money type',
        'payment currency', 'coin', 'monetary unit',
    ],

    // Status
    status: [
        'status', 'estado', 'état', 'zustand', 'stato', 'state',
        'confirmed', 'confirmation', 'show status', 'event status',
        'booking status', 'confirmación', 'confirmacion',
    ],

    // Payment Status
    paid: [
        'paid', 'pagado', 'payé', 'bezahlt', 'pagato', 'pago',
        'payment status', 'payment received', 'settlement',
        'received', 'collected', 'liquidado', 'settled',
    ],

    // Show Name / Title
    name: [
        'name', 'nombre', 'nom', 'nome', 'názov', 'ime',
        'show name', 'event name', 'gig name', 'performance name',
        'title', 'título', 'titulo', 'titre', 'titel',
        'description', 'event', 'show', 'performance',
    ],

    // Promoter / Organizer
    promoter: [
        'promoter', 'promotor', 'promoteur', 'veranstalter', 'promotore',
        'organizador', 'organizer', 'producer', 'productor',
        'organiser', 'organizzatore', 'production company',
    ],

    // Tax Withholding
    whtPct: [
        'wht', 'withholding', 'tax', 'retention', 'retención', 'retencion',
        'impuesto', 'taxe', 'steuer', 'tassa', 'imposto',
        'withholding tax', 'tax rate', 'retention rate',
    ],

    // Management Agency
    mgmtAgency: [
        'management', 'mgmt', 'agency', 'agencia', 'manager',
        'agence', 'agentur', 'agenzia', 'management company',
        'artist management', 'management agency',
    ],

    // Booking Agency
    bookingAgency: [
        'booking', 'booking agency', 'reservas', 'réservations',
        'reservations', 'booking agent', 'agent', 'agente',
        'booking company',
    ],

    // Notes / Comments
    notes: [
        'notes', 'notas', 'comments', 'comentarios', 'remarks',
        'observaciones', 'info', 'information', 'details', 'description',
        'note', 'comment', 'remark', 'observation', 'memo',
        'additional info', 'more info', 'other',
    ],

    // Costs / Expenses
    cost: [
        'cost', 'costs', 'expense', 'expenses', 'gastos',
        'coûts', 'kosten', 'costi', 'custos', 'spending',
        'expenditure', 'outlay', 'disbursement', 'gasto',
    ],

    // Coordinates
    lat: [
        'lat', 'latitude', 'latitud', 'latitudine', 'breite',
        'geo lat', 'location lat', 'coord lat',
    ],
    lng: [
        'lng', 'lon', 'long', 'longitude', 'longitud', 'longitudine', 'länge',
        'geo lng', 'geo lon', 'location lng', 'coord lng', 'coord lon',
    ],
};

/**
 * Intelligent content-based type detection
 * Analyzes actual cell values to infer field type
 */
function inferFieldTypeFromContent(values: string[]): string | null {
    // Filter out empty/null values
    const validValues = values.filter(v => v && v.trim() !== '').slice(0, 20); // Sample first 20

    if (validValues.length === 0) return null;

    // Calculate how many values match each pattern (for fuzzy matching)
    const matchRate = (pattern: RegExp) =>
        validValues.filter(v => pattern.test(v)).length / validValues.length;

    // Date detection: Multiple formats
    const datePatterns = [
        /^\d{4}-\d{2}-\d{2}$/,                          // ISO: 2024-01-15
        /^\d{4}\/\d{2}\/\d{2}$/,                        // 2024/01/15
        /^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}$/,     // 01/15/2024, 15-01-2024, 1.5.24
        /^\d{8}$/,                                       // 20240115
        /^\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}$/i, // 15 Jan 2024
        /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*,?\s+\d{1,2}/i, // Mon, 15
    ];
    if (datePatterns.some(p => matchRate(p) > 0.7)) {
        return 'date';
    }

    // Currency/Fee detection: Money patterns
    const moneyPattern = /^[\$€£¥₹]?\s*\d{1,3}([,.\s]\d{3})*([.,]\d{2})?[\$€£¥₹]?$/;
    const hasMoneySymbols = validValues.some(v => /[\$€£¥₹]/.test(v));
    const largeNumbers = validValues.filter(v => {
        const num = parseFloat(v.replace(/[,\s€$£¥₹]/g, ''));
        return !isNaN(num) && num >= 500; // Fees are usually >= 500
    });

    if (hasMoneySymbols || (largeNumbers.length > validValues.length * 0.5 && matchRate(moneyPattern) > 0.5)) {
        return 'fee';
    }

    // Country detection: 2-letter or 3-letter codes, or full names
    const countryCodePattern = /^[A-Z]{2,3}$/;
    const knownCountries = ['spain', 'france', 'germany', 'italy', 'uk', 'usa', 'portugal', 'netherlands', 'belgium'];
    if (matchRate(countryCodePattern) > 0.7 ||
        validValues.filter(v => knownCountries.includes(v.toLowerCase())).length > validValues.length * 0.5) {
        return 'country';
    }

    // Currency code detection: 3-letter uppercase
    const currencyPattern = /^[A-Z]{3}$/;
    const knownCurrencies = ['EUR', 'USD', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF'];
    if (matchRate(currencyPattern) > 0.8 ||
        validValues.filter(v => knownCurrencies.includes(v.toUpperCase())).length > validValues.length * 0.5) {
        return 'feeCurrency';
    }

    // Status detection: Known status values
    const statusValues = ['confirmed', 'pending', 'offer', 'canceled', 'cancelled', 'archived', 'postponed', 'tentative'];
    if (validValues.filter(v => statusValues.includes(v.toLowerCase())).length > validValues.length * 0.7) {
        return 'status';
    }

    // Boolean/Paid detection: yes/no, true/false, paid/unpaid
    const booleanValues = [
        'yes', 'no', 'true', 'false', 'si', 'sí', 'oui', 'non', 'ja', 'nein',
        'paid', 'unpaid', 'pending', 'received', 'outstanding', 'settled',
        '1', '0', 'x', '-', '✓', '✗'
    ];
    if (validValues.filter(v => booleanValues.includes(v.toLowerCase())).length > validValues.length * 0.8) {
        return 'paid';
    }

    // Coordinates detection
    if (matchRate(/^-?\d+\.\d{4,}$/) > 0.8) {
        const nums = validValues.map(v => parseFloat(v)).filter(n => !isNaN(n));
        if (nums.every(n => n >= -90 && n <= 90)) return 'lat';
        if (nums.every(n => n >= -180 && n <= 180)) return 'lng';
    }

    // City detection: Capitalized words
    const cityPattern = /^[A-ZÀ-ÿ][a-zà-ÿ]+(\s[A-ZÀ-ÿ][a-zà-ÿ]+)*$/;
    if (matchRate(cityPattern) > 0.6) {
        return 'city';
    }

    // Venue detection: Often contains common venue words
    const venueKeywords = ['arena', 'stadium', 'hall', 'theater', 'theatre', 'club', 'centre', 'center', 'auditorium', 'palace'];
    if (validValues.filter(v => venueKeywords.some(k => v.toLowerCase().includes(k))).length > validValues.length * 0.3) {
        return 'venue';
    }

    // ID detection: Alphanumeric with dashes/underscores
    const idPattern = /^[A-Za-z0-9_-]+$/;
    const hasIdFormat = matchRate(idPattern) > 0.9;
    const avgLength = validValues.reduce((sum, v) => sum + v.length, 0) / validValues.length;
    if (hasIdFormat && avgLength >= 5 && avgLength <= 30) {
        return 'id';
    }

    return null;
}

/**
 * Detect which standard field a column header maps to
 * Returns null if no match found
 */
function detectColumnMapping(header: string, sampleValues?: string[]): string | null {
    const normalized = header
        .toLowerCase()
        .trim()
        .replace(/[_\-\.]/g, ' ') // Replace separators with space
        .replace(/\s+/g, ' '); // Normalize spaces

    // Try exact match first
    for (const [standardField, variations] of Object.entries(COLUMN_MAPPINGS)) {
        if (variations.some(v => normalized === v)) {
            return standardField;
        }
    }

    // Try partial match (header contains variation or vice versa)
    for (const [standardField, variations] of Object.entries(COLUMN_MAPPINGS)) {
        for (const variation of variations) {
            if (normalized.includes(variation) || variation.includes(normalized)) {
                return standardField;
            }
        }
    }

    // Try fuzzy matching: Check if any word in header matches a variation
    const headerWords = normalized.split(' ');
    for (const [standardField, variations] of Object.entries(COLUMN_MAPPINGS)) {
        for (const variation of variations) {
            const variationWords = variation.split(' ');
            // If any significant word matches (length > 3)
            const hasMatch = headerWords.some(hw =>
                variationWords.some(vw =>
                    hw.length > 3 && vw.length > 3 && (hw === vw || hw.includes(vw) || vw.includes(hw))
                )
            );
            if (hasMatch) {
                return standardField;
            }
        }
    }

    // If header-based detection failed, try content-based inference
    if (sampleValues && sampleValues.length > 0) {
        return inferFieldTypeFromContent(sampleValues);
    }

    return null;
}

/**
 * Map raw headers from file to standard field names
 * Uses both header names and content analysis
 */
function mapHeaders(rawHeaders: string[], sampleRows?: Record<string, string>[]): Map<string, string> {
    const mapping = new Map<string, string>();

    for (const rawHeader of rawHeaders) {
        // Extract sample values for this column
        const sampleValues = sampleRows
            ? sampleRows.map(row => row[rawHeader]).filter(v => v != null)
            : undefined;

        const standardField = detectColumnMapping(rawHeader, sampleValues);
        if (standardField) {
            mapping.set(rawHeader, standardField);
        }
    }

    return mapping;
}

/**
 * Transform a row object with raw headers to standard field names
 */
function transformRow(
    row: Record<string, string>,
    headerMapping: Map<string, string>
): Record<string, string> {
    const transformed: Record<string, string> = {};

    for (const [rawHeader, value] of Object.entries(row)) {
        const standardField = headerMapping.get(rawHeader);
        if (standardField) {
            transformed[standardField] = value;
        }
    }

    return transformed;
}

// ============================================================================
// EXCEL TO CSV CONVERSION
// ============================================================================

/**
 * Convert Excel file (ArrayBuffer) to CSV string
 * Supports .xlsx and .xls formats
 */
export function excelToCSV(arrayBuffer: ArrayBuffer): string {
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    // Use first sheet
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
        throw new Error('Excel file has no sheets');
    }

    const worksheet = workbook.Sheets[firstSheetName];

    // Convert to CSV with options
    // defval: '' ensures empty cells become empty strings (not undefined)
    // blankrows: false skips completely blank rows
    const csv = XLSX.utils.sheet_to_csv(worksheet, {
        FS: ',',        // Field separator
        RS: '\n',       // Row separator
        blankrows: false, // Skip blank rows
        // @ts-ignore - defval exists but not in types
        defval: ''      // Default value for empty cells
    });

    // Debug: log first few lines
    if (process.env.NODE_ENV === 'development') {
        const lines = csv.split('\n').slice(0, 3);
        console.log('Excel CSV preview:', lines);
    }

    return csv;
}

/**
 * Detect file type and parse accordingly
 * Supports: .csv (text), .xlsx/.xls (binary)
 */
export function parseShowsFile(
    fileContent: string | ArrayBuffer,
    fileType: 'csv' | 'xlsx',
    options?: {
        skipEmptyLines?: boolean;
        normalizeHeaders?: boolean;
        normalizeDates?: boolean;
        normalizeCountries?: boolean;
    }
): ParseResult<ShowRow> {
    let csvContent: string;

    if (fileType === 'xlsx') {
        if (typeof fileContent === 'string') {
            throw new Error('Excel files must be read as ArrayBuffer');
        }
        csvContent = excelToCSV(fileContent);

        // Debug Excel conversion
        if (process.env.NODE_ENV === 'development') {
            console.log('Excel converted to CSV, length:', csvContent.length);
            console.log('First 200 chars:', csvContent.substring(0, 200));
        }
    } else {
        if (typeof fileContent !== 'string') {
            throw new Error('CSV files must be read as text');
        }
        csvContent = fileContent;
    }

    // Ensure default options for Excel files (they need normalization)
    const parseOptions = {
        skipEmptyLines: true,
        normalizeHeaders: true,
        normalizeDates: true,
        normalizeCountries: true,
        ...options,
    };

    return parseShowsCSV(csvContent, parseOptions);
}

// ============================================================================
// MAIN PARSER
// ============================================================================

/**
 * Parse CSV string and validate as Show records
 *
 * @param csvContent - Raw CSV string
 * @param options - Parser options
 * @returns ParseResult with validated shows and errors
 *
 * @example
 * ```typescript
 * const csv = `
 * id,city,country,date,fee,feeCurrency,status
 * show-001,London,GB,2025-07-15,10000,GBP,confirmed
 * show-002,Berlin,DE,2025-08-20,12000,EUR,pending
 * `;
 *
 * const result = parseShowsCSV(csv);
 * if (result.success) {
 *   console.log(`Imported ${result.data.length} shows`);
 * } else {
 *   console.error(`${result.errors.length} errors found`);
 * }
 * ```
 */
export function parseShowsCSV(
    csvContent: string,
    options: {
        skipEmptyLines?: boolean;
        normalizeHeaders?: boolean;
        normalizeDates?: boolean;
        normalizeCountries?: boolean;
    } = {}
): ParseResult<ShowRow> {
    const {
        skipEmptyLines = true,
        normalizeHeaders = true,
        normalizeDates = true,
        normalizeCountries = true,
    } = options;

    const errors: ParseError[] = [];
    const warnings: string[] = [];
    const validData: ShowRow[] = [];
    let totalRows = 0;
    let skippedRows = 0;

    // Parse CSV with PapaParse (no header transformation yet)
    const parseResult = Papa.parse<Record<string, string>>(csvContent, {
        header: true,
        skipEmptyLines: skipEmptyLines ? 'greedy' : false,
        transform: (value) => value?.trim() || '',
    });

    // Intelligent header mapping with content analysis
    let headerMapping: Map<string, string> | null = null;
    if (parseResult.data.length > 0) {
        const firstRow = parseResult.data[0];
        if (firstRow) {
            const rawHeaders = Object.keys(firstRow);

            // Take first 10 rows as sample for content analysis
            const sampleRows = parseResult.data.slice(0, 10);

            headerMapping = mapHeaders(rawHeaders, sampleRows);

            // Log mapping for debugging
            console.log('🔍 Intelligent Column Mapping:');
            console.log('Raw headers:', rawHeaders);
            console.log('Detected mapping:', Object.fromEntries(headerMapping));

            // Warn about unmapped columns (but don't treat as errors)
            const unmappedHeaders = rawHeaders.filter(h => !headerMapping!.has(h));
            if (unmappedHeaders.length > 0) {
                console.warn(`⚠️  Ignoring ${unmappedHeaders.length} unmapped column(s): ${unmappedHeaders.join(', ')}`);
                warnings.push(`Could not map ${unmappedHeaders.length} column(s): ${unmappedHeaders.join(', ')}`);
            }
        }
    }

    // Check for Papa parse errors
    if (parseResult.errors.length > 0) {
        parseResult.errors.forEach((err) => {
            errors.push({
                row: err.row || 0,
                message: err.message,
                type: 'format',
            });
        });
    }

    // Validate each row with Zod
    parseResult.data.forEach((rawRow, index) => {
        totalRows++;
        const rowNumber = index + 2; // +2 for header row and 0-indexing

        // Skip empty rows
        const hasData = Object.values(rawRow).some((val) => val && val.trim() !== '');
        if (!hasData) {
            skippedRows++;
            return;
        }

        // Transform row using intelligent mapping
        let row = rawRow;
        if (headerMapping && headerMapping.size > 0) {
            row = transformRow(rawRow, headerMapping);
        }

        // Apply normalization after mapping
        if (normalizeDates && row.date) {
            row.date = normalizeDate(row.date);
        }
        if (normalizeCountries && row.country) {
            row.country = normalizeCountryCode(row.country);
        }

        // Validate with Zod
        const result = ShowRowSchema.safeParse(row);

        if (result.success) {
            validData.push(result.data);
        } else {
            // Extract Zod validation errors
            result.error.issues.forEach((err) => {
                errors.push({
                    row: rowNumber,
                    field: err.path.join('.'),
                    value: row[err.path[0] as string],
                    message: err.message,
                    type: 'validation',
                });
            });
        }
    });

    // Generate warnings for missing optional fields
    if (validData.length > 0) {
        const missingLatLng = validData.filter((row) => !row.lat || !row.lng).length;
        if (missingLatLng > 0) {
            warnings.push(
                `${missingLatLng} row(s) missing lat/lng coordinates - will attempt geocoding`
            );
        }

        const missingVenue = validData.filter((row) => !row.venue).length;
        if (missingVenue > 0) {
            warnings.push(`${missingVenue} row(s) missing venue information`);
        }
    }

    return {
        success: errors.length === 0,
        data: validData,
        errors,
        warnings,
        stats: {
            total: totalRows,
            valid: validData.length,
            invalid: errors.length,
            skipped: skippedRows,
        },
    };
}

/**
 * Convert ShowRow to Show type
 * Preserves existing geocoding if lat/lng missing in import
 */
export function mergeShowWithExisting(
    imported: ShowRow,
    existing: Show | undefined
): Show {
    return {
        ...imported,
        lat: imported.lat ?? existing?.lat ?? 0,
        lng: imported.lng ?? existing?.lng ?? 0,
        feeCurrency: imported.feeCurrency || 'EUR',
        paid: imported.paid ?? false,
    } as Show;
}

/**
 * Generate example CSV template for download
 */
export function generateCSVTemplate(): string {
    const headers = [
        'id',
        'city',
        'country',
        'date',
        'fee',
        'feeCurrency',
        'status',
        'paid',
        'name',
        'venue',
        'promoter',
        'lat',
        'lng',
        'whtPct',
        'mgmtAgency',
        'bookingAgency',
        'notes',
        'cost',
    ];

    const exampleRows = [
        {
            id: 'demo-2025-07-15-fabric-london',
            city: 'London',
            country: 'GB',
            date: '2025-07-15',
            fee: '10000',
            feeCurrency: 'GBP',
            status: 'confirmed',
            paid: 'false',
            name: 'Fabric Summer Closing',
            venue: 'Fabric',
            promoter: 'XYZ Promotions',
            lat: '51.5074',
            lng: '-0.1278',
            whtPct: '0',
            mgmtAgency: 'Top Tier Management',
            bookingAgency: 'Global Booking Co.',
            notes: 'Main stage headline set',
            cost: '2500',
        },
        {
            id: 'demo-2025-08-20-berghain-berlin',
            city: 'Berlin',
            country: 'DE',
            date: '2025-08-20',
            fee: '12000',
            feeCurrency: 'EUR',
            status: 'pending',
            paid: 'false',
            name: 'Berghain Techno Night',
            venue: 'Berghain',
            promoter: 'Berlin Underground',
            lat: '52.5200',
            lng: '13.4050',
            whtPct: '0',
            mgmtAgency: '',
            bookingAgency: '',
            notes: 'B2B set with local artist',
            cost: '',
        },
    ];

    const rows = exampleRows.map((row) =>
        headers.map((header) => row[header as keyof typeof row] || '').join(',')
    );

    return [headers.join(','), ...rows].join('\n');
}
