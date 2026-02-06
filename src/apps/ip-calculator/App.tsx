import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Network, Calculator } from 'lucide-react';

interface IPInfo {
  ip: string;
  cidr: number;
  netmask: string;
  wildcard: string;
  network: string;
  broadcast: string;
  firstHost: string;
  lastHost: string;
  totalHosts: number;
  usableHosts: number;
  ipClass: string;
  ipType: string;
  binary: string;
}

export default function IPCalculator() {
  const [input, setInput] = useState('192.168.1.0/24');
  const [ipInfo, setIpInfo] = useState<IPInfo | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const ipToLong = (ip: string): number => {
    const parts = ip.split('.').map(Number);
    return ((parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3]) >>> 0;
  };

  const longToIp = (long: number): string => {
    return [
      (long >>> 24) & 255,
      (long >>> 16) & 255,
      (long >>> 8) & 255,
      long & 255,
    ].join('.');
  };

  const ipToBinary = (ip: string): string => {
    return ip.split('.').map((octet) => parseInt(octet).toString(2).padStart(8, '0')).join('.');
  };

  const calculateCIDR = (cidr: number): { netmask: number; wildcard: number } => {
    const netmask = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
    const wildcard = ~netmask >>> 0;
    return { netmask, wildcard };
  };

  const getIPClass = (firstOctet: number): string => {
    if (firstOctet < 128) return 'A';
    if (firstOctet < 192) return 'B';
    if (firstOctet < 224) return 'C';
    if (firstOctet < 240) return 'D (Multicast)';
    return 'E (Reserved)';
  };

  const getIPType = (ip: string): string => {
    const parts = ip.split('.').map(Number);
    if (parts[0] === 10) return 'Private (RFC 1918)';
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return 'Private (RFC 1918)';
    if (parts[0] === 192 && parts[1] === 168) return 'Private (RFC 1918)';
    if (parts[0] === 127) return 'Loopback';
    if (parts[0] === 169 && parts[1] === 254) return 'Link-Local (APIPA)';
    if (parts[0] >= 224 && parts[0] <= 239) return 'Multicast';
    return 'Public';
  };

  const calculate = () => {
    setError('');
    setIpInfo(null);

    try {
      let ip: string;
      let cidr: number;

      if (input.includes('/')) {
        const parts = input.split('/');
        ip = parts[0];
        cidr = parseInt(parts[1], 10);
      } else {
        ip = input;
        cidr = 32;
      }

      // Validate IP
      const parts = ip.split('.');
      if (parts.length !== 4 || parts.some((p) => isNaN(Number(p)) || Number(p) < 0 || Number(p) > 255)) {
        throw new Error('Invalid IP address');
      }

      // Validate CIDR
      if (isNaN(cidr) || cidr < 0 || cidr > 32) {
        throw new Error('Invalid CIDR (must be 0-32)');
      }

      const ipLong = ipToLong(ip);
      const { netmask, wildcard } = calculateCIDR(cidr);
      const networkLong = (ipLong & netmask) >>> 0;
      const broadcastLong = (networkLong | wildcard) >>> 0;
      const totalHosts = Math.pow(2, 32 - cidr);
      const usableHosts = cidr >= 31 ? totalHosts : totalHosts - 2;

      setIpInfo({
        ip,
        cidr,
        netmask: longToIp(netmask),
        wildcard: longToIp(wildcard),
        network: longToIp(networkLong),
        broadcast: longToIp(broadcastLong),
        firstHost: cidr >= 31 ? longToIp(networkLong) : longToIp(networkLong + 1),
        lastHost: cidr >= 31 ? longToIp(broadcastLong) : longToIp(broadcastLong - 1),
        totalHosts,
        usableHosts,
        ipClass: getIPClass(parseInt(parts[0])),
        ipType: getIPType(ip),
        binary: ipToBinary(ip),
      });
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const copyValue = async (value: string, key: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const commonSubnets = [
    { cidr: '/8', hosts: '16,777,214', netmask: '255.0.0.0' },
    { cidr: '/16', hosts: '65,534', netmask: '255.255.0.0' },
    { cidr: '/24', hosts: '254', netmask: '255.255.255.0' },
    { cidr: '/25', hosts: '126', netmask: '255.255.255.128' },
    { cidr: '/26', hosts: '62', netmask: '255.255.255.192' },
    { cidr: '/27', hosts: '30', netmask: '255.255.255.224' },
    { cidr: '/28', hosts: '14', netmask: '255.255.255.240' },
    { cidr: '/29', hosts: '6', netmask: '255.255.255.248' },
    { cidr: '/30', hosts: '2', netmask: '255.255.255.252' },
    { cidr: '/32', hosts: '1', netmask: '255.255.255.255' },
  ];

  const InfoRow = ({ label, value, copyKey }: { label: string; value: string; copyKey?: string }) => (
    <div className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
      <span className="text-sm text-gray-400">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm text-cyan-400">{value}</span>
        {copyKey && (
          <button
            onClick={() => copyValue(value, copyKey)}
            className="p-1 hover:bg-gray-800 rounded transition-colors"
          >
            {copied === copyKey ? (
              <Check className="w-3 h-3 text-green-400" />
            ) : (
              <Copy className="w-3 h-3 text-gray-500" />
            )}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Network className="w-6 h-6 text-cyan-400" />
              IP/CIDR Calculator
            </h1>
            <p className="text-gray-400 text-sm">Calculate subnet information from IP addresses</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Input */}
            <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">
              <label className="text-sm font-medium text-gray-300 mb-3 block">
                IP Address / CIDR
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && calculate()}
                  placeholder="192.168.1.0/24"
                  className="flex-1 p-3 bg-gray-800 border border-gray-700 rounded-lg font-mono text-lg focus:outline-none focus:border-cyan-500/50"
                />
                <button
                  onClick={calculate}
                  className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Calculator className="w-5 h-5" />
                  Calculate
                </button>
              </div>
              {error && <p className="mt-3 text-red-400 text-sm">{error}</p>}
            </div>

            {/* Results */}
            {ipInfo && (
              <div className="space-y-4">
                <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">
                  <h3 className="text-sm font-medium text-gray-300 mb-4">Network Information</h3>
                  <InfoRow label="IP Address" value={ipInfo.ip} copyKey="ip" />
                  <InfoRow label="CIDR Notation" value={`/${ipInfo.cidr}`} />
                  <InfoRow label="Subnet Mask" value={ipInfo.netmask} copyKey="netmask" />
                  <InfoRow label="Wildcard Mask" value={ipInfo.wildcard} copyKey="wildcard" />
                  <InfoRow label="Network Address" value={ipInfo.network} copyKey="network" />
                  <InfoRow label="Broadcast Address" value={ipInfo.broadcast} copyKey="broadcast" />
                </div>

                <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">
                  <h3 className="text-sm font-medium text-gray-300 mb-4">Host Range</h3>
                  <InfoRow label="First Usable Host" value={ipInfo.firstHost} copyKey="first" />
                  <InfoRow label="Last Usable Host" value={ipInfo.lastHost} copyKey="last" />
                  <InfoRow label="Total Addresses" value={ipInfo.totalHosts.toLocaleString()} />
                  <InfoRow label="Usable Hosts" value={ipInfo.usableHosts.toLocaleString()} />
                </div>

                <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">
                  <h3 className="text-sm font-medium text-gray-300 mb-4">IP Classification</h3>
                  <InfoRow label="IP Class" value={ipInfo.ipClass} />
                  <InfoRow label="IP Type" value={ipInfo.ipType} />
                  <InfoRow label="Binary" value={ipInfo.binary} copyKey="binary" />
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Quick Examples</h3>
              <div className="space-y-2">
                {[
                  '192.168.1.0/24',
                  '10.0.0.0/8',
                  '172.16.0.0/12',
                  '192.168.0.100/28',
                  '8.8.8.8/32',
                ].map((example) => (
                  <button
                    key={example}
                    onClick={() => {
                      setInput(example);
                      setTimeout(calculate, 0);
                    }}
                    className="w-full text-left px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-mono transition-colors"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
              <h3 className="text-sm font-medium text-gray-300 mb-3">CIDR Reference</h3>
              <div className="space-y-1 text-xs">
                <div className="grid grid-cols-3 gap-2 pb-2 border-b border-gray-800 text-gray-500">
                  <span>CIDR</span>
                  <span>Hosts</span>
                  <span>Mask</span>
                </div>
                {commonSubnets.map((s) => (
                  <div
                    key={s.cidr}
                    className="grid grid-cols-3 gap-2 py-1 text-gray-400 hover:text-white cursor-pointer"
                    onClick={() => {
                      setInput(`192.168.1.0${s.cidr}`);
                      setTimeout(calculate, 0);
                    }}
                  >
                    <span className="text-cyan-400">{s.cidr}</span>
                    <span>{s.hosts}</span>
                    <span className="font-mono text-[10px]">{s.netmask}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Private IP Ranges</h3>
              <div className="space-y-2 text-xs text-gray-400">
                <p><span className="text-cyan-400">10.0.0.0/8</span> — Class A</p>
                <p><span className="text-cyan-400">172.16.0.0/12</span> — Class B</p>
                <p><span className="text-cyan-400">192.168.0.0/16</span> — Class C</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
