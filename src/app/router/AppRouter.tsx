import { Navigate, Route, Routes } from 'react-router-dom';
import { PublicLayout } from '@/app/layouts/PublicLayout';
import { PrivateLayout } from '@/app/layouts/PrivateLayout';
import { RequireAuth } from '@/app/guards/RequireAuth';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { HomePage } from '@/features/catalog/pages/HomePage';
import { GamesPage } from '@/features/catalog/pages/GamesPage';
import { GamePlayPage } from '@/features/play/pages/GamePlayPage';
import { ResultsPage } from '@/features/results/pages/ResultsPage';
import { TicketsPage } from '@/features/tickets/pages/TicketsPage';
import { ProfilePage } from '@/features/profile/pages/ProfilePage';

import { AccountPage } from '@/features/profile/pages/AccountPage';
import { PaymentsPage } from '@/features/profile/pages/PaymentsPage';
import { WalletPage } from '@/features/profile/pages/WalletPage';
import { SettingsPage } from '@/features/profile/pages/SettingsPage';
import { FavoritesPage } from '@/features/profile/pages/FavoritesPage';
import { SubscriptionsPage } from '@/features/profile/pages/SubscriptionsPage';
import { MovementsPage } from '@/features/profile/pages/MovementsPage';
import { WithdrawalsPage } from '@/features/profile/pages/WithdrawalsPage';
import { HelpSupportPage } from '@/features/profile/pages/HelpSupportPage';
import { CompaniesPage } from '@/features/profile/pages/CompaniesPage';
import { TechnicalMatrixPage } from '@/features/admin/pages/TechnicalMatrixPage';

export function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        {/* Usamos el Login como página de aterrizaje (index) para renderizado inmediato */}
        <Route index element={<LoginPage />} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route element={<PrivateLayout />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/games" element={<GamesPage />} />
          <Route path="/play/:gameId" element={<GamePlayPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/tickets" element={<TicketsPage />} />
          
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/account" element={<AccountPage />} />
          <Route path="/profile/payments" element={<PaymentsPage />} />
          <Route path="/profile/wallet" element={<WalletPage />} />
          <Route path="/profile/favorites" element={<FavoritesPage />} />
          <Route path="/profile/subscriptions" element={<SubscriptionsPage />} />
          <Route path="/profile/movements" element={<MovementsPage />} />
          <Route path="/profile/withdrawals" element={<WithdrawalsPage />} />
          <Route path="/profile/help" element={<HelpSupportPage />} />
          <Route path="/profile/companies" element={<CompaniesPage />} />
          <Route path="/profile/settings" element={<SettingsPage />} />
          <Route path="/profile/matrix" element={<TechnicalMatrixPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
