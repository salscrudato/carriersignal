import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, AlertCircle, Zap, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

let toastId = 0;
const toastListeners: Set<(toasts: Toast[]) => void> = new Set();
let toastList: Toast[] = [];

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const listener = (newToasts: Toast[]) => setToasts(newToasts);
    toastListeners.add(listener);
    return () => {
      toastListeners.delete(listener);
    };
  }, []);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = `toast-${toastId++}`;
    const newToast: Toast = { ...toast, id, duration: toast.duration || 5000 };
    toastList = [...toastList, newToast];
    toastListeners.forEach(listener => listener(toastList));

    if (newToast.duration) {
      setTimeout(() => removeToast(id), newToast.duration);
    }
  };

  const removeToast = (id: string) => {
    toastList = toastList.filter(t => t.id !== id);
    toastListeners.forEach(listener => listener(toastList));
  };

  return { toasts, addToast, removeToast };
};

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-[9999] space-y-3 pointer-events-none">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle size={20} className="text-green-600" />;
      case 'error':
        return <AlertTriangle size={20} className="text-red-600" />;
      case 'warning':
        return <AlertCircle size={20} className="text-amber-600" />;
      case 'info':
        return <Zap size={20} className="text-blue-600" />;
    }
  };

  const getColors = () => {
    switch (toast.type) {
      case 'success':
        return 'from-green-50 to-emerald-50 border-green-200 text-green-900';
      case 'error':
        return 'from-red-50 to-rose-50 border-red-200 text-red-900';
      case 'warning':
        return 'from-amber-50 to-orange-50 border-amber-200 text-amber-900';
      case 'info':
        return 'from-blue-50 to-indigo-50 border-blue-200 text-blue-900';
    }
  };

  return (
    <div
      className={`liquid-glass rounded-xl border p-4 shadow-lg backdrop-blur-sm bg-gradient-to-br ${getColors()} pointer-events-auto animate-slideInRight max-w-sm`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
        <div className="flex-1">
          <h3 className="font-bold text-sm">{toast.title}</h3>
          {toast.message && <p className="text-xs mt-1 opacity-90">{toast.message}</p>}
        </div>
        <button
          onClick={() => onRemove(toast.id)}
          className="flex-shrink-0 p-1 hover:bg-white/30 rounded-lg transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

