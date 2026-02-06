import { useState } from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Typography,
  Slider,
  Popover,
  Switch,
  FormControlLabel,
  Divider,
} from '@mui/material';
import {
  GridOn as GridIcon,
  Visibility as OutlineIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useBuilderStore } from '../store/useBuilderStore';

export function ViewportControls() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const {
    showGrid,
    setShowGrid,
    snapToGrid,
    setSnapToGrid,
    gridSize,
    setGridSize,
    showOutlines,
    setShowOutlines,
  } = useBuilderStore();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 2,
        py: 0.5,
        backgroundColor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Typography variant="caption" color="text.secondary">
        View:
      </Typography>

      {/* Grid toggle */}
      <Tooltip title={showGrid ? 'Hide grid' : 'Show grid'}>
        <IconButton
          size="small"
          onClick={() => setShowGrid(!showGrid)}
          color={showGrid ? 'primary' : 'default'}
        >
          <GridIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      {/* Outline toggle */}
      <Tooltip title={showOutlines ? 'Hide component outlines' : 'Show component outlines'}>
        <IconButton
          size="small"
          onClick={() => setShowOutlines(!showOutlines)}
          color={showOutlines ? 'primary' : 'default'}
        >
          <OutlineIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      {/* Settings popover */}
      <Tooltip title="Grid settings">
        <IconButton
          size="small"
          onClick={(e) => setAnchorEl(e.currentTarget)}
        >
          <SettingsIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: 2, width: 220 }}>
          <Typography variant="subtitle2" gutterBottom>
            Grid Settings
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                size="small"
              />
            }
            label="Show grid"
          />

          <FormControlLabel
            control={
              <Switch
                checked={snapToGrid}
                onChange={(e) => setSnapToGrid(e.target.checked)}
                size="small"
              />
            }
            label="Snap to grid"
          />

          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Grid size: {gridSize}px
            </Typography>
            <Slider
              value={gridSize}
              onChange={(_, value) => setGridSize(value as number)}
              min={4}
              max={32}
              step={4}
              size="small"
              marks
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" gutterBottom>
            Display
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={showOutlines}
                onChange={(e) => setShowOutlines(e.target.checked)}
                size="small"
              />
            }
            label="Component outlines"
          />
        </Box>
      </Popover>
    </Box>
  );
}
