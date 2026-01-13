
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Carrega variáveis do sistema (Node/Vercel) e do .env
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  // Função para buscar valor com ou sem prefixo VITE_
  const getVal = (key: string) => env[key] || env[`VITE_${key}`] || process.env[key] || process.env[`VITE_${key}`] || "";

  return {
    plugins: [react()],
    define: {
      // Injetamos as variáveis diretamente no objeto process.env para o cliente
      'process.env.VITE_SUPABASE_URL': JSON.stringify(getVal('SUPABASE_URL')),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(getVal('SUPABASE_ANON_KEY')),
      'process.env.VITE_API_KEY': JSON.stringify(getVal('API_KEY')),
      'process.env.VITE_GOOGLE_MAPS_KEY': JSON.stringify(getVal('GOOGLE_MAPS_KEY')),
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
