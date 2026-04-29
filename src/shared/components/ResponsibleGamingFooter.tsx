export function ResponsibleGamingFooter() {
  return (
    <div
      className="border-t border-slate-100 bg-slate-50/60 px-5 pb-5 pt-5"
      role="contentinfo"
      aria-label="Juego responsable"
    >
      <div className="mx-auto max-w-sm space-y-3.5">

        {/* Square regulatory seals: 18+ and RGIAJ */}
        <div className="flex items-center justify-center gap-5">
          <img
            src="/legal-assets/mas_18.png"
            alt="Prohibido menores de 18 años"
            className="h-7 w-auto object-contain"
            loading="lazy"
          />
          <img
            src="/legal-assets/autoprohibicion.png"
            alt="Registro General de Interdicciones de Acceso al Juego"
            className="h-7 w-auto object-contain"
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
        <div className="space-y-1 pt-0.5 text-center">
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
