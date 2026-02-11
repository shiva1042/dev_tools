import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Hash } from 'lucide-react';

const bases = [
  { name: 'Binary', base: 2, prefix: '0b' },
  { name: 'Octal', base: 8, prefix: '0o' },
  { name: 'Decimal', base: 10, prefix: '' },
  { name: 'Hexadecimal', base: 16, prefix: '0x' },
];

const commonValues = [
  { label: 'Byte Max', value: 255 }, { label: 'Char Max', value: 65535 },
  { label: 'Int16 Max', value: 32767 }, { label: 'Int32 Max', value: 2147483647 },
  { label: 'Powers of 2', value: 1024 }, { label: 'ASCII A', value: 65 },
];

export default function App() {
  const [inputBase, setInputBase] = useState(10);
  const [inputValue, setInputValue] = useState('42');
  const [copied, setCopied] = useState<string | null>(null);

  const decimal = parseInt(inputValue, inputBase);
  const isValid = !isNaN(decimal);

  const copy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label); setTimeout(() => setCopied(null), 2000);
  };

  const conversions = isValid ? bases.map(b => ({
    ...b, result: decimal.toString(b.base).toUpperCase()
  })) : [];

  const binaryStr = isValid ? decimal.toString(2).padStart(Math.ceil(decimal.toString(2).length / 8) * 8, '0') : '';

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 hover:bg-gray-800 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
          <div><h1 className="text-2xl font-bold flex items-center gap-2"><Hash className="w-6 h-6 text-orange-400" /> Number Base Converter</h1>
          <p className="text-gray-400 text-sm">Convert between binary, octal, decimal & hex</p></div>
        </div>
        <div className="p-6 bg-gray-900 rounded-xl border border-gray-800 mb-6">
          <div className="flex gap-3 mb-4">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Input Value</label>
              <input value={inputValue} onChange={e => setInputValue(e.target.value)} className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg font-mono text-lg focus:outline-none focus:border-orange-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Base</label>
              <select value={inputBase} onChange={e => setInputBase(+e.target.value)} className="p-3 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none">
                {bases.map(b => <option key={b.base} value={b.base}>{b.name} ({b.base})</option>)}
              </select>
            </div>
          </div>
          {!isValid && inputValue && <p className="text-red-400 text-sm">Invalid number for base {inputBase}</p>}
        </div>

        {isValid && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {conversions.map(c => (
                <div key={c.base} className={`p-4 bg-gray-900 rounded-xl border ${c.base === inputBase ? 'border-orange-500/50' : 'border-gray-800'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">{c.name} (base {c.base})</span>
                    <button onClick={() => copy(c.prefix + c.result, c.name)} className="p-1 hover:bg-gray-800 rounded">
                      {copied === c.name ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-500" />}
                    </button>
                  </div>
                  <p className="font-mono text-lg text-orange-400 break-all"><span className="text-gray-500">{c.prefix}</span>{c.result}</p>
                </div>
              ))}
            </div>

            {binaryStr && (
              <div className="p-4 bg-gray-900 rounded-xl border border-gray-800 mb-6">
                <h3 className="text-sm text-gray-400 mb-3">Binary Visualization</h3>
                <div className="flex flex-wrap gap-4">
                  {binaryStr.match(/.{1,8}/g)?.map((byte, i) => (
                    <div key={i} className="flex gap-0.5">
                      {byte.split('').map((bit, j) => (
                        <div key={j} className={`w-8 h-8 flex items-center justify-center rounded text-sm font-mono ${bit === '1' ? 'bg-orange-500/30 text-orange-400 border border-orange-500/50' : 'bg-gray-800 text-gray-600 border border-gray-700'}`}>{bit}</div>
                      ))}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">Decimal value: {decimal}</p>
              </div>
            )}

            <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
              <h3 className="text-sm text-gray-400 mb-3">Quick Values</h3>
              <div className="flex flex-wrap gap-2">
                {commonValues.map(v => (
                  <button key={v.label} onClick={() => { setInputBase(10); setInputValue(String(v.value)); }} className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs"><span className="text-gray-400">{v.label}:</span> <span className="text-orange-400">{v.value}</span></button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
