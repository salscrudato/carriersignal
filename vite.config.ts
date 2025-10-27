import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwind from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwind()],
  build: {
    // Optimize chunk size for production
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          'firebase': ['firebase/firestore', 'firebase/app'],
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
    // Improve build performance
    minify: 'terser',
  },
  // Optimize for production
  define: {
    'process.env.NODE_ENV': '"production"',
  },
})