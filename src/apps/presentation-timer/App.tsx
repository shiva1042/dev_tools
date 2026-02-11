import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Play, Pause, RotateCcw, Plus, Trash2, Presentation } from 'lucide-react';

interface Section { id: string; name: string; minutes: number; }

export default function App() {
  const [sections, setSections] = useState<Section[]>([
    { id: '1', name: 'Introduction', minutes: 5 }, { id: '2', name: 'Main Content', minutes: 15 },
    { id: '3', name: 'Demo', minutes: 10 }, { id: '4', name: 'Q&A', minutes: 5 },
  ]);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const totalSeconds = sections.reduce((s, sec) => s + sec.minutes * 60, 0);

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => setElapsed(prev => prev + 1), 1000);
    } else if (timerRef.current) clearInterval(timerRef.current);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [running]);

  const reset = () => { setRunning(false); setElapsed(0); };

  let cumulative = 0;
  const sectionInfo = sections.map(s => {
    const start = cumulative; cumulative += s.minutes * 60;
    const end = cumulative;
    const active = elapsed >= start && elapsed < end;
    const done = elapsed >= end;
    const pct = active ? ((elapsed - start) / (s.minutes * 60)) * 100 : done ? 100 : 0;
    return { ...s, start, end, active, done, pct };
  });

  const currentSection = sectionInfo.find(s => s.active);
  const remaining = Math.max(0, totalSeconds - elapsed);
  const currentRemaining = currentSection ? Math.max(0, currentSection.end - elapsed) : 0;

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  const overallPct = Math.min((elapsed / totalSeconds) * 100, 100);
  const status = elapsed >= totalSeconds ? 'bg-red-500' : overallPct > 75 ? 'bg-yellow-500' : 'bg-green-500';

  return (
    <div className={`min-h-screen bg-gray-950 text-white ${fullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/" className="p-2 hover:bg-gray-800 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
          <div><h1 className="text-2xl font-bold flex items-center gap-2"><Presentation className="w-6 h-6 text-indigo-400" /> Presentation Timer</h1></div>
          <div className="flex-1" />
          <button onClick={() => setFullscreen(!fullscreen)} className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm">{fullscreen ? 'Exit' : 'Full Screen'}</button>
        </div>
        <div className="text-center mb-6">
          <div className={`text-6xl font-bold font-mono mb-2 ${elapsed >= totalSeconds ? 'text-red-400' : 'text-white'}`}>{formatTime(remaining)}</div>
          <p className="text-sm text-gray-400">Total remaining</p>
          <div className="h-2 bg-gray-800 rounded-full mt-3 overflow-hidden"><div className={`h-full ${status} transition-all`} style={{ width: `${overallPct}%` }} /></div>
        </div>
        {currentSection && (
          <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl mb-6 text-center">
            <p className="text-indigo-400 text-sm">Current Section</p>
            <p className="text-xl font-bold">{currentSection.name}</p>
            <p className="text-2xl font-mono text-indigo-300">{formatTime(currentRemaining)}</p>
          </div>
        )}
        <div className="flex justify-center gap-3 mb-6">
          <button onClick={() => setRunning(!running)} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm ${running ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'}`}>{running ? <><Pause className="w-5 h-5" /> Pause</> : <><Play className="w-5 h-5" /> Start</>}</button>
          <button onClick={reset} className="flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm"><RotateCcw className="w-5 h-5" /> Reset</button>
        </div>
        <div className="space-y-2 mb-4">
          {sectionInfo.map(s => (
            <div key={s.id} className={`p-3 rounded-xl border ${s.active ? 'bg-indigo-500/10 border-indigo-500/30' : s.done ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-900 border-gray-800'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${s.active ? 'bg-indigo-400 animate-pulse' : s.done ? 'bg-green-400' : 'bg-gray-600'}`} />
                <input value={s.name} onChange={e => setSections(prev => prev.map(p => p.id === s.id ? { ...p, name: e.target.value } : p))} className="flex-1 bg-transparent text-sm focus:outline-none" disabled={running} />
                <input type="number" value={s.minutes} onChange={e => setSections(prev => prev.map(p => p.id === s.id ? { ...p, minutes: +e.target.value } : p))} className="w-14 p-1 bg-gray-800 border border-gray-700 rounded text-xs text-center" disabled={running} min={1} />
                <span className="text-xs text-gray-500">min</span>
                <button onClick={() => setSections(prev => prev.filter(p => p.id !== s.id))} disabled={running} className="p-1 text-red-400 hover:bg-red-500/20 rounded disabled:opacity-30"><Trash2 className="w-4 h-4" /></button>
              </div>
              <div className="h-1 bg-gray-800 rounded-full mt-2 overflow-hidden"><div className={`h-full transition-all ${s.active ? 'bg-indigo-500' : 'bg-green-500'}`} style={{ width: `${s.pct}%` }} /></div>
            </div>
          ))}
        </div>
        <button onClick={() => setSections(prev => [...prev, { id: crypto.randomUUID(), name: 'New Section', minutes: 5 }])} disabled={running} className="flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300 disabled:opacity-30"><Plus className="w-4 h-4" /> Add Section</button>
      </div>
    </div>
  );
}
