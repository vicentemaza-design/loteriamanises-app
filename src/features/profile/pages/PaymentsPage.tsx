import { useRef, useState } from 'react';
import { ProfileSubHeader } from '../components/ProfileSubHeader';
import { Button } from '@/shared/ui/Button';
import { Plus, CreditCard, Landmark, Shield, Star, Trash2, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';
import { PremiumTouchInteraction } from '@/shared/components/PremiumTouchInteraction';
import { toast } from 'sonner';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { PremiumSectionCard } from '../components/PremiumSectionCard';
import { AnimatePresence, motion } from 'motion/react';
import { MOCK_PAYMENT_CARDS, MOCK_BANK_ACCOUNTS } from '../data/profile.mock';
import type { PaymentCard, BankAccount } from '../types/profile.types';

import visaLogo from '@/assets/games/visa.svg';
import mastercardLogo from '@/assets/games/mastercard.svg';

export function PaymentsPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Cargar Tarjetas
  const [cards, setCards] = useState<PaymentCard[]>(() => {
    const saved = localStorage.getItem('manises_payment_cards');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing cards', e);
      }
    }
    return MOCK_PAYMENT_CARDS;
  });

  // Cargar Cuentas Bancarias
  const [accounts, setAccounts] = useState<BankAccount[]>(() => {
    const saved = localStorage.getItem('manises_bank_accounts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing accounts', e);
      }
    }
    return MOCK_BANK_ACCOUNTS;
  });

  // Diálogo de eliminación
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'card' | 'account'; id: string } | null>(null);

  // Formularios de adición
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpires, setCardExpires] = useState('');
  const [cardBrand, setCardBrand] = useState<'Visa' | 'Mastercard' | 'Maestro'>('Visa');
  const [cardError, setCardError] = useState('');

  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [newIban, setNewIban] = useState('');
  const [newBank, setNewBank] = useState('');
  const [newAlias, setNewAlias] = useState('');
  const [newHolder, setNewHolder] = useState('');
  const [accountError, setAccountError] = useState('');

  useGSAP(() => {
    gsap.from('.card-item', { x: -30, opacity: 0, stagger: 0.15, ease: 'power4.out', duration: 0.8, clearProps: 'all' });
    gsap.from('.fade-in', { opacity: 0, y: 20, delay: 0.4, duration: 0.8, ease: 'power3.out' });
  }, { scope: containerRef });

  // Guardar Tarjetas
  const saveCards = (newCards: PaymentCard[]) => {
    setCards(newCards);
    localStorage.setItem('manises_payment_cards', JSON.stringify(newCards));
  };

  // Guardar Cuentas
  const saveAccounts = (newAccounts: BankAccount[]) => {
    setAccounts(newAccounts);
    localStorage.setItem('manises_bank_accounts', JSON.stringify(newAccounts));
  };

  const setDefaultCard = (id: string) => {
    const updated = cards.map(c => ({ ...c, isDefault: c.id === id }));
    saveCards(updated);
    toast.success('Tarjeta predeterminada actualizada.');
  };

  const setDefaultAccount = (id: string) => {
    const updated = accounts.map(a => ({ ...a, isDefault: a.id === id }));
    saveAccounts(updated);
    toast.success('Cuenta predeterminada actualizada.');
  };

  const handleDelete = () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === 'card') {
      const updated = cards.filter(c => c.id !== deleteConfirm.id);
      // Si eliminamos la principal, hacer principal a la primera restante si hay
      if (cards.find(c => c.id === deleteConfirm.id)?.isDefault && updated.length > 0) {
        updated[0].isDefault = true;
      }
      saveCards(updated);
      toast.success('Tarjeta eliminada con éxito.');
    } else {
      const updated = accounts.filter(a => a.id !== deleteConfirm.id);
      // Si eliminamos la principal, hacer principal a la primera restante si hay
      if (accounts.find(a => a.id === deleteConfirm.id)?.isDefault && updated.length > 0) {
        updated[0].isDefault = true;
      }
      saveAccounts(updated);
      toast.success('Cuenta bancaria eliminada con éxito.');
    }
    setDeleteConfirm(null);
  };

  const handleAddCard = () => {
    const cleanNum = cardNumber.replace(/\s+/g, '');
    if (!cleanNum || !cardExpires) {
      setCardError('Todos los campos son obligatorios.');
      return;
    }
    if (!/^\d{16}$/.test(cleanNum)) {
      setCardError('El número de tarjeta debe tener exactamente 16 dígitos.');
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(cardExpires)) {
      setCardError('La fecha de caducidad debe tener formato MM/AA.');
      return;
    }

    setCardError('');
    const newCard: PaymentCard = {
      id: `card-${Date.now()}`,
      brand: cardBrand,
      last4: cleanNum.slice(-4),
      expires: cardExpires,
      isDefault: cards.length === 0,
    };

    const updated = [...cards, newCard];
    saveCards(updated);
    setIsAddingCard(false);
    setCardNumber('');
    setCardExpires('');
    toast.success('Tarjeta vinculada con éxito.');
  };

  const handleAddAccount = () => {
    const cleanIban = newIban.replace(/\s+/g, '').toUpperCase();
    if (!newHolder.trim() || !newBank.trim() || !cleanIban) {
      setAccountError('Todos los campos excepto el alias son obligatorios.');
      return;
    }
    if (!/^ES\d{22}$/.test(cleanIban)) {
      setAccountError('El IBAN debe ser español (empezar por ES seguido de 22 dígitos).');
      return;
    }

    setAccountError('');
    const newAcc: BankAccount = {
      id: `bank-${Date.now()}`,
      iban: `ES${cleanIban.slice(2, 4)} **** **** **** ${cleanIban.slice(-4)}`,
      bank: newBank.trim(),
      alias: newAlias.trim() || 'Cuenta Corriente',
      holderName: newHolder.trim(),
      isDefault: accounts.length === 0,
    };

    const updated = [...accounts, newAcc];
    saveAccounts(updated);
    setIsAddingAccount(false);
    setNewIban('');
    setNewBank('');
    setNewAlias('');
    setNewHolder('');
    toast.success('Cuenta bancaria vinculada con éxito.');
  };

  // Helper para obtener estilo visual de la tarjeta
  const getCardStyle = (brand: string) => {
    if (brand === 'Visa') return { gradient: 'from-blue-900 to-indigo-950', logo: visaLogo };
    if (brand === 'Mastercard') return { gradient: 'from-stone-850 to-stone-950', logo: mastercardLogo };
    return { gradient: 'from-slate-700 to-slate-900', logo: visaLogo }; // fallback
  };

  return (
    <div className="flex min-h-full flex-col bg-background pb-12" ref={containerRef}>
      <ProfileSubHeader title="Métodos de Pago" />

      <div className="p-5 flex flex-col gap-6">

        {/* ── TARJETAS GUARDADAS ───────────────────────────────────── */}
        <section className="card-item">
          <PremiumSectionCard
            title="Mis Tarjetas"
            eyebrow="Métodos de Pago"
            description="Tarjetas de crédito o débito vinculadas para realizar depósitos y recargas al instante."
            tone="blue"
          >
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {cards.map(card => {
                  const style = getCardStyle(card.brand);
                  return (
                    <motion.div
                      key={card.id}
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className="space-y-2"
                    >
                      <PremiumTouchInteraction scale={0.98}>
                        <div className={`relative h-32 rounded-3xl p-5 overflow-hidden shadow-lg bg-gradient-to-br ${style.gradient}`}>
                          <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/5 rounded-full blur-xl" />
                          <div className="relative z-10 flex flex-col h-full justify-between">
                            <div className="flex justify-between items-start">
                              <div className="w-10 h-7 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-1 flex items-center justify-center">
                                <img src={style.logo} alt={card.brand} className="w-full h-full object-contain brightness-0 invert opacity-85" />
                              </div>
                              {card.isDefault && (
                                <span className="bg-manises-gold text-manises-blue text-[8px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md">
                                  Principal
                                </span>
                              )}
                            </div>
                            <div>
                              <p className="text-white font-bold tracking-[0.2em] text-sm font-mono">•••• •••• •••• {card.last4}</p>
                              <p className="text-white/40 text-[9px] font-bold mt-1 tracking-wider uppercase">CADUCA: {card.expires}</p>
                            </div>
                          </div>
                        </div>
                      </PremiumTouchInteraction>

                      {/* Card actions */}
                      <div className="flex items-center gap-3 px-1">
                        {!card.isDefault && (
                          <button
                            onClick={() => setDefaultCard(card.id)}
                            className="flex items-center gap-1.5 text-[10px] font-bold text-manises-blue/60 hover:text-manises-blue transition-colors"
                          >
                            <Star className="w-3.5 h-3.5 fill-none stroke-current" />
                            Hacer predeterminada
                          </button>
                        )}
                        <div className="flex-1" />
                        <button
                          onClick={() => setDeleteConfirm({ type: 'card', id: card.id })}
                          className="flex items-center gap-1 text-[10px] font-bold text-red-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Eliminar
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {!isAddingCard ? (
                  <motion.div key="add-btn-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Button
                      variant="outline"
                      className="w-full h-12 border-dashed border-2 border-slate-200 text-manises-blue hover:border-manises-gold hover:text-manises-blue hover:bg-manises-gold/5 rounded-xl gap-2 font-black text-xs transition-all"
                      onClick={() => setIsAddingCard(true)}
                    >
                      <Plus className="w-4 h-4" /> Vincular Nueva Tarjeta
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div key="add-form-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-slate-50 p-5 rounded-3xl border border-slate-200/60 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                      <h4 className="text-[10px] font-black text-manises-blue uppercase tracking-wider">Nueva Tarjeta</h4>
                      <button onClick={() => { setIsAddingCard(false); setCardError(''); }} className="text-[10px] font-bold text-slate-400 hover:text-slate-600">Cancelar</button>
                    </div>

                    <div className="space-y-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-0.5">Franquicia / Marca</label>
                        <div className="flex gap-2">
                          {(['Visa', 'Mastercard', 'Maestro'] as const).map(b => (
                            <button
                              key={b}
                              type="button"
                              onClick={() => setCardBrand(b)}
                              className={`flex-1 h-9 rounded-lg text-xs font-bold transition-all border ${
                                cardBrand === b ? 'bg-manises-blue text-white border-manises-blue' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              {b}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-0.5">Número de Tarjeta</label>
                        <input
                          type="text"
                          maxLength={16}
                          placeholder="1234 5678 1234 5678"
                          value={cardNumber}
                          onChange={e => setCardNumber(e.target.value.replace(/\D/g, ''))}
                          className="w-full h-11 px-3 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-manises-blue"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-0.5">Fecha Caducidad</label>
                        <input
                          type="text"
                          maxLength={5}
                          placeholder="MM/AA (Ej. 12/28)"
                          value={cardExpires}
                          onChange={e => {
                            let val = e.target.value;
                            if (val.length === 2 && !val.includes('/')) {
                              val = val + '/';
                            }
                            setCardExpires(val);
                          }}
                          className="w-full h-11 px-3 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-manises-blue"
                        />
                      </div>

                      {cardError && (
                        <div className="flex items-center gap-1.5 px-0.5">
                          <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                          <p className="text-[10px] font-bold text-red-500">{cardError}</p>
                        </div>
                      )}

                      <Button
                        onClick={handleAddCard}
                        className="w-full h-11 rounded-xl bg-manises-blue text-white font-black text-xs uppercase tracking-wider"
                      >
                        Vincular Tarjeta
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </PremiumSectionCard>
        </section>

        {/* ── CUENTAS BANCARIAS ────────────────────────────────────── */}
        <section className="fade-in">
          <PremiumSectionCard
            title="Cuentas Bancarias"
            eyebrow="Para cobro de premios"
            description="Cuentas de banco validadas para la retirada de tus premios y saldo de forma directa."
            tone="emerald"
          >
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {accounts.map(account => (
                  <motion.div
                    key={account.id}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="space-y-2"
                  >
                    <div className={`flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all ${
                      account.isDefault ? 'border-emerald-400 bg-emerald-50/50' : 'border-slate-100 bg-white'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${account.isDefault ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                          <Landmark className="w-5 h-5" />
                        </div>
                        <div>
                          <p className={`text-sm font-bold ${account.isDefault ? 'text-emerald-800' : 'text-slate-700'}`}>{account.iban}</p>
                          <p className="text-[10px] text-muted-foreground font-semibold uppercase">{account.bank} · {account.alias}</p>
                        </div>
                      </div>
                      {account.isDefault && (
                        <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600 border border-emerald-200 bg-emerald-50 px-2 py-0.5 rounded-full">
                          Principal
                        </span>
                      )}
                    </div>

                    {/* Account actions */}
                    <div className="flex items-center gap-3 px-1">
                      {!account.isDefault && (
                        <button
                          onClick={() => setDefaultAccount(account.id)}
                          className="flex items-center gap-1.5 text-[10px] font-bold text-manises-blue/60 hover:text-manises-blue transition-colors"
                        >
                          <Star className="w-3.5 h-3.5 fill-none stroke-current" />
                          Hacer predeterminada
                        </button>
                      )}
                      <div className="flex-1" />
                      <button
                        onClick={() => setDeleteConfirm({ type: 'account', id: account.id })}
                        className="flex items-center gap-1 text-[10px] font-bold text-red-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Eliminar
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {!isAddingAccount ? (
                  <motion.div key="add-btn-account" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Button
                      variant="outline"
                      className="w-full h-12 border-dashed border-2 border-slate-200 text-manises-blue hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50/20 rounded-xl gap-2 font-black text-xs transition-all"
                      onClick={() => setIsAddingAccount(true)}
                    >
                      <Plus className="w-4 h-4" /> Vincular Nueva Cuenta Bancaria
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div key="add-form-account" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-slate-50 p-5 rounded-3xl border border-slate-200/60 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                      <h4 className="text-[10px] font-black text-manises-blue uppercase tracking-wider">Nueva Cuenta Bancaria</h4>
                      <button onClick={() => { setIsAddingAccount(false); setAccountError(''); }} className="text-[10px] font-bold text-slate-400 hover:text-slate-600">Cancelar</button>
                    </div>

                    <div className="space-y-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-0.5">Nombre del Titular</label>
                        <input
                          type="text"
                          placeholder="Titular de la cuenta"
                          value={newHolder}
                          onChange={e => setNewHolder(e.target.value)}
                          className="w-full h-11 px-3 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-manises-blue"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-0.5">Código IBAN (Español)</label>
                        <input
                          type="text"
                          placeholder="ES00 0000 0000 0000 0000 0000"
                          value={newIban}
                          onChange={e => setNewIban(e.target.value)}
                          className="w-full h-11 px-3 rounded-xl border border-slate-200 text-xs font-mono font-bold outline-none focus:border-manises-blue"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-0.5">Entidad Bancaria</label>
                          <input
                            type="text"
                            placeholder="Ej. Banco Sabadell"
                            value={newBank}
                            onChange={e => setNewBank(e.target.value)}
                            className="w-full h-11 px-3 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-manises-blue"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-0.5">Alias (Ej. Cuenta Nómina)</label>
                          <input
                            type="text"
                            placeholder="Ej. Principal"
                            value={newAlias}
                            onChange={e => setNewAlias(e.target.value)}
                            className="w-full h-11 px-3 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-manises-blue"
                          />
                        </div>
                      </div>

                      {accountError && (
                        <div className="flex items-center gap-1.5 px-0.5">
                          <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                          <p className="text-[10px] font-bold text-red-500">{accountError}</p>
                        </div>
                      )}

                      <Button
                        onClick={handleAddAccount}
                        className="w-full h-11 rounded-xl bg-manises-blue text-white font-black text-xs uppercase tracking-wider"
                      >
                        Vincular Cuenta Bancaria
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </PremiumSectionCard>
        </section>

        {/* Security note */}
        <div className="flex items-start gap-3 p-4 rounded-3xl bg-slate-50 border border-slate-100 fade-in">
          <Shield className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-[10px] font-black text-manises-blue uppercase tracking-widest">Seguridad de Nivel Bancario</p>
            <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">
              Toda la información sensible de tus tarjetas de crédito está encriptada y tokenizada bajo estándares PCI-DSS. Ningún dato bancario sensible real se guarda en esta demo.
            </p>
          </div>
        </div>
      </div>

      {/* ── Delete confirmation dialog ─────────────────────────── */}
      <AnimatePresence>
        {deleteConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirm(null)}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              className="fixed inset-x-4 bottom-1/2 translate-y-1/2 z-50 bg-white rounded-3xl shadow-2xl p-6 max-w-sm mx-auto"
            >
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
                  <AlertTriangle className="w-7 h-7 text-red-500" />
                </div>
                <div>
                  <h3 className="font-black text-manises-blue text-base">
                    {deleteConfirm.type === 'card' ? '¿Seguro que quieres eliminar esta tarjeta?' : '¿Seguro que quieres eliminar esta cuenta?'}
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-1 font-medium leading-relaxed">
                    {deleteConfirm.type === 'card'
                      ? 'Esta acción es irreversible y no podrás usarla para recargas rápidas.'
                      : 'Esta acción es irreversible y no podrás usarla para cobrar tus premios.'}
                  </p>
                </div>
                <div className="flex gap-3 w-full">
                  <Button
                    variant="outline"
                    className="flex-1 h-11 rounded-2xl border-slate-200 font-bold text-slate-600"
                    onClick={() => setDeleteConfirm(null)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="flex-1 h-11 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-black border-none gap-2"
                    onClick={handleDelete}
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
