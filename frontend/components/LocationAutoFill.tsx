"use client";
import { useState } from "react";

interface LocationAutoFillProps {
  onLocationFound: (locationData: { city: string; state: string }) => void;
}

export default function LocationAutoFill({ onLocationFound }: LocationAutoFillProps) {
  const [loading, setLoading] = useState(false);
  // FIX 1: Explicitly tell TS this state can hold a string OR null
  const [error, setError] = useState<string | null>(null);
 
  // FIX 2: Tell TS this promise will return a GeolocationPosition object
  const getLocation = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      });
    });
  };

  const fetchCityState = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const pos = await getLocation();
      const latitude = pos.coords.latitude;
      const longitude = pos.coords.longitude;

      // Note: In production, it's safer to put this key in your .env.local file!
      const API_KEY = "pk.e6953260361dea8f4b758c4a2528aefa";
      const base_url = `https://us1.locationiq.com/v1/reverse?key=${API_KEY}&lat=${latitude}&lon=${longitude}&format=json`;

      const response = await fetch(base_url);
      const data = await response.json();

      // LocationIQ sometimes returns county or district instead of city
      const city = data.address.city || data.address.town || data.address.village || data.address.county || data.address.state_district;
      const state = data.address.state;

      console.log("Found Location:", city, state);

      // Send this data back to the main form
      if (onLocationFound) {
        onLocationFound({ city, state });
      }

    } catch (err: any) { // FIX 3: Add 'any' type to the caught error
      console.error("Location Error:", err);
      setError("Could not get location. Please ensure location services are allowed in your browser.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-4">
      <button 
        type="button" 
        onClick={fetchCityState} 
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? "📍 Detecting Location..." : "📍 Use My Current Location"}
      </button>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}