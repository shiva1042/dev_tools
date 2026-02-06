import { useState, useEffect, useCallback } from 'react';
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
  ListItemText,
  ListItemSecondaryAction,
  Chip,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import HomeIcon from '@mui/icons-material/Home';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#f43f5e' },
    background: { default: '#0f172a', paper: '#1e293b' },
  },
});

interface SavedEvent {
  id: string;
  name: string;
  date: string;
}

const formatTimeRemaining = (seconds: number): { days: number; hours: number; minutes: number; seconds: number } => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return { days, hours, minutes, seconds: secs };
};

export default function App() {
  const [targetDate, setTargetDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().slice(0, 16);
  });
  const [eventName, setEventName] = useState('My Event');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [savedEvents, setSavedEvents] = useState<SavedEvent[]>([]);

  const calculateTimeRemaining = useCallback(() => {
    const target = new Date(targetDate).getTime();
    const now = Date.now();
    const diff = Math.max(0, Math.floor((target - now) / 1000));
    return diff;
  }, [targetDate]);

  useEffect(() => {
    if (!isRunning) return;

    setTimeRemaining(calculateTimeRemaining());
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, calculateTimeRemaining]);

  const time = formatTimeRemaining(timeRemaining);

  const saveEvent = () => {
    if (!eventName || !targetDate) return;
    setSavedEvents([
      ...savedEvents,
      { id: Date.now().toString(), name: eventName, date: targetDate },
    ]);
  };

  const loadEvent = (event: SavedEvent) => {
    setEventName(event.name);
    setTargetDate(event.date);
  };

  const deleteEvent = (id: string) => {
    setSavedEvents(savedEvents.filter((e) => e.id !== id));
  };

  const reset = () => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    setTargetDate(date.toISOString().slice(0, 16));
    setEventName('My Event');
    setIsRunning(true);
  };

  const presets = [
    { name: '1 Hour', seconds: 3600 },
    { name: '1 Day', seconds: 86400 },
    { name: '1 Week', seconds: 604800 },
    { name: '1 Month', seconds: 2592000 },
  ];

  const setPreset = (seconds: number) => {
    const date = new Date(Date.now() + seconds * 1000);
    setTargetDate(date.toISOString().slice(0, 16));
    setIsRunning(true);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', p: 3 }}>
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
            <IconButton component={Link} to="/" size="small">
              <HomeIcon />
            </IconButton>
            <HourglassEmptyIcon sx={{ color: 'primary.main', fontSize: 32 }} />
            <Typography variant="h5" fontWeight={600} color="primary.main">
              Countdown Timer
            </Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 8 }}>
              {/* Main Timer */}
              <Paper sx={{ p: 4, textAlign: 'center', mb: 3 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {eventName}
                </Typography>

                {timeRemaining > 0 ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, my: 4 }}>
                    {[
                      { value: time.days, label: 'Days' },
                      { value: time.hours, label: 'Hours' },
                      { value: time.minutes, label: 'Minutes' },
                      { value: time.seconds, label: 'Seconds' },
                    ].map(({ value, label }) => (
                      <Paper key={label} sx={{ p: 2, minWidth: 80, bgcolor: 'action.hover' }}>
                        <Typography
                          variant="h3"
                          sx={{
                            fontFamily: 'monospace',
                            fontWeight: 'bold',
                            color: 'primary.main',
                          }}
                        >
                          {String(value).padStart(2, '0')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {label}
                        </Typography>
                      </Paper>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="h3" color="primary.main" sx={{ my: 4 }}>
                    Time's Up!
                  </Typography>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={isRunning ? <PauseIcon /> : <PlayArrowIcon />}
                    onClick={() => setIsRunning(!isRunning)}
                  >
                    {isRunning ? 'Pause' : 'Resume'}
                  </Button>
                  <Button variant="outlined" startIcon={<RefreshIcon />} onClick={reset}>
                    Reset
                  </Button>
                </Box>
              </Paper>

              {/* Settings */}
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Settings
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Event Name"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="Target Date & Time"
                    type="datetime-local"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {presets.map((preset) => (
                      <Chip
                        key={preset.name}
                        label={preset.name}
                        onClick={() => setPreset(preset.seconds)}
                        variant="outlined"
                      />
                    ))}
                  </Box>
                  <Button variant="outlined" startIcon={<AddIcon />} onClick={saveEvent}>
                    Save Event
                  </Button>
                </Box>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Saved Events
                </Typography>
                {savedEvents.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No saved events yet
                  </Typography>
                ) : (
                  <List dense>
                    {savedEvents.map((event) => (
                      <ListItem
                        key={event.id}
                        sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                        onClick={() => loadEvent(event)}
                      >
                        <ListItemText
                          primary={event.name}
                          secondary={new Date(event.date).toLocaleString()}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteEvent(event.id);
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
