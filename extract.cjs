const fs = require('fs');
const html = fs.readFileSync('C:/Users/SUJJAD/.gemini/antigravity-ide/brain/b8b8983b-22d5-4333-938a-b8eb2b0d09bd/.system_generated/steps/4334/content.md', 'utf8');

const regex = /\"name\":\"([^\"]+)\"[^}]+\"url\":\"([^\"]+)\"/g;
const matches = [...html.matchAll(regex)];

matches.forEach(m => {
  if (m[2].includes('behance.net/gallery') || m[2].includes('mir-s3-cdn-cf.behance.net')) {
    console.log(`Title: ${m[1]}\nURL: ${m[2]}`);
  }
});
