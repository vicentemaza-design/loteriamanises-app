import { useState } from 'react';
import { Input } from '@/shared/ui/Input';
import { Truck, CheckCircle } from 'iconoir-react/regular';
import { cn } from '@/shared/lib/utils';

const DEMO_ADDRESS = {
  name: 'Juan',
  surname: 'Pérez Demo',
  phone: '600 000 000',
  cp: '46940',
  address: 'Calle Mayor, 1',
  city: 'Manises',
  province: 'Valencia',
};

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
  const [editing, setEditing] = useState(false);

  return (
    <div className="rounded-2xl border border-manises-blue/10 bg-slate-50/50 p-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-manises-blue" />
          <h4 className="text-[11px] font-black uppercase tracking-widest text-manises-blue">
            Dirección de envío
          </h4>
        </div>
        <div className="flex items-center gap-2">
          {!editing && (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[8px] font-black uppercase tracking-wider text-emerald-700">
              <CheckCircle className="h-3 w-3" />
              Guardada
            </span>
          )}
          <button
            type="button"
            onClick={() => setEditing(v => !v)}
            className={cn(
              'rounded-full border px-2.5 py-1 text-[8px] font-black uppercase tracking-wider transition-colors',
              editing
                ? 'border-manises-blue/20 bg-manises-blue/[0.05] text-manises-blue'
                : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
            )}
          >
            {editing ? 'Guardar' : 'Modificar'}
          </button>
        </div>
      </div>

      {/* Resumen de dirección guardada */}
      {!editing && (
        <div className="space-y-0.5">
          <p className="text-[12px] font-black text-manises-blue">
            {DEMO_ADDRESS.name} {DEMO_ADDRESS.surname}
          </p>
          <p className="text-[11px] font-medium text-slate-500">{DEMO_ADDRESS.address}</p>
          <p className="text-[11px] font-medium text-slate-500">
            {DEMO_ADDRESS.cp} {DEMO_ADDRESS.city}, {DEMO_ADDRESS.province}
          </p>
          <p className="text-[11px] font-medium text-slate-400">{DEMO_ADDRESS.phone}</p>
        </div>
      )}

      {/* Formulario de edición */}
      {editing && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nombre" placeholder="Nombre" defaultValue={DEMO_ADDRESS.name} />
            <Field label="Apellidos" placeholder="Apellidos" defaultValue={DEMO_ADDRESS.surname} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Teléfono" placeholder="600 000 000" defaultValue={DEMO_ADDRESS.phone} />
            <Field label="CP" placeholder="46940" defaultValue={DEMO_ADDRESS.cp} />
          </div>

          <Field label="Dirección" placeholder="Calle, número, piso" defaultValue={DEMO_ADDRESS.address} />

          <div className="grid grid-cols-2 gap-3">
            <Field label="Municipio" placeholder="Municipio" defaultValue={DEMO_ADDRESS.city} />
            <Field label="Provincia" placeholder="Provincia" defaultValue={DEMO_ADDRESS.province} />
          </div>

          <div className="rounded-xl bg-amber-50 border border-amber-100 p-2.5">
            <p className="text-[9px] font-bold text-amber-800 leading-tight">
              Demo · no se realizará ningún envío real
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
