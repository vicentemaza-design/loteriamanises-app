import { ArrowLeft } from 'lucide-react';

interface PublicLegalHeaderProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
}

/**
 * Header for the PUBLIC /legal/* documents (LegalLayout). Deliberately
 * distinct from ProfileSubHeader/LegalDocumentHeader: no private Header, no
 * BottomNav, no cart — sticky within LegalLayout's own scroll container.
 * `bg-manises-blue` paints the full border-box, including the
 * safe-area-inset-top padding, so the physical status-bar area and the
 * header content form one continuous blue surface instead of a seam.
 */
export function PublicLegalHeader({ title, subtitle, onBack }: PublicLegalHeaderProps) {
  return (
    <div
      className="sticky top-0 z-30 flex items-center gap-3 bg-manises-blue px-4 shadow-[0_4px_16px_rgba(0,0,0,0.12)]"
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        minHeight: 'calc(4rem + env(safe-area-inset-top, 0px))',
      }}
    >
      <button
        type="button"
        onClick={onBack}
        aria-label="Volver"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white transition-all hover:bg-white/10 active:scale-95"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>

      <div className="flex min-w-0 flex-col">
        <h1 className="truncate text-[17px] font-bold leading-tight text-white">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-0.5 truncate text-[11px] font-medium uppercase tracking-wide text-white/65">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
