
import { Parish } from '../types';

/**
 * Serviço de Busca de Igrejas Católicas utilizando o SDK oficial do Google Maps.
 * Otimizado com tipagem segura para evitar erros de compilação.
 */
export const searchCatholicChurches = async (lat: number, lng: number): Promise<Parish[]> => {
  return new Promise((resolve, reject) => {
    // Acesso à propriedade window com cast para satisfazer o compilador conforme solicitado
    const google = (window as any).google;

    // Verifica se o SDK do Google foi carregado corretamente
    if (!google || !google.maps || !google.maps.places) {
      console.error("🚨 Google Maps SDK não disponível no objeto window.");
      return reject(new Error("Serviço de Mapas indisponível."));
    }

    try {
      const dummyElement = document.createElement('div');
      const service = new google.maps.places.PlacesService(dummyElement);

      const request = {
        location: new google.maps.LatLng(lat, lng),
        radius: 15000,
        type: ['church'],
        keyword: 'Igreja Católica'
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
          resolve([]);
        } else {
          reject(new Error(`Erro Google: ${status}`));
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};
