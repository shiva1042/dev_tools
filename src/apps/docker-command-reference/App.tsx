import { useState, useMemo } from 'react';
import {
  Box, Paper, Typography, TextField, IconButton, Tooltip, Chip, Snackbar, Tabs, Tab,
} from '@mui/material';
import { ContentCopy, Home, Search, ExpandMore, ExpandLess } from '@mui/icons-material';
import { Link } from 'react-router-dom';

interface Cmd { name: string; syntax: string; desc: string; flags: { flag: string; desc: string }[]; examples: string[]; tip?: string; }
interface Cat { name: string; color: string; commands: Cmd[]; }

const DATA: Cat[] = [
  { name: 'Container Lifecycle', color: '#2196f3', commands: [
    { name: 'docker run', syntax: 'docker run [OPTIONS] IMAGE [CMD]', desc: 'Create and start a container', flags: [{ flag: '-d', desc: 'Detached mode (background)' }, { flag: '-it', desc: 'Interactive with TTY' }, { flag: '-p', desc: 'Port mapping host:container' }, { flag: '-v', desc: 'Volume mount host:container' }, { flag: '--name', desc: 'Assign container name' }, { flag: '-e', desc: 'Set environment variable' }, { flag: '--rm', desc: 'Remove on exit' }, { flag: '--network', desc: 'Connect to network' }, { flag: '-w', desc: 'Working directory' }, { flag: '--restart', desc: 'Restart policy (no|always|unless-stopped)' }], examples: ['docker run -d -p 8080:80 --name web nginx', 'docker run -it --rm ubuntu bash', 'docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=secret -v pgdata:/var/lib/postgresql/data postgres'], tip: 'Use --rm for temporary containers' },
    { name: 'docker start', syntax: 'docker start [OPTIONS] CONTAINER', desc: 'Start stopped container(s)', flags: [{ flag: '-a', desc: 'Attach STDOUT/STDERR' }, { flag: '-i', desc: 'Attach STDIN' }], examples: ['docker start my-container', 'docker start -ai my-container'] },
    { name: 'docker stop', syntax: 'docker stop [OPTIONS] CONTAINER', desc: 'Stop running container(s)', flags: [{ flag: '-t', desc: 'Timeout before kill (default 10s)' }], examples: ['docker stop my-container', 'docker stop -t 30 my-container', 'docker stop $(docker ps -q)'], tip: 'Stop all: docker stop $(docker ps -q)' },
    { name: 'docker restart', syntax: 'docker restart [OPTIONS] CONTAINER', desc: 'Restart container(s)', flags: [{ flag: '-t', desc: 'Timeout before kill' }], examples: ['docker restart my-container'] },
    { name: 'docker kill', syntax: 'docker kill [OPTIONS] CONTAINER', desc: 'Kill running container(s)', flags: [{ flag: '-s', desc: 'Signal to send (default SIGKILL)' }], examples: ['docker kill my-container', 'docker kill -s SIGTERM my-container'] },
    { name: 'docker rm', syntax: 'docker rm [OPTIONS] CONTAINER', desc: 'Remove container(s)', flags: [{ flag: '-f', desc: 'Force remove running container' }, { flag: '-v', desc: 'Remove associated volumes' }], examples: ['docker rm my-container', 'docker rm -f $(docker ps -aq)'], tip: 'Remove all stopped: docker container prune' },
    { name: 'docker pause', syntax: 'docker pause CONTAINER', desc: 'Pause processes in container', flags: [], examples: ['docker pause my-container'] },
    { name: 'docker unpause', syntax: 'docker unpause CONTAINER', desc: 'Unpause processes in container', flags: [], examples: ['docker unpause my-container'] },
  ]},
  { name: 'Container Info', color: '#4caf50', commands: [
    { name: 'docker ps', syntax: 'docker ps [OPTIONS]', desc: 'List containers', flags: [{ flag: '-a', desc: 'Show all (including stopped)' }, { flag: '-q', desc: 'Only show IDs' }, { flag: '--format', desc: 'Custom output format' }, { flag: '-f', desc: 'Filter output' }, { flag: '-n', desc: 'Show last N containers' }], examples: ['docker ps', 'docker ps -a', 'docker ps --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}"', 'docker ps -f status=exited'] },
    { name: 'docker inspect', syntax: 'docker inspect [OPTIONS] CONTAINER|IMAGE', desc: 'Return low-level object info', flags: [{ flag: '-f', desc: 'Format with Go template' }], examples: ['docker inspect my-container', "docker inspect -f '{{.NetworkSettings.IPAddress}}' my-container", "docker inspect -f '{{json .Config.Env}}' my-container"] },
    { name: 'docker logs', syntax: 'docker logs [OPTIONS] CONTAINER', desc: 'Fetch container logs', flags: [{ flag: '-f', desc: 'Follow log output' }, { flag: '--tail', desc: 'Number of lines from end' }, { flag: '--since', desc: 'Since timestamp' }, { flag: '-t', desc: 'Show timestamps' }], examples: ['docker logs -f my-container', 'docker logs --tail 100 my-container', 'docker logs --since 1h my-container'] },
    { name: 'docker top', syntax: 'docker top CONTAINER', desc: 'Display running processes', flags: [], examples: ['docker top my-container'] },
    { name: 'docker stats', syntax: 'docker stats [OPTIONS] [CONTAINER]', desc: 'Live resource usage statistics', flags: [{ flag: '--no-stream', desc: 'Single snapshot' }, { flag: '--format', desc: 'Custom format' }], examples: ['docker stats', 'docker stats --no-stream', 'docker stats my-container'] },
    { name: 'docker exec', syntax: 'docker exec [OPTIONS] CONTAINER CMD', desc: 'Run command in running container', flags: [{ flag: '-it', desc: 'Interactive TTY' }, { flag: '-d', desc: 'Detached mode' }, { flag: '-e', desc: 'Set env variable' }, { flag: '-w', desc: 'Working directory' }], examples: ['docker exec -it my-container bash', 'docker exec my-container cat /etc/hosts', 'docker exec -e VAR=val my-container cmd'] },
    { name: 'docker cp', syntax: 'docker cp SRC DEST', desc: 'Copy files between container and host', flags: [], examples: ['docker cp my-container:/app/log.txt .', 'docker cp ./config.yml my-container:/app/'] },
  ]},
  { name: 'Image Management', color: '#ff9800', commands: [
    { name: 'docker images', syntax: 'docker images [OPTIONS]', desc: 'List images', flags: [{ flag: '-a', desc: 'Show all images' }, { flag: '-q', desc: 'Only show IDs' }, { flag: '--format', desc: 'Custom format' }, { flag: '-f', desc: 'Filter' }], examples: ['docker images', 'docker images -f dangling=true'] },
    { name: 'docker pull', syntax: 'docker pull IMAGE[:TAG]', desc: 'Pull image from registry', flags: [{ flag: '--platform', desc: 'Set platform (linux/amd64)' }], examples: ['docker pull nginx:latest', 'docker pull --platform linux/arm64 ubuntu'] },
    { name: 'docker build', syntax: 'docker build [OPTIONS] PATH', desc: 'Build image from Dockerfile', flags: [{ flag: '-t', desc: 'Name and tag' }, { flag: '-f', desc: 'Dockerfile path' }, { flag: '--no-cache', desc: 'Do not use cache' }, { flag: '--build-arg', desc: 'Build-time variable' }, { flag: '--target', desc: 'Multi-stage target' }], examples: ['docker build -t myapp:latest .', 'docker build -f Dockerfile.prod -t myapp:prod .', 'docker build --build-arg NODE_ENV=production -t myapp .'] },
    { name: 'docker push', syntax: 'docker push IMAGE[:TAG]', desc: 'Push image to registry', flags: [], examples: ['docker push myuser/myapp:latest'] },
    { name: 'docker rmi', syntax: 'docker rmi [OPTIONS] IMAGE', desc: 'Remove image(s)', flags: [{ flag: '-f', desc: 'Force removal' }], examples: ['docker rmi myapp:latest', 'docker rmi $(docker images -q -f dangling=true)'] },
    { name: 'docker tag', syntax: 'docker tag SOURCE TARGET', desc: 'Create a tag for an image', flags: [], examples: ['docker tag myapp:latest myuser/myapp:v1.0'] },
    { name: 'docker save', syntax: 'docker save [OPTIONS] IMAGE', desc: 'Save image to tar archive', flags: [{ flag: '-o', desc: 'Output file' }], examples: ['docker save -o myapp.tar myapp:latest'] },
    { name: 'docker load', syntax: 'docker load [OPTIONS]', desc: 'Load image from tar archive', flags: [{ flag: '-i', desc: 'Input file' }], examples: ['docker load -i myapp.tar'] },
    { name: 'docker history', syntax: 'docker history IMAGE', desc: 'Show image layer history', flags: [{ flag: '--no-trunc', desc: 'Full output' }], examples: ['docker history nginx', 'docker history --no-trunc myapp'] },
  ]},
  { name: 'Network', color: '#e91e63', commands: [
    { name: 'docker network create', syntax: 'docker network create [OPTIONS] NAME', desc: 'Create a network', flags: [{ flag: '-d', desc: 'Driver (bridge|overlay|host)' }, { flag: '--subnet', desc: 'Subnet in CIDR' }], examples: ['docker network create mynet', 'docker network create -d bridge --subnet 172.20.0.0/16 mynet'] },
    { name: 'docker network ls', syntax: 'docker network ls', desc: 'List networks', flags: [{ flag: '-f', desc: 'Filter' }], examples: ['docker network ls'] },
    { name: 'docker network inspect', syntax: 'docker network inspect NETWORK', desc: 'Display network details', flags: [], examples: ['docker network inspect bridge'] },
    { name: 'docker network connect', syntax: 'docker network connect NETWORK CONTAINER', desc: 'Connect container to network', flags: [{ flag: '--ip', desc: 'IPv4 address' }], examples: ['docker network connect mynet my-container'] },
    { name: 'docker network disconnect', syntax: 'docker network disconnect NETWORK CONTAINER', desc: 'Disconnect container from network', flags: [], examples: ['docker network disconnect mynet my-container'] },
    { name: 'docker network rm', syntax: 'docker network rm NETWORK', desc: 'Remove network(s)', flags: [], examples: ['docker network rm mynet'] },
  ]},
  { name: 'Volume', color: '#9c27b0', commands: [
    { name: 'docker volume create', syntax: 'docker volume create [OPTIONS] [NAME]', desc: 'Create a volume', flags: [{ flag: '-d', desc: 'Volume driver' }, { flag: '--label', desc: 'Set metadata' }], examples: ['docker volume create mydata'] },
    { name: 'docker volume ls', syntax: 'docker volume ls [OPTIONS]', desc: 'List volumes', flags: [{ flag: '-f', desc: 'Filter' }, { flag: '-q', desc: 'Only names' }], examples: ['docker volume ls', 'docker volume ls -f dangling=true'] },
    { name: 'docker volume inspect', syntax: 'docker volume inspect VOLUME', desc: 'Display volume details', flags: [], examples: ['docker volume inspect mydata'] },
    { name: 'docker volume rm', syntax: 'docker volume rm VOLUME', desc: 'Remove volume(s)', flags: [], examples: ['docker volume rm mydata'] },
    { name: 'docker volume prune', syntax: 'docker volume prune [OPTIONS]', desc: 'Remove unused volumes', flags: [{ flag: '-f', desc: 'No confirmation prompt' }], examples: ['docker volume prune -f'] },
  ]},
  { name: 'Docker Compose', color: '#00bcd4', commands: [
    { name: 'docker compose up', syntax: 'docker compose up [OPTIONS] [SERVICE]', desc: 'Create and start containers', flags: [{ flag: '-d', desc: 'Detached mode' }, { flag: '--build', desc: 'Build before starting' }, { flag: '--force-recreate', desc: 'Recreate containers' }, { flag: '--scale', desc: 'Scale service instances' }], examples: ['docker compose up -d', 'docker compose up --build', 'docker compose up -d --scale worker=3'] },
    { name: 'docker compose down', syntax: 'docker compose down [OPTIONS]', desc: 'Stop and remove containers', flags: [{ flag: '-v', desc: 'Remove volumes' }, { flag: '--rmi', desc: 'Remove images (all|local)' }], examples: ['docker compose down', 'docker compose down -v --rmi all'] },
    { name: 'docker compose build', syntax: 'docker compose build [OPTIONS] [SERVICE]', desc: 'Build service images', flags: [{ flag: '--no-cache', desc: 'Do not use cache' }, { flag: '--parallel', desc: 'Build in parallel' }], examples: ['docker compose build', 'docker compose build --no-cache web'] },
    { name: 'docker compose ps', syntax: 'docker compose ps [OPTIONS]', desc: 'List containers', flags: [{ flag: '-a', desc: 'Show all' }], examples: ['docker compose ps'] },
    { name: 'docker compose logs', syntax: 'docker compose logs [OPTIONS] [SERVICE]', desc: 'View service logs', flags: [{ flag: '-f', desc: 'Follow' }, { flag: '--tail', desc: 'Number of lines' }], examples: ['docker compose logs -f web', 'docker compose logs --tail 50'] },
    { name: 'docker compose exec', syntax: 'docker compose exec SERVICE CMD', desc: 'Execute command in service', flags: [{ flag: '-it', desc: 'Interactive TTY' }], examples: ['docker compose exec web bash', 'docker compose exec db psql -U postgres'] },
    { name: 'docker compose run', syntax: 'docker compose run [OPTIONS] SERVICE CMD', desc: 'Run one-off command', flags: [{ flag: '--rm', desc: 'Remove after run' }, { flag: '-e', desc: 'Set env var' }], examples: ['docker compose run --rm web npm test', 'docker compose run --rm web rails db:migrate'] },
  ]},
  { name: 'System', color: '#ff5722', commands: [
    { name: 'docker system info', syntax: 'docker info', desc: 'Display system-wide info', flags: [], examples: ['docker info'] },
    { name: 'docker version', syntax: 'docker version', desc: 'Show Docker version', flags: [{ flag: '--format', desc: 'Custom format' }], examples: ['docker version', "docker version --format '{{.Server.Version}}'"] },
    { name: 'docker system prune', syntax: 'docker system prune [OPTIONS]', desc: 'Remove unused data', flags: [{ flag: '-a', desc: 'Remove all unused images' }, { flag: '-f', desc: 'No confirmation' }, { flag: '--volumes', desc: 'Prune volumes too' }], examples: ['docker system prune -af', 'docker system prune -af --volumes'], tip: 'Great for reclaiming disk space' },
    { name: 'docker system df', syntax: 'docker system df [OPTIONS]', desc: 'Show Docker disk usage', flags: [{ flag: '-v', desc: 'Verbose output' }], examples: ['docker system df', 'docker system df -v'] },
    { name: 'docker events', syntax: 'docker events [OPTIONS]', desc: 'Stream real-time events', flags: [{ flag: '--since', desc: 'Since timestamp' }, { flag: '-f', desc: 'Filter events' }], examples: ['docker events', 'docker events --since 1h -f type=container'] },
  ]},
];

const COMPOSE_REF = `# docker-compose.yml reference
version: "3.9"
services:
  web:
    build: ./web            # Build from Dockerfile
    image: myapp:latest     # Or use existing image
    ports:
      - "8080:80"           # Host:Container port mapping
    environment:
      - NODE_ENV=production
    env_file:
      - .env                # Load env from file
    volumes:
      - ./app:/app          # Bind mount
      - data:/data          # Named volume
    depends_on:
      - db                  # Start after db
    restart: unless-stopped
    networks:
      - frontend
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: "0.5"
          memory: 512M

  db:
    image: postgres:15
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      POSTGRES_PASSWORD: secret
    networks:
      - frontend

volumes:
  data:
  pgdata:

networks:
  frontend:
    driver: bridge`;

export default function App() {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState(0);
  const [snack, setSnack] = useState('');

  const copy = (t: string) => { navigator.clipboard.writeText(t); setSnack('Copied!'); };
  const toggle = (name: string) => setExpanded(prev => { const s = new Set(prev); s.has(name) ? s.delete(name) : s.add(name); return s; });

  const filtered = useMemo(() => {
    if (!search) return DATA;
    const s = search.toLowerCase();
    return DATA.map(cat => ({ ...cat, commands: cat.commands.filter(c => c.name.toLowerCase().includes(s) || c.desc.toLowerCase().includes(s) || c.flags.some(f => f.desc.toLowerCase().includes(s))) })).filter(c => c.commands.length > 0);
  }, [search]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a', color: 'grey.300', p: 3 }}>
      <Box sx={{ maxWidth: 960, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <Link to="/"><IconButton size="small" sx={{ color: 'grey.500' }}><Home /></IconButton></Link>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>Docker Command Reference</Typography>
            <Typography variant="caption" sx={{ color: 'grey.500' }}>{DATA.reduce((a, c) => a + c.commands.length, 0)} commands</Typography>
          </Box>
        </Box>

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, '& .MuiTab-root': { color: 'grey.500', textTransform: 'none', fontSize: 13 }, '& .Mui-selected': { color: '#90caf9' } }}>
          <Tab label="Commands" /><Tab label="Compose Reference" />
        </Tabs>

        {tab === 0 && (<>
          <TextField fullWidth size="small" placeholder="Search commands..." value={search} onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment: <Search sx={{ color: 'grey.500', mr: 1 }} /> }}
            sx={{ mb: 3, '& .MuiOutlinedInput-root': { bgcolor: '#111', '& fieldset': { borderColor: '#333' }, '&:hover fieldset': { borderColor: '#555' }, '&.Mui-focused fieldset': { borderColor: '#1976d2' } }, '& .MuiInputBase-input': { color: 'grey.300' } }} />

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 3 }}>
            {DATA.map(cat => <Chip key={cat.name} label={`${cat.name} (${cat.commands.length})`} size="small" sx={{ bgcolor: cat.color + '22', color: cat.color, border: `1px solid ${cat.color}44` }} />)}
          </Box>

          {filtered.map(cat => (
            <Paper key={cat.name} sx={{ bgcolor: '#111', border: '1px solid #222', mb: 2, overflow: 'hidden' }}>
              <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1, borderBottom: '1px solid #222' }}>
                <Box sx={{ width: 4, height: 24, bgcolor: cat.color, borderRadius: 1 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600, flex: 1 }}>{cat.name}</Typography>
              </Box>
              {cat.commands.map(cmd => {
                const isOpen = expanded.has(cmd.name);
                return (
                  <Box key={cmd.name} sx={{ borderBottom: '1px solid #1a1a1a' }}>
                    <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', cursor: 'pointer', '&:hover': { bgcolor: '#1a1a1a' } }} onClick={() => toggle(cmd.name)}>
                      <Box sx={{ minWidth: 200 }}>
                        <Typography sx={{ fontFamily: 'monospace', fontWeight: 700, color: cat.color, fontSize: 13 }}>{cmd.name}</Typography>
                      </Box>
                      <Typography variant="body2" sx={{ color: 'grey.400', flex: 1, fontSize: 13 }}>{cmd.desc}</Typography>
                      <Tooltip title="Copy command"><IconButton size="small" onClick={e => { e.stopPropagation(); copy(cmd.name); }} sx={{ color: 'grey.600' }}><ContentCopy sx={{ fontSize: 14 }} /></IconButton></Tooltip>
                      {isOpen ? <ExpandLess sx={{ color: 'grey.500' }} /> : <ExpandMore sx={{ color: 'grey.500' }} />}
                    </Box>
                    {isOpen && (
                      <Box sx={{ px: 2, pb: 2 }}>
                        <Box sx={{ mb: 1.5, p: 1, bgcolor: '#0a0a0a', borderRadius: 1, fontFamily: 'monospace', fontSize: 13, color: '#90caf9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span>{cmd.syntax}</span>
                          <IconButton size="small" onClick={() => copy(cmd.syntax)} sx={{ color: 'grey.600' }}><ContentCopy sx={{ fontSize: 12 }} /></IconButton>
                        </Box>
                        {cmd.flags.length > 0 && (<>
                          <Typography variant="caption" sx={{ color: 'grey.500', display: 'block', mb: 0.5, fontWeight: 600 }}>Flags:</Typography>
                          <Box sx={{ mb: 1.5, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {cmd.flags.map(f => (
                              <Tooltip key={f.flag} title={f.desc}><Chip label={f.flag} size="small" onClick={() => copy(f.flag)} sx={{ bgcolor: '#1a2332', color: '#90caf9', fontFamily: 'monospace', fontSize: 11, cursor: 'pointer' }} /></Tooltip>
                            ))}
                          </Box>
                        </>)}
                        <Typography variant="caption" sx={{ color: 'grey.500', display: 'block', mb: 0.5, fontWeight: 600 }}>Examples:</Typography>
                        {cmd.examples.map((ex, i) => (
                          <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 0.5, p: 0.5, bgcolor: '#0a0a0a', borderRadius: 1, '&:hover': { bgcolor: '#141414' } }}>
                            <Typography sx={{ fontFamily: 'monospace', fontSize: 12, color: '#81c784', flex: 1 }}>$ {ex}</Typography>
                            <IconButton size="small" onClick={() => copy(ex)} sx={{ color: 'grey.600' }}><ContentCopy sx={{ fontSize: 12 }} /></IconButton>
                          </Box>
                        ))}
                        {cmd.tip && (
                          <Box sx={{ mt: 1, p: 1, bgcolor: '#1a2332', borderRadius: 1, borderLeft: '3px solid #2196f3' }}>
                            <Typography variant="caption" sx={{ color: '#90caf9' }}>Tip: {cmd.tip}</Typography>
                          </Box>
                        )}
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Paper>
          ))}
          {filtered.length === 0 && <Typography sx={{ textAlign: 'center', color: 'grey.500', mt: 4 }}>No commands match your search.</Typography>}
        </>)}

        {tab === 1 && (
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, position: 'relative' }}>
            <Tooltip title="Copy"><IconButton onClick={() => copy(COMPOSE_REF)} sx={{ position: 'absolute', right: 8, top: 8, color: 'grey.400' }}><ContentCopy fontSize="small" /></IconButton></Tooltip>
            <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1 }}>Docker Compose File Reference</Typography>
            <Box component="pre" sx={{ color: '#81c784', fontFamily: 'monospace', fontSize: 13, overflow: 'auto', maxHeight: 600, whiteSpace: 'pre', m: 0 }}>
              {COMPOSE_REF}
            </Box>
          </Paper>
        )}
      </Box>
      <Snackbar open={!!snack} autoHideDuration={1500} onClose={() => setSnack('')} message={snack} />
    </Box>
  );
}
