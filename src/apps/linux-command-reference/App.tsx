import { useState, useMemo } from 'react';
import {
  Box, Paper, Typography, TextField, IconButton, Tooltip, Chip, Snackbar,
} from '@mui/material';
import { ContentCopy, Home, Search, ExpandMore, ExpandLess } from '@mui/icons-material';
import { Link } from 'react-router-dom';

interface Cmd { name: string; syntax: string; desc: string; flags: { flag: string; desc: string }[]; examples: string[]; }
interface Cat { name: string; color: string; commands: Cmd[]; }

const DATA: Cat[] = [
  { name: 'File Operations', color: '#4caf50', commands: [
    { name: 'ls', syntax: 'ls [OPTIONS] [DIR]', desc: 'List directory contents', flags: [{ flag: '-l', desc: 'Long format with details' }, { flag: '-a', desc: 'Show hidden files' }, { flag: '-h', desc: 'Human-readable sizes' }, { flag: '-R', desc: 'Recursive listing' }, { flag: '-t', desc: 'Sort by modification time' }, { flag: '-S', desc: 'Sort by file size' }], examples: ['ls -lah', 'ls -lt /var/log', 'ls -R src/'] },
    { name: 'cp', syntax: 'cp [OPTIONS] SRC DEST', desc: 'Copy files and directories', flags: [{ flag: '-r', desc: 'Copy directories recursively' }, { flag: '-i', desc: 'Prompt before overwrite' }, { flag: '-v', desc: 'Verbose output' }, { flag: '-p', desc: 'Preserve timestamps/permissions' }], examples: ['cp -r src/ backup/', 'cp -iv file.txt /tmp/'] },
    { name: 'mv', syntax: 'mv [OPTIONS] SRC DEST', desc: 'Move or rename files', flags: [{ flag: '-i', desc: 'Prompt before overwrite' }, { flag: '-v', desc: 'Verbose output' }, { flag: '-n', desc: 'No overwrite existing' }], examples: ['mv old.txt new.txt', 'mv *.log /var/log/'] },
    { name: 'rm', syntax: 'rm [OPTIONS] FILE', desc: 'Remove files or directories', flags: [{ flag: '-r', desc: 'Remove directories recursively' }, { flag: '-f', desc: 'Force without prompting' }, { flag: '-i', desc: 'Prompt before each removal' }], examples: ['rm -rf build/', 'rm -i *.tmp'] },
    { name: 'mkdir', syntax: 'mkdir [OPTIONS] DIR', desc: 'Create directories', flags: [{ flag: '-p', desc: 'Create parent dirs as needed' }, { flag: '-m', desc: 'Set permissions' }], examples: ['mkdir -p src/components/ui', 'mkdir -m 755 newdir'] },
    { name: 'find', syntax: 'find [PATH] [EXPRESSION]', desc: 'Search for files in directory hierarchy', flags: [{ flag: '-name', desc: 'Match filename pattern' }, { flag: '-type f/d', desc: 'File type (f=file, d=dir)' }, { flag: '-mtime', desc: 'Modified time in days' }, { flag: '-size', desc: 'File size' }, { flag: '-exec', desc: 'Execute command on results' }], examples: ['find . -name "*.ts" -type f', 'find /tmp -mtime +7 -delete', 'find . -size +100M'] },
    { name: 'chmod', syntax: 'chmod [OPTIONS] MODE FILE', desc: 'Change file permissions', flags: [{ flag: '-R', desc: 'Recursive' }, { flag: 'u/g/o/a', desc: 'User/group/other/all' }, { flag: '+/-/=', desc: 'Add/remove/set permissions' }], examples: ['chmod 755 script.sh', 'chmod -R u+rwX dir/', 'chmod go-w file.txt'] },
    { name: 'chown', syntax: 'chown [OPTIONS] OWNER[:GROUP] FILE', desc: 'Change file owner/group', flags: [{ flag: '-R', desc: 'Recursive' }, { flag: '--reference', desc: 'Use reference file' }], examples: ['chown www-data:www-data /var/www', 'chown -R user:group dir/'] },
    { name: 'tar', syntax: 'tar [OPTIONS] [FILE]', desc: 'Archive utility', flags: [{ flag: '-c', desc: 'Create archive' }, { flag: '-x', desc: 'Extract archive' }, { flag: '-z', desc: 'Gzip compression' }, { flag: '-v', desc: 'Verbose' }, { flag: '-f', desc: 'Specify filename' }], examples: ['tar -czf archive.tar.gz dir/', 'tar -xzf archive.tar.gz', 'tar -tf archive.tar'] },
    { name: 'ln', syntax: 'ln [OPTIONS] TARGET LINK_NAME', desc: 'Create links between files', flags: [{ flag: '-s', desc: 'Create symbolic link' }, { flag: '-f', desc: 'Force overwrite' }], examples: ['ln -s /usr/bin/python3 /usr/bin/python', 'ln -sf target link'] },
  ]},
  { name: 'Text Processing', color: '#2196f3', commands: [
    { name: 'grep', syntax: 'grep [OPTIONS] PATTERN [FILE]', desc: 'Search text using patterns', flags: [{ flag: '-i', desc: 'Case insensitive' }, { flag: '-r', desc: 'Recursive search' }, { flag: '-n', desc: 'Show line numbers' }, { flag: '-c', desc: 'Count matches' }, { flag: '-v', desc: 'Invert match' }, { flag: '-E', desc: 'Extended regex' }, { flag: '-l', desc: 'Files with matches only' }], examples: ['grep -rn "TODO" src/', 'grep -i error /var/log/syslog', 'grep -E "^[0-9]+" file.txt'] },
    { name: 'sed', syntax: 'sed [OPTIONS] SCRIPT [FILE]', desc: 'Stream editor for text transformation', flags: [{ flag: '-i', desc: 'Edit file in-place' }, { flag: '-e', desc: 'Add script command' }, { flag: '-n', desc: 'Suppress default output' }], examples: ["sed 's/old/new/g' file.txt", "sed -i 's/foo/bar/g' *.txt", "sed -n '5,10p' file.txt"] },
    { name: 'awk', syntax: 'awk [OPTIONS] PROGRAM [FILE]', desc: 'Pattern scanning and processing', flags: [{ flag: '-F', desc: 'Set field separator' }, { flag: '-v', desc: 'Set variable' }], examples: ["awk '{print $1, $3}' file.txt", "awk -F: '{print $1}' /etc/passwd", "awk 'NR>1{sum+=$2} END{print sum}' data.csv"] },
    { name: 'sort', syntax: 'sort [OPTIONS] [FILE]', desc: 'Sort lines of text', flags: [{ flag: '-n', desc: 'Numeric sort' }, { flag: '-r', desc: 'Reverse order' }, { flag: '-k', desc: 'Sort by field' }, { flag: '-u', desc: 'Unique lines only' }, { flag: '-t', desc: 'Field delimiter' }], examples: ['sort -nrk2 data.txt', 'sort -u names.txt', 'sort -t, -k3 file.csv'] },
    { name: 'uniq', syntax: 'uniq [OPTIONS] [FILE]', desc: 'Report or omit repeated lines', flags: [{ flag: '-c', desc: 'Count occurrences' }, { flag: '-d', desc: 'Only duplicates' }, { flag: '-u', desc: 'Only unique lines' }], examples: ['sort file.txt | uniq -c | sort -rn', 'uniq -d sorted.txt'] },
    { name: 'wc', syntax: 'wc [OPTIONS] [FILE]', desc: 'Count lines, words, characters', flags: [{ flag: '-l', desc: 'Line count' }, { flag: '-w', desc: 'Word count' }, { flag: '-c', desc: 'Byte count' }, { flag: '-m', desc: 'Character count' }], examples: ['wc -l *.py', 'find . -name "*.ts" | wc -l'] },
    { name: 'cut', syntax: 'cut [OPTIONS] [FILE]', desc: 'Remove sections from lines', flags: [{ flag: '-d', desc: 'Delimiter' }, { flag: '-f', desc: 'Select fields' }, { flag: '-c', desc: 'Select characters' }], examples: ["cut -d',' -f1,3 data.csv", 'cut -c1-10 file.txt'] },
    { name: 'head', syntax: 'head [OPTIONS] [FILE]', desc: 'Output first part of files', flags: [{ flag: '-n', desc: 'Number of lines' }, { flag: '-c', desc: 'Number of bytes' }], examples: ['head -n 20 file.txt', 'head -c 100 binary.dat'] },
    { name: 'tail', syntax: 'tail [OPTIONS] [FILE]', desc: 'Output last part of files', flags: [{ flag: '-n', desc: 'Number of lines' }, { flag: '-f', desc: 'Follow file updates' }, { flag: '-F', desc: 'Follow with retry' }], examples: ['tail -f /var/log/syslog', 'tail -n 50 app.log'] },
    { name: 'diff', syntax: 'diff [OPTIONS] FILE1 FILE2', desc: 'Compare files line by line', flags: [{ flag: '-u', desc: 'Unified format' }, { flag: '-r', desc: 'Recursive directory compare' }, { flag: '--color', desc: 'Colorized output' }], examples: ['diff -u old.txt new.txt', 'diff -r dir1/ dir2/'] },
  ]},
  { name: 'System Info', color: '#ff9800', commands: [
    { name: 'uname', syntax: 'uname [OPTIONS]', desc: 'Print system information', flags: [{ flag: '-a', desc: 'All information' }, { flag: '-r', desc: 'Kernel release' }, { flag: '-m', desc: 'Machine hardware' }], examples: ['uname -a', 'uname -r'] },
    { name: 'df', syntax: 'df [OPTIONS] [FILE]', desc: 'Report filesystem disk space usage', flags: [{ flag: '-h', desc: 'Human-readable sizes' }, { flag: '-T', desc: 'Show filesystem type' }, { flag: '-i', desc: 'Show inode usage' }], examples: ['df -hT', 'df -h /home'] },
    { name: 'du', syntax: 'du [OPTIONS] [DIR]', desc: 'Estimate file space usage', flags: [{ flag: '-h', desc: 'Human-readable' }, { flag: '-s', desc: 'Summary only' }, { flag: '--max-depth', desc: 'Limit depth' }], examples: ['du -sh *', 'du -h --max-depth=1 /var'] },
    { name: 'free', syntax: 'free [OPTIONS]', desc: 'Display memory usage', flags: [{ flag: '-h', desc: 'Human-readable' }, { flag: '-m', desc: 'In megabytes' }, { flag: '-g', desc: 'In gigabytes' }], examples: ['free -h', 'free -m'] },
    { name: 'ps', syntax: 'ps [OPTIONS]', desc: 'Report process snapshot', flags: [{ flag: 'aux', desc: 'All processes, user-oriented' }, { flag: '-ef', desc: 'Full-format listing' }, { flag: '--sort', desc: 'Sort by column' }], examples: ['ps aux | grep node', 'ps -ef --sort=-%mem | head'] },
    { name: 'kill', syntax: 'kill [SIGNAL] PID', desc: 'Send signal to process', flags: [{ flag: '-9', desc: 'SIGKILL (force kill)' }, { flag: '-15', desc: 'SIGTERM (graceful)' }, { flag: '-l', desc: 'List signals' }], examples: ['kill -9 12345', 'kill -15 $(pgrep node)'] },
    { name: 'top', syntax: 'top [OPTIONS]', desc: 'Interactive process viewer', flags: [{ flag: '-b', desc: 'Batch mode' }, { flag: '-n', desc: 'Number of iterations' }, { flag: '-p', desc: 'Monitor specific PID' }], examples: ['top -bn1 | head -20', 'top -p 1234'] },
    { name: 'uptime', syntax: 'uptime', desc: 'Show system uptime and load', flags: [{ flag: '-p', desc: 'Pretty format' }, { flag: '-s', desc: 'System up since' }], examples: ['uptime -p', 'uptime'] },
  ]},
  { name: 'Network', color: '#e91e63', commands: [
    { name: 'curl', syntax: 'curl [OPTIONS] URL', desc: 'Transfer data from/to server', flags: [{ flag: '-X', desc: 'HTTP method' }, { flag: '-H', desc: 'Add header' }, { flag: '-d', desc: 'POST data' }, { flag: '-o', desc: 'Output to file' }, { flag: '-s', desc: 'Silent mode' }, { flag: '-I', desc: 'Headers only' }, { flag: '-L', desc: 'Follow redirects' }], examples: ['curl -s https://api.example.com | jq .', "curl -X POST -H 'Content-Type: application/json' -d '{\"key\":\"val\"}' URL", 'curl -I https://example.com'] },
    { name: 'wget', syntax: 'wget [OPTIONS] URL', desc: 'Download files from web', flags: [{ flag: '-O', desc: 'Output filename' }, { flag: '-q', desc: 'Quiet mode' }, { flag: '-r', desc: 'Recursive download' }, { flag: '-c', desc: 'Continue partial download' }], examples: ['wget -O output.zip https://example.com/file.zip', 'wget -c https://example.com/large.iso'] },
    { name: 'ping', syntax: 'ping [OPTIONS] HOST', desc: 'Send ICMP echo requests', flags: [{ flag: '-c', desc: 'Count of pings' }, { flag: '-i', desc: 'Interval seconds' }, { flag: '-W', desc: 'Timeout seconds' }], examples: ['ping -c 4 google.com', 'ping -c 1 -W 2 192.168.1.1'] },
    { name: 'ss', syntax: 'ss [OPTIONS]', desc: 'Socket statistics', flags: [{ flag: '-t', desc: 'TCP sockets' }, { flag: '-u', desc: 'UDP sockets' }, { flag: '-l', desc: 'Listening sockets' }, { flag: '-n', desc: 'Numeric addresses' }, { flag: '-p', desc: 'Show process info' }], examples: ['ss -tulnp', 'ss -t state established'] },
    { name: 'dig', syntax: 'dig [OPTIONS] DOMAIN [TYPE]', desc: 'DNS lookup utility', flags: [{ flag: '+short', desc: 'Concise output' }, { flag: '@server', desc: 'Query specific DNS' }, { flag: '-x', desc: 'Reverse lookup' }], examples: ['dig example.com A +short', 'dig @8.8.8.8 example.com MX', 'dig -x 8.8.8.8'] },
    { name: 'traceroute', syntax: 'traceroute [OPTIONS] HOST', desc: 'Trace packet route to host', flags: [{ flag: '-n', desc: 'No DNS resolution' }, { flag: '-m', desc: 'Max TTL hops' }], examples: ['traceroute google.com', 'traceroute -n 192.168.1.1'] },
    { name: 'nc', syntax: 'nc [OPTIONS] HOST PORT', desc: 'Netcat - TCP/UDP connections', flags: [{ flag: '-l', desc: 'Listen mode' }, { flag: '-v', desc: 'Verbose' }, { flag: '-z', desc: 'Scan without sending data' }, { flag: '-w', desc: 'Timeout' }], examples: ['nc -zv host 80', 'nc -l 8080', 'echo "test" | nc host 1234'] },
  ]},
  { name: 'Package Management', color: '#9c27b0', commands: [
    { name: 'apt', syntax: 'apt [COMMAND] [PACKAGE]', desc: 'Debian/Ubuntu package manager', flags: [{ flag: 'update', desc: 'Update package list' }, { flag: 'upgrade', desc: 'Upgrade packages' }, { flag: 'install', desc: 'Install package' }, { flag: 'remove', desc: 'Remove package' }, { flag: 'search', desc: 'Search packages' }, { flag: 'autoremove', desc: 'Remove unused deps' }], examples: ['sudo apt update && sudo apt upgrade', 'apt install nginx', 'apt search nodejs'] },
    { name: 'yum/dnf', syntax: 'dnf [COMMAND] [PACKAGE]', desc: 'RHEL/Fedora package manager', flags: [{ flag: 'install', desc: 'Install package' }, { flag: 'update', desc: 'Update packages' }, { flag: 'remove', desc: 'Remove package' }, { flag: 'search', desc: 'Search packages' }, { flag: 'list', desc: 'List packages' }], examples: ['sudo dnf install httpd', 'dnf search python', 'sudo dnf update'] },
    { name: 'pacman', syntax: 'pacman [OPTIONS] [PACKAGE]', desc: 'Arch Linux package manager', flags: [{ flag: '-S', desc: 'Install package' }, { flag: '-Syu', desc: 'Full system upgrade' }, { flag: '-R', desc: 'Remove package' }, { flag: '-Ss', desc: 'Search packages' }, { flag: '-Q', desc: 'Query installed' }], examples: ['sudo pacman -Syu', 'pacman -Ss docker', 'sudo pacman -S vim'] },
    { name: 'brew', syntax: 'brew [COMMAND] [FORMULA]', desc: 'macOS/Linux Homebrew', flags: [{ flag: 'install', desc: 'Install formula' }, { flag: 'update', desc: 'Update Homebrew' }, { flag: 'upgrade', desc: 'Upgrade formulas' }, { flag: 'search', desc: 'Search formulas' }, { flag: 'list', desc: 'List installed' }], examples: ['brew install node', 'brew update && brew upgrade', 'brew search python'] },
  ]},
  { name: 'Process Management', color: '#00bcd4', commands: [
    { name: 'systemctl', syntax: 'systemctl [COMMAND] [UNIT]', desc: 'Control systemd services', flags: [{ flag: 'start', desc: 'Start service' }, { flag: 'stop', desc: 'Stop service' }, { flag: 'restart', desc: 'Restart service' }, { flag: 'status', desc: 'Show status' }, { flag: 'enable', desc: 'Enable at boot' }, { flag: 'disable', desc: 'Disable at boot' }], examples: ['systemctl status nginx', 'sudo systemctl restart docker', 'systemctl list-units --failed'] },
    { name: 'journalctl', syntax: 'journalctl [OPTIONS]', desc: 'Query systemd journal', flags: [{ flag: '-u', desc: 'Filter by unit' }, { flag: '-f', desc: 'Follow new entries' }, { flag: '--since', desc: 'Since timestamp' }, { flag: '-n', desc: 'Number of lines' }, { flag: '-p', desc: 'Priority level' }], examples: ['journalctl -u nginx -f', 'journalctl --since "1 hour ago"', 'journalctl -p err'] },
    { name: 'crontab', syntax: 'crontab [OPTIONS]', desc: 'Manage cron jobs', flags: [{ flag: '-e', desc: 'Edit crontab' }, { flag: '-l', desc: 'List cron jobs' }, { flag: '-r', desc: 'Remove crontab' }], examples: ['crontab -l', 'crontab -e'] },
    { name: 'nohup', syntax: 'nohup COMMAND [ARGS]', desc: 'Run command immune to hangups', flags: [{ flag: '&', desc: 'Run in background' }], examples: ['nohup ./script.sh &', 'nohup python app.py > output.log 2>&1 &'] },
    { name: 'tmux', syntax: 'tmux [COMMAND]', desc: 'Terminal multiplexer', flags: [{ flag: 'new -s', desc: 'New named session' }, { flag: 'attach -t', desc: 'Attach to session' }, { flag: 'ls', desc: 'List sessions' }, { flag: 'kill-session -t', desc: 'Kill session' }], examples: ['tmux new -s dev', 'tmux attach -t dev', 'tmux ls'] },
  ]},
  { name: 'User Management', color: '#ff5722', commands: [
    { name: 'useradd', syntax: 'useradd [OPTIONS] USERNAME', desc: 'Create new user', flags: [{ flag: '-m', desc: 'Create home directory' }, { flag: '-s', desc: 'Set default shell' }, { flag: '-G', desc: 'Add to groups' }], examples: ['sudo useradd -m -s /bin/bash -G sudo newuser'] },
    { name: 'usermod', syntax: 'usermod [OPTIONS] USERNAME', desc: 'Modify user account', flags: [{ flag: '-aG', desc: 'Append to group' }, { flag: '-s', desc: 'Change shell' }, { flag: '-L', desc: 'Lock account' }], examples: ['sudo usermod -aG docker myuser', 'sudo usermod -s /bin/zsh user'] },
    { name: 'passwd', syntax: 'passwd [USERNAME]', desc: 'Change password', flags: [{ flag: '-l', desc: 'Lock password' }, { flag: '-u', desc: 'Unlock password' }, { flag: '-e', desc: 'Expire password' }], examples: ['passwd', 'sudo passwd username'] },
    { name: 'sudo', syntax: 'sudo [OPTIONS] COMMAND', desc: 'Execute as superuser', flags: [{ flag: '-u', desc: 'Run as specific user' }, { flag: '-i', desc: 'Login shell' }, { flag: '-s', desc: 'Run shell' }, { flag: '-l', desc: 'List allowed commands' }], examples: ['sudo -i', 'sudo -u postgres psql', 'sudo -l'] },
  ]},
];

export default function App() {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [snack, setSnack] = useState('');

  const copy = (t: string) => { navigator.clipboard.writeText(t); setSnack('Copied!'); };
  const toggle = (name: string) => setExpanded(prev => { const s = new Set(prev); s.has(name) ? s.delete(name) : s.add(name); return s; });

  const filtered = useMemo(() => {
    if (!search) return DATA;
    const s = search.toLowerCase();
    return DATA.map(cat => ({
      ...cat,
      commands: cat.commands.filter(c => c.name.toLowerCase().includes(s) || c.desc.toLowerCase().includes(s) || c.flags.some(f => f.desc.toLowerCase().includes(s))),
    })).filter(cat => cat.commands.length > 0);
  }, [search]);

  const totalCmds = DATA.reduce((a, c) => a + c.commands.length, 0);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a', color: 'grey.300', p: 3 }}>
      <Box sx={{ maxWidth: 960, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <Link to="/"><IconButton size="small" sx={{ color: 'grey.500' }}><Home /></IconButton></Link>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>Linux Command Reference</Typography>
            <Typography variant="caption" sx={{ color: 'grey.500' }}>{totalCmds} commands across {DATA.length} categories</Typography>
          </Box>
        </Box>

        <TextField fullWidth size="small" placeholder="Search commands, descriptions, or flags..." value={search} onChange={e => setSearch(e.target.value)}
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
              <Typography variant="caption" sx={{ color: 'grey.500' }}>{cat.commands.length} commands</Typography>
            </Box>
            {cat.commands.map(cmd => {
              const isOpen = expanded.has(cmd.name);
              return (
                <Box key={cmd.name} sx={{ borderBottom: '1px solid #1a1a1a' }}>
                  <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', cursor: 'pointer', '&:hover': { bgcolor: '#1a1a1a' } }} onClick={() => toggle(cmd.name)}>
                    <Box sx={{ minWidth: 80 }}>
                      <Typography sx={{ fontFamily: 'monospace', fontWeight: 700, color: cat.color, fontSize: 14 }}>{cmd.name}</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: 'grey.400', flex: 1, fontSize: 13 }}>{cmd.desc}</Typography>
                    <Tooltip title="Copy syntax"><IconButton size="small" onClick={e => { e.stopPropagation(); copy(cmd.syntax); }} sx={{ color: 'grey.600' }}><ContentCopy sx={{ fontSize: 14 }} /></IconButton></Tooltip>
                    {isOpen ? <ExpandLess sx={{ color: 'grey.500' }} /> : <ExpandMore sx={{ color: 'grey.500' }} />}
                  </Box>
                  {isOpen && (
                    <Box sx={{ px: 2, pb: 2 }}>
                      <Box sx={{ mb: 1.5, p: 1, bgcolor: '#0a0a0a', borderRadius: 1, fontFamily: 'monospace', fontSize: 13, color: '#90caf9' }}>{cmd.syntax}</Box>
                      <Typography variant="caption" sx={{ color: 'grey.500', display: 'block', mb: 0.5, fontWeight: 600 }}>Common Flags:</Typography>
                      <Box sx={{ mb: 1.5, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {cmd.flags.map(f => (
                          <Tooltip key={f.flag} title={f.desc}>
                            <Chip label={f.flag} size="small" onClick={() => copy(f.flag)} sx={{ bgcolor: '#1a2332', color: '#90caf9', fontFamily: 'monospace', fontSize: 11, cursor: 'pointer', '&:hover': { bgcolor: '#243447' } }} />
                          </Tooltip>
                        ))}
                      </Box>
                      <Typography variant="caption" sx={{ color: 'grey.500', display: 'block', mb: 0.5, fontWeight: 600 }}>Examples:</Typography>
                      {cmd.examples.map((ex, i) => (
                        <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 0.5, p: 0.5, bgcolor: '#0a0a0a', borderRadius: 1, '&:hover': { bgcolor: '#141414' } }}>
                          <Typography sx={{ fontFamily: 'monospace', fontSize: 12, color: '#81c784', flex: 1 }}>$ {ex}</Typography>
                          <IconButton size="small" onClick={() => copy(ex)} sx={{ color: 'grey.600' }}><ContentCopy sx={{ fontSize: 12 }} /></IconButton>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              );
            })}
          </Paper>
        ))}

        {filtered.length === 0 && <Typography sx={{ textAlign: 'center', color: 'grey.500', mt: 4 }}>No commands match your search.</Typography>}
      </Box>
      <Snackbar open={!!snack} autoHideDuration={1500} onClose={() => setSnack('')} message={snack} />
    </Box>
  );
}
