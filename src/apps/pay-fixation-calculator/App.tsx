import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Grid, Button, IconButton,
  FormControl, InputLabel, Select, MenuItem, Divider, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import HomeIcon from '@mui/icons-material/Home';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PrintIcon from '@mui/icons-material/Print';

const darkTheme = createTheme({
  palette: { mode: 'dark', primary: { main: '#10b981' }, background: { default: '#0f172a', paper: '#1e293b' } },
});

const generateLevel = (start: number, cells: number) => {
  const arr = [start];
  for (let i = 1; i < cells; i++) arr.push(Math.round(arr[i - 1] * 1.03 / 100) * 100);
  return arr;
};

const payMatrix: Record<number, number[]> = {
  1: generateLevel(18000, 40), 2: generateLevel(19900, 40), 3: generateLevel(21700, 40),
  4: generateLevel(25500, 40), 5: generateLevel(29200, 40), 6: generateLevel(35400, 40),
  7: generateLevel(44900, 40), 8: generateLevel(47600, 40), 9: generateLevel(53100, 40),
  10: generateLevel(56100, 40), 11: generateLevel(67700, 40), 12: generateLevel(78800, 40),
  13: generateLevel(123100, 40), 14: generateLevel(144200, 40), 15: generateLevel(182200, 30),
  16: generateLevel(205400, 25), 17: generateLevel(225000, 20), 18: generateLevel(250000, 15),
};

const fmt = (v: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(v);

export default function App() {
  const [scenario, setScenario] = useState<'promotion' | 'macp'>('promotion');
  const [currentLevel, setCurrentLevel] = useState(6);
  const [currentCell, setCurrentCell] = useState(0);
  const [newLevel, setNewLevel] = useState(7);

  const calc = useMemo(() => {
    const currentPay = payMatrix[currentLevel]?.[currentCell] || 0;
    const oneIncrement = payMatrix[currentLevel]?.[currentCell + 1] || currentPay;
    const payAfterIncrement = oneIncrement;

    const newLevelPay = payMatrix[newLevel] || [];
    let fixedCell = -1;
    for (let i = 0; i < newLevelPay.length; i++) {
      if (newLevelPay[i] >= payAfterIncrement) { fixedCell = i; break; }
    }
    if (fixedCell === -1) fixedCell = newLevelPay.length - 1;
    const fixedPay = newLevelPay[fixedCell] || 0;
    const increase = fixedPay - currentPay;
    const increasePercent = currentPay > 0 ? ((increase / currentPay) * 100).toFixed(1) : '0';

    // Option 2: from date of next increment (stay one more increment in current level)
    const opt2CurrentPay = payMatrix[currentLevel]?.[currentCell + 1] || currentPay;
    const opt2AfterIncrement = payMatrix[currentLevel]?.[currentCell + 2] || opt2CurrentPay;
    let opt2Cell = -1;
    for (let i = 0; i < newLevelPay.length; i++) {
      if (newLevelPay[i] >= opt2AfterIncrement) { opt2Cell = i; break; }
    }
    if (opt2Cell === -1) opt2Cell = newLevelPay.length - 1;
    const opt2Pay = newLevelPay[opt2Cell] || 0;

    return { currentPay, oneIncrement: payAfterIncrement, fixedCell, fixedPay, increase, increasePercent, opt2CurrentPay, opt2Pay, opt2Cell };
  }, [currentLevel, currentCell, newLevel]);

  const handlePrint = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<html><head><title>Pay Fixation Statement</title><style>
      body{font-family:'Times New Roman',serif;padding:30px 50px;color:#000;font-size:14px;line-height:1.8}
      .hdr{text-align:center;margin-bottom:20px}.hdr h2{margin:0;font-size:18px;text-decoration:underline}
      table{width:100%;border-collapse:collapse;margin:16px 0}th,td{border:1px solid #333;padding:8px 12px;font-size:13px}th{background:#f0f0f0}
      .highlight{background:#e8f5e9;font-weight:bold}
    </style></head><body>
      <div class="hdr"><h2>PAY FIXATION STATEMENT</h2><p>(On ${scenario === 'promotion' ? 'Promotion' : 'MACP'} under 7th CPC)</p></div>
      <h4>Option 1: From Date of ${scenario === 'promotion' ? 'Promotion' : 'MACP'}</h4>
      <table><tbody>
      <tr><td>Current Pay Level</td><td>Level ${currentLevel}</td></tr>
      <tr><td>Current Cell / Basic Pay</td><td>Cell ${currentCell + 1} / ${fmt(calc.currentPay)}</td></tr>
      <tr><td>One Increment in Current Level</td><td>${fmt(calc.oneIncrement)}</td></tr>
      <tr><td>New Pay Level</td><td>Level ${newLevel}</td></tr>
      <tr class="highlight"><td>Fixed Pay in New Level</td><td>Cell ${calc.fixedCell + 1} / ${fmt(calc.fixedPay)}</td></tr>
      <tr><td>Increase</td><td>${fmt(calc.increase)} (${calc.increasePercent}%)</td></tr>
      </tbody></table>
      <h4>Option 2: From Date of Next Increment</h4>
      <table><tbody>
      <tr><td>Pay on Next Increment Date (in current level)</td><td>${fmt(calc.opt2CurrentPay)}</td></tr>
      <tr class="highlight"><td>Fixed Pay in New Level</td><td>Cell ${calc.opt2Cell + 1} / ${fmt(calc.opt2Pay)}</td></tr>
      </tbody></table>
      <h4>Comparison</h4>
      <table><thead><tr><th></th><th>Option 1</th><th>Option 2</th><th>Difference</th></tr></thead><tbody>
      <tr><td>Fixed Pay</td><td>${fmt(calc.fixedPay)}</td><td>${fmt(calc.opt2Pay)}</td><td>${fmt(calc.opt2Pay - calc.fixedPay)}</td></tr>
      </tbody></table>
      <p style="margin-top:30px;font-size:12px">Note: The option yielding higher pay should be chosen. Option 2 may be beneficial if the increment in new level compensates for the delay.</p>
    </body></html>`);
    w.document.close();
    w.print();
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', p: 3 }}>
        <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
            <IconButton component={Link} to="/" size="small"><HomeIcon /></IconButton>
            <TrendingUpIcon sx={{ color: 'primary.main', fontSize: 32 }} />
            <Typography variant="h5" fontWeight={600} color="primary.main">Pay Fixation Calculator</Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint}>Print Statement</Button>
          </Box>

          <Alert severity="info" sx={{ mb: 3 }}>
            Pay fixation rule: On promotion, pay in new level = cell &ge; (current pay + one increment in current level).
          </Alert>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 5 }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Fixation Parameters</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Scenario</InputLabel>
                    <Select value={scenario} label="Scenario" onChange={(e) => setScenario(e.target.value as 'promotion' | 'macp')}>
                      <MenuItem value="promotion">Promotion</MenuItem>
                      <MenuItem value="macp">MACP (10/20/30 yrs)</MenuItem>
                    </Select>
                  </FormControl>
                  <Divider />
                  <FormControl fullWidth size="small">
                    <InputLabel>Current Pay Level</InputLabel>
                    <Select value={currentLevel} label="Current Pay Level" onChange={(e) => { setCurrentLevel(Number(e.target.value)); setCurrentCell(0); }}>
                      {Object.keys(payMatrix).map(l => (<MenuItem key={l} value={Number(l)}>Level {l}</MenuItem>))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth size="small">
                    <InputLabel>Current Cell (Index)</InputLabel>
                    <Select value={currentCell} label="Current Cell" onChange={(e) => setCurrentCell(Number(e.target.value))}>
                      {(payMatrix[currentLevel] || []).map((p, i) => (<MenuItem key={i} value={i}>Cell {i + 1} — {fmt(p)}</MenuItem>))}
                    </Select>
                  </FormControl>
                  <Divider />
                  <FormControl fullWidth size="small">
                    <InputLabel>New Pay Level</InputLabel>
                    <Select value={newLevel} label="New Pay Level" onChange={(e) => setNewLevel(Number(e.target.value))}>
                      {Object.keys(payMatrix).filter(l => Number(l) > currentLevel).map(l => (<MenuItem key={l} value={Number(l)}>Level {l}</MenuItem>))}
                    </Select>
                  </FormControl>
                </Box>

                {scenario === 'macp' && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary">MACP: After 10, 20, 30 years of service, employee moves to next higher pay level if not promoted.</Typography>
                  </Box>
                )}
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 7 }}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Option 1: From Date of {scenario === 'promotion' ? 'Promotion' : 'MACP'}</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <TableRow><TableCell>Current Pay (Level {currentLevel}, Cell {currentCell + 1})</TableCell><TableCell align="right">{fmt(calc.currentPay)}</TableCell></TableRow>
                      <TableRow><TableCell>+ One Increment in Current Level</TableCell><TableCell align="right">{fmt(calc.oneIncrement)}</TableCell></TableRow>
                      <TableRow><TableCell>New Level</TableCell><TableCell align="right">Level {newLevel}</TableCell></TableRow>
                      <TableRow sx={{ bgcolor: 'action.hover' }}>
                        <TableCell><Typography fontWeight={700}>Fixed Pay (Cell {calc.fixedCell + 1})</Typography></TableCell>
                        <TableCell align="right"><Typography fontWeight={700} color="primary.main" fontSize={18}>{fmt(calc.fixedPay)}</Typography></TableCell>
                      </TableRow>
                      <TableRow><TableCell>Increase</TableCell><TableCell align="right"><Chip label={`+${fmt(calc.increase)} (${calc.increasePercent}%)`} color="success" size="small" /></TableCell></TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>

              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Option 2: From Date of Next Increment</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <TableRow><TableCell>Pay on Next Increment (Level {currentLevel})</TableCell><TableCell align="right">{fmt(calc.opt2CurrentPay)}</TableCell></TableRow>
                      <TableRow sx={{ bgcolor: 'action.hover' }}>
                        <TableCell><Typography fontWeight={700}>Fixed Pay (Cell {calc.opt2Cell + 1})</Typography></TableCell>
                        <TableCell align="right"><Typography fontWeight={700} color="primary.main" fontSize={18}>{fmt(calc.opt2Pay)}</Typography></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>

              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Comparison</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead><TableRow><TableCell></TableCell><TableCell align="right">Option 1</TableCell><TableCell align="right">Option 2</TableCell><TableCell align="right">Diff</TableCell></TableRow></TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>Fixed Pay</TableCell>
                        <TableCell align="right">{fmt(calc.fixedPay)}</TableCell>
                        <TableCell align="right">{fmt(calc.opt2Pay)}</TableCell>
                        <TableCell align="right"><Chip label={fmt(calc.opt2Pay - calc.fixedPay)} size="small" color={calc.opt2Pay > calc.fixedPay ? 'success' : 'default'} /></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
                <Alert severity="success" sx={{ mt: 2 }}>
                  Recommended: <strong>Option {calc.opt2Pay > calc.fixedPay ? '2' : '1'}</strong> yields higher pay of {fmt(Math.max(calc.fixedPay, calc.opt2Pay))}.
                </Alert>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
