import { useState, useCallback, useMemo } from 'react';
import {
  Box, Paper, Typography, TextField, Button, IconButton, Tooltip, Tabs, Tab,
  Chip, Snackbar, Switch, FormControlLabel, Checkbox, FormGroup,
} from '@mui/material';
import { ContentCopy, Home, Add, Delete } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'];
const COMMON_HEADERS = ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'X-Api-Key', 'Cache-Control', 'X-CSRF-Token'];

export default function App() {
  const [origins, setOrigins] = useState<string[]>(['http://localhost:3000']);
  const [originInput, setOriginInput] = useState('');
  const [methods, setMethods] = useState<string[]>(['GET', 'POST', 'OPTIONS']);
  const [headers, setHeaders] = useState<string[]>(['Content-Type', 'Authorization']);
  const [headerInput, setHeaderInput] = useState('');
  const [exposedHeaders, setExposedHeaders] = useState<string[]>([]);
  const [exposedInput, setExposedInput] = useState('');
  const [maxAge, setMaxAge] = useState('86400');
  const [credentials, setCredentials] = useState(false);
  const [tab, setTab] = useState(0);
  const [snack, setSnack] = useState('');

  const copy = useCallback((text: string) => { navigator.clipboard.writeText(text); setSnack('Copied!'); }, []);
  const addOrigin = () => { if (originInput.trim() && !origins.includes(originInput.trim())) { setOrigins([...origins, originInput.trim()]); setOriginInput(''); } };
  const addHeader = () => { if (headerInput.trim() && !headers.includes(headerInput.trim())) { setHeaders([...headers, headerInput.trim()]); setHeaderInput(''); } };
  const addExposed = () => { if (exposedInput.trim() && !exposedHeaders.includes(exposedInput.trim())) { setExposedHeaders([...exposedHeaders, exposedInput.trim()]); setExposedInput(''); } };
  const toggleMethod = (m: string) => setMethods(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
  const togglePresetHeader = (h: string) => setHeaders(prev => prev.includes(h) ? prev.filter(x => x !== h) : [...prev, h]);

  const originsStr = origins.join(', ');
  const methodsStr = methods.join(', ');
  const headersStr = headers.join(', ');
  const exposedStr = exposedHeaders.join(', ');

  const configs = useMemo(() => {
    const nginx = `# Nginx CORS Configuration
${origins.length === 1 && origins[0] === '*' ? `add_header 'Access-Control-Allow-Origin' '*' always;` : `# For multiple origins, use map or check $http_origin
set $cors_origin "";
${origins.map(o => `if ($http_origin = "${o}") { set $cors_origin $http_origin; }`).join('\n')}
add_header 'Access-Control-Allow-Origin' $cors_origin always;`}
add_header 'Access-Control-Allow-Methods' '${methodsStr}' always;
add_header 'Access-Control-Allow-Headers' '${headersStr}' always;
${exposedHeaders.length ? `add_header 'Access-Control-Expose-Headers' '${exposedStr}' always;` : ''}
add_header 'Access-Control-Max-Age' ${maxAge} always;
${credentials ? `add_header 'Access-Control-Allow-Credentials' 'true' always;` : ''}

# Handle preflight
if ($request_method = 'OPTIONS') {
    return 204;
}`;

    const apache = `# Apache .htaccess CORS Configuration
<IfModule mod_headers.c>
    ${origins.length === 1 ? `Header set Access-Control-Allow-Origin "${origins[0]}"` : `SetEnvIf Origin "(${origins.map(o => o.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})" CORS_ORIGIN=$0
    Header set Access-Control-Allow-Origin "%{CORS_ORIGIN}e" env=CORS_ORIGIN`}
    Header set Access-Control-Allow-Methods "${methodsStr}"
    Header set Access-Control-Allow-Headers "${headersStr}"
    ${exposedHeaders.length ? `Header set Access-Control-Expose-Headers "${exposedStr}"` : ''}
    Header set Access-Control-Max-Age "${maxAge}"
    ${credentials ? `Header set Access-Control-Allow-Credentials "true"` : ''}
    RewriteEngine On
    RewriteCond %{REQUEST_METHOD} OPTIONS
    RewriteRule ^(.*)$ $1 [R=204,L]
</IfModule>`;

    const express = `// Express.js CORS Configuration
const cors = require('cors');

const corsOptions = {
  origin: ${origins.length === 1 ? `'${origins[0]}'` : `[${origins.map(o => `'${o}'`).join(', ')}]`},
  methods: [${methods.map(m => `'${m}'`).join(', ')}],
  allowedHeaders: [${headers.map(h => `'${h}'`).join(', ')}],
  ${exposedHeaders.length ? `exposedHeaders: [${exposedHeaders.map(h => `'${h}'`).join(', ')}],` : ''}
  maxAge: ${maxAge},
  credentials: ${credentials},
};

app.use(cors(corsOptions));`;

    const spring = `// Spring Boot CORS Configuration
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
            .allowedOrigins(${origins.map(o => `"${o}"`).join(', ')})
            .allowedMethods(${methods.map(m => `"${m}"`).join(', ')})
            .allowedHeaders(${headers.map(h => `"${h}"`).join(', ')})
            ${exposedHeaders.length ? `.exposedHeaders(${exposedHeaders.map(h => `"${h}"`).join(', ')})` : ''}
            .maxAge(${maxAge})
            .allowCredentials(${credentials});
    }
}`;

    const flask = `# Flask CORS Configuration
from flask_cors import CORS

CORS(app,
    origins=[${origins.map(o => `"${o}"`).join(', ')}],
    methods=[${methods.map(m => `"${m}"`).join(', ')}],
    allow_headers=[${headers.map(h => `"${h}"`).join(', ')}],
    ${exposedHeaders.length ? `expose_headers=[${exposedHeaders.map(h => `"${h}"`).join(', ')}],` : ''}
    max_age=${maxAge},
    supports_credentials=${credentials ? 'True' : 'False'},
)`;

    const django = `# Django CORS Settings (django-cors-headers)
# settings.py

INSTALLED_APPS = [
    ...
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    ...
]

CORS_ALLOWED_ORIGINS = [
${origins.map(o => `    "${o}",`).join('\n')}
]

CORS_ALLOW_METHODS = [
${methods.map(m => `    "${m}",`).join('\n')}
]

CORS_ALLOW_HEADERS = [
${headers.map(h => `    "${h.toLowerCase()}",`).join('\n')}
]

${exposedHeaders.length ? `CORS_EXPOSE_HEADERS = [\n${exposedHeaders.map(h => `    "${h}",`).join('\n')}\n]` : ''}
CORS_PREFLIGHT_MAX_AGE = ${maxAge}
CORS_ALLOW_CREDENTIALS = ${credentials ? 'True' : 'False'}`;

    const awsApiGw = `{
  "cors": {
    "allowOrigins": [${origins.map(o => `"${o}"`).join(', ')}],
    "allowMethods": [${methods.map(m => `"${m}"`).join(', ')}],
    "allowHeaders": [${headers.map(h => `"${h}"`).join(', ')}],
    ${exposedHeaders.length ? `"exposeHeaders": [${exposedHeaders.map(h => `"${h}"`).join(', ')}],` : ''}
    "maxAge": ${maxAge},
    "allowCredentials": ${credentials}
  }
}`;

    const cloudflare = `// Cloudflare Workers CORS Handler
function handleCORS(request) {
  const origin = request.headers.get('Origin');
  const allowedOrigins = [${origins.map(o => `'${o}'`).join(', ')}];

  const corsHeaders = {
    'Access-Control-Allow-Methods': '${methodsStr}',
    'Access-Control-Allow-Headers': '${headersStr}',
    ${exposedHeaders.length ? `'Access-Control-Expose-Headers': '${exposedStr}',` : ''}
    'Access-Control-Max-Age': '${maxAge}',
    ${credentials ? `'Access-Control-Allow-Credentials': 'true',` : ''}
  };

  if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
    corsHeaders['Access-Control-Allow-Origin'] = ${origins.includes('*') ? "'*'" : 'origin'};
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  return corsHeaders;
}`;

    return [nginx, apache, express, spring, flask, django, awsApiGw, cloudflare];
  }, [origins, methods, headers, exposedHeaders, maxAge, credentials]);

  const tabLabels = ['Nginx', 'Apache', 'Express.js', 'Spring Boot', 'Flask', 'Django', 'AWS API GW', 'Cloudflare'];
  const sxField = { '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#333' }, '&:hover fieldset': { borderColor: '#555' }, '&.Mui-focused fieldset': { borderColor: '#1976d2' } }, '& .MuiInputLabel-root': { color: 'grey.500' }, '& .MuiInputBase-input': { color: 'grey.300' } };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a', color: 'grey.300', p: 3 }}>
      <Box sx={{ maxWidth: 960, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <Link to="/"><IconButton size="small" sx={{ color: 'grey.500' }}><Home /></IconButton></Link>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>CORS Config Builder</Typography>
        </Box>

        <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 3, mb: 3 }}>
          <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1 }}>Allowed Origins</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
            {origins.map((o, i) => <Chip key={i} label={o} size="small" onDelete={() => setOrigins(origins.filter((_, j) => j !== i))} sx={{ bgcolor: '#1a2332', color: '#90caf9', '& .MuiChip-deleteIcon': { color: '#5a8ab5' } }} />)}
          </Box>
          <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
            <TextField size="small" label="Origin URL" value={originInput} onChange={e => setOriginInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addOrigin()} sx={{ flex: 1, ...sxField }} placeholder="https://example.com or *" />
            <Button size="small" variant="outlined" onClick={addOrigin} sx={{ borderColor: '#333' }}>Add</Button>
          </Box>

          <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1 }}>Allowed Methods</Typography>
          <FormGroup row sx={{ mb: 3 }}>
            {HTTP_METHODS.map(m => (
              <FormControlLabel key={m} control={<Checkbox checked={methods.includes(m)} onChange={() => toggleMethod(m)} size="small" sx={{ color: 'grey.600', '&.Mui-checked': { color: '#1976d2' } }} />} label={<Typography variant="body2" sx={{ color: 'grey.400' }}>{m}</Typography>} />
            ))}
          </FormGroup>

          <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1 }}>Allowed Headers</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
            {COMMON_HEADERS.map(h => <Chip key={h} label={h} size="small" onClick={() => togglePresetHeader(h)} variant={headers.includes(h) ? 'filled' : 'outlined'} sx={{ bgcolor: headers.includes(h) ? '#1a2332' : 'transparent', color: headers.includes(h) ? '#90caf9' : 'grey.600', borderColor: '#333' }} />)}
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
            {headers.filter(h => !COMMON_HEADERS.includes(h)).map((h, i) => <Chip key={i} label={h} size="small" onDelete={() => setHeaders(headers.filter(x => x !== h))} sx={{ bgcolor: '#1a2332', color: '#90caf9', '& .MuiChip-deleteIcon': { color: '#5a8ab5' } }} />)}
          </Box>
          <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
            <TextField size="small" label="Custom Header" value={headerInput} onChange={e => setHeaderInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addHeader()} sx={{ flex: 1, ...sxField }} />
            <Button size="small" variant="outlined" onClick={addHeader} sx={{ borderColor: '#333' }}>Add</Button>
          </Box>

          <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1 }}>Exposed Headers</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
            {exposedHeaders.map((h, i) => <Chip key={i} label={h} size="small" onDelete={() => setExposedHeaders(exposedHeaders.filter((_, j) => j !== i))} sx={{ bgcolor: '#1a2332', color: '#90caf9', '& .MuiChip-deleteIcon': { color: '#5a8ab5' } }} />)}
          </Box>
          <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
            <TextField size="small" label="Exposed Header" value={exposedInput} onChange={e => setExposedInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addExposed()} sx={{ flex: 1, ...sxField }} />
            <Button size="small" variant="outlined" onClick={addExposed} sx={{ borderColor: '#333' }}>Add</Button>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField size="small" label="Max Age (seconds)" value={maxAge} onChange={e => setMaxAge(e.target.value)} type="number" sx={{ width: 180, ...sxField }} />
            <FormControlLabel control={<Switch checked={credentials} onChange={e => setCredentials(e.target.checked)} size="small" />} label={<Typography variant="body2" sx={{ color: 'grey.400' }}>Allow Credentials</Typography>} />
          </Box>
        </Paper>

        <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ '& .MuiTab-root': { color: 'grey.500', fontSize: 12, minWidth: 80, textTransform: 'none' }, '& .Mui-selected': { color: '#90caf9' } }}>
              {tabLabels.map(l => <Tab key={l} label={l} />)}
            </Tabs>
            <Tooltip title="Copy"><IconButton onClick={() => copy(configs[tab])} sx={{ color: 'grey.400' }}><ContentCopy /></IconButton></Tooltip>
          </Box>
          <Box component="pre" sx={{ color: '#81c784', fontFamily: 'monospace', fontSize: 13, overflow: 'auto', maxHeight: 500, whiteSpace: 'pre-wrap', m: 0 }}>
            {configs[tab]}
          </Box>
        </Paper>
      </Box>
      <Snackbar open={!!snack} autoHideDuration={2000} onClose={() => setSnack('')} message={snack} />
    </Box>
  );
}
