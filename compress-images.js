import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const IMAGE_DIR = path.join(process.cwd(), 'public', 'images');
const EXCLUDE = ['favicon', 'logo'];
const exts = ['.jpg', '.jpeg', '.png'];

function isImage(file) {
  return exts.includes(path.extname(file).toLowerCase());
}

function isExcluded(file) {
  return EXCLUDE.some(ex => file.toLowerCase().includes(ex));
}

async function compressImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const buffer = fs.readFileSync(filePath);
  let sharpInstance = sharp(buffer);
  if (ext === '.jpg' || ext === '.jpeg') {
    sharpInstance = sharpInstance.jpeg({ quality: 80 });
  } else if (ext === '.png') {
    sharpInstance = sharpInstance.png({ quality: 80, compressionLevel: 8 });
  }
  await sharpInstance.toFile(filePath);
  console.log('Compressed:', filePath);
}

function walk(dir, files = []) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath, files);
    } else if (isImage(file) && !isExcluded(file)) {
      files.push(fullPath);
    }
  });
  return files;
}

async function main() {
  const files = walk(IMAGE_DIR);
  if (files.length === 0) {
    console.log('Aucune image à compresser.');
    return;
  }
  try {
    await Promise.all(files.map(compressImage));
    console.log('Compression terminée.');
  } catch (err) {
    console.error('Erreur lors de la compression:', err);
  }
}

main(); 