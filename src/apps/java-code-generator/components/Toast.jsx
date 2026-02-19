import { useEffect } from 'react';
import { Check, X, Info, AlertTriangle } from 'lucide-react';

const icons = {
  success: Check,
  error: X,
  info: Info,
  warning: AlertTriangle
};

const styles = {
  success: 'bg-green-600 text-white',
  error: 'bg-red-600 text-white',
  info: 'bg-blue-600 text-white',
  warning: 'bg-amber-500 text-white'
};

export default function Toast({ message, type = 'info', onClose, duration = 3000 }) {
  const Icon = icons[type] || Info;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!message) return null;

  return (
    <div className="toast">
      <div className={`toast-content ${styles[type]}`}>
        <Icon className="w-5 h-5 flex-shrink-0" />
        <span>{message}</span>
        <button
          onClick={onClose}
          className="ml-2 p-1 hover:bg-white/20 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Toast container for multiple toasts
export function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <div key={toast.id} className="animate-slide-up">
          <div className={`toast-content ${styles[toast.type || 'info']}`}>
            {(() => {
              const Icon = icons[toast.type] || Info;
              return <Icon className="w-5 h-5 flex-shrink-0" />;
            })()}
            <span>{toast.message}</span>
            <button
              onClick={() => onRemove(toast.id)}
              className="ml-2 p-1 hover:bg-white/20 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
