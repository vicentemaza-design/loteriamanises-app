import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/shared/ui/Button';
import { X, Camera, Image as ImageIcon, CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react';

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ScannerModal({ isOpen, onClose }: ScannerModalProps) {
  const [status, setStatus] = useState<'idle' | 'scanning' | 'processing' | 'result'>('idle');
  const [result, setResult] = useState<{ isWinner: boolean; prize?: string } | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setStatus('idle');
      setResult(null);
    }
  }, [isOpen]);

  const handleStartScan = () => {
    setStatus('scanning');
    // Simulate scan detection after 2s
    setTimeout(() => {
      setStatus('processing');
      // Simulate backend processing after 1.5s
      setTimeout(() => {
        const isWinner = Math.random() > 0.5;
        setResult({
          isWinner,
          prize: isWinner ? (Math.random() * 50 + 5).toFixed(2) + ' €' : undefined
        });
        setStatus('result');
      }, 1500);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black flex flex-col pt-safe"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-manises-gold/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-manises-gold" />
            </div>
            <h2 className="text-white font-bold text-base">Escanear Boleto</h2>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 relative flex flex-col items-center justify-center p-6">
          {status === 'idle' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <div className="w-24 h-24 rounded-3xl bg-manises-blue border-2 border-white/20 flex items-center justify-center mx-auto shadow-2xl">
                <Camera className="w-12 h-12 text-white" />
              </div>
              <div>
                <h3 className="text-white text-xl font-black mb-2 uppercase">Lector Oficial</h3>
                <p className="text-white/60 text-sm max-w-[240px] mx-auto font-medium">
                  Escanea el código QR de tu décimo o sube una captura de pantalla.
                </p>
              </div>
              <div className="flex flex-col gap-3 pt-4">
                <Button 
                  onClick={handleStartScan}
                  className="bg-manises-gold text-manises-blue font-bold h-14 rounded-2xl px-8 shadow-gold"
                >
                  Abrir Cámara
                </Button>
                <Button 
                  variant="ghost"
                  className="text-white/60 hover:text-white font-bold flex items-center gap-2"
                >
                  <ImageIcon className="w-5 h-5" /> Subir captura
                </Button>
              </div>
            </motion.div>
          )}

          {status === 'scanning' && (
            <div className="w-full aspect-[3/4] max-w-[300px] border-2 border-white/30 rounded-3xl overflow-hidden relative bg-zinc-900 shadow-2xl">
              {/* Mock Camera View */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-1 bg-manises-gold shadow-[0_0_15px_#E3B657] animate-scan-move" />
              </div>
              <div className="absolute bottom-6 left-0 right-0 text-center">
                <p className="text-[10px] text-white/50 font-black uppercase tracking-[0.2em] animate-pulse">
                  Buscando código...
                </p>
              </div>
            </div>
          )}

          {status === 'processing' && (
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-manises-gold animate-spin mx-auto mb-4" />
              <h3 className="text-white text-lg font-bold mb-1">Verificando Jugada</h3>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Conectando con Loterías y Apuestas...</p>
            </div>
          )}

          {status === 'result' && result && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`w-full max-w-[320px] p-8 rounded-3xl text-center shadow-2xl ${
                result.isWinner ? 'bg-emerald-500' : 'bg-zinc-800 border border-white/10'
              }`}
            >
              {result.isWinner ? (
                <>
                  <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-white text-2xl font-black mb-2 uppercase">¡Boleto Premiado!</h3>
                  <p className="text-white/80 text-sm font-bold mb-6">Has ganado un premio de:</p>
                  <div className="bg-white/10 rounded-2xl p-4 border border-white/20 mb-8">
                    <span className="text-4xl font-black text-white">{result.prize}</span>
                  </div>
                  <Button 
                    onClick={onClose}
                    className="w-full h-14 bg-white text-emerald-600 font-bold rounded-2xl shadow-xl"
                  >
                    Cobrar en mi Wallet
                  </Button>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-12 h-12 text-white/20" />
                  </div>
                  <h3 className="text-white text-xl font-bold mb-2">Sin premio directo</h3>
                  <p className="text-white/40 text-sm font-medium mb-8">
                    Este boleto no ha resultado premiado en esta ocasión. ¡Sigue probando suerte!
                  </p>
                  <Button 
                    onClick={() => setStatus('idle')}
                    variant="outline"
                    className="w-full h-14 border-white/10 text-white font-bold rounded-2xl"
                  >
                    Escanear otro
                  </Button>
                </>
              )}
            </motion.div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-8 text-center">
          <p className="text-white/20 text-[10px] font-semibold uppercase tracking-widest">
            Sello Oficial de Lotería Manises
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
