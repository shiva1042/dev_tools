import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Slider,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import HomeIcon from '@mui/icons-material/Home';
import StorageIcon from '@mui/icons-material/Storage';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#06b6d4' },
    background: { default: '#0f172a', paper: '#1e293b' },
  },
});

type Unit = 'B' | 'KB' | 'MB' | 'GB' | 'TB' | 'PB';

interface UnitInfo {
  name: string;
  bytes: number;
}

const units: Record<Unit, UnitInfo> = {
  B: { name: 'Bytes', bytes: 1 },
  KB: { name: 'Kilobytes', bytes: 1024 },
  MB: { name: 'Megabytes', bytes: 1024 ** 2 },
  GB: { name: 'Gigabytes', bytes: 1024 ** 3 },
  TB: { name: 'Terabytes', bytes: 1024 ** 4 },
  PB: { name: 'Petabytes', bytes: 1024 ** 5 },
};

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatNumber = (num: number): string => {
  if (num >= 1e15) return (num / 1e15).toFixed(2) + ' P';
  if (num >= 1e12) return (num / 1e12).toFixed(2) + ' T';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + ' B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + ' M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + ' K';
  return num.toFixed(2);
};

export default function App() {
  const [value, setValue] = useState('100');
  const [unit, setUnit] = useState<Unit>('MB');
  const [bandwidth, setBandwidth] = useState(100); // Mbps

  const bytes = useMemo(() => {
    const num = parseFloat(value) || 0;
    return num * units[unit].bytes;
  }, [value, unit]);

  const conversions = useMemo(() => {
    return (Object.keys(units) as Unit[]).map((u) => ({
      unit: u,
      name: units[u].name,
      value: bytes / units[u].bytes,
    }));
  }, [bytes]);

  const downloadTime = useMemo(() => {
    const bitsPerSecond = bandwidth * 1e6;
    const bits = bytes * 8;
    const seconds = bits / bitsPerSecond;

    if (seconds < 1) return `${(seconds * 1000).toFixed(0)} ms`;
    if (seconds < 60) return `${seconds.toFixed(1)} seconds`;
    if (seconds < 3600) return `${(seconds / 60).toFixed(1)} minutes`;
    if (seconds < 86400) return `${(seconds / 3600).toFixed(1)} hours`;
    return `${(seconds / 86400).toFixed(1)} days`;
  }, [bytes, bandwidth]);

  const storageExamples = [
    { name: 'Text document (1 page)', bytes: 2000 },
    { name: 'MP3 song (5 min)', bytes: 5 * 1024 * 1024 },
    { name: 'HD Photo', bytes: 5 * 1024 * 1024 },
    { name: 'HD Video (1 hour)', bytes: 4 * 1024 * 1024 * 1024 },
    { name: '4K Video (1 hour)', bytes: 20 * 1024 * 1024 * 1024 },
    { name: 'Blu-ray Movie', bytes: 50 * 1024 * 1024 * 1024 },
  ];

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', p: 3 }}>
        <Box sx={{ maxWidth: 900, mx: 'auto' }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
            <IconButton component={Link} to="/" size="small">
              <HomeIcon />
            </IconButton>
            <StorageIcon sx={{ color: 'primary.main', fontSize: 32 }} />
            <Typography variant="h5" fontWeight={600} color="primary.main">
              File Size Calculator
            </Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Convert Size
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  <TextField
                    label="Value"
                    type="number"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    sx={{ flex: 2 }}
                  />
                  <FormControl sx={{ flex: 1 }}>
                    <InputLabel>Unit</InputLabel>
                    <Select value={unit} label="Unit" onChange={(e) => setUnit(e.target.value as Unit)}>
                      {(Object.keys(units) as Unit[]).map((u) => (
                        <MenuItem key={u} value={u}>
                          {u}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Typography variant="subtitle2" gutterBottom>
                  Conversions
                </Typography>
                <Grid container spacing={1}>
                  {conversions.map((conv) => (
                    <Grid size={{ xs: 6 }} key={conv.unit}>
                      <Paper sx={{ p: 1.5, bgcolor: 'action.hover' }}>
                        <Typography variant="caption" color="text.secondary">
                          {conv.name}
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {conv.value >= 0.01 ? formatNumber(conv.value) : conv.value.toExponential(2)} {conv.unit}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Typography variant="subtitle2" gutterBottom>
                  Total Bytes
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'action.hover', textAlign: 'center' }}>
                  <Typography variant="h5" color="primary.main" fontFamily="monospace">
                    {bytes.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    bytes
                  </Typography>
                </Paper>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Download Time
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Bandwidth: {bandwidth} Mbps
                </Typography>
                <Slider
                  value={bandwidth}
                  onChange={(_, v) => setBandwidth(v as number)}
                  min={1}
                  max={1000}
                  valueLabelDisplay="auto"
                  marks={[
                    { value: 10, label: '10' },
                    { value: 100, label: '100' },
                    { value: 500, label: '500' },
                    { value: 1000, label: '1000' },
                  ]}
                  sx={{ mb: 2 }}
                />
                <Paper sx={{ p: 2, bgcolor: 'action.hover', textAlign: 'center' }}>
                  <Typography variant="h5" color="primary.main">
                    {downloadTime}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    to download {formatBytes(bytes)}
                  </Typography>
                </Paper>
              </Paper>

              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Storage Comparison
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  How much can {formatBytes(bytes)} store?
                </Typography>
                {storageExamples.map((example) => {
                  const count = bytes / example.bytes;
                  return (
                    <Box key={example.name} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">{example.name}</Typography>
                      <Typography variant="body2" fontWeight={600} color={count >= 1 ? 'success.main' : 'text.secondary'}>
                        {count >= 1 ? `~${Math.floor(count).toLocaleString()}` : '<1'}
                      </Typography>
                    </Box>
                  );
                })}
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
