import { useState, useMemo, useCallback } from 'react';
import {
  Box, Paper, Typography, TextField, Button, IconButton, Tooltip, Select, MenuItem,
  FormControl, InputLabel, Snackbar, Chip, Tabs, Tab,
} from '@mui/material';
import { ContentCopy, Home, Search, Delete, FilterList } from '@mui/icons-material';
import { Link } from 'react-router-dom';

interface LogEntry {
  raw: string; timestamp?: string; level?: string; source?: string; message: string;
  method?: string; url?: string; status?: number; responseTime?: number; ip?: string;
}

const LEVEL_COLORS: Record<string, string> = { DEBUG: '#90caf9', INFO: '#81c784', WARN: '#ffb74d', ERROR: '#ef5350', FATAL: '#f44336', TRACE: '#b0bec5' };
const LEVELS = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL', 'TRACE'];

const SAMPLE_LOGS = `192.168.1.10 - - [15/Jan/2024:10:22:03 +0000] "GET /api/users HTTP/1.1" 200 1234 0.045
192.168.1.11 - - [15/Jan/2024:10:22:05 +0000] "POST /api/login HTTP/1.1" 401 89 0.123
192.168.1.10 - - [15/Jan/2024:10:22:08 +0000] "GET /api/products HTTP/1.1" 200 5678 0.032
10.0.0.5 - - [15/Jan/2024:10:22:10 +0000] "DELETE /api/users/5 HTTP/1.1" 500 156 0.567
{"timestamp":"2024-01-15T10:23:01Z","level":"INFO","source":"UserService","message":"User login successful","ip":"192.168.1.11"}
{"timestamp":"2024-01-15T10:23:02Z","level":"ERROR","source":"PaymentService","message":"Payment gateway timeout","ip":"10.0.0.5"}
{"timestamp":"2024-01-15T10:23:03Z","level":"WARN","source":"CacheService","message":"Cache miss rate above threshold"}
{"timestamp":"2024-01-15T10:23:04Z","level":"DEBUG","source":"RequestLogger","message":"Processing request /api/health"}
{"timestamp":"2024-01-15T10:23:05Z","level":"ERROR","source":"DatabaseService","message":"Connection pool exhausted","ip":"10.0.0.5"}
{"timestamp":"2024-01-15T10:23:06Z","level":"INFO","source":"AuthService","message":"Token refreshed for user 42"}
2024-01-15 10:24:01 ERROR [main] com.app.Server - Failed to bind port 8080
2024-01-15 10:24:02 WARN [worker-3] com.app.Cache - Evicting stale entries
2024-01-15 10:24:03 INFO [main] com.app.Server - Server started on port 8081
2024-01-15 10:24:04 DEBUG [worker-1] com.app.Handler - Request received from 192.168.1.10`;

function parseLine(line: string): LogEntry | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  // JSON structured log
  if (trimmed.startsWith('{')) {
    try {
      const obj = JSON.parse(trimmed);
      return {
        raw: trimmed, timestamp: obj.timestamp || obj.time || obj.ts,
        level: (obj.level || obj.severity || obj.loglevel || '').toUpperCase(),
        source: obj.source || obj.logger || obj.class || obj.module,
        message: obj.message || obj.msg || obj.text || '',
        ip: obj.ip || obj.remote_addr || obj.client_ip,
        method: obj.method, url: obj.url || obj.path,
        status: obj.status || obj.status_code, responseTime: obj.response_time || obj.duration,
      };
    } catch { /* fall through */ }
  }

  // Apache/Nginx access log
  const apacheRe = /^(\S+)\s+\S+\s+\S+\s+\[([^\]]+)\]\s+"(\w+)\s+(\S+)\s+\S+"\s+(\d+)\s+(\d+)(?:\s+([\d.]+))?/;
  const apacheMatch = trimmed.match(apacheRe);
  if (apacheMatch) {
    const status = parseInt(apacheMatch[5]);
    return {
      raw: trimmed, ip: apacheMatch[1], timestamp: apacheMatch[2],
      method: apacheMatch[3], url: apacheMatch[4], status,
      responseTime: apacheMatch[7] ? parseFloat(apacheMatch[7]) : undefined,
      level: status >= 500 ? 'ERROR' : status >= 400 ? 'WARN' : 'INFO',
      message: `${apacheMatch[3]} ${apacheMatch[4]} ${status}`,
    };
  }

  // Log4j/Logback: 2024-01-15 10:24:01 ERROR [main] com.app.Server - Message
  const log4jRe = /^(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})\s+(\w+)\s+\[([^\]]+)\]\s+(\S+)\s+-\s+(.*)/;
  const log4jMatch = trimmed.match(log4jRe);
  if (log4jMatch) {
    return {
      raw: trimmed, timestamp: log4jMatch[1], level: log4jMatch[2].toUpperCase(),
      source: log4jMatch[4], message: log4jMatch[5],
    };
  }

  // Syslog-like: Jan 15 10:24:01 hostname service[pid]: message
  const syslogRe = /^(\w+\s+\d+\s+\d{2}:\d{2}:\d{2})\s+(\S+)\s+(\S+?)(?:\[\d+\])?:\s+(.*)/;
  const syslogMatch = trimmed.match(syslogRe);
  if (syslogMatch) {
    return {
      raw: trimmed, timestamp: syslogMatch[1], source: syslogMatch[3], message: syslogMatch[4],
      level: /error|fail|crit/i.test(syslogMatch[4]) ? 'ERROR' : /warn/i.test(syslogMatch[4]) ? 'WARN' : 'INFO',
    };
  }

  // Generic: timestamp LEVEL message
  const genericRe = /^(\d{4}[-/]\d{2}[-/]\d{2}[\sT]\d{2}:\d{2}:\d{2}[\w.]*)\s+(DEBUG|INFO|WARN|WARNING|ERROR|FATAL|TRACE)\s+(.*)/i;
  const genericMatch = trimmed.match(genericRe);
  if (genericMatch) {
    return {
      raw: trimmed, timestamp: genericMatch[1], level: genericMatch[2].toUpperCase().replace('WARNING', 'WARN'),
      message: genericMatch[3],
    };
  }

  return { raw: trimmed, message: trimmed };
}

export default function App() {
  const [input, setInput] = useState(SAMPLE_LOGS);
  const [levelFilter, setLevelFilter] = useState<Set<string>>(new Set());
  const [searchText, setSearchText] = useState('');
  const [tab, setTab] = useState(0);
  const [snack, setSnack] = useState('');

  const copy = useCallback((t: string) => { navigator.clipboard.writeText(t); setSnack('Copied!'); }, []);

  const entries = useMemo(() => {
    return input.split('\n').map(parseLine).filter((e): e is LogEntry => e !== null);
  }, [input]);

  const filtered = useMemo(() => {
    return entries.filter(e => {
      if (levelFilter.size > 0 && e.level && !levelFilter.has(e.level)) return false;
      if (searchText) {
        const q = searchText.toLowerCase();
        return e.raw.toLowerCase().includes(q) || e.message.toLowerCase().includes(q) || (e.source && e.source.toLowerCase().includes(q));
      }
      return true;
    });
  }, [entries, levelFilter, searchText]);

  const stats = useMemo(() => {
    const levels: Record<string, number> = {};
    const ips: Record<string, number> = {};
    const urls: Record<string, number> = {};
    const errors: Record<string, number> = {};
    entries.forEach(e => {
      if (e.level) levels[e.level] = (levels[e.level] || 0) + 1;
      if (e.ip) ips[e.ip] = (ips[e.ip] || 0) + 1;
      if (e.url) urls[e.url] = (urls[e.url] || 0) + 1;
      if (e.level === 'ERROR' || e.level === 'FATAL') errors[e.message] = (errors[e.message] || 0) + 1;
    });
    const errorCount = (levels['ERROR'] || 0) + (levels['FATAL'] || 0);
    const errorRate = entries.length > 0 ? ((errorCount / entries.length) * 100).toFixed(1) : '0';
    const topIps = Object.entries(ips).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topUrls = Object.entries(urls).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topErrors = Object.entries(errors).sort((a, b) => b[1] - a[1]).slice(0, 5);
    return { levels, errorRate, topIps, topUrls, topErrors, total: entries.length };
  }, [entries]);

  const toggleLevel = (level: string) => {
    setLevelFilter(prev => {
      const s = new Set(prev);
      s.has(level) ? s.delete(level) : s.add(level);
      return s;
    });
  };

  const maxLevelCount = Math.max(1, ...Object.values(stats.levels));

  const detectedFormat = useMemo(() => {
    if (!entries.length) return 'None';
    const first = entries[0];
    if (first.raw.startsWith('{')) return 'JSON (Structured)';
    if (first.ip && first.method) return 'Apache/Nginx Access Log';
    if (first.raw.match(/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}\s+\w+\s+\[/)) return 'Log4j/Logback';
    if (first.raw.match(/^\w+\s+\d+\s+\d{2}:\d{2}:\d{2}/)) return 'Syslog';
    return 'Generic / Mixed';
  }, [entries]);

  const exportFiltered = () => copy(filtered.map(e => e.raw).join('\n'));

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a', color: 'grey.300', p: 3 }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <Link to="/"><IconButton size="small" sx={{ color: 'grey.500' }}><Home /></IconButton></Link>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Log Format Parser</Typography>
          {entries.length > 0 && <Chip label={`Detected: ${detectedFormat}`} size="small" sx={{ bgcolor: '#1a2332', color: '#90caf9', ml: 1 }} />}
        </Box>

        <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="subtitle2" sx={{ color: 'grey.400' }}>Paste Log Content</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size="small" variant="outlined" onClick={() => setInput(SAMPLE_LOGS)} sx={{ borderColor: '#333', color: 'grey.400', fontSize: 11 }}>Load Sample</Button>
              <Button size="small" variant="outlined" onClick={() => setInput('')} startIcon={<Delete />} sx={{ borderColor: '#333', color: 'grey.400', fontSize: 11 }}>Clear</Button>
            </Box>
          </Box>
          <TextField multiline rows={6} fullWidth value={input} onChange={e => setInput(e.target.value)} placeholder="Paste log lines here..."
            sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#333' }, '&:hover fieldset': { borderColor: '#555' } }, '& .MuiInputBase-input': { color: 'grey.300', fontFamily: 'monospace', fontSize: 12 } }} />
        </Paper>

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, '& .MuiTab-root': { color: 'grey.500', textTransform: 'none', fontSize: 13 }, '& .Mui-selected': { color: '#90caf9' } }}>
          <Tab label={`Parsed (${filtered.length}/${entries.length})`} /><Tab label="Statistics" />
        </Tabs>

        {tab === 0 && (<>
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField size="small" placeholder="Search logs..." value={searchText} onChange={e => setSearchText(e.target.value)}
              InputProps={{ startAdornment: <Search sx={{ color: 'grey.500', mr: 1 }} /> }}
              sx={{ flex: 1, minWidth: 200, '& .MuiOutlinedInput-root': { bgcolor: '#111', '& fieldset': { borderColor: '#333' } }, '& .MuiInputBase-input': { color: 'grey.300' } }} />
            <FilterList sx={{ color: 'grey.500', fontSize: 18 }} />
            {LEVELS.map(l => (
              <Chip key={l} label={`${l} (${stats.levels[l] || 0})`} size="small" onClick={() => toggleLevel(l)}
                sx={{ bgcolor: levelFilter.has(l) ? (LEVEL_COLORS[l] || '#666') + '33' : '#222', color: LEVEL_COLORS[l] || 'grey.400', border: `1px solid ${levelFilter.has(l) ? LEVEL_COLORS[l] : '#333'}`, cursor: 'pointer', fontFamily: 'monospace', fontSize: 11 }} />
            ))}
            <Button size="small" variant="outlined" onClick={exportFiltered} startIcon={<ContentCopy />} sx={{ borderColor: '#333', color: 'grey.400', fontSize: 11 }}>Export Filtered</Button>
          </Box>

          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', overflow: 'auto', maxHeight: 500 }}>
            {filtered.length === 0 ? (
              <Typography sx={{ p: 3, textAlign: 'center', color: 'grey.500' }}>No log entries to display. Paste log content above.</Typography>
            ) : filtered.map((e, i) => {
              const levelColor = LEVEL_COLORS[e.level || ''] || 'grey.400';
              const isError = e.level === 'ERROR' || e.level === 'FATAL';
              const isWarn = e.level === 'WARN';
              return (
                <Box key={i} sx={{
                  p: 1, px: 1.5, borderBottom: '1px solid #1a1a1a', fontFamily: 'monospace', fontSize: 12,
                  bgcolor: isError ? '#f4433608' : isWarn ? '#ff980005' : 'transparent',
                  borderLeft: `3px solid ${isError ? '#f44336' : isWarn ? '#ff9800' : 'transparent'}`,
                  '&:hover': { bgcolor: '#1a1a1a' },
                }}>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                    {e.timestamp && <Typography sx={{ fontSize: 11, color: 'grey.500', minWidth: 160 }}>{e.timestamp}</Typography>}
                    {e.level && <Chip label={e.level} size="small" sx={{ bgcolor: levelColor + '22', color: levelColor, fontFamily: 'monospace', fontSize: 10, height: 20, fontWeight: 700 }} />}
                    {e.source && <Typography sx={{ fontSize: 11, color: '#ce93d8' }}>[{e.source}]</Typography>}
                    {e.method && <Chip label={e.method} size="small" sx={{ bgcolor: '#1a2332', color: '#90caf9', fontSize: 10, height: 18, fontFamily: 'monospace' }} />}
                    {e.url && <Typography sx={{ fontSize: 11, color: '#90caf9' }}>{e.url}</Typography>}
                    {e.status !== undefined && <Chip label={String(e.status)} size="small" sx={{ bgcolor: e.status >= 500 ? '#f4433622' : e.status >= 400 ? '#ff980022' : '#4caf5022', color: e.status >= 500 ? '#f44336' : e.status >= 400 ? '#ff9800' : '#4caf50', fontSize: 10, height: 18, fontFamily: 'monospace' }} />}
                    {e.responseTime !== undefined && <Typography sx={{ fontSize: 10, color: 'grey.500' }}>{e.responseTime}s</Typography>}
                    {e.ip && <Typography sx={{ fontSize: 10, color: 'grey.600' }}>{e.ip}</Typography>}
                  </Box>
                  <Typography sx={{ fontSize: 12, color: isError ? '#ef9a9a' : 'grey.300', mt: 0.25 }}>{e.message}</Typography>
                </Box>
              );
            })}
          </Paper>
        </>)}

        {tab === 1 && (
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, flex: 1, minWidth: 280 }}>
              <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1 }}>Log Level Distribution</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Typography variant="body2" sx={{ color: 'grey.500' }}>Total: {stats.total}</Typography>
                <Typography variant="body2" sx={{ color: '#f44336' }}>Error rate: {stats.errorRate}%</Typography>
              </Box>
              {LEVELS.map(l => {
                const count = stats.levels[l] || 0;
                if (count === 0) return null;
                const pct = (count / maxLevelCount) * 100;
                return (
                  <Box key={l} sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
                      <Typography sx={{ fontSize: 12, color: LEVEL_COLORS[l], fontFamily: 'monospace' }}>{l}</Typography>
                      <Typography sx={{ fontSize: 12, color: 'grey.500' }}>{count}</Typography>
                    </Box>
                    <Box sx={{ height: 16, bgcolor: '#222', borderRadius: 1, overflow: 'hidden' }}>
                      <Box sx={{ height: '100%', width: `${pct}%`, bgcolor: LEVEL_COLORS[l], borderRadius: 1, transition: 'width 0.3s' }} />
                    </Box>
                  </Box>
                );
              })}
            </Paper>

            <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, flex: 1, minWidth: 280 }}>
              <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1 }}>Top IP Addresses</Typography>
              {stats.topIps.length === 0 ? <Typography variant="body2" sx={{ color: 'grey.500' }}>No IP data</Typography> :
                stats.topIps.map(([ip, count]) => (
                  <Box key={ip} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5, borderBottom: '1px solid #1a1a1a' }}>
                    <Typography sx={{ fontFamily: 'monospace', fontSize: 12, color: '#90caf9' }}>{ip}</Typography>
                    <Chip label={String(count)} size="small" sx={{ bgcolor: '#1a2332', color: '#90caf9', fontSize: 10, height: 18 }} />
                  </Box>
                ))
              }
              <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1, mt: 2 }}>Top URLs</Typography>
              {stats.topUrls.length === 0 ? <Typography variant="body2" sx={{ color: 'grey.500' }}>No URL data</Typography> :
                stats.topUrls.map(([url, count]) => (
                  <Box key={url} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5, borderBottom: '1px solid #1a1a1a' }}>
                    <Typography sx={{ fontFamily: 'monospace', fontSize: 12, color: '#81c784' }}>{url}</Typography>
                    <Chip label={String(count)} size="small" sx={{ bgcolor: '#1a332a', color: '#81c784', fontSize: 10, height: 18 }} />
                  </Box>
                ))
              }
            </Paper>

            <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, flex: 1, minWidth: 280 }}>
              <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1 }}>Top Error Messages</Typography>
              {stats.topErrors.length === 0 ? <Typography variant="body2" sx={{ color: 'grey.500' }}>No errors detected</Typography> :
                stats.topErrors.map(([msg, count]) => (
                  <Box key={msg} sx={{ py: 0.5, borderBottom: '1px solid #1a1a1a' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography sx={{ fontSize: 12, color: '#ef9a9a', flex: 1 }}>{msg}</Typography>
                      <Chip label={`x${count}`} size="small" sx={{ bgcolor: '#f4433622', color: '#f44336', fontSize: 10, height: 18, ml: 1 }} />
                    </Box>
                  </Box>
                ))
              }
            </Paper>
          </Box>
        )}
      </Box>
      <Snackbar open={!!snack} autoHideDuration={1500} onClose={() => setSnack('')} message={snack} />
    </Box>
  );
}
