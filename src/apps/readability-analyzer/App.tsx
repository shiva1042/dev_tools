import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, BarChart3 } from 'lucide-react';

export default function App() {
  const [text, setText] = useState('');

  const stats = useMemo(() => {
    if (!text.trim()) return null;

    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.match(/[a-zA-Z]/));
    const chars = text.replace(/\s/g, '').length;
    const syllables = words.reduce((sum, word) => sum + countSyllables(word), 0);
    const complexWords = words.filter(w => countSyllables(w) >= 3).length;
    const avgWordsPerSentence = sentences.length > 0 ? words.length / sentences.length : 0;
    const avgSyllablesPerWord = words.length > 0 ? syllables / words.length : 0;

    // Flesch Reading Ease
    const flesch = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;

    // Flesch-Kincaid Grade Level
    const fkGrade = 0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59;

    // Gunning Fog Index
    const fog = 0.4 * (avgWordsPerSentence + 100 * (complexWords / Math.max(words.length, 1)));

    // Coleman-Liau Index
    const L = (chars / Math.max(words.length, 1)) * 100;
    const S = (sentences.length / Math.max(words.length, 1)) * 100;
    const cli = 0.0588 * L - 0.296 * S - 15.8;

    // SMOG
    const smog = sentences.length >= 3 ? 1.0430 * Math.sqrt(complexWords * (30 / Math.max(sentences.length, 1))) + 3.1291 : 0;

    // Automated Readability Index
    const ari = 4.71 * (chars / Math.max(words.length, 1)) + 0.5 * avgWordsPerSentence - 21.43;

    // Reading time (avg 238 words/min)
    const readingTime = words.length / 238;
    const speakingTime = words.length / 150;

    // Paragraph count
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;

    // Unique words
    const uniqueWords = new Set(words.map(w => w.toLowerCase().replace(/[^a-z]/g, ''))).size;

    return {
      chars, words: words.length, sentences: sentences.length, paragraphs, syllables,
      uniqueWords, complexWords, avgWordsPerSentence: avgWordsPerSentence.toFixed(1),
      avgSyllablesPerWord: avgSyllablesPerWord.toFixed(1),
      flesch: Math.max(0, Math.min(100, flesch)).toFixed(1),
      fkGrade: Math.max(0, fkGrade).toFixed(1),
      fog: Math.max(0, fog).toFixed(1),
      cli: Math.max(0, cli).toFixed(1),
      smog: Math.max(0, smog).toFixed(1),
      ari: Math.max(0, ari).toFixed(1),
      readingTime: readingTime.toFixed(1),
      speakingTime: speakingTime.toFixed(1),
    };
  }, [text]);

  const getFleschLabel = (score: number) => {
    if (score >= 90) return { label: 'Very Easy', color: 'text-green-400', desc: '5th grade' };
    if (score >= 80) return { label: 'Easy', color: 'text-green-400', desc: '6th grade' };
    if (score >= 70) return { label: 'Fairly Easy', color: 'text-lime-400', desc: '7th grade' };
    if (score >= 60) return { label: 'Standard', color: 'text-yellow-400', desc: '8th-9th grade' };
    if (score >= 50) return { label: 'Fairly Difficult', color: 'text-orange-400', desc: '10th-12th grade' };
    if (score >= 30) return { label: 'Difficult', color: 'text-red-400', desc: 'College' };
    return { label: 'Very Difficult', color: 'text-red-500', desc: 'College graduate' };
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/" className="p-2 hover:bg-gray-800 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
          <div><h1 className="text-2xl font-bold flex items-center gap-2"><BookOpen className="w-6 h-6 text-emerald-400" /> Readability Analyzer</h1>
          <p className="text-gray-400 text-sm">Analyze text readability and complexity</p></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <textarea value={text} onChange={e => setText(e.target.value)} rows={20} className="w-full p-4 bg-gray-900 border border-gray-800 rounded-xl text-sm focus:outline-none resize-none" placeholder="Paste your text here to analyze readability..." />
          </div>
          <div className="space-y-4">
            {!stats ? <div className="p-8 bg-gray-900 rounded-xl border border-gray-800 text-center text-gray-500"><BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-50" /><p>Enter text to see analysis</p></div> : <>
              <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
                <h3 className="text-sm text-gray-400 mb-3">Readability Score</h3>
                {(() => { const f = getFleschLabel(parseFloat(stats.flesch)); return (
                  <div className="text-center mb-3">
                    <div className={`text-4xl font-bold ${f.color}`}>{stats.flesch}</div>
                    <div className={`text-sm ${f.color}`}>{f.label}</div>
                    <div className="text-xs text-gray-500">{f.desc} level</div>
                  </div>
                ); })()}
                <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full" style={{ width: `${Math.min(100, parseFloat(stats.flesch))}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-gray-600 mt-1"><span>Difficult</span><span>Easy</span></div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Words', value: stats.words },
                  { label: 'Sentences', value: stats.sentences },
                  { label: 'Characters', value: stats.chars },
                  { label: 'Paragraphs', value: stats.paragraphs },
                  { label: 'Unique Words', value: stats.uniqueWords },
                  { label: 'Complex Words', value: stats.complexWords },
                ].map(s => (
                  <div key={s.label} className="p-2 bg-gray-900 rounded-lg border border-gray-800 text-center">
                    <div className="text-lg font-bold">{s.value}</div>
                    <div className="text-[10px] text-gray-500">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
                <h3 className="text-sm text-gray-400 mb-3">Grade Level Scores</h3>
                <div className="space-y-2 text-sm">
                  {[
                    { label: 'Flesch-Kincaid', value: stats.fkGrade },
                    { label: 'Gunning Fog', value: stats.fog },
                    { label: 'Coleman-Liau', value: stats.cli },
                    { label: 'SMOG', value: stats.smog },
                    { label: 'Auto Readability', value: stats.ari },
                  ].map(s => (
                    <div key={s.label} className="flex justify-between items-center">
                      <span className="text-gray-400">{s.label}</span>
                      <span className="font-mono font-bold">Grade {s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-gray-900 rounded-xl border border-gray-800 text-center">
                  <p className="text-xs text-gray-500">Reading Time</p>
                  <p className="text-lg font-bold">{stats.readingTime} min</p>
                </div>
                <div className="p-3 bg-gray-900 rounded-xl border border-gray-800 text-center">
                  <p className="text-xs text-gray-500">Speaking Time</p>
                  <p className="text-lg font-bold">{stats.speakingTime} min</p>
                </div>
              </div>
            </>}
          </div>
        </div>
      </div>
    </div>
  );
}

function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}
