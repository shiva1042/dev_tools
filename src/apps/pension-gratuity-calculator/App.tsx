import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Grid, Button, IconButton, Divider, Alert,
  Table, TableBody, TableCell, TableContainer, TableRow, Slider,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import HomeIcon from '@mui/icons-material/Home';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PrintIcon from '@mui/icons-material/Print';

const darkTheme = createTheme({
  palette: { mode: 'dark', primary: { main: '#10b981' }, background: { default: '#0f172a', paper: '#1e293b' } },
});

const commutationTable: Record<number, number> = {
  40: 9.188, 41: 9.075, 42: 8.943, 43: 8.808, 44: 8.659,
  45: 8.502, 46: 8.324, 47: 8.144, 48: 7.954, 49: 7.759,
  50: 7.558, 51: 7.348, 52: 7.120, 53: 6.897, 54: 6.677,
  55: 6.454, 56: 6.226, 57: 5.997, 58: 5.766, 59: 5.531,
  60: 5.288, 61: 5.036, 62: 4.790, 63: 4.536, 64: 4.283, 65: 4.015,
};

const fmt = (v: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(v);

export default function App() {
  const [dob, setDob] = useState('1964-06-15');
  const [doj, setDoj] = useState('1990-01-01');
  const [dor, setDor] = useState('2024-06-30');
  const [lastBasicPay, setLastBasicPay] = useState(123100);
  const [daRate, setDaRate] = useState(53);
  const [commutePct, setCommutePct] = useState(40);

  const calc = useMemo(() => {
    const dorDate = new Date(dor);
    const dobDate = new Date(dob);
    const dojDate = new Date(doj);

    const ageAtRetirement = Math.floor((dorDate.getTime() - dobDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    const qualifyingYears = Math.min(33, Math.floor((dorDate.getTime() - dojDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)));
    const qualifyingMonths = Math.floor(((dorDate.getTime() - dojDate.getTime()) / (30.44 * 24 * 60 * 60 * 1000)) % 12);

    const emoluments = lastBasicPay + Math.round(lastBasicPay * daRate / 100);
    const basicPension = Math.round(emoluments * 0.5 * Math.min(qualifyingYears, 33) / 33);

    // DCRG
    let dcrg = 0;
    const halfMonthlyEmol = emoluments / 2;
    if (qualifyingYears >= 33) {
      dcrg = halfMonthlyEmol * 33; // half-year periods = 66, but max 16.5 months
    } else if (qualifyingYears >= 20) {
      const halfYears = qualifyingYears * 2;
      dcrg = halfMonthlyEmol * halfYears / 2;
    } else if (qualifyingYears >= 11) {
      dcrg = emoluments * 20;
    } else if (qualifyingYears >= 5) {
      dcrg = emoluments * 12;
    } else if (qualifyingYears >= 1) {
      dcrg = emoluments * 6;
    } else {
      dcrg = emoluments * 2;
    }
    dcrg = Math.min(dcrg, 2000000);

    // Commutation
    const purchaseValue = commutationTable[ageAtRetirement] || commutationTable[60];
    const commutedPortion = Math.round(basicPension * commutePct / 100);
    const commutedLumpSum = Math.round(commutedPortion * 12 * purchaseValue);
    const reducedPension = basicPension - commutedPortion;

    return { ageAtRetirement, qualifyingYears, qualifyingMonths, emoluments, basicPension, dcrg, purchaseValue, commutedPortion, commutedLumpSum, reducedPension };
  }, [dob, doj, dor, lastBasicPay, daRate, commutePct]);

  const handlePrint = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<html><head><title>Pension Calculation Statement</title><style>
      body{font-family:'Times New Roman',serif;padding:30px 50px;color:#000;font-size:14px;line-height:1.6}
      .hdr{text-align:center;margin-bottom:20px}.hdr h2{margin:0;font-size:18px;text-decoration:underline}
      table{width:100%;border-collapse:collapse;margin:16px 0}th,td{border:1px solid #333;padding:6px 10px;font-size:13px}th{background:#f0f0f0}
      .highlight{background:#e8f5e9;font-weight:bold;font-size:14px}
    </style></head><body>
      <div class="hdr"><h2>PENSION / GRATUITY CALCULATION STATEMENT</h2><p>(Under 7th CPC Rules)</p></div>
      <table><tbody>
      <tr><td width="50%">Date of Birth</td><td>${new Date(dob).toLocaleDateString('en-IN')}</td></tr>
      <tr><td>Date of Joining</td><td>${new Date(doj).toLocaleDateString('en-IN')}</td></tr>
      <tr><td>Date of Retirement</td><td>${new Date(dor).toLocaleDateString('en-IN')}</td></tr>
      <tr><td>Age at Retirement</td><td>${calc.ageAtRetirement} years</td></tr>
      <tr><td>Qualifying Service</td><td>${calc.qualifyingYears} years ${calc.qualifyingMonths} months</td></tr>
      <tr><td>Last Basic Pay</td><td>${fmt(lastBasicPay)}</td></tr>
      <tr><td>DA Rate</td><td>${daRate}%</td></tr>
      <tr><td>Last Emoluments (Basic + DA)</td><td>${fmt(calc.emoluments)}</td></tr>
      </tbody></table>
      <h4>RETIREMENT BENEFITS</h4>
      <table><tbody>
      <tr class="highlight"><td>Basic Pension (50% of Emoluments)</td><td style="text-align:right">${fmt(calc.basicPension)} /month</td></tr>
      <tr class="highlight"><td>DCRG (Death-cum-Retirement Gratuity)</td><td style="text-align:right">${fmt(calc.dcrg)}</td></tr>
      <tr><td>Commutation (${commutePct}% of Pension)</td><td style="text-align:right">${fmt(calc.commutedPortion)} /month</td></tr>
      <tr><td>Purchase Value (Age ${calc.ageAtRetirement})</td><td style="text-align:right">${calc.purchaseValue}</td></tr>
      <tr class="highlight"><td>Commuted Value (Lump Sum)</td><td style="text-align:right">${fmt(calc.commutedLumpSum)}</td></tr>
      <tr class="highlight"><td>Reduced Pension After Commutation</td><td style="text-align:right">${fmt(calc.reducedPension)} /month</td></tr>
      </tbody></table>
      <p style="font-size:12px;margin-top:20px"><strong>Note:</strong> Commuted pension restores after 15 years from the date of commutation.</p>
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
            <AccountBalanceIcon sx={{ color: 'primary.main', fontSize: 32 }} />
            <Typography variant="h5" fontWeight={600} color="primary.main">Pension & Gratuity Calculator</Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint}>Print Statement</Button>
          </Box>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 5 }}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Service Details</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField fullWidth size="small" type="date" label="Date of Birth" value={dob} onChange={(e) => setDob(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
                  <TextField fullWidth size="small" type="date" label="Date of Joining" value={doj} onChange={(e) => setDoj(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
                  <TextField fullWidth size="small" type="date" label="Date of Retirement" value={dor} onChange={(e) => setDor(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
                  <TextField fullWidth size="small" type="number" label="Last Basic Pay (₹)" value={lastBasicPay} onChange={(e) => setLastBasicPay(Number(e.target.value) || 0)} />
                  <TextField fullWidth size="small" type="number" label="DA Rate (%)" value={daRate} onChange={(e) => setDaRate(Number(e.target.value) || 0)} />
                </Box>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom>Commutation: {commutePct}% of pension</Typography>
                <Slider value={commutePct} onChange={(_, v) => setCommutePct(v as number)} min={0} max={40} step={5} valueLabelDisplay="auto" marks={[{ value: 0, label: '0%' }, { value: 40, label: '40%' }]} />
              </Paper>

              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Service Summary</Typography>
                <Typography variant="body2">Age at Retirement: <strong>{calc.ageAtRetirement} years</strong></Typography>
                <Typography variant="body2">Qualifying Service: <strong>{calc.qualifyingYears}y {calc.qualifyingMonths}m</strong></Typography>
                <Typography variant="body2">Last Emoluments: <strong>{fmt(calc.emoluments)}</strong></Typography>
                <Typography variant="body2">Purchase Value (Age {calc.ageAtRetirement}): <strong>{calc.purchaseValue}</strong></Typography>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 7 }}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Retirement Benefits</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <TableRow><TableCell>Basic Pension (Monthly)</TableCell><TableCell align="right"><Typography fontWeight={700} color="primary.main" fontSize={18}>{fmt(calc.basicPension)}</Typography></TableCell></TableRow>
                      <TableRow><TableCell>DCRG (Lump Sum)</TableCell><TableCell align="right"><Typography fontWeight={700} color="primary.main" fontSize={18}>{fmt(calc.dcrg)}</Typography></TableCell></TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>

              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Commutation Details</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <TableRow><TableCell>Commuted Portion ({commutePct}% of {fmt(calc.basicPension)})</TableCell><TableCell align="right">{fmt(calc.commutedPortion)}/month</TableCell></TableRow>
                      <TableRow><TableCell>Commuted Lump Sum ({fmt(calc.commutedPortion)} × 12 × {calc.purchaseValue})</TableCell><TableCell align="right"><Typography fontWeight={700} color="primary.main" fontSize={18}>{fmt(calc.commutedLumpSum)}</Typography></TableCell></TableRow>
                      <TableRow sx={{ bgcolor: 'action.hover' }}>
                        <TableCell><Typography fontWeight={700}>Reduced Pension After Commutation</Typography></TableCell>
                        <TableCell align="right"><Typography fontWeight={700} color="warning.main" fontSize={18}>{fmt(calc.reducedPension)}/month</Typography></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
                <Alert severity="info" sx={{ mt: 2 }}>Commuted pension restores after 15 years. Full pension: {fmt(calc.basicPension)}/month from age {calc.ageAtRetirement + 15}.</Alert>
              </Paper>

              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Total Lump Sum at Retirement</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <TableRow><TableCell>DCRG</TableCell><TableCell align="right">{fmt(calc.dcrg)}</TableCell></TableRow>
                      <TableRow><TableCell>Commuted Value</TableCell><TableCell align="right">{fmt(calc.commutedLumpSum)}</TableCell></TableRow>
                      <TableRow sx={{ bgcolor: 'rgba(16,185,129,0.1)' }}>
                        <TableCell><Typography fontWeight={700}>Total Lump Sum</Typography></TableCell>
                        <TableCell align="right"><Typography fontWeight={700} color="primary.main" fontSize={20}>{fmt(calc.dcrg + calc.commutedLumpSum)}</Typography></TableCell>
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
