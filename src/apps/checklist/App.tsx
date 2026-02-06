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
  ListItemIcon,
  ListItemText,
  Checkbox,
  LinearProgress,
  Chip,
  Divider,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import HomeIcon from '@mui/icons-material/Home';
import ChecklistIcon from '@mui/icons-material/Checklist';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#14b8a6' },
    background: { default: '#0f172a', paper: '#1e293b' },
  },
});

interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

interface Checklist {
  id: string;
  title: string;
  items: ChecklistItem[];
}

const templates = [
  {
    title: 'Meeting Preparation',
    items: ['Review agenda', 'Prepare presentation', 'Send reminders', 'Set up meeting room', 'Test AV equipment'],
  },
  {
    title: 'Code Review',
    items: ['Check code style', 'Review logic', 'Test edge cases', 'Check documentation', 'Verify tests pass'],
  },
  {
    title: 'Deployment',
    items: ['Run tests', 'Update changelog', 'Backup database', 'Deploy to staging', 'Smoke test', 'Deploy to production'],
  },
  {
    title: 'Travel',
    items: ['Book flights', 'Reserve hotel', 'Pack essentials', 'Notify team', 'Set auto-reply'],
  },
];

const STORAGE_KEY = 'checklists-data';

export default function App() {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [activeChecklist, setActiveChecklist] = useState<Checklist | null>(null);
  const [newItemText, setNewItemText] = useState('');
  const [newChecklistTitle, setNewChecklistTitle] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const loaded = JSON.parse(saved);
      setChecklists(loaded);
      if (loaded.length > 0) {
        setActiveChecklist(loaded[0]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checklists));
  }, [checklists]);

  const createChecklist = (title: string, items: string[] = []) => {
    const newChecklist: Checklist = {
      id: Date.now().toString(),
      title: title || 'New Checklist',
      items: items.map((text, i) => ({ id: `${Date.now()}-${i}`, text, checked: false })),
    };
    setChecklists([newChecklist, ...checklists]);
    setActiveChecklist(newChecklist);
    setNewChecklistTitle('');
  };

  const addItem = () => {
    if (!activeChecklist || !newItemText.trim()) return;
    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      text: newItemText.trim(),
      checked: false,
    };
    const updated = {
      ...activeChecklist,
      items: [...activeChecklist.items, newItem],
    };
    setActiveChecklist(updated);
    setChecklists(checklists.map((c) => (c.id === activeChecklist.id ? updated : c)));
    setNewItemText('');
  };

  const toggleItem = (itemId: string) => {
    if (!activeChecklist) return;
    const updated = {
      ...activeChecklist,
      items: activeChecklist.items.map((item) =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      ),
    };
    setActiveChecklist(updated);
    setChecklists(checklists.map((c) => (c.id === activeChecklist.id ? updated : c)));
  };

  const deleteItem = (itemId: string) => {
    if (!activeChecklist) return;
    const updated = {
      ...activeChecklist,
      items: activeChecklist.items.filter((item) => item.id !== itemId),
    };
    setActiveChecklist(updated);
    setChecklists(checklists.map((c) => (c.id === activeChecklist.id ? updated : c)));
  };

  const deleteChecklist = (id: string) => {
    const newChecklists = checklists.filter((c) => c.id !== id);
    setChecklists(newChecklists);
    if (activeChecklist?.id === id) {
      setActiveChecklist(newChecklists.length > 0 ? newChecklists[0] : null);
    }
  };

  const duplicateChecklist = () => {
    if (!activeChecklist) return;
    createChecklist(
      `${activeChecklist.title} (Copy)`,
      activeChecklist.items.map((i) => i.text)
    );
  };

  const progress = activeChecklist
    ? activeChecklist.items.length > 0
      ? (activeChecklist.items.filter((i) => i.checked).length / activeChecklist.items.length) * 100
      : 0
    : 0;

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', p: 3 }}>
        <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
            <IconButton component={Link} to="/" size="small">
              <HomeIcon />
            </IconButton>
            <ChecklistIcon sx={{ color: 'primary.main', fontSize: 32 }} />
            <Typography variant="h5" fontWeight={600} color="primary.main">
              Checklist
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {/* Sidebar */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Create New
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    size="small"
                    placeholder="Checklist title..."
                    value={newChecklistTitle}
                    onChange={(e) => setNewChecklistTitle(e.target.value)}
                    fullWidth
                  />
                  <Button variant="contained" onClick={() => createChecklist(newChecklistTitle)}>
                    <AddIcon />
                  </Button>
                </Box>
              </Paper>

              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Templates
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {templates.map((template) => (
                    <Chip
                      key={template.title}
                      label={template.title}
                      onClick={() => createChecklist(template.title, template.items)}
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Box>
              </Paper>

              <Paper sx={{ maxHeight: 400, overflow: 'auto' }}>
                <List dense>
                  {checklists.map((checklist) => {
                    const completed = checklist.items.filter((i) => i.checked).length;
                    return (
                      <ListItem
                        key={checklist.id}
                        sx={{
                          cursor: 'pointer',
                          bgcolor: activeChecklist?.id === checklist.id ? 'action.selected' : 'transparent',
                        }}
                        onClick={() => setActiveChecklist(checklist)}
                        secondaryAction={
                          <IconButton size="small" onClick={() => deleteChecklist(checklist.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        }
                      >
                        <ListItemText
                          primary={checklist.title}
                          secondary={`${completed}/${checklist.items.length} completed`}
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </Paper>
            </Grid>

            {/* Main Content */}
            <Grid size={{ xs: 12, md: 8 }}>
              {activeChecklist ? (
                <Paper sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ flex: 1 }}>
                      {activeChecklist.title}
                    </Typography>
                    <Button startIcon={<ContentCopyIcon />} onClick={duplicateChecklist} size="small">
                      Duplicate
                    </Button>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Progress
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {Math.round(progress)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      sx={{ height: 8, borderRadius: 1 }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <TextField
                      size="small"
                      placeholder="Add item..."
                      value={newItemText}
                      onChange={(e) => setNewItemText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addItem()}
                      fullWidth
                    />
                    <Button variant="contained" onClick={addItem}>
                      <AddIcon />
                    </Button>
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  <List>
                    {activeChecklist.items.map((item) => (
                      <ListItem
                        key={item.id}
                        secondaryAction={
                          <IconButton size="small" onClick={() => deleteItem(item.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        }
                      >
                        <ListItemIcon>
                          <Checkbox
                            checked={item.checked}
                            onChange={() => toggleItem(item.id)}
                            color="primary"
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={item.text}
                          sx={{
                            textDecoration: item.checked ? 'line-through' : 'none',
                            color: item.checked ? 'text.secondary' : 'text.primary',
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>

                  {activeChecklist.items.length === 0 && (
                    <Typography color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                      No items yet. Add your first item above.
                    </Typography>
                  )}
                </Paper>
              ) : (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <ChecklistIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography color="text.secondary">
                    Select a checklist or create a new one
                  </Typography>
                </Paper>
              )}
            </Grid>
          </Grid>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
