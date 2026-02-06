import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, rectSortingStrategy } from '@dnd-kit/sortable';
import { Box, Typography, Button, ToggleButtonGroup, ToggleButton, Tooltip } from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  ViewColumn as HorizontalIcon,
  ViewStream as VerticalIcon,
  GridView as WrapIcon,
} from '@mui/icons-material';
import { useBuilderStore } from '../../store/useBuilderStore';
import { CanvasComponent } from './CanvasComponent';

export function Canvas() {
  const {
    components,
    selectComponent,
    clearCanvas,
    canvasLayout,
    setCanvasLayout,
    showGrid,
    gridSize,
    showOutlines,
  } = useBuilderStore();

  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas-droppable',
  });

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Only deselect if clicking directly on canvas, not on a component
    if (e.target === e.currentTarget) {
      selectComponent(null);
    }
  };

  const handleLayoutChange = (_: React.MouseEvent<HTMLElement>, newLayout: 'vertical' | 'horizontal' | 'wrap' | null) => {
    if (newLayout) {
      setCanvasLayout(newLayout);
    }
  };

  // Choose sorting strategy based on layout
  const sortingStrategy = canvasLayout === 'vertical' ? verticalListSortingStrategy : rectSortingStrategy;

  // Get container styles based on layout
  const getContainerStyles = (): Record<string, unknown> => {
    const baseStyles = {
      display: 'flex',
      minHeight: '100%',
      gap: 2,
      p: 1,
    };

    switch (canvasLayout) {
      case 'horizontal':
        return {
          ...baseStyles,
          flexDirection: 'row',
          alignItems: 'flex-start',
        };
      case 'wrap':
        return {
          ...baseStyles,
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          alignContent: 'flex-start',
        };
      case 'vertical':
      default:
        return {
          ...baseStyles,
          flexDirection: 'column',
        };
    }
  };

  // Grid background pattern
  const gridPattern = showGrid
    ? {
        backgroundImage: `
          linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)
        `,
        backgroundSize: `${gridSize}px ${gridSize}px`,
      }
    : {};

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'grey.100',
      }}
    >
      <Box
        sx={{
          p: 1,
          borderBottom: 1,
          borderColor: 'divider',
          backgroundColor: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Typography variant="subtitle1" fontWeight="medium">
          Canvas
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Layout:
          </Typography>
          <ToggleButtonGroup
            value={canvasLayout}
            exclusive
            onChange={handleLayoutChange}
            size="small"
            sx={{ '& .MuiToggleButton-root': { p: 0.5 } }}
          >
            <ToggleButton value="vertical">
              <Tooltip title="Vertical (Stack)">
                <VerticalIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="horizontal">
              <Tooltip title="Horizontal (Row)">
                <HorizontalIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="wrap">
              <Tooltip title="Wrap (Side by Side)">
                <WrapIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Button
          size="small"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={clearCanvas}
          disabled={components.length === 0}
        >
          Clear
        </Button>
      </Box>

      {/* Canvas area */}
      <Box
        ref={setNodeRef}
        onClick={handleCanvasClick}
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
          backgroundColor: isOver ? 'primary.50' : 'grey.50',
          border: isOver ? '2px dashed' : '2px solid transparent',
          borderColor: isOver ? 'primary.main' : 'transparent',
          transition: 'all 0.2s ease',
          minHeight: 400,
          ...gridPattern,
        }}
      >
        {components.length === 0 ? (
          <Box
            sx={{
              height: '100%',
              minHeight: 300,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'grey.500',
              gap: 2,
            }}
          >
            <AddIcon sx={{ fontSize: 48, opacity: 0.5 }} />
            <Typography variant="body1">
              Drag components here to start building
            </Typography>
            <Typography variant="caption" color="grey.400">
              Select components from the palette on the left
            </Typography>
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="caption" color="grey.400" display="block">
                Use layout buttons above to arrange components:
              </Typography>
              <Typography variant="caption" color="grey.400">
                Vertical | Horizontal | Side-by-Side (Wrap)
              </Typography>
            </Box>
          </Box>
        ) : (
          <SortableContext
            items={components.map(c => c.id)}
            strategy={sortingStrategy}
          >
            <Box sx={getContainerStyles()}>
              {components.map(component => (
                <CanvasComponent
                  key={component.id}
                  component={component}
                  showOutlines={showOutlines}
                />
              ))}
            </Box>
          </SortableContext>
        )}
      </Box>
    </Box>
  );
}
