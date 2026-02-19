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
import CelebrationIcon from '@mui/icons-material/Celebration';
import PrintIcon from '@mui/icons-material/Print';

const darkTheme = createTheme({
  palette: { mode: 'dark', primary: { main: '#10b981' }, background: { default: '#0f172a', paper: '#1e293b' } },
});

const festivals = ['Diwali', 'Holi', 'Eid-ul-Fitr', 'Eid-ul-Adha', 'Christmas', 'Pongal', 'Onam', 'Durga Puja', 'Baisakhi', 'Lohri', 'Navratri', 'Ganesh Chaturthi', 'Other'];

const fmt = (v: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(v);

export default function App() {
  const [empName, setEmpName] = useState('');
  const [designation, setDesignation] = useState('');
  const [empId, setEmpId] = useState('');
  const [payLevel, setPayLevel] = useState(7);
  const [basicPay, setBasicPay] = useState(44900);
  const [festival, setFestival] = useState('Diwali');
  const [accountNo, setAccountNo] = useState('');
  const [ddoName, setDdoName] = useState('');
  const [startMonth, setStartMonth] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const advanceAmount = 10000;
  const installments = 10;
  const monthlyDeduction = advanceAmount / installments;

  const recoverySchedule = useMemo(() => {
    const [year, month] = startMonth.split('-').map(Number);
    const schedule = [];
    let balance = advanceAmount;
    for (let i = 0; i < installments; i++) {
      const d = new Date(year, month - 1 + i, 1);
      balance -= monthlyDeduction;
      schedule.push({
        month: d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
        deduction: monthlyDeduction,
        balance: Math.max(0, balance),
      });
    }
    return schedule;
  }, [startMonth]);

  const handlePrint = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    const today = new Date().toLocaleDateString('en-IN');
    w.document.write(`<html><head><title>Festival Advance Application</title><style>
      body{font-family:'Times New Roman',serif;padding:30px 50px;color:#000;font-size:14px;line-height:1.6}
      .hdr{text-align:center;margin-bottom:20px}.hdr h2{margin:0;font-size:18px;text-decoration:underline}
      .row{display:flex;margin-bottom:8px}.row .lbl{width:300px;font-weight:bold}.row .val{flex:1;border-bottom:1px dotted #333;padding-left:8px}
      table{width:100%;border-collapse:collapse;margin:16px 0}th,td{border:1px solid #333;padding:6px 10px;font-size:13px}th{background:#f0f0f0}
      .decl{margin-top:20px;border:1px solid #333;padding:12px;font-size:12px}
      .sig{display:flex;justify-content:space-between;margin-top:50px}.sig div{text-align:center;width:200px}.sig-line{border-top:1px solid #333;margin-top:40px;padding-top:4px}
    </style></head><body>
      <div class="hdr"><h2>APPLICATION FOR FESTIVAL ADVANCE</h2><p>(As per GFR Rules)</p></div>
      <div class="row"><div class="lbl">1. Name:</div><div class="val">${empName || '___'}</div></div>
      <div class="row"><div class="lbl">2. Designation:</div><div class="val">${designation || '___'}</div></div>
      <div class="row"><div class="lbl">3. Employee ID:</div><div class="val">${empId || '___'}</div></div>
      <div class="row"><div class="lbl">4. Pay Level / Basic Pay:</div><div class="val">Level ${payLevel} / ${fmt(basicPay)}</div></div>
      <div class="row"><div class="lbl">5. Festival:</div><div class="val">${festival}</div></div>
      <div class="row"><div class="lbl">6. Advance Amount Requested:</div><div class="val">${fmt(advanceAmount)}</div></div>
      <div class="row"><div class="lbl">7. Recovery in Installments:</div><div class="val">${installments} monthly installments of ${fmt(monthlyDeduction)}</div></div>
      <div class="row"><div class="lbl">8. Recovery Start Month:</div><div class="val">${recoverySchedule[0]?.month || '___'}</div></div>
      <div class="row"><div class="lbl">9. Account Number:</div><div class="val">${accountNo || '___'}</div></div>
      <div class="row"><div class="lbl">10. DDO Name:</div><div class="val">${ddoName || '___'}</div></div>
      <h4>RECOVERY SCHEDULE</h4>
      <table><thead><tr><th>S.No.</th><th>Month</th><th>Deduction (₹)</th><th>Balance (₹)</th></tr></thead><tbody>
      ${recoverySchedule.map((r, i) => `<tr><td>${i + 1}</td><td>${r.month}</td><td style="text-align:right">${fmt(r.deduction)}</td><td style="text-align:right">${fmt(r.balance)}</td></tr>`).join('')}
      </tbody></table>
      <div class="decl"><strong>Declaration:</strong><br/>I hereby declare that:<br/>(i) I have not drawn any festival advance during the current financial year.<br/>(ii) I undertake to refund the advance in ${installments} monthly installments.<br/>(iii) I understand that the advance is interest-free and will be recovered from my salary.</div>
      <div class="sig"><div><div class="sig-line">Signature of Applicant</div><p>${empName || '___'}<br/>${designation || '___'}<br/>Date: ${today}</p></div><div><div class="sig-line">Sanctioning Authority</div><p>Date: ___________</p></div></div>
    </body></html>`);
    w.document.close();
    w.print();
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', p: 3 }}>
        <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
            <IconButton component={Link} to="/" size="small"><HomeIcon /></IconButton>
            <CelebrationIcon sx={{ color: 'primary.main', fontSize: 32 }} />
            <Typography variant="h5" fontWeight={600} color="primary.main">Festival Advance Calculator</Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint}>Print Application</Button>
          </Box>

          <Alert severity="info" sx={{ mb: 3 }}>
            Festival Advance: ₹10,000 (interest-free), recovered in 10 monthly installments. Available to Group B, C employees.
          </Alert>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 5 }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Application Details</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField fullWidth size="small" label="Employee Name" value={empName} onChange={(e) => setEmpName(e.target.value)} />
                  <TextField fullWidth size="small" label="Designation" value={designation} onChange={(e) => setDesignation(e.target.value)} />
                  <TextField fullWidth size="small" label="Employee ID" value={empId} onChange={(e) => setEmpId(e.target.value)} />
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Pay Level</InputLabel>
                        <Select value={payLevel} label="Pay Level" onChange={(e) => setPayLevel(Number(e.target.value))}>
                          {Array.from({ length: 18 }, (_, i) => i + 1).map(l => (<MenuItem key={l} value={l}>Level {l}</MenuItem>))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <TextField fullWidth size="small" type="number" label="Basic Pay (₹)" value={basicPay} onChange={(e) => setBasicPay(Number(e.target.value) || 0)} />
                    </Grid>
                  </Grid>
                  <FormControl fullWidth size="small">
                    <InputLabel>Festival</InputLabel>
                    <Select value={festival} label="Festival" onChange={(e) => setFestival(e.target.value)}>
                      {festivals.map(f => (<MenuItem key={f} value={f}>{f}</MenuItem>))}
                    </Select>
                  </FormControl>
                  <Divider />
                  <TextField fullWidth size="small" label="Account Number" value={accountNo} onChange={(e) => setAccountNo(e.target.value)} />
                  <TextField fullWidth size="small" label="DDO Name" value={ddoName} onChange={(e) => setDdoName(e.target.value)} />
                  <TextField fullWidth size="small" type="month" label="Recovery Start Month" value={startMonth} onChange={(e) => setStartMonth(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
                </Box>

                <Divider sx={{ my: 3 }} />
                <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="primary.main" gutterBottom>Advance Summary</Typography>
                  <Typography variant="body2">Advance Amount: <strong>{fmt(advanceAmount)}</strong></Typography>
                  <Typography variant="body2">Monthly Deduction: <strong>{fmt(monthlyDeduction)}</strong></Typography>
                  <Typography variant="body2">No. of Installments: <strong>{installments}</strong></Typography>
                  <Typography variant="body2">Interest: <strong>Nil (Interest-free)</strong></Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 7 }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Recovery Schedule</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>S.No.</TableCell><TableCell>Month</TableCell><TableCell align="right">Deduction (₹)</TableCell><TableCell align="right">Balance (₹)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recoverySchedule.map((r, i) => (
                        <TableRow key={i} sx={{ bgcolor: r.balance === 0 ? 'action.hover' : 'inherit' }}>
                          <TableCell>{i + 1}</TableCell><TableCell>{r.month}</TableCell>
                          <TableCell align="right">{fmt(r.deduction)}</TableCell>
                          <TableCell align="right" sx={{ color: r.balance === 0 ? 'primary.main' : 'inherit', fontWeight: r.balance === 0 ? 700 : 400 }}>{fmt(r.balance)}</TableCell>
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
