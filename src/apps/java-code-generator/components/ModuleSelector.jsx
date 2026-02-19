import { Code, Bot, Plug, FileJson, Settings, TestTube, Rocket, Radio, Shield, Database, FileSearch, GitGraph } from 'lucide-react';

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

export default function ModuleSelector({ modules, selected, onSelect }) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Select Template Category
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {modules.map((mod) => {
          const Icon = moduleIcons[mod.module] || Code;
          const isSelected = selected === mod.module;

          return (
            <button
              key={mod.module}
              onClick={() => onSelect(mod.module)}
              className={`
                relative p-3 rounded-lg border-2 transition-all duration-200 text-left
                ${isSelected
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 shadow-md'
                  : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600 hover:shadow-sm'
                }
              `}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${moduleColors[mod.module] || 'bg-gray-500'} text-white`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">
                    {mod.displayName}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {mod.description}
                  </p>
                </div>
              </div>
              {isSelected && (
                <div className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
