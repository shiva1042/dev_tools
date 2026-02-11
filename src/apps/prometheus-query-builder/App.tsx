import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Chip,
  Autocomplete,
} from '@mui/material';
import {
  ContentCopy,
  Home,
  Add,
  Delete,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

interface LabelMatcher {
  label: string;
  operator: '=' | '!=' | '=~' | '!~';
  value: string;
}

interface FunctionWrap {
  fn: string;
  params: string;
}

const commonMetrics = [
  'http_requests_total', 'http_request_duration_seconds', 'http_request_duration_seconds_bucket',
  'node_cpu_seconds_total', 'node_memory_MemAvailable_bytes', 'node_memory_MemTotal_bytes',
  'node_disk_io_time_seconds_total', 'node_filesystem_avail_bytes', 'node_network_receive_bytes_total',
  'up', 'process_resident_memory_bytes', 'process_cpu_seconds_total', 'process_open_fds',
  'go_goroutines', 'go_memstats_alloc_bytes', 'go_gc_duration_seconds',
  'container_cpu_usage_seconds_total', 'container_memory_usage_bytes',
  'kube_pod_status_phase', 'kube_deployment_spec_replicas', 'kube_node_status_condition',
  'prometheus_tsdb_head_series', 'prometheus_http_requests_total',
];

const functions = [
  { name: 'rate', hasRange: true, desc: 'Per-second rate of increase' },
  { name: 'irate', hasRange: true, desc: 'Instant per-second rate' },
  { name: 'increase', hasRange: true, desc: 'Increase over time range' },
  { name: 'sum', hasRange: false, desc: 'Sum of values' },
  { name: 'avg', hasRange: false, desc: 'Average of values' },
  { name: 'max', hasRange: false, desc: 'Maximum value' },
  { name: 'min', hasRange: false, desc: 'Minimum value' },
  { name: 'count', hasRange: false, desc: 'Count of elements' },
  { name: 'stddev', hasRange: false, desc: 'Standard deviation' },
  { name: 'histogram_quantile', hasRange: false, desc: 'Quantile from histogram' },
  { name: 'topk', hasRange: false, desc: 'Top K elements' },
  { name: 'bottomk', hasRange: false, desc: 'Bottom K elements' },
  { name: 'absent', hasRange: false, desc: 'Returns 1 if vector is empty' },
  { name: 'absent_over_time', hasRange: true, desc: 'Returns 1 if range vector is empty' },
  { name: 'delta', hasRange: true, desc: 'Delta between first and last' },
  { name: 'deriv', hasRange: true, desc: 'Per-second derivative' },
  { name: 'predict_linear', hasRange: true, desc: 'Linear prediction' },
  { name: 'changes', hasRange: true, desc: 'Number of value changes' },
  { name: 'resets', hasRange: true, desc: 'Number of counter resets' },
  { name: 'round', hasRange: false, desc: 'Round to nearest integer' },
  { name: 'ceil', hasRange: false, desc: 'Round up' },
  { name: 'floor', hasRange: false, desc: 'Round down' },
  { name: 'abs', hasRange: false, desc: 'Absolute value' },
  { name: 'clamp', hasRange: false, desc: 'Clamp between min and max' },
  { name: 'label_replace', hasRange: false, desc: 'Replace label values' },
  { name: 'sort', hasRange: false, desc: 'Sort ascending' },
  { name: 'sort_desc', hasRange: false, desc: 'Sort descending' },
];

const rangeOptions = ['30s', '1m', '2m', '5m', '10m', '15m', '30m', '1h', '2h', '6h', '12h', '1d', '7d', '30d'];
const aggregationOptions = ['by', 'without'];

export default function PrometheusQueryBuilder() {
  const [metric, setMetric] = useState('http_requests_total');
  const [matchers, setMatchers] = useState<LabelMatcher[]>([
    { label: 'job', operator: '=', value: 'api-server' },
  ]);
  const [fnWraps, setFnWraps] = useState<FunctionWrap[]>([
    { fn: 'rate', params: '' },
  ]);
  const [rangeVector, setRangeVector] = useState('5m');
  const [aggregation, setAggregation] = useState('');
  const [aggregationType, setAggregationType] = useState<'by' | 'without'>('by');
  const [aggregationLabels, setAggregationLabels] = useState('');
  const [offset, setOffset] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const addMatcher = () => setMatchers([...matchers, { label: '', operator: '=', value: '' }]);
  const removeMatcher = (i: number) => setMatchers(matchers.filter((_, idx) => idx !== i));
  const updateMatcher = (i: number, field: keyof LabelMatcher, val: string) => {
    const m = [...matchers]; m[i] = { ...m[i], [field]: val }; setMatchers(m);
  };

  const addFn = () => setFnWraps([...fnWraps, { fn: 'sum', params: '' }]);
  const removeFn = (i: number) => setFnWraps(fnWraps.filter((_, idx) => idx !== i));
  const updateFn = (i: number, field: keyof FunctionWrap, val: string) => {
    const f = [...fnWraps]; f[i] = { ...f[i], [field]: val }; setFnWraps(f);
  };

  const buildQuery = (): string => {
    // Base metric with label matchers
    const matcherStr = matchers
      .filter(m => m.label && m.value)
      .map(m => `${m.label}${m.operator}"${m.value}"`)
      .join(', ');
    let base = metric;
    if (matcherStr) base += `{${matcherStr}}`;

    // Check if any function needs a range vector
    const needsRange = fnWraps.some(f => {
      const fDef = functions.find(fn => fn.name === f.fn);
      return fDef?.hasRange;
    });
    if (needsRange && rangeVector) base += `[${rangeVector}]`;
    if (offset) base += ` offset ${offset}`;

    // Wrap with functions (innermost first)
    let query = base;
    fnWraps.forEach(f => {
      const fDef = functions.find(fn => fn.name === f.fn);
      if (!fDef) return;
      if (f.fn === 'histogram_quantile') {
        query = `histogram_quantile(${f.params || '0.99'}, ${query})`;
      } else if (f.fn === 'topk' || f.fn === 'bottomk') {
        query = `${f.fn}(${f.params || '10'}, ${query})`;
      } else if (f.fn === 'clamp') {
        query = `clamp(${query}, ${f.params || '0, 100'})`;
      } else if (f.fn === 'predict_linear') {
        query = `predict_linear(${query}, ${f.params || '3600'})`;
      } else if (f.fn === 'round') {
        query = f.params ? `round(${query}, ${f.params})` : `round(${query})`;
      } else {
        query = `${f.fn}(${query})`;
      }
    });

    // Aggregation
    if (aggregation && aggregationLabels) {
      query = `${aggregation}(${aggregationType}(${aggregationLabels.split(',').map(l => l.trim()).join(', ')})) (${query})`;
    } else if (aggregation) {
      query = `${aggregation}(${query})`;
    }

    return query;
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(buildQuery());
    setSnackbar({ open: true, message: 'Query copied to clipboard' });
  };

  const inputSx = {
    '& .MuiInputBase-root': { bgcolor: '#0a0a0a', color: '#d4d4d4', fontSize: 14 },
    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
    '& .MuiInputLabel-root': { color: 'grey.500' },
  };

  const selectSx = { color: '#d4d4d4', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' } };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a' }}>
      <Paper elevation={0} sx={{ bgcolor: '#111', borderBottom: '1px solid #222', px: 3, py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Link to="/"><IconButton size="small" sx={{ color: 'grey.500' }}><Home /></IconButton></Link>
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>Prometheus Query Builder</Typography>
        </Box>
      </Paper>

      <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
        {/* Query Preview */}
        <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="subtitle2" sx={{ color: 'grey.400' }}>Generated PromQL Query</Typography>
            <Tooltip title="Copy query"><IconButton size="small" onClick={handleCopy} sx={{ color: 'grey.500' }}><ContentCopy fontSize="small" /></IconButton></Tooltip>
          </Box>
          <Paper sx={{ bgcolor: '#0a0a0a', border: '1px solid #1a2a3a', p: 2, borderRadius: 1 }}>
            <Typography sx={{ fontFamily: 'monospace', fontSize: 15, color: '#64b5f6', wordBreak: 'break-all' }}>
              {buildQuery()}
            </Typography>
          </Paper>
        </Paper>

        {/* Metric */}
        <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 2 }}>
          <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1 }}>Metric Name</Typography>
          <Autocomplete
            freeSolo
            value={metric}
            onChange={(_, val) => setMetric(val || '')}
            onInputChange={(_, val) => setMetric(val)}
            options={commonMetrics}
            renderInput={(params) => (
              <TextField {...params} size="small" placeholder="Enter or select metric name" sx={inputSx} />
            )}
            sx={{ '& .MuiAutocomplete-popupIndicator': { color: 'grey.500' } }}
          />
        </Paper>

        {/* Label Matchers */}
        <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="subtitle2" sx={{ color: 'grey.400' }}>Label Matchers</Typography>
            <IconButton size="small" onClick={addMatcher} sx={{ color: 'grey.500' }}><Add /></IconButton>
          </Box>
          {matchers.map((m, i) => (
            <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
              <TextField placeholder="Label name" size="small" value={m.label} onChange={e => updateMatcher(i, 'label', e.target.value)} sx={{ ...inputSx, flex: 2 }} />
              <FormControl size="small" sx={{ minWidth: 80, ...inputSx }}>
                <Select value={m.operator} onChange={e => updateMatcher(i, 'operator', e.target.value)} sx={selectSx}>
                  <MenuItem value="=">=</MenuItem>
                  <MenuItem value="!=">!=</MenuItem>
                  <MenuItem value="=~">=~</MenuItem>
                  <MenuItem value="!~">!~</MenuItem>
                </Select>
              </FormControl>
              <TextField placeholder="Value" size="small" value={m.value} onChange={e => updateMatcher(i, 'value', e.target.value)} sx={{ ...inputSx, flex: 2 }} />
              <IconButton size="small" onClick={() => removeMatcher(i)} sx={{ color: 'grey.600' }}><Delete fontSize="small" /></IconButton>
            </Box>
          ))}
        </Paper>

        {/* Range Vector & Offset */}
        <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 2 }}>
          <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1 }}>Range & Offset</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl size="small" fullWidth sx={inputSx}>
              <InputLabel sx={{ color: 'grey.500' }}>Range Vector</InputLabel>
              <Select value={rangeVector} label="Range Vector" onChange={e => setRangeVector(e.target.value)} sx={selectSx}>
                <MenuItem value="">None</MenuItem>
                {rangeOptions.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Offset (e.g. 1h, 5m)" size="small" fullWidth value={offset} onChange={e => setOffset(e.target.value)} sx={inputSx} />
          </Box>
        </Paper>

        {/* Functions */}
        <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="subtitle2" sx={{ color: 'grey.400' }}>Functions (applied inside-out)</Typography>
            <IconButton size="small" onClick={addFn} sx={{ color: 'grey.500' }}><Add /></IconButton>
          </Box>
          {fnWraps.map((f, i) => {
            const fDef = functions.find(fn => fn.name === f.fn);
            const needsParam = ['histogram_quantile', 'topk', 'bottomk', 'clamp', 'predict_linear', 'round'].includes(f.fn);
            return (
              <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                <Chip label={i + 1} size="small" sx={{ bgcolor: '#1a2a3a', color: '#64b5f6', minWidth: 28 }} />
                <FormControl size="small" sx={{ minWidth: 200, ...inputSx }}>
                  <Select value={f.fn} onChange={e => updateFn(i, 'fn', e.target.value)} sx={selectSx}>
                    {functions.map(fn => <MenuItem key={fn.name} value={fn.name}>{fn.name} - {fn.desc}</MenuItem>)}
                  </Select>
                </FormControl>
                {needsParam && (
                  <TextField
                    placeholder={f.fn === 'histogram_quantile' ? '0.99' : f.fn === 'topk' || f.fn === 'bottomk' ? '10' : f.fn === 'clamp' ? '0, 100' : 'seconds'}
                    size="small"
                    value={f.params}
                    onChange={e => updateFn(i, 'params', e.target.value)}
                    sx={{ ...inputSx, flex: 1 }}
                  />
                )}
                {fDef?.hasRange && <Chip label="range" size="small" sx={{ bgcolor: '#2a1a1a', color: '#ef9a9a', fontSize: 10 }} />}
                <IconButton size="small" onClick={() => removeFn(i)} sx={{ color: 'grey.600' }}><Delete fontSize="small" /></IconButton>
              </Box>
            );
          })}
        </Paper>

        {/* Aggregation */}
        <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 2 }}>
          <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1 }}>Outer Aggregation</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 140, ...inputSx }}>
              <InputLabel sx={{ color: 'grey.500' }}>Aggregation</InputLabel>
              <Select value={aggregation} label="Aggregation" onChange={e => setAggregation(e.target.value)} sx={selectSx}>
                <MenuItem value="">None</MenuItem>
                {['sum', 'avg', 'max', 'min', 'count', 'stddev', 'stdvar', 'group', 'count_values'].map(a => <MenuItem key={a} value={a}>{a}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120, ...inputSx }}>
              <Select value={aggregationType} onChange={e => setAggregationType(e.target.value as 'by' | 'without')} sx={selectSx}>
                {aggregationOptions.map(a => <MenuItem key={a} value={a}>{a}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField placeholder="Labels (comma separated)" size="small" fullWidth value={aggregationLabels} onChange={e => setAggregationLabels(e.target.value)} sx={inputSx} />
          </Box>
        </Paper>

        {/* Quick Examples */}
        <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
          <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1 }}>Quick Templates</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {[
              { label: 'HTTP Request Rate', fn: () => { setMetric('http_requests_total'); setMatchers([{ label: 'job', operator: '=', value: 'api-server' }]); setFnWraps([{ fn: 'rate', params: '' }]); setRangeVector('5m'); setAggregation('sum'); setAggregationLabels('method, status'); setAggregationType('by'); } },
              { label: 'CPU Usage', fn: () => { setMetric('node_cpu_seconds_total'); setMatchers([{ label: 'mode', operator: '!=', value: 'idle' }]); setFnWraps([{ fn: 'rate', params: '' }]); setRangeVector('5m'); setAggregation('sum'); setAggregationLabels('instance'); setAggregationType('by'); } },
              { label: 'Memory Available', fn: () => { setMetric('node_memory_MemAvailable_bytes'); setMatchers([]); setFnWraps([]); setRangeVector(''); setAggregation(''); setAggregationLabels(''); } },
              { label: 'P99 Latency', fn: () => { setMetric('http_request_duration_seconds_bucket'); setMatchers([]); setFnWraps([{ fn: 'rate', params: '' }, { fn: 'histogram_quantile', params: '0.99' }]); setRangeVector('5m'); setAggregation('sum'); setAggregationLabels('le'); setAggregationType('by'); } },
              { label: 'Up Targets', fn: () => { setMetric('up'); setMatchers([]); setFnWraps([]); setRangeVector(''); setAggregation('count'); setAggregationLabels('job'); setAggregationType('by'); } },
            ].map((t, i) => (
              <Button key={i} size="small" variant="outlined" onClick={t.fn} sx={{ color: 'grey.400', borderColor: '#333', textTransform: 'none', fontSize: 12 }}>
                {t.label}
              </Button>
            ))}
          </Box>
        </Paper>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={2000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} />
    </Box>
  );
}
