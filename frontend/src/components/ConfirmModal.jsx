import { AlertCircle, CheckCircle, X, LogOut, LogIn, Shield } from 'lucide-react';

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Ya, Lanjutkan',
  cancelText = 'Batal',
  type = 'info', // 'info', 'warning', 'danger'
  icon: CustomIcon
}) {
  if (!isOpen) return null;

  const icons = {
    info: Shield,
    warning: AlertCircle,
    danger: AlertCircle,
    success: CheckCircle,
    login: LogIn,
    logout: LogOut
  };

  const Icon = CustomIcon || icons[type] || icons.info;

  const colors = {
    info: 'bg-blue-50 text-blue-600 border-blue-100',
    warning: 'bg-amber-50 text-amber-600 border-amber-100',
    danger: 'bg-red-50 text-red-600 border-red-100',
    success: 'bg-green-50 text-green-600 border-green-100',
    login: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    logout: 'bg-orange-50 text-orange-600 border-orange-100'
  };

  const buttonColors = {
    info: 'bg-blue-600 hover:bg-blue-700',
    warning: 'bg-amber-500 hover:bg-amber-600',
    danger: 'bg-red-600 hover:bg-red-700',
    success: 'bg-green-600 hover:bg-green-700',
    login: 'bg-indigo-600 hover:bg-indigo-700',
    logout: 'bg-orange-500 hover:bg-orange-600'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl transform transition-all scale-100 animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          {/* Icon */}
          <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center border-2 ${colors[type]}`}>
            <Icon className="w-8 h-8" />
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-center text-gray-900 mb-2">
            {title}
          </h3>

          {/* Message */}
          <p className="text-gray-600 text-center mb-6 leading-relaxed">
            {message}
          </p>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-2.5 text-white font-medium rounded-xl transition shadow-lg shadow-black/10 ${buttonColors[type]}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
