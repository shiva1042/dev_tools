import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calculator, Delete } from 'lucide-react';

export default function App() {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [memory, setMemory] = useState(0);
  const [mode, setMode] = useState<'deg' | 'rad'>('deg');
  const [history, setHistory] = useState<string[]>([]);

  const toRad = (n: number) => mode === 'deg' ? n * Math.PI / 180 : n;
  const fromRad = (n: number) => mode === 'deg' ? n * 180 / Math.PI : n;

  const handleNumber = (n: string) => setDisplay(prev => prev === '0' || prev === 'Error' ? n : prev + n);
  const handleOp = (op: string) => { setExpression(display + ' ' + op + ' '); setDisplay('0'); };
  const handleDecimal = () => { if (!display.includes('.')) setDisplay(prev => prev + '.'); };

  const calculate = () => {
    try {
      const expr = expression + display;
      const result = Function('"use strict"; return (' + expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/π/g, String(Math.PI)).replace(/e(?![x])/g, String(Math.E)) + ')')();
      const r = parseFloat(result.toPrecision(12));
      setHistory(prev => [...prev.slice(-9), `${expr} = ${r}`]);
      setDisplay(String(r)); setExpression('');
    } catch { setDisplay('Error'); setExpression(''); }
  };

  const scientific = (fn: string) => {
    const n = parseFloat(display);
    if (isNaN(n)) { setDisplay('Error'); return; }
    let result: number;
    switch (fn) {
      case 'sin': result = Math.sin(toRad(n)); break;
      case 'cos': result = Math.cos(toRad(n)); break;
      case 'tan': result = Math.tan(toRad(n)); break;
      case 'asin': result = fromRad(Math.asin(n)); break;
      case 'acos': result = fromRad(Math.acos(n)); break;
      case 'atan': result = fromRad(Math.atan(n)); break;
      case 'log': result = Math.log10(n); break;
      case 'ln': result = Math.log(n); break;
      case '√': result = Math.sqrt(n); break;
      case 'x²': result = n * n; break;
      case 'x³': result = n * n * n; break;
      case '1/x': result = 1 / n; break;
      case 'n!': result = n < 0 || n > 170 ? NaN : n <= 1 ? 1 : Array.from({ length: n }, (_, i) => i + 1).reduce((a, b) => a * b, 1); break;
      case '|x|': result = Math.abs(n); break;
      case 'exp': result = Math.exp(n); break;
      case '10^x': result = Math.pow(10, n); break;
      default: result = n;
    }
    setDisplay(isNaN(result) || !isFinite(result) ? 'Error' : String(parseFloat(result.toPrecision(12))));
  };

  const clear = () => { setDisplay('0'); setExpression(''); };
  const backspace = () => setDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
  const toggleSign = () => setDisplay(prev => prev.startsWith('-') ? prev.slice(1) : '-' + prev);

  const sciButtons = [
    ['sin', 'cos', 'tan', 'π'],
    ['asin', 'acos', 'atan', 'e'],
    ['log', 'ln', '√', 'x²'],
    ['x³', '1/x', 'n!', '|x|'],
    ['exp', '10^x', '(', ')'],
  ];

  const mainButtons = [
    ['C', '⌫', '%', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['±', '0', '.', '='],
  ];

  const handleButton = (btn: string) => {
    if (btn >= '0' && btn <= '9') handleNumber(btn);
    else if (['+', '-', '×', '÷'].includes(btn)) handleOp(btn);
    else if (btn === '.') handleDecimal();
    else if (btn === '=') calculate();
    else if (btn === 'C') clear();
    else if (btn === '⌫') backspace();
    else if (btn === '±') toggleSign();
    else if (btn === '%') setDisplay(String(parseFloat(display) / 100));
    else if (btn === 'π') setDisplay(String(Math.PI));
    else if (btn === 'e') setDisplay(String(Math.E));
    else if (btn === '(' || btn === ')') setDisplay(prev => prev === '0' ? btn : prev + btn);
    else scientific(btn);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-lg mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/" className="p-2 hover:bg-gray-800 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Calculator className="w-6 h-6 text-orange-400" /> Scientific Calculator</h1>
        </div>
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <button onClick={() => setMode(mode === 'deg' ? 'rad' : 'deg')} className="px-2 py-1 bg-gray-800 rounded text-xs">{mode.toUpperCase()}</button>
              <div className="flex gap-2 text-xs text-gray-500">
                <button onClick={() => setMemory(parseFloat(display) || 0)} className="px-2 py-1 hover:bg-gray-800 rounded">MS</button>
                <button onClick={() => setDisplay(String(memory))} className="px-2 py-1 hover:bg-gray-800 rounded">MR</button>
                <button onClick={() => setMemory(memory + (parseFloat(display) || 0))} className="px-2 py-1 hover:bg-gray-800 rounded">M+</button>
                <button onClick={() => setMemory(0)} className="px-2 py-1 hover:bg-gray-800 rounded">MC</button>
              </div>
            </div>
            <div className="text-right text-xs text-gray-500 h-5 truncate">{expression}</div>
            <div className="text-right text-3xl font-mono font-bold truncate">{display}</div>
          </div>
          <div className="grid grid-cols-9 gap-0.5 p-1">
            {sciButtons.map((row, ri) => row.map(btn => (
              <button key={btn} onClick={() => handleButton(btn)} className="p-2 bg-gray-800 hover:bg-gray-700 rounded text-xs font-mono text-purple-400">{btn}</button>
            )))}
            <div className="col-span-9 h-0.5" />
            {mainButtons.map((row, ri) => row.map(btn => (
              <button key={btn + ri} onClick={() => handleButton(btn)} className={`col-span-2 p-3 rounded text-sm font-bold ${
                btn === '=' ? 'bg-orange-600 hover:bg-orange-700 col-span-2' :
                ['+', '-', '×', '÷', '%'].includes(btn) ? 'bg-gray-700 hover:bg-gray-600 text-orange-400' :
                btn === 'C' ? 'bg-gray-700 hover:bg-gray-600 text-red-400' :
                btn === '⌫' ? 'bg-gray-700 hover:bg-gray-600' :
                'bg-gray-800 hover:bg-gray-700'}`}>{btn === '⌫' ? <Delete className="w-4 h-4 mx-auto" /> : btn}</button>
            )))}
          </div>
        </div>
        {history.length > 0 && (
          <div className="mt-4 p-3 bg-gray-900 rounded-xl border border-gray-800">
            <h3 className="text-xs text-gray-500 mb-2">History</h3>
            <div className="space-y-1 max-h-40 overflow-y-auto">{history.map((h, i) => (
              <div key={i} className="text-xs font-mono text-gray-400">{h}</div>
            ))}</div>
          </div>
        )}
      </div>
    </div>
  );
}
