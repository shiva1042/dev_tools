import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download, Copy, Check, Barcode } from 'lucide-react';

export default function App() {
  const [text, setText] = useState('Hello World');
  const [type, setType] = useState<'qr' | 'code128'>('qr');
  const [size, setSize] = useState(200);
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);

  // Simple QR-like pattern generator (visual representation)
  const drawQR = (ctx: CanvasRenderingContext2D, data: string, s: number) => {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, s, s);
    const modules = 21;
    const cellSize = s / (modules + 2);
    const offset = cellSize;
    ctx.fillStyle = fgColor;

    // Generate deterministic pattern from text
    const hash = (str: string, i: number) => {
      let h = i * 31;
      for (let c = 0; c < str.length; c++) h = ((h << 5) - h + str.charCodeAt(c)) | 0;
      return h;
    };

    // Finder patterns
    const drawFinder = (x: number, y: number) => {
      for (let r = 0; r < 7; r++) for (let c = 0; c < 7; c++) {
        if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
          ctx.fillRect(offset + (x + c) * cellSize, offset + (y + r) * cellSize, cellSize, cellSize);
        }
      }
    };
    drawFinder(0, 0); drawFinder(modules - 7, 0); drawFinder(0, modules - 7);

    // Timing patterns
    for (let i = 8; i < modules - 8; i++) {
      if (i % 2 === 0) {
        ctx.fillRect(offset + 6 * cellSize, offset + i * cellSize, cellSize, cellSize);
        ctx.fillRect(offset + i * cellSize, offset + 6 * cellSize, cellSize, cellSize);
      }
    }

    // Data area
    for (let r = 0; r < modules; r++) for (let c = 0; c < modules; c++) {
      if ((r < 9 && c < 9) || (r < 9 && c > modules - 9) || (r > modules - 9 && c < 9)) continue;
      if (r === 6 || c === 6) continue;
      if (hash(data, r * modules + c) % 3 === 0) {
        ctx.fillRect(offset + c * cellSize, offset + r * cellSize, cellSize, cellSize);
      }
    }
  };

  // Simple Code128-like barcode
  const drawCode128 = (ctx: CanvasRenderingContext2D, data: string, w: number, h: number) => {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = fgColor;
    const barH = h * 0.7;
    const startY = (h - barH - 20) / 2;
    let x = 10;
    const barWidth = Math.max(1, (w - 20) / (data.length * 11 + 35));

    // Start code
    [2, 1, 1, 1, 4, 1, 2].forEach(b => { ctx.fillRect(x, startY, barWidth * b, barH); x += barWidth * (b + 1); });

    for (let i = 0; i < data.length && x < w - 20; i++) {
      const code = data.charCodeAt(i);
      const pattern = [(code % 4) + 1, ((code >> 2) % 3) + 1, ((code >> 4) % 2) + 1, ((code >> 6) % 3) + 1];
      pattern.forEach((b, j) => {
        if (j % 2 === 0) ctx.fillRect(x, startY, barWidth * b, barH);
        x += barWidth * b;
      });
    }

    // Stop code
    [2, 3, 1, 1, 1, 1, 2].forEach((b, i) => {
      if (i % 2 === 0) ctx.fillRect(x, startY, barWidth * b, barH);
      x += barWidth * b;
    });

    // Text below
    ctx.fillStyle = fgColor;
    ctx.font = `${Math.min(14, h * 0.1)}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(data, w / 2, startY + barH + 16);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !text) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (type === 'qr') { canvas.width = size; canvas.height = size; drawQR(ctx, text, size); }
    else { canvas.width = size * 1.5; canvas.height = size * 0.6; drawCode128(ctx, text, size * 1.5, size * 0.6); }
  }, [text, type, size, fgColor, bgColor]);

  const download = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    const a = document.createElement('a'); a.download = `${type}-${Date.now()}.png`; a.href = canvas.toDataURL(); a.click();
  };

  const copyImage = async () => {
    const canvas = canvasRef.current; if (!canvas) return;
    canvas.toBlob(async blob => { if (!blob) return; await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]); setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/" className="p-2 hover:bg-gray-800 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Barcode className="w-6 h-6 text-cyan-400" /> Barcode Generator</h1>
        </div>
        <div className="p-4 bg-gray-900 rounded-xl border border-gray-800 mb-4 space-y-4">
          <div><label className="block text-sm text-gray-400 mb-1">Content</label>
            <input value={text} onChange={e => setText(e.target.value)} className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none" placeholder="Enter text or URL..." /></div>
          <div className="grid grid-cols-4 gap-3">
            <div><label className="block text-xs text-gray-500 mb-1">Type</label>
              <select value={type} onChange={e => setType(e.target.value as 'qr' | 'code128')} className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-sm">
                <option value="qr">QR Code</option><option value="code128">Code 128</option>
              </select></div>
            <div><label className="block text-xs text-gray-500 mb-1">Size</label>
              <input type="number" value={size} onChange={e => setSize(+e.target.value)} min={100} max={600} step={50} className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-sm" /></div>
            <div><label className="block text-xs text-gray-500 mb-1">Foreground</label>
              <input type="color" value={fgColor} onChange={e => setFgColor(e.target.value)} className="w-full h-9 rounded cursor-pointer" /></div>
            <div><label className="block text-xs text-gray-500 mb-1">Background</label>
              <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-full h-9 rounded cursor-pointer" /></div>
          </div>
        </div>
        <div className="p-8 bg-gray-900 rounded-xl border border-gray-800 flex flex-col items-center gap-4">
          <canvas ref={canvasRef} className="rounded-lg" />
          <div className="flex gap-2">
            <button onClick={download} className="flex items-center gap-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-sm"><Download className="w-4 h-4" /> Download</button>
            <button onClick={copyImage} className="flex items-center gap-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm">{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} Copy</button>
          </div>
        </div>
      </div>
    </div>
  );
}
