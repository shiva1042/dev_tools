import { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Snackbar,
  Tabs,
  Tab,
  Checkbox,
  FormControlLabel,
  Divider,
} from '@mui/material';
import {
  Copy,
  Plus,
  Trash2,
  RotateCcw,
  Database,
  Code,
  Bookmark,
  ChevronDown,
  ChevronUp,
  Terminal,
  Globe,
  Filter,
  BarChart3,
  Hash,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface StatisticDef {
  id: string;
  statisticType: string;
  onStatisticField: string;
  outStatisticFieldName: string;
}

interface WhereTemplate {
  label: string;
  template: string;
}

const inputSx = {
  '& .MuiInputBase-root': { bgcolor: '#1a1a1a', color: 'grey.300' },
  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
  '& .MuiInputLabel-root': { color: 'grey.500' },
  '& .MuiInputBase-input': { color: 'grey.300' },
};

const selectSx = {
  bgcolor: '#1a1a1a',
  color: 'grey.300',
  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
  '& .MuiSvgIcon-root': { color: 'grey.500' },
};

const WHERE_TEMPLATES: WhereTemplate[] = [
  { label: '1=1 (All)', template: '1=1' },
  { label: 'field = value', template: "field_name = 'value'" },
  { label: 'field > number', template: 'field_name > 0' },
  { label: 'field < number', template: 'field_name < 100' },
  { label: 'LIKE pattern', template: "field_name LIKE '%pattern%'" },
  { label: 'IN (values)', template: "field_name IN ('val1', 'val2', 'val3')" },
  { label: 'BETWEEN', template: 'field_name BETWEEN 10 AND 100' },
  { label: 'IS NOT NULL', template: 'field_name IS NOT NULL' },
  { label: 'Date query', template: "date_field >= DATE '2024-01-01'" },
  { label: 'AND condition', template: "field1 = 'value' AND field2 > 0" },
  { label: 'OR condition', template: "field1 = 'value' OR field2 = 'value'" },
  { label: 'NOT condition', template: "NOT field_name = 'value'" },
];

const GEOMETRY_TYPES = [
  'esriGeometryPoint',
  'esriGeometryPolyline',
  'esriGeometryPolygon',
  'esriGeometryEnvelope',
  'esriGeometryMultipoint',
];

const SPATIAL_RELS = [
  'esriSpatialRelIntersects',
  'esriSpatialRelContains',
  'esriSpatialRelWithin',
  'esriSpatialRelEnvelopeIntersects',
  'esriSpatialRelCrosses',
  'esriSpatialRelOverlaps',
  'esriSpatialRelTouches',
  'esriSpatialRelRelation',
];

const OUTPUT_FORMATS = ['json', 'geojson', 'html', 'pjson', 'pbf', 'kmz'];

const COMMON_SR = [
  { code: '4326', label: 'WGS 84 (4326)' },
  { code: '3857', label: 'Web Mercator (3857)' },
  { code: '102100', label: 'Web Mercator Aux (102100)' },
  { code: '2193', label: 'NZGD2000 (2193)' },
  { code: '27700', label: 'BNG (27700)' },
  { code: '32610', label: 'UTM 10N (32610)' },
  { code: '32611', label: 'UTM 11N (32611)' },
  { code: '3005', label: 'BC Albers (3005)' },
  { code: '26910', label: 'NAD83 UTM 10N (26910)' },
];

const STATISTIC_TYPES = ['count', 'sum', 'min', 'max', 'avg', 'stddev', 'var'];

const GEOMETRY_TEMPLATES = [
  {
    label: 'Envelope',
    value: JSON.stringify({ xmin: -122.5, ymin: 37.5, xmax: -122.0, ymax: 38.0, spatialReference: { wkid: 4326 } }, null, 2),
  },
  {
    label: 'Point',
    value: JSON.stringify({ x: -122.4, y: 37.8, spatialReference: { wkid: 4326 } }, null, 2),
  },
  {
    label: 'Polygon',
    value: JSON.stringify({ rings: [[[-122.5, 37.5], [-122.0, 37.5], [-122.0, 38.0], [-122.5, 38.0], [-122.5, 37.5]]], spatialReference: { wkid: 4326 } }, null, 2),
  },
  {
    label: 'Polyline',
    value: JSON.stringify({ paths: [[[-122.5, 37.5], [-122.0, 38.0]]], spatialReference: { wkid: 4326 } }, null, 2),
  },
];

type OutputTab = 'url' | 'fetch' | 'curl';

export default function ArcGISQueryBuilder() {
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [outputTab, setOutputTab] = useState<OutputTab>('url');

  // Service URL
  const [serviceUrl, setServiceUrl] = useState('https://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer/0');

  // Query parameters
  const [where, setWhere] = useState('1=1');
  const [outFields, setOutFields] = useState('*');
  const [returnGeometry, setReturnGeometry] = useState(true);
  const [geometryType, setGeometryType] = useState('esriGeometryEnvelope');
  const [geometry, setGeometry] = useState('');
  const [spatialRel, setSpatialRel] = useState('esriSpatialRelIntersects');
  const [inSR, setInSR] = useState('');
  const [outSR, setOutSR] = useState('');
  const [resultRecordCount, setResultRecordCount] = useState('');
  const [resultOffset, setResultOffset] = useState('');
  const [orderByFields, setOrderByFields] = useState('');
  const [returnCountOnly, setReturnCountOnly] = useState(false);
  const [returnIdsOnly, setReturnIdsOnly] = useState(false);
  const [format, setFormat] = useState('json');
  const [groupByFieldsForStatistics, setGroupByFieldsForStatistics] = useState('');
  const [outStatistics, setOutStatistics] = useState<StatisticDef[]>([]);
  const [returnDistinctValues, setReturnDistinctValues] = useState(false);
  const [distance, setDistance] = useState('');
  const [units, setUnits] = useState('esriSRUnit_Meter');
  const [quantizationParameters, setQuantizationParameters] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showGeometrySection, setShowGeometrySection] = useState(false);
  const [showStatsSection, setShowStatsSection] = useState(false);

  const addStatistic = useCallback(() => {
    setOutStatistics(prev => [...prev, {
      id: String(Date.now()),
      statisticType: 'count',
      onStatisticField: 'OBJECTID',
      outStatisticFieldName: 'count_result',
    }]);
  }, []);

  const removeStatistic = useCallback((id: string) => {
    setOutStatistics(prev => prev.filter(s => s.id !== id));
  }, []);

  const updateStatistic = useCallback((id: string, field: keyof StatisticDef, value: string) => {
    setOutStatistics(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  }, []);

  const generatedUrl = useMemo(() => {
    const base = serviceUrl.endsWith('/') ? serviceUrl.slice(0, -1) : serviceUrl;
    const params: Record<string, string> = {};

    params['where'] = where || '1=1';
    params['outFields'] = outFields || '*';
    params['returnGeometry'] = String(returnGeometry);
    params['f'] = format;

    if (geometry) {
      params['geometry'] = geometry.replace(/\s+/g, '');
      params['geometryType'] = geometryType;
      params['spatialRel'] = spatialRel;
      if (distance) {
        params['distance'] = distance;
        params['units'] = units;
      }
    }

    if (inSR) params['inSR'] = inSR;
    if (outSR) params['outSR'] = outSR;
    if (resultRecordCount) params['resultRecordCount'] = resultRecordCount;
    if (resultOffset) params['resultOffset'] = resultOffset;
    if (orderByFields) params['orderByFields'] = orderByFields;
    if (returnCountOnly) params['returnCountOnly'] = 'true';
    if (returnIdsOnly) params['returnIdsOnly'] = 'true';
    if (returnDistinctValues) params['returnDistinctValues'] = 'true';
    if (groupByFieldsForStatistics) params['groupByFieldsForStatistics'] = groupByFieldsForStatistics;

    if (outStatistics.length > 0) {
      const statsJson = outStatistics.map(s => ({
        statisticType: s.statisticType,
        onStatisticField: s.onStatisticField,
        outStatisticFieldName: s.outStatisticFieldName,
      }));
      params['outStatistics'] = JSON.stringify(statsJson);
    }

    if (quantizationParameters) params['quantizationParameters'] = quantizationParameters;

    const queryStr = Object.entries(params)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');

    return `${base}/query?${queryStr}`;
  }, [
    serviceUrl, where, outFields, returnGeometry, geometryType, geometry,
    spatialRel, inSR, outSR, resultRecordCount, resultOffset, orderByFields,
    returnCountOnly, returnIdsOnly, format, groupByFieldsForStatistics,
    outStatistics, returnDistinctValues, distance, units, quantizationParameters,
  ]);

  const fetchCode = useMemo(() => {
    const base = serviceUrl.endsWith('/') ? serviceUrl.slice(0, -1) : serviceUrl;
    const params: Record<string, string> = {};

    params['where'] = where || '1=1';
    params['outFields'] = outFields || '*';
    params['returnGeometry'] = String(returnGeometry);
    params['f'] = format;

    if (geometry) {
      params['geometry'] = geometry.replace(/\s+/g, '');
      params['geometryType'] = geometryType;
      params['spatialRel'] = spatialRel;
      if (distance) {
        params['distance'] = distance;
        params['units'] = units;
      }
    }
    if (inSR) params['inSR'] = inSR;
    if (outSR) params['outSR'] = outSR;
    if (resultRecordCount) params['resultRecordCount'] = resultRecordCount;
    if (resultOffset) params['resultOffset'] = resultOffset;
    if (orderByFields) params['orderByFields'] = orderByFields;
    if (returnCountOnly) params['returnCountOnly'] = 'true';
    if (returnIdsOnly) params['returnIdsOnly'] = 'true';
    if (returnDistinctValues) params['returnDistinctValues'] = 'true';
    if (groupByFieldsForStatistics) params['groupByFieldsForStatistics'] = groupByFieldsForStatistics;
    if (outStatistics.length > 0) {
      params['outStatistics'] = JSON.stringify(outStatistics.map(s => ({
        statisticType: s.statisticType,
        onStatisticField: s.onStatisticField,
        outStatisticFieldName: s.outStatisticFieldName,
      })));
    }
    if (quantizationParameters) params['quantizationParameters'] = quantizationParameters;

    const paramsStr = JSON.stringify(params, null, 2);

    return `const url = "${base}/query";
const params = new URLSearchParams(${paramsStr});

const response = await fetch(\`\${url}?\${params.toString()}\`);
const data = await response.json();
console.log(data);

// Or using POST for large requests:
const postResponse = await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: params.toString(),
});
const postData = await postResponse.json();
console.log(postData);`;
  }, [
    serviceUrl, where, outFields, returnGeometry, geometryType, geometry,
    spatialRel, inSR, outSR, resultRecordCount, resultOffset, orderByFields,
    returnCountOnly, returnIdsOnly, format, groupByFieldsForStatistics,
    outStatistics, returnDistinctValues, distance, units, quantizationParameters,
  ]);

  const curlCode = useMemo(() => {
    return `curl -G "${serviceUrl}/query" \\
  --data-urlencode "where=${where || '1=1'}" \\
  --data-urlencode "outFields=${outFields || '*'}" \\
  --data-urlencode "returnGeometry=${returnGeometry}" \\
  --data-urlencode "f=${format}"${geometry ? ` \\
  --data-urlencode "geometry=${geometry.replace(/\s+/g, '')}" \\
  --data-urlencode "geometryType=${geometryType}" \\
  --data-urlencode "spatialRel=${spatialRel}"` : ''}${resultRecordCount ? ` \\
  --data-urlencode "resultRecordCount=${resultRecordCount}"` : ''}${resultOffset ? ` \\
  --data-urlencode "resultOffset=${resultOffset}"` : ''}${orderByFields ? ` \\
  --data-urlencode "orderByFields=${orderByFields}"` : ''}${returnCountOnly ? ` \\
  --data-urlencode "returnCountOnly=true"` : ''}${returnIdsOnly ? ` \\
  --data-urlencode "returnIdsOnly=true"` : ''}${outStatistics.length > 0 ? ` \\
  --data-urlencode "outStatistics=${JSON.stringify(outStatistics.map(s => ({ statisticType: s.statisticType, onStatisticField: s.onStatisticField, outStatisticFieldName: s.outStatisticFieldName })))}"` : ''}`;
  }, [serviceUrl, where, outFields, returnGeometry, format, geometry, geometryType, spatialRel, resultRecordCount, resultOffset, orderByFields, returnCountOnly, returnIdsOnly, outStatistics]);

  const handleCopy = useCallback(async (text: string, label = 'Content') => {
    await navigator.clipboard.writeText(text);
    setSnackbar({ open: true, message: `${label} copied to clipboard` });
  }, []);

  const applyPreset = useCallback((name: string) => {
    switch (name) {
      case 'all':
        setWhere('1=1');
        setOutFields('*');
        setReturnGeometry(true);
        setReturnCountOnly(false);
        setReturnIdsOnly(false);
        setResultRecordCount('');
        setResultOffset('');
        setGeometry('');
        setOutStatistics([]);
        setGroupByFieldsForStatistics('');
        setFormat('json');
        break;
      case 'spatial':
        setWhere('1=1');
        setGeometry(JSON.stringify({ xmin: -122.5, ymin: 37.5, xmax: -122.0, ymax: 38.0, spatialReference: { wkid: 4326 } }));
        setGeometryType('esriGeometryEnvelope');
        setSpatialRel('esriSpatialRelIntersects');
        setReturnGeometry(true);
        setInSR('4326');
        setOutSR('4326');
        setFormat('geojson');
        setShowGeometrySection(true);
        break;
      case 'stats':
        setWhere('1=1');
        setReturnGeometry(false);
        setOutStatistics([
          { id: '1', statisticType: 'count', onStatisticField: 'OBJECTID', outStatisticFieldName: 'total_count' },
          { id: '2', statisticType: 'sum', onStatisticField: 'POPULATION', outStatisticFieldName: 'total_pop' },
          { id: '3', statisticType: 'avg', onStatisticField: 'POPULATION', outStatisticFieldName: 'avg_pop' },
        ]);
        setGroupByFieldsForStatistics('STATE_NAME');
        setFormat('json');
        setShowStatsSection(true);
        break;
      case 'paginated':
        setWhere('1=1');
        setOutFields('*');
        setReturnGeometry(true);
        setResultRecordCount('100');
        setResultOffset('0');
        setOrderByFields('OBJECTID ASC');
        setFormat('json');
        break;
      case 'count':
        setWhere('1=1');
        setReturnCountOnly(true);
        setReturnGeometry(false);
        setFormat('json');
        break;
    }
  }, []);

  const presets = [
    { name: 'all', label: 'Get All Features', icon: <Database size={14} /> },
    { name: 'spatial', label: 'Spatial Query', icon: <Globe size={14} /> },
    { name: 'stats', label: 'Statistics Query', icon: <BarChart3 size={14} /> },
    { name: 'paginated', label: 'Paginated Query', icon: <Hash size={14} /> },
    { name: 'count', label: 'Count Features', icon: <Filter size={14} /> },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a', color: 'grey.300' }}>
      <Link to="/" style={{ position: 'fixed', top: 12, left: 12, zIndex: 50, display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', backgroundColor: 'rgba(30,30,30,0.9)', color: '#ccc', borderRadius: 8, textDecoration: 'none', fontSize: 14, border: '1px solid #333' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        Home
      </Link>

      {/* Header */}
      <Paper elevation={0} sx={{ bgcolor: '#111', borderBottom: '1px solid #222', px: 3, py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 12 }}>
            <Database size={24} color="#90caf9" />
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>ArcGIS REST API Query Builder</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Reset all">
              <IconButton size="small" onClick={() => applyPreset('all')} sx={{ color: 'grey.500' }}><RotateCcw size={18} /></IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', height: 'calc(100vh - 65px)' }}>
        {/* Left sidebar - Presets */}
        <Paper sx={{ width: 200, bgcolor: '#111', borderRight: '1px solid #222', overflow: 'auto', flexShrink: 0, p: 1.5 }}>
          <Typography variant="caption" sx={{ color: 'grey.500', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <Bookmark size={14} /> Presets
          </Typography>
          {presets.map(p => (
            <Button
              key={p.name}
              size="small"
              fullWidth
              startIcon={p.icon}
              onClick={() => applyPreset(p.name)}
              sx={{
                justifyContent: 'flex-start',
                color: 'grey.400',
                textTransform: 'none',
                fontSize: 12,
                mb: 0.5,
                px: 1.5,
                py: 0.8,
                borderRadius: 1,
                '&:hover': { bgcolor: '#1a1a1a' },
              }}
            >
              {p.label}
            </Button>
          ))}

          <Divider sx={{ my: 2, borderColor: '#222' }} />

          <Typography variant="caption" sx={{ color: 'grey.500', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, mb: 1, display: 'block' }}>
            Where Templates
          </Typography>
          {WHERE_TEMPLATES.map((t, i) => (
            <Button
              key={i}
              size="small"
              fullWidth
              onClick={() => setWhere(t.template)}
              sx={{
                justifyContent: 'flex-start',
                color: 'grey.500',
                textTransform: 'none',
                fontSize: 11,
                mb: 0.3,
                px: 1,
                py: 0.5,
                borderRadius: 1,
                fontFamily: 'monospace',
                '&:hover': { bgcolor: '#1a1a1a', color: 'grey.300' },
              }}
            >
              {t.label}
            </Button>
          ))}
        </Paper>

        {/* Main content */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Service URL */}
          <Paper sx={{ bgcolor: '#111', borderBottom: '1px solid #222', p: 2 }}>
            <TextField
              size="small"
              label="Service URL"
              value={serviceUrl}
              onChange={e => setServiceUrl(e.target.value)}
              fullWidth
              sx={inputSx}
              placeholder="https://server/arcgis/rest/services/ServiceName/FeatureServer/0"
              helperText="ArcGIS Feature/Map Server layer URL (e.g., .../FeatureServer/0 or .../MapServer/0)"
            />
          </Paper>

          {/* Query Parameters */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            {/* Where Clause */}
            <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 2 }}>
              <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Filter size={16} /> Where Clause
              </Typography>
              <TextField
                size="small"
                label="Where"
                value={where}
                onChange={e => setWhere(e.target.value)}
                fullWidth
                multiline
                rows={2}
                sx={{ ...inputSx, '& .MuiInputBase-root': { ...inputSx['& .MuiInputBase-root'], fontFamily: 'monospace', fontSize: 13 } }}
                placeholder="1=1"
              />
            </Paper>

            {/* Basic Parameters */}
            <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 2 }}>
              <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1.5 }}>Basic Parameters</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField size="small" label="outFields" value={outFields} onChange={e => setOutFields(e.target.value)} sx={{ ...inputSx, flex: 1 }} placeholder="* or field1,field2,field3" helperText="Use * for all fields, or comma-separated field names" />
                  <FormControl size="small" sx={{ minWidth: 130 }}>
                    <InputLabel sx={{ color: 'grey.500' }}>Format (f)</InputLabel>
                    <Select value={format} label="Format (f)" onChange={e => setFormat(e.target.value)} sx={selectSx}>
                      {OUTPUT_FORMATS.map(f => <MenuItem key={f} value={f}>{f}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <FormControlLabel
                    control={<Checkbox checked={returnGeometry} onChange={e => setReturnGeometry(e.target.checked)} sx={{ color: 'grey.500', '&.Mui-checked': { color: '#90caf9' } }} size="small" />}
                    label={<Typography variant="body2" sx={{ color: 'grey.400' }}>returnGeometry</Typography>}
                  />
                  <FormControlLabel
                    control={<Checkbox checked={returnCountOnly} onChange={e => setReturnCountOnly(e.target.checked)} sx={{ color: 'grey.500', '&.Mui-checked': { color: '#90caf9' } }} size="small" />}
                    label={<Typography variant="body2" sx={{ color: 'grey.400' }}>returnCountOnly</Typography>}
                  />
                  <FormControlLabel
                    control={<Checkbox checked={returnIdsOnly} onChange={e => setReturnIdsOnly(e.target.checked)} sx={{ color: 'grey.500', '&.Mui-checked': { color: '#90caf9' } }} size="small" />}
                    label={<Typography variant="body2" sx={{ color: 'grey.400' }}>returnIdsOnly</Typography>}
                  />
                  <FormControlLabel
                    control={<Checkbox checked={returnDistinctValues} onChange={e => setReturnDistinctValues(e.target.checked)} sx={{ color: 'grey.500', '&.Mui-checked': { color: '#90caf9' } }} size="small" />}
                    label={<Typography variant="body2" sx={{ color: 'grey.400' }}>returnDistinctValues</Typography>}
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField size="small" label="resultRecordCount" value={resultRecordCount} onChange={e => setResultRecordCount(e.target.value)} sx={{ ...inputSx, width: 170 }} placeholder="1000" />
                  <TextField size="small" label="resultOffset" value={resultOffset} onChange={e => setResultOffset(e.target.value)} sx={{ ...inputSx, width: 140 }} placeholder="0" />
                  <TextField size="small" label="orderByFields" value={orderByFields} onChange={e => setOrderByFields(e.target.value)} sx={{ ...inputSx, flex: 1 }} placeholder="OBJECTID ASC" />
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel sx={{ color: 'grey.500' }}>inSR</InputLabel>
                    <Select value={inSR} label="inSR" onChange={e => setInSR(e.target.value)} sx={selectSx}>
                      <MenuItem value="">None</MenuItem>
                      {COMMON_SR.map(s => <MenuItem key={s.code} value={s.code}>{s.label}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel sx={{ color: 'grey.500' }}>outSR</InputLabel>
                    <Select value={outSR} label="outSR" onChange={e => setOutSR(e.target.value)} sx={selectSx}>
                      <MenuItem value="">None</MenuItem>
                      {COMMON_SR.map(s => <MenuItem key={s.code} value={s.code}>{s.label}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            </Paper>

            {/* Geometry Section - Collapsible */}
            <Paper sx={{ bgcolor: '#111', border: '1px solid #222', mb: 2 }}>
              <Box
                sx={{ p: 2, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', '&:hover': { bgcolor: '#151515' } }}
                onClick={() => setShowGeometrySection(!showGeometrySection)}
              >
                <Typography variant="subtitle2" sx={{ color: 'grey.400', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Globe size={16} /> Spatial / Geometry Filter
                  {geometry && <Chip label="Active" size="small" sx={{ ml: 1, height: 20, fontSize: 10, bgcolor: '#1a3a1a', color: '#81c784' }} />}
                </Typography>
                {showGeometrySection ? <ChevronUp size={18} color="#999" /> : <ChevronDown size={18} color="#999" />}
              </Box>
              {showGeometrySection && (
                <Box sx={{ px: 2, pb: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Divider sx={{ borderColor: '#222' }} />
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <FormControl size="small" sx={{ minWidth: 220 }}>
                      <InputLabel sx={{ color: 'grey.500' }}>geometryType</InputLabel>
                      <Select value={geometryType} label="geometryType" onChange={e => setGeometryType(e.target.value)} sx={selectSx}>
                        {GEOMETRY_TYPES.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
                      </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 280 }}>
                      <InputLabel sx={{ color: 'grey.500' }}>spatialRel</InputLabel>
                      <Select value={spatialRel} label="spatialRel" onChange={e => setSpatialRel(e.target.value)} sx={selectSx}>
                        {SPATIAL_RELS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Typography variant="caption" sx={{ color: 'grey.500', width: '100%', mb: 0.5 }}>Geometry Templates:</Typography>
                    {GEOMETRY_TEMPLATES.map(t => (
                      <Chip
                        key={t.label}
                        label={t.label}
                        size="small"
                        onClick={() => {
                          setGeometry(t.value);
                          setGeometryType(
                            t.label === 'Envelope' ? 'esriGeometryEnvelope'
                            : t.label === 'Point' ? 'esriGeometryPoint'
                            : t.label === 'Polygon' ? 'esriGeometryPolygon'
                            : 'esriGeometryPolyline'
                          );
                        }}
                        sx={{ bgcolor: '#1a1a1a', color: 'grey.400', border: '1px solid #333', cursor: 'pointer', '&:hover': { bgcolor: '#252525' } }}
                      />
                    ))}
                  </Box>
                  <TextField
                    size="small"
                    label="geometry (JSON)"
                    value={geometry}
                    onChange={e => setGeometry(e.target.value)}
                    fullWidth
                    multiline
                    rows={4}
                    sx={{ ...inputSx, '& .MuiInputBase-root': { ...inputSx['& .MuiInputBase-root'], fontFamily: 'monospace', fontSize: 12 } }}
                    placeholder='{"xmin": -122.5, "ymin": 37.5, "xmax": -122.0, "ymax": 38.0, "spatialReference": {"wkid": 4326}}'
                  />
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField size="small" label="distance (buffer)" value={distance} onChange={e => setDistance(e.target.value)} sx={{ ...inputSx, width: 150 }} placeholder="0" />
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                      <InputLabel sx={{ color: 'grey.500' }}>units</InputLabel>
                      <Select value={units} label="units" onChange={e => setUnits(e.target.value)} sx={selectSx}>
                        <MenuItem value="esriSRUnit_Meter">Meters</MenuItem>
                        <MenuItem value="esriSRUnit_Foot">Feet</MenuItem>
                        <MenuItem value="esriSRUnit_StatuteMile">Miles</MenuItem>
                        <MenuItem value="esriSRUnit_Kilometer">Kilometers</MenuItem>
                        <MenuItem value="esriSRUnit_NauticalMile">Nautical Miles</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
              )}
            </Paper>

            {/* Statistics Section - Collapsible */}
            <Paper sx={{ bgcolor: '#111', border: '1px solid #222', mb: 2 }}>
              <Box
                sx={{ p: 2, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', '&:hover': { bgcolor: '#151515' } }}
                onClick={() => setShowStatsSection(!showStatsSection)}
              >
                <Typography variant="subtitle2" sx={{ color: 'grey.400', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BarChart3 size={16} /> Statistics & Group By
                  {outStatistics.length > 0 && <Chip label={`${outStatistics.length} stats`} size="small" sx={{ ml: 1, height: 20, fontSize: 10, bgcolor: '#3a1a1a', color: '#ef9a9a' }} />}
                </Typography>
                {showStatsSection ? <ChevronUp size={18} color="#999" /> : <ChevronDown size={18} color="#999" />}
              </Box>
              {showStatsSection && (
                <Box sx={{ px: 2, pb: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Divider sx={{ borderColor: '#222' }} />
                  <TextField size="small" label="groupByFieldsForStatistics" value={groupByFieldsForStatistics} onChange={e => setGroupByFieldsForStatistics(e.target.value)} fullWidth sx={inputSx} placeholder="STATE_NAME,COUNTY" />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ color: 'grey.500' }}>outStatistics Definitions</Typography>
                    <Button size="small" startIcon={<Plus size={14} />} onClick={addStatistic} sx={{ color: 'grey.400', textTransform: 'none', fontSize: 12 }}>Add Statistic</Button>
                  </Box>
                  {outStatistics.map(stat => (
                    <Box key={stat.id} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel sx={{ color: 'grey.500' }}>Type</InputLabel>
                        <Select value={stat.statisticType} label="Type" onChange={e => updateStatistic(stat.id, 'statisticType', e.target.value)} sx={selectSx}>
                          {STATISTIC_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                        </Select>
                      </FormControl>
                      <TextField size="small" label="onStatisticField" value={stat.onStatisticField} onChange={e => updateStatistic(stat.id, 'onStatisticField', e.target.value)} sx={{ ...inputSx, flex: 1 }} />
                      <TextField size="small" label="outStatisticFieldName" value={stat.outStatisticFieldName} onChange={e => updateStatistic(stat.id, 'outStatisticFieldName', e.target.value)} sx={{ ...inputSx, flex: 1 }} />
                      <IconButton size="small" onClick={() => removeStatistic(stat.id)} sx={{ color: 'grey.500' }}><Trash2 size={16} /></IconButton>
                    </Box>
                  ))}
                </Box>
              )}
            </Paper>

            {/* Advanced */}
            <Paper sx={{ bgcolor: '#111', border: '1px solid #222', mb: 2 }}>
              <Box
                sx={{ p: 2, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', '&:hover': { bgcolor: '#151515' } }}
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                <Typography variant="subtitle2" sx={{ color: 'grey.400', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Code size={16} /> Advanced Parameters
                </Typography>
                {showAdvanced ? <ChevronUp size={18} color="#999" /> : <ChevronDown size={18} color="#999" />}
              </Box>
              {showAdvanced && (
                <Box sx={{ px: 2, pb: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Divider sx={{ borderColor: '#222' }} />
                  <TextField
                    size="small"
                    label="quantizationParameters (JSON)"
                    value={quantizationParameters}
                    onChange={e => setQuantizationParameters(e.target.value)}
                    fullWidth
                    multiline
                    rows={3}
                    sx={{ ...inputSx, '& .MuiInputBase-root': { ...inputSx['& .MuiInputBase-root'], fontFamily: 'monospace', fontSize: 12 } }}
                    placeholder='{"mode": "view", "originPosition": "upperLeft", "tolerance": 1.0}'
                    helperText="Used for optimizing geometry for display at specific zoom levels"
                  />
                </Box>
              )}
            </Paper>
          </Box>

          {/* Generated Output */}
          <Paper sx={{ bgcolor: '#111', borderTop: '1px solid #222', p: 0 }}>
            <Box sx={{ borderBottom: '1px solid #222' }}>
              <Tabs value={outputTab} onChange={(_, v) => setOutputTab(v)} sx={{ '& .MuiTab-root': { color: 'grey.500', minHeight: 40, textTransform: 'none', fontSize: 13 } }}>
                <Tab icon={<Globe size={14} />} iconPosition="start" label="URL" value="url" />
                <Tab icon={<Code size={14} />} iconPosition="start" label="JavaScript Fetch" value="fetch" />
                <Tab icon={<Terminal size={14} />} iconPosition="start" label="cURL" value="curl" />
              </Tabs>
            </Box>

            <Box sx={{ p: 2 }}>
              {outputTab === 'url' && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mb: 1 }}>
                    <Tooltip title="Copy URL">
                      <IconButton size="small" onClick={() => handleCopy(generatedUrl, 'URL')} sx={{ color: 'grey.500' }}><Copy size={16} /></IconButton>
                    </Tooltip>
                  </Box>
                  <Box sx={{
                    bgcolor: '#0a0a0a',
                    border: '1px solid #222',
                    borderRadius: 1,
                    p: 1.5,
                    fontFamily: 'monospace',
                    fontSize: 12,
                    color: '#81c784',
                    wordBreak: 'break-all',
                    maxHeight: 120,
                    overflow: 'auto',
                    userSelect: 'all',
                    lineHeight: 1.6,
                  }}>
                    {generatedUrl}
                  </Box>
                </Box>
              )}
              {outputTab === 'fetch' && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mb: 1 }}>
                    <Tooltip title="Copy code">
                      <IconButton size="small" onClick={() => handleCopy(fetchCode, 'Fetch code')} sx={{ color: 'grey.500' }}><Copy size={16} /></IconButton>
                    </Tooltip>
                  </Box>
                  <Box sx={{
                    bgcolor: '#0a0a0a',
                    border: '1px solid #222',
                    borderRadius: 1,
                    p: 1.5,
                    fontFamily: 'monospace',
                    fontSize: 12,
                    color: '#90caf9',
                    whiteSpace: 'pre-wrap',
                    maxHeight: 200,
                    overflow: 'auto',
                    lineHeight: 1.5,
                  }}>
                    {fetchCode}
                  </Box>
                </Box>
              )}
              {outputTab === 'curl' && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mb: 1 }}>
                    <Tooltip title="Copy cURL">
                      <IconButton size="small" onClick={() => handleCopy(curlCode, 'cURL')} sx={{ color: 'grey.500' }}><Copy size={16} /></IconButton>
                    </Tooltip>
                  </Box>
                  <Box sx={{
                    bgcolor: '#0a0a0a',
                    border: '1px solid #222',
                    borderRadius: 1,
                    p: 1.5,
                    fontFamily: 'monospace',
                    fontSize: 12,
                    color: '#ffb74d',
                    whiteSpace: 'pre-wrap',
                    maxHeight: 200,
                    overflow: 'auto',
                    lineHeight: 1.5,
                  }}>
                    {curlCode}
                  </Box>
                </Box>
              )}
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
