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
  Switch,
  FormControlLabel,
  Snackbar,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
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

interface FieldProperty {
  id: string;
  name: string;
  type: string;
  index?: boolean;
  analyzer?: string;
  searchAnalyzer?: string;
  format?: string;
  fields?: FieldProperty[];
  properties?: FieldProperty[];
}

interface IndexSettings {
  numberOfShards: number;
  numberOfReplicas: number;
  refreshInterval: string;
  maxResultWindow: number;
}

interface AnalyzerConfig {
  name: string;
  type: 'custom' | 'standard' | 'simple' | 'whitespace' | 'keyword';
  tokenizer?: string;
  filter?: string[];
}

const FIELD_TYPES = [
  'text', 'keyword', 'long', 'integer', 'short', 'byte', 'double', 'float',
  'boolean', 'date', 'object', 'nested', 'geo_point', 'geo_shape', 'ip',
  'completion', 'binary', 'dense_vector', 'sparse_vector',
];

const ANALYZERS = ['standard', 'simple', 'whitespace', 'keyword', 'english', 'custom'];
const TOKENIZERS = ['standard', 'letter', 'lowercase', 'whitespace', 'uax_url_email', 'classic', 'ngram', 'edge_ngram', 'pattern'];
const TOKEN_FILTERS = ['lowercase', 'uppercase', 'stop', 'stemmer', 'snowball', 'synonym', 'asciifolding', 'ngram', 'edge_ngram', 'trim'];

export default function ESMappingBuilder() {
  const [indexName, setIndexName] = useState('my_index');
  const [settings, setSettings] = useState<IndexSettings>({
    numberOfShards: 1,
    numberOfReplicas: 1,
    refreshInterval: '1s',
    maxResultWindow: 10000,
  });
  const [fields, setFields] = useState<FieldProperty[]>([
    { id: '1', name: 'id', type: 'keyword' },
    { id: '2', name: 'title', type: 'text', analyzer: 'standard', fields: [{ id: '2a', name: 'keyword', type: 'keyword' }] },
    { id: '3', name: 'description', type: 'text', analyzer: 'standard' },
    { id: '4', name: 'created_at', type: 'date', format: 'yyyy-MM-dd HH:mm:ss||epoch_millis' },
    { id: '5', name: 'status', type: 'keyword' },
  ]);
  const [analyzers, setAnalyzers] = useState<AnalyzerConfig[]>([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const buildFieldMapping = (field: FieldProperty): Record<string, unknown> => {
    const mapping: Record<string, unknown> = { type: field.type };

    if (field.index === false) mapping.index = false;
    if (field.analyzer) mapping.analyzer = field.analyzer;
    if (field.searchAnalyzer) mapping.search_analyzer = field.searchAnalyzer;
    if (field.format) mapping.format = field.format;

    if (field.fields && field.fields.length > 0) {
      mapping.fields = {};
      field.fields.forEach(f => {
        (mapping.fields as Record<string, unknown>)[f.name] = buildFieldMapping(f);
      });
    }

    if (field.properties && field.properties.length > 0 && (field.type === 'object' || field.type === 'nested')) {
      mapping.properties = {};
      field.properties.forEach(p => {
        (mapping.properties as Record<string, unknown>)[p.name] = buildFieldMapping(p);
      });
    }

    return mapping;
  };

  const generatedMapping = useMemo(() => {
    const properties: Record<string, unknown> = {};
    fields.forEach(field => {
      properties[field.name] = buildFieldMapping(field);
    });

    const mapping: Record<string, unknown> = {
      settings: {
        number_of_shards: settings.numberOfShards,
        number_of_replicas: settings.numberOfReplicas,
        refresh_interval: settings.refreshInterval,
        max_result_window: settings.maxResultWindow,
      },
      mappings: {
        properties,
      },
    };

    if (analyzers.length > 0) {
      const analysis: Record<string, unknown> = { analyzer: {} };
      analyzers.forEach(a => {
        if (a.type === 'custom') {
          (analysis.analyzer as Record<string, unknown>)[a.name] = {
            type: 'custom',
            tokenizer: a.tokenizer || 'standard',
            filter: a.filter || ['lowercase'],
          };
        } else {
          (analysis.analyzer as Record<string, unknown>)[a.name] = { type: a.type };
        }
      });
      (mapping.settings as Record<string, unknown>).analysis = analysis;
    }

    return JSON.stringify(mapping, null, 2);
  }, [fields, settings, analyzers]);

  const curlCommand = useMemo(() => {
    return `curl -X PUT "localhost:9200/${indexName}" -H "Content-Type: application/json" -d '
${generatedMapping}'`;
  }, [indexName, generatedMapping]);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setSnackbar({ open: true, message: 'Copied to clipboard' });
  };

  const handleDownload = () => {
    const blob = new Blob([generatedMapping], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${indexName}_mapping.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const addField = () => {
    setFields([...fields, { id: String(Date.now()), name: 'new_field', type: 'keyword' }]);
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const updateField = (id: string, updates: Partial<FieldProperty>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const addMultiField = (parentId: string) => {
    setFields(fields.map(f => f.id === parentId ? {
      ...f,
      fields: [...(f.fields || []), { id: String(Date.now()), name: 'keyword', type: 'keyword' }],
    } : f));
  };

  const removeMultiField = (parentId: string, fieldId: string) => {
    setFields(fields.map(f => f.id === parentId ? {
      ...f,
      fields: (f.fields || []).filter(mf => mf.id !== fieldId),
    } : f));
  };

  const updateMultiField = (parentId: string, fieldId: string, updates: Partial<FieldProperty>) => {
    setFields(fields.map(f => f.id === parentId ? {
      ...f,
      fields: (f.fields || []).map(mf => mf.id === fieldId ? { ...mf, ...updates } : mf),
    } : f));
  };

  const addNestedProperty = (parentId: string) => {
    setFields(fields.map(f => f.id === parentId ? {
      ...f,
      properties: [...(f.properties || []), { id: String(Date.now()), name: 'property', type: 'keyword' }],
    } : f));
  };

  const addAnalyzer = () => {
    setAnalyzers([...analyzers, { name: `custom_analyzer_${analyzers.length + 1}`, type: 'custom', tokenizer: 'standard', filter: ['lowercase'] }]);
  };

  const removeAnalyzer = (index: number) => {
    setAnalyzers(analyzers.filter((_, i) => i !== index));
  };

  const updateAnalyzer = (index: number, updates: Partial<AnalyzerConfig>) => {
    setAnalyzers(analyzers.map((a, i) => i === index ? { ...a, ...updates } : a));
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a' }}>
      <Paper elevation={0} sx={{ bgcolor: '#111', borderBottom: '1px solid #222', px: 3, py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Link to="/"><IconButton size="small" sx={{ color: 'grey.500' }}><Home /></IconButton></Link>
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>ES Index Mapping Builder</Typography>
            <Chip label="Elasticsearch" size="small" color="warning" />
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Download"><IconButton onClick={handleDownload} sx={{ color: 'grey.500' }}><Download /></IconButton></Tooltip>
            <Tooltip title="Copy JSON"><IconButton onClick={() => handleCopy(generatedMapping)} sx={{ color: 'grey.500' }}><ContentCopy /></IconButton></Tooltip>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', height: 'calc(100vh - 70px)' }}>
        {/* Builder Panel */}
        <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
          {/* Index Settings */}
          <Accordion defaultExpanded sx={{ bgcolor: '#111', border: '1px solid #222', mb: 2, '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<ExpandMore sx={{ color: 'grey.500' }} />}>
              <Typography sx={{ color: 'grey.300' }}>Index Settings</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField size="small" label="Index Name" value={indexName} onChange={(e) => setIndexName(e.target.value)} sx={{ flex: 1, '& .MuiInputBase-root': { color: 'grey.300' } }} />
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField size="small" label="Shards" type="number" value={settings.numberOfShards} onChange={(e) => setSettings({ ...settings, numberOfShards: parseInt(e.target.value) || 1 })} sx={{ width: 100, '& .MuiInputBase-root': { color: 'grey.300' } }} />
                <TextField size="small" label="Replicas" type="number" value={settings.numberOfReplicas} onChange={(e) => setSettings({ ...settings, numberOfReplicas: parseInt(e.target.value) || 0 })} sx={{ width: 100, '& .MuiInputBase-root': { color: 'grey.300' } }} />
                <TextField size="small" label="Refresh Interval" value={settings.refreshInterval} onChange={(e) => setSettings({ ...settings, refreshInterval: e.target.value })} sx={{ width: 130, '& .MuiInputBase-root': { color: 'grey.300' } }} />
                <TextField size="small" label="Max Result Window" type="number" value={settings.maxResultWindow} onChange={(e) => setSettings({ ...settings, maxResultWindow: parseInt(e.target.value) || 10000 })} sx={{ flex: 1, '& .MuiInputBase-root': { color: 'grey.300' } }} />
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Custom Analyzers */}
          <Accordion sx={{ bgcolor: '#111', border: '1px solid #222', mb: 2, '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<ExpandMore sx={{ color: 'grey.500' }} />}>
              <Typography sx={{ color: 'grey.300' }}>Custom Analyzers ({analyzers.length})</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {analyzers.map((analyzer, index) => (
                <Paper key={index} sx={{ bgcolor: '#0a0a0a', border: '1px solid #333', p: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <TextField size="small" label="Name" value={analyzer.name} onChange={(e) => updateAnalyzer(index, { name: e.target.value })} sx={{ flex: 1, '& .MuiInputBase-root': { color: 'grey.300' } }} />
                    <FormControl size="small" sx={{ width: 150 }}>
                      <InputLabel sx={{ color: 'grey.500' }}>Tokenizer</InputLabel>
                      <Select value={analyzer.tokenizer || 'standard'} label="Tokenizer" onChange={(e) => updateAnalyzer(index, { tokenizer: e.target.value })} sx={{ color: 'grey.300' }}>
                        {TOKENIZERS.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                      </Select>
                    </FormControl>
                    <IconButton size="small" onClick={() => removeAnalyzer(index)} sx={{ color: 'grey.500' }}><Delete /></IconButton>
                  </Box>
                  <Typography variant="caption" sx={{ color: 'grey.500' }}>Token Filters:</Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
                    {TOKEN_FILTERS.map(filter => (
                      <Chip
                        key={filter}
                        label={filter}
                        size="small"
                        color={analyzer.filter?.includes(filter) ? 'primary' : 'default'}
                        onClick={() => {
                          const currentFilters = analyzer.filter || [];
                          const newFilters = currentFilters.includes(filter)
                            ? currentFilters.filter(f => f !== filter)
                            : [...currentFilters, filter];
                          updateAnalyzer(index, { filter: newFilters });
                        }}
                        sx={{ cursor: 'pointer', fontSize: 10 }}
                      />
                    ))}
                  </Box>
                </Paper>
              ))}
              <Button startIcon={<Add />} onClick={addAnalyzer} sx={{ color: 'grey.500' }}>Add Analyzer</Button>
            </AccordionDetails>
          </Accordion>

          {/* Field Mappings */}
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ color: 'grey.300' }}>Field Mappings</Typography>
              <Button startIcon={<Add />} onClick={addField} size="small" sx={{ color: 'grey.400' }}>Add Field</Button>
            </Box>

            {fields.map(field => (
              <Paper key={field.id} sx={{ bgcolor: '#0a0a0a', border: '1px solid #333', p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                  <TextField size="small" label="Field Name" value={field.name} onChange={(e) => updateField(field.id, { name: e.target.value })} sx={{ flex: 1, '& .MuiInputBase-root': { color: 'grey.300' } }} />
                  <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel sx={{ color: 'grey.500' }}>Type</InputLabel>
                    <Select value={field.type} label="Type" onChange={(e) => updateField(field.id, { type: e.target.value })} sx={{ color: 'grey.300' }}>
                      {FIELD_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <IconButton size="small" onClick={() => removeField(field.id)} sx={{ color: 'grey.500' }}><Delete /></IconButton>
                </Box>

                {field.type === 'text' && (
                  <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                    <FormControl size="small" sx={{ minWidth: 140 }}>
                      <InputLabel sx={{ color: 'grey.500' }}>Analyzer</InputLabel>
                      <Select value={field.analyzer || ''} label="Analyzer" onChange={(e) => updateField(field.id, { analyzer: e.target.value })} sx={{ color: 'grey.300' }}>
                        <MenuItem value="">None</MenuItem>
                        {ANALYZERS.map(a => <MenuItem key={a} value={a}>{a}</MenuItem>)}
                        {analyzers.map(a => <MenuItem key={a.name} value={a.name}>{a.name} (custom)</MenuItem>)}
                      </Select>
                    </FormControl>
                    <FormControlLabel
                      control={<Switch checked={field.index !== false} onChange={(e) => updateField(field.id, { index: e.target.checked })} size="small" />}
                      label={<Typography sx={{ color: 'grey.400', fontSize: 12 }}>Indexed</Typography>}
                    />
                  </Box>
                )}

                {field.type === 'date' && (
                  <TextField size="small" label="Format" value={field.format || ''} onChange={(e) => updateField(field.id, { format: e.target.value })} placeholder="yyyy-MM-dd||epoch_millis" fullWidth sx={{ mt: 1, '& .MuiInputBase-root': { color: 'grey.300', fontSize: 12 } }} />
                )}

                {/* Multi-fields */}
                {field.type === 'text' && (
                  <Box sx={{ mt: 2, pl: 2, borderLeft: '2px solid #333' }}>
                    <Typography variant="caption" sx={{ color: 'grey.500' }}>Multi-fields (sub-fields)</Typography>
                    {(field.fields || []).map(mf => (
                      <Box key={mf.id} sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <TextField size="small" label="Name" value={mf.name} onChange={(e) => updateMultiField(field.id, mf.id, { name: e.target.value })} sx={{ width: 120, '& .MuiInputBase-root': { color: 'grey.300', fontSize: 12 } }} />
                        <FormControl size="small" sx={{ width: 120 }}>
                          <InputLabel sx={{ color: 'grey.500', fontSize: 12 }}>Type</InputLabel>
                          <Select value={mf.type} label="Type" onChange={(e) => updateMultiField(field.id, mf.id, { type: e.target.value })} sx={{ color: 'grey.300', fontSize: 12 }}>
                            {FIELD_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                          </Select>
                        </FormControl>
                        <IconButton size="small" onClick={() => removeMultiField(field.id, mf.id)} sx={{ color: 'grey.500' }}><Delete fontSize="small" /></IconButton>
                      </Box>
                    ))}
                    <Button size="small" onClick={() => addMultiField(field.id)} sx={{ color: 'grey.500', fontSize: 11, mt: 1 }}>+ Add Multi-field</Button>
                  </Box>
                )}

                {/* Nested/Object properties */}
                {(field.type === 'object' || field.type === 'nested') && (
                  <Box sx={{ mt: 2, pl: 2, borderLeft: '2px solid #333' }}>
                    <Typography variant="caption" sx={{ color: 'grey.500' }}>Properties</Typography>
                    {(field.properties || []).map(prop => (
                      <Box key={prop.id} sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <TextField size="small" label="Name" value={prop.name} onChange={(e) => {
                          setFields(fields.map(f => f.id === field.id ? {
                            ...f,
                            properties: (f.properties || []).map(p => p.id === prop.id ? { ...p, name: e.target.value } : p),
                          } : f));
                        }} sx={{ flex: 1, '& .MuiInputBase-root': { color: 'grey.300', fontSize: 12 } }} />
                        <FormControl size="small" sx={{ width: 120 }}>
                          <InputLabel sx={{ color: 'grey.500', fontSize: 12 }}>Type</InputLabel>
                          <Select value={prop.type} label="Type" onChange={(e) => {
                            setFields(fields.map(f => f.id === field.id ? {
                              ...f,
                              properties: (f.properties || []).map(p => p.id === prop.id ? { ...p, type: e.target.value } : p),
                            } : f));
                          }} sx={{ color: 'grey.300', fontSize: 12 }}>
                            {FIELD_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                          </Select>
                        </FormControl>
                      </Box>
                    ))}
                    <Button size="small" onClick={() => addNestedProperty(field.id)} sx={{ color: 'grey.500', fontSize: 11, mt: 1 }}>+ Add Property</Button>
                  </Box>
                )}
              </Paper>
            ))}
          </Paper>
        </Box>

        {/* Output Panel */}
        <Box sx={{ width: 500, borderLeft: '1px solid #222', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 2, borderBottom: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" sx={{ color: 'grey.400' }}>Index Mapping JSON</Typography>
            <Tooltip title="Copy cURL command">
              <Button size="small" onClick={() => handleCopy(curlCommand)} sx={{ color: 'grey.500', fontSize: 11 }}>Copy cURL</Button>
            </Tooltip>
          </Box>
          <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
            <Paper sx={{ bgcolor: '#0a0a0a', p: 2, border: '1px solid #333', height: '100%' }}>
              <Typography component="pre" sx={{ fontFamily: 'monospace', fontSize: 11, color: '#d4d4d4', m: 0, whiteSpace: 'pre-wrap' }}>
                {generatedMapping}
              </Typography>
            </Paper>
          </Box>
        </Box>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={2000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} />
    </Box>
  );
}
