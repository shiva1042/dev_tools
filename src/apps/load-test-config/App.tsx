import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Zap, Plus, Trash2 } from 'lucide-react';

interface Endpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  body?: string;
  headers: Record<string, string>;
  weight: number;
}

interface LoadConfig {
  vus: number;
  duration: string;
  rampUp: string;
  thresholds: {
    http_req_duration: string;
    http_req_failed: string;
  };
}

type OutputFormat = 'k6' | 'jmeter' | 'artillery' | 'locust';

export default function LoadTestConfig() {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([
    {
      id: '1',
      method: 'GET',
      url: 'https://api.example.com/users',
      headers: { 'Content-Type': 'application/json' },
      weight: 70,
    },
    {
      id: '2',
      method: 'POST',
      url: 'https://api.example.com/users',
      body: JSON.stringify({ name: 'Test User', email: 'test@example.com' }),
      headers: { 'Content-Type': 'application/json' },
      weight: 30,
    },
  ]);
  const [config, setConfig] = useState<LoadConfig>({
    vus: 10,
    duration: '30s',
    rampUp: '10s',
    thresholds: {
      http_req_duration: 'p(95)<500',
      http_req_failed: 'rate<0.01',
    },
  });
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('k6');
  const [copied, setCopied] = useState(false);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const generateK6 = (): string => {
    const lines: string[] = [];
    lines.push("import http from 'k6/http';");
    lines.push("import { check, sleep } from 'k6';");
    lines.push("import { Rate } from 'k6/metrics';");
    lines.push('');
    lines.push('export const errorRate = new Rate("errors");');
    lines.push('');
    lines.push('export const options = {');
    lines.push('  stages: [');
    lines.push(`    { duration: '${config.rampUp}', target: ${config.vus} },`);
    lines.push(`    { duration: '${config.duration}', target: ${config.vus} },`);
    lines.push(`    { duration: '${config.rampUp}', target: 0 },`);
    lines.push('  ],');
    lines.push('  thresholds: {');
    lines.push(`    http_req_duration: ['${config.thresholds.http_req_duration}'],`);
    lines.push(`    http_req_failed: ['${config.thresholds.http_req_failed}'],`);
    lines.push('  },');
    lines.push('};');
    lines.push('');
    lines.push('const BASE_URL = "https://api.example.com";');
    lines.push('');
    lines.push('export default function () {');
    lines.push('  const params = {');
    lines.push('    headers: {');
    lines.push("      'Content-Type': 'application/json',");
    lines.push('    },');
    lines.push('  };');
    lines.push('');

    endpoints.forEach((endpoint, i) => {
      if (endpoint.method === 'GET') {
        lines.push(`  // ${endpoint.method} ${endpoint.url}`);
        lines.push(`  const res${i} = http.get('${endpoint.url}', params);`);
      } else {
        lines.push(`  // ${endpoint.method} ${endpoint.url}`);
        lines.push(`  const res${i} = http.${endpoint.method.toLowerCase()}('${endpoint.url}', ${endpoint.body || "''"}, params);`);
      }
      lines.push(`  check(res${i}, {`);
      lines.push(`    'status is 200': (r) => r.status === 200,`);
      lines.push('  });');
      lines.push('');
    });

    lines.push('  sleep(1);');
    lines.push('}');

    return lines.join('\n');
  };

  const generateJMeter = (): string => {
    const lines: string[] = [];
    lines.push('<?xml version="1.0" encoding="UTF-8"?>');
    lines.push('<jmeterTestPlan version="1.2">');
    lines.push('  <hashTree>');
    lines.push('    <TestPlan guiclass="TestPlanGui" testclass="TestPlan" testname="Load Test">');
    lines.push('      <elementProp name="TestPlan.user_defined_variables" elementType="Arguments"/>');
    lines.push('    </TestPlan>');
    lines.push('    <hashTree>');
    lines.push('      <ThreadGroup guiclass="ThreadGroupGui" testclass="ThreadGroup" testname="Users">');
    lines.push(`        <stringProp name="ThreadGroup.num_threads">${config.vus}</stringProp>`);
    lines.push(`        <stringProp name="ThreadGroup.ramp_time">${parseInt(config.rampUp)}</stringProp>`);
    lines.push(`        <stringProp name="ThreadGroup.duration">${parseInt(config.duration)}</stringProp>`);
    lines.push('      </ThreadGroup>');
    lines.push('      <hashTree>');

    endpoints.forEach((endpoint) => {
      const urlParts = new URL(endpoint.url);
      lines.push('        <HTTPSamplerProxy guiclass="HttpTestSampleGui" testclass="HTTPSamplerProxy">');
      lines.push(`          <stringProp name="HTTPSampler.domain">${urlParts.hostname}</stringProp>`);
      lines.push(`          <stringProp name="HTTPSampler.port">${urlParts.port || (urlParts.protocol === 'https:' ? 443 : 80)}</stringProp>`);
      lines.push(`          <stringProp name="HTTPSampler.path">${urlParts.pathname}</stringProp>`);
      lines.push(`          <stringProp name="HTTPSampler.method">${endpoint.method}</stringProp>`);
      lines.push(`          <stringProp name="HTTPSampler.protocol">${urlParts.protocol.replace(':', '')}</stringProp>`);
      lines.push('        </HTTPSamplerProxy>');
      lines.push('        <hashTree/>');
    });

    lines.push('      </hashTree>');
    lines.push('    </hashTree>');
    lines.push('  </hashTree>');
    lines.push('</jmeterTestPlan>');

    return lines.join('\n');
  };

  const generateArtillery = (): string => {
    const config_yaml = {
      config: {
        target: endpoints[0]?.url.split('/').slice(0, 3).join('/') || 'https://api.example.com',
        phases: [
          { duration: parseInt(config.rampUp), arrivalRate: 1, rampTo: config.vus },
          { duration: parseInt(config.duration), arrivalRate: config.vus },
        ],
      },
      scenarios: [
        {
          flow: endpoints.map((ep) => ({
            [ep.method.toLowerCase()]: {
              url: new URL(ep.url).pathname,
              ...(ep.body && { json: JSON.parse(ep.body) }),
            },
          })),
        },
      ],
    };

    return `config:
  target: "${config_yaml.config.target}"
  phases:
    - duration: ${parseInt(config.rampUp)}
      arrivalRate: 1
      rampTo: ${config.vus}
    - duration: ${parseInt(config.duration)}
      arrivalRate: ${config.vus}

scenarios:
  - flow:
${endpoints.map((ep) => `      - ${ep.method.toLowerCase()}:
          url: "${new URL(ep.url).pathname}"${ep.body ? `
          json:
            ${ep.body}` : ''}`).join('\n')}`;
  };

  const generateLocust = (): string => {
    const lines: string[] = [];
    lines.push('from locust import HttpUser, task, between');
    lines.push('');
    lines.push('class LoadTestUser(HttpUser):');
    lines.push('    wait_time = between(1, 3)');
    lines.push('');

    endpoints.forEach((endpoint, i) => {
      lines.push(`    @task(${endpoint.weight})`);
      lines.push(`    def endpoint_${i}(self):`);
      if (endpoint.method === 'GET') {
        lines.push(`        self.client.get("${new URL(endpoint.url).pathname}")`);
      } else {
        lines.push(`        self.client.${endpoint.method.toLowerCase()}(`);
        lines.push(`            "${new URL(endpoint.url).pathname}",`);
        if (endpoint.body) {
          lines.push(`            json=${endpoint.body},`);
        }
        lines.push('        )');
      }
      lines.push('');
    });

    lines.push('# Run with: locust -f locustfile.py --host=https://api.example.com');

    return lines.join('\n');
  };

  const getOutput = (): string => {
    switch (outputFormat) {
      case 'k6':
        return generateK6();
      case 'jmeter':
        return generateJMeter();
      case 'artillery':
        return generateArtillery();
      case 'locust':
        return generateLocust();
    }
  };

  const addEndpoint = () => {
    setEndpoints([
      ...endpoints,
      { id: generateId(), method: 'GET', url: 'https://api.example.com/endpoint', headers: {}, weight: 50 },
    ]);
  };

  const updateEndpoint = (id: string, updates: Partial<Endpoint>) => {
    setEndpoints(endpoints.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  };

  const removeEndpoint = (id: string) => {
    setEndpoints(endpoints.filter((e) => e.id !== id));
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(getOutput());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Zap className="w-6 h-6 text-orange-400" />
              Load Test Config Generator
            </h1>
            <p className="text-gray-400 text-sm">Generate k6, JMeter, Artillery, or Locust configs</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuration */}
          <div className="space-y-4">
            {/* Load Parameters */}
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Load Parameters</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Virtual Users</label>
                  <input
                    type="number"
                    value={config.vus}
                    onChange={(e) => setConfig({ ...config, vus: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Duration</label>
                  <input
                    type="text"
                    value={config.duration}
                    onChange={(e) => setConfig({ ...config, duration: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm"
                    placeholder="30s, 5m, 1h"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Ramp Up</label>
                  <input
                    type="text"
                    value={config.rampUp}
                    onChange={(e) => setConfig({ ...config, rampUp: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">P95 Threshold</label>
                  <input
                    type="text"
                    value={config.thresholds.http_req_duration}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        thresholds: { ...config.thresholds, http_req_duration: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Endpoints */}
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-300">Endpoints ({endpoints.length})</h3>
                <button
                  onClick={addEndpoint}
                  className="flex items-center gap-1 px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs"
                >
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>

              <div className="space-y-3">
                {endpoints.map((endpoint) => (
                  <div key={endpoint.id} className="p-3 bg-gray-800 rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      <select
                        value={endpoint.method}
                        onChange={(e) => updateEndpoint(endpoint.id, { method: e.target.value as any })}
                        className="px-2 py-1.5 bg-gray-900 border border-gray-700 rounded text-sm"
                      >
                        <option>GET</option>
                        <option>POST</option>
                        <option>PUT</option>
                        <option>DELETE</option>
                      </select>
                      <input
                        type="text"
                        value={endpoint.url}
                        onChange={(e) => updateEndpoint(endpoint.id, { url: e.target.value })}
                        className="flex-1 px-2 py-1.5 bg-gray-900 border border-gray-700 rounded text-sm font-mono"
                        placeholder="https://api.example.com/endpoint"
                      />
                      <input
                        type="number"
                        value={endpoint.weight}
                        onChange={(e) => updateEndpoint(endpoint.id, { weight: parseInt(e.target.value) || 1 })}
                        className="w-16 px-2 py-1.5 bg-gray-900 border border-gray-700 rounded text-sm text-center"
                        title="Weight"
                      />
                      <button
                        onClick={() => removeEndpoint(endpoint.id)}
                        className="p-1.5 hover:bg-gray-700 rounded text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {(endpoint.method === 'POST' || endpoint.method === 'PUT') && (
                      <textarea
                        value={endpoint.body || ''}
                        onChange={(e) => updateEndpoint(endpoint.id, { body: e.target.value })}
                        className="w-full h-16 px-2 py-1.5 bg-gray-900 border border-gray-700 rounded text-xs font-mono resize-none"
                        placeholder='{"key": "value"}'
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Output */}
          <div className="space-y-4">
            {/* Format Selection */}
            <div className="flex gap-2">
              {(['k6', 'jmeter', 'artillery', 'locust'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setOutputFormat(fmt)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    outputFormat === fmt
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                      : 'bg-gray-800 text-gray-400 border border-gray-700'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>

            {/* Generated Config */}
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-300">
                  {outputFormat === 'k6' && 'script.js'}
                  {outputFormat === 'jmeter' && 'test-plan.jmx'}
                  {outputFormat === 'artillery' && 'artillery.yml'}
                  {outputFormat === 'locust' && 'locustfile.py'}
                </h3>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm"
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <pre className="p-4 bg-gray-950 rounded-lg text-xs font-mono text-orange-400 overflow-x-auto max-h-[500px] overflow-y-auto whitespace-pre">
                {getOutput()}
              </pre>
            </div>

            {/* Run Instructions */}
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
              <h3 className="text-sm font-medium text-gray-300 mb-3">How to Run</h3>
              <div className="text-xs text-gray-400 font-mono space-y-1">
                {outputFormat === 'k6' && (
                  <>
                    <p>k6 run script.js</p>
                    <p className="text-gray-500"># or with cloud</p>
                    <p>k6 cloud script.js</p>
                  </>
                )}
                {outputFormat === 'jmeter' && (
                  <>
                    <p>jmeter -n -t test-plan.jmx -l results.jtl</p>
                    <p className="text-gray-500"># GUI mode</p>
                    <p>jmeter -t test-plan.jmx</p>
                  </>
                )}
                {outputFormat === 'artillery' && (
                  <>
                    <p>npm install -g artillery</p>
                    <p>artillery run artillery.yml</p>
                  </>
                )}
                {outputFormat === 'locust' && (
                  <>
                    <p>pip install locust</p>
                    <p>locust -f locustfile.py --host=https://api.example.com</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
