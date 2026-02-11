import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Shuffle, Download, Upload, RotateCcw, Check, X, BookOpen } from 'lucide-react';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  known: boolean;
  reviewCount: number;
}

const STORAGE_KEY = 'flashcard-maker-cards';

export default function App() {
  const [cards, setCards] = useState<Flashcard[]>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
  });
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [mode, setMode] = useState<'manage' | 'review'>('manage');
  const [reviewQueue, setReviewQueue] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [stats, setStats] = useState({ known: 0, unknown: 0 });

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(cards)); }, [cards]);

  const addCard = () => {
    if (!front.trim() || !back.trim()) return;
    setCards(prev => [...prev, { id: crypto.randomUUID(), front: front.trim(), back: back.trim(), known: false, reviewCount: 0 }]);
    setFront(''); setBack('');
  };

  const startReview = () => {
    if (cards.length === 0) return;
    setReviewQueue([...cards].sort(() => Math.random() - 0.5));
    setCurrentIndex(0); setFlipped(false); setStats({ known: 0, unknown: 0 }); setMode('review');
  };

  const markCard = (known: boolean) => {
    const card = reviewQueue[currentIndex];
    setCards(prev => prev.map(c => c.id === card.id ? { ...c, known, reviewCount: c.reviewCount + 1 } : c));
    setStats(prev => ({ known: prev.known + (known ? 1 : 0), unknown: prev.unknown + (known ? 0 : 1) }));
    if (currentIndex < reviewQueue.length - 1) { setCurrentIndex(prev => prev + 1); setFlipped(false); }
    else setMode('manage');
  };

  const exportCards = () => {
    const blob = new Blob([JSON.stringify(cards, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'flashcards.json'; a.click();
  };

  const importCards = () => {
    const input = document.createElement('input'); input.type = 'file'; input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => { try { const d = JSON.parse(ev.target?.result as string); if (Array.isArray(d)) setCards(prev => [...prev, ...d]); } catch {} };
      reader.readAsText(file);
    };
    input.click();
  };

  const knownCount = cards.filter(c => c.known).length;
  const progress = cards.length > 0 ? Math.round((knownCount / cards.length) * 100) : 0;

  if (mode === 'review' && reviewQueue.length > 0) {
    const card = reviewQueue[currentIndex];
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <div className="max-w-2xl mx-auto p-6">
          <div className="flex items-center justify-between mb-8">
            <button onClick={() => setMode('manage')} className="p-2 hover:bg-gray-800 rounded-lg"><ArrowLeft className="w-5 h-5" /></button>
            <span className="text-gray-400 text-sm">{currentIndex + 1} / {reviewQueue.length}</span>
            <div className="text-sm"><span className="text-green-400">{stats.known}</span> / <span className="text-red-400">{stats.unknown}</span></div>
          </div>
          <div className="h-2 bg-gray-800 rounded-full mb-8 overflow-hidden">
            <div className="h-full bg-blue-500 transition-all" style={{ width: `${((currentIndex + 1) / reviewQueue.length) * 100}%` }} />
          </div>
          <div onClick={() => setFlipped(!flipped)} className="relative w-full h-72 cursor-pointer mb-8 perspective-1000" style={{ perspective: '1000px' }}>
            <div className={`w-full h-full transition-transform duration-500`} style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
              <div className="absolute inset-0 flex items-center justify-center p-8 bg-gray-900 border border-gray-700 rounded-2xl text-xl font-medium text-center" style={{ backfaceVisibility: 'hidden' }}>{card.front}</div>
              <div className="absolute inset-0 flex items-center justify-center p-8 bg-gray-800 border border-blue-600 rounded-2xl text-xl text-blue-300 text-center" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>{card.back}</div>
            </div>
          </div>
          <p className="text-center text-gray-500 text-sm mb-6">Click card to flip</p>
          <div className="flex justify-center gap-4">
            <button onClick={() => markCard(false)} className="flex items-center gap-2 px-6 py-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500/30"><X className="w-5 h-5" /> Don't Know</button>
            <button onClick={() => markCard(true)} className="flex items-center gap-2 px-6 py-3 bg-green-500/20 text-green-400 border border-green-500/30 rounded-xl hover:bg-green-500/30"><Check className="w-5 h-5" /> Know It</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 hover:bg-gray-800 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
          <div><h1 className="text-2xl font-bold flex items-center gap-2"><BookOpen className="w-6 h-6 text-blue-400" /> Flashcard Maker</h1>
          <p className="text-gray-400 text-sm">Create, review & export study flashcards</p></div>
        </div>
        <div className="p-4 bg-gray-900 rounded-xl border border-gray-800 mb-6">
          <div className="flex justify-between mb-2"><span className="text-sm text-gray-400">{cards.length} cards</span><span className="text-sm text-green-400">{progress}% mastered</span></div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden"><div className="h-full bg-green-500 transition-all" style={{ width: `${progress}%` }} /></div>
        </div>
        <div className="p-6 bg-gray-900 rounded-xl border border-gray-800 mb-6">
          <h3 className="text-sm font-medium text-gray-300 mb-4">Add New Card</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div><label className="block text-xs text-gray-500 mb-1">Front</label><textarea value={front} onChange={e => setFront(e.target.value)} placeholder="Question..." rows={3} className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-sm resize-none focus:outline-none focus:border-blue-500" /></div>
            <div><label className="block text-xs text-gray-500 mb-1">Back</label><textarea value={back} onChange={e => setBack(e.target.value)} placeholder="Answer..." rows={3} className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-sm resize-none focus:outline-none focus:border-blue-500" /></div>
          </div>
          <button onClick={addCard} disabled={!front.trim() || !back.trim()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-sm"><Plus className="w-4 h-4" /> Add Card</button>
        </div>
        <div className="flex flex-wrap gap-3 mb-6">
          <button onClick={startReview} disabled={cards.length === 0} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg text-sm"><Shuffle className="w-4 h-4" /> Review ({cards.length})</button>
          <button onClick={exportCards} disabled={cards.length === 0} className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 rounded-lg text-sm"><Download className="w-4 h-4" /> Export</button>
          <button onClick={importCards} className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm"><Upload className="w-4 h-4" /> Import</button>
          <button onClick={() => setCards([])} disabled={cards.length === 0} className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 disabled:opacity-50 rounded-lg text-sm"><RotateCcw className="w-4 h-4" /> Clear</button>
        </div>
        <div className="space-y-3">
          {cards.length === 0 ? <div className="text-center py-16 text-gray-500"><BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>No flashcards yet</p></div> :
          cards.map(card => (
            <div key={card.id} className="flex items-start gap-4 p-4 bg-gray-900 rounded-xl border border-gray-800 group">
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div><span className="text-xs text-gray-500">Front</span><p className="text-sm mt-1">{card.front}</p></div>
                <div><span className="text-xs text-gray-500">Back</span><p className="text-sm mt-1 text-gray-300">{card.back}</p></div>
              </div>
              <div className="flex items-center gap-2">
                {card.known && <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">Known</span>}
                <button onClick={() => setCards(prev => prev.filter(c => c.id !== card.id))} className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-red-400 rounded"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
