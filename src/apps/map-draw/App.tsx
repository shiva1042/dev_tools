import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Tooltip,
  Paper,
  ToggleButtonGroup,
  ToggleButton,
  Button,
  Divider,
  Slider,
  Popover,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import HomeIcon from '@mui/icons-material/Home';
import PlaceIcon from '@mui/icons-material/Place';
import ChangeHistoryIcon from '@mui/icons-material/ChangeHistory';
import CircleIcon from '@mui/icons-material/Circle';
import PanToolIcon from '@mui/icons-material/PanTool';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import UndoIcon from '@mui/icons-material/Undo';
import PaletteIcon from '@mui/icons-material/Palette';
import LayersIcon from '@mui/icons-material/Layers';
import MapIcon from '@mui/icons-material/Map';
import DrawIcon from '@mui/icons-material/Draw';
import PolylineIcon from '@mui/icons-material/Timeline';
import SquareIcon from '@mui/icons-material/CropSquare';

import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import Graphic from '@arcgis/core/Graphic';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel';
import BasemapGallery from '@arcgis/core/widgets/BasemapGallery';
import Expand from '@arcgis/core/widgets/Expand';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';

// ArcGIS CSS
import '@arcgis/core/assets/esri/themes/dark/main.css';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4fc3f7',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#0a1929',
      paper: '#132f4c',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

interface DrawnGraphic {
  id: string;
  type: 'point' | 'polygon' | 'circle' | 'polyline' | 'rectangle';
  graphic: Graphic;
  color: string;
}

const defaultColors = [
  '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
  '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50',
  '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800',
  '#ff5722', '#795548', '#607d8b', '#000000', '#ffffff',
];

export default function App() {
  const mapDiv = useRef<HTMLDivElement>(null);
  const viewRef = useRef<MapView | null>(null);
  const graphicsLayerRef = useRef<GraphicsLayer | null>(null);
  const sketchRef = useRef<SketchViewModel | null>(null);

  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [fillColor, setFillColor] = useState('#2196f3');
  const [strokeColor, setStrokeColor] = useState('#ffffff');
  const [fillOpacity, setFillOpacity] = useState(0.5);
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [pointSize, setPointSize] = useState(12);
  const [drawnGraphics, setDrawnGraphics] = useState<DrawnGraphic[]>([]);
  const [colorAnchor, setColorAnchor] = useState<HTMLElement | null>(null);
  const [colorType, setColorType] = useState<'fill' | 'stroke'>('fill');
  const [layersAnchor, setLayersAnchor] = useState<HTMLElement | null>(null);
  const [downloadMenuAnchor, setDownloadMenuAnchor] = useState<HTMLElement | null>(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'png' | 'jpg'>('png');
  const [exportFileName, setExportFileName] = useState('map-export');
  const [exportQuality, setExportQuality] = useState(1);

  // Initialize map
  useEffect(() => {
    if (!mapDiv.current) return;

    const graphicsLayer = new GraphicsLayer({
      title: 'Drawings',
    });
    graphicsLayerRef.current = graphicsLayer;

    const map = new Map({
      basemap: 'dark-gray-vector',
      layers: [graphicsLayer],
    });

    const view = new MapView({
      container: mapDiv.current,
      map: map,
      center: [77.5946, 12.9716], // Bangalore
      zoom: 12,
      ui: {
        components: ['zoom', 'compass'],
      },
    });

    viewRef.current = view;

    // Add SketchViewModel for drawing
    view.when(() => {
      const sketchViewModel = new SketchViewModel({
        layer: graphicsLayer,
        view: view,
        updateOnGraphicClick: false,
        defaultCreateOptions: {
          mode: 'click',
        },
      });

      sketchRef.current = sketchViewModel;

      // Listen for graphic creation
      sketchViewModel.on('create', (event) => {
        if (event.state === 'complete') {
          const graphic = event.graphic;
          const id = `graphic-${Date.now()}`;
          graphic.setAttribute('id', id);

          setDrawnGraphics((prev) => [
            ...prev,
            {
              id,
              type: event.tool as DrawnGraphic['type'],
              graphic,
              color: fillColor,
            },
          ]);

          setActiveTool(null);
        }
      });

      // Add basemap gallery
      const basemapGallery = new BasemapGallery({
        view: view,
      });

      const bgExpand = new Expand({
        view: view,
        content: basemapGallery,
        expandIcon: 'basemap',
        expandTooltip: 'Basemap Gallery',
      });

      view.ui.add(bgExpand, 'top-right');
    });

    return () => {
      view.destroy();
    };
  }, []);

  // Update sketch symbol when colors change
  useEffect(() => {
    if (!sketchRef.current) return;

    const hexToRgba = (hex: string, alpha: number): [number, number, number, number] => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return [r, g, b, alpha];
    };

    const fillRgba = hexToRgba(fillColor, fillOpacity);
    const strokeRgba = hexToRgba(strokeColor, 1);

    sketchRef.current.pointSymbol = new SimpleMarkerSymbol({
      color: fillRgba,
      size: pointSize,
      outline: {
        color: strokeRgba,
        width: strokeWidth,
      },
    });

    sketchRef.current.polylineSymbol = new SimpleLineSymbol({
      color: strokeRgba,
      width: strokeWidth,
    });

    sketchRef.current.polygonSymbol = new SimpleFillSymbol({
      color: fillRgba,
      outline: {
        color: strokeRgba,
        width: strokeWidth,
      },
    });
  }, [fillColor, strokeColor, fillOpacity, strokeWidth, pointSize]);

  const handleToolChange = (_: React.MouseEvent<HTMLElement>, newTool: string | null) => {
    setActiveTool(newTool);

    if (!sketchRef.current) return;

    if (newTool) {
      sketchRef.current.create(newTool as any);
    } else {
      sketchRef.current.cancel();
    }
  };

  const handleClearAll = () => {
    if (graphicsLayerRef.current) {
      graphicsLayerRef.current.removeAll();
      setDrawnGraphics([]);
    }
  };

  const handleUndo = () => {
    if (graphicsLayerRef.current && drawnGraphics.length > 0) {
      const lastGraphic = drawnGraphics[drawnGraphics.length - 1];
      graphicsLayerRef.current.remove(lastGraphic.graphic);
      setDrawnGraphics((prev) => prev.slice(0, -1));
    }
  };

  const handleDeleteGraphic = (id: string) => {
    const graphicToRemove = drawnGraphics.find((g) => g.id === id);
    if (graphicToRemove && graphicsLayerRef.current) {
      graphicsLayerRef.current.remove(graphicToRemove.graphic);
      setDrawnGraphics((prev) => prev.filter((g) => g.id !== id));
    }
  };

  const handleExportMap = useCallback(async () => {
    if (!viewRef.current) return;

    try {
      const screenshot = await viewRef.current.takeScreenshot({
        format: exportFormat,
        quality: exportFormat === 'jpg' ? Math.round(exportQuality * 100) : undefined,
      });

      // Create download link
      const link = document.createElement('a');
      link.download = `${exportFileName}.${exportFormat}`;
      link.href = screenshot.dataUrl;
      link.click();

      setExportDialogOpen(false);
    } catch (error) {
      console.error('Export failed:', error);
    }
  }, [exportFormat, exportFileName, exportQuality]);

  const openColorPicker = (event: React.MouseEvent<HTMLElement>, type: 'fill' | 'stroke') => {
    setColorType(type);
    setColorAnchor(event.currentTarget);
  };

  const handleColorSelect = (color: string) => {
    if (colorType === 'fill') {
      setFillColor(color);
    } else {
      setStrokeColor(color);
    }
    setColorAnchor(null);
  };

  const getGraphicIcon = (type: string) => {
    switch (type) {
      case 'point':
        return <PlaceIcon fontSize="small" />;
      case 'polygon':
        return <ChangeHistoryIcon fontSize="small" />;
      case 'circle':
        return <CircleIcon fontSize="small" />;
      case 'polyline':
        return <PolylineIcon fontSize="small" />;
      case 'rectangle':
        return <SquareIcon fontSize="small" />;
      default:
        return <DrawIcon fontSize="small" />;
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        {/* App Bar */}
        <AppBar position="static" elevation={0} sx={{ bgcolor: 'background.paper' }}>
          <Toolbar variant="dense">
            <Tooltip title="Back to Home">
              <IconButton
                component={Link}
                to="/"
                size="small"
                sx={{ mr: 1, color: 'grey.400' }}
              >
                <HomeIcon />
              </IconButton>
            </Tooltip>
            <DrawIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600 }}>
              Map Draw Tool
            </Typography>

            <Box sx={{ flexGrow: 1 }} />

            {/* Undo */}
            <Tooltip title="Undo Last">
              <span>
                <IconButton
                  onClick={handleUndo}
                  disabled={drawnGraphics.length === 0}
                  size="small"
                >
                  <UndoIcon />
                </IconButton>
              </span>
            </Tooltip>

            {/* Clear All */}
            <Tooltip title="Clear All">
              <span>
                <IconButton
                  onClick={handleClearAll}
                  disabled={drawnGraphics.length === 0}
                  size="small"
                  color="error"
                >
                  <ClearAllIcon />
                </IconButton>
              </span>
            </Tooltip>

            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

            {/* Layers */}
            <Tooltip title="View Drawings">
              <IconButton
                onClick={(e) => setLayersAnchor(e.currentTarget)}
                size="small"
              >
                <LayersIcon />
              </IconButton>
            </Tooltip>

            {/* Export */}
            <Tooltip title="Download Map">
              <IconButton
                onClick={() => setExportDialogOpen(true)}
                size="small"
                color="primary"
              >
                <DownloadIcon />
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>

        {/* Main Content */}
        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Left Toolbar */}
          <Paper
            elevation={0}
            sx={{
              width: 280,
              p: 2,
              borderRight: 1,
              borderColor: 'divider',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              overflow: 'auto',
            }}
          >
            {/* Drawing Tools */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'primary.main' }}>
                Drawing Tools
              </Typography>
              <ToggleButtonGroup
                value={activeTool}
                exclusive
                onChange={handleToolChange}
                orientation="vertical"
                fullWidth
                size="small"
              >
                <ToggleButton value="point">
                  <PlaceIcon sx={{ mr: 1 }} />
                  Point
                </ToggleButton>
                <ToggleButton value="polyline">
                  <PolylineIcon sx={{ mr: 1 }} />
                  Polyline
                </ToggleButton>
                <ToggleButton value="polygon">
                  <ChangeHistoryIcon sx={{ mr: 1 }} />
                  Polygon
                </ToggleButton>
                <ToggleButton value="circle">
                  <CircleIcon sx={{ mr: 1 }} />
                  Circle
                </ToggleButton>
                <ToggleButton value="rectangle">
                  <SquareIcon sx={{ mr: 1 }} />
                  Rectangle
                </ToggleButton>
              </ToggleButtonGroup>

              {activeTool && (
                <Alert severity="info" sx={{ mt: 1, py: 0 }}>
                  <Typography variant="caption">
                    Click on the map to draw. Double-click to finish.
                  </Typography>
                </Alert>
              )}
            </Box>

            <Divider />

            {/* Color Settings */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'primary.main' }}>
                Colors
              </Typography>

              {/* Fill Color */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="body2" sx={{ minWidth: 60 }}>
                  Fill:
                </Typography>
                <Box
                  onClick={(e) => openColorPicker(e, 'fill')}
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: fillColor,
                    borderRadius: 1,
                    cursor: 'pointer',
                    border: 2,
                    borderColor: 'divider',
                    '&:hover': { borderColor: 'primary.main' },
                  }}
                />
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {fillColor}
                </Typography>
              </Box>

              {/* Stroke Color */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ minWidth: 60 }}>
                  Stroke:
                </Typography>
                <Box
                  onClick={(e) => openColorPicker(e, 'stroke')}
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: strokeColor,
                    borderRadius: 1,
                    cursor: 'pointer',
                    border: 2,
                    borderColor: 'divider',
                    '&:hover': { borderColor: 'primary.main' },
                  }}
                />
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {strokeColor}
                </Typography>
              </Box>
            </Box>

            <Divider />

            {/* Style Settings */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'primary.main' }}>
                Style Settings
              </Typography>

              {/* Fill Opacity */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Fill Opacity: {Math.round(fillOpacity * 100)}%
                </Typography>
                <Slider
                  value={fillOpacity}
                  onChange={(_, v) => setFillOpacity(v as number)}
                  min={0}
                  max={1}
                  step={0.1}
                  size="small"
                />
              </Box>

              {/* Stroke Width */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Stroke Width: {strokeWidth}px
                </Typography>
                <Slider
                  value={strokeWidth}
                  onChange={(_, v) => setStrokeWidth(v as number)}
                  min={1}
                  max={10}
                  step={1}
                  size="small"
                />
              </Box>

              {/* Point Size */}
              <Box>
                <Typography variant="body2" gutterBottom>
                  Point Size: {pointSize}px
                </Typography>
                <Slider
                  value={pointSize}
                  onChange={(_, v) => setPointSize(v as number)}
                  min={6}
                  max={30}
                  step={2}
                  size="small"
                />
              </Box>
            </Box>

            <Divider />

            {/* Drawn Graphics List */}
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'primary.main' }}>
                Drawings ({drawnGraphics.length})
              </Typography>
              {drawnGraphics.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  No drawings yet. Select a tool and click on the map.
                </Typography>
              ) : (
                <List dense disablePadding>
                  {drawnGraphics.map((g, index) => (
                    <ListItem
                      key={g.id}
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.03)',
                        borderRadius: 1,
                        mb: 0.5,
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        {getGraphicIcon(g.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={`${g.type.charAt(0).toUpperCase() + g.type.slice(1)} ${index + 1}`}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteGraphic(g.id)}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          </Paper>

          {/* Map Container */}
          <Box sx={{ flex: 1, position: 'relative' }}>
            <div
              ref={mapDiv}
              style={{
                width: '100%',
                height: '100%',
              }}
            />
          </Box>
        </Box>

        {/* Color Picker Popover */}
        <Popover
          open={Boolean(colorAnchor)}
          anchorEl={colorAnchor}
          onClose={() => setColorAnchor(null)}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
        >
          <Box sx={{ p: 2, width: 200 }}>
            <Typography variant="subtitle2" gutterBottom>
              Select {colorType === 'fill' ? 'Fill' : 'Stroke'} Color
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: 0.5,
              }}
            >
              {defaultColors.map((color) => (
                <Box
                  key={color}
                  onClick={() => handleColorSelect(color)}
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: color,
                    borderRadius: 1,
                    cursor: 'pointer',
                    border: 2,
                    borderColor:
                      (colorType === 'fill' ? fillColor : strokeColor) === color
                        ? 'primary.main'
                        : 'transparent',
                    '&:hover': {
                      transform: 'scale(1.1)',
                    },
                    transition: 'transform 0.1s',
                  }}
                />
              ))}
            </Box>
            <Divider sx={{ my: 1 }} />
            <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
              Custom Color:
            </Typography>
            <input
              type="color"
              value={colorType === 'fill' ? fillColor : strokeColor}
              onChange={(e) => handleColorSelect(e.target.value)}
              style={{ width: '100%', height: 40, cursor: 'pointer' }}
            />
          </Box>
        </Popover>

        {/* Layers Popover */}
        <Popover
          open={Boolean(layersAnchor)}
          anchorEl={layersAnchor}
          onClose={() => setLayersAnchor(null)}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <Box sx={{ p: 2, minWidth: 250 }}>
            <Typography variant="subtitle2" gutterBottom>
              Drawings ({drawnGraphics.length})
            </Typography>
            {drawnGraphics.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No drawings yet
              </Typography>
            ) : (
              <List dense>
                {drawnGraphics.map((g, index) => (
                  <ListItem key={g.id}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          bgcolor: g.color,
                          borderRadius: '50%',
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={`${g.type.charAt(0).toUpperCase() + g.type.slice(1)} ${index + 1}`}
                    />
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteGraphic(g.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </Popover>

        {/* Export Dialog */}
        <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)}>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DownloadIcon color="primary" />
              Export Map
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1, minWidth: 300 }}>
              <TextField
                label="File Name"
                value={exportFileName}
                onChange={(e) => setExportFileName(e.target.value)}
                size="small"
                fullWidth
              />

              <Box>
                <Typography variant="body2" gutterBottom>
                  Format:
                </Typography>
                <ToggleButtonGroup
                  value={exportFormat}
                  exclusive
                  onChange={(_, v) => v && setExportFormat(v)}
                  size="small"
                  fullWidth
                >
                  <ToggleButton value="png">PNG</ToggleButton>
                  <ToggleButton value="jpg">JPG</ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {exportFormat === 'jpg' && (
                <Box>
                  <Typography variant="body2" gutterBottom>
                    Quality: {Math.round(exportQuality * 100)}%
                  </Typography>
                  <Slider
                    value={exportQuality}
                    onChange={(_, v) => setExportQuality(v as number)}
                    min={0.1}
                    max={1}
                    step={0.1}
                    size="small"
                  />
                </Box>
              )}

              <Alert severity="info" sx={{ py: 0 }}>
                <Typography variant="caption">
                  The map will be exported at the current view extent and zoom level.
                </Typography>
              </Alert>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setExportDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleExportMap}
              variant="contained"
              startIcon={<DownloadIcon />}
            >
              Download {exportFormat.toUpperCase()}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}
