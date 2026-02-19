import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Button, IconButton, Divider, Chip, Tooltip,
  FormControl, InputLabel, Select, MenuItem, Tabs, Tab, Switch, FormControlLabel,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import HomeIcon from '@mui/icons-material/Home';
import DynamicFormIcon from '@mui/icons-material/DynamicForm';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PrintIcon from '@mui/icons-material/Print';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#8b5cf6' },
    secondary: { main: '#06b6d4' },
    background: { default: '#0f172a', paper: '#1e293b' },
  },
});

// ── Data Model ──

interface FormField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'checkbox' | 'email' | 'phone';
  required: boolean;
  options?: string[];
  placeholder?: string;
}

interface FormTemplate {
  id: string;
  title: string;
  subtitle?: string;
  fields: FormField[];
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  templateId: string;
  values: Record<string, string | boolean>;
  lastSaved: string;
}

type ViewMode = 'list' | 'build' | 'fill';

const TEMPLATES_KEY = 'dynamic-form-templates';
const DATA_KEY = 'dynamic-form-data';

const fieldTypes: FormField['type'][] = ['text', 'textarea', 'number', 'date', 'select', 'checkbox', 'email', 'phone'];

const uid = () => crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

// ── localStorage helpers ──

function loadTemplates(): FormTemplate[] {
  try { return JSON.parse(localStorage.getItem(TEMPLATES_KEY) || '[]'); } catch { return []; }
}
function saveTemplates(t: FormTemplate[]) { localStorage.setItem(TEMPLATES_KEY, JSON.stringify(t)); }

function loadAllData(): Record<string, FormData> {
  try { return JSON.parse(localStorage.getItem(DATA_KEY) || '{}'); } catch { return {}; }
}
function saveAllData(d: Record<string, FormData>) { localStorage.setItem(DATA_KEY, JSON.stringify(d)); }

function loadFormData(templateId: string): Record<string, string | boolean> {
  const all = loadAllData();
  return all[templateId]?.values ?? {};
}
function saveFormData(templateId: string, values: Record<string, string | boolean>) {
  const all = loadAllData();
  all[templateId] = { templateId, values, lastSaved: new Date().toISOString() };
  saveAllData(all);
}

// ── Print styles ──

const getPrintStyles = () => `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
  h1 { font-size: 22px; text-align: center; margin-bottom: 4px; }
  h2 { font-size: 14px; text-align: center; color: #64748b; margin-bottom: 24px; font-weight: 400; }
  .field-row { margin-bottom: 16px; page-break-inside: avoid; }
  .field-label { font-weight: 600; font-size: 13px; color: #334155; margin-bottom: 4px; }
  .field-label .req { color: #ef4444; }
  .field-value { border-bottom: 1.5px solid #94a3b8; min-height: 24px; padding: 4px 2px; font-size: 14px; }
  .field-value.textarea { min-height: 60px; border: 1px solid #cbd5e1; border-radius: 4px; padding: 8px; }
  .field-value.checkbox { border: none; }
  .checkbox-box { display: inline-block; width: 16px; height: 16px; border: 1.5px solid #334155; margin-right: 8px; vertical-align: middle; text-align: center; font-size: 12px; line-height: 14px; }
  @media print { body { padding: 20px; } }
`;

export default function App() {
  const [view, setView] = useState<ViewMode>('list');
  const [templates, setTemplates] = useState<FormTemplate[]>(loadTemplates);
  const [editingTemplate, setEditingTemplate] = useState<FormTemplate | null>(null);
  const [fillingTemplate, setFillingTemplate] = useState<FormTemplate | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string | boolean>>({});
  const [fillTab, setFillTab] = useState(0);
  const [deleteDialogId, setDeleteDialogId] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Persist templates on change
  useEffect(() => { saveTemplates(templates); }, [templates]);

  // ══════════════════════════════════════════════
  //  LIST VIEW HELPERS
  // ══════════════════════════════════════════════

  const startNewForm = () => {
    const t: FormTemplate = {
      id: uid(), title: '', subtitle: '', fields: [],
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    setEditingTemplate(t);
    setView('build');
  };

  const editForm = (t: FormTemplate) => {
    setEditingTemplate({ ...t, fields: t.fields.map(f => ({ ...f })) });
    setView('build');
  };

  const duplicateForm = (t: FormTemplate) => {
    const dup: FormTemplate = {
      ...t, id: uid(), title: `${t.title} (Copy)`,
      fields: t.fields.map(f => ({ ...f, id: uid() })),
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    setTemplates(prev => [...prev, dup]);
  };

  const confirmDelete = () => {
    if (!deleteDialogId) return;
    setTemplates(prev => prev.filter(t => t.id !== deleteDialogId));
    const allData = loadAllData();
    delete allData[deleteDialogId];
    saveAllData(allData);
    setDeleteDialogId(null);
  };

  const fillForm = (t: FormTemplate) => {
    setFillingTemplate(t);
    setFormValues(loadFormData(t.id));
    setFillTab(0);
    setView('fill');
  };

  const getFilledCount = (t: FormTemplate): number => {
    const vals = loadFormData(t.id);
    return t.fields.filter(f => {
      const v = vals[f.id];
      return v !== undefined && v !== '' && v !== false;
    }).length;
  };

  // ══════════════════════════════════════════════
  //  BUILD VIEW HELPERS
  // ══════════════════════════════════════════════

  const addField = () => {
    if (!editingTemplate) return;
    const f: FormField = { id: uid(), label: '', type: 'text', required: false };
    setEditingTemplate({ ...editingTemplate, fields: [...editingTemplate.fields, f] });
  };

  const updateField = (id: string, patch: Partial<FormField>) => {
    if (!editingTemplate) return;
    setEditingTemplate({
      ...editingTemplate,
      fields: editingTemplate.fields.map(f => f.id === id ? { ...f, ...patch } : f),
    });
  };

  const removeField = (id: string) => {
    if (!editingTemplate) return;
    setEditingTemplate({ ...editingTemplate, fields: editingTemplate.fields.filter(f => f.id !== id) });
  };

  const moveField = (idx: number, dir: -1 | 1) => {
    if (!editingTemplate) return;
    const fields = [...editingTemplate.fields];
    const target = idx + dir;
    if (target < 0 || target >= fields.length) return;
    [fields[idx], fields[target]] = [fields[target], fields[idx]];
    setEditingTemplate({ ...editingTemplate, fields });
  };

  const saveTemplate = () => {
    if (!editingTemplate || !editingTemplate.title.trim()) return;
    const updated = { ...editingTemplate, updatedAt: new Date().toISOString() };
    setTemplates(prev => {
      const idx = prev.findIndex(t => t.id === updated.id);
      return idx >= 0 ? prev.map(t => t.id === updated.id ? updated : t) : [...prev, updated];
    });
    setEditingTemplate(null);
    setView('list');
  };

  // ══════════════════════════════════════════════
  //  FILL VIEW HELPERS
  // ══════════════════════════════════════════════

  const updateValue = (fieldId: string, value: string | boolean) => {
    if (!fillingTemplate) return;
    const next = { ...formValues, [fieldId]: value };
    setFormValues(next);
    saveFormData(fillingTemplate.id, next);
  };

  const getFormBody = () => {
    if (!fillingTemplate) return '';
    return `
      <h1>${fillingTemplate.title}</h1>
      ${fillingTemplate.subtitle ? `<h2>${fillingTemplate.subtitle}</h2>` : ''}
      ${fillingTemplate.fields.map(f => {
        const val = formValues[f.id];
        let displayVal = '';
        if (f.type === 'checkbox') {
          displayVal = `<span class="checkbox-box">${val ? '&#10003;' : ''}</span> ${f.label}`;
          return `<div class="field-row"><div class="field-value checkbox">${displayVal}</div></div>`;
        }
        displayVal = val != null ? String(val) : '';
        const cls = f.type === 'textarea' ? 'field-value textarea' : 'field-value';
        return `<div class="field-row"><div class="field-label">${f.label}${f.required ? ' <span class="req">*</span>' : ''}</div><div class="${cls}">${displayVal}</div></div>`;
      }).join('')}
    `;
  };

  const handlePrint = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<html><head><title>${fillingTemplate?.title}</title><style>${getPrintStyles()}</style></head><body>${getFormBody()}</body></html>`);
    w.document.close();
    w.print();
  };

  const loadPreview = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;
    doc.open();
    doc.write(`<!DOCTYPE html><html><head><style>${getPrintStyles()}</style></head><body contenteditable="true">${getFormBody()}</body></html>`);
    doc.close();
  };

  const handlePrintFromPreview = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument;
    if (!doc?.body) return;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<html><head><title>${fillingTemplate?.title}</title><style>${getPrintStyles()}</style></head><body>${doc.body.innerHTML}</body></html>`);
    w.document.close();
    w.print();
  };

  const execCmd = (cmd: string, value?: string) => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;
    doc.execCommand(cmd, false, value || '');
    iframeRef.current?.contentWindow?.focus();
  };

  const pd = (e: React.MouseEvent) => e.preventDefault();

  const handleFillTabChange = (_: React.SyntheticEvent, v: number) => {
    setFillTab(v);
    if (v === 1) setTimeout(loadPreview, 80);
  };

  // ══════════════════════════════════════════════
  //  RENDER
  // ══════════════════════════════════════════════

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', p: 3 }}>
        <Box sx={{ maxWidth: 960, mx: 'auto' }}>

          {/* ═══ HEADER ═══ */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
            <IconButton component={Link} to="/" size="small"><HomeIcon /></IconButton>
            <DynamicFormIcon sx={{ color: 'primary.main', fontSize: 32 }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" fontWeight={700} color="primary.main">Dynamic Form Creator</Typography>
              <Typography variant="caption" color="text.secondary">Build custom forms, fill & print — data saved locally</Typography>
            </Box>
            {view !== 'list' && (
              <Button startIcon={<ArrowBackIcon />} onClick={() => setView('list')} variant="outlined" size="small">My Forms</Button>
            )}
            {view === 'fill' && fillTab === 0 && (
              <Button startIcon={<PrintIcon />} variant="contained" onClick={handlePrint}>Print</Button>
            )}
          </Box>

          {/* ═══════════════════════════════════
               LIST VIEW
          ═══════════════════════════════════ */}
          {view === 'list' && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" color="text.secondary">My Forms ({templates.length})</Typography>
                <Button startIcon={<AddIcon />} variant="contained" onClick={startNewForm}>Create Form</Button>
              </Box>

              {templates.length === 0 && (
                <Paper sx={{ p: 6, textAlign: 'center' }}>
                  <DynamicFormIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                  <Typography color="text.secondary" mb={1}>No forms yet</Typography>
                  <Typography variant="body2" color="text.disabled" mb={3}>Click "Create Form" to build your first custom form</Typography>
                  <Button variant="outlined" startIcon={<AddIcon />} onClick={startNewForm}>Create Form</Button>
                </Paper>
              )}

              {templates.map(t => {
                const filled = getFilledCount(t);
                const total = t.fields.length;
                return (
                  <Paper key={t.id} sx={{ p: 2, mb: 1.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ flex: 1, cursor: 'pointer' }} onClick={() => fillForm(t)}>
                      <Typography fontWeight={600}>{t.title}</Typography>
                      {t.subtitle && <Typography variant="caption" color="text.secondary">{t.subtitle}</Typography>}
                      <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                        <Chip label={`${total} fields`} size="small" variant="outlined" />
                        {total > 0 && <Chip label={filled === total ? 'Complete' : `${filled}/${total} filled`} size="small" color={filled === total ? 'success' : 'default'} />}
                      </Box>
                    </Box>
                    <Tooltip title="Fill"><IconButton onClick={() => fillForm(t)} color="primary"><EditIcon /></IconButton></Tooltip>
                    <Tooltip title="Edit Template"><IconButton onClick={() => editForm(t)}><PlaylistAddIcon /></IconButton></Tooltip>
                    <Tooltip title="Duplicate"><IconButton onClick={() => duplicateForm(t)}><ContentCopyIcon /></IconButton></Tooltip>
                    <Tooltip title="Delete"><IconButton onClick={() => setDeleteDialogId(t.id)} color="error"><DeleteIcon /></IconButton></Tooltip>
                  </Paper>
                );
              })}
            </Box>
          )}

          {/* ═══════════════════════════════════
               BUILD VIEW
          ═══════════════════════════════════ */}
          {view === 'build' && editingTemplate && (
            <Box>
              <Paper sx={{ p: 3, mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" mb={1}>Form Details</Typography>
                <TextField fullWidth label="Form Title *" value={editingTemplate.title}
                  onChange={e => setEditingTemplate({ ...editingTemplate, title: e.target.value })}
                  sx={{ mb: 2 }} placeholder="e.g. Employee Onboarding Form" />
                <TextField fullWidth label="Subtitle (optional)" value={editingTemplate.subtitle || ''}
                  onChange={e => setEditingTemplate({ ...editingTemplate, subtitle: e.target.value })}
                  placeholder="e.g. HR Department — New Joinee" />
              </Paper>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="subtitle2" color="text.secondary">Fields ({editingTemplate.fields.length})</Typography>
                <Button startIcon={<AddIcon />} variant="outlined" size="small" onClick={addField}>Add Field</Button>
              </Box>

              {editingTemplate.fields.length === 0 && (
                <Paper sx={{ p: 4, textAlign: 'center', mb: 2 }}>
                  <Typography color="text.disabled">No fields yet — click "Add Field" to start building</Typography>
                </Paper>
              )}

              {editingTemplate.fields.map((f, idx) => (
                <Paper key={f.id} sx={{ p: 2, mb: 1, display: 'flex', gap: 1, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <IconButton size="small" disabled={idx === 0} onClick={() => moveField(idx, -1)}><ArrowUpwardIcon fontSize="small" /></IconButton>
                    <IconButton size="small" disabled={idx === editingTemplate.fields.length - 1} onClick={() => moveField(idx, 1)}><ArrowDownwardIcon fontSize="small" /></IconButton>
                  </Box>
                  <TextField label="Field Label" size="small" value={f.label} sx={{ flex: 1, minWidth: 180 }}
                    onChange={e => updateField(f.id, { label: e.target.value })} />
                  <FormControl size="small" sx={{ minWidth: 130 }}>
                    <InputLabel>Type</InputLabel>
                    <Select value={f.type} label="Type" onChange={e => updateField(f.id, { type: e.target.value as FormField['type'] })}>
                      {fieldTypes.map(ft => <MenuItem key={ft} value={ft}>{ft}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <TextField label="Placeholder" size="small" value={f.placeholder || ''} sx={{ flex: 1, minWidth: 140 }}
                    onChange={e => updateField(f.id, { placeholder: e.target.value })} />
                  <FormControlLabel control={
                    <Switch checked={f.required} onChange={e => updateField(f.id, { required: e.target.checked })} size="small" />
                  } label="Req" sx={{ mr: 0 }} />
                  {f.type === 'select' && (
                    <TextField label="Options (comma-sep)" size="small" fullWidth
                      value={(f.options || []).join(', ')} sx={{ mt: 1 }}
                      onChange={e => updateField(f.id, { options: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} />
                  )}
                  <IconButton color="error" onClick={() => removeField(f.id)}><DeleteIcon /></IconButton>
                </Paper>
              ))}

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="contained" onClick={saveTemplate} disabled={!editingTemplate.title.trim()}>
                  {templates.some(t => t.id === editingTemplate.id) ? 'Update Form' : 'Save Form'}
                </Button>
                <Button variant="outlined" onClick={() => setView('list')}>Cancel</Button>
              </Box>
            </Box>
          )}

          {/* ═══════════════════════════════════
               FILL VIEW
          ═══════════════════════════════════ */}
          {view === 'fill' && fillingTemplate && (
            <Box>
              <Paper sx={{ mb: 2 }}>
                <Tabs value={fillTab} onChange={handleFillTabChange} variant="fullWidth">
                  <Tab icon={<EditIcon />} iconPosition="start" label="Fill Form" />
                  <Tab icon={<VisibilityIcon />} iconPosition="start" label="Preview & Edit" />
                </Tabs>
              </Paper>

              {/* ── TAB 0: Fill Form ── */}
              {fillTab === 0 && (
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={700} mb={0.5}>{fillingTemplate.title}</Typography>
                  {fillingTemplate.subtitle && <Typography variant="body2" color="text.secondary" mb={2}>{fillingTemplate.subtitle}</Typography>}
                  <Divider sx={{ mb: 2 }} />

                  {fillingTemplate.fields.length === 0 && (
                    <Typography color="text.disabled">This form has no fields. Edit the template to add fields.</Typography>
                  )}

                  {fillingTemplate.fields.map(f => {
                    const val = formValues[f.id] ?? (f.type === 'checkbox' ? false : '');

                    if (f.type === 'checkbox') {
                      return (
                        <FormControlLabel key={f.id} sx={{ mb: 1.5, display: 'flex' }}
                          control={<Switch checked={val as boolean} onChange={e => updateValue(f.id, e.target.checked)} />}
                          label={<>{f.label}{f.required && <span style={{ color: '#ef4444' }}> *</span>}</>} />
                      );
                    }

                    if (f.type === 'select') {
                      return (
                        <FormControl key={f.id} fullWidth sx={{ mb: 2 }}>
                          <InputLabel>{f.label}{f.required ? ' *' : ''}</InputLabel>
                          <Select value={val as string} label={`${f.label}${f.required ? ' *' : ''}`}
                            onChange={e => updateValue(f.id, e.target.value)}>
                            <MenuItem value="">— Select —</MenuItem>
                            {(f.options || []).map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                          </Select>
                        </FormControl>
                      );
                    }

                    if (f.type === 'textarea') {
                      return (
                        <TextField key={f.id} fullWidth multiline minRows={3} label={f.label} required={f.required}
                          value={val as string} onChange={e => updateValue(f.id, e.target.value)}
                          placeholder={f.placeholder} sx={{ mb: 2 }} />
                      );
                    }

                    const inputType = f.type === 'phone' ? 'tel' : f.type;
                    return (
                      <TextField key={f.id} fullWidth type={inputType} label={f.label} required={f.required}
                        value={val as string} onChange={e => updateValue(f.id, e.target.value)}
                        placeholder={f.placeholder} sx={{ mb: 2 }}
                        InputLabelProps={f.type === 'date' ? { shrink: true } : undefined} />
                    );
                  })}
                </Paper>
              )}

              {/* ── TAB 1: Preview & Edit ── */}
              {fillTab === 1 && (
                <Paper sx={{ overflow: 'hidden' }}>
                  {/* Toolbar */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, p: 1, borderBottom: '1px solid rgba(255,255,255,0.1)', alignItems: 'center' }}>
                    <Tooltip title="Bold"><IconButton size="small" onMouseDown={pd} onClick={() => execCmd('bold')}><FormatBoldIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Italic"><IconButton size="small" onMouseDown={pd} onClick={() => execCmd('italic')}><FormatItalicIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Underline"><IconButton size="small" onMouseDown={pd} onClick={() => execCmd('underline')}><FormatUnderlinedIcon fontSize="small" /></IconButton></Tooltip>
                    <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
                    <Tooltip title="Align Left"><IconButton size="small" onMouseDown={pd} onClick={() => execCmd('justifyLeft')}><FormatAlignLeftIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Align Center"><IconButton size="small" onMouseDown={pd} onClick={() => execCmd('justifyCenter')}><FormatAlignCenterIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Align Right"><IconButton size="small" onMouseDown={pd} onClick={() => execCmd('justifyRight')}><FormatAlignRightIcon fontSize="small" /></IconButton></Tooltip>
                    <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
                    <Tooltip title="Undo"><IconButton size="small" onMouseDown={pd} onClick={() => execCmd('undo')}><UndoIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Redo"><IconButton size="small" onMouseDown={pd} onClick={() => execCmd('redo')}><RedoIcon fontSize="small" /></IconButton></Tooltip>
                    <Box sx={{ flex: 1 }} />
                    <Button variant="contained" size="small" startIcon={<PrintIcon />} onClick={handlePrintFromPreview}>Print</Button>
                  </Box>
                  {/* Iframe */}
                  <iframe ref={iframeRef} title="Preview"
                    style={{ width: '100%', height: 600, border: 'none', background: '#fff' }} />
                </Paper>
              )}
            </Box>
          )}

          {/* ═══ DELETE CONFIRMATION DIALOG ═══ */}
          <Dialog open={!!deleteDialogId} onClose={() => setDeleteDialogId(null)}>
            <DialogTitle>Delete Form?</DialogTitle>
            <DialogContent>
              <Typography>This will permanently delete the form template and any filled data. This action cannot be undone.</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteDialogId(null)}>Cancel</Button>
              <Button color="error" variant="contained" onClick={confirmDelete}>Delete</Button>
            </DialogActions>
          </Dialog>

        </Box>
      </Box>
    </ThemeProvider>
  );
}
