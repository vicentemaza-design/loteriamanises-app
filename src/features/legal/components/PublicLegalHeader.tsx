import { ArrowLeft } from 'lucide-react';

interface PublicLegalHeaderProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
}

/**
 * Header for the PUBLIC /legal/* documents (LegalLayout). Deliberately
 * distinct from ProfileSubHeader/LegalDocumentHeader: no private Header, no
 * BottomNav, no cart — sticky within LegalLayout's own scroll container,
 * with its own safe-area-top reservation so the title never sits under the
 * iOS status bar (legal routes don't mount PrivateLayout/PublicLayout, so
 * neither's status-bar handling applies here).
 */
export function PublicLegalHeader({ title, subtitle, onBack }: PublicLegalHeaderProps) {
  return (
    <div
      className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-100 bg-background/95 px-4 backdrop-blur-md"
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        minHeight: 'calc(3.5rem + env(safe-area-inset-top, 0px))',
      }}
    >
      <button
        type="button"
        onClick={onBack}
        aria-label="Volver"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-manises-blue/80 transition-all hover:bg-muted active:scale-95"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>

      <div className="flex min-w-0 flex-col">
        <h1 className="truncate text-sm font-bold leading-none tracking-tight text-manises-blue">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-0.5 truncate text-[10px] font-medium uppercase tracking-widest text-muted-foreground opacity-60">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
