import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,  
    proxy: {
  '/api': {
    target: 'https://demo14.codessoft.com',
    changeOrigin: true,
    secure: false,
    followRedirects: false,
    //  cookieDomainRewrite: "139.59.95.2",
    // cookiePathRewrite: "/",
  },
  '/assets': {
    target: 'https://demo14.codessoft.com',
    changeOrigin: true,
    secure: false,
    followRedirects: false,
  },
  '/files': {
    target: 'https://demo14.codessoft.com',
    changeOrigin: true,
    secure: false,
    followRedirects: false,
  },
},
  },
  build: {
    outDir: '../cars_on_ship/public/cos',
    emptyOutDir: true,
  },
})