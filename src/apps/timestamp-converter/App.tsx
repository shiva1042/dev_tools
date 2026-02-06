import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Tooltip,
  Snackbar,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  ContentCopy,
  Home,
  Refresh,
  SwapVert,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

interface TimestampFormat {
  name: string;
  example: string;
  toTimestamp: (value: string) => number | null;
  fromTimestamp: (ts: number, tz?: string) => string;
}

const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Los_Angeles',
  'America/Chicago',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Singapore',
  'Asia/Kolkata',
  'Australia/Sydney',
  'Pacific/Auckland',
];

export default function TimestampConverter() {
  const [inputValue, setInputValue] = useState('');
  const [inputType, setInputType] = useState<'auto' | 'unix-s' | 'unix-ms' | 'iso' | 'date'>('auto');
  const [timezone, setTimezone] = useState('UTC');
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formats: TimestampFormat[] = useMemo(() => [
    {
      name: 'Unix Timestamp (seconds)',
      example: '1704067200',
      toTimestamp: (v) => {
        const n = parseInt(v);
        return !isNaN(n) && v.length <= 10 ? n * 1000 : null;
      },
      fromTimestamp: (ts) => Math.floor(ts / 1000).toString(),
    },
    {
      name: 'Unix Timestamp (milliseconds)',
      example: '1704067200000',
      toTimestamp: (v) => {
        const n = parseInt(v);
        return !isNaN(n) && v.length > 10 ? n : null;
      },
      fromTimestamp: (ts) => ts.toString(),
    },
    {
      name: 'ISO 8601',
      example: '2024-01-01T00:00:00Z',
      toTimestamp: (v) => {
        const d = new Date(v);
        return isNaN(d.getTime()) ? null : d.getTime();
      },
      fromTimestamp: (ts, tz = 'UTC') => {
        const d = new Date(ts);
        if (tz === 'UTC') return d.toISOString();
        return d.toLocaleString('sv-SE', { timeZone: tz }).replace(' ', 'T') + getTimezoneOffset(tz, d);
      },
    },
    {
      name: 'ISO 8601 (Date only)',
      example: '2024-01-01',
      toTimestamp: (v) => {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
        const d = new Date(v + 'T00:00:00Z');
        return isNaN(d.getTime()) ? null : d.getTime();
      },
      fromTimestamp: (ts, tz) => {
        const d = new Date(ts);
        return d.toLocaleDateString('sv-SE', { timeZone: tz || 'UTC' });
      },
    },
    {
      name: 'RFC 2822',
      example: 'Mon, 01 Jan 2024 00:00:00 +0000',
      toTimestamp: (v) => {
        const d = new Date(v);
        return isNaN(d.getTime()) ? null : d.getTime();
      },
      fromTimestamp: (ts, tz) => {
        const d = new Date(ts);
        return d.toUTCString();
      },
    },
    {
      name: 'Human Readable',
      example: 'January 1, 2024 at 12:00 AM',
      toTimestamp: (v) => {
        const d = new Date(v);
        return isNaN(d.getTime()) ? null : d.getTime();
      },
      fromTimestamp: (ts, tz) => {
        const d = new Date(ts);
        return d.toLocaleString('en-US', {
          timeZone: tz || 'UTC',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        });
      },
    },
    {
      name: 'Java Instant',
      example: '2024-01-01T00:00:00.000Z',
      toTimestamp: (v) => {
        const d = new Date(v);
        return isNaN(d.getTime()) ? null : d.getTime();
      },
      fromTimestamp: (ts) => new Date(ts).toISOString(),
    },
    {
      name: 'SQL Timestamp',
      example: '2024-01-01 00:00:00',
      toTimestamp: (v) => {
        const d = new Date(v.replace(' ', 'T') + 'Z');
        return isNaN(d.getTime()) ? null : d.getTime();
      },
      fromTimestamp: (ts, tz) => {
        const d = new Date(ts);
        return d.toLocaleString('sv-SE', { timeZone: tz || 'UTC' }).replace('T', ' ');
      },
    },
    {
      name: 'Relative Time',
      example: '2 hours ago',
      toTimestamp: () => null, // Can't parse relative time reliably
      fromTimestamp: (ts) => {
        const now = Date.now();
        const diff = now - ts;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const weeks = Math.floor(days / 7);
        const months = Math.floor(days / 30);
        const years = Math.floor(days / 365);

        if (diff < 0) {
          const absDiff = Math.abs(diff);
          const s = Math.floor(absDiff / 1000);
          const m = Math.floor(s / 60);
          const h = Math.floor(m / 60);
          const d = Math.floor(h / 24);
          if (d > 0) return `in ${d} day${d > 1 ? 's' : ''}`;
          if (h > 0) return `in ${h} hour${h > 1 ? 's' : ''}`;
          if (m > 0) return `in ${m} minute${m > 1 ? 's' : ''}`;
          return `in ${s} second${s > 1 ? 's' : ''}`;
        }

        if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
        if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
        if (weeks > 0) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        return `${seconds} second${seconds > 1 ? 's' : ''} ago`;
      },
    },
  ], []);

  const getTimezoneOffset = (tz: string, date: Date): string => {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      timeZoneName: 'shortOffset',
    });
    const parts = formatter.formatToParts(date);
    const offsetPart = parts.find(p => p.type === 'timeZoneName');
    if (offsetPart) {
      const match = offsetPart.value.match(/GMT([+-]\d{1,2})/);
      if (match) {
        const hours = parseInt(match[1]);
        return `${hours >= 0 ? '+' : ''}${String(Math.abs(hours)).padStart(2, '0')}:00`;
      }
    }
    return '+00:00';
  };

  const detectedTimestamp = useMemo(() => {
    if (!inputValue.trim()) return null;

    if (inputType !== 'auto') {
      const formatMap: Record<string, number> = {
        'unix-s': 0,
        'unix-ms': 1,
        'iso': 2,
        'date': 3,
      };
      const format = formats[formatMap[inputType]];
      if (format) {
        const ts = format.toTimestamp(inputValue);
        if (ts !== null) return ts;
      }
    }

    // Auto-detect
    for (const format of formats) {
      const ts = format.toTimestamp(inputValue);
      if (ts !== null) return ts;
    }
    return null;
  }, [inputValue, inputType, formats]);

  const conversions = useMemo(() => {
    const ts = detectedTimestamp ?? currentTime;
    return formats.map(format => ({
      name: format.name,
      value: format.fromTimestamp(ts, timezone),
    }));
  }, [detectedTimestamp, currentTime, formats, timezone]);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setSnackbar({ open: true, message: 'Copied to clipboard' });
  };

  const handleSetNow = () => {
    setInputValue(Date.now().toString());
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a' }}>
      <Paper elevation={0} sx={{ bgcolor: '#111', borderBottom: '1px solid #222', px: 3, py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Link to="/"><IconButton size="small" sx={{ color: 'grey.500' }}><Home /></IconButton></Link>
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>Timestamp Converter</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip label={`Now: ${currentTime}`} size="small" />
            <Tooltip title="Use Current Time">
              <IconButton onClick={handleSetNow} sx={{ color: 'grey.500' }}>
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
        {/* Input Section */}
        <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 3, mb: 3 }}>
          <Typography variant="subtitle1" sx={{ color: 'grey.300', mb: 2 }}>Input</Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              size="small"
              label="Enter timestamp or date"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="1704067200, 2024-01-01T00:00:00Z, or any date format"
              sx={{ '& .MuiInputBase-root': { color: 'grey.300', fontFamily: 'monospace' } }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel sx={{ color: 'grey.500' }}>Input Type</InputLabel>
              <Select value={inputType} label="Input Type" onChange={(e) => setInputType(e.target.value as typeof inputType)} sx={{ color: 'grey.300' }}>
                <MenuItem value="auto">Auto Detect</MenuItem>
                <MenuItem value="unix-s">Unix (seconds)</MenuItem>
                <MenuItem value="unix-ms">Unix (milliseconds)</MenuItem>
                <MenuItem value="iso">ISO 8601</MenuItem>
                <MenuItem value="date">Date String</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel sx={{ color: 'grey.500' }}>Timezone</InputLabel>
              <Select value={timezone} label="Timezone" onChange={(e) => setTimezone(e.target.value)} sx={{ color: 'grey.300' }}>
                {TIMEZONES.map(tz => <MenuItem key={tz} value={tz}>{tz}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
          {detectedTimestamp && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip label="Detected" size="small" color="success" />
              <Typography variant="body2" sx={{ color: 'grey.400', fontFamily: 'monospace' }}>
                {detectedTimestamp} ms
              </Typography>
            </Box>
          )}
          {inputValue && !detectedTimestamp && (
            <Chip label="Could not parse input" size="small" color="error" />
          )}
        </Paper>

        {/* Conversions Grid */}
        <Typography variant="subtitle1" sx={{ color: 'grey.300', mb: 2 }}>
          {inputValue ? 'Converted Formats' : 'Current Time in All Formats'}
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 2 }}>
          {conversions.map((conv, index) => (
            <Paper
              key={index}
              sx={{
                bgcolor: '#111',
                border: '1px solid #222',
                p: 2,
                cursor: 'pointer',
                '&:hover': { borderColor: '#444' },
              }}
              onClick={() => handleCopy(conv.value)}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="caption" sx={{ color: 'grey.500' }}>{conv.name}</Typography>
                  <Typography
                    sx={{
                      color: 'grey.200',
                      fontFamily: 'monospace',
                      fontSize: 13,
                      wordBreak: 'break-all',
                      mt: 0.5,
                    }}
                  >
                    {conv.value}
                  </Typography>
                </Box>
                <Tooltip title="Copy">
                  <IconButton size="small" sx={{ color: 'grey.500', ml: 1 }}>
                    <ContentCopy fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Paper>
          ))}
        </Box>

        {/* Quick Reference */}
        <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 3, mt: 3 }}>
          <Typography variant="subtitle1" sx={{ color: 'grey.300', mb: 2 }}>Quick Reference</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 2 }}>
            <Box>
              <Typography variant="caption" sx={{ color: 'grey.500' }}>Java</Typography>
              <Typography sx={{ color: 'grey.300', fontFamily: 'monospace', fontSize: 12 }}>
                Instant.now().toEpochMilli()<br />
                Instant.ofEpochMilli(ts)
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: 'grey.500' }}>JavaScript</Typography>
              <Typography sx={{ color: 'grey.300', fontFamily: 'monospace', fontSize: 12 }}>
                Date.now()<br />
                new Date(ts)
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: 'grey.500' }}>Python</Typography>
              <Typography sx={{ color: 'grey.300', fontFamily: 'monospace', fontSize: 12 }}>
                import time; time.time()<br />
                datetime.fromtimestamp(ts)
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: 'grey.500' }}>PostgreSQL</Typography>
              <Typography sx={{ color: 'grey.300', fontFamily: 'monospace', fontSize: 12 }}>
                EXTRACT(EPOCH FROM NOW())<br />
                TO_TIMESTAMP(ts)
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={2000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} />
    </Box>
  );
}
