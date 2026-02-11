import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Button, IconButton, Tooltip,
  Snackbar, Chip, Divider, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow,
} from '@mui/material';
import Home from '@mui/icons-material/Home';
import ContentCopy from '@mui/icons-material/ContentCopy';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import CompareArrows from '@mui/icons-material/CompareArrows';
import Delete from '@mui/icons-material/Delete';

interface SemVer {
  major: number;
  minor: number;
  patch: number;
  prerelease: string;
  build: string;
  raw: string;
  valid: boolean;
}

function parseSemVer(str: string): SemVer {
  const invalid: SemVer = { major: 0, minor: 0, patch: 0, prerelease: '', build: '', raw: str, valid: false };
  if (!str.trim()) return invalid;
  const clean = str.trim().replace(/^v/i, '');
  const buildSplit = clean.split('+');
  const build = buildSplit.length > 1 ? buildSplit.slice(1).join('+') : '';
  const preSplit = buildSplit[0].split('-');
  const prerelease = preSplit.length > 1 ? preSplit.slice(1).join('-') : '';
  const parts = preSplit[0].split('.');
  if (parts.length < 1 || parts.length > 3) return invalid;
  const nums = parts.map(Number);
  if (nums.some(isNaN) || nums.some((n) => n < 0)) return invalid;
  return {
    major: nums[0] || 0,
    minor: nums[1] || 0,
    patch: nums[2] || 0,
    prerelease,
    build,
    raw: str,
    valid: true,
  };
}

function formatSemVer(v: SemVer): string {
  let s = `${v.major}.${v.minor}.${v.patch}`;
  if (v.prerelease) s += `-${v.prerelease}`;
  if (v.build) s += `+${v.build}`;
  return s;
}

function compareSemVer(a: SemVer, b: SemVer): number {
  if (a.major !== b.major) return a.major - b.major;
  if (a.minor !== b.minor) return a.minor - b.minor;
  if (a.patch !== b.patch) return a.patch - b.patch;
  if (!a.prerelease && b.prerelease) return 1;
  if (a.prerelease && !b.prerelease) return -1;
  if (a.prerelease && b.prerelease) return a.prerelease < b.prerelease ? -1 : a.prerelease > b.prerelease ? 1 : 0;
  return 0;
}

function satisfiesRange(version: string, range: string): boolean {
  const v = parseSemVer(version);
  if (!v.valid) return false;
  const r = range.trim();

  if (r === '*' || r === 'x' || r === '') return true;

  // Handle x-ranges: 1.x, 1.2.x
  if (/^\d+\.x(\.x)?$/.test(r)) {
    const major = parseInt(r.split('.')[0]);
    return v.major === major;
  }
  if (/^\d+\.\d+\.x$/.test(r)) {
    const parts = r.split('.');
    return v.major === parseInt(parts[0]) && v.minor === parseInt(parts[1]);
  }

  // Handle caret ^
  if (r.startsWith('^')) {
    const base = parseSemVer(r.slice(1));
    if (!base.valid) return false;
    if (base.major > 0) return v.major === base.major && compareSemVer(v, base) >= 0;
    if (base.minor > 0) return v.major === 0 && v.minor === base.minor && compareSemVer(v, base) >= 0;
    return v.major === 0 && v.minor === 0 && v.patch === base.patch;
  }

  // Handle tilde ~
  if (r.startsWith('~')) {
    const base = parseSemVer(r.slice(1));
    if (!base.valid) return false;
    return v.major === base.major && v.minor === base.minor && v.patch >= base.patch;
  }

  // Handle >= and < combined
  const combinedMatch = r.match(/^>=?\s*([\d.]+)\s+<\s*([\d.]+)$/);
  if (combinedMatch) {
    const lo = parseSemVer(combinedMatch[1]);
    const hi = parseSemVer(combinedMatch[2]);
    if (!lo.valid || !hi.valid) return false;
    return compareSemVer(v, lo) >= 0 && compareSemVer(v, hi) < 0;
  }

  // Handle single comparators
  const singleMatch = r.match(/^(>=?|<=?|=)\s*([\d][.\d\w-]*)$/);
  if (singleMatch) {
    const op = singleMatch[1];
    const target = parseSemVer(singleMatch[2]);
    if (!target.valid) return false;
    const cmp = compareSemVer(v, target);
    switch (op) {
      case '>': return cmp > 0;
      case '>=': return cmp >= 0;
      case '<': return cmp < 0;
      case '<=': return cmp <= 0;
      case '=': return cmp === 0;
    }
  }

  // Exact match
  const exact = parseSemVer(r);
  if (exact.valid) return compareSemVer(v, exact) === 0;

  return false;
}

function coerceToSemVer(input: string): string {
  const s = input.trim().replace(/^v/i, '');
  const nums = s.match(/(\d+)/g);
  if (!nums) return '0.0.0';
  const major = nums[0] || '0';
  const minor = nums[1] || '0';
  const patch = nums[2] || '0';
  return `${major}.${minor}.${patch}`;
}

export default function App() {
  const [version, setVersion] = useState('1.2.3');
  const [prerelease, setPrerelease] = useState('');
  const [buildMeta, setBuildMeta] = useState('');
  const [rangeInput, setRangeInput] = useState('^1.2.0');
  const [checkVersion, setCheckVersion] = useState('1.3.0');
  const [compareA, setCompareA] = useState('1.2.3');
  const [compareB, setCompareB] = useState('1.3.0');
  const [coerceInput, setCoerceInput] = useState('v1.2');
  const [history, setHistory] = useState<string[]>(['1.0.0', '1.1.0', '1.2.0', '1.2.3']);
  const [snackbar, setSnackbar] = useState('');

  const parsed = useMemo(() => {
    const v = parseSemVer(version);
    if (prerelease) v.prerelease = prerelease;
    if (buildMeta) v.build = buildMeta;
    return v;
  }, [version, prerelease, buildMeta]);

  const bump = (type: 'major' | 'minor' | 'patch') => {
    const v = parseSemVer(version);
    if (!v.valid) return;
    const old = formatSemVer(v);
    if (type === 'major') { v.major++; v.minor = 0; v.patch = 0; }
    else if (type === 'minor') { v.minor++; v.patch = 0; }
    else { v.patch++; }
    v.prerelease = '';
    v.build = '';
    const newV = formatSemVer(v);
    setVersion(newV);
    setPrerelease('');
    setBuildMeta('');
    if (!history.includes(old)) setHistory([...history, old]);
  };

  const rangeResult = satisfiesRange(checkVersion, rangeInput);
  const cmpA = parseSemVer(compareA);
  const cmpB = parseSemVer(compareB);
  const cmpResult = cmpA.valid && cmpB.valid ? compareSemVer(cmpA, cmpB) : null;
  const coerced = coerceToSemVer(coerceInput);

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setSnackbar('Copied to clipboard');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a', p: 3 }}>
      <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Link to="/"><IconButton size="small" sx={{ color: 'grey.500' }}><Home /></IconButton></Link>
          <ArrowUpward sx={{ color: '#06b6d4', fontSize: 28 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'grey.300' }}>SemVer Calculator</Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 450px', minWidth: 320 }}>
            {/* Current Version */}
            <Paper sx={{ p: 2.5, bgcolor: '#111', border: '1px solid #222', mb: 2 }}>
              <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1.5 }}>Current Version</Typography>
              <TextField fullWidth size="small" value={version} onChange={(e) => setVersion(e.target.value)}
                sx={{ mb: 1.5, '& .MuiOutlinedInput-root': { color: '#22d3ee', fontFamily: 'monospace', fontSize: '1.2rem', fontWeight: 700 }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' } }} />

              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Button variant="contained" onClick={() => bump('major')} sx={{ bgcolor: '#dc2626', flex: 1, fontWeight: 700, '&:hover': { bgcolor: '#b91c1c' } }}>Major</Button>
                <Button variant="contained" onClick={() => bump('minor')} sx={{ bgcolor: '#2563eb', flex: 1, fontWeight: 700, '&:hover': { bgcolor: '#1d4ed8' } }}>Minor</Button>
                <Button variant="contained" onClick={() => bump('patch')} sx={{ bgcolor: '#16a34a', flex: 1, fontWeight: 700, '&:hover': { bgcolor: '#15803d' } }}>Patch</Button>
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField size="small" label="Pre-release" placeholder="alpha.1" value={prerelease} onChange={(e) => setPrerelease(e.target.value)}
                  sx={{ flex: 1, '& .MuiOutlinedInput-root': { color: 'grey.300' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' }, '& .MuiInputLabel-root': { color: 'grey.500' } }} />
                <TextField size="small" label="Build metadata" placeholder="20240101" value={buildMeta} onChange={(e) => setBuildMeta(e.target.value)}
                  sx={{ flex: 1, '& .MuiOutlinedInput-root': { color: 'grey.300' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' }, '& .MuiInputLabel-root': { color: 'grey.500' } }} />
              </Box>

              {parsed.valid && (
                <Box sx={{ mt: 2, p: 1.5, bgcolor: '#0d0d0d', borderRadius: 1, border: '1px solid #1a1a1a' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontFamily: 'monospace', fontSize: '1rem', color: '#22d3ee', fontWeight: 700 }}>
                      {formatSemVer(parsed)}
                    </Typography>
                    <IconButton size="small" onClick={() => copy(formatSemVer(parsed))} sx={{ color: 'grey.500' }}><ContentCopy sx={{ fontSize: 16 }} /></IconButton>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Chip label={`Major: ${parsed.major}`} size="small" sx={{ bgcolor: '#dc262622', color: '#f87171', fontSize: '0.7rem' }} />
                    <Chip label={`Minor: ${parsed.minor}`} size="small" sx={{ bgcolor: '#2563eb22', color: '#60a5fa', fontSize: '0.7rem' }} />
                    <Chip label={`Patch: ${parsed.patch}`} size="small" sx={{ bgcolor: '#16a34a22', color: '#4ade80', fontSize: '0.7rem' }} />
                    {parsed.prerelease && <Chip label={`Pre: ${parsed.prerelease}`} size="small" sx={{ bgcolor: '#d9770622', color: '#fbbf24', fontSize: '0.7rem' }} />}
                    {parsed.build && <Chip label={`Build: ${parsed.build}`} size="small" sx={{ bgcolor: '#71717a22', color: 'grey.400', fontSize: '0.7rem' }} />}
                  </Box>
                </Box>
              )}
            </Paper>

            {/* Range Check */}
            <Paper sx={{ p: 2.5, bgcolor: '#111', border: '1px solid #222', mb: 2 }}>
              <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1.5 }}>Version Range Checker</Typography>
              <TextField fullWidth size="small" label="Range" value={rangeInput} onChange={(e) => setRangeInput(e.target.value)}
                sx={{ mb: 1, '& .MuiOutlinedInput-root': { color: 'grey.300', fontFamily: 'monospace' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' }, '& .MuiInputLabel-root': { color: 'grey.500' } }} />
              <TextField fullWidth size="small" label="Version to check" value={checkVersion} onChange={(e) => setCheckVersion(e.target.value)}
                sx={{ mb: 1.5, '& .MuiOutlinedInput-root': { color: 'grey.300', fontFamily: 'monospace' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' }, '& .MuiInputLabel-root': { color: 'grey.500' } }} />
              <Chip
                label={rangeResult ? `${checkVersion} satisfies ${rangeInput}` : `${checkVersion} does NOT satisfy ${rangeInput}`}
                sx={{ bgcolor: rangeResult ? '#16a34a22' : '#dc262622', color: rangeResult ? '#4ade80' : '#f87171', fontWeight: 600, fontFamily: 'monospace', fontSize: '0.8rem' }}
              />
            </Paper>

            {/* Compare */}
            <Paper sx={{ p: 2.5, bgcolor: '#111', border: '1px solid #222', mb: 2 }}>
              <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1.5 }}>Compare Versions</Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1.5 }}>
                <TextField size="small" value={compareA} onChange={(e) => setCompareA(e.target.value)}
                  sx={{ flex: 1, '& .MuiOutlinedInput-root': { color: 'grey.300', fontFamily: 'monospace' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' } }} />
                <CompareArrows sx={{ color: 'grey.600' }} />
                <TextField size="small" value={compareB} onChange={(e) => setCompareB(e.target.value)}
                  sx={{ flex: 1, '& .MuiOutlinedInput-root': { color: 'grey.300', fontFamily: 'monospace' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' } }} />
              </Box>
              {cmpResult !== null && (
                <Typography sx={{ fontFamily: 'monospace', color: '#22d3ee', fontWeight: 600 }}>
                  {cmpResult > 0 ? `${compareA} > ${compareB}` : cmpResult < 0 ? `${compareA} < ${compareB}` : `${compareA} = ${compareB}`}
                </Typography>
              )}
            </Paper>

            {/* Coerce */}
            <Paper sx={{ p: 2.5, bgcolor: '#111', border: '1px solid #222' }}>
              <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1.5 }}>Coerce to SemVer</Typography>
              <TextField fullWidth size="small" label="Non-semver input" value={coerceInput} onChange={(e) => setCoerceInput(e.target.value)}
                sx={{ mb: 1, '& .MuiOutlinedInput-root': { color: 'grey.300', fontFamily: 'monospace' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' }, '& .MuiInputLabel-root': { color: 'grey.500' } }} />
              <Typography sx={{ fontFamily: 'monospace', color: '#22d3ee' }}>{coerced}</Typography>
            </Paper>
          </Box>

          {/* Right Column */}
          <Box sx={{ flex: '1 1 350px', minWidth: 280 }}>
            <Paper sx={{ p: 2.5, bgcolor: '#111', border: '1px solid #222', mb: 2 }}>
              <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1 }}>Version History</Typography>
              {history.length === 0
                ? <Typography variant="caption" sx={{ color: 'grey.600' }}>No versions yet</Typography>
                : [...history].reverse().map((h, i) => (
                    <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5, borderBottom: '1px solid #1a1a1a' }}>
                      <Typography sx={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'grey.300' }}>{h}</Typography>
                      <Box>
                        <IconButton size="small" onClick={() => { setVersion(h); }} sx={{ color: 'grey.600', p: 0.25 }}>
                          <ArrowUpward sx={{ fontSize: 14 }} />
                        </IconButton>
                        <IconButton size="small" onClick={() => setHistory(history.filter((x) => x !== h))} sx={{ color: 'grey.600', p: 0.25 }}>
                          <Delete sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Box>
                    </Box>
                  ))
              }
            </Paper>

            <Paper sx={{ p: 2.5, bgcolor: '#111', border: '1px solid #222' }}>
              <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1 }}>Range Syntax Reference</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: 'grey.500', borderColor: '#222', fontSize: '0.7rem' }}>Syntax</TableCell>
                      <TableCell sx={{ color: 'grey.500', borderColor: '#222', fontSize: '0.7rem' }}>Meaning</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[
                      ['^1.2.3', '>=1.2.3, <2.0.0'],
                      ['~1.2.3', '>=1.2.3, <1.3.0'],
                      ['>=1.0.0 <2.0.0', 'Between 1.0.0 and 2.0.0'],
                      ['1.x', 'Any 1.x.x'],
                      ['1.2.x', 'Any 1.2.x'],
                      ['*', 'Any version'],
                      ['>1.0.0', 'Greater than 1.0.0'],
                      ['<=2.0.0', 'Up to and including 2.0.0'],
                    ].map(([s, m]) => (
                      <TableRow key={s}>
                        <TableCell sx={{ color: '#22d3ee', borderColor: '#222', fontFamily: 'monospace', fontSize: '0.75rem' }}>{s}</TableCell>
                        <TableCell sx={{ color: 'grey.400', borderColor: '#222', fontSize: '0.75rem' }}>{m}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
        </Box>
      </Box>
      <Snackbar open={!!snackbar} autoHideDuration={2000} onClose={() => setSnackbar('')} message={snackbar} />
    </Box>
  );
}
