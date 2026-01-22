import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import SettingsIcon from '@mui/icons-material/Settings';
import { useMapStore } from '../../store/mapStore';

export default function PropertiesPanel() {
  // Select individual state slices to avoid infinite loop
  const map = useMapStore((s) => s.map);
  const layers = useMapStore((s) => s.layers);
  const widgets = useMapStore((s) => s.widgets);
  const graphics = useMapStore((s) => s.graphics);
  const popupTemplates = useMapStore((s) => s.popupTemplates);

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <SettingsIcon fontSize="small" color="primary" />
        <Typography variant="subtitle2" color="primary">
          Project Summary
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        <Chip
          label={`${map.viewType.toUpperCase()} View`}
          size="small"
          color="primary"
          variant="outlined"
        />
        <Chip
          label={map.basemap}
          size="small"
          variant="outlined"
        />
        <Chip
          label={`Zoom: ${map.zoom}`}
          size="small"
          variant="outlined"
        />
      </Box>

      <Divider sx={{ my: 1 }} />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="caption" color="text.secondary">
            Layers
          </Typography>
          <Typography variant="caption">{layers.length}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="caption" color="text.secondary">
            Widgets
          </Typography>
          <Typography variant="caption">{widgets.length}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="caption" color="text.secondary">
            Graphics
          </Typography>
          <Typography variant="caption">{graphics.length}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="caption" color="text.secondary">
            Popup Templates
          </Typography>
          <Typography variant="caption">{popupTemplates.length}</Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 1 }} />

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
        Center: {map.center[0].toFixed(4)}, {map.center[1].toFixed(4)}
      </Typography>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
        WKID: {map.spatialReference || 4326}
      </Typography>

      {/* Layer Summary */}
      {layers.length > 0 && (
        <>
          <Divider sx={{ my: 1 }} />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
            Layer Types:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {[...new Set(layers.map((l) => l.type))].map((type) => (
              <Chip
                key={type}
                label={type}
                size="small"
                variant="outlined"
                sx={{ fontSize: 10 }}
              />
            ))}
          </Box>
        </>
      )}

      {/* Widget Summary */}
      {widgets.length > 0 && (
        <>
          <Divider sx={{ my: 1 }} />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
            Active Widgets:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {widgets.map((w) => (
              <Chip
                key={w.id}
                label={w.type}
                size="small"
                variant="outlined"
                sx={{ fontSize: 10 }}
              />
            ))}
          </Box>
        </>
      )}
    </Box>
  );
}
