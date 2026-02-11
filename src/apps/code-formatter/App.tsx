import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Wand2, Minimize2, FileCode } from 'lucide-react';

type Lang = 'json' | 'html' | 'css' | 'sql' | 'xml' | 'javascript';

function formatJSON(s: string, indent: number) { return JSON.stringify(JSON.parse(s), null, indent); }

function formatHTML(s: string, indent: number) {
  const tab = ' '.repeat(indent); let depth = 0; let result = '';
  const tokens = s.replace(/>\s*</g, '>\n<').split('\n');
  for (const token of tokens) {
    const t = token.trim(); if (!t) continue;
    if (t.startsWith('</')) depth--;
    result += tab.repeat(Math.max(0, depth)) + t + '\n';
    if (t.startsWith('<') && !t.startsWith('</') && !t.endsWith('/>') && !t.startsWith('<!') && !t.startsWith('<input') && !t.startsWith('<br') && !t.startsWith('<hr') && !t.startsWith('<img') && !t.startsWith('<meta') && !t.startsWith('<link')) depth++;
  }
  return result.trim();
}

function formatSQL(s: string) {
  const kw = ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'ORDER BY', 'GROUP BY', 'HAVING', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'ON', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE TABLE', 'ALTER TABLE', 'DROP', 'LIMIT', 'OFFSET', 'UNION', 'AS'];
  let result = s;
  kw.forEach(k => { const regex = new RegExp(`\\b${k}\\b`, 'gi'); result = result.replace(regex, '\n' + k.toUpperCase()); });
  return result.trim().replace(/\n\n+/g, '\n');
}

function formatCSS(s: string, indent: number) {
  const tab = ' '.repeat(indent);
  return s.replace(/\{/g, ' {\n' + tab).replace(/;/g, ';\n' + tab).replace(/\}/g, '\n}\n').replace(new RegExp(tab + '\n}', 'g'), '}').replace(/\n\n+/g, '\n').trim();
}

function minify(s: string) { return s.replace(/\s+/g, ' ').replace(/\s*([{}:;,>+~])\s*/g, '$1').trim(); }

export default function App() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [lang, setLang] = useState<Lang>('json');
  const [indent, setIndent] = useState(2);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const format = () => {
    setError('');
    try {
      switch (lang) {
        case 'json': setOutput(formatJSON(input, indent)); break;
        case 'html': case 'xml': setOutput(formatHTML(input, indent)); break;
        case 'sql': setOutput(formatSQL(input)); break;
        case 'css': setOutput(formatCSS(input, indent)); break;
        case 'javascript': setOutput(formatJSON(input, indent)); break;
        default: setOutput(input);
      }
    } catch (e) { setError(e instanceof Error ? e.message : 'Format error'); setOutput(input); }
  };

  const doMinify = () => { setOutput(minify(input)); setError(''); };
  const copy = async () => { await navigator.clipboard.writeText(output || input); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/" className="p-2 hover:bg-gray-800 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
          <div><h1 className="text-2xl font-bold flex items-center gap-2"><FileCode className="w-6 h-6 text-blue-400" /> Code Formatter</h1>
          <p className="text-gray-400 text-sm">Format & beautify code</p></div>
        </div>
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex gap-1">
            {(['json', 'html', 'css', 'sql', 'xml'] as Lang[]).map(l => <button key={l} onClick={() => setLang(l)} className={`px-3 py-1.5 rounded-lg text-sm uppercase ${lang === l ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-800 text-gray-400'}`}>{l}</button>)}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400"><span>Indent:</span>
            {[2, 4].map(i => <button key={i} onClick={() => setIndent(i)} className={`px-2 py-1 rounded text-xs ${indent === i ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-800 text-gray-400'}`}>{i}</button>)}
          </div>
          <div className="flex-1" />
          <button onClick={format} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm"><Wand2 className="w-4 h-4" /> Format</button>
          <button onClick={doMinify} className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm"><Minimize2 className="w-4 h-4" /> Minify</button>
          <button onClick={copy} className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm">{copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}</button>
        </div>
        {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400 mb-4">{error}</div>}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div><label className="block text-xs text-gray-500 mb-1">Input</label><textarea value={input} onChange={e => setInput(e.target.value)} rows={20} className="w-full p-4 bg-gray-900 border border-gray-800 rounded-xl font-mono text-sm text-gray-300 resize-none focus:outline-none focus:border-blue-500" placeholder="Paste code here..." /></div>
          <div><label className="block text-xs text-gray-500 mb-1">Output</label><textarea value={output} readOnly rows={20} className="w-full p-4 bg-gray-900 border border-gray-800 rounded-xl font-mono text-sm text-green-300 resize-none" /></div>
        </div>
      </div>
    </div>
  );
}
