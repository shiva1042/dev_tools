import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Slider from '@mui/material/Slider';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Divider from '@mui/material/Divider';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Alert from '@mui/material/Alert';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import { useMapStore } from '../../store/mapStore';
import type { BasemapType, CustomBasemapConfig } from '../../types';

const basemaps: { value: BasemapType; label: string; group: string }[] = [
  // Offline options
  { value: 'none', label: 'None (Offline)', group: 'Offline' },
  { value: 'custom', label: 'Custom URL (Local/GeoServer)', group: 'Offline' },
  // Online options
  { value: 'streets-vector', label: 'Streets', group: 'Online' },
  { value: 'satellite', label: 'Satellite', group: 'Online' },
  { value: 'hybrid', label: 'Hybrid', group: 'Online' },
  { value: 'topo-vector', label: 'Topographic', group: 'Online' },
  { value: 'gray-vector', label: 'Light Gray', group: 'Online' },
  { value: 'dark-gray-vector', label: 'Dark Gray', group: 'Online' },
  { value: 'oceans', label: 'Oceans', group: 'Online' },
  { value: 'national-geographic', label: 'National Geographic', group: 'Online' },
  { value: 'terrain', label: 'Terrain', group: 'Online' },
  { value: 'osm', label: 'OpenStreetMap', group: 'Online' },
  { value: 'streets-night-vector', label: 'Streets Night', group: 'Online' },
  { value: 'streets-navigation-vector', label: 'Navigation', group: 'Online' },
];

const customBasemapTypes: { value: CustomBasemapConfig['type']; label: string }[] = [
  { value: 'wms', label: 'WMS (Web Map Service)' },
  { value: 'wmts', label: 'WMTS (Tiled WMS)' },
  { value: 'tile', label: 'Tile Layer (XYZ/TMS)' },
  { value: 'vector-tile', label: 'Vector Tile Layer' },
];

const spatialReferences = [
  { value: 4326, label: 'WGS 84 (4326)' },
  { value: 3857, label: 'Web Mercator (3857)' },
  { value: 102100, label: 'Web Mercator Auxiliary (102100)' },
];

export default function MapDesigner() {
  const {
    map,
    setBasemap,
    setViewType,
    setCenter,
    setZoom,
    setSpatialReference,
    setBackgroundColor,
    setCustomBasemap,
  } = useMapStore();

  const [expanded, setExpanded] = useState<string | false>('basemap');

  const handleCenterChange = (index: number, value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      const newCenter: [number, number] = [...map.center];
      newCenter[index] = num;
      setCenter(newCenter);
    }
  };

  const handleBasemapChange = (value: BasemapType) => {
    setBasemap(value);
    // Set default background color for 'none' basemap
    if (value === 'none' && !map.backgroundColor) {
      setBackgroundColor([30, 30, 30]); // Dark gray default
    }
    // Clear custom basemap if not custom
    if (value !== 'custom') {
      setCustomBasemap(undefined);
    } else if (!map.customBasemap) {
      // Set default custom basemap config
      setCustomBasemap({
        type: 'wms',
        url: '',
        title: 'Custom Basemap',
      });
    }
  };

  const handleCustomBasemapChange = (updates: Partial<CustomBasemapConfig>) => {
    setCustomBasemap({
      ...(map.customBasemap || { type: 'wms', url: '', title: 'Custom Basemap' }),
      ...updates,
    });
  };

  const handleBackgroundColorChange = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    setBackgroundColor([r, g, b]);
  };

  const bgColorHex = map.backgroundColor
    ? `#${map.backgroundColor.map((c) => c.toString(16).padStart(2, '0')).join('')}`
    : '#1e1e1e';

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="subtitle2" color="primary" sx={{ mb: 2 }}>
        Map Configuration
      </Typography>

      {/* View Type Toggle */}
      <Box sx={{ mb: 3 }}>
        <FormControlLabel
          control={
            <Switch
              checked={map.viewType === '3d'}
              onChange={(e) => setViewType(e.target.checked ? '3d' : '2d')}
              color="primary"
            />
          }
          label={
            <Typography variant="body2">
              {map.viewType === '2d' ? '2D MapView' : '3D SceneView'}
            </Typography>
          }
        />
      </Box>

      {/* Basemap Selection */}
      <Accordion
        expanded={expanded === 'basemap'}
        onChange={(_, isExpanded) => setExpanded(isExpanded ? 'basemap' : false)}
        sx={{ bgcolor: 'transparent', boxShadow: 'none' }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="body2" fontWeight={500}>
            Basemap
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormControl fullWidth size="small">
            <InputLabel>Select Basemap</InputLabel>
            <Select
              value={map.basemap}
              label="Select Basemap"
              onChange={(e) => handleBasemapChange(e.target.value as BasemapType)}
            >
              {/* Offline Group */}
              <MenuItem disabled sx={{ opacity: 0.7, fontWeight: 600, fontSize: 11 }}>
                <WifiOffIcon fontSize="small" sx={{ mr: 1 }} /> OFFLINE OPTIONS
              </MenuItem>
              {basemaps
                .filter((b) => b.group === 'Offline')
                .map((b) => (
                  <MenuItem key={b.value} value={b.value} sx={{ pl: 3 }}>
                    {b.label}
                  </MenuItem>
                ))}
              <Divider />
              {/* Online Group */}
              <MenuItem disabled sx={{ opacity: 0.7, fontWeight: 600, fontSize: 11 }}>
                ONLINE OPTIONS (Requires Internet)
              </MenuItem>
              {basemaps
                .filter((b) => b.group === 'Online')
                .map((b) => (
                  <MenuItem key={b.value} value={b.value} sx={{ pl: 3 }}>
                    {b.label}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          {/* Background Color for 'none' basemap */}
          {map.basemap === 'none' && (
            <Box sx={{ mt: 2 }}>
              <Alert severity="info" sx={{ mb: 2 }} icon={<WifiOffIcon />}>
                No basemap - works completely offline
              </Alert>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2">Background Color:</Typography>
                <input
                  type="color"
                  value={bgColorHex}
                  onChange={(e) => handleBackgroundColorChange(e.target.value)}
                  style={{
                    width: 40,
                    height: 30,
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  {bgColorHex}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Custom Basemap Configuration */}
          {map.basemap === 'custom' && (
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Alert severity="info" icon={<WifiOffIcon />}>
                Use your local GeoServer or any accessible tile service
              </Alert>

              <FormControl fullWidth size="small">
                <InputLabel>Service Type</InputLabel>
                <Select
                  value={map.customBasemap?.type || 'wms'}
                  label="Service Type"
                  onChange={(e) =>
                    handleCustomBasemapChange({
                      type: e.target.value as CustomBasemapConfig['type'],
                    })
                  }
                >
                  {customBasemapTypes.map((t) => (
                    <MenuItem key={t.value} value={t.value}>
                      {t.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Service URL"
                size="small"
                fullWidth
                value={map.customBasemap?.url || ''}
                onChange={(e) => handleCustomBasemapChange({ url: e.target.value })}
                placeholder={
                  map.customBasemap?.type === 'wms'
                    ? 'http://localhost:8080/geoserver/wms'
                    : map.customBasemap?.type === 'tile'
                      ? 'http://localhost:8080/tiles/{z}/{x}/{y}.png'
                      : 'http://localhost:8080/geoserver/gwc/service/wmts'
                }
                helperText={
                  map.customBasemap?.type === 'tile'
                    ? 'Use {z}, {x}, {y} placeholders for tile coordinates'
                    : 'Enter the base URL of your service'
                }
              />

              <TextField
                label="Title"
                size="small"
                fullWidth
                value={map.customBasemap?.title || ''}
                onChange={(e) => handleCustomBasemapChange({ title: e.target.value })}
                placeholder="My Custom Basemap"
              />

              {(map.customBasemap?.type === 'wms' || map.customBasemap?.type === 'wmts') && (
                <TextField
                  label="Layer Names (comma-separated)"
                  size="small"
                  fullWidth
                  value={map.customBasemap?.sublayers?.join(', ') || ''}
                  onChange={(e) =>
                    handleCustomBasemapChange({
                      sublayers: e.target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder="layer1, layer2"
                  helperText="WMS layer names to include in the basemap"
                />
              )}
            </Box>
          )}
        </AccordionDetails>
      </Accordion>

      <Divider sx={{ my: 1 }} />

      {/* Center Position */}
      <Accordion
        expanded={expanded === 'center'}
        onChange={(_, isExpanded) => setExpanded(isExpanded ? 'center' : false)}
        sx={{ bgcolor: 'transparent', boxShadow: 'none' }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="body2" fontWeight={500}>
            Center Position
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Longitude"
              type="number"
              size="small"
              value={map.center[0]}
              onChange={(e) => handleCenterChange(0, e.target.value)}
              inputProps={{ step: 0.01 }}
              fullWidth
            />
            <TextField
              label="Latitude"
              type="number"
              size="small"
              value={map.center[1]}
              onChange={(e) => handleCenterChange(1, e.target.value)}
              inputProps={{ step: 0.01 }}
              fullWidth
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      <Divider sx={{ my: 1 }} />

      {/* Zoom Level */}
      <Accordion
        expanded={expanded === 'zoom'}
        onChange={(_, isExpanded) => setExpanded(isExpanded ? 'zoom' : false)}
        sx={{ bgcolor: 'transparent', boxShadow: 'none' }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="body2" fontWeight={500}>
            Zoom Level: {map.zoom}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ px: 1 }}>
            <Slider
              value={map.zoom}
              onChange={(_, value) => setZoom(value as number)}
              min={1}
              max={20}
              step={1}
              marks={[
                { value: 1, label: '1' },
                { value: 10, label: '10' },
                { value: 20, label: '20' },
              ]}
              valueLabelDisplay="auto"
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      <Divider sx={{ my: 1 }} />

      {/* Spatial Reference */}
      <Accordion
        expanded={expanded === 'spatial'}
        onChange={(_, isExpanded) => setExpanded(isExpanded ? 'spatial' : false)}
        sx={{ bgcolor: 'transparent', boxShadow: 'none' }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="body2" fontWeight={500}>
            Spatial Reference
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormControl fullWidth size="small">
            <InputLabel>Projection</InputLabel>
            <Select
              value={map.spatialReference || 4326}
              label="Projection"
              onChange={(e) => setSpatialReference(e.target.value as number)}
            >
              {spatialReferences.map((sr) => (
                <MenuItem key={sr.value} value={sr.value}>
                  {sr.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </AccordionDetails>
      </Accordion>

      {/* Current State Display */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="caption" color="text.secondary">
          Current Configuration:
        </Typography>
        <Box
          sx={{
            mt: 1,
            p: 1.5,
            bgcolor: 'rgba(0,0,0,0.3)',
            borderRadius: 1,
            fontFamily: 'monospace',
            fontSize: 11,
          }}
        >
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(map, null, 2)}
          </pre>
        </Box>
      </Box>
    </Box>
  );
}
