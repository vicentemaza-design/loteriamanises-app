import { useState } from 'react';
import { Lock, ShieldCheck, Key, Rocket, ShoppingBag, Bank, Wallet, User, InfoCircle } from 'iconoir-react/regular';
import { ProfileSubHeader } from '../components/ProfileSubHeader';
import { PinEntryModal } from '../components/PinEntryModal';
import { cn } from '@/shared/lib/utils';
import { toast } from 'sonner';
import {
  getSecurityPreferences,
  saveSecurityPreferences,
  hasCustomPin,
} from '@/features/profile/lib/security';
import type { SecurityPreferences } from '@/features/profile/types/profile.types';

type ToggleKey = keyof Omit<SecurityPreferences, 'securityEnabled'>;

const TOGGLE_ROWS: Array<{ key: ToggleKey; icon: typeof Rocket; label: string; description: string }> = [
  { key: 'requireOnLaunch', icon: Rocket, label: 'Al iniciar la app', description: 'Pide el PIN cada vez que abres la aplicación.' },
  { key: 'requireOnPurchase', icon: ShoppingBag, label: 'Al comprar boletos', description: 'Pide el PIN antes de confirmar una compra.' },
  { key: 'requireOnWithdrawal', icon: Bank, label: 'Al retirar saldo', description: 'Pide el PIN antes de solicitar una retirada.' },
  { key: 'requireOnTopUp', icon: Wallet, label: 'Al cargar saldo', description: 'Pide el PIN antes de recargar tu monedero.' },
];

/**
 * PIN / reauthentication settings — LOCAL UI GATE ONLY (see
 * docs/be-handoff/security-reauthentication.md). "Al modificar datos de
 * usuario" is intentionally rendered with no switch at all: it's a fixed
 * business rule (PROFILE_CHANGE_REAUTH_REQUIRED in
 * features/profile/lib/security.ts), never a user preference, so there is
 * no toggle here that could ever turn it off.
 */
export function SecurityPage() {
  const [prefs, setPrefs] = useState<SecurityPreferences>(() => getSecurityPreferences());
  const [pinFlow, setPinFlow] = useState<'none' | 'enable' | 'verify-before-change' | 'change'>('none');

  const persist = (next: SecurityPreferences) => {
    setPrefs(next);
    saveSecurityPreferences(next);
  };

  const handleToggleSecurity = () => {
    if (prefs.securityEnabled) {
      persist({ ...prefs, securityEnabled: false });
      toast.info('Seguridad con PIN desactivada');
      return;
    }
    if (!hasCustomPin()) {
      setPinFlow('enable');
      return;
    }
    persist({ ...prefs, securityEnabled: true });
    toast.success('Seguridad con PIN activada');
  };

  const handleToggleAction = (key: ToggleKey) => {
    if (!prefs.securityEnabled) return;
    persist({ ...prefs, [key]: !prefs[key] });
  };

  const handleEnableSuccess = () => {
    setPinFlow('none');
    persist({ ...prefs, securityEnabled: true });
    toast.success('PIN creado y seguridad activada');
  };

  const handleChangeRequested = () => setPinFlow('verify-before-change');
  const handleVerifiedBeforeChange = () => setPinFlow('change');
  const handleChangeSuccess = () => {
    setPinFlow('none');
    toast.success('PIN actualizado');
  };

  return (
    <div className="flex min-h-full flex-col bg-background pb-12">
      <ProfileSubHeader title="Seguridad" subtitle="PIN y reautenticación" />

      <div className="p-5 flex flex-col gap-6 max-w-md mx-auto w-full">

        {/* Icono central + toggle maestro */}
        <section className="flex flex-col items-center gap-4 text-center py-4">
          <div className="w-20 h-20 rounded-[1.75rem] bg-indigo-50 border border-indigo-100 flex items-center justify-center shadow-sm">
            <Lock className="w-10 h-10 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-base font-black text-manises-blue">Protege tu cuenta con un PIN</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-[280px] leading-relaxed mx-auto">
              Elige en qué momentos quieres confirmar tu PIN de 4 dígitos antes de continuar.
            </p>
          </div>
        </section>

        <section className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-sm font-bold text-manises-blue">Activar seguridad</p>
              <p className="text-[11px] text-muted-foreground font-medium">
                {prefs.securityEnabled ? 'PIN activo en las acciones que elijas' : 'Actualmente desactivada'}
              </p>
            </div>
            <button
              onClick={handleToggleSecurity}
              role="switch"
              aria-checked={prefs.securityEnabled}
              className={cn(
                'w-12 h-6 rounded-full transition-colors relative outline-none border-none',
                prefs.securityEnabled ? 'bg-indigo-600' : 'bg-slate-200'
              )}
            >
              <div className={cn(
                'absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm',
                prefs.securityEnabled ? 'left-7' : 'left-1'
              )} />
            </button>
          </div>

          {hasCustomPin() && (
            <button
              type="button"
              onClick={handleChangeRequested}
              className="mt-4 flex w-full items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-3.5 py-3 text-left transition-colors hover:bg-slate-100"
            >
              <Key className="w-4 h-4 text-indigo-600 shrink-0" />
              <span className="flex-1 text-xs font-bold text-manises-blue">Cambiar PIN</span>
              <span className="text-[10px] font-semibold text-slate-400">Editar</span>
            </button>
          )}
        </section>

        {/* Acciones configurables */}
        <section className="bg-white rounded-3xl border border-slate-100 shadow-sm divide-y divide-slate-100 overflow-hidden">
          {TOGGLE_ROWS.map(({ key, icon: Icon, label, description }) => {
            const checked = prefs[key];
            const disabled = !prefs.securityEnabled;
            return (
              <div
                key={key}
                className={cn('flex items-center gap-3 px-4 py-3.5', disabled && 'opacity-50')}
              >
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-manises-blue">{label}</p>
                  <p className="text-[10px] text-muted-foreground font-medium leading-snug">{description}</p>
                </div>
                <button
                  onClick={() => handleToggleAction(key)}
                  disabled={disabled}
                  role="switch"
                  aria-checked={checked}
                  className={cn(
                    'w-11 h-6 rounded-full transition-colors relative outline-none border-none shrink-0',
                    checked && !disabled ? 'bg-indigo-600' : 'bg-slate-200',
                    disabled && 'cursor-not-allowed'
                  )}
                >
                  <div className={cn(
                    'absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm',
                    checked ? 'left-6' : 'left-1'
                  )} />
                </button>
              </div>
            );
          })}

          {/* Al modificar datos de usuario — SIN switch: regla de negocio fija, siempre activa */}
          <div className="flex items-center gap-3 px-4 py-3.5 bg-amber-50/40">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700 shrink-0">
              <User className="w-4.5 h-4.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-manises-blue">Al modificar datos de usuario</p>
              <p className="text-[10px] text-muted-foreground font-medium leading-snug">
                Por seguridad, siempre solicitaremos autenticación para modificar tus datos.
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-amber-100 border border-amber-200 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-amber-700">
              Obligatorio
            </span>
          </div>
        </section>

        <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
          <InfoCircle className="w-4.5 h-4.5 text-indigo-600 shrink-0 mt-0.5" />
          <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">
            El PIN protege el acceso a esta app en tu dispositivo. Las operaciones sensibles siempre se validan también en nuestros servidores.
          </p>
        </div>

        <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
          <ShieldCheck className="w-4.5 h-4.5 text-slate-400 shrink-0 mt-0.5" />
          <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">
            Biometría / Passkeys — Próximamente. Consulta el estado de compatibilidad de tu dispositivo en Perfil → Biometría.
          </p>
        </div>
      </div>

      <PinEntryModal
        isOpen={pinFlow === 'enable'}
        mode="create"
        title="Crea un PIN de seguridad"
        description="Lo usarás para confirmar las acciones que elijas."
        onClose={() => setPinFlow('none')}
        onSuccess={handleEnableSuccess}
      />
      <PinEntryModal
        isOpen={pinFlow === 'verify-before-change'}
        mode="verify"
        title="Confirma tu PIN actual"
        description="Antes de crear uno nuevo, confirma el PIN actual."
        onClose={() => setPinFlow('none')}
        onSuccess={handleVerifiedBeforeChange}
      />
      <PinEntryModal
        isOpen={pinFlow === 'change'}
        mode="create"
        title="Crea tu nuevo PIN"
        description="Elige el PIN que usarás a partir de ahora."
        onClose={() => setPinFlow('none')}
        onSuccess={handleChangeSuccess}
      />
    </div>
  );
}
