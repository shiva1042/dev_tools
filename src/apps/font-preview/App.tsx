import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Type, Search, Copy, Check } from 'lucide-react';

const fonts = [
  'Arial', 'Helvetica', 'Verdana', 'Tahoma', 'Trebuchet MS', 'Gill Sans',
  'Times New Roman', 'Georgia', 'Palatino', 'Garamond', 'Bookman',
  'Courier New', 'Monaco', 'Lucida Console', 'Consolas', 'Menlo',
  'Impact', 'Comic Sans MS', 'Brush Script MT',
  'system-ui', 'ui-serif', 'ui-sans-serif', 'ui-monospace', 'ui-rounded',
  'Segoe UI', 'Roboto', 'Noto Sans', 'Inter', 'Open Sans', 'Lato',
  'Source Sans Pro', 'Nunito', 'Poppins', 'Montserrat', 'Raleway',
  'Fira Code', 'JetBrains Mono', 'Source Code Pro', 'IBM Plex Mono',
];

const categories: Record<string, string[]> = {
  'Sans-Serif': ['Arial', 'Helvetica', 'Verdana', 'Tahoma', 'Trebuchet MS', 'Gill Sans', 'Segoe UI', 'Roboto', 'Inter', 'Open Sans', 'Lato', 'Nunito', 'Poppins', 'Montserrat', 'Raleway', 'Noto Sans', 'Source Sans Pro'],
  'Serif': ['Times New Roman', 'Georgia', 'Palatino', 'Garamond', 'Bookman', 'ui-serif'],
  'Monospace': ['Courier New', 'Monaco', 'Lucida Console', 'Consolas', 'Menlo', 'Fira Code', 'JetBrains Mono', 'Source Code Pro', 'IBM Plex Mono', 'ui-monospace'],
  'Display': ['Impact', 'Comic Sans MS', 'Brush Script MT'],
  'System': ['system-ui', 'ui-serif', 'ui-sans-serif', 'ui-monospace', 'ui-rounded'],
};

export default function App() {
  const [text, setText] = useState('The quick brown fox jumps over the lazy dog');
  const [fontSize, setFontSize] = useState(24);
  const [fontWeight, setFontWeight] = useState(400);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [copied, setCopied] = useState('');
  const [lineHeight, setLineHeight] = useState(1.5);
  const [letterSpacing, setLetterSpacing] = useState(0);

  const filteredFonts = fonts.filter(f => {
    const matchSearch = f.toLowerCase().includes(search.toLowerCase());
    if (category === 'All') return matchSearch;
    return matchSearch && (categories[category]?.includes(f) || false);
  });

  const copy = async (font: string) => {
    await navigator.clipboard.writeText(`font-family: '${font}', sans-serif;`);
    setCopied(font); setTimeout(() => setCopied(''), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/" className="p-2 hover:bg-gray-800 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
          <div><h1 className="text-2xl font-bold flex items-center gap-2"><Type className="w-6 h-6 text-pink-400" /> Font Preview</h1>
          <p className="text-gray-400 text-sm">{filteredFonts.length} fonts</p></div>
        </div>
        <div className="p-4 bg-gray-900 rounded-xl border border-gray-800 mb-6 space-y-3">
          <input value={text} onChange={e => setText(e.target.value)} className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none" placeholder="Preview text..." />
          <div className="flex gap-4 flex-wrap items-end">
            <div><label className="block text-xs text-gray-500 mb-1">Size: {fontSize}px</label>
              <input type="range" min={12} max={72} value={fontSize} onChange={e => setFontSize(+e.target.value)} className="w-32" /></div>
            <div><label className="block text-xs text-gray-500 mb-1">Weight: {fontWeight}</label>
              <input type="range" min={100} max={900} step={100} value={fontWeight} onChange={e => setFontWeight(+e.target.value)} className="w-32" /></div>
            <div><label className="block text-xs text-gray-500 mb-1">Line Height: {lineHeight}</label>
              <input type="range" min={1} max={3} step={0.1} value={lineHeight} onChange={e => setLineHeight(+e.target.value)} className="w-32" /></div>
            <div><label className="block text-xs text-gray-500 mb-1">Letter Spacing: {letterSpacing}px</label>
              <input type="range" min={-2} max={10} step={0.5} value={letterSpacing} onChange={e => setLetterSpacing(+e.target.value)} className="w-32" /></div>
          </div>
        </div>
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1"><Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search fonts..." className="w-full pl-10 p-2 bg-gray-900 border border-gray-800 rounded-lg text-sm focus:outline-none" /></div>
        </div>
        <div className="flex gap-2 mb-6">
          {['All', ...Object.keys(categories)].map(c => (
            <button key={c} onClick={() => setCategory(c)} className={`px-3 py-1.5 rounded-lg text-sm ${category === c ? 'bg-pink-600' : 'bg-gray-800 hover:bg-gray-700'}`}>{c}</button>
          ))}
        </div>
        <div className="space-y-2">
          {filteredFonts.map(font => (
            <div key={font} className="p-4 bg-gray-900 rounded-xl border border-gray-800 hover:border-gray-700 group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">{font}</span>
                <button onClick={() => copy(font)} className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-2 py-1 bg-gray-800 rounded text-xs transition-opacity">
                  {copied === font ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                  {copied === font ? 'Copied' : 'Copy CSS'}
                </button>
              </div>
              <p style={{ fontFamily: `'${font}', sans-serif`, fontSize: `${fontSize}px`, fontWeight, lineHeight, letterSpacing: `${letterSpacing}px` }} className="text-white truncate">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
