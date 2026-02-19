import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Grid, Button, IconButton, Divider, Alert, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, Tab,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import HomeIcon from '@mui/icons-material/Home';
import CalculateIcon from '@mui/icons-material/Calculate';
import PrintIcon from '@mui/icons-material/Print';

const darkTheme = createTheme({
  palette: { mode: 'dark', primary: { main: '#10b981' }, background: { default: '#0f172a', paper: '#1e293b' } },
});

const fmt = (v: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(v);

const calcOldTax = (income: number) => {
  const slabs = [
    { min: 0, max: 250000, rate: 0 }, { min: 250000, max: 500000, rate: 0.05 },
    { min: 500000, max: 1000000, rate: 0.20 }, { min: 1000000, max: Infinity, rate: 0.30 },
  ];
  let tax = 0;
  for (const s of slabs) { if (income > s.min) tax += Math.min(income - s.min, s.max - s.min) * s.rate; }
  if (income <= 500000) tax = 0; // Rebate 87A
  return tax;
};

const calcNewTax = (income: number) => {
  const slabs = [
    { min: 0, max: 300000, rate: 0 }, { min: 300000, max: 700000, rate: 0.05 },
    { min: 700000, max: 1000000, rate: 0.10 }, { min: 1000000, max: 1200000, rate: 0.15 },
    { min: 1200000, max: 1500000, rate: 0.20 }, { min: 1500000, max: Infinity, rate: 0.30 },
  ];
  let tax = 0;
  for (const s of slabs) { if (income > s.min) tax += Math.min(income - s.min, s.max - s.min) * s.rate; }
  if (income <= 700000) tax = 0; // Rebate 87A
  return tax;
};

const addCess = (tax: number) => Math.round(tax * 1.04);

export default function App() {
  const [tab, setTab] = useState(0);
  const [grossSalary, setGrossSalary] = useState(1200000);
  const [basicPay, setBasicPay] = useState(800000);
  const [hraReceived, setHraReceived] = useState(200000);
  const [rentPaid, setRentPaid] = useState(240000);
  const [isMetro, setIsMetro] = useState(true);
  const [otherIncome, setOtherIncome] = useState(0);
  // Deductions
  const [sec80C, setSec80C] = useState(150000);
  const [sec80D, setSec80D] = useState(25000);
  const [sec80CCD, setSec80CCD] = useState(50000);
  const [homeLoanInterest, setHomeLoanInterest] = useState(0);
  // Form 12BB
  const [empName, setEmpName] = useState('');
  const [empId, setEmpId] = useState('');
  const [pan, setPan] = useState('');

  const calc = useMemo(() => {
    const totalIncome = grossSalary + otherIncome;

    // OLD Regime
    const stdDeductionOld = 50000;
    const hraExempt1 = hraReceived;
    const hraExempt2 = rentPaid - basicPay * 0.1;
    const hraExempt3 = basicPay * (isMetro ? 0.5 : 0.4);
    const hraExemption = Math.max(0, Math.min(hraExempt1, hraExempt2, hraExempt3));
    const old80C = Math.min(sec80C, 150000);
    const old80D = Math.min(sec80D, 50000);
    const old80CCD = Math.min(sec80CCD, 50000);
    const oldHomeLoan = Math.min(homeLoanInterest, 200000);
    const oldTotalDeductions = stdDeductionOld + hraExemption + old80C + old80D + old80CCD + oldHomeLoan;
    const oldTaxableIncome = Math.max(0, totalIncome - oldTotalDeductions);
    const oldTax = addCess(calcOldTax(oldTaxableIncome));

    // NEW Regime
    const stdDeductionNew = 75000;
    const newTaxableIncome = Math.max(0, totalIncome - stdDeductionNew);
    const newTax = addCess(calcNewTax(newTaxableIncome));

    const saving = oldTax - newTax;
    const recommended = saving > 0 ? 'new' : 'old';
    const monthlyTDSold = Math.round(oldTax / 12);
    const monthlyTDSnew = Math.round(newTax / 12);

    return {
      totalIncome, hraExemption, hraExempt1, hraExempt2, hraExempt3,
      oldTotalDeductions, oldTaxableIncome, oldTax, monthlyTDSold,
      newTaxableIncome, newTax, monthlyTDSnew, saving, recommended,
    };
  }, [grossSalary, otherIncome, basicPay, hraReceived, rentPaid, isMetro, sec80C, sec80D, sec80CCD, homeLoanInterest]);

  const handlePrint = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    if (tab === 0) {
      w.document.write(`<html><head><title>Income Tax Computation</title><style>
        body{font-family:Arial,sans-serif;padding:20px 40px;color:#000;font-size:12px}
        .hdr{text-align:center;margin-bottom:15px}.hdr h2{margin:0}
        table{width:100%;border-collapse:collapse;margin:10px 0}th,td{border:1px solid #333;padding:5px 8px;font-size:11px}th{background:#f0f0f0}
        .highlight{background:#e8f5e9;font-weight:bold}
      </style></head><body>
        <div class="hdr"><h2>INCOME TAX COMPUTATION — FY 2024-25</h2></div>
        <table><thead><tr><th></th><th>Old Regime</th><th>New Regime</th></tr></thead><tbody>
        <tr><td>Gross Income</td><td style="text-align:right">${fmt(calc.totalIncome)}</td><td style="text-align:right">${fmt(calc.totalIncome)}</td></tr>
        <tr><td>Standard Deduction</td><td style="text-align:right">${fmt(50000)}</td><td style="text-align:right">${fmt(75000)}</td></tr>
        <tr><td>HRA Exemption</td><td style="text-align:right">${fmt(calc.hraExemption)}</td><td style="text-align:right">-</td></tr>
        <tr><td>80C + 80D + 80CCD</td><td style="text-align:right">${fmt(Math.min(sec80C, 150000) + Math.min(sec80D, 50000) + Math.min(sec80CCD, 50000))}</td><td style="text-align:right">-</td></tr>
        <tr><td>Taxable Income</td><td style="text-align:right">${fmt(calc.oldTaxableIncome)}</td><td style="text-align:right">${fmt(calc.newTaxableIncome)}</td></tr>
        <tr class="highlight"><td>Tax (incl. 4% cess)</td><td style="text-align:right">${fmt(calc.oldTax)}</td><td style="text-align:right">${fmt(calc.newTax)}</td></tr>
        <tr><td>Monthly TDS</td><td style="text-align:right">${fmt(calc.monthlyTDSold)}</td><td style="text-align:right">${fmt(calc.monthlyTDSnew)}</td></tr>
        </tbody></table>
        <p><strong>Recommendation:</strong> ${calc.recommended === 'new' ? 'New' : 'Old'} regime saves ${fmt(Math.abs(calc.saving))} per year.</p>
      </body></html>`);
    } else {
      w.document.write(`<html><head><title>Form 12BB</title><style>
        body{font-family:'Times New Roman',serif;padding:30px 50px;color:#000;font-size:14px;line-height:1.6}
        .hdr{text-align:center;margin-bottom:15px}.hdr h2{margin:0;font-size:18px;text-decoration:underline}
        .row{display:flex;margin-bottom:8px}.row .lbl{width:300px;font-weight:bold}.row .val{flex:1;border-bottom:1px dotted #333;padding-left:8px}
        table{width:100%;border-collapse:collapse;margin:12px 0}th,td{border:1px solid #333;padding:6px 10px;font-size:13px}th{background:#f0f0f0}
      </style></head><body>
        <div class="hdr"><h2>FORM 12BB</h2><p>Statement showing particulars of claims by an employee for deduction of tax (Rule 26C)</p></div>
        <div class="row"><div class="lbl">Name:</div><div class="val">${empName || '___'}</div></div>
        <div class="row"><div class="lbl">Employee ID:</div><div class="val">${empId || '___'}</div></div>
        <div class="row"><div class="lbl">PAN:</div><div class="val">${pan || '___'}</div></div>
        <div class="row"><div class="lbl">Financial Year:</div><div class="val">2024-25</div></div>
        <h4>A. House Rent Allowance</h4>
        <table><tbody>
        <tr><td>Rent paid per annum</td><td>${fmt(rentPaid)}</td></tr>
        <tr><td>Name of landlord</td><td>___________</td></tr>
        <tr><td>PAN of landlord</td><td>${rentPaid > 100000 ? 'MANDATORY' : 'Optional'}</td></tr>
        </tbody></table>
        <h4>B. Deductions under Chapter VI-A</h4>
        <table><thead><tr><th>Section</th><th>Details</th><th>Amount</th></tr></thead><tbody>
        <tr><td>80C</td><td>GPF/PPF/LIC/ELSS</td><td>${fmt(sec80C)}</td></tr>
        <tr><td>80D</td><td>Medical Insurance</td><td>${fmt(sec80D)}</td></tr>
        <tr><td>80CCD(1B)</td><td>NPS Additional</td><td>${fmt(sec80CCD)}</td></tr>
        </tbody></table>
        ${homeLoanInterest > 0 ? `<h4>C. Interest on Home Loan (Sec 24)</h4><p>Amount: ${fmt(homeLoanInterest)}</p>` : ''}
        <p style="margin-top:30px">I, ${empName || '___________'}, hereby declare that the above information is correct.</p>
        <p style="margin-top:40px">Signature: _________________ &nbsp;&nbsp;&nbsp; Date: _____________</p>
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
            <CalculateIcon sx={{ color: 'primary.main', fontSize: 32 }} />
            <Typography variant="h5" fontWeight={600} color="primary.main">Income Tax Calculator</Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint}>Print {tab === 0 ? 'Tax Sheet' : 'Form 12BB'}</Button>
          </Box>

          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
            <Tab label="Tax Calculator (Old vs New)" />
            <Tab label="Form 12BB Generator" />
          </Tabs>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Income</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField fullWidth size="small" type="number" label="Gross Annual Salary (₹)" value={grossSalary} onChange={(e) => setGrossSalary(Number(e.target.value) || 0)} />
                  <TextField fullWidth size="small" type="number" label="Basic Pay (Annual)" value={basicPay} onChange={(e) => setBasicPay(Number(e.target.value) || 0)} />
                  <TextField fullWidth size="small" type="number" label="HRA Received (Annual)" value={hraReceived} onChange={(e) => setHraReceived(Number(e.target.value) || 0)} />
                  <TextField fullWidth size="small" type="number" label="Rent Paid (Annual)" value={rentPaid} onChange={(e) => setRentPaid(Number(e.target.value) || 0)} />
                  <TextField fullWidth size="small" type="number" label="Other Income (₹)" value={otherIncome} onChange={(e) => setOtherIncome(Number(e.target.value) || 0)} />
                  <Button variant={isMetro ? 'contained' : 'outlined'} size="small" onClick={() => setIsMetro(!isMetro)}>
                    City: {isMetro ? 'Metro (50%)' : 'Non-Metro (40%)'}
                  </Button>
                </Box>
              </Paper>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Deductions (Old Regime)</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField fullWidth size="small" type="number" label="Sec 80C (max 1.5L)" value={sec80C} onChange={(e) => setSec80C(Number(e.target.value) || 0)} />
                  <TextField fullWidth size="small" type="number" label="Sec 80D Medical (max 50K)" value={sec80D} onChange={(e) => setSec80D(Number(e.target.value) || 0)} />
                  <TextField fullWidth size="small" type="number" label="Sec 80CCD NPS (max 50K)" value={sec80CCD} onChange={(e) => setSec80CCD(Number(e.target.value) || 0)} />
                  <TextField fullWidth size="small" type="number" label="Home Loan Interest (max 2L)" value={homeLoanInterest} onChange={(e) => setHomeLoanInterest(Number(e.target.value) || 0)} />
                </Box>
                {tab === 1 && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" gutterBottom>Form 12BB Details</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <TextField fullWidth size="small" label="Employee Name" value={empName} onChange={(e) => setEmpName(e.target.value)} />
                      <TextField fullWidth size="small" label="Employee ID" value={empId} onChange={(e) => setEmpId(e.target.value)} />
                      <TextField fullWidth size="small" label="PAN" value={pan} onChange={(e) => setPan(e.target.value)} />
                    </Box>
                  </>
                )}
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 8 }}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Old vs New Regime Comparison</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead><TableRow><TableCell></TableCell><TableCell align="right">Old Regime</TableCell><TableCell align="right">New Regime</TableCell></TableRow></TableHead>
                    <TableBody>
                      <TableRow><TableCell>Gross Income</TableCell><TableCell align="right">{fmt(calc.totalIncome)}</TableCell><TableCell align="right">{fmt(calc.totalIncome)}</TableCell></TableRow>
                      <TableRow><TableCell>Standard Deduction</TableCell><TableCell align="right">-{fmt(50000)}</TableCell><TableCell align="right">-{fmt(75000)}</TableCell></TableRow>
                      <TableRow><TableCell>HRA Exemption</TableCell><TableCell align="right">-{fmt(calc.hraExemption)}</TableCell><TableCell align="right" sx={{ color: 'text.secondary' }}>N/A</TableCell></TableRow>
                      <TableRow><TableCell>Chapter VI-A (80C/D/CCD)</TableCell><TableCell align="right">-{fmt(Math.min(sec80C, 150000) + Math.min(sec80D, 50000) + Math.min(sec80CCD, 50000))}</TableCell><TableCell align="right" sx={{ color: 'text.secondary' }}>N/A</TableCell></TableRow>
                      {homeLoanInterest > 0 && <TableRow><TableCell>Home Loan Interest</TableCell><TableCell align="right">-{fmt(Math.min(homeLoanInterest, 200000))}</TableCell><TableCell align="right" sx={{ color: 'text.secondary' }}>N/A</TableCell></TableRow>}
                      <TableRow sx={{ bgcolor: 'action.hover' }}>
                        <TableCell><strong>Taxable Income</strong></TableCell>
                        <TableCell align="right"><strong>{fmt(calc.oldTaxableIncome)}</strong></TableCell>
                        <TableCell align="right"><strong>{fmt(calc.newTaxableIncome)}</strong></TableCell>
                      </TableRow>
                      <TableRow sx={{ bgcolor: calc.recommended === 'old' ? 'rgba(16,185,129,0.1)' : 'inherit' }}>
                        <TableCell><strong>Tax (incl. 4% cess)</strong></TableCell>
                        <TableCell align="right"><Typography fontWeight={700} color={calc.recommended === 'old' ? 'primary.main' : 'error.main'}>{fmt(calc.oldTax)}</Typography></TableCell>
                        <TableCell align="right"><Typography fontWeight={700} color={calc.recommended === 'new' ? 'primary.main' : 'error.main'}>{fmt(calc.newTax)}</Typography></TableCell>
                      </TableRow>
                      <TableRow><TableCell>Monthly TDS</TableCell><TableCell align="right">{fmt(calc.monthlyTDSold)}</TableCell><TableCell align="right">{fmt(calc.monthlyTDSnew)}</TableCell></TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
                <Alert severity="success" sx={{ mt: 2 }}>
                  <strong>{calc.recommended === 'new' ? 'New' : 'Old'} Regime</strong> saves you {fmt(Math.abs(calc.saving))} per year ({fmt(Math.round(Math.abs(calc.saving) / 12))}/month).
                </Alert>
              </Paper>

              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>HRA Exemption Calculation</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <TableRow><TableCell>1. Actual HRA Received</TableCell><TableCell align="right">{fmt(calc.hraExempt1)}</TableCell></TableRow>
                      <TableRow><TableCell>2. Rent - 10% of Basic ({fmt(rentPaid)} - {fmt(basicPay * 0.1)})</TableCell><TableCell align="right">{fmt(calc.hraExempt2)}</TableCell></TableRow>
                      <TableRow><TableCell>3. {isMetro ? '50%' : '40%'} of Basic</TableCell><TableCell align="right">{fmt(calc.hraExempt3)}</TableCell></TableRow>
                      <TableRow sx={{ bgcolor: 'action.hover' }}>
                        <TableCell><strong>HRA Exemption (Minimum of above)</strong></TableCell>
                        <TableCell align="right"><Typography fontWeight={700} color="primary.main">{fmt(calc.hraExemption)}</Typography></TableCell>
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
