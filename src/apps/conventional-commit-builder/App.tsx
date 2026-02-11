import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Button, IconButton, Tooltip,
  Select, MenuItem, FormControl, InputLabel, Snackbar, Chip,
  Switch, FormControlLabel, Divider,
} from '@mui/material';
import Home from '@mui/icons-material/Home';
import ContentCopy from '@mui/icons-material/ContentCopy';
import Code from '@mui/icons-material/Code';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Error from '@mui/icons-material/Error';

const COMMIT_TYPES = [
  { value: 'feat', label: 'feat', desc: 'A new feature', emoji: 'sparkles' },
  { value: 'fix', label: 'fix', desc: 'A bug fix', emoji: 'bug' },
  { value: 'docs', label: 'docs', desc: 'Documentation only', emoji: 'memo' },
  { value: 'style', label: 'style', desc: 'Formatting, missing semi colons, etc', emoji: 'art' },
  { value: 'refactor', label: 'refactor', desc: 'Code change that neither fixes a bug nor adds a feature', emoji: 'recycle' },
  { value: 'perf', label: 'perf', desc: 'A code change that improves performance', emoji: 'zap' },
  { value: 'test', label: 'test', desc: 'Adding missing tests', emoji: 'white_check_mark' },
  { value: 'build', label: 'build', desc: 'Changes to build system or dependencies', emoji: 'package' },
  { value: 'ci', label: 'ci', desc: 'CI configuration files and scripts', emoji: 'construction_worker' },
  { value: 'chore', label: 'chore', desc: 'Other changes that dont modify src or test', emoji: 'wrench' },
  { value: 'revert', label: 'revert', desc: 'Reverts a previous commit', emoji: 'rewind' },
];

interface FooterEntry {
  id: number;
  token: string;
  value: string;
}

export default function App() {
  const [type, setType] = useState('feat');
  const [scope, setScope] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [breaking, setBreaking] = useState(false);
  const [footers, setFooters] = useState<FooterEntry[]>([]);
  const [snackbar, setSnackbar] = useState('');
  const [nextId, setNextId] = useState(1);

  const addFooter = () => {
    setFooters([...footers, { id: nextId, token: 'Closes', value: '' }]);
    setNextId(nextId + 1);
  };

  const updateFooter = (id: number, field: 'token' | 'value', val: string) => {
    setFooters(footers.map((f) => (f.id === id ? { ...f, [field]: val } : f)));
  };

  const removeFooter = (id: number) => {
    setFooters(footers.filter((f) => f.id !== id));
  };

  const buildCommitMessage = (): string => {
    let header = type;
    if (scope) header += `(${scope})`;
    if (breaking) header += '!';
    header += `: ${subject}`;

    let msg = header;
    if (body.trim()) msg += `\n\n${body}`;

    const footerLines: string[] = [];
    if (breaking) footerLines.push('BREAKING CHANGE: ' + (body.trim() ? 'See description above' : subject));
    footers.forEach((f) => {
      if (f.value.trim()) footerLines.push(`${f.token}: ${f.value}`);
    });
    if (footerLines.length) msg += '\n\n' + footerLines.join('\n');

    return msg;
  };

  const buildGitCommand = (): string => {
    const msg = buildCommitMessage();
    const escaped = msg.replace(/'/g, "'\\''");
    return `git commit -m '${escaped}'`;
  };

  const validate = (): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    if (!subject.trim()) errors.push('Subject is required');
    if (subject.length > 72) errors.push('Subject exceeds 72 characters');
    if (subject && subject[0] === subject[0].toUpperCase() && /[A-Z]/.test(subject[0])) errors.push('Subject should start with lowercase');
    if (subject.endsWith('.')) errors.push('Subject should not end with a period');
    return { valid: errors.length === 0, errors };
  };

  const validation = validate();
  const commitMsg = buildCommitMessage();

  const copy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setSnackbar(`${label} copied to clipboard`);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a', p: 3 }}>
      <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Link to="/"><IconButton size="small" sx={{ color: 'grey.500' }}><Home /></IconButton></Link>
          <Code sx={{ color: '#8b5cf6', fontSize: 28 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'grey.300' }}>Conventional Commit Builder</Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 420px', minWidth: 320 }}>
            {/* Type Selection */}
            <Paper sx={{ p: 2.5, bgcolor: '#111', border: '1px solid #222', mb: 2 }}>
              <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1.5 }}>Commit Type</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {COMMIT_TYPES.map((t) => (
                  <Chip
                    key={t.value}
                    label={t.value}
                    onClick={() => setType(t.value)}
                    variant={type === t.value ? 'filled' : 'outlined'}
                    sx={{
                      bgcolor: type === t.value ? '#8b5cf6' : 'transparent',
                      color: type === t.value ? '#fff' : 'grey.400',
                      borderColor: '#333',
                      fontFamily: 'monospace',
                      fontWeight: 600,
                      '&:hover': { bgcolor: type === t.value ? '#7c3aed' : '#1a1a1a' },
                    }}
                  />
                ))}
              </Box>
              <Typography variant="caption" sx={{ color: 'grey.500', mt: 1, display: 'block' }}>
                {COMMIT_TYPES.find((t) => t.value === type)?.desc}
              </Typography>
            </Paper>

            {/* Scope & Subject */}
            <Paper sx={{ p: 2.5, bgcolor: '#111', border: '1px solid #222', mb: 2 }}>
              <TextField
                fullWidth size="small" label="Scope (optional)" placeholder="e.g., auth, api, ui"
                value={scope} onChange={(e) => setScope(e.target.value)}
                sx={{ mb: 2, '& .MuiOutlinedInput-root': { color: 'grey.300' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' }, '& .MuiInputLabel-root': { color: 'grey.500' } }}
              />
              <TextField
                fullWidth size="small" label="Subject" placeholder="Short description (imperative, lowercase)"
                value={subject} onChange={(e) => setSubject(e.target.value)}
                helperText={`${subject.length}/72 characters`}
                error={subject.length > 72}
                sx={{ mb: 2, '& .MuiOutlinedInput-root': { color: 'grey.300' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' }, '& .MuiInputLabel-root': { color: 'grey.500' }, '& .MuiFormHelperText-root': { color: subject.length > 72 ? '#ef4444' : 'grey.500' } }}
              />
              <TextField
                fullWidth size="small" label="Body (optional)" placeholder="Longer description..." multiline rows={3}
                value={body} onChange={(e) => setBody(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { color: 'grey.300' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' }, '& .MuiInputLabel-root': { color: 'grey.500' } }}
              />
            </Paper>

            {/* Breaking Change */}
            <Paper sx={{ p: 2, bgcolor: '#111', border: '1px solid #222', mb: 2 }}>
              <FormControlLabel
                control={<Switch checked={breaking} onChange={(e) => setBreaking(e.target.checked)} sx={{ '& .Mui-checked': { color: '#ef4444' } }} />}
                label={<Typography variant="body2" sx={{ color: breaking ? '#ef4444' : 'grey.400', fontWeight: breaking ? 700 : 400 }}>Breaking Change</Typography>}
              />
            </Paper>

            {/* Footers */}
            <Paper sx={{ p: 2.5, bgcolor: '#111', border: '1px solid #222', mb: 2 }}>
              <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1 }}>Footers</Typography>
              {footers.map((f) => (
                <Box key={f.id} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                  <FormControl size="small" sx={{ minWidth: 130 }}>
                    <Select value={f.token} onChange={(e) => updateFooter(f.id, 'token', e.target.value)}
                      sx={{ color: 'grey.300', fontSize: '0.85rem', '.MuiOutlinedInput-notchedOutline': { borderColor: '#333' } }}>
                      {['Closes', 'Fixes', 'Resolves', 'Reviewed-by', 'Co-authored-by', 'Refs', 'See'].map((t) => (
                        <MenuItem key={t} value={t}>{t}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField size="small" placeholder="e.g., #123" value={f.value}
                    onChange={(e) => updateFooter(f.id, 'value', e.target.value)} sx={{ flex: 1, '& .MuiOutlinedInput-root': { color: 'grey.300' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' } }} />
                  <Button size="small" onClick={() => removeFooter(f.id)} sx={{ color: 'grey.500', minWidth: 'auto' }}>X</Button>
                </Box>
              ))}
              <Button size="small" onClick={addFooter} sx={{ color: '#8b5cf6' }}>+ Add Footer</Button>
            </Paper>

            {/* Validation */}
            <Paper sx={{ p: 2, bgcolor: '#111', border: `1px solid ${validation.valid ? '#166534' : '#7f1d1d'}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: validation.errors.length ? 1 : 0 }}>
                {validation.valid
                  ? <><CheckCircle sx={{ color: '#4ade80', fontSize: 18 }} /><Typography variant="body2" sx={{ color: '#4ade80' }}>Valid conventional commit</Typography></>
                  : <><Error sx={{ color: '#ef4444', fontSize: 18 }} /><Typography variant="body2" sx={{ color: '#ef4444' }}>Validation errors</Typography></>
                }
              </Box>
              {validation.errors.map((err, i) => (
                <Typography key={i} variant="caption" sx={{ color: '#fca5a5', display: 'block', pl: 3 }}>- {err}</Typography>
              ))}
            </Paper>
          </Box>

          {/* Preview */}
          <Box sx={{ flex: '1 1 380px', minWidth: 320 }}>
            <Paper sx={{ p: 2.5, bgcolor: '#111', border: '1px solid #222', mb: 2, position: 'sticky', top: 16 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="subtitle2" sx={{ color: 'grey.400' }}>Live Preview</Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Tooltip title="Copy commit message">
                    <IconButton size="small" onClick={() => copy(commitMsg, 'Commit message')} sx={{ color: 'grey.500' }}>
                      <ContentCopy fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              <Box sx={{
                p: 2, bgcolor: '#0d0d0d', borderRadius: 1, border: '1px solid #1a1a1a',
                fontFamily: 'monospace', fontSize: '0.85rem', color: '#c4b5fd',
                whiteSpace: 'pre-wrap', wordBreak: 'break-word', minHeight: 80,
              }}>
                {commitMsg || <span style={{ color: '#555' }}>type(scope): subject</span>}
              </Box>

              <Divider sx={{ my: 2, borderColor: '#222' }} />

              <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1 }}>Git Command</Typography>
              <Box sx={{
                p: 2, bgcolor: '#0d0d0d', borderRadius: 1, border: '1px solid #1a1a1a',
                fontFamily: 'monospace', fontSize: '0.78rem', color: '#86efac',
                whiteSpace: 'pre-wrap', wordBreak: 'break-all',
              }}>
                {subject ? buildGitCommand() : <span style={{ color: '#555' }}>git commit -m &apos;...&apos;</span>}
              </Box>
              <Button size="small" onClick={() => copy(buildGitCommand(), 'Git command')} disabled={!subject}
                sx={{ mt: 1, color: '#8b5cf6', fontSize: '0.75rem' }}>
                Copy git command
              </Button>

              <Divider sx={{ my: 2, borderColor: '#222' }} />

              <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1 }}>Examples by Type</Typography>
              {[
                { t: 'feat', ex: 'feat(auth): add OAuth2 login flow' },
                { t: 'fix', ex: 'fix(parser): handle empty input gracefully' },
                { t: 'docs', ex: 'docs: update API reference for v2' },
                { t: 'refactor', ex: 'refactor(core): extract validation logic' },
                { t: 'perf', ex: 'perf(db): add query result caching' },
                { t: 'test', ex: 'test(utils): add edge case coverage' },
                { t: 'ci', ex: 'ci: add GitHub Actions workflow' },
              ].map(({ t, ex }) => (
                <Box key={t} sx={{ mb: 0.5 }}>
                  <Typography variant="caption" sx={{ color: 'grey.600', fontFamily: 'monospace' }}>{ex}</Typography>
                </Box>
              ))}
            </Paper>
          </Box>
        </Box>
      </Box>
      <Snackbar open={!!snackbar} autoHideDuration={2000} onClose={() => setSnackbar('')} message={snackbar} />
    </Box>
  );
}
