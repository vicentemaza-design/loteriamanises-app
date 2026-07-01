import { useState, type ChangeEvent } from 'react';
import { motion } from 'motion/react';
import { Xmark, MapPin, Phone, Mail, User, Trash, EditPencil, NavArrowRight } from 'iconoir-react/regular';
import { useAuth } from '@/features/auth/hooks/useAuth';

export interface ShippingAddress {
  name: string;
  phone: string;
  email: string;
  street: string;
  cp: string;
  city: string;
  province: string;
  country: string;
}

interface ShippingAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: ShippingAddress) => void;
  savedAddress?: ShippingAddress | null;
}

const EMPTY: ShippingAddress = {
  name: '', phone: '', email: '', street: '', cp: '', city: '', province: 'Valencia', country: 'España',
};

function AddressForm({ initial, onSave, onCancel }: { initial: ShippingAddress; onSave: (a: ShippingAddress) => void; onCancel: () => void }) {
  const [form, setForm] = useState(initial);
  const set = (k: keyof ShippingAddress) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const valid = form.name && form.phone && form.email && form.street && form.cp && form.city;

  const field = (icon: { type: string } | null, key: keyof ShippingAddress, placeholder: string, type = 'text', required = false) => (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
      {icon && <span className="shrink-0 text-slate-400">{icon}</span>}
      <input
        type={type}
        placeholder={`${placeholder}${required ? ' *' : ''}`}
        value={form[key]}
        onChange={set(key)}
        className="flex-1 bg-transparent text-[13px] font-medium text-manises-blue placeholder:text-slate-400 outline-none"
      />
    </div>
  );

  return (
    <div className="space-y-2.5">
      {field(<User className="h-4 w-4" />, 'name', 'Nombre y apellidos', 'text', true)}
      {field(<Phone className="h-4 w-4" />, 'phone', 'Teléfono móvil', 'tel', true)}
      {field(<Mail className="h-4 w-4" />, 'email', 'Email', 'email', true)}
      {field(<MapPin className="h-4 w-4" />, 'street', 'Dirección', 'text', true)}
      <div className="grid grid-cols-2 gap-2">
        {field(null, 'cp', 'Código postal *')}
        {field(null, 'city', 'Población *')}
      </div>
      {field(null, 'province', 'Provincia')}
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
        <span className="shrink-0 text-slate-400 text-[13px]">🌍</span>
        <select value={form.country} onChange={set('country')} className="flex-1 bg-transparent text-[13px] font-medium text-manises-blue outline-none">
          <option>España</option>
          <option>Portugal</option>
          <option>Francia</option>
          <option>Andorra</option>
        </select>
      </div>
      <p className="text-[10px] text-slate-400 font-medium px-1">* Campos obligatorios · El teléfono es imprescindible para el envío.</p>
      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onCancel}
          className="flex-1 rounded-2xl border border-slate-200 py-3.5 text-[13px] font-black text-slate-500 transition-all active:scale-[0.98]">
          Cancelar
        </button>
        <button type="button" onClick={() => valid && onSave(form)} disabled={!valid}
          className="flex-1 rounded-2xl bg-manises-blue py-3.5 text-[13px] font-black text-white shadow-sm transition-all active:scale-[0.98] disabled:opacity-40">
          Guardar dirección
        </button>
      </div>
    </div>
  );
}

export function ShippingAddressModal({ isOpen, onClose, onSave, savedAddress }: ShippingAddressModalProps) {
  const { profile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [showNew, setShowNew] = useState(false);

  if (!isOpen) return null;

  const displayName = savedAddress?.name || profile?.displayName || '';

  const handleSave = (address: ShippingAddress) => {
    onSave(address);
    setEditing(false);
    setShowNew(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[250] flex flex-col">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="relative mt-auto flex max-h-[92vh] flex-col rounded-t-3xl bg-[#f6f8fb] shadow-2xl">

        <div className="flex items-center justify-between px-5 pb-3 pt-5">
          <p className="text-[16px] font-black text-manises-blue">Datos de envío</p>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <Xmark className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-3">
          {savedAddress && !editing && !showNew ? (
            <>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-emerald-600 text-[11px] font-black uppercase tracking-wider">✓ Dirección guardada</span>
                </div>
                <p className="text-[11px] text-slate-500">Esta es la dirección donde recibirás tus décimos.</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white shadow-sm px-4 py-4 space-y-1">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[13px] font-black text-manises-blue">{displayName}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{savedAddress.street}</p>
                    <p className="text-[11px] text-slate-500">{savedAddress.cp} {savedAddress.city}</p>
                    <p className="text-[11px] text-slate-500">{savedAddress.phone}</p>
                  </div>
                  <span className="rounded-full bg-manises-blue/10 px-2 py-0.5 text-[9px] font-black text-manises-blue uppercase tracking-wider">Principal</span>
                </div>
              </div>
              <button type="button" onClick={() => setEditing(true)}
                className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-[13px] font-semibold text-manises-blue hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2"><EditPencil className="h-4 w-4 text-slate-400" /> Editar dirección</div>
                <NavArrowRight className="h-4 w-4 text-slate-400" />
              </button>
              <button type="button" onClick={() => setShowNew(true)}
                className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-[13px] font-semibold text-manises-blue hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-slate-400" /> Usar otra dirección</div>
                <NavArrowRight className="h-4 w-4 text-slate-400" />
              </button>
              <button type="button" onClick={() => { onSave(EMPTY); onClose(); }}
                className="flex w-full items-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3.5 text-[13px] font-semibold text-red-500 hover:bg-red-100 transition-colors">
                <Trash className="h-4 w-4" /> Eliminar dirección
              </button>
            </>
          ) : (
            <AddressForm
              initial={editing && savedAddress ? savedAddress : EMPTY}
              onSave={handleSave}
              onCancel={() => { setEditing(false); setShowNew(false); }}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
}
