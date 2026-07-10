import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronRight, Check, Info, Sparkles, Ticket, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { ProfileSubHeader } from '../components/ProfileSubHeader';
import { PurchaseBottomBar } from '@/features/play/components/PurchaseBottomBar';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useSubscriptions } from '@/features/profile/hooks/useSubscriptions';
import { getReservationAmount } from '@/features/profile/data/subscriptionsDemo';
import { cn, formatCurrency, formatDate } from '@/shared/lib/utils';

function isThisWeek(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const day = now.getDay() || 7;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - day + 1);
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  return date >= weekStart && date <= weekEnd;
}

function getReservationLimit(iso: string) {
  const limit = new Date(iso);
  limit.setDate(limit.getDate() - 1);
  return limit;
}

function ReservationCheckbox({ checked }: { checked: boolean }) {
  return (
    <span className={cn(
      'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border-2 transition-all',
      checked ? 'border-manises-blue bg-manises-blue text-white shadow-sm' : 'border-slate-200 bg-white text-transparent'
    )}>
      <Check className="h-4 w-4" />
    </span>
  );
}

export function SubscriptionsPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const { numbers, groupedReservations, reservations, markReservationsAsPaid } = useSubscriptions();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  const tab = searchParams.get('tab') === 'numbers' ? 'numbers' : 'pending';
  const selectedLines = reservations.filter((line) => selectedIds.includes(line.id));
  const selectedTotal = selectedLines.reduce((sum, line) => sum + getReservationAmount(line), 0);
  const selectedNumbersCount = new Set(selectedLines.map((line) => line.number)).size;
  const selectedDrawsCount = new Set(selectedLines.map((line) => line.drawDate)).size;
  const selectedDecimos = selectedLines.reduce((sum, line) => sum + line.quantity, 0);
  const upcomingGroups = groupedReservations.filter((group) => group.lines.length > 0);
  const activeNumbers = numbers.filter((item) => item.status === 'active');
  const alertText = useMemo(() => {
    const nextGroup = upcomingGroups[0];
    if (!nextGroup) {
      return null;
    }

    const limit = getReservationLimit(nextGroup.drawDate);
    return `El sorteo ${nextGroup.drawLabel} dejará de estar reservado el ${formatDate(limit.toISOString())}.`;
  }, [upcomingGroups]);

  const setTab = (nextTab: 'pending' | 'numbers') => {
    const nextParams = new URLSearchParams(searchParams);
    if (nextTab === 'numbers') {
      nextParams.set('tab', 'numbers');
    } else {
      nextParams.delete('tab');
    }
    setSearchParams(nextParams, { replace: true });
  };

  const setSelection = (ids: string[]) => {
    setSelectedIds(Array.from(new Set(ids)));
  };

  const selectAll = () => setSelection(reservations.map((line) => line.id));
  const selectThisWeek = () => setSelection(reservations.filter((line) => isThisWeek(line.drawDate)).map((line) => line.id));
  const selectNextDraw = () => {
    const nextDraw = reservations[0]?.drawDate;
    if (!nextDraw) {
      return;
    }
    setSelection(reservations.filter((line) => line.drawDate === nextDraw).map((line) => line.id));
  };

  const toggleLine = (id: string) => {
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const paySelected = () => {
    if (selectedIds.length === 0) {
      return;
    }

    markReservationsAsPaid(selectedIds);
    toast.success(`Has dejado preparados ${selectedIds.length} sorteos reservados como pagados en demo.`);
    setSelectedIds([]);
  };

  return (
    <div className="flex min-h-full flex-col bg-background">
      <ProfileSubHeader title="Mis abonos de Lotería" subtitle="Reservas preferentes" backTo="/profile" />

      <div className={cn('flex flex-col gap-4 p-4', selectedIds.length > 0 && tab === 'pending' && 'pb-20')}>
        <section className="overflow-hidden rounded-2xl border border-manises-blue/10 bg-manises-blue/5">
          <button
            type="button"
            onClick={() => setShowHowItWorks((current) => !current)}
            className="flex w-full items-center justify-between gap-3 px-4 py-3"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-manises-blue/10">
                <Info className="h-3.5 w-3.5 text-manises-blue" />
              </div>
              <span className="text-[11px] font-bold text-manises-blue/70 uppercase tracking-wider">Sin cobro automático</span>
            </div>
            <span className="text-[11px] font-bold text-manises-blue/50">
              {showHowItWorks ? 'Ocultar' : '¿Cómo funciona?'}
            </span>
          </button>

          {showHowItWorks && (
            <div className="border-t border-manises-blue/8 px-4 py-3 space-y-1.5">
              {[
                'Tu abono reserva un número para futuros sorteos, pero no genera cobros automáticos.',
                'Puedes pagar varios sorteos en una sola operación desde esta pantalla.',
                'Si das de baja un abono, perderás la reserva y sus sorteos pendientes desaparecerán.',
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-manises-blue/30" />
                  <p className="text-[11px] font-medium leading-relaxed text-slate-500">{text}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="grid grid-cols-2 gap-1 rounded-xl border border-slate-100 bg-slate-50 p-1">
          {[
            { id: 'pending', label: `Pendientes (${reservations.length})` },
            { id: 'numbers', label: `Mis números (${numbers.length})` },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id as 'pending' | 'numbers')}
              className={cn(
                'rounded-lg py-2 text-[10px] font-black uppercase tracking-wider transition-all',
                tab === item.id ? 'bg-white text-manises-blue shadow-sm' : 'text-slate-400'
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        {tab === 'pending' ? (
          <>
            <div className="flex gap-2 overflow-x-auto pb-0.5">
              <button onClick={selectAll} className="shrink-0 rounded-xl border border-manises-blue/10 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-wider text-manises-blue">
                Todos
              </button>
              <button onClick={selectThisWeek} className="shrink-0 rounded-xl border border-manises-blue/10 bg-amber-50 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-amber-700">
                Esta semana
              </button>
              <button onClick={selectNextDraw} className="shrink-0 rounded-xl border border-manises-blue/10 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-wider text-manises-blue">
                Próximo sorteo
              </button>
              {selectedIds.length > 0 && (
                <button onClick={() => setSelectedIds([])} className="shrink-0 rounded-xl border border-slate-100 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Deseleccionar
                </button>
              )}
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3">
              <div className="flex items-start gap-2">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-manises-blue/70" />
                <p className="text-[11px] font-semibold leading-relaxed text-slate-500">
                  Selecciona los sorteos que quieres pagar. Puedes mezclar varios números y varios sorteos en una sola operación.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {upcomingGroups.map((group) => {
                const isHighlighted = isThisWeek(group.drawDate);
                const totalGroupDecimos = group.lines.reduce((sum, line) => sum + line.quantity, 0);
                return (
                  <section key={group.id} className="overflow-hidden rounded-[1.6rem] border border-slate-100 bg-white shadow-sm">
                    <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-[10px] font-black uppercase tracking-wider text-amber-700">
                          {group.drawType}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-manises-blue">{group.drawLabel}</p>
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                            {formatDate(group.drawDate)}
                          </p>
                        </div>
                      </div>

                      {isHighlighted && (
                        <span className="rounded-full bg-amber-50 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-amber-700">
                          Esta semana
                        </span>
                      )}
                    </div>

                    <div className="divide-y divide-slate-100">
                      {group.lines.map((line) => {
                        const checked = selectedIds.includes(line.id);
                        return (
                          <button
                            key={line.id}
                            type="button"
                            onClick={() => toggleLine(line.id)}
                            className={cn(
                              'flex w-full items-center gap-3 px-4 py-3 text-left transition-all active:scale-[0.99]',
                              checked && 'bg-manises-blue/[0.03]'
                            )}
                          >
                            <ReservationCheckbox checked={checked} />
                            <div className="min-w-0 flex-1">
                              <p className="font-mono text-[24px] font-black tracking-[0.1em] text-manises-blue leading-none">{line.number}</p>
                              <p className="text-[11px] font-semibold text-slate-400">
                                {line.quantity} {line.quantity === 1 ? 'décimo' : 'décimos'}
                              </p>
                            </div>
                            <div className="shrink-0 text-right">
                              <p className="text-lg font-black text-manises-blue">{formatCurrency(getReservationAmount(line))}</p>
                              <ChevronRight className="ml-auto mt-1 h-4 w-4 text-slate-300" />
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between gap-2 bg-slate-50 px-4 py-2">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Total sorteo · {group.lines.length} líneas · {totalGroupDecimos} décimos
                      </p>
                      <p className="text-lg font-black text-manises-blue">{formatCurrency(group.total)}</p>
                    </div>
                  </section>
                );
              })}

              {upcomingGroups.length === 0 && (
                <div className="rounded-[1.6rem] border border-dashed border-slate-200 bg-white p-8 text-center">
                  <Ticket className="mx-auto h-8 w-8 text-manises-blue/20" />
                  <p className="mt-3 text-sm font-black text-manises-blue">No hay sorteos pendientes</p>
                  <p className="mt-1 text-[11px] font-semibold text-slate-400">Cuando publiquemos nuevas reservas aparecerán aquí para pago manual.</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <section className="rounded-[1.45rem] border border-slate-100 bg-white p-3.5 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-manises-blue text-white">
                  <Sparkles className="h-4.5 w-4.5" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-black text-manises-blue">Tienes {numbers.length} números abonados</p>
                  <p className="mt-1 text-[10px] font-semibold leading-relaxed text-slate-500">
                    Desde aquí puedes revisar todos tus números reservados, ajustar décimos futuros o dar de baja un abono.
                  </p>
                </div>
              </div>
            </section>

            {/* CTA: subscribe to a new number */}
            <button
              type="button"
              onClick={() => navigate('/profile/subscriptions/setup')}
              className="flex w-full items-center justify-between gap-3 rounded-2xl border-2 border-dashed border-manises-blue/20 bg-manises-blue/[0.03] px-4 py-4 text-left transition-colors active:bg-manises-blue/[0.06]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-manises-blue/10">
                  <Plus className="h-4 w-4 text-manises-blue" />
                </div>
                <div>
                  <p className="text-[12px] font-black text-manises-blue">Suscribirme a un número</p>
                  <p className="text-[10px] font-medium text-slate-400 mt-0.5">Reserva un número para futuros sorteos</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-manises-blue/30" />
            </button>

            {numbers.map((item) => {
              const nextReservation = reservations
                .filter((reservation) => reservation.subscriptionId === item.id)
                .sort((a, b) => a.drawDate.localeCompare(b.drawDate))[0];

              return (
                <section key={item.id} className="rounded-[1.45rem] border border-slate-100 bg-white p-3.5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-mono text-[24px] font-black tracking-[0.1em] text-manises-blue leading-none">{item.number}</h3>
                        <span className={cn(
                          'rounded-full px-2 py-1 text-[8px] font-black uppercase tracking-wider',
                          item.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        )}>
                          {item.status === 'active' ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>

                      <p className="mt-1 text-[10px] font-semibold text-slate-500">
                        {item.quantity} {item.quantity === 1 ? 'décimo por sorteo' : 'décimos por sorteo'}
                      </p>

                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {item.drawTypes.map((drawType) => (
                          <span key={drawType} className="rounded-full bg-slate-100 px-2 py-1 text-[8px] font-black uppercase tracking-wider text-manises-blue/70">
                            {drawType}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate(`/profile/subscriptions/${item.id}`)}
                      className="shrink-0 rounded-xl border border-manises-blue/10 bg-white px-3 py-2 text-[9px] font-black uppercase tracking-wider text-manises-blue"
                    >
                      Gestionar
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-2">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Próximo sorteo reservado</p>
                      <p className="mt-0.5 text-[10px] font-semibold text-manises-blue">
                        {nextReservation ? `${nextReservation.drawLabel} · ${formatDate(nextReservation.drawDate)}` : 'Sin reservas futuras'}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                  </div>
                </section>
              );
            })}

            {alertText && (
              <button
                type="button"
                onClick={() => setTab('pending')}
                className="flex w-full items-start gap-3 rounded-[1.4rem] border border-amber-100 bg-amber-50 px-4 py-3 text-left"
              >
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                <div>
                  <p className="text-[11px] font-black text-amber-700">Tienes sorteos pendientes de pago</p>
                  <p className="mt-1 text-[10px] font-semibold leading-relaxed text-amber-700/80">{alertText}</p>
                </div>
              </button>
            )}

            {activeNumbers.length === 0 && (
              <div className="rounded-[1.6rem] border border-dashed border-slate-200 bg-white p-8 text-center">
                <p className="text-sm font-black text-manises-blue">No tienes abonos activos</p>
                <p className="mt-1 text-[11px] font-semibold text-slate-400">Si vuelves a reservar un número, aparecerá aquí junto a su gestión.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedIds.length > 0 && tab === 'pending' && (
        <PurchaseBottomBar
          availableBalance={profile?.balance ?? 0}
          totalPrice={selectedTotal}
          canContinue={selectedIds.length > 0}
          ctaLabel="Pagar seleccionados"
          onContinue={paySelected}
          activeColor="#f7b500"
          summaryText={`${selectedLines.length} líneas · ${selectedNumbersCount} números · ${selectedDrawsCount} sorteos · ${selectedDecimos} décimos`}
          className="bottom-[calc(var(--nav-height)+0.75rem)] z-[70] pb-0"
        />
      )}
    </div>
  );
}
