import { LogIn } from 'lucide-react';
import { RESPONSIBLE_GAMING_CONTENT } from '@/shared/data/responsible-gaming-content';

/**
 * Single source of truth for the "Juego responsable" document body. Rendered
 * by both the public (/legal/juego-responsable) and the authenticated
 * (/profile/legal/juego-responsable) page — each supplies its own header.
 * Same text as ResponsibleGamingResourcePage.tsx, shared via
 * responsible-gaming-content.ts.
 */
export function JuegoResponsableContent() {
  const sections = Object.values(RESPONSIBLE_GAMING_CONTENT);

  return (
    <div className="flex flex-col gap-4 p-4">
      <section className="rounded-[1.6rem] bg-manises-blue p-5 text-white shadow-lg">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/60">Compromiso de la administración</p>
        <h2 className="mt-2 text-xl font-black">Disfruta del juego como una actividad de ocio</h2>
        <p className="mt-2 text-sm font-semibold leading-relaxed text-white/75">
          Esta información está disponible para cualquier persona, sin necesidad de tener una cuenta.
        </p>
      </section>

      {sections.map((section) => (
        <div key={section.title} className="rounded-[1.45rem] border border-slate-100 bg-white p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-manises-blue">
              <section.icon className="h-4.5 w-4.5" />
            </span>
            <div>
              <p className="text-sm font-black text-manises-blue">{section.title}</p>
              <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-widest text-slate-400">{section.subtitle}</p>
            </div>
          </div>
          <div className="mt-3 space-y-2">
            {section.blocks.map((block) => (
              <p key={block} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 text-[12.5px] font-medium leading-relaxed text-slate-600">
                {block}
              </p>
            ))}
          </div>
        </div>
      ))}

      <div className="flex items-start gap-3 rounded-2xl border border-manises-blue/15 bg-manises-blue/5 px-4 py-4">
        <LogIn className="mt-0.5 h-4 w-4 shrink-0 text-manises-blue" />
        <p className="text-[12.5px] font-semibold leading-relaxed text-manises-blue/80">
          Para establecer tu límite de gasto mensual o activar la autoexclusión sobre tu propia cuenta, inicia sesión y entra en Perfil → Control de juego.
        </p>
      </div>
    </div>
  );
}
