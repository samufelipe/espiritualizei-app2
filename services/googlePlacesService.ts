
import { Parish } from '../types';

// Agora a chave é buscada das variáveis de ambiente do Vercel/Vite
const GOOGLE_MAPS_KEY = process.env.VITE_GOOGLE_MAPS_KEY || ''; 

const BASE_URL = 'https://places.googleapis.com/v1/places:searchNearby';

export const searchCatholicChurches = async (lat: number, lng: number): Promise<Parish[]> => {
  // Se não houver chave, retorna os dados simulados para não quebrar o App
  if (!GOOGLE_MAPS_KEY || GOOGLE_MAPS_KEY === '' || GOOGLE_MAPS_KEY.includes('SUA_CHAVE')) {
    console.warn("Google Maps Key não configurada. Usando dados simulados.");
    await new Promise(resolve => setTimeout(resolve, 800)); 
    
    return [
       {
          name: 'Paróquia Sagrado Coração de Jesus',
          address: 'R. das Flores, 123 - Centro',
          location: { lat: lat + 0.002, lng: lng + 0.002 },
          rating: 4.8,
          userRatingsTotal: 156,
          openNow: true,
          photoUrl: 'https://images.unsplash.com/photo-1543357480-c60d40007a3f?auto=format&fit=crop&q=80&w=400',
          url: 'https://maps.google.com'
       },
       {
          name: 'Catedral Metropolitana',
          address: 'Av. Paulista, 1000 - Bela Vista',
          location: { lat: lat - 0.005, lng: lng - 0.001 },
          rating: 4.9,
          userRatingsTotal: 2450,
          openNow: false,
          photoUrl: 'https://images.unsplash.com/photo-1548625361-888978202d8b?auto=format&fit=crop&q=80&w=400',
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
        'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.businessStatus,places.currentOpeningHours,places.photos,places.googleMapsUri'
      },
      body: JSON.stringify({
        includedTypes: ['catholic_church'],
        maxResultCount: 15,
        locationRestriction: {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius: 8000 
          }
        },
        languageCode: 'pt-BR'
      })
    });

    const data = await response.json();
    if (!data.places) return [];

    return data.places.map((place: any) => {
      let photoUrl = undefined;
      if (place.photos && place.photos.length > 0) {
        const photoRef = place.photos[0].name;
        photoUrl = `https://places.googleapis.com/v1/${photoRef}/media?maxHeightPx=400&maxWidthPx=400&key=${GOOGLE_MAPS_KEY}`;
      }

      return {
        name: place.displayName?.text || 'Igreja Católica',
        address: place.formattedAddress || 'Endereço não informado',
        location: {
          lat: place.location.latitude,
          lng: place.location.longitude
        },
        rating: place.rating || 0,
        userRatingsTotal: place.userRatingCount || 0,
        openNow: place.currentOpeningHours?.openNow ?? undefined,
        url: place.googleMapsUri,
        photoUrl: photoUrl,
        directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${place.location.latitude},${place.location.longitude}`
      };
    });
  } catch (error) {
    console.error("Erro ao buscar no Google Places:", error);
    return [];
  }
};
