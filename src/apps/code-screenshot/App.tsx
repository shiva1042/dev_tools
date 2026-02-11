import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download, Camera, Copy } from 'lucide-react';
import { toPng } from 'html-to-image';

const themes = [
  { name: 'Dark', bg: '#1e1e2e', text: '#cdd6f4', keyword: '#cba6f7', string: '#a6e3a1', comment: '#6c7086', number: '#fab387' },
  { name: 'Monokai', bg: '#272822', text: '#f8f8f2', keyword: '#f92672', string: '#e6db74', comment: '#75715e', number: '#ae81ff' },
  { name: 'Dracula', bg: '#282a36', text: '#f8f8f2', keyword: '#ff79c6', string: '#50fa7b', comment: '#6272a4', number: '#bd93f9' },
  { name: 'Light', bg: '#ffffff', text: '#383a42', keyword: '#a626a4', string: '#50a14f', comment: '#a0a1a7', number: '#986801' },
];

const backgrounds = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#fee140', '#0c0c0c', '#1a1a2e', '#16213e'];

const keywords = ['function', 'const', 'let', 'var', 'if', 'else', 'return', 'import', 'export', 'from', 'class', 'extends', 'new', 'this', 'async', 'await', 'for', 'while', 'switch', 'case', 'default', 'break', 'try', 'catch', 'throw', 'typeof', 'interface', 'type'];

function highlightCode(code: string, theme: typeof themes[0]) {
  return code.split('\n').map(line => {
    let html = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    html = html.replace(/(\/\/.*$)/gm, `<span style="color:${theme.comment}">$1</span>`);
    html = html.replace(/(["'`])(?:(?!\1).)*\1/g, `<span style="color:${theme.string}">$&</span>`);
    html = html.replace(/\b(\d+\.?\d*)\b/g, `<span style="color:${theme.number}">$1</span>`);
    const kwRegex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g');
    html = html.replace(kwRegex, `<span style="color:${theme.keyword};font-weight:bold">$1</span>`);
    return html;
  }).join('\n');
}

export default function App() {
  const [code, setCode] = useState(`function fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}\n\nconst result = fibonacci(10);\nconsole.log("Result:", result);`);
  const [themeIdx, setThemeIdx] = useState(0);
  const [bgColor, setBgColor] = useState('#667eea');
  const [padding, setPadding] = useState(32);
  const [fontSize, setFontSize] = useState(14);
  const [windowStyle, setWindowStyle] = useState<'mac' | 'none'>('mac');
  const ref = useRef<HTMLDivElement>(null);

  const theme = themes[themeIdx];

  const exportPng = async () => {
    if (!ref.current) return;
    const dataUrl = await toPng(ref.current, { pixelRatio: 2 });
    const a = document.createElement('a'); a.href = dataUrl; a.download = 'code-screenshot.png'; a.click();
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/" className="p-2 hover:bg-gray-800 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
          <div><h1 className="text-2xl font-bold flex items-center gap-2"><Camera className="w-6 h-6 text-pink-400" /> Code Screenshot</h1>
          <p className="text-gray-400 text-sm">Generate beautiful code screenshots</p></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="space-y-4">
            <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
              <h3 className="text-sm text-gray-400 mb-3">Theme</h3>
              <div className="grid grid-cols-2 gap-2">{themes.map((t, i) => <button key={t.name} onClick={() => setThemeIdx(i)} className={`px-3 py-1.5 rounded text-xs ${themeIdx === i ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' : 'bg-gray-800 text-gray-400'}`}>{t.name}</button>)}</div>
            </div>
            <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
              <h3 className="text-sm text-gray-400 mb-3">Background</h3>
              <div className="flex flex-wrap gap-2">{backgrounds.map(c => <button key={c} onClick={() => setBgColor(c)} className={`w-7 h-7 rounded-lg border-2 ${bgColor === c ? 'border-white' : 'border-transparent'}`} style={{ background: c }} />)}</div>
            </div>
            <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
              <h3 className="text-sm text-gray-400 mb-2">Padding: {padding}px</h3>
              <input type="range" min={8} max={64} value={padding} onChange={e => setPadding(+e.target.value)} className="w-full accent-pink-500" />
              <h3 className="text-sm text-gray-400 mb-2 mt-3">Font Size: {fontSize}px</h3>
              <input type="range" min={10} max={24} value={fontSize} onChange={e => setFontSize(+e.target.value)} className="w-full accent-pink-500" />
            </div>
            <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
              <h3 className="text-sm text-gray-400 mb-2">Window Style</h3>
              <div className="flex gap-2">{(['mac', 'none'] as const).map(s => <button key={s} onClick={() => setWindowStyle(s)} className={`px-3 py-1.5 rounded text-xs capitalize ${windowStyle === s ? 'bg-pink-500/20 text-pink-400' : 'bg-gray-800 text-gray-400'}`}>{s}</button>)}</div>
            </div>
            <button onClick={exportPng} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded-lg text-sm"><Download className="w-4 h-4" /> Export PNG</button>
          </div>
          <div className="lg:col-span-3 space-y-4">
            <div ref={ref} className="rounded-xl overflow-hidden" style={{ background: bgColor, padding }}>
              <div className="rounded-lg overflow-hidden" style={{ background: theme.bg }}>
                {windowStyle === 'mac' && <div className="flex items-center gap-2 px-4 py-3"><div className="w-3 h-3 rounded-full bg-red-500" /><div className="w-3 h-3 rounded-full bg-yellow-500" /><div className="w-3 h-3 rounded-full bg-green-500" /></div>}
                <pre className="p-4 overflow-x-auto" style={{ fontSize, color: theme.text, fontFamily: '"Fira Code", "JetBrains Mono", monospace', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: highlightCode(code, theme) }} />
              </div>
            </div>
            <textarea value={code} onChange={e => setCode(e.target.value)} rows={10} className="w-full p-4 bg-gray-900 border border-gray-800 rounded-xl font-mono text-sm text-gray-300 resize-none focus:outline-none focus:border-pink-500" placeholder="Paste your code here..." />
          </div>
        </div>
      </div>
    </div>
  );
}
