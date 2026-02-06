import { useState, useEffect, useCallback } from 'react';
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
  Divider,
  TextField,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Code as CodeIcon,
  Palette as PaletteIcon,
  AccountTree as TreeIcon,
  Tune as PropertiesIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  Home as HomeIcon,
  DragIndicator as DragIcon,
  Save as SaveIcon,
  FolderOpen as OpenIcon,
  History as HistoryIcon,
  Keyboard as KeyboardIcon,
  Search as SearchIcon,
  ViewModule as TemplateIcon,
  MoreVert as MoreIcon,
  ContentCopy as CopyIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { ComponentPalette } from './components/ComponentPalette';
import { Canvas } from './components/Canvas';
import { PropertiesPanel } from './components/PropertiesPanel';
import { CodePreview } from './components/CodePreview';
import { ComponentTree } from './components/ComponentTree';
import { CommandPalette } from './components/CommandPalette';
import { ShortcutsPanel } from './components/ShortcutsPanel';
import { TemplateLibrary } from './components/TemplateLibrary';
import { VersionHistory } from './components/VersionHistory';
import { ViewportControls } from './components/ViewportControls';
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
  const {
    addComponent,
    moveComponent,
    components,
    findComponentById,
    undo,
    redo,
    canUndo,
    canRedo,
    selectedComponentId,
    selectedComponentIds,
    copyComponent,
    copyComponents,
    cutComponent,
    pasteComponents,
    duplicateComponent,
    removeComponent,
    selectComponent,
    selectAllComponents,
    groupComponents,
    ungroupComponent,
    toggleLockComponent,
    toggleCommandPalette,
    showCommandPalette,
    showShortcutsPanel,
    setShowShortcutsPanel,
    projectName,
    setProjectName,
    exportProjectJSON,
    importProjectJSON,
    clipboard,
    zoomIn,
    zoomOut,
    resetZoom,
  } = useBuilderStore();

  const [showCodePreview, setShowCodePreview] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeDragData, setActiveDragData] = useState<{ type: string; componentType?: string } | null>(null);
  const [rightPanelTab, setRightPanelTab] = useState(0);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(projectName);
  const [moreMenuAnchor, setMoreMenuAnchor] = useState<HTMLElement | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    setActiveDragData(active.data.current as { type: string; componentType?: string });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveDragData(null);

    if (!over) return;

    const activeData = active.data.current;
    const overId = over.id as string;
    const overData = over.data.current;

    if (activeData?.type === 'palette-item') {
      const componentType = activeData.componentType as MUIComponentType;

      if (overData?.type === 'component-drop-zone' && overData.acceptsChildren) {
        addComponent(componentType, overData.componentId);
        return;
      }

      const targetComponent = findComponentById(overId);
      if (targetComponent || overId === 'canvas-droppable') {
        const parentId = overId === 'canvas-droppable' ? null : overId;
        addComponent(componentType, parentId);
      } else {
        addComponent(componentType);
      }
      return;
    }

    if (activeData?.type === 'canvas-item' && active.id !== over.id) {
      const dragId = active.id as string;
      const hoverId = over.id as string;

      if (dragId === hoverId) return;

      if (overData?.type === 'component-drop-zone' && overData.acceptsChildren) {
        moveComponent(dragId, hoverId);
        return;
      }

      moveComponent(dragId, hoverId);
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setActiveDragData(null);
  };

  const countAllComponents = (comps: typeof components): number => {
    return comps.reduce((count, comp) => {
      return count + 1 + countAllComponents(comp.children);
    }, 0);
  };

  const totalComponents = countAllComponents(components);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const ctrlOrMeta = e.ctrlKey || e.metaKey;

    // Command palette
    if (ctrlOrMeta && e.key === 'k') {
      e.preventDefault();
      toggleCommandPalette();
      return;
    }

    // Shortcuts panel
    if (e.key === '?' && !ctrlOrMeta) {
      setShowShortcutsPanel(true);
      return;
    }

    // Undo/Redo
    if (ctrlOrMeta && e.key === 'z') {
      e.preventDefault();
      if (e.shiftKey) {
        redo();
      } else {
        undo();
      }
      return;
    }
    if (ctrlOrMeta && e.key === 'y') {
      e.preventDefault();
      redo();
      return;
    }

    // Copy/Paste/Cut
    if (ctrlOrMeta && e.key === 'c' && selectedComponentId) {
      e.preventDefault();
      if (selectedComponentIds.length > 1) {
        copyComponents(selectedComponentIds);
      } else {
        copyComponent(selectedComponentId);
      }
      return;
    }
    if (ctrlOrMeta && e.key === 'v' && clipboard) {
      e.preventDefault();
      pasteComponents();
      return;
    }
    if (ctrlOrMeta && e.key === 'x' && selectedComponentId) {
      e.preventDefault();
      cutComponent(selectedComponentId);
      return;
    }

    // Duplicate
    if (ctrlOrMeta && e.key === 'd' && selectedComponentId) {
      e.preventDefault();
      duplicateComponent(selectedComponentId);
      return;
    }

    // Delete
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedComponentId) {
      // Don't delete if we're in an input
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') {
        return;
      }
      e.preventDefault();
      removeComponent(selectedComponentId);
      return;
    }

    // Deselect
    if (e.key === 'Escape') {
      selectComponent(null);
      return;
    }

    // Select all
    if (ctrlOrMeta && e.key === 'a') {
      e.preventDefault();
      selectAllComponents();
      return;
    }

    // Group/Ungroup
    if (ctrlOrMeta && e.key === 'g') {
      e.preventDefault();
      if (e.shiftKey && selectedComponentId) {
        ungroupComponent(selectedComponentId);
      } else if (selectedComponentIds.length >= 2) {
        groupComponents(selectedComponentIds);
      }
      return;
    }

    // Lock
    if (ctrlOrMeta && e.key === 'l' && selectedComponentId) {
      e.preventDefault();
      toggleLockComponent(selectedComponentId);
      return;
    }

    // Save
    if (ctrlOrMeta && e.key === 's') {
      e.preventDefault();
      handleExportProject();
      return;
    }

    // Zoom
    if (ctrlOrMeta && (e.key === '+' || e.key === '=')) {
      e.preventDefault();
      zoomIn();
      return;
    }
    if (ctrlOrMeta && e.key === '-') {
      e.preventDefault();
      zoomOut();
      return;
    }
    if (ctrlOrMeta && e.key === '0') {
      e.preventDefault();
      resetZoom();
      return;
    }
  }, [
    undo, redo, selectedComponentId, selectedComponentIds, clipboard,
    copyComponent, copyComponents, cutComponent, pasteComponents,
    duplicateComponent, removeComponent, selectComponent, selectAllComponents,
    groupComponents, ungroupComponent, toggleLockComponent, toggleCommandPalette,
    setShowShortcutsPanel, zoomIn, zoomOut, resetZoom
  ]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleExportProject = () => {
    const json = exportProjectJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportProject = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const json = event.target?.result as string;
          importProjectJSON(json);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleNameEdit = () => {
    setTempName(projectName);
    setEditingName(true);
  };

  const handleNameSave = () => {
    if (tempName.trim()) {
      setProjectName(tempName.trim());
    }
    setEditingName(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <Box
          sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}
          tabIndex={0}
        >
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

              {/* Project name */}
              {editingName ? (
                <TextField
                  size="small"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onBlur={handleNameSave}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleNameSave();
                    if (e.key === 'Escape') setEditingName(false);
                  }}
                  autoFocus
                  sx={{
                    '& .MuiInputBase-input': {
                      color: 'white',
                      py: 0.5,
                      fontSize: '1.1rem',
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255,255,255,0.5)',
                    },
                  }}
                />
              ) : (
                <Typography
                  variant="h6"
                  component="div"
                  sx={{
                    mr: 1,
                    cursor: 'pointer',
                    '&:hover': { opacity: 0.8 },
                  }}
                  onClick={handleNameEdit}
                >
                  {projectName}
                </Typography>
              )}
              <Tooltip title="Edit project name">
                <IconButton color="inherit" size="small" onClick={handleNameEdit}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              <Divider orientation="vertical" flexItem sx={{ mx: 1, borderColor: 'rgba(255,255,255,0.3)' }} />

              {/* Undo/Redo */}
              <Box sx={{ display: 'flex', gap: 0.5, mr: 1 }}>
                <Tooltip title="Undo (Ctrl+Z)">
                  <span>
                    <IconButton
                      color="inherit"
                      size="small"
                      onClick={undo}
                      disabled={!canUndo()}
                      sx={{ opacity: canUndo() ? 1 : 0.5 }}
                    >
                      <UndoIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Redo (Ctrl+Shift+Z)">
                  <span>
                    <IconButton
                      color="inherit"
                      size="small"
                      onClick={redo}
                      disabled={!canRedo()}
                      sx={{ opacity: canRedo() ? 1 : 0.5 }}
                    >
                      <RedoIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>

              <Divider orientation="vertical" flexItem sx={{ mx: 1, borderColor: 'rgba(255,255,255,0.3)' }} />

              {/* Quick actions */}
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Tooltip title="Insert Template">
                  <IconButton
                    color="inherit"
                    size="small"
                    onClick={() => setShowTemplates(true)}
                  >
                    <TemplateIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Command Palette (Ctrl+K)">
                  <IconButton
                    color="inherit"
                    size="small"
                    onClick={toggleCommandPalette}
                  >
                    <SearchIcon fontSize="small" />
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

              {/* Clipboard indicator */}
              {clipboard && (
                <Tooltip title={`${clipboard.components.length} item(s) in clipboard`}>
                  <Chip
                    icon={<CopyIcon sx={{ fontSize: 14 }} />}
                    label="Copied"
                    size="small"
                    sx={{
                      mr: 1,
                      color: 'white',
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      '& .MuiChip-icon': { color: 'white' },
                    }}
                    onClick={() => pasteComponents()}
                  />
                </Tooltip>
              )}

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

              {/* More menu */}
              <IconButton
                color="inherit"
                onClick={(e) => setMoreMenuAnchor(e.currentTarget)}
              >
                <MoreIcon />
              </IconButton>
              <Menu
                anchorEl={moreMenuAnchor}
                open={Boolean(moreMenuAnchor)}
                onClose={() => setMoreMenuAnchor(null)}
              >
                <MenuItem onClick={() => { handleExportProject(); setMoreMenuAnchor(null); }}>
                  <ListItemIcon><SaveIcon fontSize="small" /></ListItemIcon>
                  <ListItemText>Export Project</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => { handleImportProject(); setMoreMenuAnchor(null); }}>
                  <ListItemIcon><OpenIcon fontSize="small" /></ListItemIcon>
                  <ListItemText>Import Project</ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => { setShowHistory(true); setMoreMenuAnchor(null); }}>
                  <ListItemIcon><HistoryIcon fontSize="small" /></ListItemIcon>
                  <ListItemText>Version History</ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => { setShowShortcutsPanel(true); setMoreMenuAnchor(null); }}>
                  <ListItemIcon><KeyboardIcon fontSize="small" /></ListItemIcon>
                  <ListItemText>Keyboard Shortcuts</ListItemText>
                </MenuItem>
              </Menu>
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
              {/* Viewport Controls */}
              <ViewportControls />

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
        <DragOverlay dropAnimation={null}>
          {activeId && activeDragData?.type === 'palette-item' && (
            <Paper
              elevation={8}
              sx={{
                p: 1.5,
                px: 2,
                backgroundColor: 'primary.main',
                color: 'white',
                cursor: 'grabbing',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <DragIcon fontSize="small" />
              <Typography variant="body2" fontWeight="medium">
                {activeDragData.componentType}
              </Typography>
            </Paper>
          )}
          {activeId && activeDragData?.type === 'canvas-item' && (
            <Paper
              elevation={8}
              sx={{
                p: 1,
                px: 1.5,
                backgroundColor: 'primary.light',
                color: 'white',
                cursor: 'grabbing',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                opacity: 0.9,
              }}
            >
              <DragIcon fontSize="small" />
              <Typography variant="caption" fontWeight="medium">
                Moving component...
              </Typography>
            </Paper>
          )}
        </DragOverlay>

        {/* Command Palette */}
        <CommandPalette
          open={showCommandPalette}
          onClose={() => toggleCommandPalette()}
          onOpenTemplates={() => setShowTemplates(true)}
          onOpenHistory={() => setShowHistory(true)}
        />

        {/* Shortcuts Panel */}
        <ShortcutsPanel
          open={showShortcutsPanel}
          onClose={() => setShowShortcutsPanel(false)}
        />

        {/* Template Library */}
        <TemplateLibrary
          open={showTemplates}
          onClose={() => setShowTemplates(false)}
        />

        {/* Version History */}
        <VersionHistory
          open={showHistory}
          onClose={() => setShowHistory(false)}
        />
      </DndContext>
    </ThemeProvider>
  );
}

export default App;
