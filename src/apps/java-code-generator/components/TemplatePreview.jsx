import { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, FileCode, Info, AlertTriangle, Lightbulb, Edit3, Star } from 'lucide-react';

export default function TemplatePreview({
  templates,
  onSelectTemplate,
  onEditTemplate,
  favorites = [],
  onToggleFavorite,
  selectedModule
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('code');

  // Reset selected index when templates change
  useEffect(() => {
    setSelectedIndex(0);
    setActiveTab('code');
  }, [templates]);

  if (!templates || templates.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-200 dark:border-slate-700">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <FileCode className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Generate templates to preview code</p>
          <p className="text-sm mt-1">Select templates and click Generate</p>
        </div>
      </div>
    );
  }

  const safeIndex = selectedIndex < templates.length ? selectedIndex : 0;
  const currentTemplate = templates[safeIndex];
  const templateId = selectedModule ? `${selectedModule}:${currentTemplate.type || currentTemplate.name}` : null;
  const isFavorite = templateId && favorites.includes(templateId);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(currentTemplate.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSelect = (index) => {
    setSelectedIndex(index);
    setActiveTab('code');
    if (onSelectTemplate) {
      onSelectTemplate(templates[index]);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full">
      {/* File list */}
      <div className="lg:w-64 flex-shrink-0">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="px-3 py-2 bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-700">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Generated Files</h3>
          </div>
          <div className="max-h-96 overflow-auto">
            {templates.map((template, index) => (
              <button
                key={index}
                onClick={() => handleSelect(index)}
                className={`w-full text-left px-3 py-2 text-sm border-b border-gray-100 dark:border-slate-700
                           transition-colors duration-150
                           ${safeIndex === index
                             ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                             : 'hover:bg-gray-50 dark:hover:bg-slate-700/50 text-gray-700 dark:text-gray-300'}`}
              >
                <div className="font-medium truncate">{template.fileName}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {template.useCase || template.packagePath}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Code preview */}
      <div className="flex-1 min-w-0">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden h-full flex flex-col">
          {/* Header */}
          <div className="px-4 py-2 bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">{currentTemplate.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{currentTemplate.packagePath}</p>
            </div>
            <div className="flex items-center gap-2">
              {onToggleFavorite && templateId && (
                <button
                  onClick={() => onToggleFavorite(templateId)}
                  className={`star-favorite p-1.5 rounded ${isFavorite ? 'active' : 'text-gray-400 hover:text-yellow-400'}`}
                  title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Star className="w-4 h-4" fill={isFavorite ? 'currentColor' : 'none'} />
                </button>
              )}
              {onEditTemplate && (
                <button
                  onClick={() => onEditTemplate(currentTemplate)}
                  className="flex items-center gap-1 px-3 py-1 text-sm rounded-md
                           bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600
                           text-gray-700 dark:text-gray-300 transition-colors"
                  title="Edit this template"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              )}
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-3 py-1 text-sm rounded-md
                         bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600
                         text-gray-700 dark:text-gray-300 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-green-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-slate-700">
            {['code', 'explanation', 'tips'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium transition-colors
                           ${activeTab === tab
                             ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                             : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto">
            {activeTab === 'code' && (
              <SyntaxHighlighter
                language="java"
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  padding: '1rem',
                  fontSize: '0.8125rem',
                  lineHeight: '1.5',
                  minHeight: '100%'
                }}
                showLineNumbers
              >
                {currentTemplate.code}
              </SyntaxHighlighter>
            )}

            {activeTab === 'explanation' && (
              <div className="p-4 space-y-4">
                <div>
                  <h4 className="flex items-center gap-2 font-medium text-gray-900 dark:text-gray-100 mb-2">
                    <Info className="w-4 h-4 text-blue-500" />
                    Use Case
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{currentTemplate.useCase}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Explanation</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{currentTemplate.explanation}</p>
                </div>

                {currentTemplate.bestPractices?.length > 0 && (
                  <div>
                    <h4 className="flex items-center gap-2 font-medium text-gray-900 dark:text-gray-100 mb-2">
                      <Check className="w-4 h-4 text-green-500" />
                      Best Practices
                    </h4>
                    <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      {currentTemplate.bestPractices.map((practice, i) => (
                        <li key={i}>{practice}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {currentTemplate.commonMistakes?.length > 0 && (
                  <div>
                    <h4 className="flex items-center gap-2 font-medium text-gray-900 dark:text-gray-100 mb-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      Common Mistakes
                    </h4>
                    <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      {currentTemplate.commonMistakes.map((mistake, i) => (
                        <li key={i}>{mistake}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'tips' && (
              <div className="p-4">
                {currentTemplate.java21Tips?.length > 0 ? (
                  <div>
                    <h4 className="flex items-center gap-2 font-medium text-gray-900 dark:text-gray-100 mb-3">
                      <Lightbulb className="w-4 h-4 text-yellow-500" />
                      Java 21 & Spring Boot 3.5.4 Tips
                    </h4>
                    <ul className="space-y-2">
                      {currentTemplate.java21Tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <span className="text-indigo-500 mt-0.5">*</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No specific tips for this template.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
