import { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Tooltip,
  Chip,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  ContentCopy,
  Home,
  PlayArrow,
  Add,
  Delete,
  Info,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

// Built-in Grok patterns (subset matching Logstash defaults)
const GROK_PATTERNS: Record<string, string> = {
  // Base
  USERNAME: '[a-zA-Z0-9._-]+',
  USER: '%{USERNAME}',
  EMAILLOCALPART: '[a-zA-Z0-9_.+-]+',
  EMAILADDRESS: '%{EMAILLOCALPART}@%{HOSTNAME}',
  INT: '(?:[+-]?(?:[0-9]+))',
  BASE10NUM: '(?:[+-]?(?:[0-9]+(?:\\.[0-9]+)?))',
  NUMBER: '(?:%{BASE10NUM})',
  BASE16NUM: '(?:0[xX]?[0-9a-fA-F]+)',
  BASE16FLOAT: '(?:0[xX]?[0-9a-fA-F]+(?:\\.[0-9a-fA-F]+)?)',
  POSINT: '\\b(?:[1-9][0-9]*)\\b',
  NONNEGINT: '\\b(?:[0-9]+)\\b',
  WORD: '\\b\\w+\\b',
  NOTSPACE: '\\S+',
  SPACE: '\\s*',
  DATA: '.*?',
  GREEDYDATA: '.*',
  QUOTEDSTRING: '(?:"(?:[^"\\\\]|\\\\.)*"|\'(?:[^\'\\\\]|\\\\.)*\')',
  UUID: '[a-fA-F0-9]{8}-(?:[a-fA-F0-9]{4}-){3}[a-fA-F0-9]{12}',

  // Network
  CISCOMAC: '(?:[a-fA-F0-9]{4}\\.){2}[a-fA-F0-9]{4}',
  WINDOWSMAC: '(?:[a-fA-F0-9]{2}-){5}[a-fA-F0-9]{2}',
  COMMONMAC: '(?:[a-fA-F0-9]{2}:){5}[a-fA-F0-9]{2}',
  MAC: '(?:%{CISCOMAC}|%{WINDOWSMAC}|%{COMMONMAC})',
  IPV6: '(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::(?:[0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,6}:(?:[0-9a-fA-F]{1,4}:){0,4}[0-9a-fA-F]{1,4}',
  IPV4: '(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)',
  IP: '(?:%{IPV6}|%{IPV4})',
  HOSTNAME: '\\b[a-zA-Z0-9](?:[a-zA-Z0-9\\-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9\\-]{0,61}[a-zA-Z0-9])?)*\\b',
  IPORHOST: '(?:%{IP}|%{HOSTNAME})',
  HOSTPORT: '%{IPORHOST}:%{POSINT}',
  PORT: '\\b(?:[0-9]{1,5})\\b',
  URIPROTO: '[a-zA-Z][a-zA-Z0-9+\\-.]*',
  URIHOST: '%{IPORHOST}(?::%{POSINT})?',
  URIPATH: '(?:/[a-zA-Z0-9$.+!*\'(),~:;=@#%&_\\-]*)+',
  URIPARAM: '\\?[a-zA-Z0-9$.+!*\'|(),~@#%&/=:;_?\\-\\[\\]<>]*',
  URIPATHPARAM: '%{URIPATH}(?:%{URIPARAM})?',
  URI: '%{URIPROTO}://(?:%{USER}(?::[^@]*)?@)?(?:%{URIHOST})?(?:%{URIPATHPARAM})?',

  // Dates
  MONTH: '\\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\\b',
  MONTHNUM: '(?:0?[1-9]|1[0-2])',
  MONTHNUM2: '(?:0[1-9]|1[0-2])',
  MONTHDAY: '(?:0?[1-9]|[12][0-9]|3[01])',
  DAY: '(?:Mon(?:day)?|Tue(?:sday)?|Wed(?:nesday)?|Thu(?:rsday)?|Fri(?:day)?|Sat(?:urday)?|Sun(?:day)?)',
  YEAR: '(?:\\d\\d){1,2}',
  HOUR: '(?:2[0123]|[01]?[0-9])',
  MINUTE: '(?:[0-5][0-9])',
  SECOND: '(?:(?:[0-5]?[0-9]|60)(?:[.:][0-9]+)?)',
  TIME: '%{HOUR}:%{MINUTE}(?::%{SECOND})?',
  DATE_US: '%{MONTHNUM}[/-]%{MONTHDAY}[/-]%{YEAR}',
  DATE_EU: '%{MONTHDAY}[./-]%{MONTHNUM}[./-]%{YEAR}',
  ISO8601_TIMEZONE: '(?:Z|[+-]%{HOUR}(?::?%{MINUTE})?)',
  ISO8601_SECOND: '(?:%{SECOND}|60)',
  TIMESTAMP_ISO8601: '%{YEAR}-%{MONTHNUM}-%{MONTHDAY}[T ]%{HOUR}:?%{MINUTE}(?::?%{SECOND})?%{ISO8601_TIMEZONE}?',
  DATE: '%{DATE_US}|%{DATE_EU}',
  DATESTAMP: '%{DATE}[- ]%{TIME}',
  TZ: '(?:[APMCE][SD]T|UTC)',
  DATESTAMP_RFC822: '%{DAY} %{MONTH} %{MONTHDAY} %{YEAR} %{TIME} %{TZ}',
  DATESTAMP_RFC2822: '%{DAY}, %{MONTHDAY} %{MONTH} %{YEAR} %{TIME} %{ISO8601_TIMEZONE}',
  DATESTAMP_OTHER: '%{DAY} %{MONTH} %{MONTHDAY} %{TIME} %{TZ} %{YEAR}',
  DATESTAMP_EVENTLOG: '%{YEAR}%{MONTHNUM2}%{MONTHDAY}%{HOUR}%{MINUTE}%{SECOND}',
  HTTPDERROR_DATE: '%{DAY} %{MONTH} %{MONTHDAY} %{TIME} %{YEAR}',

  // Syslog
  SYSLOGTIMESTAMP: '%{MONTH} +%{MONTHDAY} %{TIME}',
  PROG: '[\\w._/%-]+',
  SYSLOGPROG: '%{PROG}(?:\\[%{POSINT}\\])?',
  SYSLOGHOST: '%{IPORHOST}',
  SYSLOGFACILITY: '<%{NONNEGINT}\\.%{NONNEGINT}>',
  SYSLOGBASE: '%{SYSLOGTIMESTAMP} (?:%{SYSLOGFACILITY} )?%{SYSLOGHOST} %{SYSLOGPROG}:',

  // Log Levels
  LOGLEVEL: '(?:[Aa]lert|ALERT|[Tt]race|TRACE|[Dd]ebug|DEBUG|[Nn]otice|NOTICE|[Ii]nfo|INFO|[Ww]arn(?:ing)?|WARN(?:ING)?|[Ee]rr(?:or)?|ERR(?:OR)?|[Cc]rit(?:ical)?|CRIT(?:ICAL)?|[Ff]atal|FATAL|[Ss]evere|SEVERE|EMERG(?:ENCY)?|[Ee]merg(?:ency)?)',

  // HTTP
  HTTPDATE: '%{MONTHDAY}/%{MONTH}/%{YEAR}:%{TIME} %{INT}',

  // Composite / Common Log Formats
  COMMONAPACHELOG: '%{IPORHOST} %{HTTPDUSER} %{USER} \\[%{HTTPDATE}\\] "(?:%{WORD} %{NOTSPACE}(?: HTTP/%{NUMBER})?" %{NUMBER} (?:%{NUMBER}|-))',
  COMBINEDAPACHELOG: '%{COMMONAPACHELOG} %{QUOTEDSTRING} %{QUOTEDSTRING}',
  HTTPDUSER: '%{EMAILADDRESS}|%{USER}',
};

// Resolve %{PATTERN} references recursively
function resolvePattern(pattern: string, patterns: Record<string, string>, depth = 0): string {
  if (depth > 20) return pattern; // prevent infinite recursion
  return pattern.replace(/%\{([A-Za-z0-9_]+)(?::([a-zA-Z0-9_.-]+))?\}/g, (_match, patName, _fieldName) => {
    const resolved = patterns[patName];
    if (!resolved) return `(?<_unresolved_${patName}>\\S+)`;
    return resolvePattern(resolved, patterns, depth + 1);
  });
}

// Convert a Grok pattern to a regex, capturing named fields
function grokToRegex(grokPattern: string, patterns: Record<string, string>): string {
  let result = grokPattern;
  let depth = 0;
  // Replace %{PATTERN:field} with named capture groups, %{PATTERN} without
  while (result.includes('%{') && depth < 20) {
    result = result.replace(/%\{([A-Za-z0-9_]+)(?::([a-zA-Z0-9_.-]+))?\}/g, (_match, patName, fieldName) => {
      const resolved = patterns[patName];
      if (!resolved) return `(?:\\S+)`;
      const inner = resolvePattern(resolved, patterns, 0);
      if (fieldName) {
        const safeName = fieldName.replace(/[^a-zA-Z0-9_]/g, '_');
        return `(?<${safeName}>${inner})`;
      }
      return `(?:${inner})`;
    });
    depth++;
  }
  return result;
}

interface ParseResult {
  line: string;
  matched: boolean;
  fields: Record<string, string>;
  error?: string;
}

interface CustomPattern {
  name: string;
  regex: string;
}

const PRESET_PATTERNS = [
  { label: 'Apache Combined', value: '%{COMBINEDAPACHELOG}' },
  { label: 'Apache Common', value: '%{COMMONAPACHELOG}' },
  { label: 'Syslog', value: '%{SYSLOGBASE} %{GREEDYDATA:message}' },
  { label: 'JSON Log', value: '\\{%{GREEDYDATA:json_body}\\}' },
  { label: 'Simple Log', value: '%{TIMESTAMP_ISO8601:timestamp} %{LOGLEVEL:level} %{GREEDYDATA:message}' },
  { label: 'Log4j', value: '%{TIMESTAMP_ISO8601:timestamp} \\[%{DATA:thread}\\] %{LOGLEVEL:level} %{NOTSPACE:logger} - %{GREEDYDATA:message}' },
  { label: 'Nginx Access', value: '%{IPORHOST:client_ip} - %{USER:ident} \\[%{HTTPDATE:timestamp}\\] "%{WORD:method} %{URIPATHPARAM:request} HTTP/%{NUMBER:http_version}" %{NUMBER:status} %{NUMBER:bytes} "%{DATA:referrer}" "%{DATA:user_agent}"' },
  { label: 'Spring Boot', value: '%{TIMESTAMP_ISO8601:timestamp} +%{LOGLEVEL:level} %{POSINT:pid} --- \\[%{DATA:thread}\\] %{NOTSPACE:logger} +: %{GREEDYDATA:message}' },
  { label: 'Custom', value: '' },
];

const SAMPLE_LOGS: Record<string, string> = {
  'Apache Combined': '192.168.1.1 - frank [10/Oct/2024:13:55:36 -0700] "GET /api/users HTTP/1.1" 200 2326 "https://example.com" "Mozilla/5.0"',
  'Syslog': 'Jan 23 14:09:01 myhost sshd[12345]: Failed password for root from 192.168.1.100 port 22 ssh2',
  'Simple Log': '2024-10-15T14:30:00.000Z ERROR Connection to database timed out after 30000ms',
  'Log4j': '2024-10-15T14:30:00.123Z [main] ERROR com.example.App - Failed to process request: NullPointerException',
  'Nginx Access': '10.0.0.1 - admin [15/Oct/2024:10:30:00 +0000] "POST /api/login HTTP/1.1" 401 52 "https://app.example.com/login" "Mozilla/5.0 (X11; Linux x86_64)"',
  'Spring Boot': '2024-10-15T14:30:00.123Z  INFO 12345 --- [http-nio-8080-exec-1] c.e.controller.UserController  : Processing request for user 42',
};

const tfSx = { '& .MuiInputBase-root': { color: 'grey.300', bgcolor: '#0a0a0a' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' }, '& .MuiInputLabel-root': { color: 'grey.500' } };

export default function GrokParser() {
  const [grokPattern, setGrokPattern] = useState('%{TIMESTAMP_ISO8601:timestamp} %{LOGLEVEL:level} %{GREEDYDATA:message}');
  const [logInput, setLogInput] = useState('2024-10-15T14:30:00.000Z ERROR Connection to database timed out after 30000ms\n2024-10-15T14:30:01.500Z INFO Retrying connection attempt 1\n2024-10-15T14:30:03.200Z WARN Connection pool running low: 2 remaining\n2024-10-15T14:30:05.000Z ERROR Max retries exceeded, shutting down service\n2024-10-15T14:30:05.100Z FATAL Service terminated unexpectedly');
  const [results, setResults] = useState<ParseResult[]>([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [customPatterns, setCustomPatterns] = useState<CustomPattern[]>([]);
  const [showRegex, setShowRegex] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('Simple Log');

  const allPatterns = useMemo(() => {
    const merged = { ...GROK_PATTERNS };
    customPatterns.forEach(cp => {
      if (cp.name && cp.regex) merged[cp.name] = cp.regex;
    });
    return merged;
  }, [customPatterns]);

  const compiledRegex = useMemo(() => {
    try {
      const regexStr = grokToRegex(grokPattern, allPatterns);
      return { regex: new RegExp(regexStr), source: regexStr, error: null };
    } catch (e: unknown) {
      return { regex: null, source: '', error: (e as Error).message };
    }
  }, [grokPattern, allPatterns]);

  const parseLines = useCallback(() => {
    const lines = logInput.split('\n').filter(l => l.trim());
    if (!compiledRegex.regex) {
      setResults(lines.map(line => ({ line, matched: false, fields: {}, error: compiledRegex.error || 'Invalid pattern' })));
      return;
    }
    const parsed = lines.map(line => {
      try {
        const match = compiledRegex.regex!.exec(line);
        if (match && match.groups) {
          const fields: Record<string, string> = {};
          Object.entries(match.groups).forEach(([k, v]) => {
            if (v !== undefined && !k.startsWith('_unresolved_')) fields[k] = v;
          });
          return { line, matched: true, fields };
        }
        return { line, matched: !!match, fields: {} };
      } catch (e: unknown) {
        return { line, matched: false, fields: {}, error: (e as Error).message };
      }
    });
    setResults(parsed);
  }, [logInput, compiledRegex]);

  const handlePreset = (label: string) => {
    const preset = PRESET_PATTERNS.find(p => p.label === label);
    if (preset && preset.value) {
      setGrokPattern(preset.value);
      setSelectedPreset(label);
      if (SAMPLE_LOGS[label]) setLogInput(SAMPLE_LOGS[label]);
    }
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setSnackbar({ open: true, message: 'Copied!' });
  };

  const matchedCount = results.filter(r => r.matched).length;
  const allFields = [...new Set(results.flatMap(r => Object.keys(r.fields)))];

  const levelColors: Record<string, string> = {
    TRACE: '#9e9e9e', DEBUG: '#90caf9', INFO: '#81c784', WARN: '#ffb74d', WARNING: '#ffb74d',
    ERROR: '#ef5350', FATAL: '#e53935', SEVERE: '#e53935', CRITICAL: '#e53935',
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a' }}>
      <Paper elevation={0} sx={{ bgcolor: '#111', borderBottom: '1px solid #222', px: 3, py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Link to="/"><IconButton size="small" sx={{ color: 'grey.500' }}><Home /></IconButton></Link>
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>Grok Pattern Tester</Typography>
          <Chip label="Log Parser" size="small" sx={{ bgcolor: '#1a2332', color: '#90caf9' }} />
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', height: 'calc(100vh - 70px)' }}>
        {/* Left Panel - Pattern & Input */}
        <Box sx={{ width: 520, borderRight: '1px solid #222', p: 2, overflow: 'auto' }}>
          {/* Preset Patterns */}
          <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1 }}>Presets</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
            {PRESET_PATTERNS.filter(p => p.value).map(p => (
              <Chip key={p.label} label={p.label} size="small" clickable
                onClick={() => handlePreset(p.label)}
                sx={{ bgcolor: selectedPreset === p.label ? '#1976d2' : '#1a1a1a', color: selectedPreset === p.label ? 'white' : 'grey.400', border: '1px solid #333', '&:hover': { bgcolor: '#252525' } }} />
            ))}
          </Box>

          {/* Grok Pattern Input */}
          <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1 }}>Grok Pattern</Typography>
          <TextField fullWidth multiline minRows={3} maxRows={6} value={grokPattern}
            onChange={e => setGrokPattern(e.target.value)}
            placeholder="%{TIMESTAMP_ISO8601:timestamp} %{LOGLEVEL:level} %{GREEDYDATA:message}"
            sx={{ mb: 1, ...tfSx, '& .MuiInputBase-root': { ...tfSx['& .MuiInputBase-root'], fontFamily: 'monospace', fontSize: 13 } }} />

          {compiledRegex.error && (
            <Typography variant="caption" sx={{ color: '#ef5350', display: 'block', mb: 1 }}>
              Pattern Error: {compiledRegex.error}
            </Typography>
          )}

          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Button size="small" onClick={() => setShowRegex(!showRegex)}
              sx={{ color: 'grey.400', textTransform: 'none', fontSize: 12 }}>
              {showRegex ? 'Hide' : 'Show'} Compiled Regex
            </Button>
            {showRegex && (
              <Tooltip title="Copy regex">
                <IconButton size="small" onClick={() => handleCopy(compiledRegex.source)} sx={{ color: 'grey.500' }}>
                  <ContentCopy sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          {showRegex && (
            <Paper sx={{ bgcolor: '#0a0a0a', border: '1px solid #222', p: 1.5, mb: 2, maxHeight: 120, overflow: 'auto' }}>
              <Typography sx={{ fontFamily: 'monospace', fontSize: 11, color: '#ce93d8', wordBreak: 'break-all' }}>
                {compiledRegex.source || 'Invalid pattern'}
              </Typography>
            </Paper>
          )}

          {/* Custom Patterns */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="subtitle2" sx={{ color: 'grey.400' }}>Custom Patterns</Typography>
            <IconButton size="small" onClick={() => setCustomPatterns([...customPatterns, { name: '', regex: '' }])} sx={{ color: 'grey.500' }}>
              <Add fontSize="small" />
            </IconButton>
          </Box>

          {customPatterns.map((cp, i) => (
            <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField size="small" placeholder="NAME" value={cp.name}
                onChange={e => { const u = [...customPatterns]; u[i] = { ...u[i], name: e.target.value }; setCustomPatterns(u); }}
                sx={{ width: 130, ...tfSx, '& .MuiInputBase-root': { ...tfSx['& .MuiInputBase-root'], fontFamily: 'monospace', fontSize: 12 } }} />
              <TextField size="small" placeholder="regex" value={cp.regex} sx={{ flex: 1, ...tfSx, '& .MuiInputBase-root': { ...tfSx['& .MuiInputBase-root'], fontFamily: 'monospace', fontSize: 12 } }}
                onChange={e => { const u = [...customPatterns]; u[i] = { ...u[i], regex: e.target.value }; setCustomPatterns(u); }} />
              <IconButton size="small" onClick={() => setCustomPatterns(customPatterns.filter((_, j) => j !== i))} sx={{ color: 'grey.600' }}>
                <Delete fontSize="small" />
              </IconButton>
            </Box>
          ))}

          {/* Log Input */}
          <Typography variant="subtitle2" sx={{ color: 'grey.400', mt: 2, mb: 1 }}>Log Lines</Typography>
          <TextField fullWidth multiline minRows={8} maxRows={15} value={logInput}
            onChange={e => setLogInput(e.target.value)}
            placeholder="Paste log lines here..."
            sx={{ mb: 2, ...tfSx, '& .MuiInputBase-root': { ...tfSx['& .MuiInputBase-root'], fontFamily: 'monospace', fontSize: 12 } }} />

          <Button fullWidth variant="contained" startIcon={<PlayArrow />} onClick={parseLines}
            sx={{ bgcolor: '#1976d2', textTransform: 'none', fontWeight: 600 }}>
            Parse Logs
          </Button>

          {/* Pattern Reference */}
          <Typography variant="subtitle2" sx={{ color: 'grey.400', mt: 3, mb: 1 }}>Common Patterns</Typography>
          <Paper sx={{ bgcolor: '#0a0a0a', border: '1px solid #222', maxHeight: 300, overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '6px 8px', color: '#90caf9', fontSize: 11, borderBottom: '1px solid #222' }}>Pattern</th>
                  <th style={{ textAlign: 'left', padding: '6px 8px', color: '#90caf9', fontSize: 11, borderBottom: '1px solid #222' }}>Matches</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['%{IP:ip}', 'IPv4 or IPv6 address'],
                  ['%{IPV4:ip}', 'IPv4 address'],
                  ['%{HOSTNAME:host}', 'Hostname'],
                  ['%{HOSTPORT:hp}', 'host:port'],
                  ['%{NUMBER:num}', 'Any number'],
                  ['%{INT:n}', 'Integer'],
                  ['%{POSINT:n}', 'Positive integer'],
                  ['%{WORD:w}', 'Single word'],
                  ['%{NOTSPACE:s}', 'Non-whitespace'],
                  ['%{DATA:d}', 'Non-greedy match'],
                  ['%{GREEDYDATA:d}', 'Greedy match (rest of line)'],
                  ['%{QUOTEDSTRING:q}', 'Quoted string'],
                  ['%{UUID:id}', 'UUID'],
                  ['%{URI:url}', 'Full URI'],
                  ['%{URIPATH:path}', 'URI path'],
                  ['%{EMAILADDRESS:email}', 'Email address'],
                  ['%{USERNAME:user}', 'Username'],
                  ['%{LOGLEVEL:level}', 'Log level (INFO, ERROR...)'],
                  ['%{TIMESTAMP_ISO8601:ts}', 'ISO 8601 timestamp'],
                  ['%{SYSLOGTIMESTAMP:ts}', 'Syslog timestamp'],
                  ['%{HTTPDATE:ts}', 'Apache HTTP date'],
                  ['%{DATE_US:d}', 'US date (MM/DD/YYYY)'],
                  ['%{DATE_EU:d}', 'EU date (DD.MM.YYYY)'],
                  ['%{MAC:mac}', 'MAC address'],
                  ['%{PORT:port}', 'Port number'],
                  ['%{MONTH:m}', 'Month name'],
                  ['%{YEAR:y}', 'Year'],
                  ['%{TIME:t}', 'HH:MM:SS'],
                  ['%{PROG:prog}', 'Program name'],
                ].map(([pat, desc]) => (
                  <tr key={pat} style={{ cursor: 'pointer' }} onClick={() => { navigator.clipboard.writeText(pat); setSnackbar({ open: true, message: `Copied ${pat}` }); }}>
                    <td style={{ padding: '4px 8px', fontFamily: 'monospace', fontSize: 11, color: '#ce93d8', borderBottom: '1px solid #1a1a1a' }}>{pat}</td>
                    <td style={{ padding: '4px 8px', fontSize: 11, color: '#999', borderBottom: '1px solid #1a1a1a' }}>{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Paper>
        </Box>

        {/* Right Panel - Results */}
        <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography variant="subtitle2" sx={{ color: 'grey.400' }}>Results</Typography>
            {results.length > 0 && (
              <>
                <Chip label={`${matchedCount}/${results.length} matched`} size="small"
                  sx={{ bgcolor: matchedCount === results.length ? '#1b3a1b' : '#3a1b1b', color: matchedCount === results.length ? '#81c784' : '#ef5350' }} />
                {allFields.length > 0 && (
                  <Chip label={`${allFields.length} fields`} size="small" sx={{ bgcolor: '#1a2332', color: '#90caf9' }} />
                )}
                <Box sx={{ flex: 1 }} />
                <Tooltip title="Copy all as JSON">
                  <IconButton size="small" onClick={() => handleCopy(JSON.stringify(results.filter(r => r.matched).map(r => r.fields), null, 2))} sx={{ color: 'grey.500' }}>
                    <ContentCopy fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>

          {results.length === 0 ? (
            <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 4, textAlign: 'center' }}>
              <Info sx={{ fontSize: 48, color: '#333', mb: 2 }} />
              <Typography sx={{ color: 'grey.500', mb: 1 }}>Enter a Grok pattern and log lines, then click Parse</Typography>
              <Typography variant="caption" sx={{ color: 'grey.600' }}>
                Syntax: %{'{'}&lt;PATTERN_NAME&gt;:&lt;field_name&gt;{'}'} — field_name is optional for non-capturing
              </Typography>
            </Paper>
          ) : (
            <>
              {/* Extracted Fields Summary */}
              {allFields.length > 0 && (
                <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 2 }}>
                  <Typography variant="caption" sx={{ color: 'grey.500', mb: 1, display: 'block' }}>Extracted Fields</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {allFields.map(f => (
                      <Chip key={f} label={f} size="small" sx={{ bgcolor: '#1a2332', color: '#90caf9', fontFamily: 'monospace', fontSize: 11 }} />
                    ))}
                  </Box>
                </Paper>
              )}

              {/* Table View for matched results */}
              {allFields.length > 0 && matchedCount > 0 && (
                <Paper sx={{ bgcolor: '#111', border: '1px solid #222', mb: 2, overflow: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left', padding: '8px', color: '#90caf9', fontSize: 12, borderBottom: '1px solid #222', position: 'sticky', top: 0, backgroundColor: '#111', whiteSpace: 'nowrap' }}>#</th>
                        {allFields.map(f => (
                          <th key={f} style={{ textAlign: 'left', padding: '8px', color: '#90caf9', fontSize: 12, borderBottom: '1px solid #222', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{f}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {results.filter(r => r.matched).map((r, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #1a1a1a' }}>
                          <td style={{ padding: '6px 8px', color: '#666', fontSize: 11 }}>{i + 1}</td>
                          {allFields.map(f => {
                            const val = r.fields[f] || '';
                            const isLevel = f === 'level' || f === 'loglevel';
                            const color = isLevel ? (levelColors[val.toUpperCase()] || '#ccc') : '#ccc';
                            return (
                              <td key={f} style={{ padding: '6px 8px', fontFamily: 'monospace', fontSize: 12, color, whiteSpace: 'nowrap', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {val || <span style={{ color: '#444' }}>—</span>}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Paper>
              )}

              {/* Per-line results */}
              <Typography variant="caption" sx={{ color: 'grey.500', mb: 1, display: 'block' }}>Line Details</Typography>
              {results.map((r, i) => (
                <Paper key={i} sx={{ bgcolor: '#111', border: `1px solid ${r.matched ? '#1b3a1b' : '#3a1b1b'}`, borderLeft: `3px solid ${r.matched ? '#4caf50' : '#ef5350'}`, p: 1.5, mb: 1 }}>
                  <Typography sx={{ fontFamily: 'monospace', fontSize: 12, color: r.matched ? '#e0e0e0' : '#999', mb: r.matched && Object.keys(r.fields).length > 0 ? 1 : 0, wordBreak: 'break-all' }}>
                    {r.line}
                  </Typography>
                  {r.error && (
                    <Typography variant="caption" sx={{ color: '#ef5350' }}>Error: {r.error}</Typography>
                  )}
                  {r.matched && Object.keys(r.fields).length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {Object.entries(r.fields).map(([k, v]) => {
                        const isLevel = k === 'level' || k === 'loglevel';
                        const chipColor = isLevel ? (levelColors[v.toUpperCase()] || '#90caf9') : '#90caf9';
                        return (
                          <Chip key={k} size="small"
                            label={<span><span style={{ color: '#999' }}>{k}:</span> <span style={{ color: chipColor }}>{v.length > 60 ? v.slice(0, 60) + '...' : v}</span></span>}
                            sx={{ bgcolor: '#0a0a0a', border: '1px solid #222', height: 22, '& .MuiChip-label': { fontSize: 11, fontFamily: 'monospace', px: 1 } }}
                            onClick={() => handleCopy(v)} />
                        );
                      })}
                    </Box>
                  )}
                </Paper>
              ))}
            </>
          )}
        </Box>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={2000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} />
    </Box>
  );
}
