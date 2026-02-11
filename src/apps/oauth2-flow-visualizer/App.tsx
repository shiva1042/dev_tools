import { useState, useCallback } from 'react';
import {
  Box, Paper, Typography, TextField, Button, IconButton, Tooltip, Tabs, Tab,
  Chip, Snackbar, Select, MenuItem, FormControl, InputLabel, Divider,
} from '@mui/material';
import { ContentCopy, Home } from '@mui/icons-material';
import { Link } from 'react-router-dom';

type FlowType = 'auth_code' | 'auth_code_pkce' | 'client_credentials' | 'implicit' | 'ropc' | 'device_code';

interface FlowStep { from: string; to: string; label: string; description: string; request: string; response: string; }

const FLOWS: Record<FlowType, { name: string; deprecated?: boolean; description: string }> = {
  auth_code: { name: 'Authorization Code', description: 'Standard flow for server-side apps. Most secure for confidential clients.' },
  auth_code_pkce: { name: 'Authorization Code + PKCE', description: 'Recommended for SPAs and mobile apps. Uses code verifier/challenge instead of client secret.' },
  client_credentials: { name: 'Client Credentials', description: 'Machine-to-machine authentication. No user interaction required.' },
  implicit: { name: 'Implicit (Deprecated)', deprecated: true, description: 'Legacy flow for SPAs. Tokens returned directly in URL fragment. Use PKCE instead.' },
  ropc: { name: 'Resource Owner Password (Deprecated)', deprecated: true, description: 'User provides credentials directly. Only for trusted first-party apps.' },
  device_code: { name: 'Device Code', description: 'For input-constrained devices (TVs, CLI tools). User authorizes on a separate device.' },
};

const ACTORS = ['Client App', 'User/Browser', 'Auth Server', 'Resource Server'];
const ACTOR_COLORS: Record<string, string> = { 'Client App': '#1565c0', 'User/Browser': '#2e7d32', 'Auth Server': '#e65100', 'Resource Server': '#6a1b9a' };

export default function App() {
  const [flow, setFlow] = useState<FlowType>('auth_code');
  const [clientId, setClientId] = useState('my-client-id');
  const [redirectUri, setRedirectUri] = useState('http://localhost:3000/callback');
  const [scopes, setScopes] = useState('openid profile email');
  const [authUrl, setAuthUrl] = useState('https://auth.example.com');
  const [codeTab, setCodeTab] = useState(0);
  const [snack, setSnack] = useState('');

  const copy = useCallback((t: string) => { navigator.clipboard.writeText(t); setSnack('Copied!'); }, []);

  const codeVerifier = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';
  const codeChallenge = 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM';

  const buildSteps = (): FlowStep[] => {
    const base = `${authUrl}/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&state=random_state_value`;
    switch (flow) {
      case 'auth_code': return [
        { from: 'Client App', to: 'User/Browser', label: '1. Redirect to Auth Server', description: 'Client redirects user to authorization endpoint', request: `GET ${base}`, response: 'HTTP 302 Redirect to Auth Server login page' },
        { from: 'User/Browser', to: 'Auth Server', label: '2. User Authenticates', description: 'User enters credentials and consents', request: 'User submits login form to Auth Server', response: `HTTP 302 Location: ${redirectUri}?code=AUTH_CODE_HERE&state=random_state_value` },
        { from: 'Auth Server', to: 'Client App', label: '3. Authorization Code Returned', description: 'Auth server redirects back with authorization code', request: `GET ${redirectUri}?code=AUTH_CODE_HERE&state=random_state_value`, response: 'Client receives the authorization code' },
        { from: 'Client App', to: 'Auth Server', label: '4. Exchange Code for Tokens', description: 'Client exchanges authorization code for tokens (server-side)', request: `POST ${authUrl}/token\nContent-Type: application/x-www-form-urlencoded\n\ngrant_type=authorization_code\n&code=AUTH_CODE_HERE\n&redirect_uri=${redirectUri}\n&client_id=${clientId}\n&client_secret=CLIENT_SECRET`, response: `{\n  "access_token": "eyJhbG...",\n  "token_type": "Bearer",\n  "expires_in": 3600,\n  "refresh_token": "dGhpcyBpcyBh...",\n  "id_token": "eyJhbG..."\n}` },
        { from: 'Client App', to: 'Resource Server', label: '5. Access Protected Resource', description: 'Use access token to call API', request: `GET https://api.example.com/userinfo\nAuthorization: Bearer eyJhbG...`, response: `{\n  "sub": "user123",\n  "name": "John Doe",\n  "email": "john@example.com"\n}` },
      ];
      case 'auth_code_pkce': return [
        { from: 'Client App', to: 'Client App', label: '1. Generate PKCE Codes', description: 'Generate code_verifier and code_challenge', request: `code_verifier = "${codeVerifier}"\ncode_challenge = BASE64URL(SHA256(code_verifier))\n  = "${codeChallenge}"`, response: 'Stored locally in client app' },
        { from: 'Client App', to: 'User/Browser', label: '2. Redirect to Auth Server', description: 'Redirect with PKCE challenge', request: `GET ${base}&code_challenge=${codeChallenge}&code_challenge_method=S256`, response: 'HTTP 302 Redirect to Auth Server' },
        { from: 'User/Browser', to: 'Auth Server', label: '3. User Authenticates', description: 'User logs in and consents', request: 'User submits credentials', response: `HTTP 302 Location: ${redirectUri}?code=AUTH_CODE&state=random_state_value` },
        { from: 'Client App', to: 'Auth Server', label: '4. Exchange Code + Verifier', description: 'Exchange code with verifier (no client_secret needed)', request: `POST ${authUrl}/token\nContent-Type: application/x-www-form-urlencoded\n\ngrant_type=authorization_code\n&code=AUTH_CODE\n&redirect_uri=${redirectUri}\n&client_id=${clientId}\n&code_verifier=${codeVerifier}`, response: `{\n  "access_token": "eyJhbG...",\n  "token_type": "Bearer",\n  "expires_in": 3600,\n  "refresh_token": "dGhpcyBpcyBh..."\n}` },
        { from: 'Client App', to: 'Resource Server', label: '5. Access Resource', description: 'Call API with access token', request: `GET https://api.example.com/resource\nAuthorization: Bearer eyJhbG...`, response: '{ "data": "protected resource" }' },
      ];
      case 'client_credentials': return [
        { from: 'Client App', to: 'Auth Server', label: '1. Request Token', description: 'Client authenticates directly with credentials', request: `POST ${authUrl}/token\nContent-Type: application/x-www-form-urlencoded\n\ngrant_type=client_credentials\n&client_id=${clientId}\n&client_secret=CLIENT_SECRET\n&scope=${encodeURIComponent(scopes)}`, response: `{\n  "access_token": "eyJhbG...",\n  "token_type": "Bearer",\n  "expires_in": 3600\n}` },
        { from: 'Client App', to: 'Resource Server', label: '2. Access Resource', description: 'Use token to access API', request: `GET https://api.example.com/resource\nAuthorization: Bearer eyJhbG...`, response: '{ "data": "protected resource" }' },
      ];
      case 'implicit': return [
        { from: 'Client App', to: 'User/Browser', label: '1. Redirect to Auth Server', description: 'Token returned directly (no code exchange)', request: `GET ${authUrl}/authorize?response_type=token&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&state=random_state`, response: 'HTTP 302 to Auth Server' },
        { from: 'User/Browser', to: 'Auth Server', label: '2. User Authenticates', description: 'User logs in', request: 'User submits credentials', response: `HTTP 302 Location: ${redirectUri}#access_token=eyJhbG...&token_type=Bearer&expires_in=3600&state=random_state` },
        { from: 'Auth Server', to: 'Client App', label: '3. Token in Fragment', description: 'Token is in URL fragment (never sent to server)', request: `${redirectUri}#access_token=eyJhbG...`, response: 'Client extracts token from window.location.hash' },
      ];
      case 'ropc': return [
        { from: 'User/Browser', to: 'Client App', label: '1. User Provides Credentials', description: 'User enters credentials directly in client app', request: 'username: john@example.com\npassword: ********', response: 'Credentials stored temporarily in client' },
        { from: 'Client App', to: 'Auth Server', label: '2. Exchange Credentials for Tokens', description: 'Client sends credentials to token endpoint', request: `POST ${authUrl}/token\nContent-Type: application/x-www-form-urlencoded\n\ngrant_type=password\n&username=john@example.com\n&password=user_password\n&client_id=${clientId}\n&scope=${encodeURIComponent(scopes)}`, response: `{\n  "access_token": "eyJhbG...",\n  "token_type": "Bearer",\n  "expires_in": 3600,\n  "refresh_token": "dGhpcyBpcyBh..."\n}` },
      ];
      case 'device_code': return [
        { from: 'Client App', to: 'Auth Server', label: '1. Request Device Code', description: 'Device requests a user code', request: `POST ${authUrl}/device/code\nContent-Type: application/x-www-form-urlencoded\n\nclient_id=${clientId}&scope=${encodeURIComponent(scopes)}`, response: `{\n  "device_code": "GmRhmhcxhwAzkoEqiMEg_DnyEysNkuNhszIySk9eS",\n  "user_code": "WDJB-MJHT",\n  "verification_uri": "${authUrl}/device",\n  "expires_in": 1800,\n  "interval": 5\n}` },
        { from: 'Client App', to: 'User/Browser', label: '2. Display User Code', description: 'Show code and URL to user', request: `Go to: ${authUrl}/device\nEnter code: WDJB-MJHT`, response: 'User opens URL on phone/computer' },
        { from: 'User/Browser', to: 'Auth Server', label: '3. User Authorizes', description: 'User enters code and authorizes', request: 'User enters WDJB-MJHT and logs in', response: 'Authorization granted' },
        { from: 'Client App', to: 'Auth Server', label: '4. Poll for Token', description: 'Device polls token endpoint', request: `POST ${authUrl}/token\nContent-Type: application/x-www-form-urlencoded\n\ngrant_type=urn:ietf:params:oauth:grant-type:device_code\n&device_code=GmRhmhcxhwAzkoEqiMEg_DnyEysNkuNhszIySk9eS\n&client_id=${clientId}`, response: `{\n  "access_token": "eyJhbG...",\n  "token_type": "Bearer",\n  "expires_in": 3600\n}` },
      ];
    }
  };

  const steps = buildSteps();

  const codeExamples = (f: FlowType): string[] => {
    const nodeEx: Record<FlowType, string> = {
      auth_code: `// Node.js - Authorization Code Flow
const express = require('express');
const axios = require('axios');
const app = express();

app.get('/login', (req, res) => {
  const url = '${authUrl}/authorize?' + new URLSearchParams({
    response_type: 'code', client_id: '${clientId}',
    redirect_uri: '${redirectUri}', scope: '${scopes}',
    state: crypto.randomBytes(16).toString('hex'),
  });
  res.redirect(url);
});

app.get('/callback', async (req, res) => {
  const { code, state } = req.query;
  const { data } = await axios.post('${authUrl}/token', new URLSearchParams({
    grant_type: 'authorization_code', code,
    redirect_uri: '${redirectUri}', client_id: '${clientId}',
    client_secret: process.env.CLIENT_SECRET,
  }));
  res.json({ access_token: data.access_token });
});`,
      auth_code_pkce: `// Node.js - PKCE Flow
const crypto = require('crypto');
function generatePKCE() {
  const verifier = crypto.randomBytes(32).toString('base64url');
  const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');
  return { verifier, challenge };
}

app.get('/login', (req, res) => {
  const { verifier, challenge } = generatePKCE();
  req.session.codeVerifier = verifier;
  const url = '${authUrl}/authorize?' + new URLSearchParams({
    response_type: 'code', client_id: '${clientId}',
    redirect_uri: '${redirectUri}', scope: '${scopes}',
    code_challenge: challenge, code_challenge_method: 'S256',
  });
  res.redirect(url);
});

app.get('/callback', async (req, res) => {
  const { data } = await axios.post('${authUrl}/token', new URLSearchParams({
    grant_type: 'authorization_code', code: req.query.code,
    redirect_uri: '${redirectUri}', client_id: '${clientId}',
    code_verifier: req.session.codeVerifier,
  }));
  res.json(data);
});`,
      client_credentials: `// Node.js - Client Credentials
const axios = require('axios');
async function getToken() {
  const { data } = await axios.post('${authUrl}/token', new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: '${clientId}',
    client_secret: process.env.CLIENT_SECRET,
    scope: '${scopes}',
  }));
  return data.access_token;
}`,
      implicit: `// JavaScript SPA - Implicit Flow (Deprecated)
function login() {
  window.location.href = '${authUrl}/authorize?' + new URLSearchParams({
    response_type: 'token', client_id: '${clientId}',
    redirect_uri: '${redirectUri}', scope: '${scopes}',
  });
}
function handleCallback() {
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  return params.get('access_token');
}`,
      ropc: `// Node.js - ROPC Flow (Deprecated)
async function login(username, password) {
  const { data } = await axios.post('${authUrl}/token', new URLSearchParams({
    grant_type: 'password', username, password,
    client_id: '${clientId}', scope: '${scopes}',
  }));
  return data;
}`,
      device_code: `// Node.js - Device Code Flow
async function deviceFlow() {
  const { data: device } = await axios.post('${authUrl}/device/code', new URLSearchParams({
    client_id: '${clientId}', scope: '${scopes}',
  }));
  console.log(\`Go to \${device.verification_uri} and enter: \${device.user_code}\`);
  while (true) {
    await new Promise(r => setTimeout(r, device.interval * 1000));
    try {
      const { data } = await axios.post('${authUrl}/token', new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
        device_code: device.device_code, client_id: '${clientId}',
      }));
      return data.access_token;
    } catch (e) { if (e.response?.data?.error !== 'authorization_pending') throw e; }
  }
}`,
    };
    const pyEx: Record<FlowType, string> = {
      auth_code: `# Python - Authorization Code Flow
import requests
from flask import Flask, redirect, request

app = Flask(__name__)

@app.route('/login')
def login():
    return redirect(f'${authUrl}/authorize?response_type=code&client_id=${clientId}'
                    f'&redirect_uri=${redirectUri}&scope=${scopes}')

@app.route('/callback')
def callback():
    code = request.args.get('code')
    resp = requests.post('${authUrl}/token', data={
        'grant_type': 'authorization_code', 'code': code,
        'redirect_uri': '${redirectUri}', 'client_id': '${clientId}',
        'client_secret': os.environ['CLIENT_SECRET'],
    })
    return resp.json()`,
      auth_code_pkce: `# Python - PKCE Flow
import hashlib, base64, secrets
def generate_pkce():
    verifier = secrets.token_urlsafe(32)
    challenge = base64.urlsafe_b64encode(
        hashlib.sha256(verifier.encode()).digest()
    ).rstrip(b'=').decode()
    return verifier, challenge`,
      client_credentials: `# Python - Client Credentials
resp = requests.post('${authUrl}/token', data={
    'grant_type': 'client_credentials',
    'client_id': '${clientId}',
    'client_secret': os.environ['CLIENT_SECRET'],
    'scope': '${scopes}',
})
token = resp.json()['access_token']`,
      implicit: '# Implicit flow is browser-only; not applicable to Python servers.',
      ropc: `# Python - ROPC (Deprecated)
resp = requests.post('${authUrl}/token', data={
    'grant_type': 'password',
    'username': username, 'password': password,
    'client_id': '${clientId}', 'scope': '${scopes}',
})`,
      device_code: `# Python - Device Code Flow
import time, requests
resp = requests.post('${authUrl}/device/code', data={
    'client_id': '${clientId}', 'scope': '${scopes}'
}).json()
print(f"Go to {resp['verification_uri']} and enter: {resp['user_code']}")
while True:
    time.sleep(resp['interval'])
    token_resp = requests.post('${authUrl}/token', data={
        'grant_type': 'urn:ietf:params:oauth:grant-type:device_code',
        'device_code': resp['device_code'], 'client_id': '${clientId}',
    }).json()
    if 'access_token' in token_resp: break`,
    };
    return [nodeEx[f], pyEx[f]];
  };

  const codes = codeExamples(flow);
  const sxField = { '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#333' }, '&:hover fieldset': { borderColor: '#555' }, '&.Mui-focused fieldset': { borderColor: '#1976d2' } }, '& .MuiInputLabel-root': { color: 'grey.500' }, '& .MuiInputBase-input': { color: 'grey.300' }, '& .MuiSelect-icon': { color: 'grey.500' } };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a', color: 'grey.300', p: 3 }}>
      <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <Link to="/"><IconButton size="small" sx={{ color: 'grey.500' }}><Home /></IconButton></Link>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>OAuth2 Flow Visualizer</Typography>
        </Box>

        <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
            <FormControl size="small" sx={{ minWidth: 260, ...sxField }}>
              <InputLabel sx={{ color: 'grey.500' }}>OAuth2 Flow</InputLabel>
              <Select value={flow} label="OAuth2 Flow" onChange={e => setFlow(e.target.value as FlowType)} sx={{ color: 'grey.300' }}>
                {Object.entries(FLOWS).map(([k, v]) => <MenuItem key={k} value={k}>{v.name}</MenuItem>)}
              </Select>
            </FormControl>
            {FLOWS[flow].deprecated && <Chip label="DEPRECATED" size="small" color="warning" />}
          </Box>
          <Typography variant="body2" sx={{ color: 'grey.500', mb: 2 }}>{FLOWS[flow].description}</Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField size="small" label="Client ID" value={clientId} onChange={e => setClientId(e.target.value)} sx={{ flex: 1, minWidth: 200, ...sxField }} />
            <TextField size="small" label="Redirect URI" value={redirectUri} onChange={e => setRedirectUri(e.target.value)} sx={{ flex: 1, minWidth: 250, ...sxField }} />
            <TextField size="small" label="Scopes" value={scopes} onChange={e => setScopes(e.target.value)} sx={{ flex: 1, minWidth: 200, ...sxField }} />
            <TextField size="small" label="Auth Server URL" value={authUrl} onChange={e => setAuthUrl(e.target.value)} sx={{ flex: 1, minWidth: 250, ...sxField }} />
          </Box>
        </Paper>

        <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 3, mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Flow Diagram</Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            {ACTORS.map(a => <Box key={a} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: ACTOR_COLORS[a] }} /><Typography variant="caption" sx={{ color: 'grey.400' }}>{a}</Typography></Box>)}
          </Box>
          {steps.map((step, i) => (
            <Box key={i} sx={{ mb: 3, pl: 2, borderLeft: `3px solid ${ACTOR_COLORS[step.from]}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Chip label={step.from} size="small" sx={{ bgcolor: ACTOR_COLORS[step.from], color: '#fff', fontSize: 11 }} />
                <Typography variant="caption" sx={{ color: 'grey.600' }}>-&gt;</Typography>
                <Chip label={step.to} size="small" sx={{ bgcolor: ACTOR_COLORS[step.to], color: '#fff', fontSize: 11 }} />
                <Typography variant="subtitle2" sx={{ color: 'grey.300' }}>{step.label}</Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'grey.500', mb: 1 }}>{step.description}</Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: 1, minWidth: 250 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ color: 'grey.600' }}>Request</Typography>
                    <IconButton size="small" onClick={() => copy(step.request)} sx={{ color: 'grey.600' }}><ContentCopy sx={{ fontSize: 14 }} /></IconButton>
                  </Box>
                  <Box component="pre" sx={{ bgcolor: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 1, p: 1, color: '#90caf9', fontSize: 11, fontFamily: 'monospace', whiteSpace: 'pre-wrap', overflow: 'auto', maxHeight: 150, m: 0 }}>{step.request}</Box>
                </Box>
                <Box sx={{ flex: 1, minWidth: 250 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ color: 'grey.600' }}>Response</Typography>
                    <IconButton size="small" onClick={() => copy(step.response)} sx={{ color: 'grey.600' }}><ContentCopy sx={{ fontSize: 14 }} /></IconButton>
                  </Box>
                  <Box component="pre" sx={{ bgcolor: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 1, p: 1, color: '#81c784', fontSize: 11, fontFamily: 'monospace', whiteSpace: 'pre-wrap', overflow: 'auto', maxHeight: 150, m: 0 }}>{step.response}</Box>
                </Box>
              </Box>
            </Box>
          ))}
        </Paper>

        <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Tabs value={codeTab} onChange={(_, v) => setCodeTab(v)} sx={{ '& .MuiTab-root': { color: 'grey.500', fontSize: 12, textTransform: 'none' }, '& .Mui-selected': { color: '#90caf9' } }}>
              <Tab label="Node.js" /><Tab label="Python" />
            </Tabs>
            <Tooltip title="Copy"><IconButton onClick={() => copy(codes[codeTab])} sx={{ color: 'grey.400' }}><ContentCopy /></IconButton></Tooltip>
          </Box>
          <Box component="pre" sx={{ color: '#ce93d8', fontFamily: 'monospace', fontSize: 12, overflow: 'auto', maxHeight: 500, whiteSpace: 'pre-wrap', m: 0, mt: 1 }}>{codes[codeTab]}</Box>
        </Paper>
      </Box>
      <Snackbar open={!!snack} autoHideDuration={2000} onClose={() => setSnack('')} message={snack} />
    </Box>
  );
}
