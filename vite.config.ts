import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  const supabaseUrl = env.VITE_SUPABASE_URL || (process as any).env?.VITE_SUPABASE_URL || "";
  const supabaseKey = env.VITE_SUPABASE_ANON_KEY || (process as any).env?.VITE_SUPABASE_ANON_KEY || "";

  return {
    plugins: [react()],
    define: {
      'process.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(supabaseKey),
    },
    server: { port: 3000 },
    build: {
      outDir: 'dist',
      sourcemap: false,
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react':    ['react', 'react-dom'],
            'vendor-supabase': ['@supabase/supabase-js'],
            'vendor-recharts': ['recharts'],
            'vendor-lucide':   ['lucide-react'],
          },
        },
      },
    },
  };
});
