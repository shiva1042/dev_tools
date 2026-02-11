import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Copy, Check, Eye, EyeOff, Download, Upload, FileText, ArrowUpDown } from 'lucide-react';

interface EnvVar { id: string; key: string; value: string; visible: boolean; group: string; }

export default function App() {
  const [vars, setVars] = useState<EnvVar[]>([
    { id: '1', key: 'DATABASE_URL', value: 'postgresql://localhost:5432/mydb', visible: false, group: 'Database' },
    { id: '2', key: 'API_KEY', value: 'sk-xxxxx', visible: false, group: 'API' },
    { id: '3', key: 'PORT', value: '3000', visible: true, group: 'Server' },
  ]);
  const [copied, setCopied] = useState(false);

  const addVar = () => setVars(prev => [...prev, { id: crypto.randomUUID(), key: '', value: '', visible: true, group: '' }]);

  const updateVar = (id: string, field: keyof EnvVar, value: string | boolean) => setVars(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v));

  const removeVar = (id: string) => setVars(prev => prev.filter(v => v.id !== id));

  const toEnvString = () => vars.filter(v => v.key).map(v => `${v.key}=${v.value}`).join('\n');

  const importEnv = () => {
    const input = document.createElement('input'); input.type = 'file'; input.accept = '.env,.txt';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        const newVars = text.split('\n').filter(l => l.trim() && !l.startsWith('#')).map(l => {
          const [key, ...rest] = l.split('=');
          return { id: crypto.randomUUID(), key: key.trim(), value: rest.join('=').trim(), visible: false, group: '' };
        });
        setVars(prev => [...prev, ...newVars]);
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const exportEnv = () => {
    const blob = new Blob([toEnvString()], { type: 'text/plain' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = '.env'; a.click();
  };

  const copy = async () => { await navigator.clipboard.writeText(toEnvString()); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const sortVars = () => setVars(prev => [...prev].sort((a, b) => a.key.localeCompare(b.key)));

  const groups = [...new Set(vars.map(v => v.group).filter(Boolean))];
  const duplicates = vars.filter((v, i) => v.key && vars.findIndex(vv => vv.key === v.key) !== i).map(v => v.key);

  const keyError = (v: EnvVar) => {
    if (v.key && /\s/.test(v.key)) return 'No spaces';
    if (duplicates.includes(v.key)) return 'Duplicate';
    return '';
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/" className="p-2 hover:bg-gray-800 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
          <div><h1 className="text-2xl font-bold flex items-center gap-2"><FileText className="w-6 h-6 text-teal-400" /> .env Editor</h1>
          <p className="text-gray-400 text-sm">Manage environment variables</p></div>
        </div>
        <div className="flex flex-wrap gap-2 mb-6">
          <button onClick={addVar} className="flex items-center gap-1 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 rounded-lg text-sm"><Plus className="w-4 h-4" /> Add Variable</button>
          <button onClick={importEnv} className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm"><Upload className="w-4 h-4" /> Import .env</button>
          <button onClick={exportEnv} className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm"><Download className="w-4 h-4" /> Export</button>
          <button onClick={copy} className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm">{copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />} Copy</button>
          <button onClick={sortVars} className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm"><ArrowUpDown className="w-4 h-4" /> Sort A-Z</button>
        </div>
        <div className="space-y-2 mb-6">
          {vars.map(v => {
            const err = keyError(v);
            return (
              <div key={v.id} className={`flex items-center gap-2 p-3 bg-gray-900 rounded-xl border ${err ? 'border-red-500/50' : 'border-gray-800'}`}>
                <input value={v.group} onChange={e => updateVar(v.id, 'group', e.target.value)} placeholder="Group" className="w-20 p-1.5 bg-gray-800 border border-gray-700 rounded text-xs focus:outline-none text-gray-400" />
                <input value={v.key} onChange={e => updateVar(v.id, 'key', e.target.value.toUpperCase())} placeholder="KEY" className="w-40 p-1.5 bg-gray-800 border border-gray-700 rounded text-sm font-mono text-teal-400 focus:outline-none" />
                <span className="text-gray-600">=</span>
                <input type={v.visible ? 'text' : 'password'} value={v.value} onChange={e => updateVar(v.id, 'value', e.target.value)} placeholder="value" className="flex-1 p-1.5 bg-gray-800 border border-gray-700 rounded text-sm font-mono focus:outline-none" />
                <button onClick={() => updateVar(v.id, 'visible', !v.visible)} className="p-1 hover:bg-gray-800 rounded text-gray-400">{v.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}</button>
                <button onClick={() => removeVar(v.id)} className="p-1 hover:bg-red-500/20 text-red-400 rounded"><Trash2 className="w-4 h-4" /></button>
                {err && <span className="text-xs text-red-400">{err}</span>}
              </div>
            );
          })}
        </div>
        {groups.length > 0 && (
          <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
            <h3 className="text-sm text-gray-400 mb-2">Groups</h3>
            <div className="flex flex-wrap gap-2">
              {groups.map(g => <span key={g} className="px-2 py-1 bg-teal-500/20 text-teal-400 rounded text-xs">{g} ({vars.filter(v => v.group === g).length})</span>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
