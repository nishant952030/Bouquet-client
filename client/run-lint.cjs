const { execSync } = require('child_process');
const fs = require('fs');

try {
  const result = execSync('npx eslint -f json .', { encoding: 'utf8' });
  fs.writeFileSync('lint.json', result);
} catch (e) {
  fs.writeFileSync('lint.json', e.stdout);
}
