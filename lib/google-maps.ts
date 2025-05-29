// Utilidades para Google Maps API
// Manejo de geocodificación, validación de ubicación y mapas

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface LocationValidationResult {
  isValid: boolean;
  distance: number;
  message: string;
}

// Obtener la API Key desde las variables de entorno
const getGoogleMapsApiKey = (): string => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error('Google Maps API Key no configurada. Agrega NEXT_PUBLIC_GOOGLE_MAPS_API_KEY a tu archivo .env.local');
  }
  return apiKey;
};

/**
 * Geocodificar una dirección para obtener coordenadas
 * @param address Dirección a geocodificar
 * @returns Coordenadas lat/lng o null si no se encuentra
 */
export const geocodeAddress = async (address: string): Promise<Coordinates | null> => {
  try {
    const apiKey = getGoogleMapsApiKey();
    const encodedAddress = encodeURIComponent(address);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return {
        lat: location.lat,
        lng: location.lng
      };
    }
    
    console.warn('No se pudieron obtener coordenadas para la dirección:', address);
    return null;
  } catch (error) {
    console.error('Error en geocodificación:', error);
    return null;
  }
};

/**
 * Calcular la distancia entre dos puntos usando la fórmula de Haversine
 * @param coord1 Coordenadas del primer punto
 * @param coord2 Coordenadas del segundo punto
 * @returns Distancia en metros
 */
export const calculateDistance = (coord1: Coordinates, coord2: Coordinates): number => {
  const R = 6371e3; // Radio de la Tierra en metros
  const φ1 = coord1.lat * Math.PI / 180;
  const φ2 = coord2.lat * Math.PI / 180;
  const Δφ = (coord2.lat - coord1.lat) * Math.PI / 180;
  const Δλ = (coord2.lng - coord1.lng) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distancia en metros
};

/**
 * Validar si el usuario está dentro del radio permitido de una instalación
 * @param userLocation Ubicación actual del usuario
 * @param facilityLocation Ubicación de la instalación
 * @param allowedRadius Radio permitido en metros
 * @returns Resultado de la validación
 */
export const validateUserLocation = (
  userLocation: Coordinates,
  facilityLocation: Coordinates,
  allowedRadius: number = 100
): LocationValidationResult => {
  const distance = calculateDistance(userLocation, facilityLocation);
  const isValid = distance <= allowedRadius;
  
  let message: string;
  if (isValid) {
    message = `Ubicación válida. Estás a ${Math.round(distance)} metros de la instalación.`;
  } else {
    message = `Ubicación inválida. Estás a ${Math.round(distance)} metros de la instalación. Debes estar dentro de ${allowedRadius} metros.`;
  }
  
  return {
    isValid,
    distance: Math.round(distance),
    message
  };
};

/**
 * Obtener la ubicación actual del usuario
 * @param options Opciones de geolocalización
 * @returns Promise con las coordenadas del usuario
 */
export const getCurrentLocation = (options?: PositionOptions): Promise<Coordinates> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocalización no soportada por este navegador'));
      return;
    }

    const defaultOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000, // Cache por 1 minuto
      ...options
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        let errorMessage = 'Error desconocido al obtener ubicación';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permiso de geolocalización denegado';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Información de ubicación no disponible';
            break;
          case error.TIMEOUT:
            errorMessage = 'Tiempo de espera agotado para obtener ubicación';
            break;
        }
        
        reject(new Error(errorMessage));
      },
      defaultOptions
    );
  });
};

/**
 * Formatear coordenadas para mostrar al usuario
 * @param coordinates Coordenadas a formatear
 * @returns String formateado
 */
export const formatCoordinates = (coordinates: Coordinates): string => {
  return `${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`;
};

/**
 * Crear URL de Google Maps para mostrar una ubicación
 * @param coordinates Coordenadas de la ubicación
 * @param zoom Nivel de zoom (opcional)
 * @returns URL de Google Maps
 */
export const createMapsUrl = (coordinates: Coordinates, zoom: number = 15): string => {
  return `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}&z=${zoom}`;
};
