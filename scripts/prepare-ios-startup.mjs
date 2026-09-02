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

// Remove obsolete native startup-image experiment blocks.
const startMarker = '    <!-- IOS_STARTUP_IMAGES:BEGIN -->';
const endMarker = '    <!-- IOS_STARTUP_IMAGES:END -->';
const existingStartup = new RegExp(`${startMarker}[\\s\\S]*?${endMarker}\\n?`, 'm');
html = html.replace(existingStartup, '');

// Critical first paint: this must exist in the HTML itself, before Vite's
// render-blocking stylesheet, so the first composable web frame already has
// the Manises blue background. It deliberately does not depend on JS,
// auth-route detection, React, or the generated CSS bundle.
const criticalStart = '    <!-- AUTH_CRITICAL_FIRST_PAINT:BEGIN -->';
const criticalEnd = '    <!-- AUTH_CRITICAL_FIRST_PAINT:END -->';
const criticalExisting = new RegExp(`${criticalStart}[\\s\\S]*?${criticalEnd}\\n?`, 'm');
html = html.replace(criticalExisting, '');

const criticalBlock = `${criticalStart}
    <style id="auth-critical-first-paint">
      html,
      body {
        margin: 0;
        background: #0A4792;
      }
    </style>
${criticalEnd}`;

html = html.replace(
  '    <meta charset="UTF-8" />',
  `    <meta charset="UTF-8" />\n${criticalBlock}`
);

// Use the real isotipo as a public PNG and remove the obsolete second raster
// layer. The blue liquid fill is rendered with the same PNG as an alpha mask.
html = html.replace(
  /<img class="auth-first-mark-base" src="(?:data:image\/png;base64,[^"]+|\/startup\/manises-isotipo\.png)" alt="" \/>/,
  '<img class="auth-first-mark-base" src="/startup/manises-isotipo.png" alt="" />'
);
html = html.replace(
  /\s*<img class="auth-first-mark-fill" src="(?:data:image\/png;base64,[^"]+|\/startup\/manises-isotipo\.png)" alt="" \/>/,
  ''
);

if (!html.includes('auth-first-brand-name')) {
  html = html.replace(
    '      </div>\n    </div>\n    <div id="root"></div>',
    '      </div>\n      <div class="auth-first-brand-name">Lotería Manises</div>\n    </div>\n    <div id="root"></div>'
  );
}

// Remove every previous black-to-blue timing experiment. The web document now
// starts blue synchronously via the critical inline CSS above. The loader keeps
// only its branded state and the already-approved handoff to Login.
const continuityStart = '    <!-- AUTH_STARTUP_CONTINUITY:BEGIN -->';
const continuityEnd = '    <!-- AUTH_STARTUP_CONTINUITY:END -->';
const continuityExisting = new RegExp(`${continuityStart}[\\s\\S]*?${continuityEnd}\\n?`, 'm');
html = html.replace(continuityExisting, '');

const continuityBlock = `${continuityStart}
    <style>
      html.auth-route #auth-first-paint {
        position: fixed !important;
        inset: 0 !important;
        width: auto !important;
        height: auto !important;
        min-height: 0 !important;
        overflow: hidden;
        background: #0A4792 !important;
        transition: opacity 780ms cubic-bezier(.22,1,.36,1);
      }

      html.auth-route .auth-first-mark {
        width: 48px;
        height: 60px;
        opacity: 1;
      }
      html.auth-route .auth-first-mark-base {
        filter: brightness(0) invert(1) !important;
      }

      html.auth-route .auth-first-mark::after {
        content: '';
        position: absolute;
        inset: 0;
        width: 48px;
        height: 60px;
        background: #9DB5D3;
        -webkit-mask: url('/startup/manises-isotipo.png') center / 48px 60px no-repeat;
        mask: url('/startup/manises-isotipo.png') center / 48px 60px no-repeat;
        clip-path: polygon(0 100%,16% 100%,33% 100%,50% 100%,66% 100%,83% 100%,100% 100%,100% 100%,0 100%);
        animation: auth-isotipo-liquid-fill 1350ms cubic-bezier(.32,.02,.18,1) 120ms forwards;
        will-change: clip-path;
      }

      html.auth-route .auth-first-brand-name {
        position: absolute;
        left: 50%;
        bottom: calc(env(safe-area-inset-bottom, 0px) + 36px);
        transform: translateX(-50%);
        margin: 0;
        color: rgba(255,255,255,.60);
        font-family: inherit;
        font-size: 17px;
        font-weight: 500;
        line-height: 1.2;
        letter-spacing: .02em;
        white-space: nowrap;
        opacity: 1;
      }

      @media (prefers-reduced-motion: reduce) {
        html.auth-route #auth-first-paint {
          transition: none;
        }
        html.auth-route .auth-first-mark::after {
          animation: none;
          clip-path: polygon(0 0,16% 0,33% 0,50% 0,66% 0,83% 0,100% 0,100% 100%,0 100%);
        }
      }
    </style>
${continuityEnd}`;

html = html.replace('  </head>', `${continuityBlock}\n  </head>`);

// Remove the obsolete rAF/timeout trigger used by the black-to-blue experiment.
const triggerStart = '    <!-- AUTH_STARTUP_TRIGGER:BEGIN -->';
const triggerEnd = '    <!-- AUTH_STARTUP_TRIGGER:END -->';
const triggerExisting = new RegExp(`${triggerStart}[\\s\\S]*?${triggerEnd}\\n?`, 'm');
html = html.replace(triggerExisting, '');

writeFileSync(indexPath, html);

console.log('Prepared inline critical Manises-blue first paint and preserved loader-to-Login handoff.');
