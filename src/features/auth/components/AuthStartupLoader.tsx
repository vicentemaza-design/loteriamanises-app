/** Overlay de arranque puramente presentacional (sin lógica de negocio):
 *  fondo azul corporativo + logo, ambos estáticos. Lo muestra AuthScreenShell
 *  mientras prepara su imagen de fondo. */
export function AuthStartupLoader() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-[#0A4792]">
      <img
        src="/assets/branding/logo-white.png"
        alt="Lotería Manises"
        className="h-14 w-auto max-w-[200px]"
      />
    </div>
  );
}
