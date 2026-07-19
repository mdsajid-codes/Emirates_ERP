import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true, // Allow all hosts (like master.localhost)
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('ckeditor5-build-classic')) return 'vendor-ckeditor';
          if (['react', 'react-dom', 'react-router-dom'].some(p => id.includes(`/node_modules/${p}/`))) return 'vendor-react';
          if (id.includes('/node_modules/framer-motion/')) return 'vendor-motion';
          if (id.includes('/node_modules/lucide-react/') || id.includes('/node_modules/react-icons/')) return 'vendor-icons';
          if (id.includes('/node_modules/recharts/')) return 'vendor-recharts';
          if (id.includes('/node_modules/xlsx/')) return 'vendor-xlsx';
          if (id.includes('/node_modules/@fullcalendar/')) return 'vendor-calendar';
          if (id.includes('/node_modules/react-hook-form/') || id.includes('/node_modules/@hookform/') || id.includes('/node_modules/yup/')) return 'vendor-forms';
          if (id.includes('/node_modules/axios/')) return 'vendor-axios';
          if (id.includes('/node_modules/react-toastify/')) return 'vendor-toast';
          if (id.includes('/node_modules/@reduxjs/') || id.includes('/node_modules/react-redux/')) return 'vendor-redux';
        },
      },
    },
  },
})
