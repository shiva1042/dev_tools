import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Palette } from 'lucide-react';

type VisionType = 'normal' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';

const visionTypes: { id: VisionType; label: string; description: string }[] = [
  { id: 'normal', label: 'Normal Vision', description: 'Trichromatic - full color vision' },
  { id: 'protanopia', label: 'Protanopia', description: 'Red-blind (~1% of males)' },
  { id: 'deuteranopia', label: 'Deuteranopia', description: 'Green-blind (~1% of males)' },
  { id: 'tritanopia', label: 'Tritanopia', description: 'Blue-blind (very rare)' },
  { id: 'achromatopsia', label: 'Achromatopsia', description: 'Total color blindness (very rare)' },
];

// Color transformation matrices
const transforms: Record<VisionType, number[][]> = {
  normal: [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
  protanopia: [[0.567, 0.433, 0], [0.558, 0.442, 0], [0, 0.242, 0.758]],
  deuteranopia: [[0.625, 0.375, 0], [0.7, 0.3, 0], [0, 0.3, 0.7]],
  tritanopia: [[0.95, 0.05, 0], [0, 0.433, 0.567], [0, 0.475, 0.525]],
  achromatopsia: [[0.299, 0.587, 0.114], [0.299, 0.587, 0.114], [0.299, 0.587, 0.114]],
};

const hexToRgb = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
};

const rgbToHex = (r: number, g: number, b: number) =>
  '#' + [r, g, b].map(c => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0')).join('');

const transform = (hex: string, type: VisionType) => {
  const [r, g, b] = hexToRgb(hex);
  const m = transforms[type];
  return rgbToHex(m[0][0] * r + m[0][1] * g + m[0][2] * b, m[1][0] * r + m[1][1] * g + m[1][2] * b, m[2][0] * r + m[2][1] * g + m[2][2] * b);
};

export default function App() {
  const [colors, setColors] = useState(['#ef4444', '#22c55e', '#3b82f6', '#f59e0b', '#a855f7', '#ec4899', '#14b8a6', '#f97316']);
  const [selectedType, setSelectedType] = useState<VisionType>('normal');
  const [customColor, setCustomColor] = useState('#3b82f6');
  const [showAll, setShowAll] = useState(true);

  const testPalettes = [
    { name: 'Status Colors', colors: ['#22c55e', '#f59e0b', '#ef4444', '#6b7280'] },
    { name: 'Chart Palette', colors: ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#a855f7', '#ec4899'] },
    { name: 'Traffic Light', colors: ['#ef4444', '#f59e0b', '#22c55e'] },
    { name: 'Accessible', colors: ['#0077b6', '#e63946', '#2a9d8f', '#e9c46a', '#264653'] },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/" className="p-2 hover:bg-gray-800 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
          <div><h1 className="text-2xl font-bold flex items-center gap-2"><Eye className="w-6 h-6 text-purple-400" /> Color Blindness Simulator</h1>
          <p className="text-gray-400 text-sm">Test color accessibility for different vision types</p></div>
        </div>
        <div className="flex gap-2 mb-6">{visionTypes.map(v => (
          <button key={v.id} onClick={() => { setSelectedType(v.id); setShowAll(false); }} className={`px-3 py-1.5 rounded-lg text-sm ${selectedType === v.id && !showAll ? 'bg-purple-600' : 'bg-gray-800 hover:bg-gray-700'}`}>{v.label}</button>
        ))}
          <button onClick={() => setShowAll(!showAll)} className={`px-3 py-1.5 rounded-lg text-sm ${showAll ? 'bg-purple-600' : 'bg-gray-800 hover:bg-gray-700'}`}>Compare All</button>
        </div>

        <div className="p-4 bg-gray-900 rounded-xl border border-gray-800 mb-6">
          <h3 className="text-sm text-gray-400 mb-3">Custom Color Test</h3>
          <div className="flex items-center gap-4 mb-4">
            <input type="color" value={customColor} onChange={e => setCustomColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
            <input value={customColor} onChange={e => setCustomColor(e.target.value)} className="w-28 p-2 bg-gray-800 border border-gray-700 rounded text-sm font-mono focus:outline-none" />
          </div>
          <div className="grid grid-cols-5 gap-3">{visionTypes.map(v => (
            <div key={v.id} className="text-center">
              <div className="w-full h-16 rounded-lg mb-1" style={{ backgroundColor: transform(customColor, v.id) }} />
              <p className="text-xs text-gray-400">{v.label}</p>
              <p className="text-[10px] font-mono text-gray-500">{transform(customColor, v.id)}</p>
            </div>
          ))}</div>
        </div>

        <div className="p-4 bg-gray-900 rounded-xl border border-gray-800 mb-6">
          <h3 className="text-sm text-gray-400 mb-3">Color Palette</h3>
          <div className="flex gap-2 mb-3">{colors.map((c, i) => (
            <div key={i} className="flex-1">
              <input type="color" value={c} onChange={e => setColors(prev => prev.map((p, j) => j === i ? e.target.value : p))} className="w-full h-10 rounded cursor-pointer" />
            </div>
          ))}</div>
          {showAll ? (
            <div className="space-y-3">{visionTypes.map(v => (
              <div key={v.id}>
                <p className="text-xs text-gray-500 mb-1">{v.label}</p>
                <div className="flex gap-2">{colors.map((c, i) => (
                  <div key={i} className="flex-1 h-8 rounded" style={{ backgroundColor: transform(c, v.id) }} />
                ))}</div>
              </div>
            ))}</div>
          ) : (
            <div className="flex gap-2">{colors.map((c, i) => (
              <div key={i} className="flex-1 h-12 rounded" style={{ backgroundColor: transform(c, selectedType) }} />
            ))}</div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {testPalettes.map(p => (
            <div key={p.name} className="p-4 bg-gray-900 rounded-xl border border-gray-800">
              <h4 className="text-sm text-gray-400 mb-2">{p.name}</h4>
              <div className="space-y-2">{visionTypes.map(v => (
                <div key={v.id} className="flex items-center gap-2">
                  <span className="w-24 text-[10px] text-gray-500 truncate">{v.label}</span>
                  <div className="flex gap-1 flex-1">{p.colors.map((c, i) => (
                    <div key={i} className="flex-1 h-5 rounded-sm" style={{ backgroundColor: transform(c, v.id) }} />
                  ))}</div>
                </div>
              ))}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
