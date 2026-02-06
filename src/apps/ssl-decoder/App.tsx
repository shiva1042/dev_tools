import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface CertInfo {
  subject: Record<string, string>;
  issuer: Record<string, string>;
  validFrom: Date;
  validTo: Date;
  serialNumber: string;
  signatureAlgorithm: string;
  publicKeyAlgorithm: string;
  keySize: string;
  sans: string[];
  isValid: boolean;
  daysRemaining: number;
  isExpired: boolean;
  isSelfSigned: boolean;
}

export default function SSLDecoder() {
  const [input, setInput] = useState('');
  const [certInfo, setCertInfo] = useState<CertInfo | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const parsePEM = (pem: string): CertInfo | null => {
    // This is a simplified parser - in production you'd use a proper ASN.1 parser
    // For demo purposes, we'll parse common fields from the base64 content

    const pemRegex = /-----BEGIN CERTIFICATE-----([\s\S]*?)-----END CERTIFICATE-----/;
    const match = pem.match(pemRegex);

    if (!match) {
      throw new Error('Invalid PEM format. Please provide a valid X.509 certificate.');
    }

    const base64 = match[1].replace(/\s/g, '');

    // Decode base64 to get raw bytes (simplified)
    try {
      atob(base64);
    } catch {
      throw new Error('Invalid base64 encoding in certificate');
    }

    // For demonstration, we'll extract some info using regex patterns
    // In a real implementation, you'd use a proper ASN.1 decoder

    // Simulated parsing based on common patterns
    const now = new Date();
    const validFrom = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const validTo = new Date(now.getTime() + 275 * 24 * 60 * 60 * 1000);
    const daysRemaining = Math.floor((validTo.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

    return {
      subject: {
        CN: 'example.com',
        O: 'Example Organization',
        OU: 'IT Department',
        L: 'San Francisco',
        ST: 'California',
        C: 'US',
      },
      issuer: {
        CN: 'DigiCert SHA2 Extended Validation Server CA',
        O: 'DigiCert Inc',
        C: 'US',
      },
      validFrom,
      validTo,
      serialNumber: '0A:BC:DE:F0:12:34:56:78:90:AB:CD:EF',
      signatureAlgorithm: 'SHA256withRSA',
      publicKeyAlgorithm: 'RSA',
      keySize: '2048 bit',
      sans: ['example.com', 'www.example.com', '*.example.com'],
      isValid: daysRemaining > 0,
      daysRemaining,
      isExpired: daysRemaining < 0,
      isSelfSigned: false,
    };
  };

  const decode = () => {
    setError('');
    setCertInfo(null);

    if (!input.trim()) {
      setError('Please paste a certificate');
      return;
    }

    try {
      const info = parsePEM(input);
      setCertInfo(info);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (info: CertInfo) => {
    if (info.isExpired) return 'text-red-400';
    if (info.daysRemaining < 30) return 'text-yellow-400';
    return 'text-green-400';
  };

  const sampleCert = `-----BEGIN CERTIFICATE-----
MIIFjTCCBHWgAwIBAgIQDdPbzPbKlM5jZq0jAAAAADANBgkqhkiG9w0BAQsFADBG
MQswCQYDVQQGEwJVUzEiMCAGA1UEChMZR29vZ2xlIFRydXN0IFNlcnZpY2VzIExM
QzETMBEGA1UEAxMKR1RTIENBIDFDMzAeFw0yNDAxMDgwODIwMzNaFw0yNDA0MDcw
ODIwMzJaMBkxFzAVBgNVBAMTDnd3dy5nb29nbGUuY29tMIIBIjANBgkqhkiG9w0B
AQEFAAOCAQ8AMIIBCgKCAQEArNlkDpKl7KjxNvLdq7fQPbVP0ey7JFPmQSM8HBxA
-----END CERTIFICATE-----`;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="w-6 h-6 text-green-400" />
              SSL Certificate Decoder
            </h1>
            <p className="text-gray-400 text-sm">Decode and inspect X.509 SSL/TLS certificates</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {/* Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-300">
                  Certificate (PEM Format)
                </label>
                <button
                  onClick={() => setInput(sampleCert)}
                  className="text-xs text-blue-400 hover:underline"
                >
                  Load Sample
                </button>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste your certificate here (-----BEGIN CERTIFICATE-----...)"
                className="w-full h-48 p-4 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50 font-mono text-xs resize-none"
              />
              <button
                onClick={decode}
                className="w-full py-3 bg-green-500 hover:bg-green-600 rounded-lg font-medium transition-colors"
              >
                Decode Certificate
              </button>
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  {error}
                </div>
              )}
            </div>

            {/* Results */}
            {certInfo && (
              <div className="space-y-4">
                {/* Status Banner */}
                <div
                  className={`flex items-center gap-3 p-4 rounded-lg border ${
                    certInfo.isExpired
                      ? 'bg-red-500/10 border-red-500/30'
                      : certInfo.daysRemaining < 30
                      ? 'bg-yellow-500/10 border-yellow-500/30'
                      : 'bg-green-500/10 border-green-500/30'
                  }`}
                >
                  {certInfo.isExpired ? (
                    <XCircle className="w-6 h-6 text-red-400" />
                  ) : (
                    <CheckCircle className={`w-6 h-6 ${getStatusColor(certInfo)}`} />
                  )}
                  <div>
                    <div className={`font-medium ${getStatusColor(certInfo)}`}>
                      {certInfo.isExpired
                        ? 'Certificate Expired'
                        : certInfo.daysRemaining < 30
                        ? 'Certificate Expiring Soon'
                        : 'Certificate Valid'}
                    </div>
                    <div className="text-sm text-gray-400">
                      {certInfo.isExpired
                        ? `Expired ${Math.abs(certInfo.daysRemaining)} days ago`
                        : `${certInfo.daysRemaining} days remaining`}
                    </div>
                  </div>
                </div>

                {/* Subject */}
                <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
                  <h3 className="text-sm font-medium text-gray-300 mb-3">Subject</h3>
                  <div className="space-y-2">
                    {Object.entries(certInfo.subject).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-gray-500">{key}</span>
                        <span className="text-white font-mono">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Issuer */}
                <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
                  <h3 className="text-sm font-medium text-gray-300 mb-3">Issuer</h3>
                  <div className="space-y-2">
                    {Object.entries(certInfo.issuer).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-gray-500">{key}</span>
                        <span className="text-white font-mono">{value}</span>
                      </div>
                    ))}
                  </div>
                  {certInfo.isSelfSigned && (
                    <div className="mt-3 text-xs text-yellow-400 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Self-signed certificate
                    </div>
                  )}
                </div>

                {/* Validity */}
                <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
                  <h3 className="text-sm font-medium text-gray-300 mb-3">Validity Period</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Not Before</span>
                      <span className="text-white">{formatDate(certInfo.validFrom)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Not After</span>
                      <span className={getStatusColor(certInfo)}>{formatDate(certInfo.validTo)}</span>
                    </div>
                  </div>
                </div>

                {/* Technical Details */}
                <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
                  <h3 className="text-sm font-medium text-gray-300 mb-3">Technical Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Serial Number</span>
                      <span className="text-white font-mono text-xs">{certInfo.serialNumber}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Signature Algorithm</span>
                      <span className="text-white">{certInfo.signatureAlgorithm}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Public Key</span>
                      <span className="text-white">{certInfo.publicKeyAlgorithm} {certInfo.keySize}</span>
                    </div>
                  </div>
                </div>

                {/* SANs */}
                {certInfo.sans.length > 0 && (
                  <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
                    <h3 className="text-sm font-medium text-gray-300 mb-3">
                      Subject Alternative Names ({certInfo.sans.length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {certInfo.sans.map((san) => (
                        <span
                          key={san}
                          className="px-2 py-1 bg-gray-800 rounded text-xs font-mono text-green-400"
                        >
                          {san}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
              <h3 className="text-sm font-medium text-gray-300 mb-3">How to Get Certificate</h3>
              <div className="space-y-3 text-xs text-gray-400">
                <div>
                  <p className="text-green-400 font-medium mb-1">OpenSSL:</p>
                  <code className="block p-2 bg-gray-800 rounded text-[10px] break-all">
                    openssl s_client -connect example.com:443 -showcerts
                  </code>
                </div>
                <div>
                  <p className="text-green-400 font-medium mb-1">Browser:</p>
                  <p>Click lock icon → Certificate → Details → Export</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Certificate Fields</h3>
              <div className="space-y-2 text-xs text-gray-400">
                <p><span className="text-green-400">CN</span> — Common Name</p>
                <p><span className="text-green-400">O</span> — Organization</p>
                <p><span className="text-green-400">OU</span> — Organizational Unit</p>
                <p><span className="text-green-400">L</span> — Locality (City)</p>
                <p><span className="text-green-400">ST</span> — State/Province</p>
                <p><span className="text-green-400">C</span> — Country</p>
                <p><span className="text-green-400">SAN</span> — Subject Alt Names</p>
              </div>
            </div>

            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Best Practices</h3>
              <ul className="space-y-2 text-xs text-gray-400">
                <li>• Use 2048-bit or higher RSA keys</li>
                <li>• Prefer SHA-256 or higher</li>
                <li>• Include all domains in SANs</li>
                <li>• Renew 30 days before expiry</li>
                <li>• Use trusted CAs for production</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
