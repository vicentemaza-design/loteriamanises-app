import { CheckCircle2, Circle } from 'lucide-react';
import { PASSWORD_RULES } from '@/features/auth/lib/passwordRules';

interface PasswordRequirementsListProps {
  password: string;
}

/**
 * Live checklist of password requirements. Validity is conveyed by icon
 * (filled check vs. empty circle) AND text, never by color alone.
 */
export function PasswordRequirementsList({ password }: PasswordRequirementsListProps) {
  return (
    <ul aria-live="polite" className="grid grid-cols-2 gap-x-2 gap-y-1.5 py-1">
      {PASSWORD_RULES.map((rule) => {
        const met = rule.test(password);
        return (
          <li key={rule.id} className="flex items-center gap-1.5">
            {met ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
            ) : (
              <Circle className="w-3.5 h-3.5 text-white/25 shrink-0" aria-hidden="true" />
            )}
            <span className={`text-[10.5px] font-semibold ${met ? 'text-emerald-300' : 'text-white/40'}`}>
              {rule.label}
              <span className="sr-only">{met ? ' (cumplido)' : ' (pendiente)'}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
