import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Shield } from 'lucide-react';

const presets = [
  { octal: '644', desc: 'Default file' }, { octal: '755', desc: 'Default dir/executable' },
  { octal: '777', desc: 'Full access' }, { octal: '600', desc: 'Owner only' },
  { octal: '700', desc: 'Owner executable' }, { octal: '444', desc: 'Read-only all' },
  { octal: '666', desc: 'Read-write all' }, { octal: '400', desc: 'Owner read only' },
];

export default function App() {
  const [perms, setPerms] = useState([true, true, false, true, false, false, true, false, false]); // rwx rwx rwx
  const [copied, setCopied] = useState(false);

  const labels = ['Read', 'Write', 'Execute'];
  const groups = ['Owner', 'Group', 'Others'];

  const toggle = (idx: number) => setPerms(prev => { const n = [...prev]; n[idx] = !n[idx]; return n; });

  const octalDigit = (r: boolean, w: boolean, x: boolean) => (r ? 4 : 0) + (w ? 2 : 0) + (x ? 1 : 0);
  const octal = `${octalDigit(perms[0], perms[1], perms[2])}${octalDigit(perms[3], perms[4], perms[5])}${octalDigit(perms[6], perms[7], perms[8])}`;
  const symbolic = perms.map((p, i) => p ? 'rwx'[i % 3] : '-').join('');
  const command = `chmod ${octal} <file>`;

  const fromOctal = (val: string) => {
    if (val.length !== 3 || !/^[0-7]{3}$/.test(val)) return;
    const newPerms: boolean[] = [];
    for (const d of val) {
      const n = parseInt(d);
      newPerms.push(!!(n & 4), !!(n & 2), !!(n & 1));
    }
    setPerms(newPerms);
  };

  const copy = async (text: string) => { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 hover:bg-gray-800 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
          <div><h1 className="text-2xl font-bold flex items-center gap-2"><Shield className="w-6 h-6 text-green-400" /> Chmod Calculator</h1>
          <p className="text-gray-400 text-sm">Unix file permission calculator</p></div>
        </div>

        <div className="p-6 bg-gray-900 rounded-xl border border-gray-800 mb-6">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div />
            {labels.map(l => <div key={l} className="text-sm text-gray-400 font-medium">{l}</div>)}
            {groups.map((g, gi) => (
              <>
                <div key={g} className="text-sm font-medium text-left flex items-center">{g}</div>
                {[0, 1, 2].map(pi => {
                  const idx = gi * 3 + pi;
                  return (
                    <label key={idx} className="flex items-center justify-center">
                      <input type="checkbox" checked={perms[idx]} onChange={() => toggle(idx)} className="w-5 h-5 accent-green-500 cursor-pointer" />
                    </label>
                  );
                })}
              </>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-gray-900 rounded-xl border border-gray-800 text-center">
            <p className="text-xs text-gray-500 mb-1">Octal</p>
            <p className="text-3xl font-bold font-mono text-green-400">{octal}</p>
          </div>
          <div className="p-4 bg-gray-900 rounded-xl border border-gray-800 text-center">
            <p className="text-xs text-gray-500 mb-1">Symbolic</p>
            <p className="text-2xl font-bold font-mono text-cyan-400">{symbolic}</p>
          </div>
          <div className="p-4 bg-gray-900 rounded-xl border border-gray-800 text-center">
            <p className="text-xs text-gray-500 mb-1">Command</p>
            <div className="flex items-center justify-center gap-2">
              <code className="text-sm font-mono text-orange-400">{command}</code>
              <button onClick={() => copy(command)} className="p-1 hover:bg-gray-800 rounded">{copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-500" />}</button>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-900 rounded-xl border border-gray-800 mb-6">
          <h3 className="text-sm text-gray-400 mb-2">Reverse Lookup</h3>
          <input maxLength={3} placeholder="Enter octal (e.g. 755)" onChange={e => fromOctal(e.target.value)} className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg font-mono text-sm focus:outline-none focus:border-green-500" />
        </div>

        <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
          <h3 className="text-sm text-gray-400 mb-3">Common Presets</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {presets.map(p => (
              <button key={p.octal} onClick={() => fromOctal(p.octal)} className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-center">
                <span className="text-lg font-mono text-green-400 block">{p.octal}</span>
                <span className="text-xs text-gray-500">{p.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
