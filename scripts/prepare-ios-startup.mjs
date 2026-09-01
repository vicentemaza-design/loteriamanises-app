import { deflateSync } from 'node:zlib';
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const publicDir = join(root, 'public');
const startupDir = join(publicDir, 'startup');
const indexPath = join(root, 'index.html');
const isotipoSourcePath = join(root, 'src', 'assets', 'brand', 'manises-isotipo.png');
const isotipoPublicPath = join(startupDir, 'manises-isotipo.png');
const BACKGROUND = [0x0a, 0x47, 0x92, 0xff];

const devices = [
  { cssWidth: 440, cssHeight: 956, ratio: 3, width: 1320, height: 2868 },
  { cssWidth: 420, cssHeight: 912, ratio: 3, width: 1260, height: 2736 },
  { cssWidth: 430, cssHeight: 932, ratio: 3, width: 1290, height: 2796 },
  { cssWidth: 402, cssHeight: 874, ratio: 3, width: 1206, height: 2622 },
  { cssWidth: 393, cssHeight: 852, ratio: 3, width: 1179, height: 2556 },
  { cssWidth: 428, cssHeight: 926, ratio: 3, width: 1284, height: 2778 },
  { cssWidth: 414, cssHeight: 896, ratio: 3, width: 1242, height: 2688 },
  { cssWidth: 414, cssHeight: 896, ratio: 2, width: 828, height: 1792 },
  { cssWidth: 390, cssHeight: 844, ratio: 3, width: 1170, height: 2532 },
  { cssWidth: 375, cssHeight: 812, ratio: 3, width: 1125, height: 2436 },
  { cssWidth: 360, cssHeight: 780, ratio: 3, width: 1080, height: 2340 },
  { cssWidth: 375, cssHeight: 667, ratio: 2, width: 750, height: 1334 },
];

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type, 'ascii');
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function createSolidPng(width, height) {
  const rowSize = width * 4 + 1;
  const raw = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y += 1) {
    const rowStart = y * rowSize;
    raw[rowStart] = 0;
    for (let x = 0; x < width; x += 1) {
      const offset = rowStart + 1 + x * 4;
      raw[offset] = BACKGROUND[0];
      raw[offset + 1] = BACKGROUND[1];
      raw[offset + 2] = BACKGROUND[2];
      raw[offset + 3] = BACKGROUND[3];
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

mkdirSync(startupDir, { recursive: true });
copyFileSync(isotipoSourcePath, isotipoPublicPath);

for (const device of devices) {
  const filename = `apple-launch-${device.width}x${device.height}.png`;
  writeFileSync(join(startupDir, filename), createSolidPng(device.width, device.height));
}

const startMarker = '    <!-- IOS_STARTUP_IMAGES:BEGIN -->';
const endMarker = '    <!-- IOS_STARTUP_IMAGES:END -->';
const links = devices
  .map((device) => {
    const filename = `apple-launch-${device.width}x${device.height}.png`;
    return `    <link rel="apple-touch-startup-image" href="/startup/${filename}" media="screen and (device-width: ${device.cssWidth}px) and (device-height: ${device.cssHeight}px) and (-webkit-device-pixel-ratio: ${device.ratio}) and (orientation: portrait)" />`;
  })
  .join('\n');
const block = `${startMarker}\n${links}\n${endMarker}`;

let html = readFileSync(indexPath, 'utf8');
const existing = new RegExp(`${startMarker}[\\s\\S]*?${endMarker}\\n?`, 'm');
html = html.replace(existing, '');

const anchor = '    <meta name="apple-mobile-web-app-title" content="Lotería Manises" />';
if (!html.includes(anchor)) {
  throw new Error('Could not find apple-mobile-web-app-title anchor in index.html');
}
html = html.replace(anchor, `${anchor}\n${block}`);

// Keep the native launch surface and the very first web frame visually identical:
// both are plain #0A4792. The real isotipo then enters softly after WebKit owns
// the frame, avoiding a hard PNG -> loader composition change.
html = html.replace(
  /<img class="auth-first-mark-base" src="data:image\/png;base64,[^"]+" alt="" \/>/,
  '<img class="auth-first-mark-base" src="/startup/manises-isotipo.png" alt="" />'
);
html = html.replace(
  /<img class="auth-first-mark-fill" src="data:image\/png;base64,[^"]+" alt="" \/>/,
  '<img class="auth-first-mark-fill" src="/startup/manises-isotipo.png" alt="" />'
);

const continuityStart = '    <!-- AUTH_STARTUP_CONTINUITY:BEGIN -->';
const continuityEnd = '    <!-- AUTH_STARTUP_CONTINUITY:END -->';
const continuityExisting = new RegExp(`${continuityStart}[\\s\\S]*?${continuityEnd}\\n?`, 'm');
html = html.replace(continuityExisting, '');

const continuityBlock = `${continuityStart}
    <style>
      /* The startup PNG is intentionally plain blue. Once the HTML frame is
         active, reveal the same Manises isotipo used by the app as a real
         public PNG instead of a data URL. This keeps cold-start decoding
         deterministic on iOS and avoids the broken/tiny placeholder seen
         on device. */
      html.auth-route .auth-first-mark {
        width: 96px;
        height: 120px;
        opacity: 0;
        animation: auth-isotipo-enter 140ms cubic-bezier(.22,1,.36,1) 40ms forwards;
      }
      @keyframes auth-isotipo-enter {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @media (prefers-reduced-motion: reduce) {
        html.auth-route .auth-first-mark {
          opacity: 1;
          animation: none;
        }
      }
    </style>
${continuityEnd}`;

html = html.replace('  </head>', `${continuityBlock}\n  </head>`);
writeFileSync(indexPath, html);

console.log(`Prepared ${devices.length} iOS portrait startup images using #0A4792 and a deterministic public isotipo asset.`);
