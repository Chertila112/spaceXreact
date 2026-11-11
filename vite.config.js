import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const launchLibraryProxy = {
  '/api/launch-library': {
    target: 'https://lldev.thespacedevs.com',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api\/launch-library/, ''),
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: launchLibraryProxy,
  },
  preview: {
    proxy: launchLibraryProxy,
  },
})
