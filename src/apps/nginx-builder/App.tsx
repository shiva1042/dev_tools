import { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Switch,
  FormControlLabel,
  Snackbar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  ContentCopy,
  Home,
  Add,
  Delete,
  ExpandMore,
  Download,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

interface Location {
  id: string;
  path: string;
  type: 'static' | 'proxy' | 'redirect' | 'return';
  root?: string;
  proxyPass?: string;
  redirectUrl?: string;
  returnCode?: number;
  returnBody?: string;
  tryFiles?: string;
}

interface ServerBlock {
  id: string;
  listen: number;
  serverName: string;
  ssl: boolean;
  sslCert?: string;
  sslKey?: string;
  root?: string;
  index?: string;
  locations: Location[];
  enableGzip: boolean;
  enableCors: boolean;
  errorPage404?: string;
  accessLog?: string;
}

export default function NginxBuilder() {
  const [servers, setServers] = useState<ServerBlock[]>([{
    id: '1',
    listen: 80,
    serverName: 'example.com',
    ssl: false,
    root: '/var/www/html',
    index: 'index.html index.htm',
    locations: [
      { id: '1', path: '/', type: 'static', tryFiles: '$uri $uri/ /index.html' },
      { id: '2', path: '/api', type: 'proxy', proxyPass: 'http://localhost:3000' },
    ],
    enableGzip: true,
    enableCors: false,
  }]);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({ open: false, message: '' });

  const nginxConfig = useMemo(() => {
    let config = '';

    // Global settings
    config += `# Generated Nginx Configuration

worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    keepalive_timeout 65;

`;

    servers.forEach(server => {
      if (server.enableGzip) {
        config += `    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml;

`;
      }

      config += `    server {
        listen ${server.listen}${server.ssl ? ' ssl http2' : ''};
        server_name ${server.serverName};

`;

      if (server.ssl) {
        config += `        ssl_certificate ${server.sslCert || '/etc/nginx/ssl/cert.pem'};
        ssl_certificate_key ${server.sslKey || '/etc/nginx/ssl/key.pem'};
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
        ssl_prefer_server_ciphers off;

`;
      }

      if (server.root) {
        config += `        root ${server.root};
`;
      }

      if (server.index) {
        config += `        index ${server.index};
`;
      }

      if (server.enableCors) {
        config += `
        # CORS headers
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;

`;
      }

      // Security headers
      config += `
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;

`;

      if (server.errorPage404) {
        config += `        error_page 404 ${server.errorPage404};
`;
      }

      server.locations.forEach(loc => {
        config += `
        location ${loc.path} {
`;
        switch (loc.type) {
          case 'static':
            if (loc.tryFiles) {
              config += `            try_files ${loc.tryFiles};
`;
            }
            break;
          case 'proxy':
            config += `            proxy_pass ${loc.proxyPass};
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
`;
            break;
          case 'redirect':
            config += `            return 301 ${loc.redirectUrl};
`;
            break;
          case 'return':
            config += `            return ${loc.returnCode || 200}${loc.returnBody ? ` '${loc.returnBody}'` : ''};
`;
            break;
        }
        config += `        }
`;
      });

      config += `    }

`;
    });

    config += `}
`;

    return config;
  }, [servers]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(nginxConfig);
    setSnackbar({ open: true, message: 'Copied to clipboard' });
  };

  const handleDownload = () => {
    const blob = new Blob([nginxConfig], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nginx.conf';
    a.click();
    URL.revokeObjectURL(url);
  };

  const addServer = () => {
    setServers([...servers, {
      id: String(Date.now()),
      listen: 80,
      serverName: 'localhost',
      ssl: false,
      root: '/var/www/html',
      index: 'index.html',
      locations: [],
      enableGzip: true,
      enableCors: false,
    }]);
  };

  const removeServer = (id: string) => setServers(servers.filter(s => s.id !== id));

  const updateServer = (id: string, field: keyof ServerBlock, value: unknown) => {
    setServers(servers.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const addLocation = (serverId: string) => {
    setServers(servers.map(s => s.id === serverId ? {
      ...s,
      locations: [...s.locations, { id: String(Date.now()), path: '/new', type: 'static' as const }]
    } : s));
  };

  const removeLocation = (serverId: string, locId: string) => {
    setServers(servers.map(s => s.id === serverId ? {
      ...s,
      locations: s.locations.filter(l => l.id !== locId)
    } : s));
  };

  const updateLocation = (serverId: string, locId: string, field: keyof Location, value: unknown) => {
    setServers(servers.map(s => s.id === serverId ? {
      ...s,
      locations: s.locations.map(l => l.id === locId ? { ...l, [field]: value } : l)
    } : s));
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a' }}>
      <Paper elevation={0} sx={{ bgcolor: '#111', borderBottom: '1px solid #222', px: 3, py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Link to="/"><IconButton size="small" sx={{ color: 'grey.500' }}><Home /></IconButton></Link>
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>Nginx Config Generator</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Download"><IconButton onClick={handleDownload} sx={{ color: 'grey.500' }}><Download /></IconButton></Tooltip>
            <Tooltip title="Copy"><IconButton onClick={handleCopy} sx={{ color: 'grey.500' }}><ContentCopy /></IconButton></Tooltip>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', height: 'calc(100vh - 70px)' }}>
        {/* Builder Panel */}
        <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button startIcon={<Add />} onClick={addServer} sx={{ color: 'grey.400' }}>Add Server Block</Button>
          </Box>

          {servers.map(server => (
            <Accordion key={server.id} defaultExpanded sx={{ bgcolor: '#111', border: '1px solid #222', mb: 2, '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMore sx={{ color: 'grey.500' }} />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <Typography sx={{ color: 'grey.300' }}>{server.serverName}</Typography>
                  <Chip label={`Port ${server.listen}`} size="small" />
                  {server.ssl && <Chip label="SSL" size="small" color="success" />}
                  <Box sx={{ flex: 1 }} />
                  <IconButton size="small" onClick={(e) => { e.stopPropagation(); removeServer(server.id); }} sx={{ color: 'grey.500' }}>
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <TextField size="small" label="Server Name" value={server.serverName} onChange={(e) => updateServer(server.id, 'serverName', e.target.value)} sx={{ flex: 1, '& .MuiInputBase-root': { color: 'grey.300' } }} />
                  <TextField size="small" label="Port" type="number" value={server.listen} onChange={(e) => updateServer(server.id, 'listen', parseInt(e.target.value) || 80)} sx={{ width: 100, '& .MuiInputBase-root': { color: 'grey.300' } }} />
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <TextField size="small" label="Root" value={server.root || ''} onChange={(e) => updateServer(server.id, 'root', e.target.value)} sx={{ flex: 1, '& .MuiInputBase-root': { color: 'grey.300' } }} />
                  <TextField size="small" label="Index" value={server.index || ''} onChange={(e) => updateServer(server.id, 'index', e.target.value)} sx={{ flex: 1, '& .MuiInputBase-root': { color: 'grey.300' } }} />
                </Box>

                <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
                  <FormControlLabel control={<Switch checked={server.ssl} onChange={(e) => updateServer(server.id, 'ssl', e.target.checked)} size="small" />} label={<Typography sx={{ color: 'grey.400', fontSize: 14 }}>SSL/TLS</Typography>} />
                  <FormControlLabel control={<Switch checked={server.enableGzip} onChange={(e) => updateServer(server.id, 'enableGzip', e.target.checked)} size="small" />} label={<Typography sx={{ color: 'grey.400', fontSize: 14 }}>Gzip</Typography>} />
                  <FormControlLabel control={<Switch checked={server.enableCors} onChange={(e) => updateServer(server.id, 'enableCors', e.target.checked)} size="small" />} label={<Typography sx={{ color: 'grey.400', fontSize: 14 }}>CORS</Typography>} />
                </Box>

                {server.ssl && (
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <TextField size="small" label="SSL Certificate" value={server.sslCert || ''} onChange={(e) => updateServer(server.id, 'sslCert', e.target.value)} placeholder="/etc/nginx/ssl/cert.pem" sx={{ flex: 1, '& .MuiInputBase-root': { color: 'grey.300' } }} />
                    <TextField size="small" label="SSL Key" value={server.sslKey || ''} onChange={(e) => updateServer(server.id, 'sslKey', e.target.value)} placeholder="/etc/nginx/ssl/key.pem" sx={{ flex: 1, '& .MuiInputBase-root': { color: 'grey.300' } }} />
                  </Box>
                )}

                <Typography variant="subtitle2" sx={{ color: 'grey.400', mt: 2, mb: 1 }}>Locations</Typography>
                {server.locations.map(loc => (
                  <Paper key={loc.id} sx={{ bgcolor: '#0a0a0a', border: '1px solid #333', p: 2, mb: 1 }}>
                    <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                      <TextField size="small" label="Path" value={loc.path} onChange={(e) => updateLocation(server.id, loc.id, 'path', e.target.value)} sx={{ width: 150, '& .MuiInputBase-root': { color: 'grey.300' } }} />
                      <FormControl size="small" sx={{ width: 130 }}>
                        <InputLabel sx={{ color: 'grey.500' }}>Type</InputLabel>
                        <Select value={loc.type} label="Type" onChange={(e) => updateLocation(server.id, loc.id, 'type', e.target.value)} sx={{ color: 'grey.300' }}>
                          <MenuItem value="static">Static Files</MenuItem>
                          <MenuItem value="proxy">Proxy Pass</MenuItem>
                          <MenuItem value="redirect">Redirect</MenuItem>
                          <MenuItem value="return">Return</MenuItem>
                        </Select>
                      </FormControl>
                      {loc.type === 'static' && (
                        <TextField size="small" label="Try Files" value={loc.tryFiles || ''} onChange={(e) => updateLocation(server.id, loc.id, 'tryFiles', e.target.value)} placeholder="$uri $uri/ /index.html" sx={{ flex: 1, '& .MuiInputBase-root': { color: 'grey.300' } }} />
                      )}
                      {loc.type === 'proxy' && (
                        <TextField size="small" label="Proxy Pass" value={loc.proxyPass || ''} onChange={(e) => updateLocation(server.id, loc.id, 'proxyPass', e.target.value)} placeholder="http://localhost:3000" sx={{ flex: 1, '& .MuiInputBase-root': { color: 'grey.300' } }} />
                      )}
                      {loc.type === 'redirect' && (
                        <TextField size="small" label="Redirect URL" value={loc.redirectUrl || ''} onChange={(e) => updateLocation(server.id, loc.id, 'redirectUrl', e.target.value)} sx={{ flex: 1, '& .MuiInputBase-root': { color: 'grey.300' } }} />
                      )}
                      <IconButton size="small" onClick={() => removeLocation(server.id, loc.id)} sx={{ color: 'grey.500' }}><Delete fontSize="small" /></IconButton>
                    </Box>
                  </Paper>
                ))}
                <Button size="small" startIcon={<Add />} onClick={() => addLocation(server.id)} sx={{ color: 'grey.500' }}>Add Location</Button>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>

        {/* Config Output */}
        <Box sx={{ width: 500, borderLeft: '1px solid #222', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 2, borderBottom: '1px solid #222' }}>
            <Typography variant="subtitle2" sx={{ color: 'grey.400' }}>nginx.conf</Typography>
          </Box>
          <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
            <Paper sx={{ bgcolor: '#0a0a0a', p: 2, border: '1px solid #333', height: '100%' }}>
              <Typography component="pre" sx={{ fontFamily: 'monospace', fontSize: 11, color: '#d4d4d4', m: 0, whiteSpace: 'pre-wrap' }}>
                {nginxConfig}
              </Typography>
            </Paper>
          </Box>
        </Box>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={2000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} />
    </Box>
  );
}
