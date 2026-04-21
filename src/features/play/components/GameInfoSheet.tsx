import { AnimatePresence, motion } from 'motion/react';
import { Xmark, InfoCircle, BrightStar, WarningTriangle } from 'iconoir-react/regular';
import type { LotteryGame } from '@/shared/types/domain';
import { GameBadge } from '@/shared/ui/GameBadge';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/shared/lib/utils';
import { MOTION_EASE_OUT, listItemFadeUp, listStagger, panelSwap } from '@/shared/lib/motion';
import type { GameHelpContent } from '../lib/game-help';

interface GameInfoSheetProps {
  game: LotteryGame;
  isOpen: boolean;
  onClose: () => void;
  content: GameHelpContent;
}

export function GameInfoSheet({ game, isOpen, onClose, content }: GameInfoSheetProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            type="button"
            aria-label="Cerrar información del juego"
            className="fixed inset-0 z-[79] bg-slate-950/52 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: MOTION_EASE_OUT }}
            onClick={onClose}
          />

          <motion.div
            className="fixed inset-x-0 bottom-0 z-[80] mx-auto w-full max-w-[32rem] overflow-hidden rounded-t-[2rem] border border-white/10 bg-white shadow-[0_-24px_80px_rgba(15,23,42,0.35)]"
            variants={panelSwap}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div
              className="relative overflow-hidden px-5 pb-5 pt-4 text-white"
              style={{ background: `linear-gradient(135deg, ${game.color}, ${game.colorEnd ?? game.color})` }}
            >
              <div className="absolute left-1/2 top-2 h-1.5 w-12 -translate-x-1/2 rounded-full bg-white/30" />
              <div className="absolute -right-8 top-8 h-28 w-28 rounded-full bg-white/10 blur-2xl" />

              <div className="relative flex items-start justify-between gap-3 pt-4">
                <div className="flex items-start gap-3">
                  <GameBadge game={game} size="md" className="bg-white/10 shadow-none" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/68">Guía contextual</p>
                    <h2 className="mt-1 text-xl font-black leading-tight">{game.name}</h2>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white">
                        {content.modeLabel}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-white/74">
                        <InfoCircle className="h-3.5 w-3.5" />
                        Ayuda del modo activo
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-10 w-10 rounded-xl bg-white/10 text-white hover:bg-white/16 hover:text-white"
                  aria-label="Cerrar ayuda"
                >
                  <Xmark className="h-5 w-5" />
                </Button>
              </div>

              <p className="relative mt-4 max-w-[22rem] text-sm font-medium leading-relaxed text-white/82">
                {content.summary}
              </p>
            </div>

            <div className="max-h-[72vh] overflow-y-auto px-5 pb-[calc(env(safe-area-inset-bottom,0px)+1.25rem)] pt-5">
              <div className="grid grid-cols-3 gap-2.5">
                {content.quickFacts.map((fact) => (
                  <div key={fact.label} className="rounded-2xl border border-slate-200/80 bg-slate-50 px-3 py-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">{fact.label}</p>
                    <p className="mt-1 text-sm font-black leading-tight text-manises-blue">{fact.value}</p>
                  </div>
                ))}
              </div>

              <motion.div
                className="mt-4 space-y-3"
                variants={listStagger}
                initial="hidden"
                animate="visible"
              >
                {content.sections.map((section) => (
                  <motion.section
                    key={section.title}
                    variants={listItemFadeUp}
                    className="rounded-[1.35rem] border border-slate-200/80 bg-white px-4 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)]"
                  >
                    <h3 className="text-[11px] font-black uppercase tracking-[0.18em] text-manises-blue/72">
                      {section.title}
                    </h3>
                    <ul className="mt-3 space-y-2">
                      {section.bullets.map((bullet) => (
                        <li key={bullet} className="flex items-start gap-2.5 text-[13px] font-medium leading-relaxed text-slate-600">
                          <span
                            className={cn(
                              'mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full',
                              game.type === 'quiniela' ? 'bg-red-500' : 'bg-manises-gold'
                            )}
                          />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.section>
                ))}
              </motion.div>

              <div className="mt-4 rounded-[1.35rem] border border-amber-200 bg-amber-50/90 px-4 py-4">
                <div className="flex items-start gap-3">
                  <BrightStar className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.16em] text-amber-800">Consejo útil</p>
                    <p className="mt-1 text-[13px] font-medium leading-relaxed text-amber-950">{content.tip}</p>
                  </div>
                </div>
              </div>

              {content.warning && (
                <div className="mt-3 rounded-[1.35rem] border border-rose-200 bg-rose-50/90 px-4 py-4">
                  <div className="flex items-start gap-3">
                    <WarningTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-700" />
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-rose-800">Condición importante</p>
                      <p className="mt-1 text-[13px] font-medium leading-relaxed text-rose-950">{content.warning}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
