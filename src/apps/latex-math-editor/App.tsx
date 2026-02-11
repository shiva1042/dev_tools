import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Copy, Check, FunctionSquare } from 'lucide-react';

const symbols = [
  { label: 'Greek', items: ['\\alpha','\\beta','\\gamma','\\delta','\\epsilon','\\theta','\\lambda','\\mu','\\pi','\\sigma','\\phi','\\omega','\\Omega','\\Delta','\\Sigma','\\Pi'] },
  { label: 'Operators', items: ['\\frac{a}{b}','\\sqrt{x}','\\sum_{i=0}^{n}','\\int_{a}^{b}','\\prod_{i=1}^{n}','\\lim_{x \\to \\infty}','\\partial','\\nabla','\\infty','\\pm','\\times','\\div','\\cdot','\\neq','\\leq','\\geq'] },
  { label: 'Arrows', items: ['\\rightarrow','\\leftarrow','\\Rightarrow','\\Leftarrow','\\leftrightarrow','\\mapsto'] },
];

const templates = [
  { name: 'Quadratic Formula', tex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}' },
  { name: "Euler's Identity", tex: 'e^{i\\pi} + 1 = 0' },
  { name: 'Pythagorean Theorem', tex: 'a^2 + b^2 = c^2' },
  { name: 'Taylor Series', tex: 'f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!}(x-a)^n' },
  { name: 'Normal Distribution', tex: 'f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}} e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}' },
  { name: 'Matrix', tex: '\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}' },
];

function renderLatex(tex: string): string {
  let html = tex;
  const greekMap: Record<string, string> = { '\\alpha':'α','\\beta':'β','\\gamma':'γ','\\delta':'δ','\\epsilon':'ε','\\theta':'θ','\\lambda':'λ','\\mu':'μ','\\pi':'π','\\sigma':'σ','\\phi':'φ','\\omega':'ω','\\Omega':'Ω','\\Delta':'Δ','\\Sigma':'Σ','\\Pi':'Π','\\infty':'∞','\\pm':'±','\\times':'×','\\div':'÷','\\cdot':'·','\\neq':'≠','\\leq':'≤','\\geq':'≥','\\rightarrow':'→','\\leftarrow':'←','\\Rightarrow':'⇒','\\Leftarrow':'⇐','\\leftrightarrow':'↔','\\mapsto':'↦','\\partial':'∂','\\nabla':'∇','\\forall':'∀','\\exists':'∃' };
  for (const [k, v] of Object.entries(greekMap)) html = html.split(k).join(v);
  html = html.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '<span style="display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle"><span style="border-bottom:1px solid currentColor;padding:0 4px">$1</span><span style="padding:0 4px">$2</span></span>');
  html = html.replace(/\\sqrt\{([^}]+)\}/g, '√($1)');
  html = html.replace(/\\sum_\{([^}]*)\}\^\{([^}]*)\}/g, '<span style="display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;margin:0 2px"><sup style="font-size:0.6em">$2</sup><span style="font-size:1.4em">Σ</span><sub style="font-size:0.6em">$1</sub></span>');
  html = html.replace(/\\int_\{([^}]*)\}\^\{([^}]*)\}/g, '<span style="display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;margin:0 2px"><sup style="font-size:0.6em">$2</sup><span style="font-size:1.4em">∫</span><sub style="font-size:0.6em">$1</sub></span>');
  html = html.replace(/\\prod_\{([^}]*)\}\^\{([^}]*)\}/g, '<span style="display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;margin:0 2px"><sup style="font-size:0.6em">$2</sup><span style="font-size:1.4em">∏</span><sub style="font-size:0.6em">$1</sub></span>');
  html = html.replace(/\\lim_\{([^}]*)\}/g, '<span style="display:inline-flex;flex-direction:column;align-items:center;margin:0 4px"><span>lim</span><sub style="font-size:0.7em">$1</sub></span>');
  html = html.replace(/\\to/g, '→');
  html = html.replace(/\^(\{([^}]+)\}|(\w))/g, (_, __, g1, g2) => `<sup>${g1 || g2}</sup>`);
  html = html.replace(/_(\{([^}]+)\}|(\w))/g, (_, __, g1, g2) => `<sub>${g1 || g2}</sub>`);
  html = html.replace(/\\begin\{bmatrix\}([\s\S]*?)\\end\{bmatrix\}/g, (_, content) => {
    const rows = content.split('\\\\').map((r: string) => r.trim().split('&').map((c: string) => `<td style="padding:2px 8px">${c.trim()}</td>`).join(''));
    return `<span style="display:inline-flex;align-items:center;margin:0 4px">[<table style="display:inline-table;border-collapse:collapse">${rows.map((r: string) => `<tr>${r}</tr>`).join('')}</table>]</span>`;
  });
  html = html.replace(/\\\\/g, '<br/>');
  return html;
}

export default function App() {
  const [tex, setTex] = useState('x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}');
  const [copied, setCopied] = useState(false);

  const copy = async () => { await navigator.clipboard.writeText(tex); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const insert = (s: string) => setTex(prev => prev + ' ' + s);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 hover:bg-gray-800 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
          <div><h1 className="text-2xl font-bold flex items-center gap-2"><FunctionSquare className="w-6 h-6 text-emerald-400" /> LaTeX Math Editor</h1>
          <p className="text-gray-400 text-sm">Write and preview math equations</p></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
              <label className="block text-xs text-gray-500 mb-2">LaTeX Input</label>
              <textarea value={tex} onChange={e => setTex(e.target.value)} rows={4} className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg font-mono text-sm resize-none focus:outline-none focus:border-emerald-500" />
              <button onClick={copy} className="mt-2 flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm">{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copied ? 'Copied' : 'Copy LaTeX'}</button>
            </div>
            <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">
              <label className="block text-xs text-gray-500 mb-3">Preview</label>
              <div className="p-4 bg-gray-800 rounded-lg text-2xl text-center min-h-[80px] flex items-center justify-center" dangerouslySetInnerHTML={{ __html: renderLatex(tex) }} />
            </div>
            {symbols.map(group => (
              <div key={group.label} className="p-4 bg-gray-900 rounded-xl border border-gray-800">
                <h3 className="text-xs text-gray-500 mb-2">{group.label}</h3>
                <div className="flex flex-wrap gap-1">
                  {group.items.map(s => (
                    <button key={s} onClick={() => insert(s)} className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs font-mono">{s.replace(/\\/g, '').replace(/\{[^}]*\}/g, '').slice(0, 8) || s}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div>
            <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Templates</h3>
              <div className="space-y-2">
                {templates.map(t => (
                  <button key={t.name} onClick={() => setTex(t.tex)} className="w-full text-left p-3 bg-gray-800 hover:bg-gray-750 rounded-lg">
                    <span className="text-sm text-emerald-400 block mb-1">{t.name}</span>
                    <span className="text-xs text-gray-500 font-mono block truncate">{t.tex}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
