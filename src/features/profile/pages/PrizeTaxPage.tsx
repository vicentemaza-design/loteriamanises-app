import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { ProfileSubHeader } from '../components/ProfileSubHeader';
import { PremiumSectionCard } from '../components/PremiumSectionCard';

const SECTIONS = [
  {
    title: 'Cobro de premios',
    description: 'Cómo y dónde se cobran los premios de lotería.',
    content: 'Los premios pequeños se abonan en saldo. Los premios mayores siguen el proceso oficial de validación y pago conforme a la normativa aplicable.',
  },
  {
    title: 'Fiscalidad',
    description: 'Información sobre retenciones y tributación.',
    content: 'Los premios sujetos a gravamen especial se liquidan con la retención correspondiente en origen. Cuando aplique, podrás solicitar justificantes y certificados.',
  },
  {
    title: 'Plazos de cobro',
    description: 'Cuándo puedes disponer de tu premio.',
    content: 'Cada tipo de premio tiene su plazo operativo. En retiradas bancarias, la transferencia puede tardar hasta 72 horas hábiles.',
  },
  {
    title: 'Certificados y justificantes',
    description: 'Documentación útil para trámites posteriores.',
    content: 'Si necesitas acreditar el origen de fondos o justificar un premio, la administración puede facilitar los certificados correspondientes.',
  },
];

export function PrizeTaxPage() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="flex min-h-full flex-col bg-background pb-20">
      <ProfileSubHeader title="Premios y fiscalidad" subtitle="Guía rápida sobre cobros y documentación" />

      <div className="flex flex-col gap-4 p-4">
        <PremiumSectionCard
          title="Información útil"
          eyebrow="Orientación general"
          description="Consulta rápida para entender cómo se gestionan los cobros, los impuestos y la documentación de tus premios."
          tone="gold"
        >
          <p className="text-sm font-semibold leading-relaxed text-slate-600">
            La idea aquí es que el usuario encuentre una referencia clara y ordenada sin tener que salir a buscar esta información fuera de la app.
          </p>
        </PremiumSectionCard>

        <div className="space-y-3">
          {SECTIONS.map((section, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={section.title} className="overflow-hidden rounded-[1.45rem] border border-slate-100 bg-white shadow-sm">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
                >
                  <div>
                    <p className="text-sm font-black text-manises-blue">{section.title}</p>
                    <p className="mt-1 text-[11px] font-semibold text-slate-500">{section.description}</p>
                  </div>
                  <ChevronDown className={`h-4 w-4 shrink-0 text-slate-300 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="border-t border-slate-100 px-4 py-4">
                    <p className="text-sm font-semibold leading-relaxed text-slate-600">{section.content}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
