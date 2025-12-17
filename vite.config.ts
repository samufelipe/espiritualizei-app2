
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Carrega variáveis de ambiente baseado no modo (development/production)
  // O '.' indica que deve procurar no diretório raiz
  const env = loadEnv(mode, '.', '');
  
  return {
    plugins: [react()],
    define: {
      // Isso permite que o código use process.env.NOME mesmo no Vite
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
      'process.env': JSON.stringify(env)
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      // Garante que o build limpe a pasta antes de gerar uma nova
      emptyOutDir: true
    }
  };
});
