import { useState } from 'react';
import { motion } from 'motion/react';
import { X, CreditCard, Smartphone, ShieldCheck, ArrowRight, Loader2, Lock } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { formatCurrency } from '@/shared/lib/utils';

export interface SavedCardData {
  last4: string;
  expires: string;
  brand: 'Visa' | 'Mastercard';
}

interface RedsysGatewayProps {
  /** 'payment' → pago con opción de guardar. 'tokenize' → solo guardar tarjeta (0 €). */
  mode?: 'payment' | 'tokenize';
  amount?: number;
  onAuthorize: (saveCard: boolean, cardData: SavedCardData) => void;
  onCancel: () => void;
}

function formatCardNumber(val: string) {
  return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(val: string) {
  const digits = val.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
}

function detectBrand(num: string): 'Visa' | 'Mastercard' {
  return num.replace(/\s/g, '').startsWith('4') ? 'Visa' : 'Mastercard';
}

export function RedsysGateway({ mode = 'payment', amount = 0, onAuthorize, onCancel }: RedsysGatewayProps) {
  const isTokenize = mode === 'tokenize';

  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  // En modo tokenize arranca marcado por defecto, pero el usuario puede desmarcarlo
  const [saveCard, setSaveCard] = useState(isTokenize);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [otp, setOtp] = useState('');

  const isFormValid =
    cardNumber.replace(/\s/g, '').length === 16 &&
    cardName.trim().length > 2 &&
    expiry.length === 5 &&
    cvv.length >= 3;

  async function handleAuthorize() {
    if (otp.length < 4) return;
    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 1200));
    const digits = cardNumber.replace(/\s/g, '');
    onAuthorize(saveCard, {
      last4: digits.slice(-4) || '0000',
      expires: expiry,
      brand: detectBrand(cardNumber),
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex flex-col bg-[#f4f6f9] overflow-y-auto"
    >
      {/* Header Redsys */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-[#004a8f] flex items-center justify-center">
            <Lock className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <p className="text-[11px] font-black text-[#004a8f] tracking-widest uppercase">Redsys</p>
            <p className="text-[9px] text-gray-400 font-medium">Pasarela de pago segura · Demo</p>
          </div>
        </div>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 p-1">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Merchant info */}
      <div className="bg-[#004a8f] px-5 py-4 text-white shrink-0">
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Comercio</p>
        <p className="text-sm font-black">Admón. Lotería nº 3 Manises</p>
        <div className="mt-2 flex items-end justify-between">
          {isTokenize ? (
            <>
              <p className="text-[10px] opacity-60 font-medium">Operación</p>
              <div className="text-right">
                <p className="text-lg font-black">Guardar tarjeta</p>
                <p className="text-[10px] opacity-60">Verificación sin cargo (0,00 €)</p>
              </div>
            </>
          ) : (
            <>
              <p className="text-[10px] opacity-60 font-medium">Importe a autorizar</p>
              <p className="text-2xl font-black">{formatCurrency(amount)}</p>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 px-5 py-5 space-y-4 max-w-md w-full mx-auto">
        {step === 'form' ? (
          <>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
              <p className="text-[10px] font-black text-[#004a8f] uppercase tracking-widest">Datos de tarjeta</p>

              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0000 0000 0000 0000"
                  value={cardNumber}
                  onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                  className="w-full h-12 px-4 pr-12 rounded-xl border-2 border-gray-200 bg-gray-50 text-sm font-bold text-gray-800 outline-none focus:border-[#004a8f] transition-all tracking-widest"
                />
                <CreditCard className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="MM/AA"
                  maxLength={5}
                  value={expiry}
                  onChange={e => setExpiry(formatExpiry(e.target.value))}
                  className="h-12 px-4 rounded-xl border-2 border-gray-200 bg-gray-50 text-sm font-bold text-gray-800 outline-none focus:border-[#004a8f] transition-all"
                />
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="CVV"
                    maxLength={4}
                    value={cvv}
                    onChange={e => setCvv(e.target.value.replace(/\D/g, ''))}
                    className="w-full h-12 px-4 pr-10 rounded-xl border-2 border-gray-200 bg-gray-50 text-sm font-bold text-gray-800 outline-none focus:border-[#004a8f] transition-all"
                  />
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                </div>
              </div>

              <input
                type="text"
                placeholder="Nombre del titular"
                value={cardName}
                onChange={e => setCardName(e.target.value.toUpperCase())}
                className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 bg-gray-50 text-sm font-bold text-gray-800 outline-none focus:border-[#004a8f] transition-all uppercase"
              />
            </div>

            {/* Guardar tarjeta */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <div className="relative mt-0.5 shrink-0" onClick={() => setSaveCard(v => !v)}>
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                      saveCard ? 'bg-[#004a8f] border-[#004a8f]' : 'border-gray-300 bg-white'
                    }`}
                  >
                    {saveCard && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                </div>
                <div onClick={() => setSaveCard(v => !v)}>
                  <p className="text-xs font-bold text-gray-800">Guardar tarjeta para futuras compras</p>
                  <p className="text-[10px] text-gray-500 leading-relaxed mt-0.5">
                    Autorizo a la Admón. Lotería nº 3 Manises a tokenizar esta tarjeta en Redsys para agilizar futuras compras.
                    Podrás eliminarla en cualquier momento desde tu perfil.
                  </p>
                </div>
              </label>
            </div>

            {/* Sellos de seguridad */}
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-3 py-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-[9px] font-black text-blue-900 uppercase tracking-wider">Visa Secure</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-3 py-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-red-500" />
                <span className="text-[9px] font-black text-red-900 uppercase tracking-wider">MC ID Check</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-3 py-1.5">
                <Lock className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-[9px] font-black text-gray-700 uppercase tracking-wider">3D Secure</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <Button
                onClick={() => setStep('otp')}
                disabled={!isFormValid}
                className="w-full h-14 rounded-2xl bg-[#004a8f] hover:bg-[#003570] text-white font-black text-base disabled:opacity-40"
              >
                Continuar <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <button
                onClick={onCancel}
                className="w-full h-11 rounded-2xl text-gray-500 text-sm font-semibold hover:bg-gray-100 transition-all"
              >
                Cancelar y volver
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-[#004a8f]" />
                </div>
                <div>
                  <p className="text-sm font-black text-gray-800">Verificación del banco</p>
                  <p className="text-[10px] text-gray-500">Tu banco ha enviado un código SMS a +34 *** *** 12</p>
                </div>
              </div>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Código de 6 dígitos"
                maxLength={6}
                value={otp}
                autoFocus
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full h-14 px-4 rounded-xl border-2 border-gray-200 bg-gray-50 text-xl font-black text-center text-gray-800 outline-none focus:border-[#004a8f] transition-all tracking-[0.4em]"
              />
              <p className="text-[10px] text-gray-400 text-center">
                Demo: introduce cualquier código de 4–6 dígitos para continuar
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                onClick={handleAuthorize}
                disabled={otp.length < 4 || isProcessing}
                className="w-full h-14 rounded-2xl bg-[#004a8f] hover:bg-[#003570] text-white font-black text-base disabled:opacity-40"
              >
                {isProcessing ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> {isTokenize ? 'Guardando...' : 'Autorizando...'}</>
                ) : (
                  <>{isTokenize ? 'Guardar tarjeta' : 'Autorizar pago'} <ShieldCheck className="w-5 h-5 ml-2" /></>
                )}
              </Button>
              <button
                onClick={() => setStep('form')}
                className="w-full h-11 rounded-2xl text-gray-500 text-sm font-semibold hover:bg-gray-100 transition-all"
              >
                ← Volver a los datos
              </button>
            </div>
          </>
        )}

        <p className="text-[9px] text-gray-400 text-center pb-4 leading-relaxed">
          Pasarela segura gestionada por Redsys · Banco Santander · Los datos de tu tarjeta nunca son accesibles por el comercio
        </p>
      </div>
    </motion.div>
  );
}
