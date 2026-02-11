import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Search } from 'lucide-react';

const complexities = [
  { name: 'O(1)', label: 'Constant', color: 'bg-green-500', textColor: 'text-green-400', factor: 1 },
  { name: 'O(log n)', label: 'Logarithmic', color: 'bg-green-400', textColor: 'text-green-300', factor: 3 },
  { name: 'O(n)', label: 'Linear', color: 'bg-yellow-500', textColor: 'text-yellow-400', factor: 10 },
  { name: 'O(n log n)', label: 'Linearithmic', color: 'bg-orange-500', textColor: 'text-orange-400', factor: 30 },
  { name: 'O(n²)', label: 'Quadratic', color: 'bg-red-500', textColor: 'text-red-400', factor: 60 },
  { name: 'O(2ⁿ)', label: 'Exponential', color: 'bg-red-700', textColor: 'text-red-500', factor: 90 },
  { name: 'O(n!)', label: 'Factorial', color: 'bg-red-900', textColor: 'text-red-600', factor: 100 },
];

const dsOps = [
  { name: 'Array', access: 'O(1)', search: 'O(n)', insert: 'O(n)', delete: 'O(n)', space: 'O(n)' },
  { name: 'Linked List', access: 'O(n)', search: 'O(n)', insert: 'O(1)', delete: 'O(1)', space: 'O(n)' },
  { name: 'Hash Table', access: 'N/A', search: 'O(1)*', insert: 'O(1)*', delete: 'O(1)*', space: 'O(n)' },
  { name: 'BST', access: 'O(log n)', search: 'O(log n)', insert: 'O(log n)', delete: 'O(log n)', space: 'O(n)' },
  { name: 'Heap', access: 'O(n)', search: 'O(n)', insert: 'O(log n)', delete: 'O(log n)', space: 'O(n)' },
  { name: 'Stack', access: 'O(n)', search: 'O(n)', insert: 'O(1)', delete: 'O(1)', space: 'O(n)' },
  { name: 'Queue', access: 'O(n)', search: 'O(n)', insert: 'O(1)', delete: 'O(1)', space: 'O(n)' },
];

const sortAlgos = [
  { name: 'Bubble Sort', best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)', stable: true },
  { name: 'Selection Sort', best: 'O(n²)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)', stable: false },
  { name: 'Insertion Sort', best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)', stable: true },
  { name: 'Merge Sort', best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)', stable: true },
  { name: 'Quick Sort', best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n²)', space: 'O(log n)', stable: false },
  { name: 'Heap Sort', best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)', space: 'O(1)', stable: false },
  { name: 'Tim Sort', best: 'O(n)', avg: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)', stable: true },
  { name: 'Radix Sort', best: 'O(nk)', avg: 'O(nk)', worst: 'O(nk)', space: 'O(n+k)', stable: true },
];

const getColor = (c: string) => {
  if (c.includes('1)') || c === 'O(1)') return 'text-green-400 bg-green-500/10';
  if (c.includes('log')) return 'text-green-300 bg-green-400/10';
  if (c === 'O(n)' || c === 'O(nk)') return 'text-yellow-400 bg-yellow-500/10';
  if (c.includes('n log')) return 'text-orange-400 bg-orange-500/10';
  if (c.includes('n²') || c.includes('n^2')) return 'text-red-400 bg-red-500/10';
  return 'text-gray-400 bg-gray-500/10';
};

export default function App() {
  const [search, setSearch] = useState('');

  const filtered = <T extends { name: string }>(items: T[]): T[] => items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 hover:bg-gray-800 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
          <div><h1 className="text-2xl font-bold flex items-center gap-2"><TrendingUp className="w-6 h-6 text-rose-400" /> Big-O Cheat Sheet</h1>
          <p className="text-gray-400 text-sm">Time & space complexity reference</p></div>
          <div className="flex-1" />
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-rose-500 w-48" /></div>
        </div>

        <div className="p-4 bg-gray-900 rounded-xl border border-gray-800 mb-6">
          <h3 className="text-sm text-gray-400 mb-3">Complexity Comparison</h3>
          <div className="flex items-end gap-2 h-32">
            {complexities.map(c => (
              <div key={c.name} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-gray-500">{c.name}</span>
                <div className={`w-full rounded-t ${c.color} transition-all`} style={{ height: `${c.factor}%` }} />
                <span className={`text-xs ${c.textColor}`}>{c.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 bg-gray-900 rounded-xl border border-gray-800 mb-6 overflow-x-auto">
          <h3 className="text-sm text-gray-400 mb-3">Data Structure Operations (Average)</h3>
          <table className="w-full text-sm"><thead><tr className="text-gray-500 text-xs"><th className="text-left py-2 px-3">Structure</th><th className="py-2 px-3">Access</th><th className="py-2 px-3">Search</th><th className="py-2 px-3">Insert</th><th className="py-2 px-3">Delete</th><th className="py-2 px-3">Space</th></tr></thead>
          <tbody>{filtered(dsOps).map(d => (
            <tr key={d.name} className="border-t border-gray-800"><td className="py-2 px-3 font-medium">{d.name}</td>
            {[d.access, d.search, d.insert, d.delete, d.space].map((v, i) => (
              <td key={i} className="py-2 px-3 text-center"><span className={`px-2 py-0.5 rounded text-xs font-mono ${getColor(v)}`}>{v}</span></td>
            ))}</tr>
          ))}</tbody></table>
        </div>

        <div className="p-4 bg-gray-900 rounded-xl border border-gray-800 overflow-x-auto">
          <h3 className="text-sm text-gray-400 mb-3">Sorting Algorithms</h3>
          <table className="w-full text-sm"><thead><tr className="text-gray-500 text-xs"><th className="text-left py-2 px-3">Algorithm</th><th className="py-2 px-3">Best</th><th className="py-2 px-3">Average</th><th className="py-2 px-3">Worst</th><th className="py-2 px-3">Space</th><th className="py-2 px-3">Stable</th></tr></thead>
          <tbody>{filtered(sortAlgos).map(s => (
            <tr key={s.name} className="border-t border-gray-800"><td className="py-2 px-3 font-medium">{s.name}</td>
            {[s.best, s.avg, s.worst, s.space].map((v, i) => (
              <td key={i} className="py-2 px-3 text-center"><span className={`px-2 py-0.5 rounded text-xs font-mono ${getColor(v)}`}>{v}</span></td>
            ))}
            <td className="py-2 px-3 text-center">{s.stable ? <span className="text-green-400">Yes</span> : <span className="text-gray-500">No</span>}</td></tr>
          ))}</tbody></table>
        </div>
      </div>
    </div>
  );
}
