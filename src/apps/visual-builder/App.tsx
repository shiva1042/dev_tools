import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Paper,
  Chip,
  Tabs,
  Tab,
  Tooltip,
} from '@mui/material';
import {
  Code as CodeIcon,
  Palette as PaletteIcon,
  AccountTree as TreeIcon,
  Tune as PropertiesIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { ComponentPalette } from './components/ComponentPalette';
import { Canvas } from './components/Canvas';
import { PropertiesPanel } from './components/PropertiesPanel';
import { CodePreview } from './components/CodePreview';
import { ComponentTree } from './components/ComponentTree';
import { useBuilderStore } from './store/useBuilderStore';
import type { MUIComponentType } from './types';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#9c27b0',
    },
  },
  typography: {
    fontSize: 13,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#f5f5f5',
        },
      },
    },
  },
});

const LEFT_DRAWER_WIDTH = 260;
const RIGHT_DRAWER_WIDTH = 320;
const CODE_PREVIEW_HEIGHT = 320;

function App() {
  const { addComponent, moveComponent, components, findComponentById } = useBuilderStore();
  const [showCodePreview, setShowCodePreview] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [rightPanelTab, setRightPanelTab] = useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeData = active.data.current;
    const overId = over.id as string;

    // Handle dropping from palette to canvas
    if (activeData?.type === 'palette-item') {
      const componentType = activeData.componentType as MUIComponentType;

      // Check if dropping on a specific component (for nesting)
      const targetComponent = findComponentById(overId);
      if (targetComponent || overId === 'canvas-droppable') {
        const parentId = overId === 'canvas-droppable' ? null : overId;
        addComponent(componentType, parentId);
      } else {
        addComponent(componentType);
      }
    }

    // Handle reordering within canvas
    if (activeData?.type === 'canvas-item' && active.id !== over.id) {
      const dragId = active.id as string;
      const hoverId = over.id as string;
      moveComponent(dragId, hoverId);
    }
  };

  const countAllComponents = (comps: typeof components): number => {
    return comps.reduce((count, comp) => {
      return count + 1 + countAllComponents(comp.children);
    }, 0);
  };

  const totalComponents = countAllComponents(components);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
          {/* Header */}
          <AppBar position="static" elevation={1} sx={{ zIndex: 1201 }}>
            <Toolbar variant="dense">
              <Tooltip title="Back to Home">
                <IconButton
                  component={Link}
                  to="/"
                  color="inherit"
                  size="small"
                  sx={{ mr: 1 }}
                >
                  <HomeIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <PaletteIcon sx={{ mr: 1 }} />
              <Typography variant="h6" component="div" sx={{ mr: 2 }}>
                ReactVisualBuilder
              </Typography>

              <Box sx={{ display: 'flex', gap: 0.5, mr: 2 }}>
                <Tooltip title="Undo">
                  <IconButton color="inherit" size="small" disabled>
                    <UndoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Redo">
                  <IconButton color="inherit" size="small" disabled>
                    <RedoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>

              <Box sx={{ flexGrow: 1 }} />

              <Chip
                label={`${totalComponents} component${totalComponents !== 1 ? 's' : ''}`}
                size="small"
                sx={{
                  mr: 2,
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.5)',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                }}
              />

              <Tooltip title={showCodePreview ? 'Hide Code Panel' : 'Show Code Panel'}>
                <IconButton
                  color="inherit"
                  onClick={() => setShowCodePreview(!showCodePreview)}
                  sx={{
                    backgroundColor: showCodePreview ? 'rgba(255,255,255,0.2)' : 'transparent',
                  }}
                >
                  <CodeIcon />
                </IconButton>
              </Tooltip>
            </Toolbar>
          </AppBar>

          <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            {/* Left Sidebar - Component Palette */}
            <Paper
              elevation={0}
              sx={{
                width: LEFT_DRAWER_WIDTH,
                flexShrink: 0,
                borderRight: 1,
                borderColor: 'divider',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <ComponentPalette />
            </Paper>

            {/* Main Content Area */}
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                minWidth: 0,
              }}
            >
              {/* Canvas */}
              <Box sx={{ flex: 1, overflow: 'hidden' }}>
                <Canvas />
              </Box>

              {/* Code Preview Panel */}
              {showCodePreview && (
                <Paper
                  elevation={4}
                  sx={{
                    height: CODE_PREVIEW_HEIGHT,
                    borderTop: 1,
                    borderColor: 'divider',
                    overflow: 'hidden',
                  }}
                >
                  <CodePreview />
                </Paper>
              )}
            </Box>

            {/* Right Sidebar - Properties & Structure */}
            <Paper
              elevation={0}
              sx={{
                width: RIGHT_DRAWER_WIDTH,
                flexShrink: 0,
                borderLeft: 1,
                borderColor: 'divider',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Tabs
                value={rightPanelTab}
                onChange={(_, newValue) => setRightPanelTab(newValue)}
                variant="fullWidth"
                sx={{ borderBottom: 1, borderColor: 'divider', minHeight: 40 }}
              >
                <Tab
                  icon={<PropertiesIcon fontSize="small" />}
                  iconPosition="start"
                  label="Properties"
                  sx={{ minHeight: 40, fontSize: '0.8rem' }}
                />
                <Tab
                  icon={<TreeIcon fontSize="small" />}
                  iconPosition="start"
                  label="Structure"
                  sx={{ minHeight: 40, fontSize: '0.8rem' }}
                />
              </Tabs>
              <Box sx={{ flex: 1, overflow: 'hidden' }}>
                {rightPanelTab === 0 ? <PropertiesPanel /> : <ComponentTree />}
              </Box>
            </Paper>
          </Box>
        </Box>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeId && activeId.startsWith('palette-') && (
            <Paper
              elevation={8}
              sx={{
                p: 1.5,
                px: 2,
                backgroundColor: 'primary.main',
                color: 'white',
                cursor: 'grabbing',
                borderRadius: 2,
              }}
            >
              <Typography variant="body2">{activeId.replace('palette-', '')}</Typography>
            </Paper>
          )}
        </DragOverlay>
      </DndContext>
    </ThemeProvider>
  );
}

export default App;
