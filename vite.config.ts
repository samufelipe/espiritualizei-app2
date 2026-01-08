
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import process from 'node:process';

export default defineConfig(({ mode }) => {
  // Carrega todas as variáveis de ambiente do sistema e do arquivo .env
  // O terceiro parâmetro '' permite carregar variáveis sem o prefixo VITE_
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // Mapeamento Literal: Isso garante que o Vite substitua a string no código pelo valor real
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY || env.API_KEY || ""),
      'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || env.SUPABASE_URL || ""),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || ""),
      'process.env.VITE_GOOGLE_MAPS_KEY': JSON.stringify(env.VITE_GOOGLE_MAPS_KEY || env.GOOGLE_MAPS_KEY || ""),
      // Polyfill adicional para compatibilidade
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
