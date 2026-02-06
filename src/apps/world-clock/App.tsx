import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  List,
  ListItemButton,
  ListItemText,
  Chip,
  Divider,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import HomeIcon from '@mui/icons-material/Home';
import PublicIcon from '@mui/icons-material/Public';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import WbTwilightIcon from '@mui/icons-material/WbTwilight';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#0ea5e9' },
    background: { default: '#0f172a', paper: '#1e293b' },
  },
});

interface TimeZone {
  id: string;
  name: string;
  offset: string;
  city: string;
  country: string;
}

const popularTimezones: TimeZone[] = [
  { id: 'UTC', name: 'UTC', offset: '+00:00', city: 'Coordinated Universal Time', country: '' },
  { id: 'America/New_York', name: 'Eastern Time', offset: '-05:00', city: 'New York', country: 'USA' },
  { id: 'America/Los_Angeles', name: 'Pacific Time', offset: '-08:00', city: 'Los Angeles', country: 'USA' },
  { id: 'America/Chicago', name: 'Central Time', offset: '-06:00', city: 'Chicago', country: 'USA' },
  { id: 'Europe/London', name: 'GMT', offset: '+00:00', city: 'London', country: 'UK' },
  { id: 'Europe/Paris', name: 'Central European', offset: '+01:00', city: 'Paris', country: 'France' },
  { id: 'Europe/Berlin', name: 'Central European', offset: '+01:00', city: 'Berlin', country: 'Germany' },
  { id: 'Asia/Tokyo', name: 'Japan Standard', offset: '+09:00', city: 'Tokyo', country: 'Japan' },
  { id: 'Asia/Shanghai', name: 'China Standard', offset: '+08:00', city: 'Shanghai', country: 'China' },
  { id: 'Asia/Kolkata', name: 'India Standard', offset: '+05:30', city: 'Mumbai', country: 'India' },
  { id: 'Asia/Dubai', name: 'Gulf Standard', offset: '+04:00', city: 'Dubai', country: 'UAE' },
  { id: 'Asia/Singapore', name: 'Singapore', offset: '+08:00', city: 'Singapore', country: 'Singapore' },
  { id: 'Australia/Sydney', name: 'Australian Eastern', offset: '+11:00', city: 'Sydney', country: 'Australia' },
  { id: 'Pacific/Auckland', name: 'New Zealand', offset: '+13:00', city: 'Auckland', country: 'New Zealand' },
  { id: 'America/Sao_Paulo', name: 'Brasilia', offset: '-03:00', city: 'São Paulo', country: 'Brazil' },
  { id: 'Africa/Johannesburg', name: 'South Africa', offset: '+02:00', city: 'Johannesburg', country: 'South Africa' },
];

const getTimeInTimezone = (timezone: string): Date => {
  return new Date(new Date().toLocaleString('en-US', { timeZone: timezone }));
};

const formatTime = (date: Date, format: '12h' | '24h' = '24h'): string => {
  if (format === '12h') {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  }
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
};

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

const getTimeOfDay = (date: Date): 'morning' | 'day' | 'evening' | 'night' => {
  const hour = date.getHours();
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'day';
  if (hour >= 18 && hour < 21) return 'evening';
  return 'night';
};

const getTimeIcon = (timeOfDay: string) => {
  switch (timeOfDay) {
    case 'morning':
      return <WbTwilightIcon sx={{ color: '#fbbf24' }} />;
    case 'day':
      return <LightModeIcon sx={{ color: '#fbbf24' }} />;
    case 'evening':
      return <WbTwilightIcon sx={{ color: '#f97316' }} />;
    case 'night':
      return <DarkModeIcon sx={{ color: '#6366f1' }} />;
  }
};

const getTimeColor = (timeOfDay: string): string => {
  switch (timeOfDay) {
    case 'morning':
      return 'linear-gradient(135deg, #fbbf24, #f59e0b)';
    case 'day':
      return 'linear-gradient(135deg, #0ea5e9, #06b6d4)';
    case 'evening':
      return 'linear-gradient(135deg, #f97316, #ea580c)';
    case 'night':
      return 'linear-gradient(135deg, #6366f1, #4f46e5)';
    default:
      return 'linear-gradient(135deg, #64748b, #475569)';
  }
};

export default function App() {
  const [selectedTimezones, setSelectedTimezones] = useState<TimeZone[]>([
    popularTimezones[0], // UTC
    popularTimezones[1], // New York
    popularTimezones[4], // London
    popularTimezones[7], // Tokyo
    popularTimezones[9], // Mumbai
  ]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [format, setFormat] = useState<'12h' | '24h'>('24h');

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const addTimezone = (tz: TimeZone) => {
    if (!selectedTimezones.find((t) => t.id === tz.id)) {
      setSelectedTimezones([...selectedTimezones, tz]);
    }
    setDialogOpen(false);
    setSearch('');
  };

  const removeTimezone = (id: string) => {
    setSelectedTimezones(selectedTimezones.filter((t) => t.id !== id));
  };

  const filteredTimezones = popularTimezones.filter(
    (tz) =>
      tz.city.toLowerCase().includes(search.toLowerCase()) ||
      tz.country.toLowerCase().includes(search.toLowerCase()) ||
      tz.name.toLowerCase().includes(search.toLowerCase())
  );

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
            <PublicIcon sx={{ color: 'primary.main', fontSize: 32 }} />
            <Typography variant="h5" fontWeight={600} color="primary.main">
              World Clock
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Chip
              label={format === '24h' ? '24H' : '12H'}
              onClick={() => setFormat(format === '24h' ? '12h' : '24h')}
              color="primary"
              variant="outlined"
            />
            <Button startIcon={<AddIcon />} variant="outlined" onClick={() => setDialogOpen(true)}>
              Add City
            </Button>
          </Box>

          {/* Clocks Grid */}
          <Grid container spacing={3}>
            {selectedTimezones.map((tz) => {
              const time = getTimeInTimezone(tz.id);
              const timeOfDay = getTimeOfDay(time);

              return (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={tz.id}>
                  <Paper
                    sx={{
                      p: 3,
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 4,
                        background: getTimeColor(timeOfDay),
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="h6" fontWeight={600}>
                          {tz.city || tz.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {tz.country} ({tz.offset})
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getTimeIcon(timeOfDay)}
                        <IconButton size="small" onClick={() => removeTimezone(tz.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>

                    <Typography
                      variant="h2"
                      sx={{
                        fontFamily: 'monospace',
                        fontWeight: 'bold',
                        mt: 2,
                        background: getTimeColor(timeOfDay),
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      {formatTime(time, format)}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {formatDate(time)}
                    </Typography>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>

          {/* Time Comparison */}
          {selectedTimezones.length > 1 && (
            <Paper sx={{ mt: 4, p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Time Comparison
              </Typography>
              <Box sx={{ overflowX: 'auto' }}>
                <Box sx={{ display: 'flex', gap: 1, minWidth: 'max-content' }}>
                  {Array.from({ length: 24 }, (_, hour) => {
                    const baseTime = new Date();
                    baseTime.setHours(hour, 0, 0, 0);

                    return (
                      <Box key={hour} sx={{ minWidth: 60 }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'block', textAlign: 'center', mb: 1 }}
                        >
                          {hour.toString().padStart(2, '0')}:00
                        </Typography>
                        {selectedTimezones.slice(0, 5).map((tz, idx) => {
                          const offset = new Date().toLocaleString('en-US', { timeZone: tz.id });
                          const tzDate = new Date(offset);
                          const diff = tzDate.getTimezoneOffset();
                          const localHour = (hour - Math.floor(diff / 60) + 24) % 24;
                          const isWorkHour = localHour >= 9 && localHour < 18;
                          const isNight = localHour >= 22 || localHour < 6;

                          return (
                            <Box
                              key={tz.id}
                              sx={{
                                height: 24,
                                bgcolor: isNight
                                  ? 'rgba(99, 102, 241, 0.3)'
                                  : isWorkHour
                                  ? 'rgba(34, 197, 94, 0.3)'
                                  : 'rgba(100, 116, 139, 0.2)',
                                borderRadius: 0.5,
                                mb: 0.5,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Typography variant="caption" sx={{ fontSize: 10 }}>
                                {idx === 0 && tz.city?.slice(0, 3)}
                              </Typography>
                            </Box>
                          );
                        })}
                      </Box>
                    );
                  })}
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 12, height: 12, bgcolor: 'rgba(34, 197, 94, 0.3)', borderRadius: 0.5 }} />
                  <Typography variant="caption">Work hours (9-18)</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 12, height: 12, bgcolor: 'rgba(99, 102, 241, 0.3)', borderRadius: 0.5 }} />
                  <Typography variant="caption">Night (22-6)</Typography>
                </Box>
              </Box>
            </Paper>
          )}
        </Box>
      </Box>

      {/* Add Timezone Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add City</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            placeholder="Search cities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ mb: 2 }}
            autoFocus
          />
          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            {filteredTimezones.map((tz) => (
              <ListItemButton
                key={tz.id}
                onClick={() => addTimezone(tz)}
                disabled={!!selectedTimezones.find((t) => t.id === tz.id)}
              >
                <ListItemText
                  primary={tz.city || tz.name}
                  secondary={`${tz.country} · ${tz.name} (${tz.offset})`}
                />
              </ListItemButton>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    </ThemeProvider>
  );
}
