import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Copy, Check, RefreshCw, Shield, Eye, EyeOff } from 'lucide-react';

interface PasswordOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
  excludeSimilar: boolean;
}

const charSets = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  ambiguous: 'l1IO0',
  similar: 'il1Lo0O',
};

export default function PasswordGenerator() {
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(true);
  const [history, setHistory] = useState<string[]>([]);
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeAmbiguous: false,
    excludeSimilar: false,
  });

  const generatePassword = () => {
    let chars = '';
    if (options.uppercase) chars += charSets.uppercase;
    if (options.lowercase) chars += charSets.lowercase;
    if (options.numbers) chars += charSets.numbers;
    if (options.symbols) chars += charSets.symbols;

    if (options.excludeAmbiguous) {
      chars = chars.split('').filter((c) => !charSets.ambiguous.includes(c)).join('');
    }
    if (options.excludeSimilar) {
      chars = chars.split('').filter((c) => !charSets.similar.includes(c)).join('');
    }

    if (!chars) {
      setPassword('Select at least one character type');
      return;
    }

    const array = new Uint32Array(options.length);
    crypto.getRandomValues(array);
    const newPassword = Array.from(array, (n) => chars[n % chars.length]).join('');
    setPassword(newPassword);
    setHistory((prev) => [newPassword, ...prev.slice(0, 9)]);
  };

  useEffect(() => {
    generatePassword();
  }, []);

  const copyToClipboard = async (text: string = password) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStrength = (): { score: number; label: string; color: string } => {
    if (!password || password.includes('Select')) return { score: 0, label: 'N/A', color: 'bg-gray-600' };

    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (password.length >= 16) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' };
    if (score <= 4) return { score, label: 'Fair', color: 'bg-yellow-500' };
    if (score <= 5) return { score, label: 'Good', color: 'bg-blue-500' };
    return { score, label: 'Strong', color: 'bg-green-500' };
  };

  const strength = getStrength();
  const entropy = password && !password.includes('Select')
    ? Math.round(password.length * Math.log2(
        (options.uppercase ? 26 : 0) +
        (options.lowercase ? 26 : 0) +
        (options.numbers ? 10 : 0) +
        (options.symbols ? 32 : 0)
      ))
    : 0;

  const presets = [
    { label: 'PIN', length: 4, uppercase: false, lowercase: false, numbers: true, symbols: false },
    { label: 'Simple', length: 8, uppercase: true, lowercase: true, numbers: true, symbols: false },
    { label: 'Standard', length: 16, uppercase: true, lowercase: true, numbers: true, symbols: true },
    { label: 'Strong', length: 24, uppercase: true, lowercase: true, numbers: true, symbols: true },
    { label: 'Paranoid', length: 32, uppercase: true, lowercase: true, numbers: true, symbols: true },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="w-6 h-6 text-green-400" />
              Password Generator
            </h1>
            <p className="text-gray-400 text-sm">Generate secure, random passwords</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Password Display */}
            <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    readOnly
                    className="w-full p-4 bg-gray-800 border border-gray-700 rounded-lg font-mono text-lg text-green-400 pr-24"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => copyToClipboard()}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button
                  onClick={generatePassword}
                  className="p-4 bg-green-500 hover:bg-green-600 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>

              {/* Strength Meter */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Strength</span>
                  <span className={`font-medium ${strength.color.replace('bg-', 'text-')}`}>
                    {strength.label}
                  </span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${strength.color} transition-all duration-300`}
                    style={{ width: `${(strength.score / 7) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{password.length} characters</span>
                  <span>~{entropy} bits entropy</span>
                </div>
              </div>
            </div>

            {/* Options */}
            <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">
              <h3 className="text-sm font-medium text-gray-300 mb-4">Options</h3>

              {/* Length Slider */}
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <label className="text-sm text-gray-400">Length</label>
                  <span className="text-sm font-mono text-green-400">{options.length}</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="64"
                  value={options.length}
                  onChange={(e) => setOptions({ ...options, length: parseInt(e.target.value) })}
                  className="w-full accent-green-500"
                />
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>4</span>
                  <span>64</span>
                </div>
              </div>

              {/* Character Types */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'uppercase', label: 'Uppercase (A-Z)' },
                  { key: 'lowercase', label: 'Lowercase (a-z)' },
                  { key: 'numbers', label: 'Numbers (0-9)' },
                  { key: 'symbols', label: 'Symbols (!@#$...)' },
                  { key: 'excludeAmbiguous', label: 'Exclude Ambiguous' },
                  { key: 'excludeSimilar', label: 'Exclude Similar' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-750">
                    <input
                      type="checkbox"
                      checked={options[key as keyof PasswordOptions] as boolean}
                      onChange={(e) => setOptions({ ...options, [key]: e.target.checked })}
                      className="w-4 h-4 accent-green-500"
                    />
                    <span className="text-sm text-gray-300">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => {
                    setOptions({ ...options, ...preset });
                    setTimeout(generatePassword, 0);
                  }}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* History Sidebar */}
          <div className="space-y-4">
            <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Recent Passwords</h3>
              <div className="space-y-2">
                {history.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-4">No history yet</p>
                ) : (
                  history.map((pwd, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 p-2 bg-gray-800 rounded-lg group"
                    >
                      <code className="flex-1 text-xs text-gray-400 truncate font-mono">
                        {pwd.slice(0, 20)}...
                      </code>
                      <button
                        onClick={() => copyToClipboard(pwd)}
                        className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-700 rounded transition-all"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Tips</h3>
              <ul className="space-y-2 text-xs text-gray-400">
                <li>• Use at least 12 characters</li>
                <li>• Mix uppercase, lowercase, numbers & symbols</li>
                <li>• Never reuse passwords</li>
                <li>• Use a password manager</li>
                <li>• Enable 2FA when available</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
