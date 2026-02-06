import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import HomeIcon from '@mui/icons-material/Home';
import TimerIcon from '@mui/icons-material/Timer';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RefreshIcon from '@mui/icons-material/Refresh';
import FlagIcon from '@mui/icons-material/Flag';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#06b6d4' },
    background: { default: '#0f172a', paper: '#1e293b' },
  },
});

interface Lap {
  id: number;
  time: number;
  diff: number;
}

const formatTime = (ms: number): string => {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = Math.floor((ms % 1000) / 10);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(2, '0')}`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(2, '0')}`;
};

export default function App() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<Lap[]>([]);
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const accumulatedTimeRef = useRef<number>(0);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now() - accumulatedTimeRef.current;
      intervalRef.current = window.setInterval(() => {
        setTime(Date.now() - startTimeRef.current);
      }, 10);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      accumulatedTimeRef.current = time;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const handleStartStop = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
    setLaps([]);
    accumulatedTimeRef.current = 0;
  };

  const handleLap = () => {
    const lastLapTime = laps.length > 0 ? laps[0].time : 0;
    const diff = time - lastLapTime;
    setLaps([{ id: laps.length + 1, time, diff }, ...laps]);
  };

  const getBestWorst = () => {
    if (laps.length < 2) return { best: -1, worst: -1 };
    const diffs = laps.map((lap, index) => ({
      index,
      diff: lap.diff,
    }));
    diffs.sort((a, b) => a.diff - b.diff);
    return { best: diffs[0].index, worst: diffs[diffs.length - 1].index };
  };

  const { best, worst } = getBestWorst();

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', p: 3 }}>
        <Box sx={{ maxWidth: 600, mx: 'auto' }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
            <IconButton component={Link} to="/" size="small">
              <HomeIcon />
            </IconButton>
            <TimerIcon sx={{ color: 'primary.main', fontSize: 32 }} />
            <Typography variant="h5" fontWeight={600} color="primary.main">
              Stopwatch
            </Typography>
          </Box>

          <Paper sx={{ p: 4, textAlign: 'center', mb: 3 }}>
            <Typography
              variant="h1"
              sx={{
                fontFamily: 'monospace',
                fontWeight: 'bold',
                fontSize: { xs: '3rem', sm: '5rem' },
                color: isRunning ? 'primary.main' : 'text.primary',
                my: 4,
              }}
            >
              {formatTime(time)}
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button
                variant="contained"
                size="large"
                startIcon={isRunning ? <PauseIcon /> : <PlayArrowIcon />}
                onClick={handleStartStop}
                sx={{
                  minWidth: 140,
                  bgcolor: isRunning ? 'warning.main' : 'success.main',
                  '&:hover': {
                    bgcolor: isRunning ? 'warning.dark' : 'success.dark',
                  },
                }}
              >
                {isRunning ? 'Pause' : 'Start'}
              </Button>
              {time > 0 && !isRunning && (
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<RefreshIcon />}
                  onClick={handleReset}
                  sx={{ minWidth: 140 }}
                >
                  Reset
                </Button>
              )}
              {isRunning && (
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<FlagIcon />}
                  onClick={handleLap}
                  sx={{ minWidth: 140 }}
                >
                  Lap
                </Button>
              )}
            </Box>
          </Paper>

          {laps.length > 0 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Laps ({laps.length})
              </Typography>
              <List dense sx={{ maxHeight: 400, overflow: 'auto' }}>
                {laps.map((lap, index) => (
                  <Box key={lap.id}>
                    <ListItem
                      sx={{
                        bgcolor:
                          index === best
                            ? 'success.main'
                            : index === worst
                            ? 'error.main'
                            : 'transparent',
                        borderRadius: 1,
                        mb: 0.5,
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                              Lap {lap.id}
                            </Typography>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                              +{formatTime(lap.diff)}
                            </Typography>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                              {formatTime(lap.time)}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < laps.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
              {laps.length >= 2 && (
                <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'center' }}>
                  <Typography variant="caption" color="success.main">
                    Green = Fastest
                  </Typography>
                  <Typography variant="caption" color="error.main">
                    Red = Slowest
                  </Typography>
                </Box>
              )}
            </Paper>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
