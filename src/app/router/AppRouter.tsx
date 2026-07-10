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
import { TicketDetailPage } from '@/features/tickets/pages/TicketDetailPage';
import { ProfilePage } from '@/features/profile/pages/ProfilePage';

import { AccountPage } from '@/features/profile/pages/AccountPage';
import { AccountDeleteConfirmPage } from '@/features/profile/pages/AccountDeleteConfirmPage';
import { AccountDeleteInfoPage } from '@/features/profile/pages/AccountDeleteInfoPage';
import { PaymentsPage } from '@/features/profile/pages/PaymentsPage';
import { WalletPage } from '@/features/profile/pages/WalletPage';
import { SettingsPage } from '@/features/profile/pages/SettingsPage';
import { FavoritesPage } from '@/features/profile/pages/FavoritesPage';
import { FavoriteDetailPage } from '@/features/profile/pages/FavoriteDetailPage';
import { SubscriptionsPage } from '@/features/profile/pages/SubscriptionsPage';
import { SubscriptionManagePage } from '@/features/profile/pages/SubscriptionManagePage';
import { SubscriptionEditPage } from '@/features/profile/pages/SubscriptionEditPage';
import { SubscriptionCancelPage } from '@/features/profile/pages/SubscriptionCancelPage';
import { SubscriptionCancelledPage } from '@/features/profile/pages/SubscriptionCancelledPage';
import { AbonoSetupPage } from '@/features/profile/pages/AbonoSetupPage';
import { GameSubscriptionsPage } from '@/features/profile/pages/GameSubscriptionsPage';
import { GameSubscriptionDetailPage } from '@/features/profile/pages/GameSubscriptionDetailPage';
import { MovementsPage } from '@/features/profile/pages/MovementsPage';
import { WithdrawalsPage } from '@/features/profile/pages/WithdrawalsPage';
import { HelpPage } from '@/features/profile/pages/HelpPage';
import { KycPage } from '@/features/profile/pages/KycPage';
import { ResponsibleGamingPage } from '@/features/profile/pages/ResponsibleGamingPage';
import { ResponsibleGamingResourcePage } from '@/features/profile/pages/ResponsibleGamingResourcePage';
import { CompaniesPage } from '@/features/profile/pages/CompaniesPage';
import { BiometricsPage } from '@/features/profile/pages/BiometricsPage';
import { AboutUsPage } from '@/features/profile/pages/AboutUsPage';
import { PrizeTaxPage } from '@/features/profile/pages/PrizeTaxPage';
import { TechnicalMatrixPage } from '@/features/admin/pages/TechnicalMatrixPage';
import { DeliveredPrizesPage } from '@/features/catalog/pages/DeliveredPrizesPage';
import { CompanyLandingPage } from '@/features/company/pages/CompanyLandingPage';
import { CondicionesPage } from '@/features/legal/pages/CondicionesPage';
import { PrivacidadPage } from '@/features/legal/pages/PrivacidadPage';
import { AvisoLegalPage } from '@/features/legal/pages/AvisoLegalPage';
import { CondicionesAbonosPage } from '@/features/legal/pages/CondicionesAbonosPage';

export function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        {/* Usamos el Login como página de aterrizaje (index) para renderizado inmediato */}
        <Route index element={<LoginPage />} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<PrivateLayout />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/premios-entregados" element={<DeliveredPrizesPage />} />
        <Route path="/empresas" element={<CompanyLandingPage />} />
        <Route path="/colectivos" element={<CompanyLandingPage />} />
        <Route path="/company/:code" element={<CompanyLandingPage />} />
        <Route path="/games" element={<GamesPage />} />
        <Route path="/play/:gameId" element={<GamePlayPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/legal/condiciones" element={<CondicionesPage />} />
        <Route path="/legal/condiciones-abonos" element={<CondicionesAbonosPage />} />
        <Route path="/legal/privacidad" element={<PrivacidadPage />} />
        <Route path="/legal/aviso" element={<AvisoLegalPage />} />

        <Route element={<RequireAuth />}>
          <Route path="/tickets" element={<TicketsPage />} />
          <Route path="/tickets/:ticketId" element={<TicketDetailPage />} />
          
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/account" element={<AccountPage />} />
          <Route path="/profile/account/delete" element={<AccountDeleteInfoPage />} />
          <Route path="/profile/account/delete/confirm" element={<AccountDeleteConfirmPage />} />
          <Route path="/profile/payments" element={<PaymentsPage />} />
          <Route path="/profile/wallet" element={<WalletPage />} />
          <Route path="/profile/favorites" element={<FavoritesPage />} />
          <Route path="/profile/favorites/:favoriteId" element={<FavoriteDetailPage />} />
          <Route path="/profile/subscriptions" element={<SubscriptionsPage />} />
          <Route path="/profile/subscriptions/setup" element={<AbonoSetupPage />} />
          <Route path="/profile/subscriptions/:subscriptionId" element={<SubscriptionManagePage />} />
          <Route path="/profile/subscriptions/:subscriptionId/edit" element={<SubscriptionEditPage />} />
          <Route path="/profile/subscriptions/:subscriptionId/cancel" element={<SubscriptionCancelPage />} />
          <Route path="/profile/subscriptions/:subscriptionId/cancelled" element={<SubscriptionCancelledPage />} />
          <Route path="/profile/game-subscriptions" element={<GameSubscriptionsPage />} />
          <Route path="/profile/game-subscriptions/:subscriptionId" element={<GameSubscriptionDetailPage />} />
          <Route path="/profile/movements" element={<MovementsPage />} />
          <Route path="/profile/withdrawals" element={<WithdrawalsPage />} />
          <Route path="/profile/help" element={<HelpPage />} />
          <Route path="/profile/prizes-and-tax" element={<PrizeTaxPage />} />
          <Route path="/profile/kyc" element={<KycPage />} />
          <Route path="/profile/gaming-control" element={<ResponsibleGamingPage />} />
          <Route path="/profile/gaming-control/:sectionId" element={<ResponsibleGamingResourcePage />} />
          <Route path="/profile/companies" element={<CompaniesPage />} />
          <Route path="/profile/biometrics" element={<BiometricsPage />} />
          <Route path="/profile/about" element={<AboutUsPage />} />
          <Route path="/profile/delivered-prizes" element={<DeliveredPrizesPage />} />
          <Route path="/profile/settings" element={<SettingsPage />} />
          <Route path="/profile/matrix" element={<TechnicalMatrixPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
