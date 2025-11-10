import React, { useState } from 'react';
import { loginProphecy, getAvailableUsers } from '../../lib/demoAuth';
import { useAuth } from '../../context/AuthContext';

interface ProphecyLoginProps {
  onLoginSuccess?: () => void;
  className?: string;
}

export const ProphecyLogin: React.FC<ProphecyLoginProps> = ({ onLoginSuccess, className = '' }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setUserId } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = loginProphecy(email, password);
      if (success) {
        // Force re-render by updating auth context
        setUserId('user_prophecy_booking');
        onLoginSuccess?.();
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setEmail('booking@prophecyofficial.com');
    setPassword('Casillas123');
  };

  const availableUsers = getAvailableUsers();

  return (
    <div className={`max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg ${className}`}>
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">
        Prophecy Login
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="booking@prophecyofficial.com"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
            required
          />
        </div>

        {error && (
          <div className="text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>

        <button
          type="button"
          onClick={handleDemoLogin}
          className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Fill Prophecy Credentials
        </button>
      </form>

      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Available Users:</h3>
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          {availableUsers.map(user => (
            <div key={user.id}>
              <span className="font-medium">{user.name}</span> - {user.email}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProphecyLogin;