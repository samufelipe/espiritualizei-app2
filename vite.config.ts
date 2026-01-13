
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Carrega variáveis do sistema (Vercel)
  // Fixed: Cast process to any to resolve 'cwd' property error in Node environment
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  const getSafeVal = (key: string) => {
    return env[key] || env[`VITE_${key}`] || process.env[key] || process.env[`VITE_${key}`] || "";
  };

  return {
    plugins: [react()],
    define: {
      'process.env.VITE_SUPABASE_URL': JSON.stringify(getSafeVal('SUPABASE_URL')),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(getSafeVal('SUPABASE_ANON_KEY')),
      // Fixed: Added API_KEY definition to satisfy GenAI guidelines
      'process.env.API_KEY': JSON.stringify(getSafeVal('API_KEY')),
      'process.env.VITE_API_KEY': JSON.stringify(getSafeVal('API_KEY')),
      'process.env.VITE_GOOGLE_MAPS_KEY': JSON.stringify(getSafeVal('GOOGLE_MAPS_KEY')),
      'process.env.NODE_ENV': JSON.stringify(mode),
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
