import { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Tooltip,
  Chip,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Slider,
} from '@mui/material';
import { Copy, ArrowRightLeft, Download, FileText, Info, ChevronDown, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';

// ---- WKT Parser ----

interface Coordinate {
  x: number;
  y: number;
  z?: number;
}

interface ParsedGeometry {
  type: string;
  coordinates: unknown;
  srid?: number;
}

function parseWKTCoordinate(s: string): Coordinate {
  const parts = s.trim().split(/\s+/).map(Number);
  const coord: Coordinate = { x: parts[0], y: parts[1] };
  if (parts.length > 2) coord.z = parts[2];
  return coord;
}

function parseCoordList(s: string): Coordinate[] {
  return s.split(',').map((c) => parseWKTCoordinate(c.trim())).filter((c) => !isNaN(c.x) && !isNaN(c.y));
}

function coordToArray(c: Coordinate, precision: number): number[] {
  const r = (n: number) => Number(n.toFixed(precision));
  return c.z !== undefined ? [r(c.x), r(c.y), r(c.z)] : [r(c.x), r(c.y)];
}

function parseRingList(s: string): Coordinate[][] {
  const rings: Coordinate[][] = [];
  let depth = 0;
  let current = '';
  for (const ch of s) {
    if (ch === '(') {
      depth++;
      if (depth === 1) { current = ''; continue; }
    }
    if (ch === ')') {
      depth--;
      if (depth === 0) {
        rings.push(parseCoordList(current));
        current = '';
        continue;
      }
    }
    if (depth >= 1) current += ch;
  }
  return rings;
}

function parsePolygonList(s: string): Coordinate[][][] {
  const polygons: Coordinate[][][] = [];
  let depth = 0;
  let current = '';
  for (const ch of s) {
    if (ch === '(') {
      depth++;
      if (depth === 1) { current = ''; continue; }
    }
    if (ch === ')') {
      depth--;
      if (depth === 0) {
        polygons.push(parseRingList(current));
        current = '';
        continue;
      }
    }
    if (depth >= 1) current += ch;
  }
  return polygons;
}

function parseWKT(wkt: string): ParsedGeometry {
  let input = wkt.trim();
  let srid: number | undefined;

  // EWKT SRID prefix
  const sridMatch = input.match(/^SRID=(\d+);(.*)$/i);
  if (sridMatch) {
    srid = parseInt(sridMatch[1]);
    input = sridMatch[2].trim();
  }

  const typeMatch = input.match(new RegExp('^(\\w+)\\s*\\((.+)\\)$', 's'));
  if (!typeMatch) throw new Error('Invalid WKT format');

  const typeName = typeMatch[1].toUpperCase();
  const body = typeMatch[2];

  switch (typeName) {
    case 'POINT': {
      const c = parseWKTCoordinate(body);
      return { type: 'Point', coordinates: [c.x, c.y, ...(c.z !== undefined ? [c.z] : [])], srid };
    }
    case 'LINESTRING': {
      const coords = parseCoordList(body);
      return { type: 'LineString', coordinates: coords.map((c) => [c.x, c.y, ...(c.z !== undefined ? [c.z] : [])]), srid };
    }
    case 'POLYGON': {
      const rings = parseRingList(body);
      return { type: 'Polygon', coordinates: rings.map((r) => r.map((c) => [c.x, c.y, ...(c.z !== undefined ? [c.z] : [])])), srid };
    }
    case 'MULTIPOINT': {
      // Handle both MULTIPOINT((x y),(x y)) and MULTIPOINT(x y, x y)
      const cleaned = body.replace(/\(/g, '').replace(/\)/g, '');
      const coords = parseCoordList(cleaned);
      return { type: 'MultiPoint', coordinates: coords.map((c) => [c.x, c.y, ...(c.z !== undefined ? [c.z] : [])]), srid };
    }
    case 'MULTILINESTRING': {
      const lines = parseRingList(body);
      return { type: 'MultiLineString', coordinates: lines.map((l) => l.map((c) => [c.x, c.y, ...(c.z !== undefined ? [c.z] : [])])), srid };
    }
    case 'MULTIPOLYGON': {
      const polys = parsePolygonList(body);
      return { type: 'MultiPolygon', coordinates: polys.map((p) => p.map((r) => r.map((c) => [c.x, c.y, ...(c.z !== undefined ? [c.z] : [])]))), srid };
    }
    case 'GEOMETRYCOLLECTION': {
      // Parse collection by splitting at top-level commas between geometry types
      const geometries: ParsedGeometry[] = [];
      let depth2 = 0;
      let chunk = '';
      for (const ch of body) {
        if (ch === '(') depth2++;
        if (ch === ')') depth2--;
        if (ch === ',' && depth2 === 0) {
          geometries.push(parseWKT(chunk.trim()));
          chunk = '';
        } else {
          chunk += ch;
        }
      }
      if (chunk.trim()) geometries.push(parseWKT(chunk.trim()));
      return {
        type: 'GeometryCollection',
        coordinates: geometries.map((g) => ({ type: g.type, coordinates: g.coordinates })),
        srid,
      };
    }
    default:
      throw new Error(`Unsupported geometry type: ${typeName}`);
  }
}

function parsedGeomToGeoJSON(parsed: ParsedGeometry, precision: number): object {
  const roundCoords = (coords: unknown): unknown => {
    if (typeof coords === 'number') return Number(coords.toFixed(precision));
    if (Array.isArray(coords)) {
      if (typeof coords[0] === 'number') return coords.map((n: number) => Number(n.toFixed(precision)));
      return coords.map(roundCoords);
    }
    if (coords && typeof coords === 'object' && 'type' in coords) {
      const g = coords as { type: string; coordinates: unknown };
      return { type: g.type, coordinates: roundCoords(g.coordinates) };
    }
    return coords;
  };

  if (parsed.type === 'GeometryCollection') {
    return {
      type: 'GeometryCollection',
      geometries: (parsed.coordinates as Array<{ type: string; coordinates: unknown }>).map((g) => ({
        type: g.type,
        coordinates: roundCoords(g.coordinates),
      })),
    };
  }

  return {
    type: parsed.type,
    coordinates: roundCoords(parsed.coordinates),
  };
}

// ---- GeoJSON to WKT ----

function coordsToWKTPoint(coords: number[]): string {
  return coords.join(' ');
}

function coordsToWKTRing(coords: number[][]): string {
  return coords.map(coordsToWKTPoint).join(', ');
}

function geojsonGeomToWKT(geom: { type: string; coordinates?: unknown; geometries?: unknown[] }, srid?: number): string {
  let wkt = '';
  switch (geom.type) {
    case 'Point':
      wkt = `POINT(${coordsToWKTPoint(geom.coordinates as number[])})`;
      break;
    case 'LineString':
      wkt = `LINESTRING(${coordsToWKTRing(geom.coordinates as number[][])})`;
      break;
    case 'Polygon': {
      const rings = (geom.coordinates as number[][][]).map((r) => `(${coordsToWKTRing(r)})`).join(', ');
      wkt = `POLYGON(${rings})`;
      break;
    }
    case 'MultiPoint': {
      const pts = (geom.coordinates as number[][]).map((c) => `(${coordsToWKTPoint(c)})`).join(', ');
      wkt = `MULTIPOINT(${pts})`;
      break;
    }
    case 'MultiLineString': {
      const lines = (geom.coordinates as number[][][]).map((l) => `(${coordsToWKTRing(l)})`).join(', ');
      wkt = `MULTILINESTRING(${lines})`;
      break;
    }
    case 'MultiPolygon': {
      const polys = (geom.coordinates as number[][][][])
        .map((p) => `(${p.map((r) => `(${coordsToWKTRing(r)})`).join(', ')})`)
        .join(', ');
      wkt = `MULTIPOLYGON(${polys})`;
      break;
    }
    case 'GeometryCollection': {
      const geoms = (geom.geometries as Array<{ type: string; coordinates: unknown }>)
        .map((g) => geojsonGeomToWKT(g))
        .join(', ');
      wkt = `GEOMETRYCOLLECTION(${geoms})`;
      break;
    }
    default:
      throw new Error(`Unsupported GeoJSON type: ${geom.type}`);
  }

  if (srid) return `SRID=${srid};${wkt}`;
  return wkt;
}

function extractGeomFromGeoJSON(obj: Record<string, unknown>): { type: string; coordinates?: unknown; geometries?: unknown[] } {
  if (obj.type === 'FeatureCollection') {
    const features = obj.features as Array<Record<string, unknown>>;
    if (features && features.length > 0) {
      return extractGeomFromGeoJSON(features[0]);
    }
    throw new Error('Empty FeatureCollection');
  }
  if (obj.type === 'Feature') {
    return obj.geometry as { type: string; coordinates?: unknown; geometries?: unknown[] };
  }
  // It's a geometry directly
  return obj as { type: string; coordinates?: unknown; geometries?: unknown[] };
}

// ---- Geometry Info ----

function countCoordinates(coords: unknown): number {
  if (!coords) return 0;
  if (typeof coords === 'number') return 0;
  if (Array.isArray(coords)) {
    if (typeof coords[0] === 'number') return 1;
    return coords.reduce((sum: number, c: unknown) => sum + countCoordinates(c), 0);
  }
  return 0;
}

function countRings(geom: { type: string; coordinates?: unknown }): number {
  if (geom.type === 'Polygon') {
    return (geom.coordinates as number[][][]).length;
  }
  if (geom.type === 'MultiPolygon') {
    return (geom.coordinates as number[][][][]).reduce((s, p) => s + p.length, 0);
  }
  return 0;
}

function computeBBox(coords: unknown): [number, number, number, number] | null {
  const flat: number[][] = [];
  const flatten = (c: unknown) => {
    if (!c) return;
    if (Array.isArray(c)) {
      if (typeof c[0] === 'number') flat.push(c as number[]);
      else c.forEach(flatten);
    }
  };
  flatten(coords);
  if (flat.length === 0) return null;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of flat) {
    if (p[0] < minX) minX = p[0];
    if (p[1] < minY) minY = p[1];
    if (p[0] > maxX) maxX = p[0];
    if (p[1] > maxY) maxY = p[1];
  }
  return [minX, minY, maxX, maxY];
}

function extractAllCoordinatesCSV(coords: unknown): string {
  const flat: number[][] = [];
  const flatten = (c: unknown) => {
    if (!c) return;
    if (Array.isArray(c)) {
      if (typeof c[0] === 'number') flat.push(c as number[]);
      else c.forEach(flatten);
    }
  };
  flatten(coords);
  return flat.map((p) => p.join(',')).join('\n');
}

// ---- Sample geometries ----

const SAMPLES: Record<string, { label: string; wkt: string }> = {
  point: { label: 'Simple Point', wkt: 'POINT(-122.4194 37.7749)' },
  line: { label: 'Line with 5 Points', wkt: 'LINESTRING(-122.49 37.78, -122.47 37.785, -122.45 37.79, -122.43 37.785, -122.41 37.78)' },
  rect: { label: 'Rectangle', wkt: 'POLYGON((-122.5 37.7, -122.3 37.7, -122.3 37.85, -122.5 37.85, -122.5 37.7))' },
  complex_poly: {
    label: 'Polygon with Hole',
    wkt: 'POLYGON((-122.5 37.7, -122.3 37.7, -122.3 37.85, -122.5 37.85, -122.5 37.7), (-122.45 37.75, -122.35 37.75, -122.35 37.8, -122.45 37.8, -122.45 37.75))',
  },
  multipolygon: {
    label: 'Multi-Polygon',
    wkt: 'MULTIPOLYGON(((-122.5 37.7, -122.4 37.7, -122.4 37.75, -122.5 37.75, -122.5 37.7)),((-122.35 37.78, -122.3 37.78, -122.3 37.82, -122.35 37.82, -122.35 37.78)))',
  },
  collection: {
    label: 'Geometry Collection',
    wkt: 'GEOMETRYCOLLECTION(POINT(-122.4 37.78), LINESTRING(-122.45 37.76, -122.35 37.8), POLYGON((-122.48 37.72, -122.42 37.72, -122.42 37.76, -122.48 37.76, -122.48 37.72)))',
  },
  ewkt_point: { label: 'EWKT Point (SRID=4326)', wkt: 'SRID=4326;POINT(-73.9857 40.7484)' },
  multiline: { label: 'Multi-LineString', wkt: 'MULTILINESTRING((-122.5 37.7, -122.45 37.75, -122.4 37.72), (-122.35 37.8, -122.3 37.78, -122.32 37.82))' },
};

const inputSx = {
  '& .MuiInputBase-root': { bgcolor: '#1a1a1a', color: 'grey.300', fontFamily: '"Fira Code", monospace', fontSize: 12 },
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

export default function WktGeoJsonConverter() {
  const [wktInput, setWktInput] = useState<string>('POLYGON((-122.5 37.7, -122.3 37.7, -122.3 37.85, -122.5 37.85, -122.5 37.7))');
  const [geojsonInput, setGeojsonInput] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [prettyPrint, setPrettyPrint] = useState(true);
  const [precision, setPrecision] = useState(6);
  const [swapCoords, setSwapCoords] = useState(false);
  const [ewktSrid, setEwktSrid] = useState<string>('');
  const [lastDirection, setLastDirection] = useState<'wkt-to-geojson' | 'geojson-to-wkt'>('wkt-to-geojson');

  // Derived geometry info
  const geomInfo = useMemo(() => {
    try {
      let geom: { type: string; coordinates?: unknown; geometries?: unknown[] } | null = null;

      if (lastDirection === 'wkt-to-geojson' && wktInput.trim()) {
        const parsed = parseWKT(wktInput);
        const gj = parsedGeomToGeoJSON(parsed, precision);
        geom = gj as { type: string; coordinates?: unknown; geometries?: unknown[] };
      } else if (lastDirection === 'geojson-to-wkt' && geojsonInput.trim()) {
        const obj = JSON.parse(geojsonInput);
        geom = extractGeomFromGeoJSON(obj);
      }

      if (!geom) return null;

      const coords = geom.coordinates || (geom.geometries ? geom.geometries : null);
      const nCoords = countCoordinates(coords);
      const nRings = countRings(geom as { type: string; coordinates?: unknown });
      const bbox = computeBBox(coords);

      return { type: geom.type, nCoords, nRings, bbox };
    } catch {
      return null;
    }
  }, [wktInput, geojsonInput, lastDirection, precision]);

  const convertWktToGeojson = useCallback(() => {
    try {
      setError('');
      let input = wktInput.trim();
      if (swapCoords) {
        // Swap lat,lon to lon,lat in the WKT coordinate pairs
        input = input.replace(/(-?\d+\.?\d*)\s+(-?\d+\.?\d*)/g, '$2 $1');
      }
      const parsed = parseWKT(input);
      if (parsed.srid) setEwktSrid(String(parsed.srid));
      const geojsonGeom = parsedGeomToGeoJSON(parsed, precision);
      const feature = {
        type: 'Feature',
        properties: {},
        geometry: geojsonGeom,
      };
      const str = prettyPrint ? JSON.stringify(feature, null, 2) : JSON.stringify(feature);
      setGeojsonInput(str);
      setLastDirection('wkt-to-geojson');
    } catch (e) {
      setError(`WKT Parse Error: ${(e as Error).message}`);
    }
  }, [wktInput, prettyPrint, precision, swapCoords]);

  const convertGeojsonToWkt = useCallback(() => {
    try {
      setError('');
      const obj = JSON.parse(geojsonInput);
      const geom = extractGeomFromGeoJSON(obj);
      const srid = ewktSrid ? parseInt(ewktSrid) : undefined;
      let wkt = geojsonGeomToWKT(geom, srid);
      if (swapCoords) {
        // Swap lon,lat to lat,lon
        wkt = wkt.replace(/(-?\d+\.?\d*)\s+(-?\d+\.?\d*)/g, '$2 $1');
      }
      setWktInput(wkt);
      setLastDirection('geojson-to-wkt');
    } catch (e) {
      setError(`GeoJSON Parse Error: ${(e as Error).message}`);
    }
  }, [geojsonInput, swapCoords, ewktSrid]);

  const handleCopy = useCallback(async (text: string) => {
    await navigator.clipboard.writeText(text);
    setSnackbar({ open: true, message: 'Copied to clipboard!' });
  }, []);

  const handleDownload = useCallback((content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const loadSample = useCallback((key: string) => {
    const sample = SAMPLES[key];
    if (sample) {
      setWktInput(sample.wkt);
      setError('');
      // Auto-convert
      try {
        const parsed = parseWKT(sample.wkt);
        if (parsed.srid) setEwktSrid(String(parsed.srid));
        const geojsonGeom = parsedGeomToGeoJSON(parsed, precision);
        const feature = { type: 'Feature', properties: {}, geometry: geojsonGeom };
        setGeojsonInput(prettyPrint ? JSON.stringify(feature, null, 2) : JSON.stringify(feature));
        setLastDirection('wkt-to-geojson');
      } catch {
        // ignore, user can click convert
      }
    }
  }, [precision, prettyPrint]);

  const togglePrettyPrint = useCallback(() => {
    setPrettyPrint((prev) => {
      const next = !prev;
      if (geojsonInput.trim()) {
        try {
          const obj = JSON.parse(geojsonInput);
          setGeojsonInput(next ? JSON.stringify(obj, null, 2) : JSON.stringify(obj));
        } catch {
          // ignore
        }
      }
      return next;
    });
  }, [geojsonInput]);

  const extractCoordinateCSV = useCallback(() => {
    try {
      let coords: unknown = null;
      if (lastDirection === 'wkt-to-geojson' && wktInput.trim()) {
        const parsed = parseWKT(wktInput);
        const gj = parsedGeomToGeoJSON(parsed, precision) as { coordinates?: unknown; geometries?: unknown[] };
        coords = gj.coordinates || gj.geometries;
      } else if (geojsonInput.trim()) {
        const obj = JSON.parse(geojsonInput);
        const geom = extractGeomFromGeoJSON(obj);
        coords = geom.coordinates || geom.geometries;
      }
      if (coords) {
        const csv = extractAllCoordinatesCSV(coords);
        handleCopy(csv);
        setSnackbar({ open: true, message: 'Coordinates CSV copied!' });
      }
    } catch {
      setSnackbar({ open: true, message: 'Could not extract coordinates.' });
    }
  }, [wktInput, geojsonInput, lastDirection, precision, handleCopy]);

  const handleReset = useCallback(() => {
    setWktInput('');
    setGeojsonInput('');
    setError('');
    setEwktSrid('');
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a', color: 'grey.300' }}>
      <Link to="/" style={{ position: 'fixed', top: 12, left: 12, zIndex: 50, display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', backgroundColor: 'rgba(30,30,30,0.9)', color: '#ccc', borderRadius: 8, textDecoration: 'none', fontSize: 14, border: '1px solid #333' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        Home
      </Link>

      <Box sx={{ maxWidth: 1500, mx: 'auto', pt: 7, px: 3, pb: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <ArrowRightLeft size={28} color="#60a5fa" />
          <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
            WKT / GeoJSON Converter
          </Typography>
          <Tooltip title="Reset">
            <IconButton onClick={handleReset} sx={{ color: 'grey.500', ml: 'auto' }}>
              <RotateCcw size={18} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Sample Presets */}
        <Box sx={{ mb: 2, display: 'flex', gap: 0.75, flexWrap: 'wrap', alignItems: 'center' }}>
          <Typography variant="caption" sx={{ color: 'grey.500', mr: 0.5 }}>Samples:</Typography>
          {Object.entries(SAMPLES).map(([key, { label }]) => (
            <Chip
              key={key}
              label={label}
              size="small"
              onClick={() => loadSample(key)}
              sx={{
                bgcolor: '#1a1a1a',
                color: 'grey.400',
                border: '1px solid #333',
                cursor: 'pointer',
                fontSize: 11,
                '&:hover': { bgcolor: '#222', borderColor: '#555' },
              }}
            />
          ))}
        </Box>

        {/* Controls Row */}
        <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 2, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" sx={{ color: 'grey.500' }}>Precision:</Typography>
            <Box sx={{ width: 120 }}>
              <Slider
                value={precision}
                onChange={(_, v) => setPrecision(v as number)}
                min={0}
                max={12}
                step={1}
                size="small"
                valueLabelDisplay="auto"
                sx={{ color: '#60a5fa' }}
              />
            </Box>
            <Typography variant="caption" sx={{ color: 'grey.400', fontFamily: 'monospace' }}>{precision}</Typography>
          </Box>

          <FormControlLabel
            control={<Switch size="small" checked={prettyPrint} onChange={togglePrettyPrint} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#60a5fa' } }} />}
            label={<Typography variant="caption" sx={{ color: 'grey.500' }}>Pretty Print</Typography>}
          />

          <FormControlLabel
            control={<Switch size="small" checked={swapCoords} onChange={(e) => setSwapCoords(e.target.checked)} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#f59e0b' } }} />}
            label={<Typography variant="caption" sx={{ color: 'grey.500' }}>Swap lat/lon</Typography>}
          />

          <TextField
            size="small"
            label="EWKT SRID"
            value={ewktSrid}
            onChange={(e) => setEwktSrid(e.target.value)}
            placeholder="4326"
            sx={{ ...inputSx, width: 110, '& .MuiInputBase-root': { ...inputSx['& .MuiInputBase-root'], fontSize: 13 } }}
          />

          <Button
            size="small"
            startIcon={<FileText size={14} />}
            onClick={extractCoordinateCSV}
            sx={{ color: 'grey.400', borderColor: '#333', border: '1px solid #333', '&:hover': { borderColor: '#555', bgcolor: '#1a1a1a' } }}
          >
            Extract Coords CSV
          </Button>
        </Paper>

        {error && (
          <Paper sx={{ bgcolor: '#2a1215', border: '1px solid #5c2023', p: 1.5, mb: 2 }}>
            <Typography variant="body2" sx={{ color: '#f87171', fontFamily: 'monospace', fontSize: 12 }}>
              {error}
            </Typography>
          </Paper>
        )}

        {/* Split View */}
        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
          {/* WKT Side */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Paper sx={{ bgcolor: '#111', border: '1px solid #222', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5, borderBottom: '1px solid #222' }}>
                <Typography variant="subtitle2" sx={{ color: '#60a5fa', fontWeight: 600 }}>
                  WKT / EWKT
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Tooltip title="Copy WKT">
                    <IconButton size="small" onClick={() => handleCopy(wktInput)} sx={{ color: 'grey.500', '&:hover': { color: '#60a5fa' } }}>
                      <Copy size={14} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Download WKT">
                    <IconButton size="small" onClick={() => handleDownload(wktInput, 'geometry.wkt')} sx={{ color: 'grey.500', '&:hover': { color: '#60a5fa' } }}>
                      <Download size={14} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              <Box sx={{ flex: 1, p: 2 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={16}
                  value={wktInput}
                  onChange={(e) => setWktInput(e.target.value)}
                  placeholder="POINT(-122.4194 37.7749)&#10;LINESTRING(...)&#10;POLYGON((...))&#10;SRID=4326;POINT(...)"
                  sx={{
                    ...inputSx,
                    '& .MuiInputBase-root': {
                      ...inputSx['& .MuiInputBase-root'],
                      height: '100%',
                      alignItems: 'flex-start',
                    },
                  }}
                />
              </Box>
              <Box sx={{ px: 2, pb: 2 }}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={convertWktToGeojson}
                  endIcon={<ChevronDown size={14} style={{ transform: 'rotate(-90deg)' }} />}
                  sx={{ bgcolor: '#1e3a5f', color: '#60a5fa', '&:hover': { bgcolor: '#264e78' } }}
                >
                  Convert WKT to GeoJSON
                </Button>
              </Box>
            </Paper>
          </Box>

          {/* GeoJSON Side */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Paper sx={{ bgcolor: '#111', border: '1px solid #222', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5, borderBottom: '1px solid #222' }}>
                <Typography variant="subtitle2" sx={{ color: '#34d399', fontWeight: 600 }}>
                  GeoJSON
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Tooltip title="Copy GeoJSON">
                    <IconButton size="small" onClick={() => handleCopy(geojsonInput)} sx={{ color: 'grey.500', '&:hover': { color: '#34d399' } }}>
                      <Copy size={14} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Download GeoJSON">
                    <IconButton size="small" onClick={() => handleDownload(geojsonInput, 'geometry.geojson')} sx={{ color: 'grey.500', '&:hover': { color: '#34d399' } }}>
                      <Download size={14} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              <Box sx={{ flex: 1, p: 2 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={16}
                  value={geojsonInput}
                  onChange={(e) => setGeojsonInput(e.target.value)}
                  placeholder='{"type":"Feature","geometry":{"type":"Point","coordinates":[-122.4194,37.7749]},"properties":{}}'
                  sx={{
                    ...inputSx,
                    '& .MuiInputBase-root': {
                      ...inputSx['& .MuiInputBase-root'],
                      height: '100%',
                      alignItems: 'flex-start',
                    },
                  }}
                />
              </Box>
              <Box sx={{ px: 2, pb: 2 }}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={convertGeojsonToWkt}
                  startIcon={<ChevronDown size={14} style={{ transform: 'rotate(90deg)' }} />}
                  sx={{ bgcolor: '#134e36', color: '#34d399', '&:hover': { bgcolor: '#166534' } }}
                >
                  Convert GeoJSON to WKT
                </Button>
              </Box>
            </Paper>
          </Box>
        </Box>

        {/* Geometry Info */}
        {geomInfo && (
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2.5, mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <Info size={16} color="#60a5fa" />
              <Typography variant="subtitle2" sx={{ color: 'grey.400' }}>
                Geometry Info
              </Typography>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: 'grey.600' }}>Type</Typography>
                <Typography variant="body2" sx={{ color: '#60a5fa', fontFamily: 'monospace' }}>
                  {geomInfo.type}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'grey.600' }}>Coordinates</Typography>
                <Typography variant="body2" sx={{ color: '#f59e0b', fontFamily: 'monospace' }}>
                  {geomInfo.nCoords}
                </Typography>
              </Box>
              {geomInfo.nRings > 0 && (
                <Box>
                  <Typography variant="caption" sx={{ color: 'grey.600' }}>Rings</Typography>
                  <Typography variant="body2" sx={{ color: '#a78bfa', fontFamily: 'monospace' }}>
                    {geomInfo.nRings}
                  </Typography>
                </Box>
              )}
              {geomInfo.bbox && (
                <Box>
                  <Typography variant="caption" sx={{ color: 'grey.600' }}>Bounding Box</Typography>
                  <Typography variant="body2" sx={{ color: '#34d399', fontFamily: 'monospace', fontSize: 11 }}>
                    [{geomInfo.bbox.map((v) => v.toFixed(4)).join(', ')}]
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        )}
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
