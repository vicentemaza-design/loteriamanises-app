import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import type { IScannerControls } from '@zxing/browser';
import { NavArrowLeft, InfoCircle } from 'iconoir-react/regular';
import { toast } from 'sonner';

interface DecimoQrScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (digits: string) => void;
}

type CameraState = 'starting' | 'active' | 'denied' | 'unavailable';

export function DecimoQrScanner({ isOpen, onClose, onScan }: DecimoQrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const hasScannedRef = useRef(false);
  const [cameraState, setCameraState] = useState<CameraState>('starting');

  useEffect(() => {
    if (!isOpen) return;

    hasScannedRef.current = false;
    setCameraState('starting');
    const reader = new BrowserMultiFormatReader();
    let cancelled = false;

    reader
      .decodeFromVideoDevice(undefined, videoRef.current ?? undefined, (result, _error, controls) => {
        controlsRef.current = controls;
        if (cancelled || hasScannedRef.current || !result) return;

        const digits = result.getText().replace(/\D/g, '').slice(0, 5);
        if (!digits) return;

        hasScannedRef.current = true;
        controls.stop();
        onScan(digits);
      })
      .then(() => {
        if (!cancelled) setCameraState('active');
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const name = err instanceof Error ? err.name : '';
        setCameraState(name === 'NotAllowedError' ? 'denied' : 'unavailable');
      });

    return () => {
      cancelled = true;
      controlsRef.current?.stop();
      controlsRef.current = null;
    };
  }, [isOpen, onScan]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-black">
      {/* Header */}
      <div
        className="relative z-10 flex items-center justify-between px-4 pb-3"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 14px)' }}
      >
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          aria-label="Cerrar escáner"
        >
          <NavArrowLeft className="h-5 w-5" />
        </button>
        <span className="text-[15px] font-bold text-white">Escanear</span>
        <button
          type="button"
          onClick={() => toast.info('Apunta a un código QR o de barras con el número del décimo.')}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          aria-label="Información"
        >
          <InfoCircle className="h-5 w-5" />
        </button>
      </div>

      {/* Cámara */}
      <div className="relative flex-1 overflow-hidden bg-zinc-900">
        <video ref={videoRef} muted playsInline className="absolute inset-0 h-full w-full object-cover" />

        {cameraState === 'active' && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-7 px-8">
            <p className="max-w-[260px] text-center text-[13px] font-medium leading-snug text-white/90">
              Coloca el código QR o código de barras dentro del recuadro
            </p>
            <div
              className="relative h-[230px] w-[230px] rounded-2xl"
              style={{ boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)' }}
            >
              {([
                'left-0 top-0 border-l-[3px] border-t-[3px] rounded-tl-2xl',
                'right-0 top-0 border-r-[3px] border-t-[3px] rounded-tr-2xl',
                'left-0 bottom-0 border-l-[3px] border-b-[3px] rounded-bl-2xl',
                'right-0 bottom-0 border-r-[3px] border-b-[3px] rounded-br-2xl',
              ]).map((corner) => (
                <div
                  key={corner}
                  className={`absolute h-8 w-8 border-manises-gold ${corner}`}
                />
              ))}
            </div>
          </div>
        )}

        {cameraState === 'starting' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-[12px] font-semibold uppercase tracking-widest text-white/50">Activando cámara…</p>
          </div>
        )}

        {(cameraState === 'denied' || cameraState === 'unavailable') && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 px-6">
            <div className="w-full max-w-[300px] rounded-2xl bg-white p-5 text-center shadow-2xl">
              <p className="text-[15px] font-black text-manises-blue">Lotería Manises</p>
              <p className="mt-2 text-[12.5px] leading-relaxed text-slate-500">
                {cameraState === 'denied'
                  ? 'No se puede acceder a la cámara porque la app no tiene permiso. Ve a Ajustes > Privacidad > Cámara y actívalo.'
                  : 'No se ha encontrado ninguna cámara disponible en este dispositivo.'}
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-4 w-full rounded-full border border-manises-blue/30 py-2.5 text-[13px] font-bold text-manises-blue transition-colors hover:bg-manises-blue/5"
              >
                Aceptar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Barra inferior */}
      <div
        className="relative z-10 flex items-center justify-center px-6 pt-4"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 20px)' }}
      >
        <button
          type="button"
          onClick={onClose}
          className="text-[12.5px] font-black uppercase tracking-widest text-white/80 transition-colors hover:text-white"
        >
          Escribir manualmente
        </button>
      </div>
    </div>
  );
}
