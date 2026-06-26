import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Clock3, ShieldCheck, WalletCards } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/ui/Button';
import { ProfileSubHeader } from '../components/ProfileSubHeader';
import { PremiumSectionCard } from '../components/PremiumSectionCard';

const SELF_EXCLUSION_OPTIONS = [
  { key: 'no', label: 'No' },
  { key: '15d', label: 'Durante 15 días' },
  { key: '30d', label: 'Durante 30 días' },
  { key: '3m', label: 'Durante 3 meses' },
  { key: '12m', label: 'Durante 12 meses' },
  { key: 'custom', label: 'Otro periodo' },
  { key: 'permanent', label: 'Permanente' },
];

export function ResponsibleGamingPage() {
  const navigate = useNavigate();
  const [monthlyLimit, setMonthlyLimit] = useState('200');
  const [selfExclusion, setSelfExclusion] = useState('no');

  return (
    <div className="flex min-h-full flex-col bg-background pb-20">
      <ProfileSubHeader title="Juego responsable" subtitle="Control del gasto y recursos de ayuda" />

      <div className="flex flex-col gap-4 p-4">
        <section className="rounded-[1.6rem] bg-manises-blue p-5 text-white shadow-lg">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/60">Compromiso de la administración</p>
          <h2 className="mt-2 text-xl font-black">Disfruta del juego como una actividad de ocio</h2>
          <p className="mt-2 text-sm font-semibold leading-relaxed text-white/75">
            Aquí tienes tus herramientas de control y varios apartados informativos para ayudarte a jugar con serenidad, transparencia y criterio.
          </p>
        </section>

        <PremiumSectionCard title="Límite mensual de juego" eyebrow="Control del gasto" description="Establece el importe máximo que podrás gastar al mes en compras." tone="blue">
          <div className="space-y-3">
            <input
              type="number"
              value={monthlyLimit}
              onChange={(event) => setMonthlyLimit(event.target.value)}
              className="h-12 w-full rounded-xl border border-slate-200 px-4 text-lg font-black text-manises-blue outline-none focus:border-manises-blue"
            />
            <p className="text-[11px] font-semibold text-slate-500">El límite se reinicia automáticamente el primer día de cada mes.</p>
            <Button className="w-full rounded-xl bg-manises-blue text-white" onClick={() => toast.success('Límite mensual actualizado en demo.')}>
              Guardar límite
            </Button>
          </div>
        </PremiumSectionCard>

        <PremiumSectionCard title="Autoexclusión" eyebrow="Protección de acceso" description="Restringe temporalmente el acceso a tu cuenta si necesitas parar." tone="default">
          <div className="space-y-3">
            <select
              value={selfExclusion}
              onChange={(event) => setSelfExclusion(event.target.value)}
              className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold text-manises-blue outline-none focus:border-manises-blue"
            >
              {SELF_EXCLUSION_OPTIONS.map((option) => (
                <option key={option.key} value={option.key}>{option.label}</option>
              ))}
            </select>
            {selfExclusion !== 'no' && (
              <>
                <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-4">
                  <p className="text-sm font-black text-amber-800">Aviso importante</p>
                  <p className="mt-1 text-[11px] font-semibold leading-relaxed text-amber-700/80">
                    Durante el periodo seleccionado no podrás acceder a tu cuenta ni realizar compras. Si después quieres volver a usarla, la reactivación seguirá el proceso de seguridad correspondiente.
                  </p>
                </div>
                <Button className="w-full rounded-xl bg-red-600 text-white hover:bg-red-700" onClick={() => toast.success('Solicitud de autoexclusión preparada en demo.')}>
                  Activar autoexclusión
                </Button>
              </>
            )}
          </div>
        </PremiumSectionCard>

        <PremiumSectionCard title="Información y ayuda" eyebrow="Recursos" description="Cuatro apartados para entender riesgos, pedir ayuda y conocer nuestras buenas prácticas." tone="gold">
          <div className="space-y-3">
            {[
              { id: 'play-smart', icon: ShieldCheck, title: 'Juega con responsabilidad', copy: 'Consejos y recomendaciones para un uso saludable.' },
              { id: 'important-info', icon: AlertTriangle, title: 'Información importante', copy: 'Riesgos del juego y señales de alerta.' },
              { id: 'need-help', icon: Clock3, title: '¿Necesitas ayuda?', copy: 'Recursos y organismos de apoyo.' },
              { id: 'good-practices', icon: WalletCards, title: 'Normas y buenas prácticas', copy: 'Compromiso de Lotería Manises con un juego seguro.' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(`/profile/gaming-control/${item.id}`)}
                className="flex w-full items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-4 text-left shadow-sm transition-all hover:border-manises-blue/15"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-manises-blue">
                  <item.icon className="h-4.5 w-4.5" />
                </span>
                <div>
                  <p className="text-sm font-black text-manises-blue">{item.title}</p>
                  <p className="mt-1 text-[11px] font-semibold text-slate-500">{item.copy}</p>
                </div>
              </button>
            ))}
          </div>
        </PremiumSectionCard>
      </div>
    </div>
  );
}
