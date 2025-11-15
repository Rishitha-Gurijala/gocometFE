import { useState } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';
import Login from './components/Login';
import DriverLogin from './components/DriverLogin';
import DriverDashboard from './components/DriverDashboard';
import LocationPicker from './components/LocationPicker';

const LOCATION_TYPES = {
  SOURCE: 'source',
  DESTINATION: 'destination'
};

// Fix for default marker icons in React
const defaultIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function App() {
  const [view, setView] = useState('home'); // 'home', 'user', 'driver', 'login'
  const [userId, setUserId] = useState(null);
  const [driverData, setDriverData] = useState({ name: '', id: '' });
  const [locations, setLocations] = useState({
    [LOCATION_TYPES.SOURCE]: null,
    [LOCATION_TYPES.DESTINATION]: null
  });
  const [currentLocationType, setCurrentLocationType] = useState(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLocationSelection = (locationType) => {
    setCurrentLocationType(locationType);
    setShowLocationPicker(true);
  };

  const isLocationSelected = (type) => locations[type] !== null;
  const isBothLocationsSelected = Object.values(locations).every(loc => loc !== null);

  const handleConfirmRide = async () => {
    if (!isBothLocationsSelected) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/v1/rides', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          source: {
            latitude: locations[LOCATION_TYPES.SOURCE].lat,
            longitude: locations[LOCATION_TYPES.SOURCE].lng
          },
          destination: {
            latitude: locations[LOCATION_TYPES.DESTINATION].lat,
            longitude: locations[LOCATION_TYPES.DESTINATION].lng
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to confirm ride: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Ride confirmed:', data);
      alert('Your ride has been confirmed!');
    } catch (error) {
      console.error('Error confirming ride:', error);
      setError('Failed to confirm ride. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserLogin = (userId) => {
    setUserId(userId);
    setView('user');
  };

  const handleDriverLogin = (driverData) => {
    setUserId(driverData.id);
    setDriverData(driverData);
    setView('driver');
  };

  // Login Screen
  if (view === 'login') {
    return <Login onLogin={handleUserLogin} />;
  }

  // Driver Screen
  if (view === 'driver') {
    // Temporary test data
    if (!driverData.id) {
      // Using test data to verify DriverDashboard rendering
      return <DriverDashboard driverData={{ id: 'test123', name: 'Test Driver' }} />;
      // return <DriverLogin onLogin={handleDriverLogin} />;
    }
    return <DriverDashboard driverData={driverData} />;
  }

  // Home Screen
  if (view === 'home') {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-4">Welcome to GoComet</h1>
          <p className="text-gray-600 text-center mb-12">Choose how you'd like to continue</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User Option */}
            <div 
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer h-full"
              onClick={() => setView('login')}
            >
              <div className="p-8 text-center h-full flex flex-col">
                <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">User</h2>
                <p className="text-gray-600 mb-6">Book a ride to your destination</p>
                <div className="mt-auto">
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full">
                    Continue as User
                  </button>
                </div>
              </div>
            </div>

            {/* Driver Option */}
            <div 
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer h-full"
              onClick={() => setView('driver-login')}
            >
              <div className="p-8 text-center h-full flex flex-col">
                <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Driver</h2>
                <p className="text-gray-600 mb-6">Access driver dashboard and services</p>
                <div className="mt-auto">
                  <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors w-full">
                    Continue as Driver
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Driver Login View
  if (view === 'driver-login') {
    return <DriverLogin onLogin={(driverData) => {
      setUserId(driverData.id);
      setDriverData(driverData);
      setView('driver'); // Changed from 'driver-home' to 'driver' to match our condition
    }} />;
  }

  // Driver Home View
  if (view === 'driver-home') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">WELCOME, {driverData.name || 'DRIVER'}!</h1>
          <p className="text-gray-600 mb-2">Driver ID: {userId}</p>
          {driverData.name && <p className="text-gray-600 mb-6">Name: {driverData.name}</p>}
          <button 
            onClick={() => setView('home')}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const handleLocationConfirm = (location) => {
    if (currentLocationType) {
      setLocations(prev => ({
        ...prev,
        [currentLocationType]: { lat: location.lat, lng: location.lng }
      }));
      setShowLocationPicker(false);
      setCurrentLocationType(null);
    }
  };

  // User View
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      {showLocationPicker && (
        <LocationPicker
          onConfirm={handleLocationConfirm}
          onCancel={() => {
            setShowLocationPicker(false);
            setCurrentLocationType(null);
          }}
          type={currentLocationType === LOCATION_TYPES.SOURCE ? 'pickup' : 'dropoff'}
        />
      )}
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Book a Ride</h2>
              <button 
                onClick={() => setView('home')}
                className="text-gray-500 hover:text-gray-700"
                title="Back to home"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
            </div>
            <div className="p-8 text-center">
              <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Enter Your Trip Details</h2>
            
            {/* Source Button */}
            <div className="mb-4">
              <button 
                onClick={() => handleLocationSelection(LOCATION_TYPES.SOURCE)}
                disabled={isLoading}
                className={`w-full px-6 py-3 rounded-lg transition-colors ${
                  isLocationSelected(LOCATION_TYPES.SOURCE)
                    ? 'bg-green-100 text-green-800 border-2 border-green-300'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                } ${isLoading && currentLocationType === LOCATION_TYPES.SOURCE ? 'opacity-50' : ''}`}
              >
                {isLoading && currentLocationType === LOCATION_TYPES.SOURCE ? (
                  'Getting current location...'
                ) : isLocationSelected(LOCATION_TYPES.SOURCE) ? (
                  <span className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Source Set
                  </span>
                ) : (
                  'Set Pickup Location'
                )}
              </button>
              {isLocationSelected(LOCATION_TYPES.SOURCE) && (
                <div className="mt-2 text-sm text-gray-600">
                  {locations[LOCATION_TYPES.SOURCE].lat.toFixed(6)}, {locations[LOCATION_TYPES.SOURCE].lng.toFixed(6)}
                </div>
              )}
            </div>

            {/* Destination Button */}
            <div className="mb-6">
              <button 
                onClick={() => handleLocationSelection(LOCATION_TYPES.DESTINATION)}
                disabled={isLoading}
                className={`w-full px-6 py-3 rounded-lg transition-colors ${
                  isLocationSelected(LOCATION_TYPES.DESTINATION)
                    ? 'bg-green-100 text-green-800 border-2 border-green-300'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                } ${isLoading && currentLocationType === LOCATION_TYPES.DESTINATION ? 'opacity-50' : ''}`}
              >
                {isLoading && currentLocationType === LOCATION_TYPES.DESTINATION ? (
                  'Getting current location...'
                ) : isLocationSelected(LOCATION_TYPES.DESTINATION) ? (
                  <span className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Destination Set
                  </span>
                ) : (
                  'Set Drop-off Location'
                )}
              </button>
              {isLocationSelected(LOCATION_TYPES.DESTINATION) && (
                <div className="mt-2 text-sm text-gray-600">
                  {locations[LOCATION_TYPES.DESTINATION].lat.toFixed(6)}, {locations[LOCATION_TYPES.DESTINATION].lng.toFixed(6)}
                  </div>
              )}
            </div>

            {/* Continue Button */}

            
            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            {isBothLocationsSelected && (
              <div className="mt-6">
                <button
                  onClick={handleConfirmRide}
                  disabled={isLoading}
                  className="w-full mb-4 py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Confirming...
                    </>
                  ) : 'Confirm Ride'}
                </button>
                <div className="rounded-lg overflow-hidden border border-gray-200" style={{ height: '300px' }}>
                <MapContainer 
                  center={[
                    (locations[LOCATION_TYPES.SOURCE].lat + locations[LOCATION_TYPES.DESTINATION].lat) / 2,
                    (locations[LOCATION_TYPES.SOURCE].lng + locations[LOCATION_TYPES.DESTINATION].lng) / 2
                  ]} 
                  zoom={13} 
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={true}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker 
                    position={[locations[LOCATION_TYPES.SOURCE].lat, locations[LOCATION_TYPES.SOURCE].lng]} 
                    icon={defaultIcon}
                  >
                    <Popup>
                      <strong>Pickup Location</strong><br />
                      {locations[LOCATION_TYPES.SOURCE].lat.toFixed(6)}, {locations[LOCATION_TYPES.SOURCE].lng.toFixed(6)}
                    </Popup>
                  </Marker>
                  <Marker 
                    position={[locations[LOCATION_TYPES.DESTINATION].lat, locations[LOCATION_TYPES.DESTINATION].lng]} 
                    icon={defaultIcon}
                  >
                    <Popup>
                      <strong>Drop-off Location</strong><br />
                      {locations[LOCATION_TYPES.DESTINATION].lat.toFixed(6)}, {locations[LOCATION_TYPES.DESTINATION].lng.toFixed(6)}
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>
          )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}