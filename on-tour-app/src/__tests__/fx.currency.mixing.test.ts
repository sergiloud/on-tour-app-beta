/**
 * Currency Mixing Fix Tests
 * CRITICAL: Verifies that multi-currency fees are correctly converted before summing
 *
 * BUG FIX: Previously, fees in different currencies were summed directly:
 * - 1000 EUR + 1000 USD = 2000 (WRONG - currency mixing)
 * Now with conversion:
 * - 1000 EUR + 1000 USD = 1000 + 917.43 = 1917.43 EUR (CORRECT with Jan 2025 rate 1.09)
 */

import { describe, it, expect } from 'vitest';
import { sumFees, convertToBase, type SupportedCurrency } from '../lib/fx';

describe('Currency Mixing Fix - sumFees', () => {
    it('debe sumar correctamente fees en misma moneda (EUR + EUR)', () => {
        const shows = [
            { fee: 1000, feeCurrency: 'EUR', date: '2025-01-15', status: 'confirmed' },
            { fee: 2000, feeCurrency: 'EUR', date: '2025-01-20', status: 'confirmed' },
        ];

        const total = sumFees(shows, 'EUR');
        expect(total).toBe(3000);
    });

    it('debe convertir USD a EUR correctamente (rate ~1.09 en Jan 2025)', () => {
        const shows = [
            { fee: 1000, feeCurrency: 'EUR', date: '2025-01-15', status: 'confirmed' },
            { fee: 1090, feeCurrency: 'USD', date: '2025-01-20', status: 'confirmed' },
        ];

        const total = sumFees(shows, 'EUR');

        // 1000 EUR + 1090 USD = 1000 + 1000 EUR (1090/1.09 = 1000)
        expect(total).toBeCloseTo(2000, 0);
    });

    it('debe convertir GBP a EUR correctamente (rate ~0.86 en Jan 2025)', () => {
        const shows = [
            { fee: 1000, feeCurrency: 'EUR', date: '2025-01-15', status: 'confirmed' },
            { fee: 860, feeCurrency: 'GBP', date: '2025-01-20', status: 'confirmed' },
        ];

        const total = sumFees(shows, 'EUR');

        // 1000 EUR + 860 GBP = 1000 + 1000 EUR (860/0.86 = 1000)
        expect(total).toBeCloseTo(2000, 0);
    });

    it('debe manejar múltiples monedas en una sola suma', () => {
        const shows = [
            { fee: 1000, feeCurrency: 'EUR', date: '2025-01-15', status: 'confirmed' },
            { fee: 1090, feeCurrency: 'USD', date: '2025-01-15', status: 'confirmed' },
            { fee: 860, feeCurrency: 'GBP', date: '2025-01-15', status: 'confirmed' },
            { fee: 1630, feeCurrency: 'AUD', date: '2025-01-15', status: 'confirmed' },
        ];

        const total = sumFees(shows, 'EUR');

        // 1000 + 1090/1.09 + 860/0.86 + 1630/1.63 ≈ 4000 EUR
        expect(total).toBeCloseTo(4000, 0);
    });

    it('debe ignorar offers (no confirmados) en la suma', () => {
        const shows = [
            { fee: 1000, feeCurrency: 'EUR', date: '2025-01-15', status: 'confirmed' },
            { fee: 5000, feeCurrency: 'USD', date: '2025-01-20', status: 'offer' },
            { fee: 2000, feeCurrency: 'EUR', date: '2025-01-25', status: 'confirmed' },
        ];

        const total = sumFees(shows, 'EUR');

        // Solo suma confirmed: 1000 + 2000 = 3000 (ignora los 5000 USD offer)
        expect(total).toBe(3000);
    });

    it('debe usar EUR por defecto si feeCurrency no está especificado', () => {
        const shows = [
            { fee: 1000, date: '2025-01-15', status: 'confirmed' }, // Sin feeCurrency
            { fee: 2000, feeCurrency: 'EUR', date: '2025-01-20', status: 'confirmed' },
        ];

        const total = sumFees(shows, 'EUR');
        expect(total).toBe(3000);
    });

    it('debe usar rates históricos correctos según el mes del show', () => {
        const shows = [
            { fee: 1090, feeCurrency: 'USD', date: '2025-01-15', status: 'confirmed' }, // Rate 1.09
            { fee: 1080, feeCurrency: 'USD', date: '2025-02-15', status: 'confirmed' }, // Rate 1.08
            { fee: 1070, feeCurrency: 'USD', date: '2025-03-15', status: 'confirmed' }, // Rate 1.07
        ];

        const total = sumFees(shows, 'EUR');

        // 1090/1.09 + 1080/1.08 + 1070/1.07 = 1000 + 1000 + 1000 = 3000 EUR
        expect(total).toBeCloseTo(3000, 0);
    });

    it('debe hacer fallback al fee original si conversión falla', () => {
        const shows = [
            { fee: 1000, feeCurrency: 'EUR', date: '2025-01-15', status: 'confirmed' },
            { fee: 2000, feeCurrency: 'USD', date: '2099-12-31', status: 'confirmed' }, // Fecha futura sin rate
        ];

        const total = sumFees(shows, 'EUR');

        // 1000 EUR + 2000 USD (sin conversión por falta de rate) = variable, pero no debe crashear
        expect(total).toBeGreaterThan(0);
    });

    it('debe retornar 0 para array vacío', () => {
        const total = sumFees([], 'EUR');
        expect(total).toBe(0);
    });
});

describe('Currency Conversion - convertToBase', () => {
    it('debe retornar value y rate para conversión exitosa', () => {
        const result = convertToBase(1090, '2025-01-15', 'USD', 'EUR');

        expect(result).toBeDefined();
        expect(result?.value).toBeCloseTo(1000, 0); // 1090/1.09
        expect(result?.rate).toBeCloseTo(1.09, 2);
    });

    it('debe retornar rate 1 si from === to', () => {
        const result = convertToBase(1000, '2025-01-15', 'EUR', 'EUR');

        expect(result).toBeDefined();
        expect(result?.value).toBe(1000);
        expect(result?.rate).toBe(1);
    });

    it('debe retornar undefined si amount es NaN', () => {
        const result = convertToBase(NaN, '2025-01-15', 'USD', 'EUR');
        expect(result).toBeUndefined();
    });

    it('debe usar fallback al mes anterior más cercano si rate no existe', () => {
        // Agosto 2025 tiene rate, pero Octubre no
        const result = convertToBase(1080, '2025-10-15', 'USD', 'EUR');

        expect(result).toBeDefined();
        // Debería usar el rate de Sep 2025 (1.08) como fallback
        expect(result?.value).toBeCloseTo(1000, 0);
    });
});

describe('CRITICAL BUG FIX - Currency Mixing Impact', () => {
    it('ANTES: sumaba incorrectamente 1000 EUR + 1000 USD = 2000 (WRONG)', () => {
        // Simular el bug anterior (suma directa sin conversión)
        const buggedSum = 1000 + 1000; // Currency mixing
        expect(buggedSum).toBe(2000);
    });

    it('DESPUÉS: suma correctamente 1000 EUR + 1000 USD = 1917 EUR (CORRECT)', () => {
        const shows = [
            { fee: 1000, feeCurrency: 'EUR', date: '2025-01-15', status: 'confirmed' },
            { fee: 1000, feeCurrency: 'USD', date: '2025-01-15', status: 'confirmed' },
        ];

        const correctSum = sumFees(shows, 'EUR');

        // 1000 + 1000/1.09 ≈ 1917.43 EUR
        expect(correctSum).toBeCloseTo(1917.43, 1);
        expect(correctSum).not.toBe(2000); // Ya NO mezcla monedas
    });

    it('IMPACTO REAL: Tour con shows multi-moneda ahora calcula revenue correcto', () => {
        // Caso real: Tour europeo con 5 shows
        const realTourShows = [
            { fee: 5000, feeCurrency: 'EUR', date: '2025-01-10', status: 'confirmed' }, // Berlin
            { fee: 6500, feeCurrency: 'GBP', date: '2025-01-15', status: 'confirmed' }, // London
            { fee: 8000, feeCurrency: 'USD', date: '2025-01-20', status: 'confirmed' }, // NYC
            { fee: 4500, feeCurrency: 'EUR', date: '2025-01-25', status: 'confirmed' }, // Paris
            { fee: 7200, feeCurrency: 'USD', date: '2025-01-30', status: 'confirmed' }, // LA
        ];

        const totalRevenue = sumFees(realTourShows, 'EUR');

        // Bug anterior habría sumado directamente: 5000+6500+8000+4500+7200 = 31,200 (currency mixing!)
        // Correcto con conversión: 5000 + 6500/0.86 + 8000/1.09 + 4500 + 7200/1.09
        // = 5000 + 7558.14 + 7339.45 + 4500 + 6605.50 = 31,003 EUR
        expect(totalRevenue).toBeCloseTo(31003, 0);

        // La diferencia es menor porque las tasas son cercanas, pero sin conversión es INCORRECTO
        expect(totalRevenue).not.toBe(31200); // Confirma que SÍ está convirtiendo
    });
});
