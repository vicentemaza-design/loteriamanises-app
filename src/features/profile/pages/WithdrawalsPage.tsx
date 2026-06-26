import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Landmark, Plus, CheckCircle2, ChevronLeft, Clock, Shield, AlertCircle, MapPin, Building, Home, Check } from 'lucide-react';
import { ProfileSubHeader } from '../components/ProfileSubHeader';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button } from '@/shared/ui/Button';
import { formatCurrency } from '@/shared/lib/utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { PremiumTouchInteraction } from '@/shared/components/PremiumTouchInteraction';
import { MOCK_BANK_ACCOUNTS } from '../data/profile.mock';
import type { BankAccount } from '../types/profile.types';

type Step = 'address-verification' | 1 | 2 | 3;

export function WithdrawalsPage() {
  const navigate = useNavigate();
  const { profile, updateProfile } = useAuth();
  const balance = profile?.balance ?? 0;

  // Cargar cuentas bancarias persistidas
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

  // Determinar paso inicial según completitud de datos de dirección
  const [step, setStep] = useState<Step>(() => {
    const hasAddress = profile?.address && profile?.postalCode && profile?.municipality && profile?.province;
    return hasAddress ? 1 : 'address-verification';
  });

  // Formulario de dirección legal
  const [address, setAddress] = useState(profile?.address || '');
  const [postalCode, setPostalCode] = useState(profile?.postalCode || '');
  const [municipality, setMunicipality] = useState(profile?.municipality || '');
  const [province, setProvince] = useState(profile?.province || '');
  const [addressError, setAddressError] = useState('');
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // Formulario de retirada
  const [amount, setAmount] = useState(balance > 0 ? String(balance.toFixed(2)) : '');
  const [selectedAccount, setSelectedAccount] = useState(() => {
    const defaultAcc = accounts.find(a => a.isDefault) ?? accounts[0];
    return defaultAcc?.id || '';
  });
  const [amountError, setAmountError] = useState('');

  // Formulario de nueva cuenta bancaria
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [newIban, setNewIban] = useState('');
  const [newBank, setNewBank] = useState('');
  const [newAlias, setNewAlias] = useState('');
  const [newHolder, setNewHolder] = useState(profile?.displayName || '');
  const [newIbanError, setNewIbanError] = useState('');

  const parsedAmount = parseFloat(amount) || 0;
  const account = accounts.find(a => a.id === selectedAccount) ?? accounts[0];

  // Sincronizar campos de dirección si el perfil se carga tarde
  useEffect(() => {
    if (profile) {
      if (profile.address && !address) setAddress(profile.address);
      if (profile.postalCode && !postalCode) setPostalCode(profile.postalCode);
      if (profile.municipality && !municipality) setMunicipality(profile.municipality);
      if (profile.province && !province) setProvince(profile.province);
      
      const hasAddress = profile.address && profile.postalCode && profile.municipality && profile.province;
      if (hasAddress && step === 'address-verification') {
        setStep(1);
      }
    }
  }, [profile]);

  // Guardar cuentas en Local Storage
  const saveAccountsToStorage = (newAccounts: BankAccount[]) => {
    setAccounts(newAccounts);
    localStorage.setItem('manises_bank_accounts', JSON.stringify(newAccounts));
  };

  const handleSaveAddress = async () => {
    if (!address.trim() || !postalCode.trim() || !municipality.trim() || !province.trim()) {
      setAddressError('Todos los campos son obligatorios.');
      return;
    }
    if (!/^\d{5}$/.test(postalCode.trim())) {
      setAddressError('El código postal debe tener exactamente 5 dígitos.');
      return;
    }
    setAddressError('');
    setIsSavingAddress(true);

    try {
      await updateProfile({
        address: address.trim(),
        postalCode: postalCode.trim(),
        municipality: municipality.trim(),
        province: province.trim(),
      });
      setStep(1);
    } catch (err) {
      setAddressError('Ocurrió un error al guardar los datos de dirección.');
    } finally {
      setIsSavingAddress(false);
    }
  };

  const validateAmount = () => {
    if (parsedAmount <= 0) {
      setAmountError('Introduce un importe válido mayor que cero.');
      return false;
    }
    if (parsedAmount > balance) {
      setAmountError(`El importe supera tu saldo actual disponible (${formatCurrency(balance)}).`);
      return false;
    }
    setAmountError('');
    return true;
  };

  const handleAddAccount = () => {
    const cleanIban = newIban.replace(/\s+/g, '').toUpperCase();
    if (!newHolder.trim() || !newBank.trim() || !cleanIban) {
      setNewIbanError('Todos los campos excepto el alias son obligatorios.');
      return;
    }
    if (!/^ES\d{22}$/.test(cleanIban)) {
      setNewIbanError('El IBAN debe ser español (empezar por ES seguido de 22 dígitos).');
      return;
    }

    setNewIbanError('');
    const newAcc: BankAccount = {
      id: `bank-${Date.now()}`,
      iban: `ES${cleanIban.slice(2, 4)} **** **** **** ${cleanIban.slice(-4)}`,
      bank: newBank.trim(),
      alias: newAlias.trim() || 'Cuenta Corriente',
      holderName: newHolder.trim(),
      isDefault: accounts.length === 0,
    };

    const updated = [...accounts, newAcc];
    saveAccountsToStorage(updated);
    setSelectedAccount(newAcc.id);
    setIsAddingAccount(false);
    setNewIban('');
    setNewBank('');
    setNewAlias('');
    toast.success('Cuenta bancaria vinculada con éxito.');
  };

  const goToStep2 = () => {
    if (!selectedAccount) {
      toast.error('Por favor, selecciona o añade una cuenta bancaria de destino.');
      return;
    }
    if (!validateAmount()) return;
    setStep(2);
  };

  const confirm = () => {
    // Restamos el saldo simulado en demo
    updateProfile({
      balance: balance - parsedAmount
    });
    setStep(3);
  };

  return (
    <div className="flex min-h-full flex-col bg-background">
      <ProfileSubHeader title="Cobrar Premios" subtitle="Retirada de saldo" />

      <div className="flex flex-col gap-5 p-4 pb-24">

        {/* Saldo actual header */}
        <section className="px-1 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-manises-blue/40 uppercase tracking-[0.2em]">Saldo actual</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-black text-emerald-600 tracking-tight tabular-nums">
                {formatCurrency(balance)}
              </p>
              <span className="text-[10px] font-black text-emerald-600/40 uppercase tracking-widest animate-pulse">Disponible</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
            <Landmark className="w-6 h-6 text-emerald-600/60" />
          </div>
        </section>

        {/* Step indicators */}
        {step !== 'address-verification' && step < 3 && (
          <div className="flex items-center gap-2 px-1">
            {([1, 2] as const).map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-colors ${
                  step === 2 && s === 1 ? 'bg-emerald-100 text-emerald-700' :
                  step >= s ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                  {step > s ? <Check className="w-3 h-3 stroke-[3]" /> : s}
                </div>
                {s < 2 && <div className={`h-px w-8 transition-colors ${step > s ? 'bg-emerald-600' : 'bg-slate-200'}`} />}
              </div>
            ))}
            <p className="text-[10px] font-bold text-muted-foreground ml-1">
              {step === 1 ? 'Importe y cuenta de destino' : 'Revisión y confirmación'}
            </p>
          </div>
        )}

        <AnimatePresence mode="wait">

          {/* ── PASO PREVIO: Validación de Dirección Legal ───────── */}
          {step === 'address-verification' && (
            <motion.div key="address-step" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="space-y-4">
              <div className="rounded-3xl border border-manises-blue/10 bg-slate-50 p-5 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-manises-blue/5 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-manises-blue" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-manises-blue uppercase tracking-wider">Verificación de Domicilio Fiscal</h3>
                  <p className="text-[11px] text-muted-foreground font-medium mt-1 leading-relaxed">
                    Por normativa sobre prevención del fraude y blanqueo de capitales, debes verificar tu dirección real antes de poder realizar retiros de premios o saldo a tu cuenta bancaria.
                  </p>
                </div>
              </div>

              <div className="space-y-3 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-manises-blue uppercase tracking-widest pl-1">
                    Dirección (Calle, Nº, Piso, Puerta)
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-manises-blue/35">
                      <Home className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="Ej. Calle Colón, 23, 4º B"
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-manises-blue transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-manises-blue uppercase tracking-widest pl-1">
                      Código Postal
                    </label>
                    <input
                      type="text"
                      maxLength={5}
                      placeholder="Ej. 46940"
                      value={postalCode}
                      onChange={e => setPostalCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-manises-blue transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-manises-blue uppercase tracking-widest pl-1">
                      Municipio
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Manises"
                      value={municipality}
                      onChange={e => setMunicipality(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-manises-blue transition-all"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-manises-blue uppercase tracking-widest pl-1">
                    Provincia
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-manises-blue/35">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="Ej. Valencia"
                      value={province}
                      onChange={e => setProvince(e.target.value)}
                      className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-manises-blue transition-all"
                    />
                  </div>
                </div>

                {addressError && (
                  <div className="flex items-center gap-1.5 px-1 pt-1">
                    <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <p className="text-[11px] font-bold text-red-500">{addressError}</p>
                  </div>
                )}
              </div>

              <PremiumTouchInteraction scale={0.98} className="w-full pt-1">
                <Button
                  onClick={handleSaveAddress}
                  disabled={isSavingAddress}
                  className="w-full h-14 rounded-2xl bg-manises-blue text-white hover:bg-manises-blue/90 font-black text-sm uppercase tracking-widest shadow-lg border-none"
                >
                  {isSavingAddress ? 'Guardando...' : 'Confirmar Dirección Fiscal'}
                </Button>
              </PremiumTouchInteraction>
            </motion.div>
          )}

          {/* ── PASO 1: Importe + Cuenta de destino ──────────────── */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
              
              {/* Importe */}
              <div className="space-y-2">
                <p className="text-[10px] font-black text-manises-blue uppercase tracking-widest pl-1">Importe a retirar</p>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-manises-blue font-black text-lg">€</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={amount}
                    onChange={e => { setAmount(e.target.value); setAmountError(''); }}
                    className={`w-full h-14 pl-9 pr-4 rounded-2xl border-2 text-manises-blue font-black text-xl outline-none transition-all tabular-nums ${
                      amountError ? 'border-red-400 bg-red-50' : 'border-manises-blue/10 bg-slate-50 focus:border-manises-blue focus:bg-white'
                    }`}
                  />
                </div>
                {amountError && (
                  <div className="flex items-center gap-1.5 px-1">
                    <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <p className="text-[11px] font-bold text-red-500">{amountError}</p>
                  </div>
                )}
                <button
                  onClick={() => setAmount(balance.toFixed(2))}
                  className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 pl-1 transition-colors"
                >
                  Retirar todo el saldo ({formatCurrency(balance)})
                </button>
              </div>

              {/* Selección de Cuenta */}
              <div className="space-y-2">
                <p className="text-[10px] font-black text-manises-blue uppercase tracking-widest pl-1">Cuenta bancaria de destino</p>
                
                <AnimatePresence mode="wait">
                  {!isAddingAccount ? (
                    <motion.div key="accounts-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                      {accounts.map(acc => (
                        <button
                          key={acc.id}
                          type="button"
                          onClick={() => setSelectedAccount(acc.id)}
                          className={`w-full flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all ${
                            selectedAccount === acc.id ? 'border-emerald-500 bg-emerald-50/40' : 'border-slate-100 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedAccount === acc.id ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                              <Landmark className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                              <p className={`text-sm font-bold ${selectedAccount === acc.id ? 'text-emerald-800' : 'text-slate-700'}`}>{acc.iban}</p>
                              <p className="text-[10px] text-muted-foreground font-semibold uppercase">{acc.bank} · {acc.alias}</p>
                            </div>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedAccount === acc.id ? 'border-emerald-500' : 'border-slate-300'}`}>
                            {selectedAccount === acc.id && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />}
                          </div>
                        </button>
                      ))}

                      <button
                        type="button"
                        onClick={() => setIsAddingAccount(true)}
                        className="w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all"
                      >
                        <div className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400">
                          <Plus className="w-5 h-5" />
                        </div>
                        <p className="text-sm font-bold text-slate-500">Añadir nueva cuenta</p>
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div key="add-account-form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3.5">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <h4 className="text-[11px] font-black text-manises-blue uppercase tracking-wider">Vincular Nueva Cuenta</h4>
                        <button type="button" onClick={() => { setIsAddingAccount(false); setNewIbanError(''); }} className="text-[10px] font-bold text-slate-400 hover:text-slate-600">Cancelar</button>
                      </div>

                      <div className="space-y-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-0.5">Nombre del Titular</label>
                          <input
                            type="text"
                            placeholder="Nombre y apellidos"
                            value={newHolder}
                            onChange={e => setNewHolder(e.target.value)}
                            className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-manises-blue"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-0.5">Código IBAN (Español)</label>
                          <input
                            type="text"
                            placeholder="ES00 0000 0000 0000 0000 0000"
                            value={newIban}
                            onChange={e => setNewIban(e.target.value)}
                            className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-xs font-mono font-bold outline-none focus:border-manises-blue"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-0.5">Entidad Bancaria</label>
                            <input
                              type="text"
                              placeholder="Ej. BBVA"
                              value={newBank}
                              onChange={e => setNewBank(e.target.value)}
                              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-manises-blue"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-0.5">Alias (Opcional)</label>
                            <input
                              type="text"
                              placeholder="Ej. Cuenta Ahorro"
                              value={newAlias}
                              onChange={e => setNewAlias(e.target.value)}
                              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-manises-blue"
                            />
                          </div>
                        </div>

                        {newIbanError && (
                          <div className="flex items-center gap-1 px-0.5">
                            <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                            <p className="text-[10px] font-bold text-red-500">{newIbanError}</p>
                          </div>
                        )}

                        <Button
                          type="button"
                          onClick={handleAddAccount}
                          className="w-full h-11 rounded-xl bg-manises-blue text-white text-xs font-black uppercase tracking-wider"
                        >
                          Vincular Cuenta Bancaria
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex gap-3">
                <Shield className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-black text-manises-blue uppercase tracking-widest">Retiros Gratuitos y Seguros</p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">
                    No aplicamos ninguna comisión por retirada de fondos. El titular de la cuenta bancaria de destino debe coincidir con el titular del perfil.
                  </p>
                </div>
              </div>

              {!isAddingAccount && (
                <PremiumTouchInteraction scale={0.98} className="w-full">
                  <Button
                    onClick={goToStep2}
                    className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg shadow-lg border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1 transition-all"
                  >
                    Continuar →
                  </Button>
                </PremiumTouchInteraction>
              )}
            </motion.div>
          )}

          {/* ── PASO 2: Revisión ───────────────────────────────── */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
              <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
                <div className="p-4 border-b border-border/50 bg-slate-50/50">
                  <p className="text-[10px] font-black text-manises-blue uppercase tracking-widest">Resumen de la solicitud</p>
                </div>
                <div className="divide-y divide-border/40 bg-white">
                  <SummaryRow label="Importe a cobrar" value={formatCurrency(parsedAmount)} highlight />
                  <SummaryRow label="Cuenta de destino" value={account?.iban || ''} />
                  <SummaryRow label="Entidad" value={account?.bank || ''} />
                  <SummaryRow label="Titular de la cuenta" value={account?.holderName || profile?.displayName || ''} />
                  <SummaryRow label="Comisiones" value="0,00 € (Gratis)" />
                  <SummaryRow label="Plazo de procesamiento" value="72 horas hábiles" />
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200">
                <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[11px] font-medium text-amber-700 leading-relaxed">
                  <strong>Nota sobre el plazo:</strong> Las retiradas de fondos se procesan manualmente de forma segura y se transfieren a tu banco. El saldo suele tardar un plazo aproximado de <strong>72 horas hábiles</strong> en reflejarse de forma definitiva en tu extracto bancario.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 h-12 rounded-2xl border-slate-200 font-bold gap-2 text-manises-blue"
                  onClick={() => setStep(1)}
                >
                  <ChevronLeft className="w-4 h-4" /> Volver
                </Button>
                <PremiumTouchInteraction scale={0.98} className="flex-1">
                  <Button
                    onClick={confirm}
                    className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-lg border-b-4 border-emerald-800 transition-all border-none"
                  >
                    Confirmar Retirada
                  </Button>
                </PremiumTouchInteraction>
              </div>
            </motion.div>
          )}

          {/* ── PASO 3: Confirmación ───────────────────────────── */}
          {step === 3 && (
            <motion.div key="step3" initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-6 py-4">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-manises-blue">Solicitud Transferida</h3>
                  <p className="text-2xl font-black text-emerald-600 mt-1 tabular-nums">-{formatCurrency(parsedAmount)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Nº Referencia: WD-{Math.floor(Math.random() * 90000) + 10000}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-[12px] font-medium text-emerald-800 leading-relaxed">
                    Hemos registrado tu solicitud de cobro de premios. Nuestro departamento de administración transferirá los fondos en un plazo estimado de <strong>72 horas hábiles</strong>.
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-2.5 border-t border-emerald-100">
                  <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
                  <p className="text-[10px] font-bold text-emerald-700">
                    Destino: {account?.iban || ''} · {account?.bank || ''}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => navigate('/profile/wallet')}
                  className="w-full h-12 rounded-2xl bg-manises-blue text-white font-black border-none"
                >
                  Volver a mi saldo
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => { setStep(profile?.address ? 1 : 'address-verification'); setAmount(balance > 0 ? String(balance.toFixed(2)) : ''); }}
                  className="text-[11px] font-bold text-muted-foreground"
                >
                  Realizar otra retirada
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-[11px] font-semibold text-muted-foreground">{label}</span>
      <span className={`text-[12px] font-black ${highlight ? 'text-emerald-600' : 'text-manises-blue'}`}>{value}</span>
    </div>
  );
}
