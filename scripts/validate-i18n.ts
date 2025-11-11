#!/usr/bin/env tsx
/**
 * i18n Translation Validator
 * Validates that all translation keys exist across all languages
 * Reports missing translations and unused keys
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { execSync as exec } from 'child_process';

const LANG_CODES = ['en', 'es', 'fr', 'de', 'it', 'pt'] as const;
type Lang = typeof LANG_CODES[number];

interface ValidationResult {
  lang: Lang;
  missingKeys: string[];
  extraKeys: string[];
}

interface Report {
  totalKeys: number;
  languageResults: ValidationResult[];
  criticalIssues: string[];
  warnings: string[];
}

/**
 * Extract all translation keys from i18n.ts
 */
function extractTranslationKeys(): Record<Lang, Set<string>> {
  const i18nPath = join(process.cwd(), 'src/lib/i18n.ts');
  const content = readFileSync(i18nPath, 'utf-8');
  
  const keySets: Record<Lang, Set<string>> = {
    en: new Set(),
    es: new Set(),
    fr: new Set(),
    de: new Set(),
    it: new Set(),
    pt: new Set(),
  };

  // Match DICT object and extract keys for each language
  const dictRegex = /const DICT:\s*Record<Lang,\s*Record<string,\s*string>>\s*=\s*{([^}]+en:\s*{[^}]+}[^}]+es:\s*{[^}]+}[^}]+fr:\s*{[^}]+}[^}]+de:\s*{[^}]+}[^}]+it:\s*{[^}]+}[^}]+pt:\s*{[^}]+}[^}]*)/s;
  
  LANG_CODES.forEach(lang => {
    // Match language section: lang: { 'key': 'value', ... }
    const langRegex = new RegExp(`${lang}:\\s*{([^}]+(?:}[^}]*})*?)(?:\\s*,\\s*(?:${LANG_CODES.filter(l => l !== lang).join('|')}|//|}))`,'s');
    const langMatch = content.match(langRegex);
    
    if (langMatch) {
      const langContent = langMatch[1];
      // Extract all keys: 'key' or "key"
      const keyMatches = langContent.matchAll(/['"]([^'"]+)['"]\s*:/g);
      
      for (const match of keyMatches) {
        keySets[lang].add(match[1]);
      }
    }
  });

  return keySets;
}

/**
 * Find all t() usage in source files
 */
function findUsedKeys(): Set<string> {
  const usedKeys = new Set<string>();

  try {
    // Search for t('key') and t("key") patterns
    const grepResult = exec(
      `grep -r --include="*.tsx" --include="*.ts" -oh "t(['\"][^'\"]*['\"])" src/ || true`,
      { encoding: 'utf-8' }
    ) as string;

    const matches = grepResult.matchAll(/t\(['"]([^'"]+)['"]\)/g);
    for (const match of matches) {
      usedKeys.add(match[1]);
    }
  } catch (err) {
    console.warn('Warning: Could not extract used keys via grep');
  }

  return usedKeys;
}

/**
 * Validate translations across all languages
 */
function validateTranslations(): Report {
  console.log('🔍 Validating i18n translations...\n');

  const keySets = extractTranslationKeys();
  const usedKeys = findUsedKeys();

  // Use English as reference (primary language)
  const referenceKeys = keySets.en;
  const totalKeys = referenceKeys.size;

  console.log(`📊 Found ${totalKeys} keys in English (reference language)`);
  console.log(`📊 Found ${usedKeys.size} keys used in source code\n`);

  const results: ValidationResult[] = [];
  const criticalIssues: string[] = [];
  const warnings: string[] = [];

  // Validate each language against reference
  LANG_CODES.forEach(lang => {
    const langKeys = keySets[lang];
    const missingKeys: string[] = [];
    const extraKeys: string[] = [];

    // Find missing keys (in reference but not in language)
    referenceKeys.forEach(key => {
      if (!langKeys.has(key)) {
        missingKeys.push(key);
      }
    });

    // Find extra keys (in language but not in reference)
    langKeys.forEach(key => {
      if (!referenceKeys.has(key)) {
        extraKeys.push(key);
      }
    });

    results.push({
      lang,
      missingKeys,
      extraKeys,
    });

    // Report issues
    if (lang === 'en') {
      console.log(`✅ ${lang.toUpperCase()}: ${langKeys.size} keys (reference)`);
    } else {
      const coverage = ((langKeys.size - missingKeys.length) / referenceKeys.size) * 100;
      const status = missingKeys.length === 0 ? '✅' : missingKeys.length < 10 ? '⚠️' : '❌';
      
      console.log(`${status} ${lang.toUpperCase()}: ${langKeys.size} keys (${coverage.toFixed(1)}% coverage)`);
      
      if (missingKeys.length > 0) {
        console.log(`   Missing: ${missingKeys.length} keys`);
        if (missingKeys.length > 50) {
          criticalIssues.push(`${lang.toUpperCase()} is missing ${missingKeys.length} translations`);
        } else {
          warnings.push(`${lang.toUpperCase()} is missing ${missingKeys.length} translations`);
        }
      }
      
      if (extraKeys.length > 0) {
        console.log(`   Extra: ${extraKeys.length} keys not in reference`);
        warnings.push(`${lang.toUpperCase()} has ${extraKeys.length} extra keys not in English`);
      }
    }
  });

  // Check for unused keys
  console.log('\n🔍 Checking for unused translation keys...');
  const unusedKeys: string[] = [];
  referenceKeys.forEach(key => {
    if (!usedKeys.has(key)) {
      unusedKeys.push(key);
    }
  });

  if (unusedKeys.length > 0) {
    console.log(`⚠️  Found ${unusedKeys.length} potentially unused keys`);
    if (unusedKeys.length < 20) {
      console.log('   Examples:', unusedKeys.slice(0, 10).join(', '));
    }
  } else {
    console.log('✅ All translation keys are used');
  }

  return {
    totalKeys,
    languageResults: results,
    criticalIssues,
    warnings,
  };
}

/**
 * Generate detailed report for specific language
 */
function generateDetailedReport(lang: Lang, result: ValidationResult) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Detailed Report: ${lang.toUpperCase()}`);
  console.log('='.repeat(60));

  if (result.missingKeys.length > 0) {
    console.log(`\n❌ Missing Keys (${result.missingKeys.length}):`);
    result.missingKeys.slice(0, 20).forEach(key => {
      console.log(`   - ${key}`);
    });
    if (result.missingKeys.length > 20) {
      console.log(`   ... and ${result.missingKeys.length - 20} more`);
    }
  }

  if (result.extraKeys.length > 0) {
    console.log(`\n⚠️  Extra Keys (${result.extraKeys.length}):`);
    result.extraKeys.slice(0, 10).forEach(key => {
      console.log(`   - ${key}`);
    });
    if (result.extraKeys.length > 10) {
      console.log(`   ... and ${result.extraKeys.length - 10} more`);
    }
  }

  if (result.missingKeys.length === 0 && result.extraKeys.length === 0) {
    console.log('\n✅ Perfect! All keys match the reference language.');
  }
}

/**
 * Main execution
 */
function main() {
  const report = validateTranslations();

  console.log('\n' + '='.repeat(60));
  console.log('Summary');
  console.log('='.repeat(60));
  console.log(`Total translation keys: ${report.totalKeys}`);
  console.log(`Languages: ${LANG_CODES.join(', ')}`);

  if (report.criticalIssues.length > 0) {
    console.log('\n❌ CRITICAL ISSUES:');
    report.criticalIssues.forEach(issue => console.log(`   - ${issue}`));
  }

  if (report.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    report.warnings.forEach(warning => console.log(`   - ${warning}`));
  }

  if (report.criticalIssues.length === 0 && report.warnings.length === 0) {
    console.log('\n✅ All translations are complete and synchronized!');
  }

  // Generate detailed reports for languages with issues
  const languagesWithIssues = report.languageResults.filter(
    r => r.missingKeys.length > 0 || r.extraKeys.length > 0
  );

  if (languagesWithIssues.length > 0 && process.argv.includes('--detailed')) {
    languagesWithIssues.forEach(result => {
      generateDetailedReport(result.lang, result);
    });
  } else if (languagesWithIssues.length > 0) {
    console.log('\n💡 Tip: Run with --detailed flag to see all missing/extra keys');
  }

  // Exit with error if critical issues exist
  if (report.criticalIssues.length > 0) {
    console.log('\n❌ Validation failed due to critical issues');
    process.exit(1);
  }

  console.log('\n✅ i18n validation complete');
  process.exit(0);
}

main();
