import fs from 'fs';

const content = fs.readFileSync('src/lib/i18n.ts', 'utf-8');
const lines = content.split('\n');

// Find where getDICT starts and DICT ends
let dictEnd = -1;
let getDICTStart = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const DICT = getDICT()')) {
    getDICTStart = i;
  }
  if (i > 5800 && lines[i].trim() === '};' && lines[i+1].trim() === '};') {
    dictEnd = i + 1;
    break;
  }
}

console.log('getDICT at line:', getDICTStart + 1);
console.log('DICT should end at line:', dictEnd + 1);

// Extract the closing part after pt object
const closingPart = lines.slice(dictEnd + 1).join('\n');

// Create new closing with DICT object
const newContent = lines.slice(0, dictEnd + 1).join('\n') + '\n\n' +
  '// Construct DICT from individual language objects\n' +
  'const DICT: Record<Lang, Record<string, string>> = { en, es, fr, de, it, pt };\n\n' +
  closingPart;

// Remove the old getDICT() pattern
const fixed = newContent
  .replace(/const DICT = getDICT\(\);/g, '// DICT defined above')
  .replace(/\/\/ Lazy-load DICT.*?\n.*?return.*?\n.*?if \(_DICT\).*?\n.*?_DICT = \{/gs, '// Language objects defined above\n\n/*');

fs.writeFileSync('src/lib/i18n.ts', fixed);
console.log('✅ Fixed i18n.ts structure');
