import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
  },
  envPrefix: 'VITE_',
  build: {
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
  optimizeDeps: {
    include: ['@knocklabs/client'],
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
});
