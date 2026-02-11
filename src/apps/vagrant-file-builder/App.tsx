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
} from '@mui/material';
import {
  ContentCopy,
  Home,
  Add,
  Delete,
  Download,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

interface Provisioner {
  type: string;
  inline: string;
  path: string;
  playbookPath: string;
}

interface SyncedFolder {
  hostPath: string;
  guestPath: string;
  type: string;
}

interface PortForward {
  guest: number;
  host: number;
  protocol: string;
}

interface Machine {
  name: string;
  box: string;
  hostname: string;
  memory: string;
  cpus: string;
  ip: string;
  provisioners: Provisioner[];
  syncedFolders: SyncedFolder[];
  portForwards: PortForward[];
}

const providers = ['virtualbox', 'vmware_desktop', 'libvirt', 'hyperv', 'docker'];
const commonBoxes = [
  'ubuntu/jammy64', 'ubuntu/focal64', 'ubuntu/bionic64',
  'centos/7', 'centos/stream8', 'centos/stream9',
  'debian/bullseye64', 'debian/bookworm64',
  'hashicorp/bionic64', 'generic/rocky9', 'generic/alma9',
  'fedora/37-cloud-base', 'archlinux/archlinux',
];
const provisionerTypes = ['shell_inline', 'shell_path', 'ansible', 'docker', 'puppet', 'chef_solo', 'file'];
const syncTypes = ['', 'nfs', 'rsync', 'smb', 'virtualbox'];

export default function VagrantFileBuilder() {
  const [provider, setProvider] = useState('virtualbox');
  const [machines, setMachines] = useState<Machine[]>([
    {
      name: 'default',
      box: 'ubuntu/jammy64',
      hostname: 'dev-vm',
      memory: '2048',
      cpus: '2',
      ip: '192.168.56.10',
      provisioners: [{ type: 'shell_inline', inline: 'apt-get update && apt-get install -y curl git', path: '', playbookPath: '' }],
      syncedFolders: [],
      portForwards: [{ guest: 80, host: 8080, protocol: 'tcp' }],
    },
  ]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const addMachine = () => {
    setMachines([...machines, {
      name: `node${machines.length + 1}`,
      box: 'ubuntu/jammy64',
      hostname: `node${machines.length + 1}`,
      memory: '1024',
      cpus: '1',
      ip: `192.168.56.${10 + machines.length}`,
      provisioners: [],
      syncedFolders: [],
      portForwards: [],
    }]);
  };
  const removeMachine = (i: number) => setMachines(machines.filter((_, idx) => idx !== i));
  const updateMachine = (i: number, field: string, val: unknown) => {
    const m = [...machines]; m[i] = { ...m[i], [field]: val }; setMachines(m);
  };

  const addProvisioner = (mi: number) => {
    const m = [...machines];
    m[mi].provisioners = [...m[mi].provisioners, { type: 'shell_inline', inline: '', path: '', playbookPath: '' }];
    setMachines(m);
  };
  const removeProvisioner = (mi: number, pi: number) => {
    const m = [...machines]; m[mi].provisioners = m[mi].provisioners.filter((_, idx) => idx !== pi); setMachines(m);
  };

  const addSyncedFolder = (mi: number) => {
    const m = [...machines];
    m[mi].syncedFolders = [...m[mi].syncedFolders, { hostPath: '.', guestPath: '/vagrant_data', type: '' }];
    setMachines(m);
  };
  const removeSyncedFolder = (mi: number, si: number) => {
    const m = [...machines]; m[mi].syncedFolders = m[mi].syncedFolders.filter((_, idx) => idx !== si); setMachines(m);
  };

  const addPortForward = (mi: number) => {
    const m = [...machines];
    m[mi].portForwards = [...m[mi].portForwards, { guest: 80, host: 8080, protocol: 'tcp' }];
    setMachines(m);
  };
  const removePortForward = (mi: number, pi: number) => {
    const m = [...machines]; m[mi].portForwards = m[mi].portForwards.filter((_, idx) => idx !== pi); setMachines(m);
  };

  const generateVagrantfile = (): string => {
    const indent = (level: number) => '  '.repeat(level);
    let out = `# -*- mode: ruby -*-\n# vi: set ft=ruby :\n\nVagrant.configure("2") do |config|\n`;
    const isMulti = machines.length > 1;

    machines.forEach((machine) => {
      const base = isMulti ? 3 : 2;
      const cfgVar = isMulti ? machine.name.replace(/[^a-zA-Z0-9]/g, '_') : 'config';

      if (isMulti) {
        out += `\n${indent(1)}config.vm.define "${machine.name}" do |${cfgVar}|\n`;
      }

      out += `${indent(base - 1)}${cfgVar}.vm.box = "${machine.box}"\n`;
      if (machine.hostname) out += `${indent(base - 1)}${cfgVar}.vm.hostname = "${machine.hostname}"\n`;
      if (machine.ip) out += `${indent(base - 1)}${cfgVar}.vm.network "private_network", ip: "${machine.ip}"\n`;

      machine.portForwards.forEach(pf => {
        out += `${indent(base - 1)}${cfgVar}.vm.network "forwarded_port", guest: ${pf.guest}, host: ${pf.host}, protocol: "${pf.protocol}"\n`;
      });

      machine.syncedFolders.forEach(sf => {
        const typeStr = sf.type ? `, type: "${sf.type}"` : '';
        out += `${indent(base - 1)}${cfgVar}.vm.synced_folder "${sf.hostPath}", "${sf.guestPath}"${typeStr}\n`;
      });

      // Provider config
      out += `\n${indent(base - 1)}${cfgVar}.vm.provider "${provider}" do |vb|\n`;
      out += `${indent(base)}vb.memory = "${machine.memory}"\n`;
      out += `${indent(base)}vb.cpus = ${machine.cpus}\n`;
      if (provider === 'virtualbox') {
        out += `${indent(base)}vb.name = "${machine.hostname || machine.name}"\n`;
      }
      out += `${indent(base - 1)}end\n`;

      // Provisioners
      machine.provisioners.forEach(p => {
        out += `\n`;
        if (p.type === 'shell_inline') {
          out += `${indent(base - 1)}${cfgVar}.vm.provision "shell", inline: <<-SHELL\n`;
          p.inline.split('\n').forEach(line => {
            out += `${indent(base)}${line}\n`;
          });
          out += `${indent(base - 1)}SHELL\n`;
        } else if (p.type === 'shell_path') {
          out += `${indent(base - 1)}${cfgVar}.vm.provision "shell", path: "${p.path}"\n`;
        } else if (p.type === 'ansible') {
          out += `${indent(base - 1)}${cfgVar}.vm.provision "ansible" do |ansible|\n`;
          out += `${indent(base)}ansible.playbook = "${p.playbookPath || 'playbook.yml'}"\n`;
          out += `${indent(base - 1)}end\n`;
        } else if (p.type === 'docker') {
          out += `${indent(base - 1)}${cfgVar}.vm.provision "docker"\n`;
        } else if (p.type === 'puppet') {
          out += `${indent(base - 1)}${cfgVar}.vm.provision "puppet" do |puppet|\n`;
          out += `${indent(base)}puppet.manifests_path = "manifests"\n`;
          out += `${indent(base)}puppet.manifest_file = "default.pp"\n`;
          out += `${indent(base - 1)}end\n`;
        } else if (p.type === 'chef_solo') {
          out += `${indent(base - 1)}${cfgVar}.vm.provision "chef_solo" do |chef|\n`;
          out += `${indent(base)}chef.add_recipe "default"\n`;
          out += `${indent(base - 1)}end\n`;
        } else if (p.type === 'file') {
          out += `${indent(base - 1)}${cfgVar}.vm.provision "file", source: "${p.path}", destination: "${p.playbookPath}"\n`;
        }
      });

      if (isMulti) {
        out += `${indent(1)}end\n`;
      }
    });

    out += `end\n`;
    return out;
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generateVagrantfile());
    setSnackbar({ open: true, message: 'Vagrantfile copied to clipboard' });
  };

  const handleDownload = () => {
    const blob = new Blob([generateVagrantfile()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'Vagrantfile'; a.click();
    URL.revokeObjectURL(url);
  };

  const inputSx = {
    '& .MuiInputBase-root': { bgcolor: '#0a0a0a', color: '#d4d4d4', fontSize: 14 },
    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
    '& .MuiInputLabel-root': { color: 'grey.500' },
  };
  const selectSx = { color: '#d4d4d4', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' } };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a' }}>
      <Paper elevation={0} sx={{ bgcolor: '#111', borderBottom: '1px solid #222', px: 3, py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Link to="/"><IconButton size="small" sx={{ color: 'grey.500' }}><Home /></IconButton></Link>
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>Vagrantfile Builder</Typography>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', gap: 3, p: 3, minHeight: 'calc(100vh - 72px)' }}>
        {/* Left: Config */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, overflow: 'auto', maxHeight: 'calc(100vh - 100px)' }}>
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
            <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1 }}>Provider</Typography>
            <FormControl size="small" fullWidth sx={inputSx}>
              <Select value={provider} onChange={e => setProvider(e.target.value)} sx={selectSx}>
                {providers.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
              </Select>
            </FormControl>
          </Paper>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="subtitle1" sx={{ color: 'grey.300', fontWeight: 600 }}>Machines ({machines.length})</Typography>
            <Button size="small" startIcon={<Add />} onClick={addMachine} sx={{ color: 'grey.400' }}>Add Machine</Button>
          </Box>

          {machines.map((machine, mi) => (
            <Paper key={mi} sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Chip label={machine.name || `Machine ${mi + 1}`} size="small" sx={{ bgcolor: '#1a2a3a', color: '#64b5f6', fontSize: 11 }} />
                {machines.length > 1 && <IconButton size="small" onClick={() => removeMachine(mi)} sx={{ color: 'grey.600' }}><Delete fontSize="small" /></IconButton>}
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField label="Name" size="small" value={machine.name} onChange={e => updateMachine(mi, 'name', e.target.value)} sx={{ ...inputSx, flex: 1 }} />
                  <TextField label="Hostname" size="small" value={machine.hostname} onChange={e => updateMachine(mi, 'hostname', e.target.value)} sx={{ ...inputSx, flex: 1 }} />
                </Box>
                <FormControl size="small" fullWidth sx={inputSx}>
                  <InputLabel sx={{ color: 'grey.500' }}>Box</InputLabel>
                  <Select value={machine.box} label="Box" onChange={e => updateMachine(mi, 'box', e.target.value)} sx={selectSx}>
                    {commonBoxes.map(b => <MenuItem key={b} value={b}>{b}</MenuItem>)}
                  </Select>
                </FormControl>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField label="Memory (MB)" size="small" value={machine.memory} onChange={e => updateMachine(mi, 'memory', e.target.value)} sx={{ ...inputSx, flex: 1 }} />
                  <TextField label="CPUs" size="small" value={machine.cpus} onChange={e => updateMachine(mi, 'cpus', e.target.value)} sx={{ ...inputSx, flex: 1 }} />
                  <TextField label="Private Network IP" size="small" value={machine.ip} onChange={e => updateMachine(mi, 'ip', e.target.value)} sx={{ ...inputSx, flex: 2 }} />
                </Box>

                {/* Port Forwarding */}
                <Box sx={{ mt: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="caption" sx={{ color: 'grey.500' }}>Port Forwarding</Typography>
                    <IconButton size="small" onClick={() => addPortForward(mi)} sx={{ color: 'grey.600' }}><Add fontSize="small" /></IconButton>
                  </Box>
                  {machine.portForwards.map((pf, pi) => (
                    <Box key={pi} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                      <TextField type="number" placeholder="Guest" size="small" value={pf.guest} onChange={e => { const m = [...machines]; m[mi].portForwards = [...m[mi].portForwards]; m[mi].portForwards[pi] = { ...pf, guest: Number(e.target.value) }; setMachines(m); }} sx={{ ...inputSx, flex: 1 }} />
                      <Typography sx={{ color: 'grey.600' }}>:</Typography>
                      <TextField type="number" placeholder="Host" size="small" value={pf.host} onChange={e => { const m = [...machines]; m[mi].portForwards = [...m[mi].portForwards]; m[mi].portForwards[pi] = { ...pf, host: Number(e.target.value) }; setMachines(m); }} sx={{ ...inputSx, flex: 1 }} />
                      <FormControl size="small" sx={{ minWidth: 80, ...inputSx }}>
                        <Select value={pf.protocol} onChange={e => { const m = [...machines]; m[mi].portForwards = [...m[mi].portForwards]; m[mi].portForwards[pi] = { ...pf, protocol: e.target.value }; setMachines(m); }} sx={selectSx}>
                          <MenuItem value="tcp">tcp</MenuItem>
                          <MenuItem value="udp">udp</MenuItem>
                        </Select>
                      </FormControl>
                      <IconButton size="small" onClick={() => removePortForward(mi, pi)} sx={{ color: 'grey.600' }}><Delete fontSize="small" /></IconButton>
                    </Box>
                  ))}
                </Box>

                {/* Synced Folders */}
                <Box sx={{ mt: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="caption" sx={{ color: 'grey.500' }}>Synced Folders</Typography>
                    <IconButton size="small" onClick={() => addSyncedFolder(mi)} sx={{ color: 'grey.600' }}><Add fontSize="small" /></IconButton>
                  </Box>
                  {machine.syncedFolders.map((sf, si) => (
                    <Box key={si} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                      <TextField placeholder="Host path" size="small" value={sf.hostPath} onChange={e => { const m = [...machines]; m[mi].syncedFolders = [...m[mi].syncedFolders]; m[mi].syncedFolders[si] = { ...sf, hostPath: e.target.value }; setMachines(m); }} sx={{ ...inputSx, flex: 1 }} />
                      <TextField placeholder="Guest path" size="small" value={sf.guestPath} onChange={e => { const m = [...machines]; m[mi].syncedFolders = [...m[mi].syncedFolders]; m[mi].syncedFolders[si] = { ...sf, guestPath: e.target.value }; setMachines(m); }} sx={{ ...inputSx, flex: 1 }} />
                      <FormControl size="small" sx={{ minWidth: 90, ...inputSx }}>
                        <Select value={sf.type} onChange={e => { const m = [...machines]; m[mi].syncedFolders = [...m[mi].syncedFolders]; m[mi].syncedFolders[si] = { ...sf, type: e.target.value }; setMachines(m); }} sx={selectSx} displayEmpty>
                          {syncTypes.map(t => <MenuItem key={t || 'default'} value={t}>{t || 'default'}</MenuItem>)}
                        </Select>
                      </FormControl>
                      <IconButton size="small" onClick={() => removeSyncedFolder(mi, si)} sx={{ color: 'grey.600' }}><Delete fontSize="small" /></IconButton>
                    </Box>
                  ))}
                </Box>

                {/* Provisioners */}
                <Box sx={{ mt: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="caption" sx={{ color: 'grey.500' }}>Provisioners</Typography>
                    <IconButton size="small" onClick={() => addProvisioner(mi)} sx={{ color: 'grey.600' }}><Add fontSize="small" /></IconButton>
                  </Box>
                  {machine.provisioners.map((prov, pi) => (
                    <Paper key={pi} sx={{ bgcolor: '#0a0a0a', border: '1px solid #1a1a1a', p: 1.5, mb: 1 }}>
                      <Box sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                        <FormControl size="small" sx={{ minWidth: 140, ...inputSx }}>
                          <Select value={prov.type} onChange={e => { const m = [...machines]; m[mi].provisioners = [...m[mi].provisioners]; m[mi].provisioners[pi] = { ...prov, type: e.target.value }; setMachines(m); }} sx={selectSx}>
                            {provisionerTypes.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                          </Select>
                        </FormControl>
                        <IconButton size="small" onClick={() => removeProvisioner(mi, pi)} sx={{ color: 'grey.600' }}><Delete fontSize="small" /></IconButton>
                      </Box>
                      {prov.type === 'shell_inline' && (
                        <TextField multiline rows={3} placeholder="Shell commands..." size="small" fullWidth value={prov.inline} onChange={e => { const m = [...machines]; m[mi].provisioners = [...m[mi].provisioners]; m[mi].provisioners[pi] = { ...prov, inline: e.target.value }; setMachines(m); }} sx={{ ...inputSx, '& .MuiInputBase-root': { ...inputSx['& .MuiInputBase-root'], fontFamily: 'monospace', fontSize: 12 } }} />
                      )}
                      {prov.type === 'shell_path' && (
                        <TextField placeholder="Script path" size="small" fullWidth value={prov.path} onChange={e => { const m = [...machines]; m[mi].provisioners = [...m[mi].provisioners]; m[mi].provisioners[pi] = { ...prov, path: e.target.value }; setMachines(m); }} sx={inputSx} />
                      )}
                      {prov.type === 'ansible' && (
                        <TextField placeholder="Playbook path" size="small" fullWidth value={prov.playbookPath} onChange={e => { const m = [...machines]; m[mi].provisioners = [...m[mi].provisioners]; m[mi].provisioners[pi] = { ...prov, playbookPath: e.target.value }; setMachines(m); }} sx={inputSx} />
                      )}
                      {prov.type === 'file' && (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <TextField placeholder="Source" size="small" value={prov.path} onChange={e => { const m = [...machines]; m[mi].provisioners = [...m[mi].provisioners]; m[mi].provisioners[pi] = { ...prov, path: e.target.value }; setMachines(m); }} sx={{ ...inputSx, flex: 1 }} />
                          <TextField placeholder="Destination" size="small" value={prov.playbookPath} onChange={e => { const m = [...machines]; m[mi].provisioners = [...m[mi].provisioners]; m[mi].provisioners[pi] = { ...prov, playbookPath: e.target.value }; setMachines(m); }} sx={{ ...inputSx, flex: 1 }} />
                        </Box>
                      )}
                    </Paper>
                  ))}
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>

        {/* Right: Output */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderBottom: '1px solid #222' }}>
              <Typography variant="subtitle2" sx={{ color: 'grey.400' }}>Vagrantfile</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Copy"><IconButton size="small" onClick={handleCopy} sx={{ color: 'grey.500' }}><ContentCopy fontSize="small" /></IconButton></Tooltip>
                <Tooltip title="Download"><IconButton size="small" onClick={handleDownload} sx={{ color: 'grey.500' }}><Download fontSize="small" /></IconButton></Tooltip>
              </Box>
            </Box>
            <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
              <Typography component="pre" sx={{ fontFamily: 'monospace', fontSize: 13, color: '#d4d4d4', whiteSpace: 'pre-wrap', m: 0 }}>
                {generateVagrantfile()}
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={2000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} />
    </Box>
  );
}
