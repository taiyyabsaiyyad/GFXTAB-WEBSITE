const fs = require('fs');
const path = './src/pages/Dashboard.jsx';

let content = fs.readFileSync(path, 'utf8');

const replacements = {
  'ΓÇö': '—',
  '≡ƒûÑ∩╕Å': '🖥️',
  '≡ƒôÉ': '📏',
  'Γ£¿': '✨',
  '≡ƒô╖': '📸',
  'Γ£ë∩╕Å': '✉️',
  '≡ƒ¬¬': '🎨',
  '≡ƒöì': '🔍',
  'Γé╣': '₹',
  'Γ£ô': '✅',
  'Γåù': '↗',
  '┬⌐': '©'
};

for (const [bad, good] of Object.entries(replacements)) {
  content = content.split(bad).join(good);
}

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed encoding issues in Dashboard.jsx');
