import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ShieldCheck, User } from 'lucide-react';
import { toast } from 'sonner';
import { ProfileSubHeader } from '../components/ProfileSubHeader';
import { PremiumSectionCard } from '../components/PremiumSectionCard';
import { Button } from '@/shared/ui/Button';
import { useAuth } from '@/features/auth/hooks/useAuth';

function AccountField({
  label,
  value,
  onChange,
  readOnly = false,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  type?: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="px-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{label}</span>
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

export function AccountPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [formData, setFormData] = useState({
    name: 'Juan Carlos',
    surname: 'Martínez',
    currentEmail: profile?.email ?? 'usuario@loteriamanises.com',
    newEmail: '',
    confirmEmail: '',
    phone: '600 123 456',
    alternatePhone: '',
    address: 'Calle Mayor, 45',
    postalCode: '46940',
    municipality: 'Manises',
    province: 'Valencia',
    country: 'España',
  });

  const emailsMatch = !formData.newEmail || formData.newEmail === formData.confirmEmail;

  const updateField = (key: keyof typeof formData, value: string) => {
    setFormData((current) => ({ ...current, [key]: value }));
  };

  const handleSave = () => {
    if (!emailsMatch) {
      toast.error('El nuevo email y su confirmación deben coincidir.');
      return;
    }
    toast.success('Datos personales preparados en demo.');
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
              <AccountField label="NIF / NIE" value="12345678Z" onChange={() => undefined} readOnly />
              <AccountField label="Fecha de nacimiento" value="14/05/1985" onChange={() => undefined} readOnly />
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
              <AccountField label="Teléfono principal" value={formData.phone} onChange={(value) => updateField('phone', value)} />
              <AccountField label="Teléfono alternativo" value={formData.alternatePhone} onChange={(value) => updateField('alternatePhone', value)} />
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

        <Button className="w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-700" onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Guardar cambios
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
    </div>
  );
}
