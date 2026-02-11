import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Maximize2, Code } from 'lucide-react';

const presets = [
  { name: 'Blank', html: '<h1>Hello World</h1>\n<p>Start coding here...</p>', css: 'body {\n  font-family: sans-serif;\n  padding: 20px;\n  color: #333;\n}', js: '' },
  { name: 'Card', html: '<div class="card">\n  <h2>Card Title</h2>\n  <p>Card content goes here.</p>\n  <button>Learn More</button>\n</div>', css: 'body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f0f0f0; margin: 0; }\n.card { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 320px; }\n.card h2 { margin-top: 0; color: #333; }\n.card button { background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }\n.card button:hover { background: #2563eb; }', js: '' },
  { name: 'Form', html: '<form class="form">\n  <h2>Contact Us</h2>\n  <input type="text" placeholder="Name" />\n  <input type="email" placeholder="Email" />\n  <textarea placeholder="Message"></textarea>\n  <button type="submit">Send</button>\n</form>', css: 'body { font-family: sans-serif; display: flex; justify-content: center; padding: 40px; background: #1a1a2e; margin: 0; }\n.form { background: #16213e; padding: 32px; border-radius: 16px; width: 320px; }\n.form h2 { color: white; margin-top: 0; }\n.form input, .form textarea { width: 100%; padding: 10px; margin-bottom: 12px; border: 1px solid #334; background: #0f3460; color: white; border-radius: 8px; box-sizing: border-box; }\n.form button { width: 100%; padding: 12px; background: #e94560; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; }', js: '' },
];

export default function App() {
  const [html, setHtml] = useState(presets[0].html);
  const [css, setCss] = useState(presets[0].css);
  const [js, setJs] = useState(presets[0].js);
  const [activeTab, setActiveTab] = useState<'html' | 'css' | 'js'>('html');
  const [fullscreen, setFullscreen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const srcDoc = `<!DOCTYPE html><html><head><style>${css}</style></head><body>${html}<script>${js}<\/script></body></html>`;

  const loadPreset = (p: typeof presets[0]) => { setHtml(p.html); setCss(p.css); setJs(p.js); };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className={`${fullscreen ? 'fixed inset-0 z-50 bg-gray-950' : 'max-w-6xl mx-auto'} p-4`}>
        <div className="flex items-center gap-4 mb-4">
          <Link to="/" className="p-2 hover:bg-gray-800 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
          <div><h1 className="text-xl font-bold flex items-center gap-2"><Code className="w-5 h-5 text-emerald-400" /> HTML/CSS Playground</h1></div>
          <div className="flex-1" />
          <div className="flex gap-2">
            {presets.map(p => <button key={p.name} onClick={() => loadPreset(p)} className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs">{p.name}</button>)}
            <button onClick={() => { setHtml(''); setCss(''); setJs(''); }} className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs"><RotateCcw className="w-3 h-3" /></button>
            <button onClick={() => setFullscreen(!fullscreen)} className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs"><Maximize2 className="w-3 h-3" /></button>
          </div>
        </div>
        <div className={`grid ${fullscreen ? 'grid-cols-2 h-[calc(100vh-80px)]' : 'grid-cols-1 lg:grid-cols-2'} gap-4`}>
          <div className="space-y-2">
            <div className="flex gap-1">
              {(['html', 'css', 'js'] as const).map(t => <button key={t} onClick={() => setActiveTab(t)} className={`px-3 py-1.5 rounded-t text-sm uppercase font-mono ${activeTab === t ? 'bg-gray-800 text-emerald-400' : 'bg-gray-900 text-gray-500 hover:text-gray-300'}`}>{t}</button>)}
            </div>
            {activeTab === 'html' && <textarea value={html} onChange={e => setHtml(e.target.value)} className="w-full h-[400px] p-4 bg-gray-900 border border-gray-800 rounded-b-xl rounded-tr-xl font-mono text-sm text-orange-300 resize-none focus:outline-none" spellCheck={false} />}
            {activeTab === 'css' && <textarea value={css} onChange={e => setCss(e.target.value)} className="w-full h-[400px] p-4 bg-gray-900 border border-gray-800 rounded-b-xl rounded-tr-xl font-mono text-sm text-blue-300 resize-none focus:outline-none" spellCheck={false} />}
            {activeTab === 'js' && <textarea value={js} onChange={e => setJs(e.target.value)} className="w-full h-[400px] p-4 bg-gray-900 border border-gray-800 rounded-b-xl rounded-tr-xl font-mono text-sm text-yellow-300 resize-none focus:outline-none" spellCheck={false} />}
          </div>
          <div className="bg-white rounded-xl overflow-hidden" style={{ minHeight: fullscreen ? '100%' : 420 }}>
            <iframe ref={iframeRef} srcDoc={srcDoc} className="w-full h-full border-0" sandbox="allow-scripts" style={{ minHeight: fullscreen ? '100%' : 420 }} />
          </div>
        </div>
      </div>
    </div>
  );
}
