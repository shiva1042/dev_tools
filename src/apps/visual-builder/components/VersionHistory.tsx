import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  TextField,
  Chip,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  Close as CloseIcon,
  Restore as RestoreIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { useBuilderStore } from '../store/useBuilderStore';

interface VersionHistoryProps {
  open: boolean;
  onClose: () => void;
}

export function VersionHistory({ open, onClose }: VersionHistoryProps) {
  const [newSnapshotDescription, setNewSnapshotDescription] = useState('');
  const { versionSnapshots, createSnapshot, restoreSnapshot, deleteSnapshot } = useBuilderStore();

  const handleCreateSnapshot = () => {
    if (newSnapshotDescription.trim()) {
      createSnapshot(newSnapshotDescription.trim());
      setNewSnapshotDescription('');
    }
  };

  const handleRestore = (id: string) => {
    restoreSnapshot(id);
    onClose();
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  const getTimeAgo = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HistoryIcon color="primary" />
          <Typography variant="h6">Version History</Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* Create new snapshot */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Create New Snapshot
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Snapshot description..."
              value={newSnapshotDescription}
              onChange={(e) => setNewSnapshotDescription(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateSnapshot();
                }
              }}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateSnapshot}
              disabled={!newSnapshotDescription.trim()}
            >
              Create
            </Button>
          </Box>
        </Box>

        {/* Snapshots list */}
        <Typography variant="subtitle2" gutterBottom>
          Saved Snapshots ({versionSnapshots.length})
        </Typography>

        {versionSnapshots.length === 0 ? (
          <Alert severity="info" sx={{ mt: 1 }}>
            No snapshots yet. Create a snapshot to save your current work and restore it later.
          </Alert>
        ) : (
          <List disablePadding>
            {[...versionSnapshots].reverse().map((snapshot, index) => (
              <ListItem
                key={snapshot.id}
                sx={{
                  borderRadius: 1,
                  mb: 1,
                  border: 1,
                  borderColor: 'divider',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" fontWeight={500}>
                        {snapshot.description}
                      </Typography>
                      {index === 0 && (
                        <Chip label="Latest" size="small" color="primary" sx={{ height: 20, fontSize: '0.65rem' }} />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(snapshot.timestamp)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ({getTimeAgo(snapshot.timestamp)})
                      </Typography>
                      <Chip
                        label={`${snapshot.components.length} components`}
                        size="small"
                        variant="outlined"
                        sx={{ height: 18, fontSize: '0.6rem' }}
                      />
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <Tooltip title="Restore this version">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleRestore(snapshot.id)}
                      sx={{ mr: 0.5 }}
                    >
                      <RestoreIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete snapshot">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => deleteSnapshot(snapshot.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
