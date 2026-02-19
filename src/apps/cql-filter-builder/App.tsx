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
  Divider,
  Alert,
} from '@mui/material';
import {
  Copy,
  Check,
  Plus,
  Trash2,
  Filter,
  Map,
  Code,
  Zap,
  Link2,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FunctionSquare,
  Globe,
  Brackets,
} from 'lucide-react';
import { Link } from 'react-router-dom';

type ComparisonOperator = '=' | '<>' | '<' | '>' | '<=' | '>=' | 'LIKE' | 'ILIKE' | 'BETWEEN' | 'IN' | 'IS NULL' | 'IS NOT NULL';
type LogicalOperator = 'AND' | 'OR' | 'NOT';
type SpatialOperator = 'INTERSECTS' | 'CONTAINS' | 'WITHIN' | 'CROSSES' | 'TOUCHES' | 'OVERLAPS' | 'DISJOINT' | 'DWITHIN' | 'BBOX';
type ViewTab = 'attribute' | 'spatial' | 'function';

interface Condition {
  id: string;
  property: string;
  operator: ComparisonOperator;
  value: string;
  value2: string; // For BETWEEN
  logicalOp: LogicalOperator;
  isNegated: boolean;
}

interface SpatialCondition {
  id: string;
  operator: SpatialOperator;
  geometryField: string;
  wktGeometry: string;
  distance: string;
  distanceUnit: string;
  logicalOp: LogicalOperator;
}

interface FunctionCall {
  id: string;
  functionName: string;
  args: string;
  operator: ComparisonOperator;
  compareValue: string;
  logicalOp: LogicalOperator;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

const comparisonOperators: ComparisonOperator[] = ['=', '<>', '<', '>', '<=', '>=', 'LIKE', 'ILIKE', 'BETWEEN', 'IN', 'IS NULL', 'IS NOT NULL'];
const spatialOperators: SpatialOperator[] = ['INTERSECTS', 'CONTAINS', 'WITHIN', 'CROSSES', 'TOUCHES', 'OVERLAPS', 'DISJOINT', 'DWITHIN', 'BBOX'];
const logicalOperators: LogicalOperator[] = ['AND', 'OR', 'NOT'];

const cqlFunctions = [
  { name: 'strConcat', args: 'string1, string2', description: 'Concatenate two strings' },
  { name: 'strToLowerCase', args: 'string', description: 'Convert string to lowercase' },
  { name: 'strToUpperCase', args: 'string', description: 'Convert string to uppercase' },
  { name: 'strTrim', args: 'string', description: 'Trim whitespace from string' },
  { name: 'strLength', args: 'string', description: 'Get string length' },
  { name: 'Area', args: 'geometry', description: 'Calculate area of geometry' },
  { name: 'Length', args: 'geometry', description: 'Calculate length of geometry' },
  { name: 'Centroid', args: 'geometry', description: 'Get centroid of geometry' },
  { name: 'Buffer', args: 'geometry, distance', description: 'Create buffer around geometry' },
  { name: 'Envelope', args: 'geometry', description: 'Get bounding box of geometry' },
  { name: 'Simplify', args: 'geometry, tolerance', description: 'Simplify geometry' },
  { name: 'Union', args: 'geometry1, geometry2', description: 'Union two geometries' },
  { name: 'Intersection', args: 'geometry1, geometry2', description: 'Intersect two geometries' },
  { name: 'Difference', args: 'geometry1, geometry2', description: 'Difference of two geometries' },
  { name: 'dateParse', args: 'format, dateString', description: 'Parse date from string' },
  { name: 'dateDifference', args: 'date1, date2', description: 'Difference between dates' },
  { name: 'numberFormat', args: 'format, number', description: 'Format number as string' },
  { name: 'abs', args: 'number', description: 'Absolute value' },
  { name: 'ceil', args: 'number', description: 'Round up to integer' },
  { name: 'floor', args: 'number', description: 'Round down to integer' },
  { name: 'round', args: 'number', description: 'Round to nearest integer' },
  { name: 'sqrt', args: 'number', description: 'Square root' },
  { name: 'log', args: 'number', description: 'Natural logarithm' },
  { name: 'pow', args: 'base, exponent', description: 'Power function' },
];

const geometryTemplates = [
  { name: 'Point', wkt: 'POINT(0 0)' },
  { name: 'LineString', wkt: 'LINESTRING(0 0, 1 1, 2 0)' },
  { name: 'Polygon', wkt: 'POLYGON((0 0, 1 0, 1 1, 0 1, 0 0))' },
  { name: 'Circle (approx)', wkt: 'POLYGON((0.5 0, 0.433 0.25, 0.25 0.433, 0 0.5, -0.25 0.433, -0.433 0.25, -0.5 0, -0.433 -0.25, -0.25 -0.433, 0 -0.5, 0.25 -0.433, 0.433 -0.25, 0.5 0))' },
  { name: 'MultiPoint', wkt: 'MULTIPOINT((0 0), (1 1), (2 2))' },
  { name: 'Envelope/BBOX', wkt: 'POLYGON((-180 -90, 180 -90, 180 90, -180 90, -180 -90))' },
];

const inputSx = {
  bgcolor: '#1a1a1a',
  color: 'grey.300',
  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#7c3aed' },
  '& .MuiInputBase-input': { color: '#ccc' },
  '& .MuiInputLabel-root': { color: '#888' },
  '& .MuiSelect-icon': { color: '#888' },
};

const textFieldSx = {
  '& .MuiOutlinedInput-root': inputSx,
  '& .MuiInputLabel-root': { color: '#888' },
};

const selectSx = {
  ...inputSx,
  '& .MuiSelect-select': { color: '#ccc' },
};

let idCounter = 100;
const nextId = () => String(++idCounter);

export default function CqlFilterBuilder() {
  const [viewTab, setViewTab] = useState<ViewTab>('attribute');
  const [copied, setCopied] = useState(false);
  const [copiedEncoded, setCopiedEncoded] = useState(false);
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');

  // Attribute conditions
  const [conditions, setConditions] = useState<Condition[]>([
    { id: '1', property: 'name', operator: '=', value: "'MyFeature'", value2: '', logicalOp: 'AND', isNegated: false },
  ]);

  // Spatial conditions
  const [spatialConditions, setSpatialConditions] = useState<SpatialCondition[]>([]);

  // Function calls
  const [functionCalls, setFunctionCalls] = useState<FunctionCall[]>([]);

  // Global logical operator between attribute/spatial/function groups
  const [groupOperator, setGroupOperator] = useState<LogicalOperator>('AND');

  // Add/remove attribute conditions
  const addCondition = () => {
    setConditions([...conditions, {
      id: nextId(),
      property: 'attribute',
      operator: '=',
      value: "'value'",
      value2: '',
      logicalOp: 'AND',
      isNegated: false,
    }]);
  };

  const removeCondition = (id: string) => {
    setConditions(conditions.filter((c) => c.id !== id));
  };

  const updateCondition = (id: string, updates: Partial<Condition>) => {
    setConditions(conditions.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  // Add/remove spatial conditions
  const addSpatialCondition = () => {
    setSpatialConditions([...spatialConditions, {
      id: nextId(),
      operator: 'INTERSECTS',
      geometryField: 'the_geom',
      wktGeometry: 'POLYGON((0 0, 1 0, 1 1, 0 1, 0 0))',
      distance: '100',
      distanceUnit: 'meters',
      logicalOp: 'AND',
    }]);
  };

  const removeSpatialCondition = (id: string) => {
    setSpatialConditions(spatialConditions.filter((c) => c.id !== id));
  };

  const updateSpatialCondition = (id: string, updates: Partial<SpatialCondition>) => {
    setSpatialConditions(spatialConditions.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  // Add/remove function calls
  const addFunctionCall = () => {
    setFunctionCalls([...functionCalls, {
      id: nextId(),
      functionName: 'strToLowerCase',
      args: 'name',
      operator: '=',
      compareValue: "'test'",
      logicalOp: 'AND',
    }]);
  };

  const removeFunctionCall = (id: string) => {
    setFunctionCalls(functionCalls.filter((f) => f.id !== id));
  };

  const updateFunctionCall = (id: string, updates: Partial<FunctionCall>) => {
    setFunctionCalls(functionCalls.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  // Generate CQL string
  const generatedCql = useMemo(() => {
    const parts: string[] = [];

    // Attribute conditions
    if (conditions.length > 0) {
      const attrParts: string[] = [];
      conditions.forEach((c, idx) => {
        let expr = '';
        const prop = c.property;
        switch (c.operator) {
          case 'IS NULL':
            expr = `${prop} IS NULL`;
            break;
          case 'IS NOT NULL':
            expr = `${prop} IS NOT NULL`;
            break;
          case 'BETWEEN':
            expr = `${prop} BETWEEN ${c.value} AND ${c.value2}`;
            break;
          case 'IN':
            expr = `${prop} IN (${c.value})`;
            break;
          case 'LIKE':
          case 'ILIKE':
            expr = `${prop} ${c.operator} ${c.value}`;
            break;
          default:
            expr = `${prop} ${c.operator} ${c.value}`;
        }
        if (c.isNegated) expr = `NOT (${expr})`;
        if (idx > 0) {
          attrParts.push(c.logicalOp);
        }
        attrParts.push(expr);
      });
      parts.push(attrParts.join(' '));
    }

    // Spatial conditions
    if (spatialConditions.length > 0) {
      const spatParts: string[] = [];
      spatialConditions.forEach((s, idx) => {
        let expr = '';
        if (s.operator === 'BBOX') {
          // BBOX(geom, minx, miny, maxx, maxy)
          // Parse polygon to extract bbox
          const bboxMatch = s.wktGeometry.match(/POLYGON\(\(([^)]+)\)\)/);
          if (bboxMatch) {
            const coords = bboxMatch[1].split(',').map((p) => p.trim().split(/\s+/).map(Number));
            const xs = coords.map((c) => c[0]);
            const ys = coords.map((c) => c[1]);
            expr = `BBOX(${s.geometryField}, ${Math.min(...xs)}, ${Math.min(...ys)}, ${Math.max(...xs)}, ${Math.max(...ys)})`;
          } else {
            expr = `BBOX(${s.geometryField}, -180, -90, 180, 90)`;
          }
        } else if (s.operator === 'DWITHIN') {
          expr = `DWITHIN(${s.geometryField}, ${s.wktGeometry}, ${s.distance}, ${s.distanceUnit})`;
        } else {
          expr = `${s.operator}(${s.geometryField}, ${s.wktGeometry})`;
        }
        if (idx > 0) {
          spatParts.push(s.logicalOp);
        }
        spatParts.push(expr);
      });

      if (parts.length > 0) parts.push(groupOperator);
      parts.push(spatParts.join(' '));
    }

    // Function conditions
    if (functionCalls.length > 0) {
      const funcParts: string[] = [];
      functionCalls.forEach((f, idx) => {
        const funcExpr = `${f.functionName}(${f.args})`;
        let expr = '';
        if (f.operator === 'IS NULL') {
          expr = `${funcExpr} IS NULL`;
        } else if (f.operator === 'IS NOT NULL') {
          expr = `${funcExpr} IS NOT NULL`;
        } else {
          expr = `${funcExpr} ${f.operator} ${f.compareValue}`;
        }
        if (idx > 0) {
          funcParts.push(f.logicalOp);
        }
        funcParts.push(expr);
      });

      if (parts.length > 0) parts.push(groupOperator);
      parts.push(funcParts.join(' '));
    }

    return parts.join(' ') || '1=1';
  }, [conditions, spatialConditions, functionCalls, groupOperator]);

  const urlEncodedCql = useMemo(() => encodeURIComponent(generatedCql), [generatedCql]);

  // Basic validation
  const validation = useMemo((): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const c of conditions) {
      if (!c.property.trim()) errors.push('Attribute condition has empty property name');
      if (c.operator === 'BETWEEN' && !c.value2.trim()) errors.push(`BETWEEN operator requires two values for "${c.property}"`);
      if (c.operator === 'IN' && !c.value.trim()) errors.push(`IN operator requires a value list for "${c.property}"`);
      if (!['IS NULL', 'IS NOT NULL'].includes(c.operator) && !c.value.trim()) {
        errors.push(`Missing value for "${c.property}" condition`);
      }
      if (['LIKE', 'ILIKE'].includes(c.operator) && !c.value.includes('%') && !c.value.includes('_')) {
        warnings.push(`LIKE/ILIKE on "${c.property}" without wildcards (% or _) may not match as intended`);
      }
    }

    for (const s of spatialConditions) {
      if (!s.geometryField.trim()) errors.push('Spatial condition has empty geometry field');
      if (!s.wktGeometry.trim()) errors.push('Spatial condition has empty WKT geometry');
      if (s.operator === 'DWITHIN') {
        if (!s.distance.trim() || isNaN(Number(s.distance))) {
          errors.push('DWITHIN requires a valid numeric distance');
        }
      }
      // Basic WKT validation
      const wkt = s.wktGeometry.trim().toUpperCase();
      const validPrefixes = ['POINT', 'LINESTRING', 'POLYGON', 'MULTIPOINT', 'MULTILINESTRING', 'MULTIPOLYGON', 'GEOMETRYCOLLECTION'];
      if (!validPrefixes.some((p) => wkt.startsWith(p))) {
        errors.push('WKT geometry does not start with a valid geometry type');
      }
      const openParens = (s.wktGeometry.match(/\(/g) || []).length;
      const closeParens = (s.wktGeometry.match(/\)/g) || []).length;
      if (openParens !== closeParens) {
        errors.push('WKT geometry has mismatched parentheses');
      }
    }

    for (const f of functionCalls) {
      if (!f.functionName.trim()) errors.push('Function call has empty function name');
      if (!f.args.trim()) warnings.push(`Function "${f.functionName}" has no arguments`);
    }

    if (conditions.length === 0 && spatialConditions.length === 0 && functionCalls.length === 0) {
      warnings.push('No conditions defined - filter defaults to 1=1 (all features)');
    }

    return { valid: errors.length === 0, errors, warnings };
  }, [conditions, spatialConditions, functionCalls]);

  const handleCopy = (encoded = false) => {
    const text = encoded ? urlEncodedCql : generatedCql;
    navigator.clipboard.writeText(text);
    if (encoded) {
      setCopiedEncoded(true);
      setTimeout(() => setCopiedEncoded(false), 2000);
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    setSnackMsg(encoded ? 'URL-encoded CQL copied!' : 'CQL filter copied!');
    setSnackOpen(true);
  };

  const applyPreset = (preset: string) => {
    switch (preset) {
      case 'attribute-filter':
        setConditions([
          { id: nextId(), property: 'status', operator: '=', value: "'active'", value2: '', logicalOp: 'AND', isNegated: false },
          { id: nextId(), property: 'population', operator: '>', value: '10000', value2: '', logicalOp: 'AND', isNegated: false },
        ]);
        setSpatialConditions([]);
        setFunctionCalls([]);
        break;
      case 'spatial-intersection':
        setConditions([]);
        setSpatialConditions([
          { id: nextId(), operator: 'INTERSECTS', geometryField: 'the_geom', wktGeometry: 'POLYGON((-74.1 40.6, -73.7 40.6, -73.7 40.9, -74.1 40.9, -74.1 40.6))', distance: '', distanceUnit: 'meters', logicalOp: 'AND' },
        ]);
        setFunctionCalls([]);
        break;
      case 'combined':
        setConditions([
          { id: nextId(), property: 'type', operator: '=', value: "'building'", value2: '', logicalOp: 'AND', isNegated: false },
        ]);
        setSpatialConditions([
          { id: nextId(), operator: 'DWITHIN', geometryField: 'the_geom', wktGeometry: 'POINT(-73.985 40.748)', distance: '500', distanceUnit: 'meters', logicalOp: 'AND' },
        ]);
        setFunctionCalls([]);
        setGroupOperator('AND');
        break;
      case 'date-range':
        setConditions([
          { id: nextId(), property: 'created_date', operator: '>=', value: "'2024-01-01T00:00:00Z'", value2: '', logicalOp: 'AND', isNegated: false },
          { id: nextId(), property: 'created_date', operator: '<=', value: "'2024-12-31T23:59:59Z'", value2: '', logicalOp: 'AND', isNegated: false },
        ]);
        setSpatialConditions([]);
        setFunctionCalls([]);
        break;
    }
    setSnackMsg(`Preset applied: ${preset}`);
    setSnackOpen(true);
  };

  const renderAttributeConditions = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="subtitle2" sx={{ color: '#7c3aed', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Filter size={16} /> Attribute Conditions
        </Typography>
        <Button size="small" startIcon={<Plus size={14} />} onClick={addCondition} sx={{ textTransform: 'none', color: '#7c3aed', fontSize: 12 }}>
          Add Condition
        </Button>
      </Box>

      {conditions.map((cond, idx) => (
        <Paper key={cond.id} sx={{ bgcolor: '#1a1a1a', border: '1px solid #292929', p: 2, borderRadius: 1.5 }}>
          {idx > 0 && (
            <Box sx={{ mb: 1.5 }}>
              <FormControl size="small" sx={{ minWidth: 100 }}>
                <Select value={cond.logicalOp} onChange={(e) => updateCondition(cond.id, { logicalOp: e.target.value as LogicalOperator })} sx={selectSx}>
                  <MenuItem value="AND">AND</MenuItem>
                  <MenuItem value="OR">OR</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <Tooltip title="Negate (NOT)">
              <Chip
                label="NOT"
                size="small"
                onClick={() => updateCondition(cond.id, { isNegated: !cond.isNegated })}
                sx={{
                  bgcolor: cond.isNegated ? '#7c3aed' : '#222',
                  color: cond.isNegated ? '#fff' : '#888',
                  border: '1px solid #333',
                  cursor: 'pointer',
                  mt: 0.5,
                }}
              />
            </Tooltip>
            <TextField
              size="small"
              label="Property"
              value={cond.property}
              onChange={(e) => updateCondition(cond.id, { property: e.target.value })}
              sx={{ ...textFieldSx, minWidth: 140, flex: 1 }}
            />
            <FormControl size="small" sx={{ minWidth: 130 }}>
              <InputLabel sx={{ color: '#888' }}>Operator</InputLabel>
              <Select value={cond.operator} label="Operator" onChange={(e) => updateCondition(cond.id, { operator: e.target.value as ComparisonOperator })} sx={selectSx}>
                {comparisonOperators.map((op) => (
                  <MenuItem key={op} value={op}>{op}</MenuItem>
                ))}
              </Select>
            </FormControl>
            {!['IS NULL', 'IS NOT NULL'].includes(cond.operator) && (
              <TextField
                size="small"
                label={cond.operator === 'BETWEEN' ? 'From' : cond.operator === 'IN' ? "Values (comma-sep)" : 'Value'}
                value={cond.value}
                onChange={(e) => updateCondition(cond.id, { value: e.target.value })}
                sx={{ ...textFieldSx, minWidth: 140, flex: 1 }}
                placeholder={cond.operator === 'LIKE' ? "'%pattern%'" : cond.operator === 'IN' ? "'a','b','c'" : ''}
              />
            )}
            {cond.operator === 'BETWEEN' && (
              <TextField
                size="small"
                label="To"
                value={cond.value2}
                onChange={(e) => updateCondition(cond.id, { value2: e.target.value })}
                sx={{ ...textFieldSx, minWidth: 100, flex: 1 }}
              />
            )}
            <IconButton size="small" onClick={() => removeCondition(cond.id)} sx={{ color: '#f87171', mt: 0.5 }}>
              <Trash2 size={16} />
            </IconButton>
          </Box>
        </Paper>
      ))}
      {conditions.length === 0 && (
        <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic', textAlign: 'center', py: 2 }}>
          No attribute conditions. Click "Add Condition" to start building.
        </Typography>
      )}
    </Box>
  );

  const renderSpatialConditions = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="subtitle2" sx={{ color: '#7c3aed', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Globe size={16} /> Spatial Conditions
        </Typography>
        <Button size="small" startIcon={<Plus size={14} />} onClick={addSpatialCondition} sx={{ textTransform: 'none', color: '#7c3aed', fontSize: 12 }}>
          Add Spatial Filter
        </Button>
      </Box>

      {/* Geometry templates */}
      <Box>
        <Typography variant="caption" sx={{ color: '#888', mb: 1, display: 'block' }}>WKT Geometry Templates:</Typography>
        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
          {geometryTemplates.map((t) => (
            <Chip
              key={t.name}
              label={t.name}
              size="small"
              onClick={() => {
                if (spatialConditions.length === 0) {
                  addSpatialCondition();
                  setTimeout(() => {
                    setSpatialConditions((prev) => prev.map((sc, i) => i === prev.length - 1 ? { ...sc, wktGeometry: t.wkt } : sc));
                  }, 0);
                } else {
                  const last = spatialConditions[spatialConditions.length - 1];
                  updateSpatialCondition(last.id, { wktGeometry: t.wkt });
                }
                setSnackMsg(`Template applied: ${t.name}`);
                setSnackOpen(true);
              }}
              sx={{ bgcolor: '#1a1a1a', color: '#ccc', border: '1px solid #333', '&:hover': { bgcolor: '#252525', borderColor: '#7c3aed' }, cursor: 'pointer', fontSize: 11 }}
            />
          ))}
        </Box>
      </Box>

      {spatialConditions.map((sc, idx) => (
        <Paper key={sc.id} sx={{ bgcolor: '#1a1a1a', border: '1px solid #292929', p: 2, borderRadius: 1.5 }}>
          {idx > 0 && (
            <Box sx={{ mb: 1.5 }}>
              <FormControl size="small" sx={{ minWidth: 100 }}>
                <Select value={sc.logicalOp} onChange={(e) => updateSpatialCondition(sc.id, { logicalOp: e.target.value as LogicalOperator })} sx={selectSx}>
                  <MenuItem value="AND">AND</MenuItem>
                  <MenuItem value="OR">OR</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel sx={{ color: '#888' }}>Spatial Operator</InputLabel>
                <Select value={sc.operator} label="Spatial Operator" onChange={(e) => updateSpatialCondition(sc.id, { operator: e.target.value as SpatialOperator })} sx={selectSx}>
                  {spatialOperators.map((op) => (
                    <MenuItem key={op} value={op}>{op}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                size="small"
                label="Geometry Field"
                value={sc.geometryField}
                onChange={(e) => updateSpatialCondition(sc.id, { geometryField: e.target.value })}
                sx={{ ...textFieldSx, minWidth: 130 }}
              />
              <IconButton size="small" onClick={() => removeSpatialCondition(sc.id)} sx={{ color: '#f87171', mt: 0.5 }}>
                <Trash2 size={16} />
              </IconButton>
            </Box>
            <TextField
              fullWidth
              size="small"
              label="WKT Geometry"
              value={sc.wktGeometry}
              onChange={(e) => updateSpatialCondition(sc.id, { wktGeometry: e.target.value })}
              multiline
              rows={2}
              sx={textFieldSx}
              placeholder="POLYGON((0 0, 1 0, 1 1, 0 1, 0 0))"
            />
            {sc.operator === 'DWITHIN' && (
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <TextField
                  size="small"
                  label="Distance"
                  value={sc.distance}
                  onChange={(e) => updateSpatialCondition(sc.id, { distance: e.target.value })}
                  sx={{ ...textFieldSx, flex: 1 }}
                />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel sx={{ color: '#888' }}>Unit</InputLabel>
                  <Select value={sc.distanceUnit} label="Unit" onChange={(e) => updateSpatialCondition(sc.id, { distanceUnit: e.target.value })} sx={selectSx}>
                    <MenuItem value="meters">Meters</MenuItem>
                    <MenuItem value="kilometers">Kilometers</MenuItem>
                    <MenuItem value="feet">Feet</MenuItem>
                    <MenuItem value="miles">Miles</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            )}
          </Box>
        </Paper>
      ))}
      {spatialConditions.length === 0 && (
        <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic', textAlign: 'center', py: 2 }}>
          No spatial conditions. Click "Add Spatial Filter" to add one.
        </Typography>
      )}
    </Box>
  );

  const renderFunctionConditions = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="subtitle2" sx={{ color: '#7c3aed', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Brackets size={16} /> Function Conditions
        </Typography>
        <Button size="small" startIcon={<Plus size={14} />} onClick={addFunctionCall} sx={{ textTransform: 'none', color: '#7c3aed', fontSize: 12 }}>
          Add Function
        </Button>
      </Box>

      {/* Function reference */}
      <Paper sx={{ bgcolor: '#0d0d0d', border: '1px solid #1a1a1a', p: 2, borderRadius: 1, maxHeight: 200, overflow: 'auto' }}>
        <Typography variant="caption" sx={{ color: '#888', mb: 1, display: 'block' }}>Available Functions (click to add):</Typography>
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {cqlFunctions.map((fn) => (
            <Tooltip key={fn.name} title={`${fn.description} | Args: ${fn.args}`}>
              <Chip
                label={fn.name}
                size="small"
                onClick={() => {
                  if (functionCalls.length === 0) {
                    setFunctionCalls([{
                      id: nextId(),
                      functionName: fn.name,
                      args: fn.args,
                      operator: '=',
                      compareValue: "'value'",
                      logicalOp: 'AND',
                    }]);
                  } else {
                    const last = functionCalls[functionCalls.length - 1];
                    updateFunctionCall(last.id, { functionName: fn.name, args: fn.args });
                  }
                }}
                sx={{ bgcolor: '#1a1a1a', color: '#a5b4fc', border: '1px solid #292929', '&:hover': { bgcolor: '#252525', borderColor: '#7c3aed' }, cursor: 'pointer', fontSize: 10, height: 24 }}
              />
            </Tooltip>
          ))}
        </Box>
      </Paper>

      {functionCalls.map((fc, idx) => (
        <Paper key={fc.id} sx={{ bgcolor: '#1a1a1a', border: '1px solid #292929', p: 2, borderRadius: 1.5 }}>
          {idx > 0 && (
            <Box sx={{ mb: 1.5 }}>
              <FormControl size="small" sx={{ minWidth: 100 }}>
                <Select value={fc.logicalOp} onChange={(e) => updateFunctionCall(fc.id, { logicalOp: e.target.value as LogicalOperator })} sx={selectSx}>
                  <MenuItem value="AND">AND</MenuItem>
                  <MenuItem value="OR">OR</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <TextField
              size="small"
              label="Function"
              value={fc.functionName}
              onChange={(e) => updateFunctionCall(fc.id, { functionName: e.target.value })}
              sx={{ ...textFieldSx, minWidth: 140 }}
            />
            <TextField
              size="small"
              label="Arguments"
              value={fc.args}
              onChange={(e) => updateFunctionCall(fc.id, { args: e.target.value })}
              sx={{ ...textFieldSx, flex: 1, minWidth: 140 }}
            />
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel sx={{ color: '#888' }}>Op</InputLabel>
              <Select value={fc.operator} label="Op" onChange={(e) => updateFunctionCall(fc.id, { operator: e.target.value as ComparisonOperator })} sx={selectSx}>
                {comparisonOperators.map((op) => (
                  <MenuItem key={op} value={op}>{op}</MenuItem>
                ))}
              </Select>
            </FormControl>
            {!['IS NULL', 'IS NOT NULL'].includes(fc.operator) && (
              <TextField
                size="small"
                label="Compare Value"
                value={fc.compareValue}
                onChange={(e) => updateFunctionCall(fc.id, { compareValue: e.target.value })}
                sx={{ ...textFieldSx, minWidth: 120 }}
              />
            )}
            <IconButton size="small" onClick={() => removeFunctionCall(fc.id)} sx={{ color: '#f87171', mt: 0.5 }}>
              <Trash2 size={16} />
            </IconButton>
          </Box>
        </Paper>
      ))}
      {functionCalls.length === 0 && (
        <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic', textAlign: 'center', py: 2 }}>
          No function conditions. Click "Add Function" or click a function name above.
        </Typography>
      )}
    </Box>
  );

  return (
    <Box sx={{ bgcolor: '#0a0a0a', minHeight: '100vh', color: 'grey.300', p: 3, pt: 7 }}>
      <Link to="/" style={{ position: 'fixed', top: 12, left: 12, zIndex: 50, display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', backgroundColor: 'rgba(30,30,30,0.9)', color: '#ccc', borderRadius: 8, textDecoration: 'none', fontSize: 14, border: '1px solid #333' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        Home
      </Link>

      <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Filter size={28} color="#7c3aed" />
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#e2e8f0' }}>
            CQL Filter Builder
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: 'grey.500', mb: 3 }}>
          Visual query builder for OGC CQL/ECQL filters used in GeoServer WMS/WFS requests.
        </Typography>

        {/* Presets */}
        <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 3, borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ color: '#7c3aed', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Zap size={16} /> Example Presets
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {[
              { key: 'attribute-filter', label: 'Filter by Attribute' },
              { key: 'spatial-intersection', label: 'Spatial Intersection' },
              { key: 'combined', label: 'Attribute + Spatial' },
              { key: 'date-range', label: 'Date Range Filter' },
            ].map((p) => (
              <Chip key={p.key} label={p.label} size="small" onClick={() => applyPreset(p.key)} sx={{ bgcolor: '#1a1a1a', color: '#ccc', border: '1px solid #333', '&:hover': { bgcolor: '#252525', borderColor: '#7c3aed' }, cursor: 'pointer' }} />
            ))}
          </Box>
        </Paper>

        {/* Group operator selector */}
        {(conditions.length > 0 && (spatialConditions.length > 0 || functionCalls.length > 0)) || (spatialConditions.length > 0 && functionCalls.length > 0) ? (
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 3, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ color: '#888' }}>Join groups with:</Typography>
            <Box sx={{ display: 'flex', gap: 0.75 }}>
              {(['AND', 'OR'] as LogicalOperator[]).map((op) => (
                <Chip
                  key={op}
                  label={op}
                  size="small"
                  onClick={() => setGroupOperator(op)}
                  sx={{
                    bgcolor: groupOperator === op ? '#7c3aed' : '#1a1a1a',
                    color: groupOperator === op ? '#fff' : '#aaa',
                    border: `1px solid ${groupOperator === op ? '#7c3aed' : '#333'}`,
                    cursor: 'pointer',
                    fontWeight: groupOperator === op ? 600 : 400,
                  }}
                />
              ))}
            </Box>
          </Paper>
        ) : null}

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3 }}>
          {/* Left: Query Builder */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Paper sx={{ bgcolor: '#111', border: '1px solid #222', borderRadius: 2, overflow: 'hidden' }}>
              <Tabs
                value={viewTab}
                onChange={(_, v) => setViewTab(v)}
                sx={{
                  bgcolor: '#0d0d0d',
                  borderBottom: '1px solid #222',
                  '& .MuiTab-root': { color: '#888', textTransform: 'none', minHeight: 44, fontSize: 13 },
                  '& .Mui-selected': { color: '#7c3aed !important' },
                  '& .MuiTabs-indicator': { bgcolor: '#7c3aed' },
                }}
              >
                <Tab value="attribute" icon={<Filter size={14} />} iconPosition="start" label={`Attributes (${conditions.length})`} />
                <Tab value="spatial" icon={<Globe size={14} />} iconPosition="start" label={`Spatial (${spatialConditions.length})`} />
                <Tab value="function" icon={<Brackets size={14} />} iconPosition="start" label={`Functions (${functionCalls.length})`} />
              </Tabs>
              <Box sx={{ p: 2.5 }}>
                {viewTab === 'attribute' && renderAttributeConditions()}
                {viewTab === 'spatial' && renderSpatialConditions()}
                {viewTab === 'function' && renderFunctionConditions()}
              </Box>
            </Paper>
          </Box>

          {/* Right: Output */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, position: 'sticky', top: 16, maxHeight: 'calc(100vh - 32px)' }}>
            {/* Validation */}
            <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ color: '#7c3aed', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                {validation.valid ? <CheckCircle2 size={16} color="#4ade80" /> : <AlertCircle size={16} color="#f87171" />}
                Validation
              </Typography>
              {validation.valid && validation.warnings.length === 0 && (
                <Typography variant="body2" sx={{ color: '#4ade80' }}>CQL filter is valid.</Typography>
              )}
              {validation.errors.map((err, i) => (
                <Alert key={`e${i}`} severity="error" sx={{ mb: 0.5, bgcolor: 'rgba(248,113,113,0.1)', color: '#f87171', '& .MuiAlert-icon': { color: '#f87171' }, border: '1px solid rgba(248,113,113,0.2)' }}>
                  {err}
                </Alert>
              ))}
              {validation.warnings.map((warn, i) => (
                <Alert key={`w${i}`} severity="warning" sx={{ mb: 0.5, bgcolor: 'rgba(250,204,21,0.08)', color: '#fbbf24', '& .MuiAlert-icon': { color: '#fbbf24' }, border: '1px solid rgba(250,204,21,0.15)' }}>
                  {warn}
                </Alert>
              ))}
            </Paper>

            {/* Generated CQL */}
            <Paper sx={{ bgcolor: '#111', border: '1px solid #222', borderRadius: 2, overflow: 'hidden' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderBottom: '1px solid #222', bgcolor: '#0d0d0d' }}>
                <Typography variant="subtitle2" sx={{ color: '#7c3aed', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Code size={16} /> Generated CQL Filter
                </Typography>
                <Tooltip title={copied ? 'Copied!' : 'Copy CQL'}>
                  <IconButton size="small" onClick={() => handleCopy(false)} sx={{ color: copied ? '#4ade80' : '#888' }}>
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                  </IconButton>
                </Tooltip>
              </Box>
              <pre style={{
                margin: 0,
                padding: 16,
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
                fontSize: 13,
                lineHeight: 1.6,
                color: '#a5f3c4',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                backgroundColor: '#0a0f0a',
                minHeight: 60,
              }}>
                <code>{generatedCql}</code>
              </pre>
            </Paper>

            {/* URL-encoded */}
            <Paper sx={{ bgcolor: '#111', border: '1px solid #222', borderRadius: 2, overflow: 'hidden' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderBottom: '1px solid #222', bgcolor: '#0d0d0d' }}>
                <Typography variant="subtitle2" sx={{ color: '#7c3aed', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Link2 size={16} /> URL-Encoded (for WMS/WFS)
                </Typography>
                <Tooltip title={copiedEncoded ? 'Copied!' : 'Copy URL-encoded'}>
                  <IconButton size="small" onClick={() => handleCopy(true)} sx={{ color: copiedEncoded ? '#4ade80' : '#888' }}>
                    {copiedEncoded ? <Check size={18} /> : <Copy size={18} />}
                  </IconButton>
                </Tooltip>
              </Box>
              <pre style={{
                margin: 0,
                padding: 16,
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
                fontSize: 11,
                lineHeight: 1.5,
                color: '#fbbf24',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                backgroundColor: '#0a0a05',
                maxHeight: 120,
                overflow: 'auto',
              }}>
                <code>CQL_FILTER={urlEncodedCql}</code>
              </pre>
            </Paper>

            {/* Usage example */}
            <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ color: '#7c3aed', mb: 1 }}>Usage Example</Typography>
              <pre style={{
                margin: 0,
                padding: 12,
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
                fontSize: 10.5,
                lineHeight: 1.5,
                color: '#94a3b8',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                backgroundColor: '#0d0d0d',
                borderRadius: 4,
              }}>
                <code>{`# WMS GetMap with CQL filter:
/geoserver/wms?service=WMS&version=1.1.1&request=GetMap&layers=workspace:layer&CQL_FILTER=${urlEncodedCql}&bbox=-180,-90,180,90&width=800&height=600&srs=EPSG:4326&format=image/png

# WFS GetFeature with CQL filter:
/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeNames=workspace:layer&CQL_FILTER=${urlEncodedCql}&outputFormat=application/json`}</code>
              </pre>
            </Paper>
          </Box>
        </Box>
      </Box>

      <Snackbar open={snackOpen} autoHideDuration={2500} onClose={() => setSnackOpen(false)} message={snackMsg} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
    </Box>
  );
}
