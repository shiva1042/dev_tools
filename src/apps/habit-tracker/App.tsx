import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, CheckCircle2, Circle, Target } from 'lucide-react';

interface Habit { id: string; name: string; color: string; completions: string[]; }

const STORAGE_KEY = 'habit-tracker-data';
const colors = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#a855f7', '#ec4899', '#14b8a6'];

const today = () => new Date().toISOString().split('T')[0];
const last30Days = () => Array.from({ length: 30 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (29 - i)); return d.toISOString().split('T')[0]; });

export default function App() {
  const [habits, setHabits] = useState<Habit[]>(() => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; } });
  const [newName, setNewName] = useState('');

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(habits)); }, [habits]);

  const addHabit = () => { if (!newName.trim()) return; setHabits(prev => [...prev, { id: crypto.randomUUID(), name: newName.trim(), color: colors[prev.length % colors.length], completions: [] }]); setNewName(''); };

  const toggleDay = (habitId: string, date: string) => setHabits(prev => prev.map(h => h.id === habitId ? { ...h, completions: h.completions.includes(date) ? h.completions.filter(d => d !== date) : [...h.completions, date] } : h));

  const getStreak = (habit: Habit) => {
    let streak = 0; const d = new Date();
    while (true) { const ds = d.toISOString().split('T')[0]; if (habit.completions.includes(ds)) { streak++; d.setDate(d.getDate() - 1); } else break; }
    return streak;
  };

  const getLongestStreak = (habit: Habit) => {
    const sorted = [...habit.completions].sort();
    let max = 0, cur = 0;
    for (let i = 0; i < sorted.length; i++) {
      if (i === 0) { cur = 1; } else {
        const prev = new Date(sorted[i - 1]); prev.setDate(prev.getDate() + 1);
        cur = prev.toISOString().split('T')[0] === sorted[i] ? cur + 1 : 1;
      }
      max = Math.max(max, cur);
    }
    return max;
  };

  const days = last30Days();

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 hover:bg-gray-800 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
          <div><h1 className="text-2xl font-bold flex items-center gap-2"><Target className="w-6 h-6 text-green-400" /> Habit Tracker</h1>
          <p className="text-gray-400 text-sm">{habits.length} habits tracked</p></div>
        </div>
        <div className="flex gap-2 mb-6">
          <input value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addHabit()} placeholder="New habit name..." className="flex-1 p-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-green-500" />
          <button onClick={addHabit} disabled={!newName.trim()} className="flex items-center gap-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg text-sm"><Plus className="w-4 h-4" /> Add</button>
        </div>
        <div className="space-y-4">
          {habits.length === 0 ? <div className="text-center py-16 text-gray-500"><Target className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>No habits yet. Add one above!</p></div> :
          habits.map(habit => {
            const streak = getStreak(habit);
            const longest = getLongestStreak(habit);
            const rate = days.length > 0 ? Math.round((days.filter(d => habit.completions.includes(d)).length / days.length) * 100) : 0;
            return (
              <div key={habit.id} className="p-4 bg-gray-900 rounded-xl border border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: habit.color }} />
                    <span className="font-medium">{habit.name}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span>Streak: <span className="text-green-400 font-bold">{streak}</span></span>
                    <span>Best: <span className="text-yellow-400 font-bold">{longest}</span></span>
                    <span>Rate: <span className="text-blue-400 font-bold">{rate}%</span></span>
                    <button onClick={() => setHabits(prev => prev.filter(h => h.id !== habit.id))} className="p-1 hover:bg-red-500/20 text-red-400 rounded"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="flex gap-1">
                  {days.map(d => {
                    const done = habit.completions.includes(d);
                    const isToday = d === today();
                    return <button key={d} onClick={() => toggleDay(habit.id, d)} className={`flex-1 h-7 rounded-sm transition-all ${done ? '' : 'opacity-30 hover:opacity-60'} ${isToday ? 'ring-1 ring-white/30' : ''}`} style={{ backgroundColor: done ? habit.color : '#374151' }} title={d} />;
                  })}
                </div>
                <div className="flex justify-between text-[10px] text-gray-600 mt-1">
                  <span>{days[0]}</span><span>{days[days.length - 1]}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
