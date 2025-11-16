import { useState } from 'react';

const DriverDashboard = ({ driverData }) => {
  const [position, setPosition] = useState(null);
  const [showCoords, setShowCoords] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const [apiResponse, setApiResponse] = useState('');
  const [rides, setRides] = useState([]);
  const [isLoadingRides, setIsLoadingRides] = useState(false);
  const [showRides, setShowRides] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  
  const handleFinishRide = async (rideId) => {
    if (!rideId || !driverData?.id) return;
    
    setIsFinishing(true);
    try {
      const response = await fetch('/api/v1/trips/end', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ 
          driverId: driverData.id,
          rideId: rideId 
        })
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to finish ride');
      }
      
      // Update the ride status in the local state
      setRides(prevRides => 
        prevRides.map(ride => 
          ride.id === rideId 
            ? { ...ride, status: 'COMPLETED' }
            : ride
        )
      );
      
      // Show success message with fare if available
      const fareMessage = data.fare 
        ? `${data.message} Fare: ₹${data.fare}` 
        : data.message;
      showToast(fareMessage);
      
    } catch (err) {
      console.error('Error completing ride:', err);
      showToast(err.message || 'Failed to complete ride. Please try again.', true);
    } finally {
      setIsFinishing(false);
    }
  };
  
  const showToast = (message, isError = false) => {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 px-6 py-3 rounded-md shadow-lg text-white font-medium ${
      isError ? 'bg-red-500' : 'bg-green-500'
    } z-50 transition-opacity duration-300 opacity-0 animate-fadeIn`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Trigger reflow to ensure animation plays
    toast.offsetHeight;
    
    // Add the show class
    toast.classList.add('opacity-100');
    
    // Remove toast after 3 seconds
    setTimeout(() => {
      toast.classList.remove('opacity-100');
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  };

  const handleConfirmRide = async (rideId) => {
    if (!rideId || !driverData?.id) return;
    
    setIsConfirming(true);
    try {
      const response = await fetch('/api/v1/acceptRide', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          driverId: driverData.id,
          rideId: rideId
        })
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to confirm ride');
      }
      
      // Update the ride status in the local state to IN_PROGRESS
      setRides(prevRides => 
        prevRides.map(ride => 
          ride.id === rideId 
            ? { ...ride, status: 'IN_PROGRESS', driverId: driverData.id }
            : ride
        )
      );
      
      showToast(data.message || 'Ride confirmed successfully!');
    } catch (err) {
      console.error('Error confirming ride:', err);
      showToast(err.message || 'Failed to confirm ride. Please try again.', true);
    } finally {
      setIsConfirming(false);
    }
  };

  const fetchAllRides = async () => {
    if (!driverData?.id) {
      setError('Driver ID not found');
      return;
    }

    setIsLoadingRides(true);
    setError('');
    
    try {
      console.log('Fetching rides for driver:', driverData.id);
      const response = await fetch(`/api/v1/viewAllRides/${driverData.id}`, {
        method: 'GET',  // Changed from POST to GET
        headers: {
          'Accept': 'application/json',
        },
        // Removed body since we're using GET
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Server error: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Rides data:', data);
      
      // Handle both response formats: with and without 'data' property
      const ridesData = data.data || data || [];
      setRides(Array.isArray(ridesData) ? ridesData : []);
      setShowRides(true);
    } catch (err) {
      console.error('Error fetching rides:', err);
      setError(`Failed to load rides: ${err.message}`);
    } finally {
      setIsLoadingRides(false);
    }
  };

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

  const updateDriverLocation = async () => {
    if (!position) {
      setError('No location data available. Please get your location first.');
      return;
    }
    
    setIsUpdating(true);
    setError('');
    setApiResponse('');
    
    try {
      const driverId = driverData?.id;
      if (!driverId) {
        throw new Error('Driver ID not found. Please log in again.');
      }

      console.log('Sending location update:', { 
        latitude: position.lat, 
        longitude: position.lng,
        driverId: driverId
      });
      
      const response = await fetch('/api/v1/updateDriverLocation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          latitude: position.lat,
          longitude: position.lng,
          driverId: driverId
        })
      });
      
      const responseText = await response.text();
      console.log('Raw response:', responseText);
      
      let data;
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (e) {
        console.error('Failed to parse response as JSON:', e);
        throw new Error(`Invalid response from server: ${responseText}`);
      }
      
      console.log('Parsed response:', data);
      
      if (response.ok) {
        if (data && (data.success || data.message)) {
          setApiResponse(data.message || 'Location updated successfully');
        } else {
          throw new Error('Unexpected response format from server');
        }
      } else {
        throw new Error(data.message || `Server returned ${response.status}`);
      }
    } catch (err) {
      console.error('Error updating location:', err);
      const errorMessage = err.response 
        ? `Server error: ${err.response.status} - ${err.response.statusText}`
        : err.message;
      setError(`Error: ${errorMessage}. Check console for details.`);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
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
                  <div className="mt-4 space-y-2">
                    <button
                      onClick={updateDriverLocation}
                      disabled={isUpdating}
                      className={`w-full py-2 ${isUpdating ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium rounded transition-colors`}
                    >
                      {isUpdating ? 'Updating...' : 'Update Location'}
                    </button>
                    <button
                      onClick={handleHideCoords}
                      className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
                    >
                      Hide Coordinates
                    </button>
                  </div>
                  {apiResponse && (
                    <div className="mt-3 p-2 bg-green-50 text-green-700 text-sm rounded border border-green-200">
                      {apiResponse}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="mt-6">
              <button
                onClick={fetchAllRides}
                disabled={isLoadingRides}
                className={`w-full px-6 py-3 rounded-lg font-medium text-white ${
                  isLoadingRides 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } transition-colors`}
              >
                {isLoadingRides ? 'Loading Rides...' : 'View All Rides'}
              </button>
            </div>
            
            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            
            {apiResponse && (
              <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                {apiResponse}
              </div>
            )}
            
            {showRides && (
              <div className="mt-6">
                <h2 className="text-xl font-semibold mb-4">Available Rides</h2>
                {rides.length === 0 ? (
                  <p className="text-gray-600 text-center py-4">No rides available</p>
                ) : (
                  <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto max-h-96 overflow-y-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ride ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pickup</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dropoff</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fare</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {rides.map((ride) => (
                            <tr key={`${ride.id}-${Math.random()}`} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ride.id}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ride.userId}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {parseFloat(ride.pickup_lat).toFixed(6)}, {parseFloat(ride.pickup_long).toFixed(6)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {parseFloat(ride.dropoff_lat).toFixed(6)}, {parseFloat(ride.dropoff_long).toFixed(6)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  ride.status === 'COMPLETED' 
                                    ? 'bg-green-100 text-green-800' 
                                    : ride.status === 'CANCELLED'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {ride.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {ride.fare ? `₹${ride.fare}` : '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {ride.status === 'IN_PROGRESS' ? (
                                  <button 
                                    onClick={() => handleFinishRide(ride.id)}
                                    className="px-3 py-1 rounded text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
                                  >
                                    FINISH
                                  </button>
                                ) : (
                                  <button 
                                    onClick={() => handleConfirmRide(ride.id)}
                                    disabled={ride.status !== 'WAITING'}
                                    className={`px-3 py-1 rounded text-sm font-medium ${
                                      ride.status === 'WAITING'
                                        ? 'bg-green-600 text-white hover:bg-green-700'
                                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                    }`}
                                  >
                                    {ride.status === 'WAITING' ? 'Confirm' : 'Ended'}
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
