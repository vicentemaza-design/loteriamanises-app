import { useState, useRef, type ComponentType } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ProfileSubHeader } from '../components/ProfileSubHeader';
import { Button } from '@/shared/ui/Button';
import { toast } from 'sonner';
import { 
  Save, 
  User, 
  Mail, 
  Lock, 
  CircleCheck, 
  Shield, 
  Calendar, 
  MapPin, 
  UserX, 
  KeyRound,
  Bell,
  Smartphone,
  FileText,
  Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PremiumTouchInteraction } from '@/shared/components/PremiumTouchInteraction';
import { PremiumSectionCard } from '../components/PremiumSectionCard';
import { PremiumActionRow } from '../components/PremiumActionRow';
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
  icon: ComponentType<{ className?: string }>;
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
    dni: '12345678Z',
    birthDate: '1990-01-01',
    address: 'Calle Mayor, 1',
    postalCode: '46940',
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

  const handleSaveLocal = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.info('Cambios preparados en demo local. Pendientes de sincronización real con backend.');
    }, 800);
  };

  const handleSupportAction = (title: string) => {
    toast.info(`${title}: Solicitud preparada. Procesando a través de la pasarela de soporte...`);
  };

  return (
    <div className="flex min-h-full flex-col bg-background pb-12" ref={containerRef}>
      <ProfileSubHeader title="Gestión de Cuenta" subtitle="Ajustes avanzados y seguridad" />
      
      <div className="p-5 flex flex-col gap-6">
        
        {/* BLOQUE 1: DATOS PERSONALES */}
        <section className="stagger-item">
          <PremiumSectionCard 
            title="Datos Personales" 
            eyebrow="Identidad y Dirección"
            description="Información vinculada a tu identidad legal para el cobro de premios."
            tone="blue"
          >
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-xl bg-emerald-50/50 p-3 border border-emerald-100/50 mb-2">
                <CircleCheck className="w-4 h-4 text-emerald-600 mt-0.5" />
                <p className="text-[10px] font-bold text-emerald-800 leading-tight">
                  Perfil verificado · <span className="font-medium text-emerald-700/70 lowercase">Listo para premios mayores</span>
                </p>
              </div>

              <div className="grid gap-3.5">
                <Field
                  label="Nombre Completo"
                  icon={User}
                  value={formData.name}
                  onChange={(value) => setFormData({ ...formData, name: value })}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Field
                    label="Fecha de Nacimiento"
                    icon={Calendar}
                    type="date"
                    value={formData.birthDate}
                    onChange={(value) => setFormData({ ...formData, birthDate: value })}
                  />
                  <Field
                    label="DNI / NIE"
                    icon={Shield}
                    value={formData.dni}
                    onChange={(value) => setFormData({ ...formData, dni: value })}
                    className="uppercase"
                  />
                </div>
                <Field
                  label="Dirección Completa"
                  icon={MapPin}
                  value={`${formData.address}, ${formData.postalCode} ${formData.municipality}`}
                  onChange={() => undefined}
                  readOnly
                  helper="Contacta con soporte para cambios de domicilio legal."
                />
              </div>
            </div>
          </PremiumSectionCard>
        </section>

        {/* BLOQUE 2: PREFERENCIAS (MOCK) */}
        <section className="stagger-item">
          <PremiumSectionCard 
            title="Preferencias" 
            eyebrow="Notificaciones y Comunicaciones"
            description="Configura cómo quieres recibir tus premios y noticias."
            tone="gold"
          >
            <div className="divide-y divide-slate-100 -mx-1">
              <PremiumActionRow
                icon={Bell}
                title="Resultados Push"
                description="Aviso inmediato tras el sorteo"
                tone="gold"
                badge="Activado"
                onClick={() => toast.info('Demo · Cambios visuales no persistentes')}
              />
              <PremiumActionRow
                icon={Mail}
                title="Resguardos por Email"
                description="Copia digital en tu bandeja"
                tone="blue"
                badge="Siempre"
                onClick={() => toast.info('Demo · Configuración de sistema')}
              />
              <PremiumActionRow
                icon={Smartphone}
                title="Botes especiales"
                description="Alertas de premios millonarios"
                tone="gold"
                onClick={() => toast.info('Demo · Pendiente de integración')}
              />
            </div>
            <p className="mt-3 text-[9px] font-black text-center text-manises-blue/20 uppercase tracking-widest">
              Demo · No persiste configuración
            </p>
          </PremiumSectionCard>
        </section>

        {/* BLOQUE 3: SEGURIDAD */}
        <section className="stagger-item">
          <PremiumSectionCard 
            title="Opciones de Seguridad" 
            eyebrow="Protección de Cuenta"
            description="Gestiona el acceso y la seguridad de tus datos."
            tone="violet"
          >
            <div className="divide-y divide-slate-100 -mx-1">
              <PremiumActionRow
                icon={KeyRound}
                title="Cambiar Contraseña"
                description="Actualizada hace 3 meses"
                tone="violet"
                onClick={() => handleSupportAction('Cambio de Contraseña')}
              />
              <PremiumActionRow
                icon={Lock}
                title="Acceso Seguro"
                description="PIN de seguridad y biometría"
                tone="violet"
                badge="Configurado"
                onClick={() => handleSupportAction('Gestión de Acceso')}
              />
              <PremiumActionRow
                icon={UserX}
                title="Cerrar Cuenta"
                description="Solicitar baja del servicio"
                tone="rose"
                onClick={() => handleSupportAction('Baja de Cuenta')}
              />
            </div>
            <p className="mt-3 text-[9px] font-black text-center text-rose-500/30 uppercase tracking-widest">
              Demo · Acciones sujetas a soporte
            </p>
          </PremiumSectionCard>
        </section>

        {/* BLOQUE 4: AYUDA Y LEGAL */}
        <section className="stagger-item">
          <PremiumSectionCard 
            title="Ayuda y Legal" 
            eyebrow="Compliance"
            description="Información oficial y soporte técnico."
            tone="default"
          >
            <div className="divide-y divide-slate-100 -mx-1">
              <PremiumActionRow
                icon={Info}
                title="Centro de Ayuda"
                description="Preguntas frecuentes y soporte"
                onClick={() => navigate('/profile/help')}
              />
              <PremiumActionRow
                icon={FileText}
                title="Términos y Privacidad"
                description="Aviso legal y gestión de datos"
                onClick={() => navigate('/profile/help')}
              />
            </div>
          </PremiumSectionCard>
        </section>

        <div className="mt-4 flex flex-col gap-4 stagger-item">
          <PremiumTouchInteraction scale={0.98}>
            <Button
              onClick={handleSaveLocal}
              disabled={isSaving}
              className="w-full h-14 bg-manises-blue text-white hover:bg-manises-gold hover:text-manises-blue rounded-2xl font-black shadow-xl gap-2 transition-all border-none"
            >
              <Save className="w-5 h-5" />
              {isSaving ? 'Guardando...' : 'Guardar Cambios Locales'}
            </Button>
          </PremiumTouchInteraction>
          
          <div className="flex items-center justify-center gap-2 opacity-40">
            <Shield className="w-3.5 h-3.5 text-manises-blue" />
            <p className="text-[9px] font-black uppercase tracking-widest text-manises-blue">Conexión Segura · Demo Mode</p>
          </div>
        </div>
      </div>
    </div>
  );
}
