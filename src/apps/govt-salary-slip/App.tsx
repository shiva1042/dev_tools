import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Grid, Button, IconButton,
  FormControl, InputLabel, Select, MenuItem, Divider,
  Table, TableBody, TableCell, TableContainer, TableRow,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import HomeIcon from '@mui/icons-material/Home';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PrintIcon from '@mui/icons-material/Print';

const darkTheme = createTheme({
  palette: { mode: 'dark', primary: { main: '#10b981' }, background: { default: '#0f172a', paper: '#1e293b' } },
});

const fmt = (v: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(v);

const taRates: Record<string, Record<string, number>> = {
  X: { high: 7200, mid: 3600, low: 1800 },
  Y: { high: 7200, mid: 3600, low: 1800 },
  Z: { high: 3600, mid: 1800, low: 1800 },
};

const hraRates: Record<string, number> = { X: 27, Y: 18, Z: 9 };

export default function App() {
  const [empName, setEmpName] = useState('');
  const [designation, setDesignation] = useState('');
  const [empId, setEmpId] = useState('');
  const [department, setDepartment] = useState('');
  const [pan, setPan] = useState('');
  const [payLevel, setPayLevel] = useState(10);
  const [basicPay, setBasicPay] = useState(56100);
  const [daRate, setDaRate] = useState(53);
  const [cityClass, setCityClass] = useState('X');
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [gpfPercent, setGpfPercent] = useState(12);
  const [npsPercent, setNpsPercent] = useState(10);
  const [incomeTax, setIncomeTax] = useState(0);
  const [cghs, setCghs] = useState(500);
  const [profTax, setProfTax] = useState(200);
  const [cgegis, setCgegis] = useState(0);
  const [pli, setPli] = useState(0);
  const [otherDeductions, setOtherDeductions] = useState(0);

  const calc = useMemo(() => {
    const da = Math.round(basicPay * daRate / 100);
    const hra = Math.round(basicPay * hraRates[cityClass] / 100);
    const cat = payLevel >= 12 ? 'high' : payLevel >= 6 ? 'mid' : 'low';
    const ta = taRates[cityClass][cat];
    const gross = basicPay + da + hra + ta;
    const gpf = Math.round(basicPay * gpfPercent / 100);
    const nps = Math.round((basicPay + da) * npsPercent / 100);
    const totalDeductions = gpf + nps + incomeTax + cghs + profTax + cgegis + pli + otherDeductions;
    const net = gross - totalDeductions;
    return { da, hra, ta, gross, gpf, nps, totalDeductions, net };
  }, [basicPay, daRate, cityClass, payLevel, gpfPercent, npsPercent, incomeTax, cghs, profTax, cgegis, pli, otherDeductions]);

  const monthLabel = month ? new Date(month + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : '';

  const handlePrint = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<html><head><title>Salary Slip - ${monthLabel}</title><style>
      body{font-family:Arial,sans-serif;padding:20px 40px;color:#000;font-size:12px}
      .hdr{text-align:center;margin-bottom:10px;border-bottom:2px solid #333;padding-bottom:10px}
      .hdr h2{margin:0;font-size:16px}.hdr p{margin:2px 0;font-size:11px}
      .info{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0;font-size:11px}.info div{flex:1;min-width:200px}
      .info span{font-weight:bold}
      table{width:100%;border-collapse:collapse;margin:10px 0}th,td{border:1px solid #999;padding:4px 8px;font-size:11px}th{background:#f0f0f0}
      .columns{display:flex;gap:20px}.columns>div{flex:1}
      .total{font-weight:bold;background:#f0f0f0;font-size:13px}
      .net{text-align:center;margin-top:10px;padding:8px;border:2px solid #333;font-size:14px;font-weight:bold}
    </style></head><body>
      <div class="hdr"><h2>GOVERNMENT OF INDIA</h2><p>${department || 'Department'}</p><h3>PAY SLIP FOR ${monthLabel.toUpperCase()}</h3></div>
      <div class="info">
        <div>Name: <span>${empName || '___'}</span></div>
        <div>Employee ID: <span>${empId || '___'}</span></div>
        <div>Designation: <span>${designation || '___'}</span></div>
        <div>Pay Level: <span>Level ${payLevel}</span></div>
        <div>PAN: <span>${pan || '___'}</span></div>
      </div>
      <div class="columns">
        <div>
          <table><thead><tr><th colspan="2">EARNINGS</th></tr></thead><tbody>
          <tr><td>Basic Pay</td><td style="text-align:right">${fmt(basicPay)}</td></tr>
          <tr><td>DA (${daRate}%)</td><td style="text-align:right">${fmt(calc.da)}</td></tr>
          <tr><td>HRA (${hraRates[cityClass]}%)</td><td style="text-align:right">${fmt(calc.hra)}</td></tr>
          <tr><td>Transport Allowance</td><td style="text-align:right">${fmt(calc.ta)}</td></tr>
          <tr class="total"><td>Gross</td><td style="text-align:right">${fmt(calc.gross)}</td></tr>
          </tbody></table>
        </div>
        <div>
          <table><thead><tr><th colspan="2">DEDUCTIONS</th></tr></thead><tbody>
          <tr><td>GPF (${gpfPercent}%)</td><td style="text-align:right">${fmt(calc.gpf)}</td></tr>
          <tr><td>NPS (${npsPercent}%)</td><td style="text-align:right">${fmt(calc.nps)}</td></tr>
          <tr><td>Income Tax</td><td style="text-align:right">${fmt(incomeTax)}</td></tr>
          <tr><td>CGHS</td><td style="text-align:right">${fmt(cghs)}</td></tr>
          <tr><td>Professional Tax</td><td style="text-align:right">${fmt(profTax)}</td></tr>
          ${cgegis > 0 ? `<tr><td>CGEGIS</td><td style="text-align:right">${fmt(cgegis)}</td></tr>` : ''}
          ${pli > 0 ? `<tr><td>PLI</td><td style="text-align:right">${fmt(pli)}</td></tr>` : ''}
          ${otherDeductions > 0 ? `<tr><td>Other</td><td style="text-align:right">${fmt(otherDeductions)}</td></tr>` : ''}
          <tr class="total"><td>Total Deductions</td><td style="text-align:right">${fmt(calc.totalDeductions)}</td></tr>
          </tbody></table>
        </div>
      </div>
      <div class="net">NET PAY: ${fmt(calc.net)}</div>
      <p style="margin-top:20px;font-size:10px;color:#666;text-align:center">This is a computer-generated salary slip.</p>
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
            <ReceiptLongIcon sx={{ color: 'primary.main', fontSize: 32 }} />
            <Typography variant="h5" fontWeight={600} color="primary.main">Government Salary Slip</Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint}>Print Slip</Button>
          </Box>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Employee Details</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField fullWidth size="small" label="Name" value={empName} onChange={(e) => setEmpName(e.target.value)} />
                  <TextField fullWidth size="small" label="Designation" value={designation} onChange={(e) => setDesignation(e.target.value)} />
                  <TextField fullWidth size="small" label="Employee ID" value={empId} onChange={(e) => setEmpId(e.target.value)} />
                  <TextField fullWidth size="small" label="Department" value={department} onChange={(e) => setDepartment(e.target.value)} />
                  <TextField fullWidth size="small" label="PAN" value={pan} onChange={(e) => setPan(e.target.value)} />
                  <TextField fullWidth size="small" type="month" label="Month" value={month} onChange={(e) => setMonth(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
                </Box>
              </Paper>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Pay Details</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Pay Level</InputLabel>
                    <Select value={payLevel} label="Pay Level" onChange={(e) => setPayLevel(Number(e.target.value))}>
                      {Array.from({ length: 18 }, (_, i) => i + 1).map(l => (<MenuItem key={l} value={l}>Level {l}</MenuItem>))}
                    </Select>
                  </FormControl>
                  <TextField fullWidth size="small" type="number" label="Basic Pay (₹)" value={basicPay} onChange={(e) => setBasicPay(Number(e.target.value) || 0)} />
                  <TextField fullWidth size="small" type="number" label="DA Rate (%)" value={daRate} onChange={(e) => setDaRate(Number(e.target.value) || 0)} />
                  <FormControl fullWidth size="small">
                    <InputLabel>City Class</InputLabel>
                    <Select value={cityClass} label="City Class" onChange={(e) => setCityClass(e.target.value)}>
                      <MenuItem value="X">X (Metro) — HRA 27%</MenuItem>
                      <MenuItem value="Y">Y — HRA 18%</MenuItem>
                      <MenuItem value="Z">Z — HRA 9%</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Deductions</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField fullWidth size="small" type="number" label="GPF (%)" value={gpfPercent} onChange={(e) => setGpfPercent(Number(e.target.value) || 0)} />
                  <TextField fullWidth size="small" type="number" label="NPS (%)" value={npsPercent} onChange={(e) => setNpsPercent(Number(e.target.value) || 0)} />
                  <TextField fullWidth size="small" type="number" label="Income Tax (₹)" value={incomeTax} onChange={(e) => setIncomeTax(Number(e.target.value) || 0)} />
                  <TextField fullWidth size="small" type="number" label="CGHS (₹)" value={cghs} onChange={(e) => setCghs(Number(e.target.value) || 0)} />
                  <TextField fullWidth size="small" type="number" label="Professional Tax (₹)" value={profTax} onChange={(e) => setProfTax(Number(e.target.value) || 0)} />
                  <TextField fullWidth size="small" type="number" label="CGEGIS (₹)" value={cgegis} onChange={(e) => setCgegis(Number(e.target.value) || 0)} />
                  <TextField fullWidth size="small" type="number" label="PLI (₹)" value={pli} onChange={(e) => setPli(Number(e.target.value) || 0)} />
                  <TextField fullWidth size="small" type="number" label="Other Deductions (₹)" value={otherDeductions} onChange={(e) => setOtherDeductions(Number(e.target.value) || 0)} />
                </Box>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom color="primary.main">Earnings</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <TableRow><TableCell>Basic Pay</TableCell><TableCell align="right">{fmt(basicPay)}</TableCell></TableRow>
                      <TableRow><TableCell>DA ({daRate}%)</TableCell><TableCell align="right">{fmt(calc.da)}</TableCell></TableRow>
                      <TableRow><TableCell>HRA ({hraRates[cityClass]}%)</TableCell><TableCell align="right">{fmt(calc.hra)}</TableCell></TableRow>
                      <TableRow><TableCell>Transport Allowance</TableCell><TableCell align="right">{fmt(calc.ta)}</TableCell></TableRow>
                      <TableRow sx={{ bgcolor: 'action.hover' }}>
                        <TableCell><Typography fontWeight={700}>Gross</Typography></TableCell>
                        <TableCell align="right"><Typography fontWeight={700}>{fmt(calc.gross)}</Typography></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom color="error.main">Deductions</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <TableRow><TableCell>GPF ({gpfPercent}%)</TableCell><TableCell align="right">{fmt(calc.gpf)}</TableCell></TableRow>
                      <TableRow><TableCell>NPS ({npsPercent}%)</TableCell><TableCell align="right">{fmt(calc.nps)}</TableCell></TableRow>
                      <TableRow><TableCell>Income Tax</TableCell><TableCell align="right">{fmt(incomeTax)}</TableCell></TableRow>
                      <TableRow><TableCell>CGHS</TableCell><TableCell align="right">{fmt(cghs)}</TableCell></TableRow>
                      <TableRow><TableCell>Professional Tax</TableCell><TableCell align="right">{fmt(profTax)}</TableCell></TableRow>
                      {cgegis > 0 && <TableRow><TableCell>CGEGIS</TableCell><TableCell align="right">{fmt(cgegis)}</TableCell></TableRow>}
                      {pli > 0 && <TableRow><TableCell>PLI</TableCell><TableCell align="right">{fmt(pli)}</TableCell></TableRow>}
                      {otherDeductions > 0 && <TableRow><TableCell>Other</TableCell><TableCell align="right">{fmt(otherDeductions)}</TableCell></TableRow>}
                      <TableRow sx={{ bgcolor: 'action.hover' }}>
                        <TableCell><Typography fontWeight={700}>Total Deductions</Typography></TableCell>
                        <TableCell align="right"><Typography fontWeight={700} color="error.main">{fmt(calc.totalDeductions)}</Typography></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
              <Paper sx={{ p: 3, bgcolor: 'rgba(16,185,129,0.1)' }}>
                <Typography variant="h6" gutterBottom>Net Pay — {monthLabel}</Typography>
                <Typography variant="h3" fontWeight={700} color="primary.main" textAlign="center">{fmt(calc.net)}</Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
