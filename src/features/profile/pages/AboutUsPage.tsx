import { Award, Building2, MapPin, Users } from 'lucide-react';
import adminFacade from '@/assets/images/administracion_manises.webp';
import { ProfileSubHeader } from '../components/ProfileSubHeader';

const STATS = [
  { icon: Building2, value: 'Admon. nº 3', label: 'Administración oficial' },
  { icon: Users, value: 'Miles de visitas', label: 'Jugadores de toda España' },
  { icon: Award, value: 'Más de 350 M€', label: 'Premios repartidos' },
];

export function AboutUsPage() {
  return (
    <div className="flex min-h-full flex-col bg-background pb-20">
      <ProfileSubHeader title="Quiénes somos" subtitle="Historia, ubicación y forma de trabajar" />

      <div className="flex flex-col gap-4 p-4">
        <section className="overflow-hidden rounded-[1.8rem] border border-slate-100 bg-white shadow-sm">
          <img src={adminFacade} alt="Administración Lotería Manises" className="h-56 w-full object-cover" />
          <div className="p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Lotería Manises</p>
            <h2 className="mt-2 text-xl font-black text-manises-blue">Una administración con presencia física, trato directo y experiencia real</h2>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-600">
              Queremos que esta pantalla transmita quién está detrás del servicio: una administración oficial, con ubicación clara, atención cercana y una trayectoria reconocible para el usuario.
            </p>
          </div>
        </section>

        <div className="grid grid-cols-3 gap-3">
          {STATS.map((item) => (
            <div key={item.label} className="rounded-[1.35rem] border border-slate-100 bg-white px-3 py-4 text-center shadow-sm">
              <item.icon className="mx-auto h-5 w-5 text-manises-gold" />
              <p className="mt-2 text-sm font-black text-manises-blue">{item.value}</p>
              <p className="mt-1 text-[10px] font-semibold leading-tight text-slate-500">{item.label}</p>
            </div>
          ))}
        </div>

        <section className="rounded-[1.6rem] border border-slate-100 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-black text-manises-blue">Qué queremos transmitir aquí</h3>
          <div className="mt-3 space-y-3 text-sm font-semibold leading-relaxed text-slate-600">
            <p>La app no debe sonar a claim genérico ni a creatividad artificial. Debe sentirse como la extensión digital de una administración real, reconocible y solvente.</p>
            <p>Por eso priorizamos hechos concretos: ubicación, atención al cliente, volumen de visitas, premios repartidos e historia de la administración.</p>
            <p>El tono es sobrio, cercano y confiable. Menos eslogan y más identidad de negocio.</p>
          </div>
        </section>

        <section className="rounded-[1.6rem] border border-slate-100 bg-white p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-manises-blue" />
            <div>
              <h3 className="text-sm font-black text-manises-blue">Dónde estamos</h3>
              <p className="mt-1 text-sm font-semibold text-slate-600">Calle Mayor, 45 · 46940 Manises (Valencia)</p>
              <p className="mt-1 text-[11px] font-semibold leading-relaxed text-slate-500">
                Un punto de referencia para quienes compran presencialmente y para quienes quieren saber que detrás de la app hay una administración física y accesible.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
