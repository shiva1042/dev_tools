import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Type } from 'lucide-react';

const fonts: Record<string, Record<string, string[]>> = {
  'Block': {
    'A': ['█████','█   █','█████','█   █','█   █'], 'B': ['████ ','█   █','████ ','█   █','████ '],
    'C': ['█████','█    ','█    ','█    ','█████'], 'D': ['████ ','█   █','█   █','█   █','████ '],
    'E': ['█████','█    ','████ ','█    ','█████'], 'F': ['█████','█    ','████ ','█    ','█    '],
    'G': ['█████','█    ','█ ███','█   █','█████'], 'H': ['█   █','█   █','█████','█   █','█   █'],
    'I': ['█████','  █  ','  █  ','  █  ','█████'], 'J': ['█████','    █','    █','█   █','█████'],
    'K': ['█   █','█  █ ','███  ','█  █ ','█   █'], 'L': ['█    ','█    ','█    ','█    ','█████'],
    'M': ['█   █','██ ██','█ █ █','█   █','█   █'], 'N': ['█   █','██  █','█ █ █','█  ██','█   █'],
    'O': ['█████','█   █','█   █','█   █','█████'], 'P': ['█████','█   █','█████','█    ','█    '],
    'Q': ['█████','█   █','█ █ █','█  ██','█████'], 'R': ['█████','█   █','█████','█  █ ','█   █'],
    'S': ['█████','█    ','█████','    █','█████'], 'T': ['█████','  █  ','  █  ','  █  ','  █  '],
    'U': ['█   █','█   █','█   █','█   █','█████'], 'V': ['█   █','█   █','█   █',' █ █ ','  █  '],
    'W': ['█   █','█   █','█ █ █','██ ██','█   █'], 'X': ['█   █',' █ █ ','  █  ',' █ █ ','█   █'],
    'Y': ['█   █',' █ █ ','  █  ','  █  ','  █  '], 'Z': ['█████','   █ ','  █  ',' █   ','█████'],
    '0': ['█████','█  ██','█ █ █','██  █','█████'], '1': [' ██  ','  █  ','  █  ','  █  ','█████'],
    '2': ['█████','    █','█████','█    ','█████'], '3': ['█████','    █','█████','    █','█████'],
    '4': ['█   █','█   █','█████','    █','    █'], '5': ['█████','█    ','█████','    █','█████'],
    '6': ['█████','█    ','█████','█   █','█████'], '7': ['█████','    █','   █ ','  █  ','  █  '],
    '8': ['█████','█   █','█████','█   █','█████'], '9': ['█████','█   █','█████','    █','█████'],
    ' ': ['     ','     ','     ','     ','     '], '!': ['  █  ','  █  ','  █  ','     ','  █  '],
  },
  'Shadow': {
    'A': ['  _  ',' / \\ ','/ _ \\','|_| |','    |'], 'B': ['____','| _ \\','| _ /','| _ \\','|___/'],
    'C': [' ___','/ __','| (__','\\___','    '], 'D': ['____','| _ \\','| | |','| |_/','|___/'],
    'E': ['____','| __|','| _|','| |__','|___|'], 'F': ['____','| __|','| _|','| |  ','|_|  '],
    'G': [' ___','/ _ \\','| |_|','\\__ |',' ___/'], 'H': ['_  _','| || |','|_  _|',' _||_','|_||_|'],
    'I': [' ___ ','|_ _|',' | | ',' | | ','|___|'], ' ': ['     ','     ','     ','     ','     '],
  },
};

export default function App() {
  const [text, setText] = useState('HELLO');
  const [font, setFont] = useState('Block');
  const [copied, setCopied] = useState(false);

  const renderText = () => {
    const f = fonts[font];
    if (!f) return '';
    const chars = text.toUpperCase().split('');
    const lines: string[] = [];
    for (let row = 0; row < 5; row++) {
      lines.push(chars.map(c => (f[c] || f[' '] || ['     ','     ','     ','     ','     '])[row] || '     ').join('  '));
    }
    return lines.join('\n');
  };

  const art = renderText();
  const copy = async () => { await navigator.clipboard.writeText(art); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 hover:bg-gray-800 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
          <div><h1 className="text-2xl font-bold flex items-center gap-2"><Type className="w-6 h-6 text-lime-400" /> ASCII Art Generator</h1>
          <p className="text-gray-400 text-sm">Convert text to ASCII art</p></div>
        </div>
        <div className="p-6 bg-gray-900 rounded-xl border border-gray-800 mb-6">
          <div className="flex gap-3 mb-4">
            <input value={text} onChange={e => setText(e.target.value)} placeholder="Enter text..." maxLength={20} className="flex-1 p-3 bg-gray-800 border border-gray-700 rounded-lg text-lg focus:outline-none focus:border-lime-500" />
            <div className="flex gap-1">
              {Object.keys(fonts).map(f => <button key={f} onClick={() => setFont(f)} className={`px-3 py-2 rounded-lg text-sm ${font === f ? 'bg-lime-500/20 text-lime-400 border border-lime-500/30' : 'bg-gray-800 text-gray-400'}`}>{f}</button>)}
            </div>
          </div>
        </div>
        <div className="p-6 bg-gray-900 rounded-xl border border-gray-800 mb-4">
          <pre className="font-mono text-lime-400 text-sm overflow-x-auto whitespace-pre leading-tight">{art || 'Type something above...'}</pre>
        </div>
        <button onClick={copy} className="flex items-center gap-2 px-4 py-2 bg-lime-600 hover:bg-lime-700 rounded-lg text-sm">{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copied ? 'Copied!' : 'Copy ASCII Art'}</button>
      </div>
    </div>
  );
}
