import { useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Grid, Button, IconButton, Divider, Alert, Chip, Tooltip,
  FormControl, InputLabel, Select, MenuItem, Checkbox, FormControlLabel, Tabs, Tab,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import HomeIcon from '@mui/icons-material/Home';
import FlightIcon from '@mui/icons-material/Flight';
import PrintIcon from '@mui/icons-material/Print';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import StrikethroughSIcon from '@mui/icons-material/StrikethroughS';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import RefreshIcon from '@mui/icons-material/Refresh';
import FormatSizeIcon from '@mui/icons-material/FormatSize';

const darkTheme = createTheme({
  palette: { mode: 'dark', primary: { main: '#10b981' }, background: { default: '#0f172a', paper: '#1e293b' } },
});

const fmt = (v: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(v);

// ── Interfaces ──

interface FamilyMember {
  id: number; name: string; age: string; relationship: string;
}

interface JourneyLeg {
  id: number;
  depDate: string; depTime: string; depFrom: string;
  arrDate: string; arrTime: string; arrTo: string;
  distanceKm: number; modeClass: string; noOfFares: number; farePaid: number;
  remarks: string;
}

interface HigherClassJourney {
  id: number;
  from: string; to: string; modeOfConveyance: string;
  classEntitled: string; classActual: string; noOfFares: number; fareEntitled: number;
}

interface RoadJourney {
  id: number;
  from: string; to: string; classEntitled: string; railwayFare: number;
}

const leaveTypes = ['E.L.', 'C.L.', 'E.O.L.', 'R.H.', 'E.L.+C.L.', 'E.L.+R.H.'];
const relationships = ['Self', 'Spouse', 'Son', 'Daughter', 'Father', 'Mother', 'Dependent'];
const modeClasses = [
  'Air Economy', 'AC First Class', 'AC 2-Tier', 'AC 3-Tier', 'Sleeper',
  'First Class', 'AC Chair Car', 'Bus (Govt)', 'Bus (Private)', 'Own Car', 'Taxi',
];

export default function App() {
  // ── Heading (editable) ──
  const [formTitle, setFormTitle] = useState('Leave Travel Concession Bill');
  const [formNumber, setFormNumber] = useState('No. 04');
  const [formNote, setFormNote] = useState('Note: This bill should be prepared in duplicate, one for payment and the other as office copy.');

  // ── Part A: Fields 1-5 ──
  const [subBillNo, setSubBillNo] = useState('');
  const [blockYearFrom, setBlockYearFrom] = useState('2022');
  const [blockYearTo, setBlockYearTo] = useState('2025');
  const [officerName, setOfficerName] = useState('');
  const [designation, setDesignation] = useState('');
  const [pay, setPay] = useState(0);
  const [headQuarter, setHeadQuarter] = useState('');
  const [leaveType, setLeaveType] = useState('E.L.');
  const [leaveFrom, setLeaveFrom] = useState('');
  const [leaveTo, setLeaveTo] = useState('');

  // ── Field 6: Family Members ──
  const [family, setFamily] = useState<FamilyMember[]>([]);

  // ── Field 7: Journey Details ──
  const [journeys, setJourneys] = useState<JourneyLeg[]>([]);

  // ── Field 8: Advance ──
  const [advanceAmount, setAdvanceAmount] = useState(0);

  // ── Field 9: Higher Class Journeys ──
  const [higherClassJourneys, setHigherClassJourneys] = useState<HigherClassJourney[]>([]);
  const [higherClassSanction, setHigherClassSanction] = useState('');

  // ── Field 10: Road Journeys ──
  const [roadJourneys, setRoadJourneys] = useState<RoadJourney[]>([]);

  // ── Certification ──
  const [spouseNotGovt, setSpouseNotGovt] = useState(true);
  const [spouseGovtNotClaimed, setSpouseGovtNotClaimed] = useState(false);

  // ── Appendix I ──
  const [homeTown, setHomeTown] = useState('');
  const [otherThanHomeTown, setOtherThanHomeTown] = useState('');
  const [journeyDestination, setJourneyDestination] = useState<'home' | 'other'>('home');

  // ── Preview & Edit mode ──
  const [activeTab, setActiveTab] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // ── Computed ──
  const totalFare = useMemo(() => journeys.reduce((s, j) => s + j.farePaid, 0), [journeys]);
  const netAmount = useMemo(() => Math.max(0, totalFare - advanceAmount), [totalFare, advanceAmount]);

  // ── Family CRUD ──
  const addFamily = () => setFamily(f => [...f, { id: Date.now(), name: '', age: '', relationship: 'Spouse' }]);
  const removeFamily = (id: number) => setFamily(f => f.filter(x => x.id !== id));
  const updateFamily = (id: number, k: string, v: string) =>
    setFamily(f => f.map(x => x.id === id ? { ...x, [k]: v } : x));

  // ── Journey CRUD ──
  const addJourney = () => setJourneys(j => [...j, {
    id: Date.now(), depDate: '', depTime: '', depFrom: headQuarter,
    arrDate: '', arrTime: '', arrTo: '', distanceKm: 0, modeClass: 'AC 3-Tier',
    noOfFares: 1, farePaid: 0, remarks: '',
  }]);
  const removeJourney = (id: number) => setJourneys(j => j.filter(x => x.id !== id));
  const updateJourney = (id: number, k: string, v: string | number) =>
    setJourneys(j => j.map(x => x.id === id ? { ...x, [k]: v } : x));

  // ── Higher Class CRUD ──
  const addHigherClass = () => setHigherClassJourneys(h => [...h, {
    id: Date.now(), from: '', to: '', modeOfConveyance: '', classEntitled: '',
    classActual: '', noOfFares: 1, fareEntitled: 0,
  }]);
  const removeHigherClass = (id: number) => setHigherClassJourneys(h => h.filter(x => x.id !== id));
  const updateHigherClass = (id: number, k: string, v: string | number) =>
    setHigherClassJourneys(h => h.map(x => x.id === id ? { ...x, [k]: v } : x));

  // ── Road Journey CRUD ──
  const addRoadJourney = () => setRoadJourneys(r => [...r, { id: Date.now(), from: '', to: '', classEntitled: '', railwayFare: 0 }]);
  const removeRoadJourney = (id: number) => setRoadJourneys(r => r.filter(x => x.id !== id));
  const updateRoadJourney = (id: number, k: string, v: string | number) =>
    setRoadJourneys(r => r.map(x => x.id === id ? { ...x, [k]: v } : x));

  // ── Form styles (reusable) ──
  const getFormStyles = () => `
    @page{margin:15mm 20mm}
    body{font-family:'Times New Roman',serif;padding:10px 30px;color:#000;font-size:12px;line-height:1.4;outline:none;cursor:text}
    h1{text-align:center;font-size:20px;margin:0 0 2px 0;font-weight:bold}
    .sub{text-align:center;font-size:11px;margin-bottom:3px}
    .note{text-align:center;font-size:10px;font-style:italic;margin-bottom:8px}
    .part{text-align:center;font-weight:bold;font-size:14px;margin:12px 0 4px 0}
    .part-sub{text-align:center;font-size:11px;margin-bottom:10px}
    .heading-box{border:2px solid #000;padding:10px 16px;margin-bottom:10px}
    .top-row{display:flex;justify-content:space-between;margin-bottom:4px;font-size:11px}
    .field{display:flex;margin-bottom:4px;font-size:12px}
    .field .num{width:28px;font-weight:bold}
    .field .lbl{width:320px;font-weight:bold}
    .field .val{flex:1;border-bottom:1px dotted #333;min-height:16px;padding-left:4px}
    .field .val2{border-bottom:1px dotted #333;padding:0 6px;min-width:100px}
    table{width:100%;border-collapse:collapse;margin:6px 0}
    th,td{border:1px solid #000;padding:3px 5px;font-size:10px;vertical-align:top}
    th{background:#f5f5f5;font-weight:bold;text-align:center}
    .cert{margin-top:12px;font-size:11px;line-height:1.5}
    .cert p{margin:3px 0}
    .sig-right{text-align:right;margin-top:30px;font-size:11px}
    .sig-block{display:flex;justify-content:space-between;margin-top:35px;font-size:11px}
    .pb{page-break-before:always}
    .section-title{font-weight:bold;margin:8px 0 4px 0;font-size:12px}
  `;

  // ── Form body HTML (reusable) ──
  const getFormBody = () => {
    const today = new Date().toLocaleDateString('en-IN');
    const fmtD = (d: string) => d ? new Date(d).toLocaleDateString('en-IN') : '___';

    const familyRows = family.length > 0
      ? family.map((m, i) => `<tr><td>${i + 1}</td><td>${m.name || '___'}</td><td>${m.age || '___'}</td><td>${m.relationship}</td></tr>`).join('')
      : '<tr><td colspan="4" style="text-align:center;font-style:italic;padding:20px">—</td></tr>';

    const journeyRows = journeys.length > 0
      ? journeys.map(j => `<tr>
          <td>${fmtD(j.depDate)}${j.depTime ? '<br/>' + j.depTime : ''}</td>
          <td>${j.depFrom || '___'}</td>
          <td>${fmtD(j.arrDate)}${j.arrTime ? '<br/>' + j.arrTime : ''}</td>
          <td>${j.arrTo || '___'}</td>
          <td style="text-align:right">${j.distanceKm || '___'}</td>
          <td>${j.modeClass}</td>
          <td style="text-align:center">${j.noOfFares}</td>
          <td style="text-align:right">${fmt(j.farePaid)}</td>
        </tr>`).join('')
      : '<tr><td colspan="8" style="text-align:center;padding:30px">—</td></tr>';

    const remarksText = journeys.filter(j => j.remarks).map(j => j.remarks).join('; ');

    const higherClassRows = higherClassJourneys.length > 0
      ? higherClassJourneys.map(h => `<tr>
          <td>${h.from || '___'}</td><td>${h.to || '___'}</td>
          <td>${h.modeOfConveyance || '___'}</td><td>${h.classEntitled || '___'}</td>
          <td>${h.classActual || '___'}</td><td style="text-align:center">${h.noOfFares}</td>
          <td style="text-align:right">${fmt(h.fareEntitled)}</td>
        </tr>`).join('')
      : '';

    const roadRows = roadJourneys.length > 0
      ? roadJourneys.map(r => `<tr>
          <td>${r.from || '___'}</td><td>${r.to || '___'}</td>
          <td>${r.classEntitled || '___'}</td><td style="text-align:right">${fmt(r.railwayFare)}</td>
        </tr>`).join('')
      : '';

    const spouseDecl = spouseNotGovt
      ? 'my wife/husband is <u>not</u> employed in Government Service'
      : 'my wife/husband is employed in Government Service and the concession has not been availed of by her/him separately for herself/himself or for any of the family members';

    return `
      <div class="heading-box">
        <div class="top-row"><span>Sub Bill No. ${subBillNo || '____________'}</span><span>${formNumber || 'No. 04'}</span></div>
        <h1>${formTitle || 'Leave Travel Concession Bill'}</h1>
        <div class="sub"><strong>For the Block Year ${blockYearFrom || '____'} to ${blockYearTo || '____'}</strong></div>
        <div class="note">${formNote || ''}</div>
      </div>

      <div class="part">PART &ndash; A</div>
      <div class="part-sub">[To be filled by the Government Servant]</div>

      <div class="field"><div class="num">1.</div><div class="lbl">Name of Officer / Official</div><div class="val">${officerName || ''}</div></div>
      <div class="field"><div class="num">2.</div><div class="lbl">Designation</div><div class="val">${designation || ''}</div></div>
      <div class="field"><div class="num">3.</div><div class="lbl">Pay</div><div class="val">Rs. ${pay ? new Intl.NumberFormat('en-IN').format(pay) : ''}</div></div>
      <div class="field"><div class="num">4.</div><div class="lbl">Head Quarter</div><div class="val">${headQuarter || ''}</div></div>
      <div class="field"><div class="num">5.</div><div class="lbl">Nature and period of leave sanctioned</div><div class="val">${leaveType} from: ${fmtD(leaveFrom)} to ${fmtD(leaveTo)}</div></div>

      <div class="section-title">6. Particulars of members of family in respect of whom the LTC has been claimed.</div>
      <table>
        <thead><tr><th width="40">Sr. No.</th><th>Name</th><th width="50">Age</th><th>Relationship with the Govt. Servant</th></tr></thead>
        <tbody>${familyRows}</tbody>
      </table>

      <div class="section-title">7. Details of Journey(s) performed by Government Servant and the members of his/her family:</div>
      <table>
        <thead><tr>
          <th>Departure<br/>Date & Time</th><th>From</th>
          <th>Arrival<br/>Date & Time</th><th>To</th>
          <th>Distance<br/>in Kms.</th><th>Mode of travel<br/>& Class of<br/>Accommodation</th>
          <th>No. of<br/>Fares</th><th>Fare Paid<br/>Rs.</th>
        </tr></thead>
        <tbody>${journeyRows}</tbody>
      </table>
      ${remarksText ? `<p style="font-size:11px"><strong>Remarks / Ticket Nos:</strong> ${remarksText}</p>` : '<p style="font-size:11px"><strong>Remarks / Ticket Nos:</strong></p>'}

      <div class="field" style="margin-top:10px"><div class="num">8.</div><div class="lbl">Amount of Advance, if any drawn...</div><div class="val" style="text-align:right">Rs. ${advanceAmount ? new Intl.NumberFormat('en-IN').format(advanceAmount) : ''}</div></div>

      ${higherClassJourneys.length > 0 ? `
        <div class="section-title">9. Particulars of Journey(s) for which higher class of accommodation than the one which the Government Servant is entitled, was used${higherClassSanction ? ' (Sanction: ' + higherClassSanction + ')' : ''}.</div>
        <table>
          <thead><tr><th colspan="2">Place</th><th>Mode of<br/>Conveyance</th><th>Class to which<br/>entitled</th><th>Class by which<br/>actually travelled</th><th>No. of<br/>fares</th><th>Fare of the<br/>entitled class</th></tr>
          <tr><th>From</th><th>To</th><th></th><th></th><th></th><th></th><th></th></tr></thead>
          <tbody>${higherClassRows}</tbody>
        </table>
      ` : '<div class="section-title">9. Particulars of Journey(s) for higher class: <em>NIL</em></div>'}

      ${roadJourneys.length > 0 ? `
        <div class="section-title">10. Particulars of Journey(s) performed by Road between places connected by Rail.</div>
        <table>
          <thead><tr><th colspan="2">Name of Place</th><th>Class to which<br/>entitled</th><th>Railway Fare</th></tr>
          <tr><th>From</th><th>To</th><th></th><th></th></tr></thead>
          <tbody>${roadRows}</tbody>
        </table>
      ` : '<div class="section-title">10. Particulars of Journey(s) by Road between rail-connected places: <em>NIL</em></div>'}

      <div class="cert">
        <p><strong>Certified that the:</strong></p>
        <p>1. Information as given above is true to the best of my knowledge and belief, and</p>
        <p>2. That ${spouseDecl} for the concession block of ${blockYearFrom}-${blockYearTo} years.</p>
      </div>
      <div class="sig-right">Signature of the Government Servant<br/><br/>Date: ${today}</div>

      <!-- PART B -->
      <div class="pb"></div>
      <div class="part">PART &ndash; B</div>
      <div class="part-sub">[To be filled in the Bill Section]</div>
      <p>The net entitlement on account of Leave Travel Concession works out to Rs. ________________ as detailed below:</p>
      <table>
        <tbody>
          <tr><td width="70%"><strong>(a)</strong> Railway / Air / Bus / Steamer Fares</td><td style="min-width:120px"></td></tr>
          <tr><td><strong>(b)</strong> Less: Amount of Advance drawn vide<br/>&nbsp;&nbsp;&nbsp;&nbsp;Voucher No. ____________ &nbsp;&nbsp; Dated ____________</td><td></td></tr>
          <tr><td><strong>(c)</strong> The Expenditure is debitable to ________________ Account.</td><td></td></tr>
          <tr><td style="text-align:right"><strong>Net Amount Rs.</strong></td><td></td></tr>
        </tbody>
      </table>
      <p style="margin-top:20px">Initials of the Bill Clerk _______________</p>
      <div class="sig-right">Signature of Drawing &amp; Disbursing Officer</div>
      <div class="sig-right" style="margin-top:40px">Signature of Controlling Officer</div>
      <p style="margin-top:30px">Certified that necessary entries have been made in the Service Book of Shri/Smt./Miss. ________________________.</p>
      <div class="sig-right">Signature of the Officer authorised to<br/>attest entries in the Service Book.</div>

      <!-- APPENDIX I -->
      <div class="pb"></div>
      <div class="part">APPENDIX &ndash; I</div>
      <div class="part-sub">[Certificate to be given by the Controlling Officer]</div>
      <div class="cert">
        <p><strong>Certified that:</strong></p>
        <p>1. Shri/Smt./Kum. <u>${officerName || '_______________'}</u> has rendered continuous service for one year or more on the date of commencing of outward journey.</p>
        <p>2. Necessary entries as required under para (52) of the scheme have been made in the Service Book of Shri/Smt./Kum. <u>${officerName || '_______________'}</u>.</p>
        <p>3. Para 1(6) of MMA O.M. No. 43/1/55.Est.(A).Pt.II dated 11th October, 1956.</p>
      </div>
      <div class="sig-right" style="margin-top:30px">Signature of the Controlling Officer</div>

      <div class="part-sub" style="margin-top:30px"><strong>[Certificate to be given by a Government Servant]</strong></div>
      <div class="cert">
        <p>1) I have not submitted any other claim so far for Leave Travel Concession in respect of myself or family members for the Block Year <u>${blockYearFrom}-${blockYearTo}</u>.</p>
        <p>2) I have already drawn T.A. for the Leave Travel Concession in respect of a Journey performed by me/with my spouse/ with children. This claim is in respect of the journey performed by my spouse/ myself with my spouse/ and/or children / none of whom travelled with the party on the earlier occasion.</p>
        <p>3) The journey has been performed by me and my spouse with children to the declared ${journeyDestination === 'home' ? '"Home Town"' : 'Other than Home Town viz. <u>' + (otherThanHomeTown || '___') + '</u>'}${journeyDestination === 'home' && homeTown ? ' viz. <u>' + homeTown + '</u>' : ''}.</p>
        <p>4) That my spouse is not employed in Government Service and the concession has not been availed of by him/her separately for himself/herself or for any other family member of the concerned block of two years.</p>
        <p>5) Certified that my spouse for whom Leave Travel Concession is claimed by me is not employed in any Public Sector Undertaking/ Corporation/ Autonomous Body financed wholly or partly by the Central Government or a local body which provides LTC facilities to its employees and their families.</p>
      </div>
      <div class="sig-right" style="margin-top:30px">Signature of the Govt. Servant.</div>
    `;
  };

  // ── Direct print ──
  const handlePrint = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<html><head><title>Leave Travel Concession Bill</title><style>${getFormStyles()}</style></head><body>${getFormBody()}</body></html>`);
    w.document.close();
    w.print();
  };

  // ── Load preview into iframe ──
  const loadPreview = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;
    doc.open();
    doc.write(`<!DOCTYPE html><html><head><style>${getFormStyles()}</style></head><body contenteditable="true">${getFormBody()}</body></html>`);
    doc.close();
  };

  // ── Print from preview (preserves edits) ──
  const handlePrintFromPreview = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument;
    if (!doc || !doc.body) return;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<html><head><title>Leave Travel Concession Bill</title><style>${getFormStyles()}</style></head><body>${doc.body.innerHTML}</body></html>`);
    w.document.close();
    w.print();
  };

  // ── Toolbar: formatting command on iframe ──
  const execCmd = (cmd: string, value?: string) => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;
    doc.execCommand(cmd, false, value || '');
    iframeRef.current?.contentWindow?.focus();
  };

  const pd = (e: React.MouseEvent) => e.preventDefault();

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    if (newValue === 1) {
      setTimeout(loadPreview, 80);
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', p: 3 }}>
        <Box sx={{ maxWidth: 1300, mx: 'auto' }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
            <IconButton component={Link} to="/" size="small"><HomeIcon /></IconButton>
            <FlightIcon sx={{ color: 'primary.main', fontSize: 32 }} />
            <Box>
              <Typography variant="h5" fontWeight={600} color="primary.main">Leave Travel Concession Bill</Typography>
              <Typography variant="caption" color="text.secondary">Form No. 04 — CCS(LTC) Rules</Typography>
            </Box>
            <Box sx={{ flexGrow: 1 }} />
            {activeTab === 0 && <Button variant="contained" startIcon={<PrintIcon />} onClick={handlePrint}>Print LTC Bill</Button>}
            {activeTab === 1 && <Button variant="contained" startIcon={<PrintIcon />} onClick={handlePrintFromPreview}>Print Edited</Button>}
          </Box>

          {/* ═══════════ Tabs ═══════════ */}
          <Paper sx={{ mb: 3 }}>
            <Tabs value={activeTab} onChange={handleTabChange} sx={{ px: 2 }}>
              <Tab icon={<EditIcon />} iconPosition="start" label="Fill Form" />
              <Tab icon={<VisibilityIcon />} iconPosition="start" label="Preview & Edit" />
            </Tabs>
          </Paper>

          {activeTab === 0 && (<>
          {/* ═══════════ Form Heading (Editable) ═══════════ */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ borderBottom: '2px solid', borderColor: 'primary.main', pb: 0.5 }}>
              Form Heading &nbsp;<Typography component="span" variant="caption" color="text.secondary">[Printed inside a bordered box — edit to customize]</Typography>
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField fullWidth size="small" label="Form Title" value={formTitle} onChange={e => setFormTitle(e.target.value)} />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <TextField fullWidth size="small" label="Form Number" value={formNumber} onChange={e => setFormNumber(e.target.value)} />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <TextField fullWidth size="small" label="Sub Bill No." value={subBillNo} onChange={e => setSubBillNo(e.target.value)} />
              </Grid>
              <Grid size={{ xs: 3, md: 2 }}>
                <TextField fullWidth size="small" label="Block Year From" value={blockYearFrom} onChange={e => setBlockYearFrom(e.target.value)} />
              </Grid>
              <Grid size={{ xs: 3, md: 2 }}>
                <TextField fullWidth size="small" label="Block Year To" value={blockYearTo} onChange={e => setBlockYearTo(e.target.value)} />
              </Grid>
              <Grid size={{ xs: 12, md: 8 }}>
                <TextField fullWidth size="small" label="Form Note" value={formNote} onChange={e => setFormNote(e.target.value)} multiline minRows={1} />
              </Grid>
            </Grid>
          </Paper>

          {/* ═══════════════ PART A ═══════════════ */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ borderBottom: '2px solid', borderColor: 'primary.main', pb: 0.5 }}>
              PART &ndash; A &nbsp;<Typography component="span" variant="caption" color="text.secondary">[To be filled by the Government Servant]</Typography>
            </Typography>

            {/* Fields 1-5 */}
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, md: 5 }}>
                <TextField fullWidth size="small" label="1. Name of Officer / Official" value={officerName} onChange={e => setOfficerName(e.target.value)} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField fullWidth size="small" label="2. Designation" value={designation} onChange={e => setDesignation(e.target.value)} />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <TextField fullWidth size="small" type="number" label="3. Pay (Rs.)" value={pay || ''} onChange={e => setPay(Number(e.target.value) || 0)} />
              </Grid>
              <Grid size={{ xs: 6, md: 5 }}>
                <TextField fullWidth size="small" label="4. Head Quarter" value={headQuarter} onChange={e => setHeadQuarter(e.target.value)} />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>5. Leave Type</InputLabel>
                  <Select value={leaveType} label="5. Leave Type" onChange={e => setLeaveType(e.target.value)}>
                    {leaveTypes.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 3, md: 2 }}>
                <TextField fullWidth size="small" type="date" label="Leave From" value={leaveFrom} onChange={e => setLeaveFrom(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
              </Grid>
              <Grid size={{ xs: 3, md: 2 }}>
                <TextField fullWidth size="small" type="date" label="Leave To" value={leaveTo} onChange={e => setLeaveTo(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
              </Grid>
            </Grid>
          </Paper>

          {/* ═══════════ 6. Family Members ═══════════ */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">6. Family Members for LTC</Typography>
              <Box sx={{ flexGrow: 1 }} />
              <Button startIcon={<AddIcon />} size="small" onClick={addFamily}>Add Member</Button>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell width={50}>Sr. No.</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell width={80}>Age</TableCell>
                    <TableCell width={160}>Relationship</TableCell>
                    <TableCell width={50}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {family.map((m, i) => (
                    <TableRow key={m.id}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell>
                        <TextField variant="standard" fullWidth size="small" placeholder="Name" value={m.name} onChange={e => updateFamily(m.id, 'name', e.target.value)} />
                      </TableCell>
                      <TableCell>
                        <TextField variant="standard" size="small" placeholder="Age" value={m.age} onChange={e => updateFamily(m.id, 'age', e.target.value)} sx={{ width: 60 }} />
                      </TableCell>
                      <TableCell>
                        <Select variant="standard" size="small" value={m.relationship} onChange={e => updateFamily(m.id, 'relationship', e.target.value)} fullWidth>
                          {relationships.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                        </Select>
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" color="error" onClick={() => removeFamily(m.id)}><DeleteIcon fontSize="small" /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {family.length === 0 && (
                    <TableRow><TableCell colSpan={5} sx={{ textAlign: 'center', py: 2 }}>
                      <Typography variant="body2" color="text.secondary">No family members added</Typography>
                    </TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* ═══════════ 7. Journey Details ═══════════ */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">7. Journey Details</Typography>
              <Box sx={{ flexGrow: 1 }} />
              <Chip label={`Total Fare: ${fmt(totalFare)}`} color="primary" size="small" sx={{ mr: 1 }} />
              <Button startIcon={<AddIcon />} size="small" onClick={addJourney}>Add Journey</Button>
            </Box>

            {journeys.map((j, idx) => (
              <Paper key={j.id} sx={{ p: 2, mb: 2, bgcolor: 'action.hover' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2" fontWeight={600}>Journey {idx + 1}</Typography>
                  <Box sx={{ flexGrow: 1 }} />
                  <IconButton size="small" color="error" onClick={() => removeJourney(j.id)}><DeleteIcon fontSize="small" /></IconButton>
                </Box>
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 6, sm: 2 }}>
                    <TextField fullWidth size="small" type="date" label="Dep. Date" value={j.depDate} onChange={e => updateJourney(j.id, 'depDate', e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 1.5 }}>
                    <TextField fullWidth size="small" type="time" label="Dep. Time" value={j.depTime} onChange={e => updateJourney(j.id, 'depTime', e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 2.5 }}>
                    <TextField fullWidth size="small" label="From" value={j.depFrom} onChange={e => updateJourney(j.id, 'depFrom', e.target.value)} />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 2 }}>
                    <TextField fullWidth size="small" type="date" label="Arr. Date" value={j.arrDate} onChange={e => updateJourney(j.id, 'arrDate', e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 1.5 }}>
                    <TextField fullWidth size="small" type="time" label="Arr. Time" value={j.arrTime} onChange={e => updateJourney(j.id, 'arrTime', e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 2.5 }}>
                    <TextField fullWidth size="small" label="To" value={j.arrTo} onChange={e => updateJourney(j.id, 'arrTo', e.target.value)} />
                  </Grid>
                  <Grid size={{ xs: 4, sm: 1.5 }}>
                    <TextField fullWidth size="small" type="number" label="Distance (Km)" value={j.distanceKm || ''} onChange={e => updateJourney(j.id, 'distanceKm', Number(e.target.value) || 0)} />
                  </Grid>
                  <Grid size={{ xs: 8, sm: 3 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Mode & Class</InputLabel>
                      <Select value={j.modeClass} label="Mode & Class" onChange={e => updateJourney(j.id, 'modeClass', e.target.value)}>
                        {modeClasses.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 4, sm: 1.5 }}>
                    <TextField fullWidth size="small" type="number" label="No. of Fares" value={j.noOfFares} onChange={e => updateJourney(j.id, 'noOfFares', Number(e.target.value) || 1)} />
                  </Grid>
                  <Grid size={{ xs: 4, sm: 2 }}>
                    <TextField fullWidth size="small" type="number" label="Fare Paid (Rs.)" value={j.farePaid || ''} onChange={e => updateJourney(j.id, 'farePaid', Number(e.target.value) || 0)} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField fullWidth size="small" label="Remarks / Ticket No." value={j.remarks} onChange={e => updateJourney(j.id, 'remarks', e.target.value)} />
                  </Grid>
                </Grid>
              </Paper>
            ))}
            {journeys.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="body2" color="text.secondary">No journeys added yet. Click "Add Journey" to start.</Typography>
              </Box>
            )}
          </Paper>

          {/* ═══════════ 8. Advance + 9. Higher Class + 10. Road ═══════════ */}
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>8. Advance Drawn</Typography>
                <TextField fullWidth size="small" type="number" label="Advance Amount (Rs.)" value={advanceAmount || ''} onChange={e => setAdvanceAmount(Number(e.target.value) || 0)} />
              </Paper>

              {/* Summary */}
              <Paper sx={{ p: 3, bgcolor: 'rgba(16,185,129,0.08)' }}>
                <Typography variant="h6" gutterBottom>Net Entitlement</Typography>
                <Table size="small">
                  <TableBody>
                    <TableRow><TableCell>Total Fares</TableCell><TableCell align="right">{fmt(totalFare)}</TableCell></TableRow>
                    <TableRow><TableCell>Less: Advance</TableCell><TableCell align="right">-{fmt(advanceAmount)}</TableCell></TableRow>
                    <TableRow sx={{ bgcolor: 'rgba(16,185,129,0.1)' }}>
                      <TableCell><Typography fontWeight={700}>Net Amount</Typography></TableCell>
                      <TableCell align="right"><Typography fontWeight={700} color="primary.main" fontSize={20}>{fmt(netAmount)}</Typography></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 8 }}>
              {/* 9. Higher Class */}
              <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">9. Higher Class Accommodation</Typography>
                  <Box sx={{ flexGrow: 1 }} />
                  <Button startIcon={<AddIcon />} size="small" onClick={addHigherClass}>Add</Button>
                </Box>
                {higherClassJourneys.length > 0 && (
                  <TextField fullWidth size="small" label="Sanction No. & Date" value={higherClassSanction} onChange={e => setHigherClassSanction(e.target.value)} sx={{ mb: 2 }} />
                )}
                {higherClassJourneys.map((h, idx) => (
                  <Box key={h.id} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                    <TextField size="small" placeholder="From" value={h.from} onChange={e => updateHigherClass(h.id, 'from', e.target.value)} sx={{ flex: 1 }} />
                    <TextField size="small" placeholder="To" value={h.to} onChange={e => updateHigherClass(h.id, 'to', e.target.value)} sx={{ flex: 1 }} />
                    <TextField size="small" placeholder="Mode" value={h.modeOfConveyance} onChange={e => updateHigherClass(h.id, 'modeOfConveyance', e.target.value)} sx={{ width: 100 }} />
                    <TextField size="small" placeholder="Entitled" value={h.classEntitled} onChange={e => updateHigherClass(h.id, 'classEntitled', e.target.value)} sx={{ width: 90 }} />
                    <TextField size="small" placeholder="Actual" value={h.classActual} onChange={e => updateHigherClass(h.id, 'classActual', e.target.value)} sx={{ width: 90 }} />
                    <TextField size="small" type="number" placeholder="Fares" value={h.noOfFares} onChange={e => updateHigherClass(h.id, 'noOfFares', Number(e.target.value) || 1)} sx={{ width: 60 }} />
                    <TextField size="small" type="number" placeholder="Fare ₹" value={h.fareEntitled || ''} onChange={e => updateHigherClass(h.id, 'fareEntitled', Number(e.target.value) || 0)} sx={{ width: 90 }} />
                    <IconButton size="small" color="error" onClick={() => removeHigherClass(h.id)}><DeleteIcon fontSize="small" /></IconButton>
                  </Box>
                ))}
                {higherClassJourneys.length === 0 && (
                  <Typography variant="body2" color="text.secondary">NIL — No higher class journeys</Typography>
                )}
              </Paper>

              {/* 10. Road Journeys */}
              <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">10. Road Journeys (Rail-connected places)</Typography>
                  <Box sx={{ flexGrow: 1 }} />
                  <Button startIcon={<AddIcon />} size="small" onClick={addRoadJourney}>Add</Button>
                </Box>
                {roadJourneys.map(r => (
                  <Box key={r.id} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                    <TextField size="small" placeholder="From" value={r.from} onChange={e => updateRoadJourney(r.id, 'from', e.target.value)} sx={{ flex: 1 }} />
                    <TextField size="small" placeholder="To" value={r.to} onChange={e => updateRoadJourney(r.id, 'to', e.target.value)} sx={{ flex: 1 }} />
                    <TextField size="small" placeholder="Class Entitled" value={r.classEntitled} onChange={e => updateRoadJourney(r.id, 'classEntitled', e.target.value)} sx={{ width: 120 }} />
                    <TextField size="small" type="number" placeholder="Railway Fare ₹" value={r.railwayFare || ''} onChange={e => updateRoadJourney(r.id, 'railwayFare', Number(e.target.value) || 0)} sx={{ width: 120 }} />
                    <IconButton size="small" color="error" onClick={() => removeRoadJourney(r.id)}><DeleteIcon fontSize="small" /></IconButton>
                  </Box>
                ))}
                {roadJourneys.length === 0 && (
                  <Typography variant="body2" color="text.secondary">NIL — No road journeys between rail-connected places</Typography>
                )}
              </Paper>
            </Grid>
          </Grid>

          {/* ═══════════ Certification ═══════════ */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Certification</Typography>
            <FormControlLabel
              control={<Checkbox checked={spouseNotGovt} onChange={e => { setSpouseNotGovt(e.target.checked); if (e.target.checked) setSpouseGovtNotClaimed(false); }} />}
              label="My spouse is NOT employed in Government Service"
            />
            <FormControlLabel
              control={<Checkbox checked={spouseGovtNotClaimed} onChange={e => { setSpouseGovtNotClaimed(e.target.checked); if (e.target.checked) setSpouseNotGovt(false); }} />}
              label="My spouse IS in Govt Service but has NOT claimed LTC separately"
            />
          </Paper>

          {/* ═══════════ APPENDIX I ═══════════ */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ borderBottom: '2px solid', borderColor: 'primary.main', pb: 0.5 }}>
              APPENDIX &ndash; I &nbsp;<Typography component="span" variant="caption" color="text.secondary">[Certificates]</Typography>
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, md: 4 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Journey Destination</InputLabel>
                  <Select value={journeyDestination} label="Journey Destination" onChange={e => setJourneyDestination(e.target.value as 'home' | 'other')}>
                    <MenuItem value="home">Home Town</MenuItem>
                    <MenuItem value="other">Other than Home Town</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField fullWidth size="small" label="Home Town" value={homeTown} onChange={e => setHomeTown(e.target.value)} />
              </Grid>
              {journeyDestination === 'other' && (
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField fullWidth size="small" label="Other Destination" value={otherThanHomeTown} onChange={e => setOtherThanHomeTown(e.target.value)} />
                </Grid>
              )}
            </Grid>
            <Alert severity="info" sx={{ mt: 2, fontSize: 11 }}>
              The print output includes all 5 declarations from Appendix-I (previous claims, spouse employment, home town, PSU certificate) pre-filled with your details.
            </Alert>
          </Paper>
          </>)}

          {/* ═══════════ Preview & Edit Tab ═══════════ */}
          {activeTab === 1 && (<>
            {/* Formatting Toolbar */}
            <Paper sx={{ p: 1.5, mb: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
              <Tooltip title="Bold (Ctrl+B)"><IconButton size="small" onMouseDown={pd} onClick={() => execCmd('bold')}><FormatBoldIcon fontSize="small" /></IconButton></Tooltip>
              <Tooltip title="Italic (Ctrl+I)"><IconButton size="small" onMouseDown={pd} onClick={() => execCmd('italic')}><FormatItalicIcon fontSize="small" /></IconButton></Tooltip>
              <Tooltip title="Underline (Ctrl+U)"><IconButton size="small" onMouseDown={pd} onClick={() => execCmd('underline')}><FormatUnderlinedIcon fontSize="small" /></IconButton></Tooltip>
              <Tooltip title="Strikethrough"><IconButton size="small" onMouseDown={pd} onClick={() => execCmd('strikeThrough')}><StrikethroughSIcon fontSize="small" /></IconButton></Tooltip>
              <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
              <Tooltip title="Align Left"><IconButton size="small" onMouseDown={pd} onClick={() => execCmd('justifyLeft')}><FormatAlignLeftIcon fontSize="small" /></IconButton></Tooltip>
              <Tooltip title="Align Center"><IconButton size="small" onMouseDown={pd} onClick={() => execCmd('justifyCenter')}><FormatAlignCenterIcon fontSize="small" /></IconButton></Tooltip>
              <Tooltip title="Align Right"><IconButton size="small" onMouseDown={pd} onClick={() => execCmd('justifyRight')}><FormatAlignRightIcon fontSize="small" /></IconButton></Tooltip>
              <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
              <Tooltip title="Increase Font Size"><IconButton size="small" onMouseDown={pd} onClick={() => execCmd('fontSize', '4')}><FormatSizeIcon fontSize="small" /></IconButton></Tooltip>
              <Tooltip title="Decrease Font Size"><IconButton size="small" onMouseDown={pd} onClick={() => execCmd('fontSize', '2')}><FormatSizeIcon sx={{ fontSize: 14 }} /></IconButton></Tooltip>
              <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
              <Tooltip title="Undo (Ctrl+Z)"><IconButton size="small" onMouseDown={pd} onClick={() => execCmd('undo')}><UndoIcon fontSize="small" /></IconButton></Tooltip>
              <Tooltip title="Redo (Ctrl+Y)"><IconButton size="small" onMouseDown={pd} onClick={() => execCmd('redo')}><RedoIcon fontSize="small" /></IconButton></Tooltip>
              <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
              <Tooltip title="Refresh from Form Data"><IconButton size="small" onMouseDown={pd} onClick={loadPreview}><RefreshIcon fontSize="small" /></IconButton></Tooltip>
            </Paper>

            {/* Document Preview */}
            <Box sx={{ bgcolor: '#e0e0e0', borderRadius: 2, p: 3, display: 'flex', justifyContent: 'center' }}>
              <Box sx={{ width: '100%', maxWidth: 900, boxShadow: '0 4px 30px rgba(0,0,0,0.5)', borderRadius: 1, overflow: 'hidden' }}>
                <iframe
                  ref={iframeRef}
                  title="Document Preview"
                  style={{ width: '100%', minHeight: 1200, border: 'none', background: '#fff', display: 'block' }}
                />
              </Box>
            </Box>

            <Alert severity="info" sx={{ mt: 2 }}>
              Click anywhere in the document above to edit text directly. Use the toolbar to format. Click "Print Edited" to print your changes.
            </Alert>
          </>)}

        </Box>
      </Box>
    </ThemeProvider>
  );
}
