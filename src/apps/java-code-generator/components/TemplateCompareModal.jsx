import { useState, useMemo } from 'react';
import { X, ArrowLeftRight, ChevronDown } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { modules } from '../templates';

export default function TemplateCompareModal({ isOpen, onClose }) {
  const [leftSelection, setLeftSelection] = useState({ module: '', type: '' });
  const [rightSelection, setRightSelection] = useState({ module: '', type: '' });
  const [className] = useState('Example');
  const [packageName] = useState('com.example');

  // Get all available templates
  const allTemplates = useMemo(() => {
    const templates = [];
    modules.forEach(mod => {
      Object.entries(mod.templates).forEach(([key, template]) => {
        templates.push({
          module: mod.module,
          moduleName: mod.displayName,
          type: key,
          name: template.name,
          generate: template.generate
        });
      });
    });
    return templates;
  }, []);

  // Generate code for selections
  const leftCode = useMemo(() => {
    if (!leftSelection.module || !leftSelection.type) return null;
    const template = allTemplates.find(
      t => t.module === leftSelection.module && t.type === leftSelection.type
    );
    if (!template) return null;
    return template.generate(className, packageName);
  }, [leftSelection, allTemplates, className, packageName]);

  const rightCode = useMemo(() => {
    if (!rightSelection.module || !rightSelection.type) return null;
    const template = allTemplates.find(
      t => t.module === rightSelection.module && t.type === rightSelection.type
    );
    if (!template) return null;
    return template.generate(className, packageName);
  }, [rightSelection, allTemplates, className, packageName]);

  const handleSwap = () => {
    const temp = leftSelection;
    setLeftSelection(rightSelection);
    setRightSelection(temp);
  };

  if (!isOpen) return null;

  const TemplateSelector = ({ value, onChange, label }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <select
        value={`${value.module}:${value.type}`}
        onChange={(e) => {
          const [module, type] = e.target.value.split(':');
          onChange({ module, type });
        }}
        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600
                   bg-white dark:bg-slate-800 text-sm"
      >
        <option value=":">Select a template...</option>
        {modules.map(mod => (
          <optgroup key={mod.module} label={mod.displayName}>
            {Object.entries(mod.templates).map(([key, template]) => (
              <option key={`${mod.module}:${key}`} value={`${mod.module}:${key}`}>
                {template.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-content w-full max-w-7xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Compare Templates
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Selectors */}
        <div className="p-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <TemplateSelector
                value={leftSelection}
                onChange={setLeftSelection}
                label="Left Template"
              />
            </div>
            <button
              onClick={handleSwap}
              className="p-2 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200
                       dark:hover:bg-slate-600 transition-colors mb-0.5"
              title="Swap templates"
            >
              <ArrowLeftRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
            <div className="flex-1">
              <TemplateSelector
                value={rightSelection}
                onChange={setRightSelection}
                label="Right Template"
              />
            </div>
          </div>
        </div>

        {/* Comparison View */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left panel */}
          <div className="flex-1 flex flex-col border-r border-gray-200 dark:border-slate-700 overflow-hidden">
            {leftCode ? (
              <>
                <div className="p-2 bg-gray-100 dark:bg-slate-700 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {leftCode.fileName}
                </div>
                <div className="flex-1 overflow-auto">
                  <SyntaxHighlighter
                    language="java"
                    style={vscDarkPlus}
                    customStyle={{
                      margin: 0,
                      padding: '1rem',
                      fontSize: '0.75rem',
                      lineHeight: '1.4',
                      height: '100%'
                    }}
                    showLineNumbers
                  >
                    {leftCode.code}
                  </SyntaxHighlighter>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                Select a template to compare
              </div>
            )}
          </div>

          {/* Right panel */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {rightCode ? (
              <>
                <div className="p-2 bg-gray-100 dark:bg-slate-700 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {rightCode.fileName}
                </div>
                <div className="flex-1 overflow-auto">
                  <SyntaxHighlighter
                    language="java"
                    style={vscDarkPlus}
                    customStyle={{
                      margin: 0,
                      padding: '1rem',
                      fontSize: '0.75rem',
                      lineHeight: '1.4',
                      height: '100%'
                    }}
                    showLineNumbers
                  >
                    {rightCode.code}
                  </SyntaxHighlighter>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                Select a template to compare
              </div>
            )}
          </div>
        </div>

        {/* Stats comparison */}
        {leftCode && rightCode && (
          <div className="p-3 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
            <div className="flex justify-around text-sm">
              <div className="text-center">
                <div className="text-gray-500 dark:text-gray-400">Lines</div>
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {leftCode.code.split('\n').length} vs {rightCode.code.split('\n').length}
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-500 dark:text-gray-400">Size</div>
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {(leftCode.code.length / 1024).toFixed(1)}KB vs {(rightCode.code.length / 1024).toFixed(1)}KB
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
