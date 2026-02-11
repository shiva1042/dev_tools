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
  Chip,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Home,
  ContentCopy,
  Clear,
  Code,
} from '@mui/icons-material';

interface GenOptions {
  useType: boolean;
  optional: boolean;
  readonly: boolean;
  exportTypes: boolean;
  rootName: string;
  camelCase: boolean;
  nullableMode: 'nullable' | 'optional';
}

function toCamelCase(str: string): string {
  return str.replace(/[-_]([a-z])/g, (_, c) => c.toUpperCase());
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function inferType(value: unknown, key: string, interfaces: Map<string, string>, opts: GenOptions): string {
  if (value === null) {
    return opts.nullableMode === 'nullable' ? 'null' : 'unknown';
  }
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return 'string';
  if (typeof value === 'number') return Number.isInteger(value) ? 'number' : 'number';
  if (typeof value === 'boolean') return 'boolean';

  if (Array.isArray(value)) {
    if (value.length === 0) return 'unknown[]';
    const types = new Set<string>();
    let hasObj = false;
    for (const item of value) {
      if (item !== null && typeof item === 'object' && !Array.isArray(item)) {
        hasObj = true;
      } else {
        types.add(inferType(item, key, interfaces, opts));
      }
    }
    if (hasObj) {
      const merged = mergeObjects(value.filter(v => v && typeof v === 'object' && !Array.isArray(v)));
      const iName = capitalize(opts.camelCase ? toCamelCase(key) : key) + 'Item';
      generateInterface(merged, iName, interfaces, opts);
      types.add(iName);
    }
    const typeArr = Array.from(types);
    if (typeArr.length === 1) return `${typeArr[0]}[]`;
    return `(${typeArr.join(' | ')})[]`;
  }

  if (typeof value === 'object') {
    const iName = capitalize(opts.camelCase ? toCamelCase(key) : key);
    generateInterface(value as Record<string, unknown>, iName, interfaces, opts);
    return iName;
  }

  return 'unknown';
}

function mergeObjects(objects: Record<string, unknown>[]): Record<string, unknown> {
  const merged: Record<string, unknown> = {};
  for (const obj of objects) {
    for (const [k, v] of Object.entries(obj)) {
      if (!(k in merged)) merged[k] = v;
    }
  }
  return merged;
}

function generateInterface(obj: Record<string, unknown>, name: string, interfaces: Map<string, string>, opts: GenOptions): void {
  const keyword = opts.useType ? 'type' : 'interface';
  const exp = opts.exportTypes ? 'export ' : '';
  const ro = opts.readonly ? 'readonly ' : '';
  const sep = opts.useType ? ';' : ';';
  const assign = opts.useType ? ' = {' : ' {';

  const lines: string[] = [];
  lines.push(`${exp}${keyword} ${name}${assign}`);

  for (const [rawKey, value] of Object.entries(obj)) {
    const key = opts.camelCase ? toCamelCase(rawKey) : rawKey;
    const needsQuotes = /[^a-zA-Z0-9_$]/.test(key);
    const displayKey = needsQuotes ? `'${key}'` : key;
    let type = inferType(value, rawKey, interfaces, opts);

    if (value === null && opts.nullableMode === 'nullable') {
      type = 'unknown | null';
    }

    const optMark = opts.optional || (value === null && opts.nullableMode === 'optional') ? '?' : '';
    lines.push(`  ${ro}${displayKey}${optMark}: ${type}${sep}`);
  }

  lines.push(opts.useType ? '};' : '}');
  interfaces.set(name, lines.join('\n'));
}

function jsonToTypeScript(jsonStr: string, opts: GenOptions): { output: string; error: string } {
  try {
    const parsed = JSON.parse(jsonStr);
    const interfaces = new Map<string, string>();

    if (Array.isArray(parsed)) {
      if (parsed.length > 0 && typeof parsed[0] === 'object' && parsed[0] !== null) {
        const merged = mergeObjects(parsed.filter(v => v && typeof v === 'object' && !Array.isArray(v)));
        generateInterface(merged, opts.rootName, interfaces, opts);
      } else {
        const types = new Set(parsed.map(v => typeof v === 'object' ? 'unknown' : typeof v));
        const exp = opts.exportTypes ? 'export ' : '';
        return { output: `${exp}type ${opts.rootName} = ${Array.from(types).join(' | ')}[];`, error: '' };
      }
    } else if (typeof parsed === 'object' && parsed !== null) {
      generateInterface(parsed, opts.rootName, interfaces, opts);
    } else {
      const exp = opts.exportTypes ? 'export ' : '';
      return { output: `${exp}type ${opts.rootName} = ${typeof parsed};`, error: '' };
    }

    const result: string[] = [];
    const entries = Array.from(interfaces.entries());
    // Put root last, nested first
    const rootIdx = entries.findIndex(([k]) => k === opts.rootName);
    if (rootIdx > 0) {
      const root = entries.splice(rootIdx, 1);
      entries.push(...root);
    }
    for (const [, def] of entries) {
      result.push(def);
    }
    return { output: result.join('\n\n'), error: '' };
  } catch (e) {
    return { output: '', error: e instanceof Error ? e.message : 'Invalid JSON' };
  }
}

const SAMPLE_JSON = `{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "is_active": true,
  "score": 98.5,
  "address": {
    "street": "123 Main St",
    "city": "Springfield",
    "zip_code": "62701",
    "coordinates": {
      "lat": 39.7817,
      "lng": -89.6501
    }
  },
  "tags": ["admin", "user"],
  "orders": [
    { "id": 101, "total": 29.99, "status": "shipped" },
    { "id": 102, "total": 49.99, "status": "pending" }
  ],
  "metadata": null
}`;

export default function JsonToTypescript() {
  const [input, setInput] = useState('');
  const [useType, setUseType] = useState(false);
  const [optional, setOptional] = useState(false);
  const [readonly_, setReadonly] = useState(false);
  const [exportTypes, setExportTypes] = useState(true);
  const [rootName, setRootName] = useState('Root');
  const [camelCase, setCamelCase] = useState(false);
  const [nullableMode, setNullableMode] = useState<'nullable' | 'optional'>('nullable');
  const [snackOpen, setSnackOpen] = useState(false);

  const opts: GenOptions = useMemo(() => ({
    useType, optional, readonly: readonly_, exportTypes, rootName: rootName || 'Root', camelCase, nullableMode,
  }), [useType, optional, readonly_, exportTypes, rootName, camelCase, nullableMode]);

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: '', error: '' };
    return jsonToTypeScript(input, opts);
  }, [input, opts]);

  const copy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setSnackOpen(true);
  };

  const sw = { '& .MuiSwitch-switchBase.Mui-checked': { color: '#8b5cf6' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#8b5cf6' } };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a', color: 'grey.300', p: 3 }}>
      <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <Link to="/"><IconButton size="small" sx={{ color: 'grey.500' }}><Home /></IconButton></Link>
          <Code sx={{ color: '#8b5cf6' }} />
          <Typography variant="h5" fontWeight={700}>JSON to TypeScript</Typography>
        </Box>

        <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
          <TextField size="small" value={rootName} onChange={e => setRootName(e.target.value)} label="Root Name"
            sx={{ width: 140, '& .MuiInputBase-root': { bgcolor: '#0d0d0d', color: 'grey.300', fontSize: 13 }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' }, '& .MuiInputLabel-root': { color: 'grey.500' } }}
          />
          <FormControlLabel control={<Switch checked={useType} onChange={e => setUseType(e.target.checked)} size="small" sx={sw} />} label={<Typography variant="body2" color="grey.400">type alias</Typography>} />
          <FormControlLabel control={<Switch checked={optional} onChange={e => setOptional(e.target.checked)} size="small" sx={sw} />} label={<Typography variant="body2" color="grey.400">optional</Typography>} />
          <FormControlLabel control={<Switch checked={readonly_} onChange={e => setReadonly(e.target.checked)} size="small" sx={sw} />} label={<Typography variant="body2" color="grey.400">readonly</Typography>} />
          <FormControlLabel control={<Switch checked={exportTypes} onChange={e => setExportTypes(e.target.checked)} size="small" sx={sw} />} label={<Typography variant="body2" color="grey.400">export</Typography>} />
          <FormControlLabel control={<Switch checked={camelCase} onChange={e => setCamelCase(e.target.checked)} size="small" sx={sw} />} label={<Typography variant="body2" color="grey.400">camelCase</Typography>} />
          <Chip label={nullableMode === 'nullable' ? 'T | null' : 'optional?'} size="small" onClick={() => setNullableMode(nullableMode === 'nullable' ? 'optional' : 'nullable')}
            sx={{ bgcolor: '#8b5cf620', color: '#8b5cf6', cursor: 'pointer' }} />
          <Box sx={{ flex: 1 }} />
          <Button size="small" variant="outlined" sx={{ borderColor: '#333', color: 'grey.400', textTransform: 'none' }} onClick={() => setInput(SAMPLE_JSON)}>Sample</Button>
          <Tooltip title="Clear"><IconButton size="small" sx={{ color: 'grey.500' }} onClick={() => setInput('')}><Clear /></IconButton></Tooltip>
        </Paper>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
            <Typography variant="subtitle2" color="grey.400" mb={1}>JSON Input</Typography>
            <TextField
              multiline rows={22} fullWidth value={input} onChange={e => setInput(e.target.value)}
              placeholder="Paste your JSON here..."
              error={!!error}
              helperText={error}
              sx={{ '& .MuiInputBase-root': { bgcolor: '#0d0d0d', fontFamily: 'monospace', fontSize: 13, color: 'grey.300' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: error ? '#ef4444' : '#222' } }}
            />
          </Paper>

          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" color="grey.400">TypeScript Output</Typography>
              <Tooltip title="Copy"><IconButton size="small" sx={{ color: 'grey.500' }} onClick={copy}><ContentCopy /></IconButton></Tooltip>
            </Box>
            <Box sx={{ bgcolor: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 1, p: 2, fontFamily: 'monospace', fontSize: 13, color: '#a5f3fc', whiteSpace: 'pre-wrap', minHeight: 500, maxHeight: 640, overflow: 'auto' }}>
              {output || <Typography color="grey.600" fontSize={13}>TypeScript interfaces will appear here</Typography>}
            </Box>
          </Paper>
        </Box>
      </Box>
      <Snackbar open={snackOpen} autoHideDuration={2000} onClose={() => setSnackOpen(false)} message="Copied to clipboard" />
    </Box>
  );
}
