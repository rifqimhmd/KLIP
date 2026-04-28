import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  X, 
  AlertCircle,
  Trash2,
  LogOut,
  UserCheck,
  FileText
} from 'lucide-react';

// Toast Context
const ToastContext = createContext(null);

// Hook untuk menggunakan toast
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

// Toast Provider
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { ...toast, id }]);
    
    // Auto dismiss untuk non-confirm toasts
    if (toast.type !== 'confirm' && toast.duration !== 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration || 4000);
    }
    
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const updateToast = useCallback((id, updates) => {
    setToasts((prev) => 
      prev.map((t) => t.id === id ? { ...t, ...updates } : t)
    );
  }, []);

  // Helper methods
  const success = (message, options = {}) => 
    addToast({ type: 'success', message, ...options });
  
  const error = (message, options = {}) => 
    addToast({ type: 'error', message, ...options });
  
  const warning = (message, options = {}) => 
    addToast({ type: 'warning', message, ...options });
  
  const info = (message, options = {}) => 
    addToast({ type: 'info', message, ...options });
  
  const confirm = (message, onConfirm, onCancel, options = {}) => {
    const id = addToast({ 
      type: 'confirm', 
      message, 
      onConfirm, 
      onCancel,
      confirmText: options.confirmText || 'Ya',
      cancelText: options.cancelText || 'Batal',
      confirmVariant: options.confirmVariant || 'danger',
      ...options 
    });
    return id;
  };

  const promise = async (promiseFn, messages = {}) => {
    const { loading = 'Memproses...', success = 'Berhasil!', error = 'Gagal!' } = messages;
    
    const id = addToast({ type: 'loading', message: loading, duration: 0 });
    
    try {
      const result = await promiseFn();
      updateToast(id, { type: 'success', message: success, duration: 3000 });
      setTimeout(() => removeToast(id), 3000);
      return result;
    } catch (err) {
      updateToast(id, { 
        type: 'error', 
        message: err.message || error, 
        duration: 4000 
      });
      setTimeout(() => removeToast(id), 4000);
      throw err;
    }
  };

  const value = {
    success, error, warning, info, confirm, promise,
    toasts, removeToast
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

// Toast Item Component
const ToastItem = ({ toast, onRemove, index }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const handleConfirm = () => {
    handleDismiss();
    setTimeout(() => toast.onConfirm?.(), 300);
  };

  const handleCancel = () => {
    handleDismiss();
    setTimeout(() => toast.onCancel?.(), 300);
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    error: <XCircle className="w-5 h-5 text-rose-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
    confirm: <AlertCircle className="w-5 h-5 text-orange-500" />,
    loading: (
      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    ),
  };

  const bgColors = {
    success: 'bg-gradient-to-r from-emerald-50 to-white border-emerald-200',
    error: 'bg-gradient-to-r from-rose-50 to-white border-rose-200',
    warning: 'bg-gradient-to-r from-amber-50 to-white border-amber-200',
    info: 'bg-gradient-to-r from-blue-50 to-white border-blue-200',
    confirm: 'bg-gradient-to-r from-orange-50 to-white border-orange-200',
    loading: 'bg-gradient-to-r from-blue-50 to-white border-blue-200',
  };

  const progressColors = {
    success: 'bg-emerald-500',
    error: 'bg-rose-500',
    warning: 'bg-amber-500',
    info: 'bg-blue-500',
    confirm: 'bg-orange-500',
    loading: 'bg-blue-500',
  };

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl shadow-lg border
        ${bgColors[toast.type]}
        ${isExiting ? 'toast-exit' : 'toast-enter'}
        transform transition-all duration-300
      `}
      style={{
        animationDelay: `${index * 50}ms`,
      }}
    >
      {/* Progress bar */}
      {toast.type !== 'confirm' && toast.type !== 'loading' && (
        <div 
          className={`absolute bottom-0 left-0 h-1 ${progressColors[toast.type]}`}
          style={{
            width: '100%',
            animation: `shrink ${toast.duration || 4000}ms linear forwards`,
          }}
        />
      )}

      <div className="p-4 flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {icons[toast.type]}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 leading-relaxed">
            {toast.message}
          </p>

          {/* Confirm Buttons */}
          {toast.type === 'confirm' && (
            <div className="mt-3 flex gap-2">
              <button
                onClick={handleConfirm}
                className={`
                  px-3 py-1.5 text-xs font-medium rounded-lg transition-all
                  ${toast.confirmVariant === 'danger' 
                    ? 'bg-rose-500 hover:bg-rose-600 text-white' 
                    : toast.confirmVariant === 'success'
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }
                `}
              >
                {toast.confirmText}
              </button>
              <button
                onClick={handleCancel}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
              >
                {toast.cancelText}
              </button>
            </div>
          )}
        </div>

        {/* Close Button */}
        {toast.type !== 'confirm' && (
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        
        .toast-enter {
          animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        .toast-exit {
          animation: slideOut 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100%) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        
        @keyframes slideOut {
          from {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateX(100%) scale(0.9);
          }
        }
      `}</style>
    </div>
  );
};

// Toast Container
const ToastContainer = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <div className="flex flex-col gap-2 pointer-events-auto">
        {toasts.map((toast, index) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onRemove={onRemove}
            index={index}
          />
        ))}
      </div>
    </div>
  );
};

export default ToastProvider;
