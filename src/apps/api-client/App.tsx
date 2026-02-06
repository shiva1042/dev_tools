import { useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemSecondaryAction,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import {
  ContentCopy,
  Home,
  Send,
  Add,
  Delete,
  History,
  Save,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type BodyType = 'none' | 'json' | 'form-data' | 'x-www-form-urlencoded' | 'raw';

interface Header {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

interface QueryParam {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

interface RequestHistory {
  id: string;
  method: HttpMethod;
  url: string;
  timestamp: Date;
  status?: number;
  duration?: number;
}

const methodColors: Record<HttpMethod, string> = {
  GET: '#10b981',
  POST: '#3b82f6',
  PUT: '#f59e0b',
  PATCH: '#8b5cf6',
  DELETE: '#ef4444',
};

export default function ApiClient() {
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [url, setUrl] = useState<string>('https://jsonplaceholder.typicode.com/posts/1');
  const [headers, setHeaders] = useState<Header[]>([
    { id: '1', key: 'Content-Type', value: 'application/json', enabled: true },
  ]);
  const [queryParams, setQueryParams] = useState<QueryParam[]>([]);
  const [bodyType, setBodyType] = useState<BodyType>('json');
  const [body, setBody] = useState<string>('{\n  "title": "Test Post",\n  "body": "This is a test",\n  "userId": 1\n}');
  const [response, setResponse] = useState<string>('');
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseHeaders, setResponseHeaders] = useState<Record<string, string>>({});
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [tab, setTab] = useState<'params' | 'headers' | 'body'>('params');
  const [responseTab, setResponseTab] = useState<'body' | 'headers'>('body');
  const [history, setHistory] = useState<RequestHistory[]>([]);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({ open: false, message: '' });

  const buildUrl = useCallback((): string => {
    const enabledParams = queryParams.filter(p => p.enabled && p.key);
    if (enabledParams.length === 0) return url;
    const params = new URLSearchParams();
    enabledParams.forEach(p => params.append(p.key, p.value));
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}${params.toString()}`;
  }, [url, queryParams]);

  const sendRequest = useCallback(async () => {
    setLoading(true);
    setResponse('');
    setResponseStatus(null);
    setResponseHeaders({});
    setResponseTime(null);

    const startTime = Date.now();
    const fullUrl = buildUrl();

    try {
      const requestHeaders: Record<string, string> = {};
      headers.filter(h => h.enabled && h.key).forEach(h => {
        requestHeaders[h.key] = h.value;
      });

      const options: RequestInit = {
        method,
        headers: requestHeaders,
      };

      if (method !== 'GET' && method !== 'DELETE' && bodyType !== 'none') {
        options.body = body;
      }

      const res = await fetch(fullUrl, options);
      const endTime = Date.now();

      setResponseStatus(res.status);
      setResponseTime(endTime - startTime);

      const resHeaders: Record<string, string> = {};
      res.headers.forEach((value, key) => {
        resHeaders[key] = value;
      });
      setResponseHeaders(resHeaders);

      const contentType = res.headers.get('content-type');
      let responseText = '';
      if (contentType?.includes('application/json')) {
        const json = await res.json();
        responseText = JSON.stringify(json, null, 2);
      } else {
        responseText = await res.text();
      }
      setResponse(responseText);

      setHistory(prev => [{
        id: String(Date.now()),
        method,
        url: fullUrl,
        timestamp: new Date(),
        status: res.status,
        duration: endTime - startTime,
      }, ...prev].slice(0, 50));

    } catch (error) {
      setResponse(`Error: ${(error as Error).message}`);
      setResponseStatus(0);
    } finally {
      setLoading(false);
    }
  }, [method, buildUrl, headers, body, bodyType]);

  const addHeader = () => {
    setHeaders([...headers, { id: String(Date.now()), key: '', value: '', enabled: true }]);
  };

  const removeHeader = (id: string) => {
    setHeaders(headers.filter(h => h.id !== id));
  };

  const updateHeader = (id: string, field: keyof Header, value: string | boolean) => {
    setHeaders(headers.map(h => h.id === id ? { ...h, [field]: value } : h));
  };

  const addParam = () => {
    setQueryParams([...queryParams, { id: String(Date.now()), key: '', value: '', enabled: true }]);
  };

  const removeParam = (id: string) => {
    setQueryParams(queryParams.filter(p => p.id !== id));
  };

  const updateParam = (id: string, field: keyof QueryParam, value: string | boolean) => {
    setQueryParams(queryParams.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const loadFromHistory = (item: RequestHistory) => {
    setMethod(item.method);
    setUrl(item.url.split('?')[0]);
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setSnackbar({ open: true, message: 'Copied to clipboard' });
  };

  const getStatusColor = (status: number): string => {
    if (status >= 200 && status < 300) return '#10b981';
    if (status >= 300 && status < 400) return '#f59e0b';
    if (status >= 400) return '#ef4444';
    return '#6b7280';
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a' }}>
      <Paper elevation={0} sx={{ bgcolor: '#111', borderBottom: '1px solid #222', px: 3, py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Link to="/"><IconButton size="small" sx={{ color: 'grey.500' }}><Home /></IconButton></Link>
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>API Request Builder</Typography>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', height: 'calc(100vh - 70px)' }}>
        {/* Request Panel */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* URL Bar */}
          <Paper sx={{ bgcolor: '#111', borderBottom: '1px solid #222', p: 2 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <FormControl size="small" sx={{ width: 120 }}>
                <Select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as HttpMethod)}
                  sx={{ color: methodColors[method], fontWeight: 600, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' } }}
                >
                  {(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as HttpMethod[]).map(m => (
                    <MenuItem key={m} value={m} sx={{ color: methodColors[m], fontWeight: 600 }}>{m}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                size="small"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter request URL..."
                sx={{
                  '& .MuiInputBase-root': { color: 'grey.300', fontFamily: 'monospace' },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
                }}
              />
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Send />}
                onClick={sendRequest}
                disabled={loading || !url}
                sx={{ bgcolor: '#2563eb', minWidth: 100 }}
              >
                Send
              </Button>
            </Box>
          </Paper>

          {/* Request Config Tabs */}
          <Paper sx={{ bgcolor: '#0d0d0d', borderBottom: '1px solid #222' }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ '& .MuiTab-root': { color: 'grey.500' } }}>
              <Tab label={`Params (${queryParams.filter(p => p.enabled).length})`} value="params" />
              <Tab label={`Headers (${headers.filter(h => h.enabled).length})`} value="headers" />
              <Tab label="Body" value="body" />
            </Tabs>
          </Paper>

          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            {tab === 'params' && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                  <Button size="small" startIcon={<Add />} onClick={addParam} sx={{ color: 'grey.400' }}>Add Param</Button>
                </Box>
                {queryParams.map(param => (
                  <Box key={param.id} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                    <TextField size="small" placeholder="Key" value={param.key} onChange={(e) => updateParam(param.id, 'key', e.target.value)} sx={{ flex: 1, '& .MuiInputBase-root': { color: 'grey.300' } }} />
                    <TextField size="small" placeholder="Value" value={param.value} onChange={(e) => updateParam(param.id, 'value', e.target.value)} sx={{ flex: 1, '& .MuiInputBase-root': { color: 'grey.300' } }} />
                    <IconButton size="small" onClick={() => removeParam(param.id)} sx={{ color: 'grey.500' }}><Delete fontSize="small" /></IconButton>
                  </Box>
                ))}
                {queryParams.length === 0 && <Typography sx={{ color: 'grey.600', textAlign: 'center', py: 4 }}>No query parameters</Typography>}
              </Box>
            )}

            {tab === 'headers' && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                  <Button size="small" startIcon={<Add />} onClick={addHeader} sx={{ color: 'grey.400' }}>Add Header</Button>
                </Box>
                {headers.map(header => (
                  <Box key={header.id} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                    <TextField size="small" placeholder="Key" value={header.key} onChange={(e) => updateHeader(header.id, 'key', e.target.value)} sx={{ flex: 1, '& .MuiInputBase-root': { color: 'grey.300' } }} />
                    <TextField size="small" placeholder="Value" value={header.value} onChange={(e) => updateHeader(header.id, 'value', e.target.value)} sx={{ flex: 1, '& .MuiInputBase-root': { color: 'grey.300' } }} />
                    <IconButton size="small" onClick={() => removeHeader(header.id)} sx={{ color: 'grey.500' }}><Delete fontSize="small" /></IconButton>
                  </Box>
                ))}
              </Box>
            )}

            {tab === 'body' && (
              <Box>
                <FormControl size="small" sx={{ mb: 2, minWidth: 200 }}>
                  <InputLabel sx={{ color: 'grey.500' }}>Body Type</InputLabel>
                  <Select value={bodyType} label="Body Type" onChange={(e) => setBodyType(e.target.value as BodyType)} sx={{ color: 'grey.300' }}>
                    <MenuItem value="none">None</MenuItem>
                    <MenuItem value="json">JSON</MenuItem>
                    <MenuItem value="raw">Raw</MenuItem>
                  </Select>
                </FormControl>
                {bodyType !== 'none' && (
                  <TextField
                    fullWidth
                    multiline
                    rows={10}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder={bodyType === 'json' ? '{\n  "key": "value"\n}' : 'Enter request body...'}
                    sx={{
                      '& .MuiInputBase-root': { fontFamily: 'monospace', fontSize: 13, color: '#d4d4d4', bgcolor: '#0a0a0a' },
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
                    }}
                  />
                )}
              </Box>
            )}
          </Box>

          {/* Response Panel */}
          <Box sx={{ flex: 1, borderTop: '1px solid #222', display: 'flex', flexDirection: 'column' }}>
            <Paper sx={{ bgcolor: '#0d0d0d', borderBottom: '1px solid #222', px: 2, py: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="subtitle2" sx={{ color: 'grey.400' }}>Response</Typography>
                {responseStatus !== null && (
                  <Chip label={`${responseStatus} ${responseStatus === 200 ? 'OK' : ''}`} size="small" sx={{ bgcolor: `${getStatusColor(responseStatus)}20`, color: getStatusColor(responseStatus) }} />
                )}
                {responseTime !== null && (
                  <Chip label={`${responseTime}ms`} size="small" sx={{ bgcolor: 'rgba(139, 92, 246, 0.2)', color: '#8b5cf6' }} />
                )}
              </Box>
              <Tooltip title="Copy Response">
                <IconButton size="small" onClick={() => handleCopy(response)} disabled={!response} sx={{ color: 'grey.500' }}>
                  <ContentCopy fontSize="small" />
                </IconButton>
              </Tooltip>
            </Paper>
            <Tabs value={responseTab} onChange={(_, v) => setResponseTab(v)} sx={{ bgcolor: '#0d0d0d', borderBottom: '1px solid #222', '& .MuiTab-root': { color: 'grey.500', minHeight: 40 } }}>
              <Tab label="Body" value="body" sx={{ minHeight: 40 }} />
              <Tab label={`Headers (${Object.keys(responseHeaders).length})`} value="headers" sx={{ minHeight: 40 }} />
            </Tabs>
            <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
              {responseTab === 'body' && (
                <Typography component="pre" sx={{ fontFamily: 'monospace', fontSize: 13, color: '#d4d4d4', m: 0, whiteSpace: 'pre-wrap' }}>
                  {response || (loading ? 'Loading...' : 'Send a request to see the response')}
                </Typography>
              )}
              {responseTab === 'headers' && (
                <Box>
                  {Object.entries(responseHeaders).map(([key, value]) => (
                    <Box key={key} sx={{ display: 'flex', mb: 1 }}>
                      <Typography sx={{ fontFamily: 'monospace', fontSize: 13, color: '#e06c75', minWidth: 200 }}>{key}:</Typography>
                      <Typography sx={{ fontFamily: 'monospace', fontSize: 13, color: '#98c379' }}>{value}</Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        {/* History Panel */}
        <Box sx={{ width: 300, borderLeft: '1px solid #222' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, borderBottom: '1px solid #222' }}>
            <History sx={{ fontSize: 18, color: 'grey.500' }} />
            <Typography variant="subtitle2" sx={{ color: 'grey.400' }}>History</Typography>
          </Box>
          <List dense sx={{ overflow: 'auto', maxHeight: 'calc(100vh - 150px)' }}>
            {history.length === 0 ? (
              <ListItem><ListItemText primary="No history yet" primaryTypographyProps={{ color: 'grey.600', textAlign: 'center' }} /></ListItem>
            ) : (
              history.map(item => (
                <ListItem key={item.id} disablePadding>
                  <ListItemButton onClick={() => loadFromHistory(item)}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip label={item.method} size="small" sx={{ bgcolor: `${methodColors[item.method]}20`, color: methodColors[item.method], height: 20, fontSize: 10 }} />
                          <Typography sx={{ fontSize: 12, color: 'grey.400', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.url.replace(/https?:\/\//, '')}</Typography>
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                          {item.status && <Chip label={item.status} size="small" sx={{ height: 16, fontSize: 10, bgcolor: `${getStatusColor(item.status)}20`, color: getStatusColor(item.status) }} />}
                          {item.duration && <Typography variant="caption" sx={{ color: 'grey.600' }}>{item.duration}ms</Typography>}
                        </Box>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))
            )}
          </List>
        </Box>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={2000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} />
    </Box>
  );
}
