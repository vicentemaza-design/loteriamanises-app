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
import type { ResultDto, ScrutinyCategory } from '@/services/api/contracts/results.contracts';

// Full game name map (same as ResultsPage cards)
const MODAL_FULL_NAMES: Record<string, string> = {
  'euromillones':            'Euromillones',
  'primitiva':               'La Primitiva',
  'bonoloto':                'Bonoloto',
  'gordo':                   'El Gordo de la Primitiva',
  'eurodreams':              'EuroDreams',
  'quiniela':                'La Quiniela',
  'quinigol':                'Quinigol',
  'loteria-nacional-jueves': 'Lotería Jueves',
  'loteria-nacional-sabado': 'Lotería Sábado',
  'loteria-navidad':         'Lotería de Navidad',
  'loteria-nino':            'Lotería del Niño',
};

function getModalFullName(gameId: string, gameName: string): string {
  return MODAL_FULL_NAMES[gameId] ?? gameName;
}

function cap(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }

function formatFullDate(iso: string): string {
  const d = new Date(iso);
  const str = d.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return cap(str);
}

/** Returns two intentional lines for the "Próximo sorteo" card. */
function formatNextDraw(iso: string): { top: string; bottom: string } {
  const d = new Date(iso);
  const weekday = d.toLocaleDateString('es-ES', { weekday: 'long' });
  const day = d.getDate();
  const month = d.toLocaleDateString('es-ES', { month: 'long' });
  const year = d.getFullYear();
  return {
    top: `${cap(weekday)}, ${day}`,
    bottom: `de ${month} de ${year}`,
  };
}

const NATIONAL_PRIZE_AMOUNTS: Record<string, { first: number; second: number }> = {
  'loteria-nacional': { first: 30_000,   second: 6_000 },
  'navidad':          { first: 400_000,  second: 125_000 },
  'nino':             { first: 200_000,  second: 75_000 },
};

interface NationalCheckerResult {
  category: string;
  prize: number;
  isWinner: boolean;
}

function checkNationalNumber(
  inputNumber: string,
  result: ResultDto,
): NationalCheckerResult {
  const first = result.firstPrizeNumber ?? '';
  const second = result.secondPrizeNumber ?? '';
  const decimoPrice = result.decimoPrice ?? 3;
  const prizes = NATIONAL_PRIZE_AMOUNTS[result.gameType] ?? NATIONAL_PRIZE_AMOUNTS['loteria-nacional'];
  const last = inputNumber.slice(-1);
  const last2 = inputNumber.slice(-2);
  const last3 = inputNumber.slice(-3);
  const last4 = inputNumber.slice(-4);

  if (inputNumber === first) return { category: '1er Premio', prize: prizes.first, isWinner: true };
  if (inputNumber === second) return { category: '2º Premio', prize: prizes.second, isWinner: true };

  let totalPrize = 0;
  const wonCategories: string[] = [];

  const extractions4 = result.ultimas4cifras ?? ['1630', '2703', '3755', '7565'];
  const matches4 = extractions4.includes(last4) || (first && first.slice(-4) === last4);
  if (matches4) { totalPrize += 75; wonCategories.push('Últimas 4 cifras'); }

  const extractions3 = result.ultimas3cifras ?? ['079', '081', '084', '292', '406', '690', '926'];
  const matches3 = extractions3.includes(last3) || (first && first.slice(-3) === last3) || (second && second.slice(-3) === last3);
  if (matches3 && !matches4) { totalPrize += 15; wonCategories.push('Últimas 3 cifras'); }

  const extractions2 = result.ultimas2cifras ?? ['20', '48', '54', '66', '69', '77', '90', '94'];
  const matches2 = extractions2.includes(last2) || (first && first.slice(-2) === last2) || (second && second.slice(-2) === last2);
  if (matches2 && !matches3 && !matches4) { totalPrize += 6; wonCategories.push('Últimas 2 cifras'); }

  const reintegros = result.reintegros ?? [0, 2, 7];
  if (reintegros.includes(Number(last))) { totalPrize += decimoPrice; wonCategories.push('Reintegro'); }

  if (totalPrize > 0) return { category: wonCategories.join(' + '), prize: totalPrize, isWinner: true };
  return { category: 'Sin premio', prize: 0, isWinner: false };
}

function parseCategory(category: string, gameType: string): { badge: string; label: string } {
  const trimmed = category.trim();
  const matchRank = trimmed.match(/^(\d+ª)\s*(.*)$/);
  if (matchRank) return { badge: matchRank[1], label: matchRank[2] || trimmed };

  if (gameType === 'joker') {
    if (trimmed.toLowerCase().includes('joker') || trimmed.includes('7 cifras'))
      return { badge: 'J', label: trimmed };
    const mDigits = trimmed.match(/^(\d+)\s+p/i);
    if (mDigits) return { badge: mDigits[1], label: trimmed };
    return { badge: 'J', label: trimmed };
  }

  if (gameType === 'bonoloto' || gameType === 'primitiva') {
    if (trimmed.toLowerCase().includes('6 acierto') || trimmed.toLowerCase().startsWith('6'))
      return { badge: '1ª', label: trimmed };
    if (trimmed.toLowerCase().includes('+ comp') || trimmed.toLowerCase().includes('+ c'))
      return { badge: '2ª', label: trimmed };
    if (trimmed.toLowerCase().includes('5 acierto') || trimmed.toLowerCase().startsWith('5'))
      return { badge: '3ª', label: trimmed };
    if (trimmed.toLowerCase().includes('4 acierto') || trimmed.toLowerCase().startsWith('4'))
      return { badge: '4ª', label: trimmed };
    if (trimmed.toLowerCase().includes('3 acierto') || trimmed.toLowerCase().startsWith('3'))
      return { badge: '5ª', label: trimmed };
    if (trimmed.toLowerCase().startsWith('reintegro') || trimmed.toLowerCase() === 'r')
      return { badge: 'R', label: trimmed };
  }
  if (trimmed.toLowerCase().startsWith('reintegro') || trimmed.toLowerCase() === 'r')
    return { badge: 'R', label: trimmed };
  return { badge: '•', label: trimmed };
}

function formatJackpotDisplay(amount: number): { value: string; unit: string } {
  if (amount >= 1_000_000) {
    const m = amount / 1_000_000;
    const formatted = Number.isInteger(m)
      ? m.toLocaleString('es-ES')
      : m.toLocaleString('es-ES', { maximumFractionDigits: 1 });
    return { value: formatted, unit: 'MILLONES €' };
  }
  if (amount >= 1_000) {
    return { value: amount.toLocaleString('es-ES'), unit: '€' };
  }
  return { value: amount.toLocaleString('es-ES'), unit: '€' };
}

// ── Scrutiny table ────────────────────────────────────────────────────────────
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

// ── Section title ─────────────────────────────────────────────────────────────
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

// ── Main modal ────────────────────────────────────────────────────────────────
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
    if (!isOpen) { setCheckerInput(''); setCheckerResult(null); }
  }, [isOpen]);

  if (!result || !game) return null;

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
            {/* Top Prize Banner — padding-top absorbs the safe-area so content sits below status bar */}
            <div
              className="w-full bg-[#0a4792] text-white px-5 pb-2 flex items-center justify-between text-[10px] font-black uppercase tracking-wider cursor-pointer hover:bg-[#083c7a] transition-colors shrink-0 select-none"
              style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 0.5rem)' }}
            >
              <div className="flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-manises-gold shrink-0" />
                <span>Premio vendido aquí en Manises</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
            </div>

            {/* Header */}
            <div
              className="relative px-4 py-3.5 border-b border-gray-100 shrink-0"
              style={{ backgroundImage: `linear-gradient(135deg, ${game.color}10, ${game.color}05)` }}
            >
              <div className="pointer-events-none absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-40" style={{ backgroundColor: game.color }} />

              <div className="flex items-center gap-3 relative z-10">
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1 rounded-full text-slate-650 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
                  aria-label="Volver"
                >
                  <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                </button>
                <GameBadge game={game} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-black text-manises-blue text-[14px] uppercase tracking-tight leading-none truncate">
                      {getModalFullName(game.id, game.name)}
                    </h3>
                    {result.drawId && (
                      <span className="shrink-0 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                        {result.drawId}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[9.5px] text-muted-foreground font-semibold leading-none">
                    {formatFullDate(result.date)}
                  </p>
                </div>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">

              {/* ── RESULTADO ── */}
              <section>
                <SectionTitle
                  icon={<Trophy className="w-3.5 h-3.5" style={{ color: game.color }} />}
                  label="Resultado"
                  color={game.color}
                />

                {isNational ? (
                  /* National: clean 2-column prize grid */
                  <div
                    className="grid grid-cols-2 divide-x overflow-hidden rounded-2xl border"
                    style={{ borderColor: `${game.color}30`, '--tw-divide-opacity': 1 } as React.CSSProperties}
                  >
                    {/* 1er Premio */}
                    <div
                      className="p-5 text-center"
                      style={{ background: `${game.color}08` }}
                    >
                      <p className="text-[8.5px] font-black uppercase tracking-widest mb-2" style={{ color: game.color }}>
                        1er Premio
                      </p>
                      <p className="text-[32px] font-black text-manises-blue tracking-wider leading-none">
                        {firstPrize || '—'}
                      </p>
                      <p className="text-[8px] font-semibold text-slate-400 uppercase tracking-wider mt-2">
                        {formatCurrency((NATIONAL_PRIZE_AMOUNTS[result.gameType] ?? NATIONAL_PRIZE_AMOUNTS['loteria-nacional']).first)} al décimo
                      </p>
                    </div>
                    {/* 2º Premio */}
                    <div
                      className="p-5 text-center"
                      style={{ background: `${game.color}04` }}
                    >
                      <p className="text-[8.5px] font-black uppercase tracking-widest mb-2" style={{ color: game.color }}>
                        2º Premio
                      </p>
                      <p className="text-[32px] font-black text-manises-blue tracking-wider leading-none">
                        {result.secondPrizeNumber || '—'}
                      </p>
                      <p className="text-[8px] font-semibold text-slate-400 uppercase tracking-wider mt-2">
                        {formatCurrency((NATIONAL_PRIZE_AMOUNTS[result.gameType] ?? NATIONAL_PRIZE_AMOUNTS['loteria-nacional']).second)} al décimo
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Non-national: balls row + C/R row */
                  <div className="flex flex-col gap-3 p-4 rounded-2xl border" style={{ background: `${game.color}06`, borderColor: `${game.color}20` }}>
                    {/* Main balls */}
                    <div className="flex flex-wrap gap-2 justify-center">
                      {result.numbers.map((n, i) => (
                        <NumberBall key={i} number={n as number} variant="default" />
                      ))}
                    </div>
                    {/* Stars — separate row */}
                    {result.stars && result.stars.length > 0 && (
                      <div className="flex gap-2 justify-center border-t pt-3" style={{ borderColor: `${game.color}20` }}>
                        {result.stars.map((s, i) => (
                          <StarNumberBall key={`s-${i}`} number={s} />
                        ))}
                      </div>
                    )}
                    {/* El Millón (Euromillones only) */}
                    {result.gameType === 'euromillones' && result.elMillon && (
                      <div className="flex items-center justify-center gap-2.5 border-t pt-3" style={{ borderColor: `${game.color}20` }}>
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white">
                          <span className="text-[8px] font-black leading-none">M</span>
                        </div>
                        <p className="text-[8px] font-black uppercase tracking-widest text-amber-500">El Millón</p>
                        <p className="font-mono text-[15px] font-black text-amber-700 leading-none tracking-wider uppercase">{result.elMillon}</p>
                      </div>
                    )}
                    {/* Complementario + Reintegro on separate row */}
                    {(result.complementario !== undefined || result.reintegro !== undefined) && (
                      <div className="flex justify-center gap-5 border-t pt-3" style={{ borderColor: `${game.color}20` }}>
                        {result.complementario !== undefined && (
                          <NumberBallLabeled label="C" number={result.complementario} variant="complementario" />
                        )}
                        {result.reintegro !== undefined && (
                          <NumberBallLabeled label="R" number={result.reintegro} variant="reintegro" />
                        )}
                      </div>
                    )}
                    {/* Joker (Primitiva only) */}
                    {result.gameType === 'primitiva' && result.joker && (
                      <div className="flex items-center justify-center gap-2.5 border-t pt-3" style={{ borderColor: `${game.color}20` }}>
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-500 text-white">
                          <span className="text-[8px] font-black leading-none">J</span>
                        </div>
                        <p className="text-[8px] font-black uppercase tracking-widest text-purple-400">Joker</p>
                        <p className="text-[18px] font-black text-purple-700 leading-none tracking-wider tabular-nums">{result.joker}</p>
                      </div>
                    )}
                  </div>
                )}
              </section>

              {/* ── Bote + Próximo sorteo (non-national) ── */}
              {!isNational && (
                <section className="grid grid-cols-2 gap-3.5">
                  <div className="rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.02] p-4 flex flex-col justify-between shadow-sm">
                    <div className="flex items-center gap-1.5 text-[9.5px] font-extrabold uppercase tracking-wider text-emerald-600">
                      <TrendingUp className="w-3.5 h-3.5" />
                      Bote Actual
                    </div>
                    <div className="mt-2.5">
                      {(() => {
                        const { value, unit } = formatJackpotDisplay(result.jackpotNext ?? 0);
                        return (
                          <>
                            <p className="text-[26px] font-black text-emerald-600 leading-none tabular-nums">{value}</p>
                            <p className="text-[11px] font-black text-emerald-600 leading-none mt-0.5 uppercase tracking-wide">{unit}</p>
                          </>
                        );
                      })()}
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mt-2">para el próximo sorteo</p>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-blue-500/10 bg-blue-500/[0.02] p-4 flex flex-col justify-between shadow-sm">
                    <div className="flex items-center gap-1.5 text-[9.5px] font-extrabold uppercase tracking-wider text-blue-600">
                      <Calendar className="w-3.5 h-3.5" />
                      Próximo sorteo
                    </div>
                    <div className="mt-2.5">
                      {result.nextDrawDate ? (() => {
                        const { top, bottom } = formatNextDraw(result.nextDrawDate);
                        return (
                          <>
                            <p className="text-[15px] font-black text-manises-blue leading-tight">{top}</p>
                            <p className="text-[11px] font-bold text-manises-blue/60 leading-tight">{bottom}</p>
                          </>
                        );
                      })() : <span className="text-sm font-black text-manises-blue">—</span>}
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mt-2">reserva tu apuesta</p>
                    </div>
                  </div>
                </section>
              )}

              {/* ── Escrutinio (non-national) ── */}
              {!isNational && result.scrutiny && result.scrutiny.length > 0 && (
                <section>
                  <SectionTitle
                    icon={<Trophy className="w-3.5 h-3.5" style={{ color: game.color }} />}
                    label="Escrutinio del sorteo"
                    color={game.color}
                  />
                  <ScrutinyTable scrutiny={result.scrutiny} gameColor={game.color} gameType={game.type} />
                </section>
              )}

              {/* ── Escrutinio Joker (Primitiva only) ── */}
              {result.gameType === 'primitiva' && result.jokerScrutiny && result.jokerScrutiny.length > 0 && (
                <section>
                  <SectionTitle
                    icon={
                      <div className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-purple-500 text-white shrink-0">
                        <span className="text-[7px] font-black leading-none">J</span>
                      </div>
                    }
                    label="Escrutinio Joker"
                    color="#7c3aed"
                  />
                  <ScrutinyTable scrutiny={result.jokerScrutiny} gameColor="#7c3aed" gameType="joker" />
                </section>
              )}

              {/* ── Escrutinio El Millón (Euromillones only) ── */}
              {result.gameType === 'euromillones' && result.elMillonScrutiny && result.elMillonScrutiny.length > 0 && (
                <section>
                  <SectionTitle
                    icon={
                      <div className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-500 text-white shrink-0">
                        <span className="text-[7px] font-black leading-none">M</span>
                      </div>
                    }
                    label="El Millón"
                    color="#f59e0b"
                  />
                  <ScrutinyTable scrutiny={result.elMillonScrutiny} gameColor="#f59e0b" gameType="euromillones" />
                </section>
              )}

              {/* ── Comprobador + Listado de premios (national) ── */}
              {isNational && (
                <section className="flex flex-col gap-6">
                  {/* Comprobador */}
                  <div>
                    <SectionTitle
                      icon={<Search className="w-3.5 h-3.5" style={{ color: game.color }} />}
                      label="Comprueba tu número"
                      color={game.color}
                    />
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
                          Comprobar
                        </Button>
                      </div>
                      <p className="text-[9.5px] text-muted-foreground font-bold text-center mt-1">
                        🔒 Tus datos están seguros. No almacenamos números.
                      </p>
                    </div>
                  </div>

                  {/* Listado de premios */}
                  <div id="prize-list-section">
                    <SectionTitle
                      icon={<Trophy className="w-3.5 h-3.5" style={{ color: game.color }} />}
                      label="Listado de Premios"
                      color={game.color}
                    />
                    <div className="rounded-2xl border border-border bg-white overflow-hidden shadow-sm">
                      {/* 1º Premio */}
                      <PrizeRow
                        badge="1º"
                        badgeColor="#f59e0b"
                        label="1er Premio"
                        sublabel="30.000 € al décimo"
                        value={firstPrize}
                      />

                      {/* 2º Premio */}
                      <PrizeRow
                        badge="2º"
                        badgeColor="#94a3b8"
                        label="2º Premio"
                        sublabel="6.000 € al décimo"
                        value={result.secondPrizeNumber || '—'}
                      />

                      {/* Últimas 4 cifras */}
                      {result.ultimas4cifras && (
                        <PrizeRow
                          badge="4"
                          badgeColor="#3b82f6"
                          label="Últimas 4 cifras"
                          sublabel="75 € al décimo"
                          value={result.ultimas4cifras.join('  ')}
                          multiline={result.ultimas4cifras.length > 2}
                        />
                      )}

                      {/* Últimas 3 cifras */}
                      {result.ultimas3cifras && (
                        <PrizeRow
                          badge="3"
                          badgeColor="#10b981"
                          label="Últimas 3 cifras"
                          sublabel="15 € al décimo"
                          value={result.ultimas3cifras.join('  ')}
                          multiline
                        />
                      )}

                      {/* Últimas 2 cifras */}
                      {result.ultimas2cifras && (
                        <PrizeRow
                          badge="2"
                          badgeColor="#f97316"
                          label="Últimas 2 cifras"
                          sublabel="6 € al décimo"
                          value={result.ultimas2cifras.join('  ')}
                          multiline
                        />
                      )}

                      {/* Reintegros */}
                      {result.reintegros && (
                        <PrizeRow
                          badge="R"
                          badgeColor="#a855f7"
                          label="Reintegros"
                          sublabel="3 € al décimo"
                          value={result.reintegros.join('  ')}
                          isLast
                        />
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

      {/* Checker result popup */}
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
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCheckerResult(null)}
                className="absolute top-4 right-4 rounded-full text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </Button>

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

              <h4 className={`text-[15px] font-black tracking-wider uppercase ${checkerResult.isWinner ? 'text-manises-blue' : 'text-gray-500'}`}>
                {checkerResult.isWinner ? '¡Enhorabuena!' : 'Lo sentimos'}
              </h4>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mt-1">
                {checkerResult.isWinner ? 'Tu número ha sido premiado' : 'Tu número no ha sido premiado'}
              </p>

              <div className="w-full bg-gray-50 border border-gray-150 rounded-2xl py-3.5 my-4">
                <span className="text-3xl font-black text-manises-blue tracking-[0.16em]">
                  {checkerInput}
                </span>
              </div>

              {checkerResult.isWinner ? (
                <div className="flex flex-col items-center">
                  <p className="text-2xl font-black text-emerald-600 leading-none">{checkerResult.prize} €</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">al décimo</p>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-slate-500 font-bold text-[11px] mt-1 mb-2">
                  <span className="text-base leading-none">😕</span>
                  <span>Esta vez no hubo suerte</span>
                </div>
              )}

              {checkerResult.isWinner && (
                <div className="mt-4 flex gap-1.5 items-start text-left bg-emerald-50/50 border border-emerald-100/50 rounded-xl p-3 text-[10px] text-emerald-700 leading-normal">
                  <span className="text-xs shrink-0 mt-0.5">ℹ️</span>
                  <div>
                    <span className="font-bold text-emerald-800 block">¿Cómo cobro el premio?</span>
                    <span>Los premios inferiores a 2.000€ pueden cobrarse en cualquier administración de Lotería.</span>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2 w-full mt-6">
                <Button
                  onClick={() => {
                    setCheckerResult(null);
                    document.getElementById('prize-list-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  variant="outline"
                  className="w-full text-[10px] font-bold h-10 border-gray-250 text-slate-650 hover:bg-gray-50 bg-white tracking-wider cursor-pointer"
                >
                  Ver listado de premios
                </Button>
                <Button
                  onClick={() => { setCheckerResult(null); setCheckerInput(''); }}
                  className="w-full text-[10px] font-black h-10 bg-manises-blue text-white hover:bg-manises-blue/90 tracking-wider cursor-pointer"
                >
                  Comprobar otro número
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

// ── Prize row helper ──────────────────────────────────────────────────────────
function PrizeRow({
  badge, badgeColor, label, sublabel, value, multiline = false, isLast = false,
}: {
  badge: string;
  badgeColor: string;
  label: string;
  sublabel: string;
  value: string;
  multiline?: boolean;
  isLast?: boolean;
}) {
  return (
    <>
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <span
            className="h-6 w-6 shrink-0 rounded-full flex items-center justify-center font-black text-[9.5px] text-white shadow-sm"
            style={{ backgroundColor: badgeColor }}
          >
            {badge}
          </span>
          <div>
            <p className="font-black text-slate-800 text-[11px] uppercase tracking-wide leading-none">{label}</p>
            <p className="text-[9.5px] font-bold text-slate-400 leading-none mt-0.5">{sublabel}</p>
          </div>
        </div>
        {multiline ? (
          <div className="flex flex-col items-end text-[11.5px] font-black text-manises-blue tracking-[0.1em] leading-snug text-right max-w-[45%]">
            {value.split('  ').reduce<string[][]>((acc, v, i) => {
              const row = Math.floor(i / 4);
              if (!acc[row]) acc[row] = [];
              acc[row].push(v);
              return acc;
            }, []).map((chunk, i) => (
              <span key={i}>{chunk.join('  ')}</span>
            ))}
          </div>
        ) : (
          <span className="font-black text-[15px] text-manises-blue tracking-[0.1em] shrink-0">{value}</span>
        )}
      </div>
      {!isLast && <div className="h-px bg-slate-100 mx-4" />}
    </>
  );
}
