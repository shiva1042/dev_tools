import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Copy, Check, GitBranch, Search } from 'lucide-react';

interface Template {
  name: string;
  category: string;
  patterns: string[];
}

const templates: Template[] = [
  {
    name: 'Node.js',
    category: 'JavaScript',
    patterns: [
      'node_modules/',
      'npm-debug.log*',
      'yarn-debug.log*',
      'yarn-error.log*',
      '.npm',
      '.yarn-integrity',
      '.env',
      '.env.local',
      '.env.*.local',
      'dist/',
      'build/',
      '.cache/',
    ],
  },
  {
    name: 'React',
    category: 'JavaScript',
    patterns: [
      'node_modules/',
      'build/',
      'dist/',
      '.env.local',
      '.env.development.local',
      '.env.test.local',
      '.env.production.local',
      'npm-debug.log*',
      '.DS_Store',
      'coverage/',
    ],
  },
  {
    name: 'Python',
    category: 'Python',
    patterns: [
      '__pycache__/',
      '*.py[cod]',
      '*$py.class',
      '*.so',
      '.Python',
      'env/',
      'venv/',
      '.venv/',
      'pip-log.txt',
      '.tox/',
      '.coverage',
      '.pytest_cache/',
      '*.egg-info/',
      'dist/',
      'build/',
    ],
  },
  {
    name: 'Java',
    category: 'Java',
    patterns: [
      '*.class',
      '*.jar',
      '*.war',
      '*.ear',
      'target/',
      '.gradle/',
      'build/',
      '.idea/',
      '*.iml',
      '*.ipr',
      '*.iws',
      'out/',
      '.settings/',
      '.project',
      '.classpath',
    ],
  },
  {
    name: 'Maven',
    category: 'Java',
    patterns: [
      'target/',
      'pom.xml.tag',
      'pom.xml.releaseBackup',
      'pom.xml.versionsBackup',
      'pom.xml.next',
      'release.properties',
      'dependency-reduced-pom.xml',
      'buildNumber.properties',
    ],
  },
  {
    name: 'Gradle',
    category: 'Java',
    patterns: [
      '.gradle/',
      'build/',
      'gradle-app.setting',
      '!gradle-wrapper.jar',
      '.gradletasknamecache',
    ],
  },
  {
    name: 'Spring Boot',
    category: 'Java',
    patterns: [
      'target/',
      '!.mvn/wrapper/maven-wrapper.jar',
      '*.log',
      '.idea/',
      '*.iml',
      '.DS_Store',
      'application-local.yml',
      'application-local.properties',
    ],
  },
  {
    name: 'Go',
    category: 'Go',
    patterns: [
      '*.exe',
      '*.exe~',
      '*.dll',
      '*.so',
      '*.dylib',
      '*.test',
      '*.out',
      'vendor/',
      'go.sum',
    ],
  },
  {
    name: 'Rust',
    category: 'Rust',
    patterns: [
      '/target/',
      'Cargo.lock',
      '**/*.rs.bk',
    ],
  },
  {
    name: 'macOS',
    category: 'OS',
    patterns: [
      '.DS_Store',
      '.AppleDouble',
      '.LSOverride',
      '._*',
      '.Spotlight-V100',
      '.Trashes',
    ],
  },
  {
    name: 'Windows',
    category: 'OS',
    patterns: [
      'Thumbs.db',
      'ehthumbs.db',
      'Desktop.ini',
      '$RECYCLE.BIN/',
      '*.lnk',
    ],
  },
  {
    name: 'Linux',
    category: 'OS',
    patterns: [
      '*~',
      '.fuse_hidden*',
      '.directory',
      '.Trash-*',
      '.nfs*',
    ],
  },
  {
    name: 'VS Code',
    category: 'IDE',
    patterns: [
      '.vscode/*',
      '!.vscode/settings.json',
      '!.vscode/tasks.json',
      '!.vscode/launch.json',
      '!.vscode/extensions.json',
      '*.code-workspace',
    ],
  },
  {
    name: 'IntelliJ IDEA',
    category: 'IDE',
    patterns: [
      '.idea/',
      '*.iml',
      '*.ipr',
      '*.iws',
      'out/',
      '.idea_modules/',
    ],
  },
  {
    name: 'Docker',
    category: 'DevOps',
    patterns: [
      'Dockerfile*',
      'docker-compose*.yml',
      '.docker/',
    ],
  },
  {
    name: 'Terraform',
    category: 'DevOps',
    patterns: [
      '.terraform/',
      '*.tfstate',
      '*.tfstate.*',
      'crash.log',
      '*.tfvars',
      'override.tf',
      'override.tf.json',
    ],
  },
  {
    name: 'Environment',
    category: 'Security',
    patterns: [
      '.env',
      '.env.local',
      '.env.*.local',
      '*.pem',
      '*.key',
      'secrets.yml',
      'credentials.json',
    ],
  },
  {
    name: 'Logs',
    category: 'General',
    patterns: [
      '*.log',
      'logs/',
      '*.log.*',
      'npm-debug.log*',
      'yarn-debug.log*',
    ],
  },
];

export default function GitIgnoreGenerator() {
  const [selected, setSelected] = useState<string[]>(['Node.js', 'macOS', 'VS Code', 'Environment']);
  const [customPatterns, setCustomPatterns] = useState('');
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(false);

  const filteredTemplates = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase())
  );

  const categories = [...new Set(templates.map((t) => t.category))];

  const generateGitignore = (): string => {
    const sections: string[] = [];

    selected.forEach((name) => {
      const template = templates.find((t) => t.name === name);
      if (template) {
        sections.push(`# ${template.name}`);
        sections.push(...template.patterns);
        sections.push('');
      }
    });

    if (customPatterns.trim()) {
      sections.push('# Custom patterns');
      sections.push(customPatterns.trim());
    }

    return sections.join('\n');
  };

  const toggleTemplate = (name: string) => {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(generateGitignore());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <GitBranch className="w-6 h-6 text-orange-400" />
              .gitignore Generator
            </h1>
            <p className="text-gray-400 text-sm">Generate .gitignore files for your projects</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Templates */}
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search templates..."
                className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm"
              />
            </div>

            {/* Templates by Category */}
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800 max-h-[500px] overflow-y-auto">
              {categories.map((category) => {
                const categoryTemplates = filteredTemplates.filter((t) => t.category === category);
                if (categoryTemplates.length === 0) return null;

                return (
                  <div key={category} className="mb-4 last:mb-0">
                    <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">{category}</h3>
                    <div className="flex flex-wrap gap-2">
                      {categoryTemplates.map((template) => (
                        <button
                          key={template.name}
                          onClick={() => toggleTemplate(template.name)}
                          className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                            selected.includes(template.name)
                              ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                              : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-750'
                          }`}
                        >
                          {template.name}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Custom Patterns */}
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
              <h3 className="text-sm font-medium text-gray-300 mb-2">Custom Patterns</h3>
              <textarea
                value={customPatterns}
                onChange={(e) => setCustomPatterns(e.target.value)}
                placeholder="Add custom patterns, one per line..."
                className="w-full h-24 p-3 bg-gray-800 border border-gray-700 rounded-lg text-sm font-mono resize-none"
              />
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelected(['Node.js', 'React', 'macOS', 'VS Code', 'Environment'])}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded text-xs"
              >
                React Project
              </button>
              <button
                onClick={() => setSelected(['Java', 'Maven', 'Spring Boot', 'IntelliJ IDEA', 'Environment'])}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded text-xs"
              >
                Spring Boot
              </button>
              <button
                onClick={() => setSelected(['Python', 'VS Code', 'Environment', 'Logs'])}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded text-xs"
              >
                Python
              </button>
              <button
                onClick={() => setSelected(['Go', 'VS Code', 'Environment'])}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded text-xs"
              >
                Go
              </button>
              <button
                onClick={() => setSelected([])}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded text-xs text-red-400"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Output */}
          <div className="space-y-4">
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-300">
                  .gitignore
                  <span className="ml-2 text-xs text-gray-500">
                    ({selected.length} templates selected)
                  </span>
                </h3>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="p-4 bg-gray-950 rounded-lg text-sm font-mono text-orange-400 overflow-x-auto max-h-[500px] overflow-y-auto whitespace-pre">
                {generateGitignore() || '# Select templates to generate .gitignore'}
              </pre>
            </div>

            {/* Selected Templates Info */}
            {selected.length > 0 && (
              <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
                <h3 className="text-sm font-medium text-gray-300 mb-3">Selected Templates</h3>
                <div className="flex flex-wrap gap-2">
                  {selected.map((name) => (
                    <span
                      key={name}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-xs"
                    >
                      {name}
                      <button
                        onClick={() => toggleTemplate(name)}
                        className="hover:text-orange-200"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Tips</h3>
              <ul className="space-y-2 text-xs text-gray-400">
                <li>• Use <code className="text-orange-400">*</code> to match any characters</li>
                <li>• Use <code className="text-orange-400">/</code> at end for directories</li>
                <li>• Use <code className="text-orange-400">!</code> to negate (include) patterns</li>
                <li>• Use <code className="text-orange-400">**</code> to match nested directories</li>
                <li>• Patterns are relative to .gitignore location</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
