import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Grid, Button, IconButton, Divider, Alert,
  Table, TableBody, TableCell, TableContainer, TableRow,
  FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import HomeIcon from '@mui/icons-material/Home';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import PrintIcon from '@mui/icons-material/Print';

const darkTheme = createTheme({
  palette: { mode: 'dark', primary: { main: '#10b981' }, background: { default: '#0f172a', paper: '#1e293b' } },
});

const fmt = (v: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(v);

const months = ['April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March'];

export default function App() {
  const [basicPay, setBasicPay] = useState(56100);
  const [daRate, setDaRate] = useState(53);
  const [hraReceived, setHraReceived] = useState(15100);
  const [rentPaid, setRentPaid] = useState(20000);
  const [cityType, setCityType] = useState<'metro' | 'nonmetro'>('metro');
  // Rent Receipt
  const [tenantName, setTenantName] = useState('');
  const [tenantAddress, setTenantAddress] = useState('');
  const [landlordName, setLandlordName] = useState('');
  const [landlordAddress, setLandlordAddress] = useState('');
  const [landlordPan, setLandlordPan] = useState('');
  const [fromMonth, setFromMonth] = useState(0);
  const [toMonth, setToMonth] = useState(11);

  const calc = useMemo(() => {
    const annualBasic = basicPay * 12;
    const annualHra = hraReceived * 12;
    const annualRent = rentPaid * 12;
    const hraExempt1 = annualHra;
    const hraExempt2 = annualRent - annualBasic * 0.1;
    const hraExempt3 = annualBasic * (cityType === 'metro' ? 0.5 : 0.4);
    const exemption = Math.max(0, Math.min(hraExempt1, hraExempt2, hraExempt3));
    const taxableHra = annualHra - exemption;
    return { annualBasic, annualHra, annualRent, hraExempt1, hraExempt2, hraExempt3, exemption, taxableHra };
  }, [basicPay, hraReceived, rentPaid, cityType]);

  const handlePrintCalc = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<html><head><title>HRA Calculation</title><style>
      body{font-family:Arial,sans-serif;padding:20px 40px;color:#000;font-size:12px}
      .hdr{text-align:center;margin-bottom:15px}.hdr h2{margin:0;font-size:16px}
      table{width:100%;border-collapse:collapse;margin:10px 0}td{border:1px solid #333;padding:5px 8px;font-size:11px}
      .highlight{background:#e8f5e9;font-weight:bold}
    </style></head><body>
      <div class="hdr"><h2>HRA EXEMPTION CALCULATION</h2></div>
      <table><tbody>
      <tr><td>Basic Pay (Annual)</td><td style="text-align:right">${fmt(calc.annualBasic)}</td></tr>
      <tr><td>HRA Received (Annual)</td><td style="text-align:right">${fmt(calc.annualHra)}</td></tr>
      <tr><td>Rent Paid (Annual)</td><td style="text-align:right">${fmt(calc.annualRent)}</td></tr>
      <tr><td colspan="2" style="font-weight:bold;background:#f0f0f0">Exemption Calculation (Minimum of below):</td></tr>
      <tr><td>1. Actual HRA Received</td><td style="text-align:right">${fmt(calc.hraExempt1)}</td></tr>
      <tr><td>2. Rent - 10% of Basic</td><td style="text-align:right">${fmt(calc.hraExempt2)}</td></tr>
      <tr><td>3. ${cityType === 'metro' ? '50%' : '40%'} of Basic</td><td style="text-align:right">${fmt(calc.hraExempt3)}</td></tr>
      <tr class="highlight"><td>HRA Exemption</td><td style="text-align:right">${fmt(calc.exemption)}</td></tr>
      <tr><td>Taxable HRA</td><td style="text-align:right">${fmt(calc.taxableHra)}</td></tr>
      </tbody></table>
    </body></html>`);
    w.document.close();
    w.print();
  };

  const handlePrintReceipts = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    let html = `<html><head><title>Rent Receipts</title><style>
      body{font-family:Arial,sans-serif;padding:10px;color:#000;font-size:12px}
      .receipt{border:2px solid #333;padding:20px 30px;margin:15px 0;page-break-inside:avoid}
      .receipt h3{text-align:center;margin:0 0 15px;text-decoration:underline}
      .row{display:flex;margin-bottom:6px}.row .lbl{width:200px;font-weight:bold}.row .val{flex:1}
      .stamp{margin-top:15px;display:flex;justify-content:space-between;align-items:flex-end}
      .stamp-box{width:80px;height:80px;border:1px dashed #333;text-align:center;font-size:9px;display:flex;align-items:center;justify-content:center}
      @media print{.receipt{page-break-after:always}}
    </style></head><body>`;

    for (let m = fromMonth; m <= toMonth; m++) {
      html += `<div class="receipt">
        <h3>RENT RECEIPT</h3>
        <div class="row"><div class="lbl">Received From:</div><div class="val">${tenantName || '___________'}</div></div>
        <div class="row"><div class="lbl">Address:</div><div class="val">${tenantAddress || '___________'}</div></div>
        <div class="row"><div class="lbl">Month:</div><div class="val">${months[m]} 2024</div></div>
        <div class="row"><div class="lbl">Rent Amount:</div><div class="val"><strong>${fmt(rentPaid)}</strong> (${rentPaid > 5000 ? 'Cash/Transfer' : 'Cash'})</div></div>
        <div class="row"><div class="lbl">Landlord Name:</div><div class="val">${landlordName || '___________'}</div></div>
        <div class="row"><div class="lbl">Landlord Address:</div><div class="val">${landlordAddress || '___________'}</div></div>
        ${landlordPan ? `<div class="row"><div class="lbl">Landlord PAN:</div><div class="val">${landlordPan}</div></div>` : ''}
        <div class="stamp">
          <div><p>Date: ____________</p><p>Signature of Landlord</p></div>
          ${rentPaid > 5000 ? '<div class="stamp-box">Revenue<br/>Stamp<br/>(₹1)</div>' : ''}
        </div>
      </div>`;
    }
    html += '</body></html>';
    w.document.write(html);
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
            <HomeWorkIcon sx={{ color: 'primary.main', fontSize: 32 }} />
            <Typography variant="h5" fontWeight={600} color="primary.main">HRA Calculator & Rent Receipts</Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 5 }}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>HRA Exemption</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField fullWidth size="small" type="number" label="Basic Pay (Monthly ₹)" value={basicPay} onChange={(e) => setBasicPay(Number(e.target.value) || 0)} />
                  <TextField fullWidth size="small" type="number" label="DA Rate (%)" value={daRate} onChange={(e) => setDaRate(Number(e.target.value) || 0)} />
                  <TextField fullWidth size="small" type="number" label="HRA Received (Monthly ₹)" value={hraReceived} onChange={(e) => setHraReceived(Number(e.target.value) || 0)} />
                  <TextField fullWidth size="small" type="number" label="Rent Paid (Monthly ₹)" value={rentPaid} onChange={(e) => setRentPaid(Number(e.target.value) || 0)} />
                  <Button variant={cityType === 'metro' ? 'contained' : 'outlined'} onClick={() => setCityType(cityType === 'metro' ? 'nonmetro' : 'metro')}>
                    {cityType === 'metro' ? 'Metro City (50%)' : 'Non-Metro (40%)'}
                  </Button>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Button fullWidth variant="outlined" startIcon={<PrintIcon />} onClick={handlePrintCalc}>Print HRA Calculation</Button>
              </Paper>

              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Calculation (Annual)</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <TableRow><TableCell>1. Actual HRA</TableCell><TableCell align="right">{fmt(calc.hraExempt1)}</TableCell></TableRow>
                      <TableRow><TableCell>2. Rent - 10% Basic</TableCell><TableCell align="right">{fmt(calc.hraExempt2)}</TableCell></TableRow>
                      <TableRow><TableCell>3. {cityType === 'metro' ? '50%' : '40%'} of Basic</TableCell><TableCell align="right">{fmt(calc.hraExempt3)}</TableCell></TableRow>
                      <TableRow sx={{ bgcolor: 'rgba(16,185,129,0.1)' }}>
                        <TableCell><strong>HRA Exemption (Min)</strong></TableCell>
                        <TableCell align="right"><Typography fontWeight={700} color="primary.main">{fmt(calc.exemption)}</Typography></TableCell>
                      </TableRow>
                      <TableRow><TableCell>Taxable HRA</TableCell><TableCell align="right" sx={{ color: 'error.main' }}>{fmt(calc.taxableHra)}</TableCell></TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 7 }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Rent Receipt Generator</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField fullWidth size="small" label="Tenant Name" value={tenantName} onChange={(e) => setTenantName(e.target.value)} />
                  <TextField fullWidth size="small" label="Tenant Address" value={tenantAddress} onChange={(e) => setTenantAddress(e.target.value)} />
                  <Divider />
                  <TextField fullWidth size="small" label="Landlord Name" value={landlordName} onChange={(e) => setLandlordName(e.target.value)} />
                  <TextField fullWidth size="small" label="Landlord Address" value={landlordAddress} onChange={(e) => setLandlordAddress(e.target.value)} />
                  <TextField fullWidth size="small" label="Landlord PAN (required if rent > ₹1L/year)" value={landlordPan} onChange={(e) => setLandlordPan(e.target.value)} />
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                      <FormControl fullWidth size="small">
                        <InputLabel>From Month</InputLabel>
                        <Select value={fromMonth} label="From Month" onChange={(e) => setFromMonth(Number(e.target.value))}>
                          {months.map((m, i) => (<MenuItem key={i} value={i}>{m}</MenuItem>))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <FormControl fullWidth size="small">
                        <InputLabel>To Month</InputLabel>
                        <Select value={toMonth} label="To Month" onChange={(e) => setToMonth(Number(e.target.value))}>
                          {months.map((m, i) => (<MenuItem key={i} value={i}>{m}</MenuItem>))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Box>
                <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                  <Button fullWidth variant="contained" startIcon={<PrintIcon />} onClick={handlePrintReceipts}>
                    Print Rent Receipts ({toMonth - fromMonth + 1} months)
                  </Button>
                </Box>
                {rentPaid * 12 > 100000 && (
                  <Alert severity="warning" sx={{ mt: 2 }}>Annual rent exceeds ₹1,00,000. Landlord PAN is mandatory.</Alert>
                )}
                {rentPaid > 5000 && (
                  <Alert severity="info" sx={{ mt: 1 }}>Revenue stamp (₹1) required on each receipt for cash payments above ₹5,000.</Alert>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
