import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Binary } from 'lucide-react';

type Op = 'AND' | 'OR' | 'XOR' | 'NOT' | 'LSHIFT' | 'RSHIFT';

export default function App() {
  const [a, setA] = useState(170);
  const [b, setB] = useState(85);
  const [op, setOp] = useState<Op>('AND');
  const [bits, setBits] = useState<8 | 16>(8);

  const mask = bits === 8 ? 0xFF : 0xFFFF;
  const ma = a & mask; const mb = b & mask;

  const result = (() => {
    switch (op) {
      case 'AND': return ma & mb;
      case 'OR': return ma | mb;
      case 'XOR': return ma ^ mb;
      case 'NOT': return (~ma) & mask;
      case 'LSHIFT': return (ma << (mb & (bits - 1))) & mask;
      case 'RSHIFT': return (ma >>> (mb & (bits - 1))) & mask;
    }
  })();

  const toBin = (n: number) => (n >>> 0).toString(2).padStart(bits, '0');
  const toHex = (n: number) => '0x' + (n >>> 0).toString(16).toUpperCase().padStart(bits / 4, '0');

  const toggleBit = (val: number, setter: (v: number) => void, bitIdx: number) => {
    setter(val ^ (1 << (bits - 1 - bitIdx)));
  };

  const BitRow = ({ label, value, editable, setter }: { label: string; value: number; editable?: boolean; setter?: (v: number) => void }) => (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-500 w-12">{label}</span>
      <div className="flex gap-0.5">
        {toBin(value).split('').map((bit, i) => (
          <button key={i} disabled={!editable} onClick={() => editable && setter && toggleBit(value, setter, i)}
            className={`w-7 h-7 flex items-center justify-center rounded text-xs font-mono border transition-all ${bit === '1' ? 'bg-cyan-500/30 text-cyan-400 border-cyan-500/50' : 'bg-gray-800 text-gray-600 border-gray-700'} ${editable ? 'hover:border-cyan-400 cursor-pointer' : ''}`}>{bit}</button>
        ))}
      </div>
      <span className="text-sm font-mono text-gray-400 w-16 text-right">{value}</span>
      <span className="text-sm font-mono text-gray-500 w-16">{toHex(value)}</span>
    </div>
  );

  const ops: { op: Op; sym: string }[] = [
    { op: 'AND', sym: '&' }, { op: 'OR', sym: '|' }, { op: 'XOR', sym: '^' }, { op: 'NOT', sym: '~' }, { op: 'LSHIFT', sym: '<<' }, { op: 'RSHIFT', sym: '>>' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 hover:bg-gray-800 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
          <div><h1 className="text-2xl font-bold flex items-center gap-2"><Binary className="w-6 h-6 text-cyan-400" /> Bitwise Calculator</h1>
          <p className="text-gray-400 text-sm">Visualize bitwise operations</p></div>
        </div>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex gap-1">
            {([8, 16] as const).map(b => (
              <button key={b} onClick={() => setBits(b)} className={`px-3 py-1.5 rounded-lg text-sm ${bits === b ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>{b}-bit</button>
            ))}
          </div>
          <div className="flex-1" />
          <div className="flex gap-1">
            {ops.map(o => (
              <button key={o.op} onClick={() => setOp(o.op)} className={`px-3 py-1.5 rounded-lg text-sm font-mono ${op === o.op ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`} title={o.op}>{o.sym}</button>
            ))}
          </div>
        </div>
        <div className="p-6 bg-gray-900 rounded-xl border border-gray-800 mb-6 space-y-4">
          <div className="flex gap-3 mb-4">
            <div><label className="block text-xs text-gray-500 mb-1">A (decimal)</label><input type="number" value={a} onChange={e => setA(+e.target.value)} className="w-28 p-2 bg-gray-800 border border-gray-700 rounded-lg text-sm font-mono focus:outline-none focus:border-cyan-500" /></div>
            {op !== 'NOT' && <div><label className="block text-xs text-gray-500 mb-1">B (decimal)</label><input type="number" value={b} onChange={e => setB(+e.target.value)} className="w-28 p-2 bg-gray-800 border border-gray-700 rounded-lg text-sm font-mono focus:outline-none focus:border-cyan-500" /></div>}
          </div>
          <BitRow label="A" value={ma} editable setter={setA} />
          {op !== 'NOT' && <BitRow label="B" value={mb} editable setter={setB} />}
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 w-12">{op}</span>
            <div className="flex-1 border-t border-gray-700" />
          </div>
          <BitRow label="Result" value={result} />
        </div>
        <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
          <h3 className="text-sm text-gray-400 mb-3">Expression</h3>
          <code className="text-lg text-cyan-400 font-mono">
            {op === 'NOT' ? `~${ma} = ${result}` : `${ma} ${ops.find(o => o.op === op)?.sym} ${mb} = ${result}`}
          </code>
          <div className="mt-2 text-sm text-gray-500">
            Binary: {toBin(result)} | Hex: {toHex(result)} | Decimal: {result}
          </div>
        </div>
      </div>
    </div>
  );
}
