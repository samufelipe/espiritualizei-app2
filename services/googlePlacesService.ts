
import { Parish } from '../types';

// ⚠️ ATENÇÃO: COLE SUA CHAVE DO GOOGLE MAPS AQUI
// Certifique-se de que a API "Places API (New)" esteja ativada no Google Cloud.
const GOOGLE_MAPS_KEY = 'SUA_CHAVE_GOOGLE_MAPS_AQUI'; 

const BASE_URL = 'https://places.googleapis.com/v1/places:searchNearby';

export const searchCatholicChurches = async (lat: number, lng: number): Promise<Parish[]> => {
  if (!GOOGLE_MAPS_KEY || GOOGLE_MAPS_KEY.includes('SUA_CHAVE')) {
    console.error("Google Maps Key não configurada.");
    return [];
  }

  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_MAPS_KEY,
        // Máscara de campos: Trazemos apenas o que precisamos para economizar custos e bytes
        'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.businessStatus,places.currentOpeningHours,places.photos,places.googleMapsUri'
      },
      body: JSON.stringify({
        includedTypes: ['catholic_church'], // O FILTRO DE OURO: Apenas Igrejas Católicas
        maxResultCount: 20,
        locationRestriction: {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius: 5000 // Raio de 5km (ajustável)
          }
        },
        languageCode: 'pt-BR'
      })
    });

    const data = await response.json();

    if (!data.places) return [];

    return data.places.map((place: any) => {
      // Construir URL da foto (se houver)
      let photoUrl = undefined;
      if (place.photos && place.photos.length > 0) {
        const photoRef = place.photos[0].name; // Formato: places/PLACE_ID/photos/PHOTO_ID
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
        openNow: place.currentOpeningHours?.openNow ?? undefined, // Pode ser undefined se não tiver horário
        url: place.googleMapsUri,
        photoUrl: photoUrl, // URL real da foto
        directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${place.location.latitude},${place.location.longitude}`
      };
    });

  } catch (error) {
    console.error("Erro ao buscar no Google Places:", error);
    return [];
  }
};
