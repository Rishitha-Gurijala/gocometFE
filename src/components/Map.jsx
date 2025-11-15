import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';

export default function LocationMap({ onLocationSelect, initialPosition }) {
  console.log('Map props:', { onLocationSelect, initialPosition });
  const [position, setPosition] = useState(initialPosition || null);
  const [map, setMap] = useState(null);
  
  // Update position if initialPosition changes
  useEffect(() => {
    if (initialPosition) {
      console.log('Updating position from initialPosition:', initialPosition);
      setPosition(initialPosition);
    }
  }, [initialPosition]);

  useEffect(() => {
    if (navigator.geolocation && !initialPosition) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
        },
        (err) => {
          console.error('Error getting location:', err);
          // Default to a central location if geolocation fails
          setPosition({ lat: 20.5937, lng: 78.9629 }); // Default to India
        }
      );
    }
  }, [initialPosition]);

  const LocationMarker = () => {
    const map = useMapEvents({
      click(e) {
        console.log('Map clicked:', e.latlng);
        setPosition(e.latlng);
      },
      load() {
        console.log('Map loaded');
      },
      locationfound(e) {
        console.log('Location found:', e.latlng);
      },
      locationerror(e) {
        console.error('Location error:', e);
      }
    });

    return position === null ? null : (
      <Marker position={position}>
        <Popup>Selected Location</Popup>
      </Marker>
    );
  };

  if (!position) {
    return <div className="h-full w-full flex items-center justify-center">Loading map...</div>;
  }

  return (
    <div className="h-full w-full flex flex-col">
      <div className="h-96 w-full">
        <MapContainer
          center={position}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <LocationMarker />
        </MapContainer>
      </div>
      <div className="p-4 bg-white border-t border-gray-200 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {position && `Selected: ${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}`}
        </div>
        <div className="space-x-2">
          <button
            onClick={() => onLocationSelect(null)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onLocationSelect(position)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            disabled={!position}
          >
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
}
