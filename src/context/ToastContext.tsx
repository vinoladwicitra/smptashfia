import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { IconCheck, IconAlertCircle, IconX } from '@tabler/icons-react';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastContextType {
  toast: (opts: Omit<Toast, 'id'>) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(({ type, title, description }: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, description }]);
    
    // Auto dismiss after 4s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div className="fixed top-4 right-4 z-[6000] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast: t, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const iconMap = {
    success: <IconCheck size={20} className="text-green-600" />,
    error: <IconAlertCircle size={20} className="text-red-600" />,
    info: <IconAlertCircle size={20} className="text-blue-600" />,
  };

  const borderMap = {
    success: 'border-green-200',
    error: 'border-red-200',
    info: 'border-blue-200',
  };

  return (
    <div
      className={`pointer-events-auto bg-white rounded-xl shadow-lg border ${borderMap[t.type]} p-4 w-80 animate-slideUp flex items-start gap-3 relative overflow-hidden`}
    >
      <div className="flex-shrink-0 mt-0.5">{iconMap[t.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text">{t.title}</p>
        {t.description && (
          <p className="text-xs text-text-light mt-0.5 line-clamp-2">{t.description}</p>
        )}
      </div>
      <button onClick={onDismiss} className="text-text-light hover:text-text flex-shrink-0">
        <IconX size={16} />
      </button>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
