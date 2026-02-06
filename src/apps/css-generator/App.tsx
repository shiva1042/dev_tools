import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Tooltip,
  Slider,
  Tabs,
  Tab,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  ContentCopy,
  Home,
  Gradient,
  Layers,
  CropSquare,
  ViewModule,
  Animation,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

type TabType = 'gradient' | 'shadow' | 'border' | 'flexbox' | 'grid';

export default function CssGenerator() {
  const [tab, setTab] = useState<TabType>('gradient');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({ open: false, message: '' });

  // Gradient state
  const [gradientType, setGradientType] = useState<'linear' | 'radial'>('linear');
  const [gradientAngle, setGradientAngle] = useState<number>(90);
  const [gradientColor1, setGradientColor1] = useState<string>('#3b82f6');
  const [gradientColor2, setGradientColor2] = useState<string>('#8b5cf6');
  const [gradientStop1, setGradientStop1] = useState<number>(0);
  const [gradientStop2, setGradientStop2] = useState<number>(100);

  // Shadow state
  const [shadowX, setShadowX] = useState<number>(0);
  const [shadowY, setShadowY] = useState<number>(10);
  const [shadowBlur, setShadowBlur] = useState<number>(30);
  const [shadowSpread, setShadowSpread] = useState<number>(0);
  const [shadowColor, setShadowColor] = useState<string>('#000000');
  const [shadowOpacity, setShadowOpacity] = useState<number>(25);
  const [shadowInset, setShadowInset] = useState<boolean>(false);

  // Border state
  const [borderWidth, setBorderWidth] = useState<number>(2);
  const [borderStyle, setBorderStyle] = useState<string>('solid');
  const [borderColor, setBorderColor] = useState<string>('#3b82f6');
  const [borderRadius, setBorderRadius] = useState<number>(8);
  const [borderRadiusTL, setBorderRadiusTL] = useState<number>(8);
  const [borderRadiusTR, setBorderRadiusTR] = useState<number>(8);
  const [borderRadiusBL, setBorderRadiusBL] = useState<number>(8);
  const [borderRadiusBR, setBorderRadiusBR] = useState<number>(8);
  const [borderUniform, setBorderUniform] = useState<boolean>(true);

  // Flexbox state
  const [flexDirection, setFlexDirection] = useState<string>('row');
  const [justifyContent, setJustifyContent] = useState<string>('flex-start');
  const [alignItems, setAlignItems] = useState<string>('stretch');
  const [flexWrap, setFlexWrap] = useState<string>('nowrap');
  const [gap, setGap] = useState<number>(16);

  // Grid state
  const [gridCols, setGridCols] = useState<number>(3);
  const [gridRows, setGridRows] = useState<number>(2);
  const [gridGap, setGridGap] = useState<number>(16);
  const [gridColTemplate, setGridColTemplate] = useState<string>('1fr 1fr 1fr');
  const [gridRowTemplate, setGridRowTemplate] = useState<string>('auto auto');

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setSnackbar({ open: true, message: 'Copied to clipboard' });
  };

  const getGradientCSS = () => {
    if (gradientType === 'linear') {
      return `background: linear-gradient(${gradientAngle}deg, ${gradientColor1} ${gradientStop1}%, ${gradientColor2} ${gradientStop2}%);`;
    }
    return `background: radial-gradient(circle, ${gradientColor1} ${gradientStop1}%, ${gradientColor2} ${gradientStop2}%);`;
  };

  const getShadowCSS = () => {
    const rgba = `rgba(${parseInt(shadowColor.slice(1, 3), 16)}, ${parseInt(shadowColor.slice(3, 5), 16)}, ${parseInt(shadowColor.slice(5, 7), 16)}, ${shadowOpacity / 100})`;
    const inset = shadowInset ? 'inset ' : '';
    return `box-shadow: ${inset}${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowSpread}px ${rgba};`;
  };

  const getBorderCSS = () => {
    const radius = borderUniform
      ? `border-radius: ${borderRadius}px;`
      : `border-radius: ${borderRadiusTL}px ${borderRadiusTR}px ${borderRadiusBR}px ${borderRadiusBL}px;`;
    return `border: ${borderWidth}px ${borderStyle} ${borderColor};\n${radius}`;
  };

  const getFlexboxCSS = () => {
    return `display: flex;
flex-direction: ${flexDirection};
justify-content: ${justifyContent};
align-items: ${alignItems};
flex-wrap: ${flexWrap};
gap: ${gap}px;`;
  };

  const getGridCSS = () => {
    return `display: grid;
grid-template-columns: ${gridColTemplate};
grid-template-rows: ${gridRowTemplate};
gap: ${gridGap}px;`;
  };

  const renderGradientTab = () => (
    <Box sx={{ display: 'flex', gap: 3 }}>
      <Box sx={{ flex: 1 }}>
        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel sx={{ color: 'grey.500' }}>Type</InputLabel>
          <Select value={gradientType} label="Type" onChange={(e) => setGradientType(e.target.value as 'linear' | 'radial')} sx={{ color: 'grey.300' }}>
            <MenuItem value="linear">Linear</MenuItem>
            <MenuItem value="radial">Radial</MenuItem>
          </Select>
        </FormControl>

        {gradientType === 'linear' && (
          <>
            <Typography variant="caption" sx={{ color: 'grey.600' }}>Angle: {gradientAngle}°</Typography>
            <Slider value={gradientAngle} onChange={(_, v) => setGradientAngle(v as number)} min={0} max={360} sx={{ mb: 2 }} />
          </>
        )}

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" sx={{ color: 'grey.600' }}>Color 1</Typography>
            <input type="color" value={gradientColor1} onChange={(e) => setGradientColor1(e.target.value)} style={{ width: '100%', height: 40, cursor: 'pointer', border: 'none', borderRadius: 4 }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" sx={{ color: 'grey.600' }}>Color 2</Typography>
            <input type="color" value={gradientColor2} onChange={(e) => setGradientColor2(e.target.value)} style={{ width: '100%', height: 40, cursor: 'pointer', border: 'none', borderRadius: 4 }} />
          </Box>
        </Box>

        <Typography variant="caption" sx={{ color: 'grey.600' }}>Stop 1: {gradientStop1}%</Typography>
        <Slider value={gradientStop1} onChange={(_, v) => setGradientStop1(v as number)} min={0} max={100} sx={{ mb: 1 }} />

        <Typography variant="caption" sx={{ color: 'grey.600' }}>Stop 2: {gradientStop2}%</Typography>
        <Slider value={gradientStop2} onChange={(_, v) => setGradientStop2(v as number)} min={0} max={100} />
      </Box>

      <Box sx={{ width: 250 }}>
        <Box sx={{ width: '100%', height: 150, borderRadius: 2, background: gradientType === 'linear' ? `linear-gradient(${gradientAngle}deg, ${gradientColor1} ${gradientStop1}%, ${gradientColor2} ${gradientStop2}%)` : `radial-gradient(circle, ${gradientColor1} ${gradientStop1}%, ${gradientColor2} ${gradientStop2}%)`, mb: 2 }} />
        <Paper sx={{ bgcolor: '#0a0a0a', p: 2, border: '1px solid #333' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" sx={{ color: 'grey.600' }}>CSS</Typography>
            <IconButton size="small" onClick={() => handleCopy(getGradientCSS())} sx={{ color: 'grey.500' }}><ContentCopy fontSize="small" /></IconButton>
          </Box>
          <Typography sx={{ fontFamily: 'monospace', fontSize: 12, color: '#98c379', wordBreak: 'break-all' }}>{getGradientCSS()}</Typography>
        </Paper>
      </Box>
    </Box>
  );

  const renderShadowTab = () => (
    <Box sx={{ display: 'flex', gap: 3 }}>
      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" sx={{ color: 'grey.600' }}>X Offset: {shadowX}px</Typography>
            <Slider value={shadowX} onChange={(_, v) => setShadowX(v as number)} min={-50} max={50} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" sx={{ color: 'grey.600' }}>Y Offset: {shadowY}px</Typography>
            <Slider value={shadowY} onChange={(_, v) => setShadowY(v as number)} min={-50} max={50} />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" sx={{ color: 'grey.600' }}>Blur: {shadowBlur}px</Typography>
            <Slider value={shadowBlur} onChange={(_, v) => setShadowBlur(v as number)} min={0} max={100} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" sx={{ color: 'grey.600' }}>Spread: {shadowSpread}px</Typography>
            <Slider value={shadowSpread} onChange={(_, v) => setShadowSpread(v as number)} min={-50} max={50} />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" sx={{ color: 'grey.600' }}>Color</Typography>
            <input type="color" value={shadowColor} onChange={(e) => setShadowColor(e.target.value)} style={{ width: '100%', height: 40, cursor: 'pointer', border: 'none', borderRadius: 4 }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" sx={{ color: 'grey.600' }}>Opacity: {shadowOpacity}%</Typography>
            <Slider value={shadowOpacity} onChange={(_, v) => setShadowOpacity(v as number)} min={0} max={100} />
          </Box>
        </Box>
      </Box>

      <Box sx={{ width: 250 }}>
        <Box sx={{ width: '100%', height: 150, bgcolor: '#fff', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <Box sx={{ width: 100, height: 100, bgcolor: '#3b82f6', borderRadius: 2, boxShadow: `${shadowInset ? 'inset ' : ''}${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowSpread}px rgba(${parseInt(shadowColor.slice(1, 3), 16)}, ${parseInt(shadowColor.slice(3, 5), 16)}, ${parseInt(shadowColor.slice(5, 7), 16)}, ${shadowOpacity / 100})` }} />
        </Box>
        <Paper sx={{ bgcolor: '#0a0a0a', p: 2, border: '1px solid #333' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" sx={{ color: 'grey.600' }}>CSS</Typography>
            <IconButton size="small" onClick={() => handleCopy(getShadowCSS())} sx={{ color: 'grey.500' }}><ContentCopy fontSize="small" /></IconButton>
          </Box>
          <Typography sx={{ fontFamily: 'monospace', fontSize: 12, color: '#98c379', wordBreak: 'break-all' }}>{getShadowCSS()}</Typography>
        </Paper>
      </Box>
    </Box>
  );

  const renderBorderTab = () => (
    <Box sx={{ display: 'flex', gap: 3 }}>
      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" sx={{ color: 'grey.600' }}>Width: {borderWidth}px</Typography>
            <Slider value={borderWidth} onChange={(_, v) => setBorderWidth(v as number)} min={0} max={20} />
          </Box>
          <FormControl sx={{ flex: 1 }} size="small">
            <InputLabel sx={{ color: 'grey.500' }}>Style</InputLabel>
            <Select value={borderStyle} label="Style" onChange={(e) => setBorderStyle(e.target.value)} sx={{ color: 'grey.300' }}>
              {['solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset'].map(s => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Typography variant="caption" sx={{ color: 'grey.600' }}>Color</Typography>
        <input type="color" value={borderColor} onChange={(e) => setBorderColor(e.target.value)} style={{ width: '100%', height: 40, cursor: 'pointer', border: 'none', borderRadius: 4, marginBottom: 16 }} />

        <Typography variant="caption" sx={{ color: 'grey.600' }}>Border Radius: {borderRadius}px</Typography>
        <Slider value={borderRadius} onChange={(_, v) => { setBorderRadius(v as number); setBorderRadiusTL(v as number); setBorderRadiusTR(v as number); setBorderRadiusBL(v as number); setBorderRadiusBR(v as number); }} min={0} max={100} />
      </Box>

      <Box sx={{ width: 250 }}>
        <Box sx={{ width: '100%', height: 150, bgcolor: '#1a1a1a', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <Box sx={{ width: 100, height: 100, bgcolor: '#3b82f6', border: `${borderWidth}px ${borderStyle} ${borderColor}`, borderRadius: `${borderRadius}px` }} />
        </Box>
        <Paper sx={{ bgcolor: '#0a0a0a', p: 2, border: '1px solid #333' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" sx={{ color: 'grey.600' }}>CSS</Typography>
            <IconButton size="small" onClick={() => handleCopy(getBorderCSS())} sx={{ color: 'grey.500' }}><ContentCopy fontSize="small" /></IconButton>
          </Box>
          <Typography sx={{ fontFamily: 'monospace', fontSize: 12, color: '#98c379', whiteSpace: 'pre-wrap' }}>{getBorderCSS()}</Typography>
        </Paper>
      </Box>
    </Box>
  );

  const renderFlexboxTab = () => (
    <Box sx={{ display: 'flex', gap: 3 }}>
      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <FormControl sx={{ flex: 1 }} size="small">
            <InputLabel sx={{ color: 'grey.500' }}>Direction</InputLabel>
            <Select value={flexDirection} label="Direction" onChange={(e) => setFlexDirection(e.target.value)} sx={{ color: 'grey.300' }}>
              {['row', 'row-reverse', 'column', 'column-reverse'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl sx={{ flex: 1 }} size="small">
            <InputLabel sx={{ color: 'grey.500' }}>Wrap</InputLabel>
            <Select value={flexWrap} label="Wrap" onChange={(e) => setFlexWrap(e.target.value)} sx={{ color: 'grey.300' }}>
              {['nowrap', 'wrap', 'wrap-reverse'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <FormControl sx={{ flex: 1 }} size="small">
            <InputLabel sx={{ color: 'grey.500' }}>Justify</InputLabel>
            <Select value={justifyContent} label="Justify" onChange={(e) => setJustifyContent(e.target.value)} sx={{ color: 'grey.300' }}>
              {['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl sx={{ flex: 1 }} size="small">
            <InputLabel sx={{ color: 'grey.500' }}>Align</InputLabel>
            <Select value={alignItems} label="Align" onChange={(e) => setAlignItems(e.target.value)} sx={{ color: 'grey.300' }}>
              {['stretch', 'flex-start', 'flex-end', 'center', 'baseline'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>

        <Typography variant="caption" sx={{ color: 'grey.600' }}>Gap: {gap}px</Typography>
        <Slider value={gap} onChange={(_, v) => setGap(v as number)} min={0} max={50} />
      </Box>

      <Box sx={{ width: 300 }}>
        <Box sx={{ width: '100%', height: 200, bgcolor: '#1a1a1a', borderRadius: 2, p: 2, mb: 2, display: 'flex', flexDirection: flexDirection as any, justifyContent, alignItems, flexWrap: flexWrap as any, gap: `${gap}px` }}>
          {[1, 2, 3, 4].map(i => (
            <Box key={i} sx={{ width: 40, height: 40, bgcolor: '#3b82f6', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12 }}>{i}</Box>
          ))}
        </Box>
        <Paper sx={{ bgcolor: '#0a0a0a', p: 2, border: '1px solid #333' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" sx={{ color: 'grey.600' }}>CSS</Typography>
            <IconButton size="small" onClick={() => handleCopy(getFlexboxCSS())} sx={{ color: 'grey.500' }}><ContentCopy fontSize="small" /></IconButton>
          </Box>
          <Typography sx={{ fontFamily: 'monospace', fontSize: 12, color: '#98c379', whiteSpace: 'pre-wrap' }}>{getFlexboxCSS()}</Typography>
        </Paper>
      </Box>
    </Box>
  );

  const renderGridTab = () => (
    <Box sx={{ display: 'flex', gap: 3 }}>
      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" sx={{ color: 'grey.600' }}>Columns: {gridCols}</Typography>
            <Slider value={gridCols} onChange={(_, v) => { setGridCols(v as number); setGridColTemplate(Array(v as number).fill('1fr').join(' ')); }} min={1} max={6} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" sx={{ color: 'grey.600' }}>Rows: {gridRows}</Typography>
            <Slider value={gridRows} onChange={(_, v) => { setGridRows(v as number); setGridRowTemplate(Array(v as number).fill('auto').join(' ')); }} min={1} max={6} />
          </Box>
        </Box>

        <Typography variant="caption" sx={{ color: 'grey.600' }}>Gap: {gridGap}px</Typography>
        <Slider value={gridGap} onChange={(_, v) => setGridGap(v as number)} min={0} max={50} sx={{ mb: 2 }} />

        <TextField fullWidth size="small" label="Column Template" value={gridColTemplate} onChange={(e) => setGridColTemplate(e.target.value)} sx={{ mb: 2, '& .MuiInputBase-root': { color: 'grey.300', fontFamily: 'monospace' } }} />

        <TextField fullWidth size="small" label="Row Template" value={gridRowTemplate} onChange={(e) => setGridRowTemplate(e.target.value)} sx={{ '& .MuiInputBase-root': { color: 'grey.300', fontFamily: 'monospace' } }} />
      </Box>

      <Box sx={{ width: 300 }}>
        <Box sx={{ width: '100%', height: 200, bgcolor: '#1a1a1a', borderRadius: 2, p: 2, mb: 2, display: 'grid', gridTemplateColumns: gridColTemplate, gridTemplateRows: gridRowTemplate, gap: `${gridGap}px` }}>
          {Array(gridCols * gridRows).fill(0).map((_, i) => (
            <Box key={i} sx={{ bgcolor: '#3b82f6', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, minHeight: 30 }}>{i + 1}</Box>
          ))}
        </Box>
        <Paper sx={{ bgcolor: '#0a0a0a', p: 2, border: '1px solid #333' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" sx={{ color: 'grey.600' }}>CSS</Typography>
            <IconButton size="small" onClick={() => handleCopy(getGridCSS())} sx={{ color: 'grey.500' }}><ContentCopy fontSize="small" /></IconButton>
          </Box>
          <Typography sx={{ fontFamily: 'monospace', fontSize: 12, color: '#98c379', whiteSpace: 'pre-wrap' }}>{getGridCSS()}</Typography>
        </Paper>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a' }}>
      <Paper elevation={0} sx={{ bgcolor: '#111', borderBottom: '1px solid #222', px: 3, py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Link to="/"><IconButton size="small" sx={{ color: 'grey.500' }}><Home /></IconButton></Link>
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>CSS Generator</Typography>
        </Box>
      </Paper>

      <Paper sx={{ bgcolor: '#111', borderBottom: '1px solid #222' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ '& .MuiTab-root': { color: 'grey.500' } }}>
          <Tab icon={<Gradient sx={{ fontSize: 18 }} />} iconPosition="start" label="Gradient" value="gradient" />
          <Tab icon={<Layers sx={{ fontSize: 18 }} />} iconPosition="start" label="Shadow" value="shadow" />
          <Tab icon={<CropSquare sx={{ fontSize: 18 }} />} iconPosition="start" label="Border" value="border" />
          <Tab icon={<ViewModule sx={{ fontSize: 18 }} />} iconPosition="start" label="Flexbox" value="flexbox" />
          <Tab icon={<ViewModule sx={{ fontSize: 18 }} />} iconPosition="start" label="Grid" value="grid" />
        </Tabs>
      </Paper>

      <Box sx={{ p: 3 }}>
        {tab === 'gradient' && renderGradientTab()}
        {tab === 'shadow' && renderShadowTab()}
        {tab === 'border' && renderBorderTab()}
        {tab === 'flexbox' && renderFlexboxTab()}
        {tab === 'grid' && renderGridTab()}
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={2000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} />
    </Box>
  );
}
