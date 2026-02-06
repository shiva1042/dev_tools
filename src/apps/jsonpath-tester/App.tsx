import { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Tooltip,
  Snackbar,
  Chip,
} from '@mui/material';
import {
  ContentCopy,
  Home,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

// Simple JSONPath implementation for common use cases
function evaluateJsonPath(obj: unknown, path: string): unknown[] {
  if (!path.startsWith('$')) {
    throw new Error('JSONPath must start with $');
  }

  const results: unknown[] = [];

  function traverse(current: unknown, pathParts: string[], index: number): void {
    if (index >= pathParts.length) {
      results.push(current);
      return;
    }

    const part = pathParts[index];

    if (part === '' || part === '$') {
      traverse(current, pathParts, index + 1);
      return;
    }

    // Recursive descent (..)
    if (part === '') {
      // Handle .. by checking next part recursively
      const next = pathParts[index + 1];
      if (next) {
        traverseRecursive(current, next, pathParts, index + 2);
      }
      return;
    }

    // Wildcard
    if (part === '*') {
      if (Array.isArray(current)) {
        current.forEach(item => traverse(item, pathParts, index + 1));
      } else if (current && typeof current === 'object') {
        Object.values(current).forEach(val => traverse(val, pathParts, index + 1));
      }
      return;
    }

    // Array index or slice
    const arrayMatch = part.match(/^\[(.+)\]$/);
    if (arrayMatch) {
      const inner = arrayMatch[1];

      // Array index
      if (/^\d+$/.test(inner)) {
        const idx = parseInt(inner);
        if (Array.isArray(current) && idx < current.length) {
          traverse(current[idx], pathParts, index + 1);
        }
        return;
      }

      // Negative index
      if (/^-\d+$/.test(inner)) {
        const idx = parseInt(inner);
        if (Array.isArray(current)) {
          const actualIdx = current.length + idx;
          if (actualIdx >= 0) {
            traverse(current[actualIdx], pathParts, index + 1);
          }
        }
        return;
      }

      // Wildcard in brackets
      if (inner === '*') {
        if (Array.isArray(current)) {
          current.forEach(item => traverse(item, pathParts, index + 1));
        }
        return;
      }

      // Slice [start:end]
      const sliceMatch = inner.match(/^(\d*):(\d*)$/);
      if (sliceMatch && Array.isArray(current)) {
        const start = sliceMatch[1] ? parseInt(sliceMatch[1]) : 0;
        const end = sliceMatch[2] ? parseInt(sliceMatch[2]) : current.length;
        current.slice(start, end).forEach(item => traverse(item, pathParts, index + 1));
        return;
      }

      // Multiple indices [0,1,2]
      if (inner.includes(',')) {
        const indices = inner.split(',').map(s => s.trim());
        if (Array.isArray(current)) {
          indices.forEach(i => {
            const idx = parseInt(i);
            if (!isNaN(idx) && idx < current.length) {
              traverse(current[idx], pathParts, index + 1);
            }
          });
        }
        return;
      }

      // Filter expression [?(@.property == value)]
      const filterMatch = inner.match(/^\?\(@\.(\w+)\s*(==|!=|>|<|>=|<=)\s*['"]?([^'"]+)['"]?\)$/);
      if (filterMatch && Array.isArray(current)) {
        const [, prop, op, value] = filterMatch;
        current.forEach(item => {
          if (item && typeof item === 'object' && prop in item) {
            const itemVal = (item as Record<string, unknown>)[prop];
            let match = false;
            const numVal = parseFloat(value);
            const compareVal = isNaN(numVal) ? value : numVal;

            switch (op) {
              case '==': match = itemVal == compareVal; break;
              case '!=': match = itemVal != compareVal; break;
              case '>': match = (itemVal as number) > (compareVal as number); break;
              case '<': match = (itemVal as number) < (compareVal as number); break;
              case '>=': match = (itemVal as number) >= (compareVal as number); break;
              case '<=': match = (itemVal as number) <= (compareVal as number); break;
            }
            if (match) traverse(item, pathParts, index + 1);
          }
        });
        return;
      }

      // Property name in brackets ['property']
      const propMatch = inner.match(/^['"](.+)['"]$/);
      if (propMatch && current && typeof current === 'object') {
        const prop = propMatch[1];
        if (prop in current) {
          traverse((current as Record<string, unknown>)[prop], pathParts, index + 1);
        }
        return;
      }
    }

    // Regular property access
    if (current && typeof current === 'object' && part in current) {
      traverse((current as Record<string, unknown>)[part], pathParts, index + 1);
    }
  }

  function traverseRecursive(current: unknown, targetPart: string, pathParts: string[], nextIndex: number): void {
    // Check current level
    if (current && typeof current === 'object') {
      if (targetPart in current) {
        traverse((current as Record<string, unknown>)[targetPart], pathParts, nextIndex);
      }

      // Recurse into children
      if (Array.isArray(current)) {
        current.forEach(item => traverseRecursive(item, targetPart, pathParts, nextIndex));
      } else {
        Object.values(current).forEach(val => {
          if (val && typeof val === 'object') {
            traverseRecursive(val, targetPart, pathParts, nextIndex);
          }
        });
      }
    }
  }

  // Parse path into parts
  // Handle both dot notation and bracket notation
  const normalizedPath = path.replace(/\[/g, '.[').replace(/\.\./g, '.<recursive>.');
  const parts = normalizedPath.split('.').map(p => p === '<recursive>' ? '' : p);

  traverse(obj, parts, 0);
  return results;
}

const EXAMPLE_JSON = {
  store: {
    name: "My Store",
    books: [
      { title: "Book 1", author: "Author A", price: 10.99, category: "fiction" },
      { title: "Book 2", author: "Author B", price: 15.99, category: "non-fiction" },
      { title: "Book 3", author: "Author A", price: 8.99, category: "fiction" },
      { title: "Book 4", author: "Author C", price: 22.50, category: "technical" },
    ],
    electronics: [
      { name: "Laptop", price: 999, brand: "TechCo" },
      { name: "Phone", price: 699, brand: "TechCo" },
    ]
  },
  metadata: {
    version: "1.0",
    updated: "2024-01-15"
  }
};

const EXAMPLE_PATHS = [
  { path: '$.store.name', description: 'Get store name' },
  { path: '$.store.books[0]', description: 'First book' },
  { path: '$.store.books[-1]', description: 'Last book' },
  { path: '$.store.books[*].title', description: 'All book titles' },
  { path: '$.store.books[0:2]', description: 'First two books' },
  { path: '$.store.books[?(@.price < 15)]', description: 'Books under $15' },
  { path: '$.store.books[?(@.author == "Author A")]', description: 'Books by Author A' },
  { path: '$..price', description: 'All prices (recursive)' },
  { path: '$..title', description: 'All titles (recursive)' },
  { path: '$.store.*', description: 'All store properties' },
];

export default function JsonPathTester() {
  const [jsonInput, setJsonInput] = useState(JSON.stringify(EXAMPLE_JSON, null, 2));
  const [pathInput, setPathInput] = useState('$.store.books[*].title');
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const parsedJson = useMemo(() => {
    try {
      return { success: true, data: JSON.parse(jsonInput) };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }, [jsonInput]);

  const result = useMemo(() => {
    if (!parsedJson.success) return { success: false, error: 'Invalid JSON' };
    if (!pathInput.trim()) return { success: false, error: 'Enter a JSONPath expression' };

    try {
      const matches = evaluateJsonPath(parsedJson.data, pathInput);
      return { success: true, matches, count: matches.length };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }, [parsedJson, pathInput]);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setSnackbar({ open: true, message: 'Copied to clipboard' });
  };

  const handleExampleClick = (path: string) => {
    setPathInput(path);
  };

  const handleResetJson = () => {
    setJsonInput(JSON.stringify(EXAMPLE_JSON, null, 2));
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a' }}>
      <Paper elevation={0} sx={{ bgcolor: '#111', borderBottom: '1px solid #222', px: 3, py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Link to="/"><IconButton size="small" sx={{ color: 'grey.500' }}><Home /></IconButton></Link>
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>JSONPath Tester</Typography>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', height: 'calc(100vh - 70px)' }}>
        {/* Left Panel - JSON Input */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid #222' }}>
          <Box sx={{ p: 2, borderBottom: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" sx={{ color: 'grey.400' }}>JSON Input</Typography>
            <Chip label="Reset" size="small" onClick={handleResetJson} sx={{ cursor: 'pointer' }} />
          </Box>
          <Box sx={{ flex: 1, p: 2 }}>
            <TextField
              multiline
              fullWidth
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              error={!parsedJson.success}
              helperText={!parsedJson.success ? parsedJson.error : ''}
              sx={{
                height: '100%',
                '& .MuiInputBase-root': {
                  height: '100%',
                  alignItems: 'flex-start',
                  fontFamily: 'monospace',
                  fontSize: 12,
                  color: 'grey.300',
                  bgcolor: '#0a0a0a',
                },
                '& .MuiInputBase-input': {
                  height: '100% !important',
                  overflow: 'auto !important',
                },
              }}
            />
          </Box>
        </Box>

        {/* Right Panel - Path and Results */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Path Input */}
          <Box sx={{ p: 2, borderBottom: '1px solid #222' }}>
            <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1 }}>JSONPath Expression</Typography>
            <TextField
              fullWidth
              size="small"
              value={pathInput}
              onChange={(e) => setPathInput(e.target.value)}
              placeholder="$.store.books[*].title"
              sx={{
                '& .MuiInputBase-root': {
                  fontFamily: 'monospace',
                  fontSize: 14,
                  color: 'grey.300',
                  bgcolor: '#0a0a0a',
                },
              }}
            />
          </Box>

          {/* Example Paths */}
          <Box sx={{ p: 2, borderBottom: '1px solid #222' }}>
            <Typography variant="caption" sx={{ color: 'grey.500', display: 'block', mb: 1 }}>Examples (click to use)</Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {EXAMPLE_PATHS.map((ex, i) => (
                <Tooltip key={i} title={ex.description}>
                  <Chip
                    label={ex.path}
                    size="small"
                    onClick={() => handleExampleClick(ex.path)}
                    color={pathInput === ex.path ? 'primary' : 'default'}
                    sx={{ cursor: 'pointer', fontFamily: 'monospace', fontSize: 10 }}
                  />
                </Tooltip>
              ))}
            </Box>
          </Box>

          {/* Results */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Box sx={{ p: 2, borderBottom: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle2" sx={{ color: 'grey.400' }}>Results</Typography>
                {result.success && (
                  <Chip label={`${result.count} match${result.count !== 1 ? 'es' : ''}`} size="small" color="success" />
                )}
              </Box>
              {result.success && result.matches && (
                <Tooltip title="Copy Results">
                  <IconButton size="small" onClick={() => handleCopy(JSON.stringify(result.matches, null, 2))} sx={{ color: 'grey.500' }}>
                    <ContentCopy fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
            <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
              {result.success ? (
                <Paper sx={{ bgcolor: '#0a0a0a', p: 2, border: '1px solid #333', minHeight: '100%' }}>
                  <Typography component="pre" sx={{ fontFamily: 'monospace', fontSize: 12, color: '#4fc3f7', m: 0, whiteSpace: 'pre-wrap' }}>
                    {JSON.stringify(result.matches, null, 2)}
                  </Typography>
                </Paper>
              ) : (
                <Paper sx={{ bgcolor: '#1a1a1a', p: 2, border: '1px solid #333' }}>
                  <Typography sx={{ color: 'error.main', fontFamily: 'monospace', fontSize: 12 }}>
                    {result.error}
                  </Typography>
                </Paper>
              )}
            </Box>
          </Box>

          {/* Quick Reference */}
          <Box sx={{ p: 2, borderTop: '1px solid #222', bgcolor: '#111' }}>
            <Typography variant="caption" sx={{ color: 'grey.500', display: 'block', mb: 1 }}>Quick Reference</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, fontSize: 11 }}>
              <Typography sx={{ color: 'grey.400', fontFamily: 'monospace' }}>$ - root</Typography>
              <Typography sx={{ color: 'grey.400', fontFamily: 'monospace' }}>.property - child</Typography>
              <Typography sx={{ color: 'grey.400', fontFamily: 'monospace' }}>[n] - array index</Typography>
              <Typography sx={{ color: 'grey.400', fontFamily: 'monospace' }}>[*] - all elements</Typography>
              <Typography sx={{ color: 'grey.400', fontFamily: 'monospace' }}>[start:end] - slice</Typography>
              <Typography sx={{ color: 'grey.400', fontFamily: 'monospace' }}>.. - recursive</Typography>
              <Typography sx={{ color: 'grey.400', fontFamily: 'monospace' }}>[?(@.x==y)] - filter</Typography>
              <Typography sx={{ color: 'grey.400', fontFamily: 'monospace' }}>[-1] - last element</Typography>
              <Typography sx={{ color: 'grey.400', fontFamily: 'monospace' }}>[0,1,2] - union</Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={2000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} />
    </Box>
  );
}
