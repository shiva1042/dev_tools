import { useState, useCallback } from 'react';
import {
  Box, Paper, Typography, TextField, Button, IconButton, Tooltip, Select,
  MenuItem, FormControl, InputLabel, Snackbar, Chip, Slider, Divider, LinearProgress,
} from '@mui/material';
import { ContentCopy, Home, Add, Delete, Refresh } from '@mui/icons-material';
import { Link } from 'react-router-dom';

type SecretType = 'random' | 'api_key' | 'jwt' | 'encryption' | 'db_password' | 'uuid' | 'hmac' | 'oauth_secret' | 'webhook';

interface GeneratedSecret { id: string; type: string; value: string; label: string; }

const CHARSETS: Record<string, string> = {
  alphanumeric: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  hex: '0123456789abcdef',
  base64: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
  'url-safe': 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_',
  all: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}|;:,.<>?',
};

const TYPE_INFO: Record<SecretType, { label: string; desc: string }> = {
  random: { label: 'Random String', desc: 'Configurable random string' },
  api_key: { label: 'API Key', desc: 'Prefixed API key (sk_live_, pk_test_, etc.)' },
  jwt: { label: 'JWT Secret', desc: '256/384/512-bit JWT signing secret' },
  encryption: { label: 'Encryption Key', desc: 'AES-128/256 key in hex or base64' },
  db_password: { label: 'Database Password', desc: 'Strong password for databases' },
  uuid: { label: 'UUID v4', desc: 'RFC 4122 UUID v4' },
  hmac: { label: 'HMAC Key', desc: 'HMAC signing key' },
  oauth_secret: { label: 'OAuth Client Secret', desc: 'OAuth2 client secret' },
  webhook: { label: 'Webhook Secret', desc: 'Webhook signing secret (whsec_)' },
};

function randomBytes(n: number): Uint8Array {
  const arr = new Uint8Array(n);
  crypto.getRandomValues(arr);
  return arr;
}

function randomFromCharset(len: number, charset: string): string {
  const arr = randomBytes(len);
  return Array.from(arr, b => charset[b % charset.length]).join('');
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

function toBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

function uuidV4(): string {
  const bytes = randomBytes(16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = toHex(bytes);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function calcEntropy(value: string, charsetSize: number): number {
  return Math.round(value.length * Math.log2(charsetSize));
}

export default function App() {
  const [secretType, setSecretType] = useState<SecretType>('random');
  const [length, setLength] = useState(32);
  const [charset, setCharset] = useState('alphanumeric');
  const [prefix, setPrefix] = useState('');
  const [batchCount, setBatchCount] = useState(1);
  const [jwtBits, setJwtBits] = useState(256);
  const [aesType, setAesType] = useState('AES-256');
  const [aesFormat, setAesFormat] = useState('hex');
  const [apiPrefix, setApiPrefix] = useState('sk_live_');
  const [secrets, setSecrets] = useState<GeneratedSecret[]>([]);
  const [snack, setSnack] = useState('');

  const copy = useCallback((t: string) => { navigator.clipboard.writeText(t); setSnack('Copied!'); }, []);

  const generate = useCallback(() => {
    const newSecrets: GeneratedSecret[] = [];
    for (let i = 0; i < batchCount; i++) {
      let value = '';
      let label = '';
      switch (secretType) {
        case 'random':
          value = (prefix ? prefix : '') + randomFromCharset(length, CHARSETS[charset] || CHARSETS.alphanumeric);
          label = `Random (${length} chars, ${charset})`;
          break;
        case 'api_key':
          value = apiPrefix + randomFromCharset(32, CHARSETS.alphanumeric);
          label = `API Key (${apiPrefix}...)`;
          break;
        case 'jwt':
          value = toBase64(randomBytes(jwtBits / 8));
          label = `JWT Secret (${jwtBits}-bit)`;
          break;
        case 'encryption': {
          const keyLen = aesType === 'AES-128' ? 16 : 32;
          const bytes = randomBytes(keyLen);
          value = aesFormat === 'hex' ? toHex(bytes) : toBase64(bytes);
          label = `${aesType} Key (${aesFormat})`;
          break;
        }
        case 'db_password':
          value = randomFromCharset(Math.max(length, 16), CHARSETS.all);
          label = `DB Password (${Math.max(length, 16)} chars)`;
          break;
        case 'uuid':
          value = uuidV4();
          label = 'UUID v4';
          break;
        case 'hmac':
          value = toBase64(randomBytes(32));
          label = 'HMAC Key (256-bit)';
          break;
        case 'oauth_secret':
          value = randomFromCharset(40, CHARSETS['url-safe']);
          label = 'OAuth Client Secret';
          break;
        case 'webhook':
          value = 'whsec_' + toBase64(randomBytes(24));
          label = 'Webhook Secret';
          break;
      }
      newSecrets.push({ id: Math.random().toString(36).slice(2, 9), type: secretType, value, label });
    }
    setSecrets(prev => [...newSecrets, ...prev]);
  }, [secretType, length, charset, prefix, batchCount, jwtBits, aesType, aesFormat, apiPrefix]);

  const removeSecret = (id: string) => setSecrets(prev => prev.filter(s => s.id !== id));
  const clearAll = () => setSecrets([]);
  const copyAll = () => copy(secrets.map(s => s.value).join('\n'));

  const getEntropy = (s: GeneratedSecret): number => {
    switch (s.type) {
      case 'random': return calcEntropy(s.value.slice(prefix.length), (CHARSETS[charset] || CHARSETS.alphanumeric).length);
      case 'api_key': return calcEntropy(s.value.slice(apiPrefix.length), CHARSETS.alphanumeric.length);
      case 'jwt': case 'hmac': case 'webhook': return s.value.length * 6;
      case 'encryption': return aesType === 'AES-128' ? 128 : 256;
      case 'db_password': return calcEntropy(s.value, CHARSETS.all.length);
      case 'uuid': return 122;
      case 'oauth_secret': return calcEntropy(s.value, CHARSETS['url-safe'].length);
      default: return 0;
    }
  };

  const entropyColor = (bits: number) => bits >= 256 ? '#4caf50' : bits >= 128 ? '#8bc34a' : bits >= 64 ? '#ff9800' : '#f44336';
  const entropyLabel = (bits: number) => bits >= 256 ? 'Excellent' : bits >= 128 ? 'Strong' : bits >= 64 ? 'Moderate' : 'Weak';

  const sxField = { '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#333' }, '&:hover fieldset': { borderColor: '#555' }, '&.Mui-focused fieldset': { borderColor: '#1976d2' } }, '& .MuiInputLabel-root': { color: 'grey.500' }, '& .MuiInputBase-input': { color: 'grey.300' }, '& .MuiSelect-icon': { color: 'grey.500' } };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a', color: 'grey.300', p: 3 }}>
      <Box sx={{ maxWidth: 960, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <Link to="/"><IconButton size="small" sx={{ color: 'grey.500' }}><Home /></IconButton></Link>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Secret Generator</Typography>
        </Box>

        <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            {Object.entries(TYPE_INFO).map(([k, v]) => (
              <Chip key={k} label={v.label} size="small" onClick={() => setSecretType(k as SecretType)}
                variant={secretType === k ? 'filled' : 'outlined'}
                sx={{ bgcolor: secretType === k ? '#1a2332' : 'transparent', color: secretType === k ? '#90caf9' : 'grey.600', borderColor: '#333' }} />
            ))}
          </Box>
          <Typography variant="body2" sx={{ color: 'grey.500', mb: 2 }}>{TYPE_INFO[secretType].desc}</Typography>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
            {(secretType === 'random' || secretType === 'db_password') && (
              <>
                <Box sx={{ width: 200 }}>
                  <Typography variant="caption" sx={{ color: 'grey.500' }}>Length: {length}</Typography>
                  <Slider value={length} onChange={(_, v) => setLength(v as number)} min={8} max={128} sx={{ color: '#1976d2' }} />
                </Box>
                {secretType === 'random' && (
                  <FormControl size="small" sx={{ minWidth: 150, ...sxField }}>
                    <InputLabel sx={{ color: 'grey.500' }}>Charset</InputLabel>
                    <Select value={charset} label="Charset" onChange={e => setCharset(e.target.value)} sx={{ color: 'grey.300' }}>
                      {Object.keys(CHARSETS).map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                    </Select>
                  </FormControl>
                )}
                {secretType === 'random' && (
                  <TextField size="small" label="Prefix" value={prefix} onChange={e => setPrefix(e.target.value)} sx={{ width: 120, ...sxField }} />
                )}
              </>
            )}
            {secretType === 'api_key' && (
              <FormControl size="small" sx={{ minWidth: 150, ...sxField }}>
                <InputLabel sx={{ color: 'grey.500' }}>Prefix</InputLabel>
                <Select value={apiPrefix} label="Prefix" onChange={e => setApiPrefix(e.target.value)} sx={{ color: 'grey.300' }}>
                  {['sk_live_', 'sk_test_', 'pk_live_', 'pk_test_', 'api_', 'key_'].map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                </Select>
              </FormControl>
            )}
            {secretType === 'jwt' && (
              <FormControl size="small" sx={{ minWidth: 120, ...sxField }}>
                <InputLabel sx={{ color: 'grey.500' }}>Bits</InputLabel>
                <Select value={jwtBits} label="Bits" onChange={e => setJwtBits(Number(e.target.value))} sx={{ color: 'grey.300' }}>
                  {[256, 384, 512].map(b => <MenuItem key={b} value={b}>{b}-bit</MenuItem>)}
                </Select>
              </FormControl>
            )}
            {secretType === 'encryption' && (
              <>
                <FormControl size="small" sx={{ minWidth: 120, ...sxField }}>
                  <InputLabel sx={{ color: 'grey.500' }}>Type</InputLabel>
                  <Select value={aesType} label="Type" onChange={e => setAesType(e.target.value)} sx={{ color: 'grey.300' }}>
                    <MenuItem value="AES-128">AES-128</MenuItem>
                    <MenuItem value="AES-256">AES-256</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 120, ...sxField }}>
                  <InputLabel sx={{ color: 'grey.500' }}>Format</InputLabel>
                  <Select value={aesFormat} label="Format" onChange={e => setAesFormat(e.target.value)} sx={{ color: 'grey.300' }}>
                    <MenuItem value="hex">Hex</MenuItem>
                    <MenuItem value="base64">Base64</MenuItem>
                  </Select>
                </FormControl>
              </>
            )}
            <TextField size="small" label="Batch Count" type="number" value={batchCount} onChange={e => setBatchCount(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))} sx={{ width: 120, ...sxField }} />
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="contained" startIcon={<Refresh />} onClick={generate}>Generate</Button>
            {secrets.length > 0 && (
              <>
                <Button variant="outlined" onClick={copyAll} sx={{ borderColor: '#333', color: 'grey.400' }}>Copy All</Button>
                <Button variant="outlined" onClick={clearAll} sx={{ borderColor: '#333', color: 'grey.400' }}>Clear</Button>
              </>
            )}
          </Box>
        </Paper>

        {secrets.map(s => {
          const entropy = getEntropy(s);
          return (
            <Paper key={s.id} sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" sx={{ color: 'grey.500' }}>{s.label}</Typography>
                  <Chip label={`${entropy} bits`} size="small" sx={{ bgcolor: entropyColor(entropy) + '22', color: entropyColor(entropy), fontSize: 10, height: 20 }} />
                  <Typography variant="caption" sx={{ color: entropyColor(entropy), fontSize: 10 }}>{entropyLabel(entropy)}</Typography>
                </Box>
                <Box>
                  <Tooltip title="Copy"><IconButton size="small" onClick={() => copy(s.value)} sx={{ color: 'grey.500' }}><ContentCopy fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Remove"><IconButton size="small" onClick={() => removeSecret(s.id)} sx={{ color: 'grey.600' }}><Delete fontSize="small" /></IconButton></Tooltip>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ fontFamily: 'monospace', fontSize: 13, color: '#81c784', wordBreak: 'break-all', flex: 1 }}>{s.value}</Typography>
              </Box>
              <LinearProgress variant="determinate" value={Math.min(100, (entropy / 256) * 100)} sx={{ mt: 0.5, height: 3, borderRadius: 1, bgcolor: '#1a1a1a', '& .MuiLinearProgress-bar': { bgcolor: entropyColor(entropy) } }} />
            </Paper>
          );
        })}
      </Box>
      <Snackbar open={!!snack} autoHideDuration={2000} onClose={() => setSnack('')} message={snack} />
    </Box>
  );
}
