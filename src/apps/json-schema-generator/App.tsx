import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Tooltip,
  Snackbar,
  FormControlLabel,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Home,
  ContentCopy,
  Clear,
  Download,
  Schema,
} from '@mui/icons-material';

type Draft = 'draft-07' | '2019-09' | '2020-12';

const SCHEMA_URI: Record<Draft, string> = {
  'draft-07': 'http://json-schema.org/draft-07/schema#',
  '2019-09': 'https://json-schema.org/draft/2019-09/schema',
  '2020-12': 'https://json-schema.org/draft/2020-12/schema',
};

interface GenOpts {
  required: boolean;
  additionalProperties: boolean;
  draft: Draft;
  title: string;
  description: string;
}

function detectStringFormat(value: string): string | null {
  if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) return 'email';
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) return 'date-time';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'date';
  if (/^https?:\/\//.test(value)) return 'uri';
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) return 'uuid';
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(value)) return 'ipv4';
  if (/^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/.test(value)) return 'ipv6';
  return null;
}

function generateSchema(value: unknown, opts: GenOpts, isRoot: boolean): Record<string, unknown> {
  const schema: Record<string, unknown> = {};

  if (isRoot) {
    schema.$schema = SCHEMA_URI[opts.draft];
    if (opts.title) schema.title = opts.title;
    if (opts.description) schema.description = opts.description;
  }

  if (value === null) {
    schema.type = 'null';
    return schema;
  }

  if (typeof value === 'string') {
    schema.type = 'string';
    const format = detectStringFormat(value);
    if (format) schema.format = format;
    return schema;
  }

  if (typeof value === 'number') {
    schema.type = Number.isInteger(value) ? 'integer' : 'number';
    return schema;
  }

  if (typeof value === 'boolean') {
    schema.type = 'boolean';
    return schema;
  }

  if (Array.isArray(value)) {
    schema.type = 'array';
    if (value.length === 0) {
      schema.items = {};
    } else {
      // Check if all same type
      const types = new Set(value.map(v => {
        if (v === null) return 'null';
        if (Array.isArray(v)) return 'array';
        return typeof v;
      }));

      if (types.size === 1) {
        const itemsKey = opts.draft === '2020-12' ? 'items' : 'items';
        schema[itemsKey] = generateSchema(value[0], opts, false);
        // For objects, merge all properties
        if (typeof value[0] === 'object' && value[0] !== null && !Array.isArray(value[0])) {
          const merged: Record<string, unknown> = {};
          for (const item of value) {
            if (item && typeof item === 'object') {
              Object.entries(item as Record<string, unknown>).forEach(([k, v]) => {
                if (!(k in merged)) merged[k] = v;
              });
            }
          }
          schema[itemsKey] = generateSchema(merged, opts, false);
        }
      } else {
        // Mixed types: use oneOf or anyOf
        const seen = new Set<string>();
        const variants: Record<string, unknown>[] = [];
        for (const item of value) {
          const itemSchema = generateSchema(item, opts, false);
          const key = JSON.stringify(itemSchema);
          if (!seen.has(key)) {
            seen.add(key);
            variants.push(itemSchema);
          }
        }
        if (opts.draft === 'draft-07') {
          schema.items = { anyOf: variants };
        } else {
          schema.items = { anyOf: variants };
        }
      }
    }
    return schema;
  }

  if (typeof value === 'object') {
    schema.type = 'object';
    const properties: Record<string, unknown> = {};
    const keys = Object.keys(value as Record<string, unknown>);

    for (const key of keys) {
      properties[key] = generateSchema((value as Record<string, unknown>)[key], opts, false);
    }

    schema.properties = properties;

    if (opts.required && keys.length > 0) {
      schema.required = keys;
    }

    if (!opts.additionalProperties) {
      schema.additionalProperties = false;
    }

    return schema;
  }

  return schema;
}

function jsonToSchema(jsonStr: string, opts: GenOpts): { output: string; error: string } {
  try {
    const parsed = JSON.parse(jsonStr);
    const schema = generateSchema(parsed, opts, true);
    return { output: JSON.stringify(schema, null, 2), error: '' };
  } catch (e) {
    return { output: '', error: e instanceof Error ? e.message : 'Invalid JSON' };
  }
}

const SAMPLE_JSON = `{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Widget",
  "email": "widget@example.com",
  "website": "https://example.com",
  "price": 29.99,
  "quantity": 100,
  "active": true,
  "created_at": "2024-01-15T10:30:00Z",
  "release_date": "2024-01-15",
  "tags": ["electronics", "sale"],
  "dimensions": {
    "width": 10,
    "height": 20,
    "unit": "cm"
  },
  "variants": [
    { "color": "red", "size": "M", "stock": 50 },
    { "color": "blue", "size": "L", "stock": 30 }
  ],
  "metadata": null
}`;

export default function JsonSchemaGenerator() {
  const [input, setInput] = useState('');
  const [required, setRequired] = useState(true);
  const [additionalProperties, setAdditionalProperties] = useState(false);
  const [draft, setDraft] = useState<Draft>('draft-07');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [snackOpen, setSnackOpen] = useState(false);

  const opts: GenOpts = useMemo(() => ({ required, additionalProperties, draft, title, description }), [required, additionalProperties, draft, title, description]);
  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: '', error: '' };
    return jsonToSchema(input, opts);
  }, [input, opts]);

  const copy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setSnackOpen(true);
  };

  const download = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'schema'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sw = { '& .MuiSwitch-switchBase.Mui-checked': { color: '#8b5cf6' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#8b5cf6' } };
  const tfSx = { '& .MuiInputBase-root': { bgcolor: '#0d0d0d', color: 'grey.300', fontSize: 13 }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' }, '& .MuiInputLabel-root': { color: 'grey.500' } };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a', color: 'grey.300', p: 3 }}>
      <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <Link to="/"><IconButton size="small" sx={{ color: 'grey.500' }}><Home /></IconButton></Link>
          <Schema sx={{ color: '#8b5cf6' }} />
          <Typography variant="h5" fontWeight={700}>JSON Schema Generator</Typography>
        </Box>

        <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel sx={{ color: 'grey.500' }}>Draft</InputLabel>
            <Select value={draft} label="Draft" onChange={e => setDraft(e.target.value as Draft)}
              sx={{ bgcolor: '#0d0d0d', color: 'grey.300', fontSize: 13, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' }, '& .MuiSvgIcon-root': { color: 'grey.500' } }}>
              <MenuItem value="draft-07">Draft-07</MenuItem>
              <MenuItem value="2019-09">2019-09</MenuItem>
              <MenuItem value="2020-12">2020-12</MenuItem>
            </Select>
          </FormControl>
          <TextField size="small" value={title} onChange={e => setTitle(e.target.value)} label="Title" sx={{ width: 160, ...tfSx }} />
          <TextField size="small" value={description} onChange={e => setDescription(e.target.value)} label="Description" sx={{ width: 220, ...tfSx }} />
          <FormControlLabel control={<Switch checked={required} onChange={e => setRequired(e.target.checked)} size="small" sx={sw} />} label={<Typography variant="body2" color="grey.400">required</Typography>} />
          <FormControlLabel control={<Switch checked={additionalProperties} onChange={e => setAdditionalProperties(e.target.checked)} size="small" sx={sw} />} label={<Typography variant="body2" color="grey.400">additionalProperties</Typography>} />
          <Box sx={{ flex: 1 }} />
          <Button size="small" variant="outlined" sx={{ borderColor: '#333', color: 'grey.400', textTransform: 'none' }} onClick={() => setInput(SAMPLE_JSON)}>Sample</Button>
          <Tooltip title="Clear"><IconButton size="small" sx={{ color: 'grey.500' }} onClick={() => setInput('')}><Clear /></IconButton></Tooltip>
        </Paper>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
            <Typography variant="subtitle2" color="grey.400" mb={1}>JSON Input</Typography>
            <TextField
              multiline rows={24} fullWidth value={input} onChange={e => setInput(e.target.value)}
              placeholder="Paste sample JSON here..."
              error={!!error}
              helperText={error}
              sx={{ '& .MuiInputBase-root': { bgcolor: '#0d0d0d', fontFamily: 'monospace', fontSize: 13, color: 'grey.300' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: error ? '#ef4444' : '#222' } }}
            />
          </Paper>

          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" color="grey.400">JSON Schema Output</Typography>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Tooltip title="Download"><IconButton size="small" sx={{ color: 'grey.500' }} onClick={download}><Download /></IconButton></Tooltip>
                <Tooltip title="Copy"><IconButton size="small" sx={{ color: 'grey.500' }} onClick={copy}><ContentCopy /></IconButton></Tooltip>
              </Box>
            </Box>
            <Box sx={{ bgcolor: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 1, p: 2, fontFamily: 'monospace', fontSize: 12, color: '#a5f3fc', whiteSpace: 'pre-wrap', minHeight: 550, maxHeight: 700, overflow: 'auto' }}>
              {output || <Typography color="grey.600" fontSize={13}>JSON Schema will appear here</Typography>}
            </Box>
          </Paper>
        </Box>
      </Box>
      <Snackbar open={snackOpen} autoHideDuration={2000} onClose={() => setSnackOpen(false)} message="Copied to clipboard" />
    </Box>
  );
}
