import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import HomeIcon from '@mui/icons-material/Home';
import NoteIcon from '@mui/icons-material/Note';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import DownloadIcon from '@mui/icons-material/Download';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#eab308' },
    background: { default: '#0f172a', paper: '#1e293b' },
  },
});

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'notepad-notes';

export default function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

  // Load notes from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const loadedNotes = JSON.parse(saved);
      setNotes(loadedNotes);
      if (loadedNotes.length > 0) {
        setActiveNote(loadedNotes[0]);
      }
    }
  }, []);

  // Save notes to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  const createNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Untitled Note',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes([newNote, ...notes]);
    setActiveNote(newNote);
  };

  const updateNote = (updates: Partial<Note>) => {
    if (!activeNote) return;
    const updatedNote = {
      ...activeNote,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    setActiveNote(updatedNote);
    setNotes(notes.map((n) => (n.id === activeNote.id ? updatedNote : n)));
  };

  const confirmDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNoteToDelete(id);
    setDeleteDialogOpen(true);
  };

  const deleteNote = () => {
    if (!noteToDelete) return;
    const newNotes = notes.filter((n) => n.id !== noteToDelete);
    setNotes(newNotes);
    if (activeNote?.id === noteToDelete) {
      setActiveNote(newNotes.length > 0 ? newNotes[0] : null);
    }
    setDeleteDialogOpen(false);
    setNoteToDelete(null);
  };

  const downloadNote = () => {
    if (!activeNote) return;
    const blob = new Blob([activeNote.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeNote.title}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const wordCount = activeNote?.content.trim() ? activeNote.content.trim().split(/\s+/).length : 0;
  const charCount = activeNote?.content.length || 0;

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', p: 3 }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
            <IconButton component={Link} to="/" size="small">
              <HomeIcon />
            </IconButton>
            <NoteIcon sx={{ color: 'primary.main', fontSize: 32 }} />
            <Typography variant="h5" fontWeight={600} color="primary.main">
              Notepad
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Button startIcon={<AddIcon />} variant="contained" onClick={createNote}>
              New Note
            </Button>
          </Box>

          <Grid container spacing={3}>
            {/* Notes List */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ height: 'calc(100vh - 150px)', overflow: 'auto' }}>
                <List>
                  {notes.length === 0 ? (
                    <ListItem>
                      <ListItemText
                        primary="No notes yet"
                        secondary="Click 'New Note' to create one"
                      />
                    </ListItem>
                  ) : (
                    notes.map((note) => (
                      <ListItemButton
                        key={note.id}
                        selected={activeNote?.id === note.id}
                        onClick={() => setActiveNote(note)}
                      >
                        <ListItemText
                          primary={note.title || 'Untitled'}
                          secondary={formatDate(note.updatedAt)}
                          primaryTypographyProps={{
                            noWrap: true,
                            fontWeight: activeNote?.id === note.id ? 600 : 400,
                          }}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={(e) => confirmDelete(note.id, e)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItemButton>
                    ))
                  )}
                </List>
              </Paper>
            </Grid>

            {/* Editor */}
            <Grid size={{ xs: 12, md: 8 }}>
              {activeNote ? (
                <Paper sx={{ p: 3, height: 'calc(100vh - 150px)', display: 'flex', flexDirection: 'column' }}>
                  <TextField
                    value={activeNote.title}
                    onChange={(e) => updateNote({ title: e.target.value })}
                    variant="standard"
                    placeholder="Note title..."
                    InputProps={{
                      sx: { fontSize: 24, fontWeight: 600 },
                      disableUnderline: true,
                    }}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    value={activeNote.content}
                    onChange={(e) => updateNote({ content: e.target.value })}
                    multiline
                    fullWidth
                    placeholder="Start typing..."
                    variant="outlined"
                    sx={{
                      flex: 1,
                      '& .MuiInputBase-root': { height: '100%', alignItems: 'flex-start' },
                      '& .MuiInputBase-input': { height: '100% !important', fontFamily: 'monospace' },
                    }}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip label={`${wordCount} words`} size="small" />
                      <Chip label={`${charCount} characters`} size="small" />
                    </Box>
                    <Button startIcon={<DownloadIcon />} onClick={downloadNote}>
                      Download
                    </Button>
                  </Box>
                </Paper>
              ) : (
                <Paper
                  sx={{
                    p: 3,
                    height: 'calc(100vh - 150px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <NoteIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography color="text.secondary">
                      Select a note or create a new one
                    </Typography>
                  </Box>
                </Paper>
              )}
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Note?</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this note? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={deleteNote} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}
