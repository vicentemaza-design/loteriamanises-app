import { ArrowRight, Link2, Users } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import type { CompanyCollectiveDemo } from '../data/company-demo.mock';

interface CompanyAccessCardProps {
  company: CompanyCollectiveDemo;
  accessCode: string;
  demoLinkLabel: string;
  onAccessCodeChange: (value: string) => void;
  onOpenDemo: () => void;
  onOpenLink: () => void;
}

export function CompanyAccessCard({
  company,
  accessCode,
  demoLinkLabel,
  onAccessCodeChange,
  onOpenDemo,
  onOpenLink,
}: CompanyAccessCardProps) {
  return (
    <section className="overflow-hidden rounded-[1.55rem] border border-slate-200/80 bg-white shadow-[0_14px_32px_rgba(15,23,42,0.08)]">
      <div className="border-b border-slate-100 bg-[linear-gradient(135deg,rgba(10,71,146,0.08),rgba(245,158,11,0.08))] p-3.5">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.1rem] bg-manises-blue text-base font-black tracking-tight text-white shadow-sm">
            {company.shortName}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/85 px-2 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-manises-blue">
                {company.accentLabel}
              </span>
              <span className="rounded-full bg-manises-gold/10 px-2 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-amber-700">
                {company.accessLabel}
              </span>
            </div>

            <h1 className="mt-1.5 text-[1rem] font-black leading-tight tracking-tight text-manises-blue">
              {company.name}
            </h1>
            <p className="mt-1 text-[11px] font-medium leading-relaxed text-slate-500">
              {company.description}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3 p-3.5">
        <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-2.5">
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-manises-blue/55" />
            <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
              Colectivo
            </p>
          </div>
          <p className="mt-1 text-[12px] font-black leading-tight text-manises-blue">
            {company.memberCountLabel}
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="company-demo-access" className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
            Código demo
          </label>
          <div className="flex gap-2">
            <Input
              id="company-demo-access"
              value={accessCode}
              onChange={(event) => onAccessCodeChange(event.target.value)}
              placeholder="Introduce tu código demo"
              className="h-10 rounded-2xl border-slate-200 bg-slate-50/70 font-mono text-[13px] font-black uppercase tracking-[0.18em] text-manises-blue"
            />
            <Button
              onClick={onOpenDemo}
              className="h-10 rounded-2xl bg-manises-blue px-4 text-[10px] font-black uppercase tracking-[0.14em] text-white"
            >
              Abrir
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-2.5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
                Enlace de colectivo
              </p>
              <p className="mt-1 truncate font-mono text-[11px] font-bold text-manises-blue">
                {demoLinkLabel.split('/').filter(Boolean).pop()}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenLink}
              className="h-8 rounded-xl border-slate-200 px-3 text-[10px] font-black uppercase tracking-[0.12em] text-manises-blue"
            >
              <Link2 className="h-3.5 w-3.5" />
              Ir
            </Button>
          </div>
        </div>

        <p className="px-1 text-[10px] font-medium leading-relaxed text-slate-400">
          Flujo simulado para esta demo.
        </p>

        <button
          type="button"
          onClick={onOpenDemo}
          className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-left transition-colors hover:border-manises-blue/30 hover:bg-manises-blue/[0.03]"
        >
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
              Acceso rápido
            </p>
            <p className="mt-1 text-[12px] font-black text-manises-blue">
              Abrir colectivo demo con el código actual
            </p>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-manises-blue/60" />
        </button>
      </div>
    </section>
  );
}
