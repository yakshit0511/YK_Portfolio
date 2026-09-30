import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { loadEnv } from 'vite';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(scriptDir, '..');
const publicRoot = path.join(frontendRoot, 'public');
const env = loadEnv('production', frontendRoot, 'VITE_');
const siteUrl = (env.VITE_SITE_URL || 'http://localhost:5173').replace(/\/$/, '');
const imageDir = path.join(publicRoot, 'images');

const background = await readFile(path.join(imageDir, 'backgrounds', 'room-bg.jpg.png'));
const character = await sharp(path.join(imageDir, 'cutouts', '01_coding_0-3s (1).png'))
  .resize({ height: 550, withoutEnlargement: true })
  .png()
  .toBuffer();
const titleOverlay = Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="shade"><stop stop-color="#050b1f" stop-opacity=".96"/><stop offset=".75" stop-color="#050b1f" stop-opacity=".32"/><stop offset="1" stop-color="#050b1f" stop-opacity=".12"/></linearGradient></defs>
  <rect width="1200" height="630" fill="url(#shade)"/>
  <text x="76" y="260" fill="#f1f5ff" font-family="Arial,sans-serif" font-size="58" font-weight="700">Yakshit Portfolio</text>
  <text x="80" y="324" fill="#8ee8ff" font-family="Arial,sans-serif" font-size="31" font-weight="600">Full Stack MERN Developer</text>
  <rect x="80" y="356" width="118" height="4" rx="2" fill="#54e3ff"/>
</svg>`);

await sharp(background)
  .resize(1200, 630, { fit: 'cover', position: 'centre' })
  .modulate({ brightness: 0.68, saturation: 0.92 })
  .composite([
    { input: titleOverlay },
    { input: character, left: 760, top: 72 },
  ])
  .png()
  .toFile(path.join(publicRoot, 'og-image.png'));

const logo = path.join(imageDir, 'brand', 'Logo.png');
const icon32 = await sharp(logo).resize(32, 32, { fit: 'contain', background: '#050b1f' }).png().toBuffer();
await sharp(logo).resize(180, 180, { fit: 'contain', background: '#050b1f' }).png().toFile(path.join(publicRoot, 'apple-touch-icon.png'));
await sharp(logo).resize(32, 32, { fit: 'contain', background: '#050b1f' }).png().toFile(path.join(publicRoot, 'favicon-32.png'));

const icoHeader = Buffer.alloc(22);
icoHeader.writeUInt16LE(0, 0);
icoHeader.writeUInt16LE(1, 2);
icoHeader.writeUInt16LE(1, 4);
icoHeader.writeUInt8(32, 6);
icoHeader.writeUInt8(32, 7);
icoHeader.writeUInt16LE(1, 10);
icoHeader.writeUInt16LE(32, 12);
icoHeader.writeUInt32LE(icon32.length, 14);
icoHeader.writeUInt32LE(22, 18);
await writeFile(path.join(publicRoot, 'favicon.ico'), Buffer.concat([icoHeader, icon32]));

await writeFile(path.join(publicRoot, 'site.webmanifest'), JSON.stringify({
  name: 'Yakshit Portfolio',
  short_name: 'YK Portfolio',
  start_url: '/',
  display: 'standalone',
  background_color: '#050b1f',
  theme_color: '#050b1f',
  icons: [
    { src: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
    { src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
  ],
}, null, 2));

const lastmod = new Date().toISOString().slice(0, 10);
await writeFile(path.join(publicRoot, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${siteUrl}/</loc><lastmod>${lastmod}</lastmod></url></urlset>\n`);
await writeFile(path.join(publicRoot, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`);
await mkdir(publicRoot, { recursive: true });
console.log(`SEO assets generated for ${siteUrl}.`);