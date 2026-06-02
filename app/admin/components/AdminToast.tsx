'use client';

import { useEffect, useRef } from 'react';
import { FaCheckCircle, FaTimesCircle, FaExclamationTriangle } from 'react-icons/fa';
import { MdClose } from 'react-icons/md';

export type ToastType = 'success' | 'error' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

// ── Confirm Dialog ────────────────────────────────────────────────────────────

interface ConfirmDialogProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

export function AdminConfirmDialog({
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'Ya, Lanjutkan',
  cancelLabel = 'Batal',
  danger = false,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelRef.current?.focus();
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      {/* Dialog */}
      <div className="relative w-[90vw] max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-1 flex items-center gap-3">
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${danger ? 'bg-[#fff0ef] text-[#f36e65]' : 'bg-[#fffbe8] text-[#f59e0b]'}`}>
            <FaExclamationTriangle size={18} />
          </span>
          <p className="text-sm font-medium text-[#202126]">{message}</p>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            ref={cancelRef}
            onClick={onCancel}
            className="rounded-xl border border-[#e0ddf0] px-4 py-2 text-sm font-semibold text-[#7054dc] hover:bg-[#f5f1ff]"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-xl px-4 py-2 text-sm font-semibold text-white ${danger ? 'bg-[#f36e65] hover:bg-[#e55d54]' : 'bg-[#7054dc] hover:bg-[#5c45b8]'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Toast Notification ────────────────────────────────────────────────────────

interface ToastProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

const iconMap: Record<ToastType, React.ReactNode> = {
  success: <FaCheckCircle size={16} className="text-[#22c55e]" />,
  error:   <FaTimesCircle size={16} className="text-[#f36e65]" />,
  warning: <FaExclamationTriangle size={16} className="text-[#f59e0b]" />,
};

const bgMap: Record<ToastType, string> = {
  success: 'border-[#bbf7d0] bg-[#f0fdf4]',
  error:   'border-[#fecaca] bg-[#fff5f5]',
  warning: 'border-[#fde68a] bg-[#fffbeb]',
};

function Toast({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const t = setTimeout(() => onDismiss(toast.id), 3500);
    return () => clearTimeout(t);
  }, [toast.id, onDismiss]);

  return (
    <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-md ${bgMap[toast.type]} animate-slide-in`}>
      <span className="mt-0.5 shrink-0">{iconMap[toast.type]}</span>
      <p className="flex-1 text-sm text-[#202126]">{toast.message}</p>
      <button onClick={() => onDismiss(toast.id)} className="shrink-0 text-[#9ca3af] hover:text-[#6b7280]">
        <MdClose size={16} />
      </button>
    </div>
  );
}

export function AdminToastContainer({ toasts, onDismiss }: ToastProps) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[9998] flex flex-col gap-2 w-80">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

import { useState, useCallback } from 'react';

export function useAdminToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, showToast, dismissToast };
}
