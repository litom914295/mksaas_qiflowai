const fs = require('fs');
const path = require('path');

const files = [
  { path: './src/i18n/locales/zh-CN.json', name: '气流AI' },
  { path: './src/i18n/locales/zh-TW.json', name: '氣流AI' },
  { path: './src/i18n/locales/en.json', name: 'QiFlow AI' },
  { path: './src/i18n/locales/ja.json', name: 'QiFlow AI' },
  { path: './src/i18n/locales/ko.json', name: 'QiFlow AI' },
  { path: './src/i18n/locales/ms.json', name: 'QiFlow AI' }
];

files.forEach(file => {
  try {
    // Read the file
    const fullPath = path.resolve(__dirname, file.path);
    const content = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    
    // Add or update Metadata namespace (with capital M)
    content.Metadata = {
      name: file.name
    };
    
    // Write back with proper formatting
    fs.writeFileSync(fullPath, JSON.stringify(content, null, 2) + '\n', 'utf8');
    console.log(`✓ Updated ${file.path}`);
  } catch (error) {
    console.error(`✗ Error updating ${file.path}:`, error.message);
  }
});

console.log('\n✓ All translation files updated with Metadata namespace');
