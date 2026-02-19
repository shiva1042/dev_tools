import { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Chip,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { Copy, RotateCcw, MapPin, Globe, List, Crosshair } from 'lucide-react';
import { Link } from 'react-router-dom';

type InputMode = 'manual' | 'center' | 'coordinates' | 'presets';

interface BBox {
  minLon: number;
  minLat: number;
  maxLon: number;
  maxLat: number;
}

const PRESETS: Record<string, { label: string; bbox: BBox }> = {
  world: { label: 'World', bbox: { minLon: -180, minLat: -90, maxLon: 180, maxLat: 90 } },
  usa: { label: 'USA', bbox: { minLon: -125.0, minLat: 24.396, maxLon: -66.934, maxLat: 49.384 } },
  europe: { label: 'Europe', bbox: { minLon: -31.266, minLat: 34.5428, maxLon: 39.869, maxLat: 71.185 } },
  asia: { label: 'Asia', bbox: { minLon: 25.0, minLat: -12.0, maxLon: 180.0, maxLat: 82.0 } },
  africa: { label: 'Africa', bbox: { minLon: -17.625, minLat: -34.833, maxLon: 51.417, maxLat: 37.35 } },
  south_america: { label: 'South America', bbox: { minLon: -81.326, minLat: -56.0, maxLon: -34.793, maxLat: 12.437 } },
  australia: { label: 'Australia', bbox: { minLon: 113.338, minLat: -43.634, maxLon: 153.569, maxLat: -10.668 } },
  uk: { label: 'United Kingdom', bbox: { minLon: -8.196, minLat: 49.674, maxLon: 1.879, maxLat: 60.862 } },
  india: { label: 'India', bbox: { minLon: 68.186, minLat: 6.747, maxLon: 97.395, maxLat: 35.505 } },
  brazil: { label: 'Brazil', bbox: { minLon: -73.985, minLat: -33.742, maxLon: -34.793, maxLat: 5.271 } },
  japan: { label: 'Japan', bbox: { minLon: 122.934, minLat: 24.396, maxLon: 153.987, maxLat: 45.551 } },
  china: { label: 'China', bbox: { minLon: 73.675, minLat: 18.198, maxLon: 135.086, maxLat: 53.56 } },
  germany: { label: 'Germany', bbox: { minLon: 5.866, minLat: 47.271, maxLon: 15.042, maxLat: 55.058 } },
  france: { label: 'France', bbox: { minLon: -5.142, minLat: 41.334, maxLon: 9.56, maxLat: 51.089 } },
  canada: { label: 'Canada', bbox: { minLon: -141.0, minLat: 41.676, maxLon: -52.617, maxLat: 83.111 } },
  new_york: { label: 'New York City', bbox: { minLon: -74.259, minLat: 40.496, maxLon: -73.7, maxLat: 40.915 } },
  london: { label: 'London', bbox: { minLon: -0.51, minLat: 51.286, maxLon: 0.334, maxLat: 51.692 } },
  tokyo: { label: 'Tokyo', bbox: { minLon: 138.941, minLat: 35.524, maxLon: 139.919, maxLat: 35.818 } },
  paris: { label: 'Paris', bbox: { minLon: 2.225, minLat: 48.816, maxLon: 2.47, maxLat: 48.902 } },
  sydney: { label: 'Sydney', bbox: { minLon: 150.52, minLat: -34.118, maxLon: 151.343, maxLat: -33.578 } },
};

const KM_PER_DEG_LAT = 111.32;
const kmPerDegLon = (lat: number) => 111.32 * Math.cos((lat * Math.PI) / 180);

function approxAreaSqKm(bbox: BBox): number {
  const widthKm = Math.abs(bbox.maxLon - bbox.minLon) * kmPerDegLon((bbox.minLat + bbox.maxLat) / 2);
  const heightKm = Math.abs(bbox.maxLat - bbox.minLat) * KM_PER_DEG_LAT;
  return widthKm * heightKm;
}

function formatNumber(n: number, decimals = 6): string {
  return Number(n.toFixed(decimals)).toString();
}

const inputSx = {
  '& .MuiInputBase-root': { bgcolor: '#1a1a1a', color: 'grey.300' },
  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
  '& .MuiInputLabel-root': { color: 'grey.500' },
  '& .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
};

const selectSx = {
  bgcolor: '#1a1a1a',
  color: 'grey.300',
  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
  '& .MuiSvgIcon-root': { color: 'grey.500' },
};

export default function BBoxGenerator() {
  const [tab, setTab] = useState<InputMode>('manual');
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [swapCoords, setSwapCoords] = useState(false);

  // Manual inputs
  const [minLon, setMinLon] = useState<string>('-122.5');
  const [minLat, setMinLat] = useState<string>('37.7');
  const [maxLon, setMaxLon] = useState<string>('-122.3');
  const [maxLat, setMaxLat] = useState<string>('37.85');

  // Center mode
  const [centerLat, setCenterLat] = useState<string>('37.775');
  const [centerLng, setCenterLng] = useState<string>('-122.4');
  const [widthVal, setWidthVal] = useState<string>('0.2');
  const [heightVal, setHeightVal] = useState<string>('0.15');
  const [centerUnit, setCenterUnit] = useState<'degrees' | 'km'>('degrees');

  // Coordinates mode
  const [coordText, setCoordText] = useState<string>('-122.4194,37.7749\n-122.4098,37.7849\n-122.3894,37.7649\n-122.4294,37.7549');

  // Preset mode
  const [selectedPreset, setSelectedPreset] = useState<string>('usa');

  const bbox = useMemo<BBox>(() => {
    if (tab === 'manual') {
      return {
        minLon: parseFloat(minLon) || 0,
        minLat: parseFloat(minLat) || 0,
        maxLon: parseFloat(maxLon) || 0,
        maxLat: parseFloat(maxLat) || 0,
      };
    }
    if (tab === 'center') {
      const cLat = parseFloat(centerLat) || 0;
      const cLng = parseFloat(centerLng) || 0;
      let w = parseFloat(widthVal) || 0;
      let h = parseFloat(heightVal) || 0;
      if (centerUnit === 'km') {
        h = h / KM_PER_DEG_LAT;
        w = w / kmPerDegLon(cLat);
      }
      return {
        minLon: cLng - w / 2,
        minLat: cLat - h / 2,
        maxLon: cLng + w / 2,
        maxLat: cLat + h / 2,
      };
    }
    if (tab === 'coordinates') {
      const coords: [number, number][] = [];
      const lines = coordText.split('\n').filter((l) => l.trim());
      for (const line of lines) {
        const parts = line.trim().split(/[\s,;]+/).map(Number);
        if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          coords.push([parts[0], parts[1]]);
        }
      }
      if (coords.length === 0) return { minLon: 0, minLat: 0, maxLon: 0, maxLat: 0 };
      const lons = coords.map((c) => c[0]);
      const lats = coords.map((c) => c[1]);
      return {
        minLon: Math.min(...lons),
        minLat: Math.min(...lats),
        maxLon: Math.max(...lons),
        maxLat: Math.max(...lats),
      };
    }
    // presets
    return PRESETS[selectedPreset]?.bbox ?? { minLon: 0, minLat: 0, maxLon: 0, maxLat: 0 };
  }, [tab, minLon, minLat, maxLon, maxLat, centerLat, centerLng, widthVal, heightVal, centerUnit, coordText, selectedPreset]);

  const widthDeg = Math.abs(bbox.maxLon - bbox.minLon);
  const heightDeg = Math.abs(bbox.maxLat - bbox.minLat);
  const centerPoint = { lat: (bbox.minLat + bbox.maxLat) / 2, lon: (bbox.minLon + bbox.maxLon) / 2 };
  const widthKm = widthDeg * kmPerDegLon(centerPoint.lat);
  const heightKm = heightDeg * KM_PER_DEG_LAT;
  const areaSqKm = approxAreaSqKm(bbox);

  const formats = useMemo(() => {
    const { minLon: w, minLat: s, maxLon: e, maxLat: n } = bbox;
    const f = (v: number) => formatNumber(v);
    const p = swapCoords;

    return [
      {
        label: 'Comma-separated (OGC/GeoServer)',
        value: p ? `${f(s)},${f(w)},${f(n)},${f(e)}` : `${f(w)},${f(s)},${f(e)},${f(n)}`,
      },
      {
        label: 'Space-separated',
        value: p ? `${f(s)} ${f(w)} ${f(n)} ${f(e)}` : `${f(w)} ${f(s)} ${f(e)} ${f(n)}`,
      },
      {
        label: 'Array',
        value: p ? `[${f(s)}, ${f(w)}, ${f(n)}, ${f(e)}]` : `[${f(w)}, ${f(s)}, ${f(e)}, ${f(n)}]`,
      },
      {
        label: 'GeoJSON Polygon',
        value: JSON.stringify({
          type: 'Polygon',
          coordinates: [[[w, s], [e, s], [e, n], [w, n], [w, s]]],
        }),
      },
      {
        label: 'GeoJSON bbox property',
        value: JSON.stringify({ bbox: [w, s, e, n] }),
      },
      {
        label: 'WKT',
        value: `POLYGON((${f(w)} ${f(s)}, ${f(e)} ${f(s)}, ${f(e)} ${f(n)}, ${f(w)} ${f(n)}, ${f(w)} ${f(s)}))`,
      },
      {
        label: 'WMS BBOX parameter',
        value: `&BBOX=${f(w)},${f(s)},${f(e)},${f(n)}`,
      },
      {
        label: 'Leaflet bounds',
        value: `L.latLngBounds([[${f(s)},${f(w)}],[${f(n)},${f(e)}]])`,
      },
      {
        label: 'OpenLayers extent',
        value: `[${f(w)}, ${f(s)}, ${f(e)}, ${f(n)}]`,
      },
      {
        label: 'ArcGIS JSON',
        value: JSON.stringify({
          xmin: w,
          ymin: s,
          xmax: e,
          ymax: n,
          spatialReference: { wkid: 4326 },
        }),
      },
    ];
  }, [bbox, swapCoords]);

  const handleCopy = useCallback(async (text: string) => {
    await navigator.clipboard.writeText(text);
    setSnackbar({ open: true, message: 'Copied to clipboard!' });
  }, []);

  const handleReset = useCallback(() => {
    setMinLon('-122.5');
    setMinLat('37.7');
    setMaxLon('-122.3');
    setMaxLat('37.85');
    setCenterLat('37.775');
    setCenterLng('-122.4');
    setWidthVal('0.2');
    setHeightVal('0.15');
    setCoordText('-122.4194,37.7749\n-122.4098,37.7849\n-122.3894,37.7649\n-122.4294,37.7549');
    setSelectedPreset('usa');
  }, []);

  const applyPreset = useCallback((key: string) => {
    setSelectedPreset(key);
    const p = PRESETS[key];
    if (p) {
      setMinLon(String(p.bbox.minLon));
      setMinLat(String(p.bbox.minLat));
      setMaxLon(String(p.bbox.maxLon));
      setMaxLat(String(p.bbox.maxLat));
    }
  }, []);

  const formatArea = (sqKm: number): string => {
    if (sqKm > 1_000_000) return `${(sqKm / 1_000_000).toFixed(2)} M km²`;
    if (sqKm > 1_000) return `${(sqKm / 1_000).toFixed(2)} K km²`;
    return `${sqKm.toFixed(2)} km²`;
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a', color: 'grey.300' }}>
      <Link to="/" style={{ position: 'fixed', top: 12, left: 12, zIndex: 50, display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', backgroundColor: 'rgba(30,30,30,0.9)', color: '#ccc', borderRadius: 8, textDecoration: 'none', fontSize: 14, border: '1px solid #333' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        Home
      </Link>

      <Box sx={{ maxWidth: 1400, mx: 'auto', pt: 7, px: 3, pb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Globe size={28} color="#60a5fa" />
          <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
            Bounding Box Generator
          </Typography>
          <Tooltip title="Reset all">
            <IconButton onClick={handleReset} sx={{ color: 'grey.500', ml: 'auto' }}>
              <RotateCcw size={18} />
            </IconButton>
          </Tooltip>
        </Box>

        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', lg: 'row' } }}>
          {/* Left: Input */}
          <Box sx={{ flex: '0 0 480px', minWidth: 0 }}>
            <Paper sx={{ bgcolor: '#111', border: '1px solid #222', mb: 2 }}>
              <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
                variant="fullWidth"
                sx={{
                  borderBottom: '1px solid #222',
                  '& .MuiTab-root': { color: 'grey.500', fontSize: 13, minHeight: 44 },
                  '& .Mui-selected': { color: '#60a5fa' },
                }}
              >
                <Tab icon={<MapPin size={14} />} iconPosition="start" label="Manual" value="manual" />
                <Tab icon={<Crosshair size={14} />} iconPosition="start" label="Center" value="center" />
                <Tab icon={<List size={14} />} iconPosition="start" label="Coords" value="coordinates" />
                <Tab icon={<Globe size={14} />} iconPosition="start" label="Presets" value="presets" />
              </Tabs>

              <Box sx={{ p: 2.5 }}>
                {tab === 'manual' && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField fullWidth size="small" label="West (Min Longitude)" value={minLon} onChange={(e) => setMinLon(e.target.value)} type="number" inputProps={{ step: 0.001 }} sx={inputSx} />
                    <TextField fullWidth size="small" label="South (Min Latitude)" value={minLat} onChange={(e) => setMinLat(e.target.value)} type="number" inputProps={{ step: 0.001 }} sx={inputSx} />
                    <TextField fullWidth size="small" label="East (Max Longitude)" value={maxLon} onChange={(e) => setMaxLon(e.target.value)} type="number" inputProps={{ step: 0.001 }} sx={inputSx} />
                    <TextField fullWidth size="small" label="North (Max Latitude)" value={maxLat} onChange={(e) => setMaxLat(e.target.value)} type="number" inputProps={{ step: 0.001 }} sx={inputSx} />
                  </Box>
                )}

                {tab === 'center' && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField fullWidth size="small" label="Center Latitude" value={centerLat} onChange={(e) => setCenterLat(e.target.value)} type="number" inputProps={{ step: 0.001 }} sx={inputSx} />
                    <TextField fullWidth size="small" label="Center Longitude" value={centerLng} onChange={(e) => setCenterLng(e.target.value)} type="number" inputProps={{ step: 0.001 }} sx={inputSx} />
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <TextField fullWidth size="small" label={`Width (${centerUnit})`} value={widthVal} onChange={(e) => setWidthVal(e.target.value)} type="number" inputProps={{ step: 0.01 }} sx={inputSx} />
                      <TextField fullWidth size="small" label={`Height (${centerUnit})`} value={heightVal} onChange={(e) => setHeightVal(e.target.value)} type="number" inputProps={{ step: 0.01 }} sx={inputSx} />
                    </Box>
                    <FormControl fullWidth size="small">
                      <InputLabel sx={{ color: 'grey.500' }}>Unit</InputLabel>
                      <Select value={centerUnit} label="Unit" onChange={(e) => setCenterUnit(e.target.value as 'degrees' | 'km')} sx={selectSx}>
                        <MenuItem value="degrees">Degrees</MenuItem>
                        <MenuItem value="km">Kilometers</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                )}

                {tab === 'coordinates' && (
                  <Box>
                    <Typography variant="caption" sx={{ color: 'grey.500', mb: 1, display: 'block' }}>
                      Paste coordinates (lon,lat per line). Accepts comma, space, or semicolon separators.
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={8}
                      value={coordText}
                      onChange={(e) => setCoordText(e.target.value)}
                      placeholder="-122.4194,37.7749&#10;-122.4098,37.7849"
                      sx={{ ...inputSx, '& .MuiInputBase-root': { ...inputSx['& .MuiInputBase-root'], fontFamily: 'monospace', fontSize: 13 } }}
                    />
                  </Box>
                )}

                {tab === 'presets' && (
                  <Box>
                    <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                      <InputLabel sx={{ color: 'grey.500' }}>Select area</InputLabel>
                      <Select value={selectedPreset} label="Select area" onChange={(e) => applyPreset(e.target.value)} sx={selectSx}>
                        <MenuItem disabled><em>Continents</em></MenuItem>
                        {['world', 'europe', 'asia', 'africa', 'south_america', 'australia'].map((k) => (
                          <MenuItem key={k} value={k}>{PRESETS[k].label}</MenuItem>
                        ))}
                        <MenuItem disabled><em>Countries</em></MenuItem>
                        {['usa', 'uk', 'india', 'brazil', 'japan', 'china', 'germany', 'france', 'canada'].map((k) => (
                          <MenuItem key={k} value={k}>{PRESETS[k].label}</MenuItem>
                        ))}
                        <MenuItem disabled><em>Cities</em></MenuItem>
                        {['new_york', 'london', 'tokyo', 'paris', 'sydney'].map((k) => (
                          <MenuItem key={k} value={k}>{PRESETS[k].label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                      {Object.entries(PRESETS).map(([key, { label }]) => (
                        <Chip
                          key={key}
                          label={label}
                          size="small"
                          onClick={() => applyPreset(key)}
                          sx={{
                            bgcolor: selectedPreset === key ? '#1e3a5f' : '#1a1a1a',
                            color: selectedPreset === key ? '#60a5fa' : 'grey.400',
                            border: `1px solid ${selectedPreset === key ? '#2563eb' : '#333'}`,
                            cursor: 'pointer',
                            '&:hover': { bgcolor: '#222' },
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            </Paper>

            {/* Bbox Info */}
            <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2.5 }}>
              <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1.5 }}>
                Bounding Box Info
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'grey.600' }}>Width</Typography>
                  <Typography variant="body2" sx={{ color: '#60a5fa', fontFamily: 'monospace' }}>
                    {widthDeg.toFixed(4)}° ({widthKm.toFixed(2)} km)
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'grey.600' }}>Height</Typography>
                  <Typography variant="body2" sx={{ color: '#60a5fa', fontFamily: 'monospace' }}>
                    {heightDeg.toFixed(4)}° ({heightKm.toFixed(2)} km)
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'grey.600' }}>Approx. Area</Typography>
                  <Typography variant="body2" sx={{ color: '#f59e0b', fontFamily: 'monospace' }}>
                    {formatArea(areaSqKm)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'grey.600' }}>Center Point</Typography>
                  <Typography variant="body2" sx={{ color: '#34d399', fontFamily: 'monospace' }}>
                    {centerPoint.lat.toFixed(6)}, {centerPoint.lon.toFixed(6)}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ mt: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      size="small"
                      checked={swapCoords}
                      onChange={(e) => setSwapCoords(e.target.checked)}
                      sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#60a5fa' } }}
                    />
                  }
                  label={
                    <Typography variant="caption" sx={{ color: 'grey.500' }}>
                      Swap coord order (lat,lon instead of lon,lat) for comma/space formats
                    </Typography>
                  }
                />
              </Box>
            </Paper>
          </Box>

          {/* Right: Output Formats */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1.5 }}>
              Output Formats ({formats.length})
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {formats.map((fmt) => (
                <Paper key={fmt.label} sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
                    <Typography variant="caption" sx={{ color: 'grey.500', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      {fmt.label}
                    </Typography>
                    <Tooltip title="Copy">
                      <IconButton size="small" onClick={() => handleCopy(fmt.value)} sx={{ color: 'grey.500', '&:hover': { color: '#60a5fa' } }}>
                        <Copy size={14} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Box
                    sx={{
                      bgcolor: '#0a0a0a',
                      border: '1px solid #1a1a1a',
                      borderRadius: 1,
                      p: 1.5,
                      fontFamily: 'monospace',
                      fontSize: 12,
                      color: '#a5d6ff',
                      wordBreak: 'break-all',
                      cursor: 'pointer',
                      '&:hover': { borderColor: '#333' },
                    }}
                    onClick={() => handleCopy(fmt.value)}
                  >
                    {fmt.value}
                  </Box>
                </Paper>
              ))}
            </Box>

            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  const all = formats.map((f) => `// ${f.label}\n${f.value}`).join('\n\n');
                  handleCopy(all);
                }}
                sx={{ color: 'grey.400', borderColor: '#333', '&:hover': { borderColor: '#555' } }}
              >
                Copy All Formats
              </Button>
            </Box>
          </Box>
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
