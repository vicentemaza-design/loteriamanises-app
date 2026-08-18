// One-off tool: build a CDN-filename -> base64 data-URI map by pairing each
// base template's CDN <img> src list with its already-rendered -preview.html
// counterpart (positionally, in document order). Writes emails/scripts/asset-map.json.
// Run BEFORE editing more base templates, since it relies on the old preview.html
// files still being present as a source of already-designed icon art.
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'templates', 'transaccional');
const files = fs.readdirSync(DIR).filter(f => f.endsWith('.html') && !f.endsWith('-preview.html'));

const freq = {}; // filename -> Map(dataURI -> count)

function record(filename, dataURI) {
  if (!freq[filename]) freq[filename] = new Map();
  freq[filename].set(dataURI, (freq[filename].get(dataURI) || 0) + 1);
}

const IMG_SRC_RE = /<img[^>]*\ssrc="([^"]+)"/g;

function stripMso(html) {
  return html.replace(/<!--\[if mso\]>[\s\S]*?<!\[endif\]-->/g, '');
}
function unwrapNotMso(html) {
  return html.replace(/<!--\[if !mso\]><!-->/g, '').replace(/<!--<!\[endif\]-->/g, '');
}

for (const f of files) {
  let base = fs.readFileSync(path.join(DIR, f), 'utf8');
  base = unwrapNotMso(stripMso(base));
  const previewPath = path.join(DIR, f.replace(/\.html$/, '-preview.html'));
  if (!fs.existsSync(previewPath)) continue;
  const preview = fs.readFileSync(previewPath, 'utf8');

  const baseSrcs = [...base.matchAll(IMG_SRC_RE)].map(m => m[1])
    .filter(s => s.startsWith('https://cdn.loteriamanises.com/emails/'));
  const previewSrcs = [...preview.matchAll(IMG_SRC_RE)].map(m => m[1])
    .filter(s => s.startsWith('data:'));

  if (baseSrcs.length !== previewSrcs.length) {
    console.log(`SKIP (img count mismatch ${baseSrcs.length} vs ${previewSrcs.length}): ${f}`);
    continue;
  }
  baseSrcs.forEach((src, i) => {
    const filename = src.replace('https://cdn.loteriamanises.com/emails/', '');
    record(filename, previewSrcs[i]);
  });
}

const map = {};
for (const [filename, counts] of Object.entries(freq)) {
  let best = null, bestCount = -1;
  for (const [uri, count] of counts.entries()) {
    if (count > bestCount) { best = uri; bestCount = count; }
  }
  map[filename] = best;
  if (counts.size > 1) {
    console.log(`NOTE: ${filename} had ${counts.size} variants, picked most common (${bestCount}x)`);
  }
}

fs.writeFileSync(path.join(__dirname, 'asset-map.json'), JSON.stringify(map, null, 2));
console.log(`\nWrote ${Object.keys(map).length} assets to asset-map.json`);
