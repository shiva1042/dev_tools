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
  Slider,
  Divider,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Copy,
  Check,
  Plus,
  Trash2,
  Download,
  Paintbrush,
  Circle,
  Minus,
  Square,
  Triangle,
  Star,
  MapPin,
  Type,
  Zap,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';

type GeometryType = 'point' | 'line' | 'polygon' | 'raster';
type PointShape = 'circle' | 'square' | 'triangle' | 'star' | 'cross';
type LineCap = 'butt' | 'round' | 'square';
type LineJoin = 'mitre' | 'round' | 'bevel';
type DashPattern = 'solid' | 'dashed' | 'dotted' | 'dashdot';
type RasterColorMapType = 'ramp' | 'intervals' | 'values';
type LabelPlacement = 'point' | 'line';

interface PointStyle {
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  size: number;
  shape: PointShape;
  rotation: number;
  opacity: number;
}

interface LineStyle {
  strokeColor: string;
  strokeWidth: number;
  dashPattern: DashPattern;
  lineCap: LineCap;
  lineJoin: LineJoin;
  opacity: number;
}

interface PolygonStyle {
  fillColor: string;
  fillOpacity: number;
  strokeColor: string;
  strokeWidth: number;
  patternFill: boolean;
  patternType: string;
  opacity: number;
}

interface ColorMapEntry {
  id: string;
  value: string;
  color: string;
  label: string;
  opacity: string;
}

interface RasterStyle {
  colorMapType: RasterColorMapType;
  entries: ColorMapEntry[];
  opacity: number;
}

interface LabelConfig {
  enabled: boolean;
  fieldName: string;
  fontFamily: string;
  fontSize: number;
  fontColor: string;
  fontWeight: string;
  haloColor: string;
  haloRadius: number;
  placement: LabelPlacement;
  followLine: boolean;
  maxDisplacement: number;
  repeat: number;
}

interface Rule {
  id: string;
  name: string;
  title: string;
  filterCql: string;
  minScaleDenominator: string;
  maxScaleDenominator: string;
  expanded: boolean;
}

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

let idCounter = 1;
const nextId = () => String(++idCounter);

const dashPatternMap: Record<DashPattern, string> = {
  solid: '',
  dashed: '10 4',
  dotted: '2 4',
  dashdot: '10 4 2 4',
};

export default function SldStyleGenerator() {
  const [geometryType, setGeometryType] = useState<GeometryType>('point');
  const [copied, setCopied] = useState(false);
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');
  const [styleName, setStyleName] = useState('my_style');
  const [styleTitle, setStyleTitle] = useState('My Custom Style');

  // Point style
  const [pointStyle, setPointStyle] = useState<PointStyle>({
    fillColor: '#ff4444',
    strokeColor: '#880000',
    strokeWidth: 1,
    size: 8,
    shape: 'circle',
    rotation: 0,
    opacity: 1,
  });

  // Line style
  const [lineStyle, setLineStyle] = useState<LineStyle>({
    strokeColor: '#3388ff',
    strokeWidth: 2,
    dashPattern: 'solid',
    lineCap: 'round',
    lineJoin: 'round',
    opacity: 1,
  });

  // Polygon style
  const [polygonStyle, setPolygonStyle] = useState<PolygonStyle>({
    fillColor: '#44aa88',
    fillOpacity: 0.7,
    strokeColor: '#226644',
    strokeWidth: 1,
    patternFill: false,
    patternType: 'hatching',
    opacity: 1,
  });

  // Raster style
  const [rasterStyle, setRasterStyle] = useState<RasterStyle>({
    colorMapType: 'ramp',
    entries: [
      { id: '1', value: '0', color: '#000080', label: 'Low', opacity: '1' },
      { id: '2', value: '50', color: '#00ff00', label: 'Medium', opacity: '1' },
      { id: '3', value: '100', color: '#ff0000', label: 'High', opacity: '1' },
    ],
    opacity: 1,
  });

  // Rules
  const [rules, setRules] = useState<Rule[]>([
    { id: '1', name: 'default', title: 'Default Rule', filterCql: '', minScaleDenominator: '', maxScaleDenominator: '', expanded: true },
  ]);

  // Label config
  const [labelConfig, setLabelConfig] = useState<LabelConfig>({
    enabled: false,
    fieldName: 'name',
    fontFamily: 'Arial',
    fontSize: 12,
    fontColor: '#333333',
    fontWeight: 'normal',
    haloColor: '#ffffff',
    haloRadius: 2,
    placement: 'point',
    followLine: false,
    maxDisplacement: 50,
    repeat: 0,
  });

  const addRule = () => {
    const id = nextId();
    setRules([...rules, { id, name: `rule_${id}`, title: `Rule ${id}`, filterCql: '', minScaleDenominator: '', maxScaleDenominator: '', expanded: true }]);
  };

  const removeRule = (id: string) => {
    if (rules.length > 1) setRules(rules.filter((r) => r.id !== id));
  };

  const updateRule = (id: string, updates: Partial<Rule>) => {
    setRules(rules.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  };

  const addColorMapEntry = () => {
    const id = nextId();
    setRasterStyle({
      ...rasterStyle,
      entries: [...rasterStyle.entries, { id, value: '0', color: '#888888', label: 'New', opacity: '1' }],
    });
  };

  const removeColorMapEntry = (id: string) => {
    if (rasterStyle.entries.length > 1) {
      setRasterStyle({ ...rasterStyle, entries: rasterStyle.entries.filter((e) => e.id !== id) });
    }
  };

  const updateColorMapEntry = (id: string, updates: Partial<ColorMapEntry>) => {
    setRasterStyle({
      ...rasterStyle,
      entries: rasterStyle.entries.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    });
  };

  const escapeXml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const generateSymbolizerXml = useCallback((indent: string): string => {
    const lines: string[] = [];
    switch (geometryType) {
      case 'point': {
        lines.push(`${indent}<PointSymbolizer>`);
        lines.push(`${indent}  <Graphic>`);
        lines.push(`${indent}    <Mark>`);
        lines.push(`${indent}      <WellKnownName>${pointStyle.shape}</WellKnownName>`);
        lines.push(`${indent}      <Fill>`);
        lines.push(`${indent}        <CssParameter name="fill">${pointStyle.fillColor}</CssParameter>`);
        lines.push(`${indent}        <CssParameter name="fill-opacity">${pointStyle.opacity}</CssParameter>`);
        lines.push(`${indent}      </Fill>`);
        lines.push(`${indent}      <Stroke>`);
        lines.push(`${indent}        <CssParameter name="stroke">${pointStyle.strokeColor}</CssParameter>`);
        lines.push(`${indent}        <CssParameter name="stroke-width">${pointStyle.strokeWidth}</CssParameter>`);
        lines.push(`${indent}      </Stroke>`);
        lines.push(`${indent}    </Mark>`);
        lines.push(`${indent}    <Size>${pointStyle.size}</Size>`);
        if (pointStyle.rotation !== 0) {
          lines.push(`${indent}    <Rotation>${pointStyle.rotation}</Rotation>`);
        }
        lines.push(`${indent}  </Graphic>`);
        lines.push(`${indent}</PointSymbolizer>`);
        break;
      }
      case 'line': {
        lines.push(`${indent}<LineSymbolizer>`);
        lines.push(`${indent}  <Stroke>`);
        lines.push(`${indent}    <CssParameter name="stroke">${lineStyle.strokeColor}</CssParameter>`);
        lines.push(`${indent}    <CssParameter name="stroke-width">${lineStyle.strokeWidth}</CssParameter>`);
        lines.push(`${indent}    <CssParameter name="stroke-opacity">${lineStyle.opacity}</CssParameter>`);
        lines.push(`${indent}    <CssParameter name="stroke-linecap">${lineStyle.lineCap}</CssParameter>`);
        lines.push(`${indent}    <CssParameter name="stroke-linejoin">${lineStyle.lineJoin}</CssParameter>`);
        if (lineStyle.dashPattern !== 'solid') {
          lines.push(`${indent}    <CssParameter name="stroke-dasharray">${dashPatternMap[lineStyle.dashPattern]}</CssParameter>`);
        }
        lines.push(`${indent}  </Stroke>`);
        lines.push(`${indent}</LineSymbolizer>`);
        break;
      }
      case 'polygon': {
        lines.push(`${indent}<PolygonSymbolizer>`);
        if (polygonStyle.patternFill) {
          lines.push(`${indent}  <Fill>`);
          lines.push(`${indent}    <GraphicFill>`);
          lines.push(`${indent}      <Graphic>`);
          lines.push(`${indent}        <Mark>`);
          lines.push(`${indent}          <WellKnownName>shape://slash</WellKnownName>`);
          lines.push(`${indent}          <Stroke>`);
          lines.push(`${indent}            <CssParameter name="stroke">${polygonStyle.fillColor}</CssParameter>`);
          lines.push(`${indent}            <CssParameter name="stroke-width">1</CssParameter>`);
          lines.push(`${indent}          </Stroke>`);
          lines.push(`${indent}        </Mark>`);
          lines.push(`${indent}        <Size>8</Size>`);
          lines.push(`${indent}      </Graphic>`);
          lines.push(`${indent}    </GraphicFill>`);
          lines.push(`${indent}  </Fill>`);
        } else {
          lines.push(`${indent}  <Fill>`);
          lines.push(`${indent}    <CssParameter name="fill">${polygonStyle.fillColor}</CssParameter>`);
          lines.push(`${indent}    <CssParameter name="fill-opacity">${polygonStyle.fillOpacity}</CssParameter>`);
          lines.push(`${indent}  </Fill>`);
        }
        lines.push(`${indent}  <Stroke>`);
        lines.push(`${indent}    <CssParameter name="stroke">${polygonStyle.strokeColor}</CssParameter>`);
        lines.push(`${indent}    <CssParameter name="stroke-width">${polygonStyle.strokeWidth}</CssParameter>`);
        lines.push(`${indent}  </Stroke>`);
        lines.push(`${indent}</PolygonSymbolizer>`);
        break;
      }
      case 'raster': {
        lines.push(`${indent}<RasterSymbolizer>`);
        lines.push(`${indent}  <Opacity>${rasterStyle.opacity}</Opacity>`);
        lines.push(`${indent}  <ColorMap type="${rasterStyle.colorMapType}">`);
        for (const entry of rasterStyle.entries) {
          lines.push(`${indent}    <ColorMapEntry color="${entry.color}" quantity="${entry.value}" label="${escapeXml(entry.label)}" opacity="${entry.opacity}"/>`);
        }
        lines.push(`${indent}  </ColorMap>`);
        lines.push(`${indent}</RasterSymbolizer>`);
        break;
      }
    }
    return lines.join('\n');
  }, [geometryType, pointStyle, lineStyle, polygonStyle, rasterStyle]);

  const generateLabelXml = useCallback((indent: string): string => {
    if (!labelConfig.enabled) return '';
    const lines: string[] = [];
    lines.push(`${indent}<TextSymbolizer>`);
    lines.push(`${indent}  <Label>`);
    lines.push(`${indent}    <ogc:PropertyName>${escapeXml(labelConfig.fieldName)}</ogc:PropertyName>`);
    lines.push(`${indent}  </Label>`);
    lines.push(`${indent}  <Font>`);
    lines.push(`${indent}    <CssParameter name="font-family">${escapeXml(labelConfig.fontFamily)}</CssParameter>`);
    lines.push(`${indent}    <CssParameter name="font-size">${labelConfig.fontSize}</CssParameter>`);
    lines.push(`${indent}    <CssParameter name="font-weight">${labelConfig.fontWeight}</CssParameter>`);
    lines.push(`${indent}  </Font>`);
    lines.push(`${indent}  <LabelPlacement>`);
    if (labelConfig.placement === 'point') {
      lines.push(`${indent}    <PointPlacement>`);
      lines.push(`${indent}      <AnchorPoint>`);
      lines.push(`${indent}        <AnchorPointX>0.5</AnchorPointX>`);
      lines.push(`${indent}        <AnchorPointY>0.5</AnchorPointY>`);
      lines.push(`${indent}      </AnchorPoint>`);
      lines.push(`${indent}    </PointPlacement>`);
    } else {
      lines.push(`${indent}    <LinePlacement>`);
      if (labelConfig.repeat > 0) {
        lines.push(`${indent}      <Repeat>${labelConfig.repeat}</Repeat>`);
      }
      lines.push(`${indent}    </LinePlacement>`);
    }
    lines.push(`${indent}  </LabelPlacement>`);
    if (labelConfig.haloRadius > 0) {
      lines.push(`${indent}  <Halo>`);
      lines.push(`${indent}    <Radius>${labelConfig.haloRadius}</Radius>`);
      lines.push(`${indent}    <Fill>`);
      lines.push(`${indent}      <CssParameter name="fill">${labelConfig.haloColor}</CssParameter>`);
      lines.push(`${indent}    </Fill>`);
      lines.push(`${indent}  </Halo>`);
    }
    lines.push(`${indent}  <Fill>`);
    lines.push(`${indent}    <CssParameter name="fill">${labelConfig.fontColor}</CssParameter>`);
    lines.push(`${indent}  </Fill>`);
    if (labelConfig.placement === 'line' && labelConfig.followLine) {
      lines.push(`${indent}  <VendorOption name="followLine">true</VendorOption>`);
      lines.push(`${indent}  <VendorOption name="maxAngleDelta">90</VendorOption>`);
    }
    if (labelConfig.maxDisplacement > 0) {
      lines.push(`${indent}  <VendorOption name="maxDisplacement">${labelConfig.maxDisplacement}</VendorOption>`);
    }
    lines.push(`${indent}</TextSymbolizer>`);
    return lines.join('\n');
  }, [labelConfig]);

  const generatedSld = useMemo(() => {
    const lines: string[] = [];
    lines.push('<?xml version="1.0" encoding="UTF-8"?>');
    lines.push('<StyledLayerDescriptor version="1.0.0"');
    lines.push('  xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd"');
    lines.push('  xmlns="http://www.opengis.net/sld"');
    lines.push('  xmlns:ogc="http://www.opengis.net/ogc"');
    lines.push('  xmlns:xlink="http://www.w3.org/1999/xlink"');
    lines.push('  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">');
    lines.push(`  <NamedLayer>`);
    lines.push(`    <Name>${escapeXml(styleName)}</Name>`);
    lines.push(`    <UserStyle>`);
    lines.push(`      <Title>${escapeXml(styleTitle)}</Title>`);
    lines.push(`      <FeatureTypeStyle>`);

    for (const rule of rules) {
      lines.push(`        <Rule>`);
      lines.push(`          <Name>${escapeXml(rule.name)}</Name>`);
      lines.push(`          <Title>${escapeXml(rule.title)}</Title>`);
      if (rule.filterCql.trim()) {
        lines.push(`          <ogc:Filter>`);
        lines.push(`            <!-- CQL: ${escapeXml(rule.filterCql)} -->`);
        // Simple property = value filter generation
        const match = rule.filterCql.match(/^(\w+)\s*=\s*'([^']*)'$/);
        if (match) {
          lines.push(`            <ogc:PropertyIsEqualTo>`);
          lines.push(`              <ogc:PropertyName>${escapeXml(match[1])}</ogc:PropertyName>`);
          lines.push(`              <ogc:Literal>${escapeXml(match[2])}</ogc:Literal>`);
          lines.push(`            </ogc:PropertyIsEqualTo>`);
        } else {
          lines.push(`            <!-- Complex filter - implement as needed -->`);
        }
        lines.push(`          </ogc:Filter>`);
      }
      if (rule.minScaleDenominator) {
        lines.push(`          <MinScaleDenominator>${rule.minScaleDenominator}</MinScaleDenominator>`);
      }
      if (rule.maxScaleDenominator) {
        lines.push(`          <MaxScaleDenominator>${rule.maxScaleDenominator}</MaxScaleDenominator>`);
      }
      lines.push(generateSymbolizerXml('          '));
      const labelXml = generateLabelXml('          ');
      if (labelXml) lines.push(labelXml);
      lines.push(`        </Rule>`);
    }

    lines.push(`      </FeatureTypeStyle>`);
    lines.push(`    </UserStyle>`);
    lines.push(`  </NamedLayer>`);
    lines.push('</StyledLayerDescriptor>');
    return lines.join('\n');
  }, [styleName, styleTitle, rules, geometryType, pointStyle, lineStyle, polygonStyle, rasterStyle, labelConfig, generateSymbolizerXml, generateLabelXml]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedSld);
    setCopied(true);
    setSnackMsg('SLD XML copied to clipboard!');
    setSnackOpen(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([generatedSld], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${styleName}.sld`;
    a.click();
    URL.revokeObjectURL(url);
    setSnackMsg('SLD file downloaded!');
    setSnackOpen(true);
  };

  const applyPreset = (preset: string) => {
    switch (preset) {
      case 'simple-point':
        setGeometryType('point');
        setPointStyle({ fillColor: '#ff4444', strokeColor: '#880000', strokeWidth: 1, size: 8, shape: 'circle', rotation: 0, opacity: 1 });
        setLabelConfig((p) => ({ ...p, enabled: false }));
        setRules([{ id: '1', name: 'default', title: 'Simple Point', filterCql: '', minScaleDenominator: '', maxScaleDenominator: '', expanded: true }]);
        break;
      case 'categorized-polygon':
        setGeometryType('polygon');
        setPolygonStyle({ fillColor: '#3388ff', fillOpacity: 0.6, strokeColor: '#1a4488', strokeWidth: 1, patternFill: false, patternType: 'hatching', opacity: 1 });
        setRules([
          { id: '10', name: 'type_a', title: 'Type A', filterCql: "type = 'A'", minScaleDenominator: '', maxScaleDenominator: '', expanded: true },
          { id: '11', name: 'type_b', title: 'Type B', filterCql: "type = 'B'", minScaleDenominator: '', maxScaleDenominator: '', expanded: false },
        ]);
        break;
      case 'graduated-colors':
        setGeometryType('raster');
        setRasterStyle({
          colorMapType: 'ramp',
          entries: [
            { id: '20', value: '0', color: '#2166ac', label: 'Very Low', opacity: '1' },
            { id: '21', value: '25', color: '#67a9cf', label: 'Low', opacity: '1' },
            { id: '22', value: '50', color: '#fddbc7', label: 'Medium', opacity: '1' },
            { id: '23', value: '75', color: '#ef8a62', label: 'High', opacity: '1' },
            { id: '24', value: '100', color: '#b2182b', label: 'Very High', opacity: '1' },
          ],
          opacity: 1,
        });
        break;
      case 'labeled-roads':
        setGeometryType('line');
        setLineStyle({ strokeColor: '#666666', strokeWidth: 3, dashPattern: 'solid', lineCap: 'round', lineJoin: 'round', opacity: 1 });
        setLabelConfig({
          enabled: true,
          fieldName: 'name',
          fontFamily: 'Arial',
          fontSize: 11,
          fontColor: '#333333',
          fontWeight: 'bold',
          haloColor: '#ffffff',
          haloRadius: 2,
          placement: 'line',
          followLine: true,
          maxDisplacement: 50,
          repeat: 200,
        });
        break;
      case 'heatmap':
        setGeometryType('point');
        setPointStyle({ fillColor: '#ff0000', strokeColor: 'transparent', strokeWidth: 0, size: 20, shape: 'circle', rotation: 0, opacity: 0.4 });
        break;
    }
    setSnackMsg(`Preset applied: ${preset}`);
    setSnackOpen(true);
  };

  const renderPointForm = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <FormControl fullWidth size="small">
        <InputLabel sx={{ color: '#888' }}>Shape</InputLabel>
        <Select value={pointStyle.shape} label="Shape" onChange={(e) => setPointStyle({ ...pointStyle, shape: e.target.value as PointShape })} sx={selectSx}>
          <MenuItem value="circle">Circle</MenuItem>
          <MenuItem value="square">Square</MenuItem>
          <MenuItem value="triangle">Triangle</MenuItem>
          <MenuItem value="star">Star</MenuItem>
          <MenuItem value="cross">Cross</MenuItem>
        </Select>
      </FormControl>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
        <Box>
          <Typography variant="caption" sx={{ color: '#888', mb: 0.5, display: 'block' }}>Fill Color</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <input type="color" value={pointStyle.fillColor} onChange={(e) => setPointStyle({ ...pointStyle, fillColor: e.target.value })} style={{ width: 40, height: 32, border: '1px solid #333', borderRadius: 4, cursor: 'pointer', backgroundColor: '#1a1a1a' }} />
            <TextField size="small" value={pointStyle.fillColor} onChange={(e) => setPointStyle({ ...pointStyle, fillColor: e.target.value })} sx={{ ...textFieldSx, flex: 1 }} />
          </Box>
        </Box>
        <Box>
          <Typography variant="caption" sx={{ color: '#888', mb: 0.5, display: 'block' }}>Stroke Color</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <input type="color" value={pointStyle.strokeColor} onChange={(e) => setPointStyle({ ...pointStyle, strokeColor: e.target.value })} style={{ width: 40, height: 32, border: '1px solid #333', borderRadius: 4, cursor: 'pointer', backgroundColor: '#1a1a1a' }} />
            <TextField size="small" value={pointStyle.strokeColor} onChange={(e) => setPointStyle({ ...pointStyle, strokeColor: e.target.value })} sx={{ ...textFieldSx, flex: 1 }} />
          </Box>
        </Box>
      </Box>
      <Box>
        <Typography variant="caption" sx={{ color: '#888' }}>Size: {pointStyle.size}</Typography>
        <Slider value={pointStyle.size} onChange={(_, v) => setPointStyle({ ...pointStyle, size: v as number })} min={1} max={50} sx={{ color: '#7c3aed' }} />
      </Box>
      <Box>
        <Typography variant="caption" sx={{ color: '#888' }}>Stroke Width: {pointStyle.strokeWidth}</Typography>
        <Slider value={pointStyle.strokeWidth} onChange={(_, v) => setPointStyle({ ...pointStyle, strokeWidth: v as number })} min={0} max={10} step={0.5} sx={{ color: '#7c3aed' }} />
      </Box>
      <Box>
        <Typography variant="caption" sx={{ color: '#888' }}>Rotation: {pointStyle.rotation}deg</Typography>
        <Slider value={pointStyle.rotation} onChange={(_, v) => setPointStyle({ ...pointStyle, rotation: v as number })} min={0} max={360} sx={{ color: '#7c3aed' }} />
      </Box>
      <Box>
        <Typography variant="caption" sx={{ color: '#888' }}>Opacity: {pointStyle.opacity}</Typography>
        <Slider value={pointStyle.opacity} onChange={(_, v) => setPointStyle({ ...pointStyle, opacity: v as number })} min={0} max={1} step={0.05} sx={{ color: '#7c3aed' }} />
      </Box>
    </Box>
  );

  const renderLineForm = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <Box>
        <Typography variant="caption" sx={{ color: '#888', mb: 0.5, display: 'block' }}>Stroke Color</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <input type="color" value={lineStyle.strokeColor} onChange={(e) => setLineStyle({ ...lineStyle, strokeColor: e.target.value })} style={{ width: 40, height: 32, border: '1px solid #333', borderRadius: 4, cursor: 'pointer', backgroundColor: '#1a1a1a' }} />
          <TextField size="small" value={lineStyle.strokeColor} onChange={(e) => setLineStyle({ ...lineStyle, strokeColor: e.target.value })} sx={{ ...textFieldSx, flex: 1 }} />
        </Box>
      </Box>
      <Box>
        <Typography variant="caption" sx={{ color: '#888' }}>Stroke Width: {lineStyle.strokeWidth}</Typography>
        <Slider value={lineStyle.strokeWidth} onChange={(_, v) => setLineStyle({ ...lineStyle, strokeWidth: v as number })} min={0.5} max={20} step={0.5} sx={{ color: '#7c3aed' }} />
      </Box>
      <FormControl fullWidth size="small">
        <InputLabel sx={{ color: '#888' }}>Dash Pattern</InputLabel>
        <Select value={lineStyle.dashPattern} label="Dash Pattern" onChange={(e) => setLineStyle({ ...lineStyle, dashPattern: e.target.value as DashPattern })} sx={selectSx}>
          <MenuItem value="solid">Solid</MenuItem>
          <MenuItem value="dashed">Dashed</MenuItem>
          <MenuItem value="dotted">Dotted</MenuItem>
          <MenuItem value="dashdot">Dash-Dot</MenuItem>
        </Select>
      </FormControl>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
        <FormControl size="small">
          <InputLabel sx={{ color: '#888' }}>Line Cap</InputLabel>
          <Select value={lineStyle.lineCap} label="Line Cap" onChange={(e) => setLineStyle({ ...lineStyle, lineCap: e.target.value as LineCap })} sx={selectSx}>
            <MenuItem value="butt">Butt</MenuItem>
            <MenuItem value="round">Round</MenuItem>
            <MenuItem value="square">Square</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small">
          <InputLabel sx={{ color: '#888' }}>Line Join</InputLabel>
          <Select value={lineStyle.lineJoin} label="Line Join" onChange={(e) => setLineStyle({ ...lineStyle, lineJoin: e.target.value as LineJoin })} sx={selectSx}>
            <MenuItem value="mitre">Mitre</MenuItem>
            <MenuItem value="round">Round</MenuItem>
            <MenuItem value="bevel">Bevel</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Box>
        <Typography variant="caption" sx={{ color: '#888' }}>Opacity: {lineStyle.opacity}</Typography>
        <Slider value={lineStyle.opacity} onChange={(_, v) => setLineStyle({ ...lineStyle, opacity: v as number })} min={0} max={1} step={0.05} sx={{ color: '#7c3aed' }} />
      </Box>
    </Box>
  );

  const renderPolygonForm = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
        <Box>
          <Typography variant="caption" sx={{ color: '#888', mb: 0.5, display: 'block' }}>Fill Color</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <input type="color" value={polygonStyle.fillColor} onChange={(e) => setPolygonStyle({ ...polygonStyle, fillColor: e.target.value })} style={{ width: 40, height: 32, border: '1px solid #333', borderRadius: 4, cursor: 'pointer', backgroundColor: '#1a1a1a' }} />
            <TextField size="small" value={polygonStyle.fillColor} onChange={(e) => setPolygonStyle({ ...polygonStyle, fillColor: e.target.value })} sx={{ ...textFieldSx, flex: 1 }} />
          </Box>
        </Box>
        <Box>
          <Typography variant="caption" sx={{ color: '#888', mb: 0.5, display: 'block' }}>Stroke Color</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <input type="color" value={polygonStyle.strokeColor} onChange={(e) => setPolygonStyle({ ...polygonStyle, strokeColor: e.target.value })} style={{ width: 40, height: 32, border: '1px solid #333', borderRadius: 4, cursor: 'pointer', backgroundColor: '#1a1a1a' }} />
            <TextField size="small" value={polygonStyle.strokeColor} onChange={(e) => setPolygonStyle({ ...polygonStyle, strokeColor: e.target.value })} sx={{ ...textFieldSx, flex: 1 }} />
          </Box>
        </Box>
      </Box>
      <Box>
        <Typography variant="caption" sx={{ color: '#888' }}>Fill Opacity: {polygonStyle.fillOpacity}</Typography>
        <Slider value={polygonStyle.fillOpacity} onChange={(_, v) => setPolygonStyle({ ...polygonStyle, fillOpacity: v as number })} min={0} max={1} step={0.05} sx={{ color: '#7c3aed' }} />
      </Box>
      <Box>
        <Typography variant="caption" sx={{ color: '#888' }}>Stroke Width: {polygonStyle.strokeWidth}</Typography>
        <Slider value={polygonStyle.strokeWidth} onChange={(_, v) => setPolygonStyle({ ...polygonStyle, strokeWidth: v as number })} min={0} max={10} step={0.5} sx={{ color: '#7c3aed' }} />
      </Box>
      <FormControlLabel
        control={<Switch checked={polygonStyle.patternFill} onChange={(e) => setPolygonStyle({ ...polygonStyle, patternFill: e.target.checked })} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#7c3aed' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#7c3aed' } }} />}
        label={<Typography variant="body2" sx={{ color: '#aaa' }}>Pattern Fill (hatching)</Typography>}
      />
    </Box>
  );

  const renderRasterForm = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <FormControl fullWidth size="small">
        <InputLabel sx={{ color: '#888' }}>Color Map Type</InputLabel>
        <Select value={rasterStyle.colorMapType} label="Color Map Type" onChange={(e) => setRasterStyle({ ...rasterStyle, colorMapType: e.target.value as RasterColorMapType })} sx={selectSx}>
          <MenuItem value="ramp">Ramp (gradient)</MenuItem>
          <MenuItem value="intervals">Intervals</MenuItem>
          <MenuItem value="values">Values (exact)</MenuItem>
        </Select>
      </FormControl>
      <Box>
        <Typography variant="caption" sx={{ color: '#888' }}>Opacity: {rasterStyle.opacity}</Typography>
        <Slider value={rasterStyle.opacity} onChange={(_, v) => setRasterStyle({ ...rasterStyle, opacity: v as number })} min={0} max={1} step={0.05} sx={{ color: '#7c3aed' }} />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="subtitle2" sx={{ color: '#aaa' }}>Color Map Entries</Typography>
        <Button size="small" startIcon={<Plus size={14} />} onClick={addColorMapEntry} sx={{ textTransform: 'none', color: '#7c3aed', fontSize: 12 }}>Add Entry</Button>
      </Box>
      {rasterStyle.entries.map((entry) => (
        <Box key={entry.id} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <input type="color" value={entry.color} onChange={(e) => updateColorMapEntry(entry.id, { color: e.target.value })} style={{ width: 36, height: 30, border: '1px solid #333', borderRadius: 4, cursor: 'pointer', backgroundColor: '#1a1a1a' }} />
          <TextField size="small" label="Value" value={entry.value} onChange={(e) => updateColorMapEntry(entry.id, { value: e.target.value })} sx={{ ...textFieldSx, flex: 1 }} />
          <TextField size="small" label="Label" value={entry.label} onChange={(e) => updateColorMapEntry(entry.id, { label: e.target.value })} sx={{ ...textFieldSx, flex: 1 }} />
          <TextField size="small" label="Opacity" value={entry.opacity} onChange={(e) => updateColorMapEntry(entry.id, { opacity: e.target.value })} sx={{ ...textFieldSx, width: 80 }} />
          <IconButton size="small" onClick={() => removeColorMapEntry(entry.id)} sx={{ color: '#f87171' }}><Trash2 size={14} /></IconButton>
        </Box>
      ))}
    </Box>
  );

  const renderStyleForm = () => {
    switch (geometryType) {
      case 'point': return renderPointForm();
      case 'line': return renderLineForm();
      case 'polygon': return renderPolygonForm();
      case 'raster': return renderRasterForm();
    }
  };

  return (
    <Box sx={{ bgcolor: '#0a0a0a', minHeight: '100vh', color: 'grey.300', p: 3, pt: 7 }}>
      <Link to="/" style={{ position: 'fixed', top: 12, left: 12, zIndex: 50, display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', backgroundColor: 'rgba(30,30,30,0.9)', color: '#ccc', borderRadius: 8, textDecoration: 'none', fontSize: 14, border: '1px solid #333' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        Home
      </Link>

      <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Paintbrush size={28} color="#7c3aed" />
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#e2e8f0' }}>
            SLD Style Generator
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: 'grey.500', mb: 3 }}>
          Visual builder for Styled Layer Descriptor (SLD) XML files for GeoServer and OGC-compliant map servers.
        </Typography>

        {/* Presets */}
        <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 3, borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ color: '#7c3aed', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Zap size={16} /> Presets
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {[
              { key: 'simple-point', label: 'Simple Point' },
              { key: 'categorized-polygon', label: 'Categorized Polygon' },
              { key: 'graduated-colors', label: 'Graduated Colors' },
              { key: 'labeled-roads', label: 'Labeled Roads' },
              { key: 'heatmap', label: 'Heatmap Style' },
            ].map((p) => (
              <Chip key={p.key} label={p.label} size="small" onClick={() => applyPreset(p.key)} sx={{ bgcolor: '#1a1a1a', color: '#ccc', border: '1px solid #333', '&:hover': { bgcolor: '#252525', borderColor: '#7c3aed' }, cursor: 'pointer' }} />
            ))}
          </Box>
        </Paper>

        {/* Style metadata */}
        <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <TextField fullWidth size="small" label="Style Name" value={styleName} onChange={(e) => setStyleName(e.target.value)} sx={textFieldSx} />
            <TextField fullWidth size="small" label="Style Title" value={styleTitle} onChange={(e) => setStyleTitle(e.target.value)} sx={textFieldSx} />
          </Box>
        </Paper>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3 }}>
          {/* Left: Configuration */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Geometry Type */}
            <Paper sx={{ bgcolor: '#111', border: '1px solid #222', borderRadius: 2, overflow: 'hidden' }}>
              <Tabs
                value={geometryType}
                onChange={(_, v) => setGeometryType(v)}
                sx={{
                  bgcolor: '#0d0d0d',
                  borderBottom: '1px solid #222',
                  '& .MuiTab-root': { color: '#888', textTransform: 'none', minHeight: 44, fontSize: 13 },
                  '& .Mui-selected': { color: '#7c3aed !important' },
                  '& .MuiTabs-indicator': { bgcolor: '#7c3aed' },
                }}
              >
                <Tab value="point" icon={<Circle size={14} />} iconPosition="start" label="Point" />
                <Tab value="line" icon={<Minus size={14} />} iconPosition="start" label="Line" />
                <Tab value="polygon" icon={<Square size={14} />} iconPosition="start" label="Polygon" />
                <Tab value="raster" icon={<ImageIcon size={14} />} iconPosition="start" label="Raster" />
              </Tabs>
              <Box sx={{ p: 2.5 }}>
                {renderStyleForm()}
              </Box>
            </Paper>

            {/* Rules */}
            <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2.5, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#7c3aed' }}>Rules</Typography>
                <Button size="small" startIcon={<Plus size={14} />} onClick={addRule} sx={{ textTransform: 'none', color: '#7c3aed', fontSize: 12 }}>Add Rule</Button>
              </Box>
              {rules.map((rule) => (
                <Paper key={rule.id} sx={{ bgcolor: '#1a1a1a', border: '1px solid #292929', p: 2, mb: 1.5, borderRadius: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: rule.expanded ? 1.5 : 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton size="small" onClick={() => updateRule(rule.id, { expanded: !rule.expanded })} sx={{ color: '#888' }}>
                        {rule.expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </IconButton>
                      <Typography variant="body2" sx={{ color: '#ccc' }}>{rule.name || 'Unnamed Rule'}</Typography>
                    </Box>
                    <IconButton size="small" onClick={() => removeRule(rule.id)} sx={{ color: '#f87171' }} disabled={rules.length <= 1}><Trash2 size={14} /></IconButton>
                  </Box>
                  {rule.expanded && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pl: 4 }}>
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                        <TextField size="small" label="Rule Name" value={rule.name} onChange={(e) => updateRule(rule.id, { name: e.target.value })} sx={textFieldSx} />
                        <TextField size="small" label="Rule Title" value={rule.title} onChange={(e) => updateRule(rule.id, { title: e.target.value })} sx={textFieldSx} />
                      </Box>
                      <TextField size="small" label="CQL Filter (e.g. type = 'road')" value={rule.filterCql} onChange={(e) => updateRule(rule.id, { filterCql: e.target.value })} sx={textFieldSx} />
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                        <TextField size="small" label="Min Scale Denominator" value={rule.minScaleDenominator} onChange={(e) => updateRule(rule.id, { minScaleDenominator: e.target.value })} sx={textFieldSx} />
                        <TextField size="small" label="Max Scale Denominator" value={rule.maxScaleDenominator} onChange={(e) => updateRule(rule.id, { maxScaleDenominator: e.target.value })} sx={textFieldSx} />
                      </Box>
                    </Box>
                  )}
                </Paper>
              ))}
            </Paper>

            {/* Label Configuration */}
            <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2.5, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#7c3aed', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Type size={16} /> Labels
                </Typography>
                <Switch
                  checked={labelConfig.enabled}
                  onChange={(e) => setLabelConfig({ ...labelConfig, enabled: e.target.checked })}
                  sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#7c3aed' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#7c3aed' } }}
                />
              </Box>
              {labelConfig.enabled && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField fullWidth size="small" label="Field Name" value={labelConfig.fieldName} onChange={(e) => setLabelConfig({ ...labelConfig, fieldName: e.target.value })} sx={textFieldSx} />
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <TextField size="small" label="Font Family" value={labelConfig.fontFamily} onChange={(e) => setLabelConfig({ ...labelConfig, fontFamily: e.target.value })} sx={textFieldSx} />
                    <TextField size="small" label="Font Size" type="number" value={labelConfig.fontSize} onChange={(e) => setLabelConfig({ ...labelConfig, fontSize: parseInt(e.target.value) || 12 })} sx={textFieldSx} />
                  </Box>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#888', mb: 0.5, display: 'block' }}>Font Color</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <input type="color" value={labelConfig.fontColor} onChange={(e) => setLabelConfig({ ...labelConfig, fontColor: e.target.value })} style={{ width: 36, height: 30, border: '1px solid #333', borderRadius: 4, cursor: 'pointer', backgroundColor: '#1a1a1a' }} />
                        <TextField size="small" value={labelConfig.fontColor} onChange={(e) => setLabelConfig({ ...labelConfig, fontColor: e.target.value })} sx={{ ...textFieldSx, flex: 1 }} />
                      </Box>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#888', mb: 0.5, display: 'block' }}>Halo Color</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <input type="color" value={labelConfig.haloColor} onChange={(e) => setLabelConfig({ ...labelConfig, haloColor: e.target.value })} style={{ width: 36, height: 30, border: '1px solid #333', borderRadius: 4, cursor: 'pointer', backgroundColor: '#1a1a1a' }} />
                        <TextField size="small" value={labelConfig.haloColor} onChange={(e) => setLabelConfig({ ...labelConfig, haloColor: e.target.value })} sx={{ ...textFieldSx, flex: 1 }} />
                      </Box>
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#888' }}>Halo Radius: {labelConfig.haloRadius}</Typography>
                    <Slider value={labelConfig.haloRadius} onChange={(_, v) => setLabelConfig({ ...labelConfig, haloRadius: v as number })} min={0} max={10} step={0.5} sx={{ color: '#7c3aed' }} />
                  </Box>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <FormControl size="small">
                      <InputLabel sx={{ color: '#888' }}>Placement</InputLabel>
                      <Select value={labelConfig.placement} label="Placement" onChange={(e) => setLabelConfig({ ...labelConfig, placement: e.target.value as LabelPlacement })} sx={selectSx}>
                        <MenuItem value="point">Point</MenuItem>
                        <MenuItem value="line">Line</MenuItem>
                      </Select>
                    </FormControl>
                    <FormControl size="small">
                      <InputLabel sx={{ color: '#888' }}>Font Weight</InputLabel>
                      <Select value={labelConfig.fontWeight} label="Font Weight" onChange={(e) => setLabelConfig({ ...labelConfig, fontWeight: e.target.value })} sx={selectSx}>
                        <MenuItem value="normal">Normal</MenuItem>
                        <MenuItem value="bold">Bold</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                  {labelConfig.placement === 'line' && (
                    <FormControlLabel
                      control={<Switch checked={labelConfig.followLine} onChange={(e) => setLabelConfig({ ...labelConfig, followLine: e.target.checked })} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#7c3aed' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#7c3aed' } }} />}
                      label={<Typography variant="body2" sx={{ color: '#aaa' }}>Follow Line</Typography>}
                    />
                  )}
                </Box>
              )}
            </Paper>
          </Box>

          {/* Right: SLD Preview */}
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', borderRadius: 2, overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'sticky', top: 16, maxHeight: 'calc(100vh - 32px)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderBottom: '1px solid #222', bgcolor: '#0d0d0d' }}>
              <Typography variant="subtitle2" sx={{ color: '#7c3aed' }}>SLD XML Preview</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Download SLD">
                  <IconButton size="small" onClick={handleDownload} sx={{ color: '#888' }}>
                    <Download size={18} />
                  </IconButton>
                </Tooltip>
                <Tooltip title={copied ? 'Copied!' : 'Copy SLD'}>
                  <IconButton size="small" onClick={handleCopy} sx={{ color: copied ? '#4ade80' : '#888' }}>
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              <pre style={{
                margin: 0,
                padding: 16,
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
                fontSize: 11.5,
                lineHeight: 1.55,
                color: '#93c5fd',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                backgroundColor: '#0a0a10',
              }}>
                <code>{generatedSld}</code>
              </pre>
            </Box>
          </Paper>
        </Box>
      </Box>

      <Snackbar open={snackOpen} autoHideDuration={2500} onClose={() => setSnackOpen(false)} message={snackMsg} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
    </Box>
  );
}
