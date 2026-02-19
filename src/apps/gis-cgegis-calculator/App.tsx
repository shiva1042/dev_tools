import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Grid, Button, IconButton, Divider, Alert,
  FormControl, InputLabel, Select, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import HomeIcon from '@mui/icons-material/Home';
import SecurityIcon from '@mui/icons-material/Security';
import PrintIcon from '@mui/icons-material/Print';

const darkTheme = createTheme({
  palette: { mode: 'dark', primary: { main: '#10b981' }, background: { default: '#0f172a', paper: '#1e293b' } },
});

const groupDetails: Record<string, { subscription: number; insurance: number }> = {
  A: { subscription: 240, insurance: 5000000 },
  B: { subscription: 120, insurance: 2500000 },
  C: { subscription: 60, insurance: 1250000 },
};

const fmt = (v: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(v);

export default function App() {
  const [empName, setEmpName] = useState('');
  const [group, setGroup] = useState('A');
  const [joiningDate, setJoiningDate] = useState('2000-01-01');
  const [cessationDate, setCessationDate] = useState('2030-06-30');
  const [interestRate, setInterestRate] = useState(8);

  const calc = useMemo(() => {
    const details = groupDetails[group];
    const monthly = details.subscription;
    const savingsShare = monthly * 0.7;
    const insuranceShare = monthly * 0.3;

    const from = new Date(joiningDate);
    const to = new Date(cessationDate);
    const years = Math.max(0, (to.getTime() - from.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    const fullYears = Math.floor(years);

    // Calculate savings fund accumulation
    const monthlyRate = interestRate / 100 / 12;
    const months = fullYears * 12;
    let savingsFund = 0;
    for (let m = 0; m < months; m++) {
      savingsFund += savingsShare;
      savingsFund *= (1 + monthlyRate);
    }
    savingsFund = Math.round(savingsFund);

    const totalContributed = monthly * months;
    const savingsContributed = savingsShare * months;
    const interestEarned = savingsFund - savingsContributed;

    // Yearly table
    const yearlyTable = [];
    let balance = 0;
    for (let y = 1; y <= Math.min(fullYears, 40); y++) {
      for (let m = 0; m < 12; m++) {
        balance += savingsShare;
        balance *= (1 + monthlyRate);
      }
      if (y % 5 === 0 || y === fullYears || y <= 5) {
        yearlyTable.push({ year: y, balance: Math.round(balance) });
      }
    }

    return {
      monthly, savingsShare, insuranceShare, insurance: details.insurance,
      fullYears, savingsFund, totalContributed, savingsContributed, interestEarned,
      yearlyTable,
    };
  }, [group, joiningDate, cessationDate, interestRate]);

  const handlePrint = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<html><head><title>CGEGIS Calculation</title><style>
      body{font-family:Arial,sans-serif;padding:20px 40px;color:#000;font-size:12px}
      .hdr{text-align:center;margin-bottom:15px}.hdr h2{margin:0;font-size:16px}
      table{width:100%;border-collapse:collapse;margin:10px 0}th,td{border:1px solid #333;padding:4px 8px;font-size:11px}th{background:#f0f0f0}
      .highlight{background:#e8f5e9;font-weight:bold}
    </style></head><body>
      <div class="hdr"><h2>CGEGIS CALCULATION STATEMENT</h2><p>Central Government Employees Group Insurance Scheme</p></div>
      ${empName ? `<p><strong>Name:</strong> ${empName} | <strong>Group:</strong> ${group}</p>` : ''}
      <table><tbody>
      <tr><td>Monthly Subscription</td><td>${fmt(calc.monthly)}</td></tr>
      <tr><td>Savings Fund Share (70%)</td><td>${fmt(calc.savingsShare)}/month</td></tr>
      <tr><td>Insurance Share (30%)</td><td>${fmt(calc.insuranceShare)}/month</td></tr>
      <tr><td>Insurance Cover</td><td>${fmt(calc.insurance)}</td></tr>
      <tr><td>Years of Membership</td><td>${calc.fullYears} years</td></tr>
      <tr><td>Interest Rate</td><td>${interestRate}%</td></tr>
      <tr class="highlight"><td>Savings Fund Accumulation</td><td>${fmt(calc.savingsFund)}</td></tr>
      </tbody></table>
      <h4>SAVINGS FUND GROWTH</h4>
      <table><thead><tr><th>Year</th><th>Accumulated Value</th></tr></thead><tbody>
      ${calc.yearlyTable.map(r => `<tr><td>${r.year}</td><td style="text-align:right">${fmt(r.balance)}</td></tr>`).join('')}
      </tbody></table>
      <p><strong>On Retirement:</strong> Savings Fund ${fmt(calc.savingsFund)} paid to employee.</p>
      <p><strong>On Death (in service):</strong> Insurance ${fmt(calc.insurance)} + Savings Fund ${fmt(calc.savingsFund)} = ${fmt(calc.insurance + calc.savingsFund)} paid to nominee.</p>
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
            <SecurityIcon sx={{ color: 'primary.main', fontSize: 32 }} />
            <Typography variant="h5" fontWeight={600} color="primary.main">GIS/CGEGIS Calculator</Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint}>Print Statement</Button>
          </Box>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Scheme Details</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField fullWidth size="small" label="Employee Name" value={empName} onChange={(e) => setEmpName(e.target.value)} />
                  <FormControl fullWidth size="small">
                    <InputLabel>Group</InputLabel>
                    <Select value={group} label="Group" onChange={(e) => setGroup(e.target.value)}>
                      <MenuItem value="A">Group A (₹240/mo, ₹50L cover)</MenuItem>
                      <MenuItem value="B">Group B (₹120/mo, ₹25L cover)</MenuItem>
                      <MenuItem value="C">Group C (₹60/mo, ₹12.5L cover)</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField fullWidth size="small" type="date" label="Date of Joining Scheme" value={joiningDate} onChange={(e) => setJoiningDate(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
                  <TextField fullWidth size="small" type="date" label="Date of Cessation" value={cessationDate} onChange={(e) => setCessationDate(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
                  <TextField fullWidth size="small" type="number" label="Interest Rate (%)" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value) || 0)} />
                </Box>
              </Paper>

              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Subscription Breakdown</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <TableRow><TableCell>Monthly Subscription</TableCell><TableCell align="right">{fmt(calc.monthly)}</TableCell></TableRow>
                      <TableRow><TableCell>→ Savings Fund (70%)</TableCell><TableCell align="right">{fmt(calc.savingsShare)}</TableCell></TableRow>
                      <TableRow><TableCell>→ Insurance Fund (30%)</TableCell><TableCell align="right">{fmt(calc.insuranceShare)}</TableCell></TableRow>
                      <TableRow sx={{ bgcolor: 'action.hover' }}>
                        <TableCell><strong>Insurance Cover</strong></TableCell>
                        <TableCell align="right"><strong>{fmt(calc.insurance)}</strong></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 8 }}>
              <Paper sx={{ p: 3, mb: 3, bgcolor: 'rgba(16,185,129,0.08)' }}>
                <Typography variant="h6" gutterBottom>Maturity Value ({calc.fullYears} years)</Typography>
                <Typography variant="h3" fontWeight={700} color="primary.main" textAlign="center">{fmt(calc.savingsFund)}</Typography>
                <Typography variant="body2" textAlign="center" color="text.secondary">
                  Contributed: {fmt(calc.savingsContributed)} | Interest: {fmt(calc.interestEarned)}
                </Typography>
              </Paper>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 6 }}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">On Retirement</Typography>
                    <Typography variant="h6" color="primary.main">Savings: {fmt(calc.savingsFund)}</Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">On Death (in service)</Typography>
                    <Typography variant="h6" color="primary.main">Total: {fmt(calc.insurance + calc.savingsFund)}</Typography>
                    <Typography variant="caption" color="text.secondary">Insurance {fmt(calc.insurance)} + Savings {fmt(calc.savingsFund)}</Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Savings Fund Growth</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead><TableRow><TableCell>Year</TableCell><TableCell align="right">Accumulated Value</TableCell></TableRow></TableHead>
                    <TableBody>
                      {calc.yearlyTable.map(r => (
                        <TableRow key={r.year}><TableCell>Year {r.year}</TableCell><TableCell align="right" sx={{ fontWeight: 600, color: 'primary.main' }}>{fmt(r.balance)}</TableCell></TableRow>
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
