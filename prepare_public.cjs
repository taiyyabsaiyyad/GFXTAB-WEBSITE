const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, 'public');
const destDir = path.resolve(__dirname, 'public_clean');

function deleteFolderRecursive(dir) {
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach((file) => {
      const curPath = path.join(dir, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(dir);
  }
}

function copyRecursive(src, dest) {
  try {
    const stats = fs.statSync(src);
    if (stats.isDirectory()) {
      if (src.endsWith('FONT_corrupted')) {
        return;
      }
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      fs.readdirSync(src).forEach((file) => {
        copyRecursive(path.join(src, file), path.join(dest, file));
      });
    } else {
      fs.copyFileSync(src, dest);
    }
  } catch (err) {
    console.warn(`Warning: Skipping copy for ${src} due to error: ${err.message}`);
  }
}

console.log('Cleaning public_clean directory...');
try {
  deleteFolderRecursive(destDir);
} catch (e) {
  console.warn('Warning during clean:', e.message);
}

console.log('Copying clean public assets to public_clean...');
copyRecursive(srcDir, destDir);
console.log('Done preparing public_clean!');
