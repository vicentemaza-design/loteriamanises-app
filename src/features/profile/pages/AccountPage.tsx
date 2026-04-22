import { useState, useRef, type FormEvent } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ProfileSubHeader } from '../components/ProfileSubHeader';
import { Button } from '@/shared/ui/Button';
import { toast } from 'sonner';
import { 
  Save, 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Landmark, 
  CircleCheck, 
  Shield, 
  ChevronRight, 
  ShieldCheck, 
  Calendar, 
  MapPin, 
  Building2, 
  UserX, 
  KeyRound 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PremiumTouchInteraction } from '@/shared/components/PremiumTouchInteraction';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { cn } from '@/shared/lib/utils';

gsap.registerPlugin(useGSAP);

function Field({
  label,
  icon: Icon,
  helper,
  readOnly = false,
  value,
  onChange,
  type = 'text',
  className,
}: {
  label: string;
  icon: any;
  helper?: string;
  readOnly?: boolean;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  className?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-black text-manises-blue uppercase tracking-widest px-1">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-manises-blue/35">
          <Icon className="w-4.5 h-4.5" />
        </div>
        <input
          type={type}
          value={value}
          readOnly={readOnly}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'w-full h-12 pl-11 pr-4 rounded-xl border text-sm font-medium outline-none transition-all',
            readOnly
              ? 'surface-neo-pressed border-white/60 text-manises-blue/45 cursor-not-allowed'
              : 'surface-neo-soft border-white/65 text-manises-blue focus-visible:ring-2 focus-visible:ring-manises-gold/50',
            className
          )}
        />
      </div>
      {helper && <span className="text-[9px] text-muted-foreground px-1 font-medium">{helper}</span>}
    </div>
  );
}

export function AccountPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState({
    name: profile?.displayName || '',
    email: profile?.email || '',
    phone: '+34 600 000 000',
    dni: '12345678Z',
    iban: 'ES12 3456 7890 1234 5678 9012',
    birthDate: '1990-01-01',
    address: 'Calle Mayor, 1',
    municipality: 'Manises',
  });

  const [isSaving, setIsSaving] = useState(false);

  useGSAP(() => {
    const items = gsap.utils.toArray<HTMLElement>('.stagger-item');
    gsap.set(items, { y: 12, autoAlpha: 0 });
    gsap.to(items, {
      y: 0,
      autoAlpha: 1,
      stagger: 0.05,
      duration: 0.35,
      ease: 'power2.out',
    });
  }, { scope: containerRef });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Datos actualizados correctamente');
    }, 800);
  };

  const handleSupportAction = (title: string) => {
    toast.info(`${title}: Solicitud preparada. Procesando a través de la pasarela de soporte...`);
  };

  return (
    <div className="flex min-h-full flex-col bg-background pb-12" ref={containerRef}>
      <ProfileSubHeader title="Datos y Compliance" />
      
      <div className="p-5 flex flex-col gap-4">
        <section className="surface-neo-soft rounded-2xl border border-white/65 p-4 stagger-item">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CircleCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-manises-blue uppercase tracking-widest">Perfil verificado</p>
              <p className="text-[11px] text-muted-foreground font-medium mt-1">
                La verificación es obligatoria para el cobro de premios mayores de 2.000€.
              </p>
            </div>
          </div>
        </section>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <section className="surface-neo-soft rounded-2xl border border-white/65 p-4 flex flex-col gap-4 stagger-item">
            <p className="text-[10px] font-black text-manises-blue uppercase tracking-widest px-1">Identidad y Nacimiento</p>
            <Field
              label="Nombre Completo"
              icon={User}
              value={formData.name}
              onChange={(value) => setFormData({ ...formData, name: value })}
            />
            <Field
              label="Fecha de Nacimiento"
              icon={Calendar}
              type="date"
              value={formData.birthDate}
              onChange={(value) => setFormData({ ...formData, birthDate: value })}
              helper="Debes ser mayor de 18 años para jugar."
            />
            <Field
              label="DNI / NIE"
              icon={Lock}
              value={formData.dni}
              onChange={(value) => setFormData({ ...formData, dni: value })}
              className="uppercase"
            />
          </section>

          <section className="surface-neo-soft rounded-2xl border border-white/65 p-4 flex flex-col gap-4 stagger-item">
            <p className="text-[10px] font-black text-manises-blue uppercase tracking-widest px-1">Dirección Legal</p>
            <Field
              label="Dirección"
              icon={MapPin}
              value={formData.address}
              onChange={(value) => setFormData({ ...formData, address: value })}
            />
            <Field
              label="Municipio"
              icon={Building2}
              value={formData.municipality}
              onChange={(value) => setFormData({ ...formData, municipality: value })}
            />
          </section>

          <section className="surface-neo-soft rounded-2xl border border-white/65 p-4 flex flex-col gap-4 stagger-item">
            <p className="text-[10px] font-black text-manises-blue uppercase tracking-widest px-1">Contacto y cobro</p>
            <Field
              label="Email"
              icon={Mail}
              value={formData.email}
              readOnly
              helper="Contacta con soporte para cambiar tu email."
              onChange={() => undefined}
            />
            <Field
              label="Teléfono móvil"
              icon={Phone}
              type="tel"
              value={formData.phone}
              onChange={(value) => setFormData({ ...formData, phone: value })}
              className="tabular-nums"
            />
            <Field
              label="IBAN (Para cobro de premios)"
              icon={Landmark}
              value={formData.iban}
              onChange={(value) => setFormData({ ...formData, iban: value })}
              className="tabular-nums uppercase tracking-wider"
            />
          </section>

          {/* Acciones de Seguridad y Compliance */}
          <section className="space-y-3 stagger-item">
            <p className="text-[10px] font-black text-manises-blue uppercase tracking-widest px-1">Seguridad y Cuenta</p>
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden divide-y divide-border/50">
              <button
                type="button"
                onClick={() => handleSupportAction('Cambio de Contraseña')}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-manises-blue group-hover:text-white transition-all">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] font-bold text-slate-900">Cambiar Contraseña</p>
                    <p className="text-[9px] text-slate-500 font-medium">Último cambio: hace 3 meses</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/profile/help')}
                className="w-full flex items-center justify-between p-4 hover:bg-purple-50/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] font-bold text-purple-900">Juego Responsable</p>
                    <p className="text-[9px] text-purple-600/70 font-medium">Límites, gasto y autoexclusión</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-purple-300" />
              </button>

              <button
                type="button"
                onClick={() => handleSupportAction('Baja de Cuenta')}
                className="w-full flex items-center justify-between p-4 hover:bg-rose-50/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-rose-100 text-rose-600">
                    <UserX className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] font-bold text-rose-900">Cerrar Cuenta</p>
                    <p className="text-[9px] text-rose-600/70 font-medium">Solicitar baja definitiva del servicio</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-rose-300" />
              </button>
            </div>
          </section>

          <PremiumTouchInteraction scale={0.98} className="mt-2 stagger-item">
            <Button
              type="submit"
              disabled={isSaving}
              className="w-full h-14 bg-manises-blue text-white hover:bg-manises-gold hover:text-manises-blue rounded-2xl font-black shadow-xl gap-2 transition-all border-none"
            >
              <Save className="w-5 h-5" />
              {isSaving ? 'Guardando...' : 'Actualizar Perfil'}
            </Button>
          </PremiumTouchInteraction>
        </form>

        <div className="stagger-item mt-2 flex items-center justify-center gap-2 opacity-40">
          <Shield className="w-3.5 h-3.5 text-manises-blue" />
          <p className="text-[9px] font-bold uppercase tracking-widest text-manises-blue">Conexión Segura SSL</p>
        </div>
      </div>
    </div>
  );
}
