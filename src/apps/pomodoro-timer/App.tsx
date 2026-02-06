import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Slider,
  LinearProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
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
import StopIcon from '@mui/icons-material/Stop';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SettingsIcon from '@mui/icons-material/Settings';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import HistoryIcon from '@mui/icons-material/History';
import CoffeeIcon from '@mui/icons-material/Coffee';
import WorkIcon from '@mui/icons-material/Work';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#ef4444' },
    secondary: { main: '#22c55e' },
    background: { default: '#0f172a', paper: '#1e293b' },
  },
});

type TimerMode = 'work' | 'shortBreak' | 'longBreak';

interface Session {
  type: TimerMode;
  duration: number;
  completedAt: Date;
}

export default function App() {
  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);

  // Settings
  const [workDuration, setWorkDuration] = useState(25);
  const [shortBreakDuration, setShortBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(15);
  const [sessionsUntilLongBreak, setSessionsUntilLongBreak] = useState(4);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const getDuration = useCallback((m: TimerMode) => {
    switch (m) {
      case 'work': return workDuration * 60;
      case 'shortBreak': return shortBreakDuration * 60;
      case 'longBreak': return longBreakDuration * 60;
    }
  }, [workDuration, shortBreakDuration, longBreakDuration]);

  const playSound = useCallback(() => {
    if (soundEnabled) {
      // Create a simple beep using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.3;

      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        audioContext.close();
      }, 200);
    }
  }, [soundEnabled]);

  const handleModeChange = (newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(getDuration(newMode));
    setIsRunning(false);
  };

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleStop = () => {
    setIsRunning(false);
    setTimeLeft(getDuration(mode));
  };

  const handleSkip = () => {
    completeSession();
  };

  const completeSession = useCallback(() => {
    playSound();

    setSessions((prev) => [
      { type: mode, duration: getDuration(mode), completedAt: new Date() },
      ...prev,
    ]);

    if (mode === 'work') {
      const newSessions = sessionsCompleted + 1;
      setSessionsCompleted(newSessions);

      if (newSessions % sessionsUntilLongBreak === 0) {
        handleModeChange('longBreak');
      } else {
        handleModeChange('shortBreak');
      }
    } else {
      handleModeChange('work');
    }
  }, [mode, sessionsCompleted, sessionsUntilLongBreak, getDuration, playSound]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      completeSession();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, completeSession]);

  useEffect(() => {
    setTimeLeft(getDuration(mode));
  }, [workDuration, shortBreakDuration, longBreakDuration, mode, getDuration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((getDuration(mode) - timeLeft) / getDuration(mode)) * 100;

  const getModeColor = () => {
    switch (mode) {
      case 'work': return '#ef4444';
      case 'shortBreak': return '#22c55e';
      case 'longBreak': return '#3b82f6';
    }
  };

  const getModeLabel = () => {
    switch (mode) {
      case 'work': return 'Focus Time';
      case 'shortBreak': return 'Short Break';
      case 'longBreak': return 'Long Break';
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          background: `radial-gradient(circle at center, ${getModeColor()}20, transparent 70%)`,
        }}
      >
        {/* Header */}
        <Box sx={{ position: 'absolute', top: 16, left: 16, display: 'flex', gap: 1 }}>
          <IconButton component={Link} to="/" size="small">
            <HomeIcon />
          </IconButton>
        </Box>

        <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 1 }}>
          <IconButton onClick={() => setSoundEnabled(!soundEnabled)} size="small">
            {soundEnabled ? <VolumeUpIcon /> : <VolumeOffIcon />}
          </IconButton>
          <IconButton onClick={() => setHistoryOpen(true)} size="small">
            <HistoryIcon />
          </IconButton>
          <IconButton onClick={() => setSettingsOpen(true)} size="small">
            <SettingsIcon />
          </IconButton>
        </Box>

        {/* Main Timer */}
        <Paper
          sx={{
            p: 6,
            textAlign: 'center',
            minWidth: 400,
            borderRadius: 4,
            border: `2px solid ${getModeColor()}40`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
            {mode === 'work' ? (
              <WorkIcon sx={{ color: getModeColor() }} />
            ) : (
              <CoffeeIcon sx={{ color: getModeColor() }} />
            )}
            <Typography variant="h6" sx={{ color: getModeColor() }}>
              {getModeLabel()}
            </Typography>
          </Box>

          <Typography
            variant="h1"
            sx={{
              fontFamily: 'monospace',
              fontWeight: 'bold',
              fontSize: '6rem',
              color: getModeColor(),
              textShadow: `0 0 30px ${getModeColor()}50`,
            }}
          >
            {formatTime(timeLeft)}
          </Typography>

          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              mt: 3,
              mb: 3,
              height: 8,
              borderRadius: 4,
              bgcolor: 'rgba(255,255,255,0.1)',
              '& .MuiLinearProgress-bar': {
                bgcolor: getModeColor(),
                borderRadius: 4,
              },
            }}
          />

          {/* Controls */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 3 }}>
            {!isRunning ? (
              <Button
                variant="contained"
                size="large"
                startIcon={<PlayArrowIcon />}
                onClick={handleStart}
                sx={{ bgcolor: getModeColor(), '&:hover': { bgcolor: getModeColor() } }}
              >
                Start
              </Button>
            ) : (
              <Button
                variant="contained"
                size="large"
                startIcon={<PauseIcon />}
                onClick={handlePause}
                sx={{ bgcolor: getModeColor(), '&:hover': { bgcolor: getModeColor() } }}
              >
                Pause
              </Button>
            )}
            <Button
              variant="outlined"
              size="large"
              startIcon={<StopIcon />}
              onClick={handleStop}
            >
              Reset
            </Button>
            <IconButton onClick={handleSkip} title="Skip to next">
              <SkipNextIcon />
            </IconButton>
          </Box>

          {/* Mode Tabs */}
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
            <Chip
              label="Focus"
              onClick={() => handleModeChange('work')}
              color={mode === 'work' ? 'error' : 'default'}
              variant={mode === 'work' ? 'filled' : 'outlined'}
            />
            <Chip
              label="Short Break"
              onClick={() => handleModeChange('shortBreak')}
              color={mode === 'shortBreak' ? 'success' : 'default'}
              variant={mode === 'shortBreak' ? 'filled' : 'outlined'}
            />
            <Chip
              label="Long Break"
              onClick={() => handleModeChange('longBreak')}
              color={mode === 'longBreak' ? 'primary' : 'default'}
              variant={mode === 'longBreak' ? 'filled' : 'outlined'}
            />
          </Box>
        </Paper>

        {/* Session Counter */}
        <Typography sx={{ mt: 3, color: 'text.secondary' }}>
          Sessions completed today: <strong>{sessionsCompleted}</strong>
        </Typography>

        {/* Settings Dialog */}
        <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)}>
          <DialogTitle>Timer Settings</DialogTitle>
          <DialogContent sx={{ minWidth: 300 }}>
            <Box sx={{ mt: 2 }}>
              <Typography gutterBottom>Focus Duration: {workDuration} min</Typography>
              <Slider
                value={workDuration}
                onChange={(_, v) => setWorkDuration(v as number)}
                min={1}
                max={60}
                valueLabelDisplay="auto"
              />
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography gutterBottom>Short Break: {shortBreakDuration} min</Typography>
              <Slider
                value={shortBreakDuration}
                onChange={(_, v) => setShortBreakDuration(v as number)}
                min={1}
                max={30}
                valueLabelDisplay="auto"
              />
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography gutterBottom>Long Break: {longBreakDuration} min</Typography>
              <Slider
                value={longBreakDuration}
                onChange={(_, v) => setLongBreakDuration(v as number)}
                min={5}
                max={60}
                valueLabelDisplay="auto"
              />
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography gutterBottom>Sessions until Long Break: {sessionsUntilLongBreak}</Typography>
              <Slider
                value={sessionsUntilLongBreak}
                onChange={(_, v) => setSessionsUntilLongBreak(v as number)}
                min={2}
                max={8}
                valueLabelDisplay="auto"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSettingsOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* History Dialog */}
        <Dialog open={historyOpen} onClose={() => setHistoryOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Session History</DialogTitle>
          <DialogContent>
            {sessions.length === 0 ? (
              <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                No sessions completed yet
              </Typography>
            ) : (
              <List>
                {sessions.slice(0, 20).map((session, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {session.type === 'work' ? <WorkIcon fontSize="small" /> : <CoffeeIcon fontSize="small" />}
                          {session.type === 'work' ? 'Focus' : session.type === 'shortBreak' ? 'Short Break' : 'Long Break'}
                        </Box>
                      }
                      secondary={`${Math.floor(session.duration / 60)} min - ${session.completedAt.toLocaleTimeString()}`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSessions([])}>Clear History</Button>
            <Button onClick={() => setHistoryOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}
