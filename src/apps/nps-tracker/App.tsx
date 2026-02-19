import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Grid, Button, IconButton, Divider, Alert, Slider,
  Table, TableBody, TableCell, TableContainer, TableRow,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import HomeIcon from '@mui/icons-material/Home';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PrintIcon from '@mui/icons-material/Print';

const darkTheme = createTheme({
  palette: { mode: 'dark', primary: { main: '#10b981' }, background: { default: '#0f172a', paper: '#1e293b' } },
});

const fmt = (v: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(v);

export default function App() {
  const [basicPay, setBasicPay] = useState(56100);
  const [daRate, setDaRate] = useState(53);
  const [currentAge, setCurrentAge] = useState(35);
  const [retirementAge, setRetirementAge] = useState(60);
  const [currentBalance, setCurrentBalance] = useState(500000);
  const [expectedReturn, setExpectedReturn] = useState(10);
  const [annuityRate, setAnnuityRate] = useState(6);
  const [annuityPct, setAnnuityPct] = useState(40);

  const calc = useMemo(() => {
    const basicDA = basicPay + Math.round(basicPay * daRate / 100);
    const empContribution = Math.round(basicDA * 0.10);
    const govtContribution = Math.round(basicDA * 0.14);
    const monthlyTotal = empContribution + govtContribution;

    const yearsToRetire = retirementAge - currentAge;
    const monthlyRate = expectedReturn / 100 / 12;
    const months = yearsToRetire * 12;

    // FV of current balance + FV of monthly contributions
    const fvCurrent = currentBalance * Math.pow(1 + monthlyRate, months);
    const fvContributions = monthlyTotal * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
    const totalCorpus = Math.round(fvCurrent + fvContributions);

    const lumpSum = Math.round(totalCorpus * (100 - annuityPct) / 100);
    const annuityCorpus = Math.round(totalCorpus * annuityPct / 100);
    const monthlyPension = Math.round(annuityCorpus * annuityRate / 100 / 12);

    const totalContributed = currentBalance + monthlyTotal * months;
    const totalGrowth = totalCorpus - totalContributed;

    return { empContribution, govtContribution, monthlyTotal, yearsToRetire, totalCorpus, lumpSum, annuityCorpus, monthlyPension, totalContributed, totalGrowth };
  }, [basicPay, daRate, currentAge, retirementAge, currentBalance, expectedReturn, annuityRate, annuityPct]);

  const handlePrint = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<html><head><title>NPS Projection</title><style>
      body{font-family:Arial,sans-serif;padding:20px 40px;color:#000;font-size:12px}
      .hdr{text-align:center;margin-bottom:15px}.hdr h2{margin:0;font-size:16px}
      table{width:100%;border-collapse:collapse;margin:10px 0}th,td{border:1px solid #333;padding:5px 8px;font-size:11px}th{background:#f0f0f0}
      .highlight{background:#e8f5e9;font-weight:bold}
    </style></head><body>
      <div class="hdr"><h2>NPS CORPUS PROJECTION REPORT</h2></div>
      <table><tbody>
      <tr><td>Basic Pay + DA</td><td>${fmt(basicPay + Math.round(basicPay * daRate / 100))}</td></tr>
      <tr><td>Employee Contribution (10%)</td><td>${fmt(calc.empContribution)}/month</td></tr>
      <tr><td>Govt Contribution (14%)</td><td>${fmt(calc.govtContribution)}/month</td></tr>
      <tr><td>Total Monthly</td><td>${fmt(calc.monthlyTotal)}/month</td></tr>
      <tr><td>Current Balance</td><td>${fmt(currentBalance)}</td></tr>
      <tr><td>Years to Retirement</td><td>${calc.yearsToRetire} years</td></tr>
      <tr><td>Expected Return</td><td>${expectedReturn}%</td></tr>
      <tr class="highlight"><td>Projected Corpus</td><td>${fmt(calc.totalCorpus)}</td></tr>
      <tr><td>Lump Sum (${100 - annuityPct}%)</td><td>${fmt(calc.lumpSum)}</td></tr>
      <tr><td>Annuity Corpus (${annuityPct}%)</td><td>${fmt(calc.annuityCorpus)}</td></tr>
      <tr class="highlight"><td>Monthly Pension (${annuityRate}% annuity)</td><td>${fmt(calc.monthlyPension)}/month</td></tr>
      </tbody></table>
      <p style="font-size:10px;color:#666">Note: This is a projection based on assumed returns. Actual values may vary.</p>
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
            <AccountBalanceWalletIcon sx={{ color: 'primary.main', fontSize: 32 }} />
            <Typography variant="h5" fontWeight={600} color="primary.main">NPS Tracker & Calculator</Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint}>Print Report</Button>
          </Box>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 5 }}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Contribution Details</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField fullWidth size="small" type="number" label="Basic Pay (₹)" value={basicPay} onChange={(e) => setBasicPay(Number(e.target.value) || 0)} />
                  <TextField fullWidth size="small" type="number" label="DA Rate (%)" value={daRate} onChange={(e) => setDaRate(Number(e.target.value) || 0)} />
                  <Divider />
                  <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                    <Typography variant="body2">Employee (10%): <strong>{fmt(calc.empContribution)}/mo</strong></Typography>
                    <Typography variant="body2">Government (14%): <strong>{fmt(calc.govtContribution)}/mo</strong></Typography>
                    <Typography variant="body2" color="primary.main">Total: <strong>{fmt(calc.monthlyTotal)}/mo</strong></Typography>
                  </Box>
                </Box>
              </Paper>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Projection Parameters</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField fullWidth size="small" type="number" label="Current Age" value={currentAge} onChange={(e) => setCurrentAge(Number(e.target.value) || 0)} />
                  <TextField fullWidth size="small" type="number" label="Retirement Age" value={retirementAge} onChange={(e) => setRetirementAge(Number(e.target.value) || 0)} />
                  <TextField fullWidth size="small" type="number" label="Current NPS Balance (₹)" value={currentBalance} onChange={(e) => setCurrentBalance(Number(e.target.value) || 0)} />
                  <Typography variant="subtitle2">Expected Return: {expectedReturn}%</Typography>
                  <Slider value={expectedReturn} onChange={(_, v) => setExpectedReturn(v as number)} min={6} max={14} step={0.5} valueLabelDisplay="auto" />
                  <Typography variant="subtitle2">Annuity Rate: {annuityRate}%</Typography>
                  <Slider value={annuityRate} onChange={(_, v) => setAnnuityRate(v as number)} min={4} max={8} step={0.5} valueLabelDisplay="auto" />
                  <Typography variant="subtitle2">Annuity Portion: {annuityPct}%</Typography>
                  <Slider value={annuityPct} onChange={(_, v) => setAnnuityPct(v as number)} min={40} max={100} step={5} valueLabelDisplay="auto" marks={[{ value: 40, label: 'Min 40%' }, { value: 100, label: '100%' }]} />
                </Box>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 7 }}>
              <Paper sx={{ p: 3, mb: 3, bgcolor: 'rgba(16,185,129,0.08)' }}>
                <Typography variant="h6" gutterBottom>Projected Corpus at Retirement</Typography>
                <Typography variant="h3" fontWeight={700} color="primary.main" textAlign="center">{fmt(calc.totalCorpus)}</Typography>
                <Typography variant="body2" textAlign="center" color="text.secondary">After {calc.yearsToRetire} years at {expectedReturn}% return</Typography>
              </Paper>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                {[
                  { label: 'Lump Sum', value: calc.lumpSum, sub: `${100 - annuityPct}% tax-free` },
                  { label: 'Monthly Pension', value: calc.monthlyPension, sub: `From ${annuityPct}% annuity` },
                  { label: 'Total Contributed', value: calc.totalContributed, sub: 'Your + Govt' },
                  { label: 'Growth', value: calc.totalGrowth, sub: 'Returns earned' },
                ].map(({ label, value, sub }) => (
                  <Grid size={{ xs: 6 }} key={label}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">{label}</Typography>
                      <Typography variant="h6" color="primary.main" fontWeight={600}>{fmt(value)}</Typography>
                      <Typography variant="caption" color="text.secondary">{sub}</Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Detailed Breakdown</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <TableRow><TableCell>Total Contributions (over {calc.yearsToRetire} years)</TableCell><TableCell align="right">{fmt(calc.totalContributed)}</TableCell></TableRow>
                      <TableRow><TableCell>Investment Growth</TableCell><TableCell align="right">{fmt(calc.totalGrowth)}</TableCell></TableRow>
                      <TableRow sx={{ bgcolor: 'action.hover' }}><TableCell><strong>Total Corpus</strong></TableCell><TableCell align="right"><strong>{fmt(calc.totalCorpus)}</strong></TableCell></TableRow>
                      <TableRow><TableCell>Lump Sum Withdrawal ({100 - annuityPct}%)</TableCell><TableCell align="right">{fmt(calc.lumpSum)}</TableCell></TableRow>
                      <TableRow><TableCell>Annuity Purchase ({annuityPct}%)</TableCell><TableCell align="right">{fmt(calc.annuityCorpus)}</TableCell></TableRow>
                      <TableRow sx={{ bgcolor: 'rgba(16,185,129,0.1)' }}>
                        <TableCell><Typography fontWeight={700}>Estimated Monthly Pension</Typography></TableCell>
                        <TableCell align="right"><Typography fontWeight={700} color="primary.main" fontSize={18}>{fmt(calc.monthlyPension)}/mo</Typography></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
                <Alert severity="info" sx={{ mt: 2 }}>NPS: Min 40% must buy annuity. Lump sum (up to 60%) is tax-free. Govt contributes 14% of Basic+DA.</Alert>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
