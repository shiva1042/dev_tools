import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Calendar } from 'lucide-react';

interface Task { id: string; title: string; hour: number; color: string; priority: 'high' | 'medium' | 'low'; }

const STORAGE_KEY = 'daily-planner-data';
const priorityColors = { high: '#ef4444', medium: '#f59e0b', low: '#22c55e' };
const taskColors = ['#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export default function App() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [tasks, setTasks] = useState<Record<string, Task[]>>(() => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; } });

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }, [tasks]);

  const dayTasks = tasks[date] || [];
  const hours = Array.from({ length: 18 }, (_, i) => i + 6); // 6 AM to 11 PM

  const addTask = (hour: number) => {
    const newTask: Task = { id: crypto.randomUUID(), title: 'New Task', hour, color: taskColors[dayTasks.length % taskColors.length], priority: 'medium' };
    setTasks(prev => ({ ...prev, [date]: [...(prev[date] || []), newTask] }));
  };

  const updateTask = (id: string, field: keyof Task, value: string | number) => setTasks(prev => ({ ...prev, [date]: (prev[date] || []).map(t => t.id === id ? { ...t, [field]: value } : t) }));

  const removeTask = (id: string) => setTasks(prev => ({ ...prev, [date]: (prev[date] || []).filter(t => t.id !== id) }));

  const currentHour = new Date().getHours();
  const totalScheduled = dayTasks.length;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/" className="p-2 hover:bg-gray-800 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
          <div><h1 className="text-2xl font-bold flex items-center gap-2"><Calendar className="w-6 h-6 text-blue-400" /> Daily Planner</h1></div>
          <div className="flex-1" />
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="p-2 bg-gray-800 border border-gray-700 rounded-lg text-sm" />
          <span className="text-sm text-gray-400">{totalScheduled} tasks</span>
        </div>
        <div className="space-y-0.5">
          {hours.map(hour => {
            const hourTasks = dayTasks.filter(t => t.hour === hour);
            const isCurrent = hour === currentHour && date === new Date().toISOString().split('T')[0];
            return (
              <div key={hour} className={`flex gap-3 p-2 rounded-lg ${isCurrent ? 'bg-blue-500/10 border border-blue-500/30' : 'hover:bg-gray-900/50'}`}>
                <div className="w-16 shrink-0 text-right text-sm text-gray-500 pt-1">{hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}</div>
                <div className="flex-1 min-h-[40px] border-l-2 border-gray-800 pl-3">
                  {hourTasks.map(task => (
                    <div key={task.id} className="flex items-center gap-2 p-2 rounded-lg mb-1" style={{ backgroundColor: task.color + '20', borderLeft: `3px solid ${task.color}` }}>
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: priorityColors[task.priority] }} />
                      <input value={task.title} onChange={e => updateTask(task.id, 'title', e.target.value)} className="flex-1 bg-transparent text-sm focus:outline-none" />
                      <select value={task.priority} onChange={e => updateTask(task.id, 'priority', e.target.value)} className="bg-transparent text-xs text-gray-400 focus:outline-none">
                        <option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
                      </select>
                      <button onClick={() => removeTask(task.id)} className="p-0.5 text-red-400 hover:bg-red-500/20 rounded opacity-0 group-hover:opacity-100"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  ))}
                  <button onClick={() => addTask(hour)} className="w-full text-left text-xs text-gray-600 hover:text-gray-400 p-1 rounded"><Plus className="w-3 h-3 inline" /> Add task</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
