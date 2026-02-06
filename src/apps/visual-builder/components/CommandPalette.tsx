import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  TextField,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Chip,
  InputAdornment,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  ContentPaste as PasteIcon,
  ContentCut as CutIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  Save as SaveIcon,
  FolderOpen as OpenIcon,
  Group as GroupIcon,
  GroupRemove as UngroupIcon,
  Lock as LockIcon,
  LockOpen as UnlockIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  GridOn as GridIcon,
  Visibility as ShowIcon,
  VisibilityOff as HideIcon,
  Keyboard as KeyboardIcon,
  Code as CodeIcon,
  ViewModule as TemplateIcon,
  History as HistoryIcon,
  Smartphone as MobileIcon,
  Tablet as TabletIcon,
  Computer as DesktopIcon,
  SelectAll as SelectAllIcon,
  ClearAll as ClearIcon,
} from '@mui/icons-material';
import { useBuilderStore } from '../store/useBuilderStore';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  shortcut?: string;
  category: 'edit' | 'view' | 'component' | 'file' | 'help';
  action: () => void;
  disabled?: boolean;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onOpenTemplates: () => void;
  onOpenHistory: () => void;
}

export function CommandPalette({ open, onClose, onOpenTemplates, onOpenHistory }: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const store = useBuilderStore();

  const commands: CommandItem[] = useMemo(() => [
    // Edit commands
    {
      id: 'undo',
      label: 'Undo',
      description: 'Undo last action',
      icon: <UndoIcon />,
      shortcut: 'Ctrl+Z',
      category: 'edit',
      action: () => { store.undo(); onClose(); },
      disabled: !store.canUndo(),
    },
    {
      id: 'redo',
      label: 'Redo',
      description: 'Redo last action',
      icon: <RedoIcon />,
      shortcut: 'Ctrl+Shift+Z',
      category: 'edit',
      action: () => { store.redo(); onClose(); },
      disabled: !store.canRedo(),
    },
    {
      id: 'copy',
      label: 'Copy',
      description: 'Copy selected component',
      icon: <CopyIcon />,
      shortcut: 'Ctrl+C',
      category: 'edit',
      action: () => {
        if (store.selectedComponentId) {
          store.copyComponent(store.selectedComponentId);
        }
        onClose();
      },
      disabled: !store.selectedComponentId,
    },
    {
      id: 'paste',
      label: 'Paste',
      description: 'Paste from clipboard',
      icon: <PasteIcon />,
      shortcut: 'Ctrl+V',
      category: 'edit',
      action: () => { store.pasteComponents(); onClose(); },
      disabled: !store.clipboard,
    },
    {
      id: 'cut',
      label: 'Cut',
      description: 'Cut selected component',
      icon: <CutIcon />,
      shortcut: 'Ctrl+X',
      category: 'edit',
      action: () => {
        if (store.selectedComponentId) {
          store.cutComponent(store.selectedComponentId);
        }
        onClose();
      },
      disabled: !store.selectedComponentId,
    },
    {
      id: 'duplicate',
      label: 'Duplicate',
      description: 'Duplicate selected component',
      icon: <CopyIcon />,
      shortcut: 'Ctrl+D',
      category: 'edit',
      action: () => {
        if (store.selectedComponentId) {
          store.duplicateComponent(store.selectedComponentId);
        }
        onClose();
      },
      disabled: !store.selectedComponentId,
    },
    {
      id: 'delete',
      label: 'Delete',
      description: 'Delete selected component',
      icon: <DeleteIcon />,
      shortcut: 'Delete',
      category: 'edit',
      action: () => {
        if (store.selectedComponentId) {
          store.removeComponent(store.selectedComponentId);
        }
        onClose();
      },
      disabled: !store.selectedComponentId,
    },
    {
      id: 'selectAll',
      label: 'Select All',
      description: 'Select all components',
      icon: <SelectAllIcon />,
      shortcut: 'Ctrl+A',
      category: 'edit',
      action: () => { store.selectAllComponents(); onClose(); },
      disabled: store.components.length === 0,
    },
    {
      id: 'clearCanvas',
      label: 'Clear Canvas',
      description: 'Remove all components',
      icon: <ClearIcon />,
      category: 'edit',
      action: () => { store.clearCanvas(); onClose(); },
      disabled: store.components.length === 0,
    },

    // Component commands
    {
      id: 'group',
      label: 'Group',
      description: 'Group selected components',
      icon: <GroupIcon />,
      shortcut: 'Ctrl+G',
      category: 'component',
      action: () => {
        if (store.selectedComponentIds.length >= 2) {
          store.groupComponents(store.selectedComponentIds);
        }
        onClose();
      },
      disabled: store.selectedComponentIds.length < 2,
    },
    {
      id: 'ungroup',
      label: 'Ungroup',
      description: 'Ungroup selected group',
      icon: <UngroupIcon />,
      shortcut: 'Ctrl+Shift+G',
      category: 'component',
      action: () => {
        if (store.selectedComponentId) {
          store.ungroupComponent(store.selectedComponentId);
        }
        onClose();
      },
      disabled: !store.selectedComponentId,
    },
    {
      id: 'lock',
      label: 'Toggle Lock',
      description: 'Lock/unlock selected component',
      icon: <LockIcon />,
      shortcut: 'Ctrl+L',
      category: 'component',
      action: () => {
        if (store.selectedComponentId) {
          store.toggleLockComponent(store.selectedComponentId);
        }
        onClose();
      },
      disabled: !store.selectedComponentId,
    },
    {
      id: 'addTemplate',
      label: 'Insert Template',
      description: 'Browse and insert pre-built templates',
      icon: <TemplateIcon />,
      category: 'component',
      action: () => { onClose(); onOpenTemplates(); },
    },

    // View commands
    {
      id: 'zoomIn',
      label: 'Zoom In',
      description: 'Increase canvas zoom',
      icon: <ZoomInIcon />,
      shortcut: 'Ctrl++',
      category: 'view',
      action: () => { store.zoomIn(); onClose(); },
      disabled: store.zoom >= 200,
    },
    {
      id: 'zoomOut',
      label: 'Zoom Out',
      description: 'Decrease canvas zoom',
      icon: <ZoomOutIcon />,
      shortcut: 'Ctrl+-',
      category: 'view',
      action: () => { store.zoomOut(); onClose(); },
      disabled: store.zoom <= 25,
    },
    {
      id: 'resetZoom',
      label: 'Reset Zoom',
      description: 'Reset zoom to 100%',
      icon: <ZoomInIcon />,
      shortcut: 'Ctrl+0',
      category: 'view',
      action: () => { store.resetZoom(); onClose(); },
    },
    {
      id: 'toggleGrid',
      label: store.showGrid ? 'Hide Grid' : 'Show Grid',
      description: 'Toggle grid overlay',
      icon: <GridIcon />,
      category: 'view',
      action: () => { store.setShowGrid(!store.showGrid); onClose(); },
    },
    {
      id: 'toggleOutlines',
      label: store.showOutlines ? 'Hide Outlines' : 'Show Outlines',
      description: 'Toggle component outlines',
      icon: store.showOutlines ? <HideIcon /> : <ShowIcon />,
      category: 'view',
      action: () => { store.setShowOutlines(!store.showOutlines); onClose(); },
    },
    {
      id: 'viewMobile',
      label: 'Mobile View',
      description: 'Switch to mobile viewport',
      icon: <MobileIcon />,
      category: 'view',
      action: () => { store.setViewport('mobile'); onClose(); },
    },
    {
      id: 'viewTablet',
      label: 'Tablet View',
      description: 'Switch to tablet viewport',
      icon: <TabletIcon />,
      category: 'view',
      action: () => { store.setViewport('tablet'); onClose(); },
    },
    {
      id: 'viewDesktop',
      label: 'Desktop View',
      description: 'Switch to desktop viewport',
      icon: <DesktopIcon />,
      category: 'view',
      action: () => { store.setViewport('desktop'); onClose(); },
    },

    // File commands
    {
      id: 'exportCode',
      label: 'Export Code',
      description: 'Copy generated code to clipboard',
      icon: <CodeIcon />,
      category: 'file',
      action: () => {
        // Code export is handled elsewhere
        onClose();
      },
    },
    {
      id: 'exportProject',
      label: 'Export Project',
      description: 'Download project as JSON',
      icon: <SaveIcon />,
      shortcut: 'Ctrl+S',
      category: 'file',
      action: () => {
        const json = store.exportProjectJSON();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${store.projectName.replace(/\s+/g, '-').toLowerCase()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        onClose();
      },
    },
    {
      id: 'importProject',
      label: 'Import Project',
      description: 'Load project from JSON file',
      icon: <OpenIcon />,
      category: 'file',
      action: () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const json = event.target?.result as string;
              store.importProjectJSON(json);
            };
            reader.readAsText(file);
          }
        };
        input.click();
        onClose();
      },
    },
    {
      id: 'createSnapshot',
      label: 'Create Snapshot',
      description: 'Save current state as version',
      icon: <HistoryIcon />,
      category: 'file',
      action: () => {
        const description = `Snapshot ${new Date().toLocaleString()}`;
        store.createSnapshot(description);
        onClose();
      },
    },
    {
      id: 'viewHistory',
      label: 'Version History',
      description: 'Browse and restore snapshots',
      icon: <HistoryIcon />,
      category: 'file',
      action: () => { onClose(); onOpenHistory(); },
    },

    // Help commands
    {
      id: 'shortcuts',
      label: 'Keyboard Shortcuts',
      description: 'View all keyboard shortcuts',
      icon: <KeyboardIcon />,
      shortcut: '?',
      category: 'help',
      action: () => { store.toggleShortcutsPanel(); onClose(); },
    },
  ], [store, onClose, onOpenTemplates, onOpenHistory]);

  const filteredCommands = useMemo(() => {
    if (!search) return commands;
    const lowerSearch = search.toLowerCase();
    return commands.filter(cmd =>
      cmd.label.toLowerCase().includes(lowerSearch) ||
      cmd.description?.toLowerCase().includes(lowerSearch) ||
      cmd.category.toLowerCase().includes(lowerSearch)
    );
  }, [commands, search]);

  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    for (const cmd of filteredCommands) {
      if (!groups[cmd.category]) {
        groups[cmd.category] = [];
      }
      groups[cmd.category].push(cmd);
    }
    return groups;
  }, [filteredCommands]);

  useEffect(() => {
    if (open) {
      setSearch('');
    }
  }, [open]);

  const categoryLabels: Record<string, string> = {
    edit: 'Edit',
    view: 'View',
    component: 'Component',
    file: 'File',
    help: 'Help',
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          position: 'absolute',
          top: '15%',
          m: 0,
          maxHeight: '70vh',
        },
      }}
    >
      <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider' }}>
        <TextField
          autoFocus
          fullWidth
          placeholder="Search commands..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          variant="outlined"
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': { border: 'none' },
            },
          }}
        />
      </Box>
      <DialogContent sx={{ p: 0, maxHeight: 400 }}>
        {Object.entries(groupedCommands).map(([category, items], idx) => (
          <Box key={category}>
            {idx > 0 && <Divider />}
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ px: 2, py: 1, display: 'block', fontWeight: 600 }}
            >
              {categoryLabels[category] || category}
            </Typography>
            <List dense disablePadding>
              {items.map((cmd) => (
                <ListItemButton
                  key={cmd.id}
                  onClick={cmd.action}
                  disabled={cmd.disabled}
                  sx={{ py: 0.5 }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {cmd.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={cmd.label}
                    secondary={cmd.description}
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                  {cmd.shortcut && (
                    <Chip
                      label={cmd.shortcut}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.65rem', height: 20 }}
                    />
                  )}
                </ListItemButton>
              ))}
            </List>
          </Box>
        ))}
        {filteredCommands.length === 0 && (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No commands found for "{search}"
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
