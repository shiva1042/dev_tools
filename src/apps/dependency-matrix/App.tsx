import { useState, useMemo, useCallback } from 'react';
import {
  Box, Paper, Typography, TextField, Button, IconButton, Tooltip, Select, MenuItem,
  FormControl, InputLabel, Snackbar, Chip, Tabs, Tab,
} from '@mui/material';
import { ContentCopy, Home, Add, Delete, Search, Upload, Download, Warning } from '@mui/icons-material';
import { Link } from 'react-router-dom';

interface Pkg {
  id: string; name: string; version: string; type: 'direct' | 'dev' | 'peer' | 'optional';
}
interface Dep { from: string; to: string; }

const TYPE_COLORS: Record<string, string> = { direct: '#4caf50', dev: '#ff9800', peer: '#2196f3', optional: '#9c27b0' };
const sxField = { '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#333' }, '&:hover fieldset': { borderColor: '#555' }, '&.Mui-focused fieldset': { borderColor: '#1976d2' } }, '& .MuiInputLabel-root': { color: 'grey.500' }, '& .MuiInputBase-input': { color: 'grey.300' }, '& .MuiSelect-icon': { color: 'grey.500' } };

export default function App() {
  const [packages, setPackages] = useState<Pkg[]>([
    { id: '1', name: 'react', version: '18.2.0', type: 'direct' },
    { id: '2', name: 'react-dom', version: '18.2.0', type: 'direct' },
    { id: '3', name: 'typescript', version: '5.3.0', type: 'dev' },
    { id: '4', name: 'vite', version: '5.0.0', type: 'dev' },
  ]);
  const [deps, setDeps] = useState<Dep[]>([{ from: '2', to: '1' }]);
  const [newName, setNewName] = useState('');
  const [newVersion, setNewVersion] = useState('');
  const [newType, setNewType] = useState<Pkg['type']>('direct');
  const [depFrom, setDepFrom] = useState('');
  const [depTo, setDepTo] = useState('');
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState(0);
  const [importJson, setImportJson] = useState('');
  const [snack, setSnack] = useState('');

  const copy = useCallback((t: string) => { navigator.clipboard.writeText(t); setSnack('Copied!'); }, []);

  const addPackage = () => {
    if (!newName.trim()) return;
    const id = Date.now().toString();
    setPackages(p => [...p, { id, name: newName.trim(), version: newVersion.trim() || '0.0.0', type: newType }]);
    setNewName(''); setNewVersion('');
  };

  const removePackage = (id: string) => {
    setPackages(p => p.filter(x => x.id !== id));
    setDeps(d => d.filter(x => x.from !== id && x.to !== id));
  };

  const addDep = () => {
    if (!depFrom || !depTo || depFrom === depTo) return;
    if (deps.some(d => d.from === depFrom && d.to === depTo)) return;
    setDeps(d => [...d, { from: depFrom, to: depTo }]);
    setDepFrom(''); setDepTo('');
  };

  const removeDep = (i: number) => setDeps(d => d.filter((_, j) => j !== i));

  const circular = useMemo(() => {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const stack = new Set<string>();
    const path: string[] = [];
    const dfs = (node: string) => {
      visited.add(node); stack.add(node); path.push(node);
      for (const d of deps.filter(x => x.from === node)) {
        if (stack.has(d.to)) {
          const ci = path.indexOf(d.to);
          cycles.push([...path.slice(ci), d.to]);
        } else if (!visited.has(d.to)) dfs(d.to);
      }
      path.pop(); stack.delete(node);
    };
    packages.forEach(p => { if (!visited.has(p.id)) dfs(p.id); });
    return cycles;
  }, [packages, deps]);

  const circularIds = useMemo(() => new Set(circular.flat()), [circular]);

  const filtered = useMemo(() => {
    if (!search) return packages;
    const s = search.toLowerCase();
    return packages.filter(p => p.name.toLowerCase().includes(s) || p.type.includes(s));
  }, [packages, search]);

  const depCount = useCallback((id: string) => deps.filter(d => d.from === id).length, [deps]);
  const depByCount = useCallback((id: string) => deps.filter(d => d.to === id).length, [deps]);

  const handleImport = () => {
    try {
      const json = JSON.parse(importJson);
      const newPkgs: Pkg[] = [];
      const addDeps = (obj: Record<string, string>, type: Pkg['type']) => {
        Object.entries(obj).forEach(([name, version]) => {
          const id = Date.now().toString() + Math.random().toString(36).slice(2, 6);
          newPkgs.push({ id, name, version: String(version), type });
        });
      };
      if (json.dependencies) addDeps(json.dependencies, 'direct');
      if (json.devDependencies) addDeps(json.devDependencies, 'dev');
      if (json.peerDependencies) addDeps(json.peerDependencies, 'peer');
      if (json.optionalDependencies) addDeps(json.optionalDependencies, 'optional');
      setPackages(prev => [...prev, ...newPkgs]);
      setImportJson('');
      setSnack(`Imported ${newPkgs.length} packages`);
    } catch { setSnack('Invalid JSON'); }
  };

  const exportJson = () => {
    const out: Record<string, Record<string, string>> = {};
    packages.forEach(p => {
      const key = p.type === 'direct' ? 'dependencies' : p.type === 'dev' ? 'devDependencies' : p.type === 'peer' ? 'peerDependencies' : 'optionalDependencies';
      if (!out[key]) out[key] = {};
      out[key][p.name] = p.version;
    });
    return JSON.stringify(out, null, 2);
  };

  const exportDot = () => {
    let dot = 'digraph Dependencies {\n  rankdir=LR;\n  node [shape=box, style=filled];\n';
    packages.forEach(p => {
      dot += `  "${p.name}" [fillcolor="${TYPE_COLORS[p.type]}22", label="${p.name}@${p.version}"];\n`;
    });
    deps.forEach(d => {
      const from = packages.find(p => p.id === d.from);
      const to = packages.find(p => p.id === d.to);
      if (from && to) dot += `  "${from.name}" -> "${to.name}";\n`;
    });
    dot += '}';
    return dot;
  };

  const exportMd = () => {
    let md = '| Package | Version | Type | Dependencies | Depended By |\n|---------|---------|------|-------------|-------------|\n';
    packages.forEach(p => {
      const depNames = deps.filter(d => d.from === p.id).map(d => packages.find(x => x.id === d.to)?.name).filter(Boolean).join(', ');
      const byNames = deps.filter(d => d.to === p.id).map(d => packages.find(x => x.id === d.from)?.name).filter(Boolean).join(', ');
      md += `| ${p.name} | ${p.version} | ${p.type} | ${depNames || '-'} | ${byNames || '-'} |\n`;
    });
    return md;
  };

  const getName = (id: string) => packages.find(p => p.id === id)?.name || '?';

  const renderTree = (nodeId: string, depth: number, visited: Set<string>): string => {
    const indent = '  '.repeat(depth);
    const pkg = packages.find(p => p.id === nodeId);
    if (!pkg) return '';
    const isCyclic = visited.has(nodeId);
    let line = `${indent}${depth > 0 ? '|- ' : ''}${pkg.name}@${pkg.version}${isCyclic ? ' [CIRCULAR]' : ''}\n`;
    if (isCyclic) return line;
    const newVisited = new Set(visited);
    newVisited.add(nodeId);
    deps.filter(d => d.from === nodeId).forEach(d => { line += renderTree(d.to, depth + 1, newVisited); });
    return line;
  };

  const treeText = useMemo(() => {
    const roots = packages.filter(p => !deps.some(d => d.to === p.id));
    return roots.map(r => renderTree(r.id, 0, new Set())).join('\n');
  }, [packages, deps]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a', color: 'grey.300', p: 3 }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <Link to="/"><IconButton size="small" sx={{ color: 'grey.500' }}><Home /></IconButton></Link>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Dependency Matrix Visualizer</Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, flex: 1, minWidth: 300 }}>
            <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1 }}>Add Package</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <TextField size="small" label="Name" value={newName} onChange={e => setNewName(e.target.value)} sx={{ flex: 1, minWidth: 120, ...sxField }} />
              <TextField size="small" label="Version" value={newVersion} onChange={e => setNewVersion(e.target.value)} sx={{ width: 100, ...sxField }} />
              <FormControl size="small" sx={{ width: 120, ...sxField }}>
                <InputLabel sx={{ color: 'grey.500' }}>Type</InputLabel>
                <Select value={newType} onChange={e => setNewType(e.target.value as Pkg['type'])} label="Type" sx={{ color: 'grey.300' }}>
                  {['direct', 'dev', 'peer', 'optional'].map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </Select>
              </FormControl>
              <Button variant="outlined" size="small" onClick={addPackage} startIcon={<Add />} sx={{ borderColor: '#333' }}>Add</Button>
            </Box>
          </Paper>

          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, flex: 1, minWidth: 300 }}>
            <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1 }}>Add Dependency Relationship</Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <FormControl size="small" sx={{ flex: 1, ...sxField }}>
                <InputLabel sx={{ color: 'grey.500' }}>From</InputLabel>
                <Select value={depFrom} onChange={e => setDepFrom(e.target.value)} label="From" sx={{ color: 'grey.300' }}>
                  {packages.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
                </Select>
              </FormControl>
              <Typography sx={{ color: 'grey.500' }}>depends on</Typography>
              <FormControl size="small" sx={{ flex: 1, ...sxField }}>
                <InputLabel sx={{ color: 'grey.500' }}>To</InputLabel>
                <Select value={depTo} onChange={e => setDepTo(e.target.value)} label="To" sx={{ color: 'grey.300' }}>
                  {packages.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
                </Select>
              </FormControl>
              <Button variant="outlined" size="small" onClick={addDep} startIcon={<Add />} sx={{ borderColor: '#333' }}>Add</Button>
            </Box>
          </Paper>
        </Box>

        <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'center' }}>
            <TextField size="small" label="Search packages" value={search} onChange={e => setSearch(e.target.value)} InputProps={{ startAdornment: <Search sx={{ color: 'grey.500', mr: 1 }} /> }} sx={{ flex: 1, ...sxField }} />
            {Object.entries(TYPE_COLORS).map(([t, c]) => (
              <Chip key={t} label={`${t} (${packages.filter(p => p.type === t).length})`} size="small" sx={{ bgcolor: c + '22', color: c, border: `1px solid ${c}44` }} />
            ))}
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {filtered.map(p => (
              <Chip key={p.id} label={`${p.name}@${p.version} [${depCount(p.id)} deps, ${depByCount(p.id)} depBy]`} size="small"
                onDelete={() => removePackage(p.id)}
                sx={{ bgcolor: (circularIds.has(p.id) ? '#f4433622' : TYPE_COLORS[p.type] + '22'), color: circularIds.has(p.id) ? '#f44336' : TYPE_COLORS[p.type], border: `1px solid ${circularIds.has(p.id) ? '#f44336' : TYPE_COLORS[p.type]}44`, '& .MuiChip-deleteIcon': { color: 'grey.600' } }} />
            ))}
          </Box>
          {deps.length > 0 && (
            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              <Typography variant="caption" sx={{ color: 'grey.500', width: '100%', mb: 0.5 }}>Relationships:</Typography>
              {deps.map((d, i) => (
                <Chip key={i} label={`${getName(d.from)} -> ${getName(d.to)}`} size="small" onDelete={() => removeDep(i)}
                  sx={{ bgcolor: '#1a2332', color: '#90caf9', '& .MuiChip-deleteIcon': { color: '#5a8ab5' } }} />
              ))}
            </Box>
          )}
          {circular.length > 0 && (
            <Box sx={{ mt: 2, p: 1.5, bgcolor: '#f4433611', border: '1px solid #f4433644', borderRadius: 1 }}>
              <Typography variant="caption" sx={{ color: '#f44336', display: 'flex', alignItems: 'center', gap: 0.5 }}><Warning fontSize="small" /> Circular dependencies detected:</Typography>
              {circular.map((c, i) => <Typography key={i} variant="caption" sx={{ color: '#ef9a9a', display: 'block', ml: 2 }}>{c.map(id => getName(id)).join(' -> ')}</Typography>)}
            </Box>
          )}
        </Paper>

        <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 3 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, '& .MuiTab-root': { color: 'grey.500', textTransform: 'none', fontSize: 13 }, '& .Mui-selected': { color: '#90caf9' } }}>
            <Tab label="Matrix View" /><Tab label="Tree View" /><Tab label="Import" /><Tab label="Export" />
          </Tabs>

          {tab === 0 && (
            <Box sx={{ overflow: 'auto' }}>
              {filtered.length > 0 ? (
                <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                  <thead>
                    <tr><td style={{ padding: 4, border: '1px solid #333', fontSize: 11, color: '#999' }}>depends on &rarr;</td>
                      {filtered.map(p => <td key={p.id} style={{ padding: 4, border: '1px solid #333', fontSize: 11, color: TYPE_COLORS[p.type], writingMode: 'vertical-rl', textOrientation: 'mixed', maxWidth: 30 }}>{p.name}</td>)}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(row => (
                      <tr key={row.id}>
                        <td style={{ padding: 4, border: '1px solid #333', fontSize: 11, color: TYPE_COLORS[row.type], whiteSpace: 'nowrap' }}>{row.name}</td>
                        {filtered.map(col => {
                          const hasDep = deps.some(d => d.from === row.id && d.to === col.id);
                          const isSelf = row.id === col.id;
                          const isCyc = hasDep && circular.some(c => c.includes(row.id) && c.includes(col.id));
                          return <td key={col.id} style={{ padding: 4, border: '1px solid #333', textAlign: 'center', fontSize: 12, backgroundColor: isSelf ? '#1a1a1a' : hasDep ? (isCyc ? '#f4433633' : '#4caf5033') : 'transparent', color: isCyc ? '#f44336' : '#4caf50', cursor: !isSelf ? 'pointer' : 'default' }}
                            onClick={() => {
                              if (isSelf) return;
                              if (hasDep) setDeps(d => d.filter(x => !(x.from === row.id && x.to === col.id)));
                              else setDeps(d => [...d, { from: row.id, to: col.id }]);
                            }}>{isSelf ? '-' : hasDep ? (isCyc ? '!!' : '\u2714') : ''}</td>;
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <Typography sx={{ color: 'grey.500', fontSize: 13 }}>Add packages to see the matrix</Typography>}
            </Box>
          )}

          {tab === 1 && (
            <Box sx={{ position: 'relative' }}>
              <Tooltip title="Copy"><IconButton onClick={() => copy(treeText)} sx={{ position: 'absolute', right: 0, top: 0, color: 'grey.400' }}><ContentCopy fontSize="small" /></IconButton></Tooltip>
              <Box component="pre" sx={{ color: '#81c784', fontFamily: 'monospace', fontSize: 13, overflow: 'auto', maxHeight: 400, whiteSpace: 'pre', m: 0 }}>
                {treeText || 'No packages added yet.'}
              </Box>
            </Box>
          )}

          {tab === 2 && (
            <Box>
              <Typography variant="caption" sx={{ color: 'grey.500', mb: 1, display: 'block' }}>Paste package.json content to import dependencies</Typography>
              <TextField multiline rows={6} fullWidth value={importJson} onChange={e => setImportJson(e.target.value)} placeholder='{"dependencies":{"react":"^18.0.0"},"devDependencies":{...}}' sx={{ mb: 1, ...sxField }} />
              <Button variant="outlined" size="small" onClick={handleImport} startIcon={<Upload />} sx={{ borderColor: '#333' }}>Import</Button>
            </Box>
          )}

          {tab === 3 && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="outlined" size="small" onClick={() => copy(exportJson())} startIcon={<Download />} sx={{ borderColor: '#333' }}>JSON</Button>
              <Button variant="outlined" size="small" onClick={() => copy(exportDot())} startIcon={<Download />} sx={{ borderColor: '#333' }}>DOT (Graphviz)</Button>
              <Button variant="outlined" size="small" onClick={() => copy(exportMd())} startIcon={<Download />} sx={{ borderColor: '#333' }}>Markdown</Button>
            </Box>
          )}
        </Paper>
      </Box>
      <Snackbar open={!!snack} autoHideDuration={2000} onClose={() => setSnack('')} message={snack} />
    </Box>
  );
}
