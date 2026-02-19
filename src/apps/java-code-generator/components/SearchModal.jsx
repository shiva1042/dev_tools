import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, Code, Bot, Plug, FileJson, Settings, TestTube, Rocket, Radio, Shield, Database, FileSearch, GitGraph } from 'lucide-react';
import { modules } from '../templates';

const moduleIcons = {
  CORE_JAVA: Code,
  CHATBOT: Bot,
  REST_API: Plug,
  JSON_PROCESSING: FileJson,
  CONFIG: Settings,
  TESTING: TestTube,
  SPRING_BOOT: Rocket,
  WEBSOCKET: Radio,
  SECURITY: Shield,
  POSTGRESQL: Database,
  ELASTICSEARCH: FileSearch,
  NEO4J: GitGraph
};

const moduleColors = {
  CORE_JAVA: 'text-orange-500',
  CHATBOT: 'text-purple-500',
  REST_API: 'text-green-500',
  JSON_PROCESSING: 'text-yellow-500',
  CONFIG: 'text-gray-500',
  TESTING: 'text-red-500',
  SPRING_BOOT: 'text-emerald-500',
  WEBSOCKET: 'text-cyan-500',
  SECURITY: 'text-indigo-500',
  POSTGRESQL: 'text-blue-500',
  ELASTICSEARCH: 'text-amber-500',
  NEO4J: 'text-pink-500'
};

export default function SearchModal({ isOpen, onClose, onSelectTemplate, favorites, onToggleFavorite }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Build searchable list of all templates
  const allTemplates = useMemo(() => {
    const templates = [];
    modules.forEach(mod => {
      Object.entries(mod.templates).forEach(([key, template]) => {
        templates.push({
          id: `${mod.module}:${key}`,
          module: mod.module,
          moduleName: mod.displayName,
          type: key,
          name: template.name,
          description: template.description,
          isFavorite: favorites?.includes(`${mod.module}:${key}`)
        });
      });
    });
    return templates;
  }, [favorites]);

  // Filter templates based on search query
  const filteredTemplates = useMemo(() => {
    if (!query.trim()) {
      // Show favorites first when no query
      return [...allTemplates].sort((a, b) => {
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
        return 0;
      });
    }

    const lowerQuery = query.toLowerCase();
    return allTemplates.filter(t =>
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.moduleName.toLowerCase().includes(lowerQuery) ||
      t.type.toLowerCase().includes(lowerQuery)
    );
  }, [query, allTemplates]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredTemplates]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredTemplates.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredTemplates[selectedIndex]) {
          const template = filteredTemplates[selectedIndex];
          onSelectTemplate(template.module, template.type);
          onClose();
        }
        break;
      case 'Escape':
        onClose();
        break;
    }
  };

  // Scroll selected item into view
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const selectedItem = list.children[selectedIndex];
    if (selectedItem) {
      selectedItem.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-content w-full max-w-2xl">
        {/* Search input */}
        <div className="p-4 border-b border-gray-200 dark:border-slate-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search templates by name, module, or keyword..."
              className="w-full pl-10 pr-10 py-3 text-lg rounded-lg border border-gray-300
                         dark:border-slate-600 focus:border-indigo-500 focus:ring-2
                         focus:ring-indigo-500/20 outline-none"
            />
            <button
              onClick={onClose}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100
                         dark:hover:bg-slate-700 rounded"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          <div className="mt-2 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span><kbd className="kbd">↑↓</kbd> Navigate</span>
            <span><kbd className="kbd">Enter</kbd> Select</span>
            <span><kbd className="kbd">Esc</kbd> Close</span>
          </div>
        </div>

        {/* Results list */}
        <div ref={listRef} className="max-h-96 overflow-auto p-2">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No templates found for "{query}"
            </div>
          ) : (
            filteredTemplates.map((template, index) => {
              const Icon = moduleIcons[template.module] || Code;
              const isSelected = index === selectedIndex;

              return (
                <button
                  key={template.id}
                  onClick={() => {
                    onSelectTemplate(template.module, template.type);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left
                             transition-colors ${isSelected
                               ? 'bg-indigo-50 dark:bg-indigo-900/30'
                               : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'}`}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${moduleColors[template.module]}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {template.name}
                      </span>
                      {template.isFavorite && (
                        <span className="text-yellow-500">★</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {template.moduleName} • {template.description}
                    </div>
                  </div>
                  {isSelected && (
                    <span className="text-xs text-indigo-600 dark:text-indigo-400">
                      Press Enter
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 text-sm text-gray-500 dark:text-gray-400">
          {filteredTemplates.length} templates available
        </div>
      </div>
    </>
  );
}
