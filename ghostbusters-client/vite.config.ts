import fs from 'node:fs'
import path from 'node:path'

import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import toml from 'toml'
import { defineConfig } from 'vite'

const configPath = process.env.GHOSTBUSTERS_CONFIG_PATH || path.join('./config.toml')

let tomlConfig = {
  application: {
    environment: '',
    domain: '',
    server: {
      'base-url': '',
    },
  },
  maptiler: {
    'api-key': '',
  },
}

try {
  const tomlContent = fs.readFileSync(configPath, 'utf-8')
  tomlConfig = toml.parse(tomlContent)
} catch (err) {
  console.warn('Could not read config: ', err)
}

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  define: {
    'import.meta.env.VITE_ENVIRONMENT': JSON.stringify(
      tomlConfig?.application?.environment || 'development'
    ),
    'import.meta.env.VITE_MAPTILER_API_KEY': JSON.stringify(
      tomlConfig?.maptiler?.['api-key'] || ''
    ),
    'process.env': '{}',
  },
  server: {
    allowedHosts: true,
    proxy: {
      '/api/': {
        target: tomlConfig?.application?.server?.['base-url'] || 'http://localhost:8001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        headers: {
          Origin: tomlConfig?.application?.domain || 'http://localhost:3000',
        },
      },
    },
  },
  optimizeDeps: {
    exclude: ['maplibre-gl'],
  },
  plugins: [
    react(),
    tailwindcss(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
})
