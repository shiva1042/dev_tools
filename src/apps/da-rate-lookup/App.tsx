import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Grid, Button, IconButton,
  FormControl, InputLabel, Select, MenuItem, Divider, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import HomeIcon from '@mui/icons-material/Home';
import PercentIcon from '@mui/icons-material/Percent';
import PrintIcon from '@mui/icons-material/Print';

const darkTheme = createTheme({
  palette: { mode: 'dark', primary: { main: '#10b981' }, background: { default: '#0f172a', paper: '#1e293b' } },
});

const daHistory = [
  { period: 'Jan 2016', cpc6: 125, cpc7: 0 }, { period: 'Jul 2016', cpc6: 132, cpc7: 2 },
  { period: 'Jan 2017', cpc6: 136, cpc7: 4 }, { period: 'Jul 2017', cpc6: 139, cpc7: 5 },
  { period: 'Jan 2018', cpc6: 142, cpc7: 7 }, { period: 'Jul 2018', cpc6: 148, cpc7: 9 },
  { period: 'Jan 2019', cpc6: 150, cpc7: 12 }, { period: 'Jul 2019', cpc6: 164, cpc7: 17 },
  { period: 'Jan 2020', cpc6: 170, cpc7: 21 }, { period: 'Jul 2020', cpc6: null, cpc7: 21, note: 'Frozen (COVID)' },
  { period: 'Jan 2021', cpc6: null, cpc7: 21, note: 'Frozen' }, { period: 'Jul 2021', cpc6: null, cpc7: 28 },
  { period: 'Jan 2022', cpc6: null, cpc7: 34 }, { period: 'Jul 2022', cpc6: null, cpc7: 38 },
  { period: 'Jan 2023', cpc6: null, cpc7: 42 }, { period: 'Jul 2023', cpc6: null, cpc7: 46 },
  { period: 'Jan 2024', cpc6: null, cpc7: 50 }, { period: 'Jul 2024', cpc6: null, cpc7: 53 },
];

const fmt = (v: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(v);

export default function App() {
  const [basicPay, setBasicPay] = useState(56100);
  const [selectedRate, setSelectedRate] = useState(53);
  const [arrearFromIdx, setArrearFromIdx] = useState(16);
  const [arrearToIdx, setArrearToIdx] = useState(17);
  const [arrearMonths, setArrearMonths] = useState(6);

  const daAmount = Math.round(basicPay * selectedRate / 100);
  const maxRate = Math.max(...daHistory.map(d => d.cpc7));

  const arrearCalc = useMemo(() => {
    const fromRate = daHistory[arrearFromIdx]?.cpc7 || 0;
    const toRate = daHistory[arrearToIdx]?.cpc7 || 0;
    const diff = toRate - fromRate;
    const monthlyArrear = Math.round(basicPay * diff / 100);
    const totalArrear = monthlyArrear * arrearMonths;
    return { fromRate, toRate, diff, monthlyArrear, totalArrear };
  }, [basicPay, arrearFromIdx, arrearToIdx, arrearMonths]);

  const handlePrint = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<html><head><title>DA Rate History</title><style>
      body{font-family:Arial,sans-serif;padding:20px 40px;color:#000;font-size:12px}
      .hdr{text-align:center;margin-bottom:15px}.hdr h2{margin:0;font-size:16px}
      table{width:100%;border-collapse:collapse;margin:10px 0}th,td{border:1px solid #333;padding:4px 8px;font-size:11px}th{background:#f0f0f0}
      .highlight{background:#e8f5e9;font-weight:bold}
    </style></head><body>
      <div class="hdr"><h2>DEARNESS ALLOWANCE RATE HISTORY</h2><p>(7th CPC - Central Government Employees & Pensioners)</p></div>
      <table><thead><tr><th>Period</th><th>7th CPC DA %</th><th>DA Amount (on ₹${basicPay.toLocaleString('en-IN')})</th><th>Remarks</th></tr></thead><tbody>
      ${daHistory.map(d => `<tr${d.cpc7 === selectedRate ? ' class="highlight"' : ''}><td>${d.period}</td><td>${d.cpc7}%</td><td style="text-align:right">${fmt(Math.round(basicPay * d.cpc7 / 100))}</td><td>${d.note || ''}</td></tr>`).join('')}
      </tbody></table>
      <h4>DA ARREAR CALCULATION</h4>
      <p>Basic Pay: ${fmt(basicPay)} | From: ${daHistory[arrearFromIdx]?.period} (${arrearCalc.fromRate}%) → ${daHistory[arrearToIdx]?.period} (${arrearCalc.toRate}%)</p>
      <p>Difference: ${arrearCalc.diff}% | Monthly Arrear: ${fmt(arrearCalc.monthlyArrear)} | Months: ${arrearMonths} | <strong>Total: ${fmt(arrearCalc.totalArrear)}</strong></p>
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
            <PercentIcon sx={{ color: 'primary.main', fontSize: 32 }} />
            <Typography variant="h5" fontWeight={600} color="primary.main">DA Rate Lookup & Calculator</Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint}>Print</Button>
          </Box>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>DA Calculator</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField fullWidth size="small" type="number" label="Basic Pay (₹)" value={basicPay} onChange={(e) => setBasicPay(Number(e.target.value) || 0)} />
                  <FormControl fullWidth size="small">
                    <InputLabel>DA Rate</InputLabel>
                    <Select value={selectedRate} label="DA Rate" onChange={(e) => setSelectedRate(Number(e.target.value))}>
                      {daHistory.map((d, i) => (<MenuItem key={i} value={d.cpc7}>{d.period} — {d.cpc7}%</MenuItem>))}
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(16,185,129,0.1)', borderRadius: 1, textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">DA Amount ({selectedRate}% of {fmt(basicPay)})</Typography>
                  <Typography variant="h4" fontWeight={700} color="primary.main">{fmt(daAmount)}</Typography>
                </Box>
              </Paper>

              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Arrear Calculator</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>From Period</InputLabel>
                    <Select value={arrearFromIdx} label="From Period" onChange={(e) => setArrearFromIdx(Number(e.target.value))}>
                      {daHistory.map((d, i) => (<MenuItem key={i} value={i}>{d.period} ({d.cpc7}%)</MenuItem>))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth size="small">
                    <InputLabel>To Period</InputLabel>
                    <Select value={arrearToIdx} label="To Period" onChange={(e) => setArrearToIdx(Number(e.target.value))}>
                      {daHistory.map((d, i) => (<MenuItem key={i} value={i}>{d.period} ({d.cpc7}%)</MenuItem>))}
                    </Select>
                  </FormControl>
                  <TextField fullWidth size="small" type="number" label="No. of Months" value={arrearMonths} onChange={(e) => setArrearMonths(Number(e.target.value) || 0)} />
                </Box>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2">Rate Difference: <strong>{arrearCalc.diff}%</strong></Typography>
                <Typography variant="body2">Monthly Arrear: <strong>{fmt(arrearCalc.monthlyArrear)}</strong></Typography>
                <Typography variant="h6" color="primary.main" sx={{ mt: 1 }}>Total Arrear: {fmt(arrearCalc.totalArrear)}</Typography>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 8 }}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>DA Rate Trend</Typography>
                <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: 200, mb: 2 }}>
                  {daHistory.map((d, i) => (
                    <Box key={i} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Typography variant="caption" sx={{ fontSize: 8 }}>{d.cpc7}%</Typography>
                      <Box sx={{ width: '100%', height: `${(d.cpc7 / maxRate) * 160}px`, bgcolor: d.cpc7 === selectedRate ? 'primary.main' : 'grey.700', borderRadius: '2px 2px 0 0', minHeight: 2 }} />
                    </Box>
                  ))}
                </Box>
                <Box sx={{ display: 'flex', gap: '2px' }}>
                  {daHistory.map((d, i) => (
                    <Box key={i} sx={{ flex: 1, textAlign: 'center' }}>
                      <Typography variant="caption" sx={{ fontSize: 7, writingMode: 'vertical-rl', textOrientation: 'mixed' }}>{d.period}</Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>

              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>DA Rate History (7th CPC)</Typography>
                <TableContainer sx={{ maxHeight: 500 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Period</TableCell><TableCell align="right">DA Rate</TableCell><TableCell align="right">DA Amount</TableCell><TableCell>Remarks</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {daHistory.map((d, i) => (
                        <TableRow key={i} sx={{ bgcolor: d.cpc7 === selectedRate ? 'rgba(16,185,129,0.1)' : 'inherit' }}>
                          <TableCell>{d.period}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>{d.cpc7}%</TableCell>
                          <TableCell align="right">{fmt(Math.round(basicPay * d.cpc7 / 100))}</TableCell>
                          <TableCell><Typography variant="caption" color="text.secondary">{d.note || ''}</Typography></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Alert severity="info" sx={{ mt: 2 }}>DR (Dearness Relief) for pensioners follows the same rates as DA for serving employees.</Alert>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
