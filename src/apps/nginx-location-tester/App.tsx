import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Button, IconButton, Tooltip, Snackbar, Chip,
} from '@mui/material';
import { Home, Add, Delete, PlayArrow, ContentCopy } from '@mui/icons-material';

interface LocationBlock {
  id: number;
  modifier: '' | '=' | '~' | '~*' | '^~';
  pattern: string;
}

interface MatchResult {
  blockId: number | null;
  reason: string;
  priority: string;
}

const MODIFIERS: { value: LocationBlock['modifier']; label: string; desc: string }[] = [
  { value: '', label: '(none)', desc: 'Prefix match' },
  { value: '=', label: '=', desc: 'Exact match' },
  { value: '^~', label: '^~', desc: 'Preferential prefix' },
  { value: '~', label: '~', desc: 'Case-sensitive regex' },
  { value: '~*', label: '~*', desc: 'Case-insensitive regex' },
];

const COMMON_PATTERNS = [
  { pattern: '= /', desc: 'Exact root' },
  { pattern: '/', desc: 'Catch-all prefix' },
  { pattern: '~* \\.(jpg|jpeg|png|gif|ico)$', desc: 'Image files' },
  { pattern: '~* \\.css$', desc: 'CSS files' },
  { pattern: '~* \\.js$', desc: 'JS files' },
  { pattern: '^~ /static/', desc: 'Static files prefix' },
  { pattern: '= /favicon.ico', desc: 'Favicon exact' },
  { pattern: '~ /api/', desc: 'API routes regex' },
  { pattern: '/images/', desc: 'Images prefix' },
  { pattern: '~* \\.(woff|woff2|ttf|eot)$', desc: 'Font files' },
];

const PRIORITY_ORDER = [
  { step: '1', label: 'Exact match (=)', desc: 'Stops immediately if found' },
  { step: '2', label: 'Preferential prefix (^~)', desc: 'Longest match wins, skips regex' },
  { step: '3', label: 'Regex (~ or ~*)', desc: 'First match in config order' },
  { step: '4', label: 'Prefix (none)', desc: 'Longest match wins' },
];

function testLocation(blocks: LocationBlock[], url: string): MatchResult {
  if (!url) return { blockId: null, reason: 'Enter a URL to test', priority: '' };

  // Step 1: Exact match
  for (const b of blocks) {
    if (b.modifier === '=' && url === b.pattern) {
      return { blockId: b.id, reason: `Exact match: URL "${url}" equals "${b.pattern}"`, priority: 'Exact (=)' };
    }
  }

  // Step 2: Find longest prefix match (both ^~ and plain prefix)
  let longestPrefix: LocationBlock | null = null;
  let longestLen = 0;
  for (const b of blocks) {
    if (b.modifier === '' || b.modifier === '^~') {
      if (url.startsWith(b.pattern) && b.pattern.length > longestLen) {
        longestPrefix = b;
        longestLen = b.pattern.length;
      }
    }
  }

  // If longest prefix is ^~, return it (skip regex)
  if (longestPrefix && longestPrefix.modifier === '^~') {
    return {
      blockId: longestPrefix.id,
      reason: `Preferential prefix: "${url}" starts with "${longestPrefix.pattern}" (^~ skips regex)`,
      priority: 'Preferential prefix (^~)',
    };
  }

  // Step 3: Regex match (first in order)
  for (const b of blocks) {
    if (b.modifier === '~' || b.modifier === '~*') {
      try {
        const flags = b.modifier === '~*' ? 'i' : '';
        const re = new RegExp(b.pattern, flags);
        if (re.test(url)) {
          return {
            blockId: b.id,
            reason: `Regex ${b.modifier === '~*' ? '(case-insensitive)' : '(case-sensitive)'}: "${url}" matches /${b.pattern}/${flags}`,
            priority: `Regex (${b.modifier})`,
          };
        }
      } catch {
        // invalid regex, skip
      }
    }
  }

  // Step 4: Return longest prefix match
  if (longestPrefix) {
    return {
      blockId: longestPrefix.id,
      reason: `Prefix match: "${url}" starts with "${longestPrefix.pattern}" (longest prefix)`,
      priority: 'Prefix (none)',
    };
  }

  return { blockId: null, reason: 'No location block matches this URL', priority: '' };
}

let nextId = 1;

export default function App() {
  const [blocks, setBlocks] = useState<LocationBlock[]>([
    { id: nextId++, modifier: '=', pattern: '/' },
    { id: nextId++, modifier: '', pattern: '/' },
    { id: nextId++, modifier: '~*', pattern: '\\.(jpg|png|gif)$' },
    { id: nextId++, modifier: '^~', pattern: '/static/' },
  ]);
  const [testUrl, setTestUrl] = useState('/static/logo.png');
  const [snackOpen, setSnackOpen] = useState(false);

  const addBlock = () => setBlocks([...blocks, { id: nextId++, modifier: '', pattern: '' }]);
  const removeBlock = (id: number) => setBlocks(blocks.filter(b => b.id !== id));
  const updateBlock = (id: number, field: 'modifier' | 'pattern', value: string) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const result = testLocation(blocks, testUrl);

  const generateConfig = () => {
    return blocks.map(b => {
      const mod = b.modifier ? `${b.modifier} ` : '';
      return `location ${mod}${b.pattern} {\n    # handler\n}`;
    }).join('\n\n');
  };

  const copyConfig = () => {
    navigator.clipboard.writeText(generateConfig());
    setSnackOpen(true);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a', p: 3 }}>
      <Paper elevation={0} sx={{ bgcolor: '#111', borderBottom: '1px solid #222', px: 3, py: 2, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Link to="/"><IconButton size="small" sx={{ color: 'grey.500' }}><Home /></IconButton></Link>
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>Nginx Location Block Tester</Typography>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', gap: 3 }}>
        {/* Main Panel */}
        <Box sx={{ flex: 1 }}>
          {/* Test URL */}
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 3, borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1 }}>Test URL</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField fullWidth size="small" value={testUrl} onChange={e => setTestUrl(e.target.value)}
                placeholder="/path/to/resource"
                sx={{ '& .MuiInputBase-root': { bgcolor: '#0a0a0a', color: 'grey.300', fontFamily: 'monospace' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' } }}
              />
              <Button variant="contained" startIcon={<PlayArrow />} sx={{ bgcolor: '#1976d2', textTransform: 'none' }}>Test</Button>
            </Box>
          </Paper>

          {/* Result */}
          <Paper sx={{
            bgcolor: result.blockId !== null ? 'rgba(46,125,50,0.1)' : 'rgba(211,47,47,0.1)',
            border: `1px solid ${result.blockId !== null ? '#2e7d32' : '#d32f2f'}`,
            p: 2, mb: 3, borderRadius: 2,
          }}>
            <Typography variant="subtitle2" sx={{ color: result.blockId !== null ? '#66bb6a' : '#ef5350', mb: 0.5 }}>
              {result.blockId !== null ? 'MATCH FOUND' : 'NO MATCH'}
            </Typography>
            <Typography sx={{ color: 'grey.300', fontSize: 14 }}>{result.reason}</Typography>
            {result.priority && (
              <Chip label={result.priority} size="small" sx={{ mt: 1, bgcolor: '#222', color: 'grey.400' }} />
            )}
          </Paper>

          {/* Location Blocks */}
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 2, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle2" sx={{ color: 'grey.400' }}>Location Blocks</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Copy nginx config"><IconButton size="small" onClick={copyConfig} sx={{ color: 'grey.500' }}><ContentCopy fontSize="small" /></IconButton></Tooltip>
                <Button size="small" startIcon={<Add />} onClick={addBlock} sx={{ color: 'grey.400', textTransform: 'none' }}>Add Block</Button>
              </Box>
            </Box>

            {blocks.map((b, idx) => (
              <Box key={b.id} sx={{
                display: 'flex', alignItems: 'center', gap: 1, mb: 1, p: 1.5, borderRadius: 1,
                bgcolor: result.blockId === b.id ? 'rgba(46,125,50,0.15)' : '#0a0a0a',
                border: `1px solid ${result.blockId === b.id ? '#2e7d32' : '#222'}`,
              }}>
                <Typography sx={{ color: 'grey.500', fontFamily: 'monospace', fontSize: 13, minWidth: 20 }}>
                  {idx + 1}.
                </Typography>
                <Typography sx={{ color: 'grey.500', fontFamily: 'monospace', fontSize: 13 }}>location</Typography>
                <TextField select size="small" value={b.modifier}
                  onChange={e => updateBlock(b.id, 'modifier', e.target.value)}
                  SelectProps={{ native: true }}
                  sx={{ width: 80, '& .MuiInputBase-root': { bgcolor: '#111', color: '#ce9178', fontFamily: 'monospace', fontSize: 13 }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' } }}
                >
                  {MODIFIERS.map(m => <option key={m.value} value={m.value}>{m.value || '(none)'}</option>)}
                </TextField>
                <TextField fullWidth size="small" value={b.pattern} placeholder="/path or regex"
                  onChange={e => updateBlock(b.id, 'pattern', e.target.value)}
                  sx={{ '& .MuiInputBase-root': { bgcolor: '#111', color: '#d7ba7d', fontFamily: 'monospace', fontSize: 13 }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' } }}
                />
                <Typography sx={{ color: 'grey.600', fontFamily: 'monospace', fontSize: 13 }}>{'{ ... }'}</Typography>
                <IconButton size="small" onClick={() => removeBlock(b.id)} sx={{ color: 'grey.600' }}><Delete fontSize="small" /></IconButton>
              </Box>
            ))}
          </Paper>

          {/* Priority Reference */}
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1.5 }}>Match Priority Order</Typography>
            {PRIORITY_ORDER.map(p => (
              <Box key={p.step} sx={{ display: 'flex', gap: 2, mb: 1, alignItems: 'center' }}>
                <Chip label={p.step} size="small" sx={{ bgcolor: '#1976d2', color: 'white', fontWeight: 700, minWidth: 28 }} />
                <Box>
                  <Typography sx={{ color: 'grey.300', fontSize: 13, fontWeight: 600 }}>{p.label}</Typography>
                  <Typography sx={{ color: 'grey.500', fontSize: 12 }}>{p.desc}</Typography>
                </Box>
              </Box>
            ))}
          </Paper>
        </Box>

        {/* Sidebar - Common Patterns */}
        <Paper sx={{ width: 280, bgcolor: '#111', border: '1px solid #222', p: 2, borderRadius: 2, alignSelf: 'flex-start' }}>
          <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1.5 }}>Common Patterns</Typography>
          {COMMON_PATTERNS.map((cp, i) => (
            <Box key={i} sx={{
              p: 1, mb: 0.5, borderRadius: 1, cursor: 'pointer',
              '&:hover': { bgcolor: '#1a1a1a' },
            }}
              onClick={() => {
                const parts = cp.pattern.match(/^(=|~\*|~|\^~)?\s*(.+)$/);
                if (parts) {
                  const mod = (parts[1] || '') as LocationBlock['modifier'];
                  const pat = parts[2];
                  setBlocks([...blocks, { id: nextId++, modifier: mod, pattern: pat }]);
                }
              }}
            >
              <Typography sx={{ color: '#d7ba7d', fontFamily: 'monospace', fontSize: 12 }}>{cp.pattern}</Typography>
              <Typography sx={{ color: 'grey.600', fontSize: 11 }}>{cp.desc}</Typography>
            </Box>
          ))}
        </Paper>
      </Box>

      <Snackbar open={snackOpen} autoHideDuration={2000} onClose={() => setSnackOpen(false)} message="Copied to clipboard" />
    </Box>
  );
}
