import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download, Upload, Minimize2, Copy, Check, PenTool } from 'lucide-react';

const svgTemplates = [
  { name: 'Rectangle', code: '<rect x="10" y="10" width="100" height="60" fill="#3b82f6" rx="8" />' },
  { name: 'Circle', code: '<circle cx="60" cy="60" r="50" fill="#ef4444" />' },
  { name: 'Line', code: '<line x1="10" y1="10" x2="100" y2="100" stroke="#22c55e" stroke-width="3" />' },
  { name: 'Ellipse', code: '<ellipse cx="60" cy="40" rx="50" ry="30" fill="#a855f7" />' },
  { name: 'Polygon', code: '<polygon points="60,10 110,90 10,90" fill="#f59e0b" />' },
  { name: 'Text', code: '<text x="10" y="40" font-size="24" fill="white">Hello SVG</text>' },
  { name: 'Path', code: '<path d="M10 80 Q 95 10 180 80" stroke="#ec4899" fill="none" stroke-width="3" />' },
];

function optimizeSvg(svg: string): string {
  let opt = svg;
  opt = opt.replace(/<!--[\s\S]*?-->/g, '');
  opt = opt.replace(/\s+/g, ' ');
  opt = opt.replace(/\s*\/>/g, '/>');
  opt = opt.replace(/\s*>/g, '>');
  opt = opt.replace(/>\s+</g, '><');
  opt = opt.replace(/\s(xmlns:[\w-]+="[^"]*")/g, '');
  opt = opt.replace(/\s(data-[\w-]+="[^"]*")/g, '');
  return opt.trim();
}

export default function App() {
  const [svg, setSvg] = useState(`<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">\n  <circle cx="100" cy="100" r="80" fill="#3b82f6" />\n  <text x="100" y="108" text-anchor="middle" fill="white" font-size="20">SVG</text>\n</svg>`);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const optimized = optimizeSvg(svg);
  const originalSize = new Blob([svg]).size;
  const optimizedSize = new Blob([optimized]).size;
  const savings = originalSize > 0 ? Math.round((1 - optimizedSize / originalSize) * 100) : 0;

  const copy = async (text: string) => { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const download = (content: string, name: string) => {
    const blob = new Blob([content], { type: 'image/svg+xml' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click();
  };

  const upload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader(); reader.onload = ev => setSvg(ev.target?.result as string || ''); reader.readAsText(file);
  };

  const insertTemplate = (code: string) => {
    const idx = svg.lastIndexOf('</svg>');
    if (idx >= 0) setSvg(svg.slice(0, idx) + '  ' + code + '\n' + svg.slice(idx));
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/" className="p-2 hover:bg-gray-800 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
          <div><h1 className="text-2xl font-bold flex items-center gap-2"><PenTool className="w-6 h-6 text-violet-400" /> SVG Editor</h1>
          <p className="text-gray-400 text-sm">Edit, preview & optimize SVG files</p></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex gap-2">
              <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm"><Upload className="w-4 h-4" /> Upload</button>
              <input ref={fileRef} type="file" accept=".svg" onChange={upload} hidden />
              <button onClick={() => { setSvg(optimized); }} className="flex items-center gap-1 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 rounded-lg text-sm"><Minimize2 className="w-4 h-4" /> Optimize</button>
              <button onClick={() => download(svg, 'image.svg')} className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm"><Download className="w-4 h-4" /> Download</button>
              <button onClick={() => copy(svg)} className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm">{copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}</button>
            </div>
            <textarea value={svg} onChange={e => setSvg(e.target.value)} rows={18} className="w-full p-4 bg-gray-900 border border-gray-800 rounded-xl font-mono text-sm text-green-300 resize-none focus:outline-none focus:border-violet-500" spellCheck={false} />
            <div className="flex gap-4 text-xs text-gray-400">
              <span>Original: <span className="text-white">{originalSize}B</span></span>
              <span>Optimized: <span className="text-green-400">{optimizedSize}B</span></span>
              {savings > 0 && <span className="text-green-400">-{savings}%</span>}
            </div>
          </div>
          <div className="space-y-4">
            <div className="p-6 bg-gray-900 rounded-xl border border-gray-800 min-h-[300px] flex items-center justify-center" style={{ background: 'repeating-conic-gradient(#1f2937 0% 25%, #111827 0% 50%) 50% / 20px 20px' }}>
              <div dangerouslySetInnerHTML={{ __html: svg }} className="max-w-full max-h-[400px] [&>svg]:max-w-full [&>svg]:max-h-[380px]" />
            </div>
            <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
              <h3 className="text-sm text-gray-400 mb-3">Insert Element</h3>
              <div className="grid grid-cols-2 gap-2">
                {svgTemplates.map(t => (
                  <button key={t.name} onClick={() => insertTemplate(t.code)} className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-left">{t.name}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
