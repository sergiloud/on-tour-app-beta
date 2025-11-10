import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import Login from '../pages/Login';
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
const Register = React.lazy(() => import('../pages/Register'));
const OnboardingPage = React.lazy(() => import('../pages/OnboardingSimple'));
const DashboardOverview = React.lazy(() => import('../pages/Dashboard'));
const Finance = React.lazy(() => import('../pages/dashboard/Finance'));
const FinanceOverview = React.lazy(() => import('../pages/dashboard/FinanceOverview'));
const Contacts = React.lazy(() => import('../pages/dashboard/Contacts'));
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
const OrgMembers = React.lazy(() => import('../pages/org/OrgMembers'));
const OrgTeams = React.lazy(() => import('../pages/org/OrgTeams'));
const OrgBranding = React.lazy(() => import('../pages/org/OrgBranding'));
const OrgBilling = React.lazy(() => import('../pages/org/OrgBilling'));
const OrgIntegrations = React.lazy(() => import('../pages/org/OrgIntegrations'));
const OrgDocuments = React.lazy(() => import('../pages/org/OrgDocuments'));
const OrgReports = React.lazy(() => import('../pages/org/OrgReports'));
const OrgClients = React.lazy(() => import('../pages/org/OrgClients'));
const OrgLinks = React.lazy(() => import('../pages/org/OrgLinks'));
const ArtistHub = React.lazy(() => import('../pages/org/ArtistHub'));

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <CommandPalette />
      <Routes>
        <Route
          path="/"
          element={<LandingPage />}
        />
        <Route path="/login" element={<Login />} />
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
          <Route path="org/members" element={<Suspense fallback={<DashboardSkeleton />}><OrgMembers /></Suspense>} />
          <Route path="org/teams" element={<Suspense fallback={<DashboardSkeleton />}><OrgTeams /></Suspense>} />
          <Route path="org/branding" element={<Suspense fallback={<DashboardSkeleton />}><OrgBranding /></Suspense>} />
          <Route path="org/billing" element={<Suspense fallback={<DashboardSkeleton />}><OrgBilling /></Suspense>} />
          <Route path="org/integrations" element={<Suspense fallback={<DashboardSkeleton />}><OrgIntegrations /></Suspense>} />
          <Route path="org/documents" element={<Suspense fallback={<DashboardSkeleton />}><OrgDocuments /></Suspense>} />
          <Route path="org/reports" element={<Suspense fallback={<DashboardSkeleton />}><OrgReports /></Suspense>} />
          <Route path="org/clients" element={<Suspense fallback={<DashboardSkeleton />}><OrgClients /></Suspense>} />
          <Route path="org/links" element={<Suspense fallback={<DashboardSkeleton />}><OrgLinks /></Suspense>} />
          <Route path="org/artist-hub" element={<Suspense fallback={<DashboardSkeleton />}><ArtistHub /></Suspense>} />
          <Route path="finance" element={<Suspense fallback={<FinanceSkeleton />}><Finance /></Suspense>} />
          <Route path="finance/overview" element={<Suspense fallback={<FinanceSkeleton />}><FinanceOverview /></Suspense>} />
          <Route path="contacts" element={<Suspense fallback={<DashboardSkeleton />}><Contacts /></Suspense>} />
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
