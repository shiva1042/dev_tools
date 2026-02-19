import { History, X, Trash2, Clock, Package } from 'lucide-react';

export default function HistoryPanel({ history, onRestoreHistory, onDeleteHistory, onClearHistory, isOpen, onClose }) {
  if (!isOpen) return null;

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    // Less than 1 minute
    if (diff < 60000) return 'Just now';
    // Less than 1 hour
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    // Less than 24 hours
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    // Less than 7 days
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    // Otherwise show date
    return date.toLocaleDateString();
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-content w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Generation History
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="flex items-center gap-1 px-2 py-1 text-sm text-red-600
                           hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-96 overflow-auto p-2">
          {history.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Clock className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>No history yet</p>
              <p className="text-sm mt-1">
                Your generated templates will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((item, index) => (
                <div
                  key={item.id || index}
                  className="history-item group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <button
                      onClick={() => {
                        onRestoreHistory(item);
                        onClose();
                      }}
                      className="flex-1 text-left min-w-0"
                    >
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-indigo-500" />
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {item.className}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {item.packageName}
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-400 dark:text-gray-500">
                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-slate-700 rounded">
                          {item.module}
                        </span>
                        <span>•</span>
                        <span>{item.templateCount} template{item.templateCount !== 1 ? 's' : ''}</span>
                        <span>•</span>
                        <span>{formatDate(item.timestamp)}</span>
                      </div>
                    </button>
                    <button
                      onClick={() => onDeleteHistory(item.id || index)}
                      className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-50
                                 dark:hover:bg-red-900/30 rounded transition-opacity"
                      title="Delete from history"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="p-3 border-t border-gray-200 dark:border-slate-700 bg-gray-50
                          dark:bg-slate-800/50 text-sm text-gray-500 dark:text-gray-400">
            {history.length} item{history.length !== 1 ? 's' : ''} in history
          </div>
        )}
      </div>
    </>
  );
}
