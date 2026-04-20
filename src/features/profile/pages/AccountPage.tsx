import { useState, useRef, type FormEvent } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ProfileSubHeader } from '../components/ProfileSubHeader';
import { Button } from '@/shared/ui/Button';
import { toast } from 'sonner';
import { Save, User, Mail, Phone, Lock, Landmark, CircleCheck, Shield, ChevronRight, ShieldCheck } from 'lucide-react';
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
  icon: typeof User;
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
  });

  const [isSaving, setIsSaving] = useState(false);

  useGSAP(() => {
    const items = gsap.utils.toArray<HTMLElement>('.stagger-item');
    gsap.set(items, { y: 12, autoAlpha: 0 });
    gsap.to(items, {
      y: 0,
      autoAlpha: 1,
      stagger: 0.07,
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

  return (
    <div className="flex min-h-full flex-col bg-background" ref={containerRef}>
      <ProfileSubHeader title="Datos Personales" />
      
      <div className="p-5 flex flex-col gap-4">
        <section className="surface-neo-soft rounded-2xl border border-white/65 p-4 stagger-item">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CircleCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-manises-blue uppercase tracking-widest">Perfil verificado</p>
              <p className="text-[11px] text-muted-foreground font-medium mt-1">
                Mantén tus datos actualizados para validar jugadas y cobro de premios.
              </p>
            </div>
          </div>
        </section>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <section className="surface-neo-soft rounded-2xl border border-white/65 p-4 flex flex-col gap-4 stagger-item">
            <p className="text-[10px] font-black text-manises-blue uppercase tracking-widest px-1">Identidad</p>
            <Field
              label="Nombre Completo"
              icon={User}
              value={formData.name}
              onChange={(value) => setFormData({ ...formData, name: value })}
            />
            <Field
              label="Email"
              icon={Mail}
              value={formData.email}
              readOnly
              helper="El email no se puede modificar directamente."
              onChange={() => undefined}
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
            <p className="text-[10px] font-black text-manises-blue uppercase tracking-widest px-1">Contacto y cobro</p>
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
            <div className="flex items-start gap-2 px-1">
              <Shield className="w-4 h-4 text-manises-blue/45 mt-0.5 shrink-0" />
              <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
                Usamos estos datos solo para validación y pagos. Puedes actualizarlos cuando quieras.
              </p>
            </div>

            <div className="h-px bg-border/40 my-1" />

            {/* Enlace contextual a Juego Responsable */}
            <button
              type="button"
              onClick={() => navigate('/profile/help')}
              className="flex items-center justify-between p-3 rounded-xl bg-purple-50/50 border border-purple-100 hover:bg-purple-50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-purple-900">Juego Responsable</p>
                  <p className="text-[9px] text-purple-600/70 font-medium">Control, límites y autoexclusión</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-purple-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </section>

          <PremiumTouchInteraction scale={0.98} className="mt-2 stagger-item">
            <Button
              type="submit"
              disabled={isSaving}
              className="w-full h-14 bg-manises-blue text-white hover:bg-manises-gold hover:text-manises-blue rounded-xl font-black shadow-xl gap-2 transition-all"
            >
              <Save className="w-5 h-5" />
              {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </PremiumTouchInteraction>
        </form>
      </div>
    </div>
  );
}
