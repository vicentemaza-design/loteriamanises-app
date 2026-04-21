import type { IApiProvider } from '../../providers/api.provider';
import { getLatestResultsMock, getResultByIdMock } from './results.mock';
import { getUserTicketsMock, getTicketByIdMock } from './tickets.mock';
import { placeBetMock } from './play.mock';
import { getBalanceMock, getMovementsMock, topUpMock } from './wallet.mock';

/**
 * MockAdapter
 * Aggregates all mock domain adapters into a single IApiProvider implementation.
 */
export class MockAdapter implements IApiProvider {
  auth = {
    signInWithGoogle: async () => { console.log('Mock SignIn'); },
    logout: async () => { console.log('Mock Logout'); },
    getCurrentUser: async () => null,
  };

  results = {
    getLatest: getLatestResultsMock,
    getById: getResultByIdMock,
  };

  tickets = {
    getUserTickets: getUserTicketsMock,
    getTicketById: getTicketByIdMock,
  };

  play = {
    placeBet: placeBetMock,
    calculatePrice: async () => 0, // Out of scope for this sprint's logic recalculation
  };

  wallet = {
    getBalance: getBalanceMock,
    getMovements: getMovementsMock,
    topUp: topUpMock,
  };
}
