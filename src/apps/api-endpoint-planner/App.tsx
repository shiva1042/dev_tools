import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Button, IconButton, Tooltip, Snackbar, Chip,
  Select, MenuItem, FormControl, InputLabel, Switch, FormControlLabel, Tabs, Tab,
} from '@mui/material';
import { Home, ContentCopy, Add, Delete } from '@mui/icons-material';

interface Field { name: string; type: string; required: boolean }
interface Endpoint {
  id: number;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  requestFields: Field[];
  responseFields: Field[];
  statusCodes: string;
  authRequired: boolean;
  rateLimited: boolean;
}
interface Resource { id: number; name: string; parentId: number | null; endpoints: Endpoint[] }

const METHOD_COLORS: Record<string, string> = {
  GET: '#2e7d32', POST: '#1565c0', PUT: '#e65100', PATCH: '#6a1b9a', DELETE: '#c62828',
};
const FIELD_TYPES = ['string', 'number', 'boolean', 'object', 'array', 'date', 'uuid', 'email'];
const tfSx = {
  '& .MuiInputBase-root': { bgcolor: '#0a0a0a', color: 'grey.300', fontFamily: 'monospace', fontSize: 13 },
  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
};

let nextId = 1;
let nextEpId = 100;

function makeCrudEndpoints(resourceName: string, basePath: string): Endpoint[] {
  const plural = resourceName.toLowerCase() + 's';
  const p = basePath ? `${basePath}/${plural}` : `/${plural}`;
  return [
    { id: nextEpId++, method: 'GET', path: p, description: `List all ${plural}`, requestFields: [], responseFields: [{ name: 'id', type: 'uuid', required: true }, { name: 'name', type: 'string', required: true }], statusCodes: '200, 401', authRequired: true, rateLimited: true },
    { id: nextEpId++, method: 'GET', path: `${p}/:id`, description: `Get a ${resourceName.toLowerCase()} by ID`, requestFields: [], responseFields: [{ name: 'id', type: 'uuid', required: true }, { name: 'name', type: 'string', required: true }], statusCodes: '200, 404', authRequired: true, rateLimited: false },
    { id: nextEpId++, method: 'POST', path: p, description: `Create a new ${resourceName.toLowerCase()}`, requestFields: [{ name: 'name', type: 'string', required: true }], responseFields: [{ name: 'id', type: 'uuid', required: true }], statusCodes: '201, 400, 401', authRequired: true, rateLimited: true },
    { id: nextEpId++, method: 'PUT', path: `${p}/:id`, description: `Update a ${resourceName.toLowerCase()}`, requestFields: [{ name: 'name', type: 'string', required: true }], responseFields: [{ name: 'id', type: 'uuid', required: true }], statusCodes: '200, 400, 404', authRequired: true, rateLimited: false },
    { id: nextEpId++, method: 'PATCH', path: `${p}/:id`, description: `Partially update a ${resourceName.toLowerCase()}`, requestFields: [{ name: 'name', type: 'string', required: false }], responseFields: [{ name: 'id', type: 'uuid', required: true }], statusCodes: '200, 400, 404', authRequired: true, rateLimited: false },
    { id: nextEpId++, method: 'DELETE', path: `${p}/:id`, description: `Delete a ${resourceName.toLowerCase()}`, requestFields: [], responseFields: [], statusCodes: '204, 404', authRequired: true, rateLimited: false },
  ];
}

export default function App() {
  const [resources, setResources] = useState<Resource[]>([
    { id: nextId++, name: 'User', parentId: null, endpoints: makeCrudEndpoints('User', '') },
  ]);
  const [newResName, setNewResName] = useState('');
  const [newResParent, setNewResParent] = useState<number | null>(null);
  const [selectedEp, setSelectedEp] = useState<number | null>(null);
  const [outputTab, setOutputTab] = useState(0);
  const [snackOpen, setSnackOpen] = useState(false);

  const allEndpoints = resources.flatMap(r => r.endpoints);
  const selectedEndpoint = allEndpoints.find(e => e.id === selectedEp);

  const addResource = () => {
    if (!newResName.trim()) return;
    let basePath = '';
    if (newResParent !== null) {
      const parent = resources.find(r => r.id === newResParent);
      if (parent) basePath = `/${parent.name.toLowerCase()}s/:${parent.name.toLowerCase()}Id`;
    }
    setResources([...resources, { id: nextId++, name: newResName.trim(), parentId: newResParent, endpoints: makeCrudEndpoints(newResName.trim(), basePath) }]);
    setNewResName('');
  };

  const updateEndpoint = (epId: number, updates: Partial<Endpoint>) => {
    setResources(resources.map(r => ({
      ...r,
      endpoints: r.endpoints.map(e => e.id === epId ? { ...e, ...updates } : e),
    })));
  };

  const addFieldTo = (epId: number, target: 'requestFields' | 'responseFields') => {
    const ep = allEndpoints.find(e => e.id === epId);
    if (!ep) return;
    updateEndpoint(epId, { [target]: [...ep[target], { name: '', type: 'string', required: false }] });
  };

  const removeField = (epId: number, target: 'requestFields' | 'responseFields', idx: number) => {
    const ep = allEndpoints.find(e => e.id === epId);
    if (!ep) return;
    updateEndpoint(epId, { [target]: ep[target].filter((_, i) => i !== idx) });
  };

  const updateField = (epId: number, target: 'requestFields' | 'responseFields', idx: number, updates: Partial<Field>) => {
    const ep = allEndpoints.find(e => e.id === epId);
    if (!ep) return;
    updateEndpoint(epId, { [target]: ep[target].map((f, i) => i === idx ? { ...f, ...updates } : f) });
  };

  const outputs = useMemo(() => {
    const eps = allEndpoints;

    const openapi = JSON.stringify({
      openapi: '3.0.0',
      paths: Object.fromEntries(
        eps.map(e => [e.path.replace(/:(\w+)/g, '{$1}'), {
          [e.method.toLowerCase()]: {
            summary: e.description,
            ...(e.requestFields.length > 0 ? {
              requestBody: { content: { 'application/json': { schema: { type: 'object', properties: Object.fromEntries(e.requestFields.map(f => [f.name, { type: f.type }])) } } } }
            } : {}),
            responses: Object.fromEntries(e.statusCodes.split(',').map(c => [c.trim(), { description: c.trim() }])),
          },
        }])
      ),
    }, null, 2);

    const expressRoutes = eps.map(e => {
      const m = e.method.toLowerCase();
      const middlewares: string[] = [];
      if (e.authRequired) middlewares.push('auth');
      if (e.rateLimited) middlewares.push('rateLimit');
      const mw = middlewares.length ? middlewares.join(', ') + ', ' : '';
      return `router.${m}('${e.path}', ${mw}async (req, res) => {\n  // ${e.description}\n  res.status(${e.statusCodes.split(',')[0].trim()}).json({});\n});`;
    }).join('\n\n');

    const fastapi = eps.map(e => {
      const m = e.method.toLowerCase();
      const params = e.path.match(/:(\w+)/g)?.map(p => `${p.slice(1)}: str`) || [];
      return `@app.${m === 'delete' ? 'delete' : m}("${e.path.replace(/:(\w+)/g, '{$1}')}")\nasync def ${e.description.toLowerCase().replace(/\s+/g, '_')}(${params.join(', ')}):\n    """${e.description}"""\n    pass`;
    }).join('\n\n');

    const markdown = `# API Documentation\n\n${resources.map(r => {
      return `## ${r.name}\n\n${r.endpoints.map(e => {
        return `### ${e.method} \`${e.path}\`\n\n${e.description}\n\n${e.authRequired ? '**Auth Required**\n\n' : ''}${e.requestFields.length ? `**Request Body:**\n| Field | Type | Required |\n|-------|------|----------|\n${e.requestFields.map(f => `| ${f.name} | ${f.type} | ${f.required ? 'Yes' : 'No'} |`).join('\n')}\n\n` : ''}**Status Codes:** ${e.statusCodes}\n`;
      }).join('\n')}`;
    }).join('\n')}`;

    const spring = eps.map(e => {
      const ann = { GET: 'GetMapping', POST: 'PostMapping', PUT: 'PutMapping', PATCH: 'PatchMapping', DELETE: 'DeleteMapping' }[e.method];
      return `@${ann}("${e.path.replace(/:(\w+)/g, '{$1}')}")\npublic ResponseEntity<?> ${e.description.toLowerCase().replace(/[^a-z0-9]/g, '_')}() {\n    // ${e.description}\n    return ResponseEntity.ok().build();\n}`;
    }).join('\n\n');

    return [
      { label: 'OpenAPI', code: openapi },
      { label: 'Express', code: expressRoutes },
      { label: 'FastAPI', code: fastapi },
      { label: 'Spring Boot', code: spring },
      { label: 'Markdown', code: markdown },
    ];
  }, [resources, allEndpoints]);

  const copy = (text: string) => { navigator.clipboard.writeText(text); setSnackOpen(true); };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a', p: 3 }}>
      <Paper elevation={0} sx={{ bgcolor: '#111', borderBottom: '1px solid #222', px: 3, py: 2, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Link to="/"><IconButton size="small" sx={{ color: 'grey.500' }}><Home /></IconButton></Link>
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>API Endpoint Planner</Typography>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', gap: 3 }}>
        <Box sx={{ flex: 1 }}>
          {/* Add Resource */}
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 2, borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1 }}>Add Resource</Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField size="small" placeholder="Resource name (e.g. Post)" value={newResName}
                onChange={e => setNewResName(e.target.value)} sx={{ ...tfSx, flex: 1 }} />
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel sx={{ color: 'grey.500' }}>Parent</InputLabel>
                <Select value={newResParent ?? ''} label="Parent" onChange={e => setNewResParent(String(e.target.value) === '' ? null : Number(e.target.value))}
                  sx={{ bgcolor: '#0a0a0a', color: 'grey.300', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' } }}>
                  <MenuItem value="">None (top-level)</MenuItem>
                  {resources.map(r => <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>)}
                </Select>
              </FormControl>
              <Button variant="contained" onClick={addResource} startIcon={<Add />}
                sx={{ bgcolor: '#1976d2', textTransform: 'none' }}>Add</Button>
            </Box>
          </Paper>

          {/* Endpoints List */}
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 2, borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1.5 }}>Endpoints</Typography>
            {resources.map(r => (
              <Box key={r.id} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography sx={{ color: 'grey.300', fontWeight: 600, fontSize: 14 }}>{r.name}</Typography>
                  <Chip label={`${r.endpoints.length} endpoints`} size="small" sx={{ bgcolor: '#222', color: 'grey.500', fontSize: 11 }} />
                  <IconButton size="small" onClick={() => setResources(resources.filter(x => x.id !== r.id))} sx={{ color: 'grey.600', ml: 'auto' }}><Delete fontSize="small" /></IconButton>
                </Box>
                {r.endpoints.map(ep => (
                  <Box key={ep.id} onClick={() => setSelectedEp(ep.id)} sx={{
                    display: 'flex', alignItems: 'center', gap: 1, p: 1, mb: 0.5, borderRadius: 1, cursor: 'pointer',
                    bgcolor: selectedEp === ep.id ? '#1a1a2e' : '#0a0a0a',
                    border: `1px solid ${selectedEp === ep.id ? '#1976d2' : '#222'}`,
                    '&:hover': { bgcolor: '#151515' },
                  }}>
                    <Chip label={ep.method} size="small" sx={{ bgcolor: METHOD_COLORS[ep.method], color: 'white', fontWeight: 700, fontSize: 11, minWidth: 60 }} />
                    <Typography sx={{ color: 'grey.300', fontFamily: 'monospace', fontSize: 13, flex: 1 }}>{ep.path}</Typography>
                    {ep.authRequired && <Chip label="Auth" size="small" sx={{ bgcolor: '#222', color: '#ffa726', fontSize: 10 }} />}
                    {ep.rateLimited && <Chip label="Rate" size="small" sx={{ bgcolor: '#222', color: '#ef5350', fontSize: 10 }} />}
                  </Box>
                ))}
              </Box>
            ))}
          </Paper>

          {/* Endpoint Detail Editor */}
          {selectedEndpoint && (
            <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1.5 }}>Edit Endpoint</Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                <FormControl size="small" sx={{ width: 110 }}>
                  <Select value={selectedEndpoint.method} onChange={e => updateEndpoint(selectedEndpoint.id, { method: e.target.value as Endpoint['method'] })}
                    sx={{ bgcolor: METHOD_COLORS[selectedEndpoint.method], color: 'white', fontWeight: 700, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' } }}>
                    {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                  </Select>
                </FormControl>
                <TextField size="small" fullWidth value={selectedEndpoint.path} onChange={e => updateEndpoint(selectedEndpoint.id, { path: e.target.value })} sx={tfSx} />
              </Box>
              <TextField size="small" fullWidth label="Description" value={selectedEndpoint.description}
                onChange={e => updateEndpoint(selectedEndpoint.id, { description: e.target.value })} sx={{ ...tfSx, mb: 1.5 }} />
              <TextField size="small" fullWidth label="Status Codes" value={selectedEndpoint.statusCodes}
                onChange={e => updateEndpoint(selectedEndpoint.id, { statusCodes: e.target.value })} sx={{ ...tfSx, mb: 1.5 }} />
              <Box sx={{ display: 'flex', gap: 2, mb: 1.5 }}>
                <FormControlLabel control={<Switch checked={selectedEndpoint.authRequired} onChange={e => updateEndpoint(selectedEndpoint.id, { authRequired: e.target.checked })} />}
                  label={<Typography sx={{ color: 'grey.400', fontSize: 13 }}>Auth Required</Typography>} />
                <FormControlLabel control={<Switch checked={selectedEndpoint.rateLimited} onChange={e => updateEndpoint(selectedEndpoint.id, { rateLimited: e.target.checked })} />}
                  label={<Typography sx={{ color: 'grey.400', fontSize: 13 }}>Rate Limited</Typography>} />
              </Box>

              {/* Request Fields */}
              <Typography sx={{ color: 'grey.500', fontSize: 12, mb: 0.5 }}>Request Body</Typography>
              {selectedEndpoint.requestFields.map((f, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
                  <TextField size="small" placeholder="name" value={f.name} onChange={e => updateField(selectedEndpoint.id, 'requestFields', i, { name: e.target.value })} sx={{ ...tfSx, flex: 1 }} />
                  <Select size="small" value={f.type} onChange={e => updateField(selectedEndpoint.id, 'requestFields', i, { type: e.target.value })}
                    sx={{ bgcolor: '#0a0a0a', color: 'grey.300', width: 110, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' } }}>
                    {FIELD_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                  </Select>
                  <FormControlLabel control={<Switch size="small" checked={f.required} onChange={e => updateField(selectedEndpoint.id, 'requestFields', i, { required: e.target.checked })} />}
                    label={<Typography sx={{ color: 'grey.500', fontSize: 11 }}>Req</Typography>} />
                  <IconButton size="small" onClick={() => removeField(selectedEndpoint.id, 'requestFields', i)} sx={{ color: 'grey.600' }}><Delete fontSize="small" /></IconButton>
                </Box>
              ))}
              <Button size="small" onClick={() => addFieldTo(selectedEndpoint.id, 'requestFields')} sx={{ color: 'grey.400', textTransform: 'none', mb: 1 }}>+ Add Field</Button>

              {/* Response Fields */}
              <Typography sx={{ color: 'grey.500', fontSize: 12, mb: 0.5 }}>Response Body</Typography>
              {selectedEndpoint.responseFields.map((f, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
                  <TextField size="small" placeholder="name" value={f.name} onChange={e => updateField(selectedEndpoint.id, 'responseFields', i, { name: e.target.value })} sx={{ ...tfSx, flex: 1 }} />
                  <Select size="small" value={f.type} onChange={e => updateField(selectedEndpoint.id, 'responseFields', i, { type: e.target.value })}
                    sx={{ bgcolor: '#0a0a0a', color: 'grey.300', width: 110, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' } }}>
                    {FIELD_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                  </Select>
                  <FormControlLabel control={<Switch size="small" checked={f.required} onChange={e => updateField(selectedEndpoint.id, 'responseFields', i, { required: e.target.checked })} />}
                    label={<Typography sx={{ color: 'grey.500', fontSize: 11 }}>Req</Typography>} />
                  <IconButton size="small" onClick={() => removeField(selectedEndpoint.id, 'responseFields', i)} sx={{ color: 'grey.600' }}><Delete fontSize="small" /></IconButton>
                </Box>
              ))}
              <Button size="small" onClick={() => addFieldTo(selectedEndpoint.id, 'responseFields')} sx={{ color: 'grey.400', textTransform: 'none' }}>+ Add Field</Button>
            </Paper>
          )}
        </Box>

        {/* Output */}
        <Paper sx={{ width: 480, bgcolor: '#111', border: '1px solid #222', p: 0, borderRadius: 2, alignSelf: 'flex-start' }}>
          <Tabs value={outputTab} onChange={(_, v) => setOutputTab(v)} variant="scrollable" scrollButtons="auto"
            sx={{ borderBottom: '1px solid #222', '& .MuiTab-root': { color: 'grey.500', textTransform: 'none', minHeight: 40, fontSize: 12 }, '& .Mui-selected': { color: '#42a5f5' } }}>
            {outputs.map((o, i) => <Tab key={i} label={o.label} />)}
          </Tabs>
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
              <Tooltip title="Copy"><IconButton size="small" onClick={() => copy(outputs[outputTab].code)} sx={{ color: 'grey.500' }}><ContentCopy fontSize="small" /></IconButton></Tooltip>
            </Box>
            <Box sx={{ bgcolor: '#0a0a0a', border: '1px solid #222', borderRadius: 1, p: 2, maxHeight: 600, overflow: 'auto' }}>
              <Typography component="pre" sx={{ color: '#98c379', fontFamily: 'monospace', fontSize: 11, whiteSpace: 'pre-wrap', m: 0 }}>
                {outputs[outputTab].code}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      <Snackbar open={snackOpen} autoHideDuration={2000} onClose={() => setSnackOpen(false)} message="Copied to clipboard" />
    </Box>
  );
}
