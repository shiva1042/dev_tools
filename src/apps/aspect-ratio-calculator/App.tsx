import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Monitor, Smartphone, Tablet, Tv, Lock, Unlock } from 'lucide-react';

const presets = [
  { label: '16:9', w: 16, h: 9, desc: 'Widescreen HD' },
  { label: '4:3', w: 4, h: 3, desc: 'Classic TV' },
  { label: '21:9', w: 21, h: 9, desc: 'Ultrawide' },
  { label: '1:1', w: 1, h: 1, desc: 'Square' },
  { label: '9:16', w: 9, h: 16, desc: 'Vertical Video' },
  { label: '3:2', w: 3, h: 2, desc: 'DSLR Photo' },
  { label: '5:4', w: 5, h: 4, desc: 'Large Format' },
  { label: '2:1', w: 2, h: 1, desc: 'Univisium' },
  { label: '32:9', w: 32, h: 9, desc: 'Super Ultrawide' },
];

const resolutions = [
  { label: 'HD 720p', w: 1280, h: 720 },
  { label: 'Full HD 1080p', w: 1920, h: 1080 },
  { label: '2K QHD', w: 2560, h: 1440 },
  { label: '4K UHD', w: 3840, h: 2160 },
  { label: '8K', w: 7680, h: 4320 },
  { label: 'iPhone 15', w: 1179, h: 2556 },
  { label: 'iPad Pro', w: 2048, h: 2732 },
  { label: 'Instagram Post', w: 1080, h: 1080 },
  { label: 'Instagram Story', w: 1080, h: 1920 },
  { label: 'Twitter Header', w: 1500, h: 500 },
  { label: 'YouTube Thumbnail', w: 1280, h: 720 },
  { label: 'Facebook Cover', w: 820, h: 312 },
];

const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);

export default function App() {
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [locked, setLocked] = useState(false);
  const [ratioW, setRatioW] = useState(16);
  const [ratioH, setRatioH] = useState(9);

  const ratio = useMemo(() => {
    const g = gcd(width, height);
    return { w: width / g, h: height / g };
  }, [width, height]);

  const decimal = height > 0 ? (width / height).toFixed(4) : '0';
  const megapixels = ((width * height) / 1000000).toFixed(2);

  const handleWidth = (w: number) => {
    setWidth(w);
    if (locked) setHeight(Math.round(w * ratioH / ratioW));
  };

  const handleHeight = (h: number) => {
    setHeight(h);
    if (locked) setWidth(Math.round(h * ratioW / ratioH));
  };

  const applyPreset = (w: number, h: number) => {
    setRatioW(w); setRatioH(h);
    if (locked) setHeight(Math.round(width * h / w));
  };

  const applyResolution = (w: number, h: number) => { setWidth(w); setHeight(h); };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/" className="p-2 hover:bg-gray-800 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
          <div><h1 className="text-2xl font-bold flex items-center gap-2"><Monitor className="w-6 h-6 text-sky-400" /> Aspect Ratio Calculator</h1>
          <p className="text-gray-400 text-sm">Calculate and convert aspect ratios</p></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
              <h3 className="text-sm text-gray-400 mb-3">Dimensions</h3>
              <div className="flex items-center gap-3">
                <div className="flex-1"><label className="block text-xs text-gray-500 mb-1">Width (px)</label>
                  <input type="number" value={width} onChange={e => handleWidth(+e.target.value)} className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none" /></div>
                <button onClick={() => setLocked(!locked)} className={`mt-5 p-2 rounded-lg ${locked ? 'bg-sky-600' : 'bg-gray-800 hover:bg-gray-700'}`}>
                  {locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                </button>
                <div className="flex-1"><label className="block text-xs text-gray-500 mb-1">Height (px)</label>
                  <input type="number" value={height} onChange={e => handleHeight(+e.target.value)} className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none" /></div>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="p-3 bg-gray-800 rounded-lg text-center">
                  <p className="text-xs text-gray-500">Aspect Ratio</p>
                  <p className="text-lg font-bold text-sky-400">{ratio.w}:{ratio.h}</p>
                </div>
                <div className="p-3 bg-gray-800 rounded-lg text-center">
                  <p className="text-xs text-gray-500">Decimal</p>
                  <p className="text-lg font-bold">{decimal}</p>
                </div>
                <div className="p-3 bg-gray-800 rounded-lg text-center">
                  <p className="text-xs text-gray-500">Megapixels</p>
                  <p className="text-lg font-bold">{megapixels} MP</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
              <h3 className="text-sm text-gray-400 mb-3">Preview</h3>
              <div className="flex justify-center items-center h-48">
                <div className="border-2 border-sky-500/50 bg-sky-500/10 rounded flex items-center justify-center" style={{
                  width: `${Math.min(280, 280 * Math.min(1, width / height))}px`,
                  height: `${Math.min(180, 180 * Math.min(1, height / width))}px`,
                }}>
                  <span className="text-xs text-sky-400">{width} x {height}</span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
              <h3 className="text-sm text-gray-400 mb-3">Common Ratios</h3>
              <div className="grid grid-cols-3 gap-2">{presets.map(p => (
                <button key={p.label} onClick={() => applyPreset(p.w, p.h)} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-left">
                  <span className="text-sm font-bold">{p.label}</span>
                  <span className="block text-[10px] text-gray-500">{p.desc}</span>
                </button>
              ))}</div>
            </div>
          </div>
          <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
            <h3 className="text-sm text-gray-400 mb-3">Common Resolutions</h3>
            <div className="space-y-1">{resolutions.map(r => (
              <button key={r.label} onClick={() => applyResolution(r.w, r.h)} className="w-full flex items-center justify-between p-2 hover:bg-gray-800 rounded-lg text-sm">
                <div className="flex items-center gap-2">
                  {r.w > r.h ? <Monitor className="w-4 h-4 text-gray-500" /> : r.h > r.w * 1.5 ? <Smartphone className="w-4 h-4 text-gray-500" /> : <Tablet className="w-4 h-4 text-gray-500" />}
                  <span>{r.label}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                  <span className="font-mono text-xs">{r.w}x{r.h}</span>
                  <span className="text-xs text-gray-500">{(() => { const g = gcd(r.w, r.h); return `${r.w / g}:${r.h / g}`; })()}</span>
                </div>
              </button>
            ))}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
