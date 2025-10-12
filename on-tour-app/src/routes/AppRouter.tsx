import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import { CommandPalette } from '../components/CommandPalette';
import { RouteLoading, InlineRouteLoading } from '../components/common/RouteLoading';
import {
  DashboardSkeleton,
  FinanceSkeleton,
  ShowsSkeleton,
  TravelSkeleton,
  MissionSkeleton,
  SettingsSkeleton
} from '../components/skeletons/PageSkeletons';

// Placeholder future lazy routes
const Login = React.lazy(() => import('../pages/Login'));
const Register = React.lazy(() => import('../pages/Register'));
const OnboardingPage = React.lazy(() => import('../pages/OnboardingSimple'));
const DashboardOverview = React.lazy(() => import('../pages/Dashboard'));
const Finance = React.lazy(() => import('../pages/dashboard/Finance'));
const FinanceOverview = React.lazy(() => import('../pages/dashboard/FinanceOverview'));
const Shows = React.lazy(() => import('../pages/dashboard/Shows'));
const ShowDetails = React.lazy(() => import('../pages/dashboard/ShowDetails'));
const Travel = React.lazy(() => import('../pages/dashboard/TravelV2'));
const TravelWorkspacePage = React.lazy(() => import('../pages/dashboard/TravelWorkspacePage'));
const MissionControlLab = React.lazy(() => import('../pages/dashboard/MissionControlLab'));
const Calendar = React.lazy(() => import('../pages/dashboard/Calendar'));
const Settings = React.lazy(() => import('../pages/dashboard/Settings'));
const ProfilePage = React.lazy(() => import('../pages/profile/ProfilePage'));
const Story = React.lazy(() => import('../pages/dashboard/Story'));
import DashboardLayout from '../layouts/DashboardLayout';
import AuthLayout from '../layouts/AuthLayout';
const WelcomePage = React.lazy(() => import('../pages/welcome/WelcomePage'));

// Org routes
const OrgOverview = React.lazy(() => import('../pages/org/OrgOverviewNew'));
const OrgClients = React.lazy(() => import('../pages/org/OrgClients'));
const OrgReports = React.lazy(() => import('../pages/org/OrgReports'));

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <CommandPalette />
      <Routes>
        <Route
          path="/"
          element={<LandingPage />}
        />
        <Route path="/login" element={<Suspense fallback={<RouteLoading message="Loading login..." />}><Login /></Suspense>} />
        <Route path="/register" element={<Suspense fallback={<RouteLoading message="Loading register..." />}><Register /></Suspense>} />
        <Route path="/onboarding" element={<Suspense fallback={<RouteLoading message="Loading onboarding..." />}><OnboardingPage /></Suspense>} />
        <Route path="/welcome" element={<Navigate to="/dashboard/org" replace />} />
        <Route
          path="/dashboard/*"
          element={
            <AuthLayout>
              <DashboardLayout />
            </AuthLayout>
          }
        >
          <Route index element={<Suspense fallback={<DashboardSkeleton />}><DashboardOverview /></Suspense>} />
          <Route path="org" element={<Suspense fallback={<DashboardSkeleton />}><OrgOverview /></Suspense>} />
          <Route path="org/clients" element={<Navigate to="/dashboard/settings?tab=connections&subtab=clients" replace />} />
          <Route path="org/reports" element={<Navigate to="/dashboard/settings?tab=connections&subtab=reports" replace />} />
          <Route path="finance" element={<Suspense fallback={<FinanceSkeleton />}><Finance /></Suspense>} />
          <Route path="finance/overview" element={<Suspense fallback={<FinanceSkeleton />}><FinanceOverview /></Suspense>} />
          <Route path="story" element={<Suspense fallback={<DashboardSkeleton />}><Story /></Suspense>} />
          <Route path="shows" element={<Suspense fallback={<ShowsSkeleton />}><Shows /></Suspense>} />
          <Route path="shows/:id" element={<Suspense fallback={<ShowsSkeleton />}><ShowDetails /></Suspense>} />
          <Route path="travel" element={<Suspense fallback={<TravelSkeleton />}><Travel /></Suspense>} />
          <Route path="travel/workspace" element={<Suspense fallback={<TravelSkeleton />}><TravelWorkspacePage /></Suspense>} />
          <Route path="mission/lab" element={<Suspense fallback={<MissionSkeleton />}><MissionControlLab /></Suspense>} />
          <Route path="calendar" element={<Suspense fallback={<DashboardSkeleton />}><Calendar /></Suspense>} />
          <Route path="settings" element={<Suspense fallback={<SettingsSkeleton />}><Settings /></Suspense>} />
          <Route path="profile" element={<Suspense fallback={<SettingsSkeleton />}><ProfilePage /></Suspense>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
