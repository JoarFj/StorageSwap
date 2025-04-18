import { useState, useEffect } from "react";

interface GeolocationPosition {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude: number | null;
    altitudeAccuracy: number | null;
    heading: number | null;
    speed: number | null;
  };
  timestamp: number;
}

interface GeolocationError {
  code: number;
  message: string;
}

interface GeolocationHookResult {
  position: GeolocationPosition | null;
  error: GeolocationError | null;
  loading: boolean;
}

export function useGeolocation(): GeolocationHookResult {
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState<GeolocationError | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError({
        code: 0,
        message: "Geolocation is not supported by your browser",
      });
      setLoading(false);
      return;
    }

    const successHandler = (position: GeolocationPosition) => {
      setPosition(position);
      setLoading(false);
      setError(null);
    };

    const errorHandler = (error: GeolocationError) => {
      setError(error);
      setLoading(false);
    };

    const id = navigator.geolocation.getCurrentPosition(
      successHandler,
      errorHandler
    );

    return () => {
      // No cleanup function available for getCurrentPosition
    };
  }, []);

  return { position, error, loading };
}
