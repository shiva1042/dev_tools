import { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Tooltip,
  Button,
  Slider,
  Chip,
  Tabs,
  Tab,
  Snackbar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  ContentCopy,
  Home,
  Refresh,
  Add,
  Delete,
  Palette,
  Download,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

interface Color {
  id: string;
  hex: string;
  name: string;
  locked: boolean;
}

type HarmonyType = 'complementary' | 'analogous' | 'triadic' | 'tetradic' | 'split-complementary' | 'monochromatic';
type ExportFormat = 'css' | 'scss' | 'tailwind' | 'json';

const hexToHsl = (hex: string): { h: number; s: number; l: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { h: 0, s: 0, l: 0 };

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
};

const hslToHex = (h: number, s: number, l: number): string => {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }

  const toHex = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : { r: 0, g: 0, b: 0 };
};

const getContrastColor = (hex: string): string => {
  const { r, g, b } = hexToRgb(hex);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
};

const generateRandomColor = (): string => {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
};

const generateHarmony = (baseHex: string, type: HarmonyType): string[] => {
  const { h, s, l } = hexToHsl(baseHex);
  const colors: string[] = [baseHex];

  switch (type) {
    case 'complementary':
      colors.push(hslToHex(h + 180, s, l));
      break;
    case 'analogous':
      colors.push(hslToHex(h - 30, s, l));
      colors.push(hslToHex(h + 30, s, l));
      break;
    case 'triadic':
      colors.push(hslToHex(h + 120, s, l));
      colors.push(hslToHex(h + 240, s, l));
      break;
    case 'tetradic':
      colors.push(hslToHex(h + 90, s, l));
      colors.push(hslToHex(h + 180, s, l));
      colors.push(hslToHex(h + 270, s, l));
      break;
    case 'split-complementary':
      colors.push(hslToHex(h + 150, s, l));
      colors.push(hslToHex(h + 210, s, l));
      break;
    case 'monochromatic':
      colors.push(hslToHex(h, s, Math.max(0, l - 20)));
      colors.push(hslToHex(h, s, Math.min(100, l + 20)));
      colors.push(hslToHex(h, Math.max(0, s - 20), l));
      break;
  }

  return colors;
};

const generateShades = (hex: string, count: number = 9): string[] => {
  const { h, s } = hexToHsl(hex);
  const shades: string[] = [];
  for (let i = 0; i < count; i++) {
    const l = Math.round(95 - (i * (90 / (count - 1))));
    shades.push(hslToHex(h, s, l));
  }
  return shades;
};

export default function ColorPalette() {
  const [colors, setColors] = useState<Color[]>([
    { id: '1', hex: '#3b82f6', name: 'primary', locked: false },
    { id: '2', hex: '#10b981', name: 'secondary', locked: false },
    { id: '3', hex: '#f59e0b', name: 'accent', locked: false },
    { id: '4', hex: '#ef4444', name: 'error', locked: false },
    { id: '5', hex: '#8b5cf6', name: 'info', locked: false },
  ]);
  const [selectedColor, setSelectedColor] = useState<string>('1');
  const [harmonyType, setHarmonyType] = useState<HarmonyType>('complementary');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('css');
  const [tab, setTab] = useState<'palette' | 'harmony' | 'shades'>('palette');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({ open: false, message: '' });

  const selected = colors.find(c => c.id === selectedColor);

  const harmonyColors = useMemo(() => {
    if (!selected) return [];
    return generateHarmony(selected.hex, harmonyType);
  }, [selected, harmonyType]);

  const shades = useMemo(() => {
    if (!selected) return [];
    return generateShades(selected.hex);
  }, [selected]);

  const handleColorChange = (id: string, hex: string) => {
    setColors(colors.map(c => c.id === id ? { ...c, hex } : c));
  };

  const handleNameChange = (id: string, name: string) => {
    setColors(colors.map(c => c.id === id ? { ...c, name } : c));
  };

  const handleAddColor = () => {
    const newId = String(Date.now());
    setColors([...colors, { id: newId, hex: generateRandomColor(), name: `color${colors.length + 1}`, locked: false }]);
    setSelectedColor(newId);
  };

  const handleDeleteColor = (id: string) => {
    if (colors.length <= 1) return;
    setColors(colors.filter(c => c.id !== id));
    if (selectedColor === id) {
      setSelectedColor(colors[0].id);
    }
  };

  const handleRandomize = () => {
    setColors(colors.map(c => c.locked ? c : { ...c, hex: generateRandomColor() }));
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setSnackbar({ open: true, message: 'Copied to clipboard' });
  };

  const generateExport = (): string => {
    switch (exportFormat) {
      case 'css':
        return `:root {\n${colors.map(c => `  --${c.name}: ${c.hex};`).join('\n')}\n}`;
      case 'scss':
        return colors.map(c => `$${c.name}: ${c.hex};`).join('\n');
      case 'tailwind':
        return `module.exports = {\n  theme: {\n    extend: {\n      colors: {\n${colors.map(c => `        '${c.name}': '${c.hex}',`).join('\n')}\n      }\n    }\n  }\n}`;
      case 'json':
        return JSON.stringify(Object.fromEntries(colors.map(c => [c.name, c.hex])), null, 2);
      default:
        return '';
    }
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
              Color Palette Generator
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              startIcon={<Refresh />}
              onClick={handleRandomize}
              sx={{ color: 'grey.400' }}
            >
              Randomize
            </Button>
            <Button
              startIcon={<Add />}
              onClick={handleAddColor}
              sx={{ color: 'grey.400' }}
            >
              Add Color
            </Button>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', height: 'calc(100vh - 70px)' }}>
        {/* Main Palette */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Color Strips */}
          <Box sx={{ display: 'flex', height: 150 }}>
            {colors.map((color) => (
              <Box
                key={color.id}
                onClick={() => setSelectedColor(color.id)}
                sx={{
                  flex: 1,
                  bgcolor: color.hex,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  p: 2,
                  position: 'relative',
                  border: selectedColor === color.id ? '3px solid white' : 'none',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    zIndex: 1,
                  },
                }}
              >
                <Typography sx={{ color: getContrastColor(color.hex), fontWeight: 600, fontSize: 14 }}>
                  {color.name}
                </Typography>
                <Typography sx={{ color: getContrastColor(color.hex), fontFamily: 'monospace', fontSize: 12, opacity: 0.8 }}>
                  {color.hex.toUpperCase()}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Tabs */}
          <Paper sx={{ bgcolor: '#111', borderBottom: '1px solid #222' }}>
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              sx={{ '& .MuiTab-root': { color: 'grey.500' } }}
            >
              <Tab icon={<Palette sx={{ fontSize: 18 }} />} iconPosition="start" label="Palette" value="palette" />
              <Tab label="Harmony" value="harmony" />
              <Tab label="Shades" value="shades" />
            </Tabs>
          </Paper>

          {/* Tab Content */}
          <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
            {tab === 'palette' && selected && (
              <Box sx={{ display: 'flex', gap: 3 }}>
                {/* Color Editor */}
                <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 3, width: 300 }}>
                  <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 2 }}>
                    Edit Color
                  </Typography>

                  <Box
                    sx={{
                      width: '100%',
                      height: 100,
                      bgcolor: selected.hex,
                      borderRadius: 1,
                      mb: 2,
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Name"
                    value={selected.name}
                    onChange={(e) => handleNameChange(selected.id, e.target.value)}
                    size="small"
                    sx={{ mb: 2, '& .MuiInputBase-root': { color: 'grey.300' } }}
                  />

                  <TextField
                    fullWidth
                    label="Hex"
                    value={selected.hex}
                    onChange={(e) => handleColorChange(selected.id, e.target.value)}
                    size="small"
                    sx={{ mb: 2, '& .MuiInputBase-root': { color: 'grey.300', fontFamily: 'monospace' } }}
                  />

                  <input
                    type="color"
                    value={selected.hex}
                    onChange={(e) => handleColorChange(selected.id, e.target.value)}
                    style={{ width: '100%', height: 40, cursor: 'pointer', border: 'none', borderRadius: 4 }}
                  />

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" sx={{ color: 'grey.600' }}>HSL</Typography>
                    <Typography sx={{ fontFamily: 'monospace', color: 'grey.400', fontSize: 13 }}>
                      {(() => {
                        const { h, s, l } = hexToHsl(selected.hex);
                        return `hsl(${h}, ${s}%, ${l}%)`;
                      })()}
                    </Typography>
                  </Box>

                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" sx={{ color: 'grey.600' }}>RGB</Typography>
                    <Typography sx={{ fontFamily: 'monospace', color: 'grey.400', fontSize: 13 }}>
                      {(() => {
                        const { r, g, b } = hexToRgb(selected.hex);
                        return `rgb(${r}, ${g}, ${b})`;
                      })()}
                    </Typography>
                  </Box>

                  {colors.length > 1 && (
                    <Button
                      fullWidth
                      color="error"
                      startIcon={<Delete />}
                      onClick={() => handleDeleteColor(selected.id)}
                      sx={{ mt: 2 }}
                    >
                      Delete Color
                    </Button>
                  )}
                </Paper>

                {/* Quick Actions */}
                <Box sx={{ flex: 1 }}>
                  <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 2 }}>
                      Color Values
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {[
                        { label: 'HEX', value: selected.hex.toUpperCase() },
                        { label: 'RGB', value: `rgb(${hexToRgb(selected.hex).r}, ${hexToRgb(selected.hex).g}, ${hexToRgb(selected.hex).b})` },
                        { label: 'HSL', value: `hsl(${hexToHsl(selected.hex).h}, ${hexToHsl(selected.hex).s}%, ${hexToHsl(selected.hex).l}%)` },
                      ].map(({ label, value }) => (
                        <Chip
                          key={label}
                          label={`${label}: ${value}`}
                          onClick={() => handleCopy(value)}
                          sx={{ cursor: 'pointer', fontFamily: 'monospace' }}
                        />
                      ))}
                    </Box>
                  </Paper>
                </Box>
              </Box>
            )}

            {tab === 'harmony' && (
              <Box>
                <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 2 }}>
                  <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel sx={{ color: 'grey.500' }}>Harmony Type</InputLabel>
                    <Select
                      value={harmonyType}
                      label="Harmony Type"
                      onChange={(e) => setHarmonyType(e.target.value as HarmonyType)}
                      sx={{ color: 'grey.300' }}
                    >
                      <MenuItem value="complementary">Complementary</MenuItem>
                      <MenuItem value="analogous">Analogous</MenuItem>
                      <MenuItem value="triadic">Triadic</MenuItem>
                      <MenuItem value="tetradic">Tetradic</MenuItem>
                      <MenuItem value="split-complementary">Split Complementary</MenuItem>
                      <MenuItem value="monochromatic">Monochromatic</MenuItem>
                    </Select>
                  </FormControl>
                </Paper>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  {harmonyColors.map((hex, i) => (
                    <Paper
                      key={i}
                      sx={{ flex: 1, bgcolor: '#111', border: '1px solid #222', overflow: 'hidden', cursor: 'pointer' }}
                      onClick={() => handleCopy(hex)}
                    >
                      <Box sx={{ height: 100, bgcolor: hex }} />
                      <Box sx={{ p: 2 }}>
                        <Typography sx={{ fontFamily: 'monospace', color: 'grey.400', fontSize: 14 }}>
                          {hex.toUpperCase()}
                        </Typography>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              </Box>
            )}

            {tab === 'shades' && (
              <Box>
                <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 2 }}>
                  Shades of {selected?.name}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {shades.map((hex, i) => (
                    <Paper
                      key={i}
                      sx={{ flex: 1, bgcolor: '#111', border: '1px solid #222', overflow: 'hidden', cursor: 'pointer' }}
                      onClick={() => handleCopy(hex)}
                    >
                      <Box sx={{ height: 80, bgcolor: hex }} />
                      <Box sx={{ p: 1, textAlign: 'center' }}>
                        <Typography sx={{ fontFamily: 'monospace', color: 'grey.500', fontSize: 10 }}>
                          {(i + 1) * 100}
                        </Typography>
                        <Typography sx={{ fontFamily: 'monospace', color: 'grey.400', fontSize: 11 }}>
                          {hex.toUpperCase()}
                        </Typography>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </Box>

        {/* Export Panel */}
        <Box sx={{ width: 350, borderLeft: '1px solid #222', p: 2, overflow: 'auto' }}>
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderBottom: '1px solid #222' }}>
              <Typography variant="subtitle2" sx={{ color: 'grey.400' }}>
                Export
              </Typography>
              <Tooltip title="Copy">
                <IconButton size="small" onClick={() => handleCopy(generateExport())} sx={{ color: 'grey.500' }}>
                  <ContentCopy fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Box sx={{ p: 2 }}>
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel sx={{ color: 'grey.500' }}>Format</InputLabel>
                <Select
                  value={exportFormat}
                  label="Format"
                  onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
                  sx={{ color: 'grey.300' }}
                >
                  <MenuItem value="css">CSS Variables</MenuItem>
                  <MenuItem value="scss">SCSS Variables</MenuItem>
                  <MenuItem value="tailwind">Tailwind Config</MenuItem>
                  <MenuItem value="json">JSON</MenuItem>
                </Select>
              </FormControl>
              <Paper sx={{ bgcolor: '#0a0a0a', p: 2, border: '1px solid #333', maxHeight: 300, overflow: 'auto' }}>
                <Typography
                  component="pre"
                  sx={{ fontFamily: 'monospace', fontSize: 12, color: '#d4d4d4', m: 0, whiteSpace: 'pre-wrap' }}
                >
                  {generateExport()}
                </Typography>
              </Paper>
            </Box>
          </Paper>
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
}
