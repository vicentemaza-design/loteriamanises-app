import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv, type Plugin} from 'vite';

/**
 * El critical first paint que inyecta scripts/prepare-ios-startup.mjs solo
 * sirve de algo si NADA bloquea el render por delante: una hoja de estilos
 * render-blocking retiene el primer frame del documento entero, de modo que
 * el <style> inline no llega a pintarse y el arranque se queda en la
 * superficie negra de iOS hasta que baja el bundle. Medido sobre el build
 * real (frames compuestos vía CDP screencast): con el <link> bloqueante el
 * azul de marca aparecia a los 184/299/2045 ms segun la latencia del CSS;
 * sin bloquear, a los ~40 ms y plano, ya independiente de esa latencia.
 *
 * El <link> con hash no existe hasta que Vite lo inyecta, asi que esto NO
 * puede vivir en prepare-ios-startup.mjs (corre antes de `vite build`).
 * transformIndexHtml en orden 'post' es el punto donde el HTML ya lleva los
 * tags generados.
 *
 * Se usa preload + swap en onload en vez de media="print": ambos dejan de
 * bloquear, pero preload conserva prioridad alta, de modo que el CSS se
 * sigue pidiendo de inmediato y recupera autoridad cuanto antes. <noscript>
 * mantiene el comportamiento clasico sin JS.
 */
function nonBlockingStylesheets(): Plugin {
  return {
    name: 'manises-non-blocking-stylesheets',
    enforce: 'post',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        return html.replace(/<link\b[^>]*\brel="stylesheet"[^>]*>/g, tag => {
          const href = tag.match(/\bhref="([^"]+)"/)?.[1];
          if (!href) return tag;
          const crossorigin = /\bcrossorigin\b/.test(tag) ? ' crossorigin' : '';
          // Compuerta anti-FOUC: al dejar de bloquear, React puede montar
          // ANTES de que el bundle se aplique (medido: #root con contenido a
          // los 153 ms, CSS aplicado a los 286 ms). En rutas auth lo tapa el
          // overlay #auth-first-paint, pero en una ruta privada (refresh o
          // deep link) se veria el arbol sin estilar. Ocultar SOLO #root
          // durante esa ventana no afecta al primer paint: el fondo de marca
          // lo pintan html/body, que siguen visibles. onerror la levanta
          // igualmente para no dejar la app invisible si el CSS falla.
          return (
            `<style id="manises-css-gate">html:not(.css-ready) #root{visibility:hidden}</style>` +
            `<link rel="preload" as="style"${crossorigin} href="${href}" ` +
            `onload="this.onload=null;this.rel='stylesheet';document.documentElement.classList.add('css-ready')" ` +
            `onerror="this.onerror=null;document.documentElement.classList.add('css-ready')">` +
            `<noscript><style>#root{visibility:visible!important}</style>` +
            `<link rel="stylesheet"${crossorigin} href="${href}"></noscript>`
          );
        });
      },
    },
  };
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss(), nonBlockingStylesheets()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    build: {
      // Temporary threshold while we optimize route/code splitting and heavy media assets.
      chunkSizeWarningLimit: 1500,
    },
  };
});
