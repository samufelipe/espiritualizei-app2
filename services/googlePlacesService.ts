
import { Parish } from '../types';

const isPopulated = (val: any) => {
  if (!val) return false;
  const s = String(val).trim();
  return s !== "" && s !== "undefined" && s !== "null";
};

// BUSCA ROBUSTA
// Fixed: Replacing import.meta.env with process.env to match vite.config.ts defines
const GOOGLE_MAPS_KEY = process.env.VITE_GOOGLE_MAPS_KEY || ""; 

const BASE_URL = 'https://places.googleapis.com/v1/places:searchNearby';

export const searchCatholicChurches = async (lat: number, lng: number): Promise<Parish[]> => {
  if (!isPopulated(GOOGLE_MAPS_KEY)) {
    console.warn("⚠️ Google Maps Offline: Chave ausente.");
    await new Promise(resolve => setTimeout(resolve, 800)); 
    return [
       {
          name: 'Paróquia Sagrado Coração (Simulado)',
          address: 'Configure sua VITE_GOOGLE_MAPS_KEY para ver dados reais.',
          location: { lat: lat + 0.002, lng: lng + 0.002 },
          rating: 5.0,
          userRatingsTotal: 1,
          openNow: true,
          photoUrl: 'https://images.unsplash.com/photo-1543357480-c60d40007a3f?auto=format&fit=crop&q=80&w=400',
          url: 'https://maps.google.com'
       }
    ];
  }

  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_MAPS_KEY,
        'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.currentOpeningHours,places.photos,places.googleMapsUri'
      },
      body: JSON.stringify({
        includedTypes: ['catholic_church'],
        maxResultCount: 12,
        locationRestriction: {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius: 10000 
          }
        },
        languageCode: 'pt-BR'
      })
    });

    if (!response.ok) {
      throw new Error("Erro na API do Google");
    }

    const data = await response.json();
    
    if (!data.places || data.places.length === 0) return [];

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
    console.error("🚨 Google Places API Error:", error);
    return [];
  }
};