import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Type, RefreshCw } from 'lucide-react';

type CaseType = 'lower' | 'upper' | 'title' | 'sentence' | 'camel' | 'pascal' | 'snake' | 'kebab' | 'constant' | 'dot' | 'path' | 'alternate' | 'inverse';

const caseConverters: Record<CaseType, { label: string; convert: (text: string) => string; example: string }> = {
  lower: {
    label: 'lowercase',
    convert: (text) => text.toLowerCase(),
    example: 'hello world',
  },
  upper: {
    label: 'UPPERCASE',
    convert: (text) => text.toUpperCase(),
    example: 'HELLO WORLD',
  },
  title: {
    label: 'Title Case',
    convert: (text) => text.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()),
    example: 'Hello World',
  },
  sentence: {
    label: 'Sentence case',
    convert: (text) => text.toLowerCase().replace(/(^\w|\.\s+\w)/g, (c) => c.toUpperCase()),
    example: 'Hello world. This is a test.',
  },
  camel: {
    label: 'camelCase',
    convert: (text) => {
      const words = text.toLowerCase().split(/[\s_\-\.]+/);
      return words[0] + words.slice(1).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('');
    },
    example: 'helloWorld',
  },
  pascal: {
    label: 'PascalCase',
    convert: (text) => {
      const words = text.toLowerCase().split(/[\s_\-\.]+/);
      return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('');
    },
    example: 'HelloWorld',
  },
  snake: {
    label: 'snake_case',
    convert: (text) => text.toLowerCase().replace(/[\s\-\.]+/g, '_').replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase(),
    example: 'hello_world',
  },
  kebab: {
    label: 'kebab-case',
    convert: (text) => text.toLowerCase().replace(/[\s_\.]+/g, '-').replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(),
    example: 'hello-world',
  },
  constant: {
    label: 'CONSTANT_CASE',
    convert: (text) => text.toUpperCase().replace(/[\s\-\.]+/g, '_').replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase(),
    example: 'HELLO_WORLD',
  },
  dot: {
    label: 'dot.case',
    convert: (text) => text.toLowerCase().replace(/[\s_\-]+/g, '.').replace(/([a-z])([A-Z])/g, '$1.$2').toLowerCase(),
    example: 'hello.world',
  },
  path: {
    label: 'path/case',
    convert: (text) => text.toLowerCase().replace(/[\s_\-\.]+/g, '/').replace(/([a-z])([A-Z])/g, '$1/$2').toLowerCase(),
    example: 'hello/world',
  },
  alternate: {
    label: 'aLtErNaTe CaSe',
    convert: (text) => text.split('').map((c, i) => (i % 2 === 0 ? c.toLowerCase() : c.toUpperCase())).join(''),
    example: 'hElLo WoRlD',
  },
  inverse: {
    label: 'INVERSEcase',
    convert: (text) => text.split('').map((c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase())).join(''),
    example: 'hELLO wORLD',
  },
};

export default function TextCaseConverter() {
  const [input, setInput] = useState('');
  const [selectedCase, setSelectedCase] = useState<CaseType>('camel');
  const [copied, setCopied] = useState<string | null>(null);

  const results = Object.entries(caseConverters).map(([key, { label, convert }]) => ({
    key: key as CaseType,
    label,
    result: input ? convert(input) : '',
  }));

  const copyToClipboard = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const stats = {
    characters: input.length,
    words: input.trim() ? input.trim().split(/\s+/).length : 0,
    lines: input ? input.split('\n').length : 0,
    sentences: input.trim() ? input.split(/[.!?]+/).filter(Boolean).length : 0,
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Type className="w-6 h-6 text-purple-400" />
              Text Case Converter
            </h1>
            <p className="text-gray-400 text-sm">Convert text between different case formats</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Section */}
          <div className="lg:col-span-2 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Input Text</label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter text to convert..."
                className="w-full h-32 p-4 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 font-mono text-sm resize-none"
              />
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setInput('hello world example text')}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs transition-colors"
              >
                Sample Text
              </button>
              <button
                onClick={() => setInput('myVariableName')}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs transition-colors"
              >
                camelCase
              </button>
              <button
                onClick={() => setInput('MY_CONSTANT_VALUE')}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs transition-colors"
              >
                CONSTANT
              </button>
              <button
                onClick={() => setInput('')}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs transition-colors flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Clear
              </button>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {results.map(({ key, label, result }) => (
                <div
                  key={key}
                  className={`p-3 bg-gray-900 border rounded-lg transition-colors ${
                    selectedCase === key ? 'border-purple-500/50' : 'border-gray-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">{label}</span>
                    <button
                      onClick={() => copyToClipboard(result, key)}
                      disabled={!result}
                      className="p-1 hover:bg-gray-800 rounded transition-colors disabled:opacity-50"
                    >
                      {copied === key ? (
                        <Check className="w-3.5 h-3.5 text-green-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-gray-500" />
                      )}
                    </button>
                  </div>
                  <div className="font-mono text-sm text-purple-400 truncate min-h-[1.5rem]">
                    {result || <span className="text-gray-600">—</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Stats */}
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Statistics</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2 bg-gray-800 rounded-lg text-center">
                  <div className="text-lg font-bold text-purple-400">{stats.characters}</div>
                  <div className="text-xs text-gray-500">Characters</div>
                </div>
                <div className="p-2 bg-gray-800 rounded-lg text-center">
                  <div className="text-lg font-bold text-purple-400">{stats.words}</div>
                  <div className="text-xs text-gray-500">Words</div>
                </div>
                <div className="p-2 bg-gray-800 rounded-lg text-center">
                  <div className="text-lg font-bold text-purple-400">{stats.lines}</div>
                  <div className="text-xs text-gray-500">Lines</div>
                </div>
                <div className="p-2 bg-gray-800 rounded-lg text-center">
                  <div className="text-lg font-bold text-purple-400">{stats.sentences}</div>
                  <div className="text-xs text-gray-500">Sentences</div>
                </div>
              </div>
            </div>

            {/* Case Reference */}
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Case Reference</h3>
              <div className="space-y-2 text-xs">
                {Object.entries(caseConverters).slice(0, 8).map(([key, { label, example }]) => (
                  <div key={key} className="flex justify-between items-center px-2 py-1.5 bg-gray-800 rounded">
                    <span className="text-gray-400">{label}</span>
                    <code className="text-purple-400">{example}</code>
                  </div>
                ))}
              </div>
            </div>

            {/* Use Cases */}
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Common Use Cases</h3>
              <div className="space-y-2 text-xs text-gray-400">
                <p><span className="text-purple-400">camelCase</span> — JS variables, functions</p>
                <p><span className="text-purple-400">PascalCase</span> — Classes, React components</p>
                <p><span className="text-purple-400">snake_case</span> — Python, DB columns</p>
                <p><span className="text-purple-400">kebab-case</span> — URLs, CSS classes</p>
                <p><span className="text-purple-400">CONSTANT_CASE</span> — Constants, env vars</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
