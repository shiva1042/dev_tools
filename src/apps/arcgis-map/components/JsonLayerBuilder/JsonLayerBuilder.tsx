import { useState, useCallback, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Slider from '@mui/material/Slider';
import Paper from '@mui/material/Paper';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DataObjectIcon from '@mui/icons-material/DataObject';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ImageIcon from '@mui/icons-material/Image';
import CircleIcon from '@mui/icons-material/Circle';
import SquareIcon from '@mui/icons-material/Square';
import { useMapStore } from '../../store/mapStore';
import type {
  PointSymbol,
  SimpleSymbol,
  PictureMarkerSymbol,
  RendererConfig,
  JsonDataLayerConfig,
} from '../../types';

interface ParsedField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'unknown';
  sampleValue: unknown;
}

interface UniqueValueConfig {
  value: string | number;
  symbol: PointSymbol;
  label: string;
}

const markerStyles: { value: string; label: string; icon: React.ReactNode }[] = [
  { value: 'circle', label: 'Circle', icon: <CircleIcon fontSize="small" /> },
  { value: 'square', label: 'Square', icon: <SquareIcon fontSize="small" /> },
  { value: 'diamond', label: 'Diamond', icon: <CircleIcon fontSize="small" sx={{ transform: 'rotate(45deg)' }} /> },
  { value: 'cross', label: 'Cross', icon: <AddIcon fontSize="small" /> },
  { value: 'triangle', label: 'Triangle', icon: <CircleIcon fontSize="small" /> },
];

function ColorPicker({
  label,
  color,
  onChange,
}: {
  label: string;
  color: [number, number, number, number];
  onChange: (color: [number, number, number, number]) => void;
}) {
  const hexColor = `#${color.slice(0, 3).map((c) => c.toString(16).padStart(2, '0')).join('')}`;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography variant="caption" sx={{ minWidth: 60 }}>
        {label}:
      </Typography>
      <input
        type="color"
        value={hexColor}
        onChange={(e) => {
          const hex = e.target.value;
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          onChange([r, g, b, color[3]]);
        }}
        style={{ width: 40, height: 24, border: 'none', cursor: 'pointer' }}
      />
      <Slider
        size="small"
        value={color[3]}
        min={0}
        max={1}
        step={0.1}
        onChange={(_, v) => onChange([color[0], color[1], color[2], v as number])}
        sx={{ width: 60 }}
      />
    </Box>
  );
}

function SimpleMarkerEditor({
  symbol,
  onChange,
}: {
  symbol: SimpleSymbol;
  onChange: (symbol: SimpleSymbol) => void;
}) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <FormControl size="small" fullWidth>
        <InputLabel>Style</InputLabel>
        <Select
          value={symbol.style || 'circle'}
          label="Style"
          onChange={(e) =>
            onChange({ ...symbol, style: e.target.value as SimpleSymbol['style'] })
          }
        >
          {markerStyles.map((style) => (
            <MenuItem key={style.value} value={style.value}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {style.icon}
                {style.label}
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <ColorPicker
        label="Color"
        color={symbol.color}
        onChange={(color) => onChange({ ...symbol, color })}
      />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="caption" sx={{ minWidth: 60 }}>
          Size:
        </Typography>
        <Slider
          size="small"
          value={symbol.size || 8}
          min={4}
          max={32}
          onChange={(_, v) => onChange({ ...symbol, size: v as number })}
          sx={{ flex: 1 }}
        />
        <Typography variant="caption" sx={{ minWidth: 24 }}>
          {symbol.size || 8}
        </Typography>
      </Box>

      <ColorPicker
        label="Outline"
        color={symbol.outline?.color || [0, 0, 0, 1]}
        onChange={(color) =>
          onChange({
            ...symbol,
            outline: { color, width: symbol.outline?.width || 1 },
          })
        }
      />
    </Box>
  );
}

function PictureMarkerEditor({
  symbol,
  onChange,
}: {
  symbol: PictureMarkerSymbol;
  onChange: (symbol: PictureMarkerSymbol) => void;
}) {
  const [previewError, setPreviewError] = useState(false);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <TextField
        label="Image URL"
        size="small"
        fullWidth
        value={symbol.url}
        onChange={(e) => {
          setPreviewError(false);
          onChange({ ...symbol, url: e.target.value });
        }}
        placeholder="https://example.com/icon.png"
        helperText="Enter URL of marker image (PNG, SVG, etc.)"
      />

      {symbol.url && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Paper
            variant="outlined"
            sx={{
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 60,
              height: 60,
              bgcolor: 'rgba(255,255,255,0.05)',
            }}
          >
            {previewError ? (
              <ImageIcon color="disabled" />
            ) : (
              <img
                src={symbol.url}
                alt="Preview"
                style={{ maxWidth: '100%', maxHeight: '100%' }}
                onError={() => setPreviewError(true)}
              />
            )}
          </Paper>
          <Typography variant="caption" color="text.secondary">
            Preview
          </Typography>
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption">Width: {symbol.width}px</Typography>
          <Slider
            size="small"
            value={symbol.width}
            min={8}
            max={64}
            onChange={(_, v) => onChange({ ...symbol, width: v as number })}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption">Height: {symbol.height}px</Typography>
          <Slider
            size="small"
            value={symbol.height}
            min={8}
            max={64}
            onChange={(_, v) => onChange({ ...symbol, height: v as number })}
          />
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          label="X Offset"
          size="small"
          type="number"
          value={symbol.xoffset || 0}
          onChange={(e) =>
            onChange({ ...symbol, xoffset: parseFloat(e.target.value) || 0 })
          }
          sx={{ flex: 1 }}
        />
        <TextField
          label="Y Offset"
          size="small"
          type="number"
          value={symbol.yoffset || 0}
          onChange={(e) =>
            onChange({ ...symbol, yoffset: parseFloat(e.target.value) || 0 })
          }
          sx={{ flex: 1 }}
        />
      </Box>
    </Box>
  );
}

function SymbolEditor({
  symbol,
  onChange,
}: {
  symbol: PointSymbol;
  onChange: (symbol: PointSymbol) => void;
}) {
  const [symbolType, setSymbolType] = useState<'simple' | 'picture'>(
    symbol.type === 'picture-marker' ? 'picture' : 'simple'
  );

  const handleTypeChange = (type: 'simple' | 'picture') => {
    setSymbolType(type);
    if (type === 'simple') {
      onChange({
        type: 'simple-marker',
        color: [0, 120, 255, 1],
        size: 8,
        style: 'circle',
        outline: { color: [255, 255, 255, 1], width: 1 },
      });
    } else {
      onChange({
        type: 'picture-marker',
        url: '',
        width: 24,
        height: 24,
      });
    }
  };

  return (
    <Box>
      <Tabs
        value={symbolType}
        onChange={(_, v) => handleTypeChange(v)}
        sx={{ mb: 2 }}
      >
        <Tab value="simple" label="Simple Marker" icon={<CircleIcon />} iconPosition="start" />
        <Tab value="picture" label="Picture Marker" icon={<ImageIcon />} iconPosition="start" />
      </Tabs>

      {symbolType === 'simple' && symbol.type !== 'picture-marker' && (
        <SimpleMarkerEditor
          symbol={symbol as SimpleSymbol}
          onChange={onChange}
        />
      )}

      {symbolType === 'picture' && symbol.type === 'picture-marker' && (
        <PictureMarkerEditor
          symbol={symbol as PictureMarkerSymbol}
          onChange={onChange}
        />
      )}
    </Box>
  );
}

export default function JsonLayerBuilder() {
  const { jsonDataLayers, addJsonDataLayer, removeJsonDataLayer } = useMapStore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [step, setStep] = useState(0);

  // JSON data state
  const [jsonData, setJsonData] = useState<Record<string, unknown>[]>([]);
  const [parsedFields, setParsedFields] = useState<ParsedField[]>([]);
  const [parseError, setParseError] = useState('');

  // Layer config state
  const [layerTitle, setLayerTitle] = useState('JSON Data Layer');
  const [latField, setLatField] = useState('');
  const [lonField, setLonField] = useState('');
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);

  // Renderer state
  const [rendererType, setRendererType] = useState<'simple' | 'unique-value'>('simple');
  const [rendererField, setRendererField] = useState('');
  const [defaultSymbol, setDefaultSymbol] = useState<PointSymbol>({
    type: 'simple-marker',
    color: [0, 120, 255, 1],
    size: 8,
    style: 'circle',
    outline: { color: [255, 255, 255, 1], width: 1 },
  });
  const [uniqueValueConfigs, setUniqueValueConfigs] = useState<UniqueValueConfig[]>([]);

  // Get unique values for a field
  const uniqueValuesForField = useMemo(() => {
    if (!rendererField || jsonData.length === 0) return [];
    const values = new Set<string | number>();
    jsonData.forEach((row) => {
      const val = row[rendererField];
      if (val !== null && val !== undefined && typeof val !== 'object') {
        values.add(val as string | number);
      }
    });
    return Array.from(values).slice(0, 20); // Limit to 20 unique values
  }, [rendererField, jsonData]);

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const data = JSON.parse(text);

          // Handle array or object with array property
          let dataArray: Record<string, unknown>[];
          if (Array.isArray(data)) {
            dataArray = data;
          } else if (data.features && Array.isArray(data.features)) {
            // GeoJSON format
            dataArray = data.features.map((f: any) => ({
              ...f.properties,
              _geometry: f.geometry,
            }));
          } else if (typeof data === 'object') {
            // Try to find an array property
            const arrayProp = Object.keys(data).find((k) =>
              Array.isArray(data[k])
            );
            if (arrayProp) {
              dataArray = data[arrayProp];
            } else {
              throw new Error('Could not find array data in JSON');
            }
          } else {
            throw new Error('Invalid JSON format');
          }

          if (dataArray.length === 0) {
            throw new Error('JSON array is empty');
          }

          setJsonData(dataArray);

          // Parse fields from first item
          const fields: ParsedField[] = [];
          const sample = dataArray[0];
          Object.keys(sample).forEach((key) => {
            const value = sample[key];
            let type: ParsedField['type'] = 'unknown';
            if (typeof value === 'string') type = 'string';
            else if (typeof value === 'number') type = 'number';
            else if (typeof value === 'boolean') type = 'boolean';
            else if (typeof value === 'object') type = 'object';

            fields.push({ name: key, type, sampleValue: value });
          });

          setParsedFields(fields);
          setParseError('');

          // Auto-detect lat/lon fields
          const latFieldNames = ['lat', 'latitude', 'y', 'lat_dd', 'latitude_dd'];
          const lonFieldNames = ['lon', 'lng', 'longitude', 'x', 'long', 'lon_dd', 'longitude_dd'];

          const detectedLat = fields.find((f) =>
            latFieldNames.includes(f.name.toLowerCase())
          );
          const detectedLon = fields.find((f) =>
            lonFieldNames.includes(f.name.toLowerCase())
          );

          if (detectedLat) setLatField(detectedLat.name);
          if (detectedLon) setLonField(detectedLon.name);

          // Auto-select string/number fields as attributes
          const attrFields = fields
            .filter((f) => f.type === 'string' || f.type === 'number')
            .slice(0, 5)
            .map((f) => f.name);
          setSelectedAttributes(attrFields);

          setStep(1);
        } catch (err) {
          setParseError(
            err instanceof Error ? err.message : 'Failed to parse JSON'
          );
        }
      };
      reader.readAsText(file);
    },
    []
  );

  const handlePasteJson = useCallback((text: string) => {
    try {
      const data = JSON.parse(text);
      let dataArray: Record<string, unknown>[];

      if (Array.isArray(data)) {
        dataArray = data;
      } else if (data.features && Array.isArray(data.features)) {
        dataArray = data.features.map((f: any) => ({
          ...f.properties,
          _geometry: f.geometry,
        }));
      } else {
        const arrayProp = Object.keys(data).find((k) => Array.isArray(data[k]));
        if (arrayProp) {
          dataArray = data[arrayProp];
        } else {
          throw new Error('Could not find array data in JSON');
        }
      }

      if (dataArray.length === 0) {
        throw new Error('JSON array is empty');
      }

      setJsonData(dataArray);

      const fields: ParsedField[] = [];
      const sample = dataArray[0];
      Object.keys(sample).forEach((key) => {
        const value = sample[key];
        let type: ParsedField['type'] = 'unknown';
        if (typeof value === 'string') type = 'string';
        else if (typeof value === 'number') type = 'number';
        else if (typeof value === 'boolean') type = 'boolean';
        else if (typeof value === 'object') type = 'object';

        fields.push({ name: key, type, sampleValue: value });
      });

      setParsedFields(fields);
      setParseError('');

      const latFieldNames = ['lat', 'latitude', 'y', 'lat_dd'];
      const lonFieldNames = ['lon', 'lng', 'longitude', 'x', 'long', 'lon_dd'];

      const detectedLat = fields.find((f) =>
        latFieldNames.includes(f.name.toLowerCase())
      );
      const detectedLon = fields.find((f) =>
        lonFieldNames.includes(f.name.toLowerCase())
      );

      if (detectedLat) setLatField(detectedLat.name);
      if (detectedLon) setLonField(detectedLon.name);

      const attrFields = fields
        .filter((f) => f.type === 'string' || f.type === 'number')
        .slice(0, 5)
        .map((f) => f.name);
      setSelectedAttributes(attrFields);

      setStep(1);
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Failed to parse JSON');
    }
  }, []);

  const handleAddUniqueValue = () => {
    const unusedValue = uniqueValuesForField.find(
      (v) => !uniqueValueConfigs.some((c) => c.value === v)
    );

    if (unusedValue !== undefined) {
      setUniqueValueConfigs([
        ...uniqueValueConfigs,
        {
          value: unusedValue,
          label: String(unusedValue),
          symbol: {
            type: 'simple-marker',
            color: [
              Math.floor(Math.random() * 256),
              Math.floor(Math.random() * 256),
              Math.floor(Math.random() * 256),
              1,
            ],
            size: 8,
            style: 'circle',
            outline: { color: [255, 255, 255, 1], width: 1 },
          },
        },
      ]);
    }
  };

  const handleRemoveUniqueValue = (index: number) => {
    setUniqueValueConfigs(uniqueValueConfigs.filter((_, i) => i !== index));
  };

  const handleUpdateUniqueValue = (
    index: number,
    updates: Partial<UniqueValueConfig>
  ) => {
    setUniqueValueConfigs(
      uniqueValueConfigs.map((c, i) => (i === index ? { ...c, ...updates } : c))
    );
  };

  const handleCreateLayer = () => {
    if (!latField || !lonField) return;

    let renderer: RendererConfig | undefined;
    if (rendererType === 'unique-value' && rendererField && uniqueValueConfigs.length > 0) {
      renderer = {
        type: 'unique-value',
        field: rendererField,
        symbol: defaultSymbol,
        uniqueValueInfos: uniqueValueConfigs.map((c) => ({
          value: c.value,
          symbol: c.symbol,
          label: c.label,
        })),
      };
    }

    const layerConfig: Omit<JsonDataLayerConfig, 'id'> = {
      title: layerTitle,
      data: jsonData,
      fieldMapping: {
        latitudeField: latField,
        longitudeField: lonField,
        attributeFields: selectedAttributes,
      },
      symbol: defaultSymbol,
      renderer,
    };

    addJsonDataLayer(layerConfig);
    resetDialog();
    setDialogOpen(false);
  };

  const resetDialog = () => {
    setStep(0);
    setJsonData([]);
    setParsedFields([]);
    setParseError('');
    setLayerTitle('JSON Data Layer');
    setLatField('');
    setLonField('');
    setSelectedAttributes([]);
    setRendererType('simple');
    setRendererField('');
    setDefaultSymbol({
      type: 'simple-marker',
      color: [0, 120, 255, 1],
      size: 8,
      style: 'circle',
      outline: { color: [255, 255, 255, 1], width: 1 },
    });
    setUniqueValueConfigs([]);
  };

  const numericFields = parsedFields.filter((f) => f.type === 'number');
  const stringFields = parsedFields.filter(
    (f) => f.type === 'string' || f.type === 'number'
  );

  return (
    <Box sx={{ p: 2 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DataObjectIcon fontSize="small" color="primary" />
          <Typography variant="subtitle2" color="primary">
            JSON Data Layers ({jsonDataLayers.length})
          </Typography>
        </Box>
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={() => {
            resetDialog();
            setDialogOpen(true);
          }}
          variant="outlined"
        >
          Add JSON Layer
        </Button>
      </Box>

      {jsonDataLayers.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 4,
            color: 'text.secondary',
          }}
        >
          <DataObjectIcon sx={{ fontSize: 48, opacity: 0.3 }} />
          <Typography variant="body2" sx={{ mt: 1 }}>
            No JSON data layers
          </Typography>
          <Typography variant="caption">
            Upload JSON to create point layers
          </Typography>
        </Box>
      ) : (
        <List dense disablePadding>
          {jsonDataLayers.map((layer) => (
            <ListItem
              key={layer.id}
              sx={{
                bgcolor: 'rgba(255,255,255,0.02)',
                borderRadius: 1,
                mb: 0.5,
              }}
            >
              <ListItemText
                primary={
                  <Typography variant="body2" noWrap>
                    {layer.title}
                  </Typography>
                }
                secondary={
                  <Typography variant="caption" color="text.secondary">
                    {layer.data.length} features |{' '}
                    {layer.symbol.type === 'picture-marker'
                      ? 'Picture Marker'
                      : 'Simple Marker'}
                    {layer.renderer?.type === 'unique-value' &&
                      ` | ${layer.renderer.uniqueValueInfos?.length} categories`}
                  </Typography>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  size="small"
                  onClick={() => removeJsonDataLayer(layer.id)}
                  color="error"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}

      {/* Add JSON Layer Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add JSON Data Layer</DialogTitle>
        <DialogContent>
          {step === 0 && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Upload a JSON file or paste JSON data to create a point layer.
                Supports arrays of objects or GeoJSON format.
              </Typography>

              <Box
                sx={{
                  border: '2px dashed rgba(255,255,255,0.2)',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  mb: 2,
                }}
              >
                <input
                  type="file"
                  accept=".json,.geojson"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  id="json-file-input"
                />
                <label htmlFor="json-file-input">
                  <Button
                    component="span"
                    variant="contained"
                    startIcon={<UploadFileIcon />}
                  >
                    Upload JSON File
                  </Button>
                </label>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  .json or .geojson files
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }}>OR</Divider>

              <TextField
                label="Paste JSON Data"
                multiline
                rows={6}
                fullWidth
                placeholder='[{"lat": 12.97, "lon": 77.59, "name": "Point 1"}, ...]'
                onChange={(e) => {
                  if (e.target.value.trim()) {
                    handlePasteJson(e.target.value);
                  }
                }}
              />

              {parseError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {parseError}
                </Alert>
              )}
            </Box>
          )}

          {step === 1 && (
            <Box sx={{ pt: 2 }}>
              <Alert severity="success" sx={{ mb: 2 }}>
                Loaded {jsonData.length} records with {parsedFields.length}{' '}
                fields
              </Alert>

              <TextField
                label="Layer Title"
                size="small"
                fullWidth
                value={layerTitle}
                onChange={(e) => setLayerTitle(e.target.value)}
                sx={{ mb: 2 }}
              />

              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Field Mapping
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <FormControl size="small" fullWidth>
                  <InputLabel>Latitude Field *</InputLabel>
                  <Select
                    value={latField}
                    label="Latitude Field *"
                    onChange={(e) => setLatField(e.target.value)}
                  >
                    {numericFields.map((f) => (
                      <MenuItem key={f.name} value={f.name}>
                        {f.name} ({String(f.sampleValue)})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl size="small" fullWidth>
                  <InputLabel>Longitude Field *</InputLabel>
                  <Select
                    value={lonField}
                    label="Longitude Field *"
                    onChange={(e) => setLonField(e.target.value)}
                  >
                    {numericFields.map((f) => (
                      <MenuItem key={f.name} value={f.name}>
                        {f.name} ({String(f.sampleValue)})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Attribute Fields (for popups)
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                {parsedFields
                  .filter((f) => f.name !== latField && f.name !== lonField)
                  .map((f) => (
                    <Chip
                      key={f.name}
                      label={f.name}
                      size="small"
                      variant={
                        selectedAttributes.includes(f.name)
                          ? 'filled'
                          : 'outlined'
                      }
                      color={
                        selectedAttributes.includes(f.name)
                          ? 'primary'
                          : 'default'
                      }
                      onClick={() => {
                        if (selectedAttributes.includes(f.name)) {
                          setSelectedAttributes(
                            selectedAttributes.filter((a) => a !== f.name)
                          );
                        } else {
                          setSelectedAttributes([...selectedAttributes, f.name]);
                        }
                      }}
                    />
                  ))}
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Symbology
              </Typography>

              <Box sx={{ mb: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rendererType === 'unique-value'}
                      onChange={(e) =>
                        setRendererType(
                          e.target.checked ? 'unique-value' : 'simple'
                        )
                      }
                    />
                  }
                  label="Use different symbols based on attribute value"
                />
              </Box>

              {rendererType === 'unique-value' && (
                <Box sx={{ mb: 2 }}>
                  <FormControl size="small" fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Renderer Field</InputLabel>
                    <Select
                      value={rendererField}
                      label="Renderer Field"
                      onChange={(e) => {
                        setRendererField(e.target.value);
                        setUniqueValueConfigs([]);
                      }}
                    >
                      {stringFields.map((f) => (
                        <MenuItem key={f.name} value={f.name}>
                          {f.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {rendererField && (
                    <Box>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mb: 1,
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          Unique values: {uniqueValuesForField.length} found
                        </Typography>
                        <Button
                          size="small"
                          startIcon={<AddIcon />}
                          onClick={handleAddUniqueValue}
                          disabled={
                            uniqueValueConfigs.length >=
                            uniqueValuesForField.length
                          }
                        >
                          Add Value
                        </Button>
                      </Box>

                      {uniqueValueConfigs.map((config, index) => (
                        <Accordion key={index} sx={{ mb: 1 }}>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                flex: 1,
                              }}
                            >
                              <Box
                                sx={{
                                  width: 16,
                                  height: 16,
                                  borderRadius: '50%',
                                  bgcolor:
                                    config.symbol.type === 'picture-marker'
                                      ? 'transparent'
                                      : `rgba(${(config.symbol as SimpleSymbol).color.join(',')})`,
                                  border: '1px solid rgba(255,255,255,0.3)',
                                }}
                              />
                              <Typography variant="body2">
                                {config.label || String(config.value)}
                              </Typography>
                            </Box>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveUniqueValue(index);
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                              <FormControl size="small" sx={{ flex: 1 }}>
                                <InputLabel>Value</InputLabel>
                                <Select
                                  value={config.value}
                                  label="Value"
                                  onChange={(e) =>
                                    handleUpdateUniqueValue(index, {
                                      value: e.target.value,
                                    })
                                  }
                                >
                                  {uniqueValuesForField.map((v) => (
                                    <MenuItem key={String(v)} value={v}>
                                      {String(v)}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                              <TextField
                                label="Label"
                                size="small"
                                value={config.label}
                                onChange={(e) =>
                                  handleUpdateUniqueValue(index, {
                                    label: e.target.value,
                                  })
                                }
                                sx={{ flex: 1 }}
                              />
                            </Box>
                            <SymbolEditor
                              symbol={config.symbol}
                              onChange={(symbol) =>
                                handleUpdateUniqueValue(index, { symbol })
                              }
                            />
                          </AccordionDetails>
                        </Accordion>
                      ))}
                    </Box>
                  )}
                </Box>
              )}

              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {rendererType === 'unique-value'
                  ? 'Default Symbol (for unmatched values)'
                  : 'Symbol'}
              </Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <SymbolEditor symbol={defaultSymbol} onChange={setDefaultSymbol} />
              </Paper>

              <Button
                sx={{ mt: 2 }}
                variant="text"
                onClick={() => setStep(0)}
              >
                Back to Upload
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateLayer}
            variant="contained"
            disabled={step === 0 || !latField || !lonField}
          >
            Create Layer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
