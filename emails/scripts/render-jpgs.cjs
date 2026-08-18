// Renders each *-preview.html to a cropped JPG in
// emails/delivery/previews-jpg-cropped-20260817/, overwriting in place.
// Usage: node emails/scripts/render-jpgs.cjs [--only=name1,name2]
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const TPL_DIR = path.join(ROOT, 'emails', 'templates', 'transaccional');
const OUT_DIR = path.join(ROOT, 'emails', 'delivery', 'previews-jpg-cropped-20260817');

const args = process.argv.slice(2);
const onlyArg = args.find(a => a.startsWith('--only='));
const only = onlyArg ? onlyArg.slice(7).split(',') : null;

async function main() {
  let names = fs.readdirSync(TPL_DIR)
    .filter(f => f.endsWith('-preview.html'))
    .map(f => f.replace(/-preview\.html$/, ''));
  if (only) names = names.filter(n => only.includes(n));

  const browser = await chromium.launch();
  for (const name of names) {
    const html = fs.readFileSync(path.join(TPL_DIR, `${name}-preview.html`), 'utf8');
    const page = await browser.newPage({ viewport: { width: 686, height: 800 } });
    await page.setContent(html, { waitUntil: 'load' });
    await page.screenshot({ path: path.join(OUT_DIR, `${name}.jpg`), fullPage: true, type: 'jpeg', quality: 90 });
    await page.close();
    console.log('jpg:', name);
  }
  await browser.close();
  console.log(`\nDone: ${names.length} jpg(s) rendered.`);
}

main();
