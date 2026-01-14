
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Otimização: Declaração global para satisfazer o TypeScript e o Google Maps SDK
declare global {
  interface Window {
    google: any;
    initGoogleMapsCallback: () => void;
  }
}

// Função para carregar o SDK do Google Maps dinamicamente seguindo as melhores práticas
const loadGoogleMaps = () => {
  // Verifica em múltiplas fontes para garantir que a chave seja encontrada na Vercel
  const mapsKey = (
    process.env.VITE_GOOGLE_MAPS_KEY || 
    process.env.GOOGLE_MAPS_KEY || 
    (import.meta as any).env?.VITE_GOOGLE_MAPS_KEY || 
    ""
  ).trim();
  
  // Se a chave for "undefined" (string), vazia ou muito curta, avisamos mas não travamos o app
  if (!mapsKey || mapsKey === "undefined" || mapsKey.length < 10) {
    console.group("📍 Espiritualizei - Maps Status");
    console.warn("Chave do Google Maps não configurada ou inválida.");
    console.info("Para habilitar mapas internos, configure VITE_GOOGLE_MAPS_KEY no seu ambiente.");
    console.info("O App usará o modo de busca externa (Fallback) automaticamente.");
    console.groupEnd();
    return;
  }

  // Evita carregar o script múltiplas vezes
  if (document.querySelector('script[src*="maps.googleapis.com"]')) return;

  // Callback exigido pelo padrão loading=async
  window.initGoogleMapsCallback = () => {
    console.log("📍 Google Maps SDK inicializado com sucesso.");
  };

  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${mapsKey}&libraries=places&loading=async&callback=initGoogleMapsCallback`;
  script.async = true;
  script.defer = true;
  
  script.onerror = () => {
    console.error("🚨 Erro crítico ao carregar Google Maps. Verifique se a chave tem as permissões 'Maps JavaScript API' e 'Places API' ativas no Google Cloud Console.");
  };

  document.head.appendChild(script);
};

// Inicia o carregamento antes do App
loadGoogleMaps();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
