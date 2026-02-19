import { X, Keyboard } from 'lucide-react';
import { SHORTCUTS } from '../hooks/useKeyboardShortcuts';

export default function ShortcutsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const shortcutGroups = [
    {
      title: 'General',
      shortcuts: [
        SHORTCUTS.GENERATE,
        SHORTCUTS.EXPORT,
        SHORTCUTS.SEARCH,
      ]
    },
    {
      title: 'UI',
      shortcuts: [
        SHORTCUTS.TOGGLE_THEME,
        SHORTCUTS.HELP,
        SHORTCUTS.ESCAPE,
      ]
    }
  ];

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-content w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Keyboard Shortcuts
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
        <div className="p-4 space-y-6">
          {shortcutGroups.map(group => (
            <div key={group.title}>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                {group.title}
              </h3>
              <div className="space-y-2">
                {group.shortcuts.map(shortcut => (
                  <div
                    key={shortcut.label}
                    className="flex items-center justify-between py-2 px-3 rounded-lg
                               bg-gray-50 dark:bg-slate-800"
                  >
                    <span className="text-gray-700 dark:text-gray-300">
                      {shortcut.description}
                    </span>
                    <kbd className="kbd">{shortcut.label}</kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 dark:border-slate-700 bg-gray-50
                        dark:bg-slate-800/50 text-sm text-gray-500 dark:text-gray-400 text-center">
          Press <kbd className="kbd">Ctrl+/</kbd> anytime to show this help
        </div>
      </div>
    </>
  );
}
