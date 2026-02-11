import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Pen, Square, Circle, Type, Eraser, Trash2, Download, Undo2, Palette } from 'lucide-react';

type Tool = 'pen' | 'rect' | 'circle' | 'text' | 'eraser';
interface DrawAction { type: Tool; points?: { x: number; y: number }[]; start?: { x: number; y: number }; end?: { x: number; y: number }; color: string; size: number; text?: string; }

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState('#3b82f6');
  const [size, setSize] = useState(3);
  const [actions, setActions] = useState<DrawAction[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [current, setCurrent] = useState<DrawAction | null>(null);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);

  const colors = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#a855f7', '#ec4899', '#ffffff', '#000000'];

  const redraw = (ctx: CanvasRenderingContext2D, acts: DrawAction[]) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    acts.forEach(a => {
      ctx.strokeStyle = a.type === 'eraser' ? '#030712' : a.color;
      ctx.fillStyle = a.color;
      ctx.lineWidth = a.type === 'eraser' ? a.size * 5 : a.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      if (a.type === 'pen' || a.type === 'eraser') {
        if (a.points && a.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(a.points[0].x, a.points[0].y);
          a.points.forEach(p => ctx.lineTo(p.x, p.y));
          ctx.stroke();
        }
      } else if (a.type === 'rect' && a.start && a.end) {
        ctx.strokeRect(a.start.x, a.start.y, a.end.x - a.start.x, a.end.y - a.start.y);
      } else if (a.type === 'circle' && a.start && a.end) {
        const r = Math.sqrt((a.end.x - a.start.x) ** 2 + (a.end.y - a.start.y) ** 2);
        ctx.beginPath(); ctx.arc(a.start.x, a.start.y, r, 0, Math.PI * 2); ctx.stroke();
      } else if (a.type === 'text' && a.start && a.text) {
        ctx.font = `${a.size * 6}px sans-serif`; ctx.fillText(a.text, a.start.x, a.start.y);
      }
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) redraw(ctx, actions);
  }, [actions]);

  const getPos = (e: React.MouseEvent) => {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const onDown = (e: React.MouseEvent) => {
    const pos = getPos(e);
    if (tool === 'text') {
      const text = prompt('Enter text:');
      if (text) setActions(prev => [...prev, { type: 'text', start: pos, color, size, text }]);
      return;
    }
    setDrawing(true); setStartPos(pos);
    if (tool === 'pen' || tool === 'eraser') setCurrent({ type: tool, points: [pos], color, size });
    else setCurrent({ type: tool, start: pos, end: pos, color, size });
  };

  const onMove = (e: React.MouseEvent) => {
    if (!drawing || !current) return;
    const pos = getPos(e);
    if (tool === 'pen' || tool === 'eraser') setCurrent(prev => prev ? { ...prev, points: [...(prev.points || []), pos] } : null);
    else setCurrent(prev => prev ? { ...prev, end: pos } : null);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) { redraw(ctx, actions); redraw(ctx, [current]); }
  };

  const onUp = () => {
    if (current) setActions(prev => [...prev, current]);
    setDrawing(false); setCurrent(null); setStartPos(null);
  };

  const undo = () => setActions(prev => prev.slice(0, -1));
  const clear = () => setActions([]);
  const download = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    const a = document.createElement('a'); a.download = 'whiteboard.png'; a.href = canvas.toDataURL(); a.click();
  };

  const tools: { id: Tool; icon: any; label: string }[] = [
    { id: 'pen', icon: Pen, label: 'Pen' }, { id: 'rect', icon: Square, label: 'Rectangle' },
    { id: 'circle', icon: Circle, label: 'Circle' }, { id: 'text', icon: Type, label: 'Text' },
    { id: 'eraser', icon: Eraser, label: 'Eraser' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="p-4">
        <div className="flex items-center gap-4 mb-4">
          <Link to="/" className="p-2 hover:bg-gray-800 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
          <h1 className="text-xl font-bold flex items-center gap-2"><Palette className="w-5 h-5 text-teal-400" /> Whiteboard</h1>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            {tools.map(t => <button key={t.id} onClick={() => setTool(t.id)} className={`p-2 rounded-lg ${tool === t.id ? 'bg-teal-600' : 'bg-gray-800 hover:bg-gray-700'}`} title={t.label}><t.icon className="w-4 h-4" /></button>)}
            <div className="w-px h-6 bg-gray-700 mx-1" />
            <div className="flex gap-1">{colors.map(c => <button key={c} onClick={() => setColor(c)} className={`w-6 h-6 rounded-full border-2 ${color === c ? 'border-white' : 'border-transparent'}`} style={{ backgroundColor: c }} />)}</div>
            <div className="w-px h-6 bg-gray-700 mx-1" />
            <input type="range" min={1} max={10} value={size} onChange={e => setSize(+e.target.value)} className="w-20" />
            <div className="w-px h-6 bg-gray-700 mx-1" />
            <button onClick={undo} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg" title="Undo"><Undo2 className="w-4 h-4" /></button>
            <button onClick={clear} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-red-400" title="Clear"><Trash2 className="w-4 h-4" /></button>
            <button onClick={download} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg" title="Download"><Download className="w-4 h-4" /></button>
          </div>
        </div>
        <canvas ref={canvasRef} className="w-full bg-gray-900 rounded-xl border border-gray-800 cursor-crosshair" style={{ height: 'calc(100vh - 100px)' }}
          onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp} />
      </div>
    </div>
  );
}
