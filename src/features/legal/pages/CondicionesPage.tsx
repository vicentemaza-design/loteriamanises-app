import { ProfileSubHeader } from '@/features/profile/components/ProfileSubHeader';

const SECTIONS = [
  {
    num: '1',
    title: 'Identificación',
    body: `LOTERÍA MANISES, S.L. opera como punto de venta oficial de lotería con número de Administración 461630003 y número de Receptor 81980.\n\nCIF: B98483522 · Teléfono: +34 961 532 260\nDirección: Avda. dels Tramvies 12 – 46940 Manises (Valencia) – ESPAÑA`,
  },
  {
    num: '2',
    title: 'Objeto',
    body: `La relación entre Lotería Manises y sus clientes a través de la plataforma web constituye una relación comercial privada para la gestión de jugadas de lotería. Esta relación sigue la misma normativa que las transacciones realizadas en el punto de venta físico y queda sujeta a todas las normas establecidas por Loterías y Apuestas del Estado.\n\nLa plataforma web no constituye juego virtual. Representa un método innovador pero tradicional de realizar transacciones de lotería con mayor comodidad tecnológica.\n\nLas compras web tienen idénticas consecuencias legales que las transacciones presenciales o telefónicas. Solo los billetes físicos emitidos por SELAE y los resguardos oficiales de los sistemas de validación de SELAE sirven como documentos válidos para el cobro de premios.`,
  },
  {
    num: '3',
    title: 'Registro de clientes',
    body: `Podrán registrarse como clientes las personas mayores de 18 años con plena capacidad legal, aceptando estas condiciones y la Política de Privacidad.\n\nVías de registro: Internet (formulario online), Teléfono (datos mínimos + SMS con enlace a condiciones) o correo electrónico. Los clientes no residentes podrán tener requisitos adicionales de documentación.\n\nLotería Manises se reserva el derecho de modificar los procedimientos de identificación y registro con aviso previo a los clientes.`,
  },
  {
    num: '4',
    title: 'Veracidad de datos y exención de responsabilidad',
    body: `Los usuarios declaran que toda la información facilitada es veraz, exacta y legítimamente suya. Se comprometen a mantener actualizados sus datos de contacto (teléfono y correo electrónico).\n\nLotería Manises declina toda responsabilidad por daños derivados del incumplimiento de esta obligación. El usuario es el único responsable de la confidencialidad de su cuenta y contraseña. Todas las transacciones realizadas a través de una cuenta de usuario son legalmente vinculantes para el titular.`,
  },
  {
    num: '5',
    title: 'Exclusiones',
    body: `No podrán registrarse: menores de 18 años, adultos sin capacidad legal, personas jurídicas de cualquier tipo, ni residentes en países donde la participación en loterías esté prohibida.\n\nLotería Manises se reserva el derecho a rechazar cualquier registro que pueda violar los principios de buena fe o hacer un uso indebido de sus servicios.`,
  },
  {
    num: '6',
    title: 'Precios',
    body: `Los precios de los productos dependen exclusivamente de las tarifas establecidas por Loterías y Apuestas del Estado en cada fecha de sorteo.\n\nLotería Manises identifica separadamente la compensación por servicios adicionales (como gestión de envíos), sujetos al IVA correspondiente. La empresa se reserva el derecho a modificar las tarifas de servicio en cualquier momento con notificación previa.`,
  },
  {
    num: '7',
    title: 'Pago',
    body: `Compras por Internet: el coste del producto se deduce directamente del saldo de la cuenta del usuario. El saldo puede recargarse inmediatamente con tarjeta bancaria o mediante transferencia bancaria (los fondos no están disponibles hasta su recepción y contabilización).\n\nSe aceptan únicamente tarjetas emitidas en España. El pago se confirma cuando los fondos ingresan en la cuenta bancaria de Lotería Manises. Los emails de confirmación incluyen un Certificado de Titularidad, Depósito y Validación de Jugada que debe conservarse hasta el cobro de cualquier premio.`,
  },
  {
    num: '8',
    title: 'Cuenta de usuario',
    body: `Los clientes tienen acceso a: información de saldo, recarga de cuenta (tarjeta bancaria o transferencia), historial de movimientos (recargas, jugadas y premios), solicitud de cobro de premios a través de la sección "Cobrar premios", acceso a detalles de compra y gestión de favoritos, abonos y cancelaciones.\n\nLas transferencias domésticas no tienen comisión. Los retiros destinados a la compra de décimos o relacionados con saldos promocionales están prohibidos. Ocasionalmente, premios mayores podrán estar temporalmente no disponibles para retiro.`,
  },
  {
    num: '9',
    title: 'Aceptación del pago y devoluciones',
    body: `Lotería Manises se reserva el derecho a denegar operaciones de clientes antes del envío del producto, requiriendo únicamente notificación simple y procesamiento del reembolso.\n\nLos reembolsos vuelven al saldo de la cuenta de juego o al método de pago original. En caso de imposibilidad, Lotería Manises podrá solicitar datos de cuenta bancaria alternativa con documentación de identidad.\n\nBajo el artículo 93(c) del Real Decreto Legislativo 1/2007, los productos adquiridos carecen de derecho de desistimiento. No se aceptan devoluciones ni cambios una vez completados los pedidos válidos.`,
  },
  {
    num: '10',
    title: 'Impago',
    body: `Las devoluciones de tarjeta bancaria generan comisiones de tramitación más impuestos aplicables, a cargo del cliente.\n\nLotería Manises podrá denegar o restringir el servicio a clientes con impagos registrados. Las deudas pendientes pueden resultar en la cancelación de pedidos pagados pero no enviados. Los clientes deben cubrir todos los costes de gestión de cobro de Lotería Manises, incluida la asistencia legal.`,
  },
  {
    num: '11',
    title: 'Caducidad de la cuenta de usuario',
    body: `Los saldos positivos en cuenta no tienen fecha de caducidad. Tras 24 meses de inactividad, Lotería Manises podrá aplicar una comisión mensual de mantenimiento de 3,00 € (IVA incluido) sin crear saldos negativos.\n\nLas cuentas inactivas durante más de 24 meses con saldo cero o mínimo podrán ser bloqueadas o canceladas.`,
  },
  {
    num: '12',
    title: 'Mecánica del juego',
    body: `Los clientes podrán realizar pedidos para uno o varios sorteos distribuidos en 1, 2, 3, 5, 10 o 15 semanas, con posibilidad de suscripción para renovación automática.\n\nLos productos adquiridos podrán consistir en billetes físicos emitidos por SELAE o resguardos oficiales de los sistemas de validación de SELAE. Ambos documentos tienen idéntica validez legal.\n\nPlazos de anulación de abono de Lotería Nacional:\n• Sorteos de jueves: hasta 30 horas antes del inicio\n• Sorteos de sábado: hasta 30 horas antes del inicio\n• Sorteo de Navidad: hasta 96 horas antes del inicio\n• Sorteo del Niño: hasta 96 horas antes del inicio\n\nLas fiestas locales o nacionales amplían los plazos 24 horas adicionales.\n\nPremios menores de 2.000 €: el cliente accede a la opción "Cobrar premios" del sitio web. Las transferencias se ejecutan en un máximo de tres días hábiles según el calendario de Manises (Valencia).\n\nPremios superiores a 2.000 €: el cliente debe enviar previamente copias del DNI/pasaporte, certificado bancario original y documento de poder notarial que autorice a Lotería Manises a cobrar premios en su nombre. Los pagos se transferirán únicamente a cuentas bancarias españolas. Tras recepción y validación de documentos, la transferencia se ejecuta en un máximo de 30 días hábiles.`,
  },
  {
    num: '13',
    title: 'Envíos',
    body: `Para servicios que incluyan expresamente el envío de décimos físicos, Lotería Manises emplea empresas de transporte con entregas en 24-48 horas.\n\nLotería Manises no asume responsabilidad por retrasos causados por las empresas de transporte. Los clientes podrán reclamar reembolso por errores de envío: (i) productos no entregados: tras verificación con la empresa de transporte, Lotería Manises ofrecerá productos de sustitución o reembolso; (ii) productos incorrectos enviados: Lotería Manises intentará reemplazarlos con los productos originalmente solicitados o disponibles, o procesará reembolsos.`,
  },
  {
    num: '14',
    title: 'Responsabilidad',
    body: `Lotería Manises no asume responsabilidad por:\n\n(i) Fallos de funcionalidad del sitio web por causas ajenas al control de la empresa.\n(ii) Uso no autorizado de nombre de usuario y contraseña.\n(iii) Errores del usuario en la introducción de datos de juego y lotería.\n(iv) Errores de impresión en comunicaciones; solo los billetes y resguardos en custodia son válidos.\n(v) Deficiencias de seguridad derivadas de versiones de navegador obsoletas o inseguras.\n(vi) Daños derivados de actos ilegales o fraudulentos de usuarios o terceros.\n(vii) Daños por incumplimiento por parte del usuario de estas Condiciones.\n(viii) Cambios normativos en los reglamentos de productos de Loterías y Apuestas del Estado.\n(ix) Escasez de stock o cancelación de jugadas.`,
  },
  {
    num: '15',
    title: 'Garantía de privacidad',
    body: `Lotería Manises garantiza la máxima confidencialidad y secreto en todos los procesos de registro, juego y cobro de premios. Todas las operaciones quedan sujetas a estrictos deberes de confidencialidad, sin perjuicio de las demandas legales o judiciales que requieran su divulgación.`,
  },
  {
    num: '16',
    title: 'Aviso legal',
    body: `El Aviso Legal publicado en el sitio web se aplica de forma complementaria o subsidiaria a estas Condiciones. Los clientes declaran conocer y aceptar su contenido.`,
  },
  {
    num: '17',
    title: 'Modificación y duración',
    body: `Lotería Manises podrá modificar estas Condiciones Generales en cualquier momento, indicando los cambios de forma destacada en www.loteriamanises.com. Las Condiciones permanecerán en vigor hasta las modificaciones publicadas posteriores.`,
  },
  {
    num: '18',
    title: 'Legislación aplicable y jurisdicción',
    body: `La legislación española regula los conflictos o controversias de interpretación relativos a estas condiciones y los servicios relacionados. Cualquier conflicto derivado de la visita al sitio web o el uso de los servicios se resolverá ante los Juzgados y Tribunales de Quart de Poblet (Valencia).`,
  },
  {
    num: '19',
    title: 'Contacto',
    body: `Las preguntas sobre estas Condiciones Generales deben dirigirse a la dirección de correo electrónico de contacto disponible en www.loteriamanises.com. Las reclamaciones reciben respuesta en un plazo de un mes según la normativa española de consumidores.`,
  },
];

export function CondicionesPage() {
  return (
    <div className="min-h-full bg-background">
      <ProfileSubHeader title="Condiciones Generales" subtitle="Lotería Manises, S.L." />

      <div className="p-4 pb-10">
        <p className="text-[11px] font-semibold text-slate-400 mb-6">
          Última actualización: enero 2024
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
