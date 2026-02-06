import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Copy, Check, GitBranch, Plus, Trash2 } from 'lucide-react';

interface Step {
  id: string;
  name: string;
  uses?: string;
  run?: string;
  with?: Record<string, string>;
  env?: Record<string, string>;
}

interface Job {
  id: string;
  name: string;
  runsOn: string;
  needs?: string[];
  steps: Step[];
}

interface WorkflowConfig {
  name: string;
  on: {
    push?: { branches: string[] };
    pull_request?: { branches: string[] };
    schedule?: { cron: string }[];
    workflow_dispatch?: boolean;
  };
  env?: Record<string, string>;
  jobs: Job[];
}

const stepTemplates: Omit<Step, 'id'>[] = [
  { name: 'Checkout', uses: 'actions/checkout@v4' },
  { name: 'Setup Node.js', uses: 'actions/setup-node@v4', with: { 'node-version': '20' } },
  { name: 'Setup Java', uses: 'actions/setup-java@v4', with: { 'java-version': '17', distribution: 'temurin' } },
  { name: 'Setup Python', uses: 'actions/setup-python@v5', with: { 'python-version': '3.11' } },
  { name: 'Setup Go', uses: 'actions/setup-go@v5', with: { 'go-version': '1.21' } },
  { name: 'Cache npm', uses: 'actions/cache@v4', with: { path: '~/.npm', key: "${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}" } },
  { name: 'Cache Maven', uses: 'actions/cache@v4', with: { path: '~/.m2/repository', key: "${{ runner.os }}-maven-${{ hashFiles('**/pom.xml') }}" } },
  { name: 'npm install', run: 'npm ci' },
  { name: 'npm build', run: 'npm run build' },
  { name: 'npm test', run: 'npm test' },
  { name: 'Maven build', run: 'mvn -B package --file pom.xml' },
  { name: 'Maven test', run: 'mvn test' },
  { name: 'Docker build', run: 'docker build -t ${{ github.repository }}:${{ github.sha }} .' },
  { name: 'Docker push', run: 'docker push ${{ github.repository }}:${{ github.sha }}' },
  { name: 'Upload artifact', uses: 'actions/upload-artifact@v4', with: { name: 'build', path: 'dist/' } },
  { name: 'Download artifact', uses: 'actions/download-artifact@v4', with: { name: 'build' } },
];

export default function GitHubActionsBuilder() {
  const [config, setConfig] = useState<WorkflowConfig>({
    name: 'CI',
    on: {
      push: { branches: ['main'] },
      pull_request: { branches: ['main'] },
    },
    jobs: [
      {
        id: 'build',
        name: 'Build',
        runsOn: 'ubuntu-latest',
        steps: [
          { id: '1', name: 'Checkout', uses: 'actions/checkout@v4' },
          { id: '2', name: 'Setup Node.js', uses: 'actions/setup-node@v4', with: { 'node-version': '20' } },
          { id: '3', name: 'Install dependencies', run: 'npm ci' },
          { id: '4', name: 'Build', run: 'npm run build' },
          { id: '5', name: 'Test', run: 'npm test' },
        ],
      },
    ],
  });
  const [copied, setCopied] = useState(false);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const generateYAML = (): string => {
    const lines: string[] = [];

    lines.push(`name: ${config.name}`);
    lines.push('');
    lines.push('on:');

    if (config.on.push) {
      lines.push('  push:');
      lines.push(`    branches: [${config.on.push.branches.join(', ')}]`);
    }
    if (config.on.pull_request) {
      lines.push('  pull_request:');
      lines.push(`    branches: [${config.on.pull_request.branches.join(', ')}]`);
    }
    if (config.on.schedule) {
      lines.push('  schedule:');
      config.on.schedule.forEach((s) => {
        lines.push(`    - cron: '${s.cron}'`);
      });
    }
    if (config.on.workflow_dispatch) {
      lines.push('  workflow_dispatch:');
    }

    if (config.env && Object.keys(config.env).length > 0) {
      lines.push('');
      lines.push('env:');
      Object.entries(config.env).forEach(([key, value]) => {
        lines.push(`  ${key}: ${value}`);
      });
    }

    lines.push('');
    lines.push('jobs:');

    config.jobs.forEach((job) => {
      lines.push(`  ${job.id}:`);
      lines.push(`    name: ${job.name}`);
      lines.push(`    runs-on: ${job.runsOn}`);

      if (job.needs && job.needs.length > 0) {
        lines.push(`    needs: [${job.needs.join(', ')}]`);
      }

      lines.push('    steps:');

      job.steps.forEach((step) => {
        lines.push(`      - name: ${step.name}`);
        if (step.uses) {
          lines.push(`        uses: ${step.uses}`);
        }
        if (step.run) {
          if (step.run.includes('\n')) {
            lines.push('        run: |');
            step.run.split('\n').forEach((line) => {
              lines.push(`          ${line}`);
            });
          } else {
            lines.push(`        run: ${step.run}`);
          }
        }
        if (step.with && Object.keys(step.with).length > 0) {
          lines.push('        with:');
          Object.entries(step.with).forEach(([key, value]) => {
            lines.push(`          ${key}: ${value}`);
          });
        }
        if (step.env && Object.keys(step.env).length > 0) {
          lines.push('        env:');
          Object.entries(step.env).forEach(([key, value]) => {
            lines.push(`          ${key}: ${value}`);
          });
        }
      });

      lines.push('');
    });

    return lines.join('\n');
  };

  const addJob = () => {
    setConfig({
      ...config,
      jobs: [
        ...config.jobs,
        {
          id: `job-${generateId()}`,
          name: 'New Job',
          runsOn: 'ubuntu-latest',
          steps: [{ id: generateId(), name: 'Checkout', uses: 'actions/checkout@v4' }],
        },
      ],
    });
  };

  const updateJob = (jobId: string, updates: Partial<Job>) => {
    setConfig({
      ...config,
      jobs: config.jobs.map((j) => (j.id === jobId ? { ...j, ...updates } : j)),
    });
  };

  const removeJob = (jobId: string) => {
    setConfig({ ...config, jobs: config.jobs.filter((j) => j.id !== jobId) });
  };

  const addStep = (jobId: string, template?: Omit<Step, 'id'>) => {
    const newStep: Step = template
      ? { id: generateId(), ...template }
      : { id: generateId(), name: 'New Step', run: 'echo "Hello"' };
    setConfig({
      ...config,
      jobs: config.jobs.map((j) =>
        j.id === jobId
          ? {
              ...j,
              steps: [...j.steps, newStep],
            }
          : j
      ),
    });
  };

  const updateStep = (jobId: string, stepId: string, updates: Partial<Step>) => {
    setConfig({
      ...config,
      jobs: config.jobs.map((j) =>
        j.id === jobId
          ? { ...j, steps: j.steps.map((s) => (s.id === stepId ? { ...s, ...updates } : s)) }
          : j
      ),
    });
  };

  const removeStep = (jobId: string, stepId: string) => {
    setConfig({
      ...config,
      jobs: config.jobs.map((j) =>
        j.id === jobId ? { ...j, steps: j.steps.filter((s) => s.id !== stepId) } : j
      ),
    });
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(generateYAML());
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
              <GitBranch className="w-6 h-6 text-blue-400" />
              GitHub Actions Builder
            </h1>
            <p className="text-gray-400 text-sm">Build CI/CD workflows visually</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Builder */}
          <div className="space-y-4">
            {/* Workflow Settings */}
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Workflow Settings</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Name</label>
                  <input
                    type="text"
                    value={config.name}
                    onChange={(e) => setConfig({ ...config, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <label className="flex items-center gap-2 text-sm text-gray-400">
                    <input
                      type="checkbox"
                      checked={!!config.on.push}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          on: e.target.checked
                            ? { ...config.on, push: { branches: ['main'] } }
                            : { ...config.on, push: undefined },
                        })
                      }
                      className="accent-blue-500"
                    />
                    Push
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-400">
                    <input
                      type="checkbox"
                      checked={!!config.on.pull_request}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          on: e.target.checked
                            ? { ...config.on, pull_request: { branches: ['main'] } }
                            : { ...config.on, pull_request: undefined },
                        })
                      }
                      className="accent-blue-500"
                    />
                    Pull Request
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-400">
                    <input
                      type="checkbox"
                      checked={!!config.on.workflow_dispatch}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          on: { ...config.on, workflow_dispatch: e.target.checked || undefined },
                        })
                      }
                      className="accent-blue-500"
                    />
                    Manual Trigger
                  </label>
                </div>
              </div>
            </div>

            {/* Jobs */}
            {config.jobs.map((job) => (
              <div key={job.id} className="p-4 bg-gray-900 rounded-lg border border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <input
                    type="text"
                    value={job.name}
                    onChange={(e) => updateJob(job.id, { name: e.target.value })}
                    className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm font-medium"
                  />
                  <div className="flex items-center gap-2">
                    <select
                      value={job.runsOn}
                      onChange={(e) => updateJob(job.id, { runsOn: e.target.value })}
                      className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs"
                    >
                      <option>ubuntu-latest</option>
                      <option>ubuntu-22.04</option>
                      <option>ubuntu-20.04</option>
                      <option>windows-latest</option>
                      <option>macos-latest</option>
                    </select>
                    {config.jobs.length > 1 && (
                      <button
                        onClick={() => removeJob(job.id)}
                        className="p-1 hover:bg-gray-800 rounded text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Steps */}
                <div className="space-y-2 mb-3">
                  {job.steps.map((step, i) => (
                    <div key={step.id} className="flex items-start gap-2 p-2 bg-gray-800 rounded">
                      <span className="text-xs text-gray-500 mt-1">{i + 1}</span>
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={step.name}
                          onChange={(e) => updateStep(job.id, step.id, { name: e.target.value })}
                          className="w-full px-2 py-1 bg-gray-900 border border-gray-700 rounded text-xs"
                          placeholder="Step name"
                        />
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={step.uses || ''}
                            onChange={(e) =>
                              updateStep(job.id, step.id, {
                                uses: e.target.value || undefined,
                                run: e.target.value ? undefined : step.run,
                              })
                            }
                            className="flex-1 px-2 py-1 bg-gray-900 border border-gray-700 rounded text-xs font-mono"
                            placeholder="uses: action/name@v1"
                          />
                          <span className="text-gray-600 text-xs mt-1">or</span>
                          <input
                            type="text"
                            value={step.run || ''}
                            onChange={(e) =>
                              updateStep(job.id, step.id, {
                                run: e.target.value || undefined,
                                uses: e.target.value ? undefined : step.uses,
                              })
                            }
                            className="flex-1 px-2 py-1 bg-gray-900 border border-gray-700 rounded text-xs font-mono"
                            placeholder="run: command"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => removeStep(job.id, step.id)}
                        className="p-1 hover:bg-gray-700 rounded text-red-400"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Step */}
                <div className="flex flex-wrap gap-1">
                  <button
                    onClick={() => addStep(job.id)}
                    className="flex items-center gap-1 px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs"
                  >
                    <Plus className="w-3 h-3" /> Custom
                  </button>
                  {stepTemplates.slice(0, 6).map((template) => (
                    <button
                      key={template.name}
                      onClick={() => addStep(job.id, template)}
                      className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs"
                    >
                      {template.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <button
              onClick={addJob}
              className="w-full py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Job
            </button>
          </div>

          {/* Output */}
          <div className="space-y-4">
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800 sticky top-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-300">.github/workflows/ci.yml</h3>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="p-4 bg-gray-950 rounded-lg text-xs font-mono text-blue-400 overflow-x-auto max-h-[600px] overflow-y-auto whitespace-pre">
                {generateYAML()}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
