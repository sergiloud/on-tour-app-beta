/**
 * Test script to analyze the 2023 and 2026 HTML structure
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read HTML files
const html2023 = fs.readFileSync(path.join(__dirname, '../docs/DANNY AVILA MASTER TIMELINE/2023.html'), 'utf-8');
const html2026 = fs.readFileSync(path.join(__dirname, '../docs/DANNY AVILA MASTER TIMELINE/2026.html'), 'utf-8');

console.log('=== 2023 HTML ANALYSIS ===');
console.log(`Total length: ${html2023.length} characters`);
console.log(`Contains 'Mallorca': ${html2023.includes('Mallorca')}`);
console.log(`Contains '$': ${html2023.includes('$')}`);
console.log(`Contains 'BCM': ${html2023.includes('BCM')}`);

// Try to parse as HTML
const parser = new DOMParser();
const doc2023 = parser.parseFromString(html2023, 'text/html');
const tables2023 = doc2023.querySelectorAll('table');
console.log(`\nNumber of tables: ${tables2023.length}`);

if (tables2023.length > 0) {
  const table = tables2023[0];
  const rows = table.querySelectorAll('tr');
  console.log(`Total rows in first table: ${rows.length}`);

  // Find rows with actual data (not empty)
  let dataRows = 0;
  let firstDataRow = null;

  for (let i = 0; i < rows.length && i < 400; i++) {
    const row = rows[i];
    const cells = row.querySelectorAll('td, th');
    const dataCells = Array.from(cells).filter(c => {
      const text = c.textContent?.trim() || '';
      return text.length > 0 && !text.match(/^\d+$/) && text !== 'A' && text !== 'B';
    });

    if (dataCells.length >= 3) {
      dataRows++;
      if (!firstDataRow && i > 10) {
        firstDataRow = i;
        console.log(`\nFirst data row found at index ${i}:`);
        const allCells = Array.from(cells);
        allCells.slice(0, 10).forEach((cell, idx) => {
          const text = (cell.textContent || '').trim();
          if (text) {
            console.log(`  Cell ${idx}: "${text.substring(0, 50)}"`);
          }
        });
      }
    }
  }

  console.log(`\nRows with 3+ non-empty cells: ${dataRows}`);
}

console.log('\n=== 2026 HTML ANALYSIS ===');
console.log(`Total length: ${html2026.length} characters`);

const doc2026 = parser.parseFromString(html2026, 'text/html');
const tables2026 = doc2026.querySelectorAll('table');
console.log(`Number of tables: ${tables2026.length}`);

if (tables2026.length > 0) {
  const table = tables2026[0];
  const rows = table.querySelectorAll('tr');
  console.log(`Total rows in first table: ${rows.length}`);

  let dataRows2026 = 0;
  let firstDataRow2026 = null;

  for (let i = 0; i < rows.length && i < 400; i++) {
    const row = rows[i];
    const cells = row.querySelectorAll('td, th');
    const dataCells = Array.from(cells).filter(c => {
      const text = c.textContent?.trim() || '';
      return text.length > 0 && !text.match(/^\d+$/) && text !== 'A' && text !== 'B';
    });

    if (dataCells.length >= 3) {
      dataRows2026++;
      if (!firstDataRow2026 && i > 10) {
        firstDataRow2026 = i;
        console.log(`\nFirst data row found at index ${i}:`);
        const allCells = Array.from(cells);
        allCells.slice(0, 10).forEach((cell, idx) => {
          const text = (cell.textContent || '').trim();
          if (text) {
            console.log(`  Cell ${idx}: "${text.substring(0, 50)}"`);
          }
        });
      }
    }
  }

  console.log(`\nRows with 3+ non-empty cells: ${dataRows2026}`);
}
