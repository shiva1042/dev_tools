import { useState, useCallback, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Tooltip,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Copy,
  Check,
  AlertTriangle,
  CheckCircle,
  Trash2,
  Download,
  Upload,
  FileJson,
  Eye,
  AlignLeft,
  Minimize2,
  ClipboardCheck,
  MapPin,
  Layers,
  Table as TableIcon,
  ArrowRightLeft,
  RefreshCw,
} from 'lucide-react';

/* ---------- Types ---------- */
interface ValidationError {
  type: 'error' | 'warning';
  message: string;
  path?: string;
}

interface GeoJSONStats {
  type: string;
  featureCount: number;
  geometryTypes: string[];
  bbox: [number, number, number, number] | null;
  properties: Record<string, string>;
  totalCoordinates: number;
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
  crs: string;
}

/* ---------- Sample GeoJSON Presets ---------- */
const samplePresets: Record<string, object> = {
  Point: {
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [-73.9857, 40.7484] },
    properties: { name: 'Empire State Building', city: 'New York', height: 443 },
  },
  LineString: {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: [[-73.9857, 40.7484], [-73.9712, 40.7831], [-73.9665, 40.7812], [-73.9580, 40.8006]],
    },
    properties: { name: 'Sample Route', length_km: 6.2 },
  },
  Polygon: {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [[[-73.9876, 40.7661], [-73.9582, 40.8006], [-73.9497, 40.7969], [-73.9730, 40.7648], [-73.9876, 40.7661]]],
    },
    properties: { name: 'Central Park (approx)', area_sqkm: 3.41 },
  },
  MultiPolygon: {
    type: 'Feature',
    geometry: {
      type: 'MultiPolygon',
      coordinates: [
        [[[-73.99, 40.74], [-73.98, 40.74], [-73.98, 40.75], [-73.99, 40.75], [-73.99, 40.74]]],
        [[[-73.97, 40.76], [-73.96, 40.76], [-73.96, 40.77], [-73.97, 40.77], [-73.97, 40.76]]],
      ],
    },
    properties: { name: 'Two Areas', count: 2 },
  },
  FeatureCollection: {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [-73.9857, 40.7484] },
        properties: { name: 'Empire State Building', type: 'landmark', year: 1931 },
      },
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [-73.9680, 40.7851] },
        properties: { name: 'Metropolitan Museum', type: 'museum', year: 1870 },
      },
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [-74.0445, 40.6892] },
        properties: { name: 'Statue of Liberty', type: 'landmark', year: 1886 },
      },
      {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[[-73.9876, 40.7661], [-73.9582, 40.8006], [-73.9497, 40.7969], [-73.9730, 40.7648], [-73.9876, 40.7661]]],
        },
        properties: { name: 'Central Park', type: 'park', year: 1857 },
      },
    ],
  },
};

/* ---------- Helpers ---------- */
const inputSx = {
  bgcolor: '#1a1a1a',
  color: 'grey.300',
  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#60a5fa' },
  '& .MuiInputBase-input': { color: '#e0e0e0' },
};

function countCoordinates(coords: unknown): number {
  if (!Array.isArray(coords)) return 0;
  if (typeof coords[0] === 'number') return 1;
  let count = 0;
  for (const c of coords) count += countCoordinates(c);
  return count;
}

function extractCoordinateBounds(coords: unknown, bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number }) {
  if (!Array.isArray(coords)) return;
  if (coords.length >= 2 && typeof coords[0] === 'number' && typeof coords[1] === 'number') {
    const lng = coords[0] as number;
    const lat = coords[1] as number;
    if (lng < bounds.minLng) bounds.minLng = lng;
    if (lng > bounds.maxLng) bounds.maxLng = lng;
    if (lat < bounds.minLat) bounds.minLat = lat;
    if (lat > bounds.maxLat) bounds.maxLat = lat;
    return;
  }
  for (const c of coords) extractCoordinateBounds(c, bounds);
}

function validateGeoJSON(obj: unknown): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!obj || typeof obj !== 'object') {
    errors.push({ type: 'error', message: 'Root must be an object' });
    return errors;
  }

  const root = obj as Record<string, unknown>;

  if (!root.type) {
    errors.push({ type: 'error', message: 'Missing required "type" property' });
    return errors;
  }

  const validTypes = ['Feature', 'FeatureCollection', 'Point', 'MultiPoint', 'LineString', 'MultiLineString', 'Polygon', 'MultiPolygon', 'GeometryCollection'];
  if (!validTypes.includes(root.type as string)) {
    errors.push({ type: 'error', message: `Invalid type "${root.type}". Must be one of: ${validTypes.join(', ')}` });
  }

  if (root.type === 'FeatureCollection') {
    if (!root.features) {
      errors.push({ type: 'error', message: 'FeatureCollection must have "features" array' });
    } else if (!Array.isArray(root.features)) {
      errors.push({ type: 'error', message: '"features" must be an array' });
    } else {
      (root.features as unknown[]).forEach((f: unknown, i: number) => {
        const feat = f as Record<string, unknown>;
        if (!feat || typeof feat !== 'object') {
          errors.push({ type: 'error', message: `Feature[${i}] is not an object`, path: `features[${i}]` });
          return;
        }
        if (feat.type !== 'Feature') {
          errors.push({ type: 'error', message: `Feature[${i}].type must be "Feature"`, path: `features[${i}].type` });
        }
        if (!feat.geometry && feat.geometry !== null) {
          errors.push({ type: 'warning', message: `Feature[${i}] has no geometry property`, path: `features[${i}]` });
        }
        if (feat.geometry) {
          const geomErrors = validateGeometry(feat.geometry, `features[${i}].geometry`);
          errors.push(...geomErrors);
        }
      });
    }
  }

  if (root.type === 'Feature') {
    if (!root.geometry && root.geometry !== null) {
      errors.push({ type: 'warning', message: 'Feature has no geometry property' });
    }
    if (root.geometry) {
      errors.push(...validateGeometry(root.geometry, 'geometry'));
    }
    if (root.properties !== undefined && root.properties !== null && typeof root.properties !== 'object') {
      errors.push({ type: 'error', message: '"properties" must be an object or null' });
    }
  }

  // RFC 7946 checks
  if (root.crs) {
    errors.push({ type: 'warning', message: 'RFC 7946: "crs" member is not recommended. GeoJSON uses WGS84 by default' });
  }

  return errors;
}

function validateGeometry(geom: unknown, path: string): ValidationError[] {
  const errors: ValidationError[] = [];
  const g = geom as Record<string, unknown>;

  if (!g || typeof g !== 'object') {
    errors.push({ type: 'error', message: `Geometry at ${path} is not an object` });
    return errors;
  }

  const geomTypes = ['Point', 'MultiPoint', 'LineString', 'MultiLineString', 'Polygon', 'MultiPolygon', 'GeometryCollection'];
  if (!geomTypes.includes(g.type as string)) {
    errors.push({ type: 'error', message: `Invalid geometry type "${g.type}" at ${path}` });
    return errors;
  }

  if (g.type !== 'GeometryCollection' && !g.coordinates) {
    errors.push({ type: 'error', message: `Missing "coordinates" at ${path}` });
  }

  if (g.type === 'Point') {
    const coords = g.coordinates as number[];
    if (!Array.isArray(coords) || coords.length < 2) {
      errors.push({ type: 'error', message: `Point at ${path} must have at least 2 coordinates [lng, lat]` });
    } else {
      if (Math.abs(coords[0]) > 180) errors.push({ type: 'warning', message: `Longitude ${coords[0]} at ${path} is outside [-180, 180]` });
      if (Math.abs(coords[1]) > 90) errors.push({ type: 'warning', message: `Latitude ${coords[1]} at ${path} is outside [-90, 90]` });
    }
  }

  if (g.type === 'Polygon') {
    const rings = g.coordinates as number[][][];
    if (Array.isArray(rings)) {
      rings.forEach((ring, i) => {
        if (Array.isArray(ring) && ring.length > 0) {
          if (ring.length < 4) {
            errors.push({ type: 'error', message: `Polygon ring[${i}] at ${path} must have at least 4 positions` });
          }
          const first = ring[0];
          const last = ring[ring.length - 1];
          if (Array.isArray(first) && Array.isArray(last)) {
            if (first[0] !== last[0] || first[1] !== last[1]) {
              errors.push({ type: 'error', message: `Polygon ring[${i}] at ${path} is not closed (first and last positions must match)` });
            }
          }
          // RFC 7946: exterior ring should be counterclockwise
          if (i === 0 && ring.length >= 4) {
            let area = 0;
            for (let j = 0; j < ring.length - 1; j++) {
              if (Array.isArray(ring[j]) && Array.isArray(ring[j + 1])) {
                area += (ring[j + 1][0] - ring[j][0]) * (ring[j + 1][1] + ring[j][1]);
              }
            }
            if (area < 0) {
              errors.push({ type: 'warning', message: `RFC 7946: Exterior ring at ${path} should follow right-hand rule (counterclockwise)` });
            }
          }
        }
      });
    }
  }

  if (g.type === 'LineString') {
    const coords = g.coordinates as number[][];
    if (Array.isArray(coords) && coords.length < 2) {
      errors.push({ type: 'error', message: `LineString at ${path} must have at least 2 positions` });
    }
  }

  return errors;
}

function analyzeGeoJSON(obj: unknown): GeoJSONStats | null {
  if (!obj || typeof obj !== 'object') return null;
  const root = obj as Record<string, unknown>;

  const stats: GeoJSONStats = {
    type: (root.type as string) || 'Unknown',
    featureCount: 0,
    geometryTypes: [],
    bbox: null,
    properties: {},
    totalCoordinates: 0,
    minLat: Infinity,
    maxLat: -Infinity,
    minLng: Infinity,
    maxLng: -Infinity,
    crs: 'EPSG:4326 (WGS84) - default',
  };

  const geometryTypeSet = new Set<string>();
  const propertyTypes: Record<string, Set<string>> = {};

  function processGeometry(geom: Record<string, unknown>) {
    if (!geom) return;
    geometryTypeSet.add(geom.type as string);
    if (geom.coordinates) {
      stats.totalCoordinates += countCoordinates(geom.coordinates);
      const bounds = { minLat: stats.minLat, maxLat: stats.maxLat, minLng: stats.minLng, maxLng: stats.maxLng };
      extractCoordinateBounds(geom.coordinates, bounds);
      stats.minLat = bounds.minLat;
      stats.maxLat = bounds.maxLat;
      stats.minLng = bounds.minLng;
      stats.maxLng = bounds.maxLng;
    }
    if (geom.type === 'GeometryCollection' && Array.isArray(geom.geometries)) {
      (geom.geometries as Record<string, unknown>[]).forEach(processGeometry);
    }
  }

  function processFeature(feat: Record<string, unknown>) {
    stats.featureCount++;
    if (feat.geometry) processGeometry(feat.geometry as Record<string, unknown>);
    if (feat.properties && typeof feat.properties === 'object') {
      const props = feat.properties as Record<string, unknown>;
      Object.entries(props).forEach(([key, val]) => {
        if (!propertyTypes[key]) propertyTypes[key] = new Set();
        propertyTypes[key].add(val === null ? 'null' : typeof val);
      });
    }
  }

  if (root.type === 'FeatureCollection' && Array.isArray(root.features)) {
    (root.features as Record<string, unknown>[]).forEach(processFeature);
  } else if (root.type === 'Feature') {
    processFeature(root);
  } else {
    // It's a raw geometry
    processGeometry(root);
    stats.featureCount = 0;
  }

  stats.geometryTypes = Array.from(geometryTypeSet);
  Object.entries(propertyTypes).forEach(([key, types]) => {
    stats.properties[key] = Array.from(types).join(' | ');
  });

  if (stats.minLat !== Infinity && stats.maxLat !== -Infinity) {
    stats.bbox = [stats.minLng, stats.minLat, stats.maxLng, stats.maxLat];
  }

  if (root.crs) stats.crs = JSON.stringify(root.crs);

  return stats;
}

function geojsonToWKT(geom: Record<string, unknown>): string {
  const type = geom.type as string;
  const coords = geom.coordinates;

  const formatCoord = (c: number[]) => `${c[0]} ${c[1]}`;
  const formatRing = (ring: number[][]) => `(${ring.map(formatCoord).join(', ')})`;

  switch (type) {
    case 'Point':
      return `POINT (${formatCoord(coords as number[])})`;
    case 'MultiPoint':
      return `MULTIPOINT (${(coords as number[][]).map(c => `(${formatCoord(c)})`).join(', ')})`;
    case 'LineString':
      return `LINESTRING (${(coords as number[][]).map(formatCoord).join(', ')})`;
    case 'MultiLineString':
      return `MULTILINESTRING (${(coords as number[][][]).map(formatRing).join(', ')})`;
    case 'Polygon':
      return `POLYGON (${(coords as number[][][]).map(formatRing).join(', ')})`;
    case 'MultiPolygon':
      return `MULTIPOLYGON (${(coords as number[][][][]).map(poly => `(${poly.map(formatRing).join(', ')})`).join(', ')})`;
    default:
      return `-- Cannot convert ${type} to WKT --`;
  }
}

function geojsonPointsToCSV(obj: Record<string, unknown>): string {
  const rows: string[][] = [];
  const headers = new Set<string>(['longitude', 'latitude']);

  const features: Record<string, unknown>[] = [];
  if (obj.type === 'FeatureCollection' && Array.isArray(obj.features)) {
    features.push(...(obj.features as Record<string, unknown>[]));
  } else if (obj.type === 'Feature') {
    features.push(obj);
  }

  features.forEach(f => {
    const geom = f.geometry as Record<string, unknown>;
    if (geom?.type !== 'Point') return;
    const props = (f.properties || {}) as Record<string, unknown>;
    Object.keys(props).forEach(k => headers.add(k));
  });

  const headerArr = Array.from(headers);
  rows.push(headerArr);

  features.forEach(f => {
    const geom = f.geometry as Record<string, unknown>;
    if (geom?.type !== 'Point') return;
    const coords = geom.coordinates as number[];
    const props = (f.properties || {}) as Record<string, unknown>;
    const row = headerArr.map(h => {
      if (h === 'longitude') return String(coords[0]);
      if (h === 'latitude') return String(coords[1]);
      return props[h] !== undefined ? String(props[h]) : '';
    });
    rows.push(row);
  });

  return rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
}

function rewindPolygon(coords: number[][][]): number[][][] {
  return coords.map((ring, i) => {
    let area = 0;
    for (let j = 0; j < ring.length - 1; j++) {
      area += (ring[j + 1][0] - ring[j][0]) * (ring[j + 1][1] + ring[j][1]);
    }
    // Exterior ring (i=0) should be counterclockwise (area > 0), holes clockwise (area < 0)
    const shouldReverse = i === 0 ? area < 0 : area > 0;
    return shouldReverse ? [...ring].reverse() : ring;
  });
}

function addBbox(obj: Record<string, unknown>): Record<string, unknown> {
  const stats = analyzeGeoJSON(obj);
  if (stats?.bbox) {
    return { ...obj, bbox: stats.bbox };
  }
  return obj;
}

function removeBbox(obj: Record<string, unknown>): Record<string, unknown> {
  const copy = { ...obj };
  delete copy.bbox;
  if (copy.type === 'FeatureCollection' && Array.isArray(copy.features)) {
    copy.features = (copy.features as Record<string, unknown>[]).map(f => {
      const fc = { ...f };
      delete fc.bbox;
      return fc;
    });
  }
  return copy;
}

function rewindAllPolygons(obj: Record<string, unknown>): Record<string, unknown> {
  const copy = JSON.parse(JSON.stringify(obj));
  function processGeom(geom: Record<string, unknown>) {
    if (geom.type === 'Polygon') {
      geom.coordinates = rewindPolygon(geom.coordinates as number[][][]);
    } else if (geom.type === 'MultiPolygon') {
      geom.coordinates = (geom.coordinates as number[][][][]).map(poly => rewindPolygon(poly));
    }
  }
  if (copy.type === 'FeatureCollection' && Array.isArray(copy.features)) {
    copy.features.forEach((f: Record<string, unknown>) => {
      if (f.geometry) processGeom(f.geometry as Record<string, unknown>);
    });
  } else if (copy.type === 'Feature' && copy.geometry) {
    processGeom(copy.geometry as Record<string, unknown>);
  } else {
    processGeom(copy);
  }
  return copy;
}

/* ---------- Main Component ---------- */
export default function GeoJSONEditor() {
  const [code, setCode] = useState(JSON.stringify(samplePresets.FeatureCollection, null, 2));
  const [copied, setCopied] = useState(false);
  const [rightTab, setRightTab] = useState(0);
  const [parseError, setParseError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parsed = useMemo(() => {
    try {
      const obj = JSON.parse(code);
      setParseError(null);
      return obj as Record<string, unknown>;
    } catch (e) {
      setParseError((e as Error).message);
      return null;
    }
  }, [code]);

  const validationErrors = useMemo(() => {
    if (!parsed) return [{ type: 'error' as const, message: `JSON parse error: ${parseError}` }];
    return validateGeoJSON(parsed);
  }, [parsed, parseError]);

  const stats = useMemo(() => {
    if (!parsed) return null;
    return analyzeGeoJSON(parsed);
  }, [parsed]);

  const features = useMemo(() => {
    if (!parsed) return [];
    if (parsed.type === 'FeatureCollection' && Array.isArray(parsed.features)) {
      return parsed.features as Record<string, unknown>[];
    }
    if (parsed.type === 'Feature') return [parsed];
    return [];
  }, [parsed]);

  const allPropertyKeys = useMemo(() => {
    const keys = new Set<string>();
    features.forEach(f => {
      if (f.properties && typeof f.properties === 'object') {
        Object.keys(f.properties as object).forEach(k => keys.add(k));
      }
    });
    return Array.from(keys);
  }, [features]);

  const isValid = validationErrors.filter(e => e.type === 'error').length === 0;

  const handleFormat = useCallback(() => {
    try {
      const obj = JSON.parse(code);
      setCode(JSON.stringify(obj, null, 2));
    } catch { /* ignore */ }
  }, [code]);

  const handleMinify = useCallback(() => {
    try {
      const obj = JSON.parse(code);
      setCode(JSON.stringify(obj));
    } catch { /* ignore */ }
  }, [code]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([code], { type: 'application/geo+json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.geojson';
    a.click();
    URL.revokeObjectURL(url);
  }, [code]);

  const handleUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      setCode(text);
      try {
        const obj = JSON.parse(text);
        setCode(JSON.stringify(obj, null, 2));
      } catch { /* keep as-is */ }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, []);

  const handlePreset = useCallback((name: string) => {
    setCode(JSON.stringify(samplePresets[name], null, 2));
  }, []);

  const handleConvertToWKT = useCallback(() => {
    if (!parsed) return;
    let geom: Record<string, unknown> | null = null;
    if (parsed.type === 'Feature') {
      geom = parsed.geometry as Record<string, unknown>;
    } else if (['Point', 'MultiPoint', 'LineString', 'MultiLineString', 'Polygon', 'MultiPolygon'].includes(parsed.type as string)) {
      geom = parsed;
    } else if (parsed.type === 'FeatureCollection' && Array.isArray(parsed.features) && (parsed.features as unknown[]).length > 0) {
      geom = ((parsed.features as Record<string, unknown>[])[0].geometry) as Record<string, unknown>;
    }
    if (geom) {
      const wkt = geojsonToWKT(geom);
      navigator.clipboard.writeText(wkt);
    }
  }, [parsed]);

  const handleConvertToCSV = useCallback(() => {
    if (!parsed) return;
    const csv = geojsonPointsToCSV(parsed);
    navigator.clipboard.writeText(csv);
  }, [parsed]);

  const handleAddBbox = useCallback(() => {
    if (!parsed) return;
    setCode(JSON.stringify(addBbox(parsed), null, 2));
  }, [parsed, code]);

  const handleRemoveBbox = useCallback(() => {
    if (!parsed) return;
    setCode(JSON.stringify(removeBbox(parsed), null, 2));
  }, [parsed, code]);

  const handleRewind = useCallback(() => {
    if (!parsed) return;
    setCode(JSON.stringify(rewindAllPolygons(parsed), null, 2));
  }, [parsed, code]);

  return (
    <Box sx={{ bgcolor: '#0a0a0a', minHeight: '100vh', color: 'grey.300' }}>
      <Link to="/" style={{ position: 'fixed', top: 12, left: 12, zIndex: 50, display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', backgroundColor: 'rgba(30,30,30,0.9)', color: '#ccc', borderRadius: 8, textDecoration: 'none', fontSize: 14, border: '1px solid #333' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        Home
      </Link>

      <Box sx={{ maxWidth: 1600, mx: 'auto', pt: 7, px: 2, pb: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <FileJson size={28} color="#60a5fa" />
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#e0e0e0' }}>
            GeoJSON Editor & Validator
          </Typography>
        </Box>

        {/* Toolbar */}
        <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 1.5, mb: 2, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Button size="small" variant="outlined" startIcon={<AlignLeft size={14} />} onClick={handleFormat}
            sx={{ color: '#60a5fa', borderColor: '#60a5fa44', textTransform: 'none', fontSize: 12, '&:hover': { borderColor: '#60a5fa', bgcolor: 'rgba(96,165,250,0.08)' } }}>
            Format
          </Button>
          <Button size="small" variant="outlined" startIcon={<Minimize2 size={14} />} onClick={handleMinify}
            sx={{ color: '#888', borderColor: '#33333388', textTransform: 'none', fontSize: 12, '&:hover': { borderColor: '#555', bgcolor: '#1a1a1a' } }}>
            Minify
          </Button>
          <Button size="small" variant="outlined" startIcon={<ClipboardCheck size={14} />} onClick={() => {/* validation is auto */}}
            sx={{ color: isValid ? '#22c55e' : '#ef4444', borderColor: isValid ? '#22c55e44' : '#ef444444', textTransform: 'none', fontSize: 12, '&:hover': { bgcolor: 'rgba(96,165,250,0.05)' } }}>
            {isValid ? 'Valid' : 'Invalid'}
          </Button>
          <Button size="small" variant="outlined" startIcon={<Trash2 size={14} />} onClick={() => setCode('')}
            sx={{ color: '#888', borderColor: '#33333388', textTransform: 'none', fontSize: 12, '&:hover': { borderColor: '#555', bgcolor: '#1a1a1a' } }}>
            Clear
          </Button>
          <Tooltip title={copied ? 'Copied!' : 'Copy to clipboard'}>
            <IconButton size="small" onClick={handleCopy} sx={{ color: copied ? '#22c55e' : '#888' }}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </IconButton>
          </Tooltip>
          <Button size="small" variant="outlined" startIcon={<Download size={14} />} onClick={handleDownload}
            sx={{ color: '#888', borderColor: '#33333388', textTransform: 'none', fontSize: 12, '&:hover': { borderColor: '#555', bgcolor: '#1a1a1a' } }}>
            Download .geojson
          </Button>
          <Button size="small" variant="outlined" startIcon={<Upload size={14} />} onClick={() => fileInputRef.current?.click()}
            sx={{ color: '#888', borderColor: '#33333388', textTransform: 'none', fontSize: 12, '&:hover': { borderColor: '#555', bgcolor: '#1a1a1a' } }}>
            Upload
          </Button>
          <input ref={fileInputRef} type="file" accept=".geojson,.json" style={{ display: 'none' }} onChange={handleUpload} />

          <Divider orientation="vertical" flexItem sx={{ borderColor: '#333', mx: 0.5 }} />

          {/* Presets */}
          <Typography variant="caption" sx={{ color: '#666', mr: 0.5 }}>Presets:</Typography>
          {Object.keys(samplePresets).map(name => (
            <Chip
              key={name}
              label={name}
              size="small"
              onClick={() => handlePreset(name)}
              sx={{ bgcolor: '#1a1a1a', color: '#999', border: '1px solid #333', fontSize: 11, cursor: 'pointer', '&:hover': { bgcolor: 'rgba(96,165,250,0.1)', color: '#60a5fa' } }}
            />
          ))}
        </Paper>

        {/* Main Content: Split Pane */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          {/* Left: Editor */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Paper sx={{ bgcolor: '#111', border: '1px solid #222' }}>
              <Box sx={{ p: 1.5, borderBottom: '1px solid #222', display: 'flex', alignItems: 'center', gap: 1 }}>
                <FileJson size={16} color="#60a5fa" />
                <Typography variant="body2" sx={{ color: '#aaa', fontWeight: 600 }}>GeoJSON Editor</Typography>
                <Box sx={{ flex: 1 }} />
                <Typography variant="caption" sx={{ color: '#555' }}>
                  {code.length.toLocaleString()} chars | {code.split('\n').length} lines
                </Typography>
              </Box>
              <textarea
                value={code}
                onChange={e => setCode(e.target.value)}
                spellCheck={false}
                style={{
                  width: '100%',
                  minHeight: 500,
                  background: '#0f172a',
                  color: '#e0e0e0',
                  border: 'none',
                  outline: 'none',
                  fontFamily: '"Fira Code", "Cascadia Code", "JetBrains Mono", monospace',
                  fontSize: 13,
                  lineHeight: '20px',
                  padding: '12px 16px',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                  tabSize: 2,
                }}
              />
            </Paper>

            {/* Convert Tools */}
            <Paper sx={{ bgcolor: '#111', border: '1px solid #222', mt: 2, p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <ArrowRightLeft size={16} color="#eab308" />
                <Typography variant="body2" sx={{ color: '#aaa', fontWeight: 600 }}>Convert Tools</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Tooltip title="Copies WKT of first geometry to clipboard">
                  <Button size="small" variant="outlined" onClick={handleConvertToWKT}
                    sx={{ color: '#eab308', borderColor: '#eab30844', textTransform: 'none', fontSize: 12, '&:hover': { borderColor: '#eab308', bgcolor: 'rgba(234,179,8,0.08)' } }}>
                    GeoJSON to WKT
                  </Button>
                </Tooltip>
                <Tooltip title="Copies CSV of point features to clipboard">
                  <Button size="small" variant="outlined" onClick={handleConvertToCSV}
                    sx={{ color: '#eab308', borderColor: '#eab30844', textTransform: 'none', fontSize: 12, '&:hover': { borderColor: '#eab308', bgcolor: 'rgba(234,179,8,0.08)' } }}>
                    Points to CSV
                  </Button>
                </Tooltip>
                <Button size="small" variant="outlined" onClick={handleAddBbox}
                  sx={{ color: '#888', borderColor: '#33333388', textTransform: 'none', fontSize: 12, '&:hover': { borderColor: '#555', bgcolor: '#1a1a1a' } }}>
                  Add bbox
                </Button>
                <Button size="small" variant="outlined" onClick={handleRemoveBbox}
                  sx={{ color: '#888', borderColor: '#33333388', textTransform: 'none', fontSize: 12, '&:hover': { borderColor: '#555', bgcolor: '#1a1a1a' } }}>
                  Remove bbox
                </Button>
                <Tooltip title="Rewind polygon coordinates per RFC 7946 right-hand rule">
                  <Button size="small" variant="outlined" startIcon={<RefreshCw size={13} />} onClick={handleRewind}
                    sx={{ color: '#888', borderColor: '#33333388', textTransform: 'none', fontSize: 12, '&:hover': { borderColor: '#555', bgcolor: '#1a1a1a' } }}>
                    Rewind Polygons
                  </Button>
                </Tooltip>
              </Box>
            </Paper>
          </Box>

          {/* Right: Preview Info */}
          <Box sx={{ width: 480, flexShrink: 0 }}>
            <Paper sx={{ bgcolor: '#111', border: '1px solid #222' }}>
              <Tabs
                value={rightTab}
                onChange={(_, v) => setRightTab(v)}
                sx={{
                  borderBottom: '1px solid #222',
                  minHeight: 40,
                  '& .MuiTab-root': { color: '#777', textTransform: 'none', fontSize: 12, minHeight: 40, py: 0.5 },
                  '& .Mui-selected': { color: '#60a5fa !important' },
                  '& .MuiTabs-indicator': { backgroundColor: '#60a5fa' },
                }}
              >
                <Tab icon={<ClipboardCheck size={14} />} iconPosition="start" label="Validation" />
                <Tab icon={<Eye size={14} />} iconPosition="start" label="Structure" />
                <Tab icon={<TableIcon size={14} />} iconPosition="start" label="Features" />
                <Tab icon={<MapPin size={14} />} iconPosition="start" label="Stats" />
              </Tabs>

              <Box sx={{ p: 2, maxHeight: 600, overflow: 'auto' }}>
                {/* Validation Tab */}
                {rightTab === 0 && (
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      {isValid ? (
                        <Chip icon={<CheckCircle size={14} />} label="Valid GeoJSON" size="small"
                          sx={{ bgcolor: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid #22c55e44' }} />
                      ) : (
                        <Chip icon={<AlertTriangle size={14} />} label="Invalid GeoJSON" size="small"
                          sx={{ bgcolor: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid #ef444444' }} />
                      )}
                    </Box>
                    {validationErrors.length === 0 && (
                      <Typography variant="body2" sx={{ color: '#22c55e', fontSize: 13 }}>
                        No errors or warnings. GeoJSON is fully compliant with RFC 7946.
                      </Typography>
                    )}
                    {validationErrors.map((err, i) => (
                      <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1, p: 1, bgcolor: err.type === 'error' ? 'rgba(239,68,68,0.05)' : 'rgba(234,179,8,0.05)', borderRadius: 1, border: `1px solid ${err.type === 'error' ? '#ef444422' : '#eab30822'}` }}>
                        <AlertTriangle size={14} color={err.type === 'error' ? '#ef4444' : '#eab308'} style={{ marginTop: 2, flexShrink: 0 }} />
                        <Box>
                          <Typography variant="body2" sx={{ color: err.type === 'error' ? '#ef4444' : '#eab308', fontSize: 13 }}>
                            {err.message}
                          </Typography>
                          {err.path && (
                            <Typography variant="caption" sx={{ color: '#666', fontFamily: 'monospace' }}>
                              at {err.path}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}

                {/* Structure Tab */}
                {rightTab === 1 && stats && (
                  <Box>
                    <Box sx={{ mb: 2 }}>
                      {[
                        { label: 'Type', value: stats.type },
                        { label: 'Features', value: String(stats.featureCount) },
                        { label: 'Geometry Types', value: stats.geometryTypes.join(', ') || 'None' },
                        { label: 'CRS', value: stats.crs },
                      ].map(item => (
                        <Box key={item.label} sx={{ display: 'flex', py: 0.75, borderBottom: '1px solid #1a1a1a' }}>
                          <Typography variant="body2" sx={{ color: '#888', fontSize: 13, minWidth: 130 }}>{item.label}</Typography>
                          <Typography variant="body2" sx={{ color: '#e0e0e0', fontSize: 13, fontFamily: 'monospace' }}>{item.value}</Typography>
                        </Box>
                      ))}
                    </Box>

                    {stats.bbox && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#aaa', mb: 1 }}>Bounding Box</Typography>
                        <Box sx={{ bgcolor: '#1a1a1a', p: 1.5, borderRadius: 1, fontFamily: 'monospace', fontSize: 12 }}>
                          <Box sx={{ color: '#60a5fa' }}>[{stats.bbox.map(v => v.toFixed(6)).join(', ')}]</Box>
                          <Box sx={{ color: '#888', mt: 0.5, fontSize: 11 }}>
                            SW: ({stats.bbox[1].toFixed(4)}, {stats.bbox[0].toFixed(4)}) | NE: ({stats.bbox[3].toFixed(4)}, {stats.bbox[2].toFixed(4)})
                          </Box>
                        </Box>
                      </Box>
                    )}

                    {Object.keys(stats.properties).length > 0 && (
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#aaa', mb: 1 }}>Properties</Typography>
                        {Object.entries(stats.properties).map(([key, type]) => (
                          <Box key={key} sx={{ display: 'flex', py: 0.5, borderBottom: '1px solid #1a1a1a' }}>
                            <Typography variant="body2" sx={{ color: '#60a5fa', fontSize: 12, fontFamily: 'monospace', minWidth: 120 }}>{key}</Typography>
                            <Chip label={type} size="small" sx={{ bgcolor: '#1a1a1a', color: '#888', fontSize: 11, height: 20, border: '1px solid #333' }} />
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                )}
                {rightTab === 1 && !stats && (
                  <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>Parse the GeoJSON to see structure</Typography>
                )}

                {/* Features Tab */}
                {rightTab === 2 && (
                  <Box>
                    {features.length === 0 ? (
                      <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>No features found</Typography>
                    ) : (
                      <TableContainer sx={{ maxHeight: 500 }}>
                        <Table size="small" stickyHeader>
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ bgcolor: '#1a1a1a', color: '#888', borderColor: '#333', fontSize: 11, fontWeight: 600 }}>#</TableCell>
                              <TableCell sx={{ bgcolor: '#1a1a1a', color: '#888', borderColor: '#333', fontSize: 11, fontWeight: 600 }}>Geometry</TableCell>
                              {allPropertyKeys.map(k => (
                                <TableCell key={k} sx={{ bgcolor: '#1a1a1a', color: '#888', borderColor: '#333', fontSize: 11, fontWeight: 600 }}>{k}</TableCell>
                              ))}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {features.map((f, i) => {
                              const geom = f.geometry as Record<string, unknown>;
                              const props = (f.properties || {}) as Record<string, unknown>;
                              return (
                                <TableRow key={i} sx={{ '&:hover': { bgcolor: '#1a1a1a' } }}>
                                  <TableCell sx={{ color: '#666', borderColor: '#222', fontSize: 11 }}>{i + 1}</TableCell>
                                  <TableCell sx={{ borderColor: '#222' }}>
                                    <Chip label={geom?.type as string || 'null'} size="small"
                                      sx={{ bgcolor: '#1a1a2e', color: '#a78bfa', fontSize: 10, height: 20, border: '1px solid #a78bfa33' }} />
                                  </TableCell>
                                  {allPropertyKeys.map(k => (
                                    <TableCell key={k} sx={{ color: '#ccc', borderColor: '#222', fontSize: 11, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {props[k] !== undefined ? String(props[k]) : ''}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </Box>
                )}

                {/* Stats Tab */}
                {rightTab === 3 && stats && (
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#aaa', mb: 1 }}>Geometry Statistics</Typography>
                    {[
                      { label: 'Total Coordinates', value: stats.totalCoordinates.toLocaleString() },
                      { label: 'Min Latitude', value: stats.minLat === Infinity ? 'N/A' : stats.minLat.toFixed(6) },
                      { label: 'Max Latitude', value: stats.maxLat === -Infinity ? 'N/A' : stats.maxLat.toFixed(6) },
                      { label: 'Min Longitude', value: stats.minLng === Infinity ? 'N/A' : stats.minLng.toFixed(6) },
                      { label: 'Max Longitude', value: stats.maxLng === -Infinity ? 'N/A' : stats.maxLng.toFixed(6) },
                    ].map(item => (
                      <Box key={item.label} sx={{ display: 'flex', py: 0.75, borderBottom: '1px solid #1a1a1a' }}>
                        <Typography variant="body2" sx={{ color: '#888', fontSize: 13, minWidth: 140 }}>{item.label}</Typography>
                        <Typography variant="body2" sx={{ color: '#e0e0e0', fontSize: 13, fontFamily: 'monospace' }}>{item.value}</Typography>
                      </Box>
                    ))}

                    {stats.geometryTypes.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#aaa', mb: 1 }}>Geometry Types</Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {stats.geometryTypes.map(gt => (
                            <Chip key={gt} label={gt} size="small"
                              sx={{ bgcolor: 'rgba(96,165,250,0.12)', color: '#60a5fa', border: '1px solid #60a5fa33', fontSize: 11 }} />
                          ))}
                        </Box>
                      </Box>
                    )}

                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#aaa', mb: 1 }}>Summary</Typography>
                      <Box sx={{ bgcolor: '#1a1a1a', p: 1.5, borderRadius: 1, fontSize: 12, color: '#ccc', lineHeight: 1.8 }}>
                        {stats.type === 'FeatureCollection'
                          ? `FeatureCollection with ${stats.featureCount} feature${stats.featureCount !== 1 ? 's' : ''}`
                          : stats.type === 'Feature'
                            ? `Single Feature with ${stats.geometryTypes[0] || 'null'} geometry`
                            : `${stats.type} geometry`
                        }
                        {stats.totalCoordinates > 0 && ` containing ${stats.totalCoordinates.toLocaleString()} total coordinate pairs`}.
                        {stats.bbox && (
                          <Box component="span" sx={{ display: 'block', mt: 0.5 }}>
                            Spatial extent spans from ({stats.minLat.toFixed(4)}, {stats.minLng.toFixed(4)}) to ({stats.maxLat.toFixed(4)}, {stats.maxLng.toFixed(4)}).
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Box>
                )}
                {rightTab === 3 && !stats && (
                  <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>Parse the GeoJSON to see statistics</Typography>
                )}
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
