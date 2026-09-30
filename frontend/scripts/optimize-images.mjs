import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const imageRoot = path.resolve(scriptDir, '../public/images');
const imageFolders = ['hero', 'guide', 'cutouts', 'backgrounds'];
const sourceExtensions = new Set(['.png', '.jpg', '.jpeg']);
let converted = 0;

for (const folder of imageFolders) {
  const folderPath = path.join(imageRoot, folder);
  const files = await readdir(folderPath, { withFileTypes: true });

  for (const entry of files) {
    if (!entry.isFile() || !sourceExtensions.has(path.extname(entry.name).toLowerCase())) continue;

    const sourcePath = path.join(folderPath, entry.name);
    const basePath = path.join(folderPath, path.parse(entry.name).name);
    await sharp(sourcePath).webp({ quality: 80 }).toFile(`${basePath}.webp`);
    converted += 1;

    if (folder === 'backgrounds') {
      for (const width of [1920, 900]) {
        await sharp(sourcePath)
          .resize({ width, withoutEnlargement: true })
          .webp({ quality: 80 })
          .toFile(`${basePath}-${width}.webp`);
      }
    }
  }
}

console.log(`Converted ${converted} images. Original assets were kept.`);