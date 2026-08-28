import { ArrowLeft } from 'lucide-react';

interface LegalDocumentHeaderProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
}

/**
 * Header for the AUTHENTICATED /profile/legal/* documents. Renders as a
 * compact section subheader immediately below PrivateLayout's general
 * Header — sticky within <main> (PrivateLayout's own scroll container), not
 * a replacement for it. Deliberately not ProfileSubHeader (white): the blue
 * surface signals "you're still inside the app", distinct from the neutral
 * public presentation of the same document.
 */
export function LegalDocumentHeader({ title, subtitle, onBack }: LegalDocumentHeaderProps) {
  return (
    <div className="sticky top-0 z-20 flex h-14 items-center gap-3 bg-manises-blue px-4 shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
      <button
        type="button"
        onClick={onBack}
        aria-label="Volver"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/90 transition-all hover:bg-white/10 active:scale-95"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>

      <div className="flex min-w-0 flex-col">
        <h1 className="truncate text-sm font-bold leading-none tracking-tight text-white">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-0.5 truncate text-[10px] font-medium uppercase tracking-widest text-white/60">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
