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
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import PrintIcon from '@mui/icons-material/Print';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const darkTheme = createTheme({
  palette: { mode: 'dark', primary: { main: '#10b981' }, background: { default: '#0f172a', paper: '#1e293b' } },
});

interface JourneyLeg {
  id: number; from: string; to: string; date: string; mode: string; travelClass: string; fare: number;
}

const daRates: Record<string, Record<string, { hotel: number; food: number }>> = {
  X: { high: { hotel: 7500, food: 900 }, mid: { hotel: 4500, food: 500 }, low: { hotel: 1000, food: 300 } },
  Y: { high: { hotel: 4500, food: 800 }, mid: { hotel: 2250, food: 400 }, low: { hotel: 750, food: 250 } },
  Z: { high: { hotel: 1200, food: 600 }, mid: { hotel: 750, food: 300 }, low: { hotel: 450, food: 200 } },
};

const getLevelCategory = (level: number) => {
  if (level >= 12) return 'high';
  if (level >= 6) return 'mid';
  return 'low';
};

const fmt = (v: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(v);

export default function App() {
  const [empName, setEmpName] = useState('');
  const [designation, setDesignation] = useState('');
  const [payLevel, setPayLevel] = useState(10);
  const [basicPay, setBasicPay] = useState(56100);
  const [purpose, setPurpose] = useState('');
  const [cityClass, setCityClass] = useState('X');
  const [daDays, setDaDays] = useState(3);
  const [localConveyance, setLocalConveyance] = useState(0);
  const [mileageKm, setMileageKm] = useState(0);
  const [vehicleType, setVehicleType] = useState('car');
  const [journeys, setJourneys] = useState<JourneyLeg[]>([]);

  const addJourney = () =>
    setJourneys((p) => [...p, { id: Date.now(), from: '', to: '', date: '', mode: 'Train', travelClass: '2AC', fare: 0 }]);
  const removeJourney = (id: number) => setJourneys((p) => p.filter((j) => j.id !== id));
  const updateJourney = (id: number, field: string, value: string | number) =>
    setJourneys((p) => p.map((j) => (j.id === id ? { ...j, [field]: value } : j)));

  const calc = useMemo(() => {
    const cat = getLevelCategory(payLevel);
    const rates = daRates[cityClass]?.[cat] || { hotel: 0, food: 0 };
    const totalFare = journeys.reduce((s, j) => s + j.fare, 0);
    const dailyDA = rates.hotel + rates.food;
    const totalDA = dailyDA * daDays;
    const mileageRate = vehicleType === 'car' ? 16 : 8;
    const mileageAmount = mileageKm * mileageRate;
    const grandTotal = totalFare + totalDA + localConveyance + mileageAmount;
    return { totalFare, dailyDA, totalDA, mileageAmount, mileageRate, grandTotal, hotelRate: rates.hotel, foodRate: rates.food };
  }, [journeys, payLevel, cityClass, daDays, localConveyance, mileageKm, vehicleType]);

  const handlePrint = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    const today = new Date().toLocaleDateString('en-IN');
    w.document.write(`<html><head><title>TA/DA Bill - GAR-14A</title><style>
      body{font-family:'Times New Roman',serif;padding:30px 50px;color:#000;font-size:14px;line-height:1.6}
      .hdr{text-align:center;margin-bottom:20px}.hdr h2{margin:0;font-size:18px;text-decoration:underline}
      .row{display:flex;margin-bottom:8px}.row .lbl{width:280px;font-weight:bold}.row .val{flex:1;border-bottom:1px dotted #333;padding-left:8px}
      table{width:100%;border-collapse:collapse;margin:16px 0}th,td{border:1px solid #333;padding:6px 10px;font-size:13px}th{background:#f0f0f0}
      .tot td{font-weight:bold;background:#f9f9f9}
      .sig{display:flex;justify-content:space-between;margin-top:60px}.sig div{text-align:center;width:200px}.sig-line{border-top:1px solid #333;margin-top:40px;padding-top:4px}
    </style></head><body>
      <div class="hdr"><h2>TRAVELLING ALLOWANCE BILL</h2><p>(GAR-14A)</p></div>
      <div class="row"><div class="lbl">1. Name:</div><div class="val">${empName || '___'}</div></div>
      <div class="row"><div class="lbl">2. Designation:</div><div class="val">${designation || '___'}</div></div>
      <div class="row"><div class="lbl">3. Pay Level / Basic Pay:</div><div class="val">Level ${payLevel} / ${fmt(basicPay)}</div></div>
      <div class="row"><div class="lbl">4. Purpose of Tour:</div><div class="val">${purpose || '___'}</div></div>
      <h4>JOURNEY DETAILS</h4>
      <table><thead><tr><th>S.No.</th><th>Date</th><th>From</th><th>To</th><th>Mode</th><th>Class</th><th>Fare</th></tr></thead><tbody>
      ${journeys.map((j, i) => `<tr><td>${i + 1}</td><td>${j.date || '-'}</td><td>${j.from || '-'}</td><td>${j.to || '-'}</td><td>${j.mode}</td><td>${j.travelClass}</td><td style="text-align:right">${fmt(j.fare)}</td></tr>`).join('')}
      <tr class="tot"><td colspan="6" style="text-align:right">Total Fare:</td><td style="text-align:right">${fmt(calc.totalFare)}</td></tr></tbody></table>
      <h4>DAILY ALLOWANCE</h4>
      <table><thead><tr><th>City Class</th><th>Days</th><th>Hotel/Day</th><th>Food/Day</th><th>Total DA</th></tr></thead><tbody>
      <tr><td>${cityClass}</td><td>${daDays}</td><td>${fmt(calc.hotelRate)}</td><td>${fmt(calc.foodRate)}</td><td style="text-align:right">${fmt(calc.totalDA)}</td></tr></tbody></table>
      <table><tbody>
      <tr><td style="width:70%">Local Conveyance:</td><td style="text-align:right">${fmt(localConveyance)}</td></tr>
      <tr><td>Mileage (${mileageKm} km × ₹${calc.mileageRate}/km):</td><td style="text-align:right">${fmt(calc.mileageAmount)}</td></tr>
      <tr class="tot"><td><strong>GRAND TOTAL:</strong></td><td style="text-align:right"><strong>${fmt(calc.grandTotal)}</strong></td></tr></tbody></table>
      <div class="sig"><div><div class="sig-line">Signature of Claimant</div></div><div><div class="sig-line">Controlling Officer</div><p>Date: ${today}</p></div></div>
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
            <DirectionsBusIcon sx={{ color: 'primary.main', fontSize: 32 }} />
            <Typography variant="h5" fontWeight={600} color="primary.main">Tour TA/DA Calculator</Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint}>Print GAR-14A</Button>
          </Box>

          <Alert severity="info" sx={{ mb: 3 }}>
            Tour TA/DA rates as per 7th CPC. City classification: X (Delhi, Mumbai, etc.), Y (State capitals), Z (Others).
          </Alert>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 5 }}>
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
                          {Array.from({ length: 18 }, (_, i) => i + 1).map((l) => (<MenuItem key={l} value={l}>Level {l}</MenuItem>))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <TextField fullWidth size="small" type="number" label="Basic Pay (₹)" value={basicPay} onChange={(e) => setBasicPay(Number(e.target.value) || 0)} />
                    </Grid>
                  </Grid>
                  <TextField fullWidth size="small" label="Purpose of Tour" value={purpose} onChange={(e) => setPurpose(e.target.value)} />
                </Box>
              </Paper>

              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Daily Allowance</Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>City Class</InputLabel>
                      <Select value={cityClass} label="City Class" onChange={(e) => setCityClass(e.target.value)}>
                        <MenuItem value="X">X (Metro)</MenuItem>
                        <MenuItem value="Y">Y (State Capital)</MenuItem>
                        <MenuItem value="Z">Z (Others)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField fullWidth size="small" type="number" label="No. of Days" value={daDays} onChange={(e) => setDaDays(Number(e.target.value) || 0)} />
                  </Grid>
                </Grid>
                <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                  <Typography variant="body2">Hotel: <strong>{fmt(calc.hotelRate)}/day</strong> | Food: <strong>{fmt(calc.foodRate)}/day</strong></Typography>
                  <Typography variant="body2">Total DA: <strong>{fmt(calc.totalDA)}</strong></Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <TextField fullWidth size="small" type="number" label="Local Conveyance (₹)" value={localConveyance} onChange={(e) => setLocalConveyance(Number(e.target.value) || 0)} sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid size={{ xs: 4 }}>
                    <TextField fullWidth size="small" type="number" label="Mileage (km)" value={mileageKm} onChange={(e) => setMileageKm(Number(e.target.value) || 0)} />
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Vehicle</InputLabel>
                      <Select value={vehicleType} label="Vehicle" onChange={(e) => setVehicleType(e.target.value)}>
                        <MenuItem value="car">Car (₹16/km)</MenuItem>
                        <MenuItem value="scooter">Scooter (₹8/km)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <TextField fullWidth size="small" label="Amount" value={fmt(calc.mileageAmount)} slotProps={{ input: { readOnly: true } }} />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 7 }}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Journey Legs</Typography>
                  <Box sx={{ flexGrow: 1 }} />
                  <Button size="small" startIcon={<AddIcon />} onClick={addJourney}>Add Leg</Button>
                </Box>
                {journeys.map((j) => (
                  <Box key={j.id} sx={{ display: 'flex', gap: 1, mb: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
                    <TextField size="small" type="date" label="Date" value={j.date} onChange={(e) => updateJourney(j.id, 'date', e.target.value)} slotProps={{ inputLabel: { shrink: true } }} sx={{ width: 140 }} />
                    <TextField size="small" label="From" value={j.from} onChange={(e) => updateJourney(j.id, 'from', e.target.value)} sx={{ flex: 1, minWidth: 80 }} />
                    <TextField size="small" label="To" value={j.to} onChange={(e) => updateJourney(j.id, 'to', e.target.value)} sx={{ flex: 1, minWidth: 80 }} />
                    <FormControl size="small" sx={{ minWidth: 80 }}>
                      <InputLabel>Mode</InputLabel>
                      <Select value={j.mode} label="Mode" onChange={(e) => updateJourney(j.id, 'mode', e.target.value)}>
                        {['Train', 'Air', 'Bus', 'Own Car', 'Taxi'].map((m) => (<MenuItem key={m} value={m}>{m}</MenuItem>))}
                      </Select>
                    </FormControl>
                    <TextField size="small" type="number" label="Fare" value={j.fare} onChange={(e) => updateJourney(j.id, 'fare', Number(e.target.value))} sx={{ width: 90 }} />
                    <IconButton size="small" color="error" onClick={() => removeJourney(j.id)}><DeleteIcon fontSize="small" /></IconButton>
                  </Box>
                ))}
                {journeys.length === 0 && <Typography variant="body2" color="text.secondary">Click "Add Leg" to add journey details.</Typography>}
              </Paper>

              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Bill Summary</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <TableRow><TableCell>Total Journey Fare</TableCell><TableCell align="right">{fmt(calc.totalFare)}</TableCell></TableRow>
                      <TableRow><TableCell>Daily Allowance ({daDays} days × {fmt(calc.dailyDA)}/day)</TableCell><TableCell align="right">{fmt(calc.totalDA)}</TableCell></TableRow>
                      <TableRow><TableCell>Local Conveyance</TableCell><TableCell align="right">{fmt(localConveyance)}</TableCell></TableRow>
                      <TableRow><TableCell>Mileage ({mileageKm} km × ₹{calc.mileageRate}/km)</TableCell><TableCell align="right">{fmt(calc.mileageAmount)}</TableCell></TableRow>
                      <TableRow sx={{ bgcolor: 'action.hover' }}>
                        <TableCell><Typography fontWeight={700}>GRAND TOTAL</Typography></TableCell>
                        <TableCell align="right"><Typography fontWeight={700} color="primary.main" fontSize={18}>{fmt(calc.grandTotal)}</Typography></TableCell>
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
