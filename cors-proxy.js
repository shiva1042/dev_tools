#!/usr/bin/env node

/**
 * Simple CORS Proxy for Elasticsearch
 *
 * Usage:
 *   node cors-proxy.js <ES_URL> [PORT]
 *
 * Examples:
 *   node cors-proxy.js https://192.168.1.100:9200
 *   node cors-proxy.js https://localhost:9200 9201
 *
 * Then use http://localhost:9201 in ES Query tool instead of your ES URL
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');

// Get ES URL from command line
const ES_URL = process.argv[2];
const PORT = process.argv[3] || 9201;

if (!ES_URL) {
  console.log('Usage: node cors-proxy.js <ES_URL> [PORT]');
  console.log('');
  console.log('Examples:');
  console.log('  node cors-proxy.js https://192.168.1.100:9200');
  console.log('  node cors-proxy.js https://localhost:9200 9201');
  process.exit(1);
}

const target = new URL(ES_URL);
const isHttps = target.protocol === 'https:';
const client = isHttps ? https : http;

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const options = {
    hostname: target.hostname,
    port: target.port || (isHttps ? 443 : 9200),
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: target.host },
    rejectUnauthorized: false, // Allow self-signed certs
  };

  delete options.headers['origin'];
  delete options.headers['referer'];

  console.log(`${req.method} ${req.url}`);

  const proxy = client.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, {
      ...proxyRes.headers,
      'access-control-allow-origin': '*',
    });
    proxyRes.pipe(res);
  });

  proxy.on('error', (e) => {
    console.error('Error:', e.message);
    res.writeHead(502);
    res.end('Proxy Error: ' + e.message);
  });

  req.pipe(proxy);
});

server.listen(PORT, () => {
  console.log('');
  console.log('='.repeat(50));
  console.log('  CORS Proxy for Elasticsearch');
  console.log('='.repeat(50));
  console.log(`  Target:  ${ES_URL}`);
  console.log(`  Proxy:   http://localhost:${PORT}`);
  console.log('');
  console.log('  Use http://localhost:' + PORT + ' in ES Query tool');
  console.log('='.repeat(50));
  console.log('');
});
