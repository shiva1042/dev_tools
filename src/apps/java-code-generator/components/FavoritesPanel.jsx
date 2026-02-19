import { Star, X, Code, Bot, Plug, FileJson, Settings, TestTube, Rocket, Radio, Shield, Database, FileSearch, GitGraph } from 'lucide-react';
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

export default function FavoritesPanel({ favorites, onRemoveFavorite, onSelectFavorite, isOpen, onClose }) {
  // Get favorite template details
  const favoriteTemplates = favorites.map(favId => {
    const [moduleName, templateType] = favId.split(':');
    const mod = modules.find(m => m.module === moduleName);
    if (!mod) return null;

    const template = mod.templates[templateType];
    if (!template) return null;

    return {
      id: favId,
      module: moduleName,
      moduleName: mod.displayName,
      type: templateType,
      name: template.name,
      description: template.description
    };
  }).filter(Boolean);

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-content w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Favorite Templates
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-96 overflow-auto p-2">
          {favoriteTemplates.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Star className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>No favorites yet</p>
              <p className="text-sm mt-1">
                Click the star icon on templates to add them here
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {favoriteTemplates.map(template => {
                const Icon = moduleIcons[template.module] || Code;

                return (
                  <div
                    key={template.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200
                               dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600
                               transition-colors group"
                  >
                    <div className={`p-2 rounded-lg ${moduleColors[template.module]} text-white`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <button
                      onClick={() => {
                        onSelectFavorite(template.module, template.type);
                        onClose();
                      }}
                      className="flex-1 text-left min-w-0"
                    >
                      <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {template.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {template.moduleName}
                      </div>
                    </button>
                    <button
                      onClick={() => onRemoveFavorite(template.id)}
                      className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-50
                                 dark:hover:bg-red-900/30 rounded transition-opacity"
                      title="Remove from favorites"
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {favoriteTemplates.length > 0 && (
          <div className="p-3 border-t border-gray-200 dark:border-slate-700 bg-gray-50
                          dark:bg-slate-800/50 text-sm text-gray-500 dark:text-gray-400">
            {favoriteTemplates.length} favorite{favoriteTemplates.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </>
  );
}
