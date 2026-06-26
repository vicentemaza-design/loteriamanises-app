import { Input } from '@/shared/ui/Input';
import { Truck, CheckCircle } from 'iconoir-react/regular';

function Field({ label, placeholder, defaultValue }: { label: string; placeholder: string; defaultValue?: string }) {
  return (
    <label className="space-y-1">
      <span className="block text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</span>
      <Input
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="bg-white text-[12px] font-semibold text-manises-blue"
      />
    </label>
  );
}

export function NationalShippingForm() {
  return (
    <div className="rounded-2xl border border-manises-blue/10 bg-slate-50/50 p-4 space-y-4">
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-2">
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-manises-blue" />
          <h4 className="text-[11px] font-black uppercase tracking-widest text-manises-blue">
            Datos de envío
          </h4>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[8px] font-black uppercase tracking-wider text-emerald-700">
          <CheckCircle className="h-3 w-3" />
          Guardada
        </span>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nombre" placeholder="Nombre" defaultValue="Juan" />
          <Field label="Apellidos" placeholder="Apellidos" defaultValue="Pérez Demo" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Teléfono" placeholder="600 000 000" defaultValue="600 000 000" />
          <Field label="CP" placeholder="46940" defaultValue="46940" />
        </div>

        <Field label="Dirección" placeholder="Calle, número, piso" defaultValue="Calle Mayor, 1" />

        <div className="grid grid-cols-2 gap-3">
          <Field label="Municipio" placeholder="Municipio" defaultValue="Manises" />
          <Field label="Provincia" placeholder="Provincia" defaultValue="Valencia" />
        </div>
      </div>

      <div className="pt-2">
        <div className="rounded-xl bg-amber-50 border border-amber-100 p-2.5">
          <p className="text-[9px] font-bold text-amber-800 leading-tight">
            Demo · no se realizará ningún envío real
          </p>
          <p className="mt-1 text-[8px] font-medium text-amber-700">
            Puedes reutilizar o editar esta dirección antes de continuar.
          </p>
        </div>
      </div>
    </div>
  );
}
