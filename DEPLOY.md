# Dev Tools Suite - Deployment Guide

A unified suite of developer tools including ArcGIS Map Builder, Elasticsearch Query Designer, Icon Generator Pro, and React Visual Builder.

---

## Quick Start

```bash
# Production deployment (default: 0.0.0.0:8080)
./deploy.sh

# Access at: http://localhost:8080/dev-tools/
```

---

## Prerequisites

- **Node.js** v18+ (for building)
- **Python 3** or **Node.js** (for serving)

Check versions:
```bash
node --version    # Should be v18+
npm --version     # Should be v9+
python3 --version # Optional, for serving
```

---

## Deployment Options

### Option 1: Using Deploy Script (Recommended)

```bash
# Make script executable (first time only)
chmod +x deploy.sh

# Start with defaults (0.0.0.0:8080)
./deploy.sh

# Custom port
./deploy.sh -p 3000

# Custom IP and port
./deploy.sh -i 192.168.1.100 -p 8080

# Force rebuild
./deploy.sh --build

# Show all options
./deploy.sh --help
```

### Option 2: Manual Deployment

```bash
# Step 1: Install dependencies
npm install

# Step 2: Build the project
npm run build

# Step 3: Serve the dist folder
# The app expects to be served at /dev-tools/ path

# Using Python 3:
mkdir -p serve/dev-tools
cp -r dist/* serve/dev-tools/
cd serve
python3 -m http.server 8080 --bind 0.0.0.0

# Using Node.js (npx serve):
npx serve dist -l 8080

# Using nginx (see nginx config below)
```

### Option 3: Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html/dev-tools
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:
```bash
docker build -t dev-tools .
docker run -d -p 8080:80 dev-tools
```

---

## Server Configurations

### Nginx Configuration

```nginx
# /etc/nginx/conf.d/dev-tools.conf

server {
    listen 80;
    server_name your-domain.com;  # Or use IP

    root /var/www/html;
    index index.html;

    # Serve dev-tools at /dev-tools/
    location /dev-tools/ {
        alias /path/to/dev-tools/dist/;
        try_files $uri $uri/ /dev-tools/index.html;
    }

    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
```

Reload nginx:
```bash
sudo nginx -t          # Test config
sudo systemctl reload nginx
```

### Apache Configuration

```apache
# /etc/apache2/sites-available/dev-tools.conf

<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /var/www/html

    Alias /dev-tools /path/to/dev-tools/dist

    <Directory /path/to/dev-tools/dist>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted

        # Handle SPA routing
        RewriteEngine On
        RewriteBase /dev-tools/
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /dev-tools/index.html [L]
    </Directory>
</VirtualHost>
```

Enable and reload:
```bash
sudo a2ensite dev-tools.conf
sudo a2enmod rewrite
sudo systemctl reload apache2
```

---

## Access URLs

After deployment, access the tools at:

| Tool | URL |
|------|-----|
| Home Page | `http://<ip>:<port>/dev-tools/` |
| ArcGIS Map Builder | `http://<ip>:<port>/dev-tools/arcgis-map` |
| ES Query Designer | `http://<ip>:<port>/dev-tools/es-query` |
| Icon Generator | `http://<ip>:<port>/dev-tools/icons-generator` |
| React Visual Builder | `http://<ip>:<port>/dev-tools/visual-builder` |

---

## Development Mode

For development with hot reload:

```bash
# Using script
./start-dev.sh

# Or manually
npm install
npm run dev

# Access at: http://localhost:5173/dev-tools/
```

---

## Build Commands

```bash
npm install      # Install dependencies
npm run dev      # Start dev server (hot reload)
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # Run linter
```

---

## Troubleshooting

### Build fails with memory error

The Icon Generator includes many icon libraries. Increase Node memory:

```bash
# Already configured in package.json, but if needed:
NODE_OPTIONS='--max-old-space-size=8192' npm run build
```

### Port already in use

```bash
# Find process using port
lsof -i :8080

# Kill process
kill -9 <PID>

# Or use different port
./deploy.sh -p 3000
```

### Permission denied on deploy.sh

```bash
chmod +x deploy.sh
chmod +x start-dev.sh
```

### Blank page after deployment

Ensure the base path is correct. The app must be served at `/dev-tools/` path.

Check browser console for errors (F12 > Console).

### Cannot connect to Elasticsearch (ES Query tool)

**CORS / HTTPS Errors:**

The ES Query tool includes a built-in proxy option to bypass CORS and handle HTTPS with self-signed certificates.

**Solution 1: Use the Proxy (Recommended)**

In Development mode:
1. Open Settings (gear icon) in ES Query
2. Enter your ES URL: `https://your-server:9200`
3. Check "Use Proxy (bypass CORS/HTTPS)"
4. Enter username/password if needed
5. Click Connect

In Production mode, start the proxy server:
```bash
# Start the proxy (runs on port 9201)
node es-proxy.js

# Or specify custom port
node es-proxy.js 9201
```

**Solution 2: Configure Elasticsearch CORS**

Add to `elasticsearch.yml`:
```yaml
http.cors.enabled: true
http.cors.allow-origin: "*"
http.cors.allow-headers: X-Requested-With,Content-Type,Content-Length,Authorization
http.cors.allow-credentials: true
http.cors.allow-methods: OPTIONS,HEAD,GET,POST,PUT,DELETE
```

Then restart Elasticsearch.

**Solution 3: Use Nginx as Reverse Proxy**

```nginx
location /elasticsearch/ {
    proxy_pass https://your-es-server:9200/;
    proxy_ssl_verify off;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;

    # CORS headers
    add_header 'Access-Control-Allow-Origin' '*' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE' always;
    add_header 'Access-Control-Allow-Headers' 'Authorization,Content-Type' always;

    if ($request_method = 'OPTIONS') {
        return 204;
    }
}
```

---

## Project Structure

```
dev-tools/
├── deploy.sh           # Production deployment script
├── start-dev.sh        # Development server script
├── package.json        # Dependencies and scripts
├── vite.config.ts      # Vite configuration
├── index.html          # Entry HTML
├── src/
│   ├── main.tsx        # React entry point
│   ├── App.tsx         # Main router
│   ├── pages/
│   │   └── Home.tsx    # Landing page
│   └── apps/
│       ├── arcgis-map/       # ArcGIS Map Builder
│       ├── es-query/         # Elasticsearch Query Designer
│       ├── icons-generator/  # Icon Generator Pro
│       └── visual-builder/   # React Visual Builder
└── dist/               # Production build output
```

---

## Support

For issues or questions, check the browser console for errors and ensure all prerequisites are installed correctly.
