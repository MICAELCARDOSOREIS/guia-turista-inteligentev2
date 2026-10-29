import { useState, useCallback } from 'react';

export function useToasts() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((mensagem, tipo = 'info', duracaoMs = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, mensagem, tipo }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duracaoMs);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}
