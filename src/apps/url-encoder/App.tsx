import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Copy, Check, ArrowDownUp, Link as LinkIcon } from 'lucide-react';

export default function UrlEncoder() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [copied, setCopied] = useState(false);
  const [encodeType, setEncodeType] = useState<'full' | 'component'>('component');

  const processText = (text: string, processMode: 'encode' | 'decode') => {
    try {
      if (processMode === 'encode') {
        return encodeType === 'full' ? encodeURI(text) : encodeURIComponent(text);
      } else {
        return encodeType === 'full' ? decodeURI(text) : decodeURIComponent(text);
      }
    } catch (e) {
      return `Error: Invalid ${processMode === 'decode' ? 'encoded' : ''} input`;
    }
  };

  const handleInputChange = (text: string) => {
    setInput(text);
    setOutput(processText(text, mode));
  };

  const handleModeToggle = () => {
    const newMode = mode === 'encode' ? 'decode' : 'encode';
    setMode(newMode);
    setOutput(processText(input, newMode));
  };

  const handleEncodeTypeChange = (type: 'full' | 'component') => {
    setEncodeType(type);
    setInput('');
    setOutput('');
  };

  const handleSwap = () => {
    setInput(output);
    setOutput(processText(output, mode));
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const examples = [
    { label: 'URL with params', value: 'https://example.com/search?q=hello world&lang=en' },
    { label: 'Special chars', value: 'name=John Doe&email=john@example.com' },
    { label: 'Unicode', value: 'Hello 世界 🌍' },
    { label: 'Path segment', value: '/api/users/John Doe/profile' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <LinkIcon className="w-6 h-6 text-cyan-400" />
              URL Encoder/Decoder
            </h1>
            <p className="text-gray-400 text-sm">Encode and decode URLs and query parameters</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-4">
            {/* Controls */}
            <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-900 rounded-lg border border-gray-800">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Mode:</span>
                <button
                  onClick={handleModeToggle}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    mode === 'encode'
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                  }`}
                >
                  {mode === 'encode' ? 'Encode' : 'Decode'}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Type:</span>
                <div className="flex rounded-lg overflow-hidden border border-gray-700">
                  <button
                    onClick={() => handleEncodeTypeChange('component')}
                    className={`px-3 py-1.5 text-sm ${
                      encodeType === 'component' ? 'bg-gray-700 text-white' : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    Component
                  </button>
                  <button
                    onClick={() => handleEncodeTypeChange('full')}
                    className={`px-3 py-1.5 text-sm ${
                      encodeType === 'full' ? 'bg-gray-700 text-white' : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    Full URL
                  </button>
                </div>
              </div>

              <button
                onClick={handleSwap}
                className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors"
              >
                <ArrowDownUp className="w-4 h-4" />
                Swap
              </button>
            </div>

            {/* Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                {mode === 'encode' ? 'Plain Text' : 'Encoded Text'}
              </label>
              <textarea
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter encoded text to decode...'}
                className="w-full h-40 p-4 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 font-mono text-sm resize-none"
              />
            </div>

            {/* Output */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-300">
                  {mode === 'encode' ? 'Encoded Result' : 'Decoded Result'}
                </label>
                <button
                  onClick={copyToClipboard}
                  disabled={!output}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <textarea
                value={output}
                readOnly
                className="w-full h-40 p-4 bg-gray-900 border border-gray-800 rounded-lg text-cyan-400 font-mono text-sm resize-none"
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Examples */}
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Examples</h3>
              <div className="space-y-2">
                {examples.map((example, i) => (
                  <button
                    key={i}
                    onClick={() => handleInputChange(example.value)}
                    className="w-full text-left px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors"
                  >
                    <span className="text-gray-400">{example.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Info</h3>
              <div className="space-y-3 text-xs text-gray-400">
                <div>
                  <span className="text-cyan-400 font-medium">Component:</span>
                  <p>Encodes all special characters. Use for query parameter values.</p>
                </div>
                <div>
                  <span className="text-cyan-400 font-medium">Full URL:</span>
                  <p>Preserves URL-safe characters like :, /, ?, &. Use for complete URLs.</p>
                </div>
              </div>
            </div>

            {/* Character Reference */}
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Common Encodings</h3>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                {[
                  ['Space', '%20'],
                  ['!', '%21'],
                  ['#', '%23'],
                  ['$', '%24'],
                  ['&', '%26'],
                  ['@', '%40'],
                ].map(([char, encoded]) => (
                  <div key={char} className="flex justify-between px-2 py-1 bg-gray-800 rounded">
                    <span className="text-gray-400">{char}</span>
                    <span className="text-cyan-400">{encoded}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
