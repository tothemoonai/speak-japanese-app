import { useState, useCallback } from 'react';

export interface Toast {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

let toastCount = 0;

export function useToast() {
  const [toasts, setToasts] = useState<Array<Toast & { id: number }>>([]);

  const toast = useCallback(({ title, description, variant = 'default' }: Toast) => {
    const id = toastCount++;
    const newToast = { id, title, description, variant };

    setToasts((prev) => [...prev, newToast]);

    // Auto remove after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);

    return id;
  }, []);

  return {
    toast,
    toasts,
  };
}
