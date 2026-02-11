import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, Globe } from 'lucide-react';

const codes = [
  { code: 100, text: 'Continue', desc: 'Server received headers, client should proceed', cat: '1xx' },
  { code: 101, text: 'Switching Protocols', desc: 'Server switching to protocol requested by client', cat: '1xx' },
  { code: 200, text: 'OK', desc: 'Standard success response', cat: '2xx' },
  { code: 201, text: 'Created', desc: 'Resource successfully created', cat: '2xx' },
  { code: 204, text: 'No Content', desc: 'Success with no response body', cat: '2xx' },
  { code: 206, text: 'Partial Content', desc: 'Partial resource returned (range requests)', cat: '2xx' },
  { code: 301, text: 'Moved Permanently', desc: 'Resource permanently moved to new URL', cat: '3xx' },
  { code: 302, text: 'Found', desc: 'Resource temporarily at different URL', cat: '3xx' },
  { code: 304, text: 'Not Modified', desc: 'Cached version is still valid', cat: '3xx' },
  { code: 307, text: 'Temporary Redirect', desc: 'Temporary redirect, preserving HTTP method', cat: '3xx' },
  { code: 308, text: 'Permanent Redirect', desc: 'Permanent redirect, preserving HTTP method', cat: '3xx' },
  { code: 400, text: 'Bad Request', desc: 'Malformed request syntax or invalid parameters', cat: '4xx' },
  { code: 401, text: 'Unauthorized', desc: 'Authentication required', cat: '4xx' },
  { code: 403, text: 'Forbidden', desc: 'Server refuses to authorize request', cat: '4xx' },
  { code: 404, text: 'Not Found', desc: 'Resource does not exist', cat: '4xx' },
  { code: 405, text: 'Method Not Allowed', desc: 'HTTP method not supported for this resource', cat: '4xx' },
  { code: 408, text: 'Request Timeout', desc: 'Server timed out waiting for request', cat: '4xx' },
  { code: 409, text: 'Conflict', desc: 'Request conflicts with server state', cat: '4xx' },
  { code: 410, text: 'Gone', desc: 'Resource permanently removed', cat: '4xx' },
  { code: 413, text: 'Payload Too Large', desc: 'Request body exceeds server limits', cat: '4xx' },
  { code: 415, text: 'Unsupported Media Type', desc: 'Media type not supported', cat: '4xx' },
  { code: 422, text: 'Unprocessable Entity', desc: 'Well-formed but semantically invalid request', cat: '4xx' },
  { code: 429, text: 'Too Many Requests', desc: 'Rate limit exceeded', cat: '4xx' },
  { code: 500, text: 'Internal Server Error', desc: 'Unexpected server error', cat: '5xx' },
  { code: 501, text: 'Not Implemented', desc: 'Server does not support requested functionality', cat: '5xx' },
  { code: 502, text: 'Bad Gateway', desc: 'Invalid response from upstream server', cat: '5xx' },
  { code: 503, text: 'Service Unavailable', desc: 'Server temporarily unable to handle request', cat: '5xx' },
  { code: 504, text: 'Gateway Timeout', desc: 'Upstream server failed to respond in time', cat: '5xx' },
];

const catColors: Record<string, { bg: string; text: string; border: string }> = {
  '1xx': { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  '2xx': { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' },
  '3xx': { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  '4xx': { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
  '5xx': { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
};

export default function App() {
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');

  const filtered = codes.filter(c => {
    if (filterCat && c.cat !== filterCat) return false;
    if (search && !String(c.code).includes(search) && !c.text.toLowerCase().includes(search.toLowerCase()) && !c.desc.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const grouped = filtered.reduce((acc, c) => { (acc[c.cat] = acc[c.cat] || []).push(c); return acc; }, {} as Record<string, typeof codes>);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 hover:bg-gray-800 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
          <div><h1 className="text-2xl font-bold flex items-center gap-2"><Globe className="w-6 h-6 text-blue-400" /> HTTP Status Reference</h1>
          <p className="text-gray-400 text-sm">All HTTP status codes at a glance</p></div>
        </div>
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by code or text..." className="w-full pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500" /></div>
          <div className="flex gap-1">
            <button onClick={() => setFilterCat('')} className={`px-3 py-1.5 rounded-lg text-sm ${!filterCat ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-800 text-gray-400'}`}>All</button>
            {Object.keys(catColors).map(c => <button key={c} onClick={() => setFilterCat(c === filterCat ? '' : c)} className={`px-3 py-1.5 rounded-lg text-sm ${filterCat === c ? catColors[c].bg + ' ' + catColors[c].text : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>{c}</button>)}
          </div>
        </div>
        <div className="space-y-6">
          {Object.entries(grouped).map(([cat, items]) => (
            <div key={cat}>
              <h2 className={`text-sm font-medium mb-3 ${catColors[cat].text}`}>{cat} - {cat === '1xx' ? 'Informational' : cat === '2xx' ? 'Success' : cat === '3xx' ? 'Redirection' : cat === '4xx' ? 'Client Error' : 'Server Error'}</h2>
              <div className="space-y-2">
                {items.map(c => (
                  <div key={c.code} className={`p-4 rounded-xl border ${catColors[c.cat].border} ${catColors[c.cat].bg} cursor-pointer hover:opacity-80`} onClick={() => navigator.clipboard.writeText(String(c.code))}>
                    <div className="flex items-center gap-3">
                      <span className={`text-xl font-bold font-mono ${catColors[c.cat].text}`}>{c.code}</span>
                      <div><p className="text-sm font-medium">{c.text}</p><p className="text-xs text-gray-400">{c.desc}</p></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
