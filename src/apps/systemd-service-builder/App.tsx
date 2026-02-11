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

interface EnvVar {
  key: string;
  value: string;
}

const serviceTypes = ['simple', 'forking', 'oneshot', 'notify', 'idle', 'dbus'];
const restartOptions = ['no', 'on-success', 'on-failure', 'on-abnormal', 'on-abort', 'on-watchdog', 'always'];
const outputOptions = ['journal', 'syslog', 'kmsg', 'journal+console', 'syslog+console', 'kmsg+console', 'file:/path', 'append:/path', 'null', 'inherit'];
const protectSystemOptions = ['false', 'true', 'full', 'strict'];

export default function SystemdServiceBuilder() {
  // Unit section
  const [description, setDescription] = useState('My Application Service');
  const [after, setAfter] = useState('network.target');
  const [wants, setWants] = useState('');
  const [requires, setRequires] = useState('');
  const [before, setBefore] = useState('');

  // Service section
  const [serviceType, setServiceType] = useState('simple');
  const [execStart, setExecStart] = useState('/usr/bin/myapp --config /etc/myapp/config.yml');
  const [execStartPre, setExecStartPre] = useState('');
  const [execStartPost, setExecStartPost] = useState('');
  const [execStop, setExecStop] = useState('');
  const [execReload, setExecReload] = useState('/bin/kill -HUP $MAINPID');
  const [workingDir, setWorkingDir] = useState('/opt/myapp');
  const [user, setUser] = useState('myapp');
  const [group, setGroup] = useState('myapp');
  const [envVars, setEnvVars] = useState<EnvVar[]>([
    { key: 'NODE_ENV', value: 'production' },
  ]);
  const [envFile, setEnvFile] = useState('');
  const [restart, setRestart] = useState('on-failure');
  const [restartSec, setRestartSec] = useState('5');
  const [timeoutStartSec, setTimeoutStartSec] = useState('');
  const [timeoutStopSec, setTimeoutStopSec] = useState('');
  const [stdOutput, setStdOutput] = useState('journal');
  const [stdError, setStdError] = useState('journal');
  const [limitNoFile, setLimitNoFile] = useState('65536');
  const [privateTmp, setPrivateTmp] = useState(true);
  const [protectSystem, setProtectSystem] = useState('full');
  const [protectHome, setProtectHome] = useState(true);
  const [noNewPrivileges, setNoNewPrivileges] = useState(true);
  const [pidFile, setPidFile] = useState('');
  const [runtimeDirectory, setRuntimeDirectory] = useState('');
  const [syslogIdentifier, setSyslogIdentifier] = useState('');

  // Install section
  const [wantedBy, setWantedBy] = useState('multi-user.target');
  const [requiredBy, setRequiredBy] = useState('');
  const [alias, setAlias] = useState('');

  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const addEnvVar = () => setEnvVars([...envVars, { key: '', value: '' }]);
  const removeEnvVar = (i: number) => setEnvVars(envVars.filter((_, idx) => idx !== i));
  const updateEnvVar = (i: number, field: 'key' | 'value', val: string) => {
    const e = [...envVars]; e[i] = { ...e[i], [field]: val }; setEnvVars(e);
  };

  const generateServiceFile = (): string => {
    let out = '[Unit]\n';
    out += `Description=${description}\n`;
    if (after) out += `After=${after}\n`;
    if (wants) out += `Wants=${wants}\n`;
    if (requires) out += `Requires=${requires}\n`;
    if (before) out += `Before=${before}\n`;

    out += '\n[Service]\n';
    out += `Type=${serviceType}\n`;
    if (execStartPre) out += `ExecStartPre=${execStartPre}\n`;
    out += `ExecStart=${execStart}\n`;
    if (execStartPost) out += `ExecStartPost=${execStartPost}\n`;
    if (execStop) out += `ExecStop=${execStop}\n`;
    if (execReload) out += `ExecReload=${execReload}\n`;
    if (workingDir) out += `WorkingDirectory=${workingDir}\n`;
    if (user) out += `User=${user}\n`;
    if (group) out += `Group=${group}\n`;
    if (pidFile) out += `PIDFile=${pidFile}\n`;
    if (runtimeDirectory) out += `RuntimeDirectory=${runtimeDirectory}\n`;

    envVars.forEach(ev => {
      if (ev.key && ev.value) out += `Environment="${ev.key}=${ev.value}"\n`;
    });
    if (envFile) out += `EnvironmentFile=${envFile}\n`;

    out += `Restart=${restart}\n`;
    if (restartSec) out += `RestartSec=${restartSec}\n`;
    if (timeoutStartSec) out += `TimeoutStartSec=${timeoutStartSec}\n`;
    if (timeoutStopSec) out += `TimeoutStopSec=${timeoutStopSec}\n`;

    out += `StandardOutput=${stdOutput}\n`;
    out += `StandardError=${stdError}\n`;
    if (syslogIdentifier) out += `SyslogIdentifier=${syslogIdentifier}\n`;

    if (limitNoFile) out += `LimitNOFILE=${limitNoFile}\n`;
    out += `PrivateTmp=${privateTmp ? 'true' : 'false'}\n`;
    out += `ProtectSystem=${protectSystem}\n`;
    out += `ProtectHome=${protectHome ? 'true' : 'false'}\n`;
    out += `NoNewPrivileges=${noNewPrivileges ? 'true' : 'false'}\n`;

    out += '\n[Install]\n';
    if (wantedBy) out += `WantedBy=${wantedBy}\n`;
    if (requiredBy) out += `RequiredBy=${requiredBy}\n`;
    if (alias) out += `Alias=${alias}\n`;

    return out;
  };

  const generateCommands = (): string => {
    const serviceName = description.replace(/\s+/g, '-').toLowerCase().replace(/[^a-z0-9-]/g, '');
    return `# Install the service file
sudo cp ${serviceName}.service /etc/systemd/system/
sudo systemctl daemon-reload

# Enable and start
sudo systemctl enable ${serviceName}
sudo systemctl start ${serviceName}

# Check status
sudo systemctl status ${serviceName}
journalctl -u ${serviceName} -f`;
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setSnackbar({ open: true, message: 'Copied to clipboard' });
  };

  const handleDownload = () => {
    const serviceName = description.replace(/\s+/g, '-').toLowerCase().replace(/[^a-z0-9-]/g, '');
    const blob = new Blob([generateServiceFile()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${serviceName}.service`; a.click();
    URL.revokeObjectURL(url);
  };

  const inputSx = {
    '& .MuiInputBase-root': { bgcolor: '#0a0a0a', color: '#d4d4d4', fontSize: 14 },
    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
    '& .MuiInputLabel-root': { color: 'grey.500' },
  };
  const selectSx = { color: '#d4d4d4', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' } };

  const loadTemplate = (template: string) => {
    if (template === 'node') {
      setDescription('Node.js Application');
      setExecStart('/usr/bin/node /opt/app/server.js');
      setWorkingDir('/opt/app');
      setUser('node');
      setGroup('node');
      setEnvVars([{ key: 'NODE_ENV', value: 'production' }, { key: 'PORT', value: '3000' }]);
      setServiceType('simple');
    } else if (template === 'python') {
      setDescription('Python Application');
      setExecStart('/opt/app/venv/bin/python /opt/app/main.py');
      setWorkingDir('/opt/app');
      setUser('python');
      setGroup('python');
      setEnvVars([{ key: 'PYTHONUNBUFFERED', value: '1' }]);
      setServiceType('simple');
    } else if (template === 'docker') {
      setDescription('Docker Container Service');
      setExecStart('/usr/bin/docker start -a mycontainer');
      setExecStop('/usr/bin/docker stop mycontainer');
      setAfter('docker.service');
      setRequires('docker.service');
      setWorkingDir('');
      setUser('');
      setGroup('');
      setServiceType('simple');
    } else if (template === 'go') {
      setDescription('Go Application');
      setExecStart('/usr/local/bin/mygoapp');
      setWorkingDir('/opt/mygoapp');
      setUser('goapp');
      setGroup('goapp');
      setEnvVars([]);
      setServiceType('simple');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a' }}>
      <Paper elevation={0} sx={{ bgcolor: '#111', borderBottom: '1px solid #222', px: 3, py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Link to="/"><IconButton size="small" sx={{ color: 'grey.500' }}><Home /></IconButton></Link>
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>Systemd Service Builder</Typography>
          <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
            {['node', 'python', 'docker', 'go'].map(t => (
              <Button key={t} size="small" variant="outlined" onClick={() => loadTemplate(t)} sx={{ color: 'grey.400', borderColor: '#333', textTransform: 'none', fontSize: 12 }}>{t}</Button>
            ))}
          </Box>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', gap: 3, p: 3, minHeight: 'calc(100vh - 72px)' }}>
        {/* Left: Config */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, overflow: 'auto', maxHeight: 'calc(100vh - 100px)' }}>
          {/* [Unit] */}
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
            <Chip label="[Unit]" size="small" sx={{ bgcolor: '#2a1a1a', color: '#ef9a9a', mb: 1.5 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <TextField label="Description" size="small" fullWidth value={description} onChange={e => setDescription(e.target.value)} sx={inputSx} />
              <TextField label="After" size="small" fullWidth value={after} onChange={e => setAfter(e.target.value)} sx={inputSx} />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField label="Wants" size="small" fullWidth value={wants} onChange={e => setWants(e.target.value)} sx={inputSx} />
                <TextField label="Requires" size="small" fullWidth value={requires} onChange={e => setRequires(e.target.value)} sx={inputSx} />
              </Box>
              <TextField label="Before" size="small" fullWidth value={before} onChange={e => setBefore(e.target.value)} sx={inputSx} />
            </Box>
          </Paper>

          {/* [Service] */}
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
            <Chip label="[Service]" size="small" sx={{ bgcolor: '#1a2a1a', color: '#a5d6a7', mb: 1.5 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <FormControl size="small" sx={{ minWidth: 140, ...inputSx }}>
                  <InputLabel sx={{ color: 'grey.500' }}>Type</InputLabel>
                  <Select value={serviceType} label="Type" onChange={e => setServiceType(e.target.value)} sx={selectSx}>
                    {serviceTypes.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 140, ...inputSx }}>
                  <InputLabel sx={{ color: 'grey.500' }}>Restart</InputLabel>
                  <Select value={restart} label="Restart" onChange={e => setRestart(e.target.value)} sx={selectSx}>
                    {restartOptions.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                  </Select>
                </FormControl>
                <TextField label="RestartSec" size="small" value={restartSec} onChange={e => setRestartSec(e.target.value)} sx={{ ...inputSx, flex: 1 }} />
              </Box>
              <TextField label="ExecStart" size="small" fullWidth value={execStart} onChange={e => setExecStart(e.target.value)} sx={inputSx} />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField label="ExecStartPre" size="small" fullWidth value={execStartPre} onChange={e => setExecStartPre(e.target.value)} sx={inputSx} />
                <TextField label="ExecStartPost" size="small" fullWidth value={execStartPost} onChange={e => setExecStartPost(e.target.value)} sx={inputSx} />
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField label="ExecStop" size="small" fullWidth value={execStop} onChange={e => setExecStop(e.target.value)} sx={inputSx} />
                <TextField label="ExecReload" size="small" fullWidth value={execReload} onChange={e => setExecReload(e.target.value)} sx={inputSx} />
              </Box>
              <TextField label="WorkingDirectory" size="small" fullWidth value={workingDir} onChange={e => setWorkingDir(e.target.value)} sx={inputSx} />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField label="User" size="small" value={user} onChange={e => setUser(e.target.value)} sx={{ ...inputSx, flex: 1 }} />
                <TextField label="Group" size="small" value={group} onChange={e => setGroup(e.target.value)} sx={{ ...inputSx, flex: 1 }} />
                <TextField label="PIDFile" size="small" value={pidFile} onChange={e => setPidFile(e.target.value)} sx={{ ...inputSx, flex: 1 }} />
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField label="RuntimeDirectory" size="small" value={runtimeDirectory} onChange={e => setRuntimeDirectory(e.target.value)} sx={{ ...inputSx, flex: 1 }} />
                <TextField label="SyslogIdentifier" size="small" value={syslogIdentifier} onChange={e => setSyslogIdentifier(e.target.value)} sx={{ ...inputSx, flex: 1 }} />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="caption" sx={{ color: 'grey.500' }}>Environment Variables</Typography>
                <IconButton size="small" onClick={addEnvVar} sx={{ color: 'grey.600' }}><Add fontSize="small" /></IconButton>
              </Box>
              {envVars.map((ev, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <TextField placeholder="KEY" size="small" value={ev.key} onChange={e => updateEnvVar(i, 'key', e.target.value)} sx={{ ...inputSx, flex: 1 }} />
                  <Typography sx={{ color: 'grey.600' }}>=</Typography>
                  <TextField placeholder="value" size="small" value={ev.value} onChange={e => updateEnvVar(i, 'value', e.target.value)} sx={{ ...inputSx, flex: 1 }} />
                  <IconButton size="small" onClick={() => removeEnvVar(i)} sx={{ color: 'grey.600' }}><Delete fontSize="small" /></IconButton>
                </Box>
              ))}
              <TextField label="EnvironmentFile" size="small" fullWidth value={envFile} onChange={e => setEnvFile(e.target.value)} sx={inputSx} />

              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField label="TimeoutStartSec" size="small" value={timeoutStartSec} onChange={e => setTimeoutStartSec(e.target.value)} sx={{ ...inputSx, flex: 1 }} />
                <TextField label="TimeoutStopSec" size="small" value={timeoutStopSec} onChange={e => setTimeoutStopSec(e.target.value)} sx={{ ...inputSx, flex: 1 }} />
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <FormControl size="small" sx={{ ...inputSx, flex: 1 }}>
                  <InputLabel sx={{ color: 'grey.500' }}>StandardOutput</InputLabel>
                  <Select value={stdOutput} label="StandardOutput" onChange={e => setStdOutput(e.target.value)} sx={selectSx}>
                    {outputOptions.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ ...inputSx, flex: 1 }}>
                  <InputLabel sx={{ color: 'grey.500' }}>StandardError</InputLabel>
                  <Select value={stdError} label="StandardError" onChange={e => setStdError(e.target.value)} sx={selectSx}>
                    {outputOptions.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                  </Select>
                </FormControl>
              </Box>

              <TextField label="LimitNOFILE" size="small" value={limitNoFile} onChange={e => setLimitNoFile(e.target.value)} sx={inputSx} />
              <FormControl size="small" sx={inputSx}>
                <InputLabel sx={{ color: 'grey.500' }}>ProtectSystem</InputLabel>
                <Select value={protectSystem} label="ProtectSystem" onChange={e => setProtectSystem(e.target.value)} sx={selectSx}>
                  {protectSystemOptions.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                </Select>
              </FormControl>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControlLabel control={<Switch checked={privateTmp} onChange={e => setPrivateTmp(e.target.checked)} size="small" />} label={<Typography sx={{ color: 'grey.400', fontSize: 13 }}>PrivateTmp</Typography>} />
                <FormControlLabel control={<Switch checked={protectHome} onChange={e => setProtectHome(e.target.checked)} size="small" />} label={<Typography sx={{ color: 'grey.400', fontSize: 13 }}>ProtectHome</Typography>} />
                <FormControlLabel control={<Switch checked={noNewPrivileges} onChange={e => setNoNewPrivileges(e.target.checked)} size="small" />} label={<Typography sx={{ color: 'grey.400', fontSize: 13 }}>NoNewPrivileges</Typography>} />
              </Box>
            </Box>
          </Paper>

          {/* [Install] */}
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
            <Chip label="[Install]" size="small" sx={{ bgcolor: '#1a1a2a', color: '#90caf9', mb: 1.5 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <TextField label="WantedBy" size="small" fullWidth value={wantedBy} onChange={e => setWantedBy(e.target.value)} sx={inputSx} />
              <TextField label="RequiredBy" size="small" fullWidth value={requiredBy} onChange={e => setRequiredBy(e.target.value)} sx={inputSx} />
              <TextField label="Alias" size="small" fullWidth value={alias} onChange={e => setAlias(e.target.value)} sx={inputSx} />
            </Box>
          </Paper>
        </Box>

        {/* Right: Output */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderBottom: '1px solid #222' }}>
              <Typography variant="subtitle2" sx={{ color: 'grey.400' }}>Service File Output</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Copy"><IconButton size="small" onClick={() => handleCopy(generateServiceFile())} sx={{ color: 'grey.500' }}><ContentCopy fontSize="small" /></IconButton></Tooltip>
                <Tooltip title="Download"><IconButton size="small" onClick={handleDownload} sx={{ color: 'grey.500' }}><Download fontSize="small" /></IconButton></Tooltip>
              </Box>
            </Box>
            <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
              <Typography component="pre" sx={{ fontFamily: 'monospace', fontSize: 13, color: '#d4d4d4', whiteSpace: 'pre-wrap', m: 0 }}>
                {generateServiceFile()}
              </Typography>
            </Box>
          </Paper>

          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle2" sx={{ color: 'grey.400' }}>Installation Commands</Typography>
              <Tooltip title="Copy"><IconButton size="small" onClick={() => handleCopy(generateCommands())} sx={{ color: 'grey.500' }}><ContentCopy fontSize="small" /></IconButton></Tooltip>
            </Box>
            <Typography component="pre" sx={{ fontFamily: 'monospace', fontSize: 12, color: '#a5d6a7', whiteSpace: 'pre-wrap', m: 0 }}>
              {generateCommands()}
            </Typography>
          </Paper>
        </Box>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={2000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} />
    </Box>
  );
}
