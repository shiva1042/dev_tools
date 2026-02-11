import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, Search, Layers } from 'lucide-react';

type Tab = 'stack' | 'queue' | 'linkedlist' | 'bst';

export default function App() {
  const [tab, setTab] = useState<Tab>('stack');
  const [inputVal, setInputVal] = useState('');
  const [stack, setStack] = useState<number[]>([]);
  const [queue, setQueue] = useState<number[]>([]);
  const [linkedList, setLinkedList] = useState<number[]>([]);
  const [bst, setBst] = useState<(number | null)[]>([]);
  const [message, setMessage] = useState('');
  const [highlight, setHighlight] = useState<number | null>(null);

  const val = parseInt(inputVal);

  const bstInsert = (tree: (number | null)[], value: number): (number | null)[] => {
    const t = [...tree];
    if (t.length === 0 || t[0] === null) { t[0] = value; return t; }
    let i = 0;
    while (i < 100) {
      if (t[i] === null || t[i] === undefined) { while (t.length <= i) t.push(null); t[i] = value; return t; }
      if (value < t[i]!) i = 2 * i + 1; else i = 2 * i + 2;
    }
    return t;
  };

  const bstSearch = (tree: (number | null)[], value: number): boolean => {
    let i = 0;
    while (i < tree.length) {
      if (tree[i] === null || tree[i] === undefined) return false;
      if (tree[i] === value) return true;
      if (value < tree[i]!) i = 2 * i + 1; else i = 2 * i + 2;
    }
    return false;
  };

  const handleAction = (action: string) => {
    setMessage('');
    switch (tab) {
      case 'stack':
        if (action === 'push' && !isNaN(val)) { setStack(prev => [...prev, val]); setMessage(`Pushed ${val}`); setInputVal(''); }
        else if (action === 'pop' && stack.length > 0) { const v = stack[stack.length - 1]; setStack(prev => prev.slice(0, -1)); setMessage(`Popped ${v}`); }
        else if (action === 'pop') setMessage('Stack is empty');
        break;
      case 'queue':
        if (action === 'enqueue' && !isNaN(val)) { setQueue(prev => [...prev, val]); setMessage(`Enqueued ${val}`); setInputVal(''); }
        else if (action === 'dequeue' && queue.length > 0) { const v = queue[0]; setQueue(prev => prev.slice(1)); setMessage(`Dequeued ${v}`); }
        else if (action === 'dequeue') setMessage('Queue is empty');
        break;
      case 'linkedlist':
        if (action === 'addHead' && !isNaN(val)) { setLinkedList(prev => [val, ...prev]); setMessage(`Added ${val} at head`); setInputVal(''); }
        else if (action === 'addTail' && !isNaN(val)) { setLinkedList(prev => [...prev, val]); setMessage(`Added ${val} at tail`); setInputVal(''); }
        else if (action === 'removeHead' && linkedList.length > 0) { setLinkedList(prev => prev.slice(1)); setMessage('Removed head'); }
        else if (action === 'removeTail' && linkedList.length > 0) { setLinkedList(prev => prev.slice(0, -1)); setMessage('Removed tail'); }
        break;
      case 'bst':
        if (action === 'insert' && !isNaN(val)) { setBst(prev => bstInsert(prev, val)); setMessage(`Inserted ${val}`); setInputVal(''); }
        else if (action === 'search' && !isNaN(val)) { const found = bstSearch(bst, val); setMessage(found ? `Found ${val}!` : `${val} not found`); setHighlight(found ? val : null); setTimeout(() => setHighlight(null), 2000); }
        else if (action === 'clear') { setBst([]); setMessage('Tree cleared'); }
        break;
    }
  };

  const renderBstLevel = (level: number) => {
    const start = Math.pow(2, level) - 1;
    const count = Math.pow(2, level);
    const nodes = [];
    for (let i = start; i < start + count; i++) {
      const val = i < bst.length ? bst[i] : null;
      nodes.push(val);
    }
    if (nodes.every(n => n === null || n === undefined)) return null;
    return (
      <div key={level} className="flex justify-center gap-2" style={{ gap: `${Math.pow(2, 4 - level)}rem` }}>
        {nodes.map((n, i) => (
          <div key={i} className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium border ${n !== null && n !== undefined ? (n === highlight ? 'bg-green-500/30 border-green-500 text-green-400' : 'bg-blue-500/20 border-blue-500/50 text-blue-400') : 'border-transparent'}`}>
            {n !== null && n !== undefined ? n : ''}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 hover:bg-gray-800 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
          <div><h1 className="text-2xl font-bold flex items-center gap-2"><Layers className="w-6 h-6 text-cyan-400" /> Data Structure Visualizer</h1>
          <p className="text-gray-400 text-sm">Interactive visualization for common data structures</p></div>
        </div>
        <div className="flex gap-2 mb-6">
          {(['stack', 'queue', 'linkedlist', 'bst'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm capitalize ${tab === t ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>{t === 'linkedlist' ? 'Linked List' : t === 'bst' ? 'Binary Tree' : t}</button>
          ))}
        </div>
        <div className="flex gap-3 mb-6">
          <input type="number" value={inputVal} onChange={e => setInputVal(e.target.value)} placeholder="Enter value" className="w-32 p-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-cyan-500" />
          {tab === 'stack' && <><button onClick={() => handleAction('push')} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm flex items-center gap-1"><Plus className="w-4 h-4" /> Push</button><button onClick={() => handleAction('pop')} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm flex items-center gap-1"><Minus className="w-4 h-4" /> Pop</button></>}
          {tab === 'queue' && <><button onClick={() => handleAction('enqueue')} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm flex items-center gap-1"><Plus className="w-4 h-4" /> Enqueue</button><button onClick={() => handleAction('dequeue')} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm flex items-center gap-1"><Minus className="w-4 h-4" /> Dequeue</button></>}
          {tab === 'linkedlist' && <><button onClick={() => handleAction('addHead')} className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm">Add Head</button><button onClick={() => handleAction('addTail')} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm">Add Tail</button><button onClick={() => handleAction('removeHead')} className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm">Rm Head</button><button onClick={() => handleAction('removeTail')} className="px-3 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-sm">Rm Tail</button></>}
          {tab === 'bst' && <><button onClick={() => handleAction('insert')} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm flex items-center gap-1"><Plus className="w-4 h-4" /> Insert</button><button onClick={() => handleAction('search')} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm flex items-center gap-1"><Search className="w-4 h-4" /> Search</button><button onClick={() => handleAction('clear')} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm">Clear</button></>}
        </div>
        {message && <div className="p-3 bg-gray-900 rounded-lg border border-gray-800 text-sm text-cyan-400 mb-4">{message}</div>}
        <div className="p-6 bg-gray-900 rounded-xl border border-gray-800 min-h-[300px]">
          {tab === 'stack' && (
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs text-gray-500 mb-2">TOP</span>
              {stack.length === 0 ? <p className="text-gray-500">Empty stack</p> : [...stack].reverse().map((v, i) => (
                <div key={i} className={`w-32 h-10 flex items-center justify-center rounded border ${i === 0 ? 'bg-green-500/20 border-green-500/50 text-green-400' : 'bg-gray-800 border-gray-700'} text-sm font-medium`}>{v}</div>
              ))}
              <span className="text-xs text-gray-500 mt-2">BOTTOM</span>
            </div>
          )}
          {tab === 'queue' && (
            <div className="flex items-center gap-2 overflow-x-auto">
              <span className="text-xs text-gray-500">FRONT</span>
              {queue.length === 0 ? <p className="text-gray-500 mx-4">Empty queue</p> : queue.map((v, i) => (
                <div key={i} className={`w-14 h-14 flex items-center justify-center rounded border shrink-0 ${i === 0 ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400' : 'bg-gray-800 border-gray-700'} text-sm font-medium`}>{v}</div>
              ))}
              <span className="text-xs text-gray-500">REAR</span>
            </div>
          )}
          {tab === 'linkedlist' && (
            <div className="flex items-center gap-1 overflow-x-auto">
              {linkedList.length === 0 ? <p className="text-gray-500">Empty list</p> : linkedList.map((v, i) => (
                <div key={i} className="flex items-center gap-1 shrink-0">
                  <div className="w-14 h-14 flex items-center justify-center bg-purple-500/20 border border-purple-500/50 text-purple-400 rounded text-sm font-medium">{v}</div>
                  {i < linkedList.length - 1 && <span className="text-gray-500">→</span>}
                </div>
              ))}
              {linkedList.length > 0 && <span className="text-gray-500 ml-1">→ null</span>}
            </div>
          )}
          {tab === 'bst' && (
            <div className="space-y-3">
              {bst.length === 0 ? <p className="text-center text-gray-500">Empty tree - insert values to begin</p> :
              Array.from({ length: 5 }, (_, l) => renderBstLevel(l)).filter(Boolean)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
