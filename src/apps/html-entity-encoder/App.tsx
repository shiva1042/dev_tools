import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Copy, Check, ArrowDownUp, Code } from 'lucide-react';

const htmlEntities: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '\u00A9': '&copy;',
  '\u00AE': '&reg;',
  '\u2122': '&trade;',
  '\u20AC': '&euro;',
  '\u00A3': '&pound;',
  '\u00A5': '&yen;',
  '\u00A2': '&cent;',
  '\u00A7': '&sect;',
  '\u00B0': '&deg;',
  '\u00B1': '&plusmn;',
  '\u00D7': '&times;',
  '\u00F7': '&divide;',
  '\u00BC': '&frac14;',
  '\u00BD': '&frac12;',
  '\u00BE': '&frac34;',
  '\u2026': '&hellip;',
  '\u2014': '&mdash;',
  '\u2013': '&ndash;',
  '\u2018': '&lsquo;',
  '\u2019': '&rsquo;',
  '\u201C': '&ldquo;',
  '\u201D': '&rdquo;',
  '\u00AB': '&laquo;',
  '\u00BB': '&raquo;',
  '\u2022': '&bull;',
  '\u2192': '&rarr;',
  '\u2190': '&larr;',
  '\u2191': '&uarr;',
  '\u2193': '&darr;',
  '\u2660': '&spades;',
  '\u2663': '&clubs;',
  '\u2665': '&hearts;',
  '\u2666': '&diams;',
};

const reverseEntities: Record<string, string> = Object.fromEntries(
  Object.entries(htmlEntities).map(([k, v]) => [v, k])
);

export default function HtmlEntityEncoder() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [copied, setCopied] = useState(false);
  const [encodeMode, setEncodeMode] = useState<'named' | 'numeric' | 'hex'>('named');

  const encodeHtml = (text: string): string => {
    let result = '';
    for (const char of text) {
      if (encodeMode === 'named' && htmlEntities[char]) {
        result += htmlEntities[char];
      } else if (char.charCodeAt(0) > 127 || ['<', '>', '&', '"', "'"].includes(char)) {
        if (encodeMode === 'hex') {
          result += `&#x${char.charCodeAt(0).toString(16)};`;
        } else if (encodeMode === 'numeric') {
          result += `&#${char.charCodeAt(0)};`;
        } else {
          result += htmlEntities[char] || `&#${char.charCodeAt(0)};`;
        }
      } else {
        result += char;
      }
    }
    return result;
  };

  const decodeHtml = (text: string): string => {
    let result = text;
    // Decode named entities
    for (const [entity, char] of Object.entries(reverseEntities)) {
      result = result.split(entity).join(char);
    }
    // Decode numeric entities
    result = result.replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num, 10)));
    // Decode hex entities
    result = result.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
    return result;
  };

  const processText = (text: string, processMode: 'encode' | 'decode') => {
    try {
      return processMode === 'encode' ? encodeHtml(text) : decodeHtml(text);
    } catch {
      return 'Error processing input';
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

  const handleEncodeModeChange = (newMode: 'named' | 'numeric' | 'hex') => {
    setEncodeMode(newMode);
    if (mode === 'encode' && input) {
      setOutput(encodeHtml(input));
    }
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

  const insertEntity = (entity: string) => {
    const newInput = input + entity;
    setInput(newInput);
    setOutput(processText(newInput, mode));
  };

  const examples = [
    { label: 'HTML tags', value: '<div class="test">Hello & Goodbye</div>' },
    { label: 'Special chars', value: '© 2024 Company™ — All rights reserved' },
    { label: 'Quotes', value: 'She said "Hello" and \'Goodbye\'' },
    { label: 'Math symbols', value: '5 × 10 = 50, 100 ÷ 4 = 25, ±5°' },
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
              <Code className="w-6 h-6 text-orange-400" />
              HTML Entity Encoder
            </h1>
            <p className="text-gray-400 text-sm">Encode and decode HTML entities</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-4">
            {/* Controls */}
            <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-900 rounded-lg border border-gray-800">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Mode:</span>
                <button
                  onClick={handleModeToggle}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    mode === 'encode'
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                      : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  }`}
                >
                  {mode === 'encode' ? 'Encode' : 'Decode'}
                </button>
              </div>

              {mode === 'encode' && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Format:</span>
                  <div className="flex rounded-lg overflow-hidden border border-gray-700">
                    {(['named', 'numeric', 'hex'] as const).map((m) => (
                      <button
                        key={m}
                        onClick={() => handleEncodeModeChange(m)}
                        className={`px-3 py-1.5 text-sm capitalize ${
                          encodeMode === m ? 'bg-gray-700 text-white' : 'bg-gray-800 text-gray-400'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              )}

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
                {mode === 'encode' ? 'Plain Text' : 'Encoded HTML'}
              </label>
              <textarea
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter HTML entities to decode...'}
                className="w-full h-40 p-4 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 font-mono text-sm resize-none"
              />
            </div>

            {/* Output */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-300">
                  {mode === 'encode' ? 'HTML Entities' : 'Decoded Text'}
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
                className="w-full h-40 p-4 bg-gray-900 border border-gray-800 rounded-lg text-orange-400 font-mono text-sm resize-none"
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
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

            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Quick Insert</h3>
              <div className="grid grid-cols-4 gap-1">
                {Object.entries(htmlEntities).slice(0, 20).map(([char, entity]) => (
                  <button
                    key={entity}
                    onClick={() => insertEntity(char)}
                    title={entity}
                    className="p-2 bg-gray-800 hover:bg-gray-700 rounded text-sm transition-colors"
                  >
                    {char}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Common Entities</h3>
              <div className="space-y-1 text-xs font-mono max-h-48 overflow-y-auto">
                {Object.entries(htmlEntities).slice(0, 15).map(([char, entity]) => (
                  <div key={entity} className="flex justify-between px-2 py-1 bg-gray-800 rounded">
                    <span className="text-gray-400">{char}</span>
                    <span className="text-orange-400">{entity}</span>
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
