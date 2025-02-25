import { useState } from 'react';

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Math.random().toString(36).substring(7);
    setToasts([...toasts, { id, message, type }]);

    // Remover el toast automáticamente después de 3 segundos
    setTimeout(() => {
      setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
    }, 3000);
  };

  return {
    toasts,
    addToast,
  };
}

export function ToastContainer({ toasts }) {
  return (
    <div className="fixed bottom-4 right-4 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`p-4 rounded-lg shadow-lg ${
            toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
