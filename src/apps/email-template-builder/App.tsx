import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Mail } from 'lucide-react';

interface Template { header: { text: string; bg: string; color: string }; body: { text: string; bg: string }; button: { text: string; url: string; bg: string; color: string }; footer: { text: string; color: string }; bg: string; }

const presets: Record<string, Template> = {
  Welcome: { header: { text: 'Welcome!', bg: '#3b82f6', color: '#ffffff' }, body: { text: 'Thanks for signing up. We\'re excited to have you!', bg: '#ffffff' }, button: { text: 'Get Started', url: '#', bg: '#3b82f6', color: '#ffffff' }, footer: { text: '© 2024 Company. All rights reserved.', color: '#6b7280' }, bg: '#f3f4f6' },
  Newsletter: { header: { text: 'Weekly Newsletter', bg: '#7c3aed', color: '#ffffff' }, body: { text: 'Here\'s what happened this week...', bg: '#ffffff' }, button: { text: 'Read More', url: '#', bg: '#7c3aed', color: '#ffffff' }, footer: { text: 'Unsubscribe | Preferences', color: '#6b7280' }, bg: '#f5f3ff' },
  Notification: { header: { text: 'Action Required', bg: '#ef4444', color: '#ffffff' }, body: { text: 'Your account needs attention. Please review the details below.', bg: '#ffffff' }, button: { text: 'Review Now', url: '#', bg: '#ef4444', color: '#ffffff' }, footer: { text: 'If you didn\'t request this, please ignore.', color: '#6b7280' }, bg: '#fef2f2' },
};

export default function App() {
  const [template, setTemplate] = useState<Template>(presets.Welcome);
  const [copied, setCopied] = useState(false);

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${template.header.text}</title></head><body style="margin:0;padding:0;background:${template.bg}"><table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto"><tr><td style="background:${template.header.bg};padding:32px;text-align:center"><h1 style="color:${template.header.color};margin:0;font-family:Arial,sans-serif">${template.header.text}</h1></td></tr><tr><td style="background:${template.body.bg};padding:32px;font-family:Arial,sans-serif;font-size:16px;line-height:1.6;color:#333">${template.body.text}</td></tr><tr><td style="background:${template.body.bg};padding:0 32px 32px;text-align:center"><a href="${template.button.url}" style="display:inline-block;padding:14px 32px;background:${template.button.bg};color:${template.button.color};text-decoration:none;border-radius:8px;font-family:Arial,sans-serif;font-weight:bold">${template.button.text}</a></td></tr><tr><td style="padding:24px;text-align:center;font-family:Arial,sans-serif;font-size:12px;color:${template.footer.color}">${template.footer.text}</td></tr></table></body></html>`;

  const copy = async () => { await navigator.clipboard.writeText(html); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const update = (section: keyof Template, field: string, value: string) => setTemplate(prev => ({ ...prev, [section]: { ...(prev[section] as any), [field]: value } }));

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/" className="p-2 hover:bg-gray-800 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
          <div><h1 className="text-2xl font-bold flex items-center gap-2"><Mail className="w-6 h-6 text-pink-400" /> Email Template Builder</h1></div>
        </div>
        <div className="flex gap-2 mb-6">{Object.keys(presets).map(p => <button key={p} onClick={() => setTemplate(presets[p])} className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm">{p}</button>)}</div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            {[{ label: 'Header', section: 'header' as const, fields: [{ f: 'text', l: 'Text' }, { f: 'bg', l: 'Background', type: 'color' }, { f: 'color', l: 'Text Color', type: 'color' }] },
              { label: 'Body', section: 'body' as const, fields: [{ f: 'text', l: 'Content', textarea: true }, { f: 'bg', l: 'Background', type: 'color' }] },
              { label: 'Button', section: 'button' as const, fields: [{ f: 'text', l: 'Text' }, { f: 'url', l: 'URL' }, { f: 'bg', l: 'Background', type: 'color' }, { f: 'color', l: 'Text Color', type: 'color' }] },
              { label: 'Footer', section: 'footer' as const, fields: [{ f: 'text', l: 'Text' }, { f: 'color', l: 'Text Color', type: 'color' }] },
            ].map(({ label, section, fields }) => (
              <div key={label} className="p-4 bg-gray-900 rounded-xl border border-gray-800">
                <h3 className="text-sm text-gray-400 mb-3">{label}</h3>
                <div className="grid grid-cols-2 gap-2">{fields.map(({ f, l, type, textarea }: any) => (
                  <div key={f} className={textarea ? 'col-span-2' : ''}>
                    <label className="block text-xs text-gray-500 mb-1">{l}</label>
                    {textarea ? <textarea value={(template[section] as any)[f]} onChange={e => update(section, f, e.target.value)} rows={3} className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-sm resize-none focus:outline-none" /> :
                    type === 'color' ? <div className="flex gap-2"><input type="color" value={(template[section] as any)[f]} onChange={e => update(section, f, e.target.value)} className="w-8 h-8 rounded cursor-pointer" /><input value={(template[section] as any)[f]} onChange={e => update(section, f, e.target.value)} className="flex-1 p-1.5 bg-gray-800 border border-gray-700 rounded text-xs font-mono focus:outline-none" /></div> :
                    <input value={(template[section] as any)[f]} onChange={e => update(section, f, e.target.value)} className="w-full p-1.5 bg-gray-800 border border-gray-700 rounded text-sm focus:outline-none" />}
                  </div>
                ))}</div>
              </div>
            ))}
            <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
              <label className="block text-xs text-gray-500 mb-1">Email Background</label>
              <div className="flex gap-2"><input type="color" value={template.bg} onChange={e => setTemplate(prev => ({ ...prev, bg: e.target.value }))} className="w-8 h-8 rounded cursor-pointer" /><input value={template.bg} onChange={e => setTemplate(prev => ({ ...prev, bg: e.target.value }))} className="flex-1 p-1.5 bg-gray-800 border border-gray-700 rounded text-xs font-mono focus:outline-none" /></div>
            </div>
            <button onClick={copy} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded-lg text-sm">{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} Copy HTML</button>
          </div>
          <div>
            <h3 className="text-sm text-gray-400 mb-2">Preview</h3>
            <div className="bg-white rounded-xl overflow-hidden"><iframe srcDoc={html} className="w-full border-0" style={{ height: 500 }} /></div>
          </div>
        </div>
      </div>
    </div>
  );
}
