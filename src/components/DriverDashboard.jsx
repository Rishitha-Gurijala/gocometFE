import { useState } from 'react';

const DriverDashboard = ({ driverData }) => {
  const [position, setPosition] = useState(null);
  const [showCoords, setShowCoords] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const getLocation = () => {
    setIsLoading(true);
    setError('');
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition({ 
            lat: parseFloat(latitude.toFixed(6)), 
            lng: parseFloat(longitude.toFixed(6)) 
          });
          setShowCoords(true);
          setIsLoading(false);
        },
        (err) => {
          console.error('Geolocation error:', err);
          setError('Unable to retrieve your location. Please try again.');
          setIsLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
      setIsLoading(false);
    }
  };

  const handleHideCoords = () => {
    setShowCoords(false);
    setPosition(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">Driver Dashboard</h1>
        {driverData && (
          <p className="text-center text-gray-600 mb-6">
            Welcome, <span className="font-semibold">{driverData.name}</span> (ID: {driverData.id})
          </p>
        )}
        <div className="flex flex-col items-center">
          {!showCoords ? (
            <button
              onClick={getLocation}
              className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-colors ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Getting Location...' : 'Show My Coordinates'}
            </button>
          ) : (
            <div className="w-full">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-700 mb-3">Your Current Location</h3>
                <div className="bg-white p-4 rounded border border-gray-200">
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Latitude</div>
                      <div className="font-mono font-medium text-lg">
                        {position?.lat ?? '--'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Longitude</div>
                      <div className="font-mono font-medium text-lg">
                        {position?.lng ?? '--'}
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleHideCoords}
                  className="mt-4 w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
                >
                  Hide Coordinates
                </button>
              </div>
            </div>
          )}
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded border border-red-200">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
