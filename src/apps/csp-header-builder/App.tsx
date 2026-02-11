import { useState, useCallback, useMemo } from 'react';
import {
  Box, Paper, Typography, TextField, Button, IconButton, Tooltip, Tabs, Tab,
  Chip, Snackbar, Select, MenuItem, FormControl, InputLabel, Divider,
} from '@mui/material';
import { ContentCopy, Home, Add, Delete } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const DIRECTIVES = [
  { key: 'default-src', label: 'default-src', desc: 'Fallback for other directives' },
  { key: 'script-src', label: 'script-src', desc: 'JavaScript sources' },
  { key: 'style-src', label: 'style-src', desc: 'Stylesheet sources' },
  { key: 'img-src', label: 'img-src', desc: 'Image sources' },
  { key: 'font-src', label: 'font-src', desc: 'Font sources' },
  { key: 'connect-src', label: 'connect-src', desc: 'XHR/Fetch/WebSocket sources' },
  { key: 'media-src', label: 'media-src', desc: 'Audio/Video sources' },
  { key: 'object-src', label: 'object-src', desc: 'Plugin sources (Flash, etc.)' },
  { key: 'frame-src', label: 'frame-src', desc: 'iframe sources' },
  { key: 'frame-ancestors', label: 'frame-ancestors', desc: 'Who can embed this page' },
  { key: 'base-uri', label: 'base-uri', desc: 'Restricts <base> element' },
  { key: 'form-action', label: 'form-action', desc: 'Form submission targets' },
];

const BOOLEAN_DIRECTIVES = ['upgrade-insecure-requests', 'block-all-mixed-content'];
const QUICK_SOURCES = ["'self'", "'unsafe-inline'", "'unsafe-eval'", "'none'", "'strict-dynamic'", "https:", "data:", "blob:", "'wasm-unsafe-eval'"];

const PRESETS: Record<string, Record<string, string[]>> = {
  Strict: { 'default-src': ["'none'"], 'script-src': ["'self'"], 'style-src': ["'self'"], 'img-src': ["'self'"], 'font-src': ["'self'"], 'connect-src': ["'self'"], 'frame-ancestors': ["'none'"], 'base-uri': ["'self'"], 'form-action': ["'self'"] },
  Moderate: { 'default-src': ["'self'"], 'script-src': ["'self'", "'unsafe-inline'"], 'style-src': ["'self'", "'unsafe-inline'"], 'img-src': ["'self'", "data:", "https:"], 'font-src': ["'self'", "https://fonts.gstatic.com"], 'connect-src': ["'self'"] },
  Permissive: { 'default-src': ["'self'"], 'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"], 'style-src': ["'self'", "'unsafe-inline'"], 'img-src': ["*", "data:", "blob:"], 'font-src': ["*"], 'connect-src': ["*"] },
};

export default function App() {
  const [directives, setDirectives] = useState<Record<string, string[]>>({ 'default-src': ["'self'"] });
  const [boolDirs, setBoolDirs] = useState<string[]>([]);
  const [reportUri, setReportUri] = useState('');
  const [sourceInputs, setSourceInputs] = useState<Record<string, string>>({});
  const [outputTab, setOutputTab] = useState(0);
  const [snack, setSnack] = useState('');

  const copy = useCallback((t: string) => { navigator.clipboard.writeText(t); setSnack('Copied!'); }, []);

  const addSource = (dir: string) => {
    const val = sourceInputs[dir]?.trim();
    if (!val || directives[dir]?.includes(val)) return;
    setDirectives(prev => ({ ...prev, [dir]: [...(prev[dir] || []), val] }));
    setSourceInputs(prev => ({ ...prev, [dir]: '' }));
  };

  const removeSource = (dir: string, idx: number) => {
    setDirectives(prev => {
      const arr = (prev[dir] || []).filter((_, i) => i !== idx);
      if (arr.length === 0) { const n = { ...prev }; delete n[dir]; return n; }
      return { ...prev, [dir]: arr };
    });
  };

  const toggleQuickSource = (dir: string, src: string) => {
    setDirectives(prev => {
      const arr = prev[dir] || [];
      if (arr.includes(src)) {
        const filtered = arr.filter(s => s !== src);
        if (filtered.length === 0) { const n = { ...prev }; delete n[dir]; return n; }
        return { ...prev, [dir]: filtered };
      }
      return { ...prev, [dir]: [...arr, src] };
    });
  };

  const enableDirective = (dir: string) => {
    if (!directives[dir]) setDirectives(prev => ({ ...prev, [dir]: [] }));
  };

  const removeDirective = (dir: string) => {
    setDirectives(prev => { const n = { ...prev }; delete n[dir]; return n; });
  };

  const toggleBoolDir = (dir: string) => setBoolDirs(prev => prev.includes(dir) ? prev.filter(d => d !== dir) : [...prev, dir]);

  const applyPreset = (name: string) => {
    setDirectives(PRESETS[name]);
    setBoolDirs(name === 'Strict' ? ['upgrade-insecure-requests', 'block-all-mixed-content'] : name === 'Moderate' ? ['upgrade-insecure-requests'] : []);
  };

  const cspString = useMemo(() => {
    const parts: string[] = [];
    Object.entries(directives).forEach(([dir, sources]) => {
      if (sources.length > 0) parts.push(`${dir} ${sources.join(' ')}`);
    });
    boolDirs.forEach(d => parts.push(d));
    if (reportUri.trim()) parts.push(`report-uri ${reportUri.trim()}`);
    return parts.join('; ');
  }, [directives, boolDirs, reportUri]);

  const outputs = useMemo(() => {
    const header = `Content-Security-Policy: ${cspString}`;
    const meta = `<meta http-equiv="Content-Security-Policy" content="${cspString}">`;
    const nginx = `# Nginx CSP Configuration\nadd_header Content-Security-Policy "${cspString}" always;`;
    const apache = `# Apache CSP Configuration\n<IfModule mod_headers.c>\n    Header set Content-Security-Policy "${cspString}"\n</IfModule>`;
    const express = `// Express CSP Middleware\napp.use((req, res, next) => {\n  res.setHeader('Content-Security-Policy', '${cspString.replace(/'/g, "\\'")}');\n  next();\n});`;
    return [header, meta, nginx, apache, express];
  }, [cspString]);

  const outputLabels = ['HTTP Header', 'Meta Tag', 'Nginx', 'Apache', 'Express'];
  const sxField = { '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#333' }, '&:hover fieldset': { borderColor: '#555' }, '&.Mui-focused fieldset': { borderColor: '#1976d2' } }, '& .MuiInputLabel-root': { color: 'grey.500' }, '& .MuiInputBase-input': { color: 'grey.300' } };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a', color: 'grey.300', p: 3 }}>
      <Box sx={{ maxWidth: 960, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <Link to="/"><IconButton size="small" sx={{ color: 'grey.500' }}><Home /></IconButton></Link>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Content Security Policy Builder</Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
          {Object.keys(PRESETS).map(p => (
            <Button key={p} size="small" variant="outlined" onClick={() => applyPreset(p)} sx={{ borderColor: '#333', color: 'grey.400', textTransform: 'none' }}>{p} Preset</Button>
          ))}
        </Box>

        <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 3, mb: 3 }}>
          {DIRECTIVES.map(d => {
            const active = d.key in directives;
            return (
              <Box key={d.key} sx={{ mb: 2, pb: 2, borderBottom: '1px solid #1a1a1a' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ color: active ? '#90caf9' : 'grey.600', fontFamily: 'monospace', cursor: 'pointer' }} onClick={() => active ? removeDirective(d.key) : enableDirective(d.key)}>
                    {d.key}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'grey.600' }}>- {d.desc}</Typography>
                  {!active && <Button size="small" onClick={() => enableDirective(d.key)} sx={{ color: 'grey.600', fontSize: 11 }}>Enable</Button>}
                  {active && <IconButton size="small" onClick={() => removeDirective(d.key)} sx={{ color: 'grey.700' }}><Delete fontSize="small" /></IconButton>}
                </Box>
                {active && (
                  <>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                      {QUICK_SOURCES.map(src => (
                        <Chip key={src} label={src} size="small" onClick={() => toggleQuickSource(d.key, src)} variant={directives[d.key]?.includes(src) ? 'filled' : 'outlined'}
                          sx={{ bgcolor: directives[d.key]?.includes(src) ? '#1a2332' : 'transparent', color: directives[d.key]?.includes(src) ? '#90caf9' : 'grey.600', borderColor: '#333', fontFamily: 'monospace', fontSize: 11 }} />
                      ))}
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                      {(directives[d.key] || []).filter(s => !QUICK_SOURCES.includes(s)).map((s, i) => (
                        <Chip key={i} label={s} size="small" onDelete={() => removeSource(d.key, (directives[d.key] || []).indexOf(s))} sx={{ bgcolor: '#1a2332', color: '#90caf9', '& .MuiChip-deleteIcon': { color: '#5a8ab5' }, fontFamily: 'monospace', fontSize: 11 }} />
                      ))}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField size="small" placeholder="Custom source (e.g. *.example.com)" value={sourceInputs[d.key] || ''} onChange={e => setSourceInputs(prev => ({ ...prev, [d.key]: e.target.value }))} onKeyDown={e => e.key === 'Enter' && addSource(d.key)} sx={{ flex: 1, ...sxField }} />
                      <Button size="small" variant="outlined" onClick={() => addSource(d.key)} sx={{ borderColor: '#333' }}>Add</Button>
                    </Box>
                  </>
                )}
              </Box>
            );
          })}

          <Divider sx={{ borderColor: '#222', my: 2 }} />
          <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1 }}>Boolean Directives</Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            {BOOLEAN_DIRECTIVES.map(d => (
              <Chip key={d} label={d} size="small" onClick={() => toggleBoolDir(d)} variant={boolDirs.includes(d) ? 'filled' : 'outlined'}
                sx={{ bgcolor: boolDirs.includes(d) ? '#1a2332' : 'transparent', color: boolDirs.includes(d) ? '#90caf9' : 'grey.600', borderColor: '#333', fontFamily: 'monospace' }} />
            ))}
          </Box>

          <TextField size="small" label="Report URI" value={reportUri} onChange={e => setReportUri(e.target.value)} fullWidth sx={sxField} placeholder="https://example.com/csp-report" />
        </Paper>

        <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 2 }}>
          <Typography variant="caption" sx={{ color: 'grey.500' }}>Generated CSP</Typography>
          <Box component="pre" sx={{ color: '#ffb74d', fontFamily: 'monospace', fontSize: 13, whiteSpace: 'pre-wrap', m: 0, mt: 1 }}>{cspString || '(empty)'}</Box>
        </Paper>

        <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Tabs value={outputTab} onChange={(_, v) => setOutputTab(v)} sx={{ '& .MuiTab-root': { color: 'grey.500', fontSize: 12, textTransform: 'none' }, '& .Mui-selected': { color: '#90caf9' } }}>
              {outputLabels.map(l => <Tab key={l} label={l} />)}
            </Tabs>
            <Tooltip title="Copy"><IconButton onClick={() => copy(outputs[outputTab])} sx={{ color: 'grey.400' }}><ContentCopy /></IconButton></Tooltip>
          </Box>
          <Box component="pre" sx={{ color: '#81c784', fontFamily: 'monospace', fontSize: 13, overflow: 'auto', maxHeight: 400, whiteSpace: 'pre-wrap', m: 0, mt: 1 }}>{outputs[outputTab]}</Box>
        </Paper>
      </Box>
      <Snackbar open={!!snack} autoHideDuration={2000} onClose={() => setSnack('')} message={snack} />
    </Box>
  );
}
