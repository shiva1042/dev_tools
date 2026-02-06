import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Server, Plus, Trash2, Play, Square } from 'lucide-react';

interface MockEndpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  status: number;
  delay: number;
  response: string;
  headers: Record<string, string>;
}

export default function MockAPI() {
  const [endpoints, setEndpoints] = useState<MockEndpoint[]>([
    {
      id: '1',
      method: 'GET',
      path: '/api/users',
      status: 200,
      delay: 100,
      response: JSON.stringify([
        { id: 1, name: 'John Doe', email: 'john@example.com' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
      ], null, 2),
      headers: { 'Content-Type': 'application/json' },
    },
    {
      id: '2',
      method: 'GET',
      path: '/api/users/:id',
      status: 200,
      delay: 50,
      response: JSON.stringify({ id: 1, name: 'John Doe', email: 'john@example.com' }, null, 2),
      headers: { 'Content-Type': 'application/json' },
    },
    {
      id: '3',
      method: 'POST',
      path: '/api/users',
      status: 201,
      delay: 200,
      response: JSON.stringify({ id: 3, name: 'New User', email: 'new@example.com' }, null, 2),
      headers: { 'Content-Type': 'application/json' },
    },
  ]);
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('1');
  const [serverRunning, setServerRunning] = useState(false);
  const [port, setPort] = useState(3001);
  const [copied, setCopied] = useState<string | null>(null);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addEndpoint = () => {
    const newEndpoint: MockEndpoint = {
      id: generateId(),
      method: 'GET',
      path: '/api/new-endpoint',
      status: 200,
      delay: 100,
      response: JSON.stringify({ message: 'Hello World' }, null, 2),
      headers: { 'Content-Type': 'application/json' },
    };
    setEndpoints([...endpoints, newEndpoint]);
    setSelectedEndpoint(newEndpoint.id);
  };

  const updateEndpoint = (id: string, updates: Partial<MockEndpoint>) => {
    setEndpoints(endpoints.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  };

  const removeEndpoint = (id: string) => {
    setEndpoints(endpoints.filter((e) => e.id !== id));
    if (selectedEndpoint === id && endpoints.length > 1) {
      setSelectedEndpoint(endpoints.find((e) => e.id !== id)?.id || '');
    }
  };

  const copyToClipboard = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const generateExpressCode = (): string => {
    const lines: string[] = [];
    lines.push("const express = require('express');");
    lines.push("const cors = require('cors');");
    lines.push('');
    lines.push('const app = express();');
    lines.push('app.use(cors());');
    lines.push('app.use(express.json());');
    lines.push('');

    endpoints.forEach((endpoint) => {
      const method = endpoint.method.toLowerCase();
      lines.push(`// ${endpoint.method} ${endpoint.path}`);
      lines.push(`app.${method}('${endpoint.path}', (req, res) => {`);
      if (endpoint.delay > 0) {
        lines.push(`  setTimeout(() => {`);
        lines.push(`    res.status(${endpoint.status}).json(${endpoint.response});`);
        lines.push(`  }, ${endpoint.delay});`);
      } else {
        lines.push(`  res.status(${endpoint.status}).json(${endpoint.response});`);
      }
      lines.push('});');
      lines.push('');
    });

    lines.push(`app.listen(${port}, () => {`);
    lines.push(`  console.log('Mock server running on http://localhost:${port}');`);
    lines.push('});');

    return lines.join('\n');
  };

  const generateJsonServer = (): string => {
    // Create a db.json structure
    const db: Record<string, any> = {};

    endpoints.forEach((endpoint) => {
      if (endpoint.method === 'GET' && !endpoint.path.includes(':')) {
        const resource = endpoint.path.split('/').pop() || 'data';
        try {
          db[resource] = JSON.parse(endpoint.response);
        } catch {
          db[resource] = endpoint.response;
        }
      }
    });

    return JSON.stringify(db, null, 2);
  };

  const selectedEp = endpoints.find((e) => e.id === selectedEndpoint);
  const methodColors: Record<string, string> = {
    GET: 'text-green-400 bg-green-500/20',
    POST: 'text-blue-400 bg-blue-500/20',
    PUT: 'text-yellow-400 bg-yellow-500/20',
    PATCH: 'text-orange-400 bg-orange-500/20',
    DELETE: 'text-red-400 bg-red-500/20',
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Server className="w-6 h-6 text-cyan-400" />
              Mock API Server
            </h1>
            <p className="text-gray-400 text-sm">Create mock REST API endpoints</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={port}
              onChange={(e) => setPort(parseInt(e.target.value) || 3001)}
              className="w-20 px-2 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-center"
            />
            <button
              onClick={() => setServerRunning(!serverRunning)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
                serverRunning
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-green-500/20 text-green-400 border border-green-500/30'
              }`}
            >
              {serverRunning ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {serverRunning ? 'Stop' : 'Start'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Endpoints List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-300">Endpoints ({endpoints.length})</h3>
              <button
                onClick={addEndpoint}
                className="flex items-center gap-1 px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs"
              >
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>

            <div className="space-y-2">
              {endpoints.map((endpoint) => (
                <div
                  key={endpoint.id}
                  onClick={() => setSelectedEndpoint(endpoint.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedEndpoint === endpoint.id
                      ? 'bg-gray-800 border-cyan-500/50'
                      : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${methodColors[endpoint.method]}`}>
                        {endpoint.method}
                      </span>
                      <span className="text-sm font-mono text-gray-300">{endpoint.path}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeEndpoint(endpoint.id);
                      }}
                      className="p-1 hover:bg-gray-700 rounded text-red-400"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span>Status: {endpoint.status}</span>
                    <span>Delay: {endpoint.delay}ms</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Endpoint Editor */}
          <div className="space-y-4">
            {selectedEp && (
              <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
                <h3 className="text-sm font-medium text-gray-300 mb-4">Edit Endpoint</h3>

                <div className="space-y-4">
                  <div className="flex gap-2">
                    <select
                      value={selectedEp.method}
                      onChange={(e) => updateEndpoint(selectedEp.id, { method: e.target.value as any })}
                      className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm"
                    >
                      <option>GET</option>
                      <option>POST</option>
                      <option>PUT</option>
                      <option>PATCH</option>
                      <option>DELETE</option>
                    </select>
                    <input
                      type="text"
                      value={selectedEp.path}
                      onChange={(e) => updateEndpoint(selectedEp.id, { path: e.target.value })}
                      className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm font-mono"
                      placeholder="/api/endpoint"
                    />
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="text-xs text-gray-500 block mb-1">Status Code</label>
                      <input
                        type="number"
                        value={selectedEp.status}
                        onChange={(e) => updateEndpoint(selectedEp.id, { status: parseInt(e.target.value) || 200 })}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-gray-500 block mb-1">Delay (ms)</label>
                      <input
                        type="number"
                        value={selectedEp.delay}
                        onChange={(e) => updateEndpoint(selectedEp.id, { delay: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Response Body (JSON)</label>
                    <textarea
                      value={selectedEp.response}
                      onChange={(e) => updateEndpoint(selectedEp.id, { response: e.target.value })}
                      className="w-full h-48 p-3 bg-gray-800 border border-gray-700 rounded-lg text-sm font-mono text-cyan-400 resize-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Generated Code */}
          <div className="space-y-4">
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-300">Express.js Server</h3>
                <button
                  onClick={() => copyToClipboard(generateExpressCode(), 'express')}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm"
                >
                  {copied === 'express' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <pre className="p-4 bg-gray-950 rounded-lg text-xs font-mono text-cyan-400 overflow-x-auto max-h-64 overflow-y-auto whitespace-pre">
                {generateExpressCode()}
              </pre>
            </div>

            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-300">db.json (json-server)</h3>
                <button
                  onClick={() => copyToClipboard(generateJsonServer(), 'json')}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm"
                >
                  {copied === 'json' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <pre className="p-4 bg-gray-950 rounded-lg text-xs font-mono text-cyan-400 overflow-x-auto max-h-40 overflow-y-auto whitespace-pre">
                {generateJsonServer()}
              </pre>
            </div>

            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Quick Start</h3>
              <div className="space-y-2 text-xs text-gray-400 font-mono">
                <p>npm install express cors</p>
                <p>node server.js</p>
                <p className="text-gray-500">— or —</p>
                <p>npm install -g json-server</p>
                <p>json-server --watch db.json</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
