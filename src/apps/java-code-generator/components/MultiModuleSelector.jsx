import { useState } from 'react';
import { Check, ChevronDown, ChevronRight, Code, Bot, Plug, FileJson, Settings, TestTube, Rocket, Radio, Shield, Database, FileSearch, GitGraph } from 'lucide-react';
import { modules, getTemplateTypes } from '../templates';

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
  CORE_JAVA: 'bg-orange-500',
  CHATBOT: 'bg-purple-500',
  REST_API: 'bg-green-500',
  JSON_PROCESSING: 'bg-yellow-500',
  CONFIG: 'bg-gray-500',
  TESTING: 'bg-red-500',
  SPRING_BOOT: 'bg-emerald-500',
  WEBSOCKET: 'bg-cyan-500',
  SECURITY: 'bg-indigo-500',
  POSTGRESQL: 'bg-blue-500',
  ELASTICSEARCH: 'bg-amber-500',
  NEO4J: 'bg-pink-500'
};

export default function MultiModuleSelector({
  selectedTemplates, // Object: { MODULE: [types] }
  onSelectionChange,
  className = ''
}) {
  const [expandedModules, setExpandedModules] = useState(new Set());

  const toggleModule = (moduleName) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(moduleName)) {
        next.delete(moduleName);
      } else {
        next.add(moduleName);
      }
      return next;
    });
  };

  const toggleTemplate = (moduleName, type) => {
    const current = selectedTemplates[moduleName] || [];
    const newSelection = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type];

    onSelectionChange({
      ...selectedTemplates,
      [moduleName]: newSelection
    });
  };

  const toggleAllInModule = (moduleName) => {
    const types = getTemplateTypes(moduleName).map(t => t.type);
    const current = selectedTemplates[moduleName] || [];
    const allSelected = types.every(t => current.includes(t));

    onSelectionChange({
      ...selectedTemplates,
      [moduleName]: allSelected ? [] : types
    });
  };

  const getTotalSelectedCount = () => {
    return Object.values(selectedTemplates).reduce((sum, types) => sum + types.length, 0);
  };

  const getModuleSelectedCount = (moduleName) => {
    return (selectedTemplates[moduleName] || []).length;
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Multi-Module Selection
        </label>
        <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
          {getTotalSelectedCount()} templates selected
        </span>
      </div>

      <div className="space-y-1 max-h-96 overflow-auto">
        {modules.map(mod => {
          const Icon = moduleIcons[mod.module] || Code;
          const isExpanded = expandedModules.has(mod.module);
          const templates = getTemplateTypes(mod.module);
          const selectedCount = getModuleSelectedCount(mod.module);
          const allSelected = selectedCount === templates.length && templates.length > 0;

          return (
            <div
              key={mod.module}
              className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden"
            >
              {/* Module header */}
              <div className="flex items-center bg-gray-50 dark:bg-slate-800">
                <button
                  onClick={() => toggleModule(mod.module)}
                  className="flex-1 flex items-center gap-2 p-2 hover:bg-gray-100
                           dark:hover:bg-slate-700 transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                  <div className={`p-1 rounded ${moduleColors[mod.module]} text-white`}>
                    <Icon className="w-3 h-3" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {mod.displayName}
                  </span>
                  {selectedCount > 0 && (
                    <span className="px-1.5 py-0.5 text-xs bg-indigo-100 dark:bg-indigo-900/50
                                   text-indigo-700 dark:text-indigo-300 rounded-full">
                      {selectedCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => toggleAllInModule(mod.module)}
                  className={`p-2 mr-1 rounded transition-colors ${
                    allSelected
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                  title={allSelected ? 'Deselect all' : 'Select all'}
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>

              {/* Templates */}
              {isExpanded && (
                <div className="p-2 space-y-1 bg-white dark:bg-slate-800/50">
                  {templates.map(template => {
                    const isSelected = (selectedTemplates[mod.module] || []).includes(template.type);

                    return (
                      <button
                        key={template.type}
                        onClick={() => toggleTemplate(mod.module, template.type)}
                        className={`w-full flex items-center gap-2 p-2 rounded text-left
                                  transition-colors ${
                                    isSelected
                                      ? 'bg-indigo-50 dark:bg-indigo-900/30'
                                      : 'hover:bg-gray-50 dark:hover:bg-slate-700'
                                  }`}
                      >
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center
                                      ${isSelected
                                        ? 'border-indigo-500 bg-indigo-500'
                                        : 'border-gray-300 dark:border-slate-600'}`}>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-gray-900 dark:text-gray-100 truncate">
                            {template.displayName}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {template.description}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
