import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

export default function CollapsibleSection({
  title,
  icon: Icon,
  children,
  defaultOpen = true,
  badge,
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50
                   hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
      >
        <div className="flex items-center gap-2">
          {isOpen ? (
            <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          )}
          {Icon && <Icon className="w-4 h-4 text-indigo-500" />}
          <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">
            {title}
          </span>
        </div>
        {badge && (
          <span className="px-2 py-0.5 text-xs bg-indigo-100 dark:bg-indigo-900/50
                         text-indigo-700 dark:text-indigo-300 rounded-full">
            {badge}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="p-3 bg-white dark:bg-slate-800 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
}
