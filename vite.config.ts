import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { resolve, dirname } from 'node:path'
import { visualizer } from 'rollup-plugin-visualizer'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    react(),
    visualizer({ open: false, filename: 'dist/stats.html', gzipSize: true, brotliSize: true }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_TARGET ?? 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/react-router-dom/')) return 'react-vendor'
          if (id.includes('/antd/') || id.includes('/@ant-design/')) return 'antd-vendor'
          if (id.includes('/recharts/')) return 'chart-vendor'
          if (id.includes('/react-i18next/') || id.includes('/i18next/')) return 'i18n-vendor'
          if (id.includes('/axios/') || id.includes('/zustand/') || id.includes('/qrcode.react/')) return 'utility-vendor'
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
})
