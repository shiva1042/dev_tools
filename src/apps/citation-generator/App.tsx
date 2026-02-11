import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Copy, Check, BookOpen, Plus, Trash2 } from 'lucide-react';

type Format = 'APA' | 'MLA' | 'Chicago' | 'IEEE';
interface Citation { author: string; title: string; year: string; publisher: string; url: string; journal: string; volume: string; pages: string; doi: string; }

const empty: Citation = { author: '', title: '', year: '', publisher: '', url: '', journal: '', volume: '', pages: '', doi: '' };

function formatCitation(c: Citation, fmt: Format): string {
  const { author, title, year, publisher, url, journal, volume, pages, doi } = c;
  const a = author || 'Author'; const t = title || 'Title'; const y = year || 'Year';
  switch (fmt) {
    case 'APA': return `${a} (${y}). ${t}.${journal ? ` *${journal}*,` : ''}${volume ? ` *${volume}*,` : ''}${pages ? ` ${pages}.` : ''}${publisher ? ` ${publisher}.` : ''}${doi ? ` https://doi.org/${doi}` : url ? ` ${url}` : ''}`;
    case 'MLA': return `${a}. "${t}."${journal ? ` *${journal}*,` : ''}${volume ? ` vol. ${volume},` : ''}${pages ? ` pp. ${pages},` : ''} ${y}.${publisher ? ` ${publisher}.` : ''}${doi ? ` doi:${doi}.` : ''}`;
    case 'Chicago': return `${a}. "${t}."${journal ? ` *${journal}*` : ''}${volume ? ` ${volume}` : ''}${pages ? ` (${y}): ${pages}` : ` (${y})`}.${doi ? ` https://doi.org/${doi}.` : url ? ` ${url}.` : ''}`;
    case 'IEEE': return `${a}, "${t},"${journal ? ` *${journal}*,` : ''}${volume ? ` vol. ${volume},` : ''}${pages ? ` pp. ${pages},` : ''} ${y}.${doi ? ` doi: ${doi}.` : ''}`;
  }
}

export default function App() {
  const [citation, setCitation] = useState<Citation>({ ...empty });
  const [format, setFormat] = useState<Format>('APA');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<{ text: string; format: Format }[]>([]);

  const result = formatCitation(citation, format);
  const copy = async (text: string) => { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const generate = () => { if (citation.title) setHistory(prev => [{ text: result, format }, ...prev.slice(0, 19)]); };

  const fields: { key: keyof Citation; label: string; placeholder: string }[] = [
    { key: 'author', label: 'Author(s)', placeholder: 'Last, First M.' },
    { key: 'title', label: 'Title', placeholder: 'Work title' },
    { key: 'year', label: 'Year', placeholder: '2024' },
    { key: 'journal', label: 'Journal/Source', placeholder: 'Journal name (optional)' },
    { key: 'volume', label: 'Volume', placeholder: 'Vol. number (optional)' },
    { key: 'pages', label: 'Pages', placeholder: 'e.g. 1-15 (optional)' },
    { key: 'publisher', label: 'Publisher', placeholder: 'Publisher name (optional)' },
    { key: 'doi', label: 'DOI', placeholder: '10.xxxx/xxxxx (optional)' },
    { key: 'url', label: 'URL', placeholder: 'https://... (optional)' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 hover:bg-gray-800 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
          <div><h1 className="text-2xl font-bold flex items-center gap-2"><BookOpen className="w-6 h-6 text-amber-400" /> Citation Generator</h1>
          <p className="text-gray-400 text-sm">Generate APA, MLA, Chicago & IEEE citations</p></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">
              <div className="flex gap-2 mb-4">
                {(['APA', 'MLA', 'Chicago', 'IEEE'] as Format[]).map(f => (
                  <button key={f} onClick={() => setFormat(f)} className={`px-3 py-1.5 rounded-lg text-sm ${format === f ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>{f}</button>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {fields.map(f => (
                  <div key={f.key} className={f.key === 'title' || f.key === 'url' ? 'md:col-span-2' : ''}>
                    <label className="block text-xs text-gray-500 mb-1">{f.label}</label>
                    <input value={citation[f.key]} onChange={e => setCitation(prev => ({ ...prev, [f.key]: e.target.value }))} placeholder={f.placeholder} className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-amber-500" />
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Generated Citation ({format})</h3>
              <div className="p-4 bg-gray-800 rounded-lg text-sm leading-relaxed">{result}</div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => copy(result)} className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded-lg text-sm">{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copied ? 'Copied' : 'Copy'}</button>
                <button onClick={generate} className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm"><Plus className="w-4 h-4" /> Save to History</button>
                <button onClick={() => setCitation({ ...empty })} className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm"><Trash2 className="w-4 h-4" /> Clear</button>
              </div>
            </div>
          </div>
          <div>
            <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
              <h3 className="text-sm font-medium text-gray-300 mb-3">History ({history.length})</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {history.length === 0 ? <p className="text-xs text-gray-500 text-center py-4">No citations saved yet</p> :
                history.map((h, i) => (
                  <div key={i} className="p-3 bg-gray-800 rounded-lg group cursor-pointer hover:bg-gray-750" onClick={() => copy(h.text)}>
                    <span className="text-xs text-amber-400 mb-1 block">{h.format}</span>
                    <p className="text-xs text-gray-400 line-clamp-3">{h.text}</p>
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
