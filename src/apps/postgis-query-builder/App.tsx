import { useState, useCallback, useMemo, type ReactElement } from 'react';
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
} from '@mui/material';
import { Copy, Database, Search, Layers, Settings, BarChart3, Wand2 } from 'lucide-react';
import { Link } from 'react-router-dom';

type QueryTab = 'spatial' | 'join' | 'operations' | 'analysis';

type SpatialFunction =
  | 'ST_Intersects'
  | 'ST_Contains'
  | 'ST_Within'
  | 'ST_Crosses'
  | 'ST_Touches'
  | 'ST_Overlaps'
  | 'ST_Disjoint'
  | 'ST_DWithin'
  | 'ST_Equals'
  | 'ST_Covers'
  | 'ST_CoveredBy';

type GeomOperation =
  | 'ST_Buffer'
  | 'ST_Centroid'
  | 'ST_Union'
  | 'ST_Intersection'
  | 'ST_Difference'
  | 'ST_SymDifference'
  | 'ST_ConvexHull'
  | 'ST_Simplify'
  | 'ST_Transform'
  | 'ST_MakeValid'
  | 'ST_Envelope'
  | 'ST_Area'
  | 'ST_Length'
  | 'ST_Distance'
  | 'ST_Perimeter';

type AnalysisType = 'nearest' | 'points_in_polygon' | 'buffer_analysis' | 'voronoi' | 'clustering';
type JoinType = 'INNER' | 'LEFT' | 'RIGHT' | 'CROSS';
type ClusterMethod = 'ST_ClusterDBSCAN' | 'ST_ClusterKMeans';

const SPATIAL_FUNCTIONS: SpatialFunction[] = [
  'ST_Intersects', 'ST_Contains', 'ST_Within', 'ST_Crosses', 'ST_Touches',
  'ST_Overlaps', 'ST_Disjoint', 'ST_DWithin', 'ST_Equals', 'ST_Covers', 'ST_CoveredBy',
];

const GEOM_OPERATIONS: GeomOperation[] = [
  'ST_Buffer', 'ST_Centroid', 'ST_Union', 'ST_Intersection', 'ST_Difference',
  'ST_SymDifference', 'ST_ConvexHull', 'ST_Simplify', 'ST_Transform', 'ST_MakeValid',
  'ST_Envelope', 'ST_Area', 'ST_Length', 'ST_Distance', 'ST_Perimeter',
];

const inputSx = {
  '& .MuiInputBase-root': { bgcolor: '#1a1a1a', color: 'grey.300', fontFamily: 'monospace', fontSize: 13 },
  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
  '& .MuiInputLabel-root': { color: 'grey.500' },
  '& .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
};

const selectSx = {
  bgcolor: '#1a1a1a',
  color: 'grey.300',
  fontFamily: 'monospace',
  fontSize: 13,
  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
  '& .MuiSvgIcon-root': { color: 'grey.500' },
};

interface SpatialQueryConfig {
  table: string;
  geomColumn: string;
  spatialFn: SpatialFunction;
  geomInput: string;
  geomInputType: 'wkt' | 'column';
  srid: string;
  selectColumns: string;
  whereClause: string;
  orderBy: string;
  limit: string;
  dwithinDistance: string;
}

interface JoinConfig {
  tableA: string;
  geomColumnA: string;
  tableB: string;
  geomColumnB: string;
  joinType: JoinType;
  spatialPredicate: SpatialFunction;
  selectColumnsA: string;
  selectColumnsB: string;
  whereClause: string;
  dwithinDistance: string;
}

interface OpConfig {
  table: string;
  geomColumn: string;
  operation: GeomOperation;
  outputAlias: string;
  bufferDistance: string;
  simplifyTolerance: string;
  targetSrid: string;
  secondGeomColumn: string;
  secondTable: string;
  selectColumns: string;
}

interface AnalysisConfig {
  analysisType: AnalysisType;
  table: string;
  geomColumn: string;
  targetTable: string;
  targetGeomColumn: string;
  limit: string;
  referencePoint: string;
  srid: string;
  bufferDistance: string;
  clusterMethod: ClusterMethod;
  clusterEps: string;
  clusterMinPoints: string;
  clusterK: string;
}

// SQL syntax highlight spans
function highlightSQL(sql: string): ReactElement[] {
  const keywords = /\b(SELECT|FROM|WHERE|AND|OR|ON|AS|ORDER BY|ORDER|BY|LIMIT|JOIN|INNER|LEFT|RIGHT|CROSS|GROUP|HAVING|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|DISTINCT|COUNT|SUM|AVG|MIN|MAX|OVER|PARTITION|WINDOW|CASE|WHEN|THEN|ELSE|END|IN|NOT|NULL|IS|BETWEEN|LIKE|EXISTS|UNION|ALL|WITH|LATERAL|USING)\b/gi;
  const functions = /\b(ST_\w+|ST_GeomFromText|ST_SetSRID|ST_Transform|ST_Distance|ST_Buffer|ST_Centroid|ST_Area|ST_Length|ST_Intersects|ST_Contains|ST_Within|ST_DWithin|ST_Crosses|ST_Touches|ST_Overlaps|ST_Disjoint|ST_Equals|ST_Covers|ST_CoveredBy|ST_Union|ST_Intersection|ST_Difference|ST_SymDifference|ST_ConvexHull|ST_Simplify|ST_MakeValid|ST_Envelope|ST_Perimeter|ST_ClusterDBSCAN|ST_ClusterKMeans|ST_VoronoiPolygons|ST_Collect|ST_Dump)\b/g;
  const strings = /'[^']*'/g;
  const numbers = /\b\d+\.?\d*\b/g;

  const tokens: { start: number; end: number; type: string }[] = [];

  const addMatches = (regex: RegExp, type: string) => {
    let m;
    const re = new RegExp(regex.source, regex.flags);
    while ((m = re.exec(sql)) !== null) {
      tokens.push({ start: m.index, end: m.index + m[0].length, type });
    }
  };

  addMatches(strings, 'string');
  addMatches(functions, 'function');
  addMatches(keywords, 'keyword');
  addMatches(numbers, 'number');

  // Sort by start position, remove overlaps (strings take priority)
  tokens.sort((a, b) => a.start - b.start || (a.type === 'string' ? -1 : 1));
  const resolved: typeof tokens = [];
  let lastEnd = 0;
  for (const t of tokens) {
    if (t.start >= lastEnd) {
      resolved.push(t);
      lastEnd = t.end;
    }
  }

  const elements: ReactElement[] = [];
  let pos = 0;
  for (let i = 0; i < resolved.length; i++) {
    const t = resolved[i];
    if (pos < t.start) {
      elements.push(<span key={`t${pos}`}>{sql.slice(pos, t.start)}</span>);
    }
    const colorMap: Record<string, string> = {
      keyword: '#569cd6',
      function: '#dcdcaa',
      string: '#6aab73',
      number: '#b5cea8',
    };
    elements.push(
      <span key={`h${i}`} style={{ color: colorMap[t.type] || 'inherit' }}>
        {sql.slice(t.start, t.end)}
      </span>
    );
    pos = t.end;
  }
  if (pos < sql.length) {
    elements.push(<span key="tail">{sql.slice(pos)}</span>);
  }
  return elements;
}

function formatSQL(sql: string): string {
  let s = sql.replace(/\s+/g, ' ').trim();
  const kws = ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'ORDER BY', 'LIMIT', 'GROUP BY', 'HAVING', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'CROSS JOIN', 'JOIN', 'ON', 'WITH'];
  for (const kw of kws) {
    const re = new RegExp(`\\s+(${kw})\\b`, 'gi');
    s = s.replace(re, `\n${kw}`);
  }
  // Indent sub-clauses
  s = s.replace(/\nAND\b/g, '\n  AND');
  s = s.replace(/\nOR\b/g, '\n  OR');
  s = s.replace(/\nON\b/g, '\n  ON');
  return s;
}

export default function PostGISQueryBuilder() {
  const [tab, setTab] = useState<QueryTab>('spatial');
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [formatted, setFormatted] = useState(true);

  // Spatial Query
  const [spatial, setSpatial] = useState<SpatialQueryConfig>({
    table: 'public.buildings',
    geomColumn: 'geom',
    spatialFn: 'ST_Intersects',
    geomInput: 'POLYGON((-122.5 37.7, -122.3 37.7, -122.3 37.85, -122.5 37.85, -122.5 37.7))',
    geomInputType: 'wkt',
    srid: '4326',
    selectColumns: '*',
    whereClause: '',
    orderBy: '',
    limit: '',
    dwithinDistance: '1000',
  });

  // Join
  const [join, setJoin] = useState<JoinConfig>({
    tableA: 'public.buildings',
    geomColumnA: 'geom',
    tableB: 'public.parcels',
    geomColumnB: 'geom',
    joinType: 'INNER',
    spatialPredicate: 'ST_Intersects',
    selectColumnsA: 'a.id, a.name',
    selectColumnsB: 'b.parcel_id, b.owner',
    whereClause: '',
    dwithinDistance: '1000',
  });

  // Operations
  const [op, setOp] = useState<OpConfig>({
    table: 'public.buildings',
    geomColumn: 'geom',
    operation: 'ST_Buffer',
    outputAlias: 'result_geom',
    bufferDistance: '100',
    simplifyTolerance: '0.001',
    targetSrid: '3857',
    secondGeomColumn: 'geom',
    secondTable: 'public.parcels',
    selectColumns: 'id, name',
  });

  // Analysis
  const [analysis, setAnalysis] = useState<AnalysisConfig>({
    analysisType: 'nearest',
    table: 'public.points_of_interest',
    geomColumn: 'geom',
    targetTable: 'public.buildings',
    targetGeomColumn: 'geom',
    limit: '5',
    referencePoint: 'POINT(-122.4 37.78)',
    srid: '4326',
    bufferDistance: '500',
    clusterMethod: 'ST_ClusterDBSCAN',
    clusterEps: '100',
    clusterMinPoints: '5',
    clusterK: '5',
  });

  const updateSpatial = useCallback((patch: Partial<SpatialQueryConfig>) => {
    setSpatial((prev) => ({ ...prev, ...patch }));
  }, []);

  const updateJoin = useCallback((patch: Partial<JoinConfig>) => {
    setJoin((prev) => ({ ...prev, ...patch }));
  }, []);

  const updateOp = useCallback((patch: Partial<OpConfig>) => {
    setOp((prev) => ({ ...prev, ...patch }));
  }, []);

  const updateAnalysis = useCallback((patch: Partial<AnalysisConfig>) => {
    setAnalysis((prev) => ({ ...prev, ...patch }));
  }, []);

  const generatedSQL = useMemo(() => {
    if (tab === 'spatial') {
      const s = spatial;
      const geomExpr =
        s.geomInputType === 'wkt'
          ? `ST_SetSRID(ST_GeomFromText('${s.geomInput}'), ${s.srid})`
          : s.geomInput;

      let fnCall: string;
      if (s.spatialFn === 'ST_DWithin') {
        fnCall = `ST_DWithin(${s.geomColumn}, ${geomExpr}, ${s.dwithinDistance})`;
      } else {
        fnCall = `${s.spatialFn}(${s.geomColumn}, ${geomExpr})`;
      }

      let sql = `SELECT ${s.selectColumns || '*'} FROM ${s.table} WHERE ${fnCall}`;
      if (s.whereClause.trim()) sql += ` AND ${s.whereClause}`;
      if (s.orderBy.trim()) sql += ` ORDER BY ${s.orderBy}`;
      if (s.limit.trim()) sql += ` LIMIT ${s.limit}`;
      return sql + ';';
    }

    if (tab === 'join') {
      const j = join;
      const cols = [j.selectColumnsA, j.selectColumnsB].filter(Boolean).join(', ') || '*';
      let predicate: string;
      if (j.spatialPredicate === 'ST_DWithin') {
        predicate = `ST_DWithin(a.${j.geomColumnA}, b.${j.geomColumnB}, ${j.dwithinDistance})`;
      } else {
        predicate = `${j.spatialPredicate}(a.${j.geomColumnA}, b.${j.geomColumnB})`;
      }

      let sql = `SELECT ${cols} FROM ${j.tableA} a ${j.joinType} JOIN ${j.tableB} b ON ${predicate}`;
      if (j.whereClause.trim()) sql += ` WHERE ${j.whereClause}`;
      return sql + ';';
    }

    if (tab === 'operations') {
      const o = op;
      let fnExpr = '';
      switch (o.operation) {
        case 'ST_Buffer':
          fnExpr = `ST_Buffer(${o.geomColumn}::geography, ${o.bufferDistance})::geometry`;
          break;
        case 'ST_Centroid':
          fnExpr = `ST_Centroid(${o.geomColumn})`;
          break;
        case 'ST_Union':
          fnExpr = `ST_Union(${o.geomColumn})`;
          break;
        case 'ST_Intersection':
          fnExpr = `ST_Intersection(a.${o.geomColumn}, b.${o.secondGeomColumn})`;
          break;
        case 'ST_Difference':
          fnExpr = `ST_Difference(a.${o.geomColumn}, b.${o.secondGeomColumn})`;
          break;
        case 'ST_SymDifference':
          fnExpr = `ST_SymDifference(a.${o.geomColumn}, b.${o.secondGeomColumn})`;
          break;
        case 'ST_ConvexHull':
          fnExpr = `ST_ConvexHull(${o.geomColumn})`;
          break;
        case 'ST_Simplify':
          fnExpr = `ST_Simplify(${o.geomColumn}, ${o.simplifyTolerance})`;
          break;
        case 'ST_Transform':
          fnExpr = `ST_Transform(${o.geomColumn}, ${o.targetSrid})`;
          break;
        case 'ST_MakeValid':
          fnExpr = `ST_MakeValid(${o.geomColumn})`;
          break;
        case 'ST_Envelope':
          fnExpr = `ST_Envelope(${o.geomColumn})`;
          break;
        case 'ST_Area':
          fnExpr = `ST_Area(${o.geomColumn}::geography)`;
          break;
        case 'ST_Length':
          fnExpr = `ST_Length(${o.geomColumn}::geography)`;
          break;
        case 'ST_Distance':
          fnExpr = `ST_Distance(a.${o.geomColumn}::geography, b.${o.secondGeomColumn}::geography)`;
          break;
        case 'ST_Perimeter':
          fnExpr = `ST_Perimeter(${o.geomColumn}::geography)`;
          break;
      }

      const needsSecondTable = ['ST_Intersection', 'ST_Difference', 'ST_SymDifference', 'ST_Distance'].includes(o.operation);
      const cols = o.selectColumns ? `${o.selectColumns}, ` : '';

      if (o.operation === 'ST_Union') {
        return `SELECT ${fnExpr} AS ${o.outputAlias} FROM ${o.table};`;
      }
      if (needsSecondTable) {
        return `SELECT ${cols}${fnExpr} AS ${o.outputAlias} FROM ${o.table} a, ${o.secondTable} b;`;
      }
      return `SELECT ${cols}${fnExpr} AS ${o.outputAlias} FROM ${o.table};`;
    }

    // Analysis
    const a = analysis;
    switch (a.analysisType) {
      case 'nearest': {
        const refGeom = `ST_SetSRID(ST_GeomFromText('${a.referencePoint}'), ${a.srid})`;
        return `SELECT *, ST_Distance(${a.geomColumn}::geography, ${refGeom}::geography) AS distance FROM ${a.table} WHERE ST_DWithin(${a.geomColumn}::geography, ${refGeom}::geography, ${a.bufferDistance}) ORDER BY ${a.geomColumn} <-> ${refGeom} LIMIT ${a.limit};`;
      }
      case 'points_in_polygon':
        return `SELECT b.id, b.name, COUNT(a.*) AS point_count FROM ${a.table} a INNER JOIN ${a.targetTable} b ON ST_Contains(b.${a.targetGeomColumn}, a.${a.geomColumn}) GROUP BY b.id, b.name ORDER BY point_count DESC;`;
      case 'buffer_analysis':
        return `SELECT id, ST_Buffer(${a.geomColumn}::geography, ${a.bufferDistance})::geometry AS buffer_geom FROM ${a.table};`;
      case 'voronoi':
        return `SELECT (ST_Dump(ST_VoronoiPolygons(ST_Collect(${a.geomColumn})))).geom AS voronoi_geom FROM ${a.table};`;
      case 'clustering': {
        if (a.clusterMethod === 'ST_ClusterDBSCAN') {
          return `SELECT *, ${a.clusterMethod}(${a.geomColumn}, eps := ${a.clusterEps}, minpoints := ${a.clusterMinPoints}) OVER() AS cluster_id FROM ${a.table};`;
        }
        return `SELECT *, ${a.clusterMethod}(${a.geomColumn}, ${a.clusterK}) OVER() AS cluster_id FROM ${a.table};`;
      }
    }
    return '';
  }, [tab, spatial, join, op, analysis]);

  const displaySQL = formatted ? formatSQL(generatedSQL) : generatedSQL;

  const handleCopy = useCallback(async (text: string) => {
    await navigator.clipboard.writeText(text);
    setSnackbar({ open: true, message: 'Copied to clipboard!' });
  }, []);

  const loadPreset = useCallback((preset: string) => {
    switch (preset) {
      case 'find_buildings_in_area':
        setTab('spatial');
        setSpatial({
          table: 'public.buildings',
          geomColumn: 'geom',
          spatialFn: 'ST_Intersects',
          geomInput: 'POLYGON((-122.5 37.7, -122.3 37.7, -122.3 37.85, -122.5 37.85, -122.5 37.7))',
          geomInputType: 'wkt',
          srid: '4326',
          selectColumns: 'id, name, type',
          whereClause: "type = 'commercial'",
          orderBy: 'name',
          limit: '100',
          dwithinDistance: '1000',
        });
        break;
      case 'nearby_pois':
        setTab('spatial');
        setSpatial({
          table: 'public.points_of_interest',
          geomColumn: 'geom',
          spatialFn: 'ST_DWithin',
          geomInput: 'POINT(-122.4 37.78)',
          geomInputType: 'wkt',
          srid: '4326',
          selectColumns: '*, ST_Distance(geom::geography, ST_SetSRID(ST_GeomFromText(\'POINT(-122.4 37.78)\'), 4326)::geography) AS dist',
          whereClause: '',
          orderBy: 'dist',
          limit: '20',
          dwithinDistance: '5000',
        });
        break;
      case 'parcels_with_buildings':
        setTab('join');
        setJoin({
          tableA: 'public.parcels',
          geomColumnA: 'geom',
          tableB: 'public.buildings',
          geomColumnB: 'geom',
          joinType: 'LEFT',
          spatialPredicate: 'ST_Contains',
          selectColumnsA: 'a.parcel_id, a.owner',
          selectColumnsB: 'COUNT(b.*) AS building_count',
          whereClause: '',
          dwithinDistance: '1000',
        });
        break;
      case 'buffer_500m':
        setTab('operations');
        setOp({
          table: 'public.roads',
          geomColumn: 'geom',
          operation: 'ST_Buffer',
          outputAlias: 'buffer_geom',
          bufferDistance: '500',
          simplifyTolerance: '0.001',
          targetSrid: '3857',
          secondGeomColumn: 'geom',
          secondTable: 'public.parcels',
          selectColumns: 'id, road_name',
        });
        break;
      case 'clustering_preset':
        setTab('analysis');
        setAnalysis({
          analysisType: 'clustering',
          table: 'public.incidents',
          geomColumn: 'geom',
          targetTable: 'public.zones',
          targetGeomColumn: 'geom',
          limit: '10',
          referencePoint: 'POINT(-122.4 37.78)',
          srid: '4326',
          bufferDistance: '1000',
          clusterMethod: 'ST_ClusterDBSCAN',
          clusterEps: '200',
          clusterMinPoints: '3',
          clusterK: '5',
        });
        break;
    }
  }, []);

  const renderField = (label: string, value: string, onChange: (v: string) => void, opts?: { multiline?: boolean; rows?: number; placeholder?: string }) => (
    <TextField
      fullWidth
      size="small"
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      multiline={opts?.multiline}
      rows={opts?.rows}
      placeholder={opts?.placeholder}
      sx={inputSx}
    />
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a', color: 'grey.300' }}>
      <Link to="/" style={{ position: 'fixed', top: 12, left: 12, zIndex: 50, display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', backgroundColor: 'rgba(30,30,30,0.9)', color: '#ccc', borderRadius: 8, textDecoration: 'none', fontSize: 14, border: '1px solid #333' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        Home
      </Link>

      <Box sx={{ maxWidth: 1400, mx: 'auto', pt: 7, px: 3, pb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Database size={28} color="#60a5fa" />
          <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
            PostGIS Spatial SQL Builder
          </Typography>
        </Box>

        {/* Presets */}
        <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          <Typography variant="caption" sx={{ color: 'grey.500', mr: 1 }}>Presets:</Typography>
          {[
            { key: 'find_buildings_in_area', label: 'Find in Area' },
            { key: 'nearby_pois', label: 'Nearby POIs' },
            { key: 'parcels_with_buildings', label: 'Parcels+Buildings Join' },
            { key: 'buffer_500m', label: 'Buffer 500m' },
            { key: 'clustering_preset', label: 'Clustering' },
          ].map((p) => (
            <Chip
              key={p.key}
              label={p.label}
              size="small"
              onClick={() => loadPreset(p.key)}
              icon={<Wand2 size={12} />}
              sx={{ bgcolor: '#1a1a1a', color: 'grey.400', border: '1px solid #333', cursor: 'pointer', '&:hover': { bgcolor: '#222', borderColor: '#555' } }}
            />
          ))}
        </Box>

        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', lg: 'row' } }}>
          {/* Left: Config */}
          <Box sx={{ flex: '0 0 520px', minWidth: 0 }}>
            <Paper sx={{ bgcolor: '#111', border: '1px solid #222' }}>
              <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
                variant="fullWidth"
                sx={{
                  borderBottom: '1px solid #222',
                  '& .MuiTab-root': { color: 'grey.500', fontSize: 12, minHeight: 44 },
                  '& .Mui-selected': { color: '#60a5fa' },
                }}
              >
                <Tab icon={<Search size={14} />} iconPosition="start" label="Spatial" value="spatial" />
                <Tab icon={<Layers size={14} />} iconPosition="start" label="Join" value="join" />
                <Tab icon={<Settings size={14} />} iconPosition="start" label="Operations" value="operations" />
                <Tab icon={<BarChart3 size={14} />} iconPosition="start" label="Analysis" value="analysis" />
              </Tabs>

              <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Spatial Query Tab */}
                {tab === 'spatial' && (
                  <>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      {renderField('Table', spatial.table, (v) => updateSpatial({ table: v }))}
                      {renderField('Geometry Column', spatial.geomColumn, (v) => updateSpatial({ geomColumn: v }))}
                    </Box>
                    <FormControl fullWidth size="small">
                      <InputLabel sx={{ color: 'grey.500' }}>Spatial Function</InputLabel>
                      <Select value={spatial.spatialFn} label="Spatial Function" onChange={(e) => updateSpatial({ spatialFn: e.target.value as SpatialFunction })} sx={selectSx}>
                        {SPATIAL_FUNCTIONS.map((fn) => (
                          <MenuItem key={fn} value={fn}>{fn}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    {spatial.spatialFn === 'ST_DWithin' && renderField('Distance (meters)', spatial.dwithinDistance, (v) => updateSpatial({ dwithinDistance: v }))}
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel sx={{ color: 'grey.500' }}>Input Type</InputLabel>
                        <Select value={spatial.geomInputType} label="Input Type" onChange={(e) => updateSpatial({ geomInputType: e.target.value as 'wkt' | 'column' })} sx={selectSx}>
                          <MenuItem value="wkt">WKT</MenuItem>
                          <MenuItem value="column">Column</MenuItem>
                        </Select>
                      </FormControl>
                      <Box sx={{ flex: 1 }}>
                        {renderField(
                          spatial.geomInputType === 'wkt' ? 'WKT Geometry' : 'Column Reference',
                          spatial.geomInput,
                          (v) => updateSpatial({ geomInput: v }),
                          { multiline: spatial.geomInputType === 'wkt', rows: 2 }
                        )}
                      </Box>
                    </Box>
                    {renderField('SRID', spatial.srid, (v) => updateSpatial({ srid: v }))}
                    {renderField('SELECT columns', spatial.selectColumns, (v) => updateSpatial({ selectColumns: v }), { placeholder: '* or col1, col2' })}
                    {renderField('Additional WHERE', spatial.whereClause, (v) => updateSpatial({ whereClause: v }), { placeholder: "status = 'active'" })}
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      {renderField('ORDER BY', spatial.orderBy, (v) => updateSpatial({ orderBy: v }), { placeholder: 'column ASC' })}
                      {renderField('LIMIT', spatial.limit, (v) => updateSpatial({ limit: v }), { placeholder: '100' })}
                    </Box>
                  </>
                )}

                {/* Join Tab */}
                {tab === 'join' && (
                  <>
                    <Typography variant="caption" sx={{ color: '#60a5fa', fontWeight: 600 }}>Table A</Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      {renderField('Table A', join.tableA, (v) => updateJoin({ tableA: v }))}
                      {renderField('Geom Column A', join.geomColumnA, (v) => updateJoin({ geomColumnA: v }))}
                    </Box>
                    {renderField('Select Columns (A)', join.selectColumnsA, (v) => updateJoin({ selectColumnsA: v }), { placeholder: 'a.id, a.name' })}

                    <Typography variant="caption" sx={{ color: '#f59e0b', fontWeight: 600 }}>Table B</Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      {renderField('Table B', join.tableB, (v) => updateJoin({ tableB: v }))}
                      {renderField('Geom Column B', join.geomColumnB, (v) => updateJoin({ geomColumnB: v }))}
                    </Box>
                    {renderField('Select Columns (B)', join.selectColumnsB, (v) => updateJoin({ selectColumnsB: v }), { placeholder: 'b.parcel_id' })}

                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <FormControl fullWidth size="small">
                        <InputLabel sx={{ color: 'grey.500' }}>Join Type</InputLabel>
                        <Select value={join.joinType} label="Join Type" onChange={(e) => updateJoin({ joinType: e.target.value as JoinType })} sx={selectSx}>
                          {(['INNER', 'LEFT', 'RIGHT', 'CROSS'] as JoinType[]).map((j) => (
                            <MenuItem key={j} value={j}>{j} JOIN</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <FormControl fullWidth size="small">
                        <InputLabel sx={{ color: 'grey.500' }}>Spatial Predicate</InputLabel>
                        <Select value={join.spatialPredicate} label="Spatial Predicate" onChange={(e) => updateJoin({ spatialPredicate: e.target.value as SpatialFunction })} sx={selectSx}>
                          {SPATIAL_FUNCTIONS.map((fn) => (
                            <MenuItem key={fn} value={fn}>{fn}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                    {join.spatialPredicate === 'ST_DWithin' && renderField('Distance (meters)', join.dwithinDistance, (v) => updateJoin({ dwithinDistance: v }))}
                    {renderField('Additional WHERE', join.whereClause, (v) => updateJoin({ whereClause: v }), { placeholder: "a.status = 'active'" })}
                  </>
                )}

                {/* Operations Tab */}
                {tab === 'operations' && (
                  <>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      {renderField('Table', op.table, (v) => updateOp({ table: v }))}
                      {renderField('Geometry Column', op.geomColumn, (v) => updateOp({ geomColumn: v }))}
                    </Box>
                    <FormControl fullWidth size="small">
                      <InputLabel sx={{ color: 'grey.500' }}>Operation</InputLabel>
                      <Select value={op.operation} label="Operation" onChange={(e) => updateOp({ operation: e.target.value as GeomOperation })} sx={selectSx}>
                        {GEOM_OPERATIONS.map((fn) => (
                          <MenuItem key={fn} value={fn}>{fn}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    {op.operation === 'ST_Buffer' && renderField('Buffer Distance (meters)', op.bufferDistance, (v) => updateOp({ bufferDistance: v }))}
                    {op.operation === 'ST_Simplify' && renderField('Simplify Tolerance', op.simplifyTolerance, (v) => updateOp({ simplifyTolerance: v }))}
                    {op.operation === 'ST_Transform' && renderField('Target SRID', op.targetSrid, (v) => updateOp({ targetSrid: v }))}
                    {['ST_Intersection', 'ST_Difference', 'ST_SymDifference', 'ST_Distance'].includes(op.operation) && (
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        {renderField('Second Table', op.secondTable, (v) => updateOp({ secondTable: v }))}
                        {renderField('Second Geom Column', op.secondGeomColumn, (v) => updateOp({ secondGeomColumn: v }))}
                      </Box>
                    )}
                    {renderField('Output Alias', op.outputAlias, (v) => updateOp({ outputAlias: v }))}
                    {renderField('Additional SELECT columns', op.selectColumns, (v) => updateOp({ selectColumns: v }), { placeholder: 'id, name' })}
                  </>
                )}

                {/* Analysis Tab */}
                {tab === 'analysis' && (
                  <>
                    <FormControl fullWidth size="small">
                      <InputLabel sx={{ color: 'grey.500' }}>Analysis Type</InputLabel>
                      <Select value={analysis.analysisType} label="Analysis Type" onChange={(e) => updateAnalysis({ analysisType: e.target.value as AnalysisType })} sx={selectSx}>
                        <MenuItem value="nearest">Nearest Neighbor</MenuItem>
                        <MenuItem value="points_in_polygon">Points in Polygon Count</MenuItem>
                        <MenuItem value="buffer_analysis">Buffer Analysis</MenuItem>
                        <MenuItem value="voronoi">Voronoi Polygons</MenuItem>
                        <MenuItem value="clustering">Clustering</MenuItem>
                      </Select>
                    </FormControl>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      {renderField('Table', analysis.table, (v) => updateAnalysis({ table: v }))}
                      {renderField('Geometry Column', analysis.geomColumn, (v) => updateAnalysis({ geomColumn: v }))}
                    </Box>

                    {analysis.analysisType === 'nearest' && (
                      <>
                        {renderField('Reference Point (WKT)', analysis.referencePoint, (v) => updateAnalysis({ referencePoint: v }))}
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          {renderField('SRID', analysis.srid, (v) => updateAnalysis({ srid: v }))}
                          {renderField('Search Radius (m)', analysis.bufferDistance, (v) => updateAnalysis({ bufferDistance: v }))}
                          {renderField('Limit', analysis.limit, (v) => updateAnalysis({ limit: v }))}
                        </Box>
                      </>
                    )}

                    {analysis.analysisType === 'points_in_polygon' && (
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        {renderField('Polygon Table', analysis.targetTable, (v) => updateAnalysis({ targetTable: v }))}
                        {renderField('Polygon Geom Column', analysis.targetGeomColumn, (v) => updateAnalysis({ targetGeomColumn: v }))}
                      </Box>
                    )}

                    {analysis.analysisType === 'buffer_analysis' && renderField('Buffer Distance (m)', analysis.bufferDistance, (v) => updateAnalysis({ bufferDistance: v }))}

                    {analysis.analysisType === 'clustering' && (
                      <>
                        <FormControl fullWidth size="small">
                          <InputLabel sx={{ color: 'grey.500' }}>Cluster Method</InputLabel>
                          <Select value={analysis.clusterMethod} label="Cluster Method" onChange={(e) => updateAnalysis({ clusterMethod: e.target.value as ClusterMethod })} sx={selectSx}>
                            <MenuItem value="ST_ClusterDBSCAN">ST_ClusterDBSCAN</MenuItem>
                            <MenuItem value="ST_ClusterKMeans">ST_ClusterKMeans</MenuItem>
                          </Select>
                        </FormControl>
                        {analysis.clusterMethod === 'ST_ClusterDBSCAN' && (
                          <Box sx={{ display: 'flex', gap: 2 }}>
                            {renderField('Epsilon (eps)', analysis.clusterEps, (v) => updateAnalysis({ clusterEps: v }))}
                            {renderField('Min Points', analysis.clusterMinPoints, (v) => updateAnalysis({ clusterMinPoints: v }))}
                          </Box>
                        )}
                        {analysis.clusterMethod === 'ST_ClusterKMeans' && renderField('K (number of clusters)', analysis.clusterK, (v) => updateAnalysis({ clusterK: v }))}
                      </>
                    )}
                  </>
                )}
              </Box>
            </Paper>
          </Box>

          {/* Right: SQL Output */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Paper sx={{ bgcolor: '#111', border: '1px solid #222' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2.5, py: 1.5, borderBottom: '1px solid #222' }}>
                <Typography variant="subtitle2" sx={{ color: 'grey.400' }}>
                  Generated SQL
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant={formatted ? 'contained' : 'outlined'}
                    onClick={() => setFormatted(!formatted)}
                    sx={{
                      fontSize: 11,
                      bgcolor: formatted ? '#1e3a5f' : 'transparent',
                      color: formatted ? '#60a5fa' : 'grey.500',
                      borderColor: '#333',
                      '&:hover': { bgcolor: '#1e3a5f' },
                    }}
                  >
                    {formatted ? 'Formatted' : 'Single Line'}
                  </Button>
                  <Tooltip title="Copy SQL">
                    <IconButton size="small" onClick={() => handleCopy(displaySQL)} sx={{ color: 'grey.500', '&:hover': { color: '#60a5fa' } }}>
                      <Copy size={16} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              <Box
                sx={{
                  p: 2.5,
                  bgcolor: '#0a0a0a',
                  m: 2,
                  borderRadius: 1,
                  border: '1px solid #1a1a1a',
                  fontFamily: '"Fira Code", "Cascadia Code", monospace',
                  fontSize: 13,
                  lineHeight: 1.8,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  color: '#d4d4d4',
                  minHeight: 120,
                  cursor: 'pointer',
                }}
                onClick={() => handleCopy(displaySQL)}
              >
                {highlightSQL(displaySQL)}
              </Box>
            </Paper>

            {/* Function Reference */}
            <Paper sx={{ bgcolor: '#111', border: '1px solid #222', mt: 2, p: 2.5 }}>
              <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1 }}>
                Quick Reference
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {(tab === 'spatial' ? SPATIAL_FUNCTIONS : tab === 'operations' ? GEOM_OPERATIONS : SPATIAL_FUNCTIONS).map((fn) => (
                  <Chip
                    key={fn}
                    label={fn}
                    size="small"
                    sx={{
                      bgcolor: '#1a1a1a',
                      color: '#dcdcaa',
                      border: '1px solid #333',
                      fontFamily: 'monospace',
                      fontSize: 11,
                    }}
                  />
                ))}
              </Box>
            </Paper>
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
