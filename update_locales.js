const fs = require('fs');
const path = require('path');

const localesDir = './client/public/locales';
const extracted = JSON.parse(fs.readFileSync('./extracted_keys.json', 'utf8'));

const langs = ['en', 'es', 'bn', 'fr', 'ar', 'tl'];

for (const lang of langs) {
  const filePath = path.join(localesDir, `${lang}.json`);
  let current = {};
  if (fs.existsSync(filePath)) {
    current = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  
  const missingKeys = [];
  for (const key of Object.keys(extracted)) {
    if (!current[key]) {
      missingKeys.push(key);
      current[key] = extracted[key]; // Fallback to English
    }
  }
  
  console.log(`--- Missing in ${lang} ---`);
  missingKeys.forEach(k => console.log(`"${k}": "${extracted[k]}"`));
  
  // Write back merged (with english fallbacks for now)
  fs.writeFileSync(filePath, JSON.stringify(current, null, 2));
}
