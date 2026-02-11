import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Button, IconButton, Tooltip,
  Select, MenuItem, FormControl, InputLabel, Snackbar, Chip, Divider,
  Switch, FormControlLabel,
} from '@mui/material';
import Home from '@mui/icons-material/Home';
import ContentCopy from '@mui/icons-material/ContentCopy';
import Download from '@mui/icons-material/Download';
import History from '@mui/icons-material/History';
import Add from '@mui/icons-material/Add';
import Delete from '@mui/icons-material/Delete';

type SectionKey = 'added' | 'changed' | 'deprecated' | 'removed' | 'fixed' | 'security';

const SECTIONS: { key: SectionKey; label: string; color: string }[] = [
  { key: 'added', label: 'Added', color: '#4ade80' },
  { key: 'changed', label: 'Changed', color: '#60a5fa' },
  { key: 'deprecated', label: 'Deprecated', color: '#fbbf24' },
  { key: 'removed', label: 'Removed', color: '#f87171' },
  { key: 'fixed', label: 'Fixed', color: '#a78bfa' },
  { key: 'security', label: 'Security', color: '#fb923c' },
];

interface VersionEntry {
  id: number;
  version: string;
  date: string;
  sections: Record<SectionKey, string[]>;
}

export default function App() {
  const [versions, setVersions] = useState<VersionEntry[]>([
    { id: 1, version: '1.0.0', date: new Date().toISOString().split('T')[0], sections: { added: [], changed: [], deprecated: [], removed: [], fixed: [], security: [] } },
  ]);
  const [includeUnreleased, setIncludeUnreleased] = useState(true);
  const [unreleasedSections, setUnreleasedSections] = useState<Record<SectionKey, string[]>>({ added: [], changed: [], deprecated: [], removed: [], fixed: [], security: [] });
  const [repoUrl, setRepoUrl] = useState('https://github.com/user/repo');
  const [dateFormat, setDateFormat] = useState<'iso' | 'us' | 'eu'>('iso');
  const [includeContributors, setIncludeContributors] = useState(false);
  const [newEntry, setNewEntry] = useState('');
  const [activeSection, setActiveSection] = useState<SectionKey>('added');
  const [activeVersionId, setActiveVersionId] = useState<number | 'unreleased'>('unreleased');
  const [snackbar, setSnackbar] = useState('');
  const [nextId, setNextId] = useState(2);

  const formatDate = (isoDate: string): string => {
    if (!isoDate) return '';
    const [y, m, d] = isoDate.split('-');
    if (dateFormat === 'us') return `${m}/${d}/${y}`;
    if (dateFormat === 'eu') return `${d}.${m}.${y}`;
    return isoDate;
  };

  const addEntry = () => {
    if (!newEntry.trim()) return;
    if (activeVersionId === 'unreleased') {
      setUnreleasedSections({ ...unreleasedSections, [activeSection]: [...unreleasedSections[activeSection], newEntry.trim()] });
    } else {
      setVersions(versions.map((v) =>
        v.id === activeVersionId
          ? { ...v, sections: { ...v.sections, [activeSection]: [...v.sections[activeSection], newEntry.trim()] } }
          : v
      ));
    }
    setNewEntry('');
  };

  const removeEntry = (versionId: number | 'unreleased', section: SectionKey, idx: number) => {
    if (versionId === 'unreleased') {
      setUnreleasedSections({ ...unreleasedSections, [section]: unreleasedSections[section].filter((_, i) => i !== idx) });
    } else {
      setVersions(versions.map((v) =>
        v.id === versionId
          ? { ...v, sections: { ...v.sections, [section]: v.sections[section].filter((_, i) => i !== idx) } }
          : v
      ));
    }
  };

  const addVersion = () => {
    const nv: VersionEntry = {
      id: nextId,
      version: '0.1.0',
      date: new Date().toISOString().split('T')[0],
      sections: { added: [], changed: [], deprecated: [], removed: [], fixed: [], security: [] },
    };
    setVersions([...versions, nv]);
    setNextId(nextId + 1);
    setActiveVersionId(nv.id);
  };

  const removeVersion = (id: number) => {
    setVersions(versions.filter((v) => v.id !== id));
    if (activeVersionId === id) setActiveVersionId('unreleased');
  };

  const generateMarkdown = (): string => {
    let md = '# Changelog\n\nAll notable changes to this project will be documented in this file.\n\n';
    md += 'The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),\nand this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).\n\n';

    if (includeUnreleased) {
      const hasEntries = Object.values(unreleasedSections).some((s) => s.length > 0);
      md += `## [Unreleased]\n\n`;
      if (hasEntries) {
        for (const sec of SECTIONS) {
          if (unreleasedSections[sec.key].length > 0) {
            md += `### ${sec.label}\n\n`;
            unreleasedSections[sec.key].forEach((e) => { md += `- ${e}\n`; });
            md += '\n';
          }
        }
      }
    }

    const sorted = [...versions].sort((a, b) => {
      const pa = a.version.split('.').map(Number);
      const pb = b.version.split('.').map(Number);
      for (let i = 0; i < 3; i++) { if ((pb[i] || 0) !== (pa[i] || 0)) return (pb[i] || 0) - (pa[i] || 0); }
      return 0;
    });

    sorted.forEach((v) => {
      md += `## [${v.version}] - ${formatDate(v.date)}\n\n`;
      for (const sec of SECTIONS) {
        if (v.sections[sec.key].length > 0) {
          md += `### ${sec.label}\n\n`;
          v.sections[sec.key].forEach((e) => { md += `- ${e}\n`; });
          md += '\n';
        }
      }
    });

    // Link references
    if (includeUnreleased && sorted.length > 0) {
      md += `[Unreleased]: ${repoUrl}/compare/v${sorted[0].version}...HEAD\n`;
    }
    for (let i = 0; i < sorted.length; i++) {
      if (i < sorted.length - 1) {
        md += `[${sorted[i].version}]: ${repoUrl}/compare/v${sorted[i + 1].version}...v${sorted[i].version}\n`;
      } else {
        md += `[${sorted[i].version}]: ${repoUrl}/releases/tag/v${sorted[i].version}\n`;
      }
    }

    return md;
  };

  const markdown = generateMarkdown();

  const copy = async () => {
    await navigator.clipboard.writeText(markdown);
    setSnackbar('Changelog copied to clipboard');
  };

  const download = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'CHANGELOG.md'; a.click();
    URL.revokeObjectURL(url);
  };

  const currentSections = activeVersionId === 'unreleased' ? unreleasedSections : versions.find((v) => v.id === activeVersionId)?.sections;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a', p: 3 }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Link to="/"><IconButton size="small" sx={{ color: 'grey.500' }}><Home /></IconButton></Link>
          <History sx={{ color: '#10b981', fontSize: 28 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'grey.300' }}>Changelog Generator</Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {/* Editor */}
          <Box sx={{ flex: '1 1 450px', minWidth: 320 }}>
            {/* Settings */}
            <Paper sx={{ p: 2, bgcolor: '#111', border: '1px solid #222', mb: 2 }}>
              <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1 }}>Settings</Typography>
              <TextField fullWidth size="small" label="Repository URL" value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)}
                sx={{ mb: 1.5, '& .MuiOutlinedInput-root': { color: 'grey.300' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' }, '& .MuiInputLabel-root': { color: 'grey.500' } }} />
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel sx={{ color: 'grey.500' }}>Date Format</InputLabel>
                  <Select value={dateFormat} onChange={(e) => setDateFormat(e.target.value as typeof dateFormat)} label="Date Format"
                    sx={{ color: 'grey.300', '.MuiOutlinedInput-notchedOutline': { borderColor: '#333' } }}>
                    <MenuItem value="iso">YYYY-MM-DD</MenuItem>
                    <MenuItem value="us">MM/DD/YYYY</MenuItem>
                    <MenuItem value="eu">DD.MM.YYYY</MenuItem>
                  </Select>
                </FormControl>
                <FormControlLabel control={<Switch checked={includeUnreleased} onChange={(e) => setIncludeUnreleased(e.target.checked)} size="small" />}
                  label={<Typography variant="body2" sx={{ color: 'grey.400' }}>Unreleased</Typography>} />
                <FormControlLabel control={<Switch checked={includeContributors} onChange={(e) => setIncludeContributors(e.target.checked)} size="small" />}
                  label={<Typography variant="body2" sx={{ color: 'grey.400' }}>Contributors</Typography>} />
              </Box>
            </Paper>

            {/* Version Tabs */}
            <Paper sx={{ p: 2, bgcolor: '#111', border: '1px solid #222', mb: 2 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
                {includeUnreleased && (
                  <Chip label="Unreleased" onClick={() => setActiveVersionId('unreleased')}
                    variant={activeVersionId === 'unreleased' ? 'filled' : 'outlined'}
                    sx={{ bgcolor: activeVersionId === 'unreleased' ? '#10b981' : 'transparent', color: activeVersionId === 'unreleased' ? '#fff' : 'grey.400', borderColor: '#333', fontWeight: 600 }} />
                )}
                {versions.map((v) => (
                  <Chip key={v.id} label={`v${v.version}`} onClick={() => setActiveVersionId(v.id)}
                    onDelete={() => removeVersion(v.id)}
                    variant={activeVersionId === v.id ? 'filled' : 'outlined'}
                    sx={{ bgcolor: activeVersionId === v.id ? '#10b981' : 'transparent', color: activeVersionId === v.id ? '#fff' : 'grey.400', borderColor: '#333', fontWeight: 600 }} />
                ))}
                <Chip label="+ Version" onClick={addVersion} variant="outlined" sx={{ borderColor: '#333', color: 'grey.500', borderStyle: 'dashed' }} />
              </Box>

              {/* Version fields */}
              {activeVersionId !== 'unreleased' && (() => {
                const v = versions.find((x) => x.id === activeVersionId);
                if (!v) return null;
                return (
                  <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                    <TextField size="small" label="Version" value={v.version}
                      onChange={(e) => setVersions(versions.map((x) => x.id === v.id ? { ...x, version: e.target.value } : x))}
                      sx={{ flex: 1, '& .MuiOutlinedInput-root': { color: 'grey.300' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' }, '& .MuiInputLabel-root': { color: 'grey.500' } }} />
                    <TextField size="small" label="Date" type="date" value={v.date}
                      onChange={(e) => setVersions(versions.map((x) => x.id === v.id ? { ...x, date: e.target.value } : x))}
                      sx={{ flex: 1, '& .MuiOutlinedInput-root': { color: 'grey.300' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' }, '& .MuiInputLabel-root': { color: 'grey.500' } }} />
                  </Box>
                );
              })()}

              {/* Section selector */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                {SECTIONS.map((s) => (
                  <Chip key={s.key} label={s.label} size="small" onClick={() => setActiveSection(s.key)}
                    sx={{ bgcolor: activeSection === s.key ? s.color + '22' : 'transparent', color: s.color, border: `1px solid ${activeSection === s.key ? s.color : '#333'}`, fontWeight: 600, fontSize: '0.75rem' }} />
                ))}
              </Box>

              {/* Add entry */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField fullWidth size="small" placeholder={`Add entry to ${SECTIONS.find((s) => s.key === activeSection)?.label}...`}
                  value={newEntry} onChange={(e) => setNewEntry(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') addEntry(); }}
                  sx={{ '& .MuiOutlinedInput-root': { color: 'grey.300' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' } }} />
                <Button variant="contained" onClick={addEntry} disabled={!newEntry.trim()} size="small"
                  sx={{ bgcolor: '#10b981', minWidth: 40, '&:hover': { bgcolor: '#059669' } }}><Add /></Button>
              </Box>

              {/* Current entries */}
              {currentSections && SECTIONS.map((sec) => {
                const entries = currentSections[sec.key];
                if (entries.length === 0) return null;
                return (
                  <Box key={sec.key} sx={{ mb: 1.5 }}>
                    <Typography variant="caption" sx={{ color: sec.color, fontWeight: 700 }}>{sec.label}</Typography>
                    {entries.map((entry, idx) => (
                      <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: 1 }}>
                        <Typography variant="body2" sx={{ color: 'grey.400', flex: 1, fontSize: '0.8rem' }}>- {entry}</Typography>
                        <IconButton size="small" onClick={() => removeEntry(activeVersionId, sec.key, idx)} sx={{ color: 'grey.600', p: 0.25 }}>
                          <Delete sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                );
              })}
            </Paper>
          </Box>

          {/* Preview */}
          <Box sx={{ flex: '1 1 450px', minWidth: 320 }}>
            <Paper sx={{ p: 2.5, bgcolor: '#111', border: '1px solid #222', position: 'sticky', top: 16 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="subtitle2" sx={{ color: 'grey.400' }}>CHANGELOG.md Preview</Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Tooltip title="Copy markdown"><IconButton size="small" onClick={copy} sx={{ color: 'grey.500' }}><ContentCopy fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Download CHANGELOG.md"><IconButton size="small" onClick={download} sx={{ color: 'grey.500' }}><Download fontSize="small" /></IconButton></Tooltip>
                </Box>
              </Box>
              <Box sx={{
                p: 2, bgcolor: '#0d0d0d', borderRadius: 1, border: '1px solid #1a1a1a',
                fontFamily: 'monospace', fontSize: '0.78rem', color: '#86efac',
                whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 600, overflow: 'auto',
              }}>
                {markdown}
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>
      <Snackbar open={!!snackbar} autoHideDuration={2000} onClose={() => setSnackbar('')} message={snackbar} />
    </Box>
  );
}
