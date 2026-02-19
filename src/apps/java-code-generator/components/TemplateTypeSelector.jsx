import { Check, Star } from 'lucide-react';

export default function TemplateTypeSelector({
  templateTypes,
  selected,
  onToggle,
  selectedModule,
  favorites = [],
  onToggleFavorite
}) {
  if (!templateTypes || templateTypes.length === 0) {
    return (
      <div className="text-gray-500 dark:text-gray-400 text-sm">
        Select a module to see available template types
      </div>
    );
  }

  const isFavorite = (type) => favorites.includes(`${selectedModule}:${type}`);

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Select Templates to Generate
      </label>
      <div className="grid grid-cols-1 gap-2 max-h-64 overflow-auto">
        {templateTypes.map((type) => {
          const isSelected = selected.includes(type.type);
          const favorited = isFavorite(type.type);

          return (
            <div
              key={type.type}
              className={`
                relative p-3 rounded-lg border transition-all duration-200
                ${isSelected
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                  : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600'
                }
              `}
            >
              <div className="flex items-start justify-between">
                <button
                  onClick={() => onToggle(type.type)}
                  className="flex-1 text-left min-w-0"
                >
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                    {type.displayName}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {type.description}
                  </p>
                </button>
                <div className="flex items-center gap-1 ml-2">
                  {onToggleFavorite && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(`${selectedModule}:${type.type}`);
                      }}
                      className={`star-favorite p-1 rounded ${favorited ? 'active' : 'text-gray-300 dark:text-gray-600 hover:text-yellow-400'}`}
                      title={favorited ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Star className="w-4 h-4" fill={favorited ? 'currentColor' : 'none'} />
                    </button>
                  )}
                  {isSelected && (
                    <div className="flex-shrink-0">
                      <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => templateTypes.forEach(t => !selected.includes(t.type) && onToggle(t.type))}
          className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
        >
          Select All
        </button>
        <button
          onClick={() => selected.forEach(s => onToggle(s))}
          className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        >
          Clear All
        </button>
      </div>
    </div>
  );
}
