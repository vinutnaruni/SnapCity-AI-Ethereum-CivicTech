import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Check, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface LocationPickerProps {
  onLocationSelect: (location: { lat: number; lng: number; name: string }) => void;
  defaultLocation?: { lat: number; lng: number; name: string };
}

const LocationPicker: React.FC<LocationPickerProps> = ({ onLocationSelect, defaultLocation }) => {
  const [location, setLocation] = useState(defaultLocation || null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [manualAddress, setManualAddress] = useState('');

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser. Please enter location manually.');
      setIsGettingLocation(false);
      return;
    }

    // Set timeout and high accuracy options
    const options = {
      enableHighAccuracy: true,
      timeout: 10000, // 10 seconds
      maximumAge: 60000 // 1 minute
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Try to get a more readable location name using reverse geocoding
          let locationName = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          
          try {
            // Use a free geocoding service
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            
            if (response.ok) {
              const data = await response.json();
              if (data.city && data.countryName) {
                locationName = `${data.city}, ${data.countryName}`;
              } else if (data.locality && data.countryName) {
                locationName = `${data.locality}, ${data.countryName}`;
              }
            }
          } catch (geocodeError) {
            console.log('Reverse geocoding failed, using coordinates');
          }
          
          const newLocation = {
            lat: latitude,
            lng: longitude,
            name: locationName
          };
          
          setLocation(newLocation);
          onLocationSelect(newLocation);
          toast.success('Location detected successfully!');
          setIsGettingLocation(false);
        } catch (error) {
          toast.error('Error processing location data');
          setIsGettingLocation(false);
        }
      },
      (error) => {
        let errorMessage = 'Unable to get your location. ';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Location access was denied. Please enable location permissions in your browser settings and try again.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable. Please check your GPS/WiFi connection and try again.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out. Please try again or enter location manually.';
            break;
          default:
            errorMessage += 'An unknown error occurred. Please try entering your location manually.';
            break;
        }
        
        toast.error(errorMessage, { duration: 6000 });
        setIsGettingLocation(false);
      },
      options
    );
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualAddress.trim()) {
      // In production, use geocoding service to convert address to coordinates
      const newLocation = {
        lat: 0, // Placeholder
        lng: 0, // Placeholder
        name: manualAddress.trim()
      };
      setLocation(newLocation);
      onLocationSelect(newLocation);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <MapPin className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Set Location</h3>
          <p className="text-sm text-gray-600">Choose detection location for better tracking</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Current Location Button */}
        <button
          onClick={getCurrentLocation}
          disabled={isGettingLocation}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isGettingLocation ? (
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <Navigation className="w-4 h-4" />
          )}
          <span>{isGettingLocation ? 'Getting Location...' : 'Use Current Location'}</span>
        </button>

        <div className="text-center text-gray-500 text-sm">or</div>

        {/* Manual Address Input */}
        <form onSubmit={handleManualSubmit} className="space-y-3">
          <input
            type="text"
            value={manualAddress}
            onChange={(e) => setManualAddress(e.target.value)}
            placeholder="Enter address manually"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Check className="w-4 h-4" />
            <span>Set Manual Location</span>
          </button>
        </form>

        {/* Selected Location Display */}
        {location && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-50 border border-green-200 rounded-lg p-4"
          >
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Location Set</p>
                <p className="text-sm text-green-600">{location.name}</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default LocationPicker;