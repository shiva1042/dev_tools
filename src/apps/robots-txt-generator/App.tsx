import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Button, IconButton, Tooltip, Snackbar, Chip,
  Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import { Home, ContentCopy, Add, Delete, Warning } from '@mui/icons-material';

interface UserAgentRule {
  id: number;
  agent: string;
  allow: string[];
  disallow: string[];
  crawlDelay: string;
}

const COMMON_AGENTS = ['*', 'Googlebot', 'Bingbot', 'Slurp', 'DuckDuckBot', 'Baiduspider', 'YandexBot', 'facebookexternalhit', 'Twitterbot', 'GPTBot', 'ChatGPT-User', 'CCBot', 'Applebot'];

const PRESETS: { name: string; desc: string; rules: Omit<UserAgentRule, 'id'>[] }[] = [
  { name: 'Allow All', desc: 'No restrictions', rules: [{ agent: '*', allow: ['/'], disallow: [], crawlDelay: '' }] },
  { name: 'Block All', desc: 'Block everything', rules: [{ agent: '*', allow: [], disallow: ['/'], crawlDelay: '' }] },
  { name: 'Block /admin', desc: 'Block admin area', rules: [{ agent: '*', allow: ['/'], disallow: ['/admin/', '/admin/*'], crawlDelay: '' }] },
  { name: 'Standard Blog', desc: 'WordPress-style', rules: [{ agent: '*', allow: ['/'], disallow: ['/wp-admin/', '/wp-includes/', '/wp-json/', '/feed/', '/trackback/'], crawlDelay: '' }] },
  { name: 'E-commerce', desc: 'Block cart/checkout', rules: [{ agent: '*', allow: ['/'], disallow: ['/cart/', '/checkout/', '/account/', '/my-account/', '/wishlist/', '/compare/'], crawlDelay: '' }] },
  { name: 'Block AI Bots', desc: 'Block GPTBot, CCBot', rules: [{ agent: 'GPTBot', allow: [], disallow: ['/'], crawlDelay: '' }, { agent: 'CCBot', allow: [], disallow: ['/'], crawlDelay: '' }, { agent: 'ChatGPT-User', allow: [], disallow: ['/'], crawlDelay: '' }] },
];

const COMMON_PATHS = [
  '/api/', '/admin/', '/private/', '/tmp/', '/.env', '/node_modules/',
  '/cgi-bin/', '/wp-admin/', '/wp-includes/', '/wp-json/',
  '/cart/', '/checkout/', '/account/', '/search/', '/login/',
  '/*.pdf$', '/*.xml$', '/assets/', '/internal/',
];

const tfSx = {
  '& .MuiInputBase-root': { bgcolor: '#0a0a0a', color: 'grey.300', fontFamily: 'monospace', fontSize: 13 },
  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
};

let nextId = 1;

export default function App() {
  const [rules, setRules] = useState<UserAgentRule[]>([
    { id: nextId++, agent: '*', allow: ['/'], disallow: ['/admin/', '/private/', '/.env'], crawlDelay: '' },
  ]);
  const [sitemaps, setSitemaps] = useState(['https://example.com/sitemap.xml']);
  const [host, setHost] = useState('https://example.com');
  const [snackOpen, setSnackOpen] = useState(false);

  const addRule = () => setRules([...rules, { id: nextId++, agent: '*', allow: [], disallow: [], crawlDelay: '' }]);
  const removeRule = (id: number) => setRules(rules.filter(r => r.id !== id));

  const updateRule = (id: number, updates: Partial<UserAgentRule>) => {
    setRules(rules.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const addPath = (ruleId: number, type: 'allow' | 'disallow', path: string) => {
    const rule = rules.find(r => r.id === ruleId);
    if (!rule) return;
    updateRule(ruleId, { [type]: [...rule[type], path] });
  };

  const removePath = (ruleId: number, type: 'allow' | 'disallow', idx: number) => {
    const rule = rules.find(r => r.id === ruleId);
    if (!rule) return;
    updateRule(ruleId, { [type]: rule[type].filter((_, i) => i !== idx) });
  };

  const updatePath = (ruleId: number, type: 'allow' | 'disallow', idx: number, value: string) => {
    const rule = rules.find(r => r.id === ruleId);
    if (!rule) return;
    updateRule(ruleId, { [type]: rule[type].map((p, i) => i === idx ? value : p) });
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setRules(preset.rules.map(r => ({ ...r, id: nextId++ })));
  };

  const warnings = useMemo(() => {
    const w: string[] = [];
    rules.forEach(r => {
      if (r.allow.some(a => r.disallow.includes(a))) {
        w.push(`Agent "${r.agent}": Same path in both Allow and Disallow`);
      }
      [...r.allow, ...r.disallow].forEach(p => {
        if (p && !p.startsWith('/') && !p.startsWith('*')) {
          w.push(`Agent "${r.agent}": Path "${p}" should start with /`);
        }
      });
      if (r.crawlDelay && (isNaN(Number(r.crawlDelay)) || Number(r.crawlDelay) < 0)) {
        w.push(`Agent "${r.agent}": Invalid crawl-delay value`);
      }
    });
    const agents = rules.map(r => r.agent);
    const dupes = agents.filter((a, i) => agents.indexOf(a) !== i);
    if (dupes.length > 0) {
      w.push(`Duplicate user-agent: ${[...new Set(dupes)].join(', ')}`);
    }
    return w;
  }, [rules]);

  const output = useMemo(() => {
    const lines: string[] = [];
    rules.forEach((r, idx) => {
      if (idx > 0) lines.push('');
      lines.push(`User-agent: ${r.agent}`);
      r.disallow.forEach(p => { if (p) lines.push(`Disallow: ${p}`); });
      if (r.disallow.length === 0) lines.push('Disallow:');
      r.allow.forEach(p => { if (p) lines.push(`Allow: ${p}`); });
      if (r.crawlDelay) lines.push(`Crawl-delay: ${r.crawlDelay}`);
    });
    lines.push('');
    if (host) lines.push(`Host: ${host}`);
    sitemaps.forEach(s => { if (s) lines.push(`Sitemap: ${s}`); });
    return lines.join('\n');
  }, [rules, sitemaps, host]);

  const copy = () => { navigator.clipboard.writeText(output); setSnackOpen(true); };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a', p: 3 }}>
      <Paper elevation={0} sx={{ bgcolor: '#111', borderBottom: '1px solid #222', px: 3, py: 2, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Link to="/"><IconButton size="small" sx={{ color: 'grey.500' }}><Home /></IconButton></Link>
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>Robots.txt Generator</Typography>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', gap: 3 }}>
        <Box sx={{ flex: 1 }}>
          {/* Presets */}
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 2, borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1 }}>Presets</Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {PRESETS.map(p => (
                <Tooltip key={p.name} title={p.desc}>
                  <Chip label={p.name} size="small" onClick={() => applyPreset(p)}
                    sx={{ bgcolor: '#222', color: 'grey.400', '&:hover': { bgcolor: '#333' } }} />
                </Tooltip>
              ))}
            </Box>
          </Paper>

          {/* Warnings */}
          {warnings.length > 0 && (
            <Paper sx={{ bgcolor: 'rgba(211,47,47,0.1)', border: '1px solid #d32f2f', p: 2, mb: 2, borderRadius: 2 }}>
              {warnings.map((w, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Warning sx={{ color: '#ffa726', fontSize: 16 }} />
                  <Typography sx={{ color: '#ffa726', fontSize: 12 }}>{w}</Typography>
                </Box>
              ))}
            </Paper>
          )}

          {/* User-Agent Rules */}
          {rules.map(rule => (
            <Paper key={rule.id} sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 2, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <Typography sx={{ color: 'grey.500', fontSize: 12 }}>User-agent:</Typography>
                <FormControl size="small" sx={{ minWidth: 180 }}>
                  <Select value={rule.agent} onChange={e => updateRule(rule.id, { agent: e.target.value })}
                    sx={{ bgcolor: '#0a0a0a', color: '#e5c07b', fontFamily: 'monospace', fontSize: 13, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' } }}>
                    {COMMON_AGENTS.map(a => <MenuItem key={a} value={a}>{a}</MenuItem>)}
                  </Select>
                </FormControl>
                <TextField size="small" placeholder="Crawl-delay" value={rule.crawlDelay}
                  onChange={e => updateRule(rule.id, { crawlDelay: e.target.value })}
                  sx={{ ...tfSx, width: 120 }} />
                <IconButton size="small" onClick={() => removeRule(rule.id)} sx={{ color: 'grey.600', ml: 'auto' }}><Delete fontSize="small" /></IconButton>
              </Box>

              {/* Disallow */}
              <Box sx={{ mb: 1.5 }}>
                <Typography sx={{ color: '#ef5350', fontSize: 12, mb: 0.5 }}>Disallow</Typography>
                {rule.disallow.map((p, i) => (
                  <Box key={i} sx={{ display: 'flex', gap: 0.5, mb: 0.5 }}>
                    <TextField size="small" fullWidth value={p} onChange={e => updatePath(rule.id, 'disallow', i, e.target.value)}
                      sx={{ ...tfSx, '& .MuiInputBase-root': { ...tfSx['& .MuiInputBase-root'], color: '#ef5350' } }} />
                    <IconButton size="small" onClick={() => removePath(rule.id, 'disallow', i)} sx={{ color: 'grey.600' }}><Delete fontSize="small" /></IconButton>
                  </Box>
                ))}
                <Button size="small" onClick={() => addPath(rule.id, 'disallow', '/')} sx={{ color: 'grey.400', textTransform: 'none', fontSize: 11 }}>+ Add Disallow</Button>
              </Box>

              {/* Allow */}
              <Box>
                <Typography sx={{ color: '#66bb6a', fontSize: 12, mb: 0.5 }}>Allow</Typography>
                {rule.allow.map((p, i) => (
                  <Box key={i} sx={{ display: 'flex', gap: 0.5, mb: 0.5 }}>
                    <TextField size="small" fullWidth value={p} onChange={e => updatePath(rule.id, 'allow', i, e.target.value)}
                      sx={{ ...tfSx, '& .MuiInputBase-root': { ...tfSx['& .MuiInputBase-root'], color: '#66bb6a' } }} />
                    <IconButton size="small" onClick={() => removePath(rule.id, 'allow', i)} sx={{ color: 'grey.600' }}><Delete fontSize="small" /></IconButton>
                  </Box>
                ))}
                <Button size="small" onClick={() => addPath(rule.id, 'allow', '/')} sx={{ color: 'grey.400', textTransform: 'none', fontSize: 11 }}>+ Add Allow</Button>
              </Box>
            </Paper>
          ))}

          <Button variant="outlined" startIcon={<Add />} onClick={addRule} fullWidth
            sx={{ color: 'grey.400', borderColor: '#333', textTransform: 'none', mb: 2 }}>Add User-Agent Rule</Button>

          {/* Sitemap & Host */}
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1 }}>Sitemap & Host</Typography>
            <TextField size="small" fullWidth label="Host" value={host} onChange={e => setHost(e.target.value)} sx={{ ...tfSx, mb: 1.5 }} />
            {sitemaps.map((s, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 0.5, mb: 0.5 }}>
                <TextField size="small" fullWidth label={`Sitemap ${i + 1}`} value={s}
                  onChange={e => { const u = [...sitemaps]; u[i] = e.target.value; setSitemaps(u); }} sx={tfSx} />
                <IconButton size="small" onClick={() => setSitemaps(sitemaps.filter((_, j) => j !== i))} sx={{ color: 'grey.600' }}><Delete fontSize="small" /></IconButton>
              </Box>
            ))}
            <Button size="small" onClick={() => setSitemaps([...sitemaps, ''])} sx={{ color: 'grey.400', textTransform: 'none', fontSize: 11 }}>+ Add Sitemap</Button>
          </Paper>
        </Box>

        {/* Right Side: Output + Path Suggestions */}
        <Box sx={{ width: 420 }}>
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 2, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle2" sx={{ color: 'grey.400' }}>Generated robots.txt</Typography>
              <Tooltip title="Copy"><IconButton size="small" onClick={copy} sx={{ color: 'grey.500' }}><ContentCopy fontSize="small" /></IconButton></Tooltip>
            </Box>
            <Box sx={{ bgcolor: '#0a0a0a', border: '1px solid #222', borderRadius: 1, p: 2, maxHeight: 400, overflow: 'auto' }}>
              <Typography component="pre" sx={{ color: '#98c379', fontFamily: 'monospace', fontSize: 12, whiteSpace: 'pre-wrap', m: 0 }}>
                {output}
              </Typography>
            </Box>
          </Paper>

          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1 }}>Common Paths</Typography>
            <Typography sx={{ color: 'grey.600', fontSize: 11, mb: 1 }}>Click to add to first rule's Disallow</Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {COMMON_PATHS.map(p => (
                <Chip key={p} label={p} size="small"
                  onClick={() => {
                    if (rules.length > 0) {
                      const rule = rules[0];
                      if (!rule.disallow.includes(p)) {
                        updateRule(rule.id, { disallow: [...rule.disallow, p] });
                      }
                    }
                  }}
                  sx={{ bgcolor: '#1a1a1a', color: '#ef5350', fontFamily: 'monospace', fontSize: 11, '&:hover': { bgcolor: '#222' } }} />
              ))}
            </Box>
          </Paper>
        </Box>
      </Box>

      <Snackbar open={snackOpen} autoHideDuration={2000} onClose={() => setSnackOpen(false)} message="Copied to clipboard" />
    </Box>
  );
}
