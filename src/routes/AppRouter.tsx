import React, { Suspense, useEffect, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { RouteLoading, InlineRouteLoading } from '../components/common/RouteLoading';
import {
  DashboardSkeleton,
  FinanceSkeleton,
  ShowsSkeleton,
  TravelSkeleton,
  MissionSkeleton,
  SettingsSkeleton
} from '../components/skeletons/PageSkeletons';
import { ShowsPageSkeleton } from '../components/loading/ShowsPageSkeleton';
import { ContactsPageSkeleton } from '../components/loading/ContactsPageSkeleton';
import { CalendarPageSkeleton } from '../components/loading/CalendarPageSkeleton';
import { trackNavigation } from '../routes/prefetch';
import DashboardLayout from '../layouts/DashboardLayout';
import AuthLayout from '../layouts/AuthLayout';

// Auth & Landing - lazy loaded
const LandingPage = lazy(() => import('../pages/LandingPage'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const OnboardingPage = lazy(() => import('../pages/OnboardingSimple'));

// Dashboard routes - lazy loaded
const DashboardOverview = lazy(() => import('../pages/Dashboard'));
const Finance = lazy(() => import('../pages/dashboard/Finance'));
const FinanceOverview = lazy(() => import('../pages/dashboard/FinanceOverview'));
const Contacts = lazy(() => import('../pages/dashboard/Contacts'));
const Contracts = lazy(() => import('../pages/dashboard/Contracts'));
const Shows = lazy(() => import('../pages/dashboard/Shows'));
const ShowDetails = lazy(() => import('../pages/dashboard/ShowDetails'));
const Travel = lazy(() => import('../pages/dashboard/TravelV2'));
const TravelWorkspacePage = lazy(() => import('../pages/dashboard/TravelWorkspacePage'));
const MissionControlLab = lazy(() => import('../pages/dashboard/MissionControlLab'));
const Calendar = lazy(() => import('../pages/dashboard/Calendar'));
const TimelinePage = lazy(() => import('../features/timeline/pages/TimelinePageV4'));
const RoadmapPage = lazy(() => import('../features/roadmap/pages/RoadmapPage'));
const Settings = lazy(() => import('../pages/dashboard/Settings'));
const ProfilePage = lazy(() => import('../pages/profile/ProfileSettings'));
const Story = lazy(() => import('../pages/dashboard/Story'));
const EnhancedCapabilitiesDemo = lazy(() => import('../pages/dashboard/EnhancedCapabilitiesDemo'));
const DataSecurityPage = lazy(() => import('../pages/DataSecurityPage'));
const WelcomePage = lazy(() => import('../pages/welcome/WelcomePage'));
const ServiceWorkerDemo = lazy(() => import('../pages/ServiceWorkerDemo'));

// Org routes - lazy loaded
const OrgOverview = lazy(() => import('../pages/org/OrgOverviewNew'));
const OrgActivity = lazy(() => import('../pages/org/OrgActivity'));
const OrgMembers = lazy(() => import('../pages/org/OrgMembers'));
const OrgTeams = lazy(() => import('../pages/org/OrgTeams'));
const OrgBranding = lazy(() => import('../pages/org/OrgBranding'));
const OrgBilling = lazy(() => import('../pages/org/OrgBilling'));
const OrgIntegrations = lazy(() => import('../pages/org/OrgIntegrations'));
const OrgDocuments = lazy(() => import('../pages/org/OrgDocuments'));
const OrgReports = lazy(() => import('../pages/org/OrgReports'));
const OrgClients = lazy(() => import('../pages/org/OrgClients'));
const OrgLinks = lazy(() => import('../pages/org/OrgLinks'));
const OrgLinkInvitations = lazy(() => import('../pages/org/OrgLinkInvitations'));
const ArtistHub = lazy(() => import('../pages/org/ArtistHub'));

// Navigation tracker component
const NavigationTracker = () => {
  const location = useLocation();
  
  useEffect(() => {
    trackNavigation(location.pathname);
  }, [location.pathname]);
  
  return null;
};

export const AppRouter = () => {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <NavigationTracker />
      <Routes>
        <Route
          path="/"
          element={<Suspense fallback={<RouteLoading message="Loading..." />}><LandingPage /></Suspense>}
        />
        <Route path="/login" element={<Suspense fallback={<RouteLoading message="Loading..." />}><Login /></Suspense>} />
        <Route path="/register" element={<Suspense fallback={<RouteLoading message="Loading..." />}><Register /></Suspense>} />
        <Route path="/onboarding" element={<Suspense fallback={<RouteLoading message="Loading..." />}><OnboardingPage /></Suspense>} />
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
          <Route path="org/activity" element={<Suspense fallback={<DashboardSkeleton />}><OrgActivity /></Suspense>} />
          <Route path="org/members" element={<Suspense fallback={<DashboardSkeleton />}><OrgMembers /></Suspense>} />
          <Route path="org/teams" element={<Suspense fallback={<DashboardSkeleton />}><OrgTeams /></Suspense>} />
          <Route path="org/branding" element={<Suspense fallback={<DashboardSkeleton />}><OrgBranding /></Suspense>} />
          <Route path="org/billing" element={<Suspense fallback={<DashboardSkeleton />}><OrgBilling /></Suspense>} />
          <Route path="org/integrations" element={<Suspense fallback={<DashboardSkeleton />}><OrgIntegrations /></Suspense>} />
          <Route path="org/documents" element={<Suspense fallback={<DashboardSkeleton />}><OrgDocuments /></Suspense>} />
          <Route path="org/reports" element={<Suspense fallback={<DashboardSkeleton />}><OrgReports /></Suspense>} />
          <Route path="org/clients" element={<Suspense fallback={<DashboardSkeleton />}><OrgClients /></Suspense>} />
          <Route path="org/links" element={<Suspense fallback={<DashboardSkeleton />}><OrgLinks /></Suspense>} />
          <Route path="org/link-invitations" element={<Suspense fallback={<DashboardSkeleton />}><OrgLinkInvitations /></Suspense>} />
          <Route path="org/artist-hub" element={<Suspense fallback={<DashboardSkeleton />}><ArtistHub /></Suspense>} />
          <Route path="finance" element={<Suspense fallback={<FinanceSkeleton />}><Finance /></Suspense>} />
          <Route path="finance/overview" element={<Suspense fallback={<FinanceSkeleton />}><FinanceOverview /></Suspense>} />
          <Route path="contacts" element={<Suspense fallback={<ContactsPageSkeleton />}><Contacts /></Suspense>} />
          <Route path="contracts" element={<Suspense fallback={<ContactsPageSkeleton />}><Contracts /></Suspense>} />
          <Route path="story" element={<Suspense fallback={<DashboardSkeleton />}><Story /></Suspense>} />
          <Route path="shows" element={<Suspense fallback={<ShowsPageSkeleton />}><Shows /></Suspense>} />
          <Route path="shows/:id" element={<Suspense fallback={<ShowsPageSkeleton />}><ShowDetails /></Suspense>} />
          <Route path="travel" element={<Suspense fallback={<TravelSkeleton />}><Travel /></Suspense>} />
          <Route path="travel/workspace" element={<Suspense fallback={<TravelSkeleton />}><TravelWorkspacePage /></Suspense>} />
          <Route path="mission/lab" element={<Suspense fallback={<MissionSkeleton />}><MissionControlLab /></Suspense>} />
          <Route path="calendar" element={<Suspense fallback={<CalendarPageSkeleton />}><Calendar /></Suspense>} />
          <Route path="activity" element={<Navigate to="/dashboard/timeline" replace />} />
          <Route path="timeline" element={<Suspense fallback={<DashboardSkeleton />}><TimelinePage /></Suspense>} />
          <Route path="roadmap" element={<Suspense fallback={<DashboardSkeleton />}><RoadmapPage /></Suspense>} />
          <Route path="settings" element={<Suspense fallback={<SettingsSkeleton />}><Settings /></Suspense>} />
          <Route path="profile" element={<Suspense fallback={<SettingsSkeleton />}><ProfilePage /></Suspense>} />
          <Route path="enhanced" element={<Suspense fallback={<DashboardSkeleton />}><EnhancedCapabilitiesDemo /></Suspense>} />
          <Route path="data-security" element={<Suspense fallback={<SettingsSkeleton />}><DataSecurityPage /></Suspense>} />
          <Route path="sw-demo" element={<Suspense fallback={<DashboardSkeleton />}><ServiceWorkerDemo /></Suspense>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
