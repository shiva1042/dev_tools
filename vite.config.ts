import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import http from 'http'
import https from 'https'
import type { IncomingMessage, ServerResponse } from 'http'

// Custom ES proxy middleware that properly handles dynamic target URLs
function esProxyMiddleware(req: IncomingMessage, res: ServerResponse) {
  // Get target URL from header or use default
  const targetUrl = (req.headers['x-es-target'] as string) || 'https://localhost:9200';

  // Rewrite path - remove /api/es prefix
  const targetPath = req.url?.replace(/^\/api\/es/, '') || '/';

  // Normalize the target URL - add protocol if missing
  let normalizedTargetUrl = targetUrl.trim();
  if (normalizedTargetUrl && !normalizedTargetUrl.match(/^https?:\/\//i)) {
    const isLocalhost = normalizedTargetUrl.startsWith('localhost') || normalizedTargetUrl.startsWith('127.0.0.1');
    normalizedTargetUrl = (isLocalhost ? 'http://' : 'https://') + normalizedTargetUrl;
  }

  let target: URL;
  try {
    target = new URL(normalizedTargetUrl);
  } catch (e) {
    console.error(`[ES Proxy] Invalid target URL: "${targetUrl}" (normalized: "${normalizedTargetUrl}")`);
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: 'Invalid target URL',
      message: `Could not parse URL: "${targetUrl}". Use format like https://hostname:9200`,
      received: targetUrl,
    }));
    return;
  }

  const isHttps = target.protocol === 'https:';
  const client = isHttps ? https : http;

  // Build request options
  const options: http.RequestOptions | https.RequestOptions = {
    hostname: target.hostname,
    port: target.port || (isHttps ? 443 : 9200),
    path: targetPath,
    method: req.method,
    headers: { ...req.headers },
    rejectUnauthorized: false, // Allow self-signed certs
  };

  // Clean up headers
  delete (options.headers as any)['x-es-target'];
  delete (options.headers as any)['host'];
  (options.headers as any)['host'] = target.host;

  console.log(`[ES Proxy] ${req.method} ${normalizedTargetUrl}${targetPath}`);

  const proxyReq = client.request(options, (proxyRes) => {
    // Set CORS headers
    const headers = { ...proxyRes.headers };
    headers['access-control-allow-origin'] = '*';
    headers['access-control-allow-methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    headers['access-control-allow-headers'] = 'Content-Type, Authorization, X-ES-Target';

    console.log(`[ES Proxy] Response: ${proxyRes.statusCode} from ${normalizedTargetUrl}${targetPath}`);
    res.writeHead(proxyRes.statusCode || 200, headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err: NodeJS.ErrnoException) => {
    console.error(`[ES Proxy] Connection error to ${normalizedTargetUrl}: ${err.message}`);

    let userMessage = err.message;
    // Provide more helpful error messages for common issues
    if (err.code === 'ECONNREFUSED') {
      userMessage = `Connection refused. Make sure Elasticsearch is running at ${target.hostname}:${target.port || (isHttps ? 443 : 9200)}`;
    } else if (err.code === 'ENOTFOUND') {
      userMessage = `Host not found: ${target.hostname}. Check the hostname is correct and DNS is resolving.`;
    } else if (err.code === 'ETIMEDOUT') {
      userMessage = `Connection timed out. The server at ${target.hostname} may be unreachable or blocked by a firewall.`;
    } else if (err.code === 'ECONNRESET') {
      userMessage = `Connection reset by server. The server may have rejected the connection or SSL handshake failed.`;
    } else if (err.code === 'CERT_HAS_EXPIRED' || err.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
      userMessage = `SSL certificate error: ${err.message}. The proxy is configured to accept self-signed certs, but other cert issues may occur.`;
    }

    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: 'Proxy Error',
      message: userMessage,
      code: err.code,
      target: normalizedTargetUrl
    }));
  });

  req.pipe(proxyReq);
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'es-proxy',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url?.startsWith('/api/es')) {
            // Handle CORS preflight
            if (req.method === 'OPTIONS') {
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
              res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-ES-Target');
              res.writeHead(204);
              res.end();
              return;
            }
            esProxyMiddleware(req, res);
          } else {
            next();
          }
        });
      },
    },
  ],
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
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
