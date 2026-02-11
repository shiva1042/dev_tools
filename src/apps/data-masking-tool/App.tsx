import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Button, IconButton, Tooltip,
  Select, MenuItem, FormControl, InputLabel, Snackbar, Chip,
  Checkbox, FormControlLabel, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow,
} from '@mui/material';
import Home from '@mui/icons-material/Home';
import ContentCopy from '@mui/icons-material/ContentCopy';
import Download from '@mui/icons-material/Download';
import Security from '@mui/icons-material/Security';
import Visibility from '@mui/icons-material/Visibility';

type MaskStrategy = 'asterisks' | 'hash' | 'redact' | 'partial' | 'randomize';
type DataType = 'email' | 'phone' | 'ssn' | 'creditcard' | 'ip' | 'dob';

interface PatternConfig {
  enabled: boolean;
  strategy: MaskStrategy;
}

const PATTERNS: Record<DataType, { label: string; regex: RegExp }> = {
  email: { label: 'Email Addresses', regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g },
  phone: { label: 'Phone Numbers', regex: /(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g },
  ssn: { label: 'SSNs (XXX-XX-XXXX)', regex: /\b\d{3}-\d{2}-\d{4}\b/g },
  creditcard: { label: 'Credit Card Numbers', regex: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g },
  ip: { label: 'IP Addresses', regex: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g },
  dob: { label: 'Dates (MM/DD/YYYY)', regex: /\b(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/(19|20)\d{2}\b/g },
};

const FAKE_EMAILS = ['user@example.com', 'test@domain.org', 'anon@masked.net', 'hidden@private.io'];
const FAKE_PHONES = ['(555) 123-4567', '(555) 987-6543', '(555) 246-8135', '(555) 369-2580'];
const FAKE_IPS = ['10.0.0.1', '192.168.1.1', '172.16.0.1', '127.0.0.1'];

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0').slice(0, 8);
}

function maskValue(value: string, type: DataType, strategy: MaskStrategy): string {
  switch (strategy) {
    case 'redact':
      return '[REDACTED]';
    case 'hash':
      return `#${simpleHash(value)}`;
    case 'partial': {
      if (value.length <= 4) return '***';
      return value.slice(0, 2) + '*'.repeat(value.length - 4) + value.slice(-2);
    }
    case 'randomize': {
      const ri = Math.floor(Math.random() * 4);
      if (type === 'email') return FAKE_EMAILS[ri];
      if (type === 'phone') return FAKE_PHONES[ri];
      if (type === 'ip') return FAKE_IPS[ri];
      if (type === 'ssn') return `${100 + Math.floor(Math.random() * 899)}-${10 + Math.floor(Math.random() * 89)}-${1000 + Math.floor(Math.random() * 8999)}`;
      if (type === 'creditcard') return '4XXX-XXXX-XXXX-' + (1000 + Math.floor(Math.random() * 8999));
      if (type === 'dob') return `${String(1 + Math.floor(Math.random() * 12)).padStart(2, '0')}/${String(1 + Math.floor(Math.random() * 28)).padStart(2, '0')}/19${50 + Math.floor(Math.random() * 49)}`;
      return '***';
    }
    case 'asterisks':
    default: {
      if (type === 'email') {
        const [local, domain] = value.split('@');
        return local[0] + '***@' + domain;
      }
      if (value.length <= 4) return '****';
      return value[0] + '*'.repeat(value.length - 2) + value[value.length - 1];
    }
  }
}

export default function App() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [snackbar, setSnackbar] = useState('');
  const [stats, setStats] = useState<Record<string, number>>({});
  const [configs, setConfigs] = useState<Record<DataType, PatternConfig>>({
    email: { enabled: true, strategy: 'asterisks' },
    phone: { enabled: true, strategy: 'asterisks' },
    ssn: { enabled: true, strategy: 'redact' },
    creditcard: { enabled: true, strategy: 'redact' },
    ip: { enabled: true, strategy: 'partial' },
    dob: { enabled: true, strategy: 'asterisks' },
  });

  const applyMasking = useCallback(() => {
    if (!input.trim()) return;
    let result = input;
    const newStats: Record<string, number> = {};

    for (const [type, cfg] of Object.entries(configs) as [DataType, PatternConfig][]) {
      if (!cfg.enabled) continue;
      const { regex, label } = PATTERNS[type];
      const freshRegex = new RegExp(regex.source, regex.flags);
      const matches = result.match(freshRegex);
      if (matches) {
        newStats[label] = matches.length;
        result = result.replace(freshRegex, (match) => maskValue(match, type, cfg.strategy));
      }
    }

    setOutput(result);
    setStats(newStats);
  }, [input, configs]);

  const copyOutput = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setSnackbar('Masked data copied to clipboard');
  };

  const downloadOutput = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'masked-data.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalMasked = Object.values(stats).reduce((s, v) => s + v, 0);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a', p: 3 }}>
      <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Link to="/"><IconButton size="small" sx={{ color: 'grey.500' }}><Home /></IconButton></Link>
          <Security sx={{ color: '#f59e0b', fontSize: 28 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'grey.300' }}>Data Masking Tool</Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 340px', minWidth: 320 }}>
            <Paper sx={{ p: 2.5, bgcolor: '#111', border: '1px solid #222', mb: 2 }}>
              <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1.5 }}>Detection Patterns & Strategies</Typography>
              {(Object.entries(configs) as [DataType, PatternConfig][]).map(([type, cfg]) => (
                <Box key={type} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={cfg.enabled}
                        onChange={(e) => setConfigs({ ...configs, [type]: { ...cfg, enabled: e.target.checked } })}
                        sx={{ color: 'grey.600', '&.Mui-checked': { color: '#f59e0b' } }}
                      />
                    }
                    label={<Typography variant="body2" sx={{ color: 'grey.400', minWidth: 130 }}>{PATTERNS[type as DataType].label}</Typography>}
                    sx={{ mr: 0, flex: '0 0 auto' }}
                  />
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                      value={cfg.strategy}
                      onChange={(e) => setConfigs({ ...configs, [type]: { ...cfg, strategy: e.target.value as MaskStrategy } })}
                      sx={{ color: 'grey.300', fontSize: '0.8rem', '.MuiOutlinedInput-notchedOutline': { borderColor: '#333' } }}
                    >
                      <MenuItem value="asterisks">Asterisks</MenuItem>
                      <MenuItem value="hash">Hash</MenuItem>
                      <MenuItem value="redact">Redact</MenuItem>
                      <MenuItem value="partial">Partial</MenuItem>
                      <MenuItem value="randomize">Randomize</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              ))}
            </Paper>

            {totalMasked > 0 && (
              <Paper sx={{ p: 2, bgcolor: '#111', border: '1px solid #222' }}>
                <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1 }}>Masking Statistics</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {Object.entries(stats).map(([label, count]) => (
                    <Chip key={label} label={`${label}: ${count}`} size="small" sx={{ bgcolor: '#1a1a2e', color: '#f59e0b', border: '1px solid #333' }} />
                  ))}
                  <Chip label={`Total: ${totalMasked}`} size="small" sx={{ bgcolor: '#2a1a0e', color: '#fb923c', fontWeight: 700 }} />
                </Box>
              </Paper>
            )}
          </Box>

          <Box sx={{ flex: '2 1 500px', minWidth: 320 }}>
            <Paper sx={{ p: 2.5, bgcolor: '#111', border: '1px solid #222', mb: 2 }}>
              <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1 }}>Input Data (JSON, CSV, or Plain Text)</Typography>
              <TextField
                fullWidth
                multiline
                rows={8}
                placeholder={'Paste your data here...\n\nExamples:\njohn.doe@company.com\nSSN: 123-45-6789\nCard: 4111-1111-1111-1111\nIP: 192.168.0.100\nPhone: (555) 867-5309\nDOB: 03/15/1990'}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': { color: 'grey.300', fontFamily: 'monospace', fontSize: '0.85rem' },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
                }}
              />
              <Box sx={{ mt: 1.5, display: 'flex', gap: 1 }}>
                <Button variant="contained" onClick={applyMasking} disabled={!input.trim()}
                  sx={{ bgcolor: '#f59e0b', color: '#000', fontWeight: 600, '&:hover': { bgcolor: '#d97706' } }}>
                  <Visibility sx={{ mr: 0.5, fontSize: 18 }} /> Apply Masking
                </Button>
                <Button variant="outlined" onClick={() => { setInput(''); setOutput(''); setStats({}); }}
                  sx={{ borderColor: '#333', color: 'grey.500' }}>
                  Clear
                </Button>
              </Box>
            </Paper>

            {output && (
              <Paper sx={{ p: 2.5, bgcolor: '#111', border: '1px solid #222' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ color: 'grey.400' }}>Masked Output</Typography>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Copy masked data">
                      <IconButton size="small" onClick={copyOutput} sx={{ color: 'grey.500' }}>
                        <ContentCopy fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Download masked data">
                      <IconButton size="small" onClick={downloadOutput} sx={{ color: 'grey.500' }}>
                        <Download fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                <Box sx={{
                  p: 2, bgcolor: '#0d0d0d', borderRadius: 1, border: '1px solid #1a1a1a',
                  fontFamily: 'monospace', fontSize: '0.85rem', color: '#4ade80',
                  whiteSpace: 'pre-wrap', wordBreak: 'break-all', maxHeight: 300, overflow: 'auto',
                }}>
                  {output}
                </Box>
              </Paper>
            )}
          </Box>
        </Box>

        <Paper sx={{ p: 2, bgcolor: '#111', border: '1px solid #222', mt: 3 }}>
          <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1 }}>Strategy Reference</Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: 'grey.500', borderColor: '#222' }}>Strategy</TableCell>
                  <TableCell sx={{ color: 'grey.500', borderColor: '#222' }}>Example Input</TableCell>
                  <TableCell sx={{ color: 'grey.500', borderColor: '#222' }}>Example Output</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[
                  ['Asterisks', 'john@email.com', 'j***@email.com'],
                  ['Hash', 'john@email.com', '#a3f1b2c4'],
                  ['Redact', 'john@email.com', '[REDACTED]'],
                  ['Partial', '123-45-6789', '12*****89'],
                  ['Randomize', '(555) 867-5309', '(555) 123-4567'],
                ].map(([s, i, o]) => (
                  <TableRow key={s}>
                    <TableCell sx={{ color: 'grey.300', borderColor: '#222', fontWeight: 600 }}>{s}</TableCell>
                    <TableCell sx={{ color: 'grey.400', borderColor: '#222', fontFamily: 'monospace', fontSize: '0.8rem' }}>{i}</TableCell>
                    <TableCell sx={{ color: '#4ade80', borderColor: '#222', fontFamily: 'monospace', fontSize: '0.8rem' }}>{o}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
      <Snackbar open={!!snackbar} autoHideDuration={2000} onClose={() => setSnackbar('')} message={snackbar} />
    </Box>
  );
}
