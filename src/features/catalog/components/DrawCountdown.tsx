import React, { useState, useEffect } from 'react';
import { getCountdown } from '@/shared/lib/utils';

interface DrawCountdownProps {
  iso: string;
}

/**
 * DrawCountdown - Un contador visual premium diseñado para la Home.
 * Muestra el tiempo restante de forma segmentada y elegante.
 */
export function DrawCountdown({ iso }: DrawCountdownProps) {
  const [countdown, setCountdown] = useState(getCountdown(iso));

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getCountdown(iso));
    }, 1000);
    return () => clearInterval(timer);
  }, [iso]);

  if (countdown.isPast) {
    return (
      <div className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">
        ¡Sorteo en curso!
      </div>
    );
  }

  return (
    <div className="flex gap-2.5 items-center">
      <TimeUnit value={countdown.days} label="días" />
      <span className="text-white/20 font-black mb-4">:</span>
      <TimeUnit value={countdown.hours} label="horas" />
      <span className="text-white/20 font-black mb-4">:</span>
      <TimeUnit value={countdown.minutes} label="min" />
    </div>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl w-11 h-11 flex items-center justify-center shadow-xl">
        <span className="text-xl font-black text-white tabular-nums tracking-tighter">
          {value.toString().padStart(2, '0')}
        </span>
      </div>
      <span className="text-[7px] font-black text-white/40 uppercase tracking-[0.2em]">
        {label}
      </span>
    </div>
  );
}
