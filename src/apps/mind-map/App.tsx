import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Download, Upload, BrainCircuit } from 'lucide-react';

interface MindNode { id: string; text: string; children: MindNode[]; color: string; expanded: boolean; }

const colors = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#a855f7', '#ec4899', '#14b8a6'];

function createNode(text: string): MindNode { return { id: crypto.randomUUID(), text, children: [], color: colors[Math.floor(Math.random() * colors.length)], expanded: true }; }

export default function App() {
  const [root, setRoot] = useState<MindNode>({ id: 'root', text: 'Central Topic', children: [createNode('Branch 1'), createNode('Branch 2'), createNode('Branch 3')], color: '#3b82f6', expanded: true });
  const [editing, setEditing] = useState<string | null>(null);

  const updateTree = (node: MindNode, id: string, updater: (n: MindNode) => MindNode): MindNode => {
    if (node.id === id) return updater(node);
    return { ...node, children: node.children.map(c => updateTree(c, id, updater)) };
  };

  const addChild = (parentId: string) => setRoot(prev => updateTree(prev, parentId, n => ({ ...n, children: [...n.children, createNode('New Node')], expanded: true })));

  const removeNode = (id: string) => {
    const remove = (node: MindNode): MindNode => ({ ...node, children: node.children.filter(c => c.id !== id).map(remove) });
    setRoot(prev => remove(prev));
  };

  const updateText = (id: string, text: string) => setRoot(prev => updateTree(prev, id, n => ({ ...n, text })));
  const toggleExpand = (id: string) => setRoot(prev => updateTree(prev, id, n => ({ ...n, expanded: !n.expanded })));
  const updateColor = (id: string, color: string) => setRoot(prev => updateTree(prev, id, n => ({ ...n, color })));

  const exportJson = () => { const b = new Blob([JSON.stringify(root, null, 2)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'mindmap.json'; a.click(); };
  const importJson = () => { const i = document.createElement('input'); i.type = 'file'; i.accept = '.json'; i.onchange = e => { const f = (e.target as HTMLInputElement).files?.[0]; if (!f) return; const r = new FileReader(); r.onload = ev => { try { setRoot(JSON.parse(ev.target?.result as string)); } catch {} }; r.readAsText(f); }; i.click(); };

  const renderNode = (node: MindNode, depth: number) => (
    <div key={node.id} className={`${depth > 0 ? 'ml-6 border-l-2 pl-4' : ''}`} style={{ borderColor: node.color + '40' }}>
      <div className="flex items-center gap-2 py-1 group">
        {node.children.length > 0 && <button onClick={() => toggleExpand(node.id)} className="text-xs text-gray-500 w-4">{node.expanded ? '▼' : '▶'}</button>}
        {node.children.length === 0 && <span className="w-4" />}
        <div className="w-3 h-3 rounded-full shrink-0 cursor-pointer" style={{ backgroundColor: node.color }} onClick={() => { const c = colors[(colors.indexOf(node.color) + 1) % colors.length]; updateColor(node.id, c); }} />
        {editing === node.id ? (
          <input value={node.text} onChange={e => updateText(node.id, e.target.value)} onBlur={() => setEditing(null)} onKeyDown={e => e.key === 'Enter' && setEditing(null)} autoFocus className="p-1 bg-gray-800 border border-gray-600 rounded text-sm focus:outline-none" />
        ) : (
          <span onDoubleClick={() => setEditing(node.id)} className="text-sm cursor-pointer hover:text-blue-400" style={{ color: depth === 0 ? node.color : undefined, fontWeight: depth === 0 ? 'bold' : undefined, fontSize: depth === 0 ? '1.1rem' : undefined }}>{node.text}</span>
        )}
        <button onClick={() => addChild(node.id)} className="p-0.5 opacity-0 group-hover:opacity-100 hover:bg-gray-800 rounded text-green-400"><Plus className="w-3 h-3" /></button>
        {depth > 0 && <button onClick={() => removeNode(node.id)} className="p-0.5 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 rounded text-red-400"><Trash2 className="w-3 h-3" /></button>}
      </div>
      {node.expanded && node.children.map(child => renderNode(child, depth + 1))}
    </div>
  );

  const countNodes = (n: MindNode): number => 1 + n.children.reduce((s, c) => s + countNodes(c), 0);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 hover:bg-gray-800 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
          <div><h1 className="text-2xl font-bold flex items-center gap-2"><BrainCircuit className="w-6 h-6 text-fuchsia-400" /> Mind Map</h1>
          <p className="text-gray-400 text-sm">{countNodes(root)} nodes</p></div>
          <div className="flex-1" />
          <button onClick={exportJson} className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm"><Download className="w-4 h-4" /> Export</button>
          <button onClick={importJson} className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm"><Upload className="w-4 h-4" /> Import</button>
        </div>
        <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">
          <p className="text-xs text-gray-500 mb-4">Double-click to edit | Click dot to change color | + to add child</p>
          {renderNode(root, 0)}
        </div>
      </div>
    </div>
  );
}
