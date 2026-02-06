import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Grid,
  Divider,
  Chip,
  LinearProgress,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import HomeIcon from '@mui/icons-material/Home';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ClearIcon from '@mui/icons-material/Clear';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#a855f7' },
    background: { default: '#0f172a', paper: '#1e293b' },
  },
});

interface Limit {
  name: string;
  limit: number;
  type: 'characters' | 'words';
}

const commonLimits: Limit[] = [
  { name: 'Twitter/X Post', limit: 280, type: 'characters' },
  { name: 'Instagram Caption', limit: 2200, type: 'characters' },
  { name: 'LinkedIn Post', limit: 3000, type: 'characters' },
  { name: 'Meta Description', limit: 160, type: 'characters' },
  { name: 'Title Tag', limit: 60, type: 'characters' },
  { name: 'SMS Message', limit: 160, type: 'characters' },
  { name: 'YouTube Title', limit: 100, type: 'characters' },
  { name: 'YouTube Description', limit: 5000, type: 'characters' },
];

export default function App() {
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => {
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim()).length;
    const paragraphs = text.split(/\n\n+/).filter((p) => p.trim()).length;
    const lines = text.split('\n').length;

    // Reading time (average 200 words per minute)
    const readingTimeMinutes = words / 200;
    const readingTime =
      readingTimeMinutes < 1
        ? `${Math.ceil(readingTimeMinutes * 60)} sec`
        : `${Math.ceil(readingTimeMinutes)} min`;

    // Speaking time (average 150 words per minute)
    const speakingTimeMinutes = words / 150;
    const speakingTime =
      speakingTimeMinutes < 1
        ? `${Math.ceil(speakingTimeMinutes * 60)} sec`
        : `${Math.ceil(speakingTimeMinutes)} min`;

    // Word frequency
    const wordFrequency: Record<string, number> = {};
    if (text.trim()) {
      text
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 2)
        .forEach((word) => {
          const cleaned = word.replace(/[^a-z]/g, '');
          if (cleaned) {
            wordFrequency[cleaned] = (wordFrequency[cleaned] || 0) + 1;
          }
        });
    }

    const topWords = Object.entries(wordFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    return {
      characters,
      charactersNoSpaces,
      words,
      sentences,
      paragraphs,
      lines,
      readingTime,
      speakingTime,
      topWords,
    };
  }, [text]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setText('');
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
            <TextFieldsIcon sx={{ color: 'primary.main', fontSize: 32 }} />
            <Typography variant="h5" fontWeight={600} color="primary.main">
              Character Counter
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <IconButton onClick={handleCopy} disabled={!text}>
              <ContentCopyIcon />
            </IconButton>
            <IconButton onClick={handleClear} disabled={!text}>
              <ClearIcon />
            </IconButton>
          </Box>

          <Grid container spacing={3}>
            {/* Text Input */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Paper sx={{ p: 3 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={15}
                  placeholder="Type or paste your text here..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  sx={{
                    '& .MuiInputBase-input': {
                      fontFamily: 'monospace',
                      lineHeight: 1.6,
                    },
                  }}
                />

                {copied && (
                  <Typography color="primary" sx={{ mt: 1 }}>
                    Copied to clipboard!
                  </Typography>
                )}
              </Paper>

              {/* Character Limits */}
              <Paper sx={{ p: 3, mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Platform Limits
                </Typography>
                <Grid container spacing={2}>
                  {commonLimits.map((limit) => {
                    const current =
                      limit.type === 'characters' ? stats.characters : stats.words;
                    const percentage = Math.min((current / limit.limit) * 100, 100);
                    const isOver = current > limit.limit;

                    return (
                      <Grid size={{ xs: 12, sm: 6, md: 4 }} key={limit.name}>
                        <Box sx={{ mb: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body2">{limit.name}</Typography>
                            <Typography
                              variant="body2"
                              sx={{ color: isOver ? 'error.main' : 'text.secondary' }}
                            >
                              {current}/{limit.limit}
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={percentage}
                            sx={{
                              height: 6,
                              borderRadius: 1,
                              bgcolor: 'action.hover',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: isOver ? 'error.main' : percentage > 80 ? 'warning.main' : 'primary.main',
                              },
                            }}
                          />
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              </Paper>
            </Grid>

            {/* Stats */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Statistics
                </Typography>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <Paper sx={{ p: 2, bgcolor: 'action.hover', textAlign: 'center' }}>
                      <Typography variant="h4" color="primary.main">
                        {stats.characters}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Characters
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Paper sx={{ p: 2, bgcolor: 'action.hover', textAlign: 'center' }}>
                      <Typography variant="h4" color="primary.main">
                        {stats.charactersNoSpaces}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        No Spaces
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Paper sx={{ p: 2, bgcolor: 'action.hover', textAlign: 'center' }}>
                      <Typography variant="h4" color="primary.main">
                        {stats.words}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Words
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Paper sx={{ p: 2, bgcolor: 'action.hover', textAlign: 'center' }}>
                      <Typography variant="h4" color="primary.main">
                        {stats.sentences}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Sentences
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Paper sx={{ p: 2, bgcolor: 'action.hover', textAlign: 'center' }}>
                      <Typography variant="h4" color="primary.main">
                        {stats.paragraphs}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Paragraphs
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Paper sx={{ p: 2, bgcolor: 'action.hover', textAlign: 'center' }}>
                      <Typography variant="h4" color="primary.main">
                        {stats.lines}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Lines
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Typography variant="subtitle2" gutterBottom>
                  Time Estimates
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  <Chip label={`Reading: ${stats.readingTime}`} variant="outlined" />
                  <Chip label={`Speaking: ${stats.speakingTime}`} variant="outlined" />
                </Box>

                {stats.topWords.length > 0 && (
                  <>
                    <Typography variant="subtitle2" gutterBottom>
                      Top Words
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {stats.topWords.map(([word, count]) => (
                        <Chip
                          key={word}
                          label={`${word} (${count})`}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
