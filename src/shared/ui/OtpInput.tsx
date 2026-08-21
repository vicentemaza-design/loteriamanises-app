import { useEffect, useRef, type ClipboardEvent, type KeyboardEvent } from 'react';
import { cn } from '@/shared/lib/utils';

export interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  /** Renders boxes in an error (red border) state without clearing the value. */
  error?: boolean;
  /** Passed to each box's aria-label, e.g. "Dígito 1 de 6 del código de verificación". */
  ariaLabel?: string;
}

/**
 * 6-digit (configurable) OTP entry: one box per digit, numeric-only,
 * auto-advance on entry, Backspace navigates to the previous box, full-code
 * paste supported from any box, arrow-key navigation. Styled to match
 * shared/ui/Input.tsx (same radius/shadow/focus-ring tokens).
 */
export function OtpInput({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled = false,
  autoFocus = true,
  error = false,
  ariaLabel = 'Código de verificación',
}: OtpInputProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? '');

  useEffect(() => {
    if (autoFocus) {
      inputRefs.current[0]?.focus();
    }
    // Only on mount — re-focusing on every value change would steal focus mid-typing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setDigitAt = (index: number, digit: string) => {
    const next = digits.slice();
    next[index] = digit;
    const joined = next.join('').slice(0, length);
    onChange(joined);
    // Check the ARRAY for empty slots, not the joined STRING — every string
    // "includes" the empty string, so that check would always be true here.
    if (next.length === length && next.every((d) => d !== '')) {
      onComplete?.(joined);
    }
  };

  const handleChange = (index: number, raw: string) => {
    const onlyDigits = raw.replace(/\D/g, '');
    if (!onlyDigits) {
      setDigitAt(index, '');
      return;
    }
    // A paste landing on a single box (e.g. via context menu) can carry the
    // full code — distribute it starting at this box, same as handlePaste.
    if (onlyDigits.length > 1) {
      distributeFrom(index, onlyDigits);
      return;
    }
    setDigitAt(index, onlyDigits);
    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const distributeFrom = (startIndex: number, digitsToPlace: string) => {
    const next = digits.slice();
    let cursor = startIndex;
    for (const ch of digitsToPlace) {
      if (cursor >= length) break;
      next[cursor] = ch;
      cursor += 1;
    }
    const joined = next.join('').slice(0, length);
    onChange(joined);
    const focusIndex = Math.min(cursor, length - 1);
    inputRefs.current[focusIndex]?.focus();
    if (next.length === length && next.every((d) => d !== '')) {
      onComplete?.(joined);
    }
  };

  const handlePaste = (index: number, event: ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '');
    if (!pasted) return;
    event.preventDefault();
    distributeFrom(index, pasted);
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace') {
      if (digits[index]) {
        setDigitAt(index, '');
        return;
      }
      if (index > 0) {
        event.preventDefault();
        setDigitAt(index - 1, '');
        inputRefs.current[index - 1]?.focus();
      }
      return;
    }
    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      inputRefs.current[index - 1]?.focus();
      return;
    }
    if (event.key === 'ArrowRight' && index < length - 1) {
      event.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  return (
    <div role="group" aria-label={ariaLabel} className="flex items-center justify-center gap-2">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => { inputRefs.current[index] = el; }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          value={digit}
          disabled={disabled}
          aria-label={`Dígito ${index + 1} de ${length}`}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={(e) => handlePaste(index, e)}
          onFocus={(e) => e.currentTarget.select()}
          className={cn(
            'h-12 w-11 shrink-0 rounded-sm border bg-card/50 text-center text-lg font-black tabular-nums shadow-inner-soft outline-none transition-all',
            'focus-visible:ring-2 focus-visible:ring-manises-gold/40 focus-visible:border-manises-gold',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error ? 'border-destructive text-destructive' : 'border-input text-manises-blue'
          )}
        />
      ))}
    </div>
  );
}
