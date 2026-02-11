import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Download, ArrowRightLeft, FileSpreadsheet } from 'lucide-react';

export default function App() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [direction, setDirection] = useState<'json2csv' | 'csv2json'>('json2csv');
  const [delimiter, setDelimiter] = useState(',');
  const [hasHeader, setHasHeader] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string[][]>([]);

  const flatten = (obj: any, prefix = ''): Record<string, string> => {
    const result: Record<string, string> = {};
    for (const [k, v] of Object.entries(obj)) {
      const key = prefix ? `${prefix}.${k}` : k;
      if (v && typeof v === 'object' && !Array.isArray(v)) Object.assign(result, flatten(v, key));
      else result[key] = String(v ?? '');
    }
    return result;
  };

  const convert = () => {
    setError('');
    try {
      if (direction === 'json2csv') {
        const data = JSON.parse(input);
        const arr = Array.isArray(data) ? data : [data];
        const flatArr = arr.map(item => flatten(item));
        const headers = [...new Set(flatArr.flatMap(Object.keys))];
        const lines = [headers.join(delimiter)];
        flatArr.forEach(row => lines.push(headers.map(h => { const v = row[h] || ''; return v.includes(delimiter) || v.includes('"') || v.includes('\n') ? `"${v.replace(/"/g, '""')}"` : v; }).join(delimiter)));
        setOutput(lines.join('\n'));
        setPreview([headers, ...flatArr.map(row => headers.map(h => row[h] || ''))]);
      } else {
        const lines = input.trim().split('\n').map(l => l.split(delimiter).map(c => c.trim().replace(/^"|"$/g, '')));
        if (lines.length === 0) return;
        const headers = hasHeader ? lines[0] : lines[0].map((_, i) => `col${i + 1}`);
        const dataLines = hasHeader ? lines.slice(1) : lines;
        const result = dataLines.map(line => {
          const obj: Record<string, string> = {};
          headers.forEach((h, i) => { obj[h] = line[i] || ''; });
          return obj;
        });
        setOutput(JSON.stringify(result, null, 2));
        setPreview([headers, ...dataLines]);
      }
    } catch (e: any) { setError(e.message); }
  };

  const copy = async () => { await navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const download = () => {
    const ext = direction === 'json2csv' ? 'csv' : 'json';
    const blob = new Blob([output], { type: 'text/plain' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `output.${ext}`; a.click();
  };

  const delimiters = [{ label: 'Comma', value: ',' }, { label: 'Tab', value: '\t' }, { label: 'Semicolon', value: ';' }, { label: 'Pipe', value: '|' }];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/" className="p-2 hover:bg-gray-800 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
          <div><h1 className="text-2xl font-bold flex items-center gap-2"><FileSpreadsheet className="w-6 h-6 text-emerald-400" /> JSON/CSV Converter</h1></div>
        </div>
        <div className="flex flex-wrap gap-3 mb-4">
          <button onClick={() => setDirection(direction === 'json2csv' ? 'csv2json' : 'json2csv')} className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm"><ArrowRightLeft className="w-4 h-4" /> {direction === 'json2csv' ? 'JSON → CSV' : 'CSV → JSON'}</button>
          <div className="flex gap-1">{delimiters.map(d => <button key={d.label} onClick={() => setDelimiter(d.value)} className={`px-3 py-1.5 rounded-lg text-xs ${delimiter === d.value ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-800 text-gray-400'}`}>{d.label}</button>)}</div>
          {direction === 'csv2json' && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={hasHeader} onChange={e => setHasHeader(e.target.checked)} className="accent-emerald-500" /> Has Header</label>}
          <button onClick={convert} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm">Convert</button>
          <button onClick={copy} disabled={!output} className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 rounded-lg text-sm">{copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}</button>
          <button onClick={download} disabled={!output} className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 rounded-lg text-sm"><Download className="w-4 h-4" /></button>
        </div>
        {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400 mb-4">{error}</div>}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div><label className="block text-xs text-gray-500 mb-1">Input ({direction === 'json2csv' ? 'JSON' : 'CSV'})</label><textarea value={input} onChange={e => setInput(e.target.value)} rows={16} className="w-full p-4 bg-gray-900 border border-gray-800 rounded-xl font-mono text-sm text-gray-300 resize-none focus:outline-none" /></div>
          <div><label className="block text-xs text-gray-500 mb-1">Output ({direction === 'json2csv' ? 'CSV' : 'JSON'})</label><textarea value={output} readOnly rows={16} className="w-full p-4 bg-gray-900 border border-gray-800 rounded-xl font-mono text-sm text-green-300 resize-none" /></div>
        </div>
        {preview.length > 0 && (
          <div className="p-4 bg-gray-900 rounded-xl border border-gray-800 overflow-x-auto">
            <h3 className="text-sm text-gray-400 mb-2">Table Preview</h3>
            <table className="w-full text-sm"><thead><tr>{preview[0].map((h, i) => <th key={i} className="text-left p-2 border-b border-gray-700 text-emerald-400">{h}</th>)}</tr></thead>
            <tbody>{preview.slice(1, 11).map((row, i) => <tr key={i}>{row.map((c, j) => <td key={j} className="p-2 border-b border-gray-800 text-gray-300">{c}</td>)}</tr>)}</tbody></table>
          </div>
        )}
      </div>
    </div>
  );
}
