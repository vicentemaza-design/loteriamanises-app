import { ProfileSubHeader } from '@/features/profile/components/ProfileSubHeader';

const SECTIONS = [
  {
    title: 'Información corporativa',
    body: `Este sitio web es propiedad y está gestionado por LOTERÍA MANISES, S.L. (en adelante, Lotería Manises) y es una web de loterías y apuestas, punto Oficial de Venta de Loterías y Apuestas del Estado, con número de Administración de Loterías 461630003 y número de Receptor 81980.\n\nLos datos del titular son los siguientes:\n\nLOTERÍA MANISES, S.L.\nCIF: B98483522\nTeléfono de contacto: +34 961 532 260\nDirección de contacto: Avda. dels Tramvies 12 – 46940 Manises (Valencia) - ESPAÑA\nCorreo electrónico: info@loteriamanises.com\n\nPara cualquier tipo de consulta o sugerencia, puede ponerse en contacto con la compañía mediante el envío de comunicación escrita a Avda. dels Tramvies 12 – 46940 Manises (Valencia), o bien mediante escrito al correo electrónico info@loteriamanises.com. La solicitud deberá contener el nombre y apellidos del interesado, fotocopia del D.N.I. (o, en su caso, pasaporte), petición en que se concreta la solicitud, domicilio a efectos de notificaciones, fecha, firma y documentos acreditativos de la petición que se formula.`,
  },
  {
    title: 'Aceptación por el usuario',
    body: `En el presente Aviso Legal se incorporan las cláusulas relativas a las condiciones de uso que regulan el acceso y la navegación en el sitio web por parte del Usuario, ofrece información sobre los elementos y contenidos del sitio web y, de igual manera, regula la utilización de los mismos por parte del Usuario.\n\nLa utilización del sitio web por un tercero le atribuye la condición de Usuario y supone la aceptación plena del Usuario de todas y cada una de las condiciones que se incorporan en el presente Aviso Legal.\n\nLotería Manises se reserva el derecho de efectuar sin previo aviso las modificaciones que considere oportunas en su sitio web, pudiendo cambiar, suprimir o añadir tanto los contenidos y servicios que se presten a través de la misma como la forma en la que éstos aparezcan presentados o localizados.`,
  },
  {
    title: 'Uso correcto del sitio web',
    body: `El Usuario se compromete a utilizar el sitio web, los contenidos y servicios de conformidad con la Ley, el presente Aviso Legal, las buenas costumbres y el orden público. Del mismo modo el Usuario se obliga a no utilizar el sitio web o los servicios que se presten a través de él con fines o efectos ilícitos o contrarios al contenido del presente Aviso Legal, lesivos de los intereses o derechos de terceros, o que de cualquier forma pueda dañar, inutilizar o deteriorar el Web o sus servicios o impedir un normal disfrute del sitio web por otros Usuarios.\n\nAsimismo, el Usuario se compromete expresamente a no destruir, alterar, inutilizar o, de cualquier otra forma, dañar los datos, programas o documentos electrónicos y demás que se encuentren en el sitio web de Lotería Manises.\n\nEl Usuario se compromete a no obstaculizar el acceso de otros usuarios al servicio de acceso mediante el consumo masivo de los recursos informáticos a través de los cuales Lotería Manises presta el servicio, así como realizar acciones que dañen, interrumpan o generen errores en dichos sistemas.\n\nEl Usuario se compromete a no introducir programas, virus, macros, applets, controles ActiveX o cualquier otro dispositivo lógico o secuencia de caracteres que causen o sean susceptibles de causar cualquier tipo de alteración en los sistemas informáticos de Lotería Manises, o de terceros.`,
  },
  {
    title: 'Propiedad intelectual e industrial',
    body: `Todos los contenidos del Web, salvo que se indique lo contrario, son titularidad exclusiva de Lotería Manises y, con carácter enunciativo, que no limitativo, el diseño gráfico, código fuente, logos, textos, ilustraciones, fotografías, audio, videos y demás elementos que aparecen en el sitio web.\n\nIgualmente, todos los nombres comerciales, marcas o signos distintivos de cualquier clase contenidos en el Web están protegidos por la Ley.\n\nLotería Manises no concede ningún tipo de licencia o autorización de uso personal al Usuario sobre sus derechos de propiedad intelectual e industrial o sobre cualquier otro derecho relacionado con su sitio web y los servicios ofrecidos en la misma.\n\nPor ello, el Usuario reconoce que la reproducción, distribución, comercialización o transformación no autorizadas de los elementos indicados en los apartados anteriores constituye una infracción de los derechos de propiedad intelectual y/o industrial de Lotería Manises o del titular de los mismos. El usuario deberá abstenerse de eliminar, alterar, eludir o manipular cualquier dispositivo de protección o sistema de seguridad instalado en este sitio web.`,
  },
  {
    title: 'Régimen de responsabilidad',
    body: `El usuario se compromete a no utilizar esta página web y sus contenidos de forma contraria a lo dispuesto en el presente Aviso Legal y en la legislación vigente. El titular, en ningún caso, será responsable de los daños que pudiera causar el usuario por uso erróneo o indebido en relaciones con terceros, siendo responsabilidad única y exclusiva del Usuario del sitio web.\n\nEl sitio web solo contiene información general acerca de los productos y/o servicios prestados por el titular. Los enlaces o contenidos de terceros que aparezcan en esta página web tienen la finalidad de ampliar información, facilitar la búsqueda de información o servicios en Internet, pero su inclusión no implica la aceptación de los contenidos ni la asociación del titular con los responsables de los mismos.\n\nEn caso de que el usuario considere que existe en el sitio web algún contenido que pudiera ser susceptible de afectar o contravenir la legislación nacional o internacional, derechos de terceros o la moral y el orden público, se ruega lo notifique de forma inmediata a info@loteriamanises.com.\n\nLotería Manises se exonera de toda responsabilidad relativa a:\n\n• El funcionamiento de sus sitios web, incluyendo causas de fuerza mayor o cualesquiera otras ajenas a la voluntad de Lotería Manises.\n• El cumplimiento de las obligaciones que competen a Loterías y Apuestas del Estado frente a los compradores.\n• La suplantación que un tercero haga de un usuario mediante el empleo de sus claves de acceso o el uso de datos falsos o incorrectos.\n• Los posibles errores o deficiencias de seguridad por la utilización de un navegador de una versión no actualizada o insegura.\n• Los daños y perjuicios de cualquier naturaleza por actos ilícitos o fraudulentos del Usuario o por incumplimiento del presente aviso legal o de las Condiciones Generales de Contratación.\n• Los cambios normativos en la Regulación de Loterías y Apuestas del Estado que tengan un impacto importante en los servicios prestados.`,
  },
  {
    title: 'Responsabilidad por enlaces e hipervínculos',
    body: `Lotería Manises declina toda responsabilidad respecto a la información que se halle fuera del sitio web, ya que la función de los enlaces externos que aparecen es únicamente la de informar al Usuario sobre la existencia de otras fuentes de información sobre un tema en concreto.\n\nLotería Manises no ejerce ningún tipo de control sobre dichos sitios y contenidos ni asumirá responsabilidad alguna por los contenidos de algún enlace perteneciente a un sitio web ajeno, ni garantizará la disponibilidad técnica, calidad, fiabilidad, exactitud, amplitud, veracidad, validez y constitucionalidad de cualquier material o información contenida en ninguno de dichos hipervínculos u otros sitios de Internet.\n\nLotería Manises no autoriza el establecimiento de enlaces al presente sitio web desde aquellos sitios web que contengan informaciones, materiales o contenidos ilícitos, ilegales, discriminatorios, degradantes, obscenos o contrarios a la moral, el orden público o cualesquiera derechos de terceros.`,
  },
  {
    title: 'Seguridad',
    body: `Lotería Manises emplea los más altos estándares de seguridad en su sitio web. La comunicación entre su terminal y los servidores se establece de manera encriptada y se almacena en un "Servidor Seguro" de manera que nadie pueda acceder a ellos. El tratamiento de los datos lo realizará solamente personal autorizado y responsable de Lotería Manises.\n\nEl titular se reserva el derecho a denegar o retirar el acceso al sitio web y/o los servicios que se ofrecen sin necesidad de preaviso, a instancia propia o de un tercero, a aquellos usuarios que incumplan el presente Aviso Legal.`,
  },
  {
    title: 'Legislación aplicable y competencia judicial',
    body: `Cualquier controversia surgida de la interpretación o ejecución del presente Aviso Legal se interpretará bajo la legislación española.\n\nAsimismo, Lotería Manises y el Usuario, con renuncia a cualquier otro fuero, se someten a los juzgados y tribunales de Manises (Valencia).`,
  },
];

export function AvisoLegalPage() {
  return (
    <div className="min-h-full bg-background">
      <ProfileSubHeader title="Aviso Legal" subtitle="Lotería Manises, S.L." />

      <div className="p-4 pb-10">
        <p className="text-[11px] font-semibold text-slate-400 mb-6">
          Ley 34/2002, de 11 de julio (LSSICE)
        </p>

        <div className="flex flex-col gap-5">
          {SECTIONS.map((s, i) => (
            <div key={i} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3 mb-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-manises-blue text-[10px] font-black text-white">
                  {i + 1}
                </span>
                <h2 className="text-[13px] font-black text-manises-blue leading-tight pt-0.5 uppercase tracking-wide">
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
            Avda. dels Tramvies 12 · 46940 Manises (Valencia){'\n'}
            info@loteriamanises.com
          </p>
        </div>
      </div>
    </div>
  );
}
