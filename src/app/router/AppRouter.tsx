import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { PublicLayout } from '@/app/layouts/PublicLayout';
import { PrivateLayout } from '@/app/layouts/PrivateLayout';
import { LegalLayout } from '@/app/layouts/LegalLayout';
import { RequireAuth } from '@/app/guards/RequireAuth';
import { Skeleton } from '@/shared/ui/Skeleton';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { RecoverPasswordPage } from '@/features/auth/pages/RecoverPasswordPage';
import { EmailSentPage } from '@/features/auth/pages/EmailSentPage';
import { VerifyEmailPage } from '@/features/auth/pages/VerifyEmailPage';
import { VerifyEmailLinkPage } from '@/features/auth/pages/VerifyEmailLinkPage';
import { ResetPasswordPage } from '@/features/auth/pages/ResetPasswordPage';
import { HomePage } from '@/features/catalog/pages/HomePage';
import { NotFoundPage } from '@/shared/ui/NotFoundPage';

// ─── Rutas no críticas para el primer render (Login/Register/Recover/Reset/
// VerifyEmail/Home y los layouts base se mantienen eager arriba) ────────────
const GamesPage = lazy(() => import('@/features/catalog/pages/GamesPage').then(m => ({ default: m.GamesPage })));
const GamePlayPage = lazy(() => import('@/features/play/pages/GamePlayPage').then(m => ({ default: m.GamePlayPage })));
const ResultsPage = lazy(() => import('@/features/results/pages/ResultsPage').then(m => ({ default: m.ResultsPage })));
const TicketsPage = lazy(() => import('@/features/tickets/pages/TicketsPage').then(m => ({ default: m.TicketsPage })));
const TicketDetailPage = lazy(() => import('@/features/tickets/pages/TicketDetailPage').then(m => ({ default: m.TicketDetailPage })));
const ProfilePage = lazy(() => import('@/features/profile/pages/ProfilePage').then(m => ({ default: m.ProfilePage })));

const AccountPage = lazy(() => import('@/features/profile/pages/AccountPage').then(m => ({ default: m.AccountPage })));
const AccountDeleteConfirmPage = lazy(() => import('@/features/profile/pages/AccountDeleteConfirmPage').then(m => ({ default: m.AccountDeleteConfirmPage })));
const AccountDeleteInfoPage = lazy(() => import('@/features/profile/pages/AccountDeleteInfoPage').then(m => ({ default: m.AccountDeleteInfoPage })));
const PaymentsPage = lazy(() => import('@/features/profile/pages/PaymentsPage').then(m => ({ default: m.PaymentsPage })));
const WalletPage = lazy(() => import('@/features/profile/pages/WalletPage').then(m => ({ default: m.WalletPage })));
const SettingsPage = lazy(() => import('@/features/profile/pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const FavoritesPage = lazy(() => import('@/features/profile/pages/FavoritesPage').then(m => ({ default: m.FavoritesPage })));
const FavoriteDetailPage = lazy(() => import('@/features/profile/pages/FavoriteDetailPage').then(m => ({ default: m.FavoriteDetailPage })));
const SubscriptionsPage = lazy(() => import('@/features/profile/pages/SubscriptionsPage').then(m => ({ default: m.SubscriptionsPage })));
const SubscriptionManagePage = lazy(() => import('@/features/profile/pages/SubscriptionManagePage').then(m => ({ default: m.SubscriptionManagePage })));
const SubscriptionEditPage = lazy(() => import('@/features/profile/pages/SubscriptionEditPage').then(m => ({ default: m.SubscriptionEditPage })));
const SubscriptionCancelPage = lazy(() => import('@/features/profile/pages/SubscriptionCancelPage').then(m => ({ default: m.SubscriptionCancelPage })));
const SubscriptionCancelledPage = lazy(() => import('@/features/profile/pages/SubscriptionCancelledPage').then(m => ({ default: m.SubscriptionCancelledPage })));
const AbonoSetupPage = lazy(() => import('@/features/profile/pages/AbonoSetupPage').then(m => ({ default: m.AbonoSetupPage })));
const GameSubscriptionsPage = lazy(() => import('@/features/profile/pages/GameSubscriptionsPage').then(m => ({ default: m.GameSubscriptionsPage })));
const GameSubscriptionDetailPage = lazy(() => import('@/features/profile/pages/GameSubscriptionDetailPage').then(m => ({ default: m.GameSubscriptionDetailPage })));
const MovementsPage = lazy(() => import('@/features/profile/pages/MovementsPage').then(m => ({ default: m.MovementsPage })));
const WithdrawalsPage = lazy(() => import('@/features/profile/pages/WithdrawalsPage').then(m => ({ default: m.WithdrawalsPage })));
const BankAccountsPage = lazy(() => import('@/features/profile/pages/BankAccountsPage').then(m => ({ default: m.BankAccountsPage })));
const HelpPage = lazy(() => import('@/features/profile/pages/HelpPage').then(m => ({ default: m.HelpPage })));
const KycPage = lazy(() => import('@/features/profile/pages/KycPage').then(m => ({ default: m.KycPage })));
const ResponsibleGamingPage = lazy(() => import('@/features/profile/pages/ResponsibleGamingPage').then(m => ({ default: m.ResponsibleGamingPage })));
const ResponsibleGamingResourcePage = lazy(() => import('@/features/profile/pages/ResponsibleGamingResourcePage').then(m => ({ default: m.ResponsibleGamingResourcePage })));
const CompaniesPage = lazy(() => import('@/features/profile/pages/CompaniesPage').then(m => ({ default: m.CompaniesPage })));
const BiometricsPage = lazy(() => import('@/features/profile/pages/BiometricsPage').then(m => ({ default: m.BiometricsPage })));
const SecurityPage = lazy(() => import('@/features/profile/pages/SecurityPage').then(m => ({ default: m.SecurityPage })));
const AboutUsPage = lazy(() => import('@/features/profile/pages/AboutUsPage').then(m => ({ default: m.AboutUsPage })));
const PrizeTaxPage = lazy(() => import('@/features/profile/pages/PrizeTaxPage').then(m => ({ default: m.PrizeTaxPage })));
const TechnicalMatrixPage = lazy(() => import('@/features/admin/pages/TechnicalMatrixPage').then(m => ({ default: m.TechnicalMatrixPage })));
const DeliveredPrizesPage = lazy(() => import('@/features/catalog/pages/DeliveredPrizesPage').then(m => ({ default: m.DeliveredPrizesPage })));
const CompanyLandingPage = lazy(() => import('@/features/company/pages/CompanyLandingPage').then(m => ({ default: m.CompanyLandingPage })));
const CondicionesPage = lazy(() => import('@/features/legal/pages/CondicionesPage').then(m => ({ default: m.CondicionesPage })));
const PrivacidadPage = lazy(() => import('@/features/legal/pages/PrivacidadPage').then(m => ({ default: m.PrivacidadPage })));
const AvisoLegalPage = lazy(() => import('@/features/legal/pages/AvisoLegalPage').then(m => ({ default: m.AvisoLegalPage })));
const CondicionesAbonosPage = lazy(() => import('@/features/legal/pages/CondicionesAbonosPage').then(m => ({ default: m.CondicionesAbonosPage })));
const JuegoResponsablePage = lazy(() => import('@/features/legal/pages/JuegoResponsablePage').then(m => ({ default: m.JuegoResponsablePage })));

/**
 * Fallback único y ligero para Suspense — solo se ve durante la descarga de
 * un chunk de ruta no crítica (Login/Register/Recover/Reset/VerifyEmail/Home
 * son eager y nunca lo disparan). CSS-only shimmer, ya usado en el resto de
 * la app (ver shared/ui/Skeleton) — sin motion/gsap.
 */
function RouteFallback() {
  return (
    <div
      className="flex min-h-[100dvh] w-full flex-col items-center justify-center gap-3 bg-background px-6"
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">Cargando…</span>
      <Skeleton variant="circle" className="h-10 w-10" />
      <Skeleton variant="text" className="h-3 w-28" />
    </div>
  );
}

export function AppRouter() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<PublicLayout />}>
          {/* Usamos el Login como página de aterrizaje (index) para renderizado inmediato */}
          <Route index element={<LoginPage />} />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/register/verify-email" element={<VerifyEmailPage />} />
          <Route path="/recover-password" element={<RecoverPasswordPage />} />
          <Route path="/recover-password/sent" element={<EmailSentPage />} />
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
            <Route path="/profile/bank-accounts" element={<BankAccountsPage />} />
            <Route path="/profile/help" element={<HelpPage />} />
            <Route path="/profile/prizes-and-tax" element={<PrizeTaxPage />} />
            <Route path="/profile/kyc" element={<KycPage />} />
            <Route path="/profile/gaming-control" element={<ResponsibleGamingPage />} />
            <Route path="/profile/gaming-control/:sectionId" element={<ResponsibleGamingResourcePage />} />
            <Route path="/profile/companies" element={<CompaniesPage />} />
            <Route path="/profile/biometrics" element={<BiometricsPage />} />
            <Route path="/profile/security" element={<SecurityPage />} />
            <Route path="/profile/about" element={<AboutUsPage />} />
            <Route path="/profile/delivered-prizes" element={<DeliveredPrizesPage />} />
            <Route path="/profile/settings" element={<SettingsPage />} />
            <Route path="/profile/matrix" element={<TechnicalMatrixPage />} />
          </Route>
        </Route>

        {/*
          /legal/* — deliberately outside PublicLayout (auto-redirects an
          authenticated user to /home, see PublicLayout.tsx) and outside
          PrivateLayout/RequireAuth (must render identically with or
          without a session, and never mount the private app shell). See
          LegalLayout.tsx.
        */}
        <Route element={<LegalLayout />}>
          <Route path="/legal/condiciones" element={<CondicionesPage />} />
          <Route path="/legal/condiciones-abonos" element={<CondicionesAbonosPage />} />
          <Route path="/legal/privacidad" element={<PrivacidadPage />} />
          <Route path="/legal/aviso" element={<AvisoLegalPage />} />
          <Route path="/legal/juego-responsable" element={<JuegoResponsablePage />} />
        </Route>

        {/*
          Standalone route for the verification-link email. Deliberately
          outside PublicLayout (which redirects any authenticated/demo user to
          /home before they could see the outcome) and outside RequireAuth
          (must also work for a logged-out user clicking the link).
        */}
        <Route path="/verify-email/:token" element={<VerifyEmailLinkPage />} />

        {/*
          Standalone route for the password-reset email link — same reasoning
          as /verify-email/:token above: outside PublicLayout and RequireAuth.
        */}
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
