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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Home,
  ContentCopy,
  Clear,
  Style,
} from '@mui/icons-material';

const SPACING: Record<string, string> = {
  '0': '0', '0px': '0', '1px': 'px', '0.125rem': '0.5', '2px': '0.5',
  '0.25rem': '1', '4px': '1', '0.375rem': '1.5', '6px': '1.5',
  '0.5rem': '2', '8px': '2', '0.625rem': '2.5', '10px': '2.5',
  '0.75rem': '3', '12px': '3', '0.875rem': '3.5', '14px': '3.5',
  '1rem': '4', '16px': '4', '1.25rem': '5', '20px': '5',
  '1.5rem': '6', '24px': '6', '2rem': '8', '32px': '8',
  '2.5rem': '10', '40px': '10', '3rem': '12', '48px': '12',
  '4rem': '16', '64px': '16', '5rem': '20', '80px': '20',
  '100%': 'full', '100vw': 'screen', '100vh': 'screen',
  'auto': 'auto',
};

const COLORS: Record<string, string> = {
  'white': 'white', 'black': 'black', 'transparent': 'transparent',
  'red': 'red-500', 'blue': 'blue-500', 'green': 'green-500',
  'yellow': 'yellow-500', 'gray': 'gray-500', 'grey': 'gray-500',
  '#000': 'black', '#fff': 'white', '#000000': 'black', '#ffffff': 'white',
};

function findSpacing(val: string): string {
  return SPACING[val.trim()] || `[${val.trim()}]`;
}

function findColor(val: string): string {
  const v = val.trim().toLowerCase();
  return COLORS[v] || `[${val.trim()}]`;
}

interface Mapping { css: string; tailwind: string }

function convertProperty(prop: string, value: string): Mapping | null {
  const p = prop.trim().toLowerCase();
  const v = value.trim().replace(/;$/, '').trim();

  const map: Record<string, () => string> = {
    display: () => ({ flex: 'flex', grid: 'grid', block: 'block', 'inline-block': 'inline-block', inline: 'inline', 'inline-flex': 'inline-flex', none: 'hidden', contents: 'contents' }[v] || ''),
    position: () => ({ relative: 'relative', absolute: 'absolute', fixed: 'fixed', sticky: 'sticky', static: 'static' }[v] || ''),
    'flex-direction': () => ({ row: 'flex-row', column: 'flex-col', 'row-reverse': 'flex-row-reverse', 'column-reverse': 'flex-col-reverse' }[v] || ''),
    'justify-content': () => ({ 'flex-start': 'justify-start', 'flex-end': 'justify-end', center: 'justify-center', 'space-between': 'justify-between', 'space-around': 'justify-around', 'space-evenly': 'justify-evenly' }[v] || ''),
    'align-items': () => ({ 'flex-start': 'items-start', 'flex-end': 'items-end', center: 'items-center', baseline: 'items-baseline', stretch: 'items-stretch' }[v] || ''),
    'text-align': () => ({ left: 'text-left', center: 'text-center', right: 'text-right', justify: 'text-justify' }[v] || ''),
    'font-weight': () => {
      const w: Record<string, string> = { '100': 'font-thin', '200': 'font-extralight', '300': 'font-light', '400': 'font-normal', normal: 'font-normal', '500': 'font-medium', '600': 'font-semibold', '700': 'font-bold', bold: 'font-bold', '800': 'font-extrabold', '900': 'font-black' };
      return w[v] || '';
    },
    'font-size': () => {
      const s: Record<string, string> = { '12px': 'text-xs', '0.75rem': 'text-xs', '14px': 'text-sm', '0.875rem': 'text-sm', '16px': 'text-base', '1rem': 'text-base', '18px': 'text-lg', '1.125rem': 'text-lg', '20px': 'text-xl', '1.25rem': 'text-xl', '24px': 'text-2xl', '1.5rem': 'text-2xl', '30px': 'text-3xl', '36px': 'text-4xl', '48px': 'text-5xl' };
      return s[v] || `text-[${v}]`;
    },
    overflow: () => ({ hidden: 'overflow-hidden', auto: 'overflow-auto', scroll: 'overflow-scroll', visible: 'overflow-visible' }[v] || ''),
    cursor: () => ({ pointer: 'cursor-pointer', default: 'cursor-default', 'not-allowed': 'cursor-not-allowed', wait: 'cursor-wait', text: 'cursor-text', move: 'cursor-move', grab: 'cursor-grab' }[v] || ''),
    opacity: () => `opacity-${Math.round(parseFloat(v) * 100)}`,
    'border-radius': () => {
      const r: Record<string, string> = { '0': 'rounded-none', '0px': 'rounded-none', '2px': 'rounded-sm', '0.125rem': 'rounded-sm', '4px': 'rounded', '0.25rem': 'rounded', '6px': 'rounded-md', '0.375rem': 'rounded-md', '8px': 'rounded-lg', '0.5rem': 'rounded-lg', '12px': 'rounded-xl', '16px': 'rounded-2xl', '9999px': 'rounded-full', '50%': 'rounded-full' };
      return r[v] || `rounded-[${v}]`;
    },
    'box-shadow': () => v === 'none' ? 'shadow-none' : 'shadow',
    'line-height': () => {
      const lh: Record<string, string> = { '1': 'leading-none', '1.25': 'leading-tight', '1.375': 'leading-snug', '1.5': 'leading-normal', '1.625': 'leading-relaxed', '2': 'leading-loose' };
      return lh[v] || `leading-[${v}]`;
    },
    'flex-wrap': () => ({ wrap: 'flex-wrap', nowrap: 'flex-nowrap', 'wrap-reverse': 'flex-wrap-reverse' }[v] || ''),
    'flex-grow': () => v === '1' ? 'grow' : v === '0' ? 'grow-0' : '',
    'flex-shrink': () => v === '1' ? 'shrink' : v === '0' ? 'shrink-0' : '',
    'white-space': () => ({ nowrap: 'whitespace-nowrap', pre: 'whitespace-pre', 'pre-line': 'whitespace-pre-line', 'pre-wrap': 'whitespace-pre-wrap', normal: 'whitespace-normal' }[v] || ''),
    'text-decoration': () => ({ underline: 'underline', 'line-through': 'line-through', none: 'no-underline' }[v] || ''),
    'text-transform': () => ({ uppercase: 'uppercase', lowercase: 'lowercase', capitalize: 'capitalize', none: 'normal-case' }[v] || ''),
    'object-fit': () => ({ cover: 'object-cover', contain: 'object-contain', fill: 'object-fill', none: 'object-none', 'scale-down': 'object-scale-down' }[v] || ''),
  };

  if (map[p]) {
    const tw = map[p]();
    return tw ? { css: `${p}: ${v}`, tailwind: tw } : null;
  }

  // Directional properties
  const dirPrefix: Record<string, string> = { padding: 'p', 'padding-top': 'pt', 'padding-right': 'pr', 'padding-bottom': 'pb', 'padding-left': 'pl', 'padding-inline': 'px', 'padding-block': 'py', margin: 'm', 'margin-top': 'mt', 'margin-right': 'mr', 'margin-bottom': 'mb', 'margin-left': 'ml', 'margin-inline': 'mx', 'margin-block': 'my', gap: 'gap', 'row-gap': 'gap-y', 'column-gap': 'gap-x', top: 'top', right: 'right', bottom: 'bottom', left: 'left', width: 'w', height: 'h', 'min-width': 'min-w', 'min-height': 'min-h', 'max-width': 'max-w', 'max-height': 'max-h' };

  if (dirPrefix[p]) {
    return { css: `${p}: ${v}`, tailwind: `${dirPrefix[p]}-${findSpacing(v)}` };
  }

  if (p === 'color') return { css: `${p}: ${v}`, tailwind: `text-${findColor(v)}` };
  if (p === 'background-color' || p === 'background' && !v.includes('url') && !v.includes('gradient')) return { css: `${p}: ${v}`, tailwind: `bg-${findColor(v)}` };
  if (p === 'border-color') return { css: `${p}: ${v}`, tailwind: `border-${findColor(v)}` };
  if (p === 'border') {
    if (v === 'none') return { css: `${p}: ${v}`, tailwind: 'border-0' };
    return { css: `${p}: ${v}`, tailwind: `border border-[${v}]` };
  }
  if (p === 'border-width') return { css: `${p}: ${v}`, tailwind: v === '1px' ? 'border' : `border-[${v}]` };
  if (p === 'z-index') return { css: `${p}: ${v}`, tailwind: `z-${v}` };

  return null;
}

function parseCSS(css: string): Mapping[] {
  const mappings: Mapping[] = [];
  const declarations = css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/[{}]/g, '\n').split('\n');

  for (const line of declarations) {
    const trimmed = line.trim();
    if (!trimmed || !trimmed.includes(':')) continue;
    const colonIdx = trimmed.indexOf(':');
    const prop = trimmed.slice(0, colonIdx).trim();
    const value = trimmed.slice(colonIdx + 1).replace(/;$/, '').trim();
    if (!prop || !value || prop.startsWith('.') || prop.startsWith('#') || prop.startsWith('@')) continue;
    const m = convertProperty(prop, value);
    if (m) mappings.push(m);
  }
  return mappings;
}

const SAMPLE_CSS = `.card {
  display: flex;
  flex-direction: column;
  padding: 16px;
  margin: 8px;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12);
  cursor: pointer;
  overflow: hidden;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  opacity: 0.9;
  gap: 12px;
  width: 100%;
  max-width: 320px;
  position: relative;
}`;

export default function CssToTailwind() {
  const [input, setInput] = useState('');
  const [asClassName, setAsClassName] = useState(true);
  const [snackOpen, setSnackOpen] = useState(false);

  const mappings = useMemo(() => parseCSS(input), [input]);
  const classes = mappings.map(m => m.tailwind);
  const classString = asClassName ? `className="${classes.join(' ')}"` : classes.join(' ');

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setSnackOpen(true);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a', color: 'grey.300', p: 3 }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <Link to="/"><IconButton size="small" sx={{ color: 'grey.500' }}><Home /></IconButton></Link>
          <Style sx={{ color: '#8b5cf6' }} />
          <Typography variant="h5" fontWeight={700}>CSS to Tailwind Converter</Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          <Box>
            <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" color="grey.400">CSS Input</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button size="small" variant="outlined" sx={{ borderColor: '#333', color: 'grey.400', textTransform: 'none' }} onClick={() => setInput(SAMPLE_CSS)}>Sample</Button>
                  <Tooltip title="Clear"><IconButton size="small" sx={{ color: 'grey.500' }} onClick={() => setInput('')}><Clear /></IconButton></Tooltip>
                </Box>
              </Box>
              <TextField
                multiline rows={14} fullWidth value={input} onChange={e => setInput(e.target.value)}
                placeholder="Paste CSS here..."
                sx={{ '& .MuiInputBase-root': { bgcolor: '#0d0d0d', fontFamily: 'monospace', fontSize: 13, color: 'grey.300' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#222' } }}
              />
            </Paper>
          </Box>

          <Box>
            <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" color="grey.400">Tailwind Output</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FormControlLabel
                    control={<Switch checked={asClassName} onChange={e => setAsClassName(e.target.checked)} size="small" sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#8b5cf6' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#8b5cf6' } }} />}
                    label={<Typography variant="body2" color="grey.500" fontSize={11}>className</Typography>}
                  />
                  <Tooltip title="Copy"><IconButton size="small" sx={{ color: 'grey.500' }} onClick={() => copy(classString)}><ContentCopy /></IconButton></Tooltip>
                </Box>
              </Box>

              {classes.length > 0 && (
                <Box sx={{ bgcolor: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 1, p: 2, mb: 2, fontFamily: 'monospace', fontSize: 13, color: '#a5f3fc', wordBreak: 'break-word' }}>
                  {classString}
                </Box>
              )}

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                {classes.map((c, i) => (
                  <Chip key={i} label={c} size="small" onClick={() => copy(c)}
                    sx={{ bgcolor: '#8b5cf615', color: '#c4b5fd', fontSize: 11, cursor: 'pointer', '&:hover': { bgcolor: '#8b5cf625' } }} />
                ))}
              </Box>
            </Paper>

            {mappings.length > 0 && (
              <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mt: 2 }}>
                <Typography variant="subtitle2" color="grey.400" mb={1}>Mapping Table</Typography>
                <TableContainer sx={{ maxHeight: 300 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: 'grey.500', borderColor: '#222', fontSize: 11 }}>CSS</TableCell>
                        <TableCell sx={{ color: 'grey.500', borderColor: '#222', fontSize: 11 }}>Tailwind</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {mappings.map((m, i) => (
                        <TableRow key={i}>
                          <TableCell sx={{ color: 'grey.400', borderColor: '#222', fontFamily: 'monospace', fontSize: 12 }}>{m.css}</TableCell>
                          <TableCell sx={{ color: '#c4b5fd', borderColor: '#222', fontFamily: 'monospace', fontSize: 12 }}>{m.tailwind}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            )}
          </Box>
        </Box>
      </Box>
      <Snackbar open={snackOpen} autoHideDuration={2000} onClose={() => setSnackOpen(false)} message="Copied to clipboard" />
    </Box>
  );
}
