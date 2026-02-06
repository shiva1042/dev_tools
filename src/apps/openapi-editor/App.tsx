import { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Snackbar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
} from '@mui/material';
import {
  ContentCopy,
  Home,
  Add,
  Delete,
  ExpandMore,
  Download,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';
type ParamIn = 'query' | 'path' | 'header';
type DataType = 'string' | 'integer' | 'number' | 'boolean' | 'array' | 'object';

interface Parameter {
  id: string;
  name: string;
  in: ParamIn;
  required: boolean;
  type: DataType;
  description: string;
}

interface Response {
  code: string;
  description: string;
  schema?: string;
}

interface Endpoint {
  id: string;
  path: string;
  method: HttpMethod;
  summary: string;
  description: string;
  tags: string[];
  parameters: Parameter[];
  requestBody?: string;
  responses: Response[];
}

interface Schema {
  id: string;
  name: string;
  type: 'object' | 'array';
  properties: { name: string; type: DataType; required: boolean; description: string }[];
}

const methodColors: Record<HttpMethod, string> = {
  get: '#10b981',
  post: '#3b82f6',
  put: '#f59e0b',
  patch: '#8b5cf6',
  delete: '#ef4444',
};

export default function OpenApiEditor() {
  const [title, setTitle] = useState('My API');
  const [version, setVersion] = useState('1.0.0');
  const [description, setDescription] = useState('API description');
  const [baseUrl, setBaseUrl] = useState('https://api.example.com/v1');
  const [endpoints, setEndpoints] = useState<Endpoint[]>([
    {
      id: '1',
      path: '/users',
      method: 'get',
      summary: 'Get all users',
      description: 'Returns a list of users',
      tags: ['Users'],
      parameters: [
        { id: '1', name: 'limit', in: 'query', required: false, type: 'integer', description: 'Number of results' },
      ],
      responses: [
        { code: '200', description: 'Successful response', schema: 'UserList' },
      ],
    },
    {
      id: '2',
      path: '/users/{id}',
      method: 'get',
      summary: 'Get user by ID',
      description: 'Returns a single user',
      tags: ['Users'],
      parameters: [
        { id: '1', name: 'id', in: 'path', required: true, type: 'string', description: 'User ID' },
      ],
      responses: [
        { code: '200', description: 'Successful response', schema: 'User' },
        { code: '404', description: 'User not found' },
      ],
    },
    {
      id: '3',
      path: '/users',
      method: 'post',
      summary: 'Create user',
      description: 'Creates a new user',
      tags: ['Users'],
      parameters: [],
      requestBody: 'CreateUserRequest',
      responses: [
        { code: '201', description: 'User created', schema: 'User' },
        { code: '400', description: 'Invalid input' },
      ],
    },
  ]);
  const [schemas, setSchemas] = useState<Schema[]>([
    {
      id: '1',
      name: 'User',
      type: 'object',
      properties: [
        { name: 'id', type: 'string', required: true, description: 'User ID' },
        { name: 'email', type: 'string', required: true, description: 'User email' },
        { name: 'name', type: 'string', required: true, description: 'User name' },
        { name: 'createdAt', type: 'string', required: false, description: 'Creation timestamp' },
      ],
    },
  ]);
  const [tab, setTab] = useState<'endpoints' | 'schemas'>('endpoints');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({ open: false, message: '' });

  const openApiSpec = useMemo(() => {
    const spec: any = {
      openapi: '3.0.3',
      info: {
        title,
        version,
        description,
      },
      servers: [{ url: baseUrl }],
      paths: {},
      components: {
        schemas: {},
      },
    };

    // Build paths
    endpoints.forEach(ep => {
      if (!spec.paths[ep.path]) {
        spec.paths[ep.path] = {};
      }

      const operation: any = {
        summary: ep.summary,
        description: ep.description,
        tags: ep.tags,
        responses: {},
      };

      if (ep.parameters.length > 0) {
        operation.parameters = ep.parameters.map(p => ({
          name: p.name,
          in: p.in,
          required: p.required,
          schema: { type: p.type },
          description: p.description,
        }));
      }

      if (ep.requestBody) {
        operation.requestBody = {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: `#/components/schemas/${ep.requestBody}` },
            },
          },
        };
      }

      ep.responses.forEach(r => {
        operation.responses[r.code] = {
          description: r.description,
          ...(r.schema && {
            content: {
              'application/json': {
                schema: { $ref: `#/components/schemas/${r.schema}` },
              },
            },
          }),
        };
      });

      spec.paths[ep.path][ep.method] = operation;
    });

    // Build schemas
    schemas.forEach(s => {
      const properties: any = {};
      const required: string[] = [];

      s.properties.forEach(p => {
        properties[p.name] = {
          type: p.type,
          description: p.description,
        };
        if (p.required) required.push(p.name);
      });

      spec.components.schemas[s.name] = {
        type: s.type,
        properties,
        ...(required.length > 0 && { required }),
      };
    });

    return JSON.stringify(spec, null, 2);
  }, [title, version, description, baseUrl, endpoints, schemas]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(openApiSpec);
    setSnackbar({ open: true, message: 'Copied to clipboard' });
  };

  const handleDownload = () => {
    const blob = new Blob([openApiSpec], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'openapi.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const addEndpoint = () => {
    setEndpoints([...endpoints, {
      id: String(Date.now()),
      path: '/new-endpoint',
      method: 'get',
      summary: 'New endpoint',
      description: '',
      tags: [],
      parameters: [],
      responses: [{ code: '200', description: 'Success' }],
    }]);
  };

  const removeEndpoint = (id: string) => setEndpoints(endpoints.filter(e => e.id !== id));

  const updateEndpoint = (id: string, field: keyof Endpoint, value: unknown) => {
    setEndpoints(endpoints.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const addSchema = () => {
    setSchemas([...schemas, {
      id: String(Date.now()),
      name: 'NewSchema',
      type: 'object',
      properties: [{ name: 'id', type: 'string', required: true, description: '' }],
    }]);
  };

  const removeSchema = (id: string) => setSchemas(schemas.filter(s => s.id !== id));

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a' }}>
      <Paper elevation={0} sx={{ bgcolor: '#111', borderBottom: '1px solid #222', px: 3, py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Link to="/"><IconButton size="small" sx={{ color: 'grey.500' }}><Home /></IconButton></Link>
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>OpenAPI Editor</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Download"><IconButton onClick={handleDownload} sx={{ color: 'grey.500' }}><Download /></IconButton></Tooltip>
            <Tooltip title="Copy"><IconButton onClick={handleCopy} sx={{ color: 'grey.500' }}><ContentCopy /></IconButton></Tooltip>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', height: 'calc(100vh - 70px)' }}>
        {/* Builder Panel */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* API Info */}
          <Paper sx={{ bgcolor: '#111', borderBottom: '1px solid #222', p: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField size="small" label="Title" value={title} onChange={(e) => setTitle(e.target.value)} sx={{ flex: 1, '& .MuiInputBase-root': { color: 'grey.300' } }} />
              <TextField size="small" label="Version" value={version} onChange={(e) => setVersion(e.target.value)} sx={{ width: 100, '& .MuiInputBase-root': { color: 'grey.300' } }} />
              <TextField size="small" label="Base URL" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} sx={{ flex: 1, '& .MuiInputBase-root': { color: 'grey.300' } }} />
            </Box>
          </Paper>

          {/* Tabs */}
          <Paper sx={{ bgcolor: '#0d0d0d', borderBottom: '1px solid #222' }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ '& .MuiTab-root': { color: 'grey.500' } }}>
              <Tab label={`Endpoints (${endpoints.length})`} value="endpoints" />
              <Tab label={`Schemas (${schemas.length})`} value="schemas" />
            </Tabs>
          </Paper>

          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            {tab === 'endpoints' && (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                  <Button startIcon={<Add />} onClick={addEndpoint} sx={{ color: 'grey.400' }}>Add Endpoint</Button>
                </Box>

                {endpoints.map(ep => (
                  <Accordion key={ep.id} sx={{ bgcolor: '#111', border: '1px solid #222', mb: 1, '&:before': { display: 'none' } }}>
                    <AccordionSummary expandIcon={<ExpandMore sx={{ color: 'grey.500' }} />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                        <Chip label={ep.method.toUpperCase()} size="small" sx={{ bgcolor: `${methodColors[ep.method]}20`, color: methodColors[ep.method], fontWeight: 600, width: 70 }} />
                        <Typography sx={{ color: 'grey.300', fontFamily: 'monospace' }}>{ep.path}</Typography>
                        <Typography sx={{ color: 'grey.500', fontSize: 13 }}>{ep.summary}</Typography>
                        <Box sx={{ flex: 1 }} />
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); removeEndpoint(ep.id); }} sx={{ color: 'grey.500' }}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <FormControl size="small" sx={{ width: 120 }}>
                          <InputLabel sx={{ color: 'grey.500' }}>Method</InputLabel>
                          <Select value={ep.method} label="Method" onChange={(e) => updateEndpoint(ep.id, 'method', e.target.value)} sx={{ color: methodColors[ep.method] }}>
                            {(['get', 'post', 'put', 'patch', 'delete'] as HttpMethod[]).map(m => (
                              <MenuItem key={m} value={m} sx={{ color: methodColors[m] }}>{m.toUpperCase()}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <TextField size="small" label="Path" value={ep.path} onChange={(e) => updateEndpoint(ep.id, 'path', e.target.value)} sx={{ flex: 1, '& .MuiInputBase-root': { color: 'grey.300', fontFamily: 'monospace' } }} />
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <TextField size="small" label="Summary" value={ep.summary} onChange={(e) => updateEndpoint(ep.id, 'summary', e.target.value)} sx={{ flex: 1, '& .MuiInputBase-root': { color: 'grey.300' } }} />
                        <TextField size="small" label="Tags (comma-separated)" value={ep.tags.join(', ')} onChange={(e) => updateEndpoint(ep.id, 'tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))} sx={{ flex: 1, '& .MuiInputBase-root': { color: 'grey.300' } }} />
                      </Box>

                      <Typography variant="caption" sx={{ color: 'grey.500', display: 'block', mb: 1 }}>Parameters</Typography>
                      {ep.parameters.map((param, i) => (
                        <Box key={param.id} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                          <TextField size="small" label="Name" value={param.name} onChange={(e) => {
                            const newParams = [...ep.parameters];
                            newParams[i] = { ...param, name: e.target.value };
                            updateEndpoint(ep.id, 'parameters', newParams);
                          }} sx={{ width: 120, '& .MuiInputBase-root': { color: 'grey.300' } }} />
                          <FormControl size="small" sx={{ width: 100 }}>
                            <Select value={param.in} onChange={(e) => {
                              const newParams = [...ep.parameters];
                              newParams[i] = { ...param, in: e.target.value as ParamIn };
                              updateEndpoint(ep.id, 'parameters', newParams);
                            }} sx={{ color: 'grey.300' }}>
                              <MenuItem value="query">query</MenuItem>
                              <MenuItem value="path">path</MenuItem>
                              <MenuItem value="header">header</MenuItem>
                            </Select>
                          </FormControl>
                          <FormControl size="small" sx={{ width: 100 }}>
                            <Select value={param.type} onChange={(e) => {
                              const newParams = [...ep.parameters];
                              newParams[i] = { ...param, type: e.target.value as DataType };
                              updateEndpoint(ep.id, 'parameters', newParams);
                            }} sx={{ color: 'grey.300' }}>
                              {['string', 'integer', 'number', 'boolean'].map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                            </Select>
                          </FormControl>
                          <IconButton size="small" onClick={() => updateEndpoint(ep.id, 'parameters', ep.parameters.filter((_, idx) => idx !== i))} sx={{ color: 'grey.500' }}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                      <Button size="small" onClick={() => updateEndpoint(ep.id, 'parameters', [...ep.parameters, { id: String(Date.now()), name: 'param', in: 'query' as ParamIn, required: false, type: 'string' as DataType, description: '' }])} sx={{ color: 'grey.500' }}>+ Add Parameter</Button>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </>
            )}

            {tab === 'schemas' && (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                  <Button startIcon={<Add />} onClick={addSchema} sx={{ color: 'grey.400' }}>Add Schema</Button>
                </Box>

                {schemas.map(schema => (
                  <Accordion key={schema.id} sx={{ bgcolor: '#111', border: '1px solid #222', mb: 1, '&:before': { display: 'none' } }}>
                    <AccordionSummary expandIcon={<ExpandMore sx={{ color: 'grey.500' }} />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                        <Chip label={schema.type} size="small" sx={{ bgcolor: '#222' }} />
                        <Typography sx={{ color: 'grey.300' }}>{schema.name}</Typography>
                        <Typography sx={{ color: 'grey.500', fontSize: 13 }}>{schema.properties.length} properties</Typography>
                        <Box sx={{ flex: 1 }} />
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); removeSchema(schema.id); }} sx={{ color: 'grey.500' }}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <TextField size="small" label="Schema Name" value={schema.name} onChange={(e) => setSchemas(schemas.map(s => s.id === schema.id ? { ...s, name: e.target.value } : s))} sx={{ mb: 2, '& .MuiInputBase-root': { color: 'grey.300' } }} />

                      <Typography variant="caption" sx={{ color: 'grey.500', display: 'block', mb: 1 }}>Properties</Typography>
                      {schema.properties.map((prop, i) => (
                        <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                          <TextField size="small" label="Name" value={prop.name} onChange={(e) => {
                            const newProps = [...schema.properties];
                            newProps[i] = { ...prop, name: e.target.value };
                            setSchemas(schemas.map(s => s.id === schema.id ? { ...s, properties: newProps } : s));
                          }} sx={{ flex: 1, '& .MuiInputBase-root': { color: 'grey.300' } }} />
                          <FormControl size="small" sx={{ width: 100 }}>
                            <Select value={prop.type} onChange={(e) => {
                              const newProps = [...schema.properties];
                              newProps[i] = { ...prop, type: e.target.value as DataType };
                              setSchemas(schemas.map(s => s.id === schema.id ? { ...s, properties: newProps } : s));
                            }} sx={{ color: 'grey.300' }}>
                              {['string', 'integer', 'number', 'boolean', 'array', 'object'].map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                            </Select>
                          </FormControl>
                          <IconButton size="small" onClick={() => setSchemas(schemas.map(s => s.id === schema.id ? { ...s, properties: s.properties.filter((_, idx) => idx !== i) } : s))} sx={{ color: 'grey.500' }}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                      <Button size="small" onClick={() => setSchemas(schemas.map(s => s.id === schema.id ? { ...s, properties: [...s.properties, { name: 'newProp', type: 'string' as DataType, required: false, description: '' }] } : s))} sx={{ color: 'grey.500' }}>+ Add Property</Button>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </>
            )}
          </Box>
        </Box>

        {/* Spec Output */}
        <Box sx={{ width: 500, borderLeft: '1px solid #222', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 2, borderBottom: '1px solid #222' }}>
            <Typography variant="subtitle2" sx={{ color: 'grey.400' }}>openapi.json</Typography>
          </Box>
          <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
            <Paper sx={{ bgcolor: '#0a0a0a', p: 2, border: '1px solid #333', height: '100%' }}>
              <Typography component="pre" sx={{ fontFamily: 'monospace', fontSize: 11, color: '#d4d4d4', m: 0, whiteSpace: 'pre-wrap' }}>
                {openApiSpec}
              </Typography>
            </Paper>
          </Box>
        </Box>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={2000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} />
    </Box>
  );
}
