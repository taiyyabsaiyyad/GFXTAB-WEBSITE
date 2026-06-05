const fs = require('fs');
const html = fs.readFileSync('C:/Users/SUJJAD/.gemini/antigravity-ide/brain/b8b8983b-22d5-4333-938a-b8eb2b0d09bd/.system_generated/steps/4334/content.md', 'utf8');

const regex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
let match;
while ((match = regex.exec(html)) !== null) {
  try {
    const data = JSON.parse(match[1]);
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.log('Error parsing JSON-LD:', e.message);
  }
}
