
import { Parish } from '../types';

const isPopulated = (val: any) => {
  if (!val) return false;
  const s = String(val).trim();
  return s !== "" && s !== "undefined" && s !== "null" && !s.includes("YOUR_");
};

// Captura segura da chave injetada pelo Vite
const getApiKey = () => {
  const key = process.env.VITE_GOOGLE_MAPS_KEY || "";
  return key;
};

const BASE_URL = 'https://places.googleapis.com/v1/places:searchNearby';

export const searchCatholicChurches = async (lat: number, lng: number): Promise<Parish[]> => {
  const GOOGLE_MAPS_KEY = getApiKey();
  
  if (!isPopulated(GOOGLE_MAPS_KEY)) {
    console.warn("⚠️ Google Maps: Chave de API não configurada ou inválida.");
    return [];
  }

  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_MAPS_KEY,
        // FieldMask atualizado para ser mais resiliente e completo
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.currentOpeningHours,places.photos,places.googleMapsUri,places.types'
      },
      body: JSON.stringify({
        includedTypes: ['catholic_church'],
        maxResultCount: 15,
        locationRestriction: {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius: 15000 // Aumentado para 15km para maior abrangência
          }
        },
        languageCode: 'pt-BR',
        rankPreference: 'DISTANCE'
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("🚨 Google Places API Error Status:", response.status, errorData);
      throw new Error(`Erro na API: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.places || data.places.length === 0) {
        console.log("ℹ️ Nenhuma igreja encontrada nas proximidades.");
        return [];
    }

    return data.places.map((place: any) => {
      let photoUrl = undefined;
      if (place.photos && place.photos.length > 0) {
        const photoName = place.photos[0].name; 
        photoUrl = `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=400&maxWidthPx=400&key=${GOOGLE_MAPS_KEY}`;
      }

      return {
        name: place.displayName?.text || 'Igreja Católica',
        address: place.formattedAddress || 'Endereço não disponível',
        location: {
          lat: place.location.latitude,
          lng: place.location.longitude
        },
        rating: place.rating,
        userRatingsTotal: place.userRatingCount,
        openNow: place.currentOpeningHours?.openNow,
        url: place.googleMapsUri,
        photoUrl: photoUrl,
        directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${place.location.latitude},${place.location.longitude}`
      };
    });
  } catch (error) {
    console.error("🚨 Falha crítica ao buscar igrejas:", error);
    throw error;
  }
};
