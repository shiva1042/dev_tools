import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, Network, Copy } from 'lucide-react';

const ports = [
  { port: 20, service: 'FTP Data', protocol: 'TCP', cat: 'File Transfer' },
  { port: 21, service: 'FTP Control', protocol: 'TCP', cat: 'File Transfer' },
  { port: 22, service: 'SSH', protocol: 'TCP', cat: 'Remote Access' },
  { port: 23, service: 'Telnet', protocol: 'TCP', cat: 'Remote Access' },
  { port: 25, service: 'SMTP', protocol: 'TCP', cat: 'Email' },
  { port: 53, service: 'DNS', protocol: 'TCP/UDP', cat: 'Web' },
  { port: 67, service: 'DHCP Server', protocol: 'UDP', cat: 'Network' },
  { port: 68, service: 'DHCP Client', protocol: 'UDP', cat: 'Network' },
  { port: 69, service: 'TFTP', protocol: 'UDP', cat: 'File Transfer' },
  { port: 80, service: 'HTTP', protocol: 'TCP', cat: 'Web' },
  { port: 110, service: 'POP3', protocol: 'TCP', cat: 'Email' },
  { port: 123, service: 'NTP', protocol: 'UDP', cat: 'Network' },
  { port: 143, service: 'IMAP', protocol: 'TCP', cat: 'Email' },
  { port: 161, service: 'SNMP', protocol: 'UDP', cat: 'Network' },
  { port: 389, service: 'LDAP', protocol: 'TCP', cat: 'Network' },
  { port: 443, service: 'HTTPS', protocol: 'TCP', cat: 'Web' },
  { port: 465, service: 'SMTPS', protocol: 'TCP', cat: 'Email' },
  { port: 514, service: 'Syslog', protocol: 'UDP', cat: 'Network' },
  { port: 587, service: 'SMTP Submission', protocol: 'TCP', cat: 'Email' },
  { port: 636, service: 'LDAPS', protocol: 'TCP', cat: 'Network' },
  { port: 993, service: 'IMAPS', protocol: 'TCP', cat: 'Email' },
  { port: 995, service: 'POP3S', protocol: 'TCP', cat: 'Email' },
  { port: 1433, service: 'MS SQL Server', protocol: 'TCP', cat: 'Database' },
  { port: 1521, service: 'Oracle DB', protocol: 'TCP', cat: 'Database' },
  { port: 2181, service: 'ZooKeeper', protocol: 'TCP', cat: 'Messaging' },
  { port: 3000, service: 'Dev Server (Node)', protocol: 'TCP', cat: 'Web' },
  { port: 3306, service: 'MySQL/MariaDB', protocol: 'TCP', cat: 'Database' },
  { port: 3389, service: 'RDP', protocol: 'TCP', cat: 'Remote Access' },
  { port: 5432, service: 'PostgreSQL', protocol: 'TCP', cat: 'Database' },
  { port: 5672, service: 'RabbitMQ', protocol: 'TCP', cat: 'Messaging' },
  { port: 5900, service: 'VNC', protocol: 'TCP', cat: 'Remote Access' },
  { port: 6379, service: 'Redis', protocol: 'TCP', cat: 'Database' },
  { port: 6443, service: 'Kubernetes API', protocol: 'TCP', cat: 'Web' },
  { port: 8080, service: 'HTTP Alt', protocol: 'TCP', cat: 'Web' },
  { port: 8443, service: 'HTTPS Alt', protocol: 'TCP', cat: 'Web' },
  { port: 9090, service: 'Prometheus', protocol: 'TCP', cat: 'Monitoring' },
  { port: 9092, service: 'Apache Kafka', protocol: 'TCP', cat: 'Messaging' },
  { port: 9200, service: 'Elasticsearch', protocol: 'TCP', cat: 'Database' },
  { port: 9300, service: 'Elasticsearch Nodes', protocol: 'TCP', cat: 'Database' },
  { port: 11211, service: 'Memcached', protocol: 'TCP', cat: 'Database' },
  { port: 15672, service: 'RabbitMQ Mgmt', protocol: 'TCP', cat: 'Messaging' },
  { port: 27017, service: 'MongoDB', protocol: 'TCP', cat: 'Database' },
];

const catColors: Record<string, string> = { Web: 'bg-blue-500/20 text-blue-400', Database: 'bg-green-500/20 text-green-400', Email: 'bg-purple-500/20 text-purple-400', 'File Transfer': 'bg-orange-500/20 text-orange-400', 'Remote Access': 'bg-red-500/20 text-red-400', Network: 'bg-cyan-500/20 text-cyan-400', Messaging: 'bg-yellow-500/20 text-yellow-400', Monitoring: 'bg-pink-500/20 text-pink-400' };

export default function App() {
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');

  const cats = [...new Set(ports.map(p => p.cat))];
  const filtered = ports.filter(p => {
    if (filterCat && p.cat !== filterCat) return false;
    if (search && !String(p.port).includes(search) && !p.service.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 hover:bg-gray-800 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
          <div><h1 className="text-2xl font-bold flex items-center gap-2"><Network className="w-6 h-6 text-cyan-400" /> Network Port Reference</h1>
          <p className="text-gray-400 text-sm">{ports.length} common ports</p></div>
        </div>
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search port or service..." className="w-full pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-cyan-500" /></div>
        </div>
        <div className="flex flex-wrap gap-1 mb-6">
          <button onClick={() => setFilterCat('')} className={`px-2 py-1 rounded text-xs ${!filterCat ? 'bg-cyan-500/20 text-cyan-400' : 'bg-gray-800 text-gray-400'}`}>All</button>
          {cats.map(c => <button key={c} onClick={() => setFilterCat(c === filterCat ? '' : c)} className={`px-2 py-1 rounded text-xs ${filterCat === c ? 'bg-cyan-500/20 text-cyan-400' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>{c}</button>)}
        </div>
        <div className="space-y-2">
          {filtered.map(p => (
            <div key={p.port} className="flex items-center gap-3 p-3 bg-gray-900 rounded-xl border border-gray-800 cursor-pointer hover:bg-gray-800/80" onClick={() => navigator.clipboard.writeText(String(p.port))}>
              <span className="text-lg font-mono font-bold text-cyan-400 w-16">{p.port}</span>
              <div className="flex-1"><span className="text-sm font-medium">{p.service}</span></div>
              <span className="px-2 py-0.5 bg-gray-800 rounded text-xs text-gray-400">{p.protocol}</span>
              <span className={`px-2 py-0.5 rounded text-xs ${catColors[p.cat] || 'bg-gray-800 text-gray-400'}`}>{p.cat}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
