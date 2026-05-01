const fs = require('fs');
const path = require('path');

const srcDir = './client/src';
const keys = {};

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      scanDir(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // We will match t("key", "default value") or t('key', 'default value')
      // A more robust regex for the second argument (the default value):
      // It matches the first argument with no quotes inside.
      // For the second argument, we match anything until the closing quote that matches the opening quote.
      const regex = /t\(\s*(["'])(.*?)\1\s*,\s*(["'])([\s\S]*?)\3\s*[,\)]/g;
      let match;
      while ((match = regex.exec(content)) !== null) {
        keys[match[2]] = match[4];
      }
      
      const regexTemplate = /t\(\s*`([^`]+)`\s*,\s*`([\s\S]*?)`\s*[,\)]/g;
      while ((match = regexTemplate.exec(content)) !== null) {
        keys[match[1]] = match[2];
      }
    }
  }
}

scanDir(srcDir);
fs.writeFileSync('extracted_keys.json', JSON.stringify(keys, null, 2));
