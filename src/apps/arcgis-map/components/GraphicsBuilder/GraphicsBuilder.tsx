import { useState } from 'react';
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
import ListItemIcon from '@mui/material/ListItemIcon';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Divider from '@mui/material/Divider';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PlaceIcon from '@mui/icons-material/Place';
import TimelineIcon from '@mui/icons-material/Timeline';
import ChangeHistoryIcon from '@mui/icons-material/ChangeHistory';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DrawIcon from '@mui/icons-material/Draw';
import { useMapStore } from '../../store/mapStore';
import type { GeometryType, Geometry, SimpleSymbol } from '../../types';

const geometryTypes: {
  value: GeometryType;
  label: string;
  icon: React.ReactNode;
}[] = [
  { value: 'point', label: 'Point', icon: <PlaceIcon /> },
  { value: 'polyline', label: 'Polyline', icon: <TimelineIcon /> },
  { value: 'polygon', label: 'Polygon', icon: <ChangeHistoryIcon /> },
];

function getGeometryIcon(type: GeometryType): React.ReactNode {
  const geom = geometryTypes.find((g) => g.value === type);
  return geom?.icon || <DrawIcon />;
}

interface ColorPickerProps {
  label: string;
  value: [number, number, number, number];
  onChange: (color: [number, number, number, number]) => void;
}

function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  const hexColor = `#${value
    .slice(0, 3)
    .map((c) => c.toString(16).padStart(2, '0'))
    .join('')}`;

  const handleColorChange = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    onChange([r, g, b, value[3]]);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography variant="caption" sx={{ minWidth: 60 }}>
        {label}:
      </Typography>
      <input
        type="color"
        value={hexColor}
        onChange={(e) => handleColorChange(e.target.value)}
        style={{ width: 32, height: 32, border: 'none', cursor: 'pointer' }}
      />
      <TextField
        label="Opacity"
        type="number"
        size="small"
        value={value[3]}
        onChange={(e) =>
          onChange([value[0], value[1], value[2], parseFloat(e.target.value)])
        }
        inputProps={{ min: 0, max: 1, step: 0.1 }}
        sx={{ width: 80 }}
      />
    </Box>
  );
}

export default function GraphicsBuilder() {
  const { graphics, addGraphic, removeGraphic } = useMapStore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [jsonInput, setJsonInput] = useState('');
  const [jsonError, setJsonError] = useState('');

  const [newGraphic, setNewGraphic] = useState<{
    geometryType: GeometryType;
    longitude: number;
    latitude: number;
    paths: string;
    rings: string;
    symbolColor: [number, number, number, number];
    symbolSize: number;
    outlineColor: [number, number, number, number];
    outlineWidth: number;
  }>({
    geometryType: 'point',
    longitude: 77.59,
    latitude: 12.97,
    paths: '[[77.59, 12.97], [77.69, 13.07], [77.79, 12.87]]',
    rings: '[[77.59, 12.97], [77.69, 13.07], [77.79, 12.87], [77.59, 12.97]]',
    symbolColor: [0, 122, 194, 1],
    symbolSize: 10,
    outlineColor: [255, 255, 255, 1],
    outlineWidth: 2,
  });

  const getSymbolType = (
    geomType: GeometryType
  ): 'simple-marker' | 'simple-line' | 'simple-fill' => {
    switch (geomType) {
      case 'point':
        return 'simple-marker';
      case 'polyline':
        return 'simple-line';
      case 'polygon':
        return 'simple-fill';
    }
  };

  const handleAddGraphic = () => {
    let geometry: Geometry;

    if (newGraphic.geometryType === 'point') {
      geometry = {
        type: 'point',
        longitude: newGraphic.longitude,
        latitude: newGraphic.latitude,
      };
    } else if (newGraphic.geometryType === 'polyline') {
      try {
        const paths = JSON.parse(`[${newGraphic.paths}]`);
        geometry = { type: 'polyline', paths: [paths] };
      } catch {
        return;
      }
    } else {
      try {
        const rings = JSON.parse(`[${newGraphic.rings}]`);
        geometry = { type: 'polygon', rings: [rings] };
      } catch {
        return;
      }
    }

    const symbol: SimpleSymbol = {
      type: getSymbolType(newGraphic.geometryType),
      color: newGraphic.symbolColor,
      size: newGraphic.symbolSize,
      outline: {
        color: newGraphic.outlineColor,
        width: newGraphic.outlineWidth,
      },
    };

    addGraphic({ geometry, symbol });
    setDialogOpen(false);
  };

  const handleImportJson = () => {
    try {
      const data = JSON.parse(jsonInput);

      // Handle GeoJSON format
      if (data.type === 'FeatureCollection' && data.features) {
        data.features.forEach((feature: any) => {
          const geomType = feature.geometry.type.toLowerCase();
          let geometry: Geometry;

          if (geomType === 'point') {
            geometry = {
              type: 'point',
              longitude: feature.geometry.coordinates[0],
              latitude: feature.geometry.coordinates[1],
            };
          } else if (geomType === 'linestring') {
            geometry = {
              type: 'polyline',
              paths: [feature.geometry.coordinates],
            };
          } else if (geomType === 'polygon') {
            geometry = {
              type: 'polygon',
              rings: feature.geometry.coordinates,
            };
          } else {
            return;
          }

          const symbol: SimpleSymbol = {
            type: getSymbolType(geometry.type),
            color: [0, 122, 194, 0.8],
            size: 10,
            outline: {
              color: [255, 255, 255, 1],
              width: 2,
            },
          };

          addGraphic({ geometry, symbol, attributes: feature.properties });
        });
      }
      // Handle direct geometry array
      else if (Array.isArray(data)) {
        data.forEach((item: any) => {
          if (item.geometry && item.symbol) {
            addGraphic(item);
          }
        });
      }

      setJsonInput('');
      setJsonError('');
      setDialogOpen(false);
    } catch (err) {
      setJsonError('Invalid JSON format');
    }
  };

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
          <DrawIcon fontSize="small" color="primary" />
          <Typography variant="subtitle2" color="primary">
            Graphics ({graphics.length})
          </Typography>
        </Box>
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
          variant="outlined"
        >
          Add Graphic
        </Button>
      </Box>

      {graphics.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 4,
            color: 'text.secondary',
          }}
        >
          <DrawIcon sx={{ fontSize: 48, opacity: 0.3 }} />
          <Typography variant="body2" sx={{ mt: 1 }}>
            No graphics added yet
          </Typography>
          <Typography variant="caption">
            Click "Add Graphic" to draw on the map
          </Typography>
        </Box>
      ) : (
        <List dense disablePadding>
          {graphics.map((graphic, index) => (
            <ListItem
              key={graphic.id}
              sx={{
                bgcolor: 'rgba(255,255,255,0.02)',
                borderRadius: 1,
                mb: 0.5,
              }}
              secondaryAction={
                <IconButton
                  size="small"
                  onClick={() => removeGraphic(graphic.id)}
                  color="error"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              }
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                {getGeometryIcon(graphic.geometry.type)}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="body2">
                    {graphic.geometry.type.charAt(0).toUpperCase() +
                      graphic.geometry.type.slice(1)}{' '}
                    #{index + 1}
                  </Typography>
                }
                secondary={
                  <Typography variant="caption" color="text.secondary">
                    {graphic.geometry.type === 'point'
                      ? `${graphic.geometry.longitude.toFixed(4)}, ${graphic.geometry.latitude.toFixed(4)}`
                      : graphic.geometry.type === 'polyline'
                        ? `${graphic.geometry.paths[0].length} points`
                        : `${graphic.geometry.rings[0].length} vertices`}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      )}

      {/* Add Graphic Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Graphic</DialogTitle>
        <DialogContent>
          <Tabs
            value={tabIndex}
            onChange={(_, v) => setTabIndex(v)}
            sx={{ mb: 2 }}
          >
            <Tab label="Draw" icon={<DrawIcon />} iconPosition="start" />
            <Tab label="Import JSON" icon={<UploadFileIcon />} iconPosition="start" />
          </Tabs>

          {tabIndex === 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Geometry Type</InputLabel>
                <Select
                  value={newGraphic.geometryType}
                  label="Geometry Type"
                  onChange={(e) =>
                    setNewGraphic({
                      ...newGraphic,
                      geometryType: e.target.value as GeometryType,
                    })
                  }
                >
                  {geometryTypes.map((gt) => (
                    <MenuItem key={gt.value} value={gt.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {gt.icon}
                        <span>{gt.label}</span>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Divider />

              {newGraphic.geometryType === 'point' && (
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label="Longitude"
                    type="number"
                    size="small"
                    value={newGraphic.longitude}
                    onChange={(e) =>
                      setNewGraphic({
                        ...newGraphic,
                        longitude: parseFloat(e.target.value),
                      })
                    }
                    fullWidth
                  />
                  <TextField
                    label="Latitude"
                    type="number"
                    size="small"
                    value={newGraphic.latitude}
                    onChange={(e) =>
                      setNewGraphic({
                        ...newGraphic,
                        latitude: parseFloat(e.target.value),
                      })
                    }
                    fullWidth
                  />
                </Box>
              )}

              {newGraphic.geometryType === 'polyline' && (
                <TextField
                  label="Path Coordinates"
                  size="small"
                  fullWidth
                  multiline
                  rows={3}
                  value={newGraphic.paths}
                  onChange={(e) =>
                    setNewGraphic({ ...newGraphic, paths: e.target.value })
                  }
                  placeholder="[lon, lat], [lon, lat], ..."
                  helperText="Enter coordinates as [longitude, latitude] pairs"
                />
              )}

              {newGraphic.geometryType === 'polygon' && (
                <TextField
                  label="Ring Coordinates"
                  size="small"
                  fullWidth
                  multiline
                  rows={3}
                  value={newGraphic.rings}
                  onChange={(e) =>
                    setNewGraphic({ ...newGraphic, rings: e.target.value })
                  }
                  placeholder="[lon, lat], [lon, lat], ... (close the ring)"
                  helperText="Enter coordinates - first and last point should be the same"
                />
              )}

              <Divider />

              <Typography variant="body2" fontWeight={500}>
                Symbol Style
              </Typography>

              <ColorPicker
                label="Fill"
                value={newGraphic.symbolColor}
                onChange={(color) =>
                  setNewGraphic({ ...newGraphic, symbolColor: color })
                }
              />

              {newGraphic.geometryType === 'point' && (
                <TextField
                  label="Size"
                  type="number"
                  size="small"
                  value={newGraphic.symbolSize}
                  onChange={(e) =>
                    setNewGraphic({
                      ...newGraphic,
                      symbolSize: parseInt(e.target.value),
                    })
                  }
                  sx={{ width: 100 }}
                />
              )}

              <ColorPicker
                label="Outline"
                value={newGraphic.outlineColor}
                onChange={(color) =>
                  setNewGraphic({ ...newGraphic, outlineColor: color })
                }
              />

              <TextField
                label="Outline Width"
                type="number"
                size="small"
                value={newGraphic.outlineWidth}
                onChange={(e) =>
                  setNewGraphic({
                    ...newGraphic,
                    outlineWidth: parseInt(e.target.value),
                  })
                }
                sx={{ width: 100 }}
              />
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Paste GeoJSON FeatureCollection or array of graphics:
              </Typography>
              <TextField
                multiline
                rows={10}
                fullWidth
                value={jsonInput}
                onChange={(e) => {
                  setJsonInput(e.target.value);
                  setJsonError('');
                }}
                error={!!jsonError}
                helperText={jsonError}
                placeholder={`{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [77.59, 12.97]
      },
      "properties": {}
    }
  ]
}`}
                sx={{
                  '& .MuiInputBase-input': {
                    fontFamily: 'monospace',
                    fontSize: 12,
                  },
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          {tabIndex === 0 ? (
            <Button onClick={handleAddGraphic} variant="contained">
              Add Graphic
            </Button>
          ) : (
            <Button
              onClick={handleImportJson}
              variant="contained"
              disabled={!jsonInput}
            >
              Import
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
