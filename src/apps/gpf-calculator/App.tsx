import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Grid, Button, IconButton, Divider, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  FormControl, InputLabel, Select, MenuItem, Tabs, Tab,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import HomeIcon from '@mui/icons-material/Home';
import SavingsIcon from '@mui/icons-material/Savings';
import PrintIcon from '@mui/icons-material/Print';

const darkTheme = createTheme({
  palette: { mode: 'dark', primary: { main: '#10b981' }, background: { default: '#0f172a', paper: '#1e293b' } },
});

const fmt = (v: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(v);

export default function App() {
  const [tab, setTab] = useState(0);
  const [openingBalance, setOpeningBalance] = useState(1000000);
  const [monthlySubscription, setMonthlySubscription] = useState(10000);
  const [interestRate, setInterestRate] = useState(7.1);
  const [projectionYears, setProjectionYears] = useState(10);
  const [basicPay, setBasicPay] = useState(56100);

  // Advance form
  const [empName, setEmpName] = useState('');
  const [gpfNo, setGpfNo] = useState('');
  const [advancePurpose, setAdvancePurpose] = useState('education');
  const [advanceType, setAdvanceType] = useState<'temporary' | 'nonrefundable'>('temporary');
  const [advanceAmount, setAdvanceAmount] = useState(0);
  const [recoveryInstallments, setRecoveryInstallments] = useState(24);

  const projection = useMemo(() => {
    const rows = [];
    let balance = openingBalance;
    for (let y = 1; y <= projectionYears; y++) {
      let yearContribution = 0;
      for (let m = 0; m < 12; m++) {
        balance += monthlySubscription;
        yearContribution += monthlySubscription;
      }
      const interest = Math.round(balance * interestRate / 100);
      balance += interest;
      rows.push({ year: y, contribution: yearContribution, interest, closingBalance: balance });
    }
    return rows;
  }, [openingBalance, monthlySubscription, interestRate, projectionYears]);

  const advanceLimits = useMemo(() => {
    const balance = openingBalance;
    const tempLimit = Math.min(balance * 0.75, monthlySubscription * 12);
    const nrLimit = balance * 0.9;
    const maxAdvance = advanceType === 'temporary' ? tempLimit : nrLimit;
    return { tempLimit, nrLimit, maxAdvance };
  }, [openingBalance, monthlySubscription, advanceType]);

  const handlePrint = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    const today = new Date().toLocaleDateString('en-IN');
    if (tab === 0) {
      w.document.write(`<html><head><title>GPF Projection</title><style>
        body{font-family:Arial,sans-serif;padding:20px 40px;color:#000;font-size:12px}
        .hdr{text-align:center;margin-bottom:15px}.hdr h2{margin:0;font-size:16px}
        table{width:100%;border-collapse:collapse;margin:10px 0}th,td{border:1px solid #333;padding:4px 8px;font-size:11px}th{background:#f0f0f0}
      </style></head><body>
        <div class="hdr"><h2>GPF BALANCE PROJECTION</h2></div>
        <p>Opening Balance: ${fmt(openingBalance)} | Monthly Subscription: ${fmt(monthlySubscription)} | Interest Rate: ${interestRate}%</p>
        <table><thead><tr><th>Year</th><th>Contribution</th><th>Interest</th><th>Closing Balance</th></tr></thead><tbody>
        ${projection.map(r => `<tr><td>${r.year}</td><td style="text-align:right">${fmt(r.contribution)}</td><td style="text-align:right">${fmt(r.interest)}</td><td style="text-align:right">${fmt(r.closingBalance)}</td></tr>`).join('')}
        </tbody></table>
      </body></html>`);
    } else {
      w.document.write(`<html><head><title>GPF Advance Application</title><style>
        body{font-family:'Times New Roman',serif;padding:30px 50px;color:#000;font-size:14px;line-height:1.6}
        .hdr{text-align:center;margin-bottom:20px}.hdr h2{margin:0;font-size:18px;text-decoration:underline}
        .row{display:flex;margin-bottom:8px}.row .lbl{width:300px;font-weight:bold}.row .val{flex:1;border-bottom:1px dotted #333;padding-left:8px}
        .sig{display:flex;justify-content:space-between;margin-top:50px}.sig div{text-align:center;width:200px}.sig-line{border-top:1px solid #333;margin-top:40px;padding-top:4px}
      </style></head><body>
        <div class="hdr"><h2>APPLICATION FOR GPF ${advanceType === 'temporary' ? 'TEMPORARY ADVANCE' : 'NON-REFUNDABLE WITHDRAWAL'}</h2><p>(${advanceType === 'temporary' ? 'Form 3A' : 'Form 4'})</p></div>
        <div class="row"><div class="lbl">1. Name:</div><div class="val">${empName || '___'}</div></div>
        <div class="row"><div class="lbl">2. GPF Account No:</div><div class="val">${gpfNo || '___'}</div></div>
        <div class="row"><div class="lbl">3. Basic Pay:</div><div class="val">${fmt(basicPay)}</div></div>
        <div class="row"><div class="lbl">4. GPF Balance:</div><div class="val">${fmt(openingBalance)}</div></div>
        <div class="row"><div class="lbl">5. Purpose:</div><div class="val">${advancePurpose}</div></div>
        <div class="row"><div class="lbl">6. Amount Requested:</div><div class="val">${fmt(advanceAmount)}</div></div>
        <div class="row"><div class="lbl">7. Maximum Admissible:</div><div class="val">${fmt(advanceLimits.maxAdvance)}</div></div>
        ${advanceType === 'temporary' ? `<div class="row"><div class="lbl">8. Recovery Installments:</div><div class="val">${recoveryInstallments} months (${fmt(Math.round(advanceAmount / recoveryInstallments))}/month)</div></div>` : ''}
        <div style="margin-top:20px;border:1px solid #333;padding:12px;font-size:12px"><strong>Declaration:</strong> I certify that the amount will be used for the purpose stated above.</div>
        <div class="sig"><div><div class="sig-line">Signature</div><p>${empName || '___'}<br/>Date: ${today}</p></div><div><div class="sig-line">Head of Office</div></div></div>
      </body></html>`);
    }
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
            <SavingsIcon sx={{ color: 'primary.main', fontSize: 32 }} />
            <Typography variant="h5" fontWeight={600} color="primary.main">GPF Calculator & Forms</Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint}>Print</Button>
          </Box>

          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
            <Tab label="Balance Projection" />
            <Tab label="Advance Application" />
          </Tabs>

          {tab === 0 && (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>GPF Parameters</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField fullWidth size="small" type="number" label="Opening Balance (₹)" value={openingBalance} onChange={(e) => setOpeningBalance(Number(e.target.value) || 0)} />
                    <TextField fullWidth size="small" type="number" label="Monthly Subscription (₹)" value={monthlySubscription} onChange={(e) => setMonthlySubscription(Number(e.target.value) || 0)} />
                    <TextField fullWidth size="small" type="number" label="Interest Rate (%)" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value) || 0)} />
                    <TextField fullWidth size="small" type="number" label="Projection Years" value={projectionYears} onChange={(e) => setProjectionYears(Number(e.target.value) || 1)} />
                    <TextField fullWidth size="small" type="number" label="Basic Pay (₹)" value={basicPay} onChange={(e) => setBasicPay(Number(e.target.value) || 0)} />
                  </Box>
                  <Alert severity="info" sx={{ mt: 2 }}>Min subscription: 6% of Basic ({fmt(Math.round(basicPay * 0.06))}). Current rate: 7.1% p.a.</Alert>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, md: 8 }}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>Projection ({projectionYears} years)</Typography>
                  <TableContainer sx={{ maxHeight: 500 }}>
                    <Table size="small" stickyHeader>
                      <TableHead><TableRow><TableCell>Year</TableCell><TableCell align="right">Contribution</TableCell><TableCell align="right">Interest</TableCell><TableCell align="right">Closing Balance</TableCell></TableRow></TableHead>
                      <TableBody>
                        {projection.map(r => (
                          <TableRow key={r.year}><TableCell>{r.year}</TableCell><TableCell align="right">{fmt(r.contribution)}</TableCell><TableCell align="right">{fmt(r.interest)}</TableCell><TableCell align="right" sx={{ fontWeight: 600, color: 'primary.main' }}>{fmt(r.closingBalance)}</TableCell></TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(16,185,129,0.1)', borderRadius: 1, textAlign: 'center' }}>
                    <Typography variant="caption">Projected Balance after {projectionYears} years</Typography>
                    <Typography variant="h4" fontWeight={700} color="primary.main">{fmt(projection[projection.length - 1]?.closingBalance || 0)}</Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          )}

          {tab === 1 && (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>GPF Advance Application</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField fullWidth size="small" label="Employee Name" value={empName} onChange={(e) => setEmpName(e.target.value)} />
                    <TextField fullWidth size="small" label="GPF Account No." value={gpfNo} onChange={(e) => setGpfNo(e.target.value)} />
                    <FormControl fullWidth size="small">
                      <InputLabel>Advance Type</InputLabel>
                      <Select value={advanceType} label="Advance Type" onChange={(e) => setAdvanceType(e.target.value as typeof advanceType)}>
                        <MenuItem value="temporary">Temporary Advance (Form 3A)</MenuItem>
                        <MenuItem value="nonrefundable">Non-refundable Withdrawal (Form 4)</MenuItem>
                      </Select>
                    </FormControl>
                    <FormControl fullWidth size="small">
                      <InputLabel>Purpose</InputLabel>
                      <Select value={advancePurpose} label="Purpose" onChange={(e) => setAdvancePurpose(e.target.value)}>
                        {['Education', 'Medical', 'Housing', 'Marriage', 'Vehicle', 'Other'].map(p => (<MenuItem key={p} value={p.toLowerCase()}>{p}</MenuItem>))}
                      </Select>
                    </FormControl>
                    <TextField fullWidth size="small" type="number" label="Amount Requested (₹)" value={advanceAmount} onChange={(e) => setAdvanceAmount(Number(e.target.value) || 0)} />
                    {advanceType === 'temporary' && (
                      <TextField fullWidth size="small" type="number" label="Recovery Installments (months)" value={recoveryInstallments} onChange={(e) => setRecoveryInstallments(Number(e.target.value) || 1)} />
                    )}
                  </Box>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>Admissible Limits</Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        <TableRow><TableCell>GPF Balance</TableCell><TableCell align="right">{fmt(openingBalance)}</TableCell></TableRow>
                        <TableRow><TableCell>Temporary Limit (75% or 12 months sub)</TableCell><TableCell align="right">{fmt(advanceLimits.tempLimit)}</TableCell></TableRow>
                        <TableRow><TableCell>Non-refundable Limit (90%)</TableCell><TableCell align="right">{fmt(advanceLimits.nrLimit)}</TableCell></TableRow>
                        <TableRow sx={{ bgcolor: 'action.hover' }}>
                          <TableCell><Typography fontWeight={700}>Max Admissible ({advanceType})</Typography></TableCell>
                          <TableCell align="right"><Typography fontWeight={700} color="primary.main">{fmt(advanceLimits.maxAdvance)}</Typography></TableCell>
                        </TableRow>
                        {advanceAmount > advanceLimits.maxAdvance && (
                          <TableRow><TableCell colSpan={2}><Alert severity="error">Amount exceeds admissible limit!</Alert></TableCell></TableRow>
                        )}
                        {advanceType === 'temporary' && advanceAmount > 0 && (
                          <TableRow><TableCell>Monthly Recovery</TableCell><TableCell align="right">{fmt(Math.round(advanceAmount / recoveryInstallments))}</TableCell></TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
            </Grid>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
