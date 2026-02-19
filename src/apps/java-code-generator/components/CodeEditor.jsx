import { useState, useEffect, useRef } from 'react';
import { X, Save, RotateCcw, Copy, Check } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function CodeEditor({ template, onSave, onClose, isOpen }) {
  const [code, setCode] = useState('');
  const [originalCode, setOriginalCode] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (template && isOpen) {
      setCode(template.code);
      setOriginalCode(template.code);
      setHasChanges(false);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [template, isOpen]);

  useEffect(() => {
    setHasChanges(code !== originalCode);
  }, [code, originalCode]);

  const handleSave = () => {
    onSave({ ...template, code });
    setOriginalCode(code);
    setHasChanges(false);
  };

  const handleReset = () => {
    setCode(originalCode);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle tab key in textarea
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const value = e.target.value;
      setCode(value.substring(0, start) + '  ' + value.substring(end));
      // Set cursor position after the tab
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 2;
      }, 0);
    } else if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (hasChanges) handleSave();
    }
  };

  if (!isOpen || !template) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-content w-full max-w-5xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Edit: {template.fileName}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {template.packagePath}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                showPreview
                  ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}
            >
              {showPreview ? 'Edit' : 'Preview'}
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 dark:bg-slate-700
                         text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={handleReset}
              disabled={!hasChanges}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 dark:bg-slate-700
                         text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-indigo-600 text-white
                         rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Editor / Preview */}
        <div className="flex-1 overflow-hidden p-4">
          {showPreview ? (
            <div className="h-full overflow-auto rounded-lg">
              <SyntaxHighlighter
                language="java"
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  padding: '1rem',
                  fontSize: '0.8125rem',
                  lineHeight: '1.5',
                  height: '100%',
                  borderRadius: '0.5rem'
                }}
                showLineNumbers
              >
                {code}
              </SyntaxHighlighter>
            </div>
          ) : (
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              className="code-editor h-full"
              spellCheck={false}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-3 border-t border-gray-200 dark:border-slate-700
                        bg-gray-50 dark:bg-slate-800/50 text-sm">
          <div className="text-gray-500 dark:text-gray-400">
            {hasChanges ? (
              <span className="text-amber-600 dark:text-amber-400">● Unsaved changes</span>
            ) : (
              <span>No changes</span>
            )}
          </div>
          <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
            <span>{code.split('\n').length} lines</span>
            <span><kbd className="kbd">Ctrl+S</kbd> Save</span>
            <span><kbd className="kbd">Tab</kbd> Indent</span>
          </div>
        </div>
      </div>
    </>
  );
}
