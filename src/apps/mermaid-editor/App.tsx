import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Copy, Check, GitBranch, Download } from 'lucide-react';

const templates = {
  flowchart: `flowchart TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> B
    C --> E[End]`,
  sequence: `sequenceDiagram
    participant Client
    participant Server
    participant Database

    Client->>Server: HTTP Request
    Server->>Database: Query
    Database-->>Server: Results
    Server-->>Client: HTTP Response`,
  classDiagram: `classDiagram
    class User {
        +Long id
        +String name
        +String email
        +getFullName()
    }
    class Order {
        +Long id
        +Date createdAt
        +calculate()
    }
    User "1" --> "*" Order : places`,
  erDiagram: `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    PRODUCT ||--o{ LINE-ITEM : "is in"
    CUSTOMER {
        string name
        string email
    }
    ORDER {
        int orderNumber
        date createdAt
    }`,
  stateDiagram: `stateDiagram-v2
    [*] --> Idle
    Idle --> Processing : submit
    Processing --> Success : complete
    Processing --> Error : fail
    Error --> Idle : retry
    Success --> [*]`,
  gantt: `gantt
    title Project Timeline
    dateFormat YYYY-MM-DD
    section Planning
    Requirements    :a1, 2024-01-01, 7d
    Design          :a2, after a1, 5d
    section Development
    Backend         :b1, after a2, 14d
    Frontend        :b2, after a2, 14d
    section Testing
    QA Testing      :c1, after b1, 7d`,
  pie: `pie showData
    title Browser Market Share
    "Chrome" : 65
    "Safari" : 19
    "Firefox" : 10
    "Edge" : 5
    "Other" : 1`,
  gitGraph: `gitGraph
    commit id: "Initial"
    branch develop
    checkout develop
    commit id: "Feature A"
    commit id: "Feature B"
    checkout main
    merge develop
    commit id: "Release"`,
};

export default function MermaidEditor() {
  const [code, setCode] = useState(templates.flowchart);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadTemplate = (key: keyof typeof templates) => {
    setCode(templates[key]);
    setError('');
  };

  const downloadSVG = async () => {
    // In a real implementation, you'd render the Mermaid diagram and export as SVG
    const blob = new Blob([`<!-- Mermaid Diagram -->\n${code}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diagram.mmd';
    a.click();
    URL.revokeObjectURL(url);
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
              <GitBranch className="w-6 h-6 text-pink-400" />
              Mermaid Diagram Editor
            </h1>
            <p className="text-gray-400 text-sm">Create diagrams with Mermaid syntax</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor */}
          <div className="space-y-4">
            {/* Templates */}
            <div className="flex flex-wrap gap-2">
              {Object.keys(templates).map((key) => (
                <button
                  key={key}
                  onClick={() => loadTemplate(key as keyof typeof templates)}
                  className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs capitalize"
                >
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </button>
              ))}
            </div>

            {/* Code Editor */}
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-300">Mermaid Code</h3>
                <div className="flex gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={downloadSVG}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-96 p-4 bg-gray-950 border border-gray-800 rounded-lg text-pink-400 font-mono text-sm resize-none focus:outline-none focus:border-pink-500/50"
                spellCheck={false}
              />
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Preview</h3>
              <div className="p-4 bg-white rounded-lg min-h-96 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <GitBranch className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-sm">Mermaid preview would render here</p>
                  <p className="text-xs mt-2">
                    In production, integrate with mermaid.js library
                  </p>
                  <pre className="mt-4 p-4 bg-gray-100 rounded text-left text-xs text-gray-700 overflow-auto max-h-64">
                    {code}
                  </pre>
                </div>
              </div>
            </div>

            {/* Syntax Help */}
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Syntax Reference</h3>
              <div className="space-y-3 text-xs text-gray-400">
                <div>
                  <span className="text-pink-400 font-medium">Flowchart:</span>
                  <code className="ml-2 text-gray-500">A[Box] --&gt; B{'{Decision}'}</code>
                </div>
                <div>
                  <span className="text-pink-400 font-medium">Sequence:</span>
                  <code className="ml-2 text-gray-500">A-&gt;&gt;B: Message</code>
                </div>
                <div>
                  <span className="text-pink-400 font-medium">Class:</span>
                  <code className="ml-2 text-gray-500">class Name {'{ +method() }'}</code>
                </div>
                <div>
                  <span className="text-pink-400 font-medium">ER:</span>
                  <code className="ml-2 text-gray-500">ENTITY ||--o{'{'} OTHER</code>
                </div>
                <div>
                  <span className="text-pink-400 font-medium">State:</span>
                  <code className="ml-2 text-gray-500">[*] --&gt; State1</code>
                </div>
              </div>
            </div>

            {/* Links */}
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Resources</h3>
              <div className="space-y-2 text-xs">
                <a
                  href="https://mermaid.js.org/syntax/flowchart.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-pink-400 hover:underline"
                >
                  Flowchart Syntax →
                </a>
                <a
                  href="https://mermaid.js.org/syntax/sequenceDiagram.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-pink-400 hover:underline"
                >
                  Sequence Diagram Syntax →
                </a>
                <a
                  href="https://mermaid.live/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-pink-400 hover:underline"
                >
                  Mermaid Live Editor →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
