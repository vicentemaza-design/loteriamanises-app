import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Fingerprint, ShieldCheck, ChevronLeft, ScanFace, Info, CheckCircle2, Loader2 } from 'lucide-react';
import { ProfileSubHeader } from '../components/ProfileSubHeader';
import { Button } from '@/shared/ui/Button';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { PremiumTouchInteraction } from '@/shared/components/PremiumTouchInteraction';

export function BiometricsPage() {
  const navigate = useNavigate();

  // Cargar estado de biometría
  const [isEnabled, setIsEnabled] = useState(() => {
    return localStorage.getItem('app_biometrics_enabled') === 'true';
  });

  const [isVerifying, setIsVerifying] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  const handleToggle = () => {
    if (isEnabled) {
      // Apagar es directo
      setIsEnabled(false);
      localStorage.setItem('app_biometrics_enabled', 'false');
      toast.info('Acceso biométrico desactivado');
    } else {
      // Encender requiere simular verificación del sistema
      setShowPrompt(true);
    }
  };

  const simulateSystemAuth = () => {
    setIsVerifying(true);
    // Simular 1.5s de llamada al OS/hardware
    setTimeout(() => {
      setIsVerifying(false);
      setShowPrompt(false);
      setIsEnabled(true);
      localStorage.setItem('app_biometrics_enabled', 'true');
      toast.success('¡Acceso biométrico activado con éxito! 🚀');
    }, 1800);
  };

  return (
    <div className="flex min-h-full flex-col bg-background pb-12">
      <ProfileSubHeader title="Biometría" subtitle="Acceso y confirmaciones rápidas" />

      <div className="p-5 flex flex-col gap-6 max-w-md mx-auto w-full">
        
        {/* Ilusación / Icono Premium central */}
        <section className="flex flex-col items-center gap-4 text-center py-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-[2rem] bg-indigo-50 border border-indigo-100 flex items-center justify-center shadow-sm">
              <Fingerprint className="w-12 h-12 text-indigo-600" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shadow-md">
              <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" />
            </div>
          </div>
          <div>
            <h3 className="text-base font-black text-manises-blue">Seguridad al instante</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-[280px] leading-relaxed mx-auto">
              Utiliza Face ID o huella dactilar para acceder a tu perfil y confirmar tus operaciones sin introducir tu contraseña.
            </p>
          </div>
        </section>

        {/* Panel de control de la biometría */}
        <section className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-sm font-bold text-manises-blue">Face ID / Huella Dactilar</p>
              <p className="text-[11px] text-muted-foreground font-medium">Permite el acceso rápido a la aplicación</p>
            </div>
            <button
              onClick={handleToggle}
              className={`w-12 h-6 rounded-full transition-colors relative outline-none border-none ${
                isEnabled ? 'bg-indigo-600' : 'bg-slate-200'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${
                  isEnabled ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>

          <div className="h-px bg-slate-100" />

          <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            <Info className="w-4.5 h-4.5 text-indigo-600 shrink-0 mt-0.5" />
            <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">
              Esta función está disponible para dispositivos compatibles con tecnologías biométricas. Las credenciales biométricas se almacenan localmente en el llavero seguro de tu propio dispositivo y nunca se transmiten a nuestros servidores.
            </p>
          </div>
        </section>

        {/* Botón Volver */}
        <Button
          variant="outline"
          onClick={() => navigate('/profile')}
          className="h-12 rounded-2xl border-slate-200 text-manises-blue font-bold text-xs uppercase tracking-widest gap-2"
        >
          <ChevronLeft className="w-4 h-4" /> Volver al Perfil
        </Button>
      </div>

      {/* modal de simulación de autenticación biométrica del sistema */}
      <AnimatePresence>
        {showPrompt && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              className="fixed inset-x-4 bottom-1/2 translate-y-1/2 z-50 bg-slate-900 text-white rounded-3xl shadow-[0_30px_70px_rgba(0,0,0,0.5)] p-6 max-w-sm mx-auto border border-white/10"
            >
              <div className="flex flex-col items-center gap-5 text-center">
                {!isVerifying ? (
                  <>
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                      <ScanFace className="w-8 h-8 text-indigo-400" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="font-bold text-white text-base">Activar Face ID / Huella</h3>
                      <p className="text-[11px] text-white/50 leading-relaxed max-w-[240px]">
                        ¿Permites a Lotería Manises utilizar los sensores biométricos de tu dispositivo?
                      </p>
                    </div>
                    <div className="flex gap-3 w-full pt-1">
                      <button
                        className="flex-1 h-11 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-bold transition-all border border-white/10"
                        onClick={() => setShowPrompt(false)}
                      >
                        Cancelar
                      </button>
                      <button
                        className="flex-1 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black transition-all border-none"
                        onClick={simulateSystemAuth}
                      >
                        Permitir
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="py-6 flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
                    <div className="space-y-1">
                      <p className="text-xs font-black tracking-wider uppercase text-indigo-400">Verificando...</p>
                      <p className="text-[10px] text-white/40 font-medium">Escaneando rostro o huella dactilar</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
