export function ResponsibleGamingFooter() {
  return (
    <div
      className="border-t border-slate-100 bg-slate-50/60 px-5 pb-5 pt-5"
      role="contentinfo"
      aria-label="Juego responsable"
    >
      <div className="mx-auto max-w-sm space-y-3">

        {/* Combined legal logo: Juego Inteligente +18 + thawte */}
        <div className="flex justify-center px-2">
          <img
            src="/legal-assets/logo_manises_footer_combined.png"
            alt="Juego Inteligente, solo para mayores de 18 años y seguridad thawte"
            className="h-auto max-h-[42px] w-auto max-w-full object-contain"
            loading="lazy"
          />
        </div>

        {/* DGOJ horizontal logos: Juego Seguro and Juego Autorizado */}
        <div className="flex items-center justify-center gap-3">
          <img
            src="/legal-assets/juego_seguro.png"
            alt="Juego Seguro"
            className="h-[22px] w-auto object-contain"
            loading="lazy"
          />
          <img
            src="/legal-assets/juego_autorizado.jpg"
            alt="Juego Autorizado"
            className="h-[22px] w-auto object-contain"
            loading="lazy"
          />
        </div>

        {/* Legal copy */}
        <div className="space-y-1 pt-1 text-center">
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
            Juega con responsabilidad · Solo mayores de 18 años
          </p>
          <p className="text-[8px] font-medium leading-relaxed text-slate-400">
            Información de juego seguro · Consulta condiciones y límites
          </p>
        </div>

      </div>
    </div>
  );
}
