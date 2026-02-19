import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Grid, Button, IconButton, Divider, Alert, Tooltip,
  FormControl, InputLabel, Select, MenuItem, Tabs, Tab,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import HomeIcon from '@mui/icons-material/Home';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PrintIcon from '@mui/icons-material/Print';
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

const pensionerCategories = [
  'Central Govt. Pensioner',
  'Pensioner of Autonomous/Statutory body',
  'Ex-MP',
  'Ex-Governor',
  'Former Judge of Supreme Court',
  'Former Judge of High Court',
  'Freedom Fighter',
  'Legal Heir',
  'Others',
];

const wardEntitlements = ['Private', 'Semi-Private', 'General'];
const relationships = ['Self', 'Spouse', 'Son', 'Daughter', 'Father', 'Mother', 'Dependent'];

export default function App() {
  // ── Heading (editable) ──
  const [formTitle, setFormTitle] = useState('MEDICAL REIMBURSEMENT CLAIM FORM');
  const [formNumber, setFormNumber] = useState('FORM – MRC (P)');
  const [formSubtitle, setFormSubtitle] = useState('(For pensioner beneficiaries)');

  // ── 1. Principal CGHS Card Holder Details ──
  const [cardHolderName, setCardHolderName] = useState('');
  const [cghsBenId, setCghsBenId] = useState('');
  const [wellnessCenter, setWellnessCenter] = useState('');
  const [cardValidity, setCardValidity] = useState('');
  const [wardEntitlement, setWardEntitlement] = useState('General');
  const [fullAddress, setFullAddress] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [email, setEmail] = useState('');

  // ── 2. Patient Details ──
  const [patientName, setPatientName] = useState('');
  const [patientBenId, setPatientBenId] = useState('');
  const [patientRelationship, setPatientRelationship] = useState('Self');

  // ── 3-10 ──
  const [pensionerCategory, setPensionerCategory] = useState('Central Govt. Pensioner');
  const [hospitalNameAddress, setHospitalNameAddress] = useState('');
  const [isEmpanelled, setIsEmpanelled] = useState('Yes');
  const [treatmentOPD, setTreatmentOPD] = useState('');
  const [treatmentIndoor, setTreatmentIndoor] = useState('');
  const [creditFacility, setCreditFacility] = useState('');
  const [creditNotAvailedReason, setCreditNotAvailedReason] = useState('');
  const [isEmergency, setIsEmergency] = useState('No');
  const [priorPermission, setPriorPermission] = useState('No');
  const [hasInsurance, setHasInsurance] = useState('No');
  const [insuranceAmountClaimed, setInsuranceAmountClaimed] = useState('');

  // ── 11. Amounts ──
  const [amountOPD, setAmountOPD] = useState(0);
  const [amountIndoor, setAmountIndoor] = useState(0);
  const [amountTests, setAmountTests] = useState(0);

  // ── 12. Bank ──
  const [bankName, setBankName] = useState('');
  const [sbAccountNo, setSbAccountNo] = useState('');
  const [micrCode, setMicrCode] = useState('');
  const [ifscCode, setIfscCode] = useState('');

  // ── Declaration ──
  const [declDate, setDeclDate] = useState('');
  const [declPlace, setDeclPlace] = useState('');

  // ── Preview & Edit mode ──
  const [activeTab, setActiveTab] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const totalClaimed = amountOPD + amountIndoor + amountTests;

  // ── Generate form styles (reusable) ──
  const getFormStyles = () => `
    @page{margin:15mm 20mm}
    body{font-family:'Times New Roman',serif;padding:10px 30px;color:#000;font-size:12px;line-height:1.5;outline:none;cursor:text}
    .heading-box{border:2px solid #000;padding:10px 16px;margin-bottom:12px;text-align:center}
    .form-no{text-align:right;font-weight:bold;font-size:13px;margin-bottom:2px}
    .form-sub{font-style:italic;font-size:11px;margin-bottom:4px}
    .org{font-weight:bold;font-size:15px;letter-spacing:1px;margin-bottom:2px}
    h1{text-align:center;font-size:16px;margin:0 0 2px 0;font-weight:bold;text-decoration:underline}
    .fill-note{text-align:center;font-size:11px;margin-top:4px}
    .field{display:flex;margin-bottom:5px;font-size:12px}
    .field .num{width:40px;font-weight:bold;flex-shrink:0}
    .field .sub-num{width:24px;flex-shrink:0;padding-left:10px}
    .field .lbl{width:340px;flex-shrink:0}
    .field .colon{width:14px;text-align:center;flex-shrink:0}
    .field .val{flex:1;border-bottom:1px dotted #333;min-height:16px;padding-left:4px}
    .field-wide .val{min-height:30px}
    .indent{margin-left:64px;font-size:11px;margin-bottom:3px}
    .yes-no{font-weight:bold;margin-left:20px}
    .amount-section{margin-left:64px;font-size:12px;margin-bottom:3px;display:flex}
    .amount-section .lbl{width:200px}.amount-section .colon{width:14px}.amount-section .val{flex:1;border-bottom:1px dotted #333;padding-left:4px}
    .decl{border:1px solid #000;padding:10px 14px;font-size:11px;line-height:1.6;margin-top:14px}
    .decl-title{text-align:center;font-weight:bold;font-size:13px;text-decoration:underline;margin-bottom:6px}
    .sig-right{text-align:right;margin-top:30px;font-size:11px;font-weight:bold}
    .date-place{margin-top:12px;font-size:11px}
    .date-place div{margin-bottom:4px}
    .pb{page-break-before:always}
    .doc-title{text-align:center;font-weight:bold;font-size:14px;text-decoration:underline;margin-bottom:12px}
    .doc-list{font-size:12px;line-height:1.8;margin-left:20px}
    .doc-list div{margin-bottom:2px}
    .imp-title{font-weight:bold;font-size:13px;text-decoration:underline;margin:18px 0 8px 0}
    .imp-list{font-size:11px;margin-left:20px;line-height:1.6}
    .imp-list div{margin-bottom:8px}
    .note-box{margin-top:20px;font-size:11px;font-style:italic}
    .annex-title{text-align:center;font-weight:bold;font-size:14px;text-decoration:underline;margin-bottom:4px}
    .annex-sub{text-align:center;font-weight:bold;font-size:13px;text-decoration:underline;margin-bottom:16px}
    .annex-body{font-size:12px;line-height:2;text-align:justify}
    .annex-sig{text-align:right;font-weight:bold;margin-top:30px;font-size:12px}
    .annex-notary{font-weight:bold;margin-top:40px;font-size:12px}
    .noc-persons{margin:12px 0;font-size:12px;line-height:2}
    .noc-sigs{display:flex;justify-content:space-between;margin-top:20px;font-size:11px}
    .noc-sigs div{text-align:center;width:150px}
    .separator{border-top:3px double #000;margin:20px 0}
  `;

  // ── Generate form body HTML (reusable) ──
  const getFormBody = () => {
    const fmtD = (d: string) => d ? new Date(d).toLocaleDateString('en-IN') : '......................';
    return `
      <!-- PAGE 1: MAIN FORM -->
      <div class="heading-box">
        <div class="form-no">${formNumber || 'FORM – MRC (P)'}</div>
        <div class="form-sub">${formSubtitle || '(For pensioner beneficiaries)'}</div>
        <div class="org">CENTRAL GOVERNMENT HEALTH SCHEME</div>
        <h1>${formTitle || 'MEDICAL REIMBURSEMENT CLAIM FORM'}</h1>
        <div class="fill-note">(To be filled by the Principal Card holder/Claimant in <strong>BLOCK LETTERS</strong>)</div>
      </div>

      <div class="field"><div class="num">1. (a)</div><div class="lbl">Name of the Principal CGHS Card Holder</div><div class="colon">:</div><div class="val">${cardHolderName || ''}</div></div>
      <div class="field"><div class="num"></div><div class="sub-num">(b)</div><div class="lbl" style="width:316px">CGHS Ben ID No.</div><div class="colon">:</div><div class="val">${cghsBenId || ''}</div></div>
      <div class="field"><div class="num"></div><div class="sub-num">(c)</div><div class="lbl" style="width:316px">CGHS Wellness Center to which the card is attached</div><div class="colon">:</div><div class="val">${wellnessCenter || ''}</div></div>
      <div class="field"><div class="num"></div><div class="sub-num">(d)</div><div class="lbl" style="width:316px">Validity of CGHS Card</div><div class="colon">:</div><div class="val">${cardValidity || ''}</div></div>
      <div class="field"><div class="num"></div><div class="sub-num">(e)</div><div class="lbl" style="width:316px">Ward Entitlement – Pvt./Semi-Pvt./General</div><div class="colon">:</div><div class="val">${wardEntitlement || ''}</div></div>
      <div class="field field-wide"><div class="num"></div><div class="sub-num">(f)</div><div class="lbl" style="width:316px">Full Address</div><div class="colon">:</div><div class="val">${fullAddress || ''}</div></div>
      <div class="field"><div class="num"></div><div class="sub-num">(g)</div><div class="lbl" style="width:316px">Mobile telephone No. and e-mail address, if any</div><div class="colon">:</div><div class="val">${mobileNo || ''}${email ? ' / ' + email : ''}</div></div>

      <div class="field"><div class="num">2. (a)</div><div class="lbl">Patient's Name</div><div class="colon">:</div><div class="val">${patientName || ''}</div></div>
      <div class="field"><div class="num"></div><div class="sub-num">(b)</div><div class="lbl" style="width:316px">Patient's CGHS Ben ID No.</div><div class="colon">:</div><div class="val">${patientBenId || ''}</div></div>
      <div class="field"><div class="num"></div><div class="sub-num">(c)</div><div class="lbl" style="width:316px">Relationship with the Principal CGHS card holder</div><div class="colon">:</div><div class="val">${patientRelationship || ''}</div></div>

      <div class="field field-wide"><div class="num">3.</div><div class="lbl" style="width:350px">Category of pensioner beneficiary - please specify</div><div class="colon">:</div><div class="val">${pensionerCategory || ''}</div></div>
      <div class="indent" style="margin-left:40px;font-size:10px;font-style:italic">(Central Govt. Pensioner/Pensioner of Autonomous/Statutory body/Ex-MP/ Ex-Governor/ Former Judge of Supreme Court/ Former Judge of High Court/Freedom Fighter/Legal Heir/Others)</div>

      <div class="field field-wide" style="margin-top:6px"><div class="num">4.</div><div class="lbl" style="width:350px">Name &amp; address of the hospital / diagnostic center / imaging center where treatment is taken or tests done</div><div class="colon">:</div><div class="val">${hospitalNameAddress || ''}</div></div>

      <div class="field" style="margin-top:4px"><div class="num">5.</div><div class="lbl" style="width:350px">Whether the hospital/diagnostic/imaging center is empanelled under CGHS</div><div class="colon">:</div><div class="val"><span class="yes-no">${isEmpanelled}</span></div></div>

      <div class="field" style="margin-top:4px"><div class="num">6.</div><div class="lbl" style="width:350px">Treatment for which reimbursement claimed</div><div class="colon"></div><div class="val" style="border:none"></div></div>
      <div class="amount-section"><div class="lbl">(a) OPD/Test &amp; investigations</div><div class="colon">:</div><div class="val">${treatmentOPD || ''}</div></div>
      <div class="amount-section"><div class="lbl">(b) Indoor Treatment</div><div class="colon">:</div><div class="val">${treatmentIndoor || ''}</div></div>

      <div class="field" style="margin-top:4px"><div class="num">7.</div><div class="lbl" style="width:350px">Whether credit facility was availed. If not, reasons thereof</div><div class="colon">:</div><div class="val">${creditFacility || ''}${creditNotAvailedReason ? ' — ' + creditNotAvailedReason : ''}</div></div>
      <div class="indent" style="font-size:10px;font-style:italic;margin-left:40px">(clarification may be attached)</div>

      <div class="field" style="margin-top:4px"><div class="num">8.</div><div class="lbl" style="width:350px">Whether treatment was taken in emergency</div><div class="colon">:</div><div class="val"><span class="yes-no">${isEmergency}</span></div></div>

      <div class="field" style="margin-top:4px"><div class="num">9.</div><div class="lbl" style="width:350px">Whether prior permission was taken for the treatment</div><div class="colon">:</div><div class="val"><span class="yes-no">${priorPermission}</span></div></div>

      <div class="field" style="margin-top:4px"><div class="num">10.</div><div class="lbl" style="width:350px">Whether subscribing to any health/medical insurance scheme, if yes, amount claimed/received</div><div class="colon">:</div><div class="val"><span class="yes-no">${hasInsurance}</span>${hasInsurance === 'Yes' && insuranceAmountClaimed ? ', Amount: ' + insuranceAmountClaimed : ''}</div></div>

      <div class="field" style="margin-top:6px"><div class="num">11.</div><div class="lbl" style="width:350px"><strong>Total amount claimed</strong></div><div class="colon">:</div><div class="val" style="border:none"></div></div>
      <div class="amount-section"><div class="lbl">(a) OPD Treatment</div><div class="colon">:</div><div class="val">${amountOPD ? fmt(amountOPD) : ''}</div></div>
      <div class="amount-section"><div class="lbl">(b) Indoor Treatment</div><div class="colon">:</div><div class="val">${amountIndoor ? fmt(amountIndoor) : ''}</div></div>
      <div class="amount-section"><div class="lbl">(c) Tests/Investigation</div><div class="colon">:</div><div class="val">${amountTests ? fmt(amountTests) : ''}</div></div>
      ${totalClaimed > 0 ? `<div class="amount-section" style="margin-top:4px"><div class="lbl"><strong>Total</strong></div><div class="colon">:</div><div class="val"><strong>${fmt(totalClaimed)}</strong></div></div>` : ''}

      <div style="margin-top:8px;font-size:12px">
        <div class="field"><div class="num">12.</div><div class="lbl" style="width:200px">Name of the Bank</div><div class="colon">:</div><div class="val" style="max-width:150px">${bankName || ''}</div><div style="width:20px"></div><div class="lbl" style="width:80px">SB A/c No.</div><div class="colon">:</div><div class="val">${sbAccountNo || ''}</div></div>
        <div class="field"><div class="num"></div><div class="lbl" style="width:200px">Branch MICR Code</div><div class="colon">:</div><div class="val" style="max-width:150px">${micrCode || ''}</div><div style="width:20px"></div><div class="lbl" style="width:80px">IFSC Code</div><div class="colon">:</div><div class="val">${ifscCode || ''}</div></div>
      </div>

      <div class="decl">
        <div class="decl-title">DECLARATION</div>
        I hereby declare that the statements made in the application are true to the best of my knowledge and belief and the person for whom medical expenses were incurred is wholly dependent on me. I am a CGHS beneficiary and the CGHS card was valid at the time of treatment. I agree for the reimbursement as is admissible under the rules.
      </div>

      <div class="date-place">
        <div><strong>Date:</strong> ${declDate ? fmtD(declDate) : '.........................................'}</div>
        <div><strong>Place:</strong> ${declPlace || '.........................................'}</div>
      </div>
      <div class="sig-right">Signature of the Principal CGHS card holder / Claimant</div>

      <!-- PAGE 2: DOCUMENTS -->
      <div class="pb"></div>
      <div class="doc-title">Documents to be attached</div>
      <div class="doc-list">
        <div>1. &nbsp; Photo copy of the CGHS card of the principal card holder along with the patient's CGHS Card.</div>
        <div>2. &nbsp; Copy of permission letter, if any.</div>
        <div>3. &nbsp; Emergency certificate (original), in case of emergency.</div>
        <div>4. &nbsp; Copy of the discharge summary.</div>
        <div>5. &nbsp; Ambulance Certificate (original), if any.</div>
        <div>6. &nbsp; Original bills /cash memo / vouchers etc. for the reimbursement amount claimed.</div>
      </div>
      <div class="imp-title">IMPORTANT</div>
      <p style="font-size:11px">Kindly ensure to provide the following information / documents, wherever applicable:</p>
      <div class="imp-list">
        <div>a) &nbsp; Obtain Break up of Investigations from the hospital/diagnostic center/imaging center (details and rates of individual tests and the exact number of tests, X-ray films, etc.,) as the reimbursable amount is calculated as per approved rates per test.</div>
        <div>b) &nbsp; In case of loss of original papers, Affidavits as per Annexure I to be submitted. All photocopies of the bills to be attested by the treating doctor/specialist.</div>
        <div>c) &nbsp; In case of death of the card holder, Affidavit as per Annexure II to be filled and attached to claim reimbursement.</div>
        <div>c) &nbsp; In case of implants, Invoice No. along with sticker with serial number of the implant to be attached.</div>
        <div>d) &nbsp; In case of Coronary Stents, outer pouch of stents is to be enclosed.</div>
        <div>e) &nbsp; In case of replacement of pacemaker / ICD etc., copy of the warranty certificate of earlier pacemaker /ICD may be enclosed.</div>
      </div>
      <div class="note-box"><strong><u>Note</u>:</strong> <em>Misuse of CGHS facilities is a criminal offence. Penal action including cancellation of CGHS card may be taken in case of willful suppression of facts or submission of false claims / statements.</em></div>

      <!-- PAGE 3: ANNEXURE I -->
      <div class="pb"></div>
      <div class="annex-title">Annexure – I</div>
      <div class="annex-sub">Draft for Affidavit for Duplicate Claim Papers/bills on stamp Paper</div>
      <div class="annex-body">
        I, ...................................... son / wife / daughter of........................................ and resident of
        .........................................................................have lost / misplaced the original paper or
        the same are not traceable. I hereby give an undertaking that I have not received any payment
        against the original bills/claim papers from any source and that if the original papers are traced, I
        shall not stake claim against original bills in future and that in the event, I receive any cheque
        against the original bills in future, I shall return the same to competent authority.
      </div>
      <div class="annex-sig">Deponent</div>
      <div class="annex-notary">Verified by Notary Public</div>

      <!-- PAGE 4: ANNEXURE II -->
      <div class="pb"></div>
      <div class="annex-title">Annexure – II</div>
      <div class="annex-sub">Draft for Affidavit on Stamp Paper for claiming medical reimbursement<br/>IN CASE OF DEATH of a CGHS Card Holder</div>
      <div class="annex-body">
        I,...........................husband / wife / son / daughter of Late...................................... and
        resident of ................................................................, hereby submit the medical
        reimbursement claim papers pertaining to treatment of my husband / wife / father /
        mother Late Shri/ Smt.........................who has expired on .......................... <em>(copy of
        Death Certificate is enclosed)</em>.
        <br/><br/>
        Late Shri/Smt.................................has left behind the following other legal heirs,
        none of whom have any objection if the entire reimbursable amount is paid to me.
        <br/><br/>
        No Objection Certificate signed by other legal heirs on Stamp paper is enclosed.
      </div>
      <div class="annex-sig">Deponent</div>
      <div class="annex-notary">Attested by Notary Public</div>
      <div class="separator"></div>
      <div style="font-weight:bold;font-size:13px;text-decoration:underline;margin-bottom:12px">Draft for No Objection Certificate on Stamp Paper.</div>
      <div class="noc-persons">
        We &nbsp; (i)........................................... S/o D/o Late Shri.......................................<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; (ii)........................................... S/o D/o Late Shri.......................................<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; (iii)........................................... S/o D/o Late Shri.......................................<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; (--) .......................................................................................................<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; (--) .......................................................................................................<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; (--) .......................................................................................................<br/><br/>
        being the legal heirs of Late Shri/Smt......................................have no objection if the
        entire amount reimbursable pertaining to the treatment of late Shri / Smt
        ..............................................................is paid to Shri / Smt ......................................
      </div>
      <div class="noc-sigs">
        <div>(i) (Signature)<br/>Name:<br/>Address:</div>
        <div>(ii) (Signature)<br/>Name:<br/>Address:</div>
        <div>(iii) (Signature)<br/>Name:<br/>Address:</div>
      </div>
      <div style="display:flex;justify-content:space-between;margin-top:20px;font-size:11px">
        <div>(iv).........................</div><div>(v).........................</div><div>(vi).........................</div>
      </div>
      <div class="annex-notary" style="margin-top:30px">Verified by Notary Public</div>
    `;
  };

  // ── Direct print (from Fill Form tab) ──
  const handlePrint = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<html><head><title>${formNumber} - CGHS Medical Reimbursement</title><style>${getFormStyles()}</style></head><body>${getFormBody()}</body></html>`);
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
    w.document.write(`<html><head><title>${formNumber} - CGHS Medical Reimbursement</title><style>${getFormStyles()}</style></head><body>${doc.body.innerHTML}</body></html>`);
    w.document.close();
    w.print();
  };

  // ── Toolbar: execute formatting command on iframe document ──
  const execCmd = (cmd: string, value?: string) => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;
    doc.execCommand(cmd, false, value || '');
    iframeRef.current?.contentWindow?.focus();
  };

  // ── Prevent toolbar buttons from stealing focus from iframe ──
  const pd = (e: React.MouseEvent) => e.preventDefault();

  // ── Tab change ──
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
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>

          {/* ═══════════ Header ═══════════ */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
            <IconButton component={Link} to="/" size="small"><HomeIcon /></IconButton>
            <LocalHospitalIcon sx={{ color: 'primary.main', fontSize: 32 }} />
            <Box>
              <Typography variant="h5" fontWeight={600} color="primary.main">CGHS Medical Reimbursement Claim</Typography>
              <Typography variant="caption" color="text.secondary">FORM – MRC (P) — For Pensioner Beneficiaries</Typography>
            </Box>
            <Box sx={{ flexGrow: 1 }} />
            {activeTab === 0 && (
              <Button variant="contained" startIcon={<PrintIcon />} onClick={handlePrint}>Print MRC(P)</Button>
            )}
          </Box>

          {/* ═══════════ Tabs ═══════════ */}
          <Paper sx={{ mb: 3 }}>
            <Tabs value={activeTab} onChange={handleTabChange} sx={{ '& .MuiTab-root': { fontWeight: 600 } }}>
              <Tab icon={<EditIcon />} iconPosition="start" label="Fill Form" />
              <Tab icon={<VisibilityIcon />} iconPosition="start" label="Preview & Edit" />
            </Tabs>
          </Paper>

          {/* ═══════════════════════════════════════════════════ */}
          {/* ═══════════ TAB 0: FILL FORM ═══════════════════ */}
          {/* ═══════════════════════════════════════════════════ */}
          {activeTab === 0 && (
            <>
              {/* Form Heading */}
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ borderBottom: '2px solid', borderColor: 'primary.main', pb: 0.5 }}>
                  Form Heading &nbsp;<Typography component="span" variant="caption" color="text.secondary">[Printed inside a bordered box — edit to customize]</Typography>
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid size={{ xs: 12, md: 5 }}>
                    <TextField fullWidth size="small" label="Form Title" value={formTitle} onChange={e => setFormTitle(e.target.value)} />
                  </Grid>
                  <Grid size={{ xs: 6, md: 4 }}>
                    <TextField fullWidth size="small" label="Form Number" value={formNumber} onChange={e => setFormNumber(e.target.value)} />
                  </Grid>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <TextField fullWidth size="small" label="Subtitle" value={formSubtitle} onChange={e => setFormSubtitle(e.target.value)} />
                  </Grid>
                </Grid>
              </Paper>

              {/* 1. Card Holder */}
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ borderBottom: '2px solid', borderColor: 'primary.main', pb: 0.5 }}>
                  1. Principal CGHS Card Holder Details
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth size="small" label="(a) Name of the Principal CGHS Card Holder" value={cardHolderName} onChange={e => setCardHolderName(e.target.value)} />
                  </Grid>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <TextField fullWidth size="small" label="(b) CGHS Ben ID No." value={cghsBenId} onChange={e => setCghsBenId(e.target.value)} />
                  </Grid>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <TextField fullWidth size="small" label="(d) Validity of CGHS Card" value={cardValidity} onChange={e => setCardValidity(e.target.value)} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth size="small" label="(c) CGHS Wellness Center" value={wellnessCenter} onChange={e => setWellnessCenter(e.target.value)} />
                  </Grid>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>(e) Ward Entitlement</InputLabel>
                      <Select value={wardEntitlement} label="(e) Ward Entitlement" onChange={e => setWardEntitlement(e.target.value)}>
                        {wardEntitlements.map(w => <MenuItem key={w} value={w}>{w}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth size="small" label="(f) Full Address" value={fullAddress} onChange={e => setFullAddress(e.target.value)} multiline minRows={2} />
                  </Grid>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <TextField fullWidth size="small" label="(g) Mobile No." value={mobileNo} onChange={e => setMobileNo(e.target.value)} />
                  </Grid>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <TextField fullWidth size="small" label="E-mail address" value={email} onChange={e => setEmail(e.target.value)} />
                  </Grid>
                </Grid>
              </Paper>

              {/* 2. Patient */}
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ borderBottom: '2px solid', borderColor: 'primary.main', pb: 0.5 }}>
                  2. Patient Details
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid size={{ xs: 12, md: 5 }}>
                    <TextField fullWidth size="small" label="(a) Patient's Name" value={patientName} onChange={e => setPatientName(e.target.value)} />
                  </Grid>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <TextField fullWidth size="small" label="(b) Patient's CGHS Ben ID No." value={patientBenId} onChange={e => setPatientBenId(e.target.value)} />
                  </Grid>
                  <Grid size={{ xs: 6, md: 4 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>(c) Relationship</InputLabel>
                      <Select value={patientRelationship} label="(c) Relationship" onChange={e => setPatientRelationship(e.target.value)}>
                        {relationships.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Paper>

              {/* 3-5 */}
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ borderBottom: '2px solid', borderColor: 'primary.main', pb: 0.5 }}>
                  3–5. Category, Hospital &amp; Empanelment
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>3. Category of Pensioner Beneficiary</InputLabel>
                      <Select value={pensionerCategory} label="3. Category of Pensioner Beneficiary" onChange={e => setPensionerCategory(e.target.value)}>
                        {pensionerCategories.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>5. Empanelled under CGHS?</InputLabel>
                      <Select value={isEmpanelled} label="5. Empanelled under CGHS?" onChange={e => setIsEmpanelled(e.target.value)}>
                        <MenuItem value="Yes">Yes</MenuItem>
                        <MenuItem value="No">No</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField fullWidth size="small" label="4. Name & address of the hospital / diagnostic center / imaging center" value={hospitalNameAddress} onChange={e => setHospitalNameAddress(e.target.value)} multiline minRows={2} />
                  </Grid>
                </Grid>
              </Paper>

              {/* 6-10 */}
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ borderBottom: '2px solid', borderColor: 'primary.main', pb: 0.5 }}>
                  6–10. Treatment Details &amp; Declarations
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>6. Treatment for which reimbursement claimed</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth size="small" label="(a) OPD/Test & Investigations" value={treatmentOPD} onChange={e => setTreatmentOPD(e.target.value)} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth size="small" label="(b) Indoor Treatment" value={treatmentIndoor} onChange={e => setTreatmentIndoor(e.target.value)} />
                  </Grid>
                  <Grid size={{ xs: 12 }}><Divider sx={{ my: 0.5 }} /></Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>7. Credit facility availed?</InputLabel>
                      <Select value={creditFacility} label="7. Credit facility availed?" onChange={e => setCreditFacility(e.target.value)}>
                        <MenuItem value="Yes">Yes</MenuItem>
                        <MenuItem value="No">No</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  {creditFacility === 'No' && (
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField fullWidth size="small" label="Reason not availed" value={creditNotAvailedReason} onChange={e => setCreditNotAvailedReason(e.target.value)} />
                    </Grid>
                  )}
                  <Grid size={{ xs: 6, md: 3 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>8. Emergency?</InputLabel>
                      <Select value={isEmergency} label="8. Emergency?" onChange={e => setIsEmergency(e.target.value)}>
                        <MenuItem value="Yes">Yes</MenuItem>
                        <MenuItem value="No">No</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>9. Prior permission?</InputLabel>
                      <Select value={priorPermission} label="9. Prior permission?" onChange={e => setPriorPermission(e.target.value)}>
                        <MenuItem value="Yes">Yes</MenuItem>
                        <MenuItem value="No">No</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>10. Medical insurance?</InputLabel>
                      <Select value={hasInsurance} label="10. Medical insurance?" onChange={e => setHasInsurance(e.target.value)}>
                        <MenuItem value="Yes">Yes</MenuItem>
                        <MenuItem value="No">No</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  {hasInsurance === 'Yes' && (
                    <Grid size={{ xs: 6, md: 3 }}>
                      <TextField fullWidth size="small" label="Amount claimed/received" value={insuranceAmountClaimed} onChange={e => setInsuranceAmountClaimed(e.target.value)} />
                    </Grid>
                  )}
                </Grid>
              </Paper>

              {/* 11. Amounts */}
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ borderBottom: '2px solid', borderColor: 'primary.main', pb: 0.5 }}>
                  11. Total Amount Claimed
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid size={{ xs: 4 }}>
                    <TextField fullWidth size="small" type="number" label="(a) OPD Treatment (Rs.)" value={amountOPD || ''} onChange={e => setAmountOPD(Number(e.target.value) || 0)} />
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <TextField fullWidth size="small" type="number" label="(b) Indoor Treatment (Rs.)" value={amountIndoor || ''} onChange={e => setAmountIndoor(Number(e.target.value) || 0)} />
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <TextField fullWidth size="small" type="number" label="(c) Tests/Investigation (Rs.)" value={amountTests || ''} onChange={e => setAmountTests(Number(e.target.value) || 0)} />
                  </Grid>
                </Grid>
                <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(16,185,129,0.1)', borderRadius: 1, textAlign: 'center' }}>
                  <Typography variant="caption">Total Claim Amount</Typography>
                  <Typography variant="h4" fontWeight={700} color="primary.main">{fmt(totalClaimed)}</Typography>
                </Box>
              </Paper>

              {/* 12. Bank */}
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ borderBottom: '2px solid', borderColor: 'primary.main', pb: 0.5 }}>
                  12. Bank Details
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField fullWidth size="small" label="Name of the Bank" value={bankName} onChange={e => setBankName(e.target.value)} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField fullWidth size="small" label="SB A/c No." value={sbAccountNo} onChange={e => setSbAccountNo(e.target.value)} />
                  </Grid>
                  <Grid size={{ xs: 6, md: 2 }}>
                    <TextField fullWidth size="small" label="MICR Code" value={micrCode} onChange={e => setMicrCode(e.target.value)} />
                  </Grid>
                  <Grid size={{ xs: 6, md: 2 }}>
                    <TextField fullWidth size="small" label="IFSC Code" value={ifscCode} onChange={e => setIfscCode(e.target.value)} />
                  </Grid>
                </Grid>
              </Paper>

              {/* Declaration */}
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ borderBottom: '2px solid', borderColor: 'primary.main', pb: 0.5 }}>
                  Declaration
                </Typography>
                <Alert severity="info" sx={{ mt: 1, mb: 2, fontSize: '0.85rem' }}>
                  I hereby declare that the statements made in the application are true to the best of my knowledge and belief and the person for whom medical expenses were incurred is wholly dependent on me. I am a CGHS beneficiary and the CGHS card was valid at the time of treatment. I agree for the reimbursement as is admissible under the rules.
                </Alert>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <TextField fullWidth size="small" type="date" label="Date" value={declDate} onChange={e => setDeclDate(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
                  </Grid>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <TextField fullWidth size="small" label="Place" value={declPlace} onChange={e => setDeclPlace(e.target.value)} />
                  </Grid>
                </Grid>
              </Paper>

              <Alert severity="warning" sx={{ mb: 2 }}>
                <strong>Print includes 4 pages:</strong> Page 1 — Main Form, Page 2 — Documents to be attached + Important notes, Page 3 — Annexure I, Page 4 — Annexure II + NOC. Switch to <strong>"Preview &amp; Edit"</strong> tab to see/edit the document before printing.
              </Alert>
            </>
          )}

          {/* ═══════════════════════════════════════════════════ */}
          {/* ═══════════ TAB 1: PREVIEW & EDIT ════════════════ */}
          {/* ═══════════════════════════════════════════════════ */}
          {activeTab === 1 && (
            <>
              {/* ── Formatting Toolbar ── */}
              <Paper sx={{ p: 1, mb: 2, display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
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

                <Tooltip title="Undo"><IconButton size="small" onMouseDown={pd} onClick={() => execCmd('undo')}><UndoIcon fontSize="small" /></IconButton></Tooltip>
                <Tooltip title="Redo"><IconButton size="small" onMouseDown={pd} onClick={() => execCmd('redo')}><RedoIcon fontSize="small" /></IconButton></Tooltip>

                <Box sx={{ flexGrow: 1 }} />

                <Tooltip title="Refresh from form data">
                  <Button size="small" startIcon={<RefreshIcon />} onMouseDown={pd} onClick={loadPreview} sx={{ mr: 1 }}>
                    Refresh
                  </Button>
                </Tooltip>
                <Button variant="contained" size="small" startIcon={<PrintIcon />} onClick={handlePrintFromPreview}>
                  Print Edited
                </Button>
              </Paper>

              <Alert severity="info" sx={{ mb: 2 }}>
                Click anywhere on the document below to edit text directly. Use the toolbar for formatting. Click <strong>"Print Edited"</strong> to print with your changes. Click <strong>"Refresh"</strong> to reload from form data (edits will be lost).
              </Alert>

              {/* ── Document Preview (iframe) ── */}
              <Box sx={{
                bgcolor: '#e0e0e0',
                borderRadius: 2,
                p: 3,
                display: 'flex',
                justifyContent: 'center',
              }}>
                <Box sx={{
                  width: '100%',
                  maxWidth: 900,
                  boxShadow: '0 4px 30px rgba(0,0,0,0.5)',
                  borderRadius: 1,
                  overflow: 'hidden',
                }}>
                  <iframe
                    ref={iframeRef}
                    title="Document Preview"
                    style={{
                      width: '100%',
                      minHeight: 1200,
                      border: 'none',
                      background: '#fff',
                      display: 'block',
                    }}
                  />
                </Box>
              </Box>
            </>
          )}

        </Box>
      </Box>
    </ThemeProvider>
  );
}
