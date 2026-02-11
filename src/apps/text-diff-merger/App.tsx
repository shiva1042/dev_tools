import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, GitCompare, Copy, Check, ArrowRightLeft } from 'lucide-react';

interface DiffLine { type: 'same' | 'added' | 'removed'; text: string; leftNum?: number; rightNum?: number; }

export default function App() {
  const [left, setLeft] = useState('');
  const [right, setRight] = useState('');
  const [diff, setDiff] = useState<DiffLine[]>([]);
  const [copied, setCopied] = useState(false);
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [ignoreCase, setIgnoreCase] = useState(false);

  const computeDiff = () => {
    const lLines = left.split('\n');
    const rLines = right.split('\n');
    const normalize = (s: string) => {
      let r = s;
      if (ignoreWhitespace) r = r.trim().replace(/\s+/g, ' ');
      if (ignoreCase) r = r.toLowerCase();
      return r;
    };

    // LCS-based diff
    const m = lLines.length, n = rLines.length;
    const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) {
      dp[i][j] = normalize(lLines[i - 1]) === normalize(rLines[j - 1]) ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }

    const result: DiffLine[] = [];
    let i = m, j = n;
    const stack: DiffLine[] = [];
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && normalize(lLines[i - 1]) === normalize(rLines[j - 1])) {
        stack.push({ type: 'same', text: lLines[i - 1], leftNum: i, rightNum: j }); i--; j--;
      } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
        stack.push({ type: 'added', text: rLines[j - 1], rightNum: j }); j--;
      } else {
        stack.push({ type: 'removed', text: lLines[i - 1], leftNum: i }); i--;
      }
    }
    setDiff(stack.reverse());
  };

  const swap = () => { const tmp = left; setLeft(right); setRight(tmp); };

  const copyMerged = async () => {
    const merged = diff.filter(d => d.type !== 'removed').map(d => d.text).join('\n');
    await navigator.clipboard.writeText(merged); setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const stats = { added: diff.filter(d => d.type === 'added').length, removed: diff.filter(d => d.type === 'removed').length, same: diff.filter(d => d.type === 'same').length };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/" className="p-2 hover:bg-gray-800 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
          <div><h1 className="text-2xl font-bold flex items-center gap-2"><GitCompare className="w-6 h-6 text-amber-400" /> Text Diff & Merger</h1></div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div><label className="block text-sm text-gray-400 mb-1">Original</label>
            <textarea value={left} onChange={e => setLeft(e.target.value)} rows={10} className="w-full p-3 bg-gray-900 border border-gray-800 rounded-xl text-sm font-mono focus:outline-none resize-none" placeholder="Paste original text..." /></div>
          <div><label className="block text-sm text-gray-400 mb-1">Modified</label>
            <textarea value={right} onChange={e => setRight(e.target.value)} rows={10} className="w-full p-3 bg-gray-900 border border-gray-800 rounded-xl text-sm font-mono focus:outline-none resize-none" placeholder="Paste modified text..." /></div>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <button onClick={computeDiff} disabled={!left && !right} className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 rounded-lg text-sm">Compare</button>
          <button onClick={swap} className="flex items-center gap-1 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm"><ArrowRightLeft className="w-4 h-4" /> Swap</button>
          <label className="flex items-center gap-1 text-sm text-gray-400"><input type="checkbox" checked={ignoreWhitespace} onChange={e => setIgnoreWhitespace(e.target.checked)} /> Ignore whitespace</label>
          <label className="flex items-center gap-1 text-sm text-gray-400"><input type="checkbox" checked={ignoreCase} onChange={e => setIgnoreCase(e.target.checked)} /> Ignore case</label>
          {diff.length > 0 && <>
            <div className="flex-1" />
            <span className="text-xs text-green-400">+{stats.added}</span>
            <span className="text-xs text-red-400">-{stats.removed}</span>
            <span className="text-xs text-gray-400">={stats.same}</span>
            <button onClick={copyMerged} className="flex items-center gap-1 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm">{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} Copy merged</button>
          </>}
        </div>
        {diff.length > 0 && (
          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            <div className="max-h-[500px] overflow-y-auto font-mono text-sm">
              {diff.map((line, i) => (
                <div key={i} className={`flex ${line.type === 'added' ? 'bg-green-500/10' : line.type === 'removed' ? 'bg-red-500/10' : ''}`}>
                  <span className="w-10 text-right text-xs text-gray-600 px-2 py-0.5 select-none">{line.leftNum || ''}</span>
                  <span className="w-10 text-right text-xs text-gray-600 px-2 py-0.5 select-none">{line.rightNum || ''}</span>
                  <span className={`w-6 text-center py-0.5 select-none ${line.type === 'added' ? 'text-green-400' : line.type === 'removed' ? 'text-red-400' : 'text-gray-600'}`}>
                    {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                  </span>
                  <span className={`flex-1 px-2 py-0.5 ${line.type === 'added' ? 'text-green-300' : line.type === 'removed' ? 'text-red-300' : 'text-gray-400'}`}>{line.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
