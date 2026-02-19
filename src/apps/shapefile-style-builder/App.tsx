import { useState, useMemo, useCallback, useRef } from 'react';
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
  Slider,
  Stepper,
  Step,
  StepLabel,
  Collapse,
} from '@mui/material';
import {
  Copy,
  Check,
  Upload,
  Download,
  Trash2,
  Palette,
  Database,
  FileCode,
  Server,
  Eye,
  ChevronDown,
  ChevronUp,
  Play,
  Code,
  Table as TableIcon,
  MapPin,
  Layers,
  Plus,
  X,
  FileJson,
  Type,
  Hash,
  Calendar,
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

interface ColumnInfo {
  name: string;
  type: 'string' | 'number' | 'date';
  sampleValues: string[];
  uniqueValues: string[];
}

interface ParsedData {
  columns: ColumnInfo[];
  rows: Record<string, string | number>[];
  rowCount: number;
}

interface StyleConfig {
  geometryType: 'Point' | 'LineString' | 'Polygon';
  styleType: 'simple' | 'categorized' | 'graduated';
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  opacity: number;
  pointSize: number;
  categorizedColumn: string;
  categorizedColors: Record<string, string>;
  graduatedColumn: string;
  graduatedClasses: number;
  graduatedMethod: 'equal' | 'quantile' | 'natural';
  colorRampStart: string;
  colorRampEnd: string;
  labelColumn: string;
  labelFontSize: number;
  labelColor: string;
  labelHaloColor: string;
  labelHaloWidth: number;
}

interface GeoServerConfig {
  url: string;
  workspace: string;
  storeName: string;
  layerName: string;
  username: string;
  password: string;
}

// HSL-based color interpolation for smooth gradients
function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [h * 360, s * 100, l * 100];
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (v: number) => Math.round(v * 255).toString(16).padStart(2, '0');
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

function interpolateColors(start: string, end: string, steps: number): string[] {
  const [h1, s1, l1] = hexToHsl(start);
  const [h2, s2, l2] = hexToHsl(end);
  const colors: string[] = [];
  for (let i = 0; i < steps; i++) {
    const t = steps === 1 ? 0 : i / (steps - 1);
    let hDiff = h2 - h1;
    if (Math.abs(hDiff) > 180) {
      hDiff = hDiff > 0 ? hDiff - 360 : hDiff + 360;
    }
    const h = ((h1 + hDiff * t) % 360 + 360) % 360;
    const s = s1 + (s2 - s1) * t;
    const l = l1 + (l2 - l1) * t;
    colors.push(hslToHex(h, s, l));
  }
  return colors;
}

function generateDistinctColors(count: number): string[] {
  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    const hue = (i * 360 / count + 10) % 360;
    colors.push(hslToHex(hue, 70, 55));
  }
  return colors;
}

function escapeXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function parseCSV(text: string, delimiter: string, hasHeader: boolean, quoteChar: string): ParsedData {
  const lines = text.trim().split('\n');
  if (lines.length === 0) return { columns: [], rows: [], rowCount: 0 };

  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === quoteChar) {
        if (inQuotes && i + 1 < line.length && line[i + 1] === quoteChar) {
          current += quoteChar;
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === delimiter && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headerLine = hasHeader ? parseLine(lines[0]) : [];
  const dataStartIdx = hasHeader ? 1 : 0;
  const headers = hasHeader ? headerLine : headerLine.length > 0 ? parseLine(lines[0]).map((_, i) => `column_${i + 1}`) : [];
  if (!hasHeader && lines.length > 0) {
    const firstRow = parseLine(lines[0]);
    for (let i = headers.length; i < firstRow.length; i++) {
      headers.push(`column_${i + 1}`);
    }
  }

  const rows: Record<string, string | number>[] = [];
  for (let i = dataStartIdx; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const values = parseLine(lines[i]);
    const row: Record<string, string | number> = {};
    headers.forEach((h, idx) => {
      const val = values[idx] || '';
      const num = Number(val);
      row[h] = val !== '' && !isNaN(num) && isFinite(num) ? num : val;
    });
    rows.push(row);
  }

  const columns: ColumnInfo[] = headers.map((name) => {
    const values = rows.map((r) => r[name]);
    const sampleVals = values.slice(0, 5).map(String);
    const isNumeric = values.every((v) => typeof v === 'number');
    const isDate = !isNumeric && values.slice(0, 10).every((v) => {
      if (typeof v !== 'string') return false;
      return !isNaN(Date.parse(v)) && v.length >= 8;
    });
    const uniqueVals = Array.from(new Set(values.map(String))).slice(0, 50);
    return { name, type: isNumeric ? 'number' : isDate ? 'date' : 'string', sampleValues: sampleVals, uniqueValues: uniqueVals };
  });

  return { columns, rows, rowCount: rows.length };
}

function parseJSON(text: string): ParsedData {
  const data = JSON.parse(text);

  // Handle GeoJSON
  if (data.type === 'FeatureCollection' && Array.isArray(data.features)) {
    const features = data.features;
    const allKeys = new Set<string>();
    features.forEach((f: any) => {
      if (f.properties) Object.keys(f.properties).forEach((k) => allKeys.add(k));
    });
    const headers = Array.from(allKeys);
    const rows = features.map((f: any) => {
      const row: Record<string, string | number> = {};
      headers.forEach((h) => {
        const val = f.properties?.[h];
        row[h] = val !== null && val !== undefined ? (typeof val === 'object' ? JSON.stringify(val) : val) : '';
      });
      // Store geometry info
      if (f.geometry) {
        row['__geometry_type__'] = f.geometry.type;
        row['__geometry__'] = JSON.stringify(f.geometry);
      }
      return row;
    });

    const columns: ColumnInfo[] = headers.map((name) => {
      const values = rows.map((r: any) => r[name]);
      const sampleVals = values.slice(0, 5).map(String);
      const isNumeric = values.filter((v: any) => v !== '').every((v: any) => typeof v === 'number' || !isNaN(Number(v)));
      const uniqueVals = Array.from(new Set(values.map(String))).slice(0, 50) as string[];
      return { name, type: (isNumeric ? 'number' : 'string') as ColumnInfo['type'], sampleValues: sampleVals, uniqueValues: uniqueVals };
    });

    return { columns, rows, rowCount: rows.length };
  }

  // Handle array of objects
  if (Array.isArray(data)) {
    const allKeys = new Set<string>();
    data.forEach((item: any) => { if (typeof item === 'object' && item !== null) Object.keys(item).forEach((k) => allKeys.add(k)); });
    const headers = Array.from(allKeys);
    const rows = data.map((item: any) => {
      const row: Record<string, string | number> = {};
      headers.forEach((h) => {
        const val = item[h];
        row[h] = val !== null && val !== undefined ? (typeof val === 'object' ? JSON.stringify(val) : val) : '';
      });
      return row;
    });
    const columns: ColumnInfo[] = headers.map((name) => {
      const values = rows.map((r) => r[name]);
      const sampleVals = values.slice(0, 5).map(String);
      const isNumeric = values.filter((v) => v !== '').every((v) => typeof v === 'number');
      const uniqueVals = Array.from(new Set(values.map(String))).slice(0, 50);
      return { name, type: isNumeric ? 'number' : 'string', sampleValues: sampleVals, uniqueValues: uniqueVals };
    });
    return { columns, rows, rowCount: rows.length };
  }

  return { columns: [], rows: [], rowCount: 0 };
}

function generateSLD(style: StyleConfig, columns: ColumnInfo[], data: ParsedData): string {
  const geomType = style.geometryType;

  const buildSimpleSymbolizer = (fill: string, stroke: string, strokeW: number, opacity: number, pointSz: number, indent: string): string => {
    if (geomType === 'Point') {
      return `${indent}<PointSymbolizer>
${indent}  <Graphic>
${indent}    <Mark>
${indent}      <WellKnownName>circle</WellKnownName>
${indent}      <Fill>
${indent}        <CssParameter name="fill">${fill}</CssParameter>
${indent}        <CssParameter name="fill-opacity">${opacity}</CssParameter>
${indent}      </Fill>
${indent}      <Stroke>
${indent}        <CssParameter name="stroke">${stroke}</CssParameter>
${indent}        <CssParameter name="stroke-width">${strokeW}</CssParameter>
${indent}      </Stroke>
${indent}    </Mark>
${indent}    <Size>${pointSz}</Size>
${indent}  </Graphic>
${indent}</PointSymbolizer>`;
    } else if (geomType === 'LineString') {
      return `${indent}<LineSymbolizer>
${indent}  <Stroke>
${indent}    <CssParameter name="stroke">${stroke}</CssParameter>
${indent}    <CssParameter name="stroke-width">${strokeW}</CssParameter>
${indent}    <CssParameter name="stroke-opacity">${opacity}</CssParameter>
${indent}  </Stroke>
${indent}</LineSymbolizer>`;
    } else {
      return `${indent}<PolygonSymbolizer>
${indent}  <Fill>
${indent}    <CssParameter name="fill">${fill}</CssParameter>
${indent}    <CssParameter name="fill-opacity">${opacity}</CssParameter>
${indent}  </Fill>
${indent}  <Stroke>
${indent}    <CssParameter name="stroke">${stroke}</CssParameter>
${indent}    <CssParameter name="stroke-width">${strokeW}</CssParameter>
${indent}  </Stroke>
${indent}</PolygonSymbolizer>`;
    }
  };

  const buildLabelSymbolizer = (indent: string): string => {
    if (!style.labelColumn) return '';
    return `
${indent}<TextSymbolizer>
${indent}  <Label>
${indent}    <ogc:PropertyName>${escapeXml(style.labelColumn)}</ogc:PropertyName>
${indent}  </Label>
${indent}  <Font>
${indent}    <CssParameter name="font-family">Arial</CssParameter>
${indent}    <CssParameter name="font-size">${style.labelFontSize}</CssParameter>
${indent}  </Font>
${indent}  <LabelPlacement>
${indent}    <PointPlacement>
${indent}      <AnchorPoint>
${indent}        <AnchorPointX>0.5</AnchorPointX>
${indent}        <AnchorPointY>0</AnchorPointY>
${indent}      </AnchorPoint>
${indent}      <Displacement>
${indent}        <DisplacementX>0</DisplacementX>
${indent}        <DisplacementY>-5</DisplacementY>
${indent}      </Displacement>
${indent}    </PointPlacement>
${indent}  </LabelPlacement>
${indent}  <Fill>
${indent}    <CssParameter name="fill">${style.labelColor}</CssParameter>
${indent}  </Fill>
${indent}  <Halo>
${indent}    <Radius>${style.labelHaloWidth}</Radius>
${indent}    <Fill>
${indent}      <CssParameter name="fill">${style.labelHaloColor}</CssParameter>
${indent}    </Fill>
${indent}  </Halo>
${indent}</TextSymbolizer>`;
  };

  let rulesXml = '';
  const ind = '          ';

  if (style.styleType === 'simple') {
    rulesXml = `        <Rule>
          <Name>default</Name>
          <Title>Default Style</Title>
${buildSimpleSymbolizer(style.fillColor, style.strokeColor, style.strokeWidth, style.opacity, style.pointSize, ind)}${buildLabelSymbolizer(ind)}
        </Rule>`;
  } else if (style.styleType === 'categorized') {
    const col = style.categorizedColumn;
    const entries = Object.entries(style.categorizedColors);
    rulesXml = entries.map(([value, color]) => {
      return `        <Rule>
          <Name>${escapeXml(value)}</Name>
          <Title>${escapeXml(value)}</Title>
          <ogc:Filter>
            <ogc:PropertyIsEqualTo>
              <ogc:PropertyName>${escapeXml(col)}</ogc:PropertyName>
              <ogc:Literal>${escapeXml(value)}</ogc:Literal>
            </ogc:PropertyIsEqualTo>
          </ogc:Filter>
${buildSimpleSymbolizer(color, style.strokeColor, style.strokeWidth, style.opacity, style.pointSize, ind)}${buildLabelSymbolizer(ind)}
        </Rule>`;
    }).join('\n');
  } else if (style.styleType === 'graduated') {
    const col = style.graduatedColumn;
    const colInfo = columns.find((c) => c.name === col);
    if (colInfo) {
      const numericValues = data.rows.map((r) => Number(r[col])).filter((v) => !isNaN(v) && isFinite(v)).sort((a, b) => a - b);
      const min = numericValues[0] || 0;
      const max = numericValues[numericValues.length - 1] || 100;
      const nClasses = style.graduatedClasses;
      const colors = interpolateColors(style.colorRampStart, style.colorRampEnd, nClasses);
      let breaks: number[] = [];

      if (style.graduatedMethod === 'equal') {
        const step = (max - min) / nClasses;
        for (let i = 0; i <= nClasses; i++) breaks.push(min + step * i);
      } else if (style.graduatedMethod === 'quantile') {
        breaks = [min];
        for (let i = 1; i < nClasses; i++) {
          const idx = Math.floor((i / nClasses) * numericValues.length);
          breaks.push(numericValues[idx]);
        }
        breaks.push(max);
      } else {
        // Natural breaks (Jenks) approximation using equal interval as fallback
        const step = (max - min) / nClasses;
        for (let i = 0; i <= nClasses; i++) breaks.push(min + step * i);
      }

      rulesXml = colors.map((color, i) => {
        const low = breaks[i];
        const high = breaks[i + 1];
        return `        <Rule>
          <Name>class_${i}</Name>
          <Title>${low.toFixed(2)} - ${high.toFixed(2)}</Title>
          <ogc:Filter>
            <ogc:And>
              <ogc:PropertyIsGreaterThanOrEqualTo>
                <ogc:PropertyName>${escapeXml(col)}</ogc:PropertyName>
                <ogc:Literal>${low}</ogc:Literal>
              </ogc:PropertyIsGreaterThanOrEqualTo>
              <ogc:PropertyIsLessThan${i === nClasses - 1 ? 'OrEqualTo' : ''}>
                <ogc:PropertyName>${escapeXml(col)}</ogc:PropertyName>
                <ogc:Literal>${high}</ogc:Literal>
              </ogc:PropertyIsLessThan${i === nClasses - 1 ? 'OrEqualTo' : ''}>
            </ogc:And>
          </ogc:Filter>
${buildSimpleSymbolizer(color, style.strokeColor, style.strokeWidth, style.opacity, style.pointSize, ind)}${buildLabelSymbolizer(ind)}
        </Rule>`;
      }).join('\n');
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<StyledLayerDescriptor version="1.0.0"
  xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd"
  xmlns="http://www.opengis.net/sld"
  xmlns:ogc="http://www.opengis.net/ogc"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <NamedLayer>
    <Name>generated_style</Name>
    <UserStyle>
      <Title>Generated Style</Title>
      <FeatureTypeStyle>
${rulesXml}
      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>
</StyledLayerDescriptor>`;
}

function buildGeoJSON(data: ParsedData, geomType: string, latCol: string, lngCol: string, wktCol: string, crs: string): string {
  const features = data.rows.map((row) => {
    let geometry: any = null;

    // Check if row already has geometry (from GeoJSON input)
    if (row['__geometry__']) {
      try {
        geometry = JSON.parse(String(row['__geometry__']));
      } catch { /* ignore */ }
    }

    if (!geometry) {
      if (geomType === 'Point' && latCol && lngCol) {
        const lat = Number(row[latCol]);
        const lng = Number(row[lngCol]);
        if (!isNaN(lat) && !isNaN(lng)) {
          geometry = { type: 'Point', coordinates: [lng, lat] };
        }
      } else if (wktCol && row[wktCol]) {
        // Basic WKT parsing for POINT
        const wkt = String(row[wktCol]);
        const pointMatch = wkt.match(/POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i);
        if (pointMatch) {
          geometry = { type: 'Point', coordinates: [parseFloat(pointMatch[1]), parseFloat(pointMatch[2])] };
        }
      }
    }

    if (!geometry) {
      geometry = { type: 'Point', coordinates: [0, 0] };
    }

    const properties: Record<string, any> = {};
    Object.entries(row).forEach(([k, v]) => {
      if (!k.startsWith('__')) properties[k] = v;
    });

    return { type: 'Feature', geometry, properties };
  });

  const geojson: any = {
    type: 'FeatureCollection',
    features,
  };

  if (crs && crs !== '4326') {
    geojson.crs = {
      type: 'name',
      properties: { name: `urn:ogc:def:crs:EPSG::${crs}` },
    };
  }

  return JSON.stringify(geojson, null, 2);
}

export default function ShapefileStyleBuilder() {
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({ open: false, message: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Input state
  const [inputTab, setInputTab] = useState(0);
  const [jsonInput, setJsonInput] = useState('');
  const [csvInput, setCsvInput] = useState('');
  const [csvDelimiter, setCsvDelimiter] = useState(',');
  const [csvHasHeader, setCsvHasHeader] = useState(true);
  const [csvQuoteChar, setCsvQuoteChar] = useState('"');
  const [parseError, setParseError] = useState('');

  // Parsed data
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [isGeoJSON, setIsGeoJSON] = useState(false);

  // Geometry config
  const [geomType, setGeomType] = useState<'Point' | 'LineString' | 'Polygon'>('Point');
  const [latColumn, setLatColumn] = useState('');
  const [lngColumn, setLngColumn] = useState('');
  const [wktColumn, setWktColumn] = useState('');
  const [crs, setCrs] = useState('4326');

  // Style config
  const [styleConfig, setStyleConfig] = useState<StyleConfig>({
    geometryType: 'Point',
    styleType: 'simple',
    fillColor: '#3388ff',
    strokeColor: '#2255aa',
    strokeWidth: 1,
    opacity: 0.7,
    pointSize: 8,
    categorizedColumn: '',
    categorizedColors: {},
    graduatedColumn: '',
    graduatedClasses: 5,
    graduatedMethod: 'equal',
    colorRampStart: '#ffffcc',
    colorRampEnd: '#006837',
    labelColumn: '',
    labelFontSize: 12,
    labelColor: '#333333',
    labelHaloColor: '#ffffff',
    labelHaloWidth: 2,
  });

  // GeoServer config
  const [gsConfig, setGsConfig] = useState<GeoServerConfig>({
    url: 'http://localhost:8080/geoserver',
    workspace: 'my_workspace',
    storeName: 'my_store',
    layerName: 'my_layer',
    username: 'admin',
    password: 'geoserver',
  });

  // Section visibility
  const [showPreview, setShowPreview] = useState(true);
  const [showGeomConfig, setShowGeomConfig] = useState(true);
  const [showGeoJSON, setShowGeoJSON] = useState(false);
  const [showStyle, setShowStyle] = useState(true);
  const [showSLD, setShowSLD] = useState(false);
  const [showGeoServer, setShowGeoServer] = useState(false);
  const [showExport, setShowExport] = useState(false);

  const copyToClipboard = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setSnackbar({ open: true, message: `${label} copied!` });
  }, []);

  const downloadFile = useCallback((content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleParse = useCallback(() => {
    setParseError('');
    try {
      if (inputTab === 0) {
        if (!jsonInput.trim()) { setParseError('Please enter JSON data'); return; }
        const parsed = parseJSON(jsonInput);
        setParsedData(parsed);
        // Detect if it's GeoJSON
        try {
          const obj = JSON.parse(jsonInput);
          setIsGeoJSON(obj.type === 'FeatureCollection');
          if (obj.type === 'FeatureCollection' && obj.features?.length > 0) {
            const firstGeomType = obj.features[0]?.geometry?.type;
            if (firstGeomType) {
              const gt = firstGeomType === 'MultiPoint' ? 'Point' :
                firstGeomType === 'MultiLineString' ? 'LineString' :
                firstGeomType === 'MultiPolygon' ? 'Polygon' : firstGeomType;
              setGeomType(gt as any);
              setStyleConfig((prev) => ({ ...prev, geometryType: gt as any }));
            }
          }
        } catch { setIsGeoJSON(false); }
        // Auto-detect lat/lng columns
        if (parsed.columns.length > 0) {
          const latCol = parsed.columns.find((c) => /^(lat|latitude|y|lat_)$/i.test(c.name));
          const lngCol = parsed.columns.find((c) => /^(lng|lon|longitude|x|lon_|long)$/i.test(c.name));
          if (latCol) setLatColumn(latCol.name);
          if (lngCol) setLngColumn(lngCol.name);
        }
      } else {
        if (!csvInput.trim()) { setParseError('Please enter CSV data'); return; }
        const parsed = parseCSV(csvInput, csvDelimiter, csvHasHeader, csvQuoteChar);
        setParsedData(parsed);
        setIsGeoJSON(false);
        if (parsed.columns.length > 0) {
          const latCol = parsed.columns.find((c) => /^(lat|latitude|y)$/i.test(c.name));
          const lngCol = parsed.columns.find((c) => /^(lng|lon|longitude|x|long)$/i.test(c.name));
          if (latCol) setLatColumn(latCol.name);
          if (lngCol) setLngColumn(lngCol.name);
        }
      }
    } catch (err: any) {
      setParseError(`Parse error: ${err.message}`);
    }
  }, [inputTab, jsonInput, csvInput, csvDelimiter, csvHasHeader, csvQuoteChar]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      if (file.name.endsWith('.json') || file.name.endsWith('.geojson')) {
        setInputTab(0);
        setJsonInput(text);
      } else {
        setInputTab(1);
        setCsvInput(text);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, []);

  const geojsonOutput = useMemo(() => {
    if (!parsedData) return '';
    return buildGeoJSON(parsedData, geomType, latColumn, lngColumn, wktColumn, crs);
  }, [parsedData, geomType, latColumn, lngColumn, wktColumn, crs]);

  const sldOutput = useMemo(() => {
    if (!parsedData) return '';
    return generateSLD(styleConfig, parsedData.columns, parsedData);
  }, [parsedData, styleConfig]);

  const updateCategorizedColors = useCallback(() => {
    if (!parsedData || !styleConfig.categorizedColumn) return;
    const col = parsedData.columns.find((c) => c.name === styleConfig.categorizedColumn);
    if (!col) return;
    const uniqueVals = col.uniqueValues;
    const colors = generateDistinctColors(uniqueVals.length);
    const colorMap: Record<string, string> = {};
    uniqueVals.forEach((v, i) => { colorMap[v] = colors[i] || '#888888'; });
    setStyleConfig((prev) => ({ ...prev, categorizedColors: colorMap }));
  }, [parsedData, styleConfig.categorizedColumn]);

  // Generate cURL commands
  const curlCommands = useMemo(() => {
    const { url, workspace, storeName, layerName, username, password } = gsConfig;
    const auth = `-u "${username}:${password}"`;

    const createWorkspace = `curl -v -X POST ${auth} \\
  -H "Content-Type: application/json" \\
  -d '{"workspace":{"name":"${workspace}"}}' \\
  "${url}/rest/workspaces"`;

    const createDatastore = `curl -v -X PUT ${auth} \\
  -H "Content-Type: application/json" \\
  -d '{
    "dataStore": {
      "name": "${storeName}",
      "type": "GeoJSON",
      "connectionParameters": {
        "entry": [
          {"@key": "url", "$": "file:data/${workspace}/${layerName}.geojson"}
        ]
      }
    }
  }' \\
  "${url}/rest/workspaces/${workspace}/datastores/${storeName}"`;

    const uploadData = `curl -v -X PUT ${auth} \\
  -H "Content-Type: application/json" \\
  --data-binary @${layerName}.geojson \\
  "${url}/rest/workspaces/${workspace}/datastores/${storeName}/file.geojson"`;

    const publishLayer = `curl -v -X POST ${auth} \\
  -H "Content-Type: application/json" \\
  -d '{
    "featureType": {
      "name": "${layerName}",
      "nativeName": "${layerName}",
      "title": "${layerName}",
      "srs": "EPSG:${crs}",
      "enabled": true
    }
  }' \\
  "${url}/rest/workspaces/${workspace}/datastores/${storeName}/featuretypes"`;

    const uploadStyle = `curl -v -X POST ${auth} \\
  -H "Content-Type: application/vnd.ogc.sld+xml" \\
  -d @${layerName}_style.sld \\
  "${url}/rest/workspaces/${workspace}/styles?name=${layerName}_style"`;

    const setDefaultStyle = `curl -v -X PUT ${auth} \\
  -H "Content-Type: application/json" \\
  -d '{"layer":{"defaultStyle":{"name":"${layerName}_style","workspace":"${workspace}"}}}' \\
  "${url}/rest/layers/${workspace}:${layerName}"`;

    return { createWorkspace, createDatastore, uploadData, publishLayer, uploadStyle, setDefaultStyle };
  }, [gsConfig, crs]);

  const pythonScript = useMemo(() => {
    const { url, workspace, storeName, layerName, username, password } = gsConfig;
    return `#!/usr/bin/env python3
"""GeoServer Publishing Script - Auto-generated"""
import requests
import json
import os

GEOSERVER_URL = "${url}"
WORKSPACE = "${workspace}"
STORE_NAME = "${storeName}"
LAYER_NAME = "${layerName}"
AUTH = ("${username}", "${password}")
HEADERS_JSON = {"Content-Type": "application/json"}
HEADERS_SLD = {"Content-Type": "application/vnd.ogc.sld+xml"}

def create_workspace():
    """Step 1: Create workspace"""
    print("Creating workspace...")
    resp = requests.post(
        f"{GEOSERVER_URL}/rest/workspaces",
        auth=AUTH, headers=HEADERS_JSON,
        json={"workspace": {"name": WORKSPACE}}
    )
    if resp.status_code in (201, 409):
        print(f"  Workspace ready (status: {resp.status_code})")
    else:
        print(f"  Warning: {resp.status_code} - {resp.text}")

def upload_data():
    """Step 2: Upload GeoJSON data"""
    print("Uploading GeoJSON data...")
    geojson_file = f"{LAYER_NAME}.geojson"
    if not os.path.exists(geojson_file):
        print(f"  Error: {geojson_file} not found!")
        return False
    with open(geojson_file, "r") as f:
        data = f.read()
    resp = requests.put(
        f"{GEOSERVER_URL}/rest/workspaces/{WORKSPACE}/datastores/{STORE_NAME}/file.geojson",
        auth=AUTH,
        headers={"Content-Type": "application/json"},
        data=data
    )
    print(f"  Upload status: {resp.status_code}")
    return resp.status_code in (200, 201)

def publish_layer():
    """Step 3: Publish feature type"""
    print("Publishing layer...")
    resp = requests.post(
        f"{GEOSERVER_URL}/rest/workspaces/{WORKSPACE}/datastores/{STORE_NAME}/featuretypes",
        auth=AUTH, headers=HEADERS_JSON,
        json={
            "featureType": {
                "name": LAYER_NAME,
                "nativeName": LAYER_NAME,
                "title": LAYER_NAME,
                "srs": "EPSG:${crs}",
                "enabled": True
            }
        }
    )
    print(f"  Publish status: {resp.status_code}")

def upload_style():
    """Step 4: Upload SLD style"""
    print("Uploading style...")
    sld_file = f"{LAYER_NAME}_style.sld"
    if not os.path.exists(sld_file):
        print(f"  Warning: {sld_file} not found, skipping style upload")
        return
    with open(sld_file, "r") as f:
        sld_data = f.read()
    resp = requests.post(
        f"{GEOSERVER_URL}/rest/workspaces/{WORKSPACE}/styles?name={LAYER_NAME}_style",
        auth=AUTH, headers=HEADERS_SLD,
        data=sld_data
    )
    print(f"  Style upload status: {resp.status_code}")

def set_default_style():
    """Step 5: Set default style for layer"""
    print("Setting default style...")
    resp = requests.put(
        f"{GEOSERVER_URL}/rest/layers/{WORKSPACE}:{LAYER_NAME}",
        auth=AUTH, headers=HEADERS_JSON,
        json={
            "layer": {
                "defaultStyle": {
                    "name": f"{LAYER_NAME}_style",
                    "workspace": WORKSPACE
                }
            }
        }
    )
    print(f"  Set style status: {resp.status_code}")

if __name__ == "__main__":
    print("=" * 50)
    print("GeoServer Publishing Script")
    print("=" * 50)
    create_workspace()
    if upload_data():
        publish_layer()
        upload_style()
        set_default_style()
    print("\\nDone! Preview at:")
    print(f"  {GEOSERVER_URL}/{WORKSPACE}/wms?service=WMS&version=1.1.0&request=GetMap&layers={WORKSPACE}:{LAYER_NAME}&bbox=-180,-90,180,90&width=800&height=600&srs=EPSG:${crs}&format=image/png")
`;
  }, [gsConfig, crs]);

  const jsScript = useMemo(() => {
    const { url, workspace, storeName, layerName, username, password } = gsConfig;
    return `// GeoServer REST API - JavaScript (fetch)
const GEOSERVER_URL = "${url}";
const AUTH = btoa("${username}:${password}");
const HEADERS = {
  "Authorization": \`Basic \${AUTH}\`,
  "Content-Type": "application/json"
};

async function publishToGeoServer(geojsonData, sldData) {
  // Step 1: Create workspace
  console.log("Creating workspace...");
  await fetch(\`\${GEOSERVER_URL}/rest/workspaces\`, {
    method: "POST", headers: HEADERS,
    body: JSON.stringify({ workspace: { name: "${workspace}" } })
  });

  // Step 2: Upload GeoJSON data
  console.log("Uploading data...");
  await fetch(\`\${GEOSERVER_URL}/rest/workspaces/${workspace}/datastores/${storeName}/file.geojson\`, {
    method: "PUT",
    headers: { ...HEADERS, "Content-Type": "application/json" },
    body: geojsonData
  });

  // Step 3: Publish layer
  console.log("Publishing layer...");
  await fetch(\`\${GEOSERVER_URL}/rest/workspaces/${workspace}/datastores/${storeName}/featuretypes\`, {
    method: "POST", headers: HEADERS,
    body: JSON.stringify({
      featureType: {
        name: "${layerName}", nativeName: "${layerName}",
        title: "${layerName}", srs: "EPSG:${crs}", enabled: true
      }
    })
  });

  // Step 4: Upload style
  if (sldData) {
    console.log("Uploading style...");
    await fetch(\`\${GEOSERVER_URL}/rest/workspaces/${workspace}/styles?name=${layerName}_style\`, {
      method: "POST",
      headers: { "Authorization": \`Basic \${AUTH}\`, "Content-Type": "application/vnd.ogc.sld+xml" },
      body: sldData
    });

    // Step 5: Set default style
    console.log("Setting default style...");
    await fetch(\`\${GEOSERVER_URL}/rest/layers/${workspace}:${layerName}\`, {
      method: "PUT", headers: HEADERS,
      body: JSON.stringify({
        layer: { defaultStyle: { name: "${layerName}_style", workspace: "${workspace}" } }
      })
    });
  }

  console.log("Done!");
}
`;
  }, [gsConfig, crs]);

  const shellScript = useMemo(() => {
    return `#!/bin/bash
# GeoServer Publishing Script - Auto-generated
set -e

echo "=== GeoServer Publishing Script ==="

# Step 1: Create workspace
echo "Step 1: Creating workspace..."
${curlCommands.createWorkspace}

# Step 2: Upload data
echo "Step 2: Uploading data..."
${curlCommands.uploadData}

# Step 3: Publish layer
echo "Step 3: Publishing layer..."
${curlCommands.publishLayer}

# Step 4: Upload style
echo "Step 4: Uploading style..."
${curlCommands.uploadStyle}

# Step 5: Set default style
echo "Step 5: Setting default style..."
${curlCommands.setDefaultStyle}

echo "=== Done ==="
echo "Preview: ${gsConfig.url}/${gsConfig.workspace}/wms?service=WMS&version=1.1.0&request=GetMap&layers=${gsConfig.workspace}:${gsConfig.layerName}&bbox=-180,-90,180,90&width=800&height=600&srs=EPSG:${crs}&format=image/png"
`;
  }, [curlCommands, gsConfig, crs]);

  const renderSectionHeader = (title: string, icon: React.ReactNode, isOpen: boolean, toggle: () => void) => (
    <Box
      onClick={toggle}
      sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        p: 1.5, cursor: 'pointer', '&:hover': { bgcolor: '#1a1a1a' },
      }}
    >
      <Typography variant="subtitle1" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
        {icon} {title}
      </Typography>
      {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
    </Box>
  );

  return (
    <Box sx={{ bgcolor: '#0a0a0a', minHeight: '100vh', color: 'grey.300', p: 3, pt: 7 }}>
      <Link to="/" style={{ position: 'fixed', top: 12, left: 12, zIndex: 50, display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', backgroundColor: 'rgba(30,30,30,0.9)', color: '#ccc', borderRadius: 8, textDecoration: 'none', fontSize: 14, border: '1px solid #333' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
        Home
      </Link>

      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Layers size={32} /> Shapefile & Style Builder
      </Typography>
      <Typography variant="body2" sx={{ color: '#888', mb: 1 }}>
        Transform JSON/CSV data into GeoJSON + SLD styles for GeoServer publishing
      </Typography>

      {/* Workflow Stepper */}
      <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 2 }}>
        <Stepper
          activeStep={!parsedData ? 0 : showStyle ? 2 : 1}
          alternativeLabel
          sx={{
            '& .MuiStepLabel-label': { color: '#888', fontSize: 12 },
            '& .MuiStepLabel-label.Mui-active': { color: '#90caf9' },
            '& .MuiStepLabel-label.Mui-completed': { color: '#4caf50' },
            '& .MuiStepIcon-root': { color: '#333' },
            '& .MuiStepIcon-root.Mui-active': { color: '#1565c0' },
            '& .MuiStepIcon-root.Mui-completed': { color: '#2e7d32' },
          }}
        >
          <Step completed={!!parsedData}><StepLabel>Input Data</StepLabel></Step>
          <Step completed={!!parsedData}><StepLabel>Configure Geometry</StepLabel></Step>
          <Step><StepLabel>Style & SLD</StepLabel></Step>
          <Step><StepLabel>GeoServer Publish</StepLabel></Step>
          <Step><StepLabel>Export</StepLabel></Step>
        </Stepper>
      </Paper>

      {/* Step 1: Data Input */}
      <Paper sx={{ bgcolor: '#111', border: '1px solid #222', mb: 2 }}>
        <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #222' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Database size={18} /> Step 1: Input Data
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <input ref={fileInputRef} type="file" accept=".json,.geojson,.csv,.tsv" style={{ display: 'none' }} onChange={handleFileUpload} />
            <Button size="small" variant="outlined" startIcon={<Upload size={14} />} onClick={() => fileInputRef.current?.click()} sx={{ textTransform: 'none', borderColor: '#333', color: '#ccc' }}>
              Upload File
            </Button>
            <Button size="small" variant="contained" startIcon={<Play size={14} />} onClick={handleParse} sx={{ textTransform: 'none', bgcolor: '#1565c0' }}>
              Parse Data
            </Button>
          </Box>
        </Box>

        <Tabs
          value={inputTab}
          onChange={(_, v) => setInputTab(v)}
          sx={{ borderBottom: '1px solid #222', px: 2, '& .MuiTab-root': { color: '#888', textTransform: 'none' }, '& .Mui-selected': { color: '#90caf9' }, '& .MuiTabs-indicator': { bgcolor: '#2196f3' } }}
        >
          <Tab label="JSON / GeoJSON" icon={<FileJson size={14} />} iconPosition="start" />
          <Tab label="CSV" icon={<TableIcon size={14} />} iconPosition="start" />
        </Tabs>

        <Box sx={{ p: 2 }}>
          {inputTab === 0 && (
            <TextField
              fullWidth
              multiline
              rows={10}
              placeholder={'Paste JSON or GeoJSON data here...\n\nSupported formats:\n- GeoJSON FeatureCollection\n- Array of objects\n- { "type": "FeatureCollection", "features": [...] }'}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              sx={{ ...inputSx, '& .MuiInputBase-root': { fontFamily: 'monospace', fontSize: 12 } }}
            />
          )}
          {inputTab === 1 && (
            <>
              <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel sx={{ color: '#888' }}>Delimiter</InputLabel>
                  <Select value={csvDelimiter} label="Delimiter" onChange={(e) => setCsvDelimiter(e.target.value)} sx={selectSx}>
                    <MenuItem value=",">Comma (,)</MenuItem>
                    <MenuItem value={'\t'}>Tab</MenuItem>
                    <MenuItem value=";">Semicolon (;)</MenuItem>
                    <MenuItem value="|">Pipe (|)</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 100 }}>
                  <InputLabel sx={{ color: '#888' }}>Quote</InputLabel>
                  <Select value={csvQuoteChar} label="Quote" onChange={(e) => setCsvQuoteChar(e.target.value)} sx={selectSx}>
                    <MenuItem value='"'>Double (&quot;)</MenuItem>
                    <MenuItem value="'">Single (&apos;)</MenuItem>
                  </Select>
                </FormControl>
                <FormControlLabel
                  control={<Switch checked={csvHasHeader} onChange={(e) => setCsvHasHeader(e.target.checked)} sx={{ '& .MuiSwitch-thumb': { bgcolor: '#90caf9' }, '& .Mui-checked + .MuiSwitch-track': { bgcolor: '#1e3a5f' } }} />}
                  label={<Typography variant="body2" sx={{ color: '#ccc' }}>Has Header Row</Typography>}
                />
              </Box>
              <TextField
                fullWidth
                multiline
                rows={10}
                placeholder="Paste CSV data here (with header row)..."
                value={csvInput}
                onChange={(e) => setCsvInput(e.target.value)}
                sx={{ ...inputSx, '& .MuiInputBase-root': { fontFamily: 'monospace', fontSize: 12 } }}
              />
            </>
          )}
        </Box>

        {parseError && (
          <Alert severity="error" sx={{ mx: 2, mb: 2, bgcolor: '#2a0a0a', color: '#f44336' }}>{parseError}</Alert>
        )}
      </Paper>

      {/* Data Preview */}
      {parsedData && (
        <Paper sx={{ bgcolor: '#111', border: '1px solid #222', mb: 2, overflow: 'hidden' }}>
          {renderSectionHeader('Data Preview', <Eye size={18} />, showPreview, () => setShowPreview(!showPreview))}
          <Collapse in={showPreview}>
            <Box sx={{ p: 2, borderTop: '1px solid #222' }}>
              <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                <Chip label={`${parsedData.rowCount} rows`} size="small" sx={{ bgcolor: '#1e3a5f', color: '#90caf9', border: '1px solid #2196f3' }} />
                <Chip label={`${parsedData.columns.length} columns`} size="small" sx={{ bgcolor: '#1e3a5f', color: '#90caf9', border: '1px solid #2196f3' }} />
                {isGeoJSON && <Chip label="GeoJSON detected" size="small" sx={{ bgcolor: '#1b5e20', color: '#4caf50', border: '1px solid #4caf50' }} />}
              </Box>

              {/* Column info */}
              <Typography variant="caption" sx={{ color: '#888', mb: 1, display: 'block' }}>Columns:</Typography>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
                {parsedData.columns.map((col) => (
                  <Chip
                    key={col.name}
                    label={col.name}
                    size="small"
                    icon={col.type === 'number' ? <Hash size={12} /> : col.type === 'date' ? <Calendar size={12} /> : <Type size={12} />}
                    sx={{
                      bgcolor: col.type === 'number' ? '#0a1a2a' : col.type === 'date' ? '#1a1a0a' : '#1a1a1a',
                      color: col.type === 'number' ? '#64b5f6' : col.type === 'date' ? '#ffb74d' : '#aaa',
                      border: '1px solid #333',
                      '& .MuiChip-icon': { color: 'inherit' },
                    }}
                  />
                ))}
              </Box>

              {/* Data table */}
              <TableContainer sx={{ maxHeight: 300, overflowX: 'auto' }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ bgcolor: '#1a1a1a', color: '#888', borderColor: '#222', fontSize: 11, fontWeight: 700 }}>#</TableCell>
                      {parsedData.columns.slice(0, 12).map((col) => (
                        <TableCell key={col.name} sx={{ bgcolor: '#1a1a1a', color: '#888', borderColor: '#222', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
                          {col.name}
                        </TableCell>
                      ))}
                      {parsedData.columns.length > 12 && (
                        <TableCell sx={{ bgcolor: '#1a1a1a', color: '#666', borderColor: '#222', fontSize: 11 }}>+{parsedData.columns.length - 12} more</TableCell>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {parsedData.rows.slice(0, 20).map((row, i) => (
                      <TableRow key={i}>
                        <TableCell sx={{ color: '#666', borderColor: '#222', fontSize: 11 }}>{i + 1}</TableCell>
                        {parsedData!.columns.slice(0, 12).map((col) => (
                          <TableCell key={col.name} sx={{ color: '#ccc', borderColor: '#222', fontSize: 11, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {String(row[col.name] ?? '')}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {parsedData.rowCount > 20 && (
                <Typography variant="caption" sx={{ color: '#666', mt: 1, display: 'block' }}>Showing first 20 of {parsedData.rowCount} rows</Typography>
              )}
            </Box>
          </Collapse>
        </Paper>
      )}

      {/* Step 2: Geometry Configuration */}
      {parsedData && !isGeoJSON && (
        <Paper sx={{ bgcolor: '#111', border: '1px solid #222', mb: 2, overflow: 'hidden' }}>
          {renderSectionHeader('Step 2: Geometry Configuration', <MapPin size={18} />, showGeomConfig, () => setShowGeomConfig(!showGeomConfig))}
          <Collapse in={showGeomConfig}>
            <Box sx={{ p: 2, borderTop: '1px solid #222' }}>
              <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel sx={{ color: '#888' }}>Geometry Type</InputLabel>
                  <Select
                    value={geomType}
                    label="Geometry Type"
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setGeomType(val);
                      setStyleConfig((prev) => ({ ...prev, geometryType: val }));
                    }}
                    sx={selectSx}
                  >
                    <MenuItem value="Point">Point</MenuItem>
                    <MenuItem value="LineString">LineString</MenuItem>
                    <MenuItem value="Polygon">Polygon</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel sx={{ color: '#888' }}>CRS / SRID</InputLabel>
                  <Select value={crs} label="CRS / SRID" onChange={(e) => setCrs(e.target.value)} sx={selectSx}>
                    <MenuItem value="4326">EPSG:4326 (WGS 84)</MenuItem>
                    <MenuItem value="3857">EPSG:3857 (Web Mercator)</MenuItem>
                    <MenuItem value="4269">EPSG:4269 (NAD83)</MenuItem>
                    <MenuItem value="32632">EPSG:32632 (UTM 32N)</MenuItem>
                    <MenuItem value="32617">EPSG:32617 (UTM 17N)</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {geomType === 'Point' && (
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <FormControl size="small" sx={{ minWidth: 180 }}>
                    <InputLabel sx={{ color: '#888' }}>Latitude Column</InputLabel>
                    <Select value={latColumn} label="Latitude Column" onChange={(e) => setLatColumn(e.target.value)} sx={selectSx}>
                      <MenuItem value="">-- Select --</MenuItem>
                      {parsedData.columns.map((col) => (
                        <MenuItem key={col.name} value={col.name}>{col.name} ({col.type})</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ minWidth: 180 }}>
                    <InputLabel sx={{ color: '#888' }}>Longitude Column</InputLabel>
                    <Select value={lngColumn} label="Longitude Column" onChange={(e) => setLngColumn(e.target.value)} sx={selectSx}>
                      <MenuItem value="">-- Select --</MenuItem>
                      {parsedData.columns.map((col) => (
                        <MenuItem key={col.name} value={col.name}>{col.name} ({col.type})</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              )}

              {geomType !== 'Point' && (
                <FormControl size="small" sx={{ minWidth: 180 }}>
                  <InputLabel sx={{ color: '#888' }}>WKT Column</InputLabel>
                  <Select value={wktColumn} label="WKT Column" onChange={(e) => setWktColumn(e.target.value)} sx={selectSx}>
                    <MenuItem value="">-- Select --</MenuItem>
                    {parsedData.columns.map((col) => (
                      <MenuItem key={col.name} value={col.name}>{col.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Box>
          </Collapse>
        </Paper>
      )}

      {/* GeoJSON Output */}
      {parsedData && (
        <Paper sx={{ bgcolor: '#111', border: '1px solid #222', mb: 2, overflow: 'hidden' }}>
          {renderSectionHeader('GeoJSON Output', <FileJson size={18} />, showGeoJSON, () => setShowGeoJSON(!showGeoJSON))}
          <Collapse in={showGeoJSON}>
            <Box sx={{ p: 2, borderTop: '1px solid #222' }}>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip label={`${parsedData.rowCount} features`} size="small" sx={{ bgcolor: '#1e3a5f', color: '#90caf9' }} />
                <Button size="small" variant="outlined" startIcon={<Copy size={12} />} onClick={() => copyToClipboard(geojsonOutput, 'GeoJSON')} sx={{ textTransform: 'none', borderColor: '#333', color: '#ccc' }}>
                  Copy
                </Button>
                <Button size="small" variant="outlined" startIcon={<Download size={12} />} onClick={() => downloadFile(geojsonOutput, `${gsConfig.layerName}.geojson`, 'application/json')} sx={{ textTransform: 'none', borderColor: '#333', color: '#ccc' }}>
                  Download .geojson
                </Button>
              </Box>
              <Box sx={{ bgcolor: '#0d0d0d', border: '1px solid #222', p: 1.5, borderRadius: 1, fontFamily: 'monospace', fontSize: 11, color: '#aaa', maxHeight: 300, overflowY: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {geojsonOutput.length > 10000 ? geojsonOutput.substring(0, 10000) + '\n\n... (truncated, download for full file)' : geojsonOutput}
              </Box>
            </Box>
          </Collapse>
        </Paper>
      )}

      {/* Step 3: Style Builder */}
      {parsedData && (
        <Paper sx={{ bgcolor: '#111', border: '1px solid #222', mb: 2, overflow: 'hidden' }}>
          {renderSectionHeader('Step 3: Style Builder', <Palette size={18} />, showStyle, () => setShowStyle(!showStyle))}
          <Collapse in={showStyle}>
            <Box sx={{ p: 2, borderTop: '1px solid #222' }}>
              {/* Style Type */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                {(['simple', 'categorized', 'graduated'] as const).map((st) => (
                  <Chip
                    key={st}
                    label={st.charAt(0).toUpperCase() + st.slice(1)}
                    onClick={() => setStyleConfig((prev) => ({ ...prev, styleType: st }))}
                    sx={{
                      bgcolor: styleConfig.styleType === st ? '#1e3a5f' : '#1a1a1a',
                      color: styleConfig.styleType === st ? '#90caf9' : '#999',
                      border: styleConfig.styleType === st ? '1px solid #2196f3' : '1px solid #333',
                      cursor: 'pointer',
                    }}
                  />
                ))}
              </Box>

              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                {/* Left: Style controls */}
                <Box sx={{ flex: '1 1 320px' }}>
                  {/* Geometry Type for style */}
                  <FormControl size="small" fullWidth sx={{ mb: 2 }}>
                    <InputLabel sx={{ color: '#888' }}>Geometry Type</InputLabel>
                    <Select
                      value={styleConfig.geometryType}
                      label="Geometry Type"
                      onChange={(e) => setStyleConfig((prev) => ({ ...prev, geometryType: e.target.value as any }))}
                      sx={selectSx}
                    >
                      <MenuItem value="Point">Point</MenuItem>
                      <MenuItem value="LineString">LineString</MenuItem>
                      <MenuItem value="Polygon">Polygon</MenuItem>
                    </Select>
                  </FormControl>

                  {/* Simple style controls */}
                  <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#888', display: 'block', mb: 0.5 }}>Fill Color</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <input type="color" value={styleConfig.fillColor} onChange={(e) => setStyleConfig((prev) => ({ ...prev, fillColor: e.target.value }))} style={{ width: 36, height: 30, border: '1px solid #333', borderRadius: 4, cursor: 'pointer', backgroundColor: '#1a1a1a' }} />
                        <TextField size="small" value={styleConfig.fillColor} onChange={(e) => setStyleConfig((prev) => ({ ...prev, fillColor: e.target.value }))} sx={{ width: 100, ...inputSx }} />
                      </Box>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#888', display: 'block', mb: 0.5 }}>Stroke Color</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <input type="color" value={styleConfig.strokeColor} onChange={(e) => setStyleConfig((prev) => ({ ...prev, strokeColor: e.target.value }))} style={{ width: 36, height: 30, border: '1px solid #333', borderRadius: 4, cursor: 'pointer', backgroundColor: '#1a1a1a' }} />
                        <TextField size="small" value={styleConfig.strokeColor} onChange={(e) => setStyleConfig((prev) => ({ ...prev, strokeColor: e.target.value }))} sx={{ width: 100, ...inputSx }} />
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                    <Box sx={{ flex: 1, minWidth: 120 }}>
                      <Typography variant="caption" sx={{ color: '#888' }}>Stroke Width: {styleConfig.strokeWidth}</Typography>
                      <Slider value={styleConfig.strokeWidth} onChange={(_, v) => setStyleConfig((prev) => ({ ...prev, strokeWidth: v as number }))} min={0} max={10} step={0.5} sx={{ color: '#90caf9' }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 120 }}>
                      <Typography variant="caption" sx={{ color: '#888' }}>Opacity: {styleConfig.opacity}</Typography>
                      <Slider value={styleConfig.opacity} onChange={(_, v) => setStyleConfig((prev) => ({ ...prev, opacity: v as number }))} min={0} max={1} step={0.05} sx={{ color: '#90caf9' }} />
                    </Box>
                    {styleConfig.geometryType === 'Point' && (
                      <Box sx={{ flex: 1, minWidth: 120 }}>
                        <Typography variant="caption" sx={{ color: '#888' }}>Point Size: {styleConfig.pointSize}</Typography>
                        <Slider value={styleConfig.pointSize} onChange={(_, v) => setStyleConfig((prev) => ({ ...prev, pointSize: v as number }))} min={2} max={30} step={1} sx={{ color: '#90caf9' }} />
                      </Box>
                    )}
                  </Box>

                  {/* Categorized options */}
                  {styleConfig.styleType === 'categorized' && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ color: '#90caf9', mb: 1 }}>Categorized Style</Typography>
                      <Box sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'flex-end' }}>
                        <FormControl size="small" sx={{ flex: 1 }}>
                          <InputLabel sx={{ color: '#888' }}>Column</InputLabel>
                          <Select
                            value={styleConfig.categorizedColumn}
                            label="Column"
                            onChange={(e) => setStyleConfig((prev) => ({ ...prev, categorizedColumn: e.target.value }))}
                            sx={selectSx}
                          >
                            {parsedData.columns.map((col) => (
                              <MenuItem key={col.name} value={col.name}>{col.name} ({col.uniqueValues.length} unique)</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <Button size="small" variant="outlined" onClick={updateCategorizedColors} sx={{ textTransform: 'none', borderColor: '#333', color: '#ccc' }}>
                          Generate Colors
                        </Button>
                      </Box>
                      {Object.keys(styleConfig.categorizedColors).length > 0 && (
                        <Box sx={{ maxHeight: 200, overflowY: 'auto', mt: 1 }}>
                          {Object.entries(styleConfig.categorizedColors).map(([value, color]) => (
                            <Box key={value} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <input
                                type="color"
                                value={color}
                                onChange={(e) => setStyleConfig((prev) => ({
                                  ...prev,
                                  categorizedColors: { ...prev.categorizedColors, [value]: e.target.value },
                                }))}
                                style={{ width: 28, height: 22, border: '1px solid #333', borderRadius: 3, cursor: 'pointer' }}
                              />
                              <Typography variant="caption" sx={{ color: '#ccc', fontFamily: 'monospace', fontSize: 11 }}>{value}</Typography>
                              <Typography variant="caption" sx={{ color: '#666', fontFamily: 'monospace', fontSize: 10 }}>{color}</Typography>
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>
                  )}

                  {/* Graduated options */}
                  {styleConfig.styleType === 'graduated' && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ color: '#90caf9', mb: 1 }}>Graduated Style</Typography>
                      <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
                        <InputLabel sx={{ color: '#888' }}>Numeric Column</InputLabel>
                        <Select
                          value={styleConfig.graduatedColumn}
                          label="Numeric Column"
                          onChange={(e) => setStyleConfig((prev) => ({ ...prev, graduatedColumn: e.target.value }))}
                          sx={selectSx}
                        >
                          {parsedData.columns.filter((c) => c.type === 'number').map((col) => (
                            <MenuItem key={col.name} value={col.name}>{col.name}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <Box sx={{ display: 'flex', gap: 2, mb: 1.5 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" sx={{ color: '#888' }}>Classes: {styleConfig.graduatedClasses}</Typography>
                          <Slider value={styleConfig.graduatedClasses} onChange={(_, v) => setStyleConfig((prev) => ({ ...prev, graduatedClasses: v as number }))} min={3} max={10} step={1} sx={{ color: '#90caf9' }} />
                        </Box>
                        <FormControl size="small" sx={{ minWidth: 140 }}>
                          <InputLabel sx={{ color: '#888' }}>Method</InputLabel>
                          <Select value={styleConfig.graduatedMethod} label="Method" onChange={(e) => setStyleConfig((prev) => ({ ...prev, graduatedMethod: e.target.value as any }))} sx={selectSx}>
                            <MenuItem value="equal">Equal Interval</MenuItem>
                            <MenuItem value="quantile">Quantile</MenuItem>
                            <MenuItem value="natural">Natural Breaks</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                      <Typography variant="caption" sx={{ color: '#888', display: 'block', mb: 0.5 }}>Color Ramp</Typography>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1 }}>
                        <Box>
                          <Typography variant="caption" sx={{ color: '#666', fontSize: 10 }}>Start</Typography>
                          <input type="color" value={styleConfig.colorRampStart} onChange={(e) => setStyleConfig((prev) => ({ ...prev, colorRampStart: e.target.value }))} style={{ width: 50, height: 28, border: '1px solid #333', borderRadius: 4, cursor: 'pointer', display: 'block' }} />
                        </Box>
                        <Box sx={{ flex: 1, height: 20, borderRadius: 2, background: `linear-gradient(to right, ${styleConfig.colorRampStart}, ${styleConfig.colorRampEnd})`, border: '1px solid #333' }} />
                        <Box>
                          <Typography variant="caption" sx={{ color: '#666', fontSize: 10 }}>End</Typography>
                          <input type="color" value={styleConfig.colorRampEnd} onChange={(e) => setStyleConfig((prev) => ({ ...prev, colorRampEnd: e.target.value }))} style={{ width: 50, height: 28, border: '1px solid #333', borderRadius: 4, cursor: 'pointer', display: 'block' }} />
                        </Box>
                      </Box>
                      {/* Preset color ramps */}
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {[
                          { name: 'YlGn', start: '#ffffcc', end: '#006837' },
                          { name: 'OrRd', start: '#fee8c8', end: '#b30000' },
                          { name: 'BuPu', start: '#edf8fb', end: '#810f7c' },
                          { name: 'RdYlGn', start: '#d73027', end: '#1a9850' },
                          { name: 'Viridis', start: '#440154', end: '#fde725' },
                          { name: 'Plasma', start: '#0d0887', end: '#f0f921' },
                          { name: 'Blues', start: '#f7fbff', end: '#08306b' },
                          { name: 'Reds', start: '#fff5f0', end: '#67000d' },
                        ].map((ramp) => (
                          <Tooltip key={ramp.name} title={ramp.name}>
                            <Box
                              onClick={() => setStyleConfig((prev) => ({ ...prev, colorRampStart: ramp.start, colorRampEnd: ramp.end }))}
                              sx={{
                                width: 50, height: 16, borderRadius: 1, cursor: 'pointer',
                                background: `linear-gradient(to right, ${ramp.start}, ${ramp.end})`,
                                border: '1px solid #333', '&:hover': { borderColor: '#666' },
                              }}
                            />
                          </Tooltip>
                        ))}
                      </Box>
                    </Box>
                  )}

                  {/* Label settings */}
                  <Divider sx={{ borderColor: '#222', my: 2 }} />
                  <Typography variant="subtitle2" sx={{ color: '#e0e0e0', mb: 1 }}>Labels</Typography>
                  <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
                    <InputLabel sx={{ color: '#888' }}>Label Column</InputLabel>
                    <Select value={styleConfig.labelColumn} label="Label Column" onChange={(e) => setStyleConfig((prev) => ({ ...prev, labelColumn: e.target.value }))} sx={selectSx}>
                      <MenuItem value="">None</MenuItem>
                      {parsedData.columns.map((col) => (
                        <MenuItem key={col.name} value={col.name}>{col.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {styleConfig.labelColumn && (
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Box sx={{ minWidth: 100 }}>
                        <Typography variant="caption" sx={{ color: '#888' }}>Font Size: {styleConfig.labelFontSize}</Typography>
                        <Slider value={styleConfig.labelFontSize} onChange={(_, v) => setStyleConfig((prev) => ({ ...prev, labelFontSize: v as number }))} min={6} max={24} step={1} sx={{ color: '#90caf9' }} />
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: '#888', display: 'block', mb: 0.5 }}>Font Color</Typography>
                        <input type="color" value={styleConfig.labelColor} onChange={(e) => setStyleConfig((prev) => ({ ...prev, labelColor: e.target.value }))} style={{ width: 36, height: 24, border: '1px solid #333', borderRadius: 3, cursor: 'pointer' }} />
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: '#888', display: 'block', mb: 0.5 }}>Halo Color</Typography>
                        <input type="color" value={styleConfig.labelHaloColor} onChange={(e) => setStyleConfig((prev) => ({ ...prev, labelHaloColor: e.target.value }))} style={{ width: 36, height: 24, border: '1px solid #333', borderRadius: 3, cursor: 'pointer' }} />
                      </Box>
                    </Box>
                  )}
                </Box>

                {/* Right: Preview */}
                <Box sx={{ flex: '1 1 240px' }}>
                  <Typography variant="caption" sx={{ color: '#888', mb: 1, display: 'block' }}>Style Preview</Typography>
                  <Paper sx={{ bgcolor: '#f5f5f5', border: '1px solid #333', p: 3, borderRadius: 1, minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 1 }}>
                    {styleConfig.geometryType === 'Point' && (
                      <svg width="80" height="80">
                        <circle cx="40" cy="40" r={styleConfig.pointSize} fill={styleConfig.fillColor} stroke={styleConfig.strokeColor} strokeWidth={styleConfig.strokeWidth} opacity={styleConfig.opacity} />
                      </svg>
                    )}
                    {styleConfig.geometryType === 'LineString' && (
                      <svg width="100" height="60">
                        <polyline points="10,50 30,10 60,40 90,15" fill="none" stroke={styleConfig.strokeColor} strokeWidth={styleConfig.strokeWidth} opacity={styleConfig.opacity} />
                      </svg>
                    )}
                    {styleConfig.geometryType === 'Polygon' && (
                      <svg width="100" height="80">
                        <polygon points="10,70 30,10 70,10 90,50 60,70" fill={styleConfig.fillColor} stroke={styleConfig.strokeColor} strokeWidth={styleConfig.strokeWidth} opacity={styleConfig.opacity} />
                      </svg>
                    )}
                  </Paper>

                  {/* Color ramp preview for graduated */}
                  {styleConfig.styleType === 'graduated' && styleConfig.graduatedColumn && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" sx={{ color: '#888', mb: 0.5, display: 'block' }}>Graduated Legend</Typography>
                      {interpolateColors(styleConfig.colorRampStart, styleConfig.colorRampEnd, styleConfig.graduatedClasses).map((color, i) => (
                        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Box sx={{ width: 20, height: 14, bgcolor: color, borderRadius: 1, border: '1px solid #444' }} />
                          <Typography variant="caption" sx={{ color: '#aaa', fontFamily: 'monospace', fontSize: 10 }}>Class {i + 1}</Typography>
                        </Box>
                      ))}
                    </Box>
                  )}

                  {/* Categorized legend */}
                  {styleConfig.styleType === 'categorized' && Object.keys(styleConfig.categorizedColors).length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" sx={{ color: '#888', mb: 0.5, display: 'block' }}>Categorized Legend</Typography>
                      {Object.entries(styleConfig.categorizedColors).slice(0, 15).map(([value, color]) => (
                        <Box key={value} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.3 }}>
                          <Box sx={{ width: 14, height: 14, bgcolor: color, borderRadius: styleConfig.geometryType === 'Point' ? '50%' : 1, border: '1px solid #444' }} />
                          <Typography variant="caption" sx={{ color: '#aaa', fontSize: 10 }}>{value}</Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          </Collapse>
        </Paper>
      )}

      {/* SLD Output */}
      {parsedData && (
        <Paper sx={{ bgcolor: '#111', border: '1px solid #222', mb: 2, overflow: 'hidden' }}>
          {renderSectionHeader('Generated SLD', <FileCode size={18} />, showSLD, () => setShowSLD(!showSLD))}
          <Collapse in={showSLD}>
            <Box sx={{ p: 2, borderTop: '1px solid #222' }}>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Button size="small" variant="outlined" startIcon={<Copy size={12} />} onClick={() => copyToClipboard(sldOutput, 'SLD')} sx={{ textTransform: 'none', borderColor: '#333', color: '#ccc' }}>
                  Copy SLD
                </Button>
                <Button size="small" variant="outlined" startIcon={<Download size={12} />} onClick={() => downloadFile(sldOutput, `${gsConfig.layerName}_style.sld`, 'application/xml')} sx={{ textTransform: 'none', borderColor: '#333', color: '#ccc' }}>
                  Download .sld
                </Button>
              </Box>
              <Box sx={{ bgcolor: '#0d0d0d', border: '1px solid #222', p: 1.5, borderRadius: 1, fontFamily: 'monospace', fontSize: 11, color: '#aaa', maxHeight: 400, overflowY: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {sldOutput}
              </Box>
            </Box>
          </Collapse>
        </Paper>
      )}

      {/* Step 4: GeoServer Publishing */}
      {parsedData && (
        <Paper sx={{ bgcolor: '#111', border: '1px solid #222', mb: 2, overflow: 'hidden' }}>
          {renderSectionHeader('Step 4: GeoServer Publishing Workflow', <Server size={18} />, showGeoServer, () => setShowGeoServer(!showGeoServer))}
          <Collapse in={showGeoServer}>
            <Box sx={{ p: 2, borderTop: '1px solid #222' }}>
              {/* Config */}
              <Typography variant="subtitle2" sx={{ color: '#90caf9', mb: 1.5 }}>GeoServer Configuration</Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                <TextField size="small" label="GeoServer URL" value={gsConfig.url} onChange={(e) => setGsConfig((prev) => ({ ...prev, url: e.target.value }))} sx={{ flex: '1 1 250px', ...inputSx }} InputLabelProps={{ sx: { color: '#888' } }} />
                <TextField size="small" label="Workspace" value={gsConfig.workspace} onChange={(e) => setGsConfig((prev) => ({ ...prev, workspace: e.target.value }))} sx={{ flex: '1 1 150px', ...inputSx }} InputLabelProps={{ sx: { color: '#888' } }} />
              </Box>
              <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                <TextField size="small" label="Store Name" value={gsConfig.storeName} onChange={(e) => setGsConfig((prev) => ({ ...prev, storeName: e.target.value }))} sx={{ flex: 1, ...inputSx }} InputLabelProps={{ sx: { color: '#888' } }} />
                <TextField size="small" label="Layer Name" value={gsConfig.layerName} onChange={(e) => setGsConfig((prev) => ({ ...prev, layerName: e.target.value }))} sx={{ flex: 1, ...inputSx }} InputLabelProps={{ sx: { color: '#888' } }} />
              </Box>
              <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <TextField size="small" label="Username" value={gsConfig.username} onChange={(e) => setGsConfig((prev) => ({ ...prev, username: e.target.value }))} sx={{ flex: 1, ...inputSx }} InputLabelProps={{ sx: { color: '#888' } }} />
                <TextField size="small" label="Password" type="password" value={gsConfig.password} onChange={(e) => setGsConfig((prev) => ({ ...prev, password: e.target.value }))} sx={{ flex: 1, ...inputSx }} InputLabelProps={{ sx: { color: '#888' } }} />
              </Box>

              <Divider sx={{ borderColor: '#222', my: 2 }} />

              {/* cURL Commands */}
              <Typography variant="subtitle2" sx={{ color: '#90caf9', mb: 1.5 }}>cURL Commands</Typography>
              {[
                { step: 1, title: 'Create Workspace', cmd: curlCommands.createWorkspace },
                { step: 2, title: 'Upload Data', cmd: curlCommands.uploadData },
                { step: 3, title: 'Publish Layer', cmd: curlCommands.publishLayer },
                { step: 4, title: 'Upload Style (SLD)', cmd: curlCommands.uploadStyle },
                { step: 5, title: 'Set Default Style', cmd: curlCommands.setDefaultStyle },
              ].map((item) => (
                <Box key={item.step} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ color: '#e0e0e0', fontWeight: 600 }}>
                      <Chip label={`${item.step}`} size="small" sx={{ bgcolor: '#1e3a5f', color: '#90caf9', mr: 1, width: 24, height: 24 }} />
                      {item.title}
                    </Typography>
                    <IconButton size="small" onClick={() => copyToClipboard(item.cmd, item.title)} sx={{ color: '#888' }}>
                      <Copy size={14} />
                    </IconButton>
                  </Box>
                  <Box sx={{ bgcolor: '#0d0d0d', border: '1px solid #222', p: 1.5, borderRadius: 1, fontFamily: 'monospace', fontSize: 11, color: '#aaa', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                    {item.cmd}
                  </Box>
                </Box>
              ))}

              <Divider sx={{ borderColor: '#222', my: 2 }} />

              {/* Python Script */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="subtitle2" sx={{ color: '#90caf9' }}>Python Script</Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button size="small" variant="outlined" startIcon={<Copy size={12} />} onClick={() => copyToClipboard(pythonScript, 'Python script')} sx={{ textTransform: 'none', borderColor: '#333', color: '#ccc', fontSize: 11 }}>
                      Copy
                    </Button>
                    <Button size="small" variant="outlined" startIcon={<Download size={12} />} onClick={() => downloadFile(pythonScript, 'publish_geoserver.py', 'text/x-python')} sx={{ textTransform: 'none', borderColor: '#333', color: '#ccc', fontSize: 11 }}>
                      Download .py
                    </Button>
                  </Box>
                </Box>
                <Box sx={{ bgcolor: '#0d0d0d', border: '1px solid #222', p: 1.5, borderRadius: 1, fontFamily: 'monospace', fontSize: 11, color: '#aaa', maxHeight: 300, overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
                  {pythonScript}
                </Box>
              </Box>

              {/* JavaScript Script */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="subtitle2" sx={{ color: '#90caf9' }}>JavaScript (fetch) Script</Typography>
                  <Button size="small" variant="outlined" startIcon={<Copy size={12} />} onClick={() => copyToClipboard(jsScript, 'JS script')} sx={{ textTransform: 'none', borderColor: '#333', color: '#ccc', fontSize: 11 }}>
                    Copy
                  </Button>
                </Box>
                <Box sx={{ bgcolor: '#0d0d0d', border: '1px solid #222', p: 1.5, borderRadius: 1, fontFamily: 'monospace', fontSize: 11, color: '#aaa', maxHeight: 300, overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
                  {jsScript}
                </Box>
              </Box>
            </Box>
          </Collapse>
        </Paper>
      )}

      {/* Step 5: Export */}
      {parsedData && (
        <Paper sx={{ bgcolor: '#111', border: '1px solid #222', mb: 2, overflow: 'hidden' }}>
          {renderSectionHeader('Step 5: Export Options', <Download size={18} />, showExport, () => setShowExport(!showExport))}
          <Collapse in={showExport}>
            <Box sx={{ p: 2, borderTop: '1px solid #222' }}>
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  startIcon={<Download size={16} />}
                  onClick={() => downloadFile(geojsonOutput, `${gsConfig.layerName}.geojson`, 'application/json')}
                  sx={{ textTransform: 'none', borderColor: '#333', color: '#ccc', py: 1.2 }}
                >
                  Download GeoJSON
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Download size={16} />}
                  onClick={() => downloadFile(sldOutput, `${gsConfig.layerName}_style.sld`, 'application/xml')}
                  sx={{ textTransform: 'none', borderColor: '#333', color: '#ccc', py: 1.2 }}
                >
                  Download SLD Style
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Download size={16} />}
                  onClick={() => downloadFile(shellScript, `publish_${gsConfig.layerName}.sh`, 'text/x-shellscript')}
                  sx={{ textTransform: 'none', borderColor: '#333', color: '#ccc', py: 1.2 }}
                >
                  Download Shell Script
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Download size={16} />}
                  onClick={() => downloadFile(pythonScript, `publish_${gsConfig.layerName}.py`, 'text/x-python')}
                  sx={{ textTransform: 'none', borderColor: '#333', color: '#ccc', py: 1.2 }}
                >
                  Download Python Script
                </Button>
              </Box>

              <Divider sx={{ borderColor: '#222', my: 2 }} />

              <Button
                variant="contained"
                startIcon={<Copy size={16} />}
                onClick={() => {
                  const allCommands = [
                    '# GeoServer Publishing Commands',
                    '# Step 1: Create Workspace',
                    curlCommands.createWorkspace,
                    '',
                    '# Step 2: Upload Data',
                    curlCommands.uploadData,
                    '',
                    '# Step 3: Publish Layer',
                    curlCommands.publishLayer,
                    '',
                    '# Step 4: Upload Style',
                    curlCommands.uploadStyle,
                    '',
                    '# Step 5: Set Default Style',
                    curlCommands.setDefaultStyle,
                  ].join('\n');
                  copyToClipboard(allCommands, 'All commands');
                }}
                sx={{ textTransform: 'none', bgcolor: '#1565c0' }}
              >
                Copy All Commands
              </Button>
            </Box>
          </Collapse>
        </Paper>
      )}

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
