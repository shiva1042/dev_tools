import { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Tooltip,
  ToggleButtonGroup,
  ToggleButton,
  Chip,
  Snackbar,
  Button,
} from '@mui/material';
import {
  ContentCopy,
  Home,
  SwapHoriz,
  Upload,
  CompareArrows,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

type ViewMode = 'split' | 'unified';

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged' | 'header';
  content: string;
  leftLineNum?: number;
  rightLineNum?: number;
}

const computeDiff = (left: string, right: string): DiffLine[] => {
  const leftLines = left.split('\n');
  const rightLines = right.split('\n');
  const diff: DiffLine[] = [];

  // Simple LCS-based diff
  const lcs = (a: string[], b: string[]): number[][] => {
    const m = a.length;
    const n = b.length;
    const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (a[i - 1] === b[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }
    return dp;
  };

  const backtrack = (dp: number[][], a: string[], b: string[], i: number, j: number): void => {
    if (i === 0 && j === 0) return;

    if (i === 0) {
      backtrack(dp, a, b, i, j - 1);
      diff.push({ type: 'added', content: b[j - 1], rightLineNum: j });
    } else if (j === 0) {
      backtrack(dp, a, b, i - 1, j);
      diff.push({ type: 'removed', content: a[i - 1], leftLineNum: i });
    } else if (a[i - 1] === b[j - 1]) {
      backtrack(dp, a, b, i - 1, j - 1);
      diff.push({ type: 'unchanged', content: a[i - 1], leftLineNum: i, rightLineNum: j });
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      backtrack(dp, a, b, i - 1, j);
      diff.push({ type: 'removed', content: a[i - 1], leftLineNum: i });
    } else {
      backtrack(dp, a, b, i, j - 1);
      diff.push({ type: 'added', content: b[j - 1], rightLineNum: j });
    }
  };

  const dp = lcs(leftLines, rightLines);
  backtrack(dp, leftLines, rightLines, leftLines.length, rightLines.length);

  return diff;
};

const getStats = (diff: DiffLine[]): { added: number; removed: number; unchanged: number } => {
  return diff.reduce(
    (acc, line) => {
      if (line.type === 'added') acc.added++;
      else if (line.type === 'removed') acc.removed++;
      else if (line.type === 'unchanged') acc.unchanged++;
      return acc;
    },
    { added: 0, removed: 0, unchanged: 0 }
  );
};

const sampleLeft = `function greet(name) {
  console.log("Hello, " + name);
  return true;
}

const message = "Welcome";
greet("World");`;

const sampleRight = `function greet(name, greeting = "Hello") {
  console.log(greeting + ", " + name + "!");
  return { success: true };
}

const message = "Welcome to the app";
const result = greet("World", "Hi");
console.log(result);`;

export default function DiffViewer() {
  const [left, setLeft] = useState<string>(sampleLeft);
  const [right, setRight] = useState<string>(sampleRight);
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({ open: false, message: '' });

  const diff = useMemo(() => computeDiff(left, right), [left, right]);
  const stats = useMemo(() => getStats(diff), [diff]);

  const handleSwap = () => {
    const temp = left;
    setLeft(right);
    setRight(temp);
  };

  const handleCopy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setSnackbar({ open: true, message: `${label} copied` });
  };

  const handleFileUpload = (side: 'left' | 'right') => (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (side === 'left') setLeft(text);
        else setRight(text);
      };
      reader.readAsText(file);
    }
  };

  const renderSplitView = () => {
    const leftLines: (DiffLine | null)[] = [];
    const rightLines: (DiffLine | null)[] = [];

    let leftIdx = 0;
    let rightIdx = 0;

    for (const line of diff) {
      if (line.type === 'unchanged') {
        leftLines.push(line);
        rightLines.push(line);
      } else if (line.type === 'removed') {
        leftLines.push(line);
        rightLines.push(null);
      } else if (line.type === 'added') {
        leftLines.push(null);
        rightLines.push(line);
      }
    }

    // Compact the view by pairing removed/added lines
    const paired: { left: DiffLine | null; right: DiffLine | null }[] = [];
    let i = 0;
    while (i < Math.max(leftLines.length, rightLines.length)) {
      paired.push({
        left: leftLines[i] || null,
        right: rightLines[i] || null,
      });
      i++;
    }

    return (
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Side */}
        <Box sx={{ flex: 1, borderRight: '1px solid #333', overflow: 'auto' }}>
          {paired.map((pair, i) => (
            <Box
              key={i}
              sx={{
                display: 'flex',
                bgcolor: pair.left?.type === 'removed' ? 'rgba(224, 108, 117, 0.15)' : 'transparent',
                borderBottom: '1px solid #1a1a1a',
                minHeight: 24,
              }}
            >
              <Box sx={{ width: 50, px: 1, color: 'grey.600', fontSize: 12, fontFamily: 'monospace', textAlign: 'right', borderRight: '1px solid #222', flexShrink: 0 }}>
                {pair.left?.leftLineNum || ''}
              </Box>
              <Box sx={{ flex: 1, px: 1, fontFamily: 'monospace', fontSize: 13, whiteSpace: 'pre', color: pair.left?.type === 'removed' ? '#e06c75' : '#d4d4d4' }}>
                {pair.left?.type === 'removed' && <span style={{ color: '#e06c75', marginRight: 8 }}>-</span>}
                {pair.left?.content}
              </Box>
            </Box>
          ))}
        </Box>

        {/* Right Side */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {paired.map((pair, i) => (
            <Box
              key={i}
              sx={{
                display: 'flex',
                bgcolor: pair.right?.type === 'added' ? 'rgba(152, 195, 121, 0.15)' : 'transparent',
                borderBottom: '1px solid #1a1a1a',
                minHeight: 24,
              }}
            >
              <Box sx={{ width: 50, px: 1, color: 'grey.600', fontSize: 12, fontFamily: 'monospace', textAlign: 'right', borderRight: '1px solid #222', flexShrink: 0 }}>
                {pair.right?.rightLineNum || ''}
              </Box>
              <Box sx={{ flex: 1, px: 1, fontFamily: 'monospace', fontSize: 13, whiteSpace: 'pre', color: pair.right?.type === 'added' ? '#98c379' : '#d4d4d4' }}>
                {pair.right?.type === 'added' && <span style={{ color: '#98c379', marginRight: 8 }}>+</span>}
                {pair.right?.content}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  const renderUnifiedView = () => (
    <Box sx={{ flex: 1, overflow: 'auto' }}>
      {diff.map((line, i) => (
        <Box
          key={i}
          sx={{
            display: 'flex',
            bgcolor: line.type === 'added'
              ? 'rgba(152, 195, 121, 0.15)'
              : line.type === 'removed'
                ? 'rgba(224, 108, 117, 0.15)'
                : 'transparent',
            borderBottom: '1px solid #1a1a1a',
          }}
        >
          <Box sx={{ width: 50, px: 1, color: 'grey.600', fontSize: 12, fontFamily: 'monospace', textAlign: 'right', borderRight: '1px solid #222', flexShrink: 0 }}>
            {line.leftLineNum || ''}
          </Box>
          <Box sx={{ width: 50, px: 1, color: 'grey.600', fontSize: 12, fontFamily: 'monospace', textAlign: 'right', borderRight: '1px solid #222', flexShrink: 0 }}>
            {line.rightLineNum || ''}
          </Box>
          <Box sx={{ width: 24, textAlign: 'center', fontFamily: 'monospace', fontSize: 13, flexShrink: 0 }}>
            {line.type === 'added' && <span style={{ color: '#98c379' }}>+</span>}
            {line.type === 'removed' && <span style={{ color: '#e06c75' }}>-</span>}
          </Box>
          <Box sx={{
            flex: 1,
            px: 1,
            fontFamily: 'monospace',
            fontSize: 13,
            whiteSpace: 'pre',
            color: line.type === 'added' ? '#98c379' : line.type === 'removed' ? '#e06c75' : '#d4d4d4'
          }}>
            {line.content}
          </Box>
        </Box>
      ))}
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          bgcolor: '#111',
          borderBottom: '1px solid #222',
          px: 3,
          py: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Link to="/">
              <IconButton size="small" sx={{ color: 'grey.500' }}>
                <Home />
              </IconButton>
            </Link>
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>
              Diff Viewer
            </Typography>
            <Chip
              icon={<CompareArrows />}
              label={`+${stats.added} -${stats.removed} ~${stats.unchanged}`}
              size="small"
              sx={{
                '& .MuiChip-icon': { color: 'grey.400' },
                color: 'grey.400',
                borderColor: 'grey.700',
              }}
              variant="outlined"
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, v) => v && setViewMode(v)}
              size="small"
            >
              <ToggleButton value="split" sx={{ color: 'grey.400' }}>Split</ToggleButton>
              <ToggleButton value="unified" sx={{ color: 'grey.400' }}>Unified</ToggleButton>
            </ToggleButtonGroup>
            <Tooltip title="Swap sides">
              <IconButton size="small" onClick={handleSwap} sx={{ color: 'grey.500' }}>
                <SwapHoriz />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Paper>

      {/* Input Area */}
      <Box sx={{ display: 'flex', borderBottom: '1px solid #222' }}>
        <Box sx={{ flex: 1, p: 2, borderRight: '1px solid #222' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="subtitle2" sx={{ color: 'grey.400' }}>Original</Typography>
            <Box>
              <Tooltip title="Upload file">
                <IconButton size="small" component="label" sx={{ color: 'grey.500' }}>
                  <Upload fontSize="small" />
                  <input type="file" hidden onChange={handleFileUpload('left')} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Copy">
                <IconButton size="small" onClick={() => handleCopy(left, 'Original')} sx={{ color: 'grey.500' }}>
                  <ContentCopy fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          <TextField
            multiline
            fullWidth
            rows={6}
            value={left}
            onChange={(e) => setLeft(e.target.value)}
            placeholder="Paste original text here..."
            sx={{
              '& .MuiInputBase-root': {
                fontFamily: 'monospace',
                fontSize: 13,
                bgcolor: '#0a0a0a',
                color: '#d4d4d4',
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#333',
              },
            }}
          />
        </Box>
        <Box sx={{ flex: 1, p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="subtitle2" sx={{ color: 'grey.400' }}>Modified</Typography>
            <Box>
              <Tooltip title="Upload file">
                <IconButton size="small" component="label" sx={{ color: 'grey.500' }}>
                  <Upload fontSize="small" />
                  <input type="file" hidden onChange={handleFileUpload('right')} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Copy">
                <IconButton size="small" onClick={() => handleCopy(right, 'Modified')} sx={{ color: 'grey.500' }}>
                  <ContentCopy fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          <TextField
            multiline
            fullWidth
            rows={6}
            value={right}
            onChange={(e) => setRight(e.target.value)}
            placeholder="Paste modified text here..."
            sx={{
              '& .MuiInputBase-root': {
                fontFamily: 'monospace',
                fontSize: 13,
                bgcolor: '#0a0a0a',
                color: '#d4d4d4',
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#333',
              },
            }}
          />
        </Box>
      </Box>

      {/* Diff Output */}
      <Paper sx={{ flex: 1, bgcolor: '#111', m: 2, border: '1px solid #222', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderBottom: '1px solid #222' }}>
          <Typography variant="subtitle2" sx={{ color: 'grey.400' }}>
            Diff Output
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Chip label={`${stats.added} additions`} size="small" sx={{ bgcolor: 'rgba(152, 195, 121, 0.2)', color: '#98c379' }} />
            <Chip label={`${stats.removed} deletions`} size="small" sx={{ bgcolor: 'rgba(224, 108, 117, 0.2)', color: '#e06c75' }} />
          </Box>
        </Box>
        {viewMode === 'split' ? renderSplitView() : renderUnifiedView()}
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
}
