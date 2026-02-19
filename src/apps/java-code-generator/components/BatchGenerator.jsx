import { useState } from 'react';
import { X, Plus, Trash2, Wand2, Download } from 'lucide-react';

export default function BatchGenerator({ isOpen, onClose, onGenerate, selectedModule }) {
  const [entities, setEntities] = useState([
    { id: 1, className: 'User', packageName: 'com.example.user' },
    { id: 2, className: 'Product', packageName: 'com.example.product' },
  ]);

  const addEntity = () => {
    setEntities(prev => [
      ...prev,
      { id: Date.now(), className: '', packageName: 'com.example' }
    ]);
  };

  const removeEntity = (id) => {
    setEntities(prev => prev.filter(e => e.id !== id));
  };

  const updateEntity = (id, field, value) => {
    setEntities(prev => prev.map(e =>
      e.id === id ? { ...e, [field]: value } : e
    ));
  };

  const handleGenerate = () => {
    const validEntities = entities.filter(e => e.className.trim());
    if (validEntities.length === 0) return;
    onGenerate(validEntities);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-content w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Batch Generation
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
        <div className="p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Generate the same template types for multiple entities at once.
          </p>

          <div className="space-y-3 max-h-80 overflow-auto">
            {entities.map((entity, index) => (
              <div
                key={entity.id}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg"
              >
                <span className="w-6 h-6 flex items-center justify-center bg-indigo-100
                               dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300
                               rounded-full text-sm font-medium">
                  {index + 1}
                </span>
                <input
                  type="text"
                  value={entity.className}
                  onChange={(e) => updateEntity(entity.id, 'className', e.target.value)}
                  placeholder="Class Name (e.g., User)"
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300
                           dark:border-slate-600 bg-white dark:bg-slate-700"
                />
                <input
                  type="text"
                  value={entity.packageName}
                  onChange={(e) => updateEntity(entity.id, 'packageName', e.target.value)}
                  placeholder="Package Name"
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300
                           dark:border-slate-600 bg-white dark:bg-slate-700"
                />
                <button
                  onClick={() => removeEntity(entity.id)}
                  disabled={entities.length <= 1}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30
                           rounded disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={addEntity}
            className="mt-3 flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400
                     hover:text-indigo-800 dark:hover:text-indigo-300"
          >
            <Plus className="w-4 h-4" />
            Add Another Entity
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {entities.filter(e => e.className.trim()).length} entities ready
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm bg-gray-100 dark:bg-slate-700 text-gray-700
                       dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={entities.filter(e => e.className.trim()).length === 0}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-indigo-600 text-white
                       rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Generate All
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
