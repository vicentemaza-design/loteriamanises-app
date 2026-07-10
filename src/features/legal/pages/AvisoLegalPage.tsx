import { ProfileSubHeader } from '@/features/profile/components/ProfileSubHeader';

const SECTIONS = [
  {
    num: '1',
    title: 'Datos identificativos del titular',
    body: `En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSICE), se facilitan los siguientes datos:\n\nRazón social: LOTERÍA MANISES, S.L.\nCIF: B98483522\nDomicilio social: Avda. dels Tramvies, 12 – 46940 Manises (Valencia) – España\nTeléfono: +34 961 532 260\nCorreo electrónico: disponible en www.loteriamanises.com\nActividad: Venta de productos de Loterías y Apuestas del Estado\nAdministración nº: 461630003 · Receptor nº: 81980`,
  },
  {
    num: '2',
    title: 'Objeto y ámbito de aplicación',
    body: `El presente Aviso Legal regula el acceso y uso del sitio web www.loteriamanises.com y de la aplicación móvil de Lotería Manises (en adelante, "los Servicios"), así como sus contenidos y funcionalidades.\n\nEl acceso a los Servicios implica la aceptación plena y sin reservas de las presentes condiciones. LOTERÍA MANISES, S.L. se reserva el derecho a modificar el contenido de este Aviso Legal en cualquier momento, publicando la versión actualizada en los Servicios.`,
  },
  {
    num: '3',
    title: 'Propiedad intelectual e industrial',
    body: `Todos los contenidos de los Servicios (textos, imágenes, logotipos, gráficos, diseño, código fuente y demás elementos) son propiedad de LOTERÍA MANISES, S.L. o de terceros que han autorizado su uso, y están protegidos por las leyes de propiedad intelectual e industrial vigentes.\n\nQueda prohibida la reproducción, distribución, comunicación pública o transformación de dichos contenidos sin autorización expresa y por escrito del titular, salvo los usos privativos permitidos por la ley.`,
  },
  {
    num: '4',
    title: 'Condiciones de uso',
    body: `El usuario se compromete a hacer un uso adecuado y lícito de los Servicios, de conformidad con la legislación vigente, el presente Aviso Legal, las Condiciones Generales de Contratación y la Política de Privacidad.\n\nQueda expresamente prohibido:\n• Utilizar los Servicios con fines fraudulentos o ilícitos.\n• Acceder a cuentas ajenas o suplantar la identidad de terceros.\n• Introducir virus u otros elementos dañinos.\n• Intentar acceder, alterar o sustraer datos de otros usuarios o del sistema.\n• Usar los Servicios si se es menor de 18 años o no se tiene plena capacidad legal.`,
  },
  {
    num: '5',
    title: 'Exclusión de responsabilidad',
    body: `LOTERÍA MANISES, S.L. no se responsabiliza de los daños y perjuicios de cualquier naturaleza que pudieran ocasionarse como consecuencia de:\n\n• Fallos o interrupciones en el acceso a los Servicios por causas ajenas a su control.\n• La presencia de virus u otros elementos lesivos en los contenidos transmitidos.\n• El uso ilícito, negligente o fraudulento de los Servicios por parte de los usuarios.\n• Errores u omisiones en los contenidos publicados, más allá de los billetes y resguardos en custodia.`,
  },
  {
    num: '6',
    title: 'Política de privacidad y protección de datos',
    body: `El tratamiento de los datos personales recabados a través de los Servicios se rige por lo dispuesto en la Política de Privacidad de LOTERÍA MANISES, S.L., conforme al Reglamento (UE) 2016/679 (RGPD) y la normativa española vigente en materia de protección de datos.`,
  },
  {
    num: '7',
    title: 'Política de cookies',
    body: `Los Servicios pueden utilizar cookies propias y de terceros con distintas finalidades (técnicas, analíticas o de personalización). Para más información consulte la Política de Cookies disponible en www.loteriamanises.com.`,
  },
  {
    num: '8',
    title: 'Enlace a sitios de terceros',
    body: `Los Servicios pueden incluir enlaces a sitios web de terceros. LOTERÍA MANISES, S.L. no controla ni se responsabiliza de los contenidos, políticas de privacidad o prácticas de dichos sitios. Se recomienda al usuario revisar los avisos legales y políticas de privacidad de cada sitio que visite.`,
  },
  {
    num: '9',
    title: 'Ley aplicable y jurisdicción',
    body: `El presente Aviso Legal se rige por la legislación española. Para la resolución de cualquier controversia derivada del acceso o uso de los Servicios, las partes se someten, con renuncia expresa a cualquier otro fuero, a los Juzgados y Tribunales de Quart de Poblet (Valencia).`,
  },
];

export function AvisoLegalPage() {
  return (
    <div className="min-h-full bg-background">
      <ProfileSubHeader title="Aviso Legal" subtitle="Lotería Manises, S.L." />

      <div className="p-4 pb-10">
        <p className="text-[11px] font-semibold text-slate-400 mb-6">
          Última actualización: enero 2024 · Ley 34/2002 (LSSICE)
        </p>

        <div className="flex flex-col gap-5">
          {SECTIONS.map((s) => (
            <div key={s.num} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3 mb-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-manises-blue text-[10px] font-black text-white">
                  {s.num}
                </span>
                <h2 className="text-[13px] font-black text-manises-blue leading-tight pt-0.5">
                  {s.title}
                </h2>
              </div>
              <p className="text-[12px] font-medium leading-relaxed text-slate-600 whitespace-pre-line pl-9">
                {s.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-[10px] font-semibold text-slate-400 text-center leading-relaxed">
            LOTERÍA MANISES, S.L. · CIF B98483522{'\n'}
            Avda. dels Tramvies 12 · 46940 Manises (Valencia)
          </p>
        </div>
      </div>
    </div>
  );
}
