import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trophy, CheckCircle2 } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { NumberBall } from '@/shared/ui/NumberBall';
import { GameBadge } from '@/shared/ui/GameBadge';
import { LOTTERY_GAMES } from '@/shared/constants/games';
import { formatCurrency, formatDate } from '@/shared/lib/utils';
import type { Ticket, LotteryGame } from '@/shared/types/domain';

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: {
    numbers: number[];
    stars?: number[];
    date: string;
    gameId: string;
    firstPrizeNumber?: string;
    secondPrizeNumber?: string;
    reintegros?: number[];
    decimoPrice?: number;
  };
  userTickets: Ticket[];
}

function evaluateNationalTicket(
  ticketDigits: string,
  result: ComparisonModalProps['result']
): { label: string; prize: number; isWinner: boolean } {
  const first = result.firstPrizeNumber ?? (Array.isArray(result.numbers) ? result.numbers.join('') : '');
  const second = result.secondPrizeNumber ?? '';
  const decimoPrice = result.decimoPrice ?? 6;
  const last = ticketDigits.slice(-1);

  if (ticketDigits === first) return { label: '1º Premio', prize: 30_000, isWinner: true };
  if (ticketDigits === second) return { label: '2º Premio', prize: 12_000, isWinner: true };
  if (first && ticketDigits.slice(-3) === first.slice(-3)) return { label: 'Terminación 3 cifras', prize: 100, isWinner: true };
  if (first && ticketDigits.slice(-2) === first.slice(-2)) return { label: 'Terminación 2 cifras', prize: 20, isWinner: true };
  if (result.reintegros?.includes(Number(last))) return { label: 'Reintegro', prize: decimoPrice, isWinner: true };
  return { label: 'Sin premio', prize: 0, isWinner: false };
}

/**
 * Modal de comparación visual (Check & Compare).
 * Cumple con la petición de MILOTO de poder comparar mi boleto con el resultado en una misma pantalla.
 */
export function ComparisonModal({ isOpen, onClose, result, userTickets }: ComparisonModalProps) {
  const game = LOTTERY_GAMES.find(g => g.id === result.gameId);
  if (!game) return null;
  const isNationalLottery = game.type === 'loteria-nacional' || game.type === 'navidad' || game.type === 'nino';
  const firstPrizeNumber = result.firstPrizeNumber ?? (Array.isArray(result.numbers) ? result.numbers.join('') : '');
  const hasDetailedNationalResult = Boolean(firstPrizeNumber || result.secondPrizeNumber || result.reintegros?.length);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="relative w-full max-w-lg bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] rounded-t-[2rem] sm:rounded-[2rem] shadow-[0_30px_60px_rgba(10,25,47,0.30)] overflow-hidden max-h-[90vh] flex flex-col border border-white/80"
          >
            {/* Header */}
            <div className="relative flex items-center justify-between p-6 border-b border-gray-100 bg-[linear-gradient(135deg,rgba(10,25,47,0.06)_0%,rgba(227,182,87,0.10)_100%)]">
              <div className="pointer-events-none absolute -top-16 -right-16 w-40 h-40 rounded-full bg-manises-gold/15 blur-3xl" />
              <div className="flex items-center gap-3">
                <GameBadge game={game} size="sm" />
                <div>
                  <h3 className="font-black text-manises-blue">Resumen de escrutinio</h3>
                  <p className="text-[10px] text-muted-foreground font-medium">Lectura disponible del sorteo {formatDate(result.date)}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="overflow-y-auto p-6 flex flex-col gap-8">
              {/* Combinación Ganadora */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="w-4 h-4 text-manises-gold" />
                  <h4 className="text-xs font-black uppercase tracking-widest text-manises-blue">Resultado disponible</h4>
                </div>
                {!isNationalLottery ? (
                  <div className="flex flex-wrap gap-2.5 p-4 bg-[linear-gradient(135deg,rgba(10,25,47,0.06)_0%,rgba(227,182,87,0.10)_100%)] rounded-2xl border border-manises-blue/10 justify-center">
                    {result.numbers.map((n, i) => (
                      <NumberBall key={i} number={n} variant="default" />
                    ))}
                    {result.stars?.map((s, i) => (
                      <NumberBall key={`s-${i}`} number={s} variant="gold" />
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-[linear-gradient(135deg,rgba(10,25,47,0.08)_0%,rgba(227,182,87,0.12)_100%)] rounded-2xl border border-manises-blue/12 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">1º Premio</span>
                      <span className="font-black text-xl text-manises-blue tracking-[0.08em]">{firstPrizeNumber || 'Pendiente'}</span>
                    </div>
                    {result.secondPrizeNumber && (
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">2º Premio</span>
                        <span className="font-black text-base text-manises-blue tracking-[0.08em]">{result.secondPrizeNumber}</span>
                      </div>
                    )}
                    {result.reintegros?.length ? (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Reintegros</span>
                        {result.reintegros.map((digit) => (
                          <span key={digit} className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-white border border-manises-blue/15 px-2 text-[10px] font-black text-manises-blue">
                            {digit}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    {!hasDetailedNationalResult && (
                      <p className="text-[11px] font-medium text-muted-foreground">
                        Escrutinio simplificado en demo. El desglose oficial detallado llegará con la integración real.
                      </p>
                    )}
                  </div>
                )}
              </section>

              {/* Mis Boletos */}
              <section className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-widest text-manises-blue">Mis jugadas ({userTickets.length})</h4>
                </div>
                
                {userTickets.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <p className="text-sm text-muted-foreground font-medium">No jugaste este sorteo.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {userTickets.map((ticket) => (
                      <div key={ticket.id} className="p-4 rounded-2xl border border-border bg-card surface-neo-soft shadow-[0_10px_22px_rgba(10,25,47,0.08)]">
                        <div className="flex items-center justify-between mb-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                          <span>Boleto #{ticket.id.slice(-6)}</span>
                          {ticket.status === 'won' && (
                            <span className="text-emerald-600 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Premiado
                            </span>
                          )}
                        </div>
                        {!isNationalLottery ? (
                          <>
                            <div className="flex flex-wrap gap-2 justify-center">
                              {ticket.numbers.map((n, i) => {
                                const isMatch = result.numbers.includes(n);
                                return (
                                  <NumberBall 
                                    key={i} 
                                    number={n} 
                                    size="sm"
                                    className={isMatch ? "ring-2 ring-emerald-500 ring-offset-2 scale-110 shadow-lg" : "opacity-40 grayscale-[0.5]"}
                                  />
                                );
                              })}
                              {ticket.stars?.map((s, i) => {
                                const isMatch = result.stars?.includes(s);
                                return (
                                  <NumberBall 
                                    key={`s-${i}`} 
                                    number={s} 
                                    variant="gold" 
                                    size="sm"
                                    className={isMatch ? "ring-2 ring-emerald-500 ring-offset-2 scale-110 shadow-lg" : "opacity-40 grayscale"}
                                  />
                                );
                              })}
                            </div>
                            {ticket.prize && (
                              <div className="mt-4 pt-3 border-t border-border flex justify-between items-center">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase">Premio obtenido</span>
                                <span className="text-sm font-black text-emerald-600">{formatCurrency(ticket.prize)}</span>
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            {(() => {
                              const ticketNumber = ticket.numbers.join('');
                              const national = evaluateNationalTicket(ticketNumber, result);
                              return (
                                <div className="rounded-xl border border-manises-blue/15 bg-[linear-gradient(135deg,rgba(10,25,47,0.04)_0%,rgba(227,182,87,0.10)_100%)] p-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Décimo</span>
                                    <span className="font-black text-lg text-manises-blue tracking-[0.08em]">{ticketNumber}</span>
                                  </div>
                                  <div className="mt-3 flex items-center justify-between">
                                    <span className={`text-[10px] font-black uppercase tracking-wider ${national.isWinner ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                                      {national.label}
                                    </span>
                                    <span className={`text-sm font-black ${national.isWinner ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                                      {national.isWinner ? formatCurrency(national.prize) : '0,00 €'}
                                    </span>
                                  </div>
                                </div>
                              );
                            })()}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* Sticky footer */}
            <div className="p-6 bg-[linear-gradient(180deg,rgba(10,25,47,0.03)_0%,rgba(10,25,47,0.06)_100%)] backdrop-blur-sm border-t border-gray-100 italic text-[10px] text-center text-muted-foreground">
              Resumen frontend disponible. El escrutinio completo por categorías sigue pendiente de integración.
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
