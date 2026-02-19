import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Grid, Button, IconButton, Divider, Alert,
  FormControl, InputLabel, Select, MenuItem, Chip, Tabs, Tab, Tooltip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, Checkbox, FormControlLabel,
  LinearProgress, Badge,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import HomeIcon from '@mui/icons-material/Home';
import BuildIcon from '@mui/icons-material/Build';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import PreviewIcon from '@mui/icons-material/Preview';
import CodeIcon from '@mui/icons-material/Code';
import EditIcon from '@mui/icons-material/Edit';
import PrintIcon from '@mui/icons-material/Print';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url,
).toString();

const darkTheme = createTheme({
  palette: { mode: 'dark', primary: { main: '#10b981' }, background: { default: '#0f172a', paper: '#1e293b' } },
});

type FieldType = 'text' | 'number' | 'date' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file';

interface FormField {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder: string;
  options: string[]; // For select/radio
  gridCols: number; // 3,4,6,12
  section: string;
  defaultValue: string;
  helperText: string;
  validation: string; // regex pattern
}

interface FormSection {
  id: string;
  title: string;
  description: string;
}

const fieldTypes: { value: FieldType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'email', label: 'Email' },
  { value: 'tel', label: 'Phone' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'select', label: 'Dropdown' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'radio', label: 'Radio Group' },
  { value: 'file', label: 'File Upload' },
];

const gridOptions = [
  { value: 3, label: '25% (3/12)' },
  { value: 4, label: '33% (4/12)' },
  { value: 6, label: '50% (6/12)' },
  { value: 12, label: '100% (12/12)' },
];

const createField = (section: string = 'default'): FormField => ({
  id: `field_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  label: '', type: 'text', required: false, placeholder: '',
  options: [], gridCols: 6, section, defaultValue: '', helperText: '', validation: '',
});

const createSection = (): FormSection => ({
  id: `sec_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  title: '', description: '',
});

// ── Document Parsing ──

async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((item: any) => ('str' in item ? item.str : ''))
      .join(' ');
    pages.push(text);
  }
  return pages.join('\n\n');
}

async function extractTextFromDOCX(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

async function extractTextFromFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  if (name.endsWith('.pdf')) return extractTextFromPDF(file);
  if (name.endsWith('.docx') || name.endsWith('.doc')) return extractTextFromDOCX(file);
  if (name.endsWith('.txt') || name.endsWith('.csv') || name.endsWith('.rtf'))
    return file.text();
  throw new Error('Unsupported file type. Use PDF, DOCX, DOC, or TXT.');
}

// ── Smart Field Detection ──

interface DetectedField {
  label: string;
  type: FieldType;
  gridCols: number;
  options: string[];
  required: boolean;
  confidence: 'high' | 'medium' | 'low';
  source: string; // the line it was detected from
}

function inferFieldType(label: string, context: string): { type: FieldType; gridCols: number; options: string[] } {
  const l = label.toLowerCase();
  const c = context.toLowerCase();

  // Date patterns
  if (/\b(date|dob|d\.o\.b|joining|retirement|birth|from\s*date|to\s*date|period|w\.e\.f|wef)\b/i.test(l))
    return { type: 'date', gridCols: 4, options: [] };

  // Amount / money
  if (/\b(amount|₹|rs\.?|rupee|salary|pay|cost|price|fee|charge|total|sum|expenditure|deduction|reimbursement|claim|advance|loan|emi|instalment)\b/i.test(l))
    return { type: 'number', gridCols: 4, options: [] };

  // Number fields
  if (/\b(number|no\.|no\b|count|quantity|age|year|month|day|pin\s*code|pincode|zip|id\s*no|roll\s*no)\b/i.test(l))
    return { type: 'number', gridCols: 4, options: [] };

  // Phone
  if (/\b(phone|mobile|cell|tel|telephone|contact\s*no|fax)\b/i.test(l))
    return { type: 'tel', gridCols: 4, options: [] };

  // Email
  if (/\b(email|e-mail|mail\s*id)\b/i.test(l))
    return { type: 'email', gridCols: 6, options: [] };

  // Yes/No checkbox patterns
  if (/\b(whether|if\s+yes|yes\s*\/\s*no|tick|check)\b/i.test(l) || /\byes\s*\/\s*no\b/i.test(c))
    return { type: 'checkbox', gridCols: 6, options: [] };

  // Select/dropdown with embedded options using / separator
  const slashOptions = l.match(/\(([^)]*\/[^)]*)\)/);
  if (slashOptions) {
    const opts = slashOptions[1].split('/').map(o => o.trim()).filter(Boolean);
    if (opts.length >= 2 && opts.length <= 8)
      return { type: 'select', gridCols: 6, options: opts };
  }

  // Common dropdowns
  if (/\b(type\s+of|category|class|group|gender|sex|marital|status|mode|nature|relation)\b/i.test(l)) {
    // Try to find options in context
    if (/gender|sex/i.test(l)) return { type: 'select', gridCols: 4, options: ['Male', 'Female', 'Other'] };
    if (/marital/i.test(l)) return { type: 'select', gridCols: 4, options: ['Single', 'Married', 'Widow/Widower', 'Divorced'] };
    if (/group/i.test(l) && /\b(a|b|c|d)\b/i.test(c)) return { type: 'select', gridCols: 4, options: ['A', 'B', 'C', 'D'] };
    return { type: 'select', gridCols: 6, options: [] };
  }

  // Textarea for long text
  if (/\b(address|description|detail|particular|purpose|reason|remark|note|comment|observation|declaration|specify|explain)\b/i.test(l))
    return { type: 'textarea', gridCols: 12, options: [] };

  // File upload
  if (/\b(attach|upload|document|certificate|photo|passport\s*size|enclos)\b/i.test(l))
    return { type: 'file', gridCols: 6, options: [] };

  // Default text
  return { type: 'text', gridCols: 6, options: [] };
}

function detectFieldsFromText(text: string): { fields: DetectedField[]; sections: { title: string; fieldIndices: number[] }[] } {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const detected: DetectedField[] = [];
  const sectionHeaders: { title: string; lineIdx: number; fieldIndices: number[] }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const context = lines.slice(Math.max(0, i - 1), Math.min(lines.length, i + 2)).join(' ');

    // Skip very short or very long lines
    if (line.length < 3 || line.length > 500) continue;

    // Detect section headers: ALL CAPS lines, or lines ending with ":"  with no fill indicator
    if (/^[A-Z\s\-&/()]{6,80}$/.test(line) && !/[_.:]{3}/.test(line) && !/:/.test(line)) {
      sectionHeaders.push({
        title: line.replace(/^[\d.)\s]+/, '').trim(),
        lineIdx: i,
        fieldIndices: [],
      });
      continue;
    }

    // Pattern 1: "Label : ___" or "Label: ___" or "Label : "
    const colonPattern = line.match(/^[\d.)]*\s*(.+?)\s*[:]\s*[_.\s-]*$/);
    if (colonPattern) {
      const label = colonPattern[1].replace(/^\d+[.)]\s*/, '').trim();
      if (label.length >= 2 && label.length <= 100) {
        const { type, gridCols, options } = inferFieldType(label, context);
        const fieldIdx = detected.length;
        detected.push({ label, type, gridCols, options, required: false, confidence: 'high', source: line });
        // Assign to nearest section
        if (sectionHeaders.length > 0) sectionHeaders[sectionHeaders.length - 1].fieldIndices.push(fieldIdx);
        continue;
      }
    }

    // Pattern 2: "1. Label ___________" or "a) Label _______"
    const numberedPattern = line.match(/^[\d]+[.)]\s+(.+?)\s*[_]{2,}/);
    if (numberedPattern) {
      const label = numberedPattern[1].trim();
      if (label.length >= 2 && label.length <= 100) {
        const { type, gridCols, options } = inferFieldType(label, context);
        const fieldIdx = detected.length;
        detected.push({ label, type, gridCols, options, required: false, confidence: 'high', source: line });
        if (sectionHeaders.length > 0) sectionHeaders[sectionHeaders.length - 1].fieldIndices.push(fieldIdx);
        continue;
      }
    }

    // Pattern 3: "Label" followed by blank underscores on the line
    const underscorePattern = line.match(/^[\d.)]*\s*(.+?)\s+[_]{3,}/);
    if (underscorePattern) {
      const label = underscorePattern[1].replace(/^\d+[.)]\s*/, '').trim();
      if (label.length >= 2 && label.length <= 80 && !/^[_\s.-]+$/.test(label)) {
        const { type, gridCols, options } = inferFieldType(label, context);
        const fieldIdx = detected.length;
        detected.push({ label, type, gridCols, options, required: false, confidence: 'medium', source: line });
        if (sectionHeaders.length > 0) sectionHeaders[sectionHeaders.length - 1].fieldIndices.push(fieldIdx);
        continue;
      }
    }

    // Pattern 4: Numbered items that look like field labels (e.g., "1. Name of the Employee")
    const numberedLabel = line.match(/^[\d]+[.)]\s+(.{3,80})$/);
    if (numberedLabel) {
      const label = numberedLabel[1].replace(/[:\s_.-]+$/, '').trim();
      // Skip if it looks like a section header (all caps)
      if (label.length >= 3 && !/^[A-Z\s]+$/.test(label)) {
        const { type, gridCols, options } = inferFieldType(label, context);
        const fieldIdx = detected.length;
        detected.push({ label, type, gridCols, options, required: false, confidence: 'low', source: line });
        if (sectionHeaders.length > 0) sectionHeaders[sectionHeaders.length - 1].fieldIndices.push(fieldIdx);
        continue;
      }
    }

    // Pattern 5: "(a) Label" or "(i) Label" lettered/roman items
    const letteredPattern = line.match(/^\(?[a-z]|[ivxlc]+\)?\s+(.{3,80})/i);
    if (letteredPattern && /[:_]/.test(line)) {
      const label = letteredPattern[1].replace(/[:\s_.-]+$/, '').trim();
      if (label.length >= 3) {
        const { type, gridCols, options } = inferFieldType(label, context);
        const fieldIdx = detected.length;
        detected.push({ label, type, gridCols, options, required: false, confidence: 'low', source: line });
        if (sectionHeaders.length > 0) sectionHeaders[sectionHeaders.length - 1].fieldIndices.push(fieldIdx);
      }
    }
  }

  return {
    fields: detected,
    sections: sectionHeaders.filter(s => s.fieldIndices.length > 0),
  };
}

function generateReactCode(
  formTitle: string, formSubtitle: string, sections: FormSection[], fields: FormField[],
  includeprint: boolean, appName: string,
): string {
  const stateLines: string[] = [];
  const fieldVarMap: Record<string, string> = {};

  fields.forEach(f => {
    const varName = f.label
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .split(/\s+/)
      .map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join('') || f.id;
    const setter = 'set' + varName.charAt(0).toUpperCase() + varName.slice(1);
    fieldVarMap[f.id] = varName;
    const defaultVal = f.type === 'checkbox' ? 'false' : f.type === 'number' ? '0' : `'${f.defaultValue || ''}'`;
    stateLines.push(`  const [${varName}, ${setter}] = useState(${defaultVal});`);
  });

  const renderField = (f: FormField): string => {
    const varName = fieldVarMap[f.id];
    const setter = 'set' + varName.charAt(0).toUpperCase() + varName.slice(1);
    const req = f.required ? ' required' : '';
    const helper = f.helperText ? ` helperText="${f.helperText}"` : '';

    switch (f.type) {
      case 'text': case 'email': case 'tel':
        return `                  <Grid size={{ xs: 12, sm: ${f.gridCols} }}>
                    <TextField fullWidth size="small" label="${f.label}" type="${f.type}" value={${varName}} onChange={(e) => ${setter}(e.target.value)} placeholder="${f.placeholder}"${req}${helper} />
                  </Grid>`;
      case 'number':
        return `                  <Grid size={{ xs: 12, sm: ${f.gridCols} }}>
                    <TextField fullWidth size="small" label="${f.label}" type="number" value={${varName}} onChange={(e) => ${setter}(Number(e.target.value) || 0)}${req}${helper} />
                  </Grid>`;
      case 'date':
        return `                  <Grid size={{ xs: 12, sm: ${f.gridCols} }}>
                    <TextField fullWidth size="small" label="${f.label}" type="date" value={${varName}} onChange={(e) => ${setter}(e.target.value)} slotProps={{ inputLabel: { shrink: true } }}${req}${helper} />
                  </Grid>`;
      case 'textarea':
        return `                  <Grid size={{ xs: 12, sm: ${f.gridCols} }}>
                    <TextField fullWidth size="small" label="${f.label}" multiline rows={3} value={${varName}} onChange={(e) => ${setter}(e.target.value)} placeholder="${f.placeholder}"${req}${helper} />
                  </Grid>`;
      case 'select':
        return `                  <Grid size={{ xs: 12, sm: ${f.gridCols} }}>
                    <FormControl fullWidth size="small"${req}>
                      <InputLabel>${f.label}</InputLabel>
                      <Select value={${varName}} label="${f.label}" onChange={(e) => ${setter}(e.target.value)}>
${f.options.map(o => `                        <MenuItem value="${o}">${o}</MenuItem>`).join('\n')}
                      </Select>
                    </FormControl>
                  </Grid>`;
      case 'checkbox':
        return `                  <Grid size={{ xs: 12, sm: ${f.gridCols} }}>
                    <FormControlLabel control={<Checkbox checked={${varName}} onChange={(e) => ${setter}(e.target.checked)} />} label="${f.label}" />
                  </Grid>`;
      case 'radio':
        return `                  <Grid size={{ xs: 12, sm: ${f.gridCols} }}>
                    <FormControl>
                      <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>${f.label}</Typography>
                      {[${f.options.map(o => `'${o}'`).join(', ')}].map(opt => (
                        <FormControlLabel key={opt} value={opt} control={<Radio checked={${varName} === opt} onChange={() => ${setter}(opt)} />} label={opt} />
                      ))}
                    </FormControl>
                  </Grid>`;
      case 'file':
        return `                  <Grid size={{ xs: 12, sm: ${f.gridCols} }}>
                    <Button variant="outlined" component="label" fullWidth>
                      ${f.label}
                      <input type="file" hidden onChange={(e) => ${setter}(e.target.files?.[0]?.name || '')} />
                    </Button>
                    {${varName} && <Typography variant="caption">{${varName}}</Typography>}
                  </Grid>`;
      default:
        return '';
    }
  };

  const sectionBlocks = sections.map(sec => {
    const secFields = fields.filter(f => f.section === sec.id);
    if (secFields.length === 0) return '';
    return `
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>${sec.title}</Typography>
                ${sec.description ? `<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>${sec.description}</Typography>` : ''}
                <Grid container spacing={2}>
${secFields.map(renderField).join('\n')}
                </Grid>
              </Paper>`;
  }).filter(Boolean).join('\n');

  // Default section fields
  const defaultFields = fields.filter(f => f.section === 'default');
  const defaultBlock = defaultFields.length > 0 ? `
              <Paper sx={{ p: 3, mb: 3 }}>
                <Grid container spacing={2}>
${defaultFields.map(renderField).join('\n')}
                </Grid>
              </Paper>` : '';

  const printFieldRows = fields
    .filter(f => f.type !== 'file')
    .map(f => {
      const v = fieldVarMap[f.id];
      return '      <div class="row"><div class="lbl">' + f.label + ':</div><div class="val">${' + v + " || '___'}</div></div>";
    })
    .join('\n');

  const printFn = includeprint ? [
    '',
    '  const handlePrint = () => {',
    "    const w = window.open('', '_blank');",
    '    if (!w) return;',
    "    const today = new Date().toLocaleDateString('en-IN');",
    '    w.document.write(`<html><head><title>' + formTitle + '</title><style>',
    "      body{font-family:'Times New Roman',serif;padding:25px 40px;color:#000;font-size:13px;line-height:1.5}",
    '      .hdr{text-align:center;margin-bottom:15px}.hdr h2{margin:0;font-size:16px;text-decoration:underline}',
    '      .row{display:flex;margin-bottom:6px}.row .lbl{width:280px;font-weight:bold;font-size:12px}.row .val{flex:1;border-bottom:1px dotted #333;padding-left:6px;font-size:12px}',
    '      .sig{display:flex;justify-content:space-between;margin-top:40px;font-size:11px}',
    '    </style></head><body>',
    '      <div class="hdr"><h2>' + formTitle.toUpperCase() + '</h2>' + (formSubtitle ? '<p>' + formSubtitle + '</p>' : '') + '</div>',
    printFieldRows,
    '      <div class="sig"><div>Place: ___<br/>Date: ${today}</div><div>Signature: ___</div></div>',
    '    </body></html>`);',
    '    w.document.close();',
    '    w.print();',
    '  };',
    '',
  ].join('\n') : '';

  const printButton = includeprint
    ? `            <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint}>Print Form</Button>`
    : '';

  const imports = [
    `import { useState } from 'react';`,
    `import { Link } from 'react-router-dom';`,
    `import {`,
    `  Box, Paper, Typography, TextField, Grid, Button, IconButton,${fields.some(f => f.type === 'select') ? '\n  FormControl, InputLabel, Select, MenuItem,' : ''}${fields.some(f => f.type === 'checkbox') ? '\n  Checkbox, FormControlLabel,' : ''}${fields.some(f => f.type === 'radio') ? '\n  FormControl, Radio, FormControlLabel,' : ''}`,
    `} from '@mui/material';`,
    `import { ThemeProvider, createTheme } from '@mui/material/styles';`,
    `import CssBaseline from '@mui/material/CssBaseline';`,
    `import HomeIcon from '@mui/icons-material/Home';`,
    includeprint ? `import PrintIcon from '@mui/icons-material/Print';` : '',
  ].filter(Boolean).join('\n');

  return `${imports}

const darkTheme = createTheme({
  palette: { mode: 'dark', primary: { main: '#10b981' }, background: { default: '#0f172a', paper: '#1e293b' } },
});

export default function App() {
${stateLines.join('\n')}
${printFn}
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', p: 3 }}>
        <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
            <IconButton component={Link} to="/" size="small"><HomeIcon /></IconButton>
            <Typography variant="h5" fontWeight={600} color="primary.main">${formTitle}</Typography>
            <Box sx={{ flexGrow: 1 }} />
${printButton}
          </Box>
${defaultBlock}
${sectionBlocks}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
`;
}

export default function App() {
  const [tab, setTab] = useState(0);
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [appName, setAppName] = useState('');
  const [includeprint, setIncludePrint] = useState(true);
  const [referenceText, setReferenceText] = useState('');

  const [sections, setSections] = useState<FormSection[]>([]);
  const [fields, setFields] = useState<FormField[]>([]);

  const [editField, setEditField] = useState<FormField | null>(null);
  const [editDialog, setEditDialog] = useState(false);
  const [copied, setCopied] = useState(false);

  // Upload & detection state
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [detectedFields, setDetectedFields] = useState<DetectedField[]>([]);
  const [detectedSections, setDetectedSections] = useState<{ title: string; fieldIndices: number[] }[]>([]);
  const [selectedDetected, setSelectedDetected] = useState<Set<number>>(new Set());
  const [showDetectionDialog, setShowDetectionDialog] = useState(false);
  const [extractedText, setExtractedText] = useState('');

  // File upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError('');
    try {
      const text = await extractTextFromFile(file);
      setExtractedText(text);
      setReferenceText(text);

      // Auto-detect title from first meaningful line
      const firstLine = text.split('\n').map(l => l.trim()).find(l => l.length > 5 && l.length < 100);
      if (firstLine && !formTitle) setFormTitle(firstLine.replace(/^[\d.)\s]+/, ''));

      // Detect fields
      const { fields: df, sections: ds } = detectFieldsFromText(text);
      setDetectedFields(df);
      setDetectedSections(ds);
      setSelectedDetected(new Set(df.map((_, i) => i))); // select all by default
      if (df.length > 0) setShowDetectionDialog(true);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to parse file');
    } finally {
      setUploading(false);
      // Reset input so same file can be re-uploaded
      e.target.value = '';
    }
  };

  // Apply detected fields
  const applyDetectedFields = () => {
    const selected = Array.from(selectedDetected).sort((a, b) => a - b);
    const newFields = selected.map(i => {
      const df = detectedFields[i];
      return {
        ...createField('default'),
        label: df.label,
        type: df.type,
        gridCols: df.gridCols,
        options: df.options,
        required: df.required,
      };
    });

    // Create sections and assign fields
    if (detectedSections.length > 0) {
      const newSections: FormSection[] = [];
      const fieldSectionMap = new Map<number, string>();

      detectedSections.forEach(ds => {
        const sec = createSection();
        sec.title = ds.title;
        newSections.push(sec);
        ds.fieldIndices.forEach(fi => {
          if (selectedDetected.has(fi)) fieldSectionMap.set(fi, sec.id);
        });
      });

      // Assign sections to fields
      let fieldIdx = 0;
      selected.forEach((origIdx, arrIdx) => {
        const secId = fieldSectionMap.get(origIdx);
        if (secId) newFields[arrIdx].section = secId;
      });

      setSections(s => [...s, ...newSections]);
    }

    setFields(f => [...f, ...newFields]);
    setShowDetectionDialog(false);
  };

  const toggleDetected = (idx: number) => {
    setSelectedDetected(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const toggleAllDetected = () => {
    if (selectedDetected.size === detectedFields.length) setSelectedDetected(new Set());
    else setSelectedDetected(new Set(detectedFields.map((_, i) => i)));
  };

  // Section management
  const addSection = () => setSections(s => [...s, createSection()]);
  const removeSection = (id: string) => {
    setSections(s => s.filter(x => x.id !== id));
    setFields(f => f.map(x => x.section === id ? { ...x, section: 'default' } : x));
  };
  const updateSection = (id: string, key: keyof FormSection, value: string) =>
    setSections(s => s.map(x => x.id === id ? { ...x, [key]: value } : x));

  // Field management
  const addField = (section: string = 'default') => setFields(f => [...f, createField(section)]);
  const removeField = (id: string) => setFields(f => f.filter(x => x.id !== id));
  const updateField = (id: string, updates: Partial<FormField>) =>
    setFields(f => f.map(x => x.id === id ? { ...x, ...updates } : x));
  const moveField = (id: string, dir: -1 | 1) => {
    setFields(f => {
      const idx = f.findIndex(x => x.id === id);
      if (idx < 0 || (dir === -1 && idx === 0) || (dir === 1 && idx === f.length - 1)) return f;
      const arr = [...f];
      [arr[idx], arr[idx + dir]] = [arr[idx + dir], arr[idx]];
      return arr;
    });
  };

  const openEdit = (field: FormField) => { setEditField({ ...field }); setEditDialog(true); };
  const saveEdit = () => {
    if (editField) updateField(editField.id, editField);
    setEditDialog(false);
    setEditField(null);
  };

  const generatedCode = useMemo(() =>
    generateReactCode(formTitle || 'My Form', formSubtitle, sections, fields, includeprint, appName || 'my-form'),
    [formTitle, formSubtitle, sections, fields, includeprint, appName]
  );

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [generatedCode]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([generatedCode], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'App.tsx';
    a.click();
    URL.revokeObjectURL(url);
  }, [generatedCode]);

  // Quick add from common patterns
  const quickAddPatterns = [
    { label: 'Name', fields: [{ label: 'Full Name', type: 'text' as FieldType, gridCols: 6 }] },
    { label: 'Date', fields: [{ label: 'Date', type: 'date' as FieldType, gridCols: 4 }] },
    { label: 'Address Block', fields: [
      { label: 'Address Line 1', type: 'text' as FieldType, gridCols: 12 },
      { label: 'City', type: 'text' as FieldType, gridCols: 4 },
      { label: 'State', type: 'text' as FieldType, gridCols: 4 },
      { label: 'PIN Code', type: 'text' as FieldType, gridCols: 4 },
    ]},
    { label: 'Employee Details', fields: [
      { label: 'Employee Name', type: 'text' as FieldType, gridCols: 6 },
      { label: 'Designation', type: 'text' as FieldType, gridCols: 6 },
      { label: 'Employee ID', type: 'text' as FieldType, gridCols: 4 },
      { label: 'Department', type: 'text' as FieldType, gridCols: 4 },
      { label: 'Pay Level', type: 'text' as FieldType, gridCols: 4 },
    ]},
    { label: 'Amount (₹)', fields: [{ label: 'Amount (₹)', type: 'number' as FieldType, gridCols: 4 }] },
    { label: 'Yes/No', fields: [{ label: 'Agree', type: 'checkbox' as FieldType, gridCols: 6 }] },
    { label: 'Phone + Email', fields: [
      { label: 'Phone', type: 'tel' as FieldType, gridCols: 6 },
      { label: 'Email', type: 'email' as FieldType, gridCols: 6 },
    ]},
    { label: 'Remarks', fields: [{ label: 'Remarks', type: 'textarea' as FieldType, gridCols: 12 }] },
  ];

  const quickAdd = (pattern: typeof quickAddPatterns[0]) => {
    const newFields = pattern.fields.map(pf => ({
      ...createField('default'),
      label: pf.label,
      type: pf.type,
      gridCols: pf.gridCols,
    }));
    setFields(f => [...f, ...newFields]);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', p: 3 }}>
        <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
            <IconButton component={Link} to="/" size="small"><HomeIcon /></IconButton>
            <BuildIcon sx={{ color: 'primary.main', fontSize: 32 }} />
            <Typography variant="h5" fontWeight={600} color="primary.main">Form → Code Generator</Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Chip label={`${fields.length} fields`} size="small" />
            <Chip label={`${sections.length} sections`} size="small" />
          </Box>

          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
            <Tab icon={<EditIcon />} iconPosition="start" label="Build Form" />
            <Tab icon={<PreviewIcon />} iconPosition="start" label="Preview" />
            <Tab icon={<CodeIcon />} iconPosition="start" label="Generated Code" />
          </Tabs>

          {/* TAB 0: Build Form */}
          {tab === 0 && (
            <Grid container spacing={3}>
              {/* Left: Reference Text */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" gutterBottom>Form Settings</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField fullWidth size="small" label="Form Title" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="e.g., Leave Application Form" />
                    <TextField fullWidth size="small" label="Subtitle / Rule Reference" value={formSubtitle} onChange={(e) => setFormSubtitle(e.target.value)} placeholder="e.g., CCS(Leave) Rules 1972" />
                    <TextField fullWidth size="small" label="App Folder Name" value={appName} onChange={(e) => setAppName(e.target.value)} placeholder="e.g., leave-form" />
                    <FormControlLabel control={<Checkbox checked={includeprint} onChange={(e) => setIncludePrint(e.target.checked)} />} label="Include Print/PDF Function" />
                  </Box>
                </Paper>

                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" gutterBottom>Upload Document</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
                    Upload a PDF, DOCX, or TXT file — fields will be auto-detected
                  </Typography>

                  <Button
                    variant="outlined" fullWidth component="label"
                    startIcon={<UploadFileIcon />}
                    disabled={uploading}
                    sx={{ mb: 1.5, borderStyle: 'dashed', py: 1.5 }}
                  >
                    {uploading ? 'Parsing document...' : 'Upload PDF / DOCX / TXT'}
                    <input type="file" hidden accept=".pdf,.docx,.doc,.txt,.rtf,.csv" onChange={handleFileUpload} />
                  </Button>
                  {uploading && <LinearProgress sx={{ mb: 1 }} />}
                  {uploadError && <Alert severity="error" sx={{ mb: 1 }}>{uploadError}</Alert>}
                  {extractedText && !uploading && (
                    <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 1.5 }}>
                      Extracted {extractedText.split('\n').length} lines — {detectedFields.length} fields detected
                    </Alert>
                  )}

                  <Divider sx={{ my: 1.5 }} />
                  <Typography variant="subtitle2" gutterBottom>Reference Text</Typography>
                  <TextField
                    fullWidth multiline rows={8} size="small"
                    placeholder="Paste form text or upload a file above...&#10;The text appears here for reference."
                    value={referenceText} onChange={(e) => setReferenceText(e.target.value)}
                    sx={{ fontFamily: 'monospace', fontSize: 11 }}
                  />
                  {referenceText && !extractedText && (
                    <Button
                      size="small" startIcon={<AutoFixHighIcon />} sx={{ mt: 1 }}
                      onClick={() => {
                        const { fields: df, sections: ds } = detectFieldsFromText(referenceText);
                        setDetectedFields(df);
                        setDetectedSections(ds);
                        setSelectedDetected(new Set(df.map((_, i) => i)));
                        if (df.length > 0) setShowDetectionDialog(true);
                      }}
                    >
                      Detect Fields from Text
                    </Button>
                  )}
                </Paper>

                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>Quick Add</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    Click to quickly add common field patterns
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {quickAddPatterns.map(p => (
                      <Chip
                        key={p.label} label={p.label} size="small"
                        onClick={() => quickAdd(p)}
                        sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'primary.main', color: 'white' } }}
                      />
                    ))}
                  </Box>
                </Paper>
              </Grid>

              {/* Right: Field Builder */}
              <Grid size={{ xs: 12, md: 8 }}>
                {/* Sections */}
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Sections</Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    <Button startIcon={<AddIcon />} size="small" onClick={addSection}>Add Section</Button>
                  </Box>
                  {sections.length === 0 && (
                    <Typography variant="body2" color="text.secondary">No sections — all fields go into a single block. Add sections to group fields.</Typography>
                  )}
                  {sections.map(sec => (
                    <Box key={sec.id} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                      <TextField size="small" placeholder="Section Title" value={sec.title} onChange={(e) => updateSection(sec.id, 'title', e.target.value)} sx={{ flex: 1 }} />
                      <TextField size="small" placeholder="Description (optional)" value={sec.description} onChange={(e) => updateSection(sec.id, 'description', e.target.value)} sx={{ flex: 1 }} />
                      <IconButton size="small" color="error" onClick={() => removeSection(sec.id)}><DeleteIcon fontSize="small" /></IconButton>
                    </Box>
                  ))}
                </Paper>

                {/* Fields */}
                <Paper sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Form Fields ({fields.length})</Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    <FormControl size="small" sx={{ minWidth: 150, mr: 1 }}>
                      <InputLabel>Add to Section</InputLabel>
                      <Select value="default" label="Add to Section" onChange={(e) => addField(e.target.value)}>
                        <MenuItem value="default">Default (no section)</MenuItem>
                        {sections.map(s => <MenuItem key={s.id} value={s.id}>{s.title || 'Untitled'}</MenuItem>)}
                      </Select>
                    </FormControl>
                    <Button startIcon={<AddIcon />} onClick={() => addField()}>Add Field</Button>
                  </Box>

                  {fields.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography color="text.secondary" sx={{ mb: 1 }}>No fields yet. Add fields manually or use Quick Add patterns.</Typography>
                      <Typography variant="caption" color="text.secondary">Each field becomes a form input in the generated React app.</Typography>
                    </Box>
                  )}

                  <TableContainer>
                    <Table size="small">
                      {fields.length > 0 && (
                        <TableHead>
                          <TableRow>
                            <TableCell width={40}></TableCell>
                            <TableCell>Label</TableCell>
                            <TableCell width={100}>Type</TableCell>
                            <TableCell width={80}>Width</TableCell>
                            <TableCell width={90}>Section</TableCell>
                            <TableCell width={50}>Req</TableCell>
                            <TableCell width={120}>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                      )}
                      <TableBody>
                        {fields.map((f, idx) => (
                          <TableRow key={f.id} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                            <TableCell>
                              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <IconButton size="small" disabled={idx === 0} onClick={() => moveField(f.id, -1)}><ArrowUpwardIcon sx={{ fontSize: 14 }} /></IconButton>
                                <IconButton size="small" disabled={idx === fields.length - 1} onClick={() => moveField(f.id, 1)}><ArrowDownwardIcon sx={{ fontSize: 14 }} /></IconButton>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <TextField
                                size="small" variant="standard" fullWidth
                                placeholder="Field Label"
                                value={f.label} onChange={(e) => updateField(f.id, { label: e.target.value })}
                              />
                            </TableCell>
                            <TableCell>
                              <Select
                                size="small" variant="standard" value={f.type}
                                onChange={(e) => updateField(f.id, { type: e.target.value as FieldType })}
                              >
                                {fieldTypes.map(t => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Select
                                size="small" variant="standard" value={f.gridCols}
                                onChange={(e) => updateField(f.id, { gridCols: Number(e.target.value) })}
                              >
                                {gridOptions.map(g => <MenuItem key={g.value} value={g.value}>{g.label}</MenuItem>)}
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Select
                                size="small" variant="standard" value={f.section}
                                onChange={(e) => updateField(f.id, { section: e.target.value })}
                              >
                                <MenuItem value="default">—</MenuItem>
                                {sections.map(s => <MenuItem key={s.id} value={s.id}>{s.title?.slice(0, 10) || '?'}</MenuItem>)}
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Checkbox size="small" checked={f.required} onChange={(e) => updateField(f.id, { required: e.target.checked })} />
                            </TableCell>
                            <TableCell>
                              <IconButton size="small" onClick={() => openEdit(f)}><EditIcon fontSize="small" /></IconButton>
                              <IconButton size="small" color="error" onClick={() => removeField(f.id)}><DeleteIcon fontSize="small" /></IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
            </Grid>
          )}

          {/* TAB 1: Preview */}
          {tab === 1 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom color="primary.main">{formTitle || 'Form Preview'}</Typography>
              {formSubtitle && <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{formSubtitle}</Typography>}

              {/* Default section fields */}
              {fields.filter(f => f.section === 'default').length > 0 && (
                <Paper sx={{ p: 2, mb: 2, bgcolor: 'action.hover' }}>
                  <Grid container spacing={2}>
                    {fields.filter(f => f.section === 'default').map(f => (
                      <Grid key={f.id} size={{ xs: 12, sm: f.gridCols }}>
                        {f.type === 'checkbox' ? (
                          <FormControlLabel control={<Checkbox />} label={f.label || 'Untitled'} />
                        ) : f.type === 'select' ? (
                          <FormControl fullWidth size="small">
                            <InputLabel>{f.label || 'Untitled'}</InputLabel>
                            <Select label={f.label || 'Untitled'}>
                              {f.options.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                            </Select>
                          </FormControl>
                        ) : f.type === 'textarea' ? (
                          <TextField fullWidth size="small" label={f.label || 'Untitled'} multiline rows={3} placeholder={f.placeholder} />
                        ) : f.type === 'file' ? (
                          <Button variant="outlined" fullWidth>{f.label || 'Upload File'}</Button>
                        ) : (
                          <TextField
                            fullWidth size="small"
                            label={f.label || 'Untitled'} type={f.type}
                            placeholder={f.placeholder}
                            required={f.required}
                            helperText={f.helperText}
                            slotProps={f.type === 'date' ? { inputLabel: { shrink: true } } : undefined}
                          />
                        )}
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              )}

              {/* Section blocks */}
              {sections.map(sec => {
                const secFields = fields.filter(f => f.section === sec.id);
                if (secFields.length === 0) return null;
                return (
                  <Paper key={sec.id} sx={{ p: 2, mb: 2, bgcolor: 'action.hover' }}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>{sec.title || 'Untitled Section'}</Typography>
                    {sec.description && <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{sec.description}</Typography>}
                    <Grid container spacing={2}>
                      {secFields.map(f => (
                        <Grid key={f.id} size={{ xs: 12, sm: f.gridCols }}>
                          {f.type === 'checkbox' ? (
                            <FormControlLabel control={<Checkbox />} label={f.label || 'Untitled'} />
                          ) : f.type === 'select' ? (
                            <FormControl fullWidth size="small">
                              <InputLabel>{f.label || 'Untitled'}</InputLabel>
                              <Select label={f.label || 'Untitled'}>
                                {f.options.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                              </Select>
                            </FormControl>
                          ) : f.type === 'textarea' ? (
                            <TextField fullWidth size="small" label={f.label || 'Untitled'} multiline rows={3} placeholder={f.placeholder} />
                          ) : f.type === 'file' ? (
                            <Button variant="outlined" fullWidth>{f.label || 'Upload File'}</Button>
                          ) : (
                            <TextField
                              fullWidth size="small"
                              label={f.label || 'Untitled'} type={f.type}
                              placeholder={f.placeholder}
                              required={f.required}
                              helperText={f.helperText}
                              slotProps={f.type === 'date' ? { inputLabel: { shrink: true } } : undefined}
                            />
                          )}
                        </Grid>
                      ))}
                    </Grid>
                  </Paper>
                );
              })}

              {fields.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Typography color="text.secondary">Add fields in the Build tab to see the preview here.</Typography>
                </Box>
              )}
            </Paper>
          )}

          {/* TAB 2: Generated Code */}
          {tab === 2 && (
            <Box>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Button variant="contained" startIcon={<ContentCopyIcon />} onClick={handleCopy}>
                  {copied ? 'Copied!' : 'Copy Code'}
                </Button>
                <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleDownload}>
                  Download App.tsx
                </Button>
              </Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                Save this as <code>src/apps/{appName || 'my-form'}/App.tsx</code>, add a lazy import in App.tsx, and a route + Home.tsx entry.
              </Alert>
              <Paper sx={{ p: 2 }}>
                <Box
                  component="pre"
                  sx={{
                    overflow: 'auto', maxHeight: '70vh', fontSize: 12, fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#e2e8f0',
                    '& code': { fontFamily: 'inherit' },
                  }}
                >
                  <code>{generatedCode}</code>
                </Box>
              </Paper>
            </Box>
          )}
        </Box>
      </Box>

      {/* Detected Fields Review Dialog */}
      <Dialog open={showDetectionDialog} onClose={() => setShowDetectionDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoFixHighIcon color="primary" />
            Detected Fields ({detectedFields.length})
            <Box sx={{ flexGrow: 1 }} />
            <Chip label={`${selectedDetected.size} selected`} size="small" color="primary" />
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Review detected fields below. Uncheck any you don't want, adjust types if needed, then click "Add Selected Fields".
          </Alert>
          {detectedSections.length > 0 && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {detectedSections.length} section(s) detected: {detectedSections.map(s => s.title).join(', ')}
            </Alert>
          )}
          <TableContainer sx={{ maxHeight: 400 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      size="small"
                      checked={selectedDetected.size === detectedFields.length}
                      indeterminate={selectedDetected.size > 0 && selectedDetected.size < detectedFields.length}
                      onChange={toggleAllDetected}
                    />
                  </TableCell>
                  <TableCell>Label</TableCell>
                  <TableCell width={90}>Type</TableCell>
                  <TableCell width={60}>Width</TableCell>
                  <TableCell width={70}>Confidence</TableCell>
                  <TableCell>Source Line</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {detectedFields.map((df, idx) => (
                  <TableRow key={idx} sx={{ opacity: selectedDetected.has(idx) ? 1 : 0.4 }}>
                    <TableCell padding="checkbox">
                      <Checkbox size="small" checked={selectedDetected.has(idx)} onChange={() => toggleDetected(idx)} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{df.label}</Typography>
                      {df.options.length > 0 && (
                        <Typography variant="caption" color="text.secondary">
                          Options: {df.options.join(', ')}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip label={df.type} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">{df.gridCols}/12</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={df.confidence}
                        size="small"
                        color={df.confidence === 'high' ? 'success' : df.confidence === 'medium' ? 'warning' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10, fontFamily: 'monospace' }}>
                        {df.source.slice(0, 60)}{df.source.length > 60 ? '...' : ''}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetectionDialog(false)}>Cancel</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={applyDetectedFields} disabled={selectedDetected.size === 0}>
            Add {selectedDetected.size} Fields
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Field Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Field: {editField?.label || 'Untitled'}</DialogTitle>
        <DialogContent>
          {editField && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField fullWidth size="small" label="Label" value={editField.label} onChange={(e) => setEditField({ ...editField, label: e.target.value })} />
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select value={editField.type} label="Type" onChange={(e) => setEditField({ ...editField, type: e.target.value as FieldType })}>
                  {fieldTypes.map(t => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField fullWidth size="small" label="Placeholder" value={editField.placeholder} onChange={(e) => setEditField({ ...editField, placeholder: e.target.value })} />
              <TextField fullWidth size="small" label="Default Value" value={editField.defaultValue} onChange={(e) => setEditField({ ...editField, defaultValue: e.target.value })} />
              <TextField fullWidth size="small" label="Helper Text" value={editField.helperText} onChange={(e) => setEditField({ ...editField, helperText: e.target.value })} />
              <TextField fullWidth size="small" label="Validation Pattern (regex)" value={editField.validation} onChange={(e) => setEditField({ ...editField, validation: e.target.value })} />
              {(editField.type === 'select' || editField.type === 'radio') && (
                <TextField
                  fullWidth size="small" label="Options (comma-separated)"
                  value={editField.options.join(', ')}
                  onChange={(e) => setEditField({ ...editField, options: e.target.value.split(',').map(o => o.trim()).filter(Boolean) })}
                  helperText="Enter options separated by commas"
                />
              )}
              <FormControl fullWidth size="small">
                <InputLabel>Grid Width</InputLabel>
                <Select value={editField.gridCols} label="Grid Width" onChange={(e) => setEditField({ ...editField, gridCols: Number(e.target.value) })}>
                  {gridOptions.map(g => <MenuItem key={g.value} value={g.value}>{g.label}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel>Section</InputLabel>
                <Select value={editField.section} label="Section" onChange={(e) => setEditField({ ...editField, section: e.target.value })}>
                  <MenuItem value="default">Default (no section)</MenuItem>
                  {sections.map(s => <MenuItem key={s.id} value={s.id}>{s.title || 'Untitled'}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControlLabel control={<Checkbox checked={editField.required} onChange={(e) => setEditField({ ...editField, required: e.target.checked })} />} label="Required" />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveEdit}>Save</Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}
