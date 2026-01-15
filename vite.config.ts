
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Carrega as variáveis do arquivo .env e do sistema (Vercel)
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  // Normalização da chave de mapas - prioritária para o Vite
  const mapsKey = (
    env.VITE_GOOGLE_MAPS_KEY || 
    (process as any).env?.VITE_GOOGLE_MAPS_KEY || 
    env.GOOGLE_MAPS_KEY || 
    (process as any).env?.GOOGLE_MAPS_KEY || 
    ""
  ).trim();

  const supabaseUrl = env.VITE_SUPABASE_URL || (process as any).env?.VITE_SUPABASE_URL || "";
  const supabaseKey = env.VITE_SUPABASE_ANON_KEY || (process as any).env?.VITE_SUPABASE_ANON_KEY || "";
  const apiKey = env.API_KEY || (process as any).env?.API_KEY || "";

  return {
    plugins: [react()],
    define: {
      // Injeção global para o browser
      'process.env.VITE_GOOGLE_MAPS_KEY': JSON.stringify(mapsKey),
      'process.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(supabaseKey),
      'process.env.API_KEY': JSON.stringify(apiKey),
      'import.meta.env.VITE_GOOGLE_MAPS_KEY': JSON.stringify(mapsKey),
      '__GOOGLE_MAPS_KEY__': JSON.stringify(mapsKey),
    },
    server: {
      port: 3000,
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      emptyOutDir: true,
    }
  };
});
