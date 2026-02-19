import { useState } from 'react';
import { Copy, Check, FileDown, Upload, Download, Layers } from 'lucide-react';

export default function QuickActions({
  templates,
  onCopyAll,
  onExportSettings,
  onImportSettings,
  className = ''
}) {
  const [copied, setCopied] = useState(false);

  const handleCopyAll = async () => {
    if (!templates || templates.length === 0) return;

    const allCode = templates.map(t =>
      `// ========== ${t.fileName} ==========\n// Package: ${t.packagePath}\n\n${t.code}`
    ).join('\n\n\n');

    await navigator.clipboard.writeText(allCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopyAll?.();
  };

  const handleImportClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const settings = JSON.parse(event.target.result);
            onImportSettings?.(settings);
          } catch (err) {
            console.error('Failed to parse settings file:', err);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {/* Copy All */}
      <button
        onClick={handleCopyAll}
        disabled={!templates || templates.length === 0}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 dark:bg-slate-700
                   text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200
                   dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors"
        title="Copy all generated code"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 text-green-500" />
            <span className="text-green-600 dark:text-green-400">Copied!</span>
          </>
        ) : (
          <>
            <Layers className="w-4 h-4" />
            <span>Copy All</span>
          </>
        )}
      </button>

      {/* Export Settings */}
      <button
        onClick={onExportSettings}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 dark:bg-slate-700
                   text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200
                   dark:hover:bg-slate-600 transition-colors"
        title="Export current configuration"
      >
        <Upload className="w-4 h-4" />
        <span>Export Config</span>
      </button>

      {/* Import Settings */}
      <button
        onClick={handleImportClick}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 dark:bg-slate-700
                   text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200
                   dark:hover:bg-slate-600 transition-colors"
        title="Import configuration from file"
      >
        <Download className="w-4 h-4" />
        <span>Import Config</span>
      </button>
    </div>
  );
}
