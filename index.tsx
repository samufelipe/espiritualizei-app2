
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

declare global {
  interface Window {
    google: any;
    initGoogleMapsCallback: () => void;
    __GOOGLE_MAPS_KEY__: string;
  }
}

const loadGoogleMaps = () => {
  // Busca exaustiva em todos os contextos de injeção do Vite
  const mapsKey = (
    (window as any).__GOOGLE_MAPS_KEY__ ||
    (import.meta as any).env?.VITE_GOOGLE_MAPS_KEY || 
    (process as any).env?.VITE_GOOGLE_MAPS_KEY || 
    ""
  ).trim();
  
  // Validação: precisa ter comprimento de uma chave Google Real e não ser a string literal "undefined"
  const isKeyValid = mapsKey && mapsKey !== "undefined" && mapsKey.length > 20;

  if (!isKeyValid) {
    console.group("📍 Espiritualizei - Diagnóstico de Mapas");
    console.warn("Aviso: Chave do Google Maps não detectada ou incompleta.");
    console.info("Valor atual:", mapsKey ? "Configurada (mas curta)" : "Vazia");
    console.info("Ação: O app funcionará em modo de 'Busca Externa'.");
    console.groupEnd();
    return;
  }

  if (document.querySelector('script[src*="maps.googleapis.com"]')) return;

  window.initGoogleMapsCallback = () => {
    console.log("📍 Google Maps SDK: Ativado.");
  };

  const script = document.createElement('script');
  // Adicionado loading=async e v=weekly para melhor performance mobile
  script.src = `https://maps.googleapis.com/maps/api/js?key=${mapsKey}&libraries=places&callback=initGoogleMapsCallback&v=weekly&loading=async`;
  script.async = true;
  script.defer = true;
  
  script.onerror = () => {
    console.error("🚨 Erro de carregamento do Google Maps. Verifique faturamento ou restrições de domínio.");
  };

  document.head.appendChild(script);
};

// Dispara o carregamento no início do ciclo de vida
loadGoogleMaps();

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
