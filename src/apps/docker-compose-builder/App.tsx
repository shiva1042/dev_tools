import { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Snackbar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  ContentCopy,
  Home,
  Add,
  Delete,
  ExpandMore,
  Download,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

interface Port {
  host: string;
  container: string;
}

interface Volume {
  host: string;
  container: string;
  readOnly: boolean;
}

interface EnvVar {
  key: string;
  value: string;
}

interface Service {
  id: string;
  name: string;
  image: string;
  ports: Port[];
  volumes: Volume[];
  environment: EnvVar[];
  depends_on: string[];
  restart: string;
  command?: string;
  networks: string[];
}

interface Network {
  id: string;
  name: string;
  driver: string;
}

interface VolumeDefinition {
  id: string;
  name: string;
  driver: string;
}

const restartOptions = ['no', 'always', 'on-failure', 'unless-stopped'];
const networkDrivers = ['bridge', 'host', 'overlay', 'none'];

const serviceTemplates = [
  { name: 'Node.js', image: 'node:18-alpine', ports: [{ host: '3000', container: '3000' }] },
  { name: 'PostgreSQL', image: 'postgres:15-alpine', ports: [{ host: '5432', container: '5432' }], environment: [{ key: 'POSTGRES_PASSWORD', value: 'password' }] },
  { name: 'Redis', image: 'redis:7-alpine', ports: [{ host: '6379', container: '6379' }] },
  { name: 'MongoDB', image: 'mongo:6', ports: [{ host: '27017', container: '27017' }] },
  { name: 'MySQL', image: 'mysql:8', ports: [{ host: '3306', container: '3306' }], environment: [{ key: 'MYSQL_ROOT_PASSWORD', value: 'password' }] },
  { name: 'Nginx', image: 'nginx:alpine', ports: [{ host: '80', container: '80' }] },
  { name: 'Elasticsearch', image: 'elasticsearch:8.11.0', ports: [{ host: '9200', container: '9200' }], environment: [{ key: 'discovery.type', value: 'single-node' }] },
];

export default function DockerComposeBuilder() {
  const [services, setServices] = useState<Service[]>([
    {
      id: '1',
      name: 'app',
      image: 'node:18-alpine',
      ports: [{ host: '3000', container: '3000' }],
      volumes: [{ host: '.', container: '/app', readOnly: false }],
      environment: [{ key: 'NODE_ENV', value: 'development' }],
      depends_on: [],
      restart: 'unless-stopped',
      command: 'npm start',
      networks: ['app-network'],
    },
  ]);
  const [networks, setNetworks] = useState<Network[]>([
    { id: '1', name: 'app-network', driver: 'bridge' },
  ]);
  const [volumes, setVolumes] = useState<VolumeDefinition[]>([]);
  const [version, setVersion] = useState<string>('3.8');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({ open: false, message: '' });

  const yaml = useMemo(() => {
    let output = `version: '${version}'\n\nservices:\n`;

    services.forEach(service => {
      output += `  ${service.name}:\n`;
      output += `    image: ${service.image}\n`;

      if (service.command) {
        output += `    command: ${service.command}\n`;
      }

      if (service.ports.length > 0) {
        output += `    ports:\n`;
        service.ports.forEach(p => {
          output += `      - "${p.host}:${p.container}"\n`;
        });
      }

      if (service.volumes.length > 0) {
        output += `    volumes:\n`;
        service.volumes.forEach(v => {
          output += `      - ${v.host}:${v.container}${v.readOnly ? ':ro' : ''}\n`;
        });
      }

      if (service.environment.length > 0) {
        output += `    environment:\n`;
        service.environment.forEach(e => {
          output += `      - ${e.key}=${e.value}\n`;
        });
      }

      if (service.depends_on.length > 0) {
        output += `    depends_on:\n`;
        service.depends_on.forEach(d => {
          output += `      - ${d}\n`;
        });
      }

      if (service.restart !== 'no') {
        output += `    restart: ${service.restart}\n`;
      }

      if (service.networks.length > 0) {
        output += `    networks:\n`;
        service.networks.forEach(n => {
          output += `      - ${n}\n`;
        });
      }

      output += '\n';
    });

    if (networks.length > 0) {
      output += `networks:\n`;
      networks.forEach(n => {
        output += `  ${n.name}:\n`;
        output += `    driver: ${n.driver}\n`;
      });
      output += '\n';
    }

    if (volumes.length > 0) {
      output += `volumes:\n`;
      volumes.forEach(v => {
        output += `  ${v.name}:\n`;
        if (v.driver !== 'local') {
          output += `    driver: ${v.driver}\n`;
        }
      });
    }

    return output;
  }, [services, networks, volumes, version]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(yaml);
    setSnackbar({ open: true, message: 'Copied to clipboard' });
  };

  const handleDownload = () => {
    const blob = new Blob([yaml], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'docker-compose.yml';
    a.click();
    URL.revokeObjectURL(url);
  };

  const addService = (template?: typeof serviceTemplates[0]) => {
    const id = String(Date.now());
    const newService: Service = {
      id,
      name: template?.name.toLowerCase() || 'service',
      image: template?.image || 'alpine:latest',
      ports: template?.ports || [],
      volumes: [],
      environment: template?.environment || [],
      depends_on: [],
      restart: 'unless-stopped',
      networks: networks.length > 0 ? [networks[0].name] : [],
    };
    setServices([...services, newService]);
  };

  const removeService = (id: string) => setServices(services.filter(s => s.id !== id));

  const updateService = (id: string, field: keyof Service, value: unknown) => {
    setServices(services.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const addNetwork = () => {
    setNetworks([...networks, { id: String(Date.now()), name: 'network', driver: 'bridge' }]);
  };

  const removeNetwork = (id: string) => setNetworks(networks.filter(n => n.id !== id));

  const addVolume = () => {
    setVolumes([...volumes, { id: String(Date.now()), name: 'volume', driver: 'local' }]);
  };

  const removeVolume = (id: string) => setVolumes(volumes.filter(v => v.id !== id));

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a' }}>
      <Paper elevation={0} sx={{ bgcolor: '#111', borderBottom: '1px solid #222', px: 3, py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Link to="/"><IconButton size="small" sx={{ color: 'grey.500' }}><Home /></IconButton></Link>
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>Docker Compose Builder</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Download"><IconButton onClick={handleDownload} sx={{ color: 'grey.500' }}><Download /></IconButton></Tooltip>
            <Tooltip title="Copy"><IconButton onClick={handleCopy} sx={{ color: 'grey.500' }}><ContentCopy /></IconButton></Tooltip>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', height: 'calc(100vh - 70px)' }}>
        {/* Builder Panel */}
        <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
          {/* Quick Add */}
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 2 }}>
            <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1 }}>Quick Add Service</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {serviceTemplates.map(t => (
                <Chip key={t.name} label={t.name} onClick={() => addService(t)} sx={{ cursor: 'pointer' }} />
              ))}
            </Box>
          </Paper>

          {/* Services */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="subtitle1" sx={{ color: 'grey.300' }}>Services ({services.length})</Typography>
            <Button size="small" startIcon={<Add />} onClick={() => addService()} sx={{ color: 'grey.400' }}>Add Service</Button>
          </Box>

          {services.map(service => (
            <Accordion key={service.id} sx={{ bgcolor: '#111', border: '1px solid #222', mb: 1, '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMore sx={{ color: 'grey.500' }} />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <Typography sx={{ color: 'grey.300' }}>{service.name}</Typography>
                  <Chip label={service.image} size="small" sx={{ bgcolor: '#222' }} />
                  <Box sx={{ flex: 1 }} />
                  <IconButton size="small" onClick={(e) => { e.stopPropagation(); removeService(service.id); }} sx={{ color: 'grey.500' }}>
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <TextField size="small" label="Service Name" value={service.name} onChange={(e) => updateService(service.id, 'name', e.target.value)} sx={{ flex: 1, '& .MuiInputBase-root': { color: 'grey.300' } }} />
                  <TextField size="small" label="Image" value={service.image} onChange={(e) => updateService(service.id, 'image', e.target.value)} sx={{ flex: 2, '& .MuiInputBase-root': { color: 'grey.300' } }} />
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <FormControl size="small" sx={{ flex: 1 }}>
                    <InputLabel sx={{ color: 'grey.500' }}>Restart</InputLabel>
                    <Select value={service.restart} label="Restart" onChange={(e) => updateService(service.id, 'restart', e.target.value)} sx={{ color: 'grey.300' }}>
                      {restartOptions.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <TextField size="small" label="Command" value={service.command || ''} onChange={(e) => updateService(service.id, 'command', e.target.value)} sx={{ flex: 2, '& .MuiInputBase-root': { color: 'grey.300', fontFamily: 'monospace' } }} />
                </Box>

                {/* Ports */}
                <Typography variant="caption" sx={{ color: 'grey.500', display: 'block', mb: 1 }}>Ports</Typography>
                {service.ports.map((port, i) => (
                  <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                    <TextField size="small" label="Host" value={port.host} onChange={(e) => {
                      const newPorts = [...service.ports];
                      newPorts[i] = { ...port, host: e.target.value };
                      updateService(service.id, 'ports', newPorts);
                    }} sx={{ width: 100, '& .MuiInputBase-root': { color: 'grey.300' } }} />
                    <Typography sx={{ color: 'grey.500' }}>:</Typography>
                    <TextField size="small" label="Container" value={port.container} onChange={(e) => {
                      const newPorts = [...service.ports];
                      newPorts[i] = { ...port, container: e.target.value };
                      updateService(service.id, 'ports', newPorts);
                    }} sx={{ width: 100, '& .MuiInputBase-root': { color: 'grey.300' } }} />
                    <IconButton size="small" onClick={() => updateService(service.id, 'ports', service.ports.filter((_, idx) => idx !== i))} sx={{ color: 'grey.500' }}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
                <Button size="small" onClick={() => updateService(service.id, 'ports', [...service.ports, { host: '', container: '' }])} sx={{ color: 'grey.500', mb: 2 }}>+ Add Port</Button>

                {/* Environment */}
                <Typography variant="caption" sx={{ color: 'grey.500', display: 'block', mb: 1 }}>Environment Variables</Typography>
                {service.environment.map((env, i) => (
                  <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                    <TextField size="small" label="Key" value={env.key} onChange={(e) => {
                      const newEnv = [...service.environment];
                      newEnv[i] = { ...env, key: e.target.value };
                      updateService(service.id, 'environment', newEnv);
                    }} sx={{ flex: 1, '& .MuiInputBase-root': { color: 'grey.300' } }} />
                    <TextField size="small" label="Value" value={env.value} onChange={(e) => {
                      const newEnv = [...service.environment];
                      newEnv[i] = { ...env, value: e.target.value };
                      updateService(service.id, 'environment', newEnv);
                    }} sx={{ flex: 1, '& .MuiInputBase-root': { color: 'grey.300' } }} />
                    <IconButton size="small" onClick={() => updateService(service.id, 'environment', service.environment.filter((_, idx) => idx !== i))} sx={{ color: 'grey.500' }}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
                <Button size="small" onClick={() => updateService(service.id, 'environment', [...service.environment, { key: '', value: '' }])} sx={{ color: 'grey.500' }}>+ Add Variable</Button>
              </AccordionDetails>
            </Accordion>
          ))}

          {/* Networks */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 3, mb: 2 }}>
            <Typography variant="subtitle1" sx={{ color: 'grey.300' }}>Networks ({networks.length})</Typography>
            <Button size="small" startIcon={<Add />} onClick={addNetwork} sx={{ color: 'grey.400' }}>Add Network</Button>
          </Box>

          {networks.map(network => (
            <Paper key={network.id} sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 1 }}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField size="small" label="Name" value={network.name} onChange={(e) => setNetworks(networks.map(n => n.id === network.id ? { ...n, name: e.target.value } : n))} sx={{ flex: 1, '& .MuiInputBase-root': { color: 'grey.300' } }} />
                <FormControl size="small" sx={{ width: 150 }}>
                  <InputLabel sx={{ color: 'grey.500' }}>Driver</InputLabel>
                  <Select value={network.driver} label="Driver" onChange={(e) => setNetworks(networks.map(n => n.id === network.id ? { ...n, driver: e.target.value } : n))} sx={{ color: 'grey.300' }}>
                    {networkDrivers.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                  </Select>
                </FormControl>
                <IconButton size="small" onClick={() => removeNetwork(network.id)} sx={{ color: 'grey.500' }}><Delete fontSize="small" /></IconButton>
              </Box>
            </Paper>
          ))}
        </Box>

        {/* YAML Output */}
        <Box sx={{ width: 450, borderLeft: '1px solid #222', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderBottom: '1px solid #222' }}>
            <Typography variant="subtitle2" sx={{ color: 'grey.400' }}>docker-compose.yml</Typography>
            <FormControl size="small" sx={{ width: 100 }}>
              <Select value={version} onChange={(e) => setVersion(e.target.value)} sx={{ color: 'grey.300', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' } }}>
                {['3.8', '3.7', '3.6', '3', '2.4', '2'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
            <Paper sx={{ bgcolor: '#0a0a0a', p: 2, border: '1px solid #333', height: '100%' }}>
              <Typography component="pre" sx={{ fontFamily: 'monospace', fontSize: 13, color: '#d4d4d4', m: 0, whiteSpace: 'pre-wrap' }}>
                {yaml}
              </Typography>
            </Paper>
          </Box>
        </Box>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={2000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} />
    </Box>
  );
}
