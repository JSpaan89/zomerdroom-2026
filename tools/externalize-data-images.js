const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
const input = path.join(root, 'index.html');
const outputDir = path.join(root, 'assets', 'embedded');
const extensionFor = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg'
};

let html = fs.readFileSync(input, 'utf8');
const before = Buffer.byteLength(html);
const written = new Set();

fs.mkdirSync(outputDir, { recursive: true });

html = html.replace(/data:(image\/[a-zA-Z0-9.+-]+);base64,([a-zA-Z0-9+/=]+)/g, (full, mime, encoded) => {
  const bytes = Buffer.from(encoded, 'base64');
  const hash = crypto.createHash('sha256').update(bytes).digest('hex').slice(0, 16);
  const extension = extensionFor[mime.toLowerCase()] || 'bin';
  const filename = `${hash}.${extension}`;
  const destination = path.join(outputDir, filename);
  if (!fs.existsSync(destination)) fs.writeFileSync(destination, bytes);
  written.add(filename);
  return `assets/embedded/${filename}`;
});

// Afbeeldingen op niet-actieve boekpagina's pas ophalen wanneer ze in beeld komen.
// Scripttemplates laten we ongemoeid: spel-sprites moeten bij openen direct beschikbaar zijn.
html = html.split(/(<script\b[^>]*>[\s\S]*?<\/script>)/gi).map((part) => {
  if (/^<script\b/i.test(part)) return part;
  return part.replace(/<img\b(?![^>]*\bloading=)([^>]*)>/gi, (tag, attributes) => {
    if (/\bclass=["'][^"']*\btdb-car\b/i.test(attributes)) return tag;
    const decoding = /\bdecoding=/i.test(attributes) ? '' : ' decoding="async"';
    return `<img loading="lazy"${decoding}${attributes}>`;
  });
}).join('');

fs.writeFileSync(input, html, 'utf8');

const offlineAssets = fs.readdirSync(outputDir)
  .filter((name) => name !== 'manifest.json')
  .sort()
  .map((name) => `./assets/embedded/${name}`);
fs.writeFileSync(
  path.join(outputDir, 'manifest.json'),
  JSON.stringify(offlineAssets, null, 2) + '\n',
  'utf8'
);

const after = Buffer.byteLength(html);
console.log(JSON.stringify({
  assets: written.size,
  offlineAssets: offlineAssets.length,
  htmlBeforeBytes: before,
  htmlAfterBytes: after,
  savedBytes: before - after
}, null, 2));
