import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Button, IconButton, Tooltip, Snackbar, Chip,
  Switch, FormControlLabel, Select, MenuItem, FormControl, InputLabel, Accordion,
  AccordionSummary, AccordionDetails,
} from '@mui/material';
import { Home, ContentCopy, Add, Delete, ExpandMore } from '@mui/icons-material';

interface RedirectRule { from: string; to: string; code: 301 | 302 }
interface RewriteRule { cond: string; pattern: string; target: string; flags: string }
interface ErrorPage { code: number; page: string }

const tfSx = {
  '& .MuiInputBase-root': { bgcolor: '#0a0a0a', color: 'grey.300', fontFamily: 'monospace', fontSize: 13 },
  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
};
const selSx = { ...tfSx, minWidth: 100 };

export default function App() {
  const [redirects, setRedirects] = useState<RedirectRule[]>([{ from: '/old-page', to: '/new-page', code: 301 }]);
  const [rewrites, setRewrites] = useState<RewriteRule[]>([{ cond: '%{HTTPS} off', pattern: '^(.*)$', target: 'https://%{HTTP_HOST}%{REQUEST_URI}', flags: 'L,R=301' }]);
  const [errorPages, setErrorPages] = useState<ErrorPage[]>([{ code: 404, page: '/404.html' }, { code: 500, page: '/500.html' }]);
  const [denyIps, setDenyIps] = useState('');
  const [passwordProtect, setPasswordProtect] = useState(false);
  const [authName, setAuthName] = useState('Restricted Area');
  const [authUserFile, setAuthUserFile] = useState('/path/to/.htpasswd');
  const [disableDirListing, setDisableDirListing] = useState(true);
  const [preventHotlinking, setPreventHotlinking] = useState(false);
  const [hotlinkDomain, setHotlinkDomain] = useState('example.com');
  const [blockAgents, setBlockAgents] = useState('');
  const [cacheImages, setCacheImages] = useState('2592000');
  const [cacheCss, setCacheCss] = useState('604800');
  const [cacheJs, setCacheJs] = useState('604800');
  const [cacheFonts, setCacheFonts] = useState('2592000');
  const [enableCompression, setEnableCompression] = useState(true);
  const [forceHttps, setForceHttps] = useState(true);
  const [wwwRedirect, setWwwRedirect] = useState<'' | 'add' | 'remove'>('');
  const [corsOrigin, setCorsOrigin] = useState('');
  const [snackOpen, setSnackOpen] = useState(false);

  const generate = (): string => {
    const lines: string[] = [];
    const add = (s: string) => lines.push(s);
    const blank = () => lines.push('');

    // Force HTTPS
    if (forceHttps) {
      add('# Force HTTPS');
      add('RewriteEngine On');
      add('RewriteCond %{HTTPS} off');
      add('RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]');
      blank();
    }

    // WWW Redirect
    if (wwwRedirect === 'add') {
      add('# Redirect non-www to www');
      add('RewriteEngine On');
      add('RewriteCond %{HTTP_HOST} !^www\\. [NC]');
      add('RewriteRule ^(.*)$ https://www.%{HTTP_HOST}/$1 [L,R=301]');
      blank();
    } else if (wwwRedirect === 'remove') {
      add('# Redirect www to non-www');
      add('RewriteEngine On');
      add('RewriteCond %{HTTP_HOST} ^www\\.(.+)$ [NC]');
      add('RewriteRule ^(.*)$ https://%1/$1 [L,R=301]');
      blank();
    }

    // Redirects
    if (redirects.length > 0 && redirects.some(r => r.from && r.to)) {
      add('# Redirects');
      redirects.forEach(r => { if (r.from && r.to) add(`Redirect ${r.code} ${r.from} ${r.to}`); });
      blank();
    }

    // Rewrite Rules
    if (rewrites.length > 0 && rewrites.some(r => r.pattern && r.target)) {
      add('# Rewrite Rules');
      add('RewriteEngine On');
      rewrites.forEach(r => {
        if (r.cond) add(`RewriteCond ${r.cond}`);
        if (r.pattern && r.target) add(`RewriteRule ${r.pattern} ${r.target} [${r.flags || 'L'}]`);
      });
      blank();
    }

    // Security
    if (denyIps || passwordProtect || disableDirListing || preventHotlinking || blockAgents) {
      add('# Security');
      if (disableDirListing) { add('Options -Indexes'); }
      if (denyIps) {
        denyIps.split('\n').filter(Boolean).forEach(ip => add(`Deny from ${ip.trim()}`));
      }
      if (passwordProtect) {
        add(`AuthType Basic`);
        add(`AuthName "${authName}"`);
        add(`AuthUserFile ${authUserFile}`);
        add('Require valid-user');
      }
      if (preventHotlinking) {
        add('RewriteEngine On');
        add(`RewriteCond %{HTTP_REFERER} !^$`);
        add(`RewriteCond %{HTTP_REFERER} !^https?://(www\\.)?${hotlinkDomain.replace('.', '\\.')}/ [NC]`);
        add('RewriteRule \\.(jpg|jpeg|png|gif|svg)$ - [F,NC]');
      }
      if (blockAgents) {
        blockAgents.split('\n').filter(Boolean).forEach(agent => {
          add(`RewriteCond %{HTTP_USER_AGENT} ${agent.trim()} [NC]`);
          add('RewriteRule .* - [F,L]');
        });
      }
      blank();
    }

    // Caching
    if (cacheImages || cacheCss || cacheJs || cacheFonts) {
      add('# Caching');
      add('<IfModule mod_expires.c>');
      add('  ExpiresActive On');
      if (cacheImages) add(`  ExpiresByType image/jpeg "access plus ${cacheImages} seconds"`);
      if (cacheImages) add(`  ExpiresByType image/png "access plus ${cacheImages} seconds"`);
      if (cacheImages) add(`  ExpiresByType image/gif "access plus ${cacheImages} seconds"`);
      if (cacheImages) add(`  ExpiresByType image/svg+xml "access plus ${cacheImages} seconds"`);
      if (cacheCss) add(`  ExpiresByType text/css "access plus ${cacheCss} seconds"`);
      if (cacheJs) add(`  ExpiresByType application/javascript "access plus ${cacheJs} seconds"`);
      if (cacheFonts) add(`  ExpiresByType font/woff2 "access plus ${cacheFonts} seconds"`);
      if (cacheFonts) add(`  ExpiresByType font/woff "access plus ${cacheFonts} seconds"`);
      add('</IfModule>');
      blank();
    }

    // Compression
    if (enableCompression) {
      add('# Compression');
      add('<IfModule mod_deflate.c>');
      add('  AddOutputFilterByType DEFLATE text/html text/plain text/css');
      add('  AddOutputFilterByType DEFLATE application/javascript application/json');
      add('  AddOutputFilterByType DEFLATE application/xml text/xml');
      add('  AddOutputFilterByType DEFLATE image/svg+xml');
      add('  AddOutputFilterByType DEFLATE font/woff font/woff2');
      add('</IfModule>');
      blank();
    }

    // Error Pages
    if (errorPages.length > 0 && errorPages.some(e => e.page)) {
      add('# Custom Error Pages');
      errorPages.forEach(e => { if (e.page) add(`ErrorDocument ${e.code} ${e.page}`); });
      blank();
    }

    // CORS
    if (corsOrigin) {
      add('# CORS Headers');
      add('<IfModule mod_headers.c>');
      add(`  Header set Access-Control-Allow-Origin "${corsOrigin}"`);
      add('  Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"');
      add('  Header set Access-Control-Allow-Headers "Content-Type, Authorization"');
      add('</IfModule>');
      blank();
    }

    return lines.join('\n');
  };

  const copy = () => { navigator.clipboard.writeText(generate()); setSnackOpen(true); };

  const accSx = { bgcolor: '#111', border: '1px solid #222', '&:before': { display: 'none' }, mb: 1, borderRadius: '8px !important' };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a', p: 3 }}>
      <Paper elevation={0} sx={{ bgcolor: '#111', borderBottom: '1px solid #222', px: 3, py: 2, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Link to="/"><IconButton size="small" sx={{ color: 'grey.500' }}><Home /></IconButton></Link>
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>.htaccess Generator</Typography>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', gap: 3 }}>
        <Box sx={{ flex: 1 }}>
          {/* Force HTTPS & WWW */}
          <Accordion defaultExpanded sx={accSx}>
            <AccordionSummary expandIcon={<ExpandMore sx={{ color: 'grey.500' }} />}>
              <Typography sx={{ color: 'grey.300', fontWeight: 600 }}>General</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <FormControlLabel control={<Switch checked={forceHttps} onChange={e => setForceHttps(e.target.checked)} />}
                label={<Typography sx={{ color: 'grey.400', fontSize: 13 }}>Force HTTPS</Typography>} />
              <FormControl size="small" sx={{ ml: 2, ...selSx, minWidth: 200 }}>
                <InputLabel sx={{ color: 'grey.500' }}>WWW Redirect</InputLabel>
                <Select value={wwwRedirect} label="WWW Redirect" onChange={e => setWwwRedirect(e.target.value as '' | 'add' | 'remove')}>
                  <MenuItem value="">None</MenuItem>
                  <MenuItem value="add">Add www</MenuItem>
                  <MenuItem value="remove">Remove www</MenuItem>
                </Select>
              </FormControl>
              <Box sx={{ mt: 2 }}>
                <TextField size="small" label="CORS Origin" value={corsOrigin} onChange={e => setCorsOrigin(e.target.value)}
                  placeholder="* or https://example.com" sx={{ ...tfSx, width: '100%' }} />
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Redirects */}
          <Accordion sx={accSx}>
            <AccordionSummary expandIcon={<ExpandMore sx={{ color: 'grey.500' }} />}>
              <Typography sx={{ color: 'grey.300', fontWeight: 600 }}>Redirects</Typography>
              <Chip label={redirects.length} size="small" sx={{ ml: 1, bgcolor: '#222', color: 'grey.400' }} />
            </AccordionSummary>
            <AccordionDetails>
              {redirects.map((r, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                  <Select size="small" value={r.code} onChange={e => { const u = [...redirects]; u[i] = { ...r, code: e.target.value as 301 | 302 }; setRedirects(u); }}
                    sx={{ ...selSx, width: 90 }}>
                    <MenuItem value={301}>301</MenuItem>
                    <MenuItem value={302}>302</MenuItem>
                  </Select>
                  <TextField size="small" placeholder="/old" value={r.from}
                    onChange={e => { const u = [...redirects]; u[i] = { ...r, from: e.target.value }; setRedirects(u); }} sx={tfSx} />
                  <Typography sx={{ color: 'grey.600' }}>to</Typography>
                  <TextField size="small" placeholder="/new" value={r.to} fullWidth
                    onChange={e => { const u = [...redirects]; u[i] = { ...r, to: e.target.value }; setRedirects(u); }} sx={tfSx} />
                  <IconButton size="small" onClick={() => setRedirects(redirects.filter((_, j) => j !== i))} sx={{ color: 'grey.600' }}><Delete fontSize="small" /></IconButton>
                </Box>
              ))}
              <Button size="small" startIcon={<Add />} onClick={() => setRedirects([...redirects, { from: '', to: '', code: 301 }])}
                sx={{ color: 'grey.400', textTransform: 'none' }}>Add Redirect</Button>
            </AccordionDetails>
          </Accordion>

          {/* Rewrite Rules */}
          <Accordion sx={accSx}>
            <AccordionSummary expandIcon={<ExpandMore sx={{ color: 'grey.500' }} />}>
              <Typography sx={{ color: 'grey.300', fontWeight: 600 }}>Rewrite Rules</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {rewrites.map((r, i) => (
                <Box key={i} sx={{ mb: 2, p: 1.5, bgcolor: '#0a0a0a', borderRadius: 1, border: '1px solid #222' }}>
                  <TextField size="small" fullWidth label="Condition" value={r.cond} sx={{ ...tfSx, mb: 1 }}
                    onChange={e => { const u = [...rewrites]; u[i] = { ...r, cond: e.target.value }; setRewrites(u); }} />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField size="small" label="Pattern" value={r.pattern} sx={{ ...tfSx, flex: 1 }}
                      onChange={e => { const u = [...rewrites]; u[i] = { ...r, pattern: e.target.value }; setRewrites(u); }} />
                    <TextField size="small" label="Target" value={r.target} sx={{ ...tfSx, flex: 2 }}
                      onChange={e => { const u = [...rewrites]; u[i] = { ...r, target: e.target.value }; setRewrites(u); }} />
                    <TextField size="small" label="Flags" value={r.flags} sx={{ ...tfSx, width: 100 }}
                      onChange={e => { const u = [...rewrites]; u[i] = { ...r, flags: e.target.value }; setRewrites(u); }} />
                    <IconButton size="small" onClick={() => setRewrites(rewrites.filter((_, j) => j !== i))} sx={{ color: 'grey.600' }}><Delete fontSize="small" /></IconButton>
                  </Box>
                </Box>
              ))}
              <Button size="small" startIcon={<Add />} onClick={() => setRewrites([...rewrites, { cond: '', pattern: '', target: '', flags: 'L' }])}
                sx={{ color: 'grey.400', textTransform: 'none' }}>Add Rule</Button>
            </AccordionDetails>
          </Accordion>

          {/* Security */}
          <Accordion sx={accSx}>
            <AccordionSummary expandIcon={<ExpandMore sx={{ color: 'grey.500' }} />}>
              <Typography sx={{ color: 'grey.300', fontWeight: 600 }}>Security</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <FormControlLabel control={<Switch checked={disableDirListing} onChange={e => setDisableDirListing(e.target.checked)} />}
                label={<Typography sx={{ color: 'grey.400', fontSize: 13 }}>Disable directory listing</Typography>} />
              <FormControlLabel control={<Switch checked={passwordProtect} onChange={e => setPasswordProtect(e.target.checked)} />}
                label={<Typography sx={{ color: 'grey.400', fontSize: 13 }}>Password protect</Typography>} />
              {passwordProtect && (
                <Box sx={{ ml: 4, mb: 1, display: 'flex', gap: 1 }}>
                  <TextField size="small" label="Auth Name" value={authName} onChange={e => setAuthName(e.target.value)} sx={tfSx} />
                  <TextField size="small" label=".htpasswd path" value={authUserFile} onChange={e => setAuthUserFile(e.target.value)} sx={{ ...tfSx, flex: 1 }} />
                </Box>
              )}
              <FormControlLabel control={<Switch checked={preventHotlinking} onChange={e => setPreventHotlinking(e.target.checked)} />}
                label={<Typography sx={{ color: 'grey.400', fontSize: 13 }}>Prevent hotlinking</Typography>} />
              {preventHotlinking && (
                <Box sx={{ ml: 4, mb: 1 }}>
                  <TextField size="small" label="Your domain" value={hotlinkDomain} onChange={e => setHotlinkDomain(e.target.value)} sx={tfSx} />
                </Box>
              )}
              <Typography sx={{ color: 'grey.500', fontSize: 12, mt: 1, mb: 0.5 }}>Deny IPs (one per line)</Typography>
              <TextField size="small" fullWidth multiline rows={2} value={denyIps} onChange={e => setDenyIps(e.target.value)} placeholder="192.168.1.1" sx={tfSx} />
              <Typography sx={{ color: 'grey.500', fontSize: 12, mt: 1, mb: 0.5 }}>Block User Agents (one per line)</Typography>
              <TextField size="small" fullWidth multiline rows={2} value={blockAgents} onChange={e => setBlockAgents(e.target.value)} placeholder="BadBot" sx={tfSx} />
            </AccordionDetails>
          </Accordion>

          {/* Caching */}
          <Accordion sx={accSx}>
            <AccordionSummary expandIcon={<ExpandMore sx={{ color: 'grey.500' }} />}>
              <Typography sx={{ color: 'grey.300', fontWeight: 600 }}>Caching</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField size="small" label="Images (sec)" value={cacheImages} onChange={e => setCacheImages(e.target.value)} sx={{ ...tfSx, width: 140 }} />
                <TextField size="small" label="CSS (sec)" value={cacheCss} onChange={e => setCacheCss(e.target.value)} sx={{ ...tfSx, width: 140 }} />
                <TextField size="small" label="JS (sec)" value={cacheJs} onChange={e => setCacheJs(e.target.value)} sx={{ ...tfSx, width: 140 }} />
                <TextField size="small" label="Fonts (sec)" value={cacheFonts} onChange={e => setCacheFonts(e.target.value)} sx={{ ...tfSx, width: 140 }} />
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Compression */}
          <Accordion sx={accSx}>
            <AccordionSummary expandIcon={<ExpandMore sx={{ color: 'grey.500' }} />}>
              <Typography sx={{ color: 'grey.300', fontWeight: 600 }}>Compression</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <FormControlLabel control={<Switch checked={enableCompression} onChange={e => setEnableCompression(e.target.checked)} />}
                label={<Typography sx={{ color: 'grey.400', fontSize: 13 }}>Enable mod_deflate compression</Typography>} />
            </AccordionDetails>
          </Accordion>

          {/* Error Pages */}
          <Accordion sx={accSx}>
            <AccordionSummary expandIcon={<ExpandMore sx={{ color: 'grey.500' }} />}>
              <Typography sx={{ color: 'grey.300', fontWeight: 600 }}>Custom Error Pages</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {errorPages.map((e, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                  <TextField size="small" label="Code" type="number" value={e.code} sx={{ ...tfSx, width: 90 }}
                    onChange={ev => { const u = [...errorPages]; u[i] = { ...e, code: Number(ev.target.value) }; setErrorPages(u); }} />
                  <TextField size="small" label="Page" value={e.page} fullWidth sx={tfSx}
                    onChange={ev => { const u = [...errorPages]; u[i] = { ...e, page: ev.target.value }; setErrorPages(u); }} />
                  <IconButton size="small" onClick={() => setErrorPages(errorPages.filter((_, j) => j !== i))} sx={{ color: 'grey.600' }}><Delete fontSize="small" /></IconButton>
                </Box>
              ))}
              <Button size="small" startIcon={<Add />} onClick={() => setErrorPages([...errorPages, { code: 403, page: '/403.html' }])}
                sx={{ color: 'grey.400', textTransform: 'none' }}>Add Error Page</Button>
            </AccordionDetails>
          </Accordion>
        </Box>

        {/* Output */}
        <Paper sx={{ width: 480, bgcolor: '#111', border: '1px solid #222', p: 2, borderRadius: 2, alignSelf: 'flex-start' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="subtitle2" sx={{ color: 'grey.400' }}>Generated .htaccess</Typography>
            <Tooltip title="Copy"><IconButton size="small" onClick={copy} sx={{ color: 'grey.500' }}><ContentCopy fontSize="small" /></IconButton></Tooltip>
          </Box>
          <Box sx={{ bgcolor: '#0a0a0a', border: '1px solid #222', borderRadius: 1, p: 2, maxHeight: 600, overflow: 'auto' }}>
            <Typography component="pre" sx={{ color: '#98c379', fontFamily: 'monospace', fontSize: 12, whiteSpace: 'pre-wrap', m: 0 }}>
              {generate()}
            </Typography>
          </Box>
        </Paper>
      </Box>

      <Snackbar open={snackOpen} autoHideDuration={2000} onClose={() => setSnackOpen(false)} message="Copied to clipboard" />
    </Box>
  );
}
