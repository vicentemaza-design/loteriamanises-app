import { useState } from 'react';
import { ArrowRight, X, Trophy, Bell, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MOCK_ANNOUNCEMENTS, type Announcement } from '../data/announcements.mock';

const ICON_MAP: Record<Announcement['type'], typeof Trophy> = {
  prize: Trophy,
  news: Bell,
  reminder: Info,
};

export function AnnouncementBanner() {
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();

  if (MOCK_ANNOUNCEMENTS.length === 0 || dismissed) return null;

  const ann = MOCK_ANNOUNCEMENTS[0];
  const Icon = ICON_MAP[ann.type];
  const extraAnnouncementsCount = Math.max(MOCK_ANNOUNCEMENTS.length - 1, 0);

  return (
    <div className="mx-4 rounded-[1.45rem] border border-slate-200/80 bg-white/92 px-3.5 py-2.5 shadow-sm backdrop-blur-sm">
      <div className="flex items-start gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-manises-gold/12 text-amber-700">
          <Icon className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[9px] font-black uppercase tracking-[0.16em] text-manises-blue">
              {ann.title}
            </p>
            <span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-slate-500">
              Demo
            </span>
            {extraAnnouncementsCount > 0 && (
              <span className="rounded-full bg-sky-50 px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-sky-700">
                +{extraAnnouncementsCount} avisos
              </span>
            )}
          </div>

          <p className="mt-1 text-[10px] font-medium leading-snug text-slate-500 line-clamp-2">
            {ann.body}
          </p>

          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
              Contenido informativo
            </span>
            {ann.cta && (
              <button
                onClick={() => navigate(ann.cta.href)}
                className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.14em] text-manises-blue"
              >
                {ann.cta.label}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="mt-0.5 shrink-0 text-slate-400 transition-colors hover:text-slate-600"
          aria-label="Cerrar aviso"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
