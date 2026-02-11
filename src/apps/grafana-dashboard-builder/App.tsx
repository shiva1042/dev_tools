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
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  ContentCopy,
  Home,
  Add,
  Delete,
  Download,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

interface Target {
  expr: string;
  legendFormat: string;
  refId: string;
}

interface Threshold {
  color: string;
  value: number | null;
}

interface Panel {
  title: string;
  type: string;
  gridX: number;
  gridY: number;
  gridW: number;
  gridH: number;
  datasource: string;
  targets: Target[];
  unit: string;
  thresholds: Threshold[];
}

const panelTypes = ['graph', 'timeseries', 'stat', 'gauge', 'table', 'heatmap', 'text', 'bargauge', 'piechart', 'logs'];
const unitOptions = ['', 'short', 'percent', 'percentunit', 'bytes', 'decbytes', 'bits', 's', 'ms', 'ns', 'reqps', 'ops', 'hertz', 'celsius', 'fahrenheit'];
const refreshOptions = ['5s', '10s', '30s', '1m', '5m', '15m', '30m', '1h'];

export default function GrafanaDashboardBuilder() {
  const [title, setTitle] = useState('My Dashboard');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('monitoring,infrastructure');
  const [editable, setEditable] = useState(true);
  const [refresh, setRefresh] = useState('30s');
  const [timeFrom, setTimeFrom] = useState('now-6h');
  const [timeTo, setTimeTo] = useState('now');
  const [panels, setPanels] = useState<Panel[]>([
    {
      title: 'Request Rate',
      type: 'timeseries',
      gridX: 0, gridY: 0, gridW: 12, gridH: 8,
      datasource: 'Prometheus',
      targets: [{ expr: 'rate(http_requests_total[5m])', legendFormat: '{{method}} {{status}}', refId: 'A' }],
      unit: 'reqps',
      thresholds: [{ color: 'green', value: null }, { color: 'red', value: 80 }],
    },
  ]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const addPanel = () => {
    const maxY = panels.reduce((max, p) => Math.max(max, p.gridY + p.gridH), 0);
    setPanels([...panels, {
      title: 'New Panel',
      type: 'timeseries',
      gridX: 0, gridY: maxY, gridW: 12, gridH: 8,
      datasource: 'Prometheus',
      targets: [{ expr: '', legendFormat: '', refId: 'A' }],
      unit: '',
      thresholds: [{ color: 'green', value: null }],
    }]);
  };

  const removePanel = (i: number) => setPanels(panels.filter((_, idx) => idx !== i));

  const updatePanel = (i: number, field: string, val: unknown) => {
    const p = [...panels]; p[i] = { ...p[i], [field]: val }; setPanels(p);
  };

  const addTarget = (pi: number) => {
    const p = [...panels];
    const refId = String.fromCharCode(65 + p[pi].targets.length);
    p[pi].targets = [...p[pi].targets, { expr: '', legendFormat: '', refId }];
    setPanels(p);
  };

  const removeTarget = (pi: number, ti: number) => {
    const p = [...panels];
    p[pi].targets = p[pi].targets.filter((_, idx) => idx !== ti);
    setPanels(p);
  };

  const updateTarget = (pi: number, ti: number, field: keyof Target, val: string) => {
    const p = [...panels];
    p[pi].targets = [...p[pi].targets];
    p[pi].targets[ti] = { ...p[pi].targets[ti], [field]: val };
    setPanels(p);
  };

  const addThreshold = (pi: number) => {
    const p = [...panels];
    p[pi].thresholds = [...p[pi].thresholds, { color: 'red', value: 80 }];
    setPanels(p);
  };

  const generateJSON = (): string => {
    const dashboard = {
      __inputs: [{ name: 'DS_PROMETHEUS', label: 'Prometheus', type: 'datasource', pluginId: 'prometheus' }],
      __requires: [
        { type: 'grafana', id: 'grafana', name: 'Grafana', version: '9.0.0' },
        { type: 'datasource', id: 'prometheus', name: 'Prometheus', version: '1.0.0' },
      ],
      annotations: { list: [{ builtIn: 1, datasource: '-- Grafana --', enable: true, hide: true, iconColor: 'rgba(0, 211, 255, 1)', name: 'Annotations & Alerts', type: 'dashboard' }] },
      description,
      editable,
      gnetId: null,
      graphTooltip: 1,
      id: null,
      links: [],
      panels: panels.map((panel, i) => ({
        id: i + 1,
        title: panel.title,
        type: panel.type,
        gridPos: { x: panel.gridX, y: panel.gridY, w: panel.gridW, h: panel.gridH },
        datasource: { type: 'prometheus', uid: panel.datasource },
        targets: panel.targets.map(t => ({
          datasource: { type: 'prometheus', uid: panel.datasource },
          expr: t.expr,
          legendFormat: t.legendFormat,
          refId: t.refId,
        })),
        fieldConfig: {
          defaults: {
            ...(panel.unit ? { unit: panel.unit } : {}),
            thresholds: {
              mode: 'absolute',
              steps: panel.thresholds.map(th => ({ color: th.color, value: th.value })),
            },
            color: { mode: 'palette-classic' },
          },
          overrides: [],
        },
        options: panel.type === 'stat' ? { colorMode: 'value', graphMode: 'area', reduceOptions: { calcs: ['lastNotNull'] } }
          : panel.type === 'gauge' ? { reduceOptions: { calcs: ['lastNotNull'] }, showThresholdLabels: false, showThresholdMarkers: true }
          : panel.type === 'text' ? { mode: 'markdown', content: '' }
          : { tooltip: { mode: 'multi', sort: 'desc' }, legend: { displayMode: 'table', placement: 'bottom', calcs: ['mean', 'max'] } },
      })),
      refresh,
      schemaVersion: 38,
      style: 'dark',
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      templating: { list: [] },
      time: { from: timeFrom, to: timeTo },
      timepicker: {},
      timezone: 'browser',
      title,
      uid: null,
      version: 1,
    };
    return JSON.stringify(dashboard, null, 2);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generateJSON());
    setSnackbar({ open: true, message: 'Dashboard JSON copied to clipboard' });
  };

  const handleDownload = () => {
    const blob = new Blob([generateJSON()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${title.replace(/\s+/g, '-').toLowerCase()}-dashboard.json`; a.click();
    URL.revokeObjectURL(url);
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
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>Grafana Dashboard Builder</Typography>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', gap: 3, p: 3, minHeight: 'calc(100vh - 72px)' }}>
        {/* Left: Config */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, overflow: 'auto', maxHeight: 'calc(100vh - 100px)' }}>
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
            <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 2 }}>Dashboard Settings</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="Title" size="small" fullWidth value={title} onChange={e => setTitle(e.target.value)} sx={inputSx} />
              <TextField label="Description" size="small" fullWidth value={description} onChange={e => setDescription(e.target.value)} sx={inputSx} />
              <TextField label="Tags (comma separated)" size="small" fullWidth value={tags} onChange={e => setTags(e.target.value)} sx={inputSx} />
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <FormControl size="small" sx={{ minWidth: 120, ...inputSx }}>
                  <InputLabel sx={{ color: 'grey.500' }}>Refresh</InputLabel>
                  <Select value={refresh} label="Refresh" onChange={e => setRefresh(e.target.value)} sx={selectSx}>
                    {refreshOptions.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                  </Select>
                </FormControl>
                <TextField label="From" size="small" value={timeFrom} onChange={e => setTimeFrom(e.target.value)} sx={{ ...inputSx, flex: 1 }} />
                <TextField label="To" size="small" value={timeTo} onChange={e => setTimeTo(e.target.value)} sx={{ ...inputSx, flex: 1 }} />
                <FormControlLabel control={<Switch checked={editable} onChange={e => setEditable(e.target.checked)} size="small" />} label={<Typography sx={{ color: 'grey.400', fontSize: 13 }}>Editable</Typography>} />
              </Box>
            </Box>
          </Paper>

          {/* Panels */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="subtitle1" sx={{ color: 'grey.300', fontWeight: 600 }}>Panels ({panels.length})</Typography>
            <Button size="small" startIcon={<Add />} onClick={addPanel} sx={{ color: 'grey.400' }}>Add Panel</Button>
          </Box>

          {panels.map((panel, pi) => (
            <Paper key={pi} sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Chip label={`Panel ${pi + 1} - ${panel.type}`} size="small" sx={{ bgcolor: '#1a2a3a', color: '#64b5f6', fontSize: 11 }} />
                <IconButton size="small" onClick={() => removePanel(pi)} sx={{ color: 'grey.600' }}><Delete fontSize="small" /></IconButton>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField placeholder="Panel title" size="small" value={panel.title} onChange={e => updatePanel(pi, 'title', e.target.value)} sx={{ ...inputSx, flex: 2 }} />
                  <FormControl size="small" sx={{ minWidth: 130, ...inputSx }}>
                    <Select value={panel.type} onChange={e => updatePanel(pi, 'type', e.target.value)} sx={selectSx}>
                      {panelTypes.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField type="number" label="X" size="small" value={panel.gridX} onChange={e => updatePanel(pi, 'gridX', Number(e.target.value))} sx={{ ...inputSx, flex: 1 }} />
                  <TextField type="number" label="Y" size="small" value={panel.gridY} onChange={e => updatePanel(pi, 'gridY', Number(e.target.value))} sx={{ ...inputSx, flex: 1 }} />
                  <TextField type="number" label="W" size="small" value={panel.gridW} onChange={e => updatePanel(pi, 'gridW', Number(e.target.value))} sx={{ ...inputSx, flex: 1 }} />
                  <TextField type="number" label="H" size="small" value={panel.gridH} onChange={e => updatePanel(pi, 'gridH', Number(e.target.value))} sx={{ ...inputSx, flex: 1 }} />
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField placeholder="Datasource" size="small" value={panel.datasource} onChange={e => updatePanel(pi, 'datasource', e.target.value)} sx={{ ...inputSx, flex: 1 }} />
                  <FormControl size="small" sx={{ minWidth: 120, ...inputSx }}>
                    <InputLabel sx={{ color: 'grey.500' }}>Unit</InputLabel>
                    <Select value={panel.unit} label="Unit" onChange={e => updatePanel(pi, 'unit', e.target.value)} sx={selectSx}>
                      {unitOptions.map(u => <MenuItem key={u || 'none'} value={u}>{u || 'none'}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Box>

                <Typography variant="caption" sx={{ color: 'grey.500', mt: 1 }}>Targets:</Typography>
                {panel.targets.map((t, ti) => (
                  <Box key={ti} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Chip label={t.refId} size="small" sx={{ bgcolor: '#1a1a2a', color: '#ce93d8', minWidth: 28 }} />
                    <TextField placeholder="PromQL expression" size="small" value={t.expr} onChange={e => updateTarget(pi, ti, 'expr', e.target.value)} sx={{ ...inputSx, flex: 2 }} />
                    <TextField placeholder="Legend" size="small" value={t.legendFormat} onChange={e => updateTarget(pi, ti, 'legendFormat', e.target.value)} sx={{ ...inputSx, flex: 1 }} />
                    <IconButton size="small" onClick={() => removeTarget(pi, ti)} sx={{ color: 'grey.600' }}><Delete fontSize="small" /></IconButton>
                  </Box>
                ))}
                <Button size="small" startIcon={<Add />} onClick={() => addTarget(pi)} sx={{ color: 'grey.500', alignSelf: 'flex-start' }}>Add Target</Button>

                <Typography variant="caption" sx={{ color: 'grey.500', mt: 1 }}>Thresholds:</Typography>
                {panel.thresholds.map((th, ti) => (
                  <Box key={ti} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: th.color, border: '1px solid #444', flexShrink: 0 }} />
                    <TextField placeholder="Color" size="small" value={th.color} onChange={e => {
                      const p = [...panels]; p[pi].thresholds = [...p[pi].thresholds]; p[pi].thresholds[ti] = { ...th, color: e.target.value }; setPanels(p);
                    }} sx={{ ...inputSx, flex: 1 }} />
                    <TextField type="number" placeholder="Value" size="small" value={th.value ?? ''} onChange={e => {
                      const p = [...panels]; p[pi].thresholds = [...p[pi].thresholds]; p[pi].thresholds[ti] = { ...th, value: e.target.value === '' ? null : Number(e.target.value) }; setPanels(p);
                    }} sx={{ ...inputSx, flex: 1 }} />
                  </Box>
                ))}
                <Button size="small" startIcon={<Add />} onClick={() => addThreshold(pi)} sx={{ color: 'grey.500', alignSelf: 'flex-start' }}>Add Threshold</Button>
              </Box>
            </Paper>
          ))}
        </Box>

        {/* Right: Output */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderBottom: '1px solid #222' }}>
              <Typography variant="subtitle2" sx={{ color: 'grey.400' }}>Dashboard JSON</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Copy"><IconButton size="small" onClick={handleCopy} sx={{ color: 'grey.500' }}><ContentCopy fontSize="small" /></IconButton></Tooltip>
                <Tooltip title="Download"><IconButton size="small" onClick={handleDownload} sx={{ color: 'grey.500' }}><Download fontSize="small" /></IconButton></Tooltip>
              </Box>
            </Box>
            <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
              <Typography component="pre" sx={{ fontFamily: 'monospace', fontSize: 12, color: '#d4d4d4', whiteSpace: 'pre-wrap', m: 0 }}>
                {generateJSON()}
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={2000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} />
    </Box>
  );
}
