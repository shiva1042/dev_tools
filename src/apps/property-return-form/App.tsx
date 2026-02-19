import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Grid, Button, IconButton, Divider,
  FormControl, InputLabel, Select, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import HomeIcon from '@mui/icons-material/Home';
import ApartmentIcon from '@mui/icons-material/Apartment';
import PrintIcon from '@mui/icons-material/Print';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const darkTheme = createTheme({
  palette: { mode: 'dark', primary: { main: '#10b981' }, background: { default: '#0f172a', paper: '#1e293b' } },
});

interface Property {
  id: number; description: string; location: string; area: string; nature: string;
  dateAcquired: string; howAcquired: string; acquiredFrom: string; cost: number;
  marketValue: number; source: string; loanInstitution: string; loanAmount: number;
  annualIncome: number;
}

const fmt = (v: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(v);

export default function App() {
  const [empName, setEmpName] = useState('');
  const [designation, setDesignation] = useState('');
  const [payLevel, setPayLevel] = useState('');
  const [doj, setDoj] = useState('');
  const [cadre, setCadre] = useState('');
  const [asOnDate, setAsOnDate] = useState(new Date().toISOString().split('T')[0]);
  const [properties, setProperties] = useState<Property[]>([]);

  const addProperty = () => setProperties(p => [...p, {
    id: Date.now(), description: '', location: '', area: '', nature: 'Ownership',
    dateAcquired: '', howAcquired: 'Purchase', acquiredFrom: '', cost: 0,
    marketValue: 0, source: 'Personal Savings', loanInstitution: '', loanAmount: 0, annualIncome: 0,
  }]);
  const removeProperty = (id: number) => setProperties(p => p.filter(x => x.id !== id));
  const updateProperty = (id: number, field: string, value: string | number) =>
    setProperties(p => p.map(x => x.id === id ? { ...x, [field]: value } : x));

  const handlePrint = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    const today = new Date().toLocaleDateString('en-IN');
    w.document.write(`<html><head><title>Immovable Property Return</title><style>
      body{font-family:'Times New Roman',serif;padding:25px 40px;color:#000;font-size:13px;line-height:1.5}
      .hdr{text-align:center;margin-bottom:15px}.hdr h2{margin:0;font-size:16px;text-decoration:underline}
      .row{display:flex;margin-bottom:6px}.row .lbl{width:280px;font-weight:bold;font-size:12px}.row .val{flex:1;border-bottom:1px dotted #333;padding-left:6px;font-size:12px}
      table{width:100%;border-collapse:collapse;margin:12px 0}th,td{border:1px solid #333;padding:4px 6px;font-size:10px}th{background:#f0f0f0}
      .prop-hdr{background:#e8e8e8;font-weight:bold;font-size:12px}
      .decl{border:1px solid #333;padding:10px;font-size:11px;margin-top:12px}
      .sig{display:flex;justify-content:space-between;margin-top:40px;font-size:11px}
    </style></head><body>
      <div class="hdr"><h2>ANNUAL RETURN OF IMMOVABLE PROPERTY</h2><p>(Under CCS (Conduct) Rules)</p><p>As on: ${new Date(asOnDate).toLocaleDateString('en-IN')}</p></div>
      <div class="row"><div class="lbl">1. Name:</div><div class="val">${empName || '___'}</div></div>
      <div class="row"><div class="lbl">2. Designation / Grade:</div><div class="val">${designation || '___'} / ${payLevel || '___'}</div></div>
      <div class="row"><div class="lbl">3. Date of Joining:</div><div class="val">${doj ? new Date(doj).toLocaleDateString('en-IN') : '___'}</div></div>
      <div class="row"><div class="lbl">4. Cadre:</div><div class="val">${cadre || '___'}</div></div>
      <h4>DETAILS OF IMMOVABLE PROPERTY</h4>
      ${properties.length > 0 ? properties.map((p, i) => `
        <table><tbody>
        <tr class="prop-hdr"><td colspan="4">Property ${i + 1}: ${p.description || '___'}</td></tr>
        <tr><td width="25%"><strong>Location</strong></td><td>${p.location || '___'}</td><td width="25%"><strong>Area</strong></td><td>${p.area || '___'}</td></tr>
        <tr><td><strong>Nature of Interest</strong></td><td>${p.nature}</td><td><strong>Date Acquired</strong></td><td>${p.dateAcquired || '___'}</td></tr>
        <tr><td><strong>How Acquired</strong></td><td>${p.howAcquired}</td><td><strong>From Whom</strong></td><td>${p.acquiredFrom || '___'}</td></tr>
        <tr><td><strong>Cost at Acquisition</strong></td><td>${fmt(p.cost)}</td><td><strong>Present Market Value</strong></td><td>${fmt(p.marketValue)}</td></tr>
        <tr><td><strong>Source of Funding</strong></td><td>${p.source}</td><td><strong>Annual Income</strong></td><td>${fmt(p.annualIncome)}</td></tr>
        ${p.loanAmount > 0 ? `<tr><td><strong>Loan Institution</strong></td><td>${p.loanInstitution || '___'}</td><td><strong>Loan Amount</strong></td><td>${fmt(p.loanAmount)}</td></tr>` : ''}
        </tbody></table>
      `).join('') : '<p style="text-align:center;font-style:italic">NIL — No immovable property to declare</p>'}
      <div class="decl"><strong>Declaration:</strong><br/>I hereby declare that the information furnished above is true, complete and correct to the best of my knowledge and belief. I understand that in the event of any information being found false or misleading, I shall be liable to disciplinary action.</div>
      <div class="sig"><div>Place: _______________<br/>Date: ${today}</div><div style="text-align:right">Signature: _______________<br/>${empName || '___'}<br/>${designation || '___'}</div></div>
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
            <ApartmentIcon sx={{ color: 'primary.main', fontSize: 32 }} />
            <Typography variant="h5" fontWeight={600} color="primary.main">Immovable Property Return</Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint}>Print IPR Form</Button>
          </Box>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Employee Details</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField fullWidth size="small" label="Name" value={empName} onChange={(e) => setEmpName(e.target.value)} />
                  <TextField fullWidth size="small" label="Designation" value={designation} onChange={(e) => setDesignation(e.target.value)} />
                  <TextField fullWidth size="small" label="Pay Level / Grade" value={payLevel} onChange={(e) => setPayLevel(e.target.value)} />
                  <TextField fullWidth size="small" type="date" label="Date of Joining" value={doj} onChange={(e) => setDoj(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
                  <TextField fullWidth size="small" label="Cadre" value={cadre} onChange={(e) => setCadre(e.target.value)} />
                  <TextField fullWidth size="small" type="date" label="As on Date" value={asOnDate} onChange={(e) => setAsOnDate(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
                </Box>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 8 }}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Properties</Typography>
                  <Box sx={{ flexGrow: 1 }} />
                  <Button startIcon={<AddIcon />} onClick={addProperty}>Add Property</Button>
                </Box>

                {properties.map((p, idx) => (
                  <Paper key={p.id} sx={{ p: 2, mb: 2, bgcolor: 'action.hover' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle1" fontWeight={600}>Property {idx + 1}</Typography>
                      <Box sx={{ flexGrow: 1 }} />
                      <IconButton size="small" color="error" onClick={() => removeProperty(p.id)}><DeleteIcon /></IconButton>
                    </Box>
                    <Grid container spacing={1.5}>
                      <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth size="small" label="Description (House/Flat/Land)" value={p.description} onChange={(e) => updateProperty(p.id, 'description', e.target.value)} /></Grid>
                      <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth size="small" label="Location (Full Address)" value={p.location} onChange={(e) => updateProperty(p.id, 'location', e.target.value)} /></Grid>
                      <Grid size={{ xs: 6, sm: 3 }}><TextField fullWidth size="small" label="Area (sq ft/acres)" value={p.area} onChange={(e) => updateProperty(p.id, 'area', e.target.value)} /></Grid>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <FormControl fullWidth size="small"><InputLabel>Nature</InputLabel>
                          <Select value={p.nature} label="Nature" onChange={(e) => updateProperty(p.id, 'nature', e.target.value)}>
                            {['Ownership', 'Lease', 'Mortgage', 'Joint Ownership'].map(n => (<MenuItem key={n} value={n}>{n}</MenuItem>))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 3 }}><TextField fullWidth size="small" type="date" label="Date Acquired" value={p.dateAcquired} onChange={(e) => updateProperty(p.id, 'dateAcquired', e.target.value)} slotProps={{ inputLabel: { shrink: true } }} /></Grid>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <FormControl fullWidth size="small"><InputLabel>How Acquired</InputLabel>
                          <Select value={p.howAcquired} label="How Acquired" onChange={(e) => updateProperty(p.id, 'howAcquired', e.target.value)}>
                            {['Purchase', 'Gift', 'Inheritance', 'Lease', 'Construction'].map(h => (<MenuItem key={h} value={h}>{h}</MenuItem>))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth size="small" label="Acquired From (Name & Relation)" value={p.acquiredFrom} onChange={(e) => updateProperty(p.id, 'acquiredFrom', e.target.value)} /></Grid>
                      <Grid size={{ xs: 6, sm: 3 }}><TextField fullWidth size="small" type="number" label="Cost (₹)" value={p.cost} onChange={(e) => updateProperty(p.id, 'cost', Number(e.target.value))} /></Grid>
                      <Grid size={{ xs: 6, sm: 3 }}><TextField fullWidth size="small" type="number" label="Market Value (₹)" value={p.marketValue} onChange={(e) => updateProperty(p.id, 'marketValue', Number(e.target.value))} /></Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <FormControl fullWidth size="small"><InputLabel>Source</InputLabel>
                          <Select value={p.source} label="Source" onChange={(e) => updateProperty(p.id, 'source', e.target.value)}>
                            {['Personal Savings', 'Loan', 'Gift', 'Inheritance', 'Mixed'].map(s => (<MenuItem key={s} value={s}>{s}</MenuItem>))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 4 }}><TextField fullWidth size="small" label="Loan Institution" value={p.loanInstitution} onChange={(e) => updateProperty(p.id, 'loanInstitution', e.target.value)} /></Grid>
                      <Grid size={{ xs: 6, sm: 4 }}><TextField fullWidth size="small" type="number" label="Loan Amount (₹)" value={p.loanAmount} onChange={(e) => updateProperty(p.id, 'loanAmount', Number(e.target.value))} /></Grid>
                      <Grid size={{ xs: 6, sm: 4 }}><TextField fullWidth size="small" type="number" label="Annual Income (₹)" value={p.annualIncome} onChange={(e) => updateProperty(p.id, 'annualIncome', Number(e.target.value))} /></Grid>
                    </Grid>
                  </Paper>
                ))}
                {properties.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">No properties added. Click "Add Property" or print with NIL declaration.</Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
