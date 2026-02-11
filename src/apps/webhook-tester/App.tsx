import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Send, Copy, Check, Clock, Webhook } from 'lucide-react';

interface ReqHistory { id: string; method: string; url: string; status: number; time: number; response: string; timestamp: number; }

export default function App() {
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/posts/1');
  const [method, setMethod] = useState('GET');
  const [headers, setHeaders] = useState('{\n  "Content-Type": "application/json"\n}');
  const [body, setBody] = useState('');
  const [response, setResponse] = useState('');
  const [status, setStatus] = useState<number | null>(null);
  const [resTime, setResTime] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<ReqHistory[]>([]);
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<'headers' | 'body'>('headers');

  const sendRequest = async () => {
    setLoading(true); setResponse(''); setStatus(null);
    const start = performance.now();
    try {
      let hdrs: Record<string, string> = {};
      try { hdrs = JSON.parse(headers); } catch {}
      const opts: RequestInit = { method, headers: hdrs };
      if (['POST', 'PUT', 'PATCH'].includes(method) && body) opts.body = body;
      const res = await fetch(url, opts);
      const text = await res.text();
      const time = Math.round(performance.now() - start);
      let formatted = text;
      try { formatted = JSON.stringify(JSON.parse(text), null, 2); } catch {}
      setResponse(formatted); setStatus(res.status); setResTime(time);
      setHistory(prev => [{ id: crypto.randomUUID(), method, url, status: res.status, time, response: formatted, timestamp: Date.now() }, ...prev.slice(0, 19)]);
    } catch (e: unknown) {
      setResponse(e instanceof Error ? e.message : 'Request failed');
      setStatus(0); setResTime(Math.round(performance.now() - start));
    }
    setLoading(false);
  };

  const toCurl = () => {
    let cmd = `curl -X ${method}`;
    try { const h = JSON.parse(headers); Object.entries(h).forEach(([k, v]) => { cmd += ` -H '${k}: ${v}'`; }); } catch {}
    if (body && ['POST', 'PUT', 'PATCH'].includes(method)) cmd += ` -d '${body}'`;
    cmd += ` '${url}'`;
    return cmd;
  };

  const copy = async (text: string) => { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
  const methodColors: Record<string, string> = { GET: 'text-green-400', POST: 'text-blue-400', PUT: 'text-orange-400', PATCH: 'text-yellow-400', DELETE: 'text-red-400' };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/" className="p-2 hover:bg-gray-800 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
          <div><h1 className="text-2xl font-bold flex items-center gap-2"><Webhook className="w-6 h-6 text-yellow-400" /> Webhook Tester</h1>
          <p className="text-gray-400 text-sm">Test HTTP requests & inspect responses</p></div>
        </div>
        <div className="flex gap-2 mb-4">
          <select value={method} onChange={e => setMethod(e.target.value)} className={`p-2 bg-gray-800 border border-gray-700 rounded-lg text-sm font-bold ${methodColors[method]}`}>
            {methods.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <input value={url} onChange={e => setUrl(e.target.value)} placeholder="Enter URL" className="flex-1 p-2 bg-gray-800 border border-gray-700 rounded-lg text-sm font-mono focus:outline-none focus:border-yellow-500" />
          <button onClick={sendRequest} disabled={loading} className="flex items-center gap-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 rounded-lg text-sm"><Send className="w-4 h-4" /> Send</button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="flex gap-1">
              {(['headers', 'body'] as const).map(t => <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 rounded-lg text-sm capitalize ${tab === t ? 'bg-gray-800 text-yellow-400' : 'bg-gray-900 text-gray-500'}`}>{t}</button>)}
              <div className="flex-1" />
              <button onClick={() => copy(toCurl())} className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs">Copy cURL</button>
            </div>
            {tab === 'headers' && <textarea value={headers} onChange={e => setHeaders(e.target.value)} rows={8} className="w-full p-3 bg-gray-900 border border-gray-800 rounded-xl font-mono text-sm text-gray-300 resize-none focus:outline-none" />}
            {tab === 'body' && <textarea value={body} onChange={e => setBody(e.target.value)} rows={8} placeholder="Request body (JSON)" className="w-full p-3 bg-gray-900 border border-gray-800 rounded-xl font-mono text-sm text-gray-300 resize-none focus:outline-none" />}
            <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
              <h3 className="text-sm text-gray-400 mb-2">History</h3>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {history.length === 0 ? <p className="text-xs text-gray-600">No requests yet</p> :
                history.map(h => (
                  <div key={h.id} onClick={() => { setUrl(h.url); setMethod(h.method); setResponse(h.response); setStatus(h.status); setResTime(h.time); }} className="flex items-center gap-2 p-2 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-750 text-xs">
                    <span className={`font-bold ${methodColors[h.method]}`}>{h.method}</span>
                    <span className="truncate flex-1 text-gray-400">{h.url}</span>
                    <span className={h.status < 400 ? 'text-green-400' : 'text-red-400'}>{h.status}</span>
                    <span className="text-gray-500">{h.time}ms</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm text-gray-400">Response</span>
              {status !== null && <span className={`text-sm font-bold ${status >= 200 && status < 300 ? 'text-green-400' : status >= 400 ? 'text-red-400' : 'text-yellow-400'}`}>{status}</span>}
              {resTime !== null && <span className="text-xs text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" />{resTime}ms</span>}
              <div className="flex-1" />
              <button onClick={() => copy(response)} className="p-1 hover:bg-gray-800 rounded">{copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-500" />}</button>
            </div>
            <textarea value={response} readOnly rows={20} className="w-full p-3 bg-gray-900 border border-gray-800 rounded-xl font-mono text-sm text-green-300 resize-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
