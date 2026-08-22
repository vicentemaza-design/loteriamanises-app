import type { IApiProvider } from '../../providers/api.provider';
import {
  loginWithEmailMock,
  registerMock,
  requestPasswordResetMock,
  resendVerificationEmailMock,
  changePendingEmailMock,
  verifyEmailMock,
  resetPasswordMock,
} from './auth.mock';
import { getLatestResultsMock, getResultByIdMock } from './results.mock';
import { getUserTicketsMock, getTicketByIdMock } from './tickets.mock';
import { placeBetMock, submitPlaySessionMock } from './play.mock';
import { getBalanceMock, getMovementsMock, topUpMock } from './wallet.mock';
import { listBankAccountsMock, addBankAccountMock, verifyBankAccountOwnershipMock } from './bank-accounts.mock';
import { createWithdrawalMock } from './withdrawals.mock';
import { subscriptionsMock } from './subscriptions.mock';
import { requestProfileChangeVerificationMock, confirmProfileChangeVerificationMock } from './profile.mock';

/**
 * MockAdapter
 * Aggregates all mock domain adapters into a single IApiProvider implementation.
 */
export class MockAdapter implements IApiProvider {
  auth = {
    signInWithGoogle: async () => {},
    logout: async () => {},
    getCurrentUser: async () => null,
    loginWithEmail: loginWithEmailMock,
    requestPasswordReset: requestPasswordResetMock,
    register: registerMock,
    resendVerificationEmail: resendVerificationEmailMock,
    changePendingEmail: changePendingEmailMock,
    verifyEmail: verifyEmailMock,
    resetPassword: resetPasswordMock,
  };

  profile = {
    requestProfileChangeVerification: requestProfileChangeVerificationMock,
    confirmProfileChangeVerification: confirmProfileChangeVerificationMock,
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
    bankAccounts: {
      list: listBankAccountsMock,
      add: addBankAccountMock,
      verifyOwnership: verifyBankAccountOwnershipMock,
    },
    createWithdrawal: createWithdrawalMock,
  };

  subscriptions = subscriptionsMock;
}
