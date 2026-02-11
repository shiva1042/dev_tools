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
  Tabs,
  Tab,
} from '@mui/material';
import {
  ContentCopy,
  Home,
  Add,
  Delete,
  Download,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

interface Dependency {
  name: string;
  version: string;
  repository: string;
}

interface ValueEntry {
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'array';
}

interface TemplateResource {
  kind: string;
  name: string;
}

const resourceKinds = ['Deployment', 'Service', 'Ingress', 'ConfigMap', 'Secret', 'ServiceAccount', 'HorizontalPodAutoscaler', 'PersistentVolumeClaim'];

export default function HelmChartBuilder() {
  const [chartName, setChartName] = useState('my-chart');
  const [chartVersion, setChartVersion] = useState('0.1.0');
  const [description, setDescription] = useState('A Helm chart for Kubernetes');
  const [appVersion, setAppVersion] = useState('1.0.0');
  const [dependencies, setDependencies] = useState<Dependency[]>([]);
  const [values, setValues] = useState<ValueEntry[]>([
    { key: 'replicaCount', value: '1', type: 'number' },
    { key: 'image.repository', value: 'nginx', type: 'string' },
    { key: 'image.tag', value: 'latest', type: 'string' },
    { key: 'service.type', value: 'ClusterIP', type: 'string' },
    { key: 'service.port', value: '80', type: 'number' },
  ]);
  const [resources, setResources] = useState<TemplateResource[]>([
    { kind: 'Deployment', name: 'main' },
    { kind: 'Service', name: 'main' },
  ]);
  const [outputTab, setOutputTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const addDependency = () => setDependencies([...dependencies, { name: '', version: '', repository: '' }]);
  const removeDependency = (i: number) => setDependencies(dependencies.filter((_, idx) => idx !== i));
  const updateDep = (i: number, field: keyof Dependency, val: string) => {
    const d = [...dependencies]; d[i] = { ...d[i], [field]: val }; setDependencies(d);
  };

  const addValue = () => setValues([...values, { key: '', value: '', type: 'string' }]);
  const removeValue = (i: number) => setValues(values.filter((_, idx) => idx !== i));
  const updateVal = (i: number, field: keyof ValueEntry, val: string) => {
    const v = [...values]; v[i] = { ...v[i], [field]: val } as ValueEntry; setValues(v);
  };

  const addResource = () => setResources([...resources, { kind: 'Deployment', name: '' }]);
  const removeResource = (i: number) => setResources(resources.filter((_, idx) => idx !== i));

  const generateChartYaml = (): string => {
    let out = `apiVersion: v2\nname: ${chartName}\ndescription: ${description}\ntype: application\nversion: ${chartVersion}\nappVersion: "${appVersion}"\n`;
    if (dependencies.length > 0) {
      out += `\ndependencies:\n`;
      dependencies.forEach(d => {
        out += `  - name: ${d.name}\n    version: ${d.version}\n    repository: ${d.repository}\n`;
      });
    }
    return out;
  };

  const generateValuesYaml = (): string => {
    const nested: Record<string, unknown> = {};
    values.forEach(v => {
      const parts = v.key.split('.');
      let current: Record<string, unknown> = nested;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]] || typeof current[parts[i]] !== 'object') current[parts[i]] = {};
        current = current[parts[i]] as Record<string, unknown>;
      }
      const leaf = parts[parts.length - 1];
      if (v.type === 'number') current[leaf] = Number(v.value) || 0;
      else if (v.type === 'boolean') current[leaf] = v.value === 'true';
      else if (v.type === 'array') {
        try { current[leaf] = JSON.parse(v.value); } catch { current[leaf] = []; }
      } else current[leaf] = v.value;
    });
    const toYaml = (obj: Record<string, unknown>, indent: number): string => {
      let out = '';
      Object.entries(obj).forEach(([k, val]) => {
        const pad = '  '.repeat(indent);
        if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
          out += `${pad}${k}:\n${toYaml(val as Record<string, unknown>, indent + 1)}`;
        } else if (Array.isArray(val)) {
          out += `${pad}${k}:\n`;
          val.forEach(item => { out += `${pad}  - ${item}\n`; });
        } else {
          out += `${pad}${k}: ${val}\n`;
        }
      });
      return out;
    };
    return toYaml(nested, 0);
  };

  const generateTemplate = (res: TemplateResource): string => {
    const name = `{{ include "${chartName}.fullname" . }}`;
    const labels = `    app.kubernetes.io/name: {{ include "${chartName}.name" . }}\n    app.kubernetes.io/instance: {{ .Release.Name }}`;
    switch (res.kind) {
      case 'Deployment':
        return `apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: ${name}\n  labels:\n${labels}\nspec:\n  replicas: {{ .Values.replicaCount }}\n  selector:\n    matchLabels:\n${labels}\n  template:\n    metadata:\n      labels:\n${labels}\n    spec:\n      containers:\n        - name: {{ .Chart.Name }}\n          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"\n          ports:\n            - containerPort: {{ .Values.service.port }}\n`;
      case 'Service':
        return `apiVersion: v1\nkind: Service\nmetadata:\n  name: ${name}\n  labels:\n${labels}\nspec:\n  type: {{ .Values.service.type }}\n  ports:\n    - port: {{ .Values.service.port }}\n      targetPort: {{ .Values.service.port }}\n      protocol: TCP\n  selector:\n${labels}\n`;
      case 'Ingress':
        return `{{- if .Values.ingress.enabled -}}\napiVersion: networking.k8s.io/v1\nkind: Ingress\nmetadata:\n  name: ${name}\n  labels:\n${labels}\nspec:\n  rules:\n    - host: {{ .Values.ingress.host }}\n      http:\n        paths:\n          - path: /\n            pathType: Prefix\n            backend:\n              service:\n                name: ${name}\n                port:\n                  number: {{ .Values.service.port }}\n{{- end }}\n`;
      case 'ConfigMap':
        return `apiVersion: v1\nkind: ConfigMap\nmetadata:\n  name: ${name}\n  labels:\n${labels}\ndata:\n  # Add your config data here\n  config.yaml: |\n    key: value\n`;
      case 'Secret':
        return `apiVersion: v1\nkind: Secret\nmetadata:\n  name: ${name}\n  labels:\n${labels}\ntype: Opaque\ndata:\n  # Add your base64 encoded secrets here\n  secret-key: {{ .Values.secretKey | b64enc | quote }}\n`;
      default:
        return `apiVersion: v1\nkind: ${res.kind}\nmetadata:\n  name: ${name}\n  labels:\n${labels}\n`;
    }
  };

  const outputs = [
    { label: 'Chart.yaml', content: generateChartYaml() },
    { label: 'values.yaml', content: generateValuesYaml() },
    ...resources.map(r => ({
      label: `templates/${r.name || r.kind.toLowerCase()}.yaml`,
      content: generateTemplate(r),
    })),
  ];

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setSnackbar({ open: true, message: 'Copied to clipboard' });
  };

  const handleDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const inputSx = {
    '& .MuiInputBase-root': { bgcolor: '#0a0a0a', color: '#d4d4d4', fontSize: 14 },
    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
    '& .MuiInputLabel-root': { color: 'grey.500' },
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a' }}>
      <Paper elevation={0} sx={{ bgcolor: '#111', borderBottom: '1px solid #222', px: 3, py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Link to="/"><IconButton size="small" sx={{ color: 'grey.500' }}><Home /></IconButton></Link>
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>Helm Chart Builder</Typography>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', gap: 3, p: 3, minHeight: 'calc(100vh - 72px)' }}>
        {/* Left: Config */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, overflow: 'auto', maxHeight: 'calc(100vh - 100px)' }}>
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
            <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 2 }}>Chart Metadata</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="Chart Name" size="small" fullWidth value={chartName} onChange={e => setChartName(e.target.value)} sx={inputSx} />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField label="Version" size="small" fullWidth value={chartVersion} onChange={e => setChartVersion(e.target.value)} sx={inputSx} />
                <TextField label="App Version" size="small" fullWidth value={appVersion} onChange={e => setAppVersion(e.target.value)} sx={inputSx} />
              </Box>
              <TextField label="Description" size="small" fullWidth value={description} onChange={e => setDescription(e.target.value)} sx={inputSx} />
            </Box>
          </Paper>

          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle2" sx={{ color: 'grey.400' }}>Dependencies</Typography>
              <IconButton size="small" onClick={addDependency} sx={{ color: 'grey.500' }}><Add /></IconButton>
            </Box>
            {dependencies.map((d, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                <TextField placeholder="Name" size="small" value={d.name} onChange={e => updateDep(i, 'name', e.target.value)} sx={{ ...inputSx, flex: 1 }} />
                <TextField placeholder="Version" size="small" value={d.version} onChange={e => updateDep(i, 'version', e.target.value)} sx={{ ...inputSx, flex: 1 }} />
                <TextField placeholder="Repository URL" size="small" value={d.repository} onChange={e => updateDep(i, 'repository', e.target.value)} sx={{ ...inputSx, flex: 2 }} />
                <IconButton size="small" onClick={() => removeDependency(i)} sx={{ color: 'grey.600' }}><Delete fontSize="small" /></IconButton>
              </Box>
            ))}
          </Paper>

          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle2" sx={{ color: 'grey.400' }}>Values (values.yaml)</Typography>
              <IconButton size="small" onClick={addValue} sx={{ color: 'grey.500' }}><Add /></IconButton>
            </Box>
            {values.map((v, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                <TextField placeholder="Key (dot notation)" size="small" value={v.key} onChange={e => updateVal(i, 'key', e.target.value)} sx={{ ...inputSx, flex: 2 }} />
                <TextField placeholder="Value" size="small" value={v.value} onChange={e => updateVal(i, 'value', e.target.value)} sx={{ ...inputSx, flex: 2 }} />
                <FormControl size="small" sx={{ minWidth: 100, ...inputSx }}>
                  <Select value={v.type} onChange={e => updateVal(i, 'type', e.target.value)} sx={{ color: '#d4d4d4', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' } }}>
                    <MenuItem value="string">string</MenuItem>
                    <MenuItem value="number">number</MenuItem>
                    <MenuItem value="boolean">boolean</MenuItem>
                    <MenuItem value="array">array</MenuItem>
                  </Select>
                </FormControl>
                <IconButton size="small" onClick={() => removeValue(i)} sx={{ color: 'grey.600' }}><Delete fontSize="small" /></IconButton>
              </Box>
            ))}
          </Paper>

          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle2" sx={{ color: 'grey.400' }}>Template Resources</Typography>
              <IconButton size="small" onClick={addResource} sx={{ color: 'grey.500' }}><Add /></IconButton>
            </Box>
            {resources.map((r, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                <FormControl size="small" sx={{ minWidth: 180, ...inputSx }}>
                  <InputLabel sx={{ color: 'grey.500' }}>Kind</InputLabel>
                  <Select value={r.kind} label="Kind" onChange={e => { const rs = [...resources]; rs[i] = { ...rs[i], kind: e.target.value }; setResources(rs); }} sx={{ color: '#d4d4d4', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' } }}>
                    {resourceKinds.map(k => <MenuItem key={k} value={k}>{k}</MenuItem>)}
                  </Select>
                </FormControl>
                <TextField placeholder="Template name" size="small" fullWidth value={r.name} onChange={e => { const rs = [...resources]; rs[i] = { ...rs[i], name: e.target.value }; setResources(rs); }} sx={inputSx} />
                <Chip label={r.kind} size="small" sx={{ bgcolor: '#1a3a2a', color: '#4caf50', fontSize: 11 }} />
                <IconButton size="small" onClick={() => removeResource(i)} sx={{ color: 'grey.600' }}><Delete fontSize="small" /></IconButton>
              </Box>
            ))}
          </Paper>
        </Box>

        {/* Right: Output */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ borderBottom: '1px solid #222' }}>
              <Tabs value={outputTab} onChange={(_, v) => setOutputTab(v)} variant="scrollable" scrollButtons="auto" sx={{ minHeight: 40, '& .MuiTab-root': { minHeight: 40, color: 'grey.500', fontSize: 12, textTransform: 'none' } }}>
                {outputs.map((o, i) => <Tab key={i} label={o.label} />)}
              </Tabs>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1, gap: 1, borderBottom: '1px solid #222' }}>
              <Tooltip title="Copy"><IconButton size="small" onClick={() => handleCopy(outputs[outputTab]?.content || '')} sx={{ color: 'grey.500' }}><ContentCopy fontSize="small" /></IconButton></Tooltip>
              <Tooltip title="Download"><IconButton size="small" onClick={() => handleDownload(outputs[outputTab]?.label || 'file.yaml', outputs[outputTab]?.content || '')} sx={{ color: 'grey.500' }}><Download fontSize="small" /></IconButton></Tooltip>
            </Box>
            <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
              <Typography component="pre" sx={{ fontFamily: 'monospace', fontSize: 13, color: '#d4d4d4', whiteSpace: 'pre-wrap', m: 0 }}>
                {outputs[outputTab]?.content || ''}
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={2000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} />
    </Box>
  );
}
