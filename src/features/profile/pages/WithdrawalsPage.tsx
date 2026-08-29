import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Landmark, Plus, ChevronLeft, Clock, Shield, AlertCircle, MapPin, Building, Home, Check } from 'lucide-react';
import { ProfileSubHeader } from '../components/ProfileSubHeader';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button } from '@/shared/ui/Button';
import { formatCurrency } from '@/shared/lib/utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { PremiumTouchInteraction } from '@/shared/components/PremiumTouchInteraction';
import { useBankAccounts } from '../hooks/useBankAccounts';
import { useVerifyBankAccountOwnership } from '../hooks/useVerifyBankAccountOwnership';
import { useCreateWithdrawal } from '../hooks/useCreateWithdrawal';
import { useSecurityGate } from '../hooks/useSecurityGate';
import { BankAccountCard } from '../components/BankAccountCard';
import { AddBankAccountForm } from '../components/AddBankAccountForm';
import { BankAccountVerificationPanel } from '../components/BankAccountVerificationPanel';
import { WithdrawalStatusPanel } from '../components/WithdrawalStatusPanel';
import { WITHDRAWAL_DEMO_FEE_LABEL, WITHDRAWAL_DEMO_PROCESSING_TIME_LABEL, WITHDRAWAL_DEMO_PROCESSING_NOTE } from '../data/withdrawalDemoConfig';
import type { BankAccount } from '../types/profile.types';
import { useKeyboardAwareViewport } from '../hooks/useKeyboardAwareViewport';

/** UX validation only — obligatorio, numérico, >0, máx. 2 decimales, sin negativos/NaN/Infinity/notación científica. BE revalida en servidor. */
const AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/;

type Step = 'address-verification' | 1 | 2 | 3;

export function WithdrawalsPage() {
  const navigate = useNavigate();
  const { profile, updateProfile } = useAuth();
  const balance = profile?.balance ?? 0;

  // Cuentas bancarias — listado/alta vía IApiProvider (mock persiste solo
  // datos no sensibles en localStorage; ver bank-accounts.mock.ts).
  const { accounts, addAccount, updateAccountLocally } = useBankAccounts();
  const verification = useVerifyBankAccountOwnership();
  const withdrawalRequest = useCreateWithdrawal();
  const { requireReauth, gateModal } = useSecurityGate();
  const { keyboardOpen, keyboardInset, registerActiveField } = useKeyboardAwareViewport();

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
  const [selectedAccount, setSelectedAccount] = useState('');
  const [amountError, setAmountError] = useState('');

  // Formulario de nueva cuenta bancaria
  const [isAddingAccount, setIsAddingAccount] = useState(false);

  // Marca que la verificación en curso se disparó desde "Continuar" (retirada)
  // — solo en ese caso avanzamos automáticamente al paso 2 cuando el
  // resultado sea 'verified'.
  const [autoContinueAfterVerify, setAutoContinueAfterVerify] = useState(false);

  const parsedAmount = parseFloat(amount) || 0;
  const account = accounts.find(a => a.id === selectedAccount) ?? accounts[0];

  // Sincronizar campos de dirección si el perfil se carga tarde. Deps
  // intencionadamente solo `[profile]`: los campos locales (address,
  // postalCode, municipality, province, step) se LEEN para decidir si
  // rellenarlos/avanzar, pero el efecto no debe re-dispararse en cada
  // pulsación mientras el usuario los edita — solo cuando el perfil llega
  // o cambia. Los guards (`!address`, `step === 'address-verification'`)
  // ya hacen la operación idempotente si se añadieran esas dependencias,
  // así que no hay riesgo de bucle — es una exclusión deliberada, no un
  // hueco real.
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

  // Selecciona la cuenta predeterminada (o la primera) en cuanto el listado carga
  useEffect(() => {
    if (!selectedAccount && accounts.length > 0) {
      const defaultAcc = accounts.find(a => a.isDefault) ?? accounts[0];
      setSelectedAccount(defaultAcc.id);
    }
  }, [accounts, selectedAccount]);

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
    const trimmed = amount.trim();
    if (!trimmed) {
      setAmountError('Introduce un importe.');
      return false;
    }
    if (!AMOUNT_PATTERN.test(trimmed)) {
      setAmountError('Introduce un importe en euros válido, con un máximo de 2 decimales.');
      return false;
    }
    const value = Number(trimmed);
    if (!Number.isFinite(value) || value <= 0) {
      setAmountError('Introduce un importe válido mayor que cero.');
      return false;
    }
    if (value > balance) {
      // Comparación orientativa contra el saldo visible en el cliente — el
      // saldo real y la elegibilidad final los valida el servidor.
      setAmountError(`El importe supera tu saldo actual disponible (${formatCurrency(balance)}). El saldo real se validará al procesar la solicitud.`);
      return false;
    }
    setAmountError('');
    return true;
  };

  const handleAccountAdded = (newAccount: BankAccount) => {
    setSelectedAccount(newAccount.id);
    setIsAddingAccount(false);
    setAutoContinueAfterVerify(false);
    verification.reset();
    toast.success('Cuenta bancaria añadida. Pendiente de verificar.');
  };

  // Único punto que llama a verifyOwnership() — reutilizado por "Continuar"
  // (goToStep2) y por el reintento del panel. No existe una segunda implementación.
  const handleVerifyOwnership = async () => {
    if (!account) return;
    const updated = await verification.verify(account.id);
    if (updated) updateAccountLocally(updated);
  };

  // Si la verificación dispara desde "Continuar" y termina en 'verified',
  // avanzamos automáticamente al paso 2 — incluye el caso de reintentar
  // tras un mismatch/unavailable/error tanto de la propia solicitud.
  useEffect(() => {
    if (autoContinueAfterVerify && verification.status === 'verified') {
      setAutoContinueAfterVerify(false);
      // Limpia el panel transitorio de "Cuenta verificada" — ya cumplió su
      // propósito (el usuario ya avanza a revisión); sin esto quedaba
      // huérfano en el paso 1 y reaparecía duplicado junto al badge
      // permanente "Verificada" de la cuenta si el usuario volvía atrás.
      verification.reset();
      setStep(2);
    }
  }, [autoContinueAfterVerify, verification.status]);

  const handleChooseAnotherAccount = () => {
    setAutoContinueAfterVerify(false);
    verification.reset();
  };

  const handleAddAnotherAccount = () => {
    setAutoContinueAfterVerify(false);
    verification.reset();
    setIsAddingAccount(true);
  };

  const goToStep2 = () => {
    if (!selectedAccount || !account) {
      toast.error('Por favor, selecciona o añade una cuenta bancaria de destino.');
      return;
    }
    if (!validateAmount()) return;

    if (account.verificationStatus === 'verified') {
      // Ya verificada — BE debe revalidar server-side que sigue siendo
      // válida; el FE no vuelve a llamar a verifyOwnership() aquí.
      setStep(2);
      return;
    }

    // Cuenta unverified: la verificación de titularidad se dispara aquí
    // mismo, dentro del flujo de retirada — no exige haberla verificado
    // antes por separado. Reutiliza verifyOwnership() vía handleVerifyOwnership;
    // el resultado (verifying/verified/mismatch/unavailable/error) lo
    // renderiza el mismo BankAccountVerificationPanel de siempre.
    setAutoContinueAfterVerify(true);
    handleVerifyOwnership();
  };

  const confirm = async () => {
    if (!account) return;
    // Local PIN gate only when the user opted in (Perfil → Seguridad →
    // "Al retirar saldo") — never a substitute for BE authorization of the
    // withdrawal itself, which withdrawalRequest.submit still performs
    // exactly as before. See docs/be-handoff/security-reauthentication.md.
    const reauthed = await requireReauth('withdrawal');
    if (!reauthed) return;
    setStep(3);
    await withdrawalRequest.submit({ bankAccountId: account.id, amount: parsedAmount });
  };

  const startNewWithdrawal = () => {
    withdrawalRequest.reset();
    setAmount(balance > 0 ? String(balance.toFixed(2)) : '');
    setAmountError('');
    setStep(1);
  };

  return (
    <div
      className="flex min-h-page-content flex-col bg-background"
      // Espacio LOCAL adicional, solo mientras el teclado está abierto, para
      // que el <main> de PrivateLayout (sin tocar) tenga contenido extra que
      // recorrer y los campos de dirección puedan subir por encima del
      // teclado. No toca --app-height/--app-vh ni la altura de .app-shell/<main>.
      style={keyboardOpen ? { paddingBottom: keyboardInset + 24 } : undefined}
    >
      <ProfileSubHeader title="Cobrar Premios" subtitle="Retirada de saldo" />

      <div className="flex flex-col gap-4 p-4 pb-20">

        {/* Saldo actual header */}
        <section className="px-1 flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[10px] font-black text-manises-blue/40 uppercase tracking-[0.2em]">Saldo actual</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-black text-emerald-600 tracking-tight tabular-nums">
                {formatCurrency(balance)}
              </p>
              <span className="text-[10px] font-black text-emerald-600/40 uppercase tracking-widest animate-pulse">Disponible</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100 shrink-0">
            <Landmark className="w-5 h-5 text-emerald-600/60" />
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
                      onFocus={e => registerActiveField(e.currentTarget)}
                      onBlur={() => registerActiveField(null)}
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
                      onFocus={e => registerActiveField(e.currentTarget)}
                      onBlur={() => registerActiveField(null)}
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
                      onFocus={e => registerActiveField(e.currentTarget)}
                      onBlur={() => registerActiveField(null)}
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
                      onFocus={e => registerActiveField(e.currentTarget)}
                      onBlur={() => registerActiveField(null)}
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
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">

              {/* Importe */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-black text-manises-blue uppercase tracking-widest pl-1">Importe a retirar</p>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-manises-blue font-black text-lg">€</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={amount}
                    onChange={e => { setAmount(e.target.value); setAmountError(''); }}
                    className={`w-full h-12 pl-9 pr-4 rounded-2xl border-2 text-manises-blue font-black text-xl outline-none transition-all tabular-nums ${
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
                        <BankAccountCard
                          key={acc.id}
                          account={acc}
                          selected={selectedAccount === acc.id}
                          onSelect={() => { setSelectedAccount(acc.id); setAutoContinueAfterVerify(false); verification.reset(); }}
                        />
                      ))}

                      {verification.status !== 'idle' && (
                        <BankAccountVerificationPanel
                          status={verification.status}
                          onRetry={handleVerifyOwnership}
                          onChooseAnother={handleChooseAnotherAccount}
                          onAddAnother={handleAddAnotherAccount}
                          onDismiss={verification.reset}
                        />
                      )}

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
                    <motion.div key="add-account-form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                      <AddBankAccountForm
                        onAdd={addAccount}
                        onSuccess={handleAccountAdded}
                        onCancel={() => setIsAddingAccount(false)}
                        onRegisterActiveField={registerActiveField}
                      />
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
                    disabled={!account || verification.status === 'verifying'}
                    className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base shadow-md transition-all disabled:opacity-40 disabled:pointer-events-none"
                  >
                    {verification.status === 'verifying' ? 'Verificando cuenta...' : 'Continuar →'}
                  </Button>
                </PremiumTouchInteraction>
              )}
            </motion.div>
          )}

          {/* ── PASO 2: Revisión ───────────────────────────────── */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
                <div className="p-4 border-b border-border/50 bg-slate-50/50">
                  <p className="text-[10px] font-black text-manises-blue uppercase tracking-widest">Resumen de la solicitud</p>
                </div>
                <div className="divide-y divide-border/40 bg-white">
                  <SummaryRow label="Importe a cobrar" value={formatCurrency(parsedAmount)} highlight />
                  <SummaryRow label="Cuenta de destino" value={account?.ibanMasked || ''} />
                  <SummaryRow label="Entidad" value={account?.bank || ''} />
                  <SummaryRow label="Titular de la cuenta" value={profile?.displayName || ''} />
                  <SummaryRow label="Comisiones" value={WITHDRAWAL_DEMO_FEE_LABEL} />
                  <SummaryRow label="Plazo de procesamiento" value={WITHDRAWAL_DEMO_PROCESSING_TIME_LABEL} />
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200">
                <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[11px] font-medium text-amber-700 leading-relaxed">
                  <strong>Nota:</strong> tu solicitud será revisada y procesada. {WITHDRAWAL_DEMO_PROCESSING_NOTE}
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
                    disabled={withdrawalRequest.status === 'submitting'}
                    className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-lg border-b-4 border-emerald-800 transition-all border-none disabled:opacity-50"
                  >
                    Confirmar retirada
                  </Button>
                </PremiumTouchInteraction>
              </div>
            </motion.div>
          )}

          {/* ── PASO 3: Estado de la solicitud ───────────────────── */}
          {step === 3 && (
            <motion.div key="step3" initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <WithdrawalStatusPanel
                createStatus={withdrawalRequest.status}
                withdrawal={withdrawalRequest.withdrawal}
                errorMessage={withdrawalRequest.errorMessage}
                onRetry={() => account && withdrawalRequest.submit({ bankAccountId: account.id, amount: parsedAmount })}
                onGoToBalance={() => navigate('/profile/wallet')}
                onNewWithdrawal={startNewWithdrawal}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {gateModal}
    </div>
  );
}

function SummaryRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <span className="text-[11px] font-semibold text-muted-foreground">{label}</span>
      <span className={`text-[12px] font-black ${highlight ? 'text-emerald-600' : 'text-manises-blue'}`}>{value}</span>
    </div>
  );
}
