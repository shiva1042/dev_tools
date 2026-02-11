import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Copy, Check, Clock } from 'lucide-react';

const timezones = [
  { label: 'US Pacific (PT)', offset: -8 }, { label: 'US Mountain (MT)', offset: -7 },
  { label: 'US Central (CT)', offset: -6 }, { label: 'US Eastern (ET)', offset: -5 },
  { label: 'UTC/GMT', offset: 0 }, { label: 'UK (GMT)', offset: 0 },
  { label: 'Central Europe (CET)', offset: 1 }, { label: 'Eastern Europe (EET)', offset: 2 },
  { label: 'India (IST)', offset: 5.5 }, { label: 'China (CST)', offset: 8 },
  { label: 'Japan (JST)', offset: 9 }, { label: 'Australia (AEST)', offset: 10 },
  { label: 'New Zealand (NZST)', offset: 12 },
];

interface Participant { id: string; name: string; tzIdx: number; }

export default function App() {
  const [participants, setParticipants] = useState<Participant[]>([
    { id: '1', name: 'Alice', tzIdx: 3 }, { id: '2', name: 'Bob', tzIdx: 8 },
  ]);
  const [copied, setCopied] = useState(false);

  const addParticipant = () => setParticipants(prev => [...prev, { id: crypto.randomUUID(), name: '', tzIdx: 4 }]);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const businessStart = 9; const businessEnd = 17;

  const isOverlap = (hour: number) => participants.every(p => {
    const localHour = (hour + timezones[p.tzIdx].offset + 24) % 24;
    return localHour >= businessStart && localHour < businessEnd;
  });

  const bestSlots = hours.filter(isOverlap);

  const formatHour = (h: number) => `${h.toString().padStart(2, '0')}:00`;

  const copy = async () => {
    const text = bestSlots.map(h => {
      const lines = participants.map(p => `  ${p.name || 'Participant'}: ${formatHour(Math.floor((h + timezones[p.tzIdx].offset + 24) % 24))}:00 ${timezones[p.tzIdx].label}`);
      return `UTC ${formatHour(h)}:\n${lines.join('\n')}`;
    }).join('\n\n');
    await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/" className="p-2 hover:bg-gray-800 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
          <div><h1 className="text-2xl font-bold flex items-center gap-2"><Clock className="w-6 h-6 text-sky-400" /> Meeting Scheduler</h1>
          <p className="text-gray-400 text-sm">Find overlapping availability across time zones</p></div>
        </div>
        <div className="p-4 bg-gray-900 rounded-xl border border-gray-800 mb-6">
          <h3 className="text-sm text-gray-400 mb-3">Participants</h3>
          {participants.map(p => (
            <div key={p.id} className="flex items-center gap-3 mb-2">
              <input value={p.name} onChange={e => setParticipants(prev => prev.map(pp => pp.id === p.id ? { ...pp, name: e.target.value } : pp))} placeholder="Name" className="w-32 p-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none" />
              <select value={p.tzIdx} onChange={e => setParticipants(prev => prev.map(pp => pp.id === p.id ? { ...pp, tzIdx: +e.target.value } : pp))} className="flex-1 p-2 bg-gray-800 border border-gray-700 rounded-lg text-sm">
                {timezones.map((tz, i) => <option key={i} value={i}>{tz.label} (UTC{tz.offset >= 0 ? '+' : ''}{tz.offset})</option>)}
              </select>
              <button onClick={() => setParticipants(prev => prev.filter(pp => pp.id !== p.id))} className="p-1 text-red-400 hover:bg-red-500/20 rounded"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
          <button onClick={addParticipant} className="flex items-center gap-1 text-sm text-sky-400 mt-2"><Plus className="w-4 h-4" /> Add Participant</button>
        </div>
        <div className="p-4 bg-gray-900 rounded-xl border border-gray-800 mb-6 overflow-x-auto">
          <h3 className="text-sm text-gray-400 mb-3">Time Grid (UTC hours → Local time)</h3>
          <div className="min-w-[700px]">
            <div className="flex items-center gap-0.5 mb-2">
              <div className="w-24 shrink-0 text-xs text-gray-500">UTC</div>
              {hours.map(h => <div key={h} className="flex-1 text-center text-xs text-gray-500">{h}</div>)}
            </div>
            {participants.map(p => (
              <div key={p.id} className="flex items-center gap-0.5 mb-1">
                <div className="w-24 shrink-0 text-xs text-gray-400 truncate">{p.name || 'Participant'}</div>
                {hours.map(h => {
                  const local = Math.floor((h + timezones[p.tzIdx].offset + 24) % 24);
                  const isBusiness = local >= businessStart && local < businessEnd;
                  return <div key={h} className={`flex-1 h-6 rounded-sm text-center text-[10px] leading-6 ${isBusiness ? 'bg-green-500/30 text-green-400' : 'bg-gray-800 text-gray-600'}`}>{local}</div>;
                })}
              </div>
            ))}
            <div className="flex items-center gap-0.5 mt-2">
              <div className="w-24 shrink-0 text-xs text-gray-500">Overlap</div>
              {hours.map(h => <div key={h} className={`flex-1 h-6 rounded-sm ${isOverlap(h) ? 'bg-sky-500/40' : 'bg-gray-800'}`} />)}
            </div>
          </div>
        </div>
        <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm text-gray-400">Best Meeting Times ({bestSlots.length} slots)</h3>
            <button onClick={copy} disabled={bestSlots.length === 0} className="flex items-center gap-1 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 rounded-lg text-sm">{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} Copy</button>
          </div>
          {bestSlots.length === 0 ? <p className="text-gray-500 text-sm">No overlapping business hours found</p> :
          <div className="flex flex-wrap gap-2">{bestSlots.map(h => <span key={h} className="px-3 py-1.5 bg-sky-500/20 text-sky-400 rounded-lg text-sm font-mono">UTC {formatHour(h)}</span>)}</div>}
        </div>
      </div>
    </div>
  );
}
