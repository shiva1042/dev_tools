import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Grid, Button, IconButton,
  FormControl, InputLabel, Select, MenuItem, Divider, Alert,
  Table, TableBody, TableCell, TableContainer, TableRow,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import HomeIcon from '@mui/icons-material/Home';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import PrintIcon from '@mui/icons-material/Print';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const darkTheme = createTheme({
  palette: { mode: 'dark', primary: { main: '#10b981' }, background: { default: '#0f172a', paper: '#1e293b' } },
});

interface FamilyMember { id: number; name: string; relationship: string; }

const weightEntitlements: Record<string, number> = {
  '1-2': 1000, '3-5': 1500, '6-8': 3000, '9-11': 5000, '12+': 6000,
};

const getWeightLimit = (level: number) => {
  if (level <= 2) return 1000;
  if (level <= 5) return 1500;
  if (level <= 8) return 3000;
  if (level <= 11) return 5000;
  return 6000;
};

const fmt = (v: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(v);

export default function App() {
  const [empName, setEmpName] = useState('');
  const [designation, setDesignation] = useState('');
  const [payLevel, setPayLevel] = useState(10);
  const [basicPay, setBasicPay] = useState(56100);
  const [daRate, setDaRate] = useState(50);
  const [fromStation, setFromStation] = useState('');
  const [toStation, setToStation] = useState('');
  const [transferType, setTransferType] = useState<'same_city' | 'same_state' | 'diff_state'>('diff_state');
  const [journeyFare, setJourneyFare] = useState(0);
  const [transportCost, setTransportCost] = useState(0);
  const [packingCharges, setPackingCharges] = useState(0);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);

  const addMember = () => setFamilyMembers(p => [...p, { id: Date.now(), name: '', relationship: 'Spouse' }]);
  const removeMember = (id: number) => setFamilyMembers(p => p.filter(m => m.id !== id));

  const calc = useMemo(() => {
    const emoluments = basicPay + basicPay * (daRate / 100);
    const weightLimit = getWeightLimit(payLevel);
    let ctgMultiplier = 1;
    if (transferType === 'same_city') ctgMultiplier = 0.8;
    const compositeTransferGrant = basicPay * ctgMultiplier;
    const grandTotal = journeyFare + compositeTransferGrant + transportCost + packingCharges;
    return { emoluments, weightLimit, compositeTransferGrant, grandTotal };
  }, [basicPay, daRate, payLevel, transferType, journeyFare, transportCost, packingCharges]);

  const handlePrint = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    const today = new Date().toLocaleDateString('en-IN');
    w.document.write(`<html><head><title>Transfer TA Bill - GAR-14B</title><style>
      body{font-family:'Times New Roman',serif;padding:30px 50px;color:#000;font-size:14px;line-height:1.6}
      .hdr{text-align:center;margin-bottom:20px}.hdr h2{margin:0;font-size:18px;text-decoration:underline}
      .row{display:flex;margin-bottom:8px}.row .lbl{width:300px;font-weight:bold}.row .val{flex:1;border-bottom:1px dotted #333;padding-left:8px}
      table{width:100%;border-collapse:collapse;margin:16px 0}th,td{border:1px solid #333;padding:6px 10px;font-size:13px}th{background:#f0f0f0}
      .tot td{font-weight:bold;background:#f9f9f9}
      .sig{display:flex;justify-content:space-between;margin-top:60px}.sig div{text-align:center;width:200px}.sig-line{border-top:1px solid #333;margin-top:40px;padding-top:4px}
    </style></head><body>
      <div class="hdr"><h2>TRANSFER TRAVELLING ALLOWANCE BILL</h2><p>(GAR-14B)</p></div>
      <div class="row"><div class="lbl">1. Name:</div><div class="val">${empName || '___'}</div></div>
      <div class="row"><div class="lbl">2. Designation:</div><div class="val">${designation || '___'}</div></div>
      <div class="row"><div class="lbl">3. Pay Level / Basic Pay:</div><div class="val">Level ${payLevel} / ${fmt(basicPay)}</div></div>
      <div class="row"><div class="lbl">4. Transferred From:</div><div class="val">${fromStation || '___'}</div></div>
      <div class="row"><div class="lbl">5. Transferred To:</div><div class="val">${toStation || '___'}</div></div>
      <div class="row"><div class="lbl">6. Personal Effects Entitled:</div><div class="val">${calc.weightLimit} kg</div></div>
      <div class="row"><div class="lbl">7. Family Members:</div><div class="val">${familyMembers.length > 0 ? familyMembers.map(m => `${m.name} (${m.relationship})`).join(', ') : 'Nil'}</div></div>
      <h4>BILL DETAILS</h4>
      <table><tbody>
      <tr><td style="width:70%">Journey fare (self + family)</td><td style="text-align:right">${fmt(journeyFare)}</td></tr>
      <tr><td>Composite Transfer Grant (${transferType === 'same_city' ? '80%' : '100%'} of Basic)</td><td style="text-align:right">${fmt(calc.compositeTransferGrant)}</td></tr>
      <tr><td>Transportation of personal effects</td><td style="text-align:right">${fmt(transportCost)}</td></tr>
      <tr><td>Packing charges</td><td style="text-align:right">${fmt(packingCharges)}</td></tr>
      <tr class="tot"><td><strong>GRAND TOTAL</strong></td><td style="text-align:right"><strong>${fmt(calc.grandTotal)}</strong></td></tr>
      </tbody></table>
      <div style="margin-top:20px;border:1px solid #333;padding:12px;font-size:12px"><strong>Declaration:</strong> I declare that the claims are correct and I have actually incurred the expenditure.</div>
      <div class="sig"><div><div class="sig-line">Signature of Claimant</div></div><div><div class="sig-line">Controlling Officer</div><p>Date: ${today}</p></div></div>
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
            <SwapHorizIcon sx={{ color: 'primary.main', fontSize: 32 }} />
            <Typography variant="h5" fontWeight={600} color="primary.main">Transfer TA Calculator</Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint}>Print GAR-14B</Button>
          </Box>

          <Alert severity="info" sx={{ mb: 3 }}>Transfer TA includes: Journey fare + Composite Transfer Grant + Transportation of personal effects + Packing charges.</Alert>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Employee Details</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField fullWidth size="small" label="Name" value={empName} onChange={(e) => setEmpName(e.target.value)} />
                  <TextField fullWidth size="small" label="Designation" value={designation} onChange={(e) => setDesignation(e.target.value)} />
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
                  <TextField fullWidth size="small" type="number" label="DA Rate (%)" value={daRate} onChange={(e) => setDaRate(Number(e.target.value) || 0)} />
                </Box>
              </Paper>

              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Transfer Details</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField fullWidth size="small" label="From Station" value={fromStation} onChange={(e) => setFromStation(e.target.value)} />
                  <TextField fullWidth size="small" label="To Station" value={toStation} onChange={(e) => setToStation(e.target.value)} />
                  <FormControl fullWidth size="small">
                    <InputLabel>Transfer Type</InputLabel>
                    <Select value={transferType} label="Transfer Type" onChange={(e) => setTransferType(e.target.value as typeof transferType)}>
                      <MenuItem value="same_city">Same City (CTG: 80% of Basic)</MenuItem>
                      <MenuItem value="same_state">Same State (CTG: 100% of Basic)</MenuItem>
                      <MenuItem value="diff_state">Different State (CTG: 100% of Basic)</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1">Family Members</Typography>
                  <Box sx={{ flexGrow: 1 }} />
                  <Button size="small" startIcon={<AddIcon />} onClick={addMember}>Add</Button>
                </Box>
                {familyMembers.map(m => (
                  <Box key={m.id} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <TextField size="small" label="Name" value={m.name} onChange={(e) => setFamilyMembers(p => p.map(x => x.id === m.id ? { ...x, name: e.target.value } : x))} sx={{ flex: 2 }} />
                    <FormControl size="small" sx={{ flex: 1 }}>
                      <InputLabel>Relation</InputLabel>
                      <Select value={m.relationship} label="Relation" onChange={(e) => setFamilyMembers(p => p.map(x => x.id === m.id ? { ...x, relationship: e.target.value } : x))}>
                        {['Spouse', 'Son', 'Daughter', 'Father', 'Mother'].map(r => (<MenuItem key={r} value={r}>{r}</MenuItem>))}
                      </Select>
                    </FormControl>
                    <IconButton size="small" color="error" onClick={() => removeMember(m.id)}><DeleteIcon fontSize="small" /></IconButton>
                  </Box>
                ))}
                <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">Personal Effects Limit: <strong>{calc.weightLimit} kg</strong></Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Bill Amounts</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField fullWidth size="small" type="number" label="Journey Fare - Self + Family (₹)" value={journeyFare} onChange={(e) => setJourneyFare(Number(e.target.value) || 0)} />
                  <TextField fullWidth size="small" type="number" label="Transportation of Personal Effects (₹)" value={transportCost} onChange={(e) => setTransportCost(Number(e.target.value) || 0)} />
                  <TextField fullWidth size="small" type="number" label="Packing Charges (₹)" value={packingCharges} onChange={(e) => setPackingCharges(Number(e.target.value) || 0)} />
                </Box>
              </Paper>

              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Bill Summary</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <TableRow><TableCell>Journey Fare</TableCell><TableCell align="right">{fmt(journeyFare)}</TableCell></TableRow>
                      <TableRow><TableCell>Composite Transfer Grant ({transferType === 'same_city' ? '80%' : '100%'} of ₹{basicPay.toLocaleString('en-IN')})</TableCell><TableCell align="right">{fmt(calc.compositeTransferGrant)}</TableCell></TableRow>
                      <TableRow><TableCell>Transportation of Effects</TableCell><TableCell align="right">{fmt(transportCost)}</TableCell></TableRow>
                      <TableRow><TableCell>Packing Charges</TableCell><TableCell align="right">{fmt(packingCharges)}</TableCell></TableRow>
                      <TableRow sx={{ bgcolor: 'action.hover' }}>
                        <TableCell><Typography fontWeight={700}>GRAND TOTAL</Typography></TableCell>
                        <TableCell align="right"><Typography fontWeight={700} color="primary.main" fontSize={18}>{fmt(calc.grandTotal)}</Typography></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>

                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom>Weight Entitlements Reference</Typography>
                <Table size="small">
                  <TableBody>
                    {Object.entries(weightEntitlements).map(([range, kg]) => (
                      <TableRow key={range}><TableCell>Level {range}</TableCell><TableCell align="right">{kg} kg</TableCell></TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
