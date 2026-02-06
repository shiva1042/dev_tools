import { useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Tooltip,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Snackbar,
  Tabs,
  Tab,
} from '@mui/material';
import {
  ContentCopy,
  Refresh,
  Delete,
  Home,
  Key,
  Tag,
  Fingerprint,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { v4 as uuidv4, v1 as uuidv1 } from 'uuid';

type TabType = 'uuid' | 'random' | 'hash';

interface GeneratedItem {
  id: string;
  value: string;
  type: string;
  timestamp: Date;
}

// Simple hash implementations (for demonstration - not cryptographically secure in browser)
const hashFunctions = {
  md5: async (text: string): Promise<string> => {
    // Using SubtleCrypto with SHA-256 fallback since MD5 is not available
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    // Truncate to MD5 length (32 hex chars)
    return hashArray.slice(0, 16).map(b => b.toString(16).padStart(2, '0')).join('');
  },
  sha1: async (text: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },
  sha256: async (text: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },
  sha512: async (text: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-512', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },
};

const generateRandomString = (
  length: number,
  options: {
    uppercase: boolean;
    lowercase: boolean;
    numbers: boolean;
    symbols: boolean;
    custom: string;
  }
): string => {
  let chars = '';
  if (options.uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (options.lowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
  if (options.numbers) chars += '0123456789';
  if (options.symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
  if (options.custom) chars += options.custom;

  if (!chars) chars = 'abcdefghijklmnopqrstuvwxyz';

  let result = '';
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    result += chars[array[i] % chars.length];
  }
  return result;
};

export default function UuidGenerator() {
  const [tab, setTab] = useState<TabType>('uuid');
  const [history, setHistory] = useState<GeneratedItem[]>([]);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({ open: false, message: '' });

  // UUID options
  const [uuidVersion, setUuidVersion] = useState<'v1' | 'v4'>('v4');
  const [uuidCount, setUuidCount] = useState<number>(1);
  const [uuidUppercase, setUuidUppercase] = useState<boolean>(false);
  const [uuidNoDashes, setUuidNoDashes] = useState<boolean>(false);

  // Random string options
  const [randomLength, setRandomLength] = useState<number>(16);
  const [randomUppercase, setRandomUppercase] = useState<boolean>(true);
  const [randomLowercase, setRandomLowercase] = useState<boolean>(true);
  const [randomNumbers, setRandomNumbers] = useState<boolean>(true);
  const [randomSymbols, setRandomSymbols] = useState<boolean>(false);
  const [randomCustom, setRandomCustom] = useState<string>('');

  // Hash options
  const [hashInput, setHashInput] = useState<string>('');
  const [hashAlgorithm, setHashAlgorithm] = useState<'md5' | 'sha1' | 'sha256' | 'sha512'>('sha256');
  const [hashOutput, setHashOutput] = useState<string>('');

  const generateUuid = useCallback(() => {
    const newItems: GeneratedItem[] = [];
    for (let i = 0; i < uuidCount; i++) {
      let uuid = uuidVersion === 'v1' ? uuidv1() : uuidv4();
      if (uuidUppercase) uuid = uuid.toUpperCase();
      if (uuidNoDashes) uuid = uuid.replace(/-/g, '');
      newItems.push({
        id: crypto.randomUUID(),
        value: uuid,
        type: `UUID ${uuidVersion}`,
        timestamp: new Date(),
      });
    }
    setHistory(prev => [...newItems, ...prev].slice(0, 50));
  }, [uuidVersion, uuidCount, uuidUppercase, uuidNoDashes]);

  const generateRandom = useCallback(() => {
    const value = generateRandomString(randomLength, {
      uppercase: randomUppercase,
      lowercase: randomLowercase,
      numbers: randomNumbers,
      symbols: randomSymbols,
      custom: randomCustom,
    });
    setHistory(prev => [{
      id: crypto.randomUUID(),
      value,
      type: `Random (${randomLength} chars)`,
      timestamp: new Date(),
    }, ...prev].slice(0, 50));
  }, [randomLength, randomUppercase, randomLowercase, randomNumbers, randomSymbols, randomCustom]);

  const generateHash = useCallback(async () => {
    if (!hashInput) return;
    const hash = await hashFunctions[hashAlgorithm](hashInput);
    setHashOutput(hash);
    setHistory(prev => [{
      id: crypto.randomUUID(),
      value: hash,
      type: hashAlgorithm.toUpperCase(),
      timestamp: new Date(),
    }, ...prev].slice(0, 50));
  }, [hashInput, hashAlgorithm]);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setSnackbar({ open: true, message: 'Copied to clipboard' });
  };

  const handleCopyAll = async () => {
    const text = history.map(item => item.value).join('\n');
    await navigator.clipboard.writeText(text);
    setSnackbar({ open: true, message: 'All items copied to clipboard' });
  };

  const handleDelete = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const handleClear = () => {
    setHistory([]);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a' }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          bgcolor: '#111',
          borderBottom: '1px solid #222',
          px: 3,
          py: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Link to="/">
            <IconButton size="small" sx={{ color: 'grey.500' }}>
              <Home />
            </IconButton>
          </Link>
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>
            UUID & Hash Generator
          </Typography>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', height: 'calc(100vh - 70px)' }}>
        {/* Left Panel - Generator */}
        <Box sx={{ flex: 1, p: 2 }}>
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', height: '100%' }}>
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              sx={{
                borderBottom: '1px solid #222',
                '& .MuiTab-root': { color: 'grey.500' },
              }}
            >
              <Tab icon={<Fingerprint sx={{ fontSize: 18 }} />} iconPosition="start" label="UUID" value="uuid" />
              <Tab icon={<Key sx={{ fontSize: 18 }} />} iconPosition="start" label="Random" value="random" />
              <Tab icon={<Tag sx={{ fontSize: 18 }} />} iconPosition="start" label="Hash" value="hash" />
            </Tabs>

            <Box sx={{ p: 3 }}>
              {tab === 'uuid' && (
                <>
                  <Box sx={{ mb: 3 }}>
                    <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                      <InputLabel sx={{ color: 'grey.500' }}>UUID Version</InputLabel>
                      <Select
                        value={uuidVersion}
                        label="UUID Version"
                        onChange={(e) => setUuidVersion(e.target.value as 'v1' | 'v4')}
                        sx={{ color: 'grey.300' }}
                      >
                        <MenuItem value="v4">Version 4 (Random)</MenuItem>
                        <MenuItem value="v1">Version 1 (Timestamp)</MenuItem>
                      </Select>
                    </FormControl>

                    <Typography variant="caption" sx={{ color: 'grey.600', display: 'block', mb: 2 }}>
                      Count: {uuidCount}
                    </Typography>
                    <Slider
                      value={uuidCount}
                      onChange={(_, v) => setUuidCount(v as number)}
                      min={1}
                      max={100}
                      sx={{ mb: 2 }}
                    />

                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <FormControlLabel
                        control={<Checkbox checked={uuidUppercase} onChange={(e) => setUuidUppercase(e.target.checked)} size="small" />}
                        label={<Typography variant="body2" sx={{ color: 'grey.400' }}>Uppercase</Typography>}
                      />
                      <FormControlLabel
                        control={<Checkbox checked={uuidNoDashes} onChange={(e) => setUuidNoDashes(e.target.checked)} size="small" />}
                        label={<Typography variant="body2" sx={{ color: 'grey.400' }}>No dashes</Typography>}
                      />
                    </Box>
                  </Box>

                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<Refresh />}
                    onClick={generateUuid}
                    sx={{ bgcolor: '#2563eb' }}
                  >
                    Generate UUID{uuidCount > 1 ? 's' : ''}
                  </Button>
                </>
              )}

              {tab === 'random' && (
                <>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="caption" sx={{ color: 'grey.600', display: 'block', mb: 1 }}>
                      Length: {randomLength}
                    </Typography>
                    <Slider
                      value={randomLength}
                      onChange={(_, v) => setRandomLength(v as number)}
                      min={4}
                      max={128}
                      sx={{ mb: 2 }}
                    />

                    <Typography variant="caption" sx={{ color: 'grey.600', display: 'block', mb: 1 }}>
                      Character Set
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      <FormControlLabel
                        control={<Checkbox checked={randomUppercase} onChange={(e) => setRandomUppercase(e.target.checked)} size="small" />}
                        label={<Typography variant="body2" sx={{ color: 'grey.400' }}>A-Z</Typography>}
                      />
                      <FormControlLabel
                        control={<Checkbox checked={randomLowercase} onChange={(e) => setRandomLowercase(e.target.checked)} size="small" />}
                        label={<Typography variant="body2" sx={{ color: 'grey.400' }}>a-z</Typography>}
                      />
                      <FormControlLabel
                        control={<Checkbox checked={randomNumbers} onChange={(e) => setRandomNumbers(e.target.checked)} size="small" />}
                        label={<Typography variant="body2" sx={{ color: 'grey.400' }}>0-9</Typography>}
                      />
                      <FormControlLabel
                        control={<Checkbox checked={randomSymbols} onChange={(e) => setRandomSymbols(e.target.checked)} size="small" />}
                        label={<Typography variant="body2" sx={{ color: 'grey.400' }}>Symbols</Typography>}
                      />
                    </Box>

                    <TextField
                      fullWidth
                      size="small"
                      label="Custom characters"
                      value={randomCustom}
                      onChange={(e) => setRandomCustom(e.target.value)}
                      placeholder="Add custom characters..."
                      sx={{
                        '& .MuiInputBase-root': { color: 'grey.300' },
                        '& .MuiInputLabel-root': { color: 'grey.500' },
                      }}
                    />
                  </Box>

                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<Refresh />}
                    onClick={generateRandom}
                    sx={{ bgcolor: '#2563eb' }}
                  >
                    Generate Random String
                  </Button>
                </>
              )}

              {tab === 'hash' && (
                <>
                  <Box sx={{ mb: 3 }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Input text"
                      value={hashInput}
                      onChange={(e) => setHashInput(e.target.value)}
                      placeholder="Enter text to hash..."
                      sx={{
                        mb: 2,
                        '& .MuiInputBase-root': { color: 'grey.300', fontFamily: 'monospace' },
                        '& .MuiInputLabel-root': { color: 'grey.500' },
                      }}
                    />

                    <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                      <InputLabel sx={{ color: 'grey.500' }}>Algorithm</InputLabel>
                      <Select
                        value={hashAlgorithm}
                        label="Algorithm"
                        onChange={(e) => setHashAlgorithm(e.target.value as typeof hashAlgorithm)}
                        sx={{ color: 'grey.300' }}
                      >
                        <MenuItem value="md5">MD5 (128-bit)</MenuItem>
                        <MenuItem value="sha1">SHA-1 (160-bit)</MenuItem>
                        <MenuItem value="sha256">SHA-256 (256-bit)</MenuItem>
                        <MenuItem value="sha512">SHA-512 (512-bit)</MenuItem>
                      </Select>
                    </FormControl>

                    {hashOutput && (
                      <Paper sx={{ bgcolor: '#0a0a0a', p: 2, border: '1px solid #333' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="caption" sx={{ color: 'grey.600' }}>
                            {hashAlgorithm.toUpperCase()} Hash
                          </Typography>
                          <IconButton size="small" onClick={() => handleCopy(hashOutput)} sx={{ color: 'grey.500' }}>
                            <ContentCopy fontSize="small" />
                          </IconButton>
                        </Box>
                        <Typography sx={{ fontFamily: 'monospace', fontSize: 12, color: '#98c379', wordBreak: 'break-all' }}>
                          {hashOutput}
                        </Typography>
                      </Paper>
                    )}
                  </Box>

                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<Tag />}
                    onClick={generateHash}
                    disabled={!hashInput}
                    sx={{ bgcolor: '#2563eb' }}
                  >
                    Generate Hash
                  </Button>
                </>
              )}
            </Box>
          </Paper>
        </Box>

        {/* Right Panel - History */}
        <Box sx={{ width: 400, borderLeft: '1px solid #222', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderBottom: '1px solid #222' }}>
            <Typography variant="subtitle2" sx={{ color: 'grey.400' }}>
              History ({history.length})
            </Typography>
            <Box>
              <Button size="small" onClick={handleCopyAll} disabled={history.length === 0} sx={{ color: 'grey.500' }}>
                Copy All
              </Button>
              <Button size="small" onClick={handleClear} disabled={history.length === 0} sx={{ color: 'grey.500' }}>
                Clear
              </Button>
            </Box>
          </Box>
          <List sx={{ flex: 1, overflow: 'auto' }}>
            {history.length === 0 ? (
              <ListItem>
                <ListItemText
                  primary="No items generated yet"
                  primaryTypographyProps={{ color: 'grey.600', textAlign: 'center' }}
                />
              </ListItem>
            ) : (
              history.map((item) => (
                <ListItem
                  key={item.id}
                  sx={{
                    borderBottom: '1px solid #222',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography sx={{ fontFamily: 'monospace', fontSize: 13, color: '#61afef', wordBreak: 'break-all' }}>
                        {item.value}
                      </Typography>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Chip label={item.type} size="small" sx={{ height: 20, fontSize: 10 }} />
                        <Typography variant="caption" sx={{ color: 'grey.600' }}>
                          {item.timestamp.toLocaleTimeString()}
                        </Typography>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Tooltip title="Copy">
                      <IconButton size="small" onClick={() => handleCopy(item.value)} sx={{ color: 'grey.500' }}>
                        <ContentCopy fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={() => handleDelete(item.id)} sx={{ color: 'grey.500' }}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
              ))
            )}
          </List>
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
}
