import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Keyboard, Trophy } from 'lucide-react';

const passages = [
  { name: 'General', text: 'The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump. The five boxing wizards jump quickly. Sphinx of black quartz judge my vow.' },
  { name: 'Code', text: 'function fibonacci(n) { if (n <= 1) return n; return fibonacci(n - 1) + fibonacci(n - 2); } const result = fibonacci(10); console.log(result);' },
  { name: 'Technical', text: 'React is a JavaScript library for building user interfaces. It lets you compose complex UIs from small and isolated pieces of code called components. React has been designed from the start for gradual adoption.' },
];

export default function App() {
  const [passageIdx, setPassageIdx] = useState(0);
  const [input, setInput] = useState('');
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [errors, setErrors] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const text = passages[passageIdx].text;

  const restart = useCallback(() => {
    setInput(''); setStarted(false); setFinished(false); setElapsed(0); setErrors(0);
    if (timerRef.current) clearInterval(timerRef.current);
    inputRef.current?.focus();
  }, []);

  useEffect(() => { restart(); }, [passageIdx, restart]);
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const handleInput = (val: string) => {
    if (finished) return;
    if (!started) {
      setStarted(true); setStartTime(Date.now());
      timerRef.current = setInterval(() => setElapsed(Math.floor((Date.now() - Date.now()) / 1000)), 100);
      const st = Date.now();
      timerRef.current = setInterval(() => setElapsed(Math.floor((Date.now() - st) / 1000)), 100);
    }
    setInput(val);
    let errs = 0;
    for (let i = 0; i < val.length; i++) { if (val[i] !== text[i]) errs++; }
    setErrors(errs);
    if (val.length >= text.length) {
      setFinished(true); if (timerRef.current) clearInterval(timerRef.current);
      setElapsed(Math.floor((Date.now() - startTime) / 1000) || 1);
    }
  };

  const timeElapsed = started ? (finished ? elapsed : Math.floor((Date.now() - startTime) / 1000)) : 0;
  const wordsTyped = input.trim().split(/\s+/).filter(Boolean).length;
  const wpm = timeElapsed > 0 ? Math.round((wordsTyped / timeElapsed) * 60) : 0;
  const accuracy = input.length > 0 ? Math.round(((input.length - errors) / input.length) * 100) : 100;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 hover:bg-gray-800 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
          <div><h1 className="text-2xl font-bold flex items-center gap-2"><Keyboard className="w-6 h-6 text-violet-400" /> Typing Speed Test</h1>
          <p className="text-gray-400 text-sm">Test your typing speed and accuracy</p></div>
        </div>
        <div className="flex gap-2 mb-6">
          {passages.map((p, i) => (
            <button key={p.name} onClick={() => { setPassageIdx(i); restart(); }} className={`px-3 py-1.5 rounded-lg text-sm ${passageIdx === i ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>{p.name}</button>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="p-3 bg-gray-900 rounded-xl border border-gray-800 text-center"><p className="text-2xl font-bold text-violet-400">{wpm}</p><p className="text-xs text-gray-500">WPM</p></div>
          <div className="p-3 bg-gray-900 rounded-xl border border-gray-800 text-center"><p className={`text-2xl font-bold ${accuracy >= 95 ? 'text-green-400' : accuracy >= 80 ? 'text-yellow-400' : 'text-red-400'}`}>{accuracy}%</p><p className="text-xs text-gray-500">Accuracy</p></div>
          <div className="p-3 bg-gray-900 rounded-xl border border-gray-800 text-center"><p className="text-2xl font-bold text-red-400">{errors}</p><p className="text-xs text-gray-500">Errors</p></div>
          <div className="p-3 bg-gray-900 rounded-xl border border-gray-800 text-center"><p className="text-2xl font-bold text-cyan-400">{timeElapsed}s</p><p className="text-xs text-gray-500">Time</p></div>
        </div>
        <div className="p-6 bg-gray-900 rounded-xl border border-gray-800 mb-4">
          <div className="text-lg leading-relaxed font-mono mb-4" style={{ wordBreak: 'break-all' }}>
            {text.split('').map((char, i) => {
              let color = 'text-gray-500';
              if (i < input.length) color = input[i] === char ? 'text-green-400' : 'text-red-400 bg-red-500/20';
              if (i === input.length) color = 'text-white bg-gray-700';
              return <span key={i} className={color}>{char}</span>;
            })}
          </div>
          <input ref={inputRef} value={input} onChange={e => handleInput(e.target.value)} disabled={finished} autoFocus placeholder={started ? '' : 'Start typing...'} className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg font-mono text-sm focus:outline-none focus:border-violet-500 disabled:opacity-50" />
        </div>
        <div className="flex gap-3">
          <button onClick={restart} className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg text-sm"><RotateCcw className="w-4 h-4" /> Restart</button>
        </div>
        {finished && (
          <div className="mt-6 p-6 bg-gray-900 rounded-xl border border-green-500/30 text-center">
            <Trophy className="w-10 h-10 text-yellow-400 mx-auto mb-3" />
            <h2 className="text-xl font-bold mb-2">Complete!</h2>
            <p className="text-gray-400">You typed at <span className="text-violet-400 font-bold">{wpm} WPM</span> with <span className={`font-bold ${accuracy >= 95 ? 'text-green-400' : 'text-yellow-400'}`}>{accuracy}% accuracy</span></p>
          </div>
        )}
      </div>
    </div>
  );
}
