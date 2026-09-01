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

// Remove the experimental native iOS startup-image declarations. On the
// physical iPhone they removed the long black launch surface but introduced
// a visible system -> PNG -> WebKit handoff flash. We prefer the native iOS
// launch surface and make the first web frame start from black instead.
const startMarker = '    <!-- IOS_STARTUP_IMAGES:BEGIN -->';
const endMarker = '    <!-- IOS_STARTUP_IMAGES:END -->';
const existingStartup = new RegExp(`${startMarker}[\\s\\S]*?${endMarker}\\n?`, 'm');
html = html.replace(existingStartup, '');

// Use the real isotipo as a public PNG so iOS decodes a normal file instead
// of scaling the old embedded data URL.
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
      /* Physical iPhone QA: native iOS black is smoother than the custom
         apple-touch-startup-image handoff. Match that native surface first,
         then ease into Manises blue before revealing the brand. */
      html.auth-route #auth-first-paint {
        background: #000000;
        transition: opacity 650ms cubic-bezier(.22,1,.36,1);
        animation: auth-startup-surface 420ms cubic-bezier(.22,1,.36,1) 80ms forwards;
      }
      @keyframes auth-startup-surface {
        from { background: #000000; }
        to { background: #0A4792; }
      }

      /* Keep the 48:60 source ratio and render it closer to native size so
         its raster edges remain clean on iPhone. */
      html.auth-route .auth-first-mark {
        width: 72px;
        height: 90px;
        opacity: 0;
        animation: auth-isotipo-enter 260ms cubic-bezier(.22,1,.36,1) 260ms forwards;
      }
      @keyframes auth-isotipo-enter {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      /* Slow the liquid fill so the loader reads as an intentional branded
         state instead of a flash. The original keyframes remain unchanged;
         only timing is overridden here. */
      html.auth-route .auth-first-mark-fill {
        animation-duration: 1300ms;
        animation-delay: 260ms;
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

console.log('Prepared native-black-to-Manises auth startup with the real isotipo asset.');
