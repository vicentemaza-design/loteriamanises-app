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
  [/^HERO_IMAGE_URL$|^LOGO_TRANSPORTISTA_URL$/, ''],
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
  [/^CANTIDAD/, '2'], // discrete count (e.g. décimos), not a monetary amount — must stay ahead of the IMPORTE/money rule below
  [/^(?:IMPORTE|GASTOS|PREMIO_POR|SALDO|TOTAL_PEDIDO)/, '50,00'],
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
  [/^SORTEOS$/, 'La Primitiva &middot; Bonoloto &middot; Euromillones'],
  [/^TRANSPORTISTA$/, 'SEUR'],
  [/^PLAZO_ESTIMADO$/, '24&ndash;48h'],
  [/^SEMANA$/, '33/2026'],
  [/^DIAS_SELECCIONADOS$/, 'Lunes, Mi&eacute;rcoles y Viernes'],
  [/^TITULO/, 'Detalle de la operaci&oacute;n'],
  [/^MENSAJE$/, 'Todo correcto con tu operaci&oacute;n.'],
  [/^TEXTO_ACCION$/, 'Revisa los detalles de tu pedido para m&aacute;s informaci&oacute;n.'],
  [/^CTA_TEXTO$/, 'Ver detalles'],
  [/^CTA_URL$/, '#'],
  [/^TIPO_DATO$/, 'Tel&eacute;fono de contacto'],
  [/^NUEVO_VALOR$/, '+34 600 000 000'],
  [/^DIRECCION_NOMBRE$/, 'Rafa Sanchis'],
  [/^DIRECCION_TELEFONO$/, '+34 600 000 000'],
  [/^DIRECCION_LINEA1$/, 'Av. Generalitat Valenciana, 23'],
  [/^DIRECCION_LINEA2$/, '46940 Manises (Valencia)'],
  [/^MODALIDAD_LABEL$/, 'Combinaci&oacute;n simple'],
  // {{BLOQUE_*}}, {{SORTEOS_INLINE}} and {{DATOS_RELACIONADOS}} never reach this
  // dictionary — substituteTokens() intercepts and dispatches them before the
  // generic lookup, see buildBlockRow() / inlineSorteos() / inlineDatosRelacionados().
];

function genericValue(token) {
  for (const [re, val] of GENERIC) if (re.test(token)) return val;
  console.warn(`[build-previews] Aviso: {{${token}}} no tiene regla explícita ni de patrón; usando fallback genérico ("${token.toLowerCase().replace(/_/g, ' ')}").`);
  return token.toLowerCase().replace(/_/g, ' ');
}

// Explicit, auditable family classification for the handful of templates that
// use a token whose sample content depends on which game the email belongs to
// ({{BLOQUE_SORTEOS}}, {{SORTEOS_INLINE}}) but whose token *name* alone can't
// tell juegos-activos apart from lotería-nacional. Add a template here rather
// than inferring family from a filename prefix or the token name.
const TEMPLATE_FAMILY = {
  'abono-confirmacion': 'nacional',
  'abono-recepcion-solicitud': 'nacional',
  'nacional-abono-cancelacion': 'nacional',
  'juegos-recepcion-pedido': 'juegos',
  'juegos-cancelacion-pedido': 'juegos',
};

// {{BLOQUE_*}} table-row placeholders only — anything that isn't a run of
// <tr> block markup (inline text, generic paragraphs) has its own generator
// below (inlineSorteos, inlineDatosRelacionados) and must not come through here.
function buildBlockRow(token, name) {
  // Wording varies by token/family: Nacional/Navidad sells décimos, number-draw
  // games (Primitiva/Bonoloto/Euromillones) are apuestas — using "décimos" for
  // an apuestas block reads as wrong, so keep the two vocabularies separate.
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
  if (/^BLOQUE_APUESTAS/.test(token)) {
    return row('La Primitiva', '05 - 12 - 23 - 31 - 40 - 44', 'Combinaci&oacute;n simple') +
           row('Bonoloto', '02 - 09 - 18 - 27 - 35 - 41', 'Combinaci&oacute;n simple');
  }
  if (/^BLOQUE_NUMEROS/.test(token)) {
    // Filas de décimo (Lotería Nacional) — mismo formato "Combinación simple"
    // que ya usan las plantillas reales, pero con nombre de sorteo y número
    // de décimo (5 dígitos) en vez del combo de 6 números de Juegos Activos.
    return row('Loter&iacute;a de Navidad', '00542', 'Combinaci&oacute;n simple') +
           row('Sorteo del S&aacute;bado', '01187', 'Combinaci&oacute;n simple');
  }
  if (/^BLOQUE_SORTEOS/.test(token)) {
    const family = TEMPLATE_FAMILY[name];
    if (family === 'juegos') {
      return row('La Primitiva', '3 apuestas', 'Combinaci&oacute;n simple') +
             row('Bonoloto', '2 apuestas', 'Combinaci&oacute;n simple');
    }
    if (family === 'nacional') {
      return row('Sorteo del Jueves', 'Jueves 13/08/2026', '2 d&eacute;cimos') +
             row('Sorteo del S&aacute;bado', 'S&aacute;bado 15/08/2026', '1 d&eacute;cimo');
    }
    console.warn(`[build-previews] Aviso: {{${token}}} en "${name}" no está clasificado en TEMPLATE_FAMILY; usando marcador visible en vez de asumir una familia.`);
    return row('&#9888; Familia no clasificada', token, name);
  }
  console.warn(`[build-previews] Aviso: {{${token}}} en "${name}" no coincide con ninguna rama conocida de buildBlockRow(); usando marcador visible en vez de asumir contenido.`);
  return row('&#9888; Bloque no reconocido', token, name);
}

// {{SORTEOS_INLINE}} — plain inline text inside a single <td>, never a <tr> block.
function inlineSorteos(name) {
  const family = TEMPLATE_FAMILY[name];
  if (family === 'juegos') return 'La Primitiva, Bonoloto';
  if (family === 'nacional') return 'Sorteo del Jueves, Sorteo del S&aacute;bado';
  console.warn(`[build-previews] Aviso: {{SORTEOS_INLINE}} en "${name}" no está clasificado en TEMPLATE_FAMILY; usando marcador visible en vez de asumir una familia.`);
  return '&#9888; familia no clasificada';
}

// {{DATOS_RELACIONADOS}} — only used by the generic comunicacion-pedido
// template, which can be about any game or topic. Never introduce a game name.
function inlineDatosRelacionados() {
  return 'N&uacute;mero de pedido: J-20260809-001<br>Fecha: 09/08/2026';
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
function substituteTokens(strippedBase, overrides, name) {
  let out = strippedBase;
  const tokenRe = /\{\{([A-Z0-9_]+)\}\}/g;
  let match;
  const replacements = [];
  const seen = {}; // token -> count, so repeated tokens in one file can still vary if an override array is given
  while ((match = tokenRe.exec(strippedBase)) !== null) {
    const [full, token] = match;
    const idx = match.index;
    if (token === 'SORTEOS_INLINE') {
      replacements.push({ full, idx, value: inlineSorteos(name) });
      continue;
    }
    if (token === 'DATOS_RELACIONADOS') {
      replacements.push({ full, idx, value: inlineDatosRelacionados() });
      continue;
    }
    if (/^BLOQUE_/.test(token)) {
      replacements.push({ full, idx, value: buildBlockRow(token, name) });
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
  // Plantillas de Lotería Nacional (décimos): el nombre de sorteo genérico
  // ("La Primitiva") es de Juegos Activos y no aplica aquí — usar un sorteo
  // real de Lotería Nacional para que la muestra sea coherente con el resto
  // del contenido ("décimos", "Modalidad: Custodia/Mensajería", etc.).
  'nacional-confirmacion-pedido': { NOMBRE_SORTEO: 'Loter&iacute;a de Navidad' },
  'nacional-recepcion-solicitud': { NOMBRE_SORTEO: 'Loter&iacute;a de Navidad' },
  'nacional-escrutado-con-premio-custodia': { NOMBRE_SORTEO: 'Loter&iacute;a de Navidad' },
  'nacional-escrutado-con-premio-mensajeria': { NOMBRE_SORTEO: 'Loter&iacute;a de Navidad' },
  'nacional-escrutado-sin-premio-custodia': { NOMBRE_SORTEO: 'Loter&iacute;a de Navidad' },
  'nacional-escrutado-sin-premio-mensajeria': { NOMBRE_SORTEO: 'Loter&iacute;a de Navidad' },
  'nacional-cancelacion-pedido': { NOMBRE_JUEGO: 'Loter&iacute;a de Navidad' },
  'nacional-abono-recordatorio': { SORTEO: 'Loter&iacute;a de Navidad' },
  'nacional-solicitud-modificada': { NOMBRE_SORTEO_PRINCIPAL: 'Loter&iacute;a de Navidad' },
};

function buildPreview(name) {
  const basePath = path.join(TPL_DIR, `${name}.html`);
  const base = fs.readFileSync(basePath, 'utf8');

  let html = unwrapNotMso(stripMso(base));
  html = substituteTokens(html, OVERRIDES[name], name);
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
