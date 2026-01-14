
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Função para carregar o SDK do Google Maps dinamicamente
const loadGoogleMaps = () => {
  const mapsKey = process.env.VITE_GOOGLE_MAPS_KEY || "";
  if (!mapsKey) {
    console.warn("⚠️ Google Maps Key não encontrada no ambiente.");
    return;
  }

  // Verifica se o script já existe para evitar duplicatas
  if (document.querySelector('script[src*="maps.googleapis.com"]')) return;

  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${mapsKey}&libraries=places`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
};

// Inicia o carregamento do mapa
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
