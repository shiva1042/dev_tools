import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Download, Package, Plus, Trash2 } from 'lucide-react';

const licenses = ['MIT', 'Apache-2.0', 'GPL-3.0', 'BSD-2-Clause', 'BSD-3-Clause', 'ISC', 'UNLICENSED'];
const defaultScripts = [
  { key: 'dev', value: 'vite' }, { key: 'build', value: 'tsc && vite build' },
  { key: 'start', value: 'node dist/index.js' }, { key: 'test', value: 'vitest' },
  { key: 'lint', value: 'eslint .' }, { key: 'format', value: 'prettier --write .' },
];

export default function App() {
  const [name, setName] = useState('my-project');
  const [version, setVersion] = useState('1.0.0');
  const [description, setDescription] = useState('');
  const [author, setAuthor] = useState('');
  const [license, setLicense] = useState('MIT');
  const [main, setMain] = useState('dist/index.js');
  const [moduleType, setModuleType] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);
  const [keywords, setKeywords] = useState('');
  const [scripts, setScripts] = useState<{ key: string; value: string }[]>([{ key: 'dev', value: 'vite' }, { key: 'build', value: 'tsc && vite build' }]);
  const [deps, setDeps] = useState<{ name: string; version: string }[]>([]);
  const [devDeps, setDevDeps] = useState<{ name: string; version: string }[]>([]);
  const [copied, setCopied] = useState(false);

  const pkg = JSON.stringify({
    name, version, description: description || undefined, main, ...(moduleType ? { type: 'module' } : {}),
    ...(isPrivate ? { private: true } : {}),
    ...(keywords ? { keywords: keywords.split(',').map(k => k.trim()).filter(Boolean) } : {}),
    ...(author ? { author } : {}), license,
    scripts: scripts.reduce((a, s) => ({ ...a, [s.key]: s.value }), {}),
    ...(deps.length > 0 ? { dependencies: deps.reduce((a, d) => ({ ...a, [d.name]: d.version }), {}) } : {}),
    ...(devDeps.length > 0 ? { devDependencies: devDeps.reduce((a, d) => ({ ...a, [d.name]: d.version }), {}) } : {}),
  }, null, 2);

  const copy = async () => { await navigator.clipboard.writeText(pkg); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const download = () => { const b = new Blob([pkg], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'package.json'; a.click(); };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/" className="p-2 hover:bg-gray-800 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
          <div><h1 className="text-2xl font-bold flex items-center gap-2"><Package className="w-6 h-6 text-red-400" /> package.json Generator</h1></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-4 bg-gray-900 rounded-xl border border-gray-800 grid grid-cols-2 gap-3">
              <div className="col-span-2"><label className="block text-xs text-gray-500 mb-1">Name</label><input value={name} onChange={e => setName(e.target.value)} className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-red-500" /></div>
              <div><label className="block text-xs text-gray-500 mb-1">Version</label><input value={version} onChange={e => setVersion(e.target.value)} className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none" /></div>
              <div><label className="block text-xs text-gray-500 mb-1">License</label><select value={license} onChange={e => setLicense(e.target.value)} className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-sm">{licenses.map(l => <option key={l}>{l}</option>)}</select></div>
              <div className="col-span-2"><label className="block text-xs text-gray-500 mb-1">Description</label><input value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none" /></div>
              <div><label className="block text-xs text-gray-500 mb-1">Author</label><input value={author} onChange={e => setAuthor(e.target.value)} className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none" /></div>
              <div><label className="block text-xs text-gray-500 mb-1">Main</label><input value={main} onChange={e => setMain(e.target.value)} className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none" /></div>
              <div className="col-span-2"><label className="block text-xs text-gray-500 mb-1">Keywords (comma-separated)</label><input value={keywords} onChange={e => setKeywords(e.target.value)} className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none" /></div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={moduleType} onChange={e => setModuleType(e.target.checked)} className="accent-red-500" /> type: "module"</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} className="accent-red-500" /> private</label>
            </div>
            <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
              <div className="flex items-center justify-between mb-2"><h3 className="text-sm text-gray-400">Scripts</h3><div className="flex gap-1">{defaultScripts.map(s => <button key={s.key} onClick={() => setScripts(prev => prev.some(p => p.key === s.key) ? prev : [...prev, s])} className="px-2 py-0.5 bg-gray-800 hover:bg-gray-700 rounded text-xs">{s.key}</button>)}</div></div>
              {scripts.map((s, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input value={s.key} onChange={e => { const n = [...scripts]; n[i].key = e.target.value; setScripts(n); }} className="w-28 p-1.5 bg-gray-800 border border-gray-700 rounded text-xs font-mono focus:outline-none" />
                  <input value={s.value} onChange={e => { const n = [...scripts]; n[i].value = e.target.value; setScripts(n); }} className="flex-1 p-1.5 bg-gray-800 border border-gray-700 rounded text-xs font-mono focus:outline-none" />
                  <button onClick={() => setScripts(prev => prev.filter((_, j) => j !== i))} className="p-1 text-red-400 hover:bg-red-500/20 rounded"><Trash2 className="w-3 h-3" /></button>
                </div>
              ))}
              <button onClick={() => setScripts(prev => [...prev, { key: '', value: '' }])} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button>
            </div>
            {[{ label: 'Dependencies', items: deps, setter: setDeps }, { label: 'Dev Dependencies', items: devDeps, setter: setDevDeps }].map(({ label, items, setter }) => (
              <div key={label} className="p-4 bg-gray-900 rounded-xl border border-gray-800">
                <h3 className="text-sm text-gray-400 mb-2">{label}</h3>
                {items.map((d, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input value={d.name} onChange={e => { const n = [...items]; n[i].name = e.target.value; setter(n); }} placeholder="package" className="flex-1 p-1.5 bg-gray-800 border border-gray-700 rounded text-xs font-mono focus:outline-none" />
                    <input value={d.version} onChange={e => { const n = [...items]; n[i].version = e.target.value; setter(n); }} placeholder="^1.0.0" className="w-24 p-1.5 bg-gray-800 border border-gray-700 rounded text-xs font-mono focus:outline-none" />
                    <button onClick={() => setter(prev => prev.filter((_, j) => j !== i))} className="p-1 text-red-400 hover:bg-red-500/20 rounded"><Trash2 className="w-3 h-3" /></button>
                  </div>
                ))}
                <button onClick={() => setter(prev => [...prev, { name: '', version: '^1.0.0' }])} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button>
              </div>
            ))}
          </div>
          <div>
            <div className="flex gap-2 mb-2">
              <button onClick={copy} className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-lg text-sm">{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} Copy</button>
              <button onClick={download} className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm"><Download className="w-4 h-4" /> Download</button>
            </div>
            <pre className="p-4 bg-gray-900 border border-gray-800 rounded-xl font-mono text-sm text-green-300 overflow-auto max-h-[700px]">{pkg}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
