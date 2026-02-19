import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Grid, IconButton, Chip,
  FormControl, InputLabel, Select, MenuItem, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import HomeIcon from '@mui/icons-material/Home';
import GridOnIcon from '@mui/icons-material/GridOn';
import PrintIcon from '@mui/icons-material/Print';

const darkTheme = createTheme({
  palette: { mode: 'dark', primary: { main: '#10b981' }, background: { default: '#0f172a', paper: '#1e293b' } },
});

const generateLevel = (start: number, cells: number) => {
  const arr = [start];
  for (let i = 1; i < cells; i++) arr.push(Math.round(arr[i - 1] * 1.03 / 100) * 100);
  return arr;
};

const payMatrix: Record<string, number[]> = {
  1: generateLevel(18000, 40), 2: generateLevel(19900, 40), 3: generateLevel(21700, 40),
  4: generateLevel(25500, 40), 5: generateLevel(29200, 40), 6: generateLevel(35400, 40),
  7: generateLevel(44900, 40), 8: generateLevel(47600, 40), 9: generateLevel(53100, 40),
  10: generateLevel(56100, 40), 11: generateLevel(67700, 40), 12: generateLevel(78800, 40),
  13: generateLevel(123100, 30), '13A': generateLevel(131100, 25),
  14: generateLevel(144200, 25), 15: generateLevel(182200, 20),
  16: generateLevel(205400, 16), 17: generateLevel(225000, 12), 18: generateLevel(250000, 8),
};

const levelLabels: Record<number | string, string> = {
  1: 'MTS/Group C', 2: 'Group C', 3: 'Group C', 4: 'Group C', 5: 'Group C',
  6: 'Group B', 7: 'Group B', 8: 'Group B', 9: 'Group B', 10: 'Group A',
  11: 'Group A', 12: 'Group A', 13: 'Group A', '13A': 'Group A',
  14: 'Group A (HAG)', 15: 'HAG+', 16: 'Apex', 17: 'Cabinet Sec', 18: 'Cabinet Sec+',
};

const levelColors: Record<string, string> = {
  'Group C': '#ef4444', 'MTS/Group C': '#ef4444', 'Group B': '#f59e0b',
  'Group A': '#10b981', 'Group A (HAG)': '#3b82f6', 'HAG+': '#6366f1',
  Apex: '#8b5cf6', 'Cabinet Sec': '#a855f7', 'Cabinet Sec+': '#c084fc',
};

const fmt = (v: number) => v.toLocaleString('en-IN');

export default function App() {
  const [selectedLevel, setSelectedLevel] = useState<number | string>(7);
  const [searchPay, setSearchPay] = useState('');

  const searchResult = useMemo(() => {
    const target = parseInt(searchPay);
    if (!target || target < 18000) return null;
    for (const [level, cells] of Object.entries(payMatrix)) {
      const idx = cells.indexOf(target);
      if (idx !== -1) return { level, cell: idx + 1, pay: target };
      const closest = cells.reduce((prev, curr) => Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev);
      if (Math.abs(closest - target) <= 200) return { level, cell: cells.indexOf(closest) + 1, pay: closest, approximate: true };
    }
    return null;
  }, [searchPay]);

  const currentCells = payMatrix[selectedLevel as number] || [];

  const handlePrint = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<html><head><title>Pay Matrix - Level ${selectedLevel}</title><style>
      body{font-family:Arial,sans-serif;padding:20px 40px;color:#000;font-size:12px}
      .hdr{text-align:center;margin-bottom:20px}.hdr h2{margin:0;font-size:16px}
      table{width:100%;border-collapse:collapse}th,td{border:1px solid #333;padding:4px 8px;text-align:right;font-size:11px}th{background:#f0f0f0;text-align:center}
      .level-hdr{background:#e8f5e9;font-weight:bold}
    </style></head><body>
      <div class="hdr"><h2>7th CPC PAY MATRIX — Level ${selectedLevel}</h2><p>${levelLabels[selectedLevel] || ''}</p></div>
      <table><thead><tr><th>Cell</th><th>Basic Pay (₹)</th><th>Increment</th></tr></thead><tbody>
      ${currentCells.map((p, i) => `<tr><td style="text-align:center">${i + 1}</td><td>₹${fmt(p)}</td><td>${i > 0 ? `₹${fmt(p - currentCells[i - 1])} (${((p - currentCells[i - 1]) / currentCells[i - 1] * 100).toFixed(1)}%)` : '-'}</td></tr>`).join('')}
      </tbody></table>
    </body></html>`);
    w.document.close();
    w.print();
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', p: 3 }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
            <IconButton component={Link} to="/" size="small"><HomeIcon /></IconButton>
            <GridOnIcon sx={{ color: 'primary.main', fontSize: 32 }} />
            <Typography variant="h5" fontWeight={600} color="primary.main">7th CPC Pay Level Matrix</Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint}>Print Level {String(selectedLevel)}</Button>
          </Box>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Select Level</Typography>
                <FormControl fullWidth size="small">
                  <InputLabel>Pay Level</InputLabel>
                  <Select value={selectedLevel} label="Pay Level" onChange={(e) => setSelectedLevel(e.target.value)}>
                    {Object.keys(payMatrix).map(l => (
                      <MenuItem key={l} value={l === '13A' ? '13A' : Number(l)}>
                        Level {l === '13A' ? '13A' : l} — {levelLabels[l] || ''} (₹{fmt(payMatrix[l as unknown as number][0])})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {Object.entries(payMatrix).map(([l]) => (
                    <Chip
                      key={l}
                      label={l === '13A' ? '13A' : l}
                      size="small"
                      onClick={() => setSelectedLevel(l === '13A' ? '13A' : Number(l))}
                      sx={{
                        bgcolor: String(selectedLevel) === l ? 'primary.main' : 'action.hover',
                        color: String(selectedLevel) === l ? 'white' : 'text.primary',
                        cursor: 'pointer',
                      }}
                    />
                  ))}
                </Box>
              </Paper>

              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Search by Pay</Typography>
                <TextField fullWidth size="small" type="number" label="Enter Basic Pay (₹)" value={searchPay} onChange={(e) => setSearchPay(e.target.value)} />
                {searchResult && (
                  <Alert severity={searchResult.approximate ? 'warning' : 'success'} sx={{ mt: 2 }}>
                    {searchResult.approximate ? 'Closest match: ' : 'Found: '}
                    Level {searchResult.level}, Cell {searchResult.cell} — ₹{fmt(searchResult.pay)}
                  </Alert>
                )}
              </Paper>

              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Level Info</Typography>
                <Typography variant="body2">Level: <strong>{String(selectedLevel) === '13A' ? '13A' : selectedLevel}</strong></Typography>
                <Typography variant="body2">Group: <strong>{levelLabels[selectedLevel] || 'N/A'}</strong></Typography>
                <Typography variant="body2">Entry Pay: <strong>₹{fmt(currentCells[0] || 0)}</strong></Typography>
                <Typography variant="body2">Max Pay: <strong>₹{fmt(currentCells[currentCells.length - 1] || 0)}</strong></Typography>
                <Typography variant="body2">Total Cells: <strong>{currentCells.length}</strong></Typography>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 8 }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Level {String(selectedLevel) === '13A' ? '13A' : selectedLevel} — {levelLabels[selectedLevel] || ''}
                  <Chip label={`₹${fmt(currentCells[0] || 0)} — ₹${fmt(currentCells[currentCells.length - 1] || 0)}`} size="small" color="primary" sx={{ ml: 2 }} />
                </Typography>
                <TableContainer sx={{ maxHeight: 600 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Cell</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>Basic Pay (₹)</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>Increment (₹)</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>Increment %</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {currentCells.map((pay, i) => (
                        <TableRow key={i} hover sx={{ bgcolor: i === 0 ? 'rgba(16,185,129,0.1)' : 'inherit' }}>
                          <TableCell>{i + 1}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, color: 'primary.main' }}>₹{fmt(pay)}</TableCell>
                          <TableCell align="right">{i > 0 ? `₹${fmt(pay - currentCells[i - 1])}` : '-'}</TableCell>
                          <TableCell align="right">{i > 0 ? `${((pay - currentCells[i - 1]) / currentCells[i - 1] * 100).toFixed(1)}%` : '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
