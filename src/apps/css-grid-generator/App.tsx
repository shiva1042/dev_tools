import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Button, IconButton, Tooltip, Snackbar, Chip,
  Select, MenuItem, FormControl, InputLabel, Slider, Tabs, Tab,
} from '@mui/material';
import { Home, ContentCopy, Add, Delete } from '@mui/icons-material';

interface GridItem {
  id: number;
  name: string;
  color: string;
  colStart: number;
  colEnd: number;
  rowStart: number;
  rowEnd: number;
  justifySelf: string;
  alignSelf: string;
}

const COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#34495e', '#e91e63', '#00bcd4', '#8bc34a', '#ff5722'];
const JUSTIFY_OPTIONS = ['auto', 'start', 'end', 'center', 'stretch'];
const ALIGN_OPTIONS = ['auto', 'start', 'end', 'center', 'stretch'];

const tfSx = {
  '& .MuiInputBase-root': { bgcolor: '#0a0a0a', color: 'grey.300', fontFamily: 'monospace', fontSize: 13 },
  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
};

let nextItemId = 1;

export default function App() {
  const [cols, setCols] = useState(3);
  const [rows, setRows] = useState(3);
  const [colSizing, setColSizing] = useState('1fr');
  const [rowSizing, setRowSizing] = useState('1fr');
  const [colGap, setColGap] = useState(10);
  const [rowGap, setRowGap] = useState(10);
  const [justifyItems, setJustifyItems] = useState('stretch');
  const [alignItems, setAlignItems] = useState('stretch');
  const [justifyContent, setJustifyContent] = useState('stretch');
  const [alignContent, setAlignContent] = useState('stretch');
  const [useAreas, setUseAreas] = useState(false);
  const [items, setItems] = useState<GridItem[]>([
    { id: nextItemId++, name: 'header', color: COLORS[0], colStart: 1, colEnd: 4, rowStart: 1, rowEnd: 2, justifySelf: 'auto', alignSelf: 'auto' },
    { id: nextItemId++, name: 'sidebar', color: COLORS[1], colStart: 1, colEnd: 2, rowStart: 2, rowEnd: 3, justifySelf: 'auto', alignSelf: 'auto' },
    { id: nextItemId++, name: 'main', color: COLORS[2], colStart: 2, colEnd: 4, rowStart: 2, rowEnd: 3, justifySelf: 'auto', alignSelf: 'auto' },
    { id: nextItemId++, name: 'footer', color: COLORS[3], colStart: 1, colEnd: 4, rowStart: 3, rowEnd: 4, justifySelf: 'auto', alignSelf: 'auto' },
  ]);
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [outputTab, setOutputTab] = useState(0);
  const [snackOpen, setSnackOpen] = useState(false);

  const addItem = () => {
    const color = COLORS[items.length % COLORS.length];
    setItems([...items, {
      id: nextItemId++, name: `item${items.length + 1}`, color,
      colStart: 1, colEnd: 2, rowStart: 1, rowEnd: 2,
      justifySelf: 'auto', alignSelf: 'auto',
    }]);
  };

  const removeItem = (id: number) => {
    setItems(items.filter(i => i.id !== id));
    if (selectedItem === id) setSelectedItem(null);
  };

  const updateItem = (id: number, updates: Partial<GridItem>) => {
    setItems(items.map(i => i.id === id ? { ...i, ...updates } : i));
  };

  const gridTemplateAreas = useMemo(() => {
    if (!useAreas) return '';
    const grid: string[][] = [];
    for (let r = 0; r < rows; r++) {
      grid[r] = [];
      for (let c = 0; c < cols; c++) {
        grid[r][c] = '.';
      }
    }
    items.forEach(item => {
      for (let r = item.rowStart - 1; r < Math.min(item.rowEnd - 1, rows); r++) {
        for (let c = item.colStart - 1; c < Math.min(item.colEnd - 1, cols); c++) {
          if (r >= 0 && r < rows && c >= 0 && c < cols) {
            grid[r][c] = item.name;
          }
        }
      }
    });
    return grid.map(row => `"${row.join(' ')}"`).join('\n    ');
  }, [items, rows, cols, useAreas]);

  const containerCss = useMemo(() => {
    const lines: string[] = ['.grid-container {'];
    lines.push('  display: grid;');
    lines.push(`  grid-template-columns: repeat(${cols}, ${colSizing});`);
    lines.push(`  grid-template-rows: repeat(${rows}, ${rowSizing});`);
    if (useAreas && gridTemplateAreas) {
      lines.push(`  grid-template-areas:\n    ${gridTemplateAreas};`);
    }
    lines.push(`  column-gap: ${colGap}px;`);
    lines.push(`  row-gap: ${rowGap}px;`);
    if (justifyItems !== 'stretch') lines.push(`  justify-items: ${justifyItems};`);
    if (alignItems !== 'stretch') lines.push(`  align-items: ${alignItems};`);
    if (justifyContent !== 'stretch') lines.push(`  justify-content: ${justifyContent};`);
    if (alignContent !== 'stretch') lines.push(`  align-content: ${alignContent};`);
    lines.push('}');
    return lines.join('\n');
  }, [cols, rows, colSizing, rowSizing, colGap, rowGap, justifyItems, alignItems, justifyContent, alignContent, useAreas, gridTemplateAreas]);

  const itemsCss = useMemo(() => {
    return items.map(item => {
      const lines: string[] = [`.${item.name} {`];
      if (useAreas) {
        lines.push(`  grid-area: ${item.name};`);
      } else {
        lines.push(`  grid-column: ${item.colStart} / ${item.colEnd};`);
        lines.push(`  grid-row: ${item.rowStart} / ${item.rowEnd};`);
      }
      if (item.justifySelf !== 'auto') lines.push(`  justify-self: ${item.justifySelf};`);
      if (item.alignSelf !== 'auto') lines.push(`  align-self: ${item.alignSelf};`);
      lines.push('}');
      return lines.join('\n');
    }).join('\n\n');
  }, [items, useAreas]);

  const htmlCode = useMemo(() => {
    const inner = items.map(i => `  <div class="${i.name}">${i.name}</div>`).join('\n');
    return `<div class="grid-container">\n${inner}\n</div>`;
  }, [items]);

  const fullCss = `${containerCss}\n\n${itemsCss}`;

  const copy = (text: string) => { navigator.clipboard.writeText(text); setSnackOpen(true); };

  const selected = items.find(i => i.id === selectedItem);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a', p: 3 }}>
      <Paper elevation={0} sx={{ bgcolor: '#111', borderBottom: '1px solid #222', px: 3, py: 2, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Link to="/"><IconButton size="small" sx={{ color: 'grey.500' }}><Home /></IconButton></Link>
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>CSS Grid Generator</Typography>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', gap: 3 }}>
        {/* Settings Panel */}
        <Box sx={{ width: 300 }}>
          {/* Container Settings */}
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 2, borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1.5 }}>Grid Container</Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
              <TextField size="small" label="Columns" type="number" value={cols}
                onChange={e => setCols(Math.max(1, Math.min(12, Number(e.target.value))))} sx={{ ...tfSx, flex: 1 }} />
              <TextField size="small" label="Rows" type="number" value={rows}
                onChange={e => setRows(Math.max(1, Math.min(12, Number(e.target.value))))} sx={{ ...tfSx, flex: 1 }} />
            </Box>
            <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
              <TextField size="small" label="Col sizing" value={colSizing} onChange={e => setColSizing(e.target.value)} sx={{ ...tfSx, flex: 1 }} />
              <TextField size="small" label="Row sizing" value={rowSizing} onChange={e => setRowSizing(e.target.value)} sx={{ ...tfSx, flex: 1 }} />
            </Box>
            <Typography sx={{ color: 'grey.500', fontSize: 12, mb: 0.5 }}>Column Gap: {colGap}px</Typography>
            <Slider value={colGap} onChange={(_, v) => setColGap(v as number)} min={0} max={40} sx={{ color: '#1976d2', mb: 1 }} />
            <Typography sx={{ color: 'grey.500', fontSize: 12, mb: 0.5 }}>Row Gap: {rowGap}px</Typography>
            <Slider value={rowGap} onChange={(_, v) => setRowGap(v as number)} min={0} max={40} sx={{ color: '#1976d2', mb: 1.5 }} />
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <FormControl size="small" sx={{ flex: 1 }}>
                <InputLabel sx={{ color: 'grey.500', fontSize: 12 }}>justify-items</InputLabel>
                <Select value={justifyItems} label="justify-items" onChange={e => setJustifyItems(e.target.value)}
                  sx={{ bgcolor: '#0a0a0a', color: 'grey.300', fontSize: 12, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' } }}>
                  {JUSTIFY_OPTIONS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ flex: 1 }}>
                <InputLabel sx={{ color: 'grey.500', fontSize: 12 }}>align-items</InputLabel>
                <Select value={alignItems} label="align-items" onChange={e => setAlignItems(e.target.value)}
                  sx={{ bgcolor: '#0a0a0a', color: 'grey.300', fontSize: 12, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' } }}>
                  {ALIGN_OPTIONS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <FormControl size="small" sx={{ flex: 1 }}>
                <InputLabel sx={{ color: 'grey.500', fontSize: 12 }}>justify-content</InputLabel>
                <Select value={justifyContent} label="justify-content" onChange={e => setJustifyContent(e.target.value)}
                  sx={{ bgcolor: '#0a0a0a', color: 'grey.300', fontSize: 12, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' } }}>
                  {['start', 'end', 'center', 'stretch', 'space-between', 'space-around', 'space-evenly'].map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ flex: 1 }}>
                <InputLabel sx={{ color: 'grey.500', fontSize: 12 }}>align-content</InputLabel>
                <Select value={alignContent} label="align-content" onChange={e => setAlignContent(e.target.value)}
                  sx={{ bgcolor: '#0a0a0a', color: 'grey.300', fontSize: 12, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' } }}>
                  {['start', 'end', 'center', 'stretch', 'space-between', 'space-around', 'space-evenly'].map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ mt: 1.5 }}>
              <Chip label={useAreas ? 'grid-template-areas: ON' : 'grid-template-areas: OFF'}
                onClick={() => setUseAreas(!useAreas)} size="small"
                sx={{ bgcolor: useAreas ? '#1976d2' : '#222', color: useAreas ? 'white' : 'grey.400' }} />
            </Box>
          </Paper>

          {/* Grid Items */}
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 2, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" sx={{ color: 'grey.400' }}>Grid Items</Typography>
              <Button size="small" startIcon={<Add />} onClick={addItem} sx={{ color: 'grey.400', textTransform: 'none' }}>Add</Button>
            </Box>
            {items.map(item => (
              <Box key={item.id} onClick={() => setSelectedItem(item.id)} sx={{
                display: 'flex', alignItems: 'center', gap: 1, p: 1, mb: 0.5, borderRadius: 1, cursor: 'pointer',
                bgcolor: selectedItem === item.id ? '#1a1a2e' : '#0a0a0a',
                border: `1px solid ${selectedItem === item.id ? '#1976d2' : '#222'}`,
              }}>
                <Box sx={{ width: 16, height: 16, bgcolor: item.color, borderRadius: 0.5, flexShrink: 0 }} />
                <Typography sx={{ color: 'grey.300', fontSize: 12, fontFamily: 'monospace', flex: 1 }}>{item.name}</Typography>
                <Typography sx={{ color: 'grey.600', fontSize: 10 }}>{item.colStart}/{item.colEnd} x {item.rowStart}/{item.rowEnd}</Typography>
                <IconButton size="small" onClick={e => { e.stopPropagation(); removeItem(item.id); }} sx={{ color: 'grey.600' }}><Delete sx={{ fontSize: 14 }} /></IconButton>
              </Box>
            ))}
          </Paper>

          {/* Item Editor */}
          {selected && (
            <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1 }}>Edit: {selected.name}</Typography>
              <TextField size="small" fullWidth label="Name" value={selected.name}
                onChange={e => updateItem(selected.id, { name: e.target.value.replace(/\s/g, '-') })} sx={{ ...tfSx, mb: 1 }} />
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField size="small" label="Col start" type="number" value={selected.colStart}
                  onChange={e => updateItem(selected.id, { colStart: Number(e.target.value) })} sx={{ ...tfSx, flex: 1 }} />
                <TextField size="small" label="Col end" type="number" value={selected.colEnd}
                  onChange={e => updateItem(selected.id, { colEnd: Number(e.target.value) })} sx={{ ...tfSx, flex: 1 }} />
              </Box>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField size="small" label="Row start" type="number" value={selected.rowStart}
                  onChange={e => updateItem(selected.id, { rowStart: Number(e.target.value) })} sx={{ ...tfSx, flex: 1 }} />
                <TextField size="small" label="Row end" type="number" value={selected.rowEnd}
                  onChange={e => updateItem(selected.id, { rowEnd: Number(e.target.value) })} sx={{ ...tfSx, flex: 1 }} />
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <FormControl size="small" sx={{ flex: 1 }}>
                  <InputLabel sx={{ color: 'grey.500', fontSize: 12 }}>justify-self</InputLabel>
                  <Select value={selected.justifySelf} label="justify-self" onChange={e => updateItem(selected.id, { justifySelf: e.target.value })}
                    sx={{ bgcolor: '#0a0a0a', color: 'grey.300', fontSize: 12, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' } }}>
                    {JUSTIFY_OPTIONS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ flex: 1 }}>
                  <InputLabel sx={{ color: 'grey.500', fontSize: 12 }}>align-self</InputLabel>
                  <Select value={selected.alignSelf} label="align-self" onChange={e => updateItem(selected.id, { alignSelf: e.target.value })}
                    sx={{ bgcolor: '#0a0a0a', color: 'grey.300', fontSize: 12, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' } }}>
                    {ALIGN_OPTIONS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                  </Select>
                </FormControl>
              </Box>
            </Paper>
          )}
        </Box>

        {/* Grid Preview */}
        <Box sx={{ flex: 1 }}>
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 2, borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1.5 }}>Live Preview</Typography>
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              gridTemplateRows: `repeat(${rows}, 60px)`,
              columnGap: `${colGap}px`,
              rowGap: `${rowGap}px`,
              bgcolor: '#1a1a2e',
              p: 2,
              borderRadius: 1,
              border: '1px dashed #333',
              position: 'relative',
              minHeight: 200,
            }}>
              {/* Grid lines */}
              {Array.from({ length: rows * cols }).map((_, i) => (
                <Box key={`bg-${i}`} sx={{
                  bgcolor: '#111',
                  borderRadius: 0.5,
                  border: '1px dashed #222',
                  gridColumn: `${(i % cols) + 1}`,
                  gridRow: `${Math.floor(i / cols) + 1}`,
                }} />
              ))}
              {/* Items overlay */}
              {items.map(item => (
                <Box key={item.id} onClick={() => setSelectedItem(item.id)} sx={{
                  gridColumn: `${item.colStart} / ${item.colEnd}`,
                  gridRow: `${item.rowStart} / ${item.rowEnd}`,
                  bgcolor: item.color + 'cc',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  border: selectedItem === item.id ? '2px solid white' : '2px solid transparent',
                  transition: 'border 0.15s',
                  zIndex: 1,
                  '&:hover': { opacity: 0.9 },
                }}>
                  <Typography sx={{ color: 'white', fontSize: 12, fontWeight: 600, textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                    {item.name}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>

          {/* Code Output */}
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 0, borderRadius: 2 }}>
            <Tabs value={outputTab} onChange={(_, v) => setOutputTab(v)}
              sx={{ borderBottom: '1px solid #222', '& .MuiTab-root': { color: 'grey.500', textTransform: 'none', minHeight: 40, fontSize: 12 }, '& .Mui-selected': { color: '#42a5f5' } }}>
              <Tab label="CSS" />
              <Tab label="HTML" />
            </Tabs>
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                <Tooltip title="Copy">
                  <IconButton size="small" onClick={() => copy(outputTab === 0 ? fullCss : htmlCode)} sx={{ color: 'grey.500' }}>
                    <ContentCopy fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box sx={{ bgcolor: '#0a0a0a', border: '1px solid #222', borderRadius: 1, p: 2, maxHeight: 400, overflow: 'auto' }}>
                <Typography component="pre" sx={{ color: '#98c379', fontFamily: 'monospace', fontSize: 12, whiteSpace: 'pre-wrap', m: 0 }}>
                  {outputTab === 0 ? fullCss : htmlCode}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>

      <Snackbar open={snackOpen} autoHideDuration={2000} onClose={() => setSnackOpen(false)} message="Copied to clipboard" />
    </Box>
  );
}
