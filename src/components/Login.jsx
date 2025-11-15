import { useState } from 'react';
import Signup from './Signup';

const Login = ({ onLogin }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId.trim()) {
      setError('Please enter a user ID');
      return;
    }
    if (!password.trim()) {
      setError('Please enter a password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Use the Vite proxy to avoid CORS issues
      const response = await fetch(`/api/v1/validateUser/${userId}/${encodeURIComponent(password)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data && data.message === 'valid') {
        onLogin(userId);
      } else if (data && data.message === 'incorrect') {
        // Show incorrect password error
        setError('Incorrect Password');
      } else {
        // Show signup form if user doesn't exist
        setShowSignup(true);
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.message.includes('404')) {
        // If user not found, show signup form
        setShowSignup(true);
      } else {
        setError('Failed to validate user. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Show signup form if showSignup is true
  if (showSignup) {
    return (
      <Signup 
        userId={userId}
        password={password}
        onSignupSuccess={() => setShowSignup(false)}
        onBackToLogin={() => setShowSignup(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">
              User ID
            </label>
            <input
              type="text"
              id="userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
              placeholder="Enter your user ID"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
            <div className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setUserId('');
                  setPassword('');
                  setShowSignup(true);
                }}
                className="text-blue-600 hover:text-blue-800 font-medium focus:outline-none"
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

export default Login;
