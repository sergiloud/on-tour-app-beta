#!/usr/bin/env node
/**
 * Translation Quality Assurance Script for On Tour App
 * 
 * This script validates the i18n.ts file for:
 * - Translation completeness across all 6 languages
 * - Duplicate key detection
 * - Structure validation
 * - Key consistency checking
 * - Missing translation reporting
 */

const fs = require('fs');
const path = require('path');

// Configuration
const I18N_FILE_PATH = path.join(__dirname, 'src', 'lib', 'i18n.ts');
const SUPPORTED_LANGUAGES = ['en', 'es', 'fr', 'de', 'it', 'pt'];
const MINIMUM_COVERAGE_PERCENT = 10; // Minimum 10% translation coverage required

// Analytics & Reporting
let validationResults = {
  totalKeys: { en: 0, es: 0, fr: 0, de: 0, it: 0, pt: 0 },
  duplicateKeys: { en: [], es: [], fr: [], de: [], it: [], pt: [] },
  missingKeys: { en: [], es: [], fr: [], de: [], it: [], pt: [] },
  structureValid: true,
  coveragePercent: { en: 100, es: 0, fr: 0, de: 0, it: 0, pt: 0 },
  errors: [],
  warnings: [],
  summary: ''
};

console.log('🔍 Starting Translation Quality Assurance Analysis...\n');

/**
 * Extract translation keys from a language section
 */
function extractKeysFromSection(content, langCode) {
  const keys = new Set();
  const duplicates = [];
  let sectionContent;
  
  // Find the language section - more flexible pattern
  const langPattern = new RegExp(`\\b${langCode}:\\s*\\{([\\s\\S]*?)\\n\\s*\\}\\s*(?:,|$)`, 'i');
  const match = content.match(langPattern);
  
  if (!match) {
    // Try alternative pattern for the last language section
    const altPattern = new RegExp(`\\b${langCode}:\\s*\\{([\\s\\S]*?)\\n\\s*\\}\\s*;`, 'i');
    const altMatch = content.match(altPattern);
    
    if (!altMatch) {
      validationResults.errors.push(`❌ Language section '${langCode}' not found`);
      return { keys: [], duplicates: [] };
    }
    
    sectionContent = altMatch[1];
  } else {
    sectionContent = match[1];
  }
  
  // Extract all key-value pairs with more flexible patterns
  const patterns = [
    /'([^']+)':\s*'[^']*'/g,  // Single quotes
    /"([^"]+)":\s*"[^"]*"/g,  // Double quotes  
    /'([^']+)':\s*`[^`]*`/g   // Template literals
  ];
  
  for (const pattern of patterns) {
    let keyMatch;
    while ((keyMatch = pattern.exec(sectionContent)) !== null) {
      const key = keyMatch[1];
      
      if (keys.has(key)) {
        duplicates.push(key);
      } else {
        keys.add(key);
      }
    }
  }
  
  return { keys: Array.from(keys), duplicates };
}

/**
 * Validate file structure and extract language sections
 */
function validateFileStructure() {
  try {
    const content = fs.readFileSync(I18N_FILE_PATH, 'utf8');
    
    // Check if file has proper DICT structure
    if (!content.includes('const DICT')) {
      validationResults.errors.push('❌ Missing DICT constant declaration');
      validationResults.structureValid = false;
      return null;
    }
    
    // Check if all supported languages are declared
    for (const lang of SUPPORTED_LANGUAGES) {
      if (!content.includes(`${lang}: {`)) {
        validationResults.errors.push(`❌ Missing language section: ${lang}`);
        validationResults.structureValid = false;
      }
    }
    
    return content;
  } catch (error) {
    validationResults.errors.push(`❌ Failed to read i18n.ts: ${error.message}`);
    validationResults.structureValid = false;
    return null;
  }
}

/**
 * Analyze translations for all languages
 */
function analyzeTranslations(content) {
  console.log('📊 Analyzing translation coverage...');
  
  for (const lang of SUPPORTED_LANGUAGES) {
    console.log(`  Analyzing ${lang.toUpperCase()}...`);
    
    const { keys, duplicates } = extractKeysFromSection(content, lang);
    
    validationResults.totalKeys[lang] = keys.length;
    validationResults.duplicateKeys[lang] = duplicates;
    
    // Calculate coverage percentage (English as reference)
    if (lang === 'en') {
      validationResults.coveragePercent[lang] = 100;
    } else {
      const englishKeys = validationResults.totalKeys.en || 1;
      validationResults.coveragePercent[lang] = 
        Math.round((keys.length / englishKeys) * 100);
    }
    
    // Report duplicates
    if (duplicates.length > 0) {
      validationResults.warnings.push(
        `⚠️  ${lang.toUpperCase()}: ${duplicates.length} duplicate keys found: ${duplicates.slice(0, 5).join(', ')}${duplicates.length > 5 ? '...' : ''}`
      );
    }
    
    // Check minimum coverage
    if (lang !== 'en' && validationResults.coveragePercent[lang] < MINIMUM_COVERAGE_PERCENT) {
      validationResults.warnings.push(
        `⚠️  ${lang.toUpperCase()}: Coverage ${validationResults.coveragePercent[lang]}% is below minimum ${MINIMUM_COVERAGE_PERCENT}%`
      );
    }
  }
}

/**
 * Generate comprehensive report
 */
function generateReport() {
  console.log('\n📋 TRANSLATION QUALITY ASSURANCE REPORT');
  console.log('═'.repeat(50));
  
  // Structure validation
  console.log('\n🏗️  STRUCTURE VALIDATION');
  if (validationResults.structureValid) {
    console.log('✅ File structure is valid');
    console.log('✅ All language sections found');
  } else {
    console.log('❌ Structure validation failed');
  }
  
  // Translation coverage
  console.log('\n📊 TRANSLATION COVERAGE');
  console.log('┌─────────────┬─────────────┬─────────────┬─────────────┐');
  console.log('│   Language  │    Keys     │  Coverage   │   Status    │');
  console.log('├─────────────┼─────────────┼─────────────┼─────────────┤');
  
  for (const lang of SUPPORTED_LANGUAGES) {
    const keys = validationResults.totalKeys[lang] || 0;
    const coverage = validationResults.coveragePercent[lang] || 0;
    const status = coverage >= MINIMUM_COVERAGE_PERCENT ? '✅ Good' : 
                   coverage > 0 ? '⚠️  Low' : '❌ None';
    
    console.log(`│ ${lang.toUpperCase().padEnd(11)} │ ${keys.toString().padEnd(11)} │ ${coverage.toString().padEnd(9)}% │ ${status.padEnd(11)} │`);
  }
  console.log('└─────────────┴─────────────┴─────────────┴─────────────┘');
  
  // Duplicate detection
  console.log('\n🔍 DUPLICATE KEY ANALYSIS');
  let totalDuplicates = 0;
  for (const lang of SUPPORTED_LANGUAGES) {
    const dupes = validationResults.duplicateKeys[lang] || [];
    totalDuplicates += dupes.length;
    if (dupes.length > 0) {
      console.log(`❌ ${lang.toUpperCase()}: ${dupes.length} duplicates`);
    } else {
      console.log(`✅ ${lang.toUpperCase()}: No duplicates`);
    }
  }
  
  // Errors and warnings
  if (validationResults.errors.length > 0) {
    console.log('\n🚨 ERRORS');
    validationResults.errors.forEach(error => console.log(error));
  }
  
  if (validationResults.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS');
    validationResults.warnings.forEach(warning => console.log(warning));
  }
  
  // Summary
  console.log('\n📈 SUMMARY');
  const totalKeys = validationResults.totalKeys.en || 0;
  const avgCoverage = Math.round(
    SUPPORTED_LANGUAGES.slice(1).reduce((sum, lang) => 
      sum + (validationResults.coveragePercent[lang] || 0), 0) / 5
  );
  
  console.log(`📝 Total English keys: ${totalKeys}`);
  console.log(`🌍 Average non-English coverage: ${avgCoverage}%`);
  console.log(`🔄 Total duplicate keys: ${totalDuplicates}`);
  console.log(`❌ Total errors: ${validationResults.errors.length}`);
  console.log(`⚠️  Total warnings: ${validationResults.warnings.length}`);
  
  // Overall status
  if (validationResults.errors.length === 0 && totalDuplicates === 0) {
    console.log('\n🎉 OVERALL STATUS: ✅ EXCELLENT - No critical issues detected!');
  } else if (validationResults.errors.length === 0) {
    console.log('\n🎯 OVERALL STATUS: ⚠️  GOOD - Minor warnings only');
  } else {
    console.log('\n🚨 OVERALL STATUS: ❌ ISSUES FOUND - Requires attention');
  }
  
  console.log('═'.repeat(50));
}

/**
 * Generate actionable recommendations
 */
function generateRecommendations() {
  console.log('\n💡 ACTIONABLE RECOMMENDATIONS');
  console.log('─'.repeat(30));
  
  // Coverage recommendations
  for (const lang of SUPPORTED_LANGUAGES) {
    if (lang === 'en') continue;
    
    const coverage = validationResults.coveragePercent[lang] || 0;
    const keys = validationResults.totalKeys[lang] || 0;
    
    if (coverage < 15) {
      console.log(`🎯 ${lang.toUpperCase()}: Expand from ${keys} to 400+ keys (target 15% coverage)`);
    } else if (coverage < 30) {
      console.log(`📈 ${lang.toUpperCase()}: Good foundation at ${coverage}%, consider expansion to 30%`);
    } else {
      console.log(`✨ ${lang.toUpperCase()}: Excellent coverage at ${coverage}%!`);
    }
  }
  
  // Duplicate handling
  const totalDuplicates = Object.values(validationResults.duplicateKeys)
    .reduce((sum, dupes) => sum + dupes.length, 0);
  
  if (totalDuplicates > 0) {
    console.log(`🔧 PRIORITY: Remove ${totalDuplicates} duplicate keys to prevent compilation errors`);
  }
  
  // Structure improvements
  if (validationResults.errors.length > 0) {
    console.log('🚨 CRITICAL: Fix structure errors before proceeding with translations');
  }
  
  console.log('\n✅ Quality assurance analysis complete!');
}

// Main execution
function main() {
  const content = validateFileStructure();
  
  if (content && validationResults.structureValid) {
    analyzeTranslations(content);
  }
  
  generateReport();
  generateRecommendations();
  
  // Exit with appropriate code
  const hasErrors = validationResults.errors.length > 0;
  process.exit(hasErrors ? 1 : 0);
}

// Execute if run directly
if (require.main === module) {
  main();
}

module.exports = {
  validateTranslations: main,
  validationResults
};