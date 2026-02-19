import { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  IconButton,
  Tabs,
  Tab,
  Chip,
  Tooltip,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  Divider,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Copy,
  Check,
  Plus,
  Trash2,
  MapPin,
  Grid3x3,
  Globe,
  Layers,
  Link2,
  ChevronDown,
  ChevronUp,
  Zap,
  Info,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const inputSx = {
  bgcolor: '#1a1a1a',
  color: 'grey.300',
  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#666' },
  '& .MuiInputBase-input': { color: '#ccc' },
  '& .MuiInputLabel-root': { color: '#888' },
  '& .MuiSelect-icon': { color: '#888' },
};

const selectSx = {
  bgcolor: '#1a1a1a',
  color: 'grey.300',
  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
  '& .MuiSelect-icon': { color: '#888' },
};

interface CustomHeader {
  key: string;
  value: string;
}

interface TilePreset {
  name: string;
  category: string;
  url: string;
  subdomains: string;
  ext: string;
  attribution: string;
  maxZoom: number;
}

const TILE_PRESETS: TilePreset[] = [
  { name: 'OpenStreetMap', category: 'General', url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', subdomains: 'a,b,c', ext: 'png', attribution: 'OpenStreetMap contributors', maxZoom: 19 },
  { name: 'Stamen Toner', category: 'Artistic', url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png', subdomains: 'a,b,c,d', ext: 'png', attribution: 'Stamen Design', maxZoom: 18 },
  { name: 'Stamen Terrain', category: 'Artistic', url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.png', subdomains: 'a,b,c,d', ext: 'png', attribution: 'Stamen Design', maxZoom: 18 },
  { name: 'Stamen Watercolor', category: 'Artistic', url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg', subdomains: 'a,b,c,d', ext: 'jpg', attribution: 'Stamen Design', maxZoom: 16 },
  { name: 'CartoDB Positron', category: 'Light', url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', subdomains: 'a,b,c,d', ext: 'png', attribution: 'CARTO', maxZoom: 20 },
  { name: 'CartoDB Dark Matter', category: 'Dark', url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', subdomains: 'a,b,c,d', ext: 'png', attribution: 'CARTO', maxZoom: 20 },
  { name: 'CartoDB Voyager', category: 'Light', url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png', subdomains: 'a,b,c,d', ext: 'png', attribution: 'CARTO', maxZoom: 20 },
  { name: 'ESRI World Imagery', category: 'Satellite', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', subdomains: '', ext: 'jpg', attribution: 'Esri', maxZoom: 19 },
  { name: 'ESRI World Street Map', category: 'General', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', subdomains: '', ext: 'jpg', attribution: 'Esri', maxZoom: 19 },
  { name: 'ESRI World Topo Map', category: 'Topographic', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', subdomains: '', ext: 'jpg', attribution: 'Esri', maxZoom: 19 },
  { name: 'ESRI NatGeo World Map', category: 'General', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', subdomains: '', ext: 'jpg', attribution: 'Esri, National Geographic', maxZoom: 16 },
  { name: 'Mapbox Streets', category: 'General', url: 'https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/{z}/{x}/{y}?access_token={apikey}', subdomains: '', ext: 'png', attribution: 'Mapbox', maxZoom: 22 },
  { name: 'Mapbox Satellite', category: 'Satellite', url: 'https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token={apikey}', subdomains: '', ext: 'png', attribution: 'Mapbox', maxZoom: 22 },
  { name: 'Mapbox Outdoors', category: 'Topographic', url: 'https://api.mapbox.com/styles/v1/mapbox/outdoors-v12/tiles/{z}/{x}/{y}?access_token={apikey}', subdomains: '', ext: 'png', attribution: 'Mapbox', maxZoom: 22 },
  { name: 'OpenTopoMap', category: 'Topographic', url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', subdomains: 'a,b,c', ext: 'png', attribution: 'OpenTopoMap', maxZoom: 17 },
  { name: 'Thunderforest Landscape', category: 'Topographic', url: 'https://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png?apikey={apikey}', subdomains: 'a,b,c', ext: 'png', attribution: 'Thunderforest', maxZoom: 22 },
  { name: 'Thunderforest Outdoors', category: 'Topographic', url: 'https://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey={apikey}', subdomains: 'a,b,c', ext: 'png', attribution: 'Thunderforest', maxZoom: 22 },
];

function latLngToTile(lat: number, lng: number, zoom: number) {
  const n = Math.pow(2, zoom);
  const x = Math.floor(((lng + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n);
  return { x: Math.max(0, Math.min(n - 1, x)), y: Math.max(0, Math.min(n - 1, y)) };
}

function tileToBounds(x: number, y: number, zoom: number) {
  const n = Math.pow(2, zoom);
  const lonLeft = (x / n) * 360 - 180;
  const lonRight = ((x + 1) / n) * 360 - 180;
  const latTopRad = Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n)));
  const latBottomRad = Math.atan(Math.sinh(Math.PI * (1 - (2 * (y + 1)) / n)));
  const latTop = (latTopRad * 180) / Math.PI;
  const latBottom = (latBottomRad * 180) / Math.PI;
  return { north: latTop, south: latBottom, west: lonLeft, east: lonRight };
}

function tileToQuadkey(x: number, y: number, zoom: number): string {
  let quadkey = '';
  for (let i = zoom; i > 0; i--) {
    let digit = 0;
    const mask = 1 << (i - 1);
    if ((x & mask) !== 0) digit += 1;
    if ((y & mask) !== 0) digit += 2;
    quadkey += digit.toString();
  }
  return quadkey;
}

function quadkeyToTile(quadkey: string): { x: number; y: number; z: number } {
  let x = 0, y = 0;
  const z = quadkey.length;
  for (let i = z; i > 0; i--) {
    const mask = 1 << (i - 1);
    const d = parseInt(quadkey[z - i], 10);
    if (d & 1) x |= mask;
    if (d & 2) y |= mask;
  }
  return { x, y, z };
}

function tileSizeAtZoom(zoom: number): number {
  const earthCircumference = 40075016.686;
  return earthCircumference / Math.pow(2, zoom);
}

export default function MapTileUrlBuilder() {
  const [serviceTab, setServiceTab] = useState(0);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({ open: false, message: '' });

  // XYZ state
  const [xyzBaseUrl, setXyzBaseUrl] = useState('https://{s}.tile.openstreetmap.org');
  const [xyzSubdomains, setXyzSubdomains] = useState('a,b,c');
  const [xyzExtension, setXyzExtension] = useState('png');
  const [xyzApiKey, setXyzApiKey] = useState('');
  const [xyzHeaders, setXyzHeaders] = useState<CustomHeader[]>([]);
  const [xyzSampleZ, setXyzSampleZ] = useState(10);
  const [xyzSampleX, setXyzSampleX] = useState(512);
  const [xyzSampleY, setXyzSampleY] = useState(341);

  // TMS state
  const [tmsBaseUrl, setTmsBaseUrl] = useState('https://tiles.example.com/tms');
  const [tmsVersion, setTmsVersion] = useState('1.0.0');
  const [tmsLayerName, setTmsLayerName] = useState('default');
  const [tmsTileMatrixSet, setTmsTileMatrixSet] = useState('GoogleMapsCompatible');
  const [tmsFlipY, setTmsFlipY] = useState(true);
  const [tmsExtension, setTmsExtension] = useState('png');
  const [tmsSampleZ, setTmsSampleZ] = useState(10);
  const [tmsSampleX, setTmsSampleX] = useState(512);
  const [tmsSampleY, setTmsSampleY] = useState(341);

  // WMTS state
  const [wmtsServiceUrl, setWmtsServiceUrl] = useState('https://services.example.com/wmts');
  const [wmtsLayer, setWmtsLayer] = useState('layer_name');
  const [wmtsStyle, setWmtsStyle] = useState('default');
  const [wmtsTileMatrixSet, setWmtsTileMatrixSet] = useState('EPSG:3857');
  const [wmtsFormat, setWmtsFormat] = useState('image/png');
  const [wmtsRestful, setWmtsRestful] = useState(false);
  const [wmtsSampleZ, setWmtsSampleZ] = useState(10);
  const [wmtsSampleX, setWmtsSampleX] = useState(512);
  const [wmtsSampleY, setWmtsSampleY] = useState(341);

  // Quadkey state
  const [qkZ, setQkZ] = useState(10);
  const [qkX, setQkX] = useState(512);
  const [qkY, setQkY] = useState(341);
  const [qkInput, setQkInput] = useState('');

  // Tile calculator state
  const [calcLat, setCalcLat] = useState(51.5074);
  const [calcLng, setCalcLng] = useState(-0.1278);
  const [calcZoom, setCalcZoom] = useState(15);

  // Presets
  const [showPresets, setShowPresets] = useState(false);
  const [presetFilter, setPresetFilter] = useState('All');

  const copyToClipboard = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setSnackbar({ open: true, message: `${label} copied!` });
  }, []);

  const xyzUrlTemplate = useMemo(() => {
    let url = `${xyzBaseUrl}/{z}/{x}/{y}.${xyzExtension}`;
    if (xyzApiKey) {
      url += url.includes('?') ? `&apikey=${xyzApiKey}` : `?apikey=${xyzApiKey}`;
    }
    return url;
  }, [xyzBaseUrl, xyzExtension, xyzApiKey]);

  const xyzSampleUrl = useMemo(() => {
    let url = xyzUrlTemplate
      .replace('{z}', String(xyzSampleZ))
      .replace('{x}', String(xyzSampleX))
      .replace('{y}', String(xyzSampleY));
    if (xyzSubdomains) {
      const subs = xyzSubdomains.split(',').map((s) => s.trim());
      url = url.replace('{s}', subs[0] || 'a');
    }
    return url;
  }, [xyzUrlTemplate, xyzSampleZ, xyzSampleX, xyzSampleY, xyzSubdomains]);

  const tmsUrlTemplate = useMemo(() => {
    return `${tmsBaseUrl}/${tmsVersion}/${tmsLayerName}/{z}/{x}/{y}.${tmsExtension}`;
  }, [tmsBaseUrl, tmsVersion, tmsLayerName, tmsExtension]);

  const tmsSampleUrl = useMemo(() => {
    const effectiveY = tmsFlipY ? Math.pow(2, tmsSampleZ) - 1 - tmsSampleY : tmsSampleY;
    return tmsUrlTemplate
      .replace('{z}', String(tmsSampleZ))
      .replace('{x}', String(tmsSampleX))
      .replace('{y}', String(effectiveY));
  }, [tmsUrlTemplate, tmsSampleZ, tmsSampleX, tmsSampleY, tmsFlipY]);

  const wmtsUrlGenerated = useMemo(() => {
    if (wmtsRestful) {
      return `${wmtsServiceUrl}/rest/${wmtsLayer}/${wmtsStyle}/${wmtsTileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}?FORMAT=${encodeURIComponent(wmtsFormat)}`;
    }
    return `${wmtsServiceUrl}?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${wmtsLayer}&STYLE=${wmtsStyle}&TILEMATRIXSET=${wmtsTileMatrixSet}&TILEMATRIX={TileMatrix}&TILEROW={TileRow}&TILECOL={TileCol}&FORMAT=${encodeURIComponent(wmtsFormat)}`;
  }, [wmtsServiceUrl, wmtsLayer, wmtsStyle, wmtsTileMatrixSet, wmtsFormat, wmtsRestful]);

  const wmtsSampleUrl = useMemo(() => {
    return wmtsUrlGenerated
      .replace('{TileMatrix}', String(wmtsSampleZ))
      .replace('{TileRow}', String(wmtsSampleY))
      .replace('{TileCol}', String(wmtsSampleX));
  }, [wmtsUrlGenerated, wmtsSampleZ, wmtsSampleX, wmtsSampleY]);

  const quadkeyResult = useMemo(() => {
    return tileToQuadkey(qkX, qkY, qkZ);
  }, [qkX, qkY, qkZ]);

  const quadkeyReverse = useMemo(() => {
    if (!qkInput || !/^[0-3]+$/.test(qkInput)) return null;
    return quadkeyToTile(qkInput);
  }, [qkInput]);

  const calcResult = useMemo(() => {
    const tile = latLngToTile(calcLat, calcLng, calcZoom);
    const bounds = tileToBounds(tile.x, tile.y, calcZoom);
    const totalTiles = Math.pow(2, calcZoom) * Math.pow(2, calcZoom);
    const tileSizeMeters = tileSizeAtZoom(calcZoom);
    return { tile, bounds, totalTiles, tileSizeMeters };
  }, [calcLat, calcLng, calcZoom]);

  const addHeader = () => setXyzHeaders([...xyzHeaders, { key: '', value: '' }]);
  const removeHeader = (i: number) => setXyzHeaders(xyzHeaders.filter((_, idx) => idx !== i));
  const updateHeader = (i: number, field: 'key' | 'value', val: string) => {
    const updated = [...xyzHeaders];
    updated[i][field] = val;
    setXyzHeaders(updated);
  };

  const applyPreset = (preset: TilePreset) => {
    setServiceTab(0);
    setXyzBaseUrl(preset.url.replace(/\/{z}\/{x}\/{y}.*$/, '').replace(/\/{z}\/{y}\/{x}.*$/, ''));
    setXyzSubdomains(preset.subdomains);
    setXyzExtension(preset.ext);
    const fullUrl = preset.url;
    if (fullUrl.includes('{apikey}')) {
      setXyzApiKey('YOUR_API_KEY');
    } else {
      setXyzApiKey('');
    }
    // For presets, just set the full URL as base
    setXyzBaseUrl(fullUrl.split('/{z}/')[0].split('/{z}')[0]);
    setShowPresets(false);
    setSnackbar({ open: true, message: `Applied preset: ${preset.name}` });
  };

  const presetCategories = useMemo(() => {
    const cats = new Set(TILE_PRESETS.map((p) => p.category));
    return ['All', ...Array.from(cats)];
  }, []);

  const filteredPresets = useMemo(() => {
    if (presetFilter === 'All') return TILE_PRESETS;
    return TILE_PRESETS.filter((p) => p.category === presetFilter);
  }, [presetFilter]);

  const renderUrlOutput = (template: string, sampleUrl: string, label: string) => (
    <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mt: 2 }}>
      <Typography variant="subtitle2" sx={{ color: '#90caf9', mb: 1 }}>
        {label} URL Template
      </Typography>
      <Box sx={{ bgcolor: '#0d0d0d', p: 1.5, borderRadius: 1, border: '1px solid #222', fontFamily: 'monospace', fontSize: 13, color: '#4caf50', wordBreak: 'break-all', mb: 1.5 }}>
        {template}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <Button size="small" variant="outlined" startIcon={<Copy size={14} />} onClick={() => copyToClipboard(template, 'URL template')} sx={{ textTransform: 'none', borderColor: '#333', color: '#ccc' }}>
          Copy Template
        </Button>
        <Button size="small" variant="outlined" startIcon={<Copy size={14} />} onClick={() => copyToClipboard(sampleUrl, 'Sample URL')} sx={{ textTransform: 'none', borderColor: '#333', color: '#ccc' }}>
          Copy Sample URL
        </Button>
      </Box>
      <Typography variant="caption" sx={{ color: '#888' }}>
        Sample URL:
      </Typography>
      <Box sx={{ bgcolor: '#0d0d0d', p: 1.5, borderRadius: 1, border: '1px solid #222', fontFamily: 'monospace', fontSize: 12, color: '#ffb74d', wordBreak: 'break-all' }}>
        {sampleUrl}
      </Box>
    </Paper>
  );

  return (
    <Box sx={{ bgcolor: '#0a0a0a', minHeight: '100vh', color: 'grey.300', p: 3, pt: 7 }}>
      <Link to="/" style={{ position: 'fixed', top: 12, left: 12, zIndex: 50, display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', backgroundColor: 'rgba(30,30,30,0.9)', color: '#ccc', borderRadius: 8, textDecoration: 'none', fontSize: 14, border: '1px solid #333' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
        Home
      </Link>

      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Globe size={32} /> Map Tile URL Builder
      </Typography>
      <Typography variant="body2" sx={{ color: '#888', mb: 3 }}>
        Build, preview, and test tile service URLs for XYZ, TMS, WMTS, and Quadkey (Bing) tile services
      </Typography>

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {/* Left Column - Service Configuration */}
        <Box sx={{ flex: '1 1 580px', minWidth: 0 }}>
          {/* Presets Section */}
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', mb: 2, overflow: 'hidden' }}>
            <Box
              sx={{ p: 1.5, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', '&:hover': { bgcolor: '#1a1a1a' } }}
              onClick={() => setShowPresets(!showPresets)}
            >
              <Typography variant="subtitle2" sx={{ color: '#90caf9', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Zap size={16} /> Popular Tile Server Presets
              </Typography>
              {showPresets ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </Box>
            {showPresets && (
              <Box sx={{ p: 2, pt: 0 }}>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1.5 }}>
                  {presetCategories.map((cat) => (
                    <Chip
                      key={cat}
                      label={cat}
                      size="small"
                      onClick={() => setPresetFilter(cat)}
                      sx={{
                        bgcolor: presetFilter === cat ? '#1e3a5f' : '#1a1a1a',
                        color: presetFilter === cat ? '#90caf9' : '#999',
                        border: presetFilter === cat ? '1px solid #2196f3' : '1px solid #333',
                        cursor: 'pointer',
                        '&:hover': { bgcolor: '#1e3a5f' },
                      }}
                    />
                  ))}
                </Box>
                <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                  {filteredPresets.map((preset, i) => (
                    <Box
                      key={i}
                      onClick={() => applyPreset(preset)}
                      sx={{
                        p: 1.5,
                        mb: 0.5,
                        borderRadius: 1,
                        border: '1px solid #222',
                        cursor: 'pointer',
                        '&:hover': { bgcolor: '#1a1a1a', borderColor: '#444' },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#e0e0e0' }}>{preset.name}</Typography>
                        <Chip label={preset.category} size="small" sx={{ bgcolor: '#1a1a1a', color: '#888', fontSize: 10, height: 20 }} />
                        <Chip label={`z0-${preset.maxZoom}`} size="small" sx={{ bgcolor: '#1a1a1a', color: '#888', fontSize: 10, height: 20 }} />
                      </Box>
                      <Typography variant="caption" sx={{ color: '#666', fontFamily: 'monospace', fontSize: 11, wordBreak: 'break-all' }}>
                        {preset.url}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Paper>

          {/* Service Type Tabs */}
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', mb: 2 }}>
            <Tabs
              value={serviceTab}
              onChange={(_, v) => setServiceTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: '1px solid #222', '& .MuiTab-root': { color: '#888', textTransform: 'none', minWidth: 80 }, '& .Mui-selected': { color: '#90caf9' }, '& .MuiTabs-indicator': { bgcolor: '#2196f3' } }}
            >
              <Tab label="XYZ" />
              <Tab label="TMS" />
              <Tab label="WMTS" />
              <Tab label="Quadkey (Bing)" />
              <Tab label="Vector Tiles" />
            </Tabs>

            <Box sx={{ p: 2.5 }}>
              {/* XYZ Tab */}
              {serviceTab === 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ color: '#90caf9', mb: 1.5 }}>
                    XYZ (Slippy Map) Tiles
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#666', mb: 2, display: 'block' }}>
                    Standard web map tile format using zoom/x/y coordinates. Used by OpenStreetMap, Google Maps, Leaflet, MapLibre, etc.
                  </Typography>

                  <TextField
                    fullWidth
                    size="small"
                    label="Base URL"
                    value={xyzBaseUrl}
                    onChange={(e) => setXyzBaseUrl(e.target.value)}
                    placeholder="https://{s}.tile.openstreetmap.org"
                    sx={{ mb: 2, ...inputSx }}
                    InputLabelProps={{ sx: { color: '#888' } }}
                  />

                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <TextField
                      size="small"
                      label="Subdomains"
                      value={xyzSubdomains}
                      onChange={(e) => setXyzSubdomains(e.target.value)}
                      placeholder="a,b,c"
                      sx={{ flex: 1, ...inputSx }}
                      InputLabelProps={{ sx: { color: '#888' } }}
                      helperText="Comma-separated subdomains for load balancing"
                      FormHelperTextProps={{ sx: { color: '#555' } }}
                    />
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <InputLabel sx={{ color: '#888' }}>Extension</InputLabel>
                      <Select
                        value={xyzExtension}
                        label="Extension"
                        onChange={(e) => setXyzExtension(e.target.value)}
                        sx={selectSx}
                      >
                        <MenuItem value="png">PNG</MenuItem>
                        <MenuItem value="jpg">JPG</MenuItem>
                        <MenuItem value="webp">WebP</MenuItem>
                        <MenuItem value="pbf">PBF (Vector)</MenuItem>
                        <MenuItem value="mvt">MVT (Vector)</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  <TextField
                    fullWidth
                    size="small"
                    label="API Key (optional)"
                    value={xyzApiKey}
                    onChange={(e) => setXyzApiKey(e.target.value)}
                    placeholder="Enter API key if required"
                    sx={{ mb: 2, ...inputSx }}
                    InputLabelProps={{ sx: { color: '#888' } }}
                  />

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="caption" sx={{ color: '#888' }}>Custom Headers</Typography>
                      <IconButton size="small" onClick={addHeader} sx={{ color: '#90caf9' }}><Plus size={14} /></IconButton>
                    </Box>
                    {xyzHeaders.map((h, i) => (
                      <Box key={i} sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
                        <TextField size="small" placeholder="Header name" value={h.key} onChange={(e) => updateHeader(i, 'key', e.target.value)} sx={{ flex: 1, ...inputSx }} InputLabelProps={{ sx: { color: '#888' } }} />
                        <TextField size="small" placeholder="Value" value={h.value} onChange={(e) => updateHeader(i, 'value', e.target.value)} sx={{ flex: 1, ...inputSx }} InputLabelProps={{ sx: { color: '#888' } }} />
                        <IconButton size="small" onClick={() => removeHeader(i)} sx={{ color: '#f44336' }}><Trash2 size={14} /></IconButton>
                      </Box>
                    ))}
                  </Box>

                  <Divider sx={{ borderColor: '#222', my: 2 }} />
                  <Typography variant="caption" sx={{ color: '#888', mb: 1, display: 'block' }}>Sample Tile Coordinates</Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <TextField size="small" type="number" label="Z" value={xyzSampleZ} onChange={(e) => setXyzSampleZ(Number(e.target.value))} sx={{ width: 80, ...inputSx }} InputLabelProps={{ sx: { color: '#888' } }} inputProps={{ min: 0, max: 22 }} />
                    <TextField size="small" type="number" label="X" value={xyzSampleX} onChange={(e) => setXyzSampleX(Number(e.target.value))} sx={{ width: 100, ...inputSx }} InputLabelProps={{ sx: { color: '#888' } }} />
                    <TextField size="small" type="number" label="Y" value={xyzSampleY} onChange={(e) => setXyzSampleY(Number(e.target.value))} sx={{ width: 100, ...inputSx }} InputLabelProps={{ sx: { color: '#888' } }} />
                  </Box>

                  {renderUrlOutput(xyzUrlTemplate, xyzSampleUrl, 'XYZ')}
                </Box>
              )}

              {/* TMS Tab */}
              {serviceTab === 1 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ color: '#90caf9', mb: 1.5 }}>
                    TMS (Tile Map Service)
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#666', mb: 2, display: 'block' }}>
                    OGC-style tile service. Key difference from XYZ: Y-axis can be flipped (origin at bottom-left instead of top-left).
                  </Typography>

                  <TextField fullWidth size="small" label="Base URL" value={tmsBaseUrl} onChange={(e) => setTmsBaseUrl(e.target.value)} sx={{ mb: 2, ...inputSx }} InputLabelProps={{ sx: { color: '#888' } }} />

                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <TextField size="small" label="Version" value={tmsVersion} onChange={(e) => setTmsVersion(e.target.value)} sx={{ width: 120, ...inputSx }} InputLabelProps={{ sx: { color: '#888' } }} />
                    <TextField size="small" label="Layer Name" value={tmsLayerName} onChange={(e) => setTmsLayerName(e.target.value)} sx={{ flex: 1, ...inputSx }} InputLabelProps={{ sx: { color: '#888' } }} />
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                    <TextField size="small" label="TileMatrixSet" value={tmsTileMatrixSet} onChange={(e) => setTmsTileMatrixSet(e.target.value)} sx={{ flex: 1, ...inputSx }} InputLabelProps={{ sx: { color: '#888' } }} />
                    <FormControl size="small" sx={{ minWidth: 100 }}>
                      <InputLabel sx={{ color: '#888' }}>Extension</InputLabel>
                      <Select value={tmsExtension} label="Extension" onChange={(e) => setTmsExtension(e.target.value)} sx={selectSx}>
                        <MenuItem value="png">PNG</MenuItem>
                        <MenuItem value="jpg">JPG</MenuItem>
                        <MenuItem value="webp">WebP</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  <FormControlLabel
                    control={<Switch checked={tmsFlipY} onChange={(e) => setTmsFlipY(e.target.checked)} sx={{ '& .MuiSwitch-thumb': { bgcolor: '#90caf9' }, '& .Mui-checked + .MuiSwitch-track': { bgcolor: '#1e3a5f' } }} />}
                    label={<Typography variant="body2" sx={{ color: '#ccc' }}>Flip Y-axis (y = 2^z - 1 - y)</Typography>}
                    sx={{ mb: 2 }}
                  />

                  {tmsFlipY && (
                    <Paper sx={{ bgcolor: '#1a1a0a', border: '1px solid #333', p: 1.5, mb: 2 }}>
                      <Typography variant="caption" sx={{ color: '#ffb74d' }}>
                        <Info size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                        Y-axis flip active: For zoom {tmsSampleZ}, original Y={tmsSampleY} becomes Y={Math.pow(2, tmsSampleZ) - 1 - tmsSampleY}
                      </Typography>
                    </Paper>
                  )}

                  <Divider sx={{ borderColor: '#222', my: 2 }} />
                  <Typography variant="caption" sx={{ color: '#888', mb: 1, display: 'block' }}>Sample Tile Coordinates</Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <TextField size="small" type="number" label="Z" value={tmsSampleZ} onChange={(e) => setTmsSampleZ(Number(e.target.value))} sx={{ width: 80, ...inputSx }} InputLabelProps={{ sx: { color: '#888' } }} inputProps={{ min: 0, max: 22 }} />
                    <TextField size="small" type="number" label="X" value={tmsSampleX} onChange={(e) => setTmsSampleX(Number(e.target.value))} sx={{ width: 100, ...inputSx }} InputLabelProps={{ sx: { color: '#888' } }} />
                    <TextField size="small" type="number" label="Y" value={tmsSampleY} onChange={(e) => setTmsSampleY(Number(e.target.value))} sx={{ width: 100, ...inputSx }} InputLabelProps={{ sx: { color: '#888' } }} />
                  </Box>

                  {renderUrlOutput(tmsUrlTemplate, tmsSampleUrl, 'TMS')}
                </Box>
              )}

              {/* WMTS Tab */}
              {serviceTab === 2 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ color: '#90caf9', mb: 1.5 }}>
                    WMTS (Web Map Tile Service)
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#666', mb: 2, display: 'block' }}>
                    OGC standard for serving pre-rendered geo-referenced map tiles. Supports KVP (key-value pair) and RESTful encoding.
                  </Typography>

                  <TextField fullWidth size="small" label="Service URL" value={wmtsServiceUrl} onChange={(e) => setWmtsServiceUrl(e.target.value)} sx={{ mb: 2, ...inputSx }} InputLabelProps={{ sx: { color: '#888' } }} />

                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <TextField size="small" label="Layer" value={wmtsLayer} onChange={(e) => setWmtsLayer(e.target.value)} sx={{ flex: 1, ...inputSx }} InputLabelProps={{ sx: { color: '#888' } }} />
                    <TextField size="small" label="Style" value={wmtsStyle} onChange={(e) => setWmtsStyle(e.target.value)} sx={{ flex: 1, ...inputSx }} InputLabelProps={{ sx: { color: '#888' } }} />
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <TextField size="small" label="TileMatrixSet" value={wmtsTileMatrixSet} onChange={(e) => setWmtsTileMatrixSet(e.target.value)} sx={{ flex: 1, ...inputSx }} InputLabelProps={{ sx: { color: '#888' } }} />
                    <FormControl size="small" sx={{ minWidth: 160 }}>
                      <InputLabel sx={{ color: '#888' }}>Format</InputLabel>
                      <Select value={wmtsFormat} label="Format" onChange={(e) => setWmtsFormat(e.target.value)} sx={selectSx}>
                        <MenuItem value="image/png">image/png</MenuItem>
                        <MenuItem value="image/jpeg">image/jpeg</MenuItem>
                        <MenuItem value="image/webp">image/webp</MenuItem>
                        <MenuItem value="application/vnd.mapbox-vector-tile">vector tile (MVT)</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  <FormControlLabel
                    control={<Switch checked={wmtsRestful} onChange={(e) => setWmtsRestful(e.target.checked)} sx={{ '& .MuiSwitch-thumb': { bgcolor: '#90caf9' }, '& .Mui-checked + .MuiSwitch-track': { bgcolor: '#1e3a5f' } }} />}
                    label={<Typography variant="body2" sx={{ color: '#ccc' }}>RESTful Encoding (vs KVP)</Typography>}
                    sx={{ mb: 2 }}
                  />

                  <Divider sx={{ borderColor: '#222', my: 2 }} />
                  <Typography variant="caption" sx={{ color: '#888', mb: 1, display: 'block' }}>Sample Tile Coordinates</Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <TextField size="small" type="number" label="TileMatrix (Z)" value={wmtsSampleZ} onChange={(e) => setWmtsSampleZ(Number(e.target.value))} sx={{ width: 120, ...inputSx }} InputLabelProps={{ sx: { color: '#888' } }} inputProps={{ min: 0, max: 22 }} />
                    <TextField size="small" type="number" label="TileCol (X)" value={wmtsSampleX} onChange={(e) => setWmtsSampleX(Number(e.target.value))} sx={{ width: 100, ...inputSx }} InputLabelProps={{ sx: { color: '#888' } }} />
                    <TextField size="small" type="number" label="TileRow (Y)" value={wmtsSampleY} onChange={(e) => setWmtsSampleY(Number(e.target.value))} sx={{ width: 100, ...inputSx }} InputLabelProps={{ sx: { color: '#888' } }} />
                  </Box>

                  {renderUrlOutput(wmtsUrlGenerated, wmtsSampleUrl, 'WMTS')}
                </Box>
              )}

              {/* Quadkey Tab */}
              {serviceTab === 3 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ color: '#90caf9', mb: 1.5 }}>
                    Quadkey (Bing Maps) Tiles
                  </Typography>
                  <Paper sx={{ bgcolor: '#0d1117', border: '1px solid #222', p: 2, mb: 2 }}>
                    <Typography variant="caption" sx={{ color: '#aaa', lineHeight: 1.7 }}>
                      <strong style={{ color: '#90caf9' }}>Quadkey encoding</strong> represents tile coordinates as a single string. Each zoom level adds one digit (0-3):<br />
                      0 = top-left, 1 = top-right, 2 = bottom-left, 3 = bottom-right.<br />
                      The quadkey is built by interleaving the bits of x and y, from MSB to LSB.<br />
                      Example: z=3, x=5, y=2 produces quadkey &quot;213&quot;
                    </Typography>
                  </Paper>

                  <Typography variant="subtitle2" sx={{ color: '#e0e0e0', mb: 1 }}>Tile Coords to Quadkey</Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <TextField size="small" type="number" label="Zoom (Z)" value={qkZ} onChange={(e) => setQkZ(Number(e.target.value))} sx={{ width: 100, ...inputSx }} InputLabelProps={{ sx: { color: '#888' } }} inputProps={{ min: 1, max: 23 }} />
                    <TextField size="small" type="number" label="X" value={qkX} onChange={(e) => setQkX(Number(e.target.value))} sx={{ width: 100, ...inputSx }} InputLabelProps={{ sx: { color: '#888' } }} />
                    <TextField size="small" type="number" label="Y" value={qkY} onChange={(e) => setQkY(Number(e.target.value))} sx={{ width: 100, ...inputSx }} InputLabelProps={{ sx: { color: '#888' } }} />
                  </Box>
                  <Paper sx={{ bgcolor: '#0d0d0d', border: '1px solid #222', p: 2, mb: 3 }}>
                    <Typography variant="caption" sx={{ color: '#888' }}>Quadkey:</Typography>
                    <Box sx={{ fontFamily: 'monospace', fontSize: 18, color: '#4caf50', mt: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                      {quadkeyResult || '(invalid)'}
                      {quadkeyResult && (
                        <IconButton size="small" onClick={() => copyToClipboard(quadkeyResult, 'Quadkey')} sx={{ color: '#888' }}>
                          <Copy size={14} />
                        </IconButton>
                      )}
                    </Box>
                    <Typography variant="caption" sx={{ color: '#666', mt: 1, display: 'block' }}>
                      Bing Maps URL: https://ecn.t0.tiles.virtualearth.net/tiles/a{quadkeyResult}.jpeg?g=587
                    </Typography>
                  </Paper>

                  <Divider sx={{ borderColor: '#222', my: 2 }} />
                  <Typography variant="subtitle2" sx={{ color: '#e0e0e0', mb: 1 }}>Quadkey to Tile Coords</Typography>
                  <TextField
                    fullWidth
                    size="small"
                    label="Quadkey Input"
                    value={qkInput}
                    onChange={(e) => setQkInput(e.target.value)}
                    placeholder="Enter quadkey (e.g., 0321)"
                    sx={{ mb: 2, ...inputSx }}
                    InputLabelProps={{ sx: { color: '#888' } }}
                    helperText="Only digits 0-3 are valid"
                    FormHelperTextProps={{ sx: { color: '#555' } }}
                  />
                  {quadkeyReverse && (
                    <Paper sx={{ bgcolor: '#0d0d0d', border: '1px solid #222', p: 2 }}>
                      <Typography variant="caption" sx={{ color: '#888' }}>Result:</Typography>
                      <Box sx={{ fontFamily: 'monospace', fontSize: 14, color: '#90caf9', mt: 0.5 }}>
                        Z: {quadkeyReverse.z}, X: {quadkeyReverse.x}, Y: {quadkeyReverse.y}
                      </Box>
                    </Paper>
                  )}
                  {qkInput && !quadkeyReverse && (
                    <Typography variant="caption" sx={{ color: '#f44336' }}>Invalid quadkey. Only digits 0-3 are allowed.</Typography>
                  )}
                </Box>
              )}

              {/* Vector Tiles Tab */}
              {serviceTab === 4 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ color: '#90caf9', mb: 1.5 }}>
                    Vector Tiles
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#666', mb: 2, display: 'block' }}>
                    Vector tiles use PBF (Protocol Buffers) or MVT format. They contain geometry and attribute data that is styled client-side.
                  </Typography>

                  <Paper sx={{ bgcolor: '#0d1117', border: '1px solid #222', p: 2, mb: 2 }}>
                    <Typography variant="body2" sx={{ color: '#90caf9', fontWeight: 600, mb: 1 }}>Common Vector Tile URL Patterns</Typography>
                    <Box sx={{ fontFamily: 'monospace', fontSize: 12, color: '#aaa' }}>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="caption" sx={{ color: '#4caf50' }}>Mapbox Vector Tiles:</Typography><br />
                        https://api.mapbox.com/v4/&#123;tileset_id&#125;/&#123;z&#125;/&#123;x&#125;/&#123;y&#125;.mvt?access_token=TOKEN
                      </Box>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="caption" sx={{ color: '#4caf50' }}>OpenMapTiles:</Typography><br />
                        https://&#123;s&#125;.tiles.example.com/data/v3/&#123;z&#125;/&#123;x&#125;/&#123;y&#125;.pbf
                      </Box>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="caption" sx={{ color: '#4caf50' }}>GeoServer Vector Tiles:</Typography><br />
                        https://geoserver.example.com/gwc/service/tms/1.0.0/workspace:layer@EPSG:900913@pbf/&#123;z&#125;/&#123;x&#125;/&#123;y&#125;.pbf
                      </Box>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="caption" sx={{ color: '#4caf50' }}>Esri Vector Tiles:</Typography><br />
                        https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer/tile/&#123;z&#125;/&#123;y&#125;/&#123;x&#125;.pbf
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: '#4caf50' }}>Maptiler:</Typography><br />
                        https://api.maptiler.com/tiles/v3/&#123;z&#125;/&#123;x&#125;/&#123;y&#125;.pbf?key=YOUR_KEY
                      </Box>
                    </Box>
                  </Paper>

                  <Typography variant="body2" sx={{ color: '#aaa', mb: 1 }}>
                    Vector tiles require a style document (Mapbox GL Style Specification) for rendering. Use the XYZ tab to build the tile URL, then reference it in your style JSON.
                  </Typography>
                  <Paper sx={{ bgcolor: '#0d0d0d', border: '1px solid #222', p: 2 }}>
                    <Typography variant="caption" sx={{ color: '#888', mb: 1, display: 'block' }}>Example style.json source reference:</Typography>
                    <Box sx={{ fontFamily: 'monospace', fontSize: 12, color: '#ffb74d', whiteSpace: 'pre' }}>
{`{
  "sources": {
    "my-tiles": {
      "type": "vector",
      "tiles": [
        "https://tiles.example.com/{z}/{x}/{y}.pbf"
      ],
      "maxzoom": 14
    }
  }
}`}
                    </Box>
                  </Paper>
                </Box>
              )}
            </Box>
          </Paper>
        </Box>

        {/* Right Column - Calculator & Info */}
        <Box sx={{ flex: '1 1 380px', minWidth: 0 }}>
          {/* Tile Coordinate Calculator */}
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2.5, mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              <MapPin size={18} /> Tile Coordinate Calculator
            </Typography>
            <Typography variant="caption" sx={{ color: '#666', mb: 2, display: 'block' }}>
              Convert latitude/longitude to tile coordinates at a given zoom level.
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField size="small" type="number" label="Latitude" value={calcLat} onChange={(e) => setCalcLat(Number(e.target.value))} sx={{ flex: 1, ...inputSx }} InputLabelProps={{ sx: { color: '#888' } }} inputProps={{ step: 0.0001, min: -85.0511, max: 85.0511 }} />
              <TextField size="small" type="number" label="Longitude" value={calcLng} onChange={(e) => setCalcLng(Number(e.target.value))} sx={{ flex: 1, ...inputSx }} InputLabelProps={{ sx: { color: '#888' } }} inputProps={{ step: 0.0001, min: -180, max: 180 }} />
            </Box>
            <TextField size="small" type="number" label="Zoom Level" value={calcZoom} onChange={(e) => setCalcZoom(Math.min(22, Math.max(0, Number(e.target.value))))} sx={{ width: 120, mb: 2, ...inputSx }} InputLabelProps={{ sx: { color: '#888' } }} inputProps={{ min: 0, max: 22 }} />

            <Paper sx={{ bgcolor: '#0d0d0d', border: '1px solid #222', p: 2 }}>
              <Box sx={{ display: 'flex', gap: 3, mb: 1.5 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#888' }}>Tile X</Typography>
                  <Typography variant="h6" sx={{ fontFamily: 'monospace', color: '#4caf50' }}>{calcResult.tile.x}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#888' }}>Tile Y</Typography>
                  <Typography variant="h6" sx={{ fontFamily: 'monospace', color: '#4caf50' }}>{calcResult.tile.y}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#888' }}>Zoom</Typography>
                  <Typography variant="h6" sx={{ fontFamily: 'monospace', color: '#90caf9' }}>{calcZoom}</Typography>
                </Box>
              </Box>

              <Divider sx={{ borderColor: '#222', my: 1.5 }} />

              <Typography variant="caption" sx={{ color: '#888', display: 'block', mb: 0.5 }}>Tile Bounds:</Typography>
              <Box sx={{ fontFamily: 'monospace', fontSize: 12, color: '#aaa' }}>
                <Box>North: {calcResult.bounds.north.toFixed(6)}</Box>
                <Box>South: {calcResult.bounds.south.toFixed(6)}</Box>
                <Box>West: {calcResult.bounds.west.toFixed(6)}</Box>
                <Box>East: {calcResult.bounds.east.toFixed(6)}</Box>
              </Box>

              <Divider sx={{ borderColor: '#222', my: 1.5 }} />

              <Typography variant="caption" sx={{ color: '#888', display: 'block', mb: 0.5 }}>Quadkey:</Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#ffb74d' }}>
                {tileToQuadkey(calcResult.tile.x, calcResult.tile.y, calcZoom)}
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Copy size={12} />}
                  onClick={() => copyToClipboard(`${calcZoom}/${calcResult.tile.x}/${calcResult.tile.y}`, 'Tile coords')}
                  sx={{ textTransform: 'none', borderColor: '#333', color: '#ccc', fontSize: 11 }}
                >
                  Copy z/x/y
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Copy size={12} />}
                  onClick={() => copyToClipboard(`${calcResult.bounds.west.toFixed(6)},${calcResult.bounds.south.toFixed(6)},${calcResult.bounds.east.toFixed(6)},${calcResult.bounds.north.toFixed(6)}`, 'Bounds')}
                  sx={{ textTransform: 'none', borderColor: '#333', color: '#ccc', fontSize: 11 }}
                >
                  Copy BBOX
                </Button>
              </Box>
            </Paper>

            <Paper sx={{ bgcolor: '#0d1117', border: '1px solid #1e3a5f', p: 1.5, mt: 1.5 }}>
              <Typography variant="caption" sx={{ color: '#666', fontFamily: 'monospace', fontSize: 11 }}>
                x = floor((lon + 180) / 360 * 2^z)<br />
                y = floor((1 - ln(tan(lat) + sec(lat)) / pi) / 2 * 2^z)
              </Typography>
            </Paper>
          </Paper>

          {/* Tile Grid Info */}
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2.5, mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Grid3x3 size={18} /> Tile Grid Info
            </Typography>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#888', borderColor: '#222', fontSize: 11, py: 0.5 }}>Zoom</TableCell>
                    <TableCell sx={{ color: '#888', borderColor: '#222', fontSize: 11, py: 0.5 }}>Tiles</TableCell>
                    <TableCell sx={{ color: '#888', borderColor: '#222', fontSize: 11, py: 0.5 }}>Tile Size (m)</TableCell>
                    <TableCell sx={{ color: '#888', borderColor: '#222', fontSize: 11, py: 0.5 }}>Scale (approx)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((z) => {
                    const tiles = Math.pow(2, z);
                    const totalTiles = tiles * tiles;
                    const tileSize = tileSizeAtZoom(z);
                    const meterPerPixel = tileSize / 256;
                    const dpi = 96;
                    const scale = Math.round(meterPerPixel * dpi / 0.0254);
                    return (
                      <TableRow key={z} sx={{ bgcolor: z === calcZoom ? '#1a2a1a' : 'transparent', '&:hover': { bgcolor: '#1a1a1a' } }}>
                        <TableCell sx={{ color: z === calcZoom ? '#4caf50' : '#ccc', borderColor: '#222', fontSize: 11, py: 0.3, fontWeight: z === calcZoom ? 700 : 400 }}>{z}</TableCell>
                        <TableCell sx={{ color: '#aaa', borderColor: '#222', fontSize: 11, py: 0.3, fontFamily: 'monospace' }}>{totalTiles.toLocaleString()}</TableCell>
                        <TableCell sx={{ color: '#aaa', borderColor: '#222', fontSize: 11, py: 0.3, fontFamily: 'monospace' }}>{tileSize >= 1000 ? `${(tileSize / 1000).toFixed(1)} km` : `${tileSize.toFixed(1)} m`}</TableCell>
                        <TableCell sx={{ color: '#aaa', borderColor: '#222', fontSize: 11, py: 0.3, fontFamily: 'monospace' }}>1:{scale.toLocaleString()}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Leaflet / MapLibre Usage */}
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Layers size={18} /> Usage Examples
            </Typography>

            <Typography variant="caption" sx={{ color: '#90caf9', display: 'block', mb: 0.5 }}>Leaflet:</Typography>
            <Box sx={{ bgcolor: '#0d0d0d', border: '1px solid #222', p: 1.5, borderRadius: 1, mb: 2, fontFamily: 'monospace', fontSize: 11, color: '#aaa', whiteSpace: 'pre-wrap' }}>
{`L.tileLayer('${xyzUrlTemplate}', {
  subdomains: '${xyzSubdomains.replace(/,/g, '')}',
  maxZoom: 19,
  attribution: '...'
}).addTo(map);`}
            </Box>

            <Typography variant="caption" sx={{ color: '#90caf9', display: 'block', mb: 0.5 }}>MapLibre GL:</Typography>
            <Box sx={{ bgcolor: '#0d0d0d', border: '1px solid #222', p: 1.5, borderRadius: 1, mb: 2, fontFamily: 'monospace', fontSize: 11, color: '#aaa', whiteSpace: 'pre-wrap' }}>
{`map.addSource('tiles', {
  type: 'raster',
  tiles: ['${xyzUrlTemplate.replace('{s}', xyzSubdomains.split(',')[0]?.trim() || 'a')}'],
  tileSize: 256
});`}
            </Box>

            <Typography variant="caption" sx={{ color: '#90caf9', display: 'block', mb: 0.5 }}>OpenLayers:</Typography>
            <Box sx={{ bgcolor: '#0d0d0d', border: '1px solid #222', p: 1.5, borderRadius: 1, fontFamily: 'monospace', fontSize: 11, color: '#aaa', whiteSpace: 'pre-wrap' }}>
{`new ol.layer.Tile({
  source: new ol.source.XYZ({
    url: '${xyzUrlTemplate}'
  })
})`}
            </Box>
          </Paper>
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ bgcolor: '#1b5e20', color: '#fff' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
