import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Chip,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  ContentCopy,
  Home,
  Add,
  Delete,
  Download,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

interface TaskParam {
  key: string;
  value: string;
}

interface Task {
  name: string;
  module: string;
  params: TaskParam[];
  when: string;
  register: string;
  notify: string;
}

interface Handler {
  name: string;
  module: string;
  params: TaskParam[];
}

interface Variable {
  key: string;
  value: string;
}

const modules = [
  'apt', 'yum', 'copy', 'template', 'service', 'command', 'shell', 'file',
  'git', 'docker_container', 'docker_image', 'pip', 'user', 'group',
  'lineinfile', 'blockinfile', 'systemd', 'firewalld', 'ufw', 'cron',
  'unarchive', 'get_url', 'uri', 'debug', 'set_fact', 'wait_for',
  'package', 'stat', 'synchronize', 'mount',
];

const moduleDefaults: Record<string, TaskParam[]> = {
  apt: [{ key: 'name', value: '' }, { key: 'state', value: 'present' }, { key: 'update_cache', value: 'yes' }],
  yum: [{ key: 'name', value: '' }, { key: 'state', value: 'present' }],
  copy: [{ key: 'src', value: '' }, { key: 'dest', value: '' }, { key: 'mode', value: '0644' }],
  template: [{ key: 'src', value: '' }, { key: 'dest', value: '' }],
  service: [{ key: 'name', value: '' }, { key: 'state', value: 'started' }, { key: 'enabled', value: 'yes' }],
  command: [{ key: 'cmd', value: '' }],
  shell: [{ key: 'cmd', value: '' }],
  file: [{ key: 'path', value: '' }, { key: 'state', value: 'directory' }, { key: 'mode', value: '0755' }],
  git: [{ key: 'repo', value: '' }, { key: 'dest', value: '' }, { key: 'version', value: 'main' }],
  docker_container: [{ key: 'name', value: '' }, { key: 'image', value: '' }, { key: 'state', value: 'started' }],
  debug: [{ key: 'msg', value: '' }],
};

export default function AnsiblePlaybookBuilder() {
  const [playbookName, setPlaybookName] = useState('Setup Server');
  const [hosts, setHosts] = useState('all');
  const [become, setBecome] = useState(true);
  const [gatherFacts, setGatherFacts] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([
    { name: 'Update apt cache', module: 'apt', params: [{ key: 'update_cache', value: 'yes' }], when: '', register: '', notify: '' },
  ]);
  const [handlers, setHandlers] = useState<Handler[]>([]);
  const [variables, setVariables] = useState<Variable[]>([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const addTask = () => {
    setTasks([...tasks, { name: '', module: 'command', params: [{ key: 'cmd', value: '' }], when: '', register: '', notify: '' }]);
  };
  const removeTask = (i: number) => setTasks(tasks.filter((_, idx) => idx !== i));
  const updateTask = (i: number, field: string, val: unknown) => {
    const t = [...tasks]; t[i] = { ...t[i], [field]: val }; setTasks(t);
  };
  const setModule = (i: number, mod: string) => {
    const t = [...tasks];
    t[i] = { ...t[i], module: mod, params: moduleDefaults[mod] ? [...moduleDefaults[mod]] : [{ key: '', value: '' }] };
    setTasks(t);
  };
  const addTaskParam = (i: number) => {
    const t = [...tasks]; t[i].params = [...t[i].params, { key: '', value: '' }]; setTasks(t);
  };
  const updateTaskParam = (ti: number, pi: number, field: 'key' | 'value', val: string) => {
    const t = [...tasks]; t[ti].params = [...t[ti].params]; t[ti].params[pi] = { ...t[ti].params[pi], [field]: val }; setTasks(t);
  };
  const removeTaskParam = (ti: number, pi: number) => {
    const t = [...tasks]; t[ti].params = t[ti].params.filter((_, idx) => idx !== pi); setTasks(t);
  };

  const addHandler = () => setHandlers([...handlers, { name: '', module: 'service', params: [{ key: 'name', value: '' }, { key: 'state', value: 'restarted' }] }]);
  const removeHandler = (i: number) => setHandlers(handlers.filter((_, idx) => idx !== i));

  const addVariable = () => setVariables([...variables, { key: '', value: '' }]);
  const removeVariable = (i: number) => setVariables(variables.filter((_, idx) => idx !== i));

  const yamlVal = (v: string): string => {
    if (v === 'yes' || v === 'no' || v === 'true' || v === 'false') return v;
    if (!isNaN(Number(v)) && v.trim() !== '') return v;
    if (v.includes(':') || v.includes('#') || v.includes('{') || v.includes('[') || v.includes('"') || v.includes("'")) return `"${v.replace(/"/g, '\\"')}"`;
    return v;
  };

  const generateYaml = (): string => {
    let out = `---\n- name: ${playbookName}\n  hosts: ${hosts}\n  become: ${become}\n  gather_facts: ${gatherFacts}\n`;
    if (variables.length > 0) {
      out += `  vars:\n`;
      variables.forEach(v => { out += `    ${v.key}: ${yamlVal(v.value)}\n`; });
    }
    if (tasks.length > 0) {
      out += `\n  tasks:\n`;
      tasks.forEach(t => {
        out += `    - name: ${t.name}\n`;
        out += `      ${t.module}:\n`;
        t.params.forEach(p => {
          if (p.key && p.value) out += `        ${p.key}: ${yamlVal(p.value)}\n`;
        });
        if (t.when) out += `      when: ${t.when}\n`;
        if (t.register) out += `      register: ${t.register}\n`;
        if (t.notify) out += `      notify: ${t.notify}\n`;
      });
    }
    if (handlers.length > 0) {
      out += `\n  handlers:\n`;
      handlers.forEach(h => {
        out += `    - name: ${h.name}\n`;
        out += `      ${h.module}:\n`;
        h.params.forEach(p => {
          if (p.key && p.value) out += `        ${p.key}: ${yamlVal(p.value)}\n`;
        });
      });
    }
    return out;
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setSnackbar({ open: true, message: 'Copied to clipboard' });
  };

  const handleDownload = () => {
    const blob = new Blob([generateYaml()], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'playbook.yml'; a.click();
    URL.revokeObjectURL(url);
  };

  const inputSx = {
    '& .MuiInputBase-root': { bgcolor: '#0a0a0a', color: '#d4d4d4', fontSize: 14 },
    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
    '& .MuiInputLabel-root': { color: 'grey.500' },
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a' }}>
      <Paper elevation={0} sx={{ bgcolor: '#111', borderBottom: '1px solid #222', px: 3, py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Link to="/"><IconButton size="small" sx={{ color: 'grey.500' }}><Home /></IconButton></Link>
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>Ansible Playbook Builder</Typography>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', gap: 3, p: 3, minHeight: 'calc(100vh - 72px)' }}>
        {/* Left: Config */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, overflow: 'auto', maxHeight: 'calc(100vh - 100px)' }}>
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
            <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 2 }}>Playbook Settings</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="Playbook Name" size="small" fullWidth value={playbookName} onChange={e => setPlaybookName(e.target.value)} sx={inputSx} />
              <TextField label="Hosts" size="small" fullWidth value={hosts} onChange={e => setHosts(e.target.value)} sx={inputSx} />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControlLabel control={<Switch checked={become} onChange={e => setBecome(e.target.checked)} size="small" />} label={<Typography sx={{ color: 'grey.400', fontSize: 14 }}>Become (sudo)</Typography>} />
                <FormControlLabel control={<Switch checked={gatherFacts} onChange={e => setGatherFacts(e.target.checked)} size="small" />} label={<Typography sx={{ color: 'grey.400', fontSize: 14 }}>Gather Facts</Typography>} />
              </Box>
            </Box>
          </Paper>

          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle2" sx={{ color: 'grey.400' }}>Variables</Typography>
              <IconButton size="small" onClick={addVariable} sx={{ color: 'grey.500' }}><Add /></IconButton>
            </Box>
            {variables.map((v, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                <TextField placeholder="Key" size="small" value={v.key} onChange={e => { const vs = [...variables]; vs[i] = { ...vs[i], key: e.target.value }; setVariables(vs); }} sx={{ ...inputSx, flex: 1 }} />
                <TextField placeholder="Value" size="small" value={v.value} onChange={e => { const vs = [...variables]; vs[i] = { ...vs[i], value: e.target.value }; setVariables(vs); }} sx={{ ...inputSx, flex: 1 }} />
                <IconButton size="small" onClick={() => removeVariable(i)} sx={{ color: 'grey.600' }}><Delete fontSize="small" /></IconButton>
              </Box>
            ))}
          </Paper>

          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle2" sx={{ color: 'grey.400' }}>Tasks</Typography>
              <IconButton size="small" onClick={addTask} sx={{ color: 'grey.500' }}><Add /></IconButton>
            </Box>
            {tasks.map((t, i) => (
              <Paper key={i} sx={{ bgcolor: '#0a0a0a', border: '1px solid #1a1a1a', p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Chip label={`Task ${i + 1}`} size="small" sx={{ bgcolor: '#1a2a3a', color: '#64b5f6', fontSize: 11 }} />
                  <IconButton size="small" onClick={() => removeTask(i)} sx={{ color: 'grey.600' }}><Delete fontSize="small" /></IconButton>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <TextField placeholder="Task name" size="small" fullWidth value={t.name} onChange={e => updateTask(i, 'name', e.target.value)} sx={inputSx} />
                  <FormControl size="small" fullWidth sx={inputSx}>
                    <InputLabel sx={{ color: 'grey.500' }}>Module</InputLabel>
                    <Select value={t.module} label="Module" onChange={e => setModule(i, e.target.value)} sx={{ color: '#d4d4d4', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' } }}>
                      {modules.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <Typography variant="caption" sx={{ color: 'grey.600' }}>Parameters:</Typography>
                  {t.params.map((p, pi) => (
                    <Box key={pi} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <TextField placeholder="Key" size="small" value={p.key} onChange={e => updateTaskParam(i, pi, 'key', e.target.value)} sx={{ ...inputSx, flex: 1 }} />
                      <TextField placeholder="Value" size="small" value={p.value} onChange={e => updateTaskParam(i, pi, 'value', e.target.value)} sx={{ ...inputSx, flex: 1 }} />
                      <IconButton size="small" onClick={() => removeTaskParam(i, pi)} sx={{ color: 'grey.600' }}><Delete fontSize="small" /></IconButton>
                    </Box>
                  ))}
                  <Button size="small" startIcon={<Add />} onClick={() => addTaskParam(i)} sx={{ color: 'grey.500', alignSelf: 'flex-start' }}>Add Param</Button>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField placeholder="when (condition)" size="small" value={t.when} onChange={e => updateTask(i, 'when', e.target.value)} sx={{ ...inputSx, flex: 1 }} />
                    <TextField placeholder="register" size="small" value={t.register} onChange={e => updateTask(i, 'register', e.target.value)} sx={{ ...inputSx, flex: 1 }} />
                    <TextField placeholder="notify" size="small" value={t.notify} onChange={e => updateTask(i, 'notify', e.target.value)} sx={{ ...inputSx, flex: 1 }} />
                  </Box>
                </Box>
              </Paper>
            ))}
          </Paper>

          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle2" sx={{ color: 'grey.400' }}>Handlers</Typography>
              <IconButton size="small" onClick={addHandler} sx={{ color: 'grey.500' }}><Add /></IconButton>
            </Box>
            {handlers.map((h, i) => (
              <Paper key={i} sx={{ bgcolor: '#0a0a0a', border: '1px solid #1a1a1a', p: 2, mb: 1 }}>
                <Box sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                  <TextField placeholder="Handler name" size="small" value={h.name} onChange={e => { const hs = [...handlers]; hs[i] = { ...hs[i], name: e.target.value }; setHandlers(hs); }} sx={{ ...inputSx, flex: 2 }} />
                  <FormControl size="small" sx={{ ...inputSx, minWidth: 140 }}>
                    <Select value={h.module} onChange={e => { const hs = [...handlers]; hs[i] = { ...hs[i], module: e.target.value, params: moduleDefaults[e.target.value] || [{ key: '', value: '' }] }; setHandlers(hs); }} sx={{ color: '#d4d4d4', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' } }}>
                      {modules.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <IconButton size="small" onClick={() => removeHandler(i)} sx={{ color: 'grey.600' }}><Delete fontSize="small" /></IconButton>
                </Box>
                {h.params.map((p, pi) => (
                  <Box key={pi} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                    <TextField placeholder="Key" size="small" value={p.key} onChange={e => { const hs = [...handlers]; hs[i].params = [...hs[i].params]; hs[i].params[pi] = { ...hs[i].params[pi], key: e.target.value }; setHandlers(hs); }} sx={{ ...inputSx, flex: 1 }} />
                    <TextField placeholder="Value" size="small" value={p.value} onChange={e => { const hs = [...handlers]; hs[i].params = [...hs[i].params]; hs[i].params[pi] = { ...hs[i].params[pi], value: e.target.value }; setHandlers(hs); }} sx={{ ...inputSx, flex: 1 }} />
                  </Box>
                ))}
              </Paper>
            ))}
          </Paper>
        </Box>

        {/* Right: Output */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderBottom: '1px solid #222' }}>
              <Typography variant="subtitle2" sx={{ color: 'grey.400' }}>playbook.yml</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Copy"><IconButton size="small" onClick={() => handleCopy(generateYaml())} sx={{ color: 'grey.500' }}><ContentCopy fontSize="small" /></IconButton></Tooltip>
                <Tooltip title="Download"><IconButton size="small" onClick={handleDownload} sx={{ color: 'grey.500' }}><Download fontSize="small" /></IconButton></Tooltip>
              </Box>
            </Box>
            <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
              <Typography component="pre" sx={{ fontFamily: 'monospace', fontSize: 13, color: '#d4d4d4', whiteSpace: 'pre-wrap', m: 0 }}>
                {generateYaml()}
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={2000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} />
    </Box>
  );
}
