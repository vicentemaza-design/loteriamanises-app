import type { ReductionSystemDefinition } from '../../lib/play-matrix';

export interface ReducedSystemUI extends ReductionSystemDefinition {
  isCompatible: boolean;
  betsCount: number;
  totalPrice: number;
}

export interface ReducedModeState {
  selectedSystemId: string | null;
  compatibleSystems: ReducedSystemUI[];
}
