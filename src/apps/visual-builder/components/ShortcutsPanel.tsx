import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Chip,
  Divider,
  Grid,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { DEFAULT_KEYBOARD_SHORTCUTS } from '../types';

interface ShortcutsPanelProps {
  open: boolean;
  onClose: () => void;
}

interface ShortcutCategory {
  name: string;
  shortcuts: { key: string; description: string }[];
}

export function ShortcutsPanel({ open, onClose }: ShortcutsPanelProps) {
  const formatShortcut = (shortcut: typeof DEFAULT_KEYBOARD_SHORTCUTS[0]) => {
    const parts: string[] = [];
    if (shortcut.ctrl) parts.push('Ctrl');
    if (shortcut.shift) parts.push('Shift');
    if (shortcut.alt) parts.push('Alt');
    parts.push(shortcut.key);
    return parts.join(' + ');
  };

  const categories: ShortcutCategory[] = [
    {
      name: 'General',
      shortcuts: [
        { key: 'Ctrl + K', description: 'Open command palette' },
        { key: '?', description: 'Show keyboard shortcuts' },
        { key: 'Ctrl + S', description: 'Save project' },
        { key: 'Escape', description: 'Deselect all / Close dialogs' },
      ],
    },
    {
      name: 'Edit',
      shortcuts: [
        { key: 'Ctrl + Z', description: 'Undo' },
        { key: 'Ctrl + Shift + Z', description: 'Redo' },
        { key: 'Ctrl + Y', description: 'Redo (alternative)' },
        { key: 'Ctrl + C', description: 'Copy' },
        { key: 'Ctrl + V', description: 'Paste' },
        { key: 'Ctrl + X', description: 'Cut' },
        { key: 'Ctrl + D', description: 'Duplicate' },
        { key: 'Delete / Backspace', description: 'Delete selected' },
        { key: 'Ctrl + A', description: 'Select all' },
      ],
    },
    {
      name: 'Components',
      shortcuts: [
        { key: 'Ctrl + G', description: 'Group selected' },
        { key: 'Ctrl + Shift + G', description: 'Ungroup' },
        { key: 'Ctrl + L', description: 'Lock / Unlock' },
        { key: 'Arrow Up', description: 'Move component up' },
        { key: 'Arrow Down', description: 'Move component down' },
      ],
    },
    {
      name: 'View',
      shortcuts: [
        { key: 'Ctrl + +', description: 'Zoom in' },
        { key: 'Ctrl + -', description: 'Zoom out' },
        { key: 'Ctrl + 0', description: 'Reset zoom' },
      ],
    },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Keyboard Shortcuts</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          {categories.map((category) => (
            <Grid key={category.name} size={{ xs: 12, sm: 6 }}>
              <Typography variant="subtitle2" color="primary" gutterBottom fontWeight={600}>
                {category.name}
              </Typography>
              <Box sx={{ mb: 2 }}>
                {category.shortcuts.map((shortcut, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 0.75,
                      borderBottom: idx < category.shortcuts.length - 1 ? 1 : 0,
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {shortcut.description}
                    </Typography>
                    <Chip
                      label={shortcut.key}
                      size="small"
                      variant="outlined"
                      sx={{
                        fontFamily: 'monospace',
                        fontSize: '0.7rem',
                        height: 24,
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Tip: Press <Chip label="Ctrl + K" size="small" sx={{ fontSize: '0.65rem', height: 18, mx: 0.5 }} /> to open the command palette for quick access to all actions
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
