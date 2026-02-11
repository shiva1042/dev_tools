import { useState, useRef, useEffect } from 'react';
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
  ToggleButtonGroup,
  ToggleButton,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { Home, PhoneAndroid, Tablet, Laptop, Tv, ScreenRotation, CompareArrows } from '@mui/icons-material';
import { Link } from 'react-router-dom';

interface Breakpoint {
  label: string;
  width: number;
  icon?: React.ReactNode;
  category: string;
}

const BREAKPOINTS: Breakpoint[] = [
  { label: 'Mobile S', width: 320, icon: <PhoneAndroid sx={{ fontSize: 14 }} />, category: 'mobile' },
  { label: 'Mobile M', width: 375, icon: <PhoneAndroid sx={{ fontSize: 14 }} />, category: 'mobile' },
  { label: 'Mobile L', width: 425, icon: <PhoneAndroid sx={{ fontSize: 14 }} />, category: 'mobile' },
  { label: 'Tablet', width: 768, icon: <Tablet sx={{ fontSize: 14 }} />, category: 'tablet' },
  { label: 'Laptop', width: 1024, icon: <Laptop sx={{ fontSize: 14 }} />, category: 'laptop' },
  { label: 'Laptop L', width: 1440, icon: <Laptop sx={{ fontSize: 14 }} />, category: 'laptop' },
  { label: '4K', width: 2560, icon: <Tv sx={{ fontSize: 14 }} />, category: 'desktop' },
];

const TAILWIND_BREAKPOINTS = [
  { name: 'sm', min: 640 },
  { name: 'md', min: 768 },
  { name: 'lg', min: 1024 },
  { name: 'xl', min: 1280 },
  { name: '2xl', min: 1536 },
];

const DEFAULT_HTML = `<!DOCTYPE html>
<html>
<head>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: sans-serif; background: #1a1a2e; color: #e0e0e0; padding: 16px; }
  .container { max-width: 100%; }
  h1 { font-size: clamp(1rem, 4vw, 2rem); margin-bottom: 12px; color: #61afef; }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 12px;
  }
  .card {
    background: #222;
    border-radius: 8px;
    padding: 16px;
    border: 1px solid #333;
  }
  .card h3 { font-size: 14px; margin-bottom: 8px; color: #98c379; }
  .card p { font-size: 12px; color: #888; }
  @media (max-width: 480px) {
    .grid { grid-template-columns: 1fr; }
    h1 { color: #e06c75; }
  }
  @media (min-width: 481px) and (max-width: 768px) {
    .grid { grid-template-columns: repeat(2, 1fr); }
    h1 { color: #e5c07b; }
  }
</style>
</head>
<body>
  <div class="container">
    <h1>Responsive Layout Test</h1>
    <p style="margin-bottom:12px;font-size:13px;color:#666;">Resize to see layout changes. Heading color changes at breakpoints.</p>
    <div class="grid">
      <div class="card"><h3>Card 1</h3><p>Content goes here with some text.</p></div>
      <div class="card"><h3>Card 2</h3><p>Another card with content.</p></div>
      <div class="card"><h3>Card 3</h3><p>Third card layout test.</p></div>
      <div class="card"><h3>Card 4</h3><p>Fourth card for grid.</p></div>
      <div class="card"><h3>Card 5</h3><p>Fifth card appears.</p></div>
      <div class="card"><h3>Card 6</h3><p>Sixth card in grid.</p></div>
    </div>
  </div>
</body>
</html>`;

export default function ResponsiveBreakpointTester() {
  const [html, setHtml] = useState(DEFAULT_HTML);
  const [currentWidth, setCurrentWidth] = useState(375);
  const [landscape, setLandscape] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [compareWidth, setCompareWidth] = useState(1024);
  const [customWidth, setCustomWidth] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const containerRef = useRef<HTMLDivElement>(null);

  const displayWidth = landscape ? Math.max(currentWidth, 568) : currentWidth;
  const displayHeight = landscape ? currentWidth : undefined;
  const compareDisplayWidth = landscape ? Math.max(compareWidth, 568) : compareWidth;

  const getTailwindBreakpoint = (width: number) => {
    let active = 'xs';
    for (const bp of TAILWIND_BREAKPOINTS) {
      if (width >= bp.min) active = bp.name;
    }
    return active;
  };

  const handleCustomWidth = () => {
    const w = parseInt(customWidth);
    if (w > 0 && w <= 3840) {
      setCurrentWidth(w);
      setSnackbar({ open: true, message: `Width set to ${w}px` });
    }
  };

  const renderIframe = (width: number, height?: number) => {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: compareMode ? 1 : undefined, minWidth: 0 }}>
        {/* Ruler */}
        <Box sx={{ width: Math.min(width, containerRef.current?.clientWidth ? (compareMode ? containerRef.current.clientWidth / 2 - 32 : containerRef.current.clientWidth - 32) : width), height: 24, position: 'relative', mb: 0.5 }}>
          <Box sx={{ width: '100%', height: 1, bgcolor: '#444', position: 'absolute', bottom: 0 }} />
          <Typography variant="caption" sx={{ color: '#61afef', position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: 0, fontFamily: 'monospace' }}>
            {width}px
          </Typography>
        </Box>
        {/* Tailwind indicator */}
        <Box sx={{ display: 'flex', gap: 0.5, mb: 1 }}>
          {TAILWIND_BREAKPOINTS.map((bp) => (
            <Chip key={bp.name} label={bp.name} size="small"
              sx={{
                bgcolor: width >= bp.min ? '#1a3a5c' : '#1a1a1a',
                color: width >= bp.min ? '#61afef' : 'grey.700',
                fontSize: 10, height: 20,
                border: getTailwindBreakpoint(width) === bp.name ? '1px solid #61afef' : '1px solid transparent',
              }} />
          ))}
        </Box>
        <Box sx={{
          width: Math.min(width, containerRef.current?.clientWidth ? (compareMode ? containerRef.current.clientWidth / 2 - 32 : containerRef.current.clientWidth - 32) : width),
          height: height || 'calc(100vh - 280px)',
          border: '1px solid #333',
          borderRadius: 1,
          overflow: 'hidden',
          bgcolor: '#fff',
        }}>
          <iframe
            srcDoc={html}
            style={{
              width: width,
              height: '100%',
              border: 'none',
              transform: `scale(${Math.min(1, (containerRef.current?.clientWidth ? (compareMode ? (containerRef.current.clientWidth / 2 - 32) : (containerRef.current.clientWidth - 32)) : width) / width)})`,
              transformOrigin: 'top left',
            }}
            title={`Preview at ${width}px`}
            sandbox="allow-same-origin"
          />
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a' }}>
      <Paper elevation={0} sx={{ bgcolor: '#111', borderBottom: '1px solid #222', px: 3, py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Link to="/"><IconButton size="small" sx={{ color: 'grey.500' }}><Home /></IconButton></Link>
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>Responsive Breakpoint Tester</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FormControlLabel control={<Switch checked={landscape} onChange={(e) => setLandscape(e.target.checked)} size="small" />}
              label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><ScreenRotation sx={{ fontSize: 16 }} /> <Typography variant="caption">Landscape</Typography></Box>}
              sx={{ color: 'grey.400', mr: 1 }} />
            <FormControlLabel control={<Switch checked={compareMode} onChange={(e) => setCompareMode(e.target.checked)} size="small" />}
              label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><CompareArrows sx={{ fontSize: 16 }} /> <Typography variant="caption">Compare</Typography></Box>}
              sx={{ color: 'grey.400', mr: 1 }} />
            <Button size="small" onClick={() => setShowEditor(!showEditor)} sx={{ color: 'grey.400' }}>
              {showEditor ? 'Hide Editor' : 'Edit HTML'}
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Breakpoint buttons */}
      <Paper elevation={0} sx={{ bgcolor: '#0d0d0d', borderBottom: '1px solid #222', px: 3, py: 1.5 }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          {BREAKPOINTS.map((bp) => (
            <Chip key={bp.label} icon={bp.icon as React.ReactElement} label={`${bp.label} (${bp.width}px)`} size="small"
              onClick={() => setCurrentWidth(bp.width)}
              sx={{
                bgcolor: currentWidth === bp.width ? '#1a3a5c' : '#1a1a1a',
                color: currentWidth === bp.width ? '#61afef' : 'grey.400',
                border: currentWidth === bp.width ? '1px solid #61afef' : '1px solid #333',
                '& .MuiChip-icon': { color: 'inherit' },
              }} />
          ))}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1 }}>
            <TextField size="small" placeholder="Custom px" value={customWidth} onChange={(e) => setCustomWidth(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCustomWidth()}
              sx={{ width: 100, '& .MuiInputBase-root': { color: 'grey.300', height: 32, fontSize: 13 }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' } }} />
            <Button size="small" onClick={handleCustomWidth} sx={{ color: 'grey.400', minWidth: 'auto' }}>Set</Button>
          </Box>
          {compareMode && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 2 }}>
              <Typography variant="caption" sx={{ color: 'grey.500' }}>Compare:</Typography>
              {BREAKPOINTS.map((bp) => (
                <Chip key={`c-${bp.label}`} label={`${bp.width}`} size="small"
                  onClick={() => setCompareWidth(bp.width)}
                  sx={{
                    bgcolor: compareWidth === bp.width ? '#3a1a1a' : '#1a1a1a',
                    color: compareWidth === bp.width ? '#e06c75' : 'grey.500',
                    border: compareWidth === bp.width ? '1px solid #e06c75' : '1px solid transparent',
                    fontSize: 10, height: 22,
                  }} />
              ))}
            </Box>
          )}
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', gap: 2, p: 2, height: 'calc(100vh - 140px)' }}>
        {/* HTML Editor (toggleable) */}
        {showEditor && (
          <Paper sx={{ width: 380, bgcolor: '#111', border: '1px solid #222', p: 2, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1 }}>HTML Content</Typography>
            <TextField multiline fullWidth value={html} onChange={(e) => setHtml(e.target.value)}
              sx={{
                flex: 1,
                '& .MuiInputBase-root': { height: '100%', alignItems: 'flex-start', fontFamily: 'monospace', fontSize: 11, bgcolor: '#0a0a0a', color: '#d4d4d4' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
              }} />
          </Paper>
        )}

        {/* Preview area */}
        <Box ref={containerRef} sx={{ flex: 1, display: 'flex', gap: 2, justifyContent: 'center', overflow: 'auto', minWidth: 0 }}>
          {renderIframe(displayWidth, displayHeight ? Number(displayHeight) : undefined)}
          {compareMode && renderIframe(compareDisplayWidth)}
        </Box>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={2000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} />
    </Box>
  );
}
