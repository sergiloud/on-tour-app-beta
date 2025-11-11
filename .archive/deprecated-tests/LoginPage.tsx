import React from 'react';
import { ProphecyLogin } from '../components/auth/ProphecyLogin';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { PROPHECY_USER } from '../lib/demoAuth';

export const LoginPage: React.FC = () => {
  const { userId } = useAuth();

  // If already logged in as Prophecy user, redirect to dashboard
  if (userId === PROPHECY_USER) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLoginSuccess = () => {
    // Navigation will happen automatically via the redirect above
    window.location.reload(); // Force a reload to ensure all data is loaded properly
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            On Tour App
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Prophecy Management Portal
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <ProphecyLogin onLoginSuccess={handleLoginSuccess} />
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Use the provided Prophecy credentials to access your show data
        </p>
      </div>
    </div>
  );
};

export default LoginPage;