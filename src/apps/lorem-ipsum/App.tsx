import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Copy, Check, RefreshCw, FileText } from 'lucide-react';

const loremWords = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
  'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
  'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
  'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
  'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum', 'perspiciatis', 'unde',
  'omnis', 'iste', 'natus', 'error', 'voluptatem', 'accusantium', 'doloremque',
  'laudantium', 'totam', 'rem', 'aperiam', 'eaque', 'ipsa', 'quae', 'ab', 'illo',
  'inventore', 'veritatis', 'quasi', 'architecto', 'beatae', 'vitae', 'dicta',
  'explicabo', 'nemo', 'ipsam', 'quia', 'voluptas', 'aspernatur', 'aut', 'odit',
  'fugit', 'consequuntur', 'magni', 'dolores', 'eos', 'ratione', 'sequi',
  'nesciunt', 'neque', 'porro', 'quisquam', 'nihil', 'impedit', 'quo', 'minus',
];

const classicStart = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';

type GenerateType = 'paragraphs' | 'sentences' | 'words';
type TextFormat = 'plain' | 'html' | 'markdown';

export default function LoremIpsum() {
  const [output, setOutput] = useState(classicStart);
  const [copied, setCopied] = useState(false);
  const [count, setCount] = useState(3);
  const [type, setType] = useState<GenerateType>('paragraphs');
  const [format, setFormat] = useState<TextFormat>('plain');
  const [startWithLorem, setStartWithLorem] = useState(true);

  const randomWord = () => loremWords[Math.floor(Math.random() * loremWords.length)];

  const generateSentence = (minWords = 8, maxWords = 15): string => {
    const wordCount = Math.floor(Math.random() * (maxWords - minWords + 1)) + minWords;
    const words = Array.from({ length: wordCount }, randomWord);
    words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
    return words.join(' ') + '.';
  };

  const generateParagraph = (minSentences = 4, maxSentences = 8): string => {
    const sentenceCount = Math.floor(Math.random() * (maxSentences - minSentences + 1)) + minSentences;
    return Array.from({ length: sentenceCount }, () => generateSentence()).join(' ');
  };

  const generate = () => {
    let result: string[] = [];

    switch (type) {
      case 'words':
        result = Array.from({ length: count }, randomWord);
        if (startWithLorem && result.length > 0) {
          result[0] = 'Lorem';
          if (result.length > 1) result[1] = 'ipsum';
        }
        break;
      case 'sentences':
        result = Array.from({ length: count }, () => generateSentence());
        if (startWithLorem && result.length > 0) {
          result[0] = classicStart;
        }
        break;
      case 'paragraphs':
        result = Array.from({ length: count }, () => generateParagraph());
        if (startWithLorem && result.length > 0) {
          result[0] = classicStart + ' ' + generateParagraph(3, 6);
        }
        break;
    }

    let formatted = '';
    switch (format) {
      case 'html':
        if (type === 'paragraphs') {
          formatted = result.map((p) => `<p>${p}</p>`).join('\n\n');
        } else {
          formatted = `<p>${result.join(type === 'words' ? ' ' : ' ')}</p>`;
        }
        break;
      case 'markdown':
        if (type === 'paragraphs') {
          formatted = result.join('\n\n');
        } else {
          formatted = result.join(type === 'words' ? ' ' : ' ');
        }
        break;
      default:
        formatted = result.join(type === 'paragraphs' ? '\n\n' : type === 'words' ? ' ' : ' ');
    }

    setOutput(formatted);
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const stats = {
    characters: output.length,
    words: output.trim().split(/\s+/).length,
    paragraphs: output.split(/\n\n+/).length,
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="w-6 h-6 text-amber-400" />
              Lorem Ipsum Generator
            </h1>
            <p className="text-gray-400 text-sm">Generate placeholder text for your designs</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-4">
            {/* Controls */}
            <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-900 rounded-lg border border-gray-800">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-400">Generate</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={count}
                  onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-center"
                />
              </div>

              <div className="flex rounded-lg overflow-hidden border border-gray-700">
                {(['paragraphs', 'sentences', 'words'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={`px-3 py-1.5 text-sm capitalize ${
                      type === t ? 'bg-gray-700 text-white' : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-400">Format:</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as TextFormat)}
                  className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm"
                >
                  <option value="plain">Plain Text</option>
                  <option value="html">HTML</option>
                  <option value="markdown">Markdown</option>
                </select>
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-400">
                <input
                  type="checkbox"
                  checked={startWithLorem}
                  onChange={(e) => setStartWithLorem(e.target.checked)}
                  className="accent-amber-500"
                />
                Start with "Lorem ipsum"
              </label>

              <button
                onClick={generate}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black rounded-lg text-sm font-medium transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Generate
              </button>
            </div>

            {/* Output */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-300">Generated Text</label>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <textarea
                value={output}
                readOnly
                className="w-full h-80 p-4 bg-gray-900 border border-gray-800 rounded-lg text-gray-300 text-sm resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Statistics</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Characters</span>
                  <span className="text-amber-400 font-mono">{stats.characters.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Words</span>
                  <span className="text-amber-400 font-mono">{stats.words.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Paragraphs</span>
                  <span className="text-amber-400 font-mono">{stats.paragraphs}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Quick Generate</h3>
              <div className="space-y-2">
                {[
                  { label: '1 Paragraph', count: 1, type: 'paragraphs' as const },
                  { label: '3 Paragraphs', count: 3, type: 'paragraphs' as const },
                  { label: '5 Sentences', count: 5, type: 'sentences' as const },
                  { label: '50 Words', count: 50, type: 'words' as const },
                  { label: '100 Words', count: 100, type: 'words' as const },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => {
                      setCount(preset.count);
                      setType(preset.type);
                      setTimeout(generate, 0);
                    }}
                    className="w-full text-left px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
              <h3 className="text-sm font-medium text-gray-300 mb-3">About</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Lorem Ipsum has been the industry's standard dummy text since the 1500s,
                when an unknown printer scrambled type to make a specimen book.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
