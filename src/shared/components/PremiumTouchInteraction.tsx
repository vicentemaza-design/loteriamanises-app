import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { cn } from '@/shared/lib/utils';

interface PremiumTouchProps {
  key?: React.Key;
  children: React.ReactNode;
  scale?: number;
  tapStrength?: number;
  className?: string;
}

/**
 * PremiumTouchInteraction - Sustituye el efecto magnético por una respuesta táctil de lujo.
 * Proporciona un efecto de "hundimiento" al presionar y un rebote elástico al soltar.
 * Optimizado para dispositivos móviles donde el feedback táctil es fundamental.
 */
export function PremiumTouchInteraction({ children, scale = 0.96, tapStrength = 1, className }: PremiumTouchProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const element = containerRef.current;
    if (!element) return;

    // Animación de presión (Sink)
    const onPress = () => {
      gsap.to(element, {
        scale: scale,
        duration: 0.2,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    };

    // Animación de liberación (Pop/Bounce)
    const onRelease = () => {
      gsap.to(element, {
        scale: 1,
        duration: 0.6,
        ease: 'elastic.out(1.2, 0.4)',
        overwrite: 'auto'
      });
    };

    // Eventos Táctiles y Ratón (fallback)
    element.addEventListener('touchstart', onPress, { passive: true });
    element.addEventListener('touchend', onRelease, { passive: true });
    element.addEventListener('mousedown', onPress);
    element.addEventListener('mouseup', onRelease);
    element.addEventListener('mouseleave', onRelease);

    return () => {
      element.removeEventListener('touchstart', onPress);
      element.removeEventListener('touchend', onRelease);
      element.removeEventListener('mousedown', onPress);
      element.removeEventListener('mouseup', onRelease);
      element.removeEventListener('mouseleave', onRelease);
    };
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className={cn("inline-block transition-transform duration-200", className)}>
      {children}
    </div>
  );
}
