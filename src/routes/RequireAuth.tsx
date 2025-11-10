import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isAuthed } from '../lib/demoAuth';

// Simple demo route guard: if not authed, redirect to /login preserving intent
const RequireAuth: React.FC = () => {
  const location = useLocation();
  if (!isAuthed()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
};

export default RequireAuth;
