import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isProd = env.VITE_APP_ENV === 'production'

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    base: isProd ? '/assets/cars_on_ship/frontend/' : '/',

    server: {
      host: '0.0.0.0',
      port: 3000,
      proxy: {
        '/api': {
          target: 'https://demo14.codessoft.com',
          changeOrigin: true,
          secure: false,
          followRedirects: false,
          cookieDomainRewrite: "139.59.95.2",
          cookiePathRewrite: "/",
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
      outDir: isProd
        ? '../cars_on_ship/public/frontend'
        : '../cars_on_ship/public/cos',
      emptyOutDir: true,
      rollupOptions: isProd ? {
        output: {
          entryFileNames: 'index.js',
          chunkFileNames: 'index.js',
          assetFileNames: 'index.[ext]',
        },
      } : {},
    },
  }
})