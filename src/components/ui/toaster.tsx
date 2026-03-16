'use client';

import { useToast } from '@/hooks/use-toast';
import { CheckCircle, AlertCircle, X } from 'lucide-react';
import { useEffect } from 'react';

export function Toaster() {
  const { toasts } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 p-4 rounded-lg shadow-lg max-w-md animate-in slide-in-from-right-full ${
            toast.variant === 'destructive'
              ? 'bg-red-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700'
          }`}
        >
          {toast.variant === 'destructive' ? (
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          ) : (
            <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-green-600" />
          )}
          <div className="flex-1">
            <p className="font-medium text-sm">{toast.title}</p>
            {toast.description && (
              <p className="text-sm opacity-90 mt-1">{toast.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
