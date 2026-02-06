import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Grid,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import HomeIcon from '@mui/icons-material/Home';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#f59e0b' },
    background: { default: '#0f172a', paper: '#1e293b' },
  },
});

interface ActionItem {
  id: string;
  text: string;
  assignee: string;
  done: boolean;
}

interface MeetingNotes {
  title: string;
  date: string;
  time: string;
  attendees: string;
  agenda: string;
  discussion: string;
  decisions: string;
  actionItems: ActionItem[];
  nextMeeting: string;
}

export default function App() {
  const [copied, setCopied] = useState(false);
  const [notes, setNotes] = useState<MeetingNotes>({
    title: 'Weekly Team Standup',
    date: new Date().toISOString().split('T')[0],
    time: '10:00 AM',
    attendees: 'John Doe, Jane Smith, Bob Wilson',
    agenda: '1. Sprint progress update\n2. Blockers discussion\n3. Next week planning',
    discussion: '',
    decisions: '',
    actionItems: [],
    nextMeeting: '',
  });
  const [newActionItem, setNewActionItem] = useState({ text: '', assignee: '' });

  const addActionItem = () => {
    if (!newActionItem.text) return;
    setNotes({
      ...notes,
      actionItems: [
        ...notes.actionItems,
        { id: Date.now().toString(), ...newActionItem, done: false },
      ],
    });
    setNewActionItem({ text: '', assignee: '' });
  };

  const removeActionItem = (id: string) => {
    setNotes({
      ...notes,
      actionItems: notes.actionItems.filter((item) => item.id !== id),
    });
  };

  const toggleActionItem = (id: string) => {
    setNotes({
      ...notes,
      actionItems: notes.actionItems.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item
      ),
    });
  };

  const generateMarkdown = (): string => {
    let md = `# ${notes.title}\n\n`;
    md += `**Date:** ${notes.date} at ${notes.time}\n\n`;
    md += `**Attendees:** ${notes.attendees}\n\n`;
    md += `---\n\n`;
    md += `## Agenda\n${notes.agenda}\n\n`;
    if (notes.discussion) {
      md += `## Discussion Notes\n${notes.discussion}\n\n`;
    }
    if (notes.decisions) {
      md += `## Decisions Made\n${notes.decisions}\n\n`;
    }
    if (notes.actionItems.length > 0) {
      md += `## Action Items\n`;
      notes.actionItems.forEach((item) => {
        md += `- [${item.done ? 'x' : ' '}] ${item.text}${item.assignee ? ` (@${item.assignee})` : ''}\n`;
      });
      md += '\n';
    }
    if (notes.nextMeeting) {
      md += `## Next Meeting\n${notes.nextMeeting}\n`;
    }
    return md;
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generateMarkdown());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([generateMarkdown()], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `meeting-notes-${notes.date}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

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
            <NoteAltIcon sx={{ color: 'primary.main', fontSize: 32 }} />
            <Typography variant="h5" fontWeight={600} color="primary.main">
              Meeting Notes
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Button startIcon={<ContentCopyIcon />} variant="outlined" onClick={handleCopy}>
              {copied ? 'Copied!' : 'Copy Markdown'}
            </Button>
            <Button startIcon={<DownloadIcon />} variant="contained" onClick={handleDownload}>
              Download
            </Button>
          </Box>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Meeting Details
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Meeting Title"
                    value={notes.title}
                    onChange={(e) => setNotes({ ...notes, title: e.target.value })}
                    fullWidth
                  />
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      label="Date"
                      type="date"
                      value={notes.date}
                      onChange={(e) => setNotes({ ...notes, date: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                      sx={{ flex: 1 }}
                    />
                    <TextField
                      label="Time"
                      value={notes.time}
                      onChange={(e) => setNotes({ ...notes, time: e.target.value })}
                      sx={{ flex: 1 }}
                    />
                  </Box>
                  <TextField
                    label="Attendees"
                    value={notes.attendees}
                    onChange={(e) => setNotes({ ...notes, attendees: e.target.value })}
                    helperText="Comma-separated names"
                    fullWidth
                  />
                  <TextField
                    label="Agenda"
                    value={notes.agenda}
                    onChange={(e) => setNotes({ ...notes, agenda: e.target.value })}
                    multiline
                    rows={4}
                    fullWidth
                  />
                  <TextField
                    label="Discussion Notes"
                    value={notes.discussion}
                    onChange={(e) => setNotes({ ...notes, discussion: e.target.value })}
                    multiline
                    rows={4}
                    fullWidth
                  />
                  <TextField
                    label="Decisions Made"
                    value={notes.decisions}
                    onChange={(e) => setNotes({ ...notes, decisions: e.target.value })}
                    multiline
                    rows={3}
                    fullWidth
                  />
                  <TextField
                    label="Next Meeting"
                    value={notes.nextMeeting}
                    onChange={(e) => setNotes({ ...notes, nextMeeting: e.target.value })}
                    fullWidth
                  />
                </Box>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom>
                  Action Items
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    label="Action Item"
                    value={newActionItem.text}
                    onChange={(e) => setNewActionItem({ ...newActionItem, text: e.target.value })}
                    size="small"
                    sx={{ flex: 2 }}
                  />
                  <TextField
                    label="Assignee"
                    value={newActionItem.assignee}
                    onChange={(e) => setNewActionItem({ ...newActionItem, assignee: e.target.value })}
                    size="small"
                    sx={{ flex: 1 }}
                  />
                  <Button variant="contained" onClick={addActionItem}>
                    <AddIcon />
                  </Button>
                </Box>
                <List dense>
                  {notes.actionItems.map((item) => (
                    <ListItem
                      key={item.id}
                      secondaryAction={
                        <IconButton edge="end" onClick={() => removeActionItem(item.id)}>
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      <ListItemIcon>
                        <Checkbox checked={item.done} onChange={() => toggleActionItem(item.id)} />
                      </ListItemIcon>
                      <ListItemText
                        primary={item.text}
                        secondary={item.assignee ? `@${item.assignee}` : null}
                        sx={{ textDecoration: item.done ? 'line-through' : 'none' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Preview
                </Typography>
                <Paper sx={{ p: 3, bgcolor: '#1a1a2e', minHeight: 400 }}>
                  <Typography variant="h5" gutterBottom>
                    {notes.title}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip label={notes.date} size="small" />
                    <Chip label={notes.time} size="small" />
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Attendees:</strong> {notes.attendees}
                  </Typography>
                  <Divider sx={{ my: 2 }} />

                  {notes.agenda && (
                    <>
                      <Typography variant="subtitle2" color="primary.main">
                        Agenda
                      </Typography>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
                        {notes.agenda}
                      </Typography>
                    </>
                  )}

                  {notes.discussion && (
                    <>
                      <Typography variant="subtitle2" color="primary.main">
                        Discussion
                      </Typography>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
                        {notes.discussion}
                      </Typography>
                    </>
                  )}

                  {notes.decisions && (
                    <>
                      <Typography variant="subtitle2" color="primary.main">
                        Decisions
                      </Typography>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
                        {notes.decisions}
                      </Typography>
                    </>
                  )}

                  {notes.actionItems.length > 0 && (
                    <>
                      <Typography variant="subtitle2" color="primary.main">
                        Action Items
                      </Typography>
                      {notes.actionItems.map((item) => (
                        <Typography key={item.id} variant="body2">
                          • {item.text} {item.assignee && `(@${item.assignee})`}
                        </Typography>
                      ))}
                    </>
                  )}
                </Paper>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
