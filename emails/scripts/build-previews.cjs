// Regenerates every *-preview.html in emails/templates/transaccional from its
// base .html template: strips mso-only conditional blocks, resolves CDN image
// srcs to embedded base64 (via asset-map.json + local files in emails/assets),
// and substitutes {{TOKENS}} with sample data (reusing the surrounding text as
// an anchor to pull the previous sample value out of the old preview file when
// possible, so wording stays consistent with what was already shipped).
//
// Usage: node emails/scripts/build-previews.cjs [--only=name1,name2] [--no-be]
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const TPL_DIR = path.join(ROOT, 'emails', 'templates', 'transaccional');
const ASSETS_DIR = path.join(ROOT, 'emails', 'assets');
const BE_TPL_DIR = path.join(ROOT, 'emails', 'delivery', 'loteria-manises-email-templates-be-20260814', 'templates', 'transaccional');
const BE_PREVIEW_DIR = path.join(ROOT, 'emails', 'delivery', 'loteria-manises-email-templates-be-20260814', 'previews', 'transaccional');

const args = process.argv.slice(2);
const onlyArg = args.find(a => a.startsWith('--only='));
const only = onlyArg ? onlyArg.slice(7).split(',') : null;
const skipBe = args.includes('--no-be');

function b64(absPath) {
  const ext = path.extname(absPath).slice(1).toLowerCase();
  const mime = ext === 'jpg' ? 'jpeg' : ext;
  return `data:image/${mime};base64,${fs.readFileSync(absPath).toString('base64')}`;
}

// ---- asset map (CDN filename -> data URI) ----
const assetMap = JSON.parse(fs.readFileSync(path.join(__dirname, 'asset-map.json'), 'utf8'));
// Local real files always win over extracted placeholders.
const LOCAL_ASSET_FILES = [
  'icon-hero-lock-square.png', 'icon-hero-user-square.png',
  'icon-hero-device-square.png', 'icon-hero-email-square.png',
  'icon-step-1-navy.png', 'icon-step-2-navy.png', 'icon-step-3-navy.png',
  'app-mockups-duo.png', 'app-mockup-jugadas.png', 'mockup-movil-email.png',
  'hero-bg.jpg',
];
for (const f of LOCAL_ASSET_FILES) {
  const p = path.join(ASSETS_DIR, f);
  if (fs.existsSync(p)) assetMap[f] = b64(p);
}

// Minimal generated fallback for any CDN filename with no real/extracted asset:
// a soft rounded-square line-icon silhouette, better than a broken image.
function placeholderIcon(filename) {
  const isCircleBadge = /circle/.test(filename);
  const shape = isCircleBadge
    ? '<circle cx="50" cy="50" r="46" fill="rgba(255,255,255,0.16)"/>'
    : '<rect x="4" y="4" width="92" height="92" rx="20" fill="rgba(255,255,255,0.16)"/>';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">${shape}<circle cx="50" cy="46" r="12" fill="none" stroke="#FFFFFF" stroke-width="4"/><path d="M32 72c4-10 12-15 18-15s14 5 18 15" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round"/></svg>`;
  return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
}

// ---- generic sample-data dictionary (fallback when no local anchor match) ----
const GENERIC = [
  [/^URL_/, '#'],
  [/^HERO_COLOR$/, '#14532D'],
  [/^HERO_GRADIENT$/, 'linear-gradient(135deg,rgba(11,51,32,0.88) 0%,rgba(20,83,45,0.88) 60%,rgba(30,122,69,0.88) 100%)'],
  [/^HERO_IMAGE_URL$/, ''],
  [/^HORA/, '14:20'],
  [/^FECHA_HORA/, '09/08/2026 &middot; 14:20'],
  [/^FECHA/, '09/08/2026'],
  [/^EMAIL$/, 'rafa.sanchis@email.com'],
  [/^USUARIO$/, 'rafa.sanchis@email.com'],
  [/^NOMBRE_USUARIO$/, 'Rafa'],
  [/^NOMBRE$/, 'Rafa Sanchis'],
  [/^TELEFONO$/, '+34 600 000 000'],
  [/^DISPOSITIVO$/, 'iPhone 14 Pro'],
  [/^NAVEGADOR$/, 'Safari / App Loter&iacute;a Manises'],
  [/^UBICACION$/, 'Valencia, Espa&ntilde;a'],
  [/^IBAN$/, 'ES91 2100 0418 4502 0005 1332'],
  [/^BANCO$/, 'Banco Santander'],
  [/^BENEFICIARIO$/, 'Loter&iacute;a Manises, S.L.'],
  [/^MOTIVO/, 'Baja solicitada por el usuario'],
  [/^IMPORTE|CANTIDAD|GASTOS|PREMIO_POR|SALDO/, '50,00'],
  [/^NUMERO_PEDIDO|NUM_PEDIDO$/, 'J-20260809-001'],
  [/^NUMERO_SOLICITUD|NUM_SOLICITUD$/, 'AB-2026-0042'],
  [/^NUMERO_OPERACION$/, 'OP-2026-78432'],
  [/^NUMERO_SEGUIMIENTO$/, 'ES123456789'],
  [/^NUMERO_COMPROBADO|NUMERO_PREMIADO|NUMERO_SOLICITADO|NUMERO$/, '00542'],
  [/^NUM_APUESTAS|NUM_SORTEOS$/, '3'],
  [/^ULTIMOS_DIGITOS_TARJETA$/, '4242'],
  [/^METODO_PAGO|METODO_RECARGA$/, 'Tarjeta Visa'],
  [/^ESTADO|TIPO_ESTADO$/, 'Confirmado'],
  [/^JUEGO|NOMBRE_JUEGO|NOMBRE_SORTEO/, 'La Primitiva'],
  [/^SORTEO$/, 'La Primitiva'],
  [/^TRANSPORTISTA$/, 'SEUR'],
  [/^PLAZO_ESTIMADO$/, '24&ndash;48h'],
  [/^SEMANA$/, '33/2026'],
  [/^TITULO/, 'Detalle de la operaci&oacute;n'],
  [/^MENSAJE$/, 'Todo correcto con tu operaci&oacute;n.'],
  [/^CTA_TEXTO$/, 'Ver detalles'],
  [/^TIPO_DATO$/, 'Tel&eacute;fono de contacto'],
  [/^NUEVO_VALOR$/, '+34 600 000 000'],
  [/^DIRECCION_NOMBRE$/, 'Rafa Sanchis'],
  [/^DIRECCION_TELEFONO$/, '+34 600 000 000'],
  [/^MODALIDAD_LABEL$/, 'Combinaci&oacute;n simple'],
  [/^BLOQUE_|SORTEOS_INLINE|DATOS_RELACIONADOS/, ''], // handled separately, see buildBlockRow()
];

function genericValue(token) {
  for (const [re, val] of GENERIC) if (re.test(token)) return val;
  return token.toLowerCase().replace(/_/g, ' ');
}

function buildBlockRow(token) {
  // Best-effort generic 2-row filler for {{BLOQUE_*}} table-row placeholders.
  // Wording varies by token: Nacional/Navidad sells décimos, number-draw games
  // (Primitiva/Bonoloto/Euromillones) are apuestas — using "décimos" for an
  // apuestas block reads as wrong, so keep the two vocabularies separate.
  const row = (title, sub, right) => `
                    <tr>
                      <td style="padding:10px 0;border-bottom:1px solid #F3F4F6;">
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td>
                              <p style="margin:0;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:#0D1B3D;">${title}</p>
                              <p style="margin:2px 0 0 0;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:12px;color:#94A3B8;">${sub}</p>
                            </td>
                            <td style="text-align:right;vertical-align:top;">
                              <p style="margin:0;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:13px;color:#334155;">${right}</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>`;
  if (/^BLOQUE_APUESTAS|^BLOQUE_NUMEROS/.test(token)) {
    return row('La Primitiva', '05 - 12 - 23 - 31 - 40 - 44', 'Combinaci&oacute;n simple') +
           row('Bonoloto', '02 - 09 - 18 - 27 - 35 - 41', 'Combinaci&oacute;n simple');
  }
  return row('La Primitiva', 'Jueves 14/08/2026', '2 d&eacute;cimos') +
         row('Bonoloto', 'Viernes 15/08/2026', '1 d&eacute;cimo');
}

// ---- html transforms ----
function stripMso(html) {
  return html.replace(/<!--\[if mso\]>[\s\S]*?<!\[endif\]-->/g, '');
}
function unwrapNotMso(html) {
  return html.replace(/<!--\[if !mso\]><!-->/g, '').replace(/<!--<!\[endif\]-->/g, '');
}
function resolveImages(html) {
  return html.replace(/https:\/\/cdn\.loteriamanises\.com\/emails\/([A-Za-z0-9_.-]+)/g, (m, filename) => {
    return assetMap[filename] || placeholderIcon(filename);
  }).replace(/src="\.\.\/\.\.\/assets\/([^"]+)"/g, (m, filename) => {
    const p = path.join(ASSETS_DIR, filename);
    return fs.existsSync(p) ? `src="${b64(p)}"` : m;
  });
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// NOTE: *-preview.html files are gitignored build artifacts (see .gitignore),
// not source of truth, and are freely overwritten by this script each run.
// Sample data therefore comes from the generic dictionary below (plus a
// per-template OVERRIDES table) rather than by scraping old preview output.
function substituteTokens(strippedBase, overrides) {
  let out = strippedBase;
  const tokenRe = /\{\{([A-Z_]+)\}\}/g;
  let match;
  const replacements = [];
  const seen = {}; // token -> count, so repeated tokens in one file can still vary if an override array is given
  while ((match = tokenRe.exec(strippedBase)) !== null) {
    const [full, token] = match;
    const idx = match.index;
    if (/^BLOQUE_|SORTEOS_INLINE$|^DATOS_RELACIONADOS$/.test(token)) {
      replacements.push({ full, idx, value: buildBlockRow(token) });
      continue;
    }
    const n = seen[token] = (seen[token] || 0);
    seen[token]++;
    let value = null;
    if (overrides && overrides[token] !== undefined) {
      value = Array.isArray(overrides[token]) ? (overrides[token][n] ?? overrides[token][0]) : overrides[token];
    }
    if (value === null) value = genericValue(token);
    replacements.push({ full, idx, value });
  }
  replacements.sort((a, b) => b.idx - a.idx);
  for (const r of replacements) {
    out = out.slice(0, r.idx) + r.value + out.slice(r.idx + r.full.length);
  }
  return out;
}

// Per-template overrides for tokens whose generic value would be wrong or
// where the same token repeats with different real-world values in one file.
const OVERRIDES = {
  'auth-nuevo-acceso': {
    FECHA_HORA: '09/08/2026 &middot; 10:35',
    DISPOSITIVO: 'iPhone 14 Pro',
    NAVEGADOR: 'Safari / App Loter&iacute;a Manises',
    UBICACION: 'Valencia, Espa&ntilde;a',
  },
};

function buildPreview(name) {
  const basePath = path.join(TPL_DIR, `${name}.html`);
  const base = fs.readFileSync(basePath, 'utf8');

  let html = unwrapNotMso(stripMso(base));
  html = substituteTokens(html, OVERRIDES[name]);
  html = resolveImages(html);
  return html;
}

function main() {
  let names = fs.readdirSync(TPL_DIR)
    .filter(f => f.endsWith('.html') && !f.endsWith('-preview.html'))
    .map(f => f.replace(/\.html$/, ''));
  if (only) names = names.filter(n => only.includes(n));

  for (const name of names) {
    const html = buildPreview(name);
    const outPath = path.join(TPL_DIR, `${name}-preview.html`);
    fs.writeFileSync(outPath, html);
    console.log('preview:', name);
    if (!skipBe) {
      const bePreviewPath = path.join(BE_PREVIEW_DIR, `${name}-preview.html`);
      if (fs.existsSync(path.dirname(bePreviewPath))) fs.writeFileSync(bePreviewPath, html);
    }
  }
  console.log(`\nDone: ${names.length} preview(s) regenerated.`);
}

main();
