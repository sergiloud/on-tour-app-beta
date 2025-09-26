#!/usr/bin/env node
// Scan app.html (and optionally other html files) for data-i18n / data-i18n-label keys and verify presence in i18n dictionaries.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const htmlFiles = ['app.html','index.html','login.html'].map(f => path.join(root, f)).filter(f => fs.existsSync(f));
const i18nPath = path.join(root, 'src/modules/i18n.ts');
const src = fs.readFileSync(i18nPath,'utf8');

function extractDictKeys(code){
  const keyRegex = /['"]([a-zA-Z0-9_.-]+)['"]\s*:/g; // simplistic but ok for flat dict
  const keys = new Set();
  let m; while((m = keyRegex.exec(code))){ keys.add(m[1]); }
  return keys;
}

const dictKeys = extractDictKeys(src);

function extractHtmlKeys(content){
  const regex = /data-i18n(?:-label)?="([^"]+)"/g;
  const keys = new Set();
  let m; while((m = regex.exec(content))){ keys.add(m[1]); }
  return keys;
}

const missing = new Set();
const used = new Set();

htmlFiles.forEach(file => {
  const html = fs.readFileSync(file,'utf8');
  const keys = extractHtmlKeys(html);
  keys.forEach(k => {
    used.add(k);
    if (!dictKeys.has(k)) missing.add(k);
  });
});

if (missing.size){
  console.error('[i18n-check] Missing keys:\n' + [...missing].sort().map(k => '  - '+k).join('\n'));
  process.exitCode = 1;
} else {
  console.log(`[i18n-check] OK. ${used.size} keys referenced; all present.`);
}
