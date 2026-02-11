import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Upload, Table2, ArrowUpDown, Search, Download } from 'lucide-react';

export default function App() {
  const [data, setData] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [delimiter, setDelimiter] = useState(',');
  const [hasHeaders, setHasHeaders] = useState(true);
  const [sortCol, setSortCol] = useState<number | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [search, setSearch] = useState('');
  const [rawInput, setRawInput] = useState('');

  const parse = (text: string) => {
    const lines = text.trim().split('\n').map(l => l.split(delimiter).map(c => c.trim().replace(/^"|"$/g, '')));
    if (lines.length === 0) return;
    if (hasHeaders) { setHeaders(lines[0]); setData(lines.slice(1)); }
    else { setHeaders(lines[0].map((_, i) => `Col ${i + 1}`)); setData(lines); }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { const t = ev.target?.result as string; setRawInput(t); parse(t); };
    reader.readAsText(file);
  };

  const handlePaste = () => { if (rawInput.trim()) parse(rawInput); };

  const sorted = [...data].sort((a, b) => {
    if (sortCol === null) return 0;
    const av = a[sortCol] || '', bv = b[sortCol] || '';
    const an = parseFloat(av), bn = parseFloat(bv);
    if (!isNaN(an) && !isNaN(bn)) return sortAsc ? an - bn : bn - an;
    return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
  });

  const filtered = search ? sorted.filter(row => row.some(c => c.toLowerCase().includes(search.toLowerCase()))) : sorted;

  const toggleSort = (i: number) => { if (sortCol === i) setSortAsc(!sortAsc); else { setSortCol(i); setSortAsc(true); } };

  const downloadCSV = () => {
    const csv = [headers.join(delimiter), ...data.map(r => r.join(delimiter))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'data.csv'; a.click();
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/" className="p-2 hover:bg-gray-800 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
          <div><h1 className="text-2xl font-bold flex items-center gap-2"><Table2 className="w-6 h-6 text-emerald-400" /> CSV Viewer</h1>
          <p className="text-gray-400 text-sm">View, sort, and filter CSV data</p></div>
        </div>
        {data.length === 0 ? (
          <div className="space-y-4">
            <div className="flex gap-4 items-end">
              <div><label className="block text-sm text-gray-400 mb-1">Delimiter</label>
                <select value={delimiter} onChange={e => setDelimiter(e.target.value)} className="p-2 bg-gray-800 border border-gray-700 rounded-lg text-sm">
                  <option value=",">,</option><option value="	">Tab</option><option value=";">;</option><option value="|">|</option>
                </select></div>
              <label className="flex items-center gap-2 text-sm text-gray-400"><input type="checkbox" checked={hasHeaders} onChange={e => setHasHeaders(e.target.checked)} /> First row is headers</label>
            </div>
            <div className="p-8 bg-gray-900 rounded-xl border border-gray-800 border-dashed text-center">
              <Upload className="w-10 h-10 mx-auto mb-3 text-gray-500" />
              <label className="cursor-pointer text-emerald-400 hover:text-emerald-300 text-sm">
                <input type="file" accept=".csv,.tsv,.txt" onChange={handleFile} className="hidden" /> Upload CSV file
              </label>
              <p className="text-gray-500 text-xs mt-2">or paste data below</p>
            </div>
            <textarea value={rawInput} onChange={e => setRawInput(e.target.value)} placeholder="Paste CSV data here..." rows={8} className="w-full p-3 bg-gray-900 border border-gray-800 rounded-xl text-sm font-mono focus:outline-none" />
            <button onClick={handlePaste} disabled={!rawInput.trim()} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg text-sm">Parse Data</button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1"><Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="w-full pl-10 p-2 bg-gray-900 border border-gray-800 rounded-lg text-sm focus:outline-none" /></div>
              <span className="text-sm text-gray-400">{filtered.length} rows</span>
              <button onClick={downloadCSV} className="flex items-center gap-1 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm"><Download className="w-4 h-4" /> Export</button>
              <button onClick={() => { setData([]); setHeaders([]); setRawInput(''); }} className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm">Clear</button>
            </div>
            <div className="overflow-x-auto rounded-xl border border-gray-800">
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-900">{headers.map((h, i) => (
                  <th key={i} className="px-4 py-2 text-left font-medium text-gray-400 cursor-pointer hover:text-white" onClick={() => toggleSort(i)}>
                    <span className="flex items-center gap-1">{h} <ArrowUpDown className="w-3 h-3" /></span></th>
                ))}</tr></thead>
                <tbody>{filtered.slice(0, 500).map((row, ri) => (
                  <tr key={ri} className="border-t border-gray-800 hover:bg-gray-900/50">{row.map((cell, ci) => (
                    <td key={ci} className="px-4 py-2 text-gray-300 max-w-xs truncate">{cell}</td>
                  ))}</tr>
                ))}</tbody>
              </table>
            </div>
            {filtered.length > 500 && <p className="text-xs text-gray-500 mt-2 text-center">Showing first 500 of {filtered.length} rows</p>}
          </>
        )}
      </div>
    </div>
  );
}
