import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Play, Trash2, Terminal, Clock } from 'lucide-react';

const examples = [
  { name: 'Fibonacci', code: `function fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}\nfor (let i = 0; i < 10; i++) {\n  console.log(\`fib(\${i}) = \${fibonacci(i)}\`);\n}` },
  { name: 'Array Methods', code: `const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];\nconsole.log('Original:', nums);\nconsole.log('Filter even:', nums.filter(n => n % 2 === 0));\nconsole.log('Map x2:', nums.map(n => n * 2));\nconsole.log('Reduce sum:', nums.reduce((a, b) => a + b, 0));` },
  { name: 'Object Destructuring', code: `const user = { name: 'John', age: 30, city: 'NYC', skills: ['JS', 'React'] };\nconst { name, age, ...rest } = user;\nconsole.log('Name:', name);\nconsole.log('Age:', age);\nconsole.log('Rest:', rest);` },
  { name: 'Promises', code: `const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));\n\nasync function main() {\n  console.log('Start');\n  await delay(100);\n  console.log('After 100ms');\n  const results = await Promise.all([1, 2, 3].map(async (n) => {\n    await delay(50);\n    return n * 10;\n  }));\n  console.log('Results:', results);\n}\nmain();` },
];

export default function App() {
  const [code, setCode] = useState(examples[0].code);
  const [output, setOutput] = useState<{ type: string; text: string }[]>([]);
  const [running, setRunning] = useState(false);
  const [execTime, setExecTime] = useState<number | null>(null);

  const runCode = useCallback(async () => {
    setOutput([]); setRunning(true); setExecTime(null);
    const logs: { type: string; text: string }[] = [];
    const fakeConsole = {
      log: (...args: unknown[]) => logs.push({ type: 'log', text: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') }),
      error: (...args: unknown[]) => logs.push({ type: 'error', text: args.map(a => String(a)).join(' ') }),
      warn: (...args: unknown[]) => logs.push({ type: 'warn', text: args.map(a => String(a)).join(' ') }),
      info: (...args: unknown[]) => logs.push({ type: 'info', text: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') }),
    };
    const start = performance.now();
    try {
      const asyncFn = new Function('console', `return (async () => { ${code} })()`);
      await asyncFn(fakeConsole);
    } catch (e: unknown) {
      logs.push({ type: 'error', text: e instanceof Error ? `${e.name}: ${e.message}` : String(e) });
    }
    setExecTime(Math.round((performance.now() - start) * 100) / 100);
    setOutput(logs); setRunning(false);
  }, [code]);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/" className="p-2 hover:bg-gray-800 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
          <div><h1 className="text-2xl font-bold flex items-center gap-2"><Terminal className="w-6 h-6 text-green-400" /> Code Snippet Runner</h1>
          <p className="text-gray-400 text-sm">Run JavaScript in the browser</p></div>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {examples.map(ex => (
            <button key={ex.name} onClick={() => setCode(ex.code)} className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300">{ex.name}</button>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Code</span>
              <div className="flex gap-2">
                <button onClick={runCode} disabled={running} className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg text-sm"><Play className="w-4 h-4" /> Run</button>
                <button onClick={() => setCode('')} className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <textarea value={code} onChange={e => setCode(e.target.value)} rows={20} className="w-full p-4 bg-gray-900 border border-gray-800 rounded-xl font-mono text-sm leading-relaxed resize-none focus:outline-none focus:border-green-500 text-green-300" spellCheck={false} />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Output</span>
              {execTime !== null && <span className="text-xs text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" />{execTime}ms</span>}
            </div>
            <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl font-mono text-sm min-h-[480px] max-h-[480px] overflow-y-auto">
              {output.length === 0 ? <span className="text-gray-600">Click Run to execute code...</span> :
              output.map((line, i) => (
                <div key={i} className={`py-0.5 ${line.type === 'error' ? 'text-red-400' : line.type === 'warn' ? 'text-yellow-400' : 'text-gray-300'}`}>
                  <span className="text-gray-600 mr-2 select-none">{i + 1}</span>{line.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
