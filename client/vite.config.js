import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // Listen on all addresses
    strictPort: false,
    allowedHosts: [
      'localhost',
      '.trycloudflare.com', // Allow all Cloudflare tunnel domains
      'explicitly-therapist-retrieval-icons.trycloudflare.com'
    ]
  },
  preview: {
    port: 4173,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'three': ['three'],
          'react-three': ['@react-three/fiber', '@react-three/drei'],
          'gsap': ['gsap']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['three', '@react-three/fiber', '@react-three/drei', 'gsap']
  }
});
