import type { IApiProvider } from '../../providers/api.provider';
import { getLatestResultsMock, getResultByIdMock } from './results.mock';
import { getUserTicketsMock, getTicketByIdMock } from './tickets.mock';
import { placeBetMock, submitPlaySessionMock } from './play.mock';
import { getBalanceMock, getMovementsMock, topUpMock } from './wallet.mock';
import { subscriptionsMock } from './subscriptions.mock';

/**
 * MockAdapter
 * Aggregates all mock domain adapters into a single IApiProvider implementation.
 */
export class MockAdapter implements IApiProvider {
  auth = {
    signInWithGoogle: async () => {},
    logout: async () => {},
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
    submitPlaySession: submitPlaySessionMock,
    calculatePrice: async () => 0,
  };

  wallet = {
    getBalance: getBalanceMock,
    getMovements: getMovementsMock,
    topUp: topUpMock,
  };

  subscriptions = subscriptionsMock;
}
