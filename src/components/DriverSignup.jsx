import { useState } from 'react';

const DriverSignup = ({ driverId: initialDriverId = '', password: initialPassword = '', onSignupSuccess, onBackToLogin }) => {
  const [driverId, setDriverId] = useState(initialDriverId);
  const [password, setPassword] = useState(initialPassword);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [createdDriver, setCreatedDriver] = useState(null);

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
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('Sending request to /api/v1/createDriver with:', { driverId, name });
      const response = await fetch('/api/v1/createDriver', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          driverId: parseInt(driverId, 10),
          password: password,
          name: name
        })
      });
      
      const responseData = await response.json();
      console.log('API Response:', { status: response.status, data: responseData });
      
      if (!response.ok) {
        throw new Error(`Failed to create driver account: ${response.status} ${response.statusText}`);
      }

      const driverData = { id: driverId, name };
      setCreatedDriver(driverData);
      if (onSignupSuccess) {
        onSignupSuccess(driverData);
      }
      
    } catch (error) {
      console.error('Signup error:', error);
      setError(`Failed to create driver account: ${error.message}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  if (createdDriver) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-green-600 mb-4">Account Created Successfully!</h2>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-green-800 mb-2">Your Driver Details:</h3>
          <div className="space-y-2">
            <p className="text-gray-700">
              <span className="font-medium">Driver ID:</span> {createdDriver.id}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Name:</span> {createdDriver.name}
            </p>
          </div>
          <p className="mt-3 text-sm text-green-700">
            Please save these details for future reference.
          </p>
        </div>
        
        <button
          onClick={onBackToLogin}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <div className="flex items-center mb-6">
          <button
            onClick={onBackToLogin}
            className="text-gray-500 hover:text-gray-700 mr-4"
            disabled={isLoading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h2 className="text-2xl font-bold text-gray-800">Driver Sign Up</h2>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="driverId" className="block text-sm font-medium text-gray-700 mb-1">
                Driver ID
              </label>
              <input
                type="number"
                id="driverId"
                value={driverId}
                onChange={(e) => setDriverId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter driver ID"
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter your full name"
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Create a password"
                disabled={isLoading}
              />
            </div>
            
            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
            
            <div className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onBackToLogin}
                className="text-green-600 hover:text-green-800 font-medium focus:outline-none"
                disabled={isLoading}
              >
                Back to Login
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DriverSignup;
