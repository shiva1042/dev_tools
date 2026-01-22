import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/dev-tools/',
  optimizeDeps: {
    include: ['monaco-editor'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@arcgis-map': path.resolve(__dirname, './src/apps/arcgis-map'),
      '@es-query': path.resolve(__dirname, './src/apps/es-query'),
      '@icons-gen': path.resolve(__dirname, './src/apps/icons-generator'),
      '@visual-builder': path.resolve(__dirname, './src/apps/visual-builder'),
    },
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      // Proxy for Elasticsearch to bypass CORS
      '/api/es': {
        target: 'https://localhost:9200',
        changeOrigin: true,
        secure: false, // Allow self-signed certificates
        rewrite: (path) => path.replace(/^\/api\/es/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            // Get target URL from header
            const targetUrl = req.headers['x-es-target'] as string;
            if (targetUrl) {
              try {
                const url = new URL(targetUrl);
                proxyReq.setHeader('host', url.host);
                // Update the proxy target dynamically
                (proxyReq as any).agent = url.protocol === 'https:'
                  ? new (require('https').Agent)({ rejectUnauthorized: false })
                  : undefined;
              } catch (e) {
                console.error('Invalid ES target URL:', targetUrl);
              }
            }
            // Remove custom header before forwarding
            proxyReq.removeHeader('x-es-target');
          });
          proxy.on('error', (err, _req, res) => {
            console.error('Proxy error:', err.message);
            if (res && 'writeHead' in res) {
              res.writeHead(502, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Proxy error', message: err.message }));
            }
          });
        },
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
