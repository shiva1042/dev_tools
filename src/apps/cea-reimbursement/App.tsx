import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Grid, Button, IconButton, Divider, Alert,
  FormControl, InputLabel, Select, MenuItem, Checkbox, FormControlLabel,
  Table, TableBody, TableCell, TableContainer, TableRow,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import HomeIcon from '@mui/icons-material/Home';
import SchoolIcon from '@mui/icons-material/School';
import PrintIcon from '@mui/icons-material/Print';

const darkTheme = createTheme({
  palette: { mode: 'dark', primary: { main: '#10b981' }, background: { default: '#0f172a', paper: '#1e293b' } },
});

const fmt = (v: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(v);

export default function App() {
  const [empName, setEmpName] = useState('');
  const [designation, setDesignation] = useState('');
  const [empId, setEmpId] = useState('');
  const [office, setOffice] = useState('');
  const [academicYear, setAcademicYear] = useState('2024-25');

  // Child 1
  const [child1Name, setChild1Name] = useState('');
  const [child1Class, setChild1Class] = useState('');
  const [child1School, setChild1School] = useState('');
  const [child1Fee, setChild1Fee] = useState(0);
  const [child1Hostel, setChild1Hostel] = useState(false);
  const [child1Disabled, setChild1Disabled] = useState(false);

  // Child 2
  const [hasChild2, setHasChild2] = useState(false);
  const [child2Name, setChild2Name] = useState('');
  const [child2Class, setChild2Class] = useState('');
  const [child2School, setChild2School] = useState('');
  const [child2Fee, setChild2Fee] = useState(0);
  const [child2Hostel, setChild2Hostel] = useState(false);
  const [child2Disabled, setChild2Disabled] = useState(false);

  const [alreadyDrawn, setAlreadyDrawn] = useState(0);

  const calc = useMemo(() => {
    const ceaCeiling = 27000;
    const hostelCeiling = 81000;
    const disabledMultiplier = 2;

    const child1Ceiling = child1Hostel
      ? hostelCeiling * (child1Disabled ? disabledMultiplier : 1)
      : ceaCeiling * (child1Disabled ? disabledMultiplier : 1);
    const child1Eligible = Math.min(child1Fee, child1Ceiling);

    let child2Eligible = 0;
    let child2Ceiling = 0;
    if (hasChild2) {
      child2Ceiling = child2Hostel
        ? hostelCeiling * (child2Disabled ? disabledMultiplier : 1)
        : ceaCeiling * (child2Disabled ? disabledMultiplier : 1);
      child2Eligible = Math.min(child2Fee, child2Ceiling);
    }

    const totalEligible = child1Eligible + child2Eligible;
    const netPayable = Math.max(0, totalEligible - alreadyDrawn);

    return { child1Ceiling, child1Eligible, child2Ceiling, child2Eligible, totalEligible, netPayable };
  }, [child1Fee, child1Hostel, child1Disabled, hasChild2, child2Fee, child2Hostel, child2Disabled, alreadyDrawn]);

  const handlePrint = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    const today = new Date().toLocaleDateString('en-IN');
    w.document.write(`<html><head><title>CEA Reimbursement Form</title><style>
      body{font-family:'Times New Roman',serif;padding:25px 45px;color:#000;font-size:13px;line-height:1.5}
      .hdr{text-align:center;margin-bottom:15px}.hdr h2{margin:0;font-size:16px;text-decoration:underline}
      .row{display:flex;margin-bottom:6px}.row .lbl{width:280px;font-weight:bold;font-size:12px}.row .val{flex:1;border-bottom:1px dotted #333;padding-left:6px;font-size:12px}
      table{width:100%;border-collapse:collapse;margin:12px 0}th,td{border:1px solid #333;padding:5px 8px;font-size:11px}th{background:#f0f0f0}
      .tot td{font-weight:bold;background:#f9f9f9}
      .decl{border:1px solid #333;padding:10px;font-size:11px;margin-top:12px}
      .sig{display:flex;justify-content:space-between;margin-top:40px}.sig div{text-align:center;width:180px;font-size:11px}.sig-line{border-top:1px solid #333;margin-top:35px;padding-top:3px}
    </style></head><body>
      <div class="hdr"><h2>CHILDREN EDUCATION ALLOWANCE REIMBURSEMENT</h2><p>(Annexure-I)</p></div>
      <div class="row"><div class="lbl">1. Name:</div><div class="val">${empName || '___'}</div></div>
      <div class="row"><div class="lbl">2. Designation / Office:</div><div class="val">${designation || '___'} / ${office || '___'}</div></div>
      <div class="row"><div class="lbl">3. Employee ID:</div><div class="val">${empId || '___'}</div></div>
      <div class="row"><div class="lbl">4. Academic Year:</div><div class="val">${academicYear}</div></div>
      <h4>CHILD DETAILS</h4>
      <table><thead><tr><th></th><th>Child 1</th>${hasChild2 ? '<th>Child 2</th>' : ''}</tr></thead><tbody>
      <tr><td>Name</td><td>${child1Name || '___'}</td>${hasChild2 ? `<td>${child2Name || '___'}</td>` : ''}</tr>
      <tr><td>Class</td><td>${child1Class || '___'}</td>${hasChild2 ? `<td>${child2Class || '___'}</td>` : ''}</tr>
      <tr><td>School</td><td>${child1School || '___'}</td>${hasChild2 ? `<td>${child2School || '___'}</td>` : ''}</tr>
      <tr><td>Fee Paid</td><td style="text-align:right">${fmt(child1Fee)}</td>${hasChild2 ? `<td style="text-align:right">${fmt(child2Fee)}</td>` : ''}</tr>
      <tr><td>Type</td><td>${child1Hostel ? 'Hostel' : 'Day Scholar'}</td>${hasChild2 ? `<td>${child2Hostel ? 'Hostel' : 'Day Scholar'}</td>` : ''}</tr>
      <tr><td>Ceiling</td><td style="text-align:right">${fmt(calc.child1Ceiling)}</td>${hasChild2 ? `<td style="text-align:right">${fmt(calc.child2Ceiling)}</td>` : ''}</tr>
      <tr><td><strong>Eligible</strong></td><td style="text-align:right"><strong>${fmt(calc.child1Eligible)}</strong></td>${hasChild2 ? `<td style="text-align:right"><strong>${fmt(calc.child2Eligible)}</strong></td>` : ''}</tr>
      </tbody></table>
      <table><tbody>
      <tr><td>Total Eligible</td><td style="text-align:right">${fmt(calc.totalEligible)}</td></tr>
      <tr><td>Already Drawn</td><td style="text-align:right">${fmt(alreadyDrawn)}</td></tr>
      <tr class="tot"><td>Net Payable</td><td style="text-align:right">${fmt(calc.netPayable)}</td></tr>
      </tbody></table>
      <div class="decl"><strong>Declaration:</strong> I declare that:<br/>(i) My spouse is not claiming CEA from their employer.<br/>(ii) The child is studying in a recognized institution.<br/>(iii) The information above is true and correct.</div>
      <div class="sig"><div><div class="sig-line">Signature</div><p>${empName || '___'}<br/>Date: ${today}</p></div><div><div class="sig-line">Head of Office</div></div></div>
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
            <SchoolIcon sx={{ color: 'primary.main', fontSize: 32 }} />
            <Typography variant="h5" fontWeight={600} color="primary.main">CEA Reimbursement Form</Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint}>Print Annexure-I</Button>
          </Box>

          <Alert severity="info" sx={{ mb: 3 }}>
            CEA: ₹27,000/year per child (max 2). Hostel Subsidy: ₹81,000/year per child. Disabled children: Double rates.
          </Alert>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Employee Details</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField fullWidth size="small" label="Name" value={empName} onChange={(e) => setEmpName(e.target.value)} />
                  <TextField fullWidth size="small" label="Designation" value={designation} onChange={(e) => setDesignation(e.target.value)} />
                  <TextField fullWidth size="small" label="Employee ID" value={empId} onChange={(e) => setEmpId(e.target.value)} />
                  <TextField fullWidth size="small" label="Office" value={office} onChange={(e) => setOffice(e.target.value)} />
                  <TextField fullWidth size="small" label="Academic Year" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} />
                  <TextField fullWidth size="small" type="number" label="Already Drawn (₹)" value={alreadyDrawn} onChange={(e) => setAlreadyDrawn(Number(e.target.value) || 0)} />
                </Box>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Child 1</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField fullWidth size="small" label="Child Name" value={child1Name} onChange={(e) => setChild1Name(e.target.value)} />
                  <TextField fullWidth size="small" label="Class" value={child1Class} onChange={(e) => setChild1Class(e.target.value)} />
                  <TextField fullWidth size="small" label="School Name" value={child1School} onChange={(e) => setChild1School(e.target.value)} />
                  <TextField fullWidth size="small" type="number" label="Total Fee Paid (₹)" value={child1Fee} onChange={(e) => setChild1Fee(Number(e.target.value) || 0)} />
                  <FormControlLabel control={<Checkbox checked={child1Hostel} onChange={(e) => setChild1Hostel(e.target.checked)} />} label="Hostel" />
                  <FormControlLabel control={<Checkbox checked={child1Disabled} onChange={(e) => setChild1Disabled(e.target.checked)} />} label="Disabled Child" />
                </Box>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2">Ceiling: <strong>{fmt(calc.child1Ceiling)}</strong></Typography>
                <Typography variant="body2" color="primary.main">Eligible: <strong>{fmt(calc.child1Eligible)}</strong></Typography>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <FormControlLabel control={<Checkbox checked={hasChild2} onChange={(e) => setHasChild2(e.target.checked)} />} label={<Typography variant="h6">Child 2</Typography>} />
                {hasChild2 && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                    <TextField fullWidth size="small" label="Child Name" value={child2Name} onChange={(e) => setChild2Name(e.target.value)} />
                    <TextField fullWidth size="small" label="Class" value={child2Class} onChange={(e) => setChild2Class(e.target.value)} />
                    <TextField fullWidth size="small" label="School Name" value={child2School} onChange={(e) => setChild2School(e.target.value)} />
                    <TextField fullWidth size="small" type="number" label="Total Fee Paid (₹)" value={child2Fee} onChange={(e) => setChild2Fee(Number(e.target.value) || 0)} />
                    <FormControlLabel control={<Checkbox checked={child2Hostel} onChange={(e) => setChild2Hostel(e.target.checked)} />} label="Hostel" />
                    <FormControlLabel control={<Checkbox checked={child2Disabled} onChange={(e) => setChild2Disabled(e.target.checked)} />} label="Disabled Child" />
                    <Divider />
                    <Typography variant="body2">Ceiling: <strong>{fmt(calc.child2Ceiling)}</strong></Typography>
                    <Typography variant="body2" color="primary.main">Eligible: <strong>{fmt(calc.child2Eligible)}</strong></Typography>
                  </Box>
                )}
              </Paper>

              <Paper sx={{ p: 3, bgcolor: 'rgba(16,185,129,0.08)' }}>
                <Typography variant="h6" gutterBottom>Summary</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <TableRow><TableCell>Total Eligible</TableCell><TableCell align="right">{fmt(calc.totalEligible)}</TableCell></TableRow>
                      <TableRow><TableCell>Already Drawn</TableCell><TableCell align="right">-{fmt(alreadyDrawn)}</TableCell></TableRow>
                      <TableRow sx={{ bgcolor: 'rgba(16,185,129,0.1)' }}>
                        <TableCell><Typography fontWeight={700}>Net Payable</Typography></TableCell>
                        <TableCell align="right"><Typography fontWeight={700} color="primary.main" fontSize={18}>{fmt(calc.netPayable)}</Typography></TableCell>
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
