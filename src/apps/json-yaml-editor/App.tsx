import { useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Chip,
} from '@mui/material';
import {
  ContentCopy,
  Download,
  Upload,
  FormatAlignLeft,
  Compress,
  SwapHoriz,
  Check,
  Error as ErrorIcon,
  Home,
  AccountTree,
  Code,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

type Format = 'json' | 'yaml';
type ViewMode = 'code' | 'tree';

interface TreeNode {
  key: string;
  value: unknown;
  type: string;
  path: string;
  expanded?: boolean;
}

const jsonToYaml = (obj: unknown, indent = 0): string => {
  const spaces = '  '.repeat(indent);

  if (obj === null) return 'null';
  if (obj === undefined) return '~';
  if (typeof obj === 'boolean') return obj ? 'true' : 'false';
  if (typeof obj === 'number') return String(obj);
  if (typeof obj === 'string') {
    if (obj.includes('\n') || obj.includes(':') || obj.includes('#') || obj.includes("'") || obj.includes('"') || obj.startsWith(' ') || obj.endsWith(' ')) {
      return `"${obj.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`;
    }
    return obj || '""';
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]';
    return obj.map((item, i) => {
      const itemStr = jsonToYaml(item, indent + 1);
      if (typeof item === 'object' && item !== null) {
        return `${i === 0 ? '' : spaces}- ${itemStr.trim()}`;
      }
      return `${i === 0 ? '' : spaces}- ${itemStr}`;
    }).join('\n- ').replace(/^/, '- ');
  }

  if (typeof obj === 'object') {
    const entries = Object.entries(obj as Record<string, unknown>);
    if (entries.length === 0) return '{}';
    return entries.map(([key, val], i) => {
      const valStr = jsonToYaml(val, indent + 1);
      if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
        return `${i === 0 ? '' : spaces}${key}:\n${spaces}  ${valStr.split('\n').join('\n' + spaces + '  ')}`;
      }
      if (Array.isArray(val)) {
        return `${i === 0 ? '' : spaces}${key}:\n${spaces}  ${valStr.split('\n').join('\n' + spaces + '  ')}`;
      }
      return `${i === 0 ? '' : spaces}${key}: ${valStr}`;
    }).join('\n');
  }

  return String(obj);
};

const yamlToJson = (yaml: string): unknown => {
  const lines = yaml.split('\n');
  const result: Record<string, unknown> = {};
  const stack: { indent: number; obj: Record<string, unknown> | unknown[]; key?: string }[] = [{ indent: -1, obj: result }];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith('#')) continue;

    const indent = line.search(/\S/);
    const content = line.trim();

    // Pop stack to find parent
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }

    const parent = stack[stack.length - 1];

    if (content.startsWith('- ')) {
      // Array item
      const value = content.slice(2).trim();
      if (Array.isArray(parent.obj)) {
        if (value.includes(':')) {
          const colonIdx = value.indexOf(':');
          const key = value.slice(0, colonIdx).trim();
          const val = value.slice(colonIdx + 1).trim();
          const newObj: Record<string, unknown> = {};
          newObj[key] = parseYamlValue(val);
          parent.obj.push(newObj);
          stack.push({ indent, obj: newObj });
        } else {
          parent.obj.push(parseYamlValue(value));
        }
      } else {
        const parentObj = parent.obj as Record<string, unknown>;
        const lastKey = parent.key || Object.keys(parentObj).pop() || '';
        if (!Array.isArray(parentObj[lastKey])) {
          parentObj[lastKey] = [];
        }
        const arr = parentObj[lastKey] as unknown[];
        if (value.includes(':')) {
          const colonIdx = value.indexOf(':');
          const key = value.slice(0, colonIdx).trim();
          const val = value.slice(colonIdx + 1).trim();
          const newObj: Record<string, unknown> = {};
          newObj[key] = parseYamlValue(val);
          arr.push(newObj);
          stack.push({ indent, obj: newObj });
        } else {
          arr.push(parseYamlValue(value));
        }
      }
    } else if (content.includes(':')) {
      const colonIdx = content.indexOf(':');
      const key = content.slice(0, colonIdx).trim();
      const value = content.slice(colonIdx + 1).trim();

      if (Array.isArray(parent.obj)) {
        const lastItem = parent.obj[parent.obj.length - 1] as Record<string, unknown>;
        if (typeof lastItem === 'object' && lastItem !== null) {
          if (value) {
            lastItem[key] = parseYamlValue(value);
          } else {
            lastItem[key] = {};
            stack.push({ indent, obj: lastItem[key] as Record<string, unknown>, key });
          }
        }
      } else {
        const parentObj = parent.obj as Record<string, unknown>;
        if (value) {
          parentObj[key] = parseYamlValue(value);
        } else {
          parentObj[key] = {};
          stack.push({ indent, obj: parentObj[key] as Record<string, unknown>, key });
        }
      }
    }
  }

  return Object.keys(result).length === 1 && Array.isArray(result[Object.keys(result)[0]])
    ? result[Object.keys(result)[0]]
    : result;
};

const parseYamlValue = (value: string): unknown => {
  if (!value || value === '~' || value === 'null') return null;
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === '[]') return [];
  if (value === '{}') return {};
  if (/^-?\d+$/.test(value)) return parseInt(value, 10);
  if (/^-?\d+\.\d+$/.test(value)) return parseFloat(value);
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1).replace(/\\n/g, '\n').replace(/\\"/g, '"');
  }
  return value;
};

const getValueType = (value: unknown): string => {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
};

const TreeView = ({ data, path = '' }: { data: unknown; path?: string }) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['']));

  const toggleExpand = (nodePath: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(nodePath)) {
        next.delete(nodePath);
      } else {
        next.add(nodePath);
      }
      return next;
    });
  };

  const renderNode = (key: string | number, value: unknown, currentPath: string, depth: number) => {
    const isExpandable = typeof value === 'object' && value !== null;
    const isExpanded = expanded.has(currentPath);
    const type = getValueType(value);

    const typeColors: Record<string, string> = {
      string: '#98c379',
      number: '#d19a66',
      boolean: '#56b6c2',
      null: '#636d83',
      array: '#c678dd',
      object: '#61afef',
    };

    return (
      <Box key={currentPath} sx={{ ml: depth * 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            py: 0.5,
            cursor: isExpandable ? 'pointer' : 'default',
            '&:hover': { bgcolor: 'action.hover' },
            borderRadius: 1,
            px: 1,
          }}
          onClick={() => isExpandable && toggleExpand(currentPath)}
        >
          {isExpandable && (
            <Typography sx={{ fontFamily: 'monospace', fontSize: 12, color: 'text.secondary', width: 16 }}>
              {isExpanded ? '▼' : '▶'}
            </Typography>
          )}
          {!isExpandable && <Box sx={{ width: 16 }} />}
          <Typography sx={{ fontFamily: 'monospace', fontSize: 13, color: '#e06c75' }}>
            {typeof key === 'string' ? `"${key}"` : `[${key}]`}
          </Typography>
          <Typography sx={{ fontFamily: 'monospace', fontSize: 13, color: 'text.secondary' }}>:</Typography>
          {!isExpandable && (
            <Typography sx={{ fontFamily: 'monospace', fontSize: 13, color: typeColors[type] }}>
              {type === 'string' ? `"${String(value)}"` : String(value)}
            </Typography>
          )}
          {isExpandable && (
            <Chip
              label={`${type} (${Array.isArray(value) ? value.length : Object.keys(value as object).length})`}
              size="small"
              sx={{ height: 20, fontSize: 11 }}
            />
          )}
        </Box>
        {isExpandable && isExpanded && (
          <Box>
            {Array.isArray(value)
              ? value.map((item, idx) => renderNode(idx, item, `${currentPath}[${idx}]`, depth + 1))
              : Object.entries(value as object).map(([k, v]) => renderNode(k, v, `${currentPath}.${k}`, depth + 1))
            }
          </Box>
        )}
      </Box>
    );
  };

  if (typeof data !== 'object' || data === null) {
    return (
      <Typography sx={{ fontFamily: 'monospace', fontSize: 13 }}>
        {JSON.stringify(data)}
      </Typography>
    );
  }

  return (
    <Box sx={{ py: 1 }}>
      {Array.isArray(data)
        ? data.map((item, idx) => renderNode(idx, item, `[${idx}]`, 0))
        : Object.entries(data).map(([k, v]) => renderNode(k, v, k, 0))
      }
    </Box>
  );
};

export default function JsonYamlEditor() {
  const [input, setInput] = useState<string>('{\n  "name": "John Doe",\n  "age": 30,\n  "active": true,\n  "address": {\n    "city": "New York",\n    "zip": "10001"\n  },\n  "tags": ["developer", "designer"]\n}');
  const [format, setFormat] = useState<Format>('json');
  const [viewMode, setViewMode] = useState<ViewMode>('code');
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({ open: false, message: '' });
  const [parsedData, setParsedData] = useState<unknown>(null);

  const validateAndParse = useCallback((text: string, fmt: Format): { valid: boolean; data?: unknown; error?: string } => {
    try {
      if (fmt === 'json') {
        const data = JSON.parse(text);
        return { valid: true, data };
      } else {
        const data = yamlToJson(text);
        return { valid: true, data };
      }
    } catch (e) {
      return { valid: false, error: (e as Error).message };
    }
  }, []);

  const handleInputChange = (value: string) => {
    setInput(value);
    const result = validateAndParse(value, format);
    if (result.valid) {
      setError(null);
      setParsedData(result.data);
    } else {
      setError(result.error || 'Invalid syntax');
      setParsedData(null);
    }
  };

  const handleFormatChange = (_: React.MouseEvent<HTMLElement>, newFormat: Format | null) => {
    if (newFormat && newFormat !== format) {
      try {
        const result = validateAndParse(input, format);
        if (result.valid && result.data) {
          const converted = newFormat === 'json'
            ? JSON.stringify(result.data, null, 2)
            : jsonToYaml(result.data);
          setInput(converted);
          setFormat(newFormat);
          setError(null);
          setParsedData(result.data);
        }
      } catch (e) {
        setSnackbar({ open: true, message: 'Cannot convert: Invalid syntax' });
      }
    }
  };

  const handleFormat = () => {
    const result = validateAndParse(input, format);
    if (result.valid && result.data) {
      const formatted = format === 'json'
        ? JSON.stringify(result.data, null, 2)
        : jsonToYaml(result.data);
      setInput(formatted);
      setSnackbar({ open: true, message: 'Formatted successfully' });
    } else {
      setSnackbar({ open: true, message: 'Cannot format: Invalid syntax' });
    }
  };

  const handleMinify = () => {
    const result = validateAndParse(input, format);
    if (result.valid && result.data) {
      if (format === 'json') {
        setInput(JSON.stringify(result.data));
        setSnackbar({ open: true, message: 'Minified successfully' });
      } else {
        setSnackbar({ open: true, message: 'YAML minification not supported' });
      }
    } else {
      setSnackbar({ open: true, message: 'Cannot minify: Invalid syntax' });
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(input);
    setSnackbar({ open: true, message: 'Copied to clipboard' });
  };

  const handleDownload = () => {
    const blob = new Blob([input], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `data.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const isYaml = file.name.endsWith('.yaml') || file.name.endsWith('.yml');
        setFormat(isYaml ? 'yaml' : 'json');
        handleInputChange(text);
      };
      reader.readAsText(file);
    }
  };

  const handleConvert = () => {
    const newFormat = format === 'json' ? 'yaml' : 'json';
    handleFormatChange({} as React.MouseEvent<HTMLElement>, newFormat);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a' }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          bgcolor: '#111',
          borderBottom: '1px solid #222',
          px: 3,
          py: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Link to="/">
              <IconButton size="small" sx={{ color: 'grey.500' }}>
                <Home />
              </IconButton>
            </Link>
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>
              JSON/YAML Editor
            </Typography>
            <Chip
              icon={error ? <ErrorIcon /> : <Check />}
              label={error ? 'Invalid' : 'Valid'}
              size="small"
              color={error ? 'error' : 'success'}
              variant="outlined"
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ToggleButtonGroup
              value={format}
              exclusive
              onChange={handleFormatChange}
              size="small"
            >
              <ToggleButton value="json" sx={{ color: 'grey.400' }}>JSON</ToggleButton>
              <ToggleButton value="yaml" sx={{ color: 'grey.400' }}>YAML</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>
      </Paper>

      {/* Toolbar */}
      <Paper
        elevation={0}
        sx={{
          bgcolor: '#0d0d0d',
          borderBottom: '1px solid #222',
          px: 3,
          py: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Tooltip title="Format">
          <IconButton size="small" onClick={handleFormat} sx={{ color: 'grey.500' }}>
            <FormatAlignLeft />
          </IconButton>
        </Tooltip>
        <Tooltip title="Minify">
          <IconButton size="small" onClick={handleMinify} sx={{ color: 'grey.500' }}>
            <Compress />
          </IconButton>
        </Tooltip>
        <Tooltip title={`Convert to ${format === 'json' ? 'YAML' : 'JSON'}`}>
          <IconButton size="small" onClick={handleConvert} sx={{ color: 'grey.500' }}>
            <SwapHoriz />
          </IconButton>
        </Tooltip>
        <Box sx={{ mx: 1, borderLeft: '1px solid #333', height: 24 }} />
        <Tooltip title="Copy">
          <IconButton size="small" onClick={handleCopy} sx={{ color: 'grey.500' }}>
            <ContentCopy />
          </IconButton>
        </Tooltip>
        <Tooltip title="Download">
          <IconButton size="small" onClick={handleDownload} sx={{ color: 'grey.500' }}>
            <Download />
          </IconButton>
        </Tooltip>
        <Tooltip title="Upload">
          <IconButton size="small" component="label" sx={{ color: 'grey.500' }}>
            <Upload />
            <input type="file" hidden accept=".json,.yaml,.yml" onChange={handleUpload} />
          </IconButton>
        </Tooltip>
        <Box sx={{ flex: 1 }} />
        <Tabs
          value={viewMode}
          onChange={(_, v) => setViewMode(v)}
          sx={{
            minHeight: 36,
            '& .MuiTab-root': { minHeight: 36, py: 0, color: 'grey.500' },
          }}
        >
          <Tab icon={<Code sx={{ fontSize: 18 }} />} iconPosition="start" label="Code" value="code" />
          <Tab icon={<AccountTree sx={{ fontSize: 18 }} />} iconPosition="start" label="Tree" value="tree" />
        </Tabs>
      </Paper>

      {/* Main Content */}
      <Box sx={{ display: 'flex', height: 'calc(100vh - 130px)' }}>
        {/* Editor */}
        <Box sx={{ flex: 1, p: 2 }}>
          {viewMode === 'code' ? (
            <TextField
              multiline
              fullWidth
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={format === 'json' ? '{\n  "key": "value"\n}' : 'key: value'}
              sx={{
                height: '100%',
                '& .MuiInputBase-root': {
                  height: '100%',
                  alignItems: 'flex-start',
                  fontFamily: 'monospace',
                  fontSize: 14,
                  bgcolor: '#111',
                  color: '#d4d4d4',
                },
                '& .MuiInputBase-input': {
                  height: '100% !important',
                  overflow: 'auto !important',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#333',
                },
              }}
            />
          ) : (
            <Paper
              sx={{
                height: '100%',
                bgcolor: '#111',
                border: '1px solid #333',
                borderRadius: 1,
                overflow: 'auto',
                p: 2,
              }}
            >
              {parsedData ? (
                <TreeView data={parsedData} />
              ) : (
                <Typography color="error" sx={{ fontFamily: 'monospace' }}>
                  {error || 'No valid data to display'}
                </Typography>
              )}
            </Paper>
          )}
        </Box>
      </Box>

      {/* Error display */}
      {error && (
        <Alert
          severity="error"
          sx={{
            position: 'fixed',
            bottom: 16,
            left: 16,
            right: 16,
            maxWidth: 600,
            mx: 'auto',
          }}
        >
          {error}
        </Alert>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
}
