
import { Parish } from '../types';

// Declaração global para evitar erros de compilação TS
declare global {
  interface Window {
    google: any;
  }
}

/**
 * Serviço de Busca de Igrejas Católicas utilizando o SDK oficial do Google Maps.
 * Isso evita problemas de CORS que ocorrem em chamadas REST diretas do navegador.
 */
export const searchCatholicChurches = async (lat: number, lng: number): Promise<Parish[]> => {
  return new Promise((resolve, reject) => {
    // Acesso seguro ao objeto global google
    const google = (window as any).google;

    // Verifica se o SDK do Google foi carregado corretamente
    if (!google || !google.maps || !google.maps.places) {
      console.error("🚨 SDK do Google Maps não carregado ou chave inválida.");
      return reject(new Error("Serviço de Mapas temporariamente indisponível. Verifique sua chave API."));
    }

    try {
      // Criamos um elemento invisível para o serviço, conforme exigência do SDK
      const dummyElement = document.createElement('div');
      const service = new google.maps.places.PlacesService(dummyElement);

      const request: any = {
        location: new google.maps.LatLng(lat, lng),
        radius: 15000, // 15km para maior abrangência
        type: ['church'],
        keyword: 'Igreja Católica' // Filtro mais preciso por termo
      };

      service.nearbySearch(request, (results: any[] | null, status: any) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          const mappedResults: Parish[] = results.map((place: any) => ({
            name: place.name || 'Igreja Católica',
            address: place.vicinity || 'Endereço não disponível',
            location: {
              lat: place.geometry?.location?.lat() || lat,
              lng: place.geometry?.location?.lng() || lng
            },
            rating: place.rating,
            userRatingsTotal: place.user_ratings_total,
            openNow: place.opening_hours?.isOpen?.(),
            url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name || '')}&query_place_id=${place.place_id}`,
            photoUrl: place.photos && place.photos.length > 0 ? place.photos[0].getUrl({ maxWidth: 400, maxHeight: 400 }) : undefined,
            directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${place.geometry?.location?.lat()},${place.geometry?.location?.lng()}`
          }));

          resolve(mappedResults);
        } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
          console.log("ℹ️ Nenhuma igreja católica encontrada nesta área.");
          resolve([]);
        } else {
          console.error("🚨 Erro na busca do Google Places. Status:", status);
          reject(new Error(`Erro na API do Google: ${status}`));
        }
      });
    } catch (error) {
      console.error("🚨 Falha crítica no serviço de busca:", error);
      reject(error);
    }
  });
};
