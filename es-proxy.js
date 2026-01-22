#!/usr/bin/env node

/**
 * Elasticsearch Proxy Server
 * Bypasses CORS and handles HTTPS with self-signed certificates
 *
 * Usage: node es-proxy.js [port]
 * Default port: 9201
 *
 * Then configure ES Query tool to use: http://localhost:9201
 * The proxy will forward requests to the actual ES URL specified in X-ES-Target header
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');

const PORT = process.argv[2] || 9201;

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-ES-Target');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Get target ES URL from header or query param
  const targetUrl = req.headers['x-es-target'] || 'https://localhost:9200';

  try {
    const target = new URL(targetUrl);
    const isHttps = target.protocol === 'https:';
    const client = isHttps ? https : http;

    const options = {
      hostname: target.hostname,
      port: target.port || (isHttps ? 443 : 9200),
      path: req.url,
      method: req.method,
      headers: { ...req.headers },
      rejectUnauthorized: false, // Allow self-signed certs
    };

    // Remove proxy-specific headers
    delete options.headers['x-es-target'];
    delete options.headers['host'];
    options.headers['host'] = target.host;

    console.log(`[${new Date().toISOString()}] ${req.method} ${targetUrl}${req.url}`);

    const proxyReq = client.request(options, (proxyRes) => {
      // Forward response headers with CORS
      const headers = { ...proxyRes.headers };
      headers['access-control-allow-origin'] = '*';

      res.writeHead(proxyRes.statusCode, headers);
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      console.error('Proxy error:', err.message);
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'Proxy Error',
        message: err.message,
        target: targetUrl,
      }));
    });

    req.pipe(proxyReq);

  } catch (err) {
    console.error('Invalid target URL:', err.message);
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: 'Invalid Target URL',
      message: err.message,
    }));
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('============================================');
  console.log('  Elasticsearch CORS Proxy Server');
  console.log('============================================');
  console.log(`  Listening on: http://0.0.0.0:${PORT}`);
  console.log('');
  console.log('  Usage in ES Query tool:');
  console.log(`    1. Set ES URL to your actual ES: https://your-es:9200`);
  console.log('    2. Enable "Use Proxy" checkbox');
  console.log('');
  console.log('  Or use directly:');
  console.log(`    curl -H "X-ES-Target: https://localhost:9200" http://localhost:${PORT}/_cat/indices`);
  console.log('============================================');
  console.log('');
});
