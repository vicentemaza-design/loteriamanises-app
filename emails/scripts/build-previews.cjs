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
  // Split on purpose: {{ESTADO}} is a visible status word, {{TIPO_ESTADO}} is a
  // control key ("informacion"|"atencion"|"incidencia", see comunicacion-pedido's
  // own header comment) — the previous combined regex (`^ESTADO|TIPO_ESTADO$`)
  // was only anchored on its first alternative and fed both the same string.
  [/^ESTADO$/, 'Confirmado'],
  [/^TIPO_ESTADO$/, 'informacion'],
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

// Explicit per-template <tr> column layout for {{BLOQUE_NUMEROS*}}. The token
// name alone can't decide this: {{BLOQUE_NUMEROS}} itself needs a different
// shape in nacional-recepcion-solicitud (Sorteo/Número/Cantidad/Importe) than
// in nacional-cancelacion-pedido (Fecha+Sorteo/Número/Cantidad/Importe), and
// nacional-solicitud-modificada's ACEPTADOS/RECHAZADOS blocks have no Importe
// column at all. Each shape below is copied verbatim from that template's own
// column headers / "BE renderiza filas" example comment, verified per file.
const NUMEROS_ROW_SHAPE = {
  'nacional-recepcion-solicitud': 'sorteo-numero-cantidad-importe',
  'nacional-confirmacion-pedido': 'sorteo-numero-cantidad-importe',
  'nacional-cancelacion-pedido': 'fecha-sorteo-numero-cantidad-importe',
  'nacional-solicitud-modificada': 'fecha-sorteo-numero-cantidad',
};

// Two sample décimos per BLOQUE_NUMEROS* block, priced at a flat 25,00 €/décimo
// so any per-template IMPORTE_DECIMOS/TOTAL_PEDIDO override can add up correctly:
// 2 décimos (50,00 €) + 1 décimo (25,00 €) = 3 décimos / 75,00 €. A distinct
// second dataset covers BLOQUE_NUMEROS_RECHAZADOS so it doesn't show the exact
// same décimo numbers as the ACEPTADOS block in the same email.
const DECIMO_ROWS_DEFAULT = [
  { fecha: '11/12/2026', sorteo: 'Loter&iacute;a de Navidad', numero: '00542', cantidad: 2, importe: '50,00' },
  { fecha: '13/12/2026', sorteo: 'Sorteo del S&aacute;bado', numero: '01187', cantidad: 1, importe: '25,00' },
];
const DECIMO_ROWS_RECHAZADOS = [
  { fecha: '11/12/2026', sorteo: 'Loter&iacute;a de Navidad', numero: '03871', cantidad: 2, importe: '50,00' },
  { fecha: '13/12/2026', sorteo: 'Sorteo del S&aacute;bado', numero: '04216', cantidad: 1, importe: '25,00' },
];

function buildNumerosRow(token, name) {
  const shape = NUMEROS_ROW_SHAPE[name];
  if (!shape) {
    console.warn(`[build-previews] Aviso: {{${token}}} en "${name}" no está clasificado en NUMEROS_ROW_SHAPE; usando marcador visible en vez de asumir la estructura de columnas.`);
    return `<tr><td>&#9888; Shape no clasificado: ${token} en ${name}</td></tr>`;
  }
  const rows = /^BLOQUE_NUMEROS_RECHAZADOS/.test(token) ? DECIMO_ROWS_RECHAZADOS : DECIMO_ROWS_DEFAULT;
  return rows.map(d => {
    const cantidadLabel = `${d.cantidad} d&eacute;cimo${d.cantidad === 1 ? '' : 's'}`;
    if (shape === 'sorteo-numero-cantidad-importe') {
      return `
                    <tr style="border-bottom:1px solid #F3F4F6;">
                      <td style="padding:10px 16px;font-size:13px;color:#0D1B3D;">${d.sorteo}</td>
                      <td style="padding:10px 12px;font-size:14px;font-weight:700;color:#0D1B3D;text-align:center;">${d.numero}</td>
                      <td style="padding:10px 12px;font-size:13px;color:#64748B;text-align:center;">${cantidadLabel}</td>
                      <td style="padding:10px 16px;font-size:13px;font-weight:600;color:#0D1B3D;text-align:right;">${d.importe}&nbsp;&euro;</td>
                    </tr>`;
    }
    if (shape === 'fecha-sorteo-numero-cantidad-importe') {
      return `
                    <tr style="border-bottom:1px solid #F3F4F6;">
                      <td style="padding:11px 12px 11px 16px;vertical-align:top;">
                        <span style="display:block;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:11px;color:#64748B;">${d.fecha}</span>
                        <span style="display:block;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:12px;font-weight:600;color:#0D1B3D;">${d.sorteo}</span>
                      </td>
                      <td style="padding:11px 12px;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:16px;font-weight:700;color:#1E3A5F;text-align:center;vertical-align:middle;letter-spacing:0.02em;">${d.numero}</td>
                      <td style="padding:11px 12px;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:13px;font-weight:500;color:#334155;text-align:center;vertical-align:middle;">${cantidadLabel}</td>
                      <td style="padding:11px 16px 11px 12px;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:13px;font-weight:600;color:#0D1B3D;text-align:right;vertical-align:middle;">${d.importe}&nbsp;&euro;</td>
                    </tr>`;
    }
    // fecha-sorteo-numero-cantidad — no Importe column (nacional-solicitud-modificada)
    return `
                    <tr style="border-bottom:1px solid #F3F4F6;">
                      <td style="padding:12px 16px;font-size:12px;color:#4B5563;vertical-align:top;font-family:'Inter',Arial,Helvetica,sans-serif;">${d.fecha}<br/><span style="font-weight:600;color:#0D1B3D;">${d.sorteo}</span></td>
                      <td style="padding:12px 16px;font-size:18px;font-weight:700;color:#1E3A5F;text-align:center;letter-spacing:0.04em;vertical-align:middle;font-family:'Inter',Arial,Helvetica,sans-serif;">${d.numero}</td>
                      <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#0D1B3D;text-align:right;vertical-align:middle;font-family:'Inter',Arial,Helvetica,sans-serif;">${cantidadLabel}</td>
                    </tr>`;
  }).join('');
}

// {{BLOQUE_APUESTAS_PREMIADAS}} — juegos-escrutado only. Its table has 3 real
// columns (Apuesta / Categoría / Premio, see the file's own "BE: siempre
// incluir..." example comment), unlike plain {{BLOQUE_APUESTAS}}'s 2-cell
// card layout — reusing that would leave the Premio column empty, so this
// gets its own row markup copied verbatim from the template's example.
// Premio per row sums to 45,00 € to match the OVERRIDES IMPORTE_PREMIO total.
function buildApuestasPremiadasRow() {
  const row = (apuesta, combinacion, categoria, premio) => `
                    <tr style="border-bottom:1px solid #F3F4F6;">
                      <td style="padding:10px 16px;font-size:13px;font-weight:600;color:#0D1B3D;">${apuesta}<br/><span style="font-size:11px;font-weight:400;color:#94A3B8;">${combinacion}</span></td>
                      <td style="padding:10px 12px;font-size:12px;color:#64748B;text-align:center;">${categoria}</td>
                      <td style="padding:10px 16px;font-size:14px;font-weight:700;color:#16A34A;text-align:right;">${premio}</td>
                    </tr>`;
  return row('La Primitiva', '05 - 12 - 23 - 31 - 40 - 44', '5 aciertos', '25,00&nbsp;&euro;') +
         row('Bonoloto', '02 - 09 - 18 - 27 - 35 - 41', '3 aciertos', '20,00&nbsp;&euro;');
}

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
  if (/^BLOQUE_APUESTAS_PREMIADAS/.test(token)) {
    return buildApuestasPremiadasRow();
  }
  if (/^BLOQUE_APUESTAS/.test(token)) {
    return row('La Primitiva', '05 - 12 - 23 - 31 - 40 - 44', 'Combinaci&oacute;n simple') +
           row('Bonoloto', '02 - 09 - 18 - 27 - 35 - 41', 'Combinaci&oacute;n simple');
  }
  if (/^BLOQUE_NUMEROS/.test(token)) {
    // Décimos de Lotería Nacional: cada plantilla tiene su propia estructura de
    // columnas real (ver NUMEROS_ROW_SHAPE) — "Combinación simple" no aplica a
    // décimos, así que estas filas no reutilizan la row() de dos celdas de
    // arriba (pensada para el layout de tarjeta de BLOQUE_APUESTAS).
    return buildNumerosRow(token, name);
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
  // MODALIDAD_LABEL: el genérico ("Combinación simple") es terminología de
  // apuesta de Juegos Activos y estos 5 templates son los únicos que usan
  // este token — todos Lotería Nacional, así que necesitan Custodia/Mensajería.
  // IMPORTE_DECIMOS/GASTOS_MENSAJERIA/TOTAL_PEDIDO: coherentes con las filas
  // generadas por buildNumerosRow() (2 décimos + 1 décimo = 75,00 € + 5,00 €
  // de envío = 80,00 € total), no el mismo "50,00" repetido en los tres.
  // Estos dos templates NO añaden &euro; en su propio markup (a diferencia de
  // nacional-cancelacion-pedido, que sí lo hace) — el símbolo va en el valor.
  'nacional-confirmacion-pedido': {
    NOMBRE_SORTEO: 'Loter&iacute;a de Navidad',
    MODALIDAD_LABEL: 'Custodia (d&eacute;cimo digital)',
    IMPORTE_DECIMOS: '75,00&nbsp;&euro;',
    GASTOS_MENSAJERIA: '5,00&nbsp;&euro;',
    TOTAL_PEDIDO: '80,00&nbsp;&euro;',
  },
  'nacional-recepcion-solicitud': {
    NOMBRE_SORTEO: 'Loter&iacute;a de Navidad',
    MODALIDAD_LABEL: 'Custodia (d&eacute;cimo digital)',
    IMPORTE_DECIMOS: '75,00&nbsp;&euro;',
    GASTOS_MENSAJERIA: '5,00&nbsp;&euro;',
    TOTAL_PEDIDO: '80,00&nbsp;&euro;',
  },
  // Esta plantilla SÍ añade &euro; en su propio markup — el valor se queda sin
  // símbolo para no duplicarlo ("50,00 € €").
  'nacional-cancelacion-pedido': {
    NOMBRE_JUEGO: 'Loter&iacute;a de Navidad',
    MODALIDAD_LABEL: 'Custodia (d&eacute;cimo digital)',
    IMPORTE_DECIMOS: '75,00',
    GASTOS_MENSAJERIA: '5,00',
    TOTAL_PEDIDO: '80,00',
  },
  // CANTIDAD_DECIMOS × PREMIO_POR_DECIMO = IMPORTE_PREMIO_TOTAL (2 × 25,00 = 50,00),
  // no los tres a "50,00" como antes. SALDO_DISPONIBLE es un saldo de cuenta
  // independiente del premio — se evita repetir el mismo "50,00" ahí también.
  'nacional-escrutado-con-premio-custodia': {
    NOMBRE_SORTEO: 'Loter&iacute;a de Navidad',
    CANTIDAD_DECIMOS: '2',
    PREMIO_POR_DECIMO: '25,00',
    IMPORTE_PREMIO_TOTAL: '50,00',
    SALDO_DISPONIBLE: '120,00',
  },
  'nacional-escrutado-con-premio-mensajeria': {
    NOMBRE_SORTEO: 'Loter&iacute;a de Navidad',
    CANTIDAD_DECIMOS: '2',
    PREMIO_POR_DECIMO: '25,00',
    IMPORTE_PREMIO_TOTAL: '50,00',
  },
  'nacional-escrutado-sin-premio-custodia': { NOMBRE_SORTEO: 'Loter&iacute;a de Navidad' },
  // Variante mensajería: MODALIDAD_LABEL debe decir "Mensajería", no el
  // genérico "Custodia" usado en el resto de templates Nacional.
  'nacional-escrutado-sin-premio-mensajeria': {
    NOMBRE_SORTEO: 'Loter&iacute;a de Navidad',
    MODALIDAD_LABEL: 'Mensajer&iacute;a (env&iacute;o a domicilio)',
  },
  // CANTIDAD × IMPORTE_UNITARIO = IMPORTE_TOTAL (2 × 25,00 = 50,00).
  'nacional-abono-recordatorio': {
    SORTEO: 'Loter&iacute;a de Navidad',
    CANTIDAD: '2',
    IMPORTE_UNITARIO: '25,00',
    IMPORTE_TOTAL: '50,00',
  },
  // BLOQUE_NUMEROS_RECHAZADOS usa un dataset de décimos distinto al de
  // ACEPTADOS (ver DECIMO_ROWS_RECHAZADOS) — 3 décimos rechazados × 25,00 €
  // = 75,00 € a devolver, no el "50,00" genérico. Esta plantilla no añade
  // &euro; en su propio markup, así que va incluido en el valor.
  'nacional-solicitud-modificada': {
    NOMBRE_SORTEO_PRINCIPAL: 'Loter&iacute;a de Navidad',
    MODALIDAD_LABEL: 'Custodia (d&eacute;cimo digital)',
    IMPORTE_NO_INCLUIDO: '75,00&nbsp;&euro;',
  },
  // NUM_APUESTAS × IMPORTE_POR_APUESTA = IMPORTE (2 × 5,00 = 10,00), valores
  // realistas para Juegos Activos en vez de "50,00" repetido en los tres tokens.
  'juegos-abono-confirmacion': { NUM_APUESTAS: '2', IMPORTE_POR_APUESTA: '5,00', IMPORTE: '10,00' },
  'juegos-abono-cancelacion': { NUM_APUESTAS: '2', IMPORTE_POR_APUESTA: '5,00', IMPORTE: '10,00' },
  'juegos-abono-renovacion-fallida': {
    NUM_APUESTAS: '2',
    IMPORTE_POR_APUESTA: '5,00',
    IMPORTE: '10,00',
    // El motivo genérico ("Baja solicitada por el usuario") no encaja con un
    // fallo de renovación automática recuperable antes de {{FECHA_LIMITE}}.
    MOTIVO: 'No se ha podido procesar el m&eacute;todo de pago',
  },
  // Mismo patrón NUM_APUESTAS/IMPORTE que el grupo de abonos, para las otras
  // plantillas de Juegos Activos que muestran "Apuestas" e "Importe" juntos.
  // Ninguna de estas tres añade &euro; en su propio markup — va en el valor.
  'juegos-cancelacion-pedido': { NUM_APUESTAS: '2', IMPORTE_CANCELADO: '10,00&nbsp;&euro;' },
  'juegos-confirmacion-pedido': { NUM_SORTEOS: '2', NUM_APUESTAS: '2', IMPORTE_TOTAL: '10,00&nbsp;&euro;' },
  // IMPORTE_PREMIO = suma de las 2 filas de BLOQUE_APUESTAS_PREMIADAS
  // (25,00 € + 20,00 € = 45,00 €).
  'juegos-escrutado': { NUM_APUESTAS: '2', IMPORTE_JUGADO: '10,00&nbsp;&euro;', IMPORTE_PREMIO: '45,00&nbsp;&euro;' },
  // MOTIVO_RECHAZO: el genérico de cancelación ("Baja solicitada por el
  // usuario") no tiene sentido como motivo de un RECHAZO de una solicitud
  // nueva de abono — no reutilizar el mismo texto entre ambos flujos.
  'abono-rechazo': { MOTIVO_RECHAZO: 'El n&uacute;mero solicitado ya no est&aacute; disponible' },
  // El email dice literalmente "No hemos podido realizar tu recarga" — mostrar
  // ESTADO: Confirmado ahí es una contradicción directa.
  'recarga-fallida': { ESTADO: 'Fallida' },
  // Esta plantilla no añade &euro; en su propio markup (su propio comentario
  // interno documenta el formato esperado como "50,00 €", símbolo incluido).
  'recarga-transferencia': { IMPORTE: '50,00&nbsp;&euro;' },
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
