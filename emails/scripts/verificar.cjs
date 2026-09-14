#!/usr/bin/env node
// Comprueba que las plantillas de correo cumplen las reglas que costaron
// encontrar. Correr después de tocar cualquier plantilla o asset:
//
//   node emails/scripts/verificar.cjs
//
// Sale con código 1 si algo falla, para poder encadenarlo.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const TPL = path.join(ROOT, 'templates', 'transaccional');
const SHARED = path.join(ROOT, 'templates', 'shared');
const ASSETS = path.join(ROOT, 'assets');

// INSIGNIA_DEL_MENSAJE es un marcador a propósito: _header.html es el esqueleto
// del que se parte para crear correos nuevos, no una plantilla que se envíe.
const MARCADOR_ESPERADO = 'INSIGNIA_DEL_MENSAJE.png';

const plantillas = fs.readdirSync(TPL).filter(f => f.endsWith('.html') && !f.includes('-preview'));
const previews  = fs.readdirSync(TPL).filter(f => f.endsWith('-preview.html'));
const shared    = fs.readdirSync(SHARED).filter(f => f.endsWith('.html'));
const assets    = new Set(fs.readdirSync(ASSETS));

const fallos = [];
const avisos = [];
const ok = m => console.log(`  ok   ${m}`);
const mal = m => { fallos.push(m); console.log(`  FALLA ${m}`); };

// 1 · Ningún .png con contenido SVG. Es lo que hacía invisibles los iconos en
//     Outlook de escritorio, que usa el motor de Word y no renderiza SVG.
{
  const malos = [...assets].filter(f => /\.png$/i.test(f) &&
    fs.readFileSync(path.join(ASSETS, f)).subarray(0, 4).toString('hex') !== '89504e47');
  malos.length ? mal(`${malos.length} ficheros .png sin contenido PNG: ${malos.join(', ')}`)
               : ok(`los ${[...assets].filter(f => /\.png$/i.test(f)).length} .png son PNG de verdad`);
}

// 2 · Ninguna insignia de cabecera como celda CSS. Deben ser una imagen
//     autocontenida: Outlook ignora border-radius y no soporta rgba().
{
  const malos = [];
  for (const f of [...plantillas, ...shared]) {
    const dir = plantillas.includes(f) ? TPL : SHARED;
    const s = fs.readFileSync(path.join(dir, f), 'utf8');
    if (/<td[^>]*rgba\(255,255,255,0\.15\)[^>]*border-radius:(?:1[5-9]|2\d)px/s.test(s)) malos.push(f);
  }
  malos.length ? mal(`insignias como celda CSS en: ${malos.join(', ')}`)
               : ok('ninguna insignia de cabecera depende de CSS');
}

// 3 · Todo lo que se referencia existe.
{
  const falta = new Set();
  for (const f of [...plantillas, ...shared]) {
    const dir = plantillas.includes(f) ? TPL : SHARED;
    const s = fs.readFileSync(path.join(dir, f), 'utf8');
    for (const m of s.matchAll(/emails\/([\w.-]+\.(?:png|jpg))/g)) {
      if (!assets.has(m[1])) falta.add(m[1]);
    }
  }
  falta.delete(MARCADOR_ESPERADO);
  falta.size ? mal(`imágenes referenciadas sin fichero: ${[...falta].join(', ')}`)
             : ok('todas las imágenes referenciadas existen en assets/');
}

// 4 · Una previsualización por plantilla, y sin imágenes por URL: deben ir
//     incrustadas para poder abrirlas sin CDN.
{
  const sinPrev = plantillas.filter(f => !previews.includes(f.replace('.html', '-preview.html')));
  const huerf   = previews.filter(f => !plantillas.includes(f.replace('-preview.html', '.html')));
  const conUrl  = previews.filter(f => /src="https:\/\/cdn/.test(fs.readFileSync(path.join(TPL, f), 'utf8')));
  if (sinPrev.length) mal(`plantillas sin previsualización: ${sinPrev.join(', ')}`);
  if (huerf.length)   mal(`previsualizaciones huérfanas: ${huerf.join(', ')}`);
  if (conUrl.length)  mal(`previsualizaciones con imágenes sin incrustar: ${conUrl.join(', ')}`);
  if (!sinPrev.length && !huerf.length && !conUrl.length)
    ok(`${plantillas.length} plantillas y ${previews.length} previsualizaciones, emparejadas y autocontenidas`);
}

// 5 · El bgcolor de respaldo debe ser el color ya compuesto. Outlook descarta
//     rgba() y pinta el bgcolor; si no coinciden, el elemento cambia de color.
{
  const velo = (hex, a) => '#' + [1, 3, 5].map(i =>
    Math.round(a * 255 + (1 - a) * parseInt(hex.substr(i, 2), 16))
      .toString(16).padStart(2, '0')).join('').toUpperCase();
  const malos = [];
  for (const f of plantillas) {
    const s = fs.readFileSync(path.join(TPL, f), 'utf8');
    const hero = s.match(/<td bgcolor="(#[0-9A-Fa-f]{6})"\s*\n\s*style="background-color:\1;\s*\n\s*background-image:linear-gradient/);
    if (!hero) continue;
    for (const m of s.matchAll(/<td[^>]*bgcolor="(#[0-9A-Fa-f]{6})"[^>]*style="[^"]*background-color:rgba\(255,255,255,([\d.]+)\)/gs)) {
      const esperado = velo(hero[1].toUpperCase(), parseFloat(m[2]));
      if (m[1].toUpperCase() !== esperado) malos.push(`${f}: ${m[1]} debería ser ${esperado}`);
    }
  }
  malos.length ? mal(`respaldos de color mal:\n         ${malos.join('\n         ')}`)
               : ok('los bgcolor de respaldo son el color compuesto correcto');
}

// 6 · El mapa de assets no debe traer SVG, o las previsualizaciones mentirían.
{
  const mapa = JSON.parse(fs.readFileSync(path.join(__dirname, 'asset-map.json'), 'utf8'));
  const svg = Object.entries(mapa).filter(([, v]) => typeof v === 'string' && v.slice(0, 40).includes('svg+xml'));
  svg.length ? mal(`${svg.length} entradas SVG en asset-map.json: ${svg.slice(0, 5).map(x => x[0]).join(', ')}`)
             : ok('asset-map.json no contiene SVG');
}

console.log();
if (fallos.length) { console.log(`${fallos.length} comprobación(es) fallan.`); process.exit(1); }
console.log('Todo correcto.');
