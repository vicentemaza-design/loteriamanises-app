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

mkdirSync(startupDir, { recursive: true });
copyFileSync(isotipoSourcePath, isotipoPublicPath);

let html = readFileSync(indexPath, 'utf8');

// Remove the experimental native iOS startup-image declarations. Physical
// iPhone QA showed that the custom PNG introduced a visible handoff flash.
// We intentionally keep the native iOS launch surface instead.
const startMarker = '    <!-- IOS_STARTUP_IMAGES:BEGIN -->';
const endMarker = '    <!-- IOS_STARTUP_IMAGES:END -->';
const existingStartup = new RegExp(`${startMarker}[\\s\\S]*?${endMarker}\\n?`, 'm');
html = html.replace(existingStartup, '');

// Use the real isotipo as a public PNG so iOS decodes a normal file instead
// of the old embedded data URL.
html = html.replace(
  /<img class="auth-first-mark-base" src="(?:data:image\/png;base64,[^"]+|\/startup\/manises-isotipo\.png)" alt="" \/>/,
  '<img class="auth-first-mark-base" src="/startup/manises-isotipo.png" alt="" />'
);
html = html.replace(
  /<img class="auth-first-mark-fill" src="(?:data:image\/png;base64,[^"]+|\/startup\/manises-isotipo\.png)" alt="" \/>/,
  '<img class="auth-first-mark-fill" src="/startup/manises-isotipo.png" alt="" />'
);

const continuityStart = '    <!-- AUTH_STARTUP_CONTINUITY:BEGIN -->';
const continuityEnd = '    <!-- AUTH_STARTUP_CONTINUITY:END -->';
const continuityExisting = new RegExp(`${continuityStart}[\\s\\S]*?${continuityEnd}\\n?`, 'm');
html = html.replace(continuityExisting, '');

const continuityBlock = `${continuityStart}
    <style>
      /* Match the native iOS black surface first, then move into the Manises
         blue deliberately. This avoids trying to hide the system handoff. */
      html.auth-route #auth-first-paint {
        background: #000000;
        transition: opacity 780ms cubic-bezier(.22,1,.36,1);
        animation: auth-startup-surface 720ms cubic-bezier(.22,1,.36,1) 120ms forwards;
      }
      @keyframes auth-startup-surface {
        from { background: #000000; }
        to { background: #0A4792; }
      }

      /* Source asset is exactly 48x60 px. Until a vector version is supplied,
         render it 1:1 with no CSS upscaling so its raster edges stay intact. */
      html.auth-route .auth-first-mark {
        width: 48px;
        height: 60px;
        opacity: 0;
        animation: auth-isotipo-enter 320ms cubic-bezier(.22,1,.36,1) 760ms forwards;
      }
      @keyframes auth-isotipo-enter {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      /* Let the blue surface settle before the liquid fill begins. */
      html.auth-route .auth-first-mark-fill {
        animation-duration: 1350ms;
        animation-delay: 760ms;
        animation-timing-function: cubic-bezier(.32,.02,.18,1);
      }

      @media (prefers-reduced-motion: reduce) {
        html.auth-route #auth-first-paint {
          background: #0A4792;
          animation: none;
          transition: none;
        }
        html.auth-route .auth-first-mark {
          opacity: 1;
          animation: none;
        }
        html.auth-route .auth-first-mark-fill {
          animation: none;
        }
      }
    </style>
${continuityEnd}`;

html = html.replace('  </head>', `${continuityBlock}\n  </head>`);
writeFileSync(indexPath, html);

console.log('Prepared native iOS launch continuity with the isotipo at its native 48x60 scale.');
