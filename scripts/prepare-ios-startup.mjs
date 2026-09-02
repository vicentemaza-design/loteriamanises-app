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

const startMarker = '    <!-- IOS_STARTUP_IMAGES:BEGIN -->';
const endMarker = '    <!-- IOS_STARTUP_IMAGES:END -->';
const existingStartup = new RegExp(`${startMarker}[\\s\\S]*?${endMarker}\\n?`, 'm');
html = html.replace(existingStartup, '');

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

const continuityStart = '    <!-- AUTH_STARTUP_CONTINUITY:BEGIN -->';
const continuityEnd = '    <!-- AUTH_STARTUP_CONTINUITY:END -->';
const continuityExisting = new RegExp(`${continuityStart}[\\s\\S]*?${continuityEnd}\\n?`, 'm');
html = html.replace(continuityExisting, '');

const continuityBlock = `${continuityStart}
    <style>
      /* Physical QA showed the absolute 100dvh overlay could settle in pieces
         while iOS was still resolving the standalone viewport. During startup
         this surface is now fixed to the visual viewport and never participates
         in Auth document flow. Login scrolling is unaffected because the node
         is removed at handoff. */
      html.auth-route #auth-first-paint {
        position: fixed !important;
        inset: 0 !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: auto !important;
        height: auto !important;
        min-height: 0 !important;
        overflow: hidden;
        background: #000000;
        transition: opacity 780ms cubic-bezier(.22,1,.36,1);
        transform: translateZ(0);
        backface-visibility: hidden;
      }

      /* The blue loader is a single full-surface layer that fades ON over the
         stable black web frame. We no longer fade black OFF to reveal another
         layout layer underneath, which removes the partial/split transition
         seen in the 09:21 physical recording. */
      html.auth-route #auth-first-paint::before {
        content: '';
        position: absolute;
        inset: 0;
        z-index: 0;
        background: #0A4792;
        opacity: 0;
        transition: opacity 560ms cubic-bezier(.22,1,.36,1);
        pointer-events: none;
        will-change: opacity;
        transform: translateZ(0);
      }
      html.auth-route #auth-first-paint.is-webkit-painted::before {
        opacity: 1;
      }

      /* The isotipo is not faded. Its first visible frame is fully white and
         appears only after the blue surface has finished settling. */
      html.auth-route .auth-first-mark {
        width: 48px;
        height: 60px;
        z-index: 1;
        opacity: 0;
      }
      html.auth-route #auth-first-paint.is-loader-ready .auth-first-mark {
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
        will-change: clip-path;
      }
      html.auth-route #auth-first-paint.is-loader-ready .auth-first-mark::after {
        animation: auth-isotipo-liquid-fill 1350ms cubic-bezier(.32,.02,.18,1) forwards;
      }

      html.auth-route .auth-first-brand-name {
        position: absolute;
        left: 50%;
        bottom: calc(env(safe-area-inset-bottom, 0px) + 36px);
        z-index: 1;
        transform: translateX(-50%);
        margin: 0;
        color: rgba(255,255,255,.60);
        font-family: inherit;
        font-size: 17px;
        font-weight: 500;
        line-height: 1.2;
        letter-spacing: .02em;
        white-space: nowrap;
        opacity: 0;
        transition: opacity 240ms cubic-bezier(.22,1,.36,1);
      }
      html.auth-route #auth-first-paint.is-loader-ready .auth-first-brand-name {
        opacity: 1;
      }

      @media (prefers-reduced-motion: reduce) {
        html.auth-route #auth-first-paint::before {
          opacity: 1;
          transition: none;
        }
        html.auth-route .auth-first-mark,
        html.auth-route .auth-first-brand-name {
          opacity: 1;
        }
        html.auth-route .auth-first-mark::after {
          animation: none;
          clip-path: polygon(0 0,16% 0,33% 0,50% 0,66% 0,83% 0,100% 0,100% 100%,0 100%);
        }
      }
    </style>
${continuityEnd}`;

html = html.replace('  </head>', `${continuityBlock}\n  </head>`);

const triggerStart = '    <!-- AUTH_STARTUP_TRIGGER:BEGIN -->';
const triggerEnd = '    <!-- AUTH_STARTUP_TRIGGER:END -->';
const triggerExisting = new RegExp(`${triggerStart}[\\s\\S]*?${triggerEnd}\\n?`, 'm');
html = html.replace(triggerExisting, '');

const triggerBlock = `${triggerStart}
    <script>
      (function () {
        var firstPaint = document.getElementById('auth-first-paint');
        if (!firstPaint || !document.documentElement.classList.contains('auth-route')) return;

        function beginWebHandoff() {
          firstPaint.classList.add('is-webkit-painted');
          window.setTimeout(function () {
            firstPaint.classList.add('is-loader-ready');
          }, 650);
        }

        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            window.setTimeout(beginWebHandoff, 120);
          });
        });
      })();
    </script>
${triggerEnd}`;

html = html.replace('    <div id="root"></div>', `${triggerBlock}\n    <div id="root"></div>`);
writeFileSync(indexPath, html);

console.log('Prepared viewport-stable black-to-blue startup while preserving the approved loader-to-Login handoff.');
