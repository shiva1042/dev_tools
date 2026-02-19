import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Grid, Button, IconButton, Divider, Alert, Chip,
  FormControl, InputLabel, Select, MenuItem, Tabs, Tab,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import HomeIcon from '@mui/icons-material/Home';
import EventNoteIcon from '@mui/icons-material/EventNote';
import PrintIcon from '@mui/icons-material/Print';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const darkTheme = createTheme({
  palette: { mode: 'dark', primary: { main: '#10b981' }, background: { default: '#0f172a', paper: '#1e293b' } },
});

interface LeaveEntry { id: number; type: string; fromDate: string; toDate: string; days: number; purpose: string; }

const leaveTypes = [
  { code: 'EL', name: 'Earned Leave', annual: 30, max: 300, encashable: true },
  { code: 'HPL', name: 'Half Pay Leave', annual: 20, max: 9999, encashable: false },
  { code: 'CL', name: 'Casual Leave', annual: 8, max: 8, encashable: false },
  { code: 'RH', name: 'Restricted Holiday', annual: 2, max: 2, encashable: false },
  { code: 'CCL', name: 'Child Care Leave', annual: 0, max: 730, encashable: false },
  { code: 'CML', name: 'Commuted Leave', annual: 0, max: 9999, encashable: false },
];

const fmt = (v: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(v);

export default function App() {
  const [tab, setTab] = useState(0);
  const [empName, setEmpName] = useState('');
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState('');
  const [basicPay, setBasicPay] = useState(56100);
  const [daRate, setDaRate] = useState(53);

  // Leave balances
  const [balances, setBalances] = useState<Record<string, number>>({ EL: 120, HPL: 200, CL: 8, RH: 2, CCL: 0, CML: 0 });
  const [entries, setEntries] = useState<LeaveEntry[]>([]);

  // Application form
  const [leaveType, setLeaveType] = useState('EL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [leaveDays, setLeaveDays] = useState(0);
  const [leavePurpose, setLeavePurpose] = useState('');
  const [leaveAddress, setLeaveAddress] = useState('');
  const [leavePhone, setLeavePhone] = useState('');

  const addEntry = () => {
    if (!fromDate || !toDate || leaveDays <= 0) return;
    setEntries(p => [...p, { id: Date.now(), type: leaveType, fromDate, toDate, days: leaveDays, purpose: leavePurpose }]);
    setBalances(p => ({ ...p, [leaveType]: Math.max(0, p[leaveType] - leaveDays) }));
  };
  const removeEntry = (id: number) => {
    const entry = entries.find(e => e.id === id);
    if (entry) {
      setEntries(p => p.filter(e => e.id !== id));
      setBalances(p => ({ ...p, [entry.type]: p[entry.type] + entry.days }));
    }
  };

  const encashment = useMemo(() => {
    const emoluments = basicPay + Math.round(basicPay * daRate / 100);
    const dailyRate = emoluments / 30;
    const days = Math.min(balances.EL, 300);
    return { dailyRate, days, amount: Math.round(days * dailyRate) };
  }, [basicPay, daRate, balances.EL]);

  const handlePrint = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    const today = new Date().toLocaleDateString('en-IN');
    if (tab === 0) {
      w.document.write(`<html><head><title>Leave Account</title><style>
        body{font-family:Arial,sans-serif;padding:20px 40px;color:#000;font-size:12px}
        .hdr{text-align:center;margin-bottom:15px}.hdr h2{margin:0;font-size:16px}
        table{width:100%;border-collapse:collapse;margin:10px 0}th,td{border:1px solid #333;padding:4px 8px;font-size:11px}th{background:#f0f0f0}
      </style></head><body>
        <div class="hdr"><h2>LEAVE ACCOUNT STATEMENT</h2>${empName ? `<p>${empName} — ${designation}</p>` : ''}</div>
        <h4>LEAVE BALANCE</h4>
        <table><thead><tr><th>Leave Type</th><th>Balance (days)</th></tr></thead><tbody>
        ${Object.entries(balances).map(([k, v]) => `<tr><td>${leaveTypes.find(l => l.code === k)?.name || k}</td><td style="text-align:right">${v}</td></tr>`).join('')}
        </tbody></table>
        <h4>LEAVE AVAILED</h4>
        <table><thead><tr><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Purpose</th></tr></thead><tbody>
        ${entries.map(e => `<tr><td>${e.type}</td><td>${e.fromDate}</td><td>${e.toDate}</td><td>${e.days}</td><td>${e.purpose}</td></tr>`).join('')}
        ${entries.length === 0 ? '<tr><td colspan="5" style="text-align:center">No leave availed</td></tr>' : ''}
        </tbody></table>
      </body></html>`);
    } else {
      w.document.write(`<html><head><title>Leave Application</title><style>
        body{font-family:'Times New Roman',serif;padding:30px 50px;color:#000;font-size:14px;line-height:1.6}
        .hdr{text-align:center;margin-bottom:15px}.hdr h2{margin:0;font-size:18px;text-decoration:underline}
        .row{display:flex;margin-bottom:8px}.row .lbl{width:280px;font-weight:bold}.row .val{flex:1;border-bottom:1px dotted #333;padding-left:8px}
        .sig{display:flex;justify-content:space-between;margin-top:50px}.sig div{text-align:center;width:180px}.sig-line{border-top:1px solid #333;margin-top:35px;padding-top:3px}
      </style></head><body>
        <div class="hdr"><h2>APPLICATION FOR LEAVE</h2></div>
        <div class="row"><div class="lbl">1. Name:</div><div class="val">${empName || '___'}</div></div>
        <div class="row"><div class="lbl">2. Designation:</div><div class="val">${designation || '___'}</div></div>
        <div class="row"><div class="lbl">3. Department:</div><div class="val">${department || '___'}</div></div>
        <div class="row"><div class="lbl">4. Type of Leave:</div><div class="val">${leaveTypes.find(l => l.code === leaveType)?.name || leaveType}</div></div>
        <div class="row"><div class="lbl">5. Period: From</div><div class="val">${fromDate || '___'} to ${toDate || '___'}</div></div>
        <div class="row"><div class="lbl">6. No. of Days:</div><div class="val">${leaveDays}</div></div>
        <div class="row"><div class="lbl">7. Purpose:</div><div class="val">${leavePurpose || '___'}</div></div>
        <div class="row"><div class="lbl">8. Address during Leave:</div><div class="val">${leaveAddress || '___'}</div></div>
        <div class="row"><div class="lbl">9. Phone:</div><div class="val">${leavePhone || '___'}</div></div>
        <div class="row"><div class="lbl">10. Leave Balance (${leaveType}):</div><div class="val">${balances[leaveType]} days</div></div>
        <div class="sig"><div><div class="sig-line">Applicant</div><p>${empName || '___'}<br/>Date: ${today}</p></div><div><div class="sig-line">Recommending Officer</div></div><div><div class="sig-line">Sanctioning Authority</div></div></div>
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
            <EventNoteIcon sx={{ color: 'primary.main', fontSize: 32 }} />
            <Typography variant="h5" fontWeight={600} color="primary.main">Leave Manager</Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint}>Print {tab === 0 ? 'Account' : 'Application'}</Button>
          </Box>

          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
            <Tab label="Leave Balance" />
            <Tab label="Leave Application" />
            <Tab label="Encashment" />
          </Tabs>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Employee</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField fullWidth size="small" label="Name" value={empName} onChange={(e) => setEmpName(e.target.value)} />
                  <TextField fullWidth size="small" label="Designation" value={designation} onChange={(e) => setDesignation(e.target.value)} />
                  <TextField fullWidth size="small" label="Department" value={department} onChange={(e) => setDepartment(e.target.value)} />
                  <TextField fullWidth size="small" type="number" label="Basic Pay" value={basicPay} onChange={(e) => setBasicPay(Number(e.target.value) || 0)} />
                  <TextField fullWidth size="small" type="number" label="DA Rate (%)" value={daRate} onChange={(e) => setDaRate(Number(e.target.value) || 0)} />
                </Box>
              </Paper>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Leave Balances</Typography>
                {leaveTypes.map(lt => (
                  <Box key={lt.code} sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                    <Typography variant="body2" sx={{ flex: 1 }}>{lt.name}</Typography>
                    <TextField size="small" type="number" value={balances[lt.code]} onChange={(e) => setBalances(p => ({ ...p, [lt.code]: Number(e.target.value) || 0 }))} sx={{ width: 80 }} />
                    <Typography variant="caption" color="text.secondary">/{lt.max === 9999 ? '∞' : lt.max}</Typography>
                  </Box>
                ))}
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 8 }}>
              {tab === 0 && (
                <Paper sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Leave History</Typography>
                    <Box sx={{ flexGrow: 1 }} />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <FormControl size="small" sx={{ minWidth: 100 }}>
                      <InputLabel>Type</InputLabel>
                      <Select value={leaveType} label="Type" onChange={(e) => setLeaveType(e.target.value)}>
                        {leaveTypes.map(lt => (<MenuItem key={lt.code} value={lt.code}>{lt.code}</MenuItem>))}
                      </Select>
                    </FormControl>
                    <TextField size="small" type="date" label="From" value={fromDate} onChange={(e) => setFromDate(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} sx={{ width: 140 }} />
                    <TextField size="small" type="date" label="To" value={toDate} onChange={(e) => setToDate(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} sx={{ width: 140 }} />
                    <TextField size="small" type="number" label="Days" value={leaveDays} onChange={(e) => setLeaveDays(Number(e.target.value))} sx={{ width: 70 }} />
                    <TextField size="small" label="Purpose" value={leavePurpose} onChange={(e) => setLeavePurpose(e.target.value)} sx={{ flex: 1, minWidth: 100 }} />
                    <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={addEntry}>Add</Button>
                  </Box>
                  <TableContainer>
                    <Table size="small">
                      <TableHead><TableRow><TableCell>Type</TableCell><TableCell>From</TableCell><TableCell>To</TableCell><TableCell>Days</TableCell><TableCell>Purpose</TableCell><TableCell></TableCell></TableRow></TableHead>
                      <TableBody>
                        {entries.map(e => (
                          <TableRow key={e.id}>
                            <TableCell><Chip label={e.type} size="small" /></TableCell>
                            <TableCell>{e.fromDate}</TableCell><TableCell>{e.toDate}</TableCell>
                            <TableCell>{e.days}</TableCell><TableCell>{e.purpose}</TableCell>
                            <TableCell><IconButton size="small" color="error" onClick={() => removeEntry(e.id)}><DeleteIcon fontSize="small" /></IconButton></TableCell>
                          </TableRow>
                        ))}
                        {entries.length === 0 && <TableRow><TableCell colSpan={6} align="center"><Typography color="text.secondary">No leave entries</Typography></TableCell></TableRow>}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              )}

              {tab === 1 && (
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>Leave Application Form</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Leave Type</InputLabel>
                      <Select value={leaveType} label="Leave Type" onChange={(e) => setLeaveType(e.target.value)}>
                        {leaveTypes.map(lt => (<MenuItem key={lt.code} value={lt.code}>{lt.name} ({lt.code}) — Bal: {balances[lt.code]}</MenuItem>))}
                      </Select>
                    </FormControl>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 4 }}><TextField fullWidth size="small" type="date" label="From" value={fromDate} onChange={(e) => setFromDate(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} /></Grid>
                      <Grid size={{ xs: 4 }}><TextField fullWidth size="small" type="date" label="To" value={toDate} onChange={(e) => setToDate(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} /></Grid>
                      <Grid size={{ xs: 4 }}><TextField fullWidth size="small" type="number" label="No. of Days" value={leaveDays} onChange={(e) => setLeaveDays(Number(e.target.value))} /></Grid>
                    </Grid>
                    <TextField fullWidth size="small" label="Purpose" value={leavePurpose} onChange={(e) => setLeavePurpose(e.target.value)} />
                    <TextField fullWidth size="small" label="Address during Leave" value={leaveAddress} onChange={(e) => setLeaveAddress(e.target.value)} />
                    <TextField fullWidth size="small" label="Phone" value={leavePhone} onChange={(e) => setLeavePhone(e.target.value)} />
                  </Box>
                </Paper>
              )}

              {tab === 2 && (
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>Leave Encashment Calculator</Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        <TableRow><TableCell>EL Balance</TableCell><TableCell align="right">{balances.EL} days</TableCell></TableRow>
                        <TableRow><TableCell>Encashable (max 300)</TableCell><TableCell align="right">{encashment.days} days</TableCell></TableRow>
                        <TableRow><TableCell>Daily Emoluments (Basic+DA)/30</TableCell><TableCell align="right">{fmt(Math.round(encashment.dailyRate))}</TableCell></TableRow>
                        <TableRow sx={{ bgcolor: 'rgba(16,185,129,0.1)' }}>
                          <TableCell><Typography fontWeight={700}>Encashment Amount</Typography></TableCell>
                          <TableCell align="right"><Typography fontWeight={700} color="primary.main" fontSize={20}>{fmt(encashment.amount)}</Typography></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Alert severity="info" sx={{ mt: 2 }}>Maximum 300 days of EL can be encashed at retirement. EL encashment = days × (Basic+DA)/30.</Alert>
                </Paper>
              )}
            </Grid>
          </Grid>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
