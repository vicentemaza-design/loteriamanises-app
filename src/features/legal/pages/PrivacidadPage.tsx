import { ProfileSubHeader } from '@/features/profile/components/ProfileSubHeader';

const SECTIONS = [
  {
    num: '1',
    title: 'Información general, finalidad de los datos y consentimiento',
    body: `LOTERÍA MANISES, S.L. trata los datos personales conforme al Reglamento (UE) 2016/679 (RGPD). Los usuarios prestan su consentimiento informado al aceptar esta Política de Privacidad, lo que permite la prestación del servicio, la gestión de solicitudes y el mantenimiento de la relación contractual.\n\nFinalidades del tratamiento:\nGestionar la relación con los clientes, incluyendo la contratación de servicios, el envío de presupuestos, la respuesta a solicitudes, el mantenimiento contractual y las comunicaciones comerciales. Los datos de los clientes garantizan la seguridad durante todo el ciclo de vida de la apuesta, desde la realización hasta el cobro del premio. Las comunicaciones incluyen la confirmación de recepción, validación, pago de premios e información sobre loterías.\n\nEjercicio de derechos (RGPD):\nLos usuarios pueden ejercitar sus derechos de acceso, rectificación, supresión, limitación del tratamiento, oposición y portabilidad. Las solicitudes deben enviarse a: Avda. dels Tramvies 12 – 46940 Manises (Valencia), adjuntando nombre, fotocopia del DNI, detalle de la solicitud, dirección de notificación, fecha y firma.`,
  },
  {
    num: '2',
    title: 'Conservación de datos',
    body: `Los datos personales se conservarán un máximo de 2 años, salvo que sea necesario para mantener relaciones legales o contractuales previas.`,
  },
  {
    num: '3',
    title: 'Origen de los datos',
    body: `La empresa obtiene los datos directamente de los interesados; no se realizan compras de datos a terceros. Las categorías de datos incluyen datos identificativos, circunstancias personales e información económica. No se tratan datos de categorías especiales.`,
  },
  {
    num: '4',
    title: 'Cumplimiento normativo',
    body: `El prestador cumple con el RGPD y la Ley española 34/2002 sobre Servicios de la Sociedad de la Información y Comercio Electrónico (LSSICE).`,
  },
  {
    num: '5',
    title: 'Comunicaciones por correo electrónico',
    body: `Las comunicaciones atienden las solicitudes e inquietudes de los usuarios. Los usuarios consienten el tratamiento para informarles sobre los productos de LOTERÍA MANISES por cualquier medio, incluido el correo electrónico. Los destinatarios dispondrán de mecanismos sencillos y gratuitos para oponerse al tratamiento con fines promocionales conforme a la Ley 34/2002.`,
  },
  {
    num: '6',
    title: 'Datos de terceros',
    body: `Los usuarios que faciliten datos personales de terceros deberán informar a dichas personas de las condiciones de privacidad aquí descritas. El operador del sitio web no asume responsabilidad alguna por el incumplimiento de esta obligación.`,
  },
  {
    num: '7',
    title: 'Menores de edad',
    body: `Este sitio web no está dirigido a menores de edad. El envío de datos de menores no está autorizado. El operador no asume responsabilidad alguna por infracciones en este sentido.`,
  },
  {
    num: '8',
    title: 'Medidas de seguridad',
    body: `El responsable del tratamiento implanta las medidas técnicas y organizativas de seguridad necesarias para proteger la integridad de los datos personales frente al acceso no autorizado, alteración o pérdida, conforme al artículo 32 del RGPD.\n\nMecanismos específicos:\n• Confidencialidad, integridad, disponibilidad y resiliencia permanentes del sistema\n• Rápida restauración de la disponibilidad de los datos tras incidentes\n• Verificación regular de la eficacia de las medidas de seguridad implantadas\n• Seudonimización y cifrado de datos donde sea aplicable`,
  },
  {
    num: '9',
    title: 'Deber de confidencialidad y secreto',
    body: `Los empleados de LOTERÍA MANISES y los encargados del tratamiento autorizados mantienen estricta confidencialidad. Se advierte a los usuarios que las comunicaciones por Internet carecen de invulnerabilidad total.`,
  },
  {
    num: '10',
    title: 'Modificaciones de la política',
    body: `El titular del sitio web se reserva el derecho a modificar esta Política de Privacidad sin previo aviso, motivado por cambios legislativos, jurisprudenciales o doctrinales. Las modificaciones se publican un día antes de su entrada en vigor.`,
  },
  {
    num: '11',
    title: 'Política de cookies',
    body: `Información adicional sobre el uso de cookies está disponible en la Política de Cookies del sitio web www.loteriamanises.com.`,
  },
  {
    num: '12',
    title: 'Contacto',
    body: `Para cualquier consulta sobre privacidad, puede contactar con nosotros a través del correo electrónico de contacto disponible en www.loteriamanises.com.`,
  },
];

export function PrivacidadPage() {
  return (
    <div className="min-h-full bg-background">
      <ProfileSubHeader title="Política de Privacidad" subtitle="Lotería Manises, S.L." />

      <div className="p-4 pb-10">
        <p className="text-[11px] font-semibold text-slate-400 mb-6">
          Última actualización: enero 2024 · Reglamento (UE) 2016/679 (RGPD)
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
