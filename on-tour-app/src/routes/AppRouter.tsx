import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { prefetchByPath } from './prefetch';
import { Home } from '../pages/Home';

// Placeholder future lazy routes
// const Login = React.lazy(() => import('../pages/Login')); // (to create later)
const DashboardOverview = React.lazy(() => import('../pages/Dashboard'));
const Finance = React.lazy(() => import('../pages/dashboard/Finance'));
const FinanceOverview = React.lazy(() => import('../pages/dashboard/FinanceOverview'));
const Shows = React.lazy(() => import('../pages/dashboard/Shows'));
const ShowDetails = React.lazy(() => import('../pages/dashboard/ShowDetails'));
const Travel = React.lazy(() => import('../pages/dashboard/Travel'));
const TravelWorkspacePage = React.lazy(() => import('../pages/dashboard/TravelWorkspacePage'));
const MissionControlLab = React.lazy(() => import('../pages/dashboard/MissionControlLab'));
const Calendar = React.lazy(() => import('../pages/dashboard/Calendar'));
const Settings = React.lazy(() => import('../pages/dashboard/Settings'));
const Story = React.lazy(() => import('../pages/dashboard/Story'));
import DashboardLayout from '../layouts/DashboardLayout';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-ink-950 text-ink-50">
      {/* Skip link */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 bg-ink-800/95 backdrop-blur px-4 py-2 rounded-md shadow-lg focus:ring-2 focus:ring-accent-500/60"
      >Skip to main content</a>
      {/* Top navigation */}
      <header className="px-6 py-4 flex items-center justify-between" role="banner">
        <div className="font-semibold tracking-wide text-accent-400" aria-label="On Tour App brand">OnTour</div>
        <nav aria-label="Primary" role="navigation" className="text-sm space-x-6 hidden md:flex">
          <NavLink to="/" className={({isActive}) => isActive ? 'font-semibold transition-colors' : 'opacity-80 hover:opacity-100 transition-colors'} end>Home</NavLink>
          <NavLink to="/dashboard" className={({isActive}) => isActive ? 'font-semibold transition-colors' : 'opacity-80 hover:opacity-100 transition-colors'} onMouseEnter={()=>prefetchByPath('/dashboard')} onFocus={()=>prefetchByPath('/dashboard')}>Dashboard</NavLink>
          <span aria-disabled="true" className="opacity-50 cursor-not-allowed">Login</span>
        </nav>
      </header>
      <main id="main" tabIndex={-1} className="flex-1 outline-none focus-visible:ring-2 focus-visible:ring-accent-500/50" role="main">
        {children}
      </main>
      <footer className="px-6 py-8 text-xs opacity-60" role="contentinfo">© {new Date().getFullYear()} On Tour App — Early Preview</footer>
    </div>
  );
};

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <AppLayout>
              <Home />
            </AppLayout>
          }
        />
        <Route path="/dashboard" element={<DashboardLayout />}> 
          <Route index element={<Suspense fallback={<div className='p-6 text-sm' style={{color:'var(--text-secondary)'}}>Loading…</div>}><DashboardOverview /></Suspense>} />
          <Route path="finance" element={<Suspense fallback={<div className='p-6 text-sm' style={{color:'var(--text-secondary)'}}>Loading finance…</div>}><Finance /></Suspense>} />
          <Route path="finance/overview" element={<Suspense fallback={<div className='p-6 text-sm' style={{color:'var(--text-secondary)'}}>Loading finance overview…</div>}><FinanceOverview /></Suspense>} />
          <Route path="story" element={<Suspense fallback={<div className='p-6 text-sm' style={{color:'var(--text-secondary)'}}>Loading story…</div>}><Story /></Suspense>} />
          <Route path="shows" element={<Suspense fallback={<div className='p-6 text-sm' style={{color:'var(--text-secondary)'}}>Loading shows…</div>}><Shows /></Suspense>} />
          <Route path="shows/:id" element={<Suspense fallback={<div className='p-6 text-sm' style={{color:'var(--text-secondary)'}}>Loading show…</div>}><ShowDetails /></Suspense>} />
          <Route path="travel" element={<Suspense fallback={<div className='p-6 text-sm' style={{color:'var(--text-secondary)'}}>Loading travel…</div>}><Travel /></Suspense>} />
              <Route path="travel/workspace" element={<Suspense fallback={<div className='p-6 text-sm' style={{color:'var(--text-secondary)'}}>Loading travel workspace…</div>}><TravelWorkspacePage /></Suspense>} />
              <Route path="mission/lab" element={<Suspense fallback={<div className='p-6 text-sm' style={{color:'var(--text-secondary)'}}>Loading mission control lab…</div>}><MissionControlLab /></Suspense>} />
          <Route path="calendar" element={<Suspense fallback={<div className='p-6 text-sm' style={{color:'var(--text-secondary)'}}>Loading calendar…</div>}><Calendar /></Suspense>} />
          <Route path="settings" element={<Suspense fallback={<div className='p-6 text-sm' style={{color:'var(--text-secondary)'}}>Loading settings…</div>}><Settings /></Suspense>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
