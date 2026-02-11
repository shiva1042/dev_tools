import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Button, IconButton, Tooltip, Snackbar, Chip,
  Select, MenuItem, FormControl, InputLabel, Slider,
} from '@mui/material';
import { Home, ContentCopy, Download } from '@mui/icons-material';

const PRESETS = [
  { name: 'Dark', bg: '#1a1a2e', fg: '#e94560', radius: 20 },
  { name: 'Light', bg: '#f0f0f0', fg: '#333333', radius: 8 },
  { name: 'Colorful', bg: '#6c5ce7', fg: '#ffeaa7', radius: 50 },
  { name: 'Minimal', bg: '#ffffff', fg: '#000000', radius: 0 },
  { name: 'Ocean', bg: '#0984e3', fg: '#ffffff', radius: 50 },
  { name: 'Forest', bg: '#00b894', fg: '#2d3436', radius: 12 },
  { name: 'Sunset', bg: '#e17055', fg: '#ffffff', radius: 30 },
  { name: 'Neon', bg: '#000000', fg: '#00ff88', radius: 8 },
];

const FONTS = [
  'Arial', 'Georgia', 'Courier New', 'Verdana', 'Impact',
  'Trebuchet MS', 'Times New Roman', 'Comic Sans MS',
];

const PREVIEW_SIZES = [16, 32, 48, 180, 192, 512];

const tfSx = {
  '& .MuiInputBase-root': { bgcolor: '#0a0a0a', color: 'grey.300', fontFamily: 'monospace', fontSize: 13 },
  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
};

export default function App() {
  const [text, setText] = useState('AB');
  const [bgColor, setBgColor] = useState('#1976d2');
  const [fgColor, setFgColor] = useState('#ffffff');
  const [fontSize, setFontSize] = useState(62);
  const [borderRadius, setBorderRadius] = useState(20);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');

  const svgString = useMemo(() => {
    const rx = (borderRadius / 100) * 50;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <rect width="100" height="100" rx="${rx}" fill="${bgColor}"/>
  <text x="50" y="50" font-family="${fontFamily}, sans-serif" font-size="${fontSize}" fill="${fgColor}" text-anchor="middle" dominant-baseline="central" font-weight="bold">${text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</text>
</svg>`;
  }, [text, bgColor, fgColor, fontSize, borderRadius, fontFamily]);

  const svgDataUrl = useMemo(() => {
    return `data:image/svg+xml,${encodeURIComponent(svgString)}`;
  }, [svgString]);

  const linkTags = useMemo(() => {
    return `<!-- Favicon -->
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="${bgColor}">`;
  }, [bgColor]);

  const manifestJson = useMemo(() => {
    return JSON.stringify({
      name: 'My App',
      short_name: 'App',
      icons: [
        { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
      ],
      theme_color: bgColor,
      background_color: bgColor,
      display: 'standalone',
    }, null, 2);
  }, [bgColor]);

  const copy = (text: string, msg: string) => {
    navigator.clipboard.writeText(text);
    setSnackMsg(msg);
    setSnackOpen(true);
  };

  const downloadSvg = () => {
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'favicon.svg';
    a.click();
    URL.revokeObjectURL(url);
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setBgColor(preset.bg);
    setFgColor(preset.fg);
    setBorderRadius(preset.radius);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a', p: 3 }}>
      <Paper elevation={0} sx={{ bgcolor: '#111', borderBottom: '1px solid #222', px: 3, py: 2, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Link to="/"><IconButton size="small" sx={{ color: 'grey.500' }}><Home /></IconButton></Link>
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>Favicon Generator</Typography>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', gap: 3 }}>
        {/* Settings */}
        <Box sx={{ width: 320 }}>
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 2, borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1.5 }}>Icon Content</Typography>
            <TextField size="small" fullWidth label="Text / Emoji (1-2 chars)" value={text}
              onChange={e => setText(e.target.value.slice(0, 4))} sx={{ ...tfSx, mb: 1.5 }} />
            <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
              <InputLabel sx={{ color: 'grey.500' }}>Font Family</InputLabel>
              <Select value={fontFamily} label="Font Family" onChange={e => setFontFamily(e.target.value)}
                sx={{ bgcolor: '#0a0a0a', color: 'grey.300', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' } }}>
                {FONTS.map(f => <MenuItem key={f} value={f} sx={{ fontFamily: f }}>{f}</MenuItem>)}
              </Select>
            </FormControl>
            <Typography sx={{ color: 'grey.500', fontSize: 12, mb: 0.5 }}>Font Size: {fontSize}%</Typography>
            <Slider value={fontSize} onChange={(_, v) => setFontSize(v as number)} min={20} max={90}
              sx={{ color: '#1976d2', mb: 1.5 }} />
          </Paper>

          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 2, borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1.5 }}>Colors & Shape</Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ color: 'grey.500', fontSize: 12, mb: 0.5 }}>Background</Typography>
                <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                  <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)}
                    style={{ width: 36, height: 36, border: 'none', borderRadius: 4, cursor: 'pointer', background: 'none' }} />
                  <TextField size="small" value={bgColor} onChange={e => setBgColor(e.target.value)}
                    sx={{ ...tfSx, flex: 1, '& .MuiInputBase-root': { ...tfSx['& .MuiInputBase-root'], fontSize: 12 } }} />
                </Box>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ color: 'grey.500', fontSize: 12, mb: 0.5 }}>Text Color</Typography>
                <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                  <input type="color" value={fgColor} onChange={e => setFgColor(e.target.value)}
                    style={{ width: 36, height: 36, border: 'none', borderRadius: 4, cursor: 'pointer', background: 'none' }} />
                  <TextField size="small" value={fgColor} onChange={e => setFgColor(e.target.value)}
                    sx={{ ...tfSx, flex: 1, '& .MuiInputBase-root': { ...tfSx['& .MuiInputBase-root'], fontSize: 12 } }} />
                </Box>
              </Box>
            </Box>
            <Typography sx={{ color: 'grey.500', fontSize: 12, mb: 0.5 }}>Border Radius: {borderRadius}%</Typography>
            <Slider value={borderRadius} onChange={(_, v) => setBorderRadius(v as number)} min={0} max={50}
              sx={{ color: '#1976d2' }} />
          </Paper>

          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1 }}>Presets</Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {PRESETS.map(p => (
                <Chip key={p.name} label={p.name} size="small" onClick={() => applyPreset(p)}
                  sx={{ bgcolor: '#222', color: 'grey.400', '&:hover': { bgcolor: '#333' } }}
                  icon={<Box sx={{ width: 14, height: 14, bgcolor: p.bg, borderRadius: '50%', border: `2px solid ${p.fg}`, ml: 0.5 }} />} />
              ))}
            </Box>
          </Paper>
        </Box>

        {/* Preview */}
        <Box sx={{ flex: 1 }}>
          {/* Large Preview */}
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 3, mb: 2, borderRadius: 2, textAlign: 'center' }}>
            <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 2 }}>Preview</Typography>
            <Box sx={{ display: 'inline-block', mb: 2 }}>
              <img src={svgDataUrl} alt="Favicon preview" style={{ width: 128, height: 128 }} />
            </Box>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
              <Button variant="contained" startIcon={<Download />} onClick={downloadSvg}
                sx={{ bgcolor: '#1976d2', textTransform: 'none' }}>Download SVG</Button>
              <Button variant="outlined" startIcon={<ContentCopy />} onClick={() => copy(svgString, 'SVG copied')}
                sx={{ color: 'grey.400', borderColor: '#333', textTransform: 'none' }}>Copy SVG</Button>
            </Box>
          </Paper>

          {/* Size Previews */}
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 2, borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1.5 }}>Size Previews</Typography>
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              {PREVIEW_SIZES.map(size => {
                const displaySize = Math.min(size, 80);
                return (
                  <Box key={size} sx={{ textAlign: 'center' }}>
                    <Box sx={{
                      width: displaySize, height: displaySize,
                      backgroundImage: `url("${svgDataUrl}")`,
                      backgroundSize: 'cover',
                      borderRadius: `${(borderRadius / 100) * displaySize * 0.5}px`,
                      mx: 'auto', mb: 0.5,
                      imageRendering: size <= 32 ? 'pixelated' : 'auto',
                    }} />
                    <Typography sx={{ color: 'grey.500', fontSize: 10 }}>{size}x{size}</Typography>
                  </Box>
                );
              })}
            </Box>
          </Paper>

          {/* Browser Tab Preview */}
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 2, borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1 }}>Browser Tab Preview</Typography>
            <Box sx={{ bgcolor: '#2b2b2b', borderRadius: '8px 8px 0 0', p: 0.5 }}>
              <Box sx={{ display: 'flex', gap: 0.5, px: 1, py: 0.5, alignItems: 'center' }}>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#ff5f57' }} />
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#febc2e' }} />
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#28c840' }} />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', bgcolor: '#3b3b3b', borderRadius: '6px 6px 0 0', ml: 1, maxWidth: 200 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.8 }}>
                  <img src={svgDataUrl} alt="" style={{ width: 16, height: 16 }} />
                  <Typography sx={{ color: 'grey.300', fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    My Website
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Box sx={{ bgcolor: '#1a1a1a', height: 40, borderRadius: '0 0 8px 8px', display: 'flex', alignItems: 'center', px: 2 }}>
              <Box sx={{ bgcolor: '#333', borderRadius: 2, flex: 1, px: 1.5, py: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <img src={svgDataUrl} alt="" style={{ width: 14, height: 14 }} />
                <Typography sx={{ color: 'grey.400', fontSize: 12 }}>example.com</Typography>
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Code Output */}
        <Box sx={{ width: 360 }}>
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 2, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle2" sx={{ color: 'grey.400' }}>HTML Link Tags</Typography>
              <Tooltip title="Copy"><IconButton size="small" onClick={() => copy(linkTags, 'Link tags copied')} sx={{ color: 'grey.500' }}><ContentCopy fontSize="small" /></IconButton></Tooltip>
            </Box>
            <Box sx={{ bgcolor: '#0a0a0a', border: '1px solid #222', borderRadius: 1, p: 1.5, maxHeight: 200, overflow: 'auto' }}>
              <Typography component="pre" sx={{ color: '#98c379', fontFamily: 'monospace', fontSize: 11, whiteSpace: 'pre-wrap', m: 0 }}>
                {linkTags}
              </Typography>
            </Box>
          </Paper>

          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle2" sx={{ color: 'grey.400' }}>manifest.json (PWA)</Typography>
              <Tooltip title="Copy"><IconButton size="small" onClick={() => copy(manifestJson, 'Manifest copied')} sx={{ color: 'grey.500' }}><ContentCopy fontSize="small" /></IconButton></Tooltip>
            </Box>
            <Box sx={{ bgcolor: '#0a0a0a', border: '1px solid #222', borderRadius: 1, p: 1.5, maxHeight: 250, overflow: 'auto' }}>
              <Typography component="pre" sx={{ color: '#e5c07b', fontFamily: 'monospace', fontSize: 11, whiteSpace: 'pre-wrap', m: 0 }}>
                {manifestJson}
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Box>

      <Snackbar open={snackOpen} autoHideDuration={2000} onClose={() => setSnackOpen(false)} message={snackMsg} />
    </Box>
  );
}
