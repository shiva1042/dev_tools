import { useState, useMemo } from 'react';
import {
  Box, Paper, Typography, TextField, IconButton, Tooltip, Chip, Snackbar,
  Tabs, Tab, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import { ContentCopy, Home, Search, Star } from '@mui/icons-material';
import { Link } from 'react-router-dom';

interface Shortcut { keys: string; mac?: string; desc: string; essential?: boolean; }
interface Category { name: string; shortcuts: Shortcut[]; }
interface Tool { name: string; categories: Category[]; }

const TOOLS: Tool[] = [
  { name: 'VS Code', categories: [
    { name: 'Navigation', shortcuts: [
      { keys: 'Ctrl+P', mac: 'Cmd+P', desc: 'Quick Open file', essential: true },
      { keys: 'Ctrl+Shift+P', mac: 'Cmd+Shift+P', desc: 'Command Palette', essential: true },
      { keys: 'Ctrl+G', mac: 'Cmd+G', desc: 'Go to line' },
      { keys: 'Ctrl+Shift+O', mac: 'Cmd+Shift+O', desc: 'Go to symbol' },
      { keys: 'Ctrl+Tab', mac: 'Ctrl+Tab', desc: 'Switch open tabs' },
      { keys: 'Ctrl+\\', mac: 'Cmd+\\', desc: 'Split editor' },
      { keys: 'Ctrl+B', mac: 'Cmd+B', desc: 'Toggle sidebar', essential: true },
      { keys: 'Ctrl+Shift+E', mac: 'Cmd+Shift+E', desc: 'Explorer panel' },
    ]},
    { name: 'Editing', shortcuts: [
      { keys: 'Ctrl+D', mac: 'Cmd+D', desc: 'Select word / next occurrence', essential: true },
      { keys: 'Ctrl+Shift+K', mac: 'Cmd+Shift+K', desc: 'Delete line', essential: true },
      { keys: 'Alt+Up/Down', mac: 'Opt+Up/Down', desc: 'Move line up/down', essential: true },
      { keys: 'Shift+Alt+Up/Down', mac: 'Opt+Shift+Up/Down', desc: 'Copy line up/down' },
      { keys: 'Ctrl+Shift+Enter', mac: 'Cmd+Shift+Enter', desc: 'Insert line above' },
      { keys: 'Ctrl+/', mac: 'Cmd+/', desc: 'Toggle line comment', essential: true },
      { keys: 'Shift+Alt+F', mac: 'Opt+Shift+F', desc: 'Format document' },
      { keys: 'Ctrl+Space', mac: 'Cmd+Space', desc: 'Trigger suggestion' },
      { keys: 'F2', mac: 'F2', desc: 'Rename symbol', essential: true },
      { keys: 'Ctrl+.', mac: 'Cmd+.', desc: 'Quick fix / actions' },
    ]},
    { name: 'Search', shortcuts: [
      { keys: 'Ctrl+F', mac: 'Cmd+F', desc: 'Find', essential: true },
      { keys: 'Ctrl+H', mac: 'Cmd+H', desc: 'Find and replace', essential: true },
      { keys: 'Ctrl+Shift+F', mac: 'Cmd+Shift+F', desc: 'Search in files', essential: true },
      { keys: 'Ctrl+Shift+H', mac: 'Cmd+Shift+H', desc: 'Replace in files' },
    ]},
    { name: 'Terminal', shortcuts: [
      { keys: 'Ctrl+`', mac: 'Ctrl+`', desc: 'Toggle terminal', essential: true },
      { keys: 'Ctrl+Shift+`', mac: 'Ctrl+Shift+`', desc: 'New terminal' },
    ]},
    { name: 'Debug', shortcuts: [
      { keys: 'F5', mac: 'F5', desc: 'Start/continue debugging' },
      { keys: 'F9', mac: 'F9', desc: 'Toggle breakpoint' },
      { keys: 'F10', mac: 'F10', desc: 'Step over' },
      { keys: 'F11', mac: 'F11', desc: 'Step into' },
    ]},
  ]},
  { name: 'IntelliJ IDEA', categories: [
    { name: 'Navigation', shortcuts: [
      { keys: 'Ctrl+N', mac: 'Cmd+N', desc: 'Go to class', essential: true },
      { keys: 'Ctrl+Shift+N', mac: 'Cmd+Shift+N', desc: 'Go to file', essential: true },
      { keys: 'Double Shift', mac: 'Double Shift', desc: 'Search everywhere', essential: true },
      { keys: 'Ctrl+E', mac: 'Cmd+E', desc: 'Recent files' },
      { keys: 'Alt+Left/Right', mac: 'Cmd+[/]', desc: 'Navigate back/forward' },
      { keys: 'Ctrl+B', mac: 'Cmd+B', desc: 'Go to declaration', essential: true },
      { keys: 'Ctrl+Alt+B', mac: 'Cmd+Opt+B', desc: 'Go to implementation' },
    ]},
    { name: 'Editing', shortcuts: [
      { keys: 'Ctrl+Space', mac: 'Ctrl+Space', desc: 'Code completion', essential: true },
      { keys: 'Alt+Enter', mac: 'Opt+Enter', desc: 'Show intention actions', essential: true },
      { keys: 'Ctrl+Alt+L', mac: 'Cmd+Opt+L', desc: 'Reformat code', essential: true },
      { keys: 'Ctrl+Y', mac: 'Cmd+Delete', desc: 'Delete line' },
      { keys: 'Ctrl+D', mac: 'Cmd+D', desc: 'Duplicate line' },
      { keys: 'Shift+F6', mac: 'Shift+F6', desc: 'Rename', essential: true },
      { keys: 'Ctrl+/', mac: 'Cmd+/', desc: 'Line comment', essential: true },
      { keys: 'Ctrl+Shift+/', mac: 'Cmd+Shift+/', desc: 'Block comment' },
    ]},
    { name: 'Search', shortcuts: [
      { keys: 'Ctrl+F', mac: 'Cmd+F', desc: 'Find in file' },
      { keys: 'Ctrl+R', mac: 'Cmd+R', desc: 'Replace in file' },
      { keys: 'Ctrl+Shift+F', mac: 'Cmd+Shift+F', desc: 'Find in path', essential: true },
      { keys: 'Ctrl+Shift+R', mac: 'Cmd+Shift+R', desc: 'Replace in path' },
    ]},
    { name: 'Debug', shortcuts: [
      { keys: 'Shift+F9', mac: 'Shift+F9', desc: 'Debug' },
      { keys: 'Shift+F10', mac: 'Shift+F10', desc: 'Run' },
      { keys: 'Ctrl+F8', mac: 'Cmd+F8', desc: 'Toggle breakpoint' },
      { keys: 'F8', mac: 'F8', desc: 'Step over' },
      { keys: 'F7', mac: 'F7', desc: 'Step into' },
    ]},
  ]},
  { name: 'Vim', categories: [
    { name: 'Navigation', shortcuts: [
      { keys: 'h/j/k/l', desc: 'Left/down/up/right', essential: true },
      { keys: 'w/b', desc: 'Next/prev word', essential: true },
      { keys: 'gg/G', desc: 'Start/end of file', essential: true },
      { keys: '0/$', desc: 'Start/end of line', essential: true },
      { keys: 'Ctrl+f/b', desc: 'Page down/up' },
      { keys: '%', desc: 'Jump to matching bracket' },
      { keys: '{/}', desc: 'Prev/next paragraph' },
      { keys: ':n', desc: 'Go to line n' },
    ]},
    { name: 'Editing', shortcuts: [
      { keys: 'i/a', desc: 'Insert before/after cursor', essential: true },
      { keys: 'o/O', desc: 'New line below/above', essential: true },
      { keys: 'x', desc: 'Delete character' },
      { keys: 'dd', desc: 'Delete line', essential: true },
      { keys: 'yy', desc: 'Yank (copy) line', essential: true },
      { keys: 'p/P', desc: 'Paste after/before', essential: true },
      { keys: 'u', desc: 'Undo', essential: true },
      { keys: 'Ctrl+r', desc: 'Redo' },
      { keys: '.', desc: 'Repeat last command' },
      { keys: 'ciw', desc: 'Change inner word', essential: true },
      { keys: 'di"', desc: 'Delete inside quotes' },
      { keys: 'J', desc: 'Join lines' },
    ]},
    { name: 'Search', shortcuts: [
      { keys: '/pattern', desc: 'Search forward', essential: true },
      { keys: '?pattern', desc: 'Search backward' },
      { keys: 'n/N', desc: 'Next/prev search result' },
      { keys: ':%s/old/new/g', desc: 'Replace all in file', essential: true },
      { keys: '*', desc: 'Search word under cursor' },
    ]},
    { name: 'Selection', shortcuts: [
      { keys: 'v', desc: 'Visual (character) mode', essential: true },
      { keys: 'V', desc: 'Visual line mode', essential: true },
      { keys: 'Ctrl+v', desc: 'Visual block mode' },
    ]},
  ]},
  { name: 'Chrome DevTools', categories: [
    { name: 'General', shortcuts: [
      { keys: 'F12', mac: 'Cmd+Opt+I', desc: 'Open DevTools', essential: true },
      { keys: 'Ctrl+Shift+C', mac: 'Cmd+Shift+C', desc: 'Inspect element', essential: true },
      { keys: 'Ctrl+Shift+J', mac: 'Cmd+Opt+J', desc: 'Open Console' },
      { keys: 'Ctrl+]', mac: 'Cmd+]', desc: 'Next panel' },
      { keys: 'Ctrl+[', mac: 'Cmd+[', desc: 'Previous panel' },
      { keys: 'Ctrl+Shift+M', mac: 'Cmd+Shift+M', desc: 'Toggle device mode' },
    ]},
    { name: 'Console', shortcuts: [
      { keys: 'Ctrl+L', mac: 'Cmd+K', desc: 'Clear console' },
      { keys: 'Tab', desc: 'Autocomplete' },
      { keys: 'Shift+Enter', desc: 'Multi-line entry' },
    ]},
    { name: 'Debug', shortcuts: [
      { keys: 'F8', mac: 'Cmd+\\', desc: 'Pause/resume' },
      { keys: 'F10', mac: 'Cmd+\'', desc: 'Step over' },
      { keys: 'F11', mac: 'Cmd+;', desc: 'Step into' },
      { keys: 'Ctrl+Shift+O', mac: 'Cmd+Shift+O', desc: 'Go to function' },
      { keys: 'Ctrl+B', mac: 'Cmd+B', desc: 'Toggle breakpoint' },
    ]},
  ]},
  { name: 'Terminal (Bash)', categories: [
    { name: 'Navigation', shortcuts: [
      { keys: 'Ctrl+A', desc: 'Move to beginning of line', essential: true },
      { keys: 'Ctrl+E', desc: 'Move to end of line', essential: true },
      { keys: 'Alt+F', desc: 'Move forward one word' },
      { keys: 'Alt+B', desc: 'Move backward one word' },
      { keys: 'Ctrl+R', desc: 'Reverse search history', essential: true },
    ]},
    { name: 'Editing', shortcuts: [
      { keys: 'Ctrl+U', desc: 'Cut to beginning of line', essential: true },
      { keys: 'Ctrl+K', desc: 'Cut to end of line', essential: true },
      { keys: 'Ctrl+W', desc: 'Cut word before cursor' },
      { keys: 'Ctrl+Y', desc: 'Paste (yank) cut text' },
      { keys: 'Ctrl+L', desc: 'Clear screen', essential: true },
      { keys: 'Ctrl+C', desc: 'Cancel current command', essential: true },
      { keys: 'Ctrl+D', desc: 'Exit shell / EOF' },
      { keys: 'Ctrl+Z', desc: 'Suspend process' },
      { keys: '!!', desc: 'Repeat last command', essential: true },
      { keys: '!$', desc: 'Last argument of previous command' },
    ]},
  ]},
  { name: 'macOS', categories: [
    { name: 'System', shortcuts: [
      { keys: 'Cmd+Space', desc: 'Spotlight Search', essential: true },
      { keys: 'Cmd+Tab', desc: 'Switch applications', essential: true },
      { keys: 'Cmd+`', desc: 'Switch windows within app' },
      { keys: 'Cmd+Q', desc: 'Quit application', essential: true },
      { keys: 'Cmd+W', desc: 'Close window', essential: true },
      { keys: 'Cmd+H', desc: 'Hide application' },
      { keys: 'Cmd+,', desc: 'Open preferences' },
      { keys: 'Cmd+Ctrl+Q', desc: 'Lock screen' },
      { keys: 'Cmd+Shift+3', desc: 'Screenshot (full screen)', essential: true },
      { keys: 'Cmd+Shift+4', desc: 'Screenshot (selection)', essential: true },
      { keys: 'Cmd+Shift+5', desc: 'Screenshot/recording options' },
    ]},
    { name: 'Editing', shortcuts: [
      { keys: 'Cmd+C/V/X', desc: 'Copy/paste/cut', essential: true },
      { keys: 'Cmd+Z', desc: 'Undo', essential: true },
      { keys: 'Cmd+Shift+Z', desc: 'Redo' },
      { keys: 'Cmd+A', desc: 'Select all' },
      { keys: 'Cmd+F', desc: 'Find' },
      { keys: 'Opt+Delete', desc: 'Delete word before cursor' },
      { keys: 'Cmd+Delete', desc: 'Delete to beginning of line' },
    ]},
  ]},
  { name: 'Windows', categories: [
    { name: 'System', shortcuts: [
      { keys: 'Win+S', desc: 'Search', essential: true },
      { keys: 'Alt+Tab', desc: 'Switch windows', essential: true },
      { keys: 'Win+D', desc: 'Show/hide desktop', essential: true },
      { keys: 'Win+L', desc: 'Lock workstation', essential: true },
      { keys: 'Win+E', desc: 'Open File Explorer', essential: true },
      { keys: 'Win+I', desc: 'Open Settings' },
      { keys: 'Win+V', desc: 'Clipboard history' },
      { keys: 'Win+Shift+S', desc: 'Screenshot (snip)', essential: true },
      { keys: 'Win+Left/Right', desc: 'Snap window to side' },
      { keys: 'Ctrl+Shift+Esc', desc: 'Task Manager' },
      { keys: 'Alt+F4', desc: 'Close window', essential: true },
    ]},
    { name: 'Editing', shortcuts: [
      { keys: 'Ctrl+C/V/X', desc: 'Copy/paste/cut', essential: true },
      { keys: 'Ctrl+Z', desc: 'Undo', essential: true },
      { keys: 'Ctrl+Y', desc: 'Redo' },
      { keys: 'Ctrl+A', desc: 'Select all' },
      { keys: 'Ctrl+F', desc: 'Find' },
    ]},
  ]},
];

export default function App() {
  const [toolIdx, setToolIdx] = useState(0);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [essentialOnly, setEssentialOnly] = useState(false);
  const [snack, setSnack] = useState('');

  const copy = (t: string) => { navigator.clipboard.writeText(t); setSnack('Copied!'); };
  const tool = TOOLS[toolIdx];

  const allCategories = useMemo(() => {
    const cats = new Set<string>();
    TOOLS.forEach(t => t.categories.forEach(c => cats.add(c.name)));
    return ['All', ...Array.from(cats)];
  }, []);

  const filtered = useMemo(() => {
    let cats = tool.categories;
    if (catFilter !== 'All') cats = cats.filter(c => c.name === catFilter);
    return cats.map(c => ({
      ...c,
      shortcuts: c.shortcuts.filter(s => {
        if (essentialOnly && !s.essential) return false;
        if (!search) return true;
        const q = search.toLowerCase();
        return s.keys.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q) || (s.mac && s.mac.toLowerCase().includes(q));
      }),
    })).filter(c => c.shortcuts.length > 0);
  }, [tool, catFilter, search, essentialOnly]);

  const totalShortcuts = tool.categories.reduce((a, c) => a + c.shortcuts.length, 0);

  const copyAll = () => {
    const lines = filtered.flatMap(c => [
      `## ${c.name}`, ...c.shortcuts.map(s => `${s.keys}${s.mac ? ` (Mac: ${s.mac})` : ''} - ${s.desc}`), '',
    ]);
    copy(`# ${tool.name} Shortcuts\n\n${lines.join('\n')}`);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a', color: 'grey.300', p: 3 }}>
      <Box sx={{ maxWidth: 960, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Link to="/"><IconButton size="small" sx={{ color: 'grey.500' }}><Home /></IconButton></Link>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Keyboard Shortcut Reference</Typography>
        </Box>

        <Tabs value={toolIdx} onChange={(_, v) => { setToolIdx(v); setCatFilter('All'); }} variant="scrollable" scrollButtons="auto"
          sx={{ mb: 2, '& .MuiTab-root': { color: 'grey.500', textTransform: 'none', fontSize: 13, minWidth: 80 }, '& .Mui-selected': { color: '#90caf9' } }}>
          {TOOLS.map(t => <Tab key={t.name} label={t.name} />)}
        </Tabs>

        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField size="small" placeholder="Search shortcuts..." value={search} onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment: <Search sx={{ color: 'grey.500', mr: 1 }} /> }}
            sx={{ flex: 1, minWidth: 200, '& .MuiOutlinedInput-root': { bgcolor: '#111', '& fieldset': { borderColor: '#333' }, '&:hover fieldset': { borderColor: '#555' }, '&.Mui-focused fieldset': { borderColor: '#1976d2' } }, '& .MuiInputBase-input': { color: 'grey.300' } }} />
          <FormControl size="small" sx={{ width: 150, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#333' } }, '& .MuiInputLabel-root': { color: 'grey.500' }, '& .MuiSelect-icon': { color: 'grey.500' } }}>
            <InputLabel sx={{ color: 'grey.500' }}>Category</InputLabel>
            <Select value={catFilter} onChange={e => setCatFilter(e.target.value)} label="Category" sx={{ color: 'grey.300' }}>
              {allCategories.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </Select>
          </FormControl>
          <Chip label={essentialOnly ? 'Essential Only' : 'All Shortcuts'} icon={<Star sx={{ fontSize: 14 }} />} size="small" onClick={() => setEssentialOnly(!essentialOnly)}
            sx={{ bgcolor: essentialOnly ? '#ff980022' : '#222', color: essentialOnly ? '#ff9800' : 'grey.400', border: `1px solid ${essentialOnly ? '#ff9800' : '#333'}`, cursor: 'pointer' }} />
          <Tooltip title="Copy cheatsheet"><IconButton onClick={copyAll} size="small" sx={{ color: 'grey.500' }}><ContentCopy fontSize="small" /></IconButton></Tooltip>
          <Typography variant="caption" sx={{ color: 'grey.500' }}>{totalShortcuts} shortcuts</Typography>
        </Box>

        {filtered.map(cat => (
          <Paper key={cat.name} sx={{ bgcolor: '#111', border: '1px solid #222', mb: 2, overflow: 'hidden' }}>
            <Box sx={{ p: 1.5, borderBottom: '1px solid #222' }}>
              <Typography variant="subtitle2" sx={{ color: 'grey.400' }}>{cat.name}</Typography>
            </Box>
            {cat.shortcuts.map((s, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', p: 1, px: 2, borderBottom: '1px solid #1a1a1a', '&:hover': { bgcolor: '#1a1a1a' } }}>
                {s.essential && <Star sx={{ fontSize: 12, color: '#ff9800', mr: 0.5 }} />}
                <Box sx={{ minWidth: 180, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {s.keys.split('+').length > 1 || s.keys.includes('/') ? (
                    <Chip label={s.keys} size="small" onClick={() => copy(s.keys)}
                      sx={{ bgcolor: '#1a2332', color: '#90caf9', fontFamily: 'monospace', fontSize: 12, fontWeight: 600, cursor: 'pointer', '&:hover': { bgcolor: '#243447' } }} />
                  ) : (
                    <Chip label={s.keys} size="small" onClick={() => copy(s.keys)}
                      sx={{ bgcolor: '#1a2332', color: '#90caf9', fontFamily: 'monospace', fontSize: 12, fontWeight: 600, cursor: 'pointer', '&:hover': { bgcolor: '#243447' } }} />
                  )}
                </Box>
                {s.mac && s.mac !== s.keys && (
                  <Box sx={{ minWidth: 140, display: 'flex', gap: 0.5 }}>
                    <Chip label={s.mac} size="small" onClick={() => copy(s.mac!)}
                      sx={{ bgcolor: '#2a1a32', color: '#ce93d8', fontFamily: 'monospace', fontSize: 11, cursor: 'pointer', '&:hover': { bgcolor: '#3a2442' } }} />
                  </Box>
                )}
                <Typography variant="body2" sx={{ color: 'grey.300', flex: 1, fontSize: 13 }}>{s.desc}</Typography>
                <Tooltip title="Copy"><IconButton size="small" onClick={() => copy(`${s.keys} - ${s.desc}`)} sx={{ color: 'grey.600' }}><ContentCopy sx={{ fontSize: 12 }} /></IconButton></Tooltip>
              </Box>
            ))}
          </Paper>
        ))}
        {filtered.length === 0 && <Typography sx={{ textAlign: 'center', color: 'grey.500', mt: 4 }}>No shortcuts match your search.</Typography>}
      </Box>
      <Snackbar open={!!snack} autoHideDuration={1500} onClose={() => setSnack('')} message={snack} />
    </Box>
  );
}
