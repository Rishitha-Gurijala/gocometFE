import { useState } from 'react';
import DriverSignup from './DriverSignup';

const DriverLogin = ({ onLogin }) => {
  const [driverId, setDriverId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!driverId.trim()) {
      setError('Please enter a driver ID');
      return;
    }
    if (!password.trim()) {
      setError('Please enter a password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/v1/validateDriver/${driverId}/${encodeURIComponent(password)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      const data = await response.json();
      console.log('Login API Response:', { status: response.status, data });
      
      if (data === 'valid') {
        onLogin(driverId);
      } else if (data === 'incorrect') {
        setError('Incorrect Password');
      } else if (data === 'invalid') {
        setShowSignup(true);
      } else {
        setError('Invalid response from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Failed to validate driver. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (showSignup) {
    return (
      <DriverSignup 
        driverId={driverId}
        password={password}
        onSignupSuccess={() => setShowSignup(false)}
        onBackToLogin={() => setShowSignup(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Driver Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="driverId" className="block text-sm font-medium text-gray-700 mb-1">
              Driver ID
            </label>
            <input
              type="text"
              id="driverId"
              value={driverId}
              onChange={(e) => setDriverId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 mb-4"
              placeholder="Enter your driver ID"
              disabled={isLoading}
            />
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Enter your password"
              disabled={isLoading}
            />
          </div>
          {error && (
            <div className="mb-4 text-red-600 text-sm">
              {error}
            </div>
          )}
          <div className="space-y-3">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
            <div className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setDriverId('');
                  setPassword('');
                  setShowSignup(true);
                }}
                className="text-green-600 hover:text-green-800 font-medium focus:outline-none"
              >
                Sign up
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DriverLogin;
