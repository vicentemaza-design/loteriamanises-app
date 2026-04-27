import { useState } from 'react';
import { X, Trophy, Bell, Info } from 'lucide-react';
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

  return (
    <div className="mx-4 flex items-center gap-3 rounded-2xl bg-manises-gold/10 border border-manises-gold/25 px-4 py-3">
      <div className="w-8 h-8 rounded-xl bg-manises-gold/20 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-amber-700" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-black text-amber-900 uppercase tracking-wider leading-none mb-0.5">
          {ann.title}
        </p>
        <p className="text-[11px] text-amber-800/80 font-medium leading-tight line-clamp-1">
          {ann.body}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {ann.cta && (
          <button
            onClick={() => navigate(ann.cta!.href)}
            className="text-[9px] font-black text-manises-blue uppercase tracking-widest whitespace-nowrap"
          >
            {ann.cta.label}
          </button>
        )}
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-700/40 hover:text-amber-700 transition-colors"
          aria-label="Cerrar aviso"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
