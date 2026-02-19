import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Copy, Check, GitBranch, Download, AlertTriangle, Image } from 'lucide-react';
import mermaid from 'mermaid';
import { toPng } from 'html-to-image';

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'ui-sans-serif, system-ui, sans-serif',
});

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
  const [svgOutput, setSvgOutput] = useState('');
  const previewRef = useRef<HTMLDivElement>(null);
  const renderIdRef = useRef(0);

  const renderDiagram = useCallback(async (source: string) => {
    const currentId = ++renderIdRef.current;
    const diagramId = `mermaid-diagram-${currentId}`;

    // Remove any leftover temp elements from previous failed renders
    const existing = document.getElementById(diagramId);
    if (existing) existing.remove();

    try {
      const { svg } = await mermaid.render(diagramId, source);
      // Only apply if this is still the latest render
      if (currentId === renderIdRef.current) {
        setSvgOutput(svg);
        setError('');
      }
    } catch (err: unknown) {
      // Clean up the temp element mermaid may have created
      const el = document.getElementById('d' + diagramId);
      if (el) el.remove();

      if (currentId === renderIdRef.current) {
        setSvgOutput('');
        const message = err instanceof Error ? err.message : 'Invalid Mermaid syntax';
        setError(message);
      }
    }
  }, []);

  // Debounced rendering
  useEffect(() => {
    const timeout = setTimeout(() => {
      renderDiagram(code);
    }, 400);
    return () => clearTimeout(timeout);
  }, [code, renderDiagram]);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadTemplate = (key: keyof typeof templates) => {
    setCode(templates[key]);
    setError('');
  };

  const downloadSVG = () => {
    if (!svgOutput) return;
    const blob = new Blob([svgOutput], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diagram.svg';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPNG = async () => {
    if (!previewRef.current || !svgOutput) return;
    try {
      const dataUrl = await toPng(previewRef.current, { backgroundColor: '#ffffff', pixelRatio: 2 });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'diagram.png';
      a.click();
    } catch {
      // silently fail
    }
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
                    title="Copy code"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={downloadSVG}
                    disabled={!svgOutput}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Download SVG"
                  >
                    <Download className="w-4 h-4" />
                    <span className="text-xs">SVG</span>
                  </button>
                  <button
                    onClick={downloadPNG}
                    disabled={!svgOutput}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Download PNG"
                  >
                    <Image className="w-4 h-4" />
                    <span className="text-xs">PNG</span>
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
              <div className="bg-white rounded-lg min-h-96 flex items-center justify-center overflow-auto">
                {error ? (
                  <div className="p-6 text-center">
                    <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-red-400" />
                    <p className="text-sm font-medium text-red-600 mb-2">Syntax Error</p>
                    <pre className="text-xs text-red-500 bg-red-50 p-3 rounded-lg max-h-48 overflow-auto text-left whitespace-pre-wrap">
                      {error}
                    </pre>
                  </div>
                ) : svgOutput ? (
                  <div
                    ref={previewRef}
                    className="p-4 w-full [&>svg]:max-w-full [&>svg]:h-auto [&>svg]:mx-auto"
                    dangerouslySetInnerHTML={{ __html: svgOutput }}
                  />
                ) : (
                  <div className="text-center text-gray-400 p-6">
                    <GitBranch className="w-10 h-10 mx-auto mb-3" />
                    <p className="text-sm">Rendering...</p>
                  </div>
                )}
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
