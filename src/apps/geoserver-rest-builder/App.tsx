import { useState, useMemo } from 'react';
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
  Check,
  Play,
  Server,
  Database,
  Layers,
  Paintbrush,
  Image,
  Settings,
  Plus,
  Trash2,
  Download,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';

type OperationTab = 'workspaces' | 'datastores' | 'layers' | 'styles' | 'coverages' | 'wms';
type OutputFormat = 'curl' | 'fetch' | 'python';
type WorkspaceAction = 'list' | 'create' | 'delete';
type DatastoreType = 'postgis' | 'shapefile' | 'geotiff';
type LayerAction = 'publish' | 'configure';
type StyleAction = 'upload' | 'setDefault';

interface PostGISConfig {
  host: string;
  port: string;
  database: string;
  schema: string;
  user: string;
  password: string;
  datastoreName: string;
}

interface ShapefileConfig {
  filePath: string;
  datastoreName: string;
}

interface LayerConfig {
  workspace: string;
  datastore: string;
  nativeName: string;
  title: string;
  srs: string;
  nativeBboxMinx: string;
  nativeBboxMiny: string;
  nativeBboxMaxx: string;
  nativeBboxMaxy: string;
}

interface StyleConfig {
  name: string;
  sldContent: string;
  targetLayer: string;
  targetWorkspace: string;
}

interface CoverageConfig {
  workspace: string;
  storeName: string;
  filePath: string;
  coverageName: string;
}

interface WmsConfig {
  workspace: string;
  maxWidth: string;
  maxHeight: string;
  watermarkEnabled: boolean;
  watermarkText: string;
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

interface Preset {
  name: string;
  description: string;
  apply: () => void;
}

export default function GeoServerRestBuilder() {
  const [tab, setTab] = useState<OperationTab>('workspaces');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('curl');
  const [copied, setCopied] = useState(false);
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');

  // Server config
  const [geoserverUrl, setGeoserverUrl] = useState('http://localhost:8080/geoserver');
  const [gsUser, setGsUser] = useState('admin');
  const [gsPassword, setGsPassword] = useState('geoserver');

  // Workspace state
  const [wsAction, setWsAction] = useState<WorkspaceAction>('list');
  const [wsName, setWsName] = useState('my_workspace');

  // Datastore state
  const [dsType, setDsType] = useState<DatastoreType>('postgis');
  const [postgis, setPostgis] = useState<PostGISConfig>({
    host: 'localhost',
    port: '5432',
    database: 'geodata',
    schema: 'public',
    user: 'postgres',
    password: 'postgres',
    datastoreName: 'my_postgis_store',
  });
  const [shapefile, setShapefile] = useState<ShapefileConfig>({
    filePath: 'file:///data/shapefiles/my_data.shp',
    datastoreName: 'my_shapefile_store',
  });
  const [dsWorkspace, setDsWorkspace] = useState('my_workspace');

  // Layer state
  const [layerAction, setLayerAction] = useState<LayerAction>('publish');
  const [layerConfig, setLayerConfig] = useState<LayerConfig>({
    workspace: 'my_workspace',
    datastore: 'my_postgis_store',
    nativeName: 'my_table',
    title: 'My Layer',
    srs: 'EPSG:4326',
    nativeBboxMinx: '-180',
    nativeBboxMiny: '-90',
    nativeBboxMaxx: '180',
    nativeBboxMaxy: '90',
  });

  // Style state
  const [styleAction, setStyleAction] = useState<StyleAction>('upload');
  const [styleConfig, setStyleConfig] = useState<StyleConfig>({
    name: 'my_style',
    sldContent: `<?xml version="1.0" encoding="UTF-8"?>
<StyledLayerDescriptor version="1.0.0">
  <NamedLayer>
    <Name>my_style</Name>
    <UserStyle>
      <Title>My Style</Title>
      <FeatureTypeStyle>
        <Rule>
          <PointSymbolizer>
            <Graphic>
              <Mark>
                <WellKnownName>circle</WellKnownName>
                <Fill><CssParameter name="fill">#ff0000</CssParameter></Fill>
              </Mark>
              <Size>8</Size>
            </Graphic>
          </PointSymbolizer>
        </Rule>
      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>
</StyledLayerDescriptor>`,
    targetLayer: 'my_layer',
    targetWorkspace: 'my_workspace',
  });

  // Coverage state
  const [coverageConfig, setCoverageConfig] = useState<CoverageConfig>({
    workspace: 'my_workspace',
    storeName: 'my_raster_store',
    filePath: 'file:///data/rasters/dem.tif',
    coverageName: 'my_raster',
  });

  // WMS state
  const [wmsConfig, setWmsConfig] = useState<WmsConfig>({
    workspace: 'my_workspace',
    maxWidth: '4096',
    maxHeight: '4096',
    watermarkEnabled: false,
    watermarkText: '',
  });

  const baseUrl = geoserverUrl.replace(/\/$/, '');
  const authHeader = `Basic ${btoa(`${gsUser}:${gsPassword}`)}`;

  const generateCode = useMemo(() => {
    let method = 'GET';
    let url = '';
    let body = '';
    let contentType = 'application/json';

    switch (tab) {
      case 'workspaces': {
        if (wsAction === 'list') {
          method = 'GET';
          url = `${baseUrl}/rest/workspaces.json`;
        } else if (wsAction === 'create') {
          method = 'POST';
          url = `${baseUrl}/rest/workspaces`;
          body = JSON.stringify({ workspace: { name: wsName } }, null, 2);
        } else {
          method = 'DELETE';
          url = `${baseUrl}/rest/workspaces/${wsName}?recurse=true`;
        }
        break;
      }
      case 'datastores': {
        method = 'POST';
        url = `${baseUrl}/rest/workspaces/${dsWorkspace}/datastores`;
        if (dsType === 'postgis') {
          body = JSON.stringify({
            dataStore: {
              name: postgis.datastoreName,
              type: 'PostGIS',
              connectionParameters: {
                entry: [
                  { '@key': 'host', $: postgis.host },
                  { '@key': 'port', $: postgis.port },
                  { '@key': 'database', $: postgis.database },
                  { '@key': 'schema', $: postgis.schema },
                  { '@key': 'user', $: postgis.user },
                  { '@key': 'passwd', $: postgis.password },
                  { '@key': 'dbtype', $: 'postgis' },
                  { '@key': 'Expose primary keys', $: 'true' },
                ],
              },
            },
          }, null, 2);
        } else if (dsType === 'shapefile') {
          body = JSON.stringify({
            dataStore: {
              name: shapefile.datastoreName,
              type: 'Shapefile',
              connectionParameters: {
                entry: [
                  { '@key': 'url', $: shapefile.filePath },
                ],
              },
            },
          }, null, 2);
        } else {
          url = `${baseUrl}/rest/workspaces/${dsWorkspace}/coveragestores`;
          body = JSON.stringify({
            coverageStore: {
              name: postgis.datastoreName,
              type: 'GeoTIFF',
              workspace: { name: dsWorkspace },
              url: shapefile.filePath,
              enabled: true,
            },
          }, null, 2);
        }
        break;
      }
      case 'layers': {
        if (layerAction === 'publish') {
          method = 'POST';
          url = `${baseUrl}/rest/workspaces/${layerConfig.workspace}/datastores/${layerConfig.datastore}/featuretypes`;
          body = JSON.stringify({
            featureType: {
              name: layerConfig.nativeName,
              nativeName: layerConfig.nativeName,
              title: layerConfig.title,
              srs: layerConfig.srs,
              nativeBoundingBox: {
                minx: parseFloat(layerConfig.nativeBboxMinx),
                maxx: parseFloat(layerConfig.nativeBboxMaxx),
                miny: parseFloat(layerConfig.nativeBboxMiny),
                maxy: parseFloat(layerConfig.nativeBboxMaxy),
                crs: layerConfig.srs,
              },
              enabled: true,
            },
          }, null, 2);
        } else {
          method = 'PUT';
          url = `${baseUrl}/rest/layers/${layerConfig.workspace}:${layerConfig.nativeName}`;
          body = JSON.stringify({
            layer: {
              defaultStyle: { name: 'my_style' },
              enabled: true,
            },
          }, null, 2);
        }
        break;
      }
      case 'styles': {
        if (styleAction === 'upload') {
          method = 'POST';
          url = `${baseUrl}/rest/workspaces/${styleConfig.targetWorkspace}/styles`;
          contentType = 'application/vnd.ogc.sld+xml';
          body = styleConfig.sldContent;
        } else {
          method = 'PUT';
          url = `${baseUrl}/rest/layers/${styleConfig.targetWorkspace}:${styleConfig.targetLayer}`;
          body = JSON.stringify({
            layer: {
              defaultStyle: { name: styleConfig.name, workspace: styleConfig.targetWorkspace },
            },
          }, null, 2);
        }
        break;
      }
      case 'coverages': {
        method = 'POST';
        url = `${baseUrl}/rest/workspaces/${coverageConfig.workspace}/coveragestores`;
        body = JSON.stringify({
          coverageStore: {
            name: coverageConfig.storeName,
            type: 'GeoTIFF',
            workspace: { name: coverageConfig.workspace },
            url: coverageConfig.filePath,
            enabled: true,
          },
        }, null, 2);
        break;
      }
      case 'wms': {
        method = 'PUT';
        url = `${baseUrl}/rest/services/wms/workspaces/${wmsConfig.workspace}/settings`;
        body = JSON.stringify({
          wms: {
            maxBuffer: 50,
            maxRequestMemory: 65536,
            maxRenderingTime: 60,
            maxRenderingErrors: 1000,
            watermark: {
              enabled: wmsConfig.watermarkEnabled,
              position: 'BOT_RIGHT',
            },
          },
        }, null, 2);
        break;
      }
    }

    if (outputFormat === 'curl') {
      let cmd = `curl -X ${method} "${url}" \\\n  -u "${gsUser}:${gsPassword}"`;
      if (body) {
        if (contentType === 'application/vnd.ogc.sld+xml') {
          cmd += ` \\\n  -H "Content-Type: ${contentType}" \\\n  -d '${body.replace(/'/g, "'\\''")}'`;
        } else {
          cmd += ` \\\n  -H "Content-Type: ${contentType}" \\\n  -d '${body}'`;
        }
      }
      return cmd;
    } else if (outputFormat === 'fetch') {
      const opts: string[] = [
        `  method: '${method}'`,
        `  headers: {\n    'Authorization': '${authHeader}',${body ? `\n    'Content-Type': '${contentType}',` : ''}\n  }`,
      ];
      if (body) {
        if (contentType === 'application/json') {
          opts.push(`  body: JSON.stringify(${body})`);
        } else {
          opts.push(`  body: \`${body}\``);
        }
      }
      return `fetch('${url}', {\n${opts.join(',\n')}\n})\n  .then(res => {\n    console.log('Status:', res.status);\n    return res.json();\n  })\n  .then(data => console.log(data))\n  .catch(err => console.error(err));`;
    } else {
      let py = `import requests\n\nurl = "${url}"\nauth = ("${gsUser}", "${gsPassword}")\n`;
      if (body) {
        if (contentType === 'application/json') {
          py += `headers = {"Content-Type": "${contentType}"}\ndata = ${body}\n\nresponse = requests.${method.toLowerCase()}(url, json=data, headers=headers, auth=auth)`;
        } else {
          py += `headers = {"Content-Type": "${contentType}"}\ndata = """${body}"""\n\nresponse = requests.${method.toLowerCase()}(url, data=data, headers=headers, auth=auth)`;
        }
      } else {
        py += `\nresponse = requests.${method.toLowerCase()}(url, auth=auth)`;
      }
      py += `\nprint(f"Status: {response.status_code}")\nprint(response.text)`;
      return py;
    }
  }, [tab, outputFormat, wsAction, wsName, dsType, dsWorkspace, postgis, shapefile, layerAction, layerConfig, styleAction, styleConfig, coverageConfig, wmsConfig, baseUrl, gsUser, gsPassword, authHeader]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generateCode);
    setCopied(true);
    setSnackMsg('Code copied to clipboard!');
    setSnackOpen(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const presets: Preset[] = [
    {
      name: 'Publish PostGIS Table',
      description: 'Create workspace + PostGIS datastore + publish layer',
      apply: () => {
        setTab('layers');
        setLayerAction('publish');
        setLayerConfig({
          workspace: 'my_workspace',
          datastore: 'my_postgis_store',
          nativeName: 'my_table',
          title: 'My PostGIS Layer',
          srs: 'EPSG:4326',
          nativeBboxMinx: '-180',
          nativeBboxMiny: '-90',
          nativeBboxMaxx: '180',
          nativeBboxMaxy: '90',
        });
        setSnackMsg('Preset applied: Publish PostGIS Table');
        setSnackOpen(true);
      },
    },
    {
      name: 'Upload Shapefile',
      description: 'Create shapefile datastore',
      apply: () => {
        setTab('datastores');
        setDsType('shapefile');
        setShapefile({
          filePath: 'file:///data/shapefiles/my_data.shp',
          datastoreName: 'my_shapefile_store',
        });
        setSnackMsg('Preset applied: Upload Shapefile');
        setSnackOpen(true);
      },
    },
    {
      name: 'Create Workspace + Publish',
      description: 'Full workflow: workspace, store, layer',
      apply: () => {
        setTab('workspaces');
        setWsAction('create');
        setWsName('new_workspace');
        setSnackMsg('Preset applied: Create Workspace + Publish. Step through tabs.');
        setSnackOpen(true);
      },
    },
  ];

  const tabIcons: Record<OperationTab, React.ReactElement> = {
    workspaces: <Server size={16} />,
    datastores: <Database size={16} />,
    layers: <Layers size={16} />,
    styles: <Paintbrush size={16} />,
    coverages: <Image size={16} />,
    wms: <Settings size={16} />,
  };

  const renderWorkspacesForm = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <FormControl fullWidth size="small">
        <InputLabel sx={{ color: '#888' }}>Action</InputLabel>
        <Select value={wsAction} label="Action" onChange={(e) => setWsAction(e.target.value as WorkspaceAction)} sx={selectSx}>
          <MenuItem value="list">List Workspaces</MenuItem>
          <MenuItem value="create">Create Workspace</MenuItem>
          <MenuItem value="delete">Delete Workspace</MenuItem>
        </Select>
      </FormControl>
      {wsAction !== 'list' && (
        <TextField fullWidth size="small" label="Workspace Name" value={wsName} onChange={(e) => setWsName(e.target.value)} sx={textFieldSx} />
      )}
    </Box>
  );

  const renderDatastoresForm = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField fullWidth size="small" label="Target Workspace" value={dsWorkspace} onChange={(e) => setDsWorkspace(e.target.value)} sx={textFieldSx} />
      <FormControl fullWidth size="small">
        <InputLabel sx={{ color: '#888' }}>Datastore Type</InputLabel>
        <Select value={dsType} label="Datastore Type" onChange={(e) => setDsType(e.target.value as DatastoreType)} sx={selectSx}>
          <MenuItem value="postgis">PostGIS</MenuItem>
          <MenuItem value="shapefile">Shapefile</MenuItem>
          <MenuItem value="geotiff">GeoTIFF</MenuItem>
        </Select>
      </FormControl>
      {dsType === 'postgis' && (
        <>
          <TextField fullWidth size="small" label="Store Name" value={postgis.datastoreName} onChange={(e) => setPostgis({ ...postgis, datastoreName: e.target.value })} sx={textFieldSx} />
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField size="small" label="Host" value={postgis.host} onChange={(e) => setPostgis({ ...postgis, host: e.target.value })} sx={textFieldSx} />
            <TextField size="small" label="Port" value={postgis.port} onChange={(e) => setPostgis({ ...postgis, port: e.target.value })} sx={textFieldSx} />
            <TextField size="small" label="Database" value={postgis.database} onChange={(e) => setPostgis({ ...postgis, database: e.target.value })} sx={textFieldSx} />
            <TextField size="small" label="Schema" value={postgis.schema} onChange={(e) => setPostgis({ ...postgis, schema: e.target.value })} sx={textFieldSx} />
            <TextField size="small" label="DB User" value={postgis.user} onChange={(e) => setPostgis({ ...postgis, user: e.target.value })} sx={textFieldSx} />
            <TextField size="small" label="DB Password" type="password" value={postgis.password} onChange={(e) => setPostgis({ ...postgis, password: e.target.value })} sx={textFieldSx} />
          </Box>
        </>
      )}
      {dsType === 'shapefile' && (
        <>
          <TextField fullWidth size="small" label="Store Name" value={shapefile.datastoreName} onChange={(e) => setShapefile({ ...shapefile, datastoreName: e.target.value })} sx={textFieldSx} />
          <TextField fullWidth size="small" label="File Path (file:// URL)" value={shapefile.filePath} onChange={(e) => setShapefile({ ...shapefile, filePath: e.target.value })} sx={textFieldSx} />
        </>
      )}
      {dsType === 'geotiff' && (
        <>
          <TextField fullWidth size="small" label="Store Name" value={postgis.datastoreName} onChange={(e) => setPostgis({ ...postgis, datastoreName: e.target.value })} sx={textFieldSx} />
          <TextField fullWidth size="small" label="GeoTIFF Path (file:// URL)" value={shapefile.filePath} onChange={(e) => setShapefile({ ...shapefile, filePath: e.target.value })} sx={textFieldSx} />
        </>
      )}
    </Box>
  );

  const renderLayersForm = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <FormControl fullWidth size="small">
        <InputLabel sx={{ color: '#888' }}>Action</InputLabel>
        <Select value={layerAction} label="Action" onChange={(e) => setLayerAction(e.target.value as LayerAction)} sx={selectSx}>
          <MenuItem value="publish">Publish Feature Type</MenuItem>
          <MenuItem value="configure">Configure Layer</MenuItem>
        </Select>
      </FormControl>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
        <TextField size="small" label="Workspace" value={layerConfig.workspace} onChange={(e) => setLayerConfig({ ...layerConfig, workspace: e.target.value })} sx={textFieldSx} />
        <TextField size="small" label="Datastore" value={layerConfig.datastore} onChange={(e) => setLayerConfig({ ...layerConfig, datastore: e.target.value })} sx={textFieldSx} />
      </Box>
      <TextField fullWidth size="small" label="Native Name (table/layer)" value={layerConfig.nativeName} onChange={(e) => setLayerConfig({ ...layerConfig, nativeName: e.target.value })} sx={textFieldSx} />
      <TextField fullWidth size="small" label="Title" value={layerConfig.title} onChange={(e) => setLayerConfig({ ...layerConfig, title: e.target.value })} sx={textFieldSx} />
      <TextField fullWidth size="small" label="SRS (e.g. EPSG:4326)" value={layerConfig.srs} onChange={(e) => setLayerConfig({ ...layerConfig, srs: e.target.value })} sx={textFieldSx} />
      {layerAction === 'publish' && (
        <>
          <Typography variant="caption" sx={{ color: 'grey.500', mt: 1 }}>Native Bounding Box</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField size="small" label="Min X" value={layerConfig.nativeBboxMinx} onChange={(e) => setLayerConfig({ ...layerConfig, nativeBboxMinx: e.target.value })} sx={textFieldSx} />
            <TextField size="small" label="Min Y" value={layerConfig.nativeBboxMiny} onChange={(e) => setLayerConfig({ ...layerConfig, nativeBboxMiny: e.target.value })} sx={textFieldSx} />
            <TextField size="small" label="Max X" value={layerConfig.nativeBboxMaxx} onChange={(e) => setLayerConfig({ ...layerConfig, nativeBboxMaxx: e.target.value })} sx={textFieldSx} />
            <TextField size="small" label="Max Y" value={layerConfig.nativeBboxMaxy} onChange={(e) => setLayerConfig({ ...layerConfig, nativeBboxMaxy: e.target.value })} sx={textFieldSx} />
          </Box>
        </>
      )}
    </Box>
  );

  const renderStylesForm = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <FormControl fullWidth size="small">
        <InputLabel sx={{ color: '#888' }}>Action</InputLabel>
        <Select value={styleAction} label="Action" onChange={(e) => setStyleAction(e.target.value as StyleAction)} sx={selectSx}>
          <MenuItem value="upload">Upload SLD Style</MenuItem>
          <MenuItem value="setDefault">Set Default Style for Layer</MenuItem>
        </Select>
      </FormControl>
      <TextField fullWidth size="small" label="Style Name" value={styleConfig.name} onChange={(e) => setStyleConfig({ ...styleConfig, name: e.target.value })} sx={textFieldSx} />
      <TextField fullWidth size="small" label="Target Workspace" value={styleConfig.targetWorkspace} onChange={(e) => setStyleConfig({ ...styleConfig, targetWorkspace: e.target.value })} sx={textFieldSx} />
      {styleAction === 'upload' && (
        <TextField fullWidth multiline rows={8} size="small" label="SLD XML Content" value={styleConfig.sldContent} onChange={(e) => setStyleConfig({ ...styleConfig, sldContent: e.target.value })} sx={textFieldSx} />
      )}
      {styleAction === 'setDefault' && (
        <TextField fullWidth size="small" label="Target Layer" value={styleConfig.targetLayer} onChange={(e) => setStyleConfig({ ...styleConfig, targetLayer: e.target.value })} sx={textFieldSx} />
      )}
    </Box>
  );

  const renderCoveragesForm = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField fullWidth size="small" label="Workspace" value={coverageConfig.workspace} onChange={(e) => setCoverageConfig({ ...coverageConfig, workspace: e.target.value })} sx={textFieldSx} />
      <TextField fullWidth size="small" label="Store Name" value={coverageConfig.storeName} onChange={(e) => setCoverageConfig({ ...coverageConfig, storeName: e.target.value })} sx={textFieldSx} />
      <TextField fullWidth size="small" label="GeoTIFF File Path (file:// URL)" value={coverageConfig.filePath} onChange={(e) => setCoverageConfig({ ...coverageConfig, filePath: e.target.value })} sx={textFieldSx} />
      <TextField fullWidth size="small" label="Coverage Name" value={coverageConfig.coverageName} onChange={(e) => setCoverageConfig({ ...coverageConfig, coverageName: e.target.value })} sx={textFieldSx} />
    </Box>
  );

  const renderWmsForm = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField fullWidth size="small" label="Workspace" value={wmsConfig.workspace} onChange={(e) => setWmsConfig({ ...wmsConfig, workspace: e.target.value })} sx={textFieldSx} />
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
        <TextField size="small" label="Max Width" value={wmsConfig.maxWidth} onChange={(e) => setWmsConfig({ ...wmsConfig, maxWidth: e.target.value })} sx={textFieldSx} />
        <TextField size="small" label="Max Height" value={wmsConfig.maxHeight} onChange={(e) => setWmsConfig({ ...wmsConfig, maxHeight: e.target.value })} sx={textFieldSx} />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          size="small"
          variant={wmsConfig.watermarkEnabled ? 'contained' : 'outlined'}
          onClick={() => setWmsConfig({ ...wmsConfig, watermarkEnabled: !wmsConfig.watermarkEnabled })}
          sx={{ textTransform: 'none', borderColor: '#333', color: wmsConfig.watermarkEnabled ? '#fff' : '#ccc' }}
        >
          Watermark {wmsConfig.watermarkEnabled ? 'ON' : 'OFF'}
        </Button>
        {wmsConfig.watermarkEnabled && (
          <TextField size="small" label="Watermark Text" value={wmsConfig.watermarkText} onChange={(e) => setWmsConfig({ ...wmsConfig, watermarkText: e.target.value })} sx={{ ...textFieldSx, flex: 1 }} />
        )}
      </Box>
    </Box>
  );

  const renderForm = () => {
    switch (tab) {
      case 'workspaces': return renderWorkspacesForm();
      case 'datastores': return renderDatastoresForm();
      case 'layers': return renderLayersForm();
      case 'styles': return renderStylesForm();
      case 'coverages': return renderCoveragesForm();
      case 'wms': return renderWmsForm();
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
          <Server size={28} color="#7c3aed" />
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#e2e8f0' }}>
            GeoServer REST API Builder
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: 'grey.500', mb: 3 }}>
          Generate cURL, fetch, or Python requests for GeoServer REST API operations.
        </Typography>

        {/* Server Configuration */}
        <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2.5, mb: 3, borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ color: '#7c3aed', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Settings size={16} /> Server Configuration
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr' }, gap: 2 }}>
            <TextField size="small" label="GeoServer URL" value={geoserverUrl} onChange={(e) => setGeoserverUrl(e.target.value)} sx={textFieldSx} />
            <TextField size="small" label="Username" value={gsUser} onChange={(e) => setGsUser(e.target.value)} sx={textFieldSx} />
            <TextField size="small" label="Password" type="password" value={gsPassword} onChange={(e) => setGsPassword(e.target.value)} sx={textFieldSx} />
          </Box>
        </Paper>

        {/* Presets */}
        <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2.5, mb: 3, borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ color: '#7c3aed', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Zap size={16} /> Quick Presets
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            {presets.map((preset) => (
              <Tooltip key={preset.name} title={preset.description}>
                <Chip
                  label={preset.name}
                  onClick={preset.apply}
                  sx={{
                    bgcolor: '#1a1a1a',
                    color: '#ccc',
                    border: '1px solid #333',
                    '&:hover': { bgcolor: '#252525', borderColor: '#7c3aed' },
                    cursor: 'pointer',
                  }}
                />
              </Tooltip>
            ))}
          </Box>
        </Paper>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3 }}>
          {/* Left: Form */}
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', borderRadius: 2, overflow: 'hidden' }}>
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                bgcolor: '#0d0d0d',
                borderBottom: '1px solid #222',
                '& .MuiTab-root': { color: '#888', textTransform: 'none', minHeight: 48, fontSize: 13 },
                '& .Mui-selected': { color: '#7c3aed !important' },
                '& .MuiTabs-indicator': { bgcolor: '#7c3aed' },
              }}
            >
              {(['workspaces', 'datastores', 'layers', 'styles', 'coverages', 'wms'] as OperationTab[]).map((t) => (
                <Tab key={t} value={t} icon={tabIcons[t]} iconPosition="start" label={t.charAt(0).toUpperCase() + t.slice(1)} />
              ))}
            </Tabs>
            <Box sx={{ p: 2.5 }}>
              {renderForm()}
            </Box>
          </Paper>

          {/* Right: Output */}
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', borderRadius: 2, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderBottom: '1px solid #222', bgcolor: '#0d0d0d' }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {(['curl', 'fetch', 'python'] as OutputFormat[]).map((fmt) => (
                  <Chip
                    key={fmt}
                    label={fmt === 'curl' ? 'cURL' : fmt === 'fetch' ? 'JavaScript' : 'Python'}
                    size="small"
                    onClick={() => setOutputFormat(fmt)}
                    sx={{
                      bgcolor: outputFormat === fmt ? '#7c3aed' : '#1a1a1a',
                      color: outputFormat === fmt ? '#fff' : '#aaa',
                      border: `1px solid ${outputFormat === fmt ? '#7c3aed' : '#333'}`,
                      cursor: 'pointer',
                      fontWeight: outputFormat === fmt ? 600 : 400,
                    }}
                  />
                ))}
              </Box>
              <Tooltip title={copied ? 'Copied!' : 'Copy to clipboard'}>
                <IconButton size="small" onClick={handleCopy} sx={{ color: copied ? '#4ade80' : '#888' }}>
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </IconButton>
              </Tooltip>
            </Box>
            <Box sx={{ p: 0, flex: 1, overflow: 'auto', maxHeight: 600 }}>
              <pre style={{
                margin: 0,
                padding: 16,
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
                fontSize: 12.5,
                lineHeight: 1.6,
                color: '#a5f3c4',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                backgroundColor: '#0a0f0a',
                minHeight: '100%',
              }}>
                <code>{generateCode}</code>
              </pre>
            </Box>
          </Paper>
        </Box>
      </Box>

      <Snackbar
        open={snackOpen}
        autoHideDuration={2500}
        onClose={() => setSnackOpen(false)}
        message={snackMsg}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}
