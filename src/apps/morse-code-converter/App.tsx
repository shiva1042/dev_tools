import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Radio, Copy, Check, Volume2, ArrowRightLeft } from 'lucide-react';

const MORSE: Record<string, string> = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.', 'G': '--.', 'H': '....',
  'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---', 'P': '.--.',
  'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
  'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
  '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.', '.': '.-.-.-', ',': '--..--',
  '?': '..--..', "'": '.----.', '!': '-.-.--', '/': '-..-.', '(': '-.--.', ')': '-.--.-', '&': '.-...',
  ':': '---...', ';': '-.-.-.', '=': '-...-', '+': '.-.-.', '-': '-....-', '_': '..--.-', '"': '.-..-.',
  '$': '...-..-', '@': '.--.-.', ' ': '/',
};

const REVERSE: Record<string, string> = {};
Object.entries(MORSE).forEach(([k, v]) => { REVERSE[v] = k; });

export default function App() {
  const [text, setText] = useState('HELLO WORLD');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [copied, setCopied] = useState(false);
  const [speed, setSpeed] = useState(15); // WPM
  const audioCtx = useRef<AudioContext | null>(null);

  const encode = (t: string) => t.toUpperCase().split('').map(c => MORSE[c] || c).join(' ');
  const decode = (m: string) => m.split(' / ').map(word => word.split(' ').map(c => REVERSE[c] || c).join('')).join(' ');

  const output = mode === 'encode' ? encode(text) : decode(text);

  const copy = async () => { await navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const swap = () => {
    const newMode = mode === 'encode' ? 'decode' : 'encode';
    setText(output);
    setMode(newMode);
  };

  const playMorse = async () => {
    if (!audioCtx.current) audioCtx.current = new AudioContext();
    const ctx = audioCtx.current;
    const morse = mode === 'encode' ? output : encode(text);
    const dotDuration = 1.2 / speed;
    let time = ctx.currentTime;

    for (const char of morse) {
      if (char === '.') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = 600; gain.gain.value = 0.3;
        osc.start(time); osc.stop(time + dotDuration);
        time += dotDuration * 2;
      } else if (char === '-') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = 600; gain.gain.value = 0.3;
        osc.start(time); osc.stop(time + dotDuration * 3);
        time += dotDuration * 4;
      } else if (char === ' ') {
        time += dotDuration * 3;
      } else if (char === '/') {
        time += dotDuration * 7;
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/" className="p-2 hover:bg-gray-800 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Radio className="w-6 h-6 text-yellow-400" /> Morse Code Converter</h1>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setMode('encode')} className={`px-3 py-1.5 rounded-lg text-sm ${mode === 'encode' ? 'bg-yellow-600' : 'bg-gray-800 hover:bg-gray-700'}`}>Text → Morse</button>
          <button onClick={swap} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg"><ArrowRightLeft className="w-4 h-4" /></button>
          <button onClick={() => setMode('decode')} className={`px-3 py-1.5 rounded-lg text-sm ${mode === 'decode' ? 'bg-yellow-600' : 'bg-gray-800 hover:bg-gray-700'}`}>Morse → Text</button>
          <div className="flex-1" />
          <label className="text-xs text-gray-400 flex items-center gap-2">Speed: {speed} WPM
            <input type="range" min={5} max={30} value={speed} onChange={e => setSpeed(+e.target.value)} className="w-24" /></label>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">{mode === 'encode' ? 'Text' : 'Morse Code'}</label>
            <textarea value={text} onChange={e => setText(e.target.value)} rows={4} className="w-full p-3 bg-gray-900 border border-gray-800 rounded-xl text-sm font-mono focus:outline-none resize-none" placeholder={mode === 'encode' ? 'Type text...' : 'Enter morse code (dots and dashes)...'} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm text-gray-400">{mode === 'encode' ? 'Morse Code' : 'Text'}</label>
              <div className="flex gap-2">
                <button onClick={playMorse} className="flex items-center gap-1 px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs"><Volume2 className="w-3 h-3" /> Play</button>
                <button onClick={copy} className="flex items-center gap-1 px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs">{copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copy</button>
              </div>
            </div>
            <div className="p-3 bg-gray-900 border border-gray-800 rounded-xl min-h-[100px]">
              <p className={`text-sm font-mono ${mode === 'encode' ? 'text-yellow-400 text-lg tracking-wider' : 'text-white'}`}>{output || '...'}</p>
            </div>
          </div>
        </div>
        <div className="mt-6 p-4 bg-gray-900 rounded-xl border border-gray-800">
          <h3 className="text-sm text-gray-400 mb-3">Reference</h3>
          <div className="grid grid-cols-6 sm:grid-cols-9 gap-1">{Object.entries(MORSE).filter(([k]) => k !== ' ').slice(0, 36).map(([char, code]) => (
            <div key={char} className="p-1.5 bg-gray-800 rounded text-center">
              <div className="text-xs font-bold">{char}</div>
              <div className="text-[10px] text-yellow-400 font-mono">{code}</div>
            </div>
          ))}</div>
        </div>
      </div>
    </div>
  );
}
