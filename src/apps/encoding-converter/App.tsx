import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Copy, Check, FileKey } from 'lucide-react';

export default function App() {
  const [input, setInput] = useState('Hello World!');
  const [copied, setCopied] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const copy = async (text: string, label: string) => { await navigator.clipboard.writeText(text); setCopied(label); setTimeout(() => setCopied(null), 2000); };

  const toHex = (s: string) => Array.from(new TextEncoder().encode(s)).map(b => b.toString(16).toUpperCase().padStart(2, '0')).join(' ');
  const toUrlEncoded = (s: string) => encodeURIComponent(s);
  const toBase64 = (s: string) => btoa(unescape(encodeURIComponent(s)));
  const toHtmlEntities = (s: string) => s.split('').map(c => `&#${c.charCodeAt(0)};`).join('');
  const toUnicode = (s: string) => s.split('').map(c => `U+${c.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}`).join(' ');
  const toBinary = (s: string) => Array.from(new TextEncoder().encode(s)).map(b => b.toString(2).padStart(8, '0')).join(' ');
  const toAscii = (s: string) => s.split('').map(c => c.charCodeAt(0)).join(' ');
  const toDecimal = (s: string) => s.split('').map(c => c.charCodeAt(0).toString()).join(' ');

  const encodings = [
    { label: 'UTF-8 Hex', value: toHex(input), color: 'text-cyan-400' },
    { label: 'URL Encoded', value: toUrlEncoded(input), color: 'text-green-400' },
    { label: 'Base64', value: toBase64(input), color: 'text-purple-400' },
    { label: 'HTML Entities', value: toHtmlEntities(input), color: 'text-orange-400' },
    { label: 'Unicode', value: toUnicode(input), color: 'text-blue-400' },
    { label: 'Binary', value: toBinary(input), color: 'text-yellow-400' },
    { label: 'ASCII Values', value: toAscii(input), color: 'text-pink-400' },
    { label: 'Decimal', value: toDecimal(input), color: 'text-red-400' },
  ];

  const charInfo = selected ? {
    char: selected, code: selected.charCodeAt(0), hex: selected.charCodeAt(0).toString(16).toUpperCase(),
    unicode: `U+${selected.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}`,
    binary: selected.charCodeAt(0).toString(2).padStart(8, '0'),
    html: `&#${selected.charCodeAt(0)};`, url: encodeURIComponent(selected),
  } : null;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 hover:bg-gray-800 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
          <div><h1 className="text-2xl font-bold flex items-center gap-2"><FileKey className="w-6 h-6 text-violet-400" /> Encoding Converter</h1>
          <p className="text-gray-400 text-sm">Convert between text encodings</p></div>
        </div>
        <div className="p-4 bg-gray-900 rounded-xl border border-gray-800 mb-6">
          <label className="block text-xs text-gray-500 mb-1">Input Text</label>
          <input value={input} onChange={e => setInput(e.target.value)} className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-lg font-mono focus:outline-none focus:border-violet-500" />
          <div className="flex flex-wrap gap-1 mt-3">
            <span className="text-xs text-gray-500 mr-2">Click character to inspect:</span>
            {input.split('').map((c, i) => (
              <button key={i} onClick={() => setSelected(c)} className={`px-2 py-1 rounded font-mono text-sm ${selected === c ? 'bg-violet-500/30 text-violet-400 border border-violet-500/50' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>{c === ' ' ? '⎵' : c}</button>
            ))}
          </div>
        </div>
        {charInfo && (
          <div className="p-4 bg-gray-900 rounded-xl border border-violet-500/30 mb-6">
            <h3 className="text-sm text-violet-400 mb-2">Character Inspector: <span className="text-2xl ml-2">{charInfo.char === ' ' ? '⎵ (space)' : charInfo.char}</span></h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div><span className="text-xs text-gray-500 block">Decimal</span><span className="font-mono">{charInfo.code}</span></div>
              <div><span className="text-xs text-gray-500 block">Hex</span><span className="font-mono">0x{charInfo.hex}</span></div>
              <div><span className="text-xs text-gray-500 block">Unicode</span><span className="font-mono">{charInfo.unicode}</span></div>
              <div><span className="text-xs text-gray-500 block">Binary</span><span className="font-mono">{charInfo.binary}</span></div>
              <div><span className="text-xs text-gray-500 block">HTML</span><span className="font-mono">{charInfo.html}</span></div>
              <div><span className="text-xs text-gray-500 block">URL</span><span className="font-mono">{charInfo.url}</span></div>
            </div>
          </div>
        )}
        <div className="space-y-3">
          {encodings.map(enc => (
            <div key={enc.label} className="p-4 bg-gray-900 rounded-xl border border-gray-800">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-400">{enc.label}</span>
                <button onClick={() => copy(enc.value, enc.label)} className="p-1 hover:bg-gray-800 rounded">{copied === enc.label ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-500" />}</button>
              </div>
              <p className={`font-mono text-sm break-all ${enc.color}`}>{enc.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
