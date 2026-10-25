import fs from 'node:fs'
import path from 'node:path'

import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import toml from 'toml'
import { defineConfig } from 'vite'

// TEMPLATE: Rename the env var to match your app, e.g. RIVVY_PAYMENTS_CONFIG_PATH.
const configPath = process.env.RIVVY_EXAMPLE_CONFIG_PATH || path.join('./config.toml')

let tomlConfig = {
  application: {
    environment: '',
    domain: '',
    server: {
      'base-url': '',
    },
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
    tsconfigPaths: true,
  },
  define: {
    'import.meta.env.VITE_ENVIRONMENT': JSON.stringify(
      tomlConfig?.application?.environment || 'development'
    ),
    'process.env': '{}',
  },
  server: {
    allowedHosts: true,
    proxy: {
      '/api/': {
        // TEMPLATE: Update the fallback port to the backend service this app talks to.
        target: tomlConfig?.application?.server?.['base-url'] || 'http://localhost:8001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        headers: {
          // TEMPLATE: Update the fallback domain to match the port in config.template.toml.
          Origin: tomlConfig?.application?.domain || 'http://localhost:3000',
        },
      },
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
})
