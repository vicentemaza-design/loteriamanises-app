import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { X, Lock, ShieldCheck, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/shared/lib/utils';

/**
 * Datos de tarjeta tokenizada recibidos desde el backend tras la autorización Redsys.
 * El frontend nunca recoge estos datos directamente — los obtiene del BE que los recibe
 * vía notificación server-to-server de Redsys.
 */
export interface SavedCardData {
  last4: string;
  expires: string;
  brand: 'Visa' | 'Mastercard';
}

/**
 * Parámetros firmados que el backend proporciona para iniciar una sesión Redsys.
 * El frontend los usa para auto-enviar el formulario oculto al banco.
 */
export interface RedsysSessionParams {
  formUrl: string;
  Ds_SignatureVersion: string;
  Ds_MerchantParameters: string;
  Ds_Signature: string;
}

interface RedsysGatewayProps {
  /** 'payment' → pago con importe. 'tokenize' → solo guardar tarjeta (0 €). */
  mode?: 'payment' | 'tokenize';
  amount?: number;
  /**
   * Llamado cuando el banco autoriza la operación.
   * En producción: se invoca desde la URL de retorno configurada en Redsys
   * (el BE la procesa y notifica al frontend). No se llama desde aquí directamente.
   */
  onAuthorize: (saveCard: boolean, cardData: SavedCardData) => void;
  onCancel: () => void;
  /**
   * Parámetros firmados del BE. Cuando estén disponibles, el componente
   * auto-enviará el formulario oculto a la pasarela del banco.
   * Pendiente de integración BE.
   */
  sessionParams?: RedsysSessionParams;
}

export function RedsysGateway({
  mode = 'payment',
  amount = 0,
  onCancel,
  sessionParams,
}: RedsysGatewayProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const isTokenize = mode === 'tokenize';

  /**
   * Cuando el BE proporcione los parámetros firmados, este efecto auto-envía
   * el formulario oculto y el usuario es redirigido a la página del banco.
   * El frontend no vuelve a intervenir hasta que Redsys redirige al urlOK/urlKO.
   */
  useEffect(() => {
    if (sessionParams && formRef.current) {
      const form = formRef.current;
      form.action = sessionParams.formUrl;
      (form.elements.namedItem('Ds_SignatureVersion') as HTMLInputElement).value =
        sessionParams.Ds_SignatureVersion;
      (form.elements.namedItem('Ds_MerchantParameters') as HTMLInputElement).value =
        sessionParams.Ds_MerchantParameters;
      (form.elements.namedItem('Ds_Signature') as HTMLInputElement).value =
        sessionParams.Ds_Signature;
      form.submit();
    }
  }, [sessionParams]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex flex-col bg-[#f4f6f9] overflow-y-auto"
    >
      {/* Cabecera Redsys */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-[#004a8f] flex items-center justify-center">
            <Lock className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <p className="text-[11px] font-black text-[#004a8f] tracking-widest uppercase">Redsys</p>
            <p className="text-[9px] text-gray-400 font-medium">Pasarela de pago segura</p>
          </div>
        </div>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 p-1">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Información del comercio */}
      <div className="bg-[#004a8f] px-5 py-4 text-white shrink-0">
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Comercio</p>
        <p className="text-sm font-black">Admón. Lotería nº 3 Manises</p>
        <div className="mt-2 flex items-end justify-between">
          {isTokenize ? (
            <div className="w-full text-right">
              <p className="text-lg font-black">Añadir tarjeta</p>
              <p className="text-[10px] opacity-60">Verificación sin cargo · 0,00 €</p>
            </div>
          ) : (
            <>
              <p className="text-[10px] opacity-60 font-medium">Importe a autorizar</p>
              <p className="text-2xl font-black">{formatCurrency(amount)}</p>
            </>
          )}
        </div>
      </div>

      {/* Estado: conectando / redirigiendo */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-8 py-10 text-center">
        <div className="w-20 h-20 rounded-full bg-[#004a8f]/10 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-[#004a8f] animate-spin" />
        </div>

        <div className="max-w-xs">
          <p className="text-lg font-black text-[#004a8f]">Conectando con tu banco</p>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            Serás redirigido a la pasarela segura de{' '}
            <span className="font-bold text-[#004a8f]">Redsys</span>{' '}
            donde{' '}
            {isTokenize
              ? 'podrás añadir tu tarjeta de forma segura.'
              : 'completarás el pago de forma segura.'}
          </p>
          <p className="text-[10px] text-gray-400 mt-4 leading-relaxed">
            Los datos de tu tarjeta se introducen directamente en la página del banco.
            Lotería Manises nunca accede a los datos de tu tarjeta.
          </p>
        </div>

        {/* Sellos de seguridad */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {[
            { label: 'Visa Secure', color: 'text-blue-600' },
            { label: 'MC ID Check', color: 'text-red-500' },
            { label: '3D Secure',   color: 'text-gray-500' },
          ].map(({ label, color }) => (
            <div key={label} className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-3 py-1.5">
              <ShieldCheck className={`w-3.5 h-3.5 ${color}`} />
              <span className="text-[9px] font-black text-gray-700 uppercase tracking-wider">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Cancelar */}
      <div className="px-5 pb-8 shrink-0">
        <button
          onClick={onCancel}
          className="w-full h-11 rounded-2xl text-gray-500 text-sm font-semibold hover:bg-gray-100 transition-all border border-gray-200"
        >
          Cancelar y volver
        </button>
        <p className="text-[9px] text-gray-400 text-center mt-3 leading-relaxed">
          Pasarela segura gestionada por Redsys · Banco Santander
        </p>
      </div>

      {/*
        Formulario oculto — se auto-envía cuando el BE proporciona los parámetros firmados.
        En producción: api.payments.initiateSession() → sessionParams → useEffect → form.submit()
      */}
      <form ref={formRef} method="POST" style={{ display: 'none' }}>
        <input type="hidden" name="Ds_SignatureVersion" />
        <input type="hidden" name="Ds_MerchantParameters" />
        <input type="hidden" name="Ds_Signature" />
      </form>
    </motion.div>
  );
}
