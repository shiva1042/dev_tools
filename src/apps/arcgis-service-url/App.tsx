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
} from '@mui/material';
import {
  Copy,
  Plus,
  Trash2,
  RotateCcw,
  Server,
  Code,
  Terminal,
  Download,
  Globe,
  Layers,
  Map,
  MapPin,
  Cpu,
  Box as BoxIcon,
  Image,
  Key,
  FileCode,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';

type ServiceType = 'MapServer' | 'FeatureServer' | 'ImageServer' | 'GeocodeServer' | 'GPServer' | 'SceneServer';
type CodeTab = 'url' | 'curl' | 'js-fetch' | 'python' | 'arcgis-js';

interface KeyValueParam {
  id: string;
  key: string;
  value: string;
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

const OPERATIONS: Record<ServiceType, string[]> = {
  MapServer: ['export', 'identify', 'find', 'query', 'generateKML', '(layer info)'],
  FeatureServer: ['query', 'addFeatures', 'updateFeatures', 'deleteFeatures', 'applyEdits', 'queryRelatedRecords', 'queryDomains', 'queryAttachments'],
  ImageServer: ['exportImage', 'query', 'identify', 'getSamples', 'computeStatisticsHistograms', 'download'],
  GeocodeServer: ['findAddressCandidates', 'reverseGeocode', 'geocodeAddresses', 'suggest'],
  GPServer: ['submitJob', 'execute'],
  SceneServer: ['query', '(layer info)', '(node pages)', '(textures)'],
};

const OUTPUT_FORMATS = ['json', 'pjson', 'html', 'geojson', 'kmz', 'image', 'pbf'];

const SERVICE_TYPE_ICONS: Record<ServiceType, typeof Map> = {
  MapServer: Map,
  FeatureServer: Layers,
  ImageServer: Image,
  GeocodeServer: MapPin,
  GPServer: Cpu,
  SceneServer: BoxIcon,
};

const DEFAULT_PARAMS: Record<string, KeyValueParam[]> = {
  'MapServer/export': [
    { id: '1', key: 'bbox', value: '-122.5,37.5,-122.0,38.0' },
    { id: '2', key: 'bboxSR', value: '4326' },
    { id: '3', key: 'imageSR', value: '4326' },
    { id: '4', key: 'size', value: '800,600' },
    { id: '5', key: 'format', value: 'png' },
    { id: '6', key: 'transparent', value: 'true' },
    { id: '7', key: 'f', value: 'image' },
  ],
  'MapServer/identify': [
    { id: '1', key: 'geometry', value: '-122.4,37.8' },
    { id: '2', key: 'geometryType', value: 'esriGeometryPoint' },
    { id: '3', key: 'sr', value: '4326' },
    { id: '4', key: 'layers', value: 'all:0' },
    { id: '5', key: 'tolerance', value: '5' },
    { id: '6', key: 'mapExtent', value: '-122.5,37.5,-122.0,38.0' },
    { id: '7', key: 'imageDisplay', value: '800,600,96' },
    { id: '8', key: 'returnGeometry', value: 'true' },
    { id: '9', key: 'f', value: 'json' },
  ],
  'MapServer/find': [
    { id: '1', key: 'searchText', value: 'California' },
    { id: '2', key: 'layers', value: '0,1,2' },
    { id: '3', key: 'searchFields', value: 'STATE_NAME' },
    { id: '4', key: 'sr', value: '4326' },
    { id: '5', key: 'returnGeometry', value: 'true' },
    { id: '6', key: 'f', value: 'json' },
  ],
  'MapServer/query': [
    { id: '1', key: 'where', value: '1=1' },
    { id: '2', key: 'outFields', value: '*' },
    { id: '3', key: 'returnGeometry', value: 'true' },
    { id: '4', key: 'f', value: 'json' },
  ],
  'FeatureServer/query': [
    { id: '1', key: 'where', value: '1=1' },
    { id: '2', key: 'outFields', value: '*' },
    { id: '3', key: 'returnGeometry', value: 'true' },
    { id: '4', key: 'resultRecordCount', value: '1000' },
    { id: '5', key: 'f', value: 'json' },
  ],
  'FeatureServer/addFeatures': [
    { id: '1', key: 'features', value: '[{"attributes":{"NAME":"Test"},"geometry":{"x":-122.4,"y":37.8,"spatialReference":{"wkid":4326}}}]' },
    { id: '2', key: 'f', value: 'json' },
  ],
  'FeatureServer/updateFeatures': [
    { id: '1', key: 'features', value: '[{"attributes":{"OBJECTID":1,"NAME":"Updated"}}]' },
    { id: '2', key: 'f', value: 'json' },
  ],
  'FeatureServer/deleteFeatures': [
    { id: '1', key: 'where', value: 'OBJECTID = 1' },
    { id: '2', key: 'f', value: 'json' },
  ],
  'FeatureServer/applyEdits': [
    { id: '1', key: 'adds', value: '[]' },
    { id: '2', key: 'updates', value: '[]' },
    { id: '3', key: 'deletes', value: '[]' },
    { id: '4', key: 'f', value: 'json' },
  ],
  'FeatureServer/queryRelatedRecords': [
    { id: '1', key: 'objectIds', value: '1,2,3' },
    { id: '2', key: 'relationshipId', value: '0' },
    { id: '3', key: 'outFields', value: '*' },
    { id: '4', key: 'f', value: 'json' },
  ],
  'ImageServer/exportImage': [
    { id: '1', key: 'bbox', value: '-122.5,37.5,-122.0,38.0' },
    { id: '2', key: 'bboxSR', value: '4326' },
    { id: '3', key: 'imageSR', value: '4326' },
    { id: '4', key: 'size', value: '800,600' },
    { id: '5', key: 'format', value: 'png' },
    { id: '6', key: 'f', value: 'image' },
  ],
  'ImageServer/query': [
    { id: '1', key: 'where', value: '1=1' },
    { id: '2', key: 'outFields', value: '*' },
    { id: '3', key: 'returnGeometry', value: 'true' },
    { id: '4', key: 'f', value: 'json' },
  ],
  'ImageServer/identify': [
    { id: '1', key: 'geometry', value: '{"x":-122.4,"y":37.8,"spatialReference":{"wkid":4326}}' },
    { id: '2', key: 'geometryType', value: 'esriGeometryPoint' },
    { id: '3', key: 'returnGeometry', value: 'false' },
    { id: '4', key: 'returnCatalogItems', value: 'true' },
    { id: '5', key: 'f', value: 'json' },
  ],
  'ImageServer/getSamples': [
    { id: '1', key: 'geometry', value: '{"points":[[-122.4,37.8]],"spatialReference":{"wkid":4326}}' },
    { id: '2', key: 'geometryType', value: 'esriGeometryMultipoint' },
    { id: '3', key: 'returnFirstValueOnly', value: 'true' },
    { id: '4', key: 'f', value: 'json' },
  ],
  'GeocodeServer/findAddressCandidates': [
    { id: '1', key: 'singleLine', value: '380 New York St, Redlands, CA 92373' },
    { id: '2', key: 'outFields', value: '*' },
    { id: '3', key: 'maxLocations', value: '5' },
    { id: '4', key: 'outSR', value: '4326' },
    { id: '5', key: 'f', value: 'json' },
  ],
  'GeocodeServer/reverseGeocode': [
    { id: '1', key: 'location', value: '-122.4,37.8' },
    { id: '2', key: 'distance', value: '100' },
    { id: '3', key: 'outSR', value: '4326' },
    { id: '4', key: 'f', value: 'json' },
  ],
  'GeocodeServer/geocodeAddresses': [
    { id: '1', key: 'addresses', value: '{"records":[{"attributes":{"OBJECTID":1,"SingleLine":"380 New York St, Redlands, CA"}}]}' },
    { id: '2', key: 'outSR', value: '4326' },
    { id: '3', key: 'f', value: 'json' },
  ],
  'GeocodeServer/suggest': [
    { id: '1', key: 'text', value: 'Starbucks' },
    { id: '2', key: 'location', value: '-122.4,37.8' },
    { id: '3', key: 'distance', value: '5000' },
    { id: '4', key: 'maxSuggestions', value: '10' },
    { id: '5', key: 'f', value: 'json' },
  ],
  'GPServer/submitJob': [
    { id: '1', key: 'Input_Parameter', value: 'value' },
    { id: '2', key: 'env:outSR', value: '4326' },
    { id: '3', key: 'env:processSR', value: '4326' },
    { id: '4', key: 'f', value: 'json' },
  ],
  'GPServer/execute': [
    { id: '1', key: 'Input_Parameter', value: 'value' },
    { id: '2', key: 'env:outSR', value: '4326' },
    { id: '3', key: 'f', value: 'json' },
  ],
  'SceneServer/query': [
    { id: '1', key: 'where', value: '1=1' },
    { id: '2', key: 'outFields', value: '*' },
    { id: '3', key: 'returnGeometry', value: 'true' },
    { id: '4', key: 'f', value: 'json' },
  ],
};

export default function ArcGISServiceUrlGenerator() {
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [codeTab, setCodeTab] = useState<CodeTab>('url');

  // Service config
  const [baseServerUrl, setBaseServerUrl] = useState('https://sampleserver6.arcgisonline.com/arcgis');
  const [serviceType, setServiceType] = useState<ServiceType>('MapServer');
  const [serviceName, setServiceName] = useState('USA');
  const [folderName, setFolderName] = useState('');
  const [layerId, setLayerId] = useState('0');
  const [operation, setOperation] = useState('query');
  const [token, setToken] = useState('');
  const [outputFormat, setOutputFormat] = useState('json');
  const [params, setParams] = useState<KeyValueParam[]>(
    DEFAULT_PARAMS['MapServer/query']?.map(p => ({ ...p, id: String(Date.now() + Math.random()) })) || []
  );
  const [showParamsSection, setShowParamsSection] = useState(true);

  const serviceTabIndex = (['MapServer', 'FeatureServer', 'ImageServer', 'GeocodeServer', 'GPServer', 'SceneServer'] as ServiceType[]).indexOf(serviceType);

  const handleServiceTypeChange = useCallback((newType: ServiceType) => {
    setServiceType(newType);
    const ops = OPERATIONS[newType];
    const defaultOp = ops[0];
    setOperation(defaultOp);
    const key = `${newType}/${defaultOp}`;
    const defaultParams = DEFAULT_PARAMS[key];
    if (defaultParams) {
      setParams(defaultParams.map(p => ({ ...p, id: String(Date.now() + Math.random()) })));
    } else {
      setParams([{ id: String(Date.now()), key: 'f', value: 'json' }]);
    }
  }, []);

  const handleOperationChange = useCallback((newOp: string) => {
    setOperation(newOp);
    const key = `${serviceType}/${newOp}`;
    const defaultParams = DEFAULT_PARAMS[key];
    if (defaultParams) {
      setParams(defaultParams.map(p => ({ ...p, id: String(Date.now() + Math.random()) })));
    } else {
      setParams([{ id: String(Date.now()), key: 'f', value: 'json' }]);
    }
  }, [serviceType]);

  const addParam = useCallback(() => {
    setParams(prev => [...prev, { id: String(Date.now()), key: '', value: '' }]);
  }, []);

  const removeParam = useCallback((id: string) => {
    setParams(prev => prev.filter(p => p.id !== id));
  }, []);

  const updateParam = useCallback((id: string, field: 'key' | 'value', value: string) => {
    setParams(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  }, []);

  const generatedUrl = useMemo(() => {
    let url = baseServerUrl.endsWith('/') ? baseServerUrl.slice(0, -1) : baseServerUrl;
    url += '/rest/services';
    if (folderName) url += `/${folderName}`;
    url += `/${serviceName}/${serviceType}`;

    const needsLayer = ['MapServer', 'FeatureServer', 'SceneServer'].includes(serviceType);
    const isInfoOp = operation.startsWith('(');

    if (needsLayer && layerId && !isInfoOp) {
      url += `/${layerId}`;
    }

    if (!isInfoOp) {
      url += `/${operation}`;
    }

    // Build query params
    const queryParams: string[] = [];

    params.forEach(p => {
      if (p.key && p.value !== undefined) {
        queryParams.push(`${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`);
      }
    });

    if (token) {
      queryParams.push(`token=${encodeURIComponent(token)}`);
    }

    // Add f param if not already present
    const hasFormat = params.some(p => p.key === 'f');
    if (!hasFormat) {
      queryParams.push(`f=${outputFormat}`);
    }

    if (queryParams.length > 0) {
      url += '?' + queryParams.join('&');
    }

    return url;
  }, [baseServerUrl, folderName, serviceName, serviceType, layerId, operation, params, token, outputFormat]);

  const curlCode = useMemo(() => {
    const isWrite = ['addFeatures', 'updateFeatures', 'deleteFeatures', 'applyEdits', 'geocodeAddresses'].includes(operation);

    if (isWrite) {
      let url = baseServerUrl.endsWith('/') ? baseServerUrl.slice(0, -1) : baseServerUrl;
      url += '/rest/services';
      if (folderName) url += `/${folderName}`;
      url += `/${serviceName}/${serviceType}`;
      if (['MapServer', 'FeatureServer', 'SceneServer'].includes(serviceType) && layerId) {
        url += `/${layerId}`;
      }
      url += `/${operation}`;

      const dataParams = params
        .filter(p => p.key)
        .map(p => `--data-urlencode "${p.key}=${p.value}"`)
        .join(' \\\n  ');

      return `curl -X POST "${url}" \\\n  ${dataParams}${token ? ` \\\n  --data-urlencode "token=${token}"` : ''}`;
    }

    return `curl "${generatedUrl}"`;
  }, [generatedUrl, operation, baseServerUrl, folderName, serviceName, serviceType, layerId, params, token]);

  const jsFetchCode = useMemo(() => {
    const isWrite = ['addFeatures', 'updateFeatures', 'deleteFeatures', 'applyEdits', 'geocodeAddresses'].includes(operation);

    let baseUrl = baseServerUrl.endsWith('/') ? baseServerUrl.slice(0, -1) : baseServerUrl;
    baseUrl += '/rest/services';
    if (folderName) baseUrl += `/${folderName}`;
    baseUrl += `/${serviceName}/${serviceType}`;
    if (['MapServer', 'FeatureServer', 'SceneServer'].includes(serviceType) && layerId) {
      baseUrl += `/${layerId}`;
    }
    baseUrl += `/${operation}`;

    const paramsObj = params.reduce((acc, p) => {
      if (p.key) acc[p.key] = p.value;
      return acc;
    }, {} as Record<string, string>);
    if (token) paramsObj['token'] = token;
    if (!paramsObj['f']) paramsObj['f'] = outputFormat;

    const paramsStr = JSON.stringify(paramsObj, null, 2);

    if (isWrite) {
      return `const url = "${baseUrl}";
const params = new URLSearchParams(${paramsStr});

const response = await fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: params.toString(),
});

const data = await response.json();
console.log(data);`;
    }

    return `const url = "${baseUrl}";
const params = new URLSearchParams(${paramsStr});

const response = await fetch(\`\${url}?\${params.toString()}\`);
const data = await response.json();
console.log(data);`;
  }, [baseServerUrl, folderName, serviceName, serviceType, layerId, operation, params, token, outputFormat]);

  const pythonCode = useMemo(() => {
    const isWrite = ['addFeatures', 'updateFeatures', 'deleteFeatures', 'applyEdits', 'geocodeAddresses'].includes(operation);

    let baseUrl = baseServerUrl.endsWith('/') ? baseServerUrl.slice(0, -1) : baseServerUrl;
    baseUrl += '/rest/services';
    if (folderName) baseUrl += `/${folderName}`;
    baseUrl += `/${serviceName}/${serviceType}`;
    if (['MapServer', 'FeatureServer', 'SceneServer'].includes(serviceType) && layerId) {
      baseUrl += `/${layerId}`;
    }
    baseUrl += `/${operation}`;

    const paramLines = params
      .filter(p => p.key)
      .map(p => `    "${p.key}": "${p.value}",`)
      .join('\n');

    const tokenLine = token ? `\n    "token": "${token}",` : '';
    const fLine = !params.some(p => p.key === 'f') ? `\n    "f": "${outputFormat}",` : '';

    if (isWrite) {
      return `import requests

url = "${baseUrl}"
params = {
${paramLines}${tokenLine}${fLine}
}

response = requests.post(url, data=params)
data = response.json()
print(data)`;
    }

    return `import requests

url = "${baseUrl}"
params = {
${paramLines}${tokenLine}${fLine}
}

response = requests.get(url, params=params)
data = response.json()
print(data)`;
  }, [baseServerUrl, folderName, serviceName, serviceType, layerId, operation, params, token, outputFormat]);

  const arcgisJsCode = useMemo(() => {
    let baseUrl = baseServerUrl.endsWith('/') ? baseServerUrl.slice(0, -1) : baseServerUrl;
    baseUrl += '/rest/services';
    if (folderName) baseUrl += `/${folderName}`;
    baseUrl += `/${serviceName}/${serviceType}`;

    if (serviceType === 'FeatureServer') {
      return `import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";

const featureLayer = new FeatureLayer({
  url: "${baseUrl}/${layerId || '0'}"${token ? `,
  // Note: Use IdentityManager for token auth in production
  // apiKey: "${token}"` : ''}
});

const map = new Map({
  basemap: "topo-vector",
  layers: [featureLayer]
});

const view = new MapView({
  container: "viewDiv",
  map: map,
  zoom: 10,
  center: [-122.4, 37.8]
});

// Query features
const query = featureLayer.createQuery();
query.where = "${params.find(p => p.key === 'where')?.value || '1=1'}";
query.outFields = ["${params.find(p => p.key === 'outFields')?.value || '*'}"];
query.returnGeometry = ${params.find(p => p.key === 'returnGeometry')?.value || 'true'};

const results = await featureLayer.queryFeatures(query);
console.log("Features:", results.features);`;
    }

    if (serviceType === 'MapServer') {
      return `import MapImageLayer from "@arcgis/core/layers/MapImageLayer";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";

const mapImageLayer = new MapImageLayer({
  url: "${baseUrl}"${token ? `,
  // Note: Use IdentityManager for token auth in production` : ''}
});

const map = new Map({
  basemap: "topo-vector",
  layers: [mapImageLayer]
});

const view = new MapView({
  container: "viewDiv",
  map: map,
  zoom: 10,
  center: [-122.4, 37.8]
});`;
    }

    if (serviceType === 'ImageServer') {
      return `import ImageryLayer from "@arcgis/core/layers/ImageryLayer";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";

const imageryLayer = new ImageryLayer({
  url: "${baseUrl}"
});

const map = new Map({
  basemap: "topo-vector",
  layers: [imageryLayer]
});

const view = new MapView({
  container: "viewDiv",
  map: map,
  zoom: 10,
  center: [-122.4, 37.8]
});`;
    }

    if (serviceType === 'SceneServer') {
      return `import SceneLayer from "@arcgis/core/layers/SceneLayer";
import Map from "@arcgis/core/Map";
import SceneView from "@arcgis/core/views/SceneView";

const sceneLayer = new SceneLayer({
  url: "${baseUrl}/${layerId || '0'}"
});

const map = new Map({
  basemap: "topo-vector",
  ground: "world-elevation",
  layers: [sceneLayer]
});

const view = new SceneView({
  container: "viewDiv",
  map: map,
  camera: {
    position: { longitude: -122.4, latitude: 37.8, z: 500 },
    heading: 0,
    tilt: 60
  }
});`;
    }

    if (serviceType === 'GeocodeServer') {
      return `import * as locator from "@arcgis/core/rest/locator";

const geocodeUrl = "${baseUrl}";

// Forward geocode
const results = await locator.addressToLocations(geocodeUrl, {
  address: {
    SingleLine: "${params.find(p => p.key === 'singleLine')?.value || '380 New York St, Redlands, CA'}"
  },
  maxLocations: ${params.find(p => p.key === 'maxLocations')?.value || '5'},
  outFields: ["*"]
});

console.log("Candidates:", results);

// Reverse geocode
const reverseResult = await locator.locationToAddress(geocodeUrl, {
  location: { longitude: -122.4, latitude: 37.8 }
});

console.log("Address:", reverseResult.address);`;
    }

    // GPServer
    return `import * as geoprocessor from "@arcgis/core/rest/geoprocessor";

const gpUrl = "${baseUrl}/${serviceName || 'TaskName'}";

const jobInfo = await geoprocessor.submitJob(gpUrl, {
  // Input parameters
  ${params.filter(p => p.key && !p.key.startsWith('env:') && p.key !== 'f').map(p => `${p.key}: "${p.value}"`).join(',\n  ')}
});

// Check job status
const jobStatus = await jobInfo.waitForJobCompletion();
console.log("Job status:", jobStatus);

// Get results
const result = await jobInfo.fetchResultData("Output_Parameter");
console.log("Result:", result);`;
  }, [baseServerUrl, folderName, serviceName, serviceType, layerId, operation, params, token, outputFormat]);

  const handleCopy = useCallback(async (text: string, label = 'Content') => {
    await navigator.clipboard.writeText(text);
    setSnackbar({ open: true, message: `${label} copied to clipboard` });
  }, []);

  const downloadHttpFile = useCallback(() => {
    const isWrite = ['addFeatures', 'updateFeatures', 'deleteFeatures', 'applyEdits', 'geocodeAddresses'].includes(operation);
    let content = '';

    if (isWrite) {
      let url = baseServerUrl.endsWith('/') ? baseServerUrl.slice(0, -1) : baseServerUrl;
      url += '/rest/services';
      if (folderName) url += `/${folderName}`;
      url += `/${serviceName}/${serviceType}`;
      if (['MapServer', 'FeatureServer', 'SceneServer'].includes(serviceType) && layerId) {
        url += `/${layerId}`;
      }
      url += `/${operation}`;

      const body = params
        .filter(p => p.key)
        .map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
        .join('&');

      content = `POST ${url} HTTP/1.1\nContent-Type: application/x-www-form-urlencoded\n\n${body}`;
    } else {
      content = `GET ${generatedUrl} HTTP/1.1`;
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `${serviceName}_${operation}.http`;
    a.click();
    URL.revokeObjectURL(downloadUrl);
    setSnackbar({ open: true, message: '.http file downloaded' });
  }, [generatedUrl, operation, baseServerUrl, folderName, serviceName, serviceType, layerId, params]);

  const copyAll = useCallback(() => {
    const all = `=== URL ===\n${generatedUrl}\n\n=== cURL ===\n${curlCode}\n\n=== JavaScript Fetch ===\n${jsFetchCode}\n\n=== Python Requests ===\n${pythonCode}\n\n=== ArcGIS JS API ===\n${arcgisJsCode}`;
    navigator.clipboard.writeText(all);
    setSnackbar({ open: true, message: 'All snippets copied to clipboard' });
  }, [generatedUrl, curlCode, jsFetchCode, pythonCode, arcgisJsCode]);

  const getCodeForTab = () => {
    switch (codeTab) {
      case 'url': return generatedUrl;
      case 'curl': return curlCode;
      case 'js-fetch': return jsFetchCode;
      case 'python': return pythonCode;
      case 'arcgis-js': return arcgisJsCode;
    }
  };

  const getCodeColor = () => {
    switch (codeTab) {
      case 'url': return '#81c784';
      case 'curl': return '#ffb74d';
      case 'js-fetch': return '#90caf9';
      case 'python': return '#ce93d8';
      case 'arcgis-js': return '#4fc3f7';
    }
  };

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
            <Server size={24} color="#90caf9" />
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>ArcGIS Service URL Generator</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Copy all snippets">
              <Button size="small" startIcon={<Copy size={14} />} onClick={copyAll} sx={{ color: 'grey.400', textTransform: 'none', fontSize: 12 }}>Copy All</Button>
            </Tooltip>
            <Tooltip title="Download .http file">
              <Button size="small" startIcon={<Download size={14} />} onClick={downloadHttpFile} sx={{ color: 'grey.400', textTransform: 'none', fontSize: 12 }}>.http</Button>
            </Tooltip>
            <Tooltip title="Reset">
              <IconButton size="small" onClick={() => {
                setBaseServerUrl('https://sampleserver6.arcgisonline.com/arcgis');
                setServiceName('USA');
                setFolderName('');
                setLayerId('0');
                setToken('');
                handleServiceTypeChange('MapServer');
              }} sx={{ color: 'grey.500' }}><RotateCcw size={18} /></IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', height: 'calc(100vh - 65px)' }}>
        {/* Main content */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Server URL & Service Config */}
          <Paper sx={{ bgcolor: '#111', borderBottom: '1px solid #222', p: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                size="small"
                label="Base Server URL"
                value={baseServerUrl}
                onChange={e => setBaseServerUrl(e.target.value)}
                fullWidth
                sx={inputSx}
                placeholder="https://server.domain.com/arcgis"
                helperText="ArcGIS Server base URL (e.g., https://server.domain.com/arcgis)"
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField size="small" label="Folder (optional)" value={folderName} onChange={e => setFolderName(e.target.value)} sx={{ ...inputSx, width: 180 }} placeholder="FolderName" />
                <TextField size="small" label="Service Name" value={serviceName} onChange={e => setServiceName(e.target.value)} sx={{ ...inputSx, flex: 1 }} placeholder="ServiceName" />
                <TextField size="small" label="Layer ID" value={layerId} onChange={e => setLayerId(e.target.value)} sx={{ ...inputSx, width: 100 }} placeholder="0" />
              </Box>
            </Box>
          </Paper>

          {/* Service Type Tabs */}
          <Paper sx={{ bgcolor: '#0d0d0d', borderBottom: '1px solid #222' }}>
            <Tabs
              value={serviceTabIndex}
              onChange={(_, v) => {
                const types: ServiceType[] = ['MapServer', 'FeatureServer', 'ImageServer', 'GeocodeServer', 'GPServer', 'SceneServer'];
                handleServiceTypeChange(types[v]);
              }}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ '& .MuiTab-root': { color: 'grey.500', minHeight: 48, textTransform: 'none', fontSize: 13 } }}
            >
              {(['MapServer', 'FeatureServer', 'ImageServer', 'GeocodeServer', 'GPServer', 'SceneServer'] as ServiceType[]).map(type => {
                const Icon = SERVICE_TYPE_ICONS[type];
                return <Tab key={type} icon={<Icon size={16} />} iconPosition="start" label={type} />;
              })}
            </Tabs>
          </Paper>

          {/* Operation selector */}
          <Paper sx={{ bgcolor: '#111', borderBottom: '1px solid #222', p: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <Typography variant="body2" sx={{ color: 'grey.500', whiteSpace: 'nowrap' }}>Operation:</Typography>
              {OPERATIONS[serviceType].map(op => (
                <Chip
                  key={op}
                  label={op}
                  size="small"
                  onClick={() => handleOperationChange(op)}
                  sx={{
                    bgcolor: operation === op ? '#1a3a5c' : '#1a1a1a',
                    color: operation === op ? '#90caf9' : 'grey.400',
                    border: `1px solid ${operation === op ? '#2a5a8c' : '#333'}`,
                    cursor: 'pointer',
                    fontFamily: 'monospace',
                    fontSize: 12,
                    '&:hover': { bgcolor: '#1a3a5c' },
                  }}
                />
              ))}
              <Divider orientation="vertical" flexItem sx={{ borderColor: '#333' }} />
              <FormControl size="small" sx={{ minWidth: 110 }}>
                <InputLabel sx={{ color: 'grey.500' }}>Format</InputLabel>
                <Select value={outputFormat} label="Format" onChange={e => setOutputFormat(e.target.value)} sx={{ ...selectSx, height: 32 }}>
                  {OUTPUT_FORMATS.map(f => <MenuItem key={f} value={f}>{f}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
          </Paper>

          {/* Parameters & Token */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            {/* Token */}
            <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Key size={16} color="#999" />
                <TextField
                  size="small"
                  label="Token (optional)"
                  value={token}
                  onChange={e => setToken(e.target.value)}
                  fullWidth
                  type="password"
                  sx={inputSx}
                  placeholder="Enter authentication token"
                  helperText="ArcGIS Server or Portal token for secured services"
                />
              </Box>
            </Paper>

            {/* Parameters */}
            <Paper sx={{ bgcolor: '#111', border: '1px solid #222', mb: 2 }}>
              <Box
                sx={{ p: 2, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', '&:hover': { bgcolor: '#151515' } }}
                onClick={() => setShowParamsSection(!showParamsSection)}
              >
                <Typography variant="subtitle2" sx={{ color: 'grey.400', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FileCode size={16} /> Parameters
                  <Chip label={`${params.length}`} size="small" sx={{ ml: 0.5, height: 20, fontSize: 10, bgcolor: '#1a1a1a', color: 'grey.400' }} />
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Button
                    size="small"
                    startIcon={<Plus size={14} />}
                    onClick={(e) => { e.stopPropagation(); addParam(); }}
                    sx={{ color: 'grey.400', textTransform: 'none', fontSize: 12 }}
                  >
                    Add
                  </Button>
                  {showParamsSection ? <ChevronUp size={18} color="#999" /> : <ChevronDown size={18} color="#999" />}
                </Box>
              </Box>
              {showParamsSection && (
                <Box sx={{ px: 2, pb: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Divider sx={{ borderColor: '#222', mb: 1 }} />
                  {/* Header */}
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', px: 0.5 }}>
                    <Typography variant="caption" sx={{ color: 'grey.600', width: 200 }}>Key</Typography>
                    <Typography variant="caption" sx={{ color: 'grey.600', flex: 1 }}>Value</Typography>
                    <Box sx={{ width: 36 }} />
                  </Box>
                  {params.map(p => (
                    <Box key={p.id} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <TextField
                        size="small"
                        value={p.key}
                        onChange={e => updateParam(p.id, 'key', e.target.value)}
                        placeholder="parameter"
                        sx={{ ...inputSx, width: 200, '& .MuiInputBase-root': { ...inputSx['& .MuiInputBase-root'], fontFamily: 'monospace', fontSize: 12 } }}
                      />
                      <TextField
                        size="small"
                        value={p.value}
                        onChange={e => updateParam(p.id, 'value', e.target.value)}
                        placeholder="value"
                        fullWidth
                        sx={{ ...inputSx, '& .MuiInputBase-root': { ...inputSx['& .MuiInputBase-root'], fontFamily: 'monospace', fontSize: 12 } }}
                      />
                      <IconButton size="small" onClick={() => removeParam(p.id)} sx={{ color: 'grey.500' }}>
                        <Trash2 size={16} />
                      </IconButton>
                    </Box>
                  ))}
                  {params.length === 0 && (
                    <Typography variant="body2" sx={{ color: 'grey.600', textAlign: 'center', py: 2 }}>
                      No parameters. Click "Add" to add key-value pairs.
                    </Typography>
                  )}
                </Box>
              )}
            </Paper>

            {/* URL Preview - inline for easy reference */}
            <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ color: 'grey.400', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Globe size={16} /> Constructed URL Path
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
                <Chip label={baseServerUrl.replace(/^https?:\/\//, '').split('/')[0]} size="small" sx={{ bgcolor: '#1a2a1a', color: '#81c784', fontSize: 11, height: 22 }} />
                <Typography sx={{ color: 'grey.600', fontSize: 12 }}>/rest/services/</Typography>
                {folderName && <><Chip label={folderName} size="small" sx={{ bgcolor: '#2a2a1a', color: '#ffb74d', fontSize: 11, height: 22 }} /><Typography sx={{ color: 'grey.600', fontSize: 12 }}>/</Typography></>}
                <Chip label={serviceName} size="small" sx={{ bgcolor: '#1a1a3a', color: '#90caf9', fontSize: 11, height: 22 }} />
                <Typography sx={{ color: 'grey.600', fontSize: 12 }}>/</Typography>
                <Chip label={serviceType} size="small" sx={{ bgcolor: '#3a1a3a', color: '#ce93d8', fontSize: 11, height: 22 }} />
                {['MapServer', 'FeatureServer', 'SceneServer'].includes(serviceType) && layerId && !operation.startsWith('(') && (
                  <><Typography sx={{ color: 'grey.600', fontSize: 12 }}>/</Typography><Chip label={layerId} size="small" sx={{ bgcolor: '#3a1a1a', color: '#ef9a9a', fontSize: 11, height: 22 }} /></>
                )}
                {!operation.startsWith('(') && (
                  <><Typography sx={{ color: 'grey.600', fontSize: 12 }}>/</Typography><Chip label={operation} size="small" sx={{ bgcolor: '#1a3a3a', color: '#80deea', fontSize: 11, height: 22 }} /></>
                )}
              </Box>
            </Paper>
          </Box>

          {/* Code Output */}
          <Paper sx={{ bgcolor: '#111', borderTop: '1px solid #222', p: 0 }}>
            <Box sx={{ borderBottom: '1px solid #222', display: 'flex', alignItems: 'center' }}>
              <Tabs
                value={codeTab}
                onChange={(_, v) => setCodeTab(v)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ '& .MuiTab-root': { color: 'grey.500', minHeight: 40, textTransform: 'none', fontSize: 12 }, flex: 1 }}
              >
                <Tab icon={<Globe size={14} />} iconPosition="start" label="URL" value="url" />
                <Tab icon={<Terminal size={14} />} iconPosition="start" label="cURL" value="curl" />
                <Tab icon={<Code size={14} />} iconPosition="start" label="JS Fetch" value="js-fetch" />
                <Tab icon={<FileCode size={14} />} iconPosition="start" label="Python" value="python" />
                <Tab icon={<Layers size={14} />} iconPosition="start" label="ArcGIS JS" value="arcgis-js" />
              </Tabs>
              <Box sx={{ display: 'flex', gap: 0.5, pr: 1 }}>
                <Tooltip title="Copy snippet">
                  <IconButton size="small" onClick={() => handleCopy(getCodeForTab(), codeTab.toUpperCase())} sx={{ color: 'grey.500' }}>
                    <Copy size={16} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            <Box sx={{ p: 2, maxHeight: 220, overflow: 'auto' }}>
              <Box sx={{
                bgcolor: '#0a0a0a',
                border: '1px solid #222',
                borderRadius: 1,
                p: 1.5,
                fontFamily: 'monospace',
                fontSize: 12,
                color: getCodeColor(),
                whiteSpace: codeTab === 'url' ? 'normal' : 'pre-wrap',
                wordBreak: codeTab === 'url' ? 'break-all' : 'break-word',
                lineHeight: 1.6,
                userSelect: 'all',
              }}>
                {getCodeForTab()}
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
