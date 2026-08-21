import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Fingerprint, ShieldCheck, ChevronLeft, Info, Clock } from 'lucide-react';
import { ProfileSubHeader } from '../components/ProfileSubHeader';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/shared/lib/utils';
import { getWebAuthnSupport, isPlatformAuthenticatorAvailable } from '@/shared/lib/webauthn';

/**
 * Passkeys/WebAuthn — FUTURE / NOT IMPLEMENTED (see
 * docs/be-handoff/passkeys-webauthn.md). This screen used to fake an
 * "activation" (setTimeout + localStorage + success toast) that implied
 * real biometric security was being turned on — it wasn't. It now only
 * reports device/browser capability (pure feature detection, no
 * credential is ever created or requested) and communicates honestly that
 * the feature itself isn't live yet. Whether the user actually has a
 * passkey registered (PasskeyStatus) can only be answered by BE once that
 * contract exists — this screen never invents that answer.
 */
export function BiometricsPage() {
  const navigate = useNavigate();

  // null = still checking; feature detection only, never a credential check.
  const [platformAvailable, setPlatformAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    if (getWebAuthnSupport() !== 'supported') {
      setPlatformAvailable(false);
      return;
    }
    let cancelled = false;
    isPlatformAuthenticatorAvailable().then((available) => {
      if (!cancelled) setPlatformAvailable(available);
    });
    return () => { cancelled = true; };
  }, []);

  const isChecking = platformAvailable === null;
  const isCompatible = platformAvailable === true;

  return (
    <div className="flex min-h-full flex-col bg-background pb-12">
      <ProfileSubHeader title="Biometría" subtitle="Acceso y confirmaciones rápidas" />

      <div className="p-5 flex flex-col gap-6 max-w-md mx-auto w-full">

        {/* Ilustración / Icono central */}
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
            <h3 className="text-base font-black text-manises-blue">Autenticación biométrica del dispositivo</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-[280px] leading-relaxed mx-auto">
              En el futuro podrás acceder más rápido usando Face ID, huella dactilar u otro método seguro de tu dispositivo, sin introducir tu contraseña.
            </p>
          </div>
        </section>

        {/* Estado de compatibilidad — solo detección, sin activación */}
        <section className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-sm font-bold text-manises-blue">Passkeys / Face ID / Huella</p>
              <p className="text-[11px] text-muted-foreground font-medium">Estado de compatibilidad de tu dispositivo</p>
            </div>
            <span className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wide',
              isChecking
                ? 'bg-slate-100 text-slate-400'
                : isCompatible
                  ? 'bg-amber-50 text-amber-600 border border-amber-200'
                  : 'bg-slate-100 text-slate-500 border border-slate-200'
            )}>
              <Clock className="w-3 h-3" />
              {isChecking ? 'Comprobando' : isCompatible ? 'Próximamente' : 'No disponible'}
            </span>
          </div>

          <div className="h-px bg-slate-100" />

          <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            <Info className="w-4.5 h-4.5 text-indigo-600 shrink-0 mt-0.5" />
            <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">
              {isChecking
                ? 'Comprobando la compatibilidad de tu dispositivo…'
                : isCompatible
                  ? 'Tu dispositivo es compatible. Esta función estará disponible cuando se active la autenticación segura mediante Passkeys.'
                  : 'Este dispositivo o navegador no admite autenticación mediante Passkeys.'}
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
    </div>
  );
}
