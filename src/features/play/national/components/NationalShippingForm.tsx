import { Input } from '@/shared/ui/Input';
import { Truck } from 'iconoir-react/regular';

export function NationalShippingForm() {
  return (
    <div className="rounded-2xl border border-manises-blue/10 bg-slate-50/50 p-4 space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
        <Truck className="w-4 h-4 text-manises-blue" />
        <h4 className="text-[11px] font-black uppercase tracking-widest text-manises-blue">
          Datos de envío demo
        </h4>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-1 gap-3">
          <Input 
            label="Nombre y apellidos" 
            placeholder="Juan Pérez" 
            defaultValue="Juan Pérez (Demo)"
            readOnly
            className="bg-white/50"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input 
            label="Teléfono" 
            placeholder="600 000 000" 
            defaultValue="600 000 000"
            readOnly
            className="bg-white/50"
          />
          <Input 
            label="Código Postal" 
            placeholder="46940" 
            defaultValue="46940"
            readOnly
            className="bg-white/50"
          />
        </div>

        <Input 
          label="Dirección" 
          placeholder="Calle Mayor, 1" 
          defaultValue="Calle Mayor, 1 (Demo)"
          readOnly
          className="bg-white/50"
        />

        <div className="grid grid-cols-2 gap-3">
          <Input 
            label="Localidad" 
            placeholder="Manises" 
            defaultValue="Manises"
            readOnly
            className="bg-white/50"
          />
          <Input 
            label="Provincia" 
            placeholder="Valencia" 
            defaultValue="Valencia"
            readOnly
            className="bg-white/50"
          />
        </div>
      </div>

      <div className="pt-2">
        <div className="rounded-xl bg-amber-50 border border-amber-100 p-2.5">
          <p className="text-[9px] font-bold text-amber-800 leading-tight">
            ⚠️ Demo · no se realizará ningún envío real
          </p>
          <p className="mt-1 text-[8px] font-medium text-amber-700">
            Datos de envío pendientes de integración con logística local.
          </p>
        </div>
      </div>
    </div>
  );
}
