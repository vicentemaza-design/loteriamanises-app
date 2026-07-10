import { ProfileSubHeader } from '@/features/profile/components/ProfileSubHeader';

interface TableRow { sorteo: string; plazo: string; }
interface Section {
  num: string;
  title: string;
  body?: string;
  table?: TableRow[];
  tableNote?: string;
}

const SECTIONS: Section[] = [
  {
    num: '1',
    title: 'Servicio voluntario de abono',
    body: `El Abono es un servicio voluntario que ofrece Lotería Manises para facilitar la compra de tus números preferidos de Lotería Nacional en los sorteos que elijas:\n\n• Jueves\n• Sábado\n• Navidad\n• Niño`,
  },
  {
    num: '2',
    title: 'Funcionamiento del abono',
    body: `Al solicitar un abono, asignaremos los números de nuestra Administración que hayas seleccionado y los mantendremos reservados temporalmente para los sorteos indicados, siempre sujetos al cumplimiento de las presentes condiciones.\n\nEl importe de los décimos podrá abonarse:\n\n• Sorteo a sorteo.\n• Mediante pago mensual, cuando esta modalidad esté disponible.`,
  },
  {
    num: '3',
    title: 'Validez del abono',
    body: `El abono no tendrá validez mientras el pago correspondiente no haya sido confirmado dentro del plazo establecido para cada sorteo.\n\nEl abono únicamente se considerará correctamente tramitado cuando:\n\n• el pago figure como confirmado, y\n• el pedido aparezca en tu cuenta de cliente con el estado CONFIRMADO.\n\nHasta ese momento, la participación no se considerará formalizada.\n\nLos plazos se computan en horas hábiles. Si existen festivos locales o nacionales, deberás realizar el pago con la antelación suficiente.`,
  },
  {
    num: '4',
    title: 'Plazos máximos de pago',
    body: 'Los abonos deberán abonarse y confirmarse antes de los siguientes plazos:',
    table: [
      { sorteo: 'Lotería Nacional – Jueves', plazo: '30 h antes del inicio' },
      { sorteo: 'Lotería Nacional – Sábado', plazo: '30 h antes del inicio' },
      { sorteo: 'Sorteo de Navidad', plazo: '96 h (4 días) antes del inicio' },
      { sorteo: 'Sorteo del Niño', plazo: '96 h (4 días) antes del inicio' },
    ],
    tableNote: 'Si el cierre coincide con un festivo local o nacional, el plazo podrá adelantarse para garantizar la correcta gestión del pedido.',
  },
  {
    num: '5',
    title: 'Finalización de la reserva',
    body: `Una vez superado el plazo de pago correspondiente:\n\n• la reserva del número finalizará automáticamente;\n• el décimo podrá ponerse nuevamente a la venta.\n\nSi el número continúa disponible, podrá adquirirse como una compra normal desde la web, sin que exista vinculación con el abono anterior.`,
  },
  {
    num: '6',
    title: 'Modalidades de abono',
    body: `Es posible abonarse a uno o varios números para cualquiera de las siguientes modalidades:\n\n• Todos los sorteos de los jueves.\n• Todos los sorteos de los sábados (ordinarios, especiales y extraordinarios). No incluye Navidad ni Niño.\n• Sorteo Extraordinario de Navidad.\n• Sorteo Extraordinario del Niño.\n\nCada modalidad funciona de forma independiente.`,
  },
  {
    num: '7',
    title: 'Modificación y cancelación',
    body: `Podrás modificar, ampliar o cancelar tus abonos desde tu cuenta de cliente, siempre que el cambio se realice antes del plazo límite del sorteo correspondiente.\n\nAsimismo:\n\n• Si dos sorteos consecutivos no son abonados dentro del plazo establecido, el sistema podrá cancelar automáticamente el abono.\n• También podrás solicitar la baja enviando un correo electrónico a info@loteriamanises.com, indicando:\n  – Nombre y apellidos.\n  – Número de cliente.\n  – Número o números que deseas dar de baja.`,
  },
  {
    num: '8',
    title: 'Información importante',
    body: `La solicitud de un abono constituye únicamente una petición de reserva del número.\n\nLa venta del décimo y la participación en el sorteo únicamente quedan formalizadas cuando:\n\n• el pago ha sido correctamente confirmado;\n• el pedido figura con estado CONFIRMADO dentro de tu cuenta de cliente;\n• y todo ello se ha realizado dentro de los plazos establecidos.\n\nHasta ese momento, Lotería Manises no garantiza la disponibilidad definitiva del número solicitado.`,
  },
  {
    num: '9',
    title: 'Activación del abono',
    body: `Para evitar reservas sin intención real de compra, la solicitud de un nuevo abono no quedará definitivamente activada hasta que el cliente complete correctamente la compra del primer sorteo asociado al abono.\n\nUna vez verificada dicha compra, Lotería Manises procederá a validar el abono y éste quedará activo para los siguientes sorteos conforme a las condiciones establecidas.`,
  },
];

export function CondicionesAbonosPage() {
  return (
    <div className="min-h-full bg-background">
      <ProfileSubHeader title="Condiciones de Abonos" subtitle="Servicio de abono de Lotería Nacional" />

      <div className="p-4 pb-10">
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
              <div className="pl-9">
                {s.body && (
                  <p className="text-[12px] font-medium leading-relaxed text-slate-600 whitespace-pre-line">
                    {s.body}
                  </p>
                )}
                {s.table && (
                  <div className="mt-2 overflow-x-auto rounded-xl border border-slate-100">
                    <table className="w-full text-[11px]">
                      <thead>
                        <tr className="bg-manises-blue/5">
                          <th className="px-3 py-2 text-left font-black text-manises-blue">Sorteo</th>
                          <th className="px-3 py-2 text-left font-black text-manises-blue">Plazo máximo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {s.table.map((row, i) => (
                          <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                            <td className="px-3 py-2 font-semibold text-slate-700">{row.sorteo}</td>
                            <td className="px-3 py-2 font-medium text-slate-500">{row.plazo}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {s.tableNote && (
                  <p className="mt-2 text-[11px] font-medium italic text-slate-400">{s.tableNote}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-[10px] font-semibold text-slate-400 text-center leading-relaxed">
            LOTERÍA MANISES, S.L. · CIF B98483522{'\n'}
            info@loteriamanises.com
          </p>
        </div>
      </div>
    </div>
  );
}
