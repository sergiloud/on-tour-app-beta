import React from 'react';
import { AppRouter } from './routes/AppRouter';
import { ToastProvider } from './ui/Toast';

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AppRouter />
    </ToastProvider>
  );
};
