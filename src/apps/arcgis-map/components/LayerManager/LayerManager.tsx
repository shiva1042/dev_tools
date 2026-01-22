import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Slider from '@mui/material/Slider';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import ListSubheader from '@mui/material/ListSubheader';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import InputAdornment from '@mui/material/InputAdornment';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import LayersIcon from '@mui/icons-material/Layers';
import SearchIcon from '@mui/icons-material/Search';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useMapStore } from '../../store/mapStore';
import {
  analyzeLayerUrl,
  flattenWMSLayers,
  type LayerServiceInfo,
  type SublayerInfo,
} from '../../utils/layerUtils';
import { LAYER_TYPES, type LayerTypeConfig } from '../../config/esriConfig';
import type { LayerType, LayerConfig } from '../../types';

// Category labels for layer types
const categoryLabels: Record<string, string> = {
  feature: 'Feature Layers',
  tile: 'Tile Layers',
  imagery: 'Imagery & Map Image',
  scene: '3D Scene Layers',
  other: 'Other Layers',
};

interface SortableLayerItemProps {
  layer: LayerConfig;
  onToggleVisibility: () => void;
  onDelete: () => void;
  onUpdateOpacity: (opacity: number) => void;
  onUpdateDefinitionExpression: (expr: string) => void;
  expanded: boolean;
  onToggleExpand: () => void;
}

function SortableLayerItem({
  layer,
  onToggleVisibility,
  onDelete,
  onUpdateOpacity,
  onUpdateDefinitionExpression,
  expanded,
  onToggleExpand,
}: SortableLayerItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: layer.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Box ref={setNodeRef} style={style}>
      <ListItem
        sx={{
          bgcolor: 'rgba(255,255,255,0.02)',
          borderRadius: 1,
          mb: 0.5,
        }}
      >
        <ListItemIcon sx={{ minWidth: 32, cursor: 'grab' }} {...attributes} {...listeners}>
          <DragIndicatorIcon fontSize="small" sx={{ color: 'text.secondary' }} />
        </ListItemIcon>
        <ListItemIcon sx={{ minWidth: 32 }}>
          <IconButton size="small" onClick={onToggleVisibility}>
            {layer.visible ? (
              <VisibilityIcon fontSize="small" color="primary" />
            ) : (
              <VisibilityOffIcon fontSize="small" sx={{ color: 'text.disabled' }} />
            )}
          </IconButton>
        </ListItemIcon>
        <ListItemText
          primary={
            <Typography variant="body2" noWrap>
              {layer.title}
            </Typography>
          }
          secondary={
            <Typography variant="caption" color="text.secondary" noWrap>
              {layer.type}
              {layer.sublayers && ` (${layer.sublayers.length} sublayers)`}
              {layer.wmsSublayers && ` (${layer.wmsSublayers.length} layers)`}
            </Typography>
          }
        />
        <ListItemSecondaryAction>
          <IconButton size="small" onClick={onToggleExpand}>
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
          <IconButton size="small" onClick={onDelete} color="error">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
      <Collapse in={expanded}>
        <Box sx={{ px: 2, pb: 2, pt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Opacity: {Math.round(layer.opacity * 100)}%
          </Typography>
          <Slider
            value={layer.opacity}
            onChange={(_, value) => onUpdateOpacity(value as number)}
            min={0}
            max={1}
            step={0.1}
            size="small"
          />
          {layer.type !== 'WMSLayer' && (
            <TextField
              label="Definition Expression"
              size="small"
              fullWidth
              value={layer.definitionExpression || ''}
              onChange={(e) => onUpdateDefinitionExpression(e.target.value)}
              placeholder="e.g., STATUS = 'Active'"
              sx={{ mt: 1 }}
            />
          )}
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mt: 1, wordBreak: 'break-all' }}
          >
            URL: {layer.url}
          </Typography>
          {layer.wmsSublayers && layer.wmsSublayers.length > 0 && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" color="text.secondary">
                WMS Layers: {layer.wmsSublayers.map(s => s.name).join(', ')}
              </Typography>
            </Box>
          )}
        </Box>
      </Collapse>
      <Divider />
    </Box>
  );
}

export default function LayerManager() {
  const { layers, addLayer, updateLayer, removeLayer, reorderLayers, map } =
    useMapStore();
  const is3D = map.viewType === '3d';

  // Filter and group layer types based on current view type
  const groupedLayerTypes = useMemo(() => {
    const filtered = LAYER_TYPES.filter((l) =>
      is3D ? l.supports3D : l.supports2D
    );

    const groups: Record<string, LayerTypeConfig[]> = {};
    filtered.forEach((layer) => {
      if (!groups[layer.category]) {
        groups[layer.category] = [];
      }
      groups[layer.category].push(layer);
    });

    return groups;
  }, [is3D]);

  // Available layer types for current view
  const availableLayerTypes = useMemo(() => {
    return LAYER_TYPES.filter((l) => (is3D ? l.supports3D : l.supports2D));
  }, [is3D]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [expandedLayer, setExpandedLayer] = useState<string | null>(null);

  // URL analysis state
  const [urlInput, setUrlInput] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [serviceInfo, setServiceInfo] = useState<LayerServiceInfo | null>(null);
  const [analyzeError, setAnalyzeError] = useState('');

  // Layer config state
  const [newLayer, setNewLayer] = useState({
    type: 'FeatureLayer' as LayerType,
    title: '',
    url: '',
  });

  // Sublayer selection state (for MapImageLayer)
  const [selectedSublayers, setSelectedSublayers] = useState<number[]>([]);

  // WMS layer selection state
  const [selectedWmsLayers, setSelectedWmsLayers] = useState<string[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = layers.findIndex((l) => l.id === active.id);
      const newIndex = layers.findIndex((l) => l.id === over.id);
      const newLayers = arrayMove(layers, oldIndex, newIndex);
      reorderLayers(newLayers);
    }
  };

  const handleAnalyzeUrl = async () => {
    if (!urlInput.trim()) return;

    setAnalyzing(true);
    setAnalyzeError('');
    setServiceInfo(null);
    setSelectedSublayers([]);
    setSelectedWmsLayers([]);

    try {
      const info = await analyzeLayerUrl(urlInput);
      setServiceInfo(info);
      setNewLayer({
        type: info.type,
        title: info.name,
        url: info.serviceUrl,
      });

      // Auto-select visible sublayers for MapImageLayer
      if (info.sublayers) {
        const visibleSublayers = info.sublayers
          .filter(s => s.defaultVisibility)
          .map(s => s.id);
        setSelectedSublayers(visibleSublayers);
      }

      // Auto-select first few WMS layers
      if (info.wmsLayers) {
        const flatLayers = flattenWMSLayers(info.wmsLayers);
        const firstFew = flatLayers.slice(0, 5).map(l => l.name).filter(Boolean);
        setSelectedWmsLayers(firstFew);
      }
    } catch (err) {
      setAnalyzeError(err instanceof Error ? err.message : 'Failed to analyze URL');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleToggleSublayer = (id: number) => {
    setSelectedSublayers(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const handleToggleWmsLayer = (name: string) => {
    setSelectedWmsLayers(prev =>
      prev.includes(name)
        ? prev.filter(n => n !== name)
        : [...prev, name]
    );
  };

  const handleSelectAllSublayers = () => {
    if (serviceInfo?.sublayers) {
      if (selectedSublayers.length === serviceInfo.sublayers.length) {
        setSelectedSublayers([]);
      } else {
        setSelectedSublayers(serviceInfo.sublayers.map(s => s.id));
      }
    }
  };

  const handleSelectAllWmsLayers = () => {
    if (serviceInfo?.wmsLayers) {
      const flatLayers = flattenWMSLayers(serviceInfo.wmsLayers);
      const allNames = flatLayers.map(l => l.name).filter(Boolean);
      if (selectedWmsLayers.length === allNames.length) {
        setSelectedWmsLayers([]);
      } else {
        setSelectedWmsLayers(allNames);
      }
    }
  };

  const handleAddLayer = () => {
    if (!newLayer.title || !newLayer.url) return;

    const layerConfig: any = {
      type: newLayer.type,
      title: newLayer.title,
      url: newLayer.url,
      visible: true,
      opacity: 1,
    };

    // Add sublayer configuration for MapImageLayer
    if (newLayer.type === 'MapImageLayer' && serviceInfo?.sublayers && selectedSublayers.length > 0) {
      layerConfig.sublayers = selectedSublayers.map(id => {
        const sublayer = serviceInfo.sublayers!.find(s => s.id === id);
        return {
          id,
          visible: true,
          title: sublayer?.name || `Layer ${id}`,
        };
      });
    }

    // Add WMS sublayer configuration
    if (newLayer.type === 'WMSLayer' && serviceInfo?.wmsLayers && selectedWmsLayers.length > 0) {
      const flatLayers = flattenWMSLayers(serviceInfo.wmsLayers);
      layerConfig.wmsSublayers = selectedWmsLayers.map(name => {
        const layer = flatLayers.find(l => l.name === name);
        return {
          name,
          title: layer?.title || name,
        };
      });
    }

    addLayer(layerConfig);
    resetDialog();
    setDialogOpen(false);
  };

  const resetDialog = () => {
    setUrlInput('');
    setServiceInfo(null);
    setAnalyzeError('');
    setSelectedSublayers([]);
    setSelectedWmsLayers([]);
    setNewLayer({ type: 'FeatureLayer', title: '', url: '' });
  };

  const sortedLayers = [...layers].sort((a, b) => b.order - a.order);

  // Render MapImageLayer sublayers
  const renderSublayers = (sublayers: SublayerInfo[], parentId: number = -1, depth: number = 0) => {
    const children = sublayers.filter(s => s.parentLayerId === parentId);
    if (children.length === 0) return null;

    return children.map(sublayer => (
      <Box key={sublayer.id}>
        <ListItem
          dense
          sx={{ pl: 2 + depth * 2, cursor: 'pointer' }}
          onClick={() => handleToggleSublayer(sublayer.id)}
          component="div"
        >
          <ListItemIcon sx={{ minWidth: 32 }}>
            <Checkbox
              edge="start"
              checked={selectedSublayers.includes(sublayer.id)}
              size="small"
            />
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography variant="body2" noWrap>
                {sublayer.name}
              </Typography>
            }
            secondary={
              <Typography variant="caption" color="text.secondary">
                ID: {sublayer.id} {sublayer.type && `| ${sublayer.type}`}
              </Typography>
            }
          />
        </ListItem>
        {renderSublayers(sublayers, sublayer.id, depth + 1)}
      </Box>
    ));
  };

  // Render WMS layers
  const renderWmsLayers = () => {
    if (!serviceInfo?.wmsLayers) return null;

    const flatLayers = flattenWMSLayers(serviceInfo.wmsLayers);

    return flatLayers.map((layer, index) => (
      <ListItem
        key={`${layer.name}-${index}`}
        dense
        sx={{ pl: 2 + layer.depth * 2, cursor: 'pointer' }}
        onClick={() => layer.name && handleToggleWmsLayer(layer.name)}
        component="div"
      >
        <ListItemIcon sx={{ minWidth: 32 }}>
          <Checkbox
            edge="start"
            checked={selectedWmsLayers.includes(layer.name)}
            disabled={!layer.name}
            size="small"
          />
        </ListItemIcon>
        <ListItemText
          primary={
            <Typography variant="body2" noWrap>
              {layer.title || layer.name}
            </Typography>
          }
          secondary={
            <Typography variant="caption" color="text.secondary" noWrap>
              {layer.name}
              {layer.queryable && ' | Queryable'}
            </Typography>
          }
        />
      </ListItem>
    ));
  };

  // Get counts for display
  const getWmsLayerCount = () => {
    if (!serviceInfo?.wmsLayers) return 0;
    return flattenWMSLayers(serviceInfo.wmsLayers).filter(l => l.name).length;
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
          <LayersIcon fontSize="small" color="primary" />
          <Typography variant="subtitle2" color="primary">
            Layers ({layers.length})
          </Typography>
          <Chip
            size="small"
            label={is3D ? '3D' : '2D'}
            color={is3D ? 'secondary' : 'primary'}
            sx={{ fontSize: 10, height: 18 }}
          />
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
          Add Layer
        </Button>
      </Box>

      {layers.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 4,
            color: 'text.secondary',
          }}
        >
          <LayersIcon sx={{ fontSize: 48, opacity: 0.3 }} />
          <Typography variant="body2" sx={{ mt: 1 }}>
            No layers added yet
          </Typography>
          <Typography variant="caption">
            Click "Add Layer" to add a layer
          </Typography>
        </Box>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedLayers.map((l) => l.id)}
            strategy={verticalListSortingStrategy}
          >
            <List dense disablePadding>
              {sortedLayers.map((layer) => (
                <SortableLayerItem
                  key={layer.id}
                  layer={layer}
                  expanded={expandedLayer === layer.id}
                  onToggleExpand={() =>
                    setExpandedLayer(expandedLayer === layer.id ? null : layer.id)
                  }
                  onToggleVisibility={() =>
                    updateLayer(layer.id, { visible: !layer.visible })
                  }
                  onDelete={() => removeLayer(layer.id)}
                  onUpdateOpacity={(opacity) =>
                    updateLayer(layer.id, { opacity })
                  }
                  onUpdateDefinitionExpression={(definitionExpression) =>
                    updateLayer(layer.id, { definitionExpression })
                  }
                />
              ))}
            </List>
          </SortableContext>
        </DndContext>
      )}

      {/* Add Layer Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Layer</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* URL Input with Analyze Button */}
            <TextField
              label="Service URL"
              size="small"
              fullWidth
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://services.arcgis.com/.../MapServer or WMS URL"
              multiline
              rows={2}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="Analyze URL to detect layer type and sublayers">
                      <IconButton
                        onClick={handleAnalyzeUrl}
                        disabled={!urlInput.trim() || analyzing}
                        edge="end"
                        color="primary"
                      >
                        {analyzing ? (
                          <CircularProgress size={20} />
                        ) : (
                          <AutoFixHighIcon />
                        )}
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
              helperText="Paste a URL and click the magic wand to auto-detect layer type"
            />

            {analyzeError && (
              <Alert severity="error" onClose={() => setAnalyzeError('')}>
                {analyzeError}
              </Alert>
            )}

            {serviceInfo && (
              <Alert severity="success" icon={<SearchIcon />}>
                Detected: <strong>{serviceInfo.type}</strong>
                {serviceInfo.sublayers && ` with ${serviceInfo.sublayers.length} sublayers`}
                {serviceInfo.wmsLayers && ` with ${getWmsLayerCount()} layers`}
              </Alert>
            )}

            <Divider />

            {/* Layer Configuration */}
            <FormControl fullWidth size="small">
              <InputLabel>Layer Type</InputLabel>
              <Select
                value={newLayer.type}
                label="Layer Type"
                onChange={(e) =>
                  setNewLayer({ ...newLayer, type: e.target.value as LayerType })
                }
                MenuProps={{ PaperProps: { sx: { maxHeight: 400 } } }}
              >
                {Object.entries(groupedLayerTypes).map(([category, layerList]) => [
                  <ListSubheader key={`header-${category}`} sx={{ bgcolor: 'background.paper' }}>
                    {categoryLabels[category] || category}
                  </ListSubheader>,
                  ...layerList.map((lt) => (
                    <MenuItem key={lt.type} value={lt.type}>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="body2">{lt.label}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {lt.description}
                        </Typography>
                      </Box>
                    </MenuItem>
                  )),
                ])}
              </Select>
            </FormControl>

            <TextField
              label="Layer Title"
              size="small"
              fullWidth
              value={newLayer.title}
              onChange={(e) =>
                setNewLayer({ ...newLayer, title: e.target.value })
              }
              placeholder="My Layer"
            />

            <TextField
              label="Layer URL"
              size="small"
              fullWidth
              value={newLayer.url}
              onChange={(e) => setNewLayer({ ...newLayer, url: e.target.value })}
              placeholder="https://services.arcgis.com/..."
            />

            {/* Sublayer Selection for MapImageLayer */}
            {serviceInfo?.sublayers && serviceInfo.sublayers.length > 0 && (
              <>
                <Divider />
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2">
                      Select Sublayers ({selectedSublayers.length}/{serviceInfo.sublayers.length})
                    </Typography>
                    <Button size="small" onClick={handleSelectAllSublayers}>
                      {selectedSublayers.length === serviceInfo.sublayers.length
                        ? 'Deselect All'
                        : 'Select All'}
                    </Button>
                  </Box>
                  <Box
                    sx={{
                      maxHeight: 200,
                      overflow: 'auto',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 1,
                    }}
                  >
                    <List dense disablePadding>
                      {renderSublayers(serviceInfo.sublayers)}
                    </List>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Selected sublayers will be included in the generated code
                  </Typography>
                </Box>
              </>
            )}

            {/* WMS Layer Selection */}
            {serviceInfo?.wmsLayers && serviceInfo.wmsLayers.length > 0 && (
              <>
                <Divider />
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2">
                      Select WMS Layers ({selectedWmsLayers.length}/{getWmsLayerCount()})
                    </Typography>
                    <Button size="small" onClick={handleSelectAllWmsLayers}>
                      {selectedWmsLayers.length === getWmsLayerCount()
                        ? 'Deselect All'
                        : 'Select All'}
                    </Button>
                  </Box>
                  <Box
                    sx={{
                      maxHeight: 200,
                      overflow: 'auto',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 1,
                    }}
                  >
                    <List dense disablePadding>
                      {renderWmsLayers()}
                    </List>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Selected layers will be included in the WMSLayer sublayers configuration
                  </Typography>
                </Box>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAddLayer}
            variant="contained"
            disabled={!newLayer.title || !newLayer.url}
          >
            Add Layer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
