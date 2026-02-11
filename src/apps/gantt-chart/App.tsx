import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Download, GanttChart } from 'lucide-react';

interface Task { id: string; name: string; start: string; end: string; progress: number; color: string; }

const colors = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#a855f7', '#ec4899', '#14b8a6', '#f97316'];

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', name: 'Planning', start: '2024-01-01', end: '2024-01-15', progress: 100, color: '#3b82f6' },
    { id: '2', name: 'Design', start: '2024-01-10', end: '2024-01-25', progress: 75, color: '#22c55e' },
    { id: '3', name: 'Development', start: '2024-01-20', end: '2024-02-20', progress: 40, color: '#f59e0b' },
    { id: '4', name: 'Testing', start: '2024-02-15', end: '2024-03-01', progress: 0, color: '#ef4444' },
  ]);

  const addTask = () => setTasks(prev => [...prev, { id: crypto.randomUUID(), name: 'New Task', start: '2024-01-01', end: '2024-01-15', progress: 0, color: colors[prev.length % colors.length] }]);

  const updateTask = (id: string, field: keyof Task, value: string | number) => setTasks(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));

  const removeTask = (id: string) => setTasks(prev => prev.filter(t => t.id !== id));

  const allDates = tasks.flatMap(t => [new Date(t.start).getTime(), new Date(t.end).getTime()]);
  const minDate = allDates.length ? Math.min(...allDates) : Date.now();
  const maxDate = allDates.length ? Math.max(...allDates) : Date.now();
  const totalDays = Math.max(1, Math.ceil((maxDate - minDate) / 86400000));

  const getBarStyle = (task: Task) => {
    const start = Math.max(0, (new Date(task.start).getTime() - minDate) / 86400000);
    const duration = Math.max(1, (new Date(task.end).getTime() - new Date(task.start).getTime()) / 86400000);
    return { left: `${(start / totalDays) * 100}%`, width: `${(duration / totalDays) * 100}%` };
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'gantt.json'; a.click();
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/" className="p-2 hover:bg-gray-800 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
          <div><h1 className="text-2xl font-bold flex items-center gap-2"><GanttChart className="w-6 h-6 text-blue-400" /> Gantt Chart</h1></div>
          <div className="flex-1" />
          <button onClick={addTask} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm"><Plus className="w-4 h-4" /> Add Task</button>
          <button onClick={exportJson} className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm"><Download className="w-4 h-4" /> Export</button>
        </div>
        <div className="p-4 bg-gray-900 rounded-xl border border-gray-800 mb-6 overflow-x-auto">
          <div className="min-w-[600px]">
            {tasks.map(task => {
              const barStyle = getBarStyle(task);
              return (
                <div key={task.id} className="flex items-center gap-3 mb-3">
                  <div className="w-32 shrink-0"><input value={task.name} onChange={e => updateTask(task.id, 'name', e.target.value)} className="w-full p-1 bg-transparent text-sm font-medium focus:outline-none focus:bg-gray-800 rounded" /></div>
                  <div className="flex-1 relative h-8 bg-gray-800 rounded-lg overflow-hidden">
                    <div className="absolute h-full rounded-lg flex items-center" style={{ ...barStyle, backgroundColor: task.color + '40', borderLeft: `3px solid ${task.color}` }}>
                      <div className="h-full rounded-lg" style={{ width: `${task.progress}%`, backgroundColor: task.color + '80' }} />
                    </div>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">{task.progress}%</span>
                  </div>
                  <input type="date" value={task.start} onChange={e => updateTask(task.id, 'start', e.target.value)} className="w-32 p-1 bg-gray-800 border border-gray-700 rounded text-xs" />
                  <input type="date" value={task.end} onChange={e => updateTask(task.id, 'end', e.target.value)} className="w-32 p-1 bg-gray-800 border border-gray-700 rounded text-xs" />
                  <input type="range" min={0} max={100} value={task.progress} onChange={e => updateTask(task.id, 'progress', +e.target.value)} className="w-16 accent-blue-500" />
                  <input type="color" value={task.color} onChange={e => updateTask(task.id, 'color', e.target.value)} className="w-6 h-6 rounded cursor-pointer" />
                  <button onClick={() => removeTask(task.id)} className="p-1 hover:bg-red-500/20 text-red-400 rounded"><Trash2 className="w-4 h-4" /></button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
