import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Wand2, Minimize2, FileCode } from 'lucide-react';

function formatXml(xml: string, indent: number): string {
  const tab = ' '.repeat(indent); let formatted = ''; let depth = 0;
  const lines = xml.replace(/>\s*</g, '>\n<').split('\n');
  for (const line of lines) {
    const t = line.trim(); if (!t) continue;
    if (t.startsWith('</')) depth--;
    formatted += tab.repeat(Math.max(0, depth)) + t + '\n';
    if (t.startsWith('<') && !t.startsWith('</') && !t.endsWith('/>') && !t.startsWith('<?') && !t.startsWith('<!')) depth++;
  }
  return formatted.trim();
}

function xmlToJson(xml: string): string {
  const parser = new DOMParser(); const doc = parser.parseFromString(xml, 'text/xml');
  const err = doc.querySelector('parsererror'); if (err) throw new Error(err.textContent || 'Parse error');
  const convert = (node: Element): any => {
    const obj: any = {}; if (node.attributes.length) { obj['@attributes'] = {}; for (const a of Array.from(node.attributes)) obj['@attributes'][a.name] = a.value; }
    for (const child of Array.from(node.children)) { const key = child.tagName; const val = child.children.length ? convert(child) : child.textContent;
      if (obj[key]) { if (!Array.isArray(obj[key])) obj[key] = [obj[key]]; obj[key].push(val); } else obj[key] = val; }
    if (!node.children.length && node.textContent) return node.textContent;
    return obj;
  };
  return JSON.stringify({ [doc.documentElement.tagName]: convert(doc.documentElement) }, null, 2);
}

export default function App() {
  const [input, setInput] = useState(`<?xml version="1.0"?>\n<root>\n<person><name>John</name><age>30</age></person>\n<person><name>Jane</name><age>25</age></person>\n</root>`);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [indent, setIndent] = useState(2);
  const [copied, setCopied] = useState(false);

  const format = () => { setError(''); try { setOutput(formatXml(input, indent)); } catch (e: any) { setError(e.message); } };
  const minify = () => { setOutput(input.replace(/>\s+</g, '><').replace(/\s+/g, ' ').trim()); };
  const toJson = () => { setError(''); try { setOutput(xmlToJson(input)); } catch (e: any) { setError(e.message); } };
  const validate = () => {
    const parser = new DOMParser(); const doc = parser.parseFromString(input, 'text/xml');
    const err = doc.querySelector('parsererror'); setError(err ? 'Invalid XML: ' + err.textContent : ''); if (!err) setOutput('XML is valid!');
  };
  const copy = async () => { await navigator.clipboard.writeText(output || input); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/" className="p-2 hover:bg-gray-800 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
          <div><h1 className="text-2xl font-bold flex items-center gap-2"><FileCode className="w-6 h-6 text-amber-400" /> XML Formatter</h1></div>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          <button onClick={format} className="flex items-center gap-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 rounded-lg text-sm"><Wand2 className="w-4 h-4" /> Format</button>
          <button onClick={minify} className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm"><Minimize2 className="w-4 h-4" /> Minify</button>
          <button onClick={validate} className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm">Validate</button>
          <button onClick={toJson} className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm">To JSON</button>
          <button onClick={copy} className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm">{copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}</button>
          <div className="flex items-center gap-2 text-sm text-gray-400 ml-2">Indent: {[2,4].map(i => <button key={i} onClick={() => setIndent(i)} className={`px-2 py-0.5 rounded text-xs ${indent === i ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-800'}`}>{i}</button>)}</div>
        </div>
        {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400 mb-4">{error}</div>}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div><label className="block text-xs text-gray-500 mb-1">Input XML</label><textarea value={input} onChange={e => setInput(e.target.value)} rows={20} className="w-full p-4 bg-gray-900 border border-gray-800 rounded-xl font-mono text-sm text-orange-300 resize-none focus:outline-none" /></div>
          <div><label className="block text-xs text-gray-500 mb-1">Output</label><textarea value={output} readOnly rows={20} className="w-full p-4 bg-gray-900 border border-gray-800 rounded-xl font-mono text-sm text-green-300 resize-none" /></div>
        </div>
      </div>
    </div>
  );
}
