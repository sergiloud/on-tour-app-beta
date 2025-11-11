import { readFileSync, writeFileSync } from 'fs';

const content = readFileSync('src/lib/prophecyContactsDataset.ts', 'utf-8');

// Extract just the array content
const match = content.match(/export const PROPHECY_CONTACTS[^=]+=\s*(\[[\s\S]*?\]);/);

if (match) {
  let arrayContent = match[1];
  
  // Remove comments
  arrayContent = arrayContent.replace(/\/\/.*$/gm, '');
  arrayContent = arrayContent.replace(/\/\*[\s\S]*?\*\//g, '');
  
  // Remove TypeScript type assertions
  arrayContent = arrayContent.replace(/as const/g, '');
  arrayContent = arrayContent.replace(/as any/g, '');
  
  // Convert single quotes to double quotes
  arrayContent = arrayContent.replace(/'/g, '"');
  
  // Fix Date objects to ISO strings
  arrayContent = arrayContent.replace(/new Date\("([^"]+)"\)\.toISOString\(\)/g, '"$1"');
  arrayContent = arrayContent.replace(/new Date\("([^"]+)"\)/g, '"$1"');
  
  // Remove trailing commas
  arrayContent = arrayContent.replace(/,(\s*[\]}])/g, '$1');
  
  writeFileSync('scripts/contacts-data.json', arrayContent);
  
  // Try to parse and validate
  try {
    const contacts = JSON.parse(arrayContent);
    console.log(`✅ Extracted ${contacts.length} contacts to contacts-data.json`);
    console.log(`   Valid JSON with ${JSON.stringify(contacts).length} characters`);
  } catch (e) {
    console.error('❌ Generated JSON is invalid:', e.message);
    console.log('First 500 chars:', arrayContent.substring(0, 500));
    process.exit(1);
  }
} else {
  console.error('❌ Could not find PROPHECY_CONTACTS array');
  process.exit(1);
}
