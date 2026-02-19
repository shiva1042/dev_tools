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
  ExternalLink,
  RotateCcw,
  Globe,
  Layers,
  Map,
  Grid3x3,
  Bookmark,
  Code,
  Lock,
  Unlock,
} from 'lucide-react';
import { Link } from 'react-router-dom';

type ServiceTab = 'WMS' | 'WFS' | 'WCS' | 'WMTS';
type WMSRequest = 'GetMap' | 'GetCapabilities' | 'GetFeatureInfo' | 'GetLegendGraphic';
type WFSRequest = 'GetCapabilities' | 'DescribeFeatureType' | 'GetFeature';
type WCSRequest = 'GetCapabilities' | 'DescribeCoverage' | 'GetCoverage';
type WMTSRequest = 'GetCapabilities' | 'GetTile';

interface Preset {
  name: string;
  service: ServiceTab;
  apply: () => void;
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

const WMS_VERSIONS = ['1.1.0', '1.1.1', '1.3.0'];
const WFS_VERSIONS = ['1.0.0', '1.1.0', '2.0.0'];
const WCS_VERSIONS = ['1.0.0', '1.1.0', '1.1.1', '2.0.0'];
const WMTS_VERSIONS = ['1.0.0'];

const WMS_FORMATS = ['image/png', 'image/jpeg', 'image/gif', 'application/pdf', 'image/png8', 'image/svg+xml'];
const WFS_OUTPUT_FORMATS = ['GML2', 'GML3', 'application/json', 'csv', 'shapefile', 'application/gml+xml; version=3.2'];
const WCS_FORMATS = ['image/tiff', 'image/png', 'image/jpeg', 'application/netcdf', 'image/geotiff'];
const INFO_FORMATS = ['text/html', 'application/json', 'text/xml', 'text/plain', 'application/vnd.ogc.gml'];
const WMTS_FORMATS = ['image/png', 'image/jpeg', 'image/gif', 'image/png8'];

const COMMON_SRS = [
  'EPSG:4326', 'EPSG:3857', 'EPSG:3005', 'EPSG:32610', 'EPSG:32611',
  'EPSG:2193', 'EPSG:27700', 'EPSG:25832', 'EPSG:25833', 'CRS:84',
];

export default function WmsWfsBuilder() {
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [serviceTab, setServiceTab] = useState<ServiceTab>('WMS');
  const [baseUrl, setBaseUrl] = useState('https://example.com/geoserver/ows');
  const [urlEncoded, setUrlEncoded] = useState(true);

  // WMS state
  const [wmsRequest, setWmsRequest] = useState<WMSRequest>('GetMap');
  const [wmsVersion, setWmsVersion] = useState('1.3.0');
  const [wmsLayers, setWmsLayers] = useState('workspace:layer_name');
  const [wmsStyles, setWmsStyles] = useState('');
  const [wmsSrs, setWmsSrs] = useState('EPSG:4326');
  const [wmsBboxMinX, setWmsBboxMinX] = useState('-180');
  const [wmsBboxMinY, setWmsBboxMinY] = useState('-90');
  const [wmsBboxMaxX, setWmsBboxMaxX] = useState('180');
  const [wmsBboxMaxY, setWmsBboxMaxY] = useState('90');
  const [wmsWidth, setWmsWidth] = useState('768');
  const [wmsHeight, setWmsHeight] = useState('512');
  const [wmsFormat, setWmsFormat] = useState('image/png');
  const [wmsTransparent, setWmsTransparent] = useState(true);
  const [wmsBgColor, setWmsBgColor] = useState('0xFFFFFF');
  // GetFeatureInfo
  const [wmsQueryLayers, setWmsQueryLayers] = useState('workspace:layer_name');
  const [wmsInfoFormat, setWmsInfoFormat] = useState('application/json');
  const [wmsFeatureCount, setWmsFeatureCount] = useState('10');
  const [wmsX, setWmsX] = useState('384');
  const [wmsY, setWmsY] = useState('256');
  // GetLegendGraphic
  const [wmsLegendLayer, setWmsLegendLayer] = useState('workspace:layer_name');
  const [wmsLegendStyle, setWmsLegendStyle] = useState('');
  const [wmsLegendFormat, setWmsLegendFormat] = useState('image/png');
  const [wmsLegendWidth, setWmsLegendWidth] = useState('20');
  const [wmsLegendHeight, setWmsLegendHeight] = useState('20');
  const [wmsLegendOptions, setWmsLegendOptions] = useState('fontSize:12;fontAntiAliasing:true');

  // WFS state
  const [wfsRequest, setWfsRequest] = useState<WFSRequest>('GetFeature');
  const [wfsVersion, setWfsVersion] = useState('2.0.0');
  const [wfsTypeName, setWfsTypeName] = useState('workspace:layer_name');
  const [wfsMaxFeatures, setWfsMaxFeatures] = useState('100');
  const [wfsStartIndex, setWfsStartIndex] = useState('0');
  const [wfsOutputFormat, setWfsOutputFormat] = useState('application/json');
  const [wfsCqlFilter, setWfsCqlFilter] = useState('');
  const [wfsSortBy, setWfsSortBy] = useState('');
  const [wfsPropertyName, setWfsPropertyName] = useState('');
  const [wfsSrsName, setWfsSrsName] = useState('EPSG:4326');

  // WCS state
  const [wcsRequest, setWcsRequest] = useState<WCSRequest>('GetCoverage');
  const [wcsVersion, setWcsVersion] = useState('2.0.0');
  const [wcsCoverageId, setWcsCoverageId] = useState('workspace__coverage_name');
  const [wcsFormat, setWcsFormat] = useState('image/tiff');
  const [wcsSubsetLat, setWcsSubsetLat] = useState('40,50');
  const [wcsSubsetLon, setWcsSubsetLon] = useState('-130,-120');
  const [wcsScaleFactor, setWcsScaleFactor] = useState('');

  // WMTS state
  const [wmtsRequest, setWmtsRequest] = useState<WMTSRequest>('GetTile');
  const [wmtsVersion, setWmtsVersion] = useState('1.0.0');
  const [wmtsLayer, setWmtsLayer] = useState('workspace:layer_name');
  const [wmtsStyle, setWmtsStyle] = useState('default');
  const [wmtsTileMatrixSet, setWmtsTileMatrixSet] = useState('EPSG:4326');
  const [wmtsTileMatrix, setWmtsTileMatrix] = useState('EPSG:4326:10');
  const [wmtsTileRow, setWmtsTileRow] = useState('512');
  const [wmtsTileCol, setWmtsTileCol] = useState('1024');
  const [wmtsFormat, setWmtsFormat] = useState('image/png');

  const generatedUrl = useMemo(() => {
    const params: Record<string, string> = {};
    let url = baseUrl;

    if (!url.includes('?')) {
      url += '?';
    } else if (!url.endsWith('&') && !url.endsWith('?')) {
      url += '&';
    }

    switch (serviceTab) {
      case 'WMS': {
        params['SERVICE'] = 'WMS';
        params['VERSION'] = wmsVersion;
        params['REQUEST'] = wmsRequest;

        if (wmsRequest === 'GetMap') {
          params['LAYERS'] = wmsLayers;
          if (wmsStyles) params['STYLES'] = wmsStyles;
          else params['STYLES'] = '';
          const srsKey = wmsVersion === '1.3.0' ? 'CRS' : 'SRS';
          params[srsKey] = wmsSrs;
          const bbox = wmsVersion === '1.3.0' && wmsSrs === 'EPSG:4326'
            ? `${wmsBboxMinY},${wmsBboxMinX},${wmsBboxMaxY},${wmsBboxMaxX}`
            : `${wmsBboxMinX},${wmsBboxMinY},${wmsBboxMaxX},${wmsBboxMaxY}`;
          params['BBOX'] = bbox;
          params['WIDTH'] = wmsWidth;
          params['HEIGHT'] = wmsHeight;
          params['FORMAT'] = wmsFormat;
          if (wmsTransparent) params['TRANSPARENT'] = 'TRUE';
          if (wmsBgColor && wmsBgColor !== '0xFFFFFF') params['BGCOLOR'] = wmsBgColor;
        } else if (wmsRequest === 'GetFeatureInfo') {
          params['LAYERS'] = wmsLayers;
          params['QUERY_LAYERS'] = wmsQueryLayers;
          const srsKey = wmsVersion === '1.3.0' ? 'CRS' : 'SRS';
          params[srsKey] = wmsSrs;
          const bbox = wmsVersion === '1.3.0' && wmsSrs === 'EPSG:4326'
            ? `${wmsBboxMinY},${wmsBboxMinX},${wmsBboxMaxY},${wmsBboxMaxX}`
            : `${wmsBboxMinX},${wmsBboxMinY},${wmsBboxMaxX},${wmsBboxMaxY}`;
          params['BBOX'] = bbox;
          params['WIDTH'] = wmsWidth;
          params['HEIGHT'] = wmsHeight;
          params['INFO_FORMAT'] = wmsInfoFormat;
          params['FEATURE_COUNT'] = wmsFeatureCount;
          const xKey = wmsVersion === '1.3.0' ? 'I' : 'X';
          const yKey = wmsVersion === '1.3.0' ? 'J' : 'Y';
          params[xKey] = wmsX;
          params[yKey] = wmsY;
        } else if (wmsRequest === 'GetLegendGraphic') {
          params['LAYER'] = wmsLegendLayer;
          if (wmsLegendStyle) params['STYLE'] = wmsLegendStyle;
          params['FORMAT'] = wmsLegendFormat;
          if (wmsLegendWidth) params['WIDTH'] = wmsLegendWidth;
          if (wmsLegendHeight) params['HEIGHT'] = wmsLegendHeight;
          if (wmsLegendOptions) params['LEGEND_OPTIONS'] = wmsLegendOptions;
        }
        break;
      }
      case 'WFS': {
        params['SERVICE'] = 'WFS';
        params['VERSION'] = wfsVersion;
        params['REQUEST'] = wfsRequest;

        if (wfsRequest === 'DescribeFeatureType') {
          params[wfsVersion === '2.0.0' ? 'TYPENAMES' : 'TYPENAME'] = wfsTypeName;
        } else if (wfsRequest === 'GetFeature') {
          params[wfsVersion === '2.0.0' ? 'TYPENAMES' : 'TYPENAME'] = wfsTypeName;
          const maxKey = wfsVersion === '2.0.0' ? 'COUNT' : 'MAXFEATURES';
          if (wfsMaxFeatures) params[maxKey] = wfsMaxFeatures;
          if (wfsStartIndex && wfsStartIndex !== '0') params['STARTINDEX'] = wfsStartIndex;
          if (wfsOutputFormat) params['OUTPUTFORMAT'] = wfsOutputFormat;
          if (wfsCqlFilter) params['CQL_FILTER'] = wfsCqlFilter;
          if (wfsSortBy) params['SORTBY'] = wfsSortBy;
          if (wfsPropertyName) params['PROPERTYNAME'] = wfsPropertyName;
          if (wfsSrsName) params['SRSNAME'] = wfsSrsName;
        }
        break;
      }
      case 'WCS': {
        params['SERVICE'] = 'WCS';
        params['VERSION'] = wcsVersion;
        params['REQUEST'] = wcsRequest;

        if (wcsRequest === 'DescribeCoverage') {
          const idKey = wcsVersion === '2.0.0' ? 'COVERAGEID' : 'IDENTIFIERS';
          params[idKey] = wcsCoverageId;
        } else if (wcsRequest === 'GetCoverage') {
          const idKey = wcsVersion === '2.0.0' ? 'COVERAGEID' : 'IDENTIFIER';
          params[idKey] = wcsCoverageId;
          params['FORMAT'] = wcsFormat;
          if (wcsVersion === '2.0.0') {
            if (wcsSubsetLat) params['SUBSET'] = `Lat(${wcsSubsetLat})`;
            if (wcsSubsetLon) {
              const existing = params['SUBSET'] || '';
              params['SUBSET'] = existing ? `${existing}&SUBSET=Long(${wcsSubsetLon})` : `Long(${wcsSubsetLon})`;
            }
            if (wcsScaleFactor) params['SCALEFACTOR'] = wcsScaleFactor;
          } else {
            if (wcsSubsetLat || wcsSubsetLon) {
              const latParts = wcsSubsetLat.split(',');
              const lonParts = wcsSubsetLon.split(',');
              if (latParts.length === 2 && lonParts.length === 2) {
                params['BBOX'] = `${lonParts[0]},${latParts[0]},${lonParts[1]},${latParts[1]}`;
              }
            }
          }
        }
        break;
      }
      case 'WMTS': {
        params['SERVICE'] = 'WMTS';
        params['VERSION'] = wmtsVersion;
        params['REQUEST'] = wmtsRequest;

        if (wmtsRequest === 'GetTile') {
          params['LAYER'] = wmtsLayer;
          params['STYLE'] = wmtsStyle;
          params['TILEMATRIXSET'] = wmtsTileMatrixSet;
          params['TILEMATRIX'] = wmtsTileMatrix;
          params['TILEROW'] = wmtsTileRow;
          params['TILECOL'] = wmtsTileCol;
          params['FORMAT'] = wmtsFormat;
        }
        break;
      }
    }

    // Handle WCS SUBSET specially since it can have multiple values
    if (serviceTab === 'WCS' && wcsRequest === 'GetCoverage' && wcsVersion === '2.0.0') {
      const subsetParts: string[] = [];
      if (wcsSubsetLat) subsetParts.push(`SUBSET=Lat(${wcsSubsetLat})`);
      if (wcsSubsetLon) subsetParts.push(`SUBSET=Long(${wcsSubsetLon})`);

      const otherParams = { ...params };
      delete otherParams['SUBSET'];

      const paramStr = Object.entries(otherParams)
        .map(([k, v]) => urlEncoded ? `${encodeURIComponent(k)}=${encodeURIComponent(v)}` : `${k}=${v}`)
        .join('&');

      const subsetStr = subsetParts
        .map(s => urlEncoded ? s.split('=').map(p => encodeURIComponent(p)).join('=') : s)
        .join('&');

      return url + paramStr + (subsetStr ? '&' + subsetStr : '');
    }

    const paramStr = Object.entries(params)
      .map(([k, v]) => urlEncoded ? `${encodeURIComponent(k)}=${encodeURIComponent(v)}` : `${k}=${v}`)
      .join('&');

    return url + paramStr;
  }, [
    serviceTab, baseUrl, urlEncoded,
    wmsRequest, wmsVersion, wmsLayers, wmsStyles, wmsSrs,
    wmsBboxMinX, wmsBboxMinY, wmsBboxMaxX, wmsBboxMaxY,
    wmsWidth, wmsHeight, wmsFormat, wmsTransparent, wmsBgColor,
    wmsQueryLayers, wmsInfoFormat, wmsFeatureCount, wmsX, wmsY,
    wmsLegendLayer, wmsLegendStyle, wmsLegendFormat, wmsLegendWidth, wmsLegendHeight, wmsLegendOptions,
    wfsRequest, wfsVersion, wfsTypeName, wfsMaxFeatures, wfsStartIndex,
    wfsOutputFormat, wfsCqlFilter, wfsSortBy, wfsPropertyName, wfsSrsName,
    wcsRequest, wcsVersion, wcsCoverageId, wcsFormat, wcsSubsetLat, wcsSubsetLon, wcsScaleFactor,
    wmtsRequest, wmtsVersion, wmtsLayer, wmtsStyle, wmtsTileMatrixSet,
    wmtsTileMatrix, wmtsTileRow, wmtsTileCol, wmtsFormat,
  ]);

  const handleCopy = useCallback(async (text: string, label = 'URL') => {
    await navigator.clipboard.writeText(text);
    setSnackbar({ open: true, message: `${label} copied to clipboard` });
  }, []);

  const resetAll = useCallback(() => {
    setBaseUrl('https://example.com/geoserver/ows');
    setWmsLayers('workspace:layer_name');
    setWmsStyles('');
    setWmsWidth('768');
    setWmsHeight('512');
    setWmsBboxMinX('-180');
    setWmsBboxMinY('-90');
    setWmsBboxMaxX('180');
    setWmsBboxMaxY('90');
  }, []);

  const presets: Preset[] = useMemo(() => [
    {
      name: 'WMS GetMap (PNG)',
      service: 'WMS',
      apply: () => {
        setServiceTab('WMS');
        setWmsRequest('GetMap');
        setWmsFormat('image/png');
        setWmsTransparent(true);
        setWmsWidth('768');
        setWmsHeight('512');
      },
    },
    {
      name: 'WMS GetCapabilities',
      service: 'WMS',
      apply: () => {
        setServiceTab('WMS');
        setWmsRequest('GetCapabilities');
      },
    },
    {
      name: 'WMS Legend Graphic',
      service: 'WMS',
      apply: () => {
        setServiceTab('WMS');
        setWmsRequest('GetLegendGraphic');
        setWmsLegendFormat('image/png');
      },
    },
    {
      name: 'WFS GetFeature (JSON)',
      service: 'WFS',
      apply: () => {
        setServiceTab('WFS');
        setWfsRequest('GetFeature');
        setWfsOutputFormat('application/json');
        setWfsMaxFeatures('100');
      },
    },
    {
      name: 'WFS GetFeature (GML)',
      service: 'WFS',
      apply: () => {
        setServiceTab('WFS');
        setWfsRequest('GetFeature');
        setWfsOutputFormat('GML3');
        setWfsMaxFeatures('50');
      },
    },
    {
      name: 'WFS Filtered Query',
      service: 'WFS',
      apply: () => {
        setServiceTab('WFS');
        setWfsRequest('GetFeature');
        setWfsOutputFormat('application/json');
        setWfsCqlFilter("status = 'active'");
        setWfsMaxFeatures('100');
      },
    },
    {
      name: 'WCS GetCapabilities',
      service: 'WCS',
      apply: () => {
        setServiceTab('WCS');
        setWcsRequest('GetCapabilities');
      },
    },
    {
      name: 'WCS GetCoverage (GeoTIFF)',
      service: 'WCS',
      apply: () => {
        setServiceTab('WCS');
        setWcsRequest('GetCoverage');
        setWcsFormat('image/tiff');
      },
    },
    {
      name: 'WMTS GetCapabilities',
      service: 'WMTS',
      apply: () => {
        setServiceTab('WMTS');
        setWmtsRequest('GetCapabilities');
      },
    },
    {
      name: 'WMTS GetTile',
      service: 'WMTS',
      apply: () => {
        setServiceTab('WMTS');
        setWmtsRequest('GetTile');
      },
    },
  ], []);

  const renderWmsFields = () => {
    if (wmsRequest === 'GetCapabilities') {
      return (
        <Box sx={{ p: 2, color: 'grey.500' }}>
          <Typography variant="body2">GetCapabilities has no additional parameters. The URL will request the service metadata document.</Typography>
        </Box>
      );
    }

    if (wmsRequest === 'GetMap') {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField size="small" label="Layers" value={wmsLayers} onChange={e => setWmsLayers(e.target.value)} fullWidth sx={inputSx} placeholder="workspace:layer1,workspace:layer2" />
            <TextField size="small" label="Styles" value={wmsStyles} onChange={e => setWmsStyles(e.target.value)} sx={{ ...inputSx, width: 200 }} placeholder="style1,style2" />
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel sx={{ color: 'grey.500' }}>{wmsVersion === '1.3.0' ? 'CRS' : 'SRS'}</InputLabel>
              <Select value={wmsSrs} label={wmsVersion === '1.3.0' ? 'CRS' : 'SRS'} onChange={e => setWmsSrs(e.target.value)} sx={selectSx}>
                {COMMON_SRS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField size="small" label="Or type SRS/CRS" value={wmsSrs} onChange={e => setWmsSrs(e.target.value)} sx={{ ...inputSx, flex: 1 }} />
          </Box>
          <Typography variant="caption" sx={{ color: 'grey.500', mt: -1 }}>
            BBOX {wmsVersion === '1.3.0' && wmsSrs === 'EPSG:4326' ? '(axis order: minY,minX,maxY,maxX for 1.3.0 + EPSG:4326)' : '(minX,minY,maxX,maxY)'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField size="small" label="Min X (West)" value={wmsBboxMinX} onChange={e => setWmsBboxMinX(e.target.value)} sx={{ ...inputSx, flex: 1 }} />
            <TextField size="small" label="Min Y (South)" value={wmsBboxMinY} onChange={e => setWmsBboxMinY(e.target.value)} sx={{ ...inputSx, flex: 1 }} />
            <TextField size="small" label="Max X (East)" value={wmsBboxMaxX} onChange={e => setWmsBboxMaxX(e.target.value)} sx={{ ...inputSx, flex: 1 }} />
            <TextField size="small" label="Max Y (North)" value={wmsBboxMaxY} onChange={e => setWmsBboxMaxY(e.target.value)} sx={{ ...inputSx, flex: 1 }} />
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField size="small" label="Width (px)" value={wmsWidth} onChange={e => setWmsWidth(e.target.value)} sx={{ ...inputSx, width: 120 }} />
            <TextField size="small" label="Height (px)" value={wmsHeight} onChange={e => setWmsHeight(e.target.value)} sx={{ ...inputSx, width: 120 }} />
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel sx={{ color: 'grey.500' }}>Format</InputLabel>
              <Select value={wmsFormat} label="Format" onChange={e => setWmsFormat(e.target.value)} sx={selectSx}>
                {WMS_FORMATS.map(f => <MenuItem key={f} value={f}>{f}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControlLabel
              control={<Checkbox checked={wmsTransparent} onChange={e => setWmsTransparent(e.target.checked)} sx={{ color: 'grey.500', '&.Mui-checked': { color: '#90caf9' } }} size="small" />}
              label={<Typography variant="body2" sx={{ color: 'grey.400' }}>Transparent</Typography>}
            />
          </Box>
          <TextField size="small" label="Background Color" value={wmsBgColor} onChange={e => setWmsBgColor(e.target.value)} sx={{ ...inputSx, width: 200 }} placeholder="0xFFFFFF" helperText="Hex color (only when not transparent)" />
        </Box>
      );
    }

    if (wmsRequest === 'GetFeatureInfo') {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField size="small" label="Layers" value={wmsLayers} onChange={e => setWmsLayers(e.target.value)} fullWidth sx={inputSx} />
            <TextField size="small" label="Query Layers" value={wmsQueryLayers} onChange={e => setWmsQueryLayers(e.target.value)} fullWidth sx={inputSx} />
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel sx={{ color: 'grey.500' }}>{wmsVersion === '1.3.0' ? 'CRS' : 'SRS'}</InputLabel>
              <Select value={wmsSrs} label={wmsVersion === '1.3.0' ? 'CRS' : 'SRS'} onChange={e => setWmsSrs(e.target.value)} sx={selectSx}>
                {COMMON_SRS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel sx={{ color: 'grey.500' }}>Info Format</InputLabel>
              <Select value={wmsInfoFormat} label="Info Format" onChange={e => setWmsInfoFormat(e.target.value)} sx={selectSx}>
                {INFO_FORMATS.map(f => <MenuItem key={f} value={f}>{f}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField size="small" label="Feature Count" value={wmsFeatureCount} onChange={e => setWmsFeatureCount(e.target.value)} sx={{ ...inputSx, width: 130 }} />
          </Box>
          <Typography variant="caption" sx={{ color: 'grey.500' }}>BBOX (same as GetMap - defines the map extent)</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField size="small" label="Min X" value={wmsBboxMinX} onChange={e => setWmsBboxMinX(e.target.value)} sx={{ ...inputSx, flex: 1 }} />
            <TextField size="small" label="Min Y" value={wmsBboxMinY} onChange={e => setWmsBboxMinY(e.target.value)} sx={{ ...inputSx, flex: 1 }} />
            <TextField size="small" label="Max X" value={wmsBboxMaxX} onChange={e => setWmsBboxMaxX(e.target.value)} sx={{ ...inputSx, flex: 1 }} />
            <TextField size="small" label="Max Y" value={wmsBboxMaxY} onChange={e => setWmsBboxMaxY(e.target.value)} sx={{ ...inputSx, flex: 1 }} />
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField size="small" label="Width" value={wmsWidth} onChange={e => setWmsWidth(e.target.value)} sx={{ ...inputSx, width: 120 }} />
            <TextField size="small" label="Height" value={wmsHeight} onChange={e => setWmsHeight(e.target.value)} sx={{ ...inputSx, width: 120 }} />
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField size="small" label={wmsVersion === '1.3.0' ? 'I (pixel X)' : 'X (pixel)'} value={wmsX} onChange={e => setWmsX(e.target.value)} sx={{ ...inputSx, width: 140 }} />
            <TextField size="small" label={wmsVersion === '1.3.0' ? 'J (pixel Y)' : 'Y (pixel)'} value={wmsY} onChange={e => setWmsY(e.target.value)} sx={{ ...inputSx, width: 140 }} />
          </Box>
        </Box>
      );
    }

    if (wmsRequest === 'GetLegendGraphic') {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField size="small" label="Layer" value={wmsLegendLayer} onChange={e => setWmsLegendLayer(e.target.value)} fullWidth sx={inputSx} />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField size="small" label="Style (optional)" value={wmsLegendStyle} onChange={e => setWmsLegendStyle(e.target.value)} sx={{ ...inputSx, flex: 1 }} />
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel sx={{ color: 'grey.500' }}>Format</InputLabel>
              <Select value={wmsLegendFormat} label="Format" onChange={e => setWmsLegendFormat(e.target.value)} sx={selectSx}>
                {WMS_FORMATS.map(f => <MenuItem key={f} value={f}>{f}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField size="small" label="Symbol Width" value={wmsLegendWidth} onChange={e => setWmsLegendWidth(e.target.value)} sx={{ ...inputSx, width: 120 }} />
            <TextField size="small" label="Symbol Height" value={wmsLegendHeight} onChange={e => setWmsLegendHeight(e.target.value)} sx={{ ...inputSx, width: 120 }} />
          </Box>
          <TextField size="small" label="LEGEND_OPTIONS" value={wmsLegendOptions} onChange={e => setWmsLegendOptions(e.target.value)} fullWidth sx={inputSx} helperText="e.g. fontSize:12;fontAntiAliasing:true;forceLabels:on" />
        </Box>
      );
    }

    return null;
  };

  const renderWfsFields = () => {
    if (wfsRequest === 'GetCapabilities') {
      return (
        <Box sx={{ p: 2, color: 'grey.500' }}>
          <Typography variant="body2">GetCapabilities requires no additional parameters.</Typography>
        </Box>
      );
    }

    if (wfsRequest === 'DescribeFeatureType') {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField size="small" label={wfsVersion === '2.0.0' ? 'TypeNames' : 'TypeName'} value={wfsTypeName} onChange={e => setWfsTypeName(e.target.value)} fullWidth sx={inputSx} />
        </Box>
      );
    }

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField size="small" label={wfsVersion === '2.0.0' ? 'TypeNames' : 'TypeName'} value={wfsTypeName} onChange={e => setWfsTypeName(e.target.value)} fullWidth sx={inputSx} placeholder="workspace:layer_name" />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField size="small" label={wfsVersion === '2.0.0' ? 'Count' : 'MaxFeatures'} value={wfsMaxFeatures} onChange={e => setWfsMaxFeatures(e.target.value)} sx={{ ...inputSx, width: 140 }} />
          <TextField size="small" label="Start Index" value={wfsStartIndex} onChange={e => setWfsStartIndex(e.target.value)} sx={{ ...inputSx, width: 140 }} />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel sx={{ color: 'grey.500' }}>Output Format</InputLabel>
            <Select value={wfsOutputFormat} label="Output Format" onChange={e => setWfsOutputFormat(e.target.value)} sx={selectSx}>
              {WFS_OUTPUT_FORMATS.map(f => <MenuItem key={f} value={f}>{f}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>
        <TextField size="small" label="CQL_FILTER" value={wfsCqlFilter} onChange={e => setWfsCqlFilter(e.target.value)} fullWidth sx={inputSx} placeholder="attribute = 'value' AND status > 1" helperText="Common: field = 'val', field > 0, field LIKE '%pattern%', INTERSECTS(geom, POLYGON(...))" />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField size="small" label="SortBy" value={wfsSortBy} onChange={e => setWfsSortBy(e.target.value)} sx={{ ...inputSx, flex: 1 }} placeholder="field_name+A (asc) or field_name+D (desc)" />
          <TextField size="small" label="PropertyName" value={wfsPropertyName} onChange={e => setWfsPropertyName(e.target.value)} sx={{ ...inputSx, flex: 1 }} placeholder="field1,field2,field3" />
        </Box>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel sx={{ color: 'grey.500' }}>SRS Name</InputLabel>
          <Select value={wfsSrsName} label="SRS Name" onChange={e => setWfsSrsName(e.target.value)} sx={selectSx}>
            {COMMON_SRS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>
    );
  };

  const renderWcsFields = () => {
    if (wcsRequest === 'GetCapabilities') {
      return (
        <Box sx={{ p: 2, color: 'grey.500' }}>
          <Typography variant="body2">GetCapabilities requires no additional parameters.</Typography>
        </Box>
      );
    }

    if (wcsRequest === 'DescribeCoverage') {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField size="small" label={wcsVersion === '2.0.0' ? 'CoverageId' : 'Identifiers'} value={wcsCoverageId} onChange={e => setWcsCoverageId(e.target.value)} fullWidth sx={inputSx} />
        </Box>
      );
    }

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField size="small" label={wcsVersion === '2.0.0' ? 'CoverageId' : 'Identifier'} value={wcsCoverageId} onChange={e => setWcsCoverageId(e.target.value)} fullWidth sx={inputSx} placeholder="workspace__coverage_name" />
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel sx={{ color: 'grey.500' }}>Format</InputLabel>
          <Select value={wcsFormat} label="Format" onChange={e => setWcsFormat(e.target.value)} sx={selectSx}>
            {WCS_FORMATS.map(f => <MenuItem key={f} value={f}>{f}</MenuItem>)}
          </Select>
        </FormControl>
        <Typography variant="caption" sx={{ color: 'grey.500' }}>
          {wcsVersion === '2.0.0' ? 'Subset ranges (min,max)' : 'Bounding box will be generated from lat/lon ranges'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField size="small" label="Latitude Range (min,max)" value={wcsSubsetLat} onChange={e => setWcsSubsetLat(e.target.value)} sx={{ ...inputSx, flex: 1 }} placeholder="40,50" />
          <TextField size="small" label="Longitude Range (min,max)" value={wcsSubsetLon} onChange={e => setWcsSubsetLon(e.target.value)} sx={{ ...inputSx, flex: 1 }} placeholder="-130,-120" />
        </Box>
        {wcsVersion === '2.0.0' && (
          <TextField size="small" label="Scale Factor (optional)" value={wcsScaleFactor} onChange={e => setWcsScaleFactor(e.target.value)} sx={{ ...inputSx, width: 200 }} placeholder="1.0" />
        )}
      </Box>
    );
  };

  const renderWmtsFields = () => {
    if (wmtsRequest === 'GetCapabilities') {
      return (
        <Box sx={{ p: 2, color: 'grey.500' }}>
          <Typography variant="body2">GetCapabilities requires no additional parameters.</Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField size="small" label="Layer" value={wmtsLayer} onChange={e => setWmtsLayer(e.target.value)} fullWidth sx={inputSx} />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField size="small" label="Style" value={wmtsStyle} onChange={e => setWmtsStyle(e.target.value)} sx={{ ...inputSx, flex: 1 }} />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel sx={{ color: 'grey.500' }}>Format</InputLabel>
            <Select value={wmtsFormat} label="Format" onChange={e => setWmtsFormat(e.target.value)} sx={selectSx}>
              {WMTS_FORMATS.map(f => <MenuItem key={f} value={f}>{f}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>
        <TextField size="small" label="TileMatrixSet" value={wmtsTileMatrixSet} onChange={e => setWmtsTileMatrixSet(e.target.value)} fullWidth sx={inputSx} placeholder="EPSG:4326" />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField size="small" label="TileMatrix" value={wmtsTileMatrix} onChange={e => setWmtsTileMatrix(e.target.value)} sx={{ ...inputSx, flex: 1 }} placeholder="EPSG:4326:10" />
          <TextField size="small" label="TileRow" value={wmtsTileRow} onChange={e => setWmtsTileRow(e.target.value)} sx={{ ...inputSx, width: 120 }} />
          <TextField size="small" label="TileCol" value={wmtsTileCol} onChange={e => setWmtsTileCol(e.target.value)} sx={{ ...inputSx, width: 120 }} />
        </Box>
      </Box>
    );
  };

  const getVersionOptions = () => {
    switch (serviceTab) {
      case 'WMS': return WMS_VERSIONS;
      case 'WFS': return WFS_VERSIONS;
      case 'WCS': return WCS_VERSIONS;
      case 'WMTS': return WMTS_VERSIONS;
    }
  };

  const getCurrentVersion = () => {
    switch (serviceTab) {
      case 'WMS': return wmsVersion;
      case 'WFS': return wfsVersion;
      case 'WCS': return wcsVersion;
      case 'WMTS': return wmtsVersion;
    }
  };

  const setCurrentVersion = (v: string) => {
    switch (serviceTab) {
      case 'WMS': setWmsVersion(v); break;
      case 'WFS': setWfsVersion(v); break;
      case 'WCS': setWcsVersion(v); break;
      case 'WMTS': setWmtsVersion(v); break;
    }
  };

  const serviceTabIndex = ['WMS', 'WFS', 'WCS', 'WMTS'].indexOf(serviceTab);

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
            <Globe size={24} color="#90caf9" />
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>WMS / WFS / WCS / WMTS Request Builder</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Reset all fields">
              <IconButton size="small" onClick={resetAll} sx={{ color: 'grey.500' }}><RotateCcw size={18} /></IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', height: 'calc(100vh - 65px)' }}>
        {/* Left sidebar - Presets */}
        <Paper sx={{ width: 220, bgcolor: '#111', borderRight: '1px solid #222', overflow: 'auto', flexShrink: 0 }}>
          <Box sx={{ p: 1.5 }}>
            <Typography variant="caption" sx={{ color: 'grey.500', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Bookmark size={14} /> Presets
            </Typography>
            {presets.map((preset, i) => (
              <Button
                key={i}
                size="small"
                fullWidth
                onClick={preset.apply}
                sx={{
                  justifyContent: 'flex-start',
                  color: 'grey.400',
                  textTransform: 'none',
                  fontSize: 12,
                  mb: 0.5,
                  px: 1.5,
                  py: 0.7,
                  borderRadius: 1,
                  '&:hover': { bgcolor: '#1a1a1a' },
                }}
              >
                <Chip label={preset.service} size="small" sx={{ mr: 1, height: 18, fontSize: 10, bgcolor: preset.service === 'WMS' ? '#1a3a5c' : preset.service === 'WFS' ? '#3a1a5c' : preset.service === 'WCS' ? '#1a5c3a' : '#5c3a1a', color: 'grey.300' }} />
                {preset.name.replace(`${preset.service} `, '')}
              </Button>
            ))}
          </Box>
        </Paper>

        {/* Main content */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Base URL */}
          <Paper sx={{ bgcolor: '#111', borderBottom: '1px solid #222', p: 2 }}>
            <TextField
              size="small"
              label="Base URL"
              value={baseUrl}
              onChange={e => setBaseUrl(e.target.value)}
              fullWidth
              sx={inputSx}
              placeholder="https://example.com/geoserver/ows"
              helperText="The OGC service endpoint URL"
            />
          </Paper>

          {/* Service Tabs */}
          <Paper sx={{ bgcolor: '#0d0d0d', borderBottom: '1px solid #222' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Tabs value={serviceTabIndex} onChange={(_, v) => setServiceTab(['WMS', 'WFS', 'WCS', 'WMTS'][v] as ServiceTab)} sx={{ '& .MuiTab-root': { color: 'grey.500', minHeight: 48 }, flex: 1 }}>
                <Tab icon={<Map size={16} />} iconPosition="start" label="WMS" />
                <Tab icon={<Layers size={16} />} iconPosition="start" label="WFS" />
                <Tab icon={<Grid3x3 size={16} />} iconPosition="start" label="WCS" />
                <Tab icon={<Globe size={16} />} iconPosition="start" label="WMTS" />
              </Tabs>
              <Box sx={{ display: 'flex', gap: 1, pr: 2, alignItems: 'center' }}>
                <FormControl size="small" sx={{ minWidth: 110 }}>
                  <InputLabel sx={{ color: 'grey.500' }}>Version</InputLabel>
                  <Select value={getCurrentVersion()} label="Version" onChange={e => setCurrentVersion(e.target.value)} sx={{ ...selectSx, height: 36 }}>
                    {getVersionOptions().map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </Paper>

          {/* Request type selector */}
          <Paper sx={{ bgcolor: '#111', borderBottom: '1px solid #222', p: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Typography variant="body2" sx={{ color: 'grey.500', whiteSpace: 'nowrap' }}>Request Type:</Typography>
              {serviceTab === 'WMS' && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {(['GetMap', 'GetCapabilities', 'GetFeatureInfo', 'GetLegendGraphic'] as WMSRequest[]).map(r => (
                    <Chip
                      key={r}
                      label={r}
                      size="small"
                      onClick={() => setWmsRequest(r)}
                      sx={{
                        bgcolor: wmsRequest === r ? '#1a3a5c' : '#1a1a1a',
                        color: wmsRequest === r ? '#90caf9' : 'grey.400',
                        border: `1px solid ${wmsRequest === r ? '#2a5a8c' : '#333'}`,
                        cursor: 'pointer',
                        '&:hover': { bgcolor: '#1a3a5c' },
                      }}
                    />
                  ))}
                </Box>
              )}
              {serviceTab === 'WFS' && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {(['GetCapabilities', 'DescribeFeatureType', 'GetFeature'] as WFSRequest[]).map(r => (
                    <Chip
                      key={r}
                      label={r}
                      size="small"
                      onClick={() => setWfsRequest(r)}
                      sx={{
                        bgcolor: wfsRequest === r ? '#3a1a5c' : '#1a1a1a',
                        color: wfsRequest === r ? '#ce93d8' : 'grey.400',
                        border: `1px solid ${wfsRequest === r ? '#5a2a8c' : '#333'}`,
                        cursor: 'pointer',
                        '&:hover': { bgcolor: '#3a1a5c' },
                      }}
                    />
                  ))}
                </Box>
              )}
              {serviceTab === 'WCS' && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {(['GetCapabilities', 'DescribeCoverage', 'GetCoverage'] as WCSRequest[]).map(r => (
                    <Chip
                      key={r}
                      label={r}
                      size="small"
                      onClick={() => setWcsRequest(r)}
                      sx={{
                        bgcolor: wcsRequest === r ? '#1a5c3a' : '#1a1a1a',
                        color: wcsRequest === r ? '#81c784' : 'grey.400',
                        border: `1px solid ${wcsRequest === r ? '#2a8c5a' : '#333'}`,
                        cursor: 'pointer',
                        '&:hover': { bgcolor: '#1a5c3a' },
                      }}
                    />
                  ))}
                </Box>
              )}
              {serviceTab === 'WMTS' && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {(['GetCapabilities', 'GetTile'] as WMTSRequest[]).map(r => (
                    <Chip
                      key={r}
                      label={r}
                      size="small"
                      onClick={() => setWmtsRequest(r)}
                      sx={{
                        bgcolor: wmtsRequest === r ? '#5c3a1a' : '#1a1a1a',
                        color: wmtsRequest === r ? '#ffb74d' : 'grey.400',
                        border: `1px solid ${wmtsRequest === r ? '#8c5a2a' : '#333'}`,
                        cursor: 'pointer',
                        '&:hover': { bgcolor: '#5c3a1a' },
                      }}
                    />
                  ))}
                </Box>
              )}
            </Box>
          </Paper>

          {/* Parameters */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 2 }}>
              <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 2 }}>
                {serviceTab} {serviceTab === 'WMS' ? wmsRequest : serviceTab === 'WFS' ? wfsRequest : serviceTab === 'WCS' ? wcsRequest : wmtsRequest} Parameters
              </Typography>
              {serviceTab === 'WMS' && renderWmsFields()}
              {serviceTab === 'WFS' && renderWfsFields()}
              {serviceTab === 'WCS' && renderWcsFields()}
              {serviceTab === 'WMTS' && renderWmtsFields()}
            </Paper>
          </Box>

          {/* Generated URL */}
          <Paper sx={{ bgcolor: '#111', borderTop: '1px solid #222', p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Code size={16} color="#90caf9" />
                <Typography variant="subtitle2" sx={{ color: 'grey.400' }}>Generated URL</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Tooltip title={urlEncoded ? 'URL is encoded - click to decode' : 'URL is decoded - click to encode'}>
                  <IconButton size="small" onClick={() => setUrlEncoded(!urlEncoded)} sx={{ color: urlEncoded ? '#90caf9' : 'grey.500' }}>
                    {urlEncoded ? <Lock size={16} /> : <Unlock size={16} />}
                  </IconButton>
                </Tooltip>
                <Chip label={urlEncoded ? 'Encoded' : 'Decoded'} size="small" sx={{ height: 22, fontSize: 11, bgcolor: '#1a1a1a', color: 'grey.400' }} />
                <Tooltip title="Copy URL">
                  <IconButton size="small" onClick={() => handleCopy(generatedUrl)} sx={{ color: 'grey.500' }}><Copy size={16} /></IconButton>
                </Tooltip>
                <Tooltip title="Open in new tab">
                  <IconButton size="small" onClick={() => window.open(generatedUrl, '_blank')} sx={{ color: 'grey.500' }}><ExternalLink size={16} /></IconButton>
                </Tooltip>
              </Box>
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

            {/* cURL command */}
            <Box sx={{ mt: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" sx={{ color: 'grey.500' }}>cURL</Typography>
                <Tooltip title="Copy cURL">
                  <IconButton size="small" onClick={() => handleCopy(`curl "${generatedUrl}"`, 'cURL')} sx={{ color: 'grey.600' }}><Copy size={14} /></IconButton>
                </Tooltip>
              </Box>
              <Box sx={{
                bgcolor: '#0a0a0a',
                border: '1px solid #222',
                borderRadius: 1,
                p: 1,
                fontFamily: 'monospace',
                fontSize: 11,
                color: '#ffb74d',
                wordBreak: 'break-all',
                overflow: 'auto',
              }}>
                curl &quot;{generatedUrl}&quot;
              </Box>
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
