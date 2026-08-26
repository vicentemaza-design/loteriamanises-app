import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Save, ShieldCheck, User } from 'lucide-react';
import { toast } from 'sonner';
import { ProfileSubHeader } from '../components/ProfileSubHeader';
import { PremiumSectionCard } from '../components/PremiumSectionCard';
import { ProfileChangeVerificationModal } from '../components/ProfileChangeVerificationModal';
import { Button } from '@/shared/ui/Button';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useSecurityGate } from '@/features/profile/hooks/useSecurityGate';

function AccountField({
  label,
  value,
  onChange,
  readOnly = false,
  type = 'text',
  labelClassName = '',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  type?: string;
  labelClassName?: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className={labelClassName || 'px-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400'}>{label}</span>
      <input
        type={type}
        readOnly={readOnly}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`h-12 w-full rounded-xl border px-4 text-sm font-semibold outline-none ${
          readOnly
            ? 'border-slate-100 bg-slate-50 text-slate-400'
            : 'border-slate-200 bg-white text-manises-blue focus:border-manises-blue'
        }`}
      />
    </label>
  );
}

/**
 * Persona ficticia del modo demo — mostrada ÚNICAMENTE cuando isDemo es
 * true. UserProfile (shared/types/domain.ts) no modela name/surname/phone/
 * nif/birthDate todavía (ver nota de alcance en handleChangesConfirmed),
 * así que para una sesión Google real estos campos se derivan de
 * profile.displayName o se muestran vacíos/"No disponible" — nunca se
 * rellenan con la identidad de otra persona.
 */
const DEMO_ACCOUNT_DEFAULTS = {
  name: 'Juan Carlos',
  surname: 'Martínez',
  phone: '600 123 456',
  nif: '12345678Z',
  birthDate: '14/05/1985',
};

function splitDisplayName(displayName?: string | null): { name: string; surname: string } {
  const trimmed = (displayName ?? '').trim();
  if (!trimmed) return { name: '', surname: '' };
  const [first, ...rest] = trimmed.split(/\s+/);
  return { name: first, surname: rest.join(' ') };
}

export function AccountPage() {
  const navigate = useNavigate();
  const { profile, isDemo, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    currentEmail: profile?.email ?? '',
    newEmail: '',
    confirmEmail: '',
    phone: '',
    alternatePhone: '',
    address: profile?.address ?? '',
    postalCode: profile?.postalCode ?? '',
    municipality: profile?.municipality ?? '',
    province: profile?.province ?? '',
    country: 'España',
  });
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { requireReauth, gateModal } = useSecurityGate();

  // Rellena identidad/dirección desde la sesión real una vez disponible
  // (mismo patrón que WithdrawalsPage.tsx) — solo campos que el usuario
  // todavía no ha tocado, nunca sobrescribe una edición en curso. En demo
  // usa la persona ficticia de siempre; en una sesión Google real deriva
  // nombre/apellidos de profile.displayName y dirección de profile — nunca
  // mezcla ambas identidades.
  useEffect(() => {
    if (isDemo) {
      setFormData((current) => ({
        ...current,
        name: current.name || DEMO_ACCOUNT_DEFAULTS.name,
        surname: current.surname || DEMO_ACCOUNT_DEFAULTS.surname,
        phone: current.phone || DEMO_ACCOUNT_DEFAULTS.phone,
        currentEmail: current.currentEmail || profile?.email || 'usuario@loteriamanises.com',
        address: !current.address && profile?.address ? profile.address : current.address,
        postalCode: !current.postalCode && profile?.postalCode ? profile.postalCode : current.postalCode,
        municipality: !current.municipality && profile?.municipality ? profile.municipality : current.municipality,
        province: !current.province && profile?.province ? profile.province : current.province,
      }));
      return;
    }
    if (!profile) return;
    const { name, surname } = splitDisplayName(profile.displayName);
    setFormData((current) => ({
      ...current,
      name: current.name || name,
      surname: current.surname || surname,
      currentEmail: current.currentEmail || profile.email || '',
      address: !current.address && profile.address ? profile.address : current.address,
      postalCode: !current.postalCode && profile.postalCode ? profile.postalCode : current.postalCode,
      municipality: !current.municipality && profile.municipality ? profile.municipality : current.municipality,
      province: !current.province && profile.province ? profile.province : current.province,
    }));
  }, [profile, isDemo]);

  const emailsMatch = !formData.newEmail || formData.newEmail === formData.confirmEmail;

  const updateField = (key: keyof typeof formData, value: string) => {
    setFormData((current) => ({ ...current, [key]: value }));
  };

  /**
   * Order is deliberate: local PIN reauth first (requireReauth('profile') —
   * always required, independent of any toggle, see
   * features/profile/lib/security.ts), THEN the existing email-OTP modal.
   * The PIN only proves "this is the device owner" locally; it never
   * replaces the OTP's real BE-validated confirmation of the actual change
   * — see docs/be-handoff/security-reauthentication.md.
   */
  const handleSave = async () => {
    if (isSaving) return;
    if (!emailsMatch) {
      toast.error('El nuevo email y su confirmación deben coincidir.');
      return;
    }
    setIsSaving(true);
    try {
      const reauthed = await requireReauth('profile');
      if (!reauthed) return;
      // NO se persiste nada todavía — solo se abre el modal de confirmación.
      // Los cambios de formData solo se aplican en handleChangesConfirmed(),
      // una vez validado el código de 6 dígitos.
      setIsVerificationOpen(true);
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Llamado por el modal SOLO tras confirmar el código correctamente.
   *
   * Nota de alcance: UserProfile (shared/types/domain.ts) hoy no modela
   * name/surname/phone/alternatePhone/country — no son campos inventados
   * aquí, ya eran puramente locales en este formulario antes de esta tarea
   * (handleSave nunca los persistía). Por eso solo address/postalCode/
   * municipality/province/email —que sí existen en UserProfile— se envían a
   * updateProfile(); el resto queda protegido por el mismo gate de
   * confirmación pero se mantiene como estado local, igual que antes.
   */
  const handleChangesConfirmed = async () => {
    const changes: Parameters<typeof updateProfile>[0] = {
      address: formData.address,
      postalCode: formData.postalCode,
      municipality: formData.municipality,
      province: formData.province,
    };
    if (formData.newEmail) {
      changes.email = formData.newEmail;
    }
    await updateProfile(changes, { silent: true });
    if (formData.newEmail) {
      setFormData((current) => ({ ...current, currentEmail: formData.newEmail, newEmail: '', confirmEmail: '' }));
    }
    toast.success('Datos actualizados', { description: 'Los cambios se han guardado correctamente.' });
  };

  return (
    <div className="flex min-h-full flex-col bg-background pb-20">
      <ProfileSubHeader title="Datos personales" subtitle="Identidad, contacto y dirección" />

      <div className="flex flex-col gap-4 p-4">
        <section className="rounded-[1.45rem] border border-emerald-100 bg-emerald-50/70 p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700">Cuenta verificada</p>
              <p className="mt-1 text-sm font-semibold leading-relaxed text-emerald-800/80">
                Mantén tus datos actualizados para garantizar la seguridad de tu cuenta y poder recibir premios sin incidencias.
              </p>
            </div>
          </div>
        </section>

        <PremiumSectionCard title="Información básica" eyebrow="Titular" description="Nombre y apellidos editables. NIF y fecha de nacimiento en solo lectura." tone="blue">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <AccountField label="Nombre" value={formData.name} onChange={(value) => updateField('name', value)} />
              <AccountField label="Apellidos" value={formData.surname} onChange={(value) => updateField('surname', value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <AccountField label="NIF / NIE" value={isDemo ? DEMO_ACCOUNT_DEFAULTS.nif : 'No disponible'} onChange={() => undefined} readOnly />
              <AccountField label="Fecha de nacimiento" value={isDemo ? DEMO_ACCOUNT_DEFAULTS.birthDate : 'No disponible'} onChange={() => undefined} readOnly />
            </div>
          </div>
        </PremiumSectionCard>

        <PremiumSectionCard title="Contacto" eyebrow="Email y teléfonos" description="Para cambiar el email pedimos dos veces la nueva dirección para evitar errores." tone="default">
          <div className="space-y-3">
            <AccountField label="Email actual" value={formData.currentEmail} onChange={() => undefined} readOnly />
            <div className="grid gap-3">
              <AccountField label="Nuevo email" value={formData.newEmail} onChange={(value) => updateField('newEmail', value)} type="email" />
              <AccountField label="Confirmar nuevo email" value={formData.confirmEmail} onChange={(value) => updateField('confirmEmail', value)} type="email" />
            </div>
            {!emailsMatch && (
              <p className="px-1 text-[10px] font-black uppercase tracking-[0.16em] text-red-500">Los emails no coinciden</p>
            )}
            <div className="grid grid-cols-2 gap-3 items-end">
              {/* tracking reducido solo por debajo de 375px: a 320px la
                  columna del grid mide ~117px y "Tel. alternativo" con el
                  tracking-[0.16em] estándar (igual que el resto de labels)
                  no cabe en una línea — de 375px en adelante mantiene el
                  mismo tracking que el resto de campos. */}
              <AccountField
                label="Tel. principal"
                value={formData.phone}
                onChange={(value) => updateField('phone', value)}
                labelClassName="px-1 text-[10px] font-black uppercase tracking-[0.02em] min-[375px]:tracking-[0.16em] text-slate-400 whitespace-nowrap"
              />
              <AccountField
                label="Tel. alternativo"
                value={formData.alternatePhone}
                onChange={(value) => updateField('alternatePhone', value)}
                labelClassName="px-1 text-[10px] font-black uppercase tracking-[0.02em] min-[375px]:tracking-[0.16em] text-slate-400 whitespace-nowrap"
              />
            </div>
          </div>
        </PremiumSectionCard>

        <PremiumSectionCard title="Dirección" eyebrow="Datos editables" description="La dirección se reutilizará en flujos de mensajería y pagos que la necesiten." tone="gold">
          <div className="space-y-3">
            <AccountField label="Dirección" value={formData.address} onChange={(value) => updateField('address', value)} />
            <div className="grid grid-cols-2 gap-3">
              <AccountField label="Código postal" value={formData.postalCode} onChange={(value) => updateField('postalCode', value)} />
              <AccountField label="Municipio" value={formData.municipality} onChange={(value) => updateField('municipality', value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <AccountField label="Provincia" value={formData.province} onChange={(value) => updateField('province', value)} />
              <AccountField label="País" value={formData.country} onChange={(value) => updateField('country', value)} />
            </div>
          </div>
        </PremiumSectionCard>

        <Button
          className="w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Guardar cambios
            </>
          )}
        </Button>

        <PremiumSectionCard title="Gestión de la cuenta" eyebrow="Baja del servicio" description="La baja no se realiza desde aquí directamente. Primero te explicamos sus consecuencias y luego confirmas la solicitud." tone="default">
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => navigate('/profile/account/delete')}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left transition-all hover:border-manises-blue/20"
            >
              <div>
                <p className="text-sm font-black text-manises-blue">Dar de baja la cuenta</p>
                <p className="mt-1 text-[11px] font-semibold text-slate-500">Accede a una explicación previa antes de confirmar.</p>
              </div>
              <User className="h-4 w-4 text-slate-300" />
            </button>
          </div>
        </PremiumSectionCard>
      </div>

      {gateModal}

      <ProfileChangeVerificationModal
        isOpen={isVerificationOpen}
        onClose={() => setIsVerificationOpen(false)}
        email={profile?.email ?? formData.currentEmail}
        onConfirmed={handleChangesConfirmed}
      />
    </div>
  );
}
