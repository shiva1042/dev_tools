import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Chip from '@mui/material/Chip';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ListSubheader from '@mui/material/ListSubheader';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WidgetsIcon from '@mui/icons-material/Widgets';
import HomeIcon from '@mui/icons-material/Home';
import ExploreIcon from '@mui/icons-material/Explore';
import StraightenIcon from '@mui/icons-material/Straighten';
import SearchIcon from '@mui/icons-material/Search';
import LayersIcon from '@mui/icons-material/Layers';
import MapIcon from '@mui/icons-material/Map';
import CreateIcon from '@mui/icons-material/Create';
import ListAltIcon from '@mui/icons-material/ListAlt';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import PrintIcon from '@mui/icons-material/Print';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import DirectionsIcon from '@mui/icons-material/Directions';
import TimelineIcon from '@mui/icons-material/Timeline';
import CompareIcon from '@mui/icons-material/Compare';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import EditIcon from '@mui/icons-material/Edit';
import TableChartIcon from '@mui/icons-material/TableChart';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import CloudIcon from '@mui/icons-material/Cloud';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import ApartmentIcon from '@mui/icons-material/Apartment';
import PlaceIcon from '@mui/icons-material/Place';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import Navigation from '@mui/icons-material/Navigation';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import LandscapeIcon from '@mui/icons-material/Landscape';
import SpeedIcon from '@mui/icons-material/Speed';
import InfoIcon from '@mui/icons-material/Info';
import GridOnIcon from '@mui/icons-material/GridOn';
import { useMapStore } from '../../store/mapStore';
import { WIDGET_TYPES, type WidgetTypeConfig } from '../../config/esriConfig';
import type { WidgetType, WidgetPosition, WidgetConfig } from '../../types';

const positions: { value: WidgetPosition; label: string }[] = [
  { value: 'top-left', label: 'Top Left' },
  { value: 'top-right', label: 'Top Right' },
  { value: 'bottom-left', label: 'Bottom Left' },
  { value: 'bottom-right', label: 'Bottom Right' },
  { value: 'bottom', label: 'Bottom (Full Width)' },
];

// Icon mapping for widget types
const widgetIcons: Record<string, React.ReactNode> = {
  // Navigation
  Home: <HomeIcon fontSize="small" />,
  Zoom: <ZoomInIcon fontSize="small" />,
  Compass: <ExploreIcon fontSize="small" />,
  NavigationToggle: <Navigation fontSize="small" />,
  Fullscreen: <FullscreenIcon fontSize="small" />,
  // Location
  Search: <SearchIcon fontSize="small" />,
  Locate: <MyLocationIcon fontSize="small" />,
  Track: <GpsFixedIcon fontSize="small" />,
  CoordinateConversion: <PlaceIcon fontSize="small" />,
  // Layers
  Legend: <ListAltIcon fontSize="small" />,
  LayerList: <LayersIcon fontSize="small" />,
  BasemapGallery: <MapIcon fontSize="small" />,
  BasemapToggle: <SwapHorizIcon fontSize="small" />,
  BasemapLayerList: <LayersIcon fontSize="small" />,
  TableList: <TableChartIcon fontSize="small" />,
  // Editing
  Sketch: <CreateIcon fontSize="small" />,
  Editor: <EditIcon fontSize="small" />,
  FeatureForm: <EditIcon fontSize="small" />,
  FeatureTemplates: <GridOnIcon fontSize="small" />,
  FeatureTable: <TableChartIcon fontSize="small" />,
  // Measurement
  ScaleBar: <StraightenIcon fontSize="small" />,
  DistanceMeasurement2D: <StraightenIcon fontSize="small" />,
  AreaMeasurement2D: <StraightenIcon fontSize="small" />,
  DirectLineMeasurement3D: <StraightenIcon fontSize="small" />,
  AreaMeasurement3D: <StraightenIcon fontSize="small" />,
  ElevationProfile: <LandscapeIcon fontSize="small" />,
  // 3D Analysis
  LineOfSight: <VisibilityIcon fontSize="small" />,
  Slice: <ViewInArIcon fontSize="small" />,
  Daylight: <WbSunnyIcon fontSize="small" />,
  Weather: <CloudIcon fontSize="small" />,
  ShadowCast: <WbSunnyIcon fontSize="small" />,
  BuildingExplorer: <ApartmentIcon fontSize="small" />,
  // Utility
  Print: <PrintIcon fontSize="small" />,
  Bookmarks: <BookmarkIcon fontSize="small" />,
  Directions: <DirectionsIcon fontSize="small" />,
  TimeSlider: <TimelineIcon fontSize="small" />,
  Swipe: <CompareIcon fontSize="small" />,
  Popup: <InfoIcon fontSize="small" />,
  Feature: <InfoIcon fontSize="small" />,
  Attribution: <InfoIcon fontSize="small" />,
  ScaleRangeSlider: <SpeedIcon fontSize="small" />,
  FloorFilter: <LayersIcon fontSize="small" />,
};

function getWidgetIcon(type: string): React.ReactNode {
  return widgetIcons[type] || <WidgetsIcon fontSize="small" />;
}

// Category labels
const categoryLabels: Record<string, string> = {
  navigation: 'Navigation',
  location: 'Location',
  layers: 'Layers & Basemaps',
  editing: 'Editing',
  measurement: 'Measurement',
  '3d-only': '3D Analysis',
  utility: 'Utility',
};

export default function WidgetBuilder() {
  const { widgets, addWidget, removeWidget, map } = useMapStore();
  const is3D = map.viewType === '3d';

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newWidget, setNewWidget] = useState<{
    type: WidgetType;
    position: WidgetPosition;
    expand: boolean;
    expandTooltip: string;
  }>({
    type: 'Home',
    position: 'top-left',
    expand: false,
    expandTooltip: '',
  });

  // Filter and group widgets based on current view type
  const groupedWidgetTypes = useMemo(() => {
    const filtered = WIDGET_TYPES.filter((w) =>
      is3D ? w.supports3D : w.supports2D
    );

    const groups: Record<string, WidgetTypeConfig[]> = {};
    filtered.forEach((widget) => {
      if (!groups[widget.category]) {
        groups[widget.category] = [];
      }
      groups[widget.category].push(widget);
    });

    return groups;
  }, [is3D]);

  const handleAddWidget = () => {
    const widgetConfig = WIDGET_TYPES.find((w) => w.type === newWidget.type);
    addWidget({
      type: newWidget.type,
      position: newWidget.position || (widgetConfig?.defaultPosition as WidgetPosition) || 'top-left',
      expand: newWidget.expand,
      expandTooltip: newWidget.expandTooltip || newWidget.type,
    });

    setNewWidget({
      type: 'Home',
      position: 'top-left',
      expand: false,
      expandTooltip: '',
    });
    setDialogOpen(false);
  };

  // Group widgets by position
  const groupedWidgets = widgets.reduce(
    (acc, widget) => {
      if (!acc[widget.position]) {
        acc[widget.position] = [];
      }
      acc[widget.position].push(widget);
      return acc;
    },
    {} as Record<WidgetPosition, WidgetConfig[]>
  );

  // Get all available widgets for current view type
  const availableWidgets = useMemo(() => {
    return WIDGET_TYPES.filter((w) => (is3D ? w.supports3D : w.supports2D));
  }, [is3D]);

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
          <WidgetsIcon fontSize="small" color="primary" />
          <Typography variant="subtitle2" color="primary">
            Widgets ({widgets.length})
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
          onClick={() => setDialogOpen(true)}
          variant="outlined"
        >
          Add Widget
        </Button>
      </Box>

      {widgets.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 4,
            color: 'text.secondary',
          }}
        >
          <WidgetsIcon sx={{ fontSize: 48, opacity: 0.3 }} />
          <Typography variant="body2" sx={{ mt: 1 }}>
            No widgets added yet
          </Typography>
          <Typography variant="caption">
            Click "Add Widget" to add map controls
          </Typography>
        </Box>
      ) : (
        <Box>
          {positions.map((pos) => {
            const posWidgets = groupedWidgets[pos.value] || [];
            if (posWidgets.length === 0) return null;

            return (
              <Box key={pos.value} sx={{ mb: 2 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 500, mb: 1, display: 'block' }}
                >
                  {pos.label}
                </Typography>
                <List dense disablePadding>
                  {posWidgets.map((widget) => (
                    <ListItem
                      key={widget.id}
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.02)',
                        borderRadius: 1,
                        mb: 0.5,
                      }}
                      secondaryAction={
                        <IconButton
                          size="small"
                          onClick={() => removeWidget(widget.id)}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      }
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        {getWidgetIcon(widget.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2">{widget.type}</Typography>
                            {widget.expand && (
                              <Chip label="Expandable" size="small" variant="outlined" />
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            );
          })}
        </Box>
      )}

      {/* Available Widgets by Category */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
          Available Widgets ({availableWidgets.length}):
        </Typography>
        {Object.entries(groupedWidgetTypes).map(([category, widgetList]) => (
          <Accordion
            key={category}
            disableGutters
            sx={{
              bgcolor: 'transparent',
              '&:before': { display: 'none' },
              boxShadow: 'none',
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ fontSize: 16 }} />}
              sx={{ minHeight: 32, '& .MuiAccordionSummary-content': { my: 0.5 } }}
            >
              <Typography variant="caption" sx={{ fontWeight: 500 }}>
                {categoryLabels[category] || category} ({widgetList.length})
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0, pb: 1 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {widgetList.map((wt) => {
                  const isAdded = widgets.some((w) => w.type === wt.type);
                  return (
                    <Chip
                      key={wt.type}
                      label={wt.label}
                      size="small"
                      variant={isAdded ? 'filled' : 'outlined'}
                      color={isAdded ? 'primary' : 'default'}
                      sx={{ fontSize: 10 }}
                      onClick={() => {
                        if (!isAdded) {
                          setNewWidget({
                            type: wt.type as WidgetType,
                            position: wt.defaultPosition as WidgetPosition,
                            expand: false,
                            expandTooltip: wt.label,
                          });
                          setDialogOpen(true);
                        }
                      }}
                    />
                  );
                })}
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>

      {/* Add Widget Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Widget</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Widget Type</InputLabel>
              <Select
                value={newWidget.type}
                label="Widget Type"
                onChange={(e) => {
                  const widgetType = e.target.value as WidgetType;
                  const config = WIDGET_TYPES.find((w) => w.type === widgetType);
                  setNewWidget({
                    ...newWidget,
                    type: widgetType,
                    expandTooltip: config?.label || widgetType,
                    position: (config?.defaultPosition as WidgetPosition) || 'top-left',
                  });
                }}
                MenuProps={{ PaperProps: { sx: { maxHeight: 400 } } }}
              >
                {Object.entries(groupedWidgetTypes).map(([category, widgetList]) => [
                  <ListSubheader key={`header-${category}`} sx={{ bgcolor: 'background.paper' }}>
                    {categoryLabels[category] || category}
                  </ListSubheader>,
                  ...widgetList.map((wt) => (
                    <MenuItem key={wt.type} value={wt.type}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getWidgetIcon(wt.type)}
                        <Box>
                          <Typography variant="body2">{wt.label}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {wt.description}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  )),
                ])}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Position</InputLabel>
              <Select
                value={newWidget.position}
                label="Position"
                onChange={(e) =>
                  setNewWidget({
                    ...newWidget,
                    position: e.target.value as WidgetPosition,
                  })
                }
              >
                {positions.map((pos) => (
                  <MenuItem key={pos.value} value={pos.value}>
                    {pos.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={newWidget.expand}
                  onChange={(e) =>
                    setNewWidget({ ...newWidget, expand: e.target.checked })
                  }
                />
              }
              label="Wrap in Expand widget"
            />

            {newWidget.expand && (
              <TextField
                label="Expand Tooltip"
                size="small"
                fullWidth
                value={newWidget.expandTooltip}
                onChange={(e) =>
                  setNewWidget({ ...newWidget, expandTooltip: e.target.value })
                }
                placeholder="Click to expand"
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddWidget} variant="contained">
            Add Widget
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
