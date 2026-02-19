import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Grid, Button, IconButton, Divider, Slider,
  Table, TableBody, TableCell, TableContainer, TableRow,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import HomeIcon from '@mui/icons-material/Home';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import PrintIcon from '@mui/icons-material/Print';

const darkTheme = createTheme({
  palette: { mode: 'dark', primary: { main: '#10b981' }, background: { default: '#0f172a', paper: '#1e293b' } },
});

const commutationTable: Record<number, number> = {
  55: 6.454, 56: 6.226, 57: 5.997, 58: 5.766, 59: 5.531, 60: 5.288, 61: 5.036, 62: 4.790,
};

const fmt = (v: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(v);

export default function App() {
  const [empName, setEmpName] = useState('');
  const [designation, setDesignation] = useState('');
  const [dob, setDob] = useState('1964-06-15');
  const [doj, setDoj] = useState('1990-01-01');
  const [retirementAge] = useState(60);
  const [basicPay, setBasicPay] = useState(123100);
  const [daRate, setDaRate] = useState(53);
  const [commutePct, setCommutePct] = useState(40);
  const [elBalance, setElBalance] = useState(300);
  const [gpfBalance, setGpfBalance] = useState(2500000);
  const [npsBalance, setNpsBalance] = useState(1500000);
  const [gisBalance, setGisBalance] = useState(150000);

  const calc = useMemo(() => {
    const dobDate = new Date(dob);
    const dojDate = new Date(doj);
    const dorDate = new Date(dobDate.getFullYear() + retirementAge, dobDate.getMonth(), dobDate.getDate() > 1 ? 0 : dobDate.getDate());
    const ageAtRetirement = retirementAge;
    const qualifyingYears = Math.min(33, Math.floor((dorDate.getTime() - dojDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)));

    const emoluments = basicPay + Math.round(basicPay * daRate / 100);
    const basicPension = Math.round(emoluments * 0.5 * Math.min(qualifyingYears, 33) / 33);

    // DCRG
    const halfMonthlyEmol = emoluments / 2;
    let dcrg = qualifyingYears >= 20 ? halfMonthlyEmol * Math.min(qualifyingYears * 2, 66) / 2 : emoluments * 20;
    dcrg = Math.min(Math.round(dcrg), 2000000);

    // Commutation
    const purchaseValue = commutationTable[ageAtRetirement] || 5.288;
    const commutedPortion = Math.round(basicPension * commutePct / 100);
    const commutedLumpSum = Math.round(commutedPortion * 12 * purchaseValue);
    const reducedPension = basicPension - commutedPortion;

    // Leave Encashment (max 300 days)
    const dailyEmoluments = emoluments / 30;
    const leaveEncashment = Math.round(Math.min(elBalance, 300) * dailyEmoluments);

    // Total Corpus
    const totalLumpSum = dcrg + commutedLumpSum + leaveEncashment + gpfBalance + npsBalance * 0.6 + gisBalance;
    const npsAnnuity = npsBalance * 0.4 * 0.06 / 12; // 40% annuity at 6%

    return {
      dorDate, ageAtRetirement, qualifyingYears, emoluments, basicPension, dcrg,
      purchaseValue, commutedPortion, commutedLumpSum, reducedPension,
      leaveEncashment, totalLumpSum, npsAnnuity,
      monthlyIncome: reducedPension + Math.round(npsAnnuity),
    };
  }, [dob, doj, retirementAge, basicPay, daRate, commutePct, elBalance, gpfBalance, npsBalance, gisBalance]);

  const handlePrint = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<html><head><title>Retirement Benefits</title><style>
      body{font-family:Arial,sans-serif;padding:20px 40px;color:#000;font-size:12px}
      .hdr{text-align:center;margin-bottom:15px;border-bottom:2px solid #333;padding-bottom:10px}
      table{width:100%;border-collapse:collapse;margin:10px 0}th,td{border:1px solid #333;padding:5px 8px;font-size:11px}th{background:#f0f0f0}
      .highlight{background:#e8f5e9;font-weight:bold}
      .section{margin-top:15px;font-weight:bold;font-size:13px;border-bottom:1px solid #333;padding-bottom:3px}
    </style></head><body>
      <div class="hdr"><h2>RETIREMENT BENEFITS STATEMENT</h2>${empName ? `<p>${empName} — ${designation}</p>` : ''}</div>
      <div class="section">MONTHLY INCOME</div>
      <table><tbody>
      <tr class="highlight"><td>Basic Pension</td><td style="text-align:right">${fmt(calc.basicPension)}/month</td></tr>
      <tr><td>Reduced Pension (after ${commutePct}% commutation)</td><td style="text-align:right">${fmt(calc.reducedPension)}/month</td></tr>
      ${npsBalance > 0 ? `<tr><td>NPS Annuity (estimated)</td><td style="text-align:right">${fmt(Math.round(calc.npsAnnuity))}/month</td></tr>` : ''}
      <tr class="highlight"><td>Total Monthly Income</td><td style="text-align:right">${fmt(calc.monthlyIncome)}/month</td></tr>
      </tbody></table>
      <div class="section">LUMP SUM BENEFITS</div>
      <table><tbody>
      <tr><td>DCRG</td><td style="text-align:right">${fmt(calc.dcrg)}</td></tr>
      <tr><td>Commuted Value</td><td style="text-align:right">${fmt(calc.commutedLumpSum)}</td></tr>
      <tr><td>Leave Encashment (${Math.min(elBalance, 300)} days)</td><td style="text-align:right">${fmt(calc.leaveEncashment)}</td></tr>
      <tr><td>GPF Balance</td><td style="text-align:right">${fmt(gpfBalance)}</td></tr>
      ${npsBalance > 0 ? `<tr><td>NPS Lump Sum (60%)</td><td style="text-align:right">${fmt(Math.round(npsBalance * 0.6))}</td></tr>` : ''}
      <tr><td>GIS/CGEGIS</td><td style="text-align:right">${fmt(gisBalance)}</td></tr>
      <tr class="highlight"><td>TOTAL RETIREMENT CORPUS</td><td style="text-align:right">${fmt(calc.totalLumpSum)}</td></tr>
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
            <BeachAccessIcon sx={{ color: 'primary.main', fontSize: 32 }} />
            <Typography variant="h5" fontWeight={600} color="primary.main">Retirement Benefits Planner</Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint}>Print Statement</Button>
          </Box>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Personal Details</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField fullWidth size="small" label="Name" value={empName} onChange={(e) => setEmpName(e.target.value)} />
                  <TextField fullWidth size="small" label="Designation" value={designation} onChange={(e) => setDesignation(e.target.value)} />
                  <TextField fullWidth size="small" type="date" label="Date of Birth" value={dob} onChange={(e) => setDob(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
                  <TextField fullWidth size="small" type="date" label="Date of Joining" value={doj} onChange={(e) => setDoj(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
                  <TextField fullWidth size="small" type="number" label="Basic Pay (₹)" value={basicPay} onChange={(e) => setBasicPay(Number(e.target.value) || 0)} />
                  <TextField fullWidth size="small" type="number" label="DA Rate (%)" value={daRate} onChange={(e) => setDaRate(Number(e.target.value) || 0)} />
                </Box>
              </Paper>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Additional Balances</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField fullWidth size="small" type="number" label="EL Balance (days)" value={elBalance} onChange={(e) => setElBalance(Number(e.target.value) || 0)} />
                  <TextField fullWidth size="small" type="number" label="GPF Balance (₹)" value={gpfBalance} onChange={(e) => setGpfBalance(Number(e.target.value) || 0)} />
                  <TextField fullWidth size="small" type="number" label="NPS Balance (₹)" value={npsBalance} onChange={(e) => setNpsBalance(Number(e.target.value) || 0)} />
                  <TextField fullWidth size="small" type="number" label="GIS/CGEGIS (₹)" value={gisBalance} onChange={(e) => setGisBalance(Number(e.target.value) || 0)} />
                  <Divider />
                  <Typography variant="subtitle2">Commutation: {commutePct}%</Typography>
                  <Slider value={commutePct} onChange={(_, v) => setCommutePct(v as number)} min={0} max={40} step={5} valueLabelDisplay="auto" />
                </Box>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 8 }}>
              <Paper sx={{ p: 3, mb: 3, bgcolor: 'rgba(16,185,129,0.08)' }}>
                <Typography variant="h6" gutterBottom>Monthly Income After Retirement</Typography>
                <Typography variant="h3" fontWeight={700} color="primary.main" textAlign="center">{fmt(calc.monthlyIncome)}/month</Typography>
                <Typography variant="body2" textAlign="center" color="text.secondary" sx={{ mt: 1 }}>
                  Pension: {fmt(calc.reducedPension)} + NPS Annuity: {fmt(Math.round(calc.npsAnnuity))}
                </Typography>
              </Paper>

              <Grid container spacing={2}>
                {[
                  { label: 'Basic Pension', value: calc.basicPension, suffix: '/mo' },
                  { label: 'DCRG', value: calc.dcrg },
                  { label: 'Commuted Value', value: calc.commutedLumpSum },
                  { label: 'Leave Encashment', value: calc.leaveEncashment },
                  { label: 'GPF Balance', value: gpfBalance },
                  { label: 'Total Corpus', value: calc.totalLumpSum },
                ].map(({ label, value, suffix }) => (
                  <Grid size={{ xs: 6, sm: 4 }} key={label}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">{label}</Typography>
                      <Typography variant="h6" color="primary.main" fontWeight={600}>{fmt(value)}{suffix || ''}</Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              <Paper sx={{ p: 3, mt: 3 }}>
                <Typography variant="h6" gutterBottom>Detailed Breakdown</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <TableRow><TableCell>Service: {calc.qualifyingYears} years</TableCell><TableCell>Retirement Age: {calc.ageAtRetirement}</TableCell><TableCell>Emoluments: {fmt(calc.emoluments)}</TableCell></TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
                <Divider sx={{ my: 1 }} />
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <TableRow><TableCell>DCRG</TableCell><TableCell align="right">{fmt(calc.dcrg)}</TableCell></TableRow>
                      <TableRow><TableCell>Commuted Lump Sum</TableCell><TableCell align="right">{fmt(calc.commutedLumpSum)}</TableCell></TableRow>
                      <TableRow><TableCell>Leave Encashment ({Math.min(elBalance, 300)} days)</TableCell><TableCell align="right">{fmt(calc.leaveEncashment)}</TableCell></TableRow>
                      <TableRow><TableCell>GPF Balance</TableCell><TableCell align="right">{fmt(gpfBalance)}</TableCell></TableRow>
                      <TableRow><TableCell>NPS Lump Sum (60%)</TableCell><TableCell align="right">{fmt(Math.round(npsBalance * 0.6))}</TableCell></TableRow>
                      <TableRow><TableCell>GIS/CGEGIS</TableCell><TableCell align="right">{fmt(gisBalance)}</TableCell></TableRow>
                      <TableRow sx={{ bgcolor: 'rgba(16,185,129,0.1)' }}>
                        <TableCell><Typography fontWeight={700}>TOTAL RETIREMENT CORPUS</Typography></TableCell>
                        <TableCell align="right"><Typography fontWeight={700} color="primary.main" fontSize={20}>{fmt(calc.totalLumpSum)}</Typography></TableCell>
                      </TableRow>
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
