
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
  // IMPORTANTE: Usamos apenas a chave específica de mapas para evitar erro de InvalidKey
  const rawKey = process.env.VITE_GOOGLE_MAPS_KEY || "";
  const mapsKey = rawKey.trim();
  
  // Se a chave for "undefined" (string), vazia ou placeholder, não carrega o script para evitar o erro visual
  if (!mapsKey || mapsKey === "undefined" || mapsKey.length < 10) {
    console.warn("⚠️ Google Maps Key ausente ou inválida. Verifique a variável VITE_GOOGLE_MAPS_KEY na Vercel.");
    return;
  }

  // Evita carregar o script múltiplas vezes
  if (document.querySelector('script[src*="maps.googleapis.com"]')) return;

  // Callback exigido pelo padrão loading=async
  window.initGoogleMapsCallback = () => {
    console.log("📍 Google Maps SDK inicializado.");
  };

  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${mapsKey}&libraries=places&loading=async&callback=initGoogleMapsCallback`;
  script.async = true;
  script.defer = true;
  
  script.onerror = () => {
    console.error("🚨 Erro ao carregar Google Maps. Chave pode estar bloqueada por restrições de HTTP Referrer.");
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
