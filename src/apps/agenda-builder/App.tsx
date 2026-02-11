import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Copy, Check, GripVertical, ClipboardList, Clock } from 'lucide-react';

interface AgendaItem { id: string; topic: string; presenter: string; duration: number; notes: string; }

export default function App() {
  const [title, setTitle] = useState('Team Meeting');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [items, setItems] = useState<AgendaItem[]>([
    { id: '1', topic: 'Welcome & Introductions', presenter: '', duration: 5, notes: '' },
    { id: '2', topic: 'Project Updates', presenter: '', duration: 15, notes: '' },
    { id: '3', topic: 'Action Items Review', presenter: '', duration: 10, notes: '' },
  ]);
  const [copied, setCopied] = useState(false);

  const addItem = () => setItems(prev => [...prev, { id: crypto.randomUUID(), topic: '', presenter: '', duration: 5, notes: '' }]);
  const updateItem = (id: string, field: keyof AgendaItem, value: string | number) => setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id));

  const totalMinutes = items.reduce((s, i) => s + i.duration, 0);

  const getTimeForItem = (index: number) => {
    const [h, m] = startTime.split(':').map(Number);
    let total = h * 60 + m;
    for (let i = 0; i < index; i++) total += items[i].duration;
    const hh = Math.floor(total / 60) % 24;
    const mm = total % 60;
    return `${hh.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')}`;
  };

  const endTime = getTimeForItem(items.length);

  const copyAgenda = async () => {
    const text = `${title}\nDate: ${date} | ${startTime} - ${endTime} (${totalMinutes} min)\n${'='.repeat(50)}\n\n` +
      items.map((item, i) => `${getTimeForItem(i)} - ${getTimeForItem(i + 1)} (${item.duration} min)\n  Topic: ${item.topic || 'TBD'}${item.presenter ? `\n  Presenter: ${item.presenter}` : ''}${item.notes ? `\n  Notes: ${item.notes}` : ''}`).join('\n\n');
    await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const moveItem = (index: number, dir: -1 | 1) => {
    const newItems = [...items];
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= newItems.length) return;
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
    setItems(newItems);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/" className="p-2 hover:bg-gray-800 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
          <div><h1 className="text-2xl font-bold flex items-center gap-2"><ClipboardList className="w-6 h-6 text-amber-400" /> Agenda Builder</h1></div>
        </div>
        <div className="p-4 bg-gray-900 rounded-xl border border-gray-800 mb-6">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-3"><label className="block text-xs text-gray-500 mb-1">Meeting Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none" /></div>
            <div><label className="block text-xs text-gray-500 mb-1">Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-sm" /></div>
            <div><label className="block text-xs text-gray-500 mb-1">Start Time</label>
              <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-sm" /></div>
            <div className="flex items-end gap-3">
              <div className="text-sm text-gray-400"><Clock className="w-4 h-4 inline mr-1" />{totalMinutes} min | Ends {endTime}</div>
            </div>
          </div>
        </div>
        <div className="space-y-2 mb-4">
          {items.map((item, idx) => (
            <div key={item.id} className="p-3 bg-gray-900 rounded-xl border border-gray-800">
              <div className="flex items-start gap-2">
                <div className="flex flex-col gap-1 pt-1">
                  <button onClick={() => moveItem(idx, -1)} className="text-gray-600 hover:text-gray-300 text-xs">▲</button>
                  <GripVertical className="w-4 h-4 text-gray-600" />
                  <button onClick={() => moveItem(idx, 1)} className="text-gray-600 hover:text-gray-300 text-xs">▼</button>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-mono w-20">{getTimeForItem(idx)}</span>
                    <input value={item.topic} onChange={e => updateItem(item.id, 'topic', e.target.value)} placeholder="Topic..." className="flex-1 p-1.5 bg-gray-800 border border-gray-700 rounded text-sm focus:outline-none" />
                  </div>
                  <div className="flex gap-2">
                    <input value={item.presenter} onChange={e => updateItem(item.id, 'presenter', e.target.value)} placeholder="Presenter..." className="flex-1 p-1.5 bg-gray-800 border border-gray-700 rounded text-xs focus:outline-none" />
                    <div className="flex items-center gap-1">
                      <input type="number" value={item.duration} onChange={e => updateItem(item.id, 'duration', +e.target.value)} min={1} className="w-14 p-1.5 bg-gray-800 border border-gray-700 rounded text-xs text-center" />
                      <span className="text-xs text-gray-500">min</span>
                    </div>
                  </div>
                  <input value={item.notes} onChange={e => updateItem(item.id, 'notes', e.target.value)} placeholder="Notes..." className="w-full p-1.5 bg-gray-800 border border-gray-700 rounded text-xs focus:outline-none" />
                </div>
                <button onClick={() => removeItem(item.id)} className="p-1 text-red-400 hover:bg-red-500/20 rounded"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={addItem} className="flex items-center gap-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded-lg text-sm"><Plus className="w-4 h-4" /> Add Item</button>
          <button onClick={copyAgenda} className="flex items-center gap-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm">{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} Copy Agenda</button>
        </div>
      </div>
    </div>
  );
}
