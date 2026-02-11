import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Copy, Check, Eye, EyeOff } from 'lucide-react';

interface RedactionRule { id: string; label: string; pattern: RegExp; enabled: boolean; replacement: string; }

const defaultRules: RedactionRule[] = [
  { id: 'email', label: 'Email Addresses', pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, enabled: true, replacement: '[EMAIL]' },
  { id: 'phone', label: 'Phone Numbers', pattern: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, enabled: true, replacement: '[PHONE]' },
  { id: 'ssn', label: 'SSN', pattern: /\b\d{3}[-]?\d{2}[-]?\d{4}\b/g, enabled: true, replacement: '[SSN]' },
  { id: 'credit', label: 'Credit Card Numbers', pattern: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g, enabled: true, replacement: '[CARD]' },
  { id: 'ip', label: 'IP Addresses', pattern: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g, enabled: true, replacement: '[IP]' },
  { id: 'date', label: 'Dates', pattern: /\b(?:\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})\b/g, enabled: false, replacement: '[DATE]' },
  { id: 'url', label: 'URLs', pattern: /https?:\/\/[^\s<>"{}|\\^`[\]]+/g, enabled: false, replacement: '[URL]' },
  { id: 'name', label: 'Names (Capitalized Words)', pattern: /\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)+\b/g, enabled: false, replacement: '[NAME]' },
  { id: 'address', label: 'Street Addresses', pattern: /\b\d+\s[A-Z][a-z]+(?:\s[A-Z]?[a-z]+)*\s(?:St|Ave|Blvd|Dr|Rd|Ln|Way|Ct|Pl|Cir)\b\.?/gi, enabled: false, replacement: '[ADDRESS]' },
  { id: 'zip', label: 'ZIP Codes', pattern: /\b\d{5}(?:-\d{4})?\b/g, enabled: false, replacement: '[ZIP]' },
];

export default function App() {
  const [text, setText] = useState('Contact John Smith at john.smith@email.com or call 555-123-4567.\nHis SSN is 123-45-6789 and card number is 4111-1111-1111-1111.\nOffice: 123 Main St, connected via 192.168.1.1');
  const [rules, setRules] = useState(defaultRules);
  const [copied, setCopied] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);

  const toggleRule = (id: string) => setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));

  const { redacted, counts } = useMemo(() => {
    let result = text;
    const counts: Record<string, number> = {};
    rules.filter(r => r.enabled).forEach(rule => {
      const matches = result.match(new RegExp(rule.pattern.source, rule.pattern.flags));
      counts[rule.id] = matches ? matches.length : 0;
      result = result.replace(new RegExp(rule.pattern.source, rule.pattern.flags), rule.replacement);
    });
    return { redacted: result, counts };
  }, [text, rules]);

  const totalRedacted = Object.values(counts).reduce((s, c) => s + c, 0);

  const copy = async () => { await navigator.clipboard.writeText(redacted); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/" className="p-2 hover:bg-gray-800 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
          <div><h1 className="text-2xl font-bold flex items-center gap-2"><ShieldCheck className="w-6 h-6 text-red-400" /> Privacy Redactor</h1>
          <p className="text-gray-400 text-sm">Remove sensitive information from text</p></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Input Text</label>
              <textarea value={text} onChange={e => setText(e.target.value)} rows={8} className="w-full p-3 bg-gray-900 border border-gray-800 rounded-xl text-sm font-mono focus:outline-none resize-none" placeholder="Paste text containing sensitive data..." />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm text-gray-400">Redacted Output</label>
                <div className="flex gap-2">
                  <button onClick={() => setShowOriginal(!showOriginal)} className="flex items-center gap-1 px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs">
                    {showOriginal ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />} {showOriginal ? 'Show Redacted' : 'Show Original'}
                  </button>
                  <button onClick={copy} className="flex items-center gap-1 px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs">
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copy
                  </button>
                </div>
              </div>
              <div className="p-3 bg-gray-900 border border-gray-800 rounded-xl min-h-[200px]">
                <pre className="text-sm font-mono whitespace-pre-wrap">{showOriginal ? text : redacted.split(/(\[[A-Z]+\])/).map((part, i) =>
                  part.match(/^\[.+\]$/) ? <span key={i} className="px-1 py-0.5 bg-red-500/20 text-red-400 rounded text-xs font-bold">{part}</span> : part
                )}</pre>
              </div>
            </div>
            {totalRedacted > 0 && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                <p className="text-sm text-red-400"><ShieldCheck className="w-4 h-4 inline mr-1" /> {totalRedacted} sensitive item{totalRedacted !== 1 ? 's' : ''} redacted</p>
              </div>
            )}
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
              <h3 className="text-sm text-gray-400 mb-3">Redaction Rules</h3>
              <div className="space-y-2">{rules.map(rule => (
                <label key={rule.id} className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded-lg cursor-pointer">
                  <input type="checkbox" checked={rule.enabled} onChange={() => toggleRule(rule.id)} className="rounded" />
                  <div className="flex-1">
                    <span className="text-sm">{rule.label}</span>
                    {counts[rule.id] > 0 && <span className="ml-2 px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded text-[10px]">{counts[rule.id]}</span>}
                  </div>
                  <span className="text-[10px] font-mono text-gray-500">{rule.replacement}</span>
                </label>
              ))}</div>
            </div>
            <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
              <h3 className="text-sm text-gray-400 mb-2">Summary</h3>
              <div className="space-y-1 text-xs">
                {Object.entries(counts).filter(([_, c]) => c > 0).map(([id, count]) => (
                  <div key={id} className="flex justify-between text-gray-400">
                    <span>{rules.find(r => r.id === id)?.label}</span>
                    <span className="text-red-400 font-bold">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
