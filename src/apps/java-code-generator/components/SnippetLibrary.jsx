import { useState } from 'react';
import { X, Plus, Trash2, Copy, Check, Code, FileCode } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function SnippetLibrary({ isOpen, onClose, snippets, onSaveSnippet, onDeleteSnippet }) {
  const [showAdd, setShowAdd] = useState(false);
  const [newSnippet, setNewSnippet] = useState({ name: '', description: '', code: '' });
  const [selectedSnippet, setSelectedSnippet] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSave = () => {
    if (!newSnippet.name || !newSnippet.code) return;

    onSaveSnippet({
      id: Date.now(),
      ...newSnippet,
      createdAt: Date.now()
    });

    setNewSnippet({ name: '', description: '', code: '' });
    setShowAdd(false);
  };

  const handleCopy = async (code) => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-content w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Snippet Library
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-indigo-600 text-white
                       rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Snippet
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Snippet list */}
          <div className="w-64 border-r border-gray-200 dark:border-slate-700 overflow-auto">
            {snippets.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                <FileCode className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No snippets yet</p>
                <p className="text-xs mt-1">Click "Add Snippet" to create one</p>
              </div>
            ) : (
              snippets.map(snippet => (
                <button
                  key={snippet.id}
                  onClick={() => setSelectedSnippet(snippet)}
                  className={`w-full p-3 text-left border-b border-gray-100 dark:border-slate-700
                             hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors ${
                               selectedSnippet?.id === snippet.id
                                 ? 'bg-indigo-50 dark:bg-indigo-900/30'
                                 : ''
                             }`}
                >
                  <div className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                    {snippet.name}
                  </div>
                  {snippet.description && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                      {snippet.description}
                    </div>
                  )}
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {new Date(snippet.createdAt).toLocaleDateString()}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Snippet preview / Add form */}
          <div className="flex-1 overflow-auto">
            {showAdd ? (
              <div className="p-4 space-y-4">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                  Add New Snippet
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={newSnippet.name}
                    onChange={(e) => setNewSnippet(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., JWT Token Generator"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600
                             bg-white dark:bg-slate-800 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={newSnippet.description}
                    onChange={(e) => setNewSnippet(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the snippet"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600
                             bg-white dark:bg-slate-800 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Code *
                  </label>
                  <textarea
                    value={newSnippet.code}
                    onChange={(e) => setNewSnippet(prev => ({ ...prev, code: e.target.value }))}
                    placeholder="Paste your code snippet here..."
                    rows={12}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600
                             bg-white dark:bg-slate-800 text-sm font-mono"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={!newSnippet.name || !newSnippet.code}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700
                             disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    Save Snippet
                  </button>
                  <button
                    onClick={() => {
                      setShowAdd(false);
                      setNewSnippet({ name: '', description: '', code: '' });
                    }}
                    className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300
                             rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : selectedSnippet ? (
              <div className="h-full flex flex-col">
                {/* Snippet header */}
                <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                      {selectedSnippet.name}
                    </h3>
                    {selectedSnippet.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedSnippet.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(selectedSnippet.code)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100
                               dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg
                               hover:bg-gray-200 dark:hover:bg-slate-600"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                    <button
                      onClick={() => {
                        onDeleteSnippet(selectedSnippet.id);
                        setSelectedSnippet(null);
                      }}
                      className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Snippet code */}
                <div className="flex-1 overflow-auto">
                  <SyntaxHighlighter
                    language="java"
                    style={vscDarkPlus}
                    customStyle={{
                      margin: 0,
                      padding: '1rem',
                      fontSize: '0.8125rem',
                      lineHeight: '1.5',
                      height: '100%'
                    }}
                    showLineNumbers
                  >
                    {selectedSnippet.code}
                  </SyntaxHighlighter>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <FileCode className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Select a snippet to view</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
