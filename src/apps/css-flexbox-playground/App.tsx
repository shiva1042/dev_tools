import { useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Chip,
  Slider,
} from '@mui/material';
import { ContentCopy, Home, Add, Delete } from '@mui/icons-material';
import { Link } from 'react-router-dom';

interface FlexChild {
  id: number;
  order: number;
  flexGrow: number;
  flexShrink: number;
  flexBasis: string;
  alignSelf: string;
  color: string;
}

const COLORS = ['#e06c75', '#61afef', '#98c379', '#e5c07b', '#c678dd', '#56b6c2', '#d19a66', '#be5046'];
const DIRECTIONS = ['row', 'row-reverse', 'column', 'column-reverse'];
const WRAPS = ['nowrap', 'wrap', 'wrap-reverse'];
const JUSTIFY = ['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly'];
const ALIGN_ITEMS = ['stretch', 'flex-start', 'flex-end', 'center', 'baseline'];
const ALIGN_CONTENT = ['stretch', 'flex-start', 'flex-end', 'center', 'space-between', 'space-around'];
const ALIGN_SELF_OPTS = ['auto', 'flex-start', 'flex-end', 'center', 'baseline', 'stretch'];

const DESCRIPTIONS: Record<string, string> = {
  'flex-direction': 'Defines the main axis direction. row = left-to-right, column = top-to-bottom.',
  'flex-wrap': 'Controls whether items wrap to new lines when they overflow.',
  'justify-content': 'Aligns items along the main axis (horizontal for row, vertical for column).',
  'align-items': 'Aligns items along the cross axis (vertical for row, horizontal for column).',
  'align-content': 'Aligns wrapped lines within the container. Only works with flex-wrap: wrap.',
  gap: 'Sets the gap between flex items (shorthand for row-gap and column-gap).',
  order: 'Controls the order of the item. Lower values appear first.',
  'flex-grow': 'Defines how much an item should grow relative to siblings. 0 = no growth.',
  'flex-shrink': 'Defines how much an item should shrink relative to siblings. 0 = no shrink.',
  'flex-basis': 'Sets the initial size before growing/shrinking. Can be px, %, or auto.',
  'align-self': 'Overrides the container align-items value for this specific item.',
};

export default function CSSFlexboxPlayground() {
  const [direction, setDirection] = useState('row');
  const [wrap, setWrap] = useState('nowrap');
  const [justify, setJustify] = useState('flex-start');
  const [alignItems, setAlignItems] = useState('stretch');
  const [alignContent, setAlignContent] = useState('stretch');
  const [gap, setGap] = useState(8);
  const [children, setChildren] = useState<FlexChild[]>([
    { id: 1, order: 0, flexGrow: 0, flexShrink: 1, flexBasis: 'auto', alignSelf: 'auto', color: COLORS[0] },
    { id: 2, order: 0, flexGrow: 0, flexShrink: 1, flexBasis: 'auto', alignSelf: 'auto', color: COLORS[1] },
    { id: 3, order: 0, flexGrow: 0, flexShrink: 1, flexBasis: 'auto', alignSelf: 'auto', color: COLORS[2] },
  ]);
  const [selectedChild, setSelectedChild] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [hoveredProp, setHoveredProp] = useState('');

  const addChild = () => {
    const id = children.length > 0 ? Math.max(...children.map((c) => c.id)) + 1 : 1;
    setChildren([...children, {
      id, order: 0, flexGrow: 0, flexShrink: 1, flexBasis: 'auto',
      alignSelf: 'auto', color: COLORS[(id - 1) % COLORS.length],
    }]);
  };

  const removeChild = (id: number) => {
    setChildren(children.filter((c) => c.id !== id));
    if (selectedChild === id) setSelectedChild(null);
  };

  const updateChild = (id: number, field: keyof FlexChild, value: string | number) => {
    setChildren(children.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const generateCSS = useCallback(() => {
    let css = `.container {\n  display: flex;\n  flex-direction: ${direction};\n  flex-wrap: ${wrap};\n  justify-content: ${justify};\n  align-items: ${alignItems};\n  align-content: ${alignContent};\n  gap: ${gap}px;\n}\n`;
    children.forEach((child, i) => {
      const props: string[] = [];
      if (child.order !== 0) props.push(`  order: ${child.order};`);
      if (child.flexGrow !== 0) props.push(`  flex-grow: ${child.flexGrow};`);
      if (child.flexShrink !== 1) props.push(`  flex-shrink: ${child.flexShrink};`);
      if (child.flexBasis !== 'auto') props.push(`  flex-basis: ${child.flexBasis};`);
      if (child.alignSelf !== 'auto') props.push(`  align-self: ${child.alignSelf};`);
      if (props.length > 0) css += `\n.item-${i + 1} {\n${props.join('\n')}\n}\n`;
    });
    return css;
  }, [direction, wrap, justify, alignItems, alignContent, gap, children]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generateCSS());
    setSnackbar({ open: true, message: 'CSS copied to clipboard' });
  };

  const sel = selectedChild !== null ? children.find((c) => c.id === selectedChild) : null;

  const PropSelect = ({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) => (
    <FormControl size="small" fullWidth sx={{ mb: 1 }} onMouseEnter={() => setHoveredProp(label)} onMouseLeave={() => setHoveredProp('')}>
      <InputLabel sx={{ color: 'grey.500' }}>{label}</InputLabel>
      <Select value={value} label={label} onChange={(e) => onChange(e.target.value as string)}
        sx={{ color: 'grey.300', '.MuiOutlinedInput-notchedOutline': { borderColor: '#333' } }}>
        {options.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
      </Select>
    </FormControl>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a' }}>
      <Paper elevation={0} sx={{ bgcolor: '#111', borderBottom: '1px solid #222', px: 3, py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Link to="/"><IconButton size="small" sx={{ color: 'grey.500' }}><Home /></IconButton></Link>
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>CSS Flexbox Playground</Typography>
          </Box>
          <Button startIcon={<ContentCopy />} onClick={handleCopy} sx={{ color: 'grey.400' }}>Copy CSS</Button>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', gap: 2, p: 2, height: 'calc(100vh - 80px)' }}>
        {/* Container Properties */}
        <Paper sx={{ width: 260, bgcolor: '#111', border: '1px solid #222', p: 2, overflowY: 'auto', flexShrink: 0 }}>
          <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 2 }}>Container Properties</Typography>
          <PropSelect label="flex-direction" value={direction} options={DIRECTIONS} onChange={setDirection} />
          <PropSelect label="flex-wrap" value={wrap} options={WRAPS} onChange={setWrap} />
          <PropSelect label="justify-content" value={justify} options={JUSTIFY} onChange={setJustify} />
          <PropSelect label="align-items" value={alignItems} options={ALIGN_ITEMS} onChange={setAlignItems} />
          <PropSelect label="align-content" value={alignContent} options={ALIGN_CONTENT} onChange={setAlignContent} />
          <Typography variant="caption" sx={{ color: 'grey.500', mt: 1 }}>gap: {gap}px</Typography>
          <Slider value={gap} min={0} max={40} onChange={(_, v) => setGap(v as number)} sx={{ color: '#61afef' }}
            onMouseEnter={() => setHoveredProp('gap')} onMouseLeave={() => setHoveredProp('')} />

          <Box sx={{ mt: 2, mb: 1 }}>
            <Typography variant="subtitle2" sx={{ color: 'grey.400' }}>Items ({children.length})</Typography>
          </Box>
          <Button size="small" startIcon={<Add />} onClick={addChild} sx={{ color: 'grey.400', mb: 1 }}>Add Item</Button>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {children.map((c) => (
              <Chip key={c.id} label={c.id} size="small"
                onClick={() => setSelectedChild(selectedChild === c.id ? null : c.id)}
                onDelete={() => removeChild(c.id)}
                sx={{ bgcolor: selectedChild === c.id ? c.color : '#222', color: 'white', '& .MuiChip-deleteIcon': { color: 'grey.500' } }} />
            ))}
          </Box>

          {sel && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ color: sel.color, mb: 1 }}>Item {sel.id} Properties</Typography>
              <TextField size="small" fullWidth label="order" type="number" value={sel.order}
                onChange={(e) => updateChild(sel.id, 'order', Number(e.target.value))}
                onMouseEnter={() => setHoveredProp('order')} onMouseLeave={() => setHoveredProp('')}
                sx={{ mb: 1, '& .MuiInputBase-root': { color: 'grey.300' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' } }} />
              <TextField size="small" fullWidth label="flex-grow" type="number" value={sel.flexGrow}
                onChange={(e) => updateChild(sel.id, 'flexGrow', Number(e.target.value))}
                onMouseEnter={() => setHoveredProp('flex-grow')} onMouseLeave={() => setHoveredProp('')}
                inputProps={{ min: 0 }}
                sx={{ mb: 1, '& .MuiInputBase-root': { color: 'grey.300' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' } }} />
              <TextField size="small" fullWidth label="flex-shrink" type="number" value={sel.flexShrink}
                onChange={(e) => updateChild(sel.id, 'flexShrink', Number(e.target.value))}
                onMouseEnter={() => setHoveredProp('flex-shrink')} onMouseLeave={() => setHoveredProp('')}
                inputProps={{ min: 0 }}
                sx={{ mb: 1, '& .MuiInputBase-root': { color: 'grey.300' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' } }} />
              <TextField size="small" fullWidth label="flex-basis" value={sel.flexBasis}
                onChange={(e) => updateChild(sel.id, 'flexBasis', e.target.value)}
                onMouseEnter={() => setHoveredProp('flex-basis')} onMouseLeave={() => setHoveredProp('')}
                sx={{ mb: 1, '& .MuiInputBase-root': { color: 'grey.300' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' } }} />
              <PropSelect label="align-self" value={sel.alignSelf} options={ALIGN_SELF_OPTS}
                onChange={(v) => updateChild(sel.id, 'alignSelf', v)} />
            </Box>
          )}

          {hoveredProp && DESCRIPTIONS[hoveredProp] && (
            <Paper sx={{ mt: 2, p: 1.5, bgcolor: '#1a1a2e', border: '1px solid #333' }}>
              <Typography variant="caption" sx={{ color: '#61afef', fontWeight: 600 }}>{hoveredProp}</Typography>
              <Typography variant="caption" sx={{ color: 'grey.400', display: 'block', mt: 0.5 }}>
                {DESCRIPTIONS[hoveredProp]}
              </Typography>
            </Paper>
          )}
        </Paper>

        {/* Preview + Code */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
          {/* Live Preview */}
          <Paper sx={{ flex: 1, bgcolor: '#111', border: '1px solid #222', p: 2, overflow: 'auto' }}>
            <Typography variant="subtitle2" sx={{ color: 'grey.500', mb: 1 }}>Live Preview</Typography>
            <Box sx={{
              display: 'flex',
              flexDirection: direction,
              flexWrap: wrap,
              justifyContent: justify,
              alignItems: alignItems,
              alignContent: alignContent,
              gap: `${gap}px`,
              minHeight: 300,
              border: '2px dashed #333',
              borderRadius: 1,
              p: 1,
            }}>
              {children.map((child) => (
                <Box key={child.id}
                  onClick={() => setSelectedChild(selectedChild === child.id ? null : child.id)}
                  sx={{
                    order: child.order,
                    flexGrow: child.flexGrow,
                    flexShrink: child.flexShrink,
                    flexBasis: child.flexBasis,
                    alignSelf: child.alignSelf === 'auto' ? undefined : child.alignSelf,
                    bgcolor: child.color,
                    minWidth: 60, minHeight: 60,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: 1,
                    cursor: 'pointer',
                    border: selectedChild === child.id ? '3px solid white' : '3px solid transparent',
                    transition: 'border-color 0.2s',
                    '&:hover': { opacity: 0.85 },
                  }}>
                  <Typography sx={{ color: 'white', fontWeight: 700, fontSize: 18 }}>{child.id}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>

          {/* Generated CSS */}
          <Paper sx={{ height: 200, bgcolor: '#111', border: '1px solid #222', p: 2, overflow: 'auto', flexShrink: 0 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle2" sx={{ color: 'grey.500' }}>Generated CSS</Typography>
              <Tooltip title="Copy CSS">
                <IconButton size="small" onClick={handleCopy} sx={{ color: 'grey.500' }}><ContentCopy fontSize="small" /></IconButton>
              </Tooltip>
            </Box>
            <Typography component="pre" sx={{ fontFamily: 'monospace', fontSize: 12, color: '#98c379', whiteSpace: 'pre-wrap', m: 0 }}>
              {generateCSS()}
            </Typography>
          </Paper>
        </Box>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={2000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} />
    </Box>
  );
}
