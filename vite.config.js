// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['@emailjs/browser']
  },
  resolve: {
    alias: {
      // Ensure Vite/Rollup resolves the ES entry for emailjs reliably
      '@emailjs/browser': path.resolve(
        path.dirname(fileURLToPath(import.meta.url)),
        'node_modules/@emailjs/browser/es/index.js'
      )
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          stripe: ['@stripe/stripe-js', '@stripe/react-stripe-js'],
          supabase: ['@supabase/supabase-js']
        }
      }
    }
  },
  server: {
    port: 5173,
    host: true
  },
  preview: {
    port: 4173,
    host: true
  }
})