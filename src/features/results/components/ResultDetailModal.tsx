import * as React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trophy, TrendingUp, Calendar, Search, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { NumberBall, NumberBallLabeled, StarNumberBall } from '@/shared/ui/NumberBall';
import { GameBadge } from '@/shared/ui/GameBadge';
import { LOTTERY_GAMES } from '@/shared/constants/games';
import { formatCurrency } from '@/shared/lib/utils';
import { getGameIdentity } from '@/shared/lib/game-identity';
import type { ResultDto, ScrutinyCategory } from '@/services/api/contracts/results.contracts';

function formatFullDate(iso: string): string {
  const d = new Date(iso);
  const str = d.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  return str.charAt(0).toUpperCase() + str.slice(1);
}

interface NationalCheckerResult {
  category: string;
  prize: number;
  isWinner: boolean;
}

const OliveBranchLeft = () => (
  <svg viewBox="0 0 24 50" className="w-6 h-12 fill-none stroke-blue-200/50 stroke-[1.5] shrink-0">
    <path d="M18 45C10 40 8 25 12 5M12 5C10 8 5 10 3 8M12 15C10 18 5 20 3 18M12 25C10 28 5 30 3 28M12 35C10 38 5 40 3 38M14 8C16 10 21 8 21 5M14 18C16 20 21 18 21 15M14 28C16 30 21 28 21 25M14 38C16 40 21 38 21 35" />
  </svg>
);

const OliveBranchRight = () => (
  <svg viewBox="0 0 24 50" className="w-6 h-12 fill-none stroke-blue-200/50 stroke-[1.5] shrink-0">
    <path d="M6 45C14 40 16 25 12 5M12 5C14 8 19 10 21 8M12 15C14 18 19 20 21 18M12 25C14 28 19 30 21 28M12 35C14 38 19 40 21 38M10 8C8 10 3 8 3 5M10 18C8 20 3 18 3 15M10 28C8 30 3 28 3 25M10 38C8 40 3 38 3 35" />
  </svg>
);

function checkNationalNumber(
  inputNumber: string,
  result: ResultDto,
): NationalCheckerResult {
  const first = result.firstPrizeNumber ?? '';
  const second = result.secondPrizeNumber ?? '';
  const decimoPrice = result.decimoPrice ?? 3;
  const last = inputNumber.slice(-1);
  const last2 = inputNumber.slice(-2);
  const last3 = inputNumber.slice(-3);
  const last4 = inputNumber.slice(-4);

  // Exact matches
  if (inputNumber === first) {
    return { category: '1er Premio', prize: 30000, isWinner: true };
  }
  if (inputNumber === second) {
    return { category: '2º Premio', prize: 6000, isWinner: true };
  }

  let totalPrize = 0;
  let wonCategories: string[] = [];

  // Check 4-digit extractions & first prize 4-digit termination
  const extractions4 = result.ultimas4cifras ?? ['1630', '2703', '3755', '7565'];
  const matches4 = extractions4.includes(last4) || (first && first.slice(-4) === last4);
  if (matches4) {
    totalPrize += 75;
    wonCategories.push('Últimas 4 cifras');
  }

  // Check 3-digit extractions & first/second prize 3-digit termination
  const extractions3 = result.ultimas3cifras ?? ['079', '081', '084', '292', '406', '690', '926'];
  const matches3 = extractions3.includes(last3) || (first && first.slice(-3) === last3) || (second && second.slice(-3) === last3);
  if (matches3 && !matches4) {
    totalPrize += 15;
    wonCategories.push('Últimas 3 cifras');
  }

  // Check 2-digit extractions & first/second prize 2-digit termination
  const extractions2 = result.ultimas2cifras ?? ['20', '48', '54', '66', '69', '77', '90', '94'];
  const matches2 = extractions2.includes(last2) || (first && first.slice(-2) === last2) || (second && second.slice(-2) === last2);
  if (matches2 && !matches3 && !matches4) {
    totalPrize += 6;
    wonCategories.push('Últimas 2 cifras');
  }

  // Check reintegro
  const reintegros = result.reintegros ?? [0, 2, 7];
  if (reintegros.includes(Number(last))) {
    totalPrize += decimoPrice;
    wonCategories.push('Reintegro');
  }

  if (totalPrize > 0) {
    return {
      category: wonCategories.join(' + '),
      prize: totalPrize,
      isWinner: true
    };
  }

  return { category: 'Sin premio', prize: 0, isWinner: false };
}

function parseCategory(category: string, gameType: string): { badge: string; label: string } {
  const trimmed = category.trim();
  
  // Check if it starts with a rank like "1ª", "2ª", etc.
  const matchRank = trimmed.match(/^(\d+ª)\s*(.*)$/);
  if (matchRank) {
    return {
      badge: matchRank[1],
      label: matchRank[2] || trimmed
    };
  }
  
  // For Bonoloto/Primitiva patterns like "6 aciertos", "5 aciertos + Complementario", etc.
  if (gameType === 'bonoloto' || gameType === 'primitiva') {
    if (trimmed.toLowerCase().includes('6 acierto') || trimmed.toLowerCase().startsWith('6')) {
      return { badge: '1ª', label: trimmed };
    }
    if (trimmed.toLowerCase().includes('+ comp') || trimmed.toLowerCase().includes('+ c')) {
      return { badge: '2ª', label: trimmed };
    }
    if (trimmed.toLowerCase().includes('5 acierto') || trimmed.toLowerCase().startsWith('5')) {
      return { badge: '3ª', label: trimmed };
    }
    if (trimmed.toLowerCase().includes('4 acierto') || trimmed.toLowerCase().startsWith('4')) {
      return { badge: '4ª', label: trimmed };
    }
    if (trimmed.toLowerCase().includes('3 acierto') || trimmed.toLowerCase().startsWith('3')) {
      return { badge: '5ª', label: trimmed };
    }
    if (trimmed.toLowerCase().startsWith('reintegro') || trimmed.toLowerCase() === 'r') {
      return { badge: 'R', label: trimmed };
    }
  }
  
  // Default fallback: check if it's reintegro
  if (trimmed.toLowerCase().startsWith('reintegro') || trimmed.toLowerCase() === 'r') {
    return { badge: 'R', label: trimmed };
  }
  
  return { badge: '•', label: trimmed };
}

function formatJackpotDisplay(amount: number, gameId: string): string {
  if (gameId === 'euromillones') {
    const millions = amount / 1_000_000;
    return `${millions.toLocaleString('es-ES')} MILLONES €`;
  }
  return `${amount.toLocaleString('es-ES')} €`;
}

function ScrutinyTable({ scrutiny, gameColor, gameType }: { scrutiny: ScrutinyCategory[]; gameColor: string; gameType: string }) {
  return (
    <div className="rounded-2xl border border-border overflow-hidden shadow-sm">
      <div className="grid grid-cols-3 text-[9px] font-black uppercase tracking-widest bg-gray-50 border-b border-border px-3.5 py-2.5" style={{ color: gameColor }}>
        <span>Categoría</span>
        <span className="text-center">Acertantes</span>
        <span className="text-right">Premio</span>
      </div>
      {scrutiny.map((row, i) => {
        const { badge, label } = parseCategory(row.category, gameType);
        return (
          <div
            key={i}
            className={`grid grid-cols-3 items-center px-3.5 py-2.5 text-[10.5px] ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'} border-b border-border/40 last:border-b-0`}
          >
            <div className="flex items-center gap-2 font-semibold text-manises-blue/80 pr-2 leading-tight">
              <span className="h-5 w-5 shrink-0 rounded-full flex items-center justify-center text-[9px] font-black text-white" style={{ backgroundColor: gameColor }}>
                {badge}
              </span>
              <span className="capitalize">{label}</span>
            </div>
            <span className="text-center font-bold text-muted-foreground">
              {row.winners > 0 ? row.winners.toLocaleString('es-ES') : <span className="text-gray-300">—</span>}
            </span>
            <span className="text-right font-black" style={{ color: row.winners > 0 ? gameColor : undefined }}>
              {row.prizePerWinner > 0 ? (
                <>
                  {formatCurrency(row.prizePerWinner)}
                  {row.isMonthly ? <span className="text-[8px] font-bold">/mes</span> : null}
                </>
              ) : (
                <span className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Bote</span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}

interface ResultDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: ResultDto | null;
}

export function ResultDetailModal({ isOpen, onClose, result }: ResultDetailModalProps) {
  const [checkerInput, setCheckerInput] = useState('');
  const [checkerResult, setCheckerResult] = useState<NationalCheckerResult | null>(null);

  const game = result ? LOTTERY_GAMES.find(g => g.id === result.gameId) : null;

  React.useEffect(() => {
    if (!isOpen) {
      setCheckerInput('');
      setCheckerResult(null);
    }
  }, [isOpen]);

  if (!result || !game) return null;

  const identity = getGameIdentity(game);
  const isNational = game.type === 'loteria-nacional' || game.type === 'navidad' || game.type === 'nino';
  const firstPrize = result.firstPrizeNumber ?? (Array.isArray(result.numbers) ? result.numbers.join('') : '');

  function handleCheck() {
    if (!result || checkerInput.length !== 5) return;
    setCheckerResult(checkNationalNumber(checkerInput, result));
  }

  function handleCheckerInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value.replace(/\D/g, '').slice(0, 5);
    setCheckerInput(v);
    if (checkerResult) setCheckerResult(null);
  }

  const year = new Date().getFullYear();

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
            className="fixed inset-x-0 top-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom,0px))] z-[55] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] flex flex-col max-w-lg mx-auto shadow-2xl border-x border-slate-100"
          >
            {/* Top Prize Banner */}
            <div className="w-full bg-[#0a4792] text-white py-2 px-5 flex items-center justify-between text-[10px] font-black uppercase tracking-wider cursor-pointer hover:bg-[#083c7a] transition-colors shrink-0 select-none">
              <div className="flex items-center gap-1.5">
                <span className="text-xs">🏆</span>
                <span>Premio vendido aquí en Manises</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
            </div>

            {/* Header with Back Chevron */}
            <div
              className="relative p-4 border-b border-gray-100 shrink-0"
              style={{ backgroundImage: `linear-gradient(135deg, ${game.color}10, ${game.color}05)` }}
            >
              <div className="pointer-events-none absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-40" style={{ backgroundColor: game.color }} />
              
              <div className="flex items-center gap-3 relative z-10">
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1 rounded-full text-slate-650 hover:bg-slate-100 transition-colors mr-1 cursor-pointer"
                  aria-label="Volver"
                >
                  <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                </button>
                <GameBadge game={game} size="sm" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-manises-blue text-[14px] uppercase tracking-tight leading-none mb-1">{identity.shortName}</h3>
                  <div className="flex items-center justify-between mt-1 text-[9.5px] text-muted-foreground font-semibold">
                    <span>{formatFullDate(result.date)}</span>
                    <span>{result.drawId || `Sorteo ${year}`}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">

              {/* ── Resultado principal ── */}
              <section>
                <SectionTitle icon={<Trophy className="w-3.5 h-3.5" style={{ color: game.color }} />} label="Resultado" color={game.color} />

                {!isNational ? (
                  <div
                    className="flex flex-wrap gap-2.5 p-4 rounded-2xl border justify-center shadow-inner-soft"
                    style={{ background: `${game.color}08`, borderColor: `${game.color}20` }}
                  >
                    {result.numbers.map((n, i) => (
                      <NumberBall key={i} number={n as number} variant="default" />
                    ))}
                    {result.stars?.map((s, i) => (
                      <StarNumberBall key={`s-${i}`} number={s} />
                    ))}
                    {result.complementario !== undefined && (
                      <>
                        <div className="w-px bg-border self-stretch mx-1" />
                        <NumberBallLabeled label="C" number={result.complementario} variant="complementario" />
                        {result.reintegro !== undefined && (
                          <NumberBallLabeled label="R" number={result.reintegro} variant="reintegro" />
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between border border-blue-100/40 rounded-2.5xl p-4 bg-blue-50/5 text-center relative overflow-hidden shadow-sm">
                    <OliveBranchLeft />
                    <div className="flex-1 flex flex-col items-center">
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">1er Premio</span>
                      <span className="text-3xl font-black text-manises-blue my-1.5 tracking-wider">{firstPrize || '—'}</span>
                      <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wide">30.000 € al décimo</span>
                    </div>
                    <div className="w-px h-14 bg-blue-100 self-stretch mx-2 shrink-0" />
                    <div className="flex-1 flex flex-col items-center">
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">2º Premio</span>
                      <span className="text-3xl font-black text-manises-blue my-1.5 tracking-wider">{result.secondPrizeNumber || '—'}</span>
                      <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wide">6.000 € al décimo</span>
                    </div>
                    <OliveBranchRight />
                  </div>
                )}
              </section>

              {/* ── Bote y próximo sorteo (Combinaciones) ── */}
              {!isNational && (
                <section className="grid grid-cols-2 gap-3.5">
                  {/* Tarjeta de Bote */}
                  <div className="rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.02] p-4 flex flex-col justify-between shadow-sm">
                    <div className="flex items-center gap-1.5 text-[9.5px] font-extrabold uppercase tracking-wider text-emerald-600">
                      <TrendingUp className="w-3.5 h-3.5" />
                      Bote Actual
                    </div>
                    <div className="mt-2.5">
                      <span className="text-xl font-black text-emerald-600 leading-none">
                        {formatJackpotDisplay(result.jackpotNext ?? 0, game.id)}
                      </span>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mt-1">para el próximo sorteo</p>
                    </div>
                  </div>

                  {/* Tarjeta de Próximo Sorteo */}
                  <div className="rounded-2xl border border-blue-500/10 bg-blue-500/[0.02] p-4 flex flex-col justify-between shadow-sm">
                    <div className="flex items-center gap-1.5 text-[9.5px] font-extrabold uppercase tracking-wider text-blue-600">
                      <Calendar className="w-3.5 h-3.5" />
                      Próximo sorteo
                    </div>
                    <div className="mt-2.5">
                      <span className="text-sm font-black text-manises-blue capitalize leading-none">
                        {result.nextDrawDate ? formatFullDate(result.nextDrawDate) : '—'}
                      </span>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mt-1">reserva tu apuesta</p>
                    </div>
                  </div>
                </section>
              )}

              {/* ── Escrutinio completo ── */}
              {!isNational && result.scrutiny && result.scrutiny.length > 0 && (
                <section>
                  <SectionTitle icon={<Trophy className="w-3.5 h-3.5" style={{ color: game.color }} />} label="Escrutinio del sorteo" color={game.color} />
                  <ScrutinyTable scrutiny={result.scrutiny} gameColor={game.color} gameType={game.type} />
                </section>
              )}

              {/* ── Comprobador y Listado de Premios (Lotería Nacional) ── */}
              {isNational && (
                <section className="flex flex-col gap-6">
                  {/* Comprobador Card */}
                  <div>
                    <SectionTitle icon={<Search className="w-3.5 h-3.5" style={{ color: game.color }} />} label="Comprueba tu número" color={game.color} />
                    <div className="rounded-2xl border border-border p-4 flex flex-col gap-3" style={{ background: `${game.color}04` }}>
                      <p className="text-[10.5px] text-muted-foreground font-semibold">
                        Introduce el número de tu décimo y comprueba si ha sido premiado.
                      </p>
                      <div className="flex gap-2.5">
                        <Input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={5}
                          placeholder="98342"
                          value={checkerInput}
                          onChange={handleCheckerInputChange}
                          className="text-center text-lg font-black tracking-[0.18em] flex-1 bg-white"
                        />
                        <Button
                          onClick={handleCheck}
                          disabled={checkerInput.length !== 5}
                          className="shrink-0 font-black text-xs px-5 bg-manises-blue text-white hover:bg-manises-blue/90"
                          style={checkerInput.length === 5 ? { backgroundColor: game.color, color: '#fff' } : undefined}
                        >
                          COMPROBAR
                        </Button>
                      </div>
                      <p className="text-[9.5px] text-muted-foreground font-bold text-center mt-1">
                        🔒 Tus datos están seguros. No almacenamos números.
                      </p>
                    </div>
                  </div>

                  {/* Listado de Premios */}
                  <div id="prize-list-section">
                    <SectionTitle icon={<Trophy className="w-3.5 h-3.5" style={{ color: game.color }} />} label="Listado de Premios" color={game.color} />
                    
                    <div className="rounded-2xl border border-border bg-white overflow-hidden p-4 flex flex-col gap-3.5 shadow-sm">
                      {/* 1º Premio Row */}
                      <div className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-3">
                          <span className="w-5.5 h-5.5 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-[10px] shadow-sm shadow-amber-500/20 shrink-0">1º</span>
                          <div>
                            <p className="font-black text-slate-800 text-[11px] uppercase tracking-wide">1º PREMIO</p>
                            <p className="text-[9.5px] font-bold text-slate-400 leading-none">30.000 € al décimo</p>
                          </div>
                        </div>
                        <span className="font-black text-base text-manises-blue tracking-[0.12em] shrink-0">{firstPrize}</span>
                      </div>

                      <div className="h-[1px] bg-slate-100" />

                      {/* 2º Premio Row */}
                      <div className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-3">
                          <span className="w-5.5 h-5.5 rounded-full bg-slate-400 text-white flex items-center justify-center font-bold text-[10px] shadow-sm shadow-slate-400/25 shrink-0">2º</span>
                          <div>
                            <p className="font-black text-slate-800 text-[11px] uppercase tracking-wide">2º PREMIO</p>
                            <p className="text-[9.5px] font-bold text-slate-400 leading-none">6.000 € al décimo</p>
                          </div>
                        </div>
                        <span className="font-black text-base text-manises-blue tracking-[0.12em] shrink-0">{result.secondPrizeNumber || '—'}</span>
                      </div>

                      <div className="h-[1px] bg-slate-100" />

                      {/* Últimas 4 Cifras Row */}
                      {result.ultimas4cifras && (
                        <>
                          <div className="flex items-center justify-between py-1">
                            <div className="flex items-center gap-3">
                              <span className="w-5.5 h-5.5 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-[10px] shadow-sm shadow-blue-500/20 shrink-0">4</span>
                              <div>
                                <p className="font-black text-slate-800 text-[11px] uppercase tracking-wide">ÚLTIMAS 4 CIFRAS</p>
                                <p className="text-[9.5px] font-bold text-slate-400 leading-none">75 € al décimo</p>
                              </div>
                            </div>
                            <span className="font-black text-[12px] text-manises-blue tracking-[0.12em] shrink-0">
                              {result.ultimas4cifras.join('  ')}
                            </span>
                          </div>
                          <div className="h-[1px] bg-slate-100" />
                        </>
                      )}

                      {/* Últimas 3 Cifras Row */}
                      {result.ultimas3cifras && (
                        <>
                          <div className="flex items-start justify-between py-1">
                            <div className="flex items-center gap-3">
                              <span className="w-5.5 h-5.5 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[10px] shadow-sm shadow-emerald-500/20 shrink-0">3</span>
                              <div>
                                <p className="font-black text-slate-800 text-[11px] uppercase tracking-wide">ÚLTIMAS 3 CIFRAS</p>
                                <p className="text-[9.5px] font-bold text-slate-400 leading-none">15 € al décimo</p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end leading-normal text-[12px] font-black text-manises-blue tracking-[0.12em] text-right">
                              <div>{result.ultimas3cifras.slice(0, 4).join('  ')}</div>
                              {result.ultimas3cifras.length > 4 && (
                                <div>{result.ultimas3cifras.slice(4).join('  ')}</div>
                              )}
                            </div>
                          </div>
                          <div className="h-[1px] bg-slate-100" />
                        </>
                      )}

                      {/* Últimas 2 Cifras Row */}
                      {result.ultimas2cifras && (
                        <>
                          <div className="flex items-start justify-between py-1">
                            <div className="flex items-center gap-3">
                              <span className="w-5.5 h-5.5 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-[10px] shadow-sm shadow-orange-500/20 shrink-0">2</span>
                              <div>
                                <p className="font-black text-slate-800 text-[11px] uppercase tracking-wide">ÚLTIMAS 2 CIFRAS</p>
                                <p className="text-[9.5px] font-bold text-slate-400 leading-none">6 € al décimo</p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end leading-normal text-[12px] font-black text-manises-blue tracking-[0.12em] text-right">
                              <div>{result.ultimas2cifras.slice(0, 4).join('  ')}</div>
                              {result.ultimas2cifras.length > 4 && (
                                <div>{result.ultimas2cifras.slice(4).join('  ')}</div>
                              )}
                            </div>
                          </div>
                          <div className="h-[1px] bg-slate-100" />
                        </>
                      )}

                      {/* Reintegros Row */}
                      {result.reintegros && (
                        <div className="flex items-center justify-between py-1">
                          <div className="flex items-center gap-3">
                            <span className="w-5.5 h-5.5 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold text-[10px] shadow-sm shadow-purple-500/20 shrink-0">R</span>
                            <div>
                              <p className="font-black text-slate-800 text-[11px] uppercase tracking-wide">REINTEGROS</p>
                              <p className="text-[9.5px] font-bold text-slate-400 leading-none">3 € al décimo</p>
                            </div>
                          </div>
                          <div className="text-[12px] font-black text-manises-blue tracking-[0.18em] text-right shrink-0">
                            {result.reintegros.join('  ')}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 text-center text-[9px] text-muted-foreground italic shrink-0">
              Datos orientativos. Escrutinio oficial en loteriamanises.com
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comprobador Result Popup Modal (Overlay z-150) */}
      <AnimatePresence>
        {checkerResult && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCheckerResult(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-[22rem] bg-white rounded-[2rem] p-6 shadow-2xl z-10 border border-gray-100 flex flex-col items-center text-center font-sans"
            >
              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCheckerResult(null)}
                className="absolute top-4 right-4 rounded-full text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </Button>

              {/* Icon */}
              <div className="mt-4 mb-4">
                {checkerResult.isWinner ? (
                  <div className="w-16 h-16 rounded-full bg-manises-blue flex items-center justify-center shadow-lg">
                    <Trophy className="w-8 h-8 text-manises-gold" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                    <Trophy className="w-8 h-8 text-gray-300" />
                  </div>
                )}
              </div>

              {/* Title & Subtitle */}
              <h4 className={`text-[15px] font-black tracking-wider uppercase ${checkerResult.isWinner ? 'text-manises-blue' : 'text-gray-500'}`}>
                {checkerResult.isWinner ? '¡ENHORABUENA!' : 'LO SENTIMOS'}
              </h4>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mt-1">
                {checkerResult.isWinner ? 'Tu número ha sido premiado' : 'Tu número no ha sido premiado'}
              </p>

              {/* Number Box */}
              <div className="w-full bg-gray-50 border border-gray-150 rounded-2xl py-3.5 my-4">
                <span className="text-3xl font-black text-manises-blue tracking-[0.16em]">
                  {checkerInput}
                </span>
              </div>

              {/* Prize or Message */}
              {checkerResult.isWinner ? (
                <div className="flex flex-col items-center">
                  <p className="text-2xl font-black text-emerald-600 leading-none">
                    {checkerResult.prize} €
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">al décimo</p>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-slate-500 font-bold text-[11px] mt-1 mb-2">
                  <span className="text-base leading-none">😕</span>
                  <span>Esta vez no hubo suerte</span>
                </div>
              )}

              {/* Info Note (only for winner) */}
              {checkerResult.isWinner && (
                <div className="mt-4 flex gap-1.5 items-start text-left bg-emerald-50/50 border border-emerald-100/50 rounded-xl p-3 text-[10px] text-emerald-700 leading-normal">
                  <span className="text-xs shrink-0 mt-0.5">ℹ️</span>
                  <div>
                    <span className="font-bold text-emerald-800 block">¿Cómo cobro el premio?</span>
                    <span>Los premios inferiores a 2.000€ pueden cobrarse en cualquier administración de Lotería.</span>
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex flex-col gap-2 w-full mt-6">
                <Button
                  onClick={() => {
                    setCheckerResult(null);
                    // Scroll to prize list
                    document.getElementById('prize-list-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  variant="outline"
                  className="w-full text-[10px] font-bold h-10 border-gray-250 text-slate-650 hover:bg-gray-50 bg-white tracking-wider cursor-pointer"
                >
                  VER LISTADO DE PREMIOS
                </Button>
                <Button
                  onClick={() => {
                    setCheckerResult(null);
                    setCheckerInput('');
                  }}
                  className="w-full text-[10px] font-black h-10 bg-manises-blue text-white hover:bg-manises-blue/90 tracking-wider cursor-pointer"
                >
                  COMPROBAR OTRO NÚMERO
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

function SectionTitle({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) {
  return (
    <div className="flex items-center gap-2 mb-3 select-none">
      {icon}
      <h4 className="text-[10px] font-black uppercase tracking-widest" style={{ color }}>
        {label}
      </h4>
    </div>
  );
}
