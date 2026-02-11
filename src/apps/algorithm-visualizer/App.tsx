import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Play, Pause, SkipForward, RotateCcw, Shuffle, BarChart3 } from 'lucide-react';

type Algorithm = 'bubble' | 'selection' | 'insertion' | 'quick' | 'merge';
interface Bar { value: number; state: 'default' | 'comparing' | 'swapping' | 'sorted'; }

function generateArray(size: number): Bar[] {
  return Array.from({ length: size }, () => ({ value: Math.floor(Math.random() * 100) + 5, state: 'default' as const }));
}

export default function App() {
  const [array, setArray] = useState<Bar[]>(generateArray(30));
  const [algorithm, setAlgorithm] = useState<Algorithm>('bubble');
  const [speed, setSpeed] = useState(50);
  const [sorting, setSorting] = useState(false);
  const [comparisons, setComparisons] = useState(0);
  const [swaps, setSwaps] = useState(0);
  const stopRef = useRef(false);

  const delay = useCallback(() => new Promise(r => setTimeout(r, Math.max(5, 200 - speed * 2))), [speed]);

  const reset = () => { stopRef.current = true; setSorting(false); setArray(generateArray(30)); setComparisons(0); setSwaps(0); };
  const randomize = () => { stopRef.current = true; setSorting(false); setArray(generateArray(30)); setComparisons(0); setSwaps(0); };

  const bubbleSort = async () => {
    const arr = [...array]; let c = 0, s = 0;
    for (let i = 0; i < arr.length - 1; i++) {
      for (let j = 0; j < arr.length - i - 1; j++) {
        if (stopRef.current) return;
        arr[j].state = 'comparing'; arr[j + 1].state = 'comparing'; setArray([...arr]); c++; setComparisons(c); await delay();
        if (arr[j].value > arr[j + 1].value) { [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]; arr[j].state = 'swapping'; arr[j + 1].state = 'swapping'; s++; setSwaps(s); setArray([...arr]); await delay(); }
        arr[j].state = 'default'; arr[j + 1].state = 'default';
      }
      arr[arr.length - 1 - i].state = 'sorted';
    }
    arr[0].state = 'sorted'; setArray([...arr]);
  };

  const selectionSort = async () => {
    const arr = [...array]; let c = 0, s = 0;
    for (let i = 0; i < arr.length - 1; i++) {
      let minIdx = i; arr[i].state = 'comparing'; setArray([...arr]);
      for (let j = i + 1; j < arr.length; j++) {
        if (stopRef.current) return;
        arr[j].state = 'comparing'; c++; setComparisons(c); setArray([...arr]); await delay();
        if (arr[j].value < arr[minIdx].value) minIdx = j;
        arr[j].state = 'default';
      }
      if (minIdx !== i) { [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]]; s++; setSwaps(s); }
      arr[i].state = 'sorted'; setArray([...arr]);
    }
    arr[arr.length - 1].state = 'sorted'; setArray([...arr]);
  };

  const insertionSort = async () => {
    const arr = [...array]; let c = 0, s = 0;
    arr[0].state = 'sorted'; setArray([...arr]);
    for (let i = 1; i < arr.length; i++) {
      if (stopRef.current) return;
      const key = arr[i]; let j = i - 1;
      arr[i].state = 'comparing'; setArray([...arr]); await delay();
      while (j >= 0 && arr[j].value > key.value) {
        if (stopRef.current) return;
        c++; setComparisons(c); arr[j + 1] = arr[j]; arr[j].state = 'swapping'; s++; setSwaps(s); setArray([...arr]); await delay();
        arr[j].state = 'sorted'; j--;
      }
      arr[j + 1] = key; arr[j + 1].state = 'sorted'; setArray([...arr]); await delay();
    }
    arr.forEach(b => b.state = 'sorted'); setArray([...arr]);
  };

  const quickSort = async () => {
    const arr = [...array]; let c = 0, s = 0;
    const qs = async (low: number, high: number) => {
      if (low >= high || stopRef.current) return;
      const pivot = arr[high]; arr[high].state = 'comparing'; let i = low;
      for (let j = low; j < high; j++) {
        if (stopRef.current) return;
        arr[j].state = 'comparing'; c++; setComparisons(c); setArray([...arr]); await delay();
        if (arr[j].value < pivot.value) { [arr[i], arr[j]] = [arr[j], arr[i]]; s++; setSwaps(s); i++; }
        arr[j].state = 'default';
      }
      [arr[i], arr[high]] = [arr[high], arr[i]]; arr[i].state = 'sorted'; setArray([...arr]); await delay();
      await qs(low, i - 1); await qs(i + 1, high);
    };
    await qs(0, arr.length - 1);
    arr.forEach(b => b.state = 'sorted'); setArray([...arr]);
  };

  const mergeSort = async () => {
    const arr = [...array]; let c = 0, s = 0;
    const ms = async (l: number, r: number) => {
      if (l >= r || stopRef.current) return;
      const m = Math.floor((l + r) / 2);
      await ms(l, m); await ms(m + 1, r);
      const left = arr.slice(l, m + 1); const right = arr.slice(m + 1, r + 1);
      let i = 0, j = 0, k = l;
      while (i < left.length && j < right.length) {
        if (stopRef.current) return;
        c++; setComparisons(c);
        if (left[i].value <= right[j].value) { arr[k] = left[i]; i++; } else { arr[k] = right[j]; j++; s++; setSwaps(s); }
        arr[k].state = 'swapping'; setArray([...arr]); await delay(); arr[k].state = 'default'; k++;
      }
      while (i < left.length) { arr[k] = left[i]; arr[k].state = 'default'; i++; k++; }
      while (j < right.length) { arr[k] = right[j]; arr[k].state = 'default'; j++; k++; }
      setArray([...arr]);
    };
    await ms(0, arr.length - 1);
    arr.forEach(b => b.state = 'sorted'); setArray([...arr]);
  };

  const startSort = async () => {
    stopRef.current = false; setSorting(true); setComparisons(0); setSwaps(0);
    array.forEach(b => b.state = 'default'); setArray([...array]);
    const algos = { bubble: bubbleSort, selection: selectionSort, insertion: insertionSort, quick: quickSort, merge: mergeSort };
    await algos[algorithm]();
    setSorting(false);
  };

  const stateColor = (s: string) => s === 'comparing' ? 'bg-yellow-400' : s === 'swapping' ? 'bg-red-400' : s === 'sorted' ? 'bg-green-400' : 'bg-blue-500';
  const maxVal = Math.max(...array.map(b => b.value));

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/" className="p-2 hover:bg-gray-800 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
          <div><h1 className="text-2xl font-bold flex items-center gap-2"><BarChart3 className="w-6 h-6 text-yellow-400" /> Algorithm Visualizer</h1>
          <p className="text-gray-400 text-sm">Step-by-step sorting animations</p></div>
        </div>
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {(['bubble', 'selection', 'insertion', 'quick', 'merge'] as Algorithm[]).map(a => (
            <button key={a} disabled={sorting} onClick={() => setAlgorithm(a)} className={`px-3 py-1.5 rounded-lg text-sm capitalize ${algorithm === a ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'} disabled:opacity-50`}>{a} Sort</button>
          ))}
          <div className="flex-1" />
          <div className="flex items-center gap-2 text-sm text-gray-400"><span>Speed</span><input type="range" min={1} max={100} value={speed} onChange={e => setSpeed(+e.target.value)} className="w-24 accent-yellow-500" /></div>
        </div>
        <div className="p-6 bg-gray-900 rounded-xl border border-gray-800 mb-6">
          <div className="flex items-end gap-1 h-64">
            {array.map((bar, i) => (
              <div key={i} className={`flex-1 rounded-t transition-all duration-100 ${stateColor(bar.state)}`} style={{ height: `${(bar.value / maxVal) * 100}%` }} title={`${bar.value}`} />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <button onClick={sorting ? () => { stopRef.current = true; setSorting(false); } : startSort} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${sorting ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}>
            {sorting ? <><Pause className="w-4 h-4" /> Stop</> : <><Play className="w-4 h-4" /> Start</>}
          </button>
          <button onClick={randomize} disabled={sorting} className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 rounded-lg text-sm"><Shuffle className="w-4 h-4" /> Randomize</button>
          <button onClick={reset} className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm"><RotateCcw className="w-4 h-4" /> Reset</button>
          <div className="flex-1" />
          <span className="text-sm text-gray-400">Comparisons: <span className="text-white">{comparisons}</span></span>
          <span className="text-sm text-gray-400">Swaps: <span className="text-white">{swaps}</span></span>
        </div>
        <div className="flex gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-500" /> Default</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-400" /> Comparing</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-400" /> Swapping</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-400" /> Sorted</span>
        </div>
      </div>
    </div>
  );
}
