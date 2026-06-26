import { Mail, MapPin, Phone, Truck } from 'lucide-react';
import { ProfileSubHeader } from '../components/ProfileSubHeader';
import { PremiumSectionCard } from '../components/PremiumSectionCard';
import { Button } from '@/shared/ui/Button';

export function HelpPage() {
  return (
    <div className="flex min-h-full flex-col bg-background pb-20">
      <ProfileSubHeader title="Ayuda y contacto" subtitle="Canales directos y consultas frecuentes" />

      <div className="flex flex-col gap-4 p-4">
        <PremiumSectionCard
          title="Contacto"
          eyebrow="Estamos aquí para ayudarte"
          description="Prioriza el acceso directo a la administración para resolver incidencias de pedidos, pagos o acceso."
          tone="blue"
        >
          <div className="grid gap-3">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
              <Phone className="h-4.5 w-4.5 text-manises-blue" />
              <div>
                <p className="text-sm font-black text-manises-blue">961 532 260</p>
                <p className="text-[11px] font-semibold text-slate-500">Lunes a viernes de 9:00 a 21:00 · sábados de 9:00 a 14:00</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
              <Mail className="h-4.5 w-4.5 text-manises-blue" />
              <div>
                <p className="text-sm font-black text-manises-blue">atencionalcliente@loteriamanises.es</p>
                <p className="text-[11px] font-semibold text-slate-500">Respuesta para consultas generales y soporte de pedidos.</p>
              </div>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Button className="flex-1 rounded-xl bg-manises-blue text-white">Llamar ahora</Button>
            <Button className="flex-1 rounded-xl bg-manises-gold text-manises-blue hover:bg-manises-gold/90">Enviar email</Button>
          </div>
        </PremiumSectionCard>

        <PremiumSectionCard title="Consultas habituales" eyebrow="Accesos rápidos" description="Resuelve rápido las dudas más frecuentes sin salir de la app." tone="default">
          <div className="grid grid-cols-2 gap-3">
            {[
              'Incidencias con pedidos',
              'Problemas con pagos',
              'Envíos y mensajería',
              'Recuperar contraseña',
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-slate-100 bg-white px-4 py-4 text-sm font-black text-manises-blue shadow-sm">
                {item}
              </div>
            ))}
          </div>
        </PremiumSectionCard>

        <PremiumSectionCard title="Administración" eyebrow="Oficina principal" description="Información presencial y acceso a ubicación." tone="gold">
          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
              <MapPin className="mt-0.5 h-4.5 w-4.5 text-manises-blue" />
              <div>
                <p className="text-sm font-black text-manises-blue">Calle Mayor, 45 · 46940 Manises (Valencia)</p>
                <p className="mt-1 text-[11px] font-semibold leading-relaxed text-slate-500">
                  Punto principal para recogidas, información comercial y gestión presencial de lotería.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
              <Truck className="mt-0.5 h-4.5 w-4.5 text-manises-blue" />
              <div>
                <p className="text-sm font-black text-manises-blue">Mensajería y envíos</p>
                <p className="mt-1 text-[11px] font-semibold leading-relaxed text-slate-500">
                  Si tienes una compra con entrega física, aquí podrás resolver dudas de seguimiento y plazos.
                </p>
              </div>
            </div>
          </div>
          <Button variant="outline" className="mt-3 w-full rounded-xl border-slate-200 text-manises-blue">
            Cómo llegar
          </Button>
        </PremiumSectionCard>
      </div>
    </div>
  );
}
