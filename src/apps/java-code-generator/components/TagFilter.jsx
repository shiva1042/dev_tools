import { Tag, X } from 'lucide-react';

// Template tags with colors
export const TEMPLATE_TAGS = {
  'java-21': { label: 'Java 21', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300' },
  'spring-boot': { label: 'Spring Boot', color: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' },
  'database': { label: 'Database', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' },
  'security': { label: 'Security', color: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' },
  'testing': { label: 'Testing', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300' },
  'api': { label: 'API', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300' },
  'async': { label: 'Async', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300' },
  'realtime': { label: 'Real-time', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300' },
  'ai': { label: 'AI/ML', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' },
  'config': { label: 'Config', color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' },
  'patterns': { label: 'Patterns', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' },
  'json': { label: 'JSON', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' },
  'microservices': { label: 'Microservices', color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300' },
  'messaging': { label: 'Messaging', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300' },
  'caching': { label: 'Caching', color: 'bg-lime-100 text-lime-700 dark:bg-lime-900/50 dark:text-lime-300' },
  'validation': { label: 'Validation', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300' },
  'reactive': { label: 'Reactive', color: 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/50 dark:text-fuchsia-300' },
  'scheduling': { label: 'Scheduling', color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300' },
  'file': { label: 'File I/O', color: 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300' },
};

// Map modules to tags
export const MODULE_TAGS = {
  CORE_JAVA: ['java-21', 'patterns'],
  POSTGRESQL: ['database', 'spring-boot'],
  ELASTICSEARCH: ['database', 'api'],
  NEO4J: ['database', 'patterns'],
  CHATBOT: ['ai', 'realtime', 'spring-boot'],
  REST_API: ['api', 'spring-boot'],
  JSON_PROCESSING: ['json', 'java-21'],
  CONFIG: ['config', 'spring-boot'],
  TESTING: ['testing', 'spring-boot'],
  SPRING_BOOT: ['spring-boot', 'config'],
  WEBSOCKET: ['realtime', 'spring-boot'],
  SECURITY: ['security', 'spring-boot'],
  MICROSERVICES: ['microservices', 'spring-boot', 'patterns', 'async'],
  MESSAGING: ['messaging', 'async', 'spring-boot', 'patterns'],
  CACHING: ['caching', 'spring-boot', 'database'],
  VALIDATION: ['validation', 'spring-boot', 'api'],
  REACTIVE: ['reactive', 'spring-boot', 'async', 'database'],
  SCHEDULING: ['scheduling', 'spring-boot', 'async'],
  FILE_HANDLING: ['file', 'spring-boot', 'api'],
  ASYNC: ['async', 'java-21', 'patterns'],
};

export default function TagFilter({ selectedTags, onTagToggle, onClearTags }) {
  const allTags = Object.keys(TEMPLATE_TAGS);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <Tag className="w-4 h-4" />
          <span>Filter by Tag</span>
        </div>
        {selectedTags.length > 0 && (
          <button
            onClick={onClearTags}
            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400
                     dark:hover:text-gray-200 flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {allTags.map(tag => {
          const { label, color } = TEMPLATE_TAGS[tag];
          const isSelected = selectedTags.includes(tag);

          return (
            <button
              key={tag}
              onClick={() => onTagToggle(tag)}
              className={`px-2 py-1 text-xs rounded-full transition-all ${
                isSelected
                  ? `${color} ring-2 ring-offset-1 ring-indigo-500 dark:ring-offset-slate-800`
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
