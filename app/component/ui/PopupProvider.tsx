'use client';

import { createContext, useContext, useCallback, useState, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import { FiX, FiCheckCircle, FiAlertTriangle, FiInfo, FiAlertCircle } from 'react-icons/fi';

// ---------------------------------------------------------------------------
// Toast types
// ---------------------------------------------------------------------------

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

// ---------------------------------------------------------------------------
// Confirm Dialog types
// ---------------------------------------------------------------------------

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface PopupContextValue {
  toast: (message: string, type?: ToastType) => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const PopupContext = createContext<PopupContextValue | null>(null);

export function usePopup() {
  const ctx = useContext(PopupContext);
  if (!ctx) throw new Error('usePopup must be used inside <PopupProvider>');
  return ctx;
}

// ---------------------------------------------------------------------------
// Toast Component
// ---------------------------------------------------------------------------

const iconMap: Record<ToastType, ReactNode> = {
  success: <FiCheckCircle size={18} className="text-[#2a9d5c]" />,
  error: <FiAlertCircle size={18} className="text-[#e04e4e]" />,
  warning: <FiAlertTriangle size={18} className="text-[#f39b39]" />,
  info: <FiInfo size={18} className="text-[#7054dc]" />,
};

const bgMap: Record<ToastType, string> = {
  success: 'border-[#2a9d5c]/20 bg-[#f0fdf4]',
  error: 'border-[#e04e4e]/20 bg-[#fef2f2]',
  warning: 'border-[#f39b39]/20 bg-[#fffbeb]',
  info: 'border-[#7054dc]/20 bg-[#f5f3ff]',
};

function Toast({ item, onDismiss }: { item: ToastItem; onDismiss: (id: number) => void }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
    const timer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(() => onDismiss(item.id), 300);
    }, 4000);
    return () => clearTimeout(timer);
  }, [item.id, onDismiss]);

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-sm transition-all duration-300 ${bgMap[item.type]} ${
        isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0'
      }`}
    >
      {iconMap[item.type]}
      <p className="flex-1 text-[13px] font-medium text-[#232530]">{item.message}</p>
      <button
        type="button"
        onClick={() => {
          setIsLeaving(true);
          setTimeout(() => onDismiss(item.id), 300);
        }}
        className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[#9ca0ad] transition-colors hover:bg-black/5 hover:text-[#232530]"
      >
        <FiX size={14} />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Confirm Dialog Component
// ---------------------------------------------------------------------------

function ConfirmDialog({
  options,
  onResolve,
}: {
  options: ConfirmOptions;
  onResolve: (result: boolean) => void;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
    cancelRef.current?.focus();
  }, []);

  const close = (result: boolean) => {
    setIsVisible(false);
    setTimeout(() => onResolve(result), 200);
  };

  const isDanger = options.variant === 'danger';

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-200 ${
        isVisible ? 'bg-black/40 backdrop-blur-[2px]' : 'bg-transparent'
      }`}
      onClick={() => close(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-[420px] rounded-2xl border border-[#e5e3ee] bg-white px-6 py-5 shadow-[0_20px_60px_rgba(0,0,0,0.15)] transition-all duration-200 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${isDanger ? 'bg-[#fef2f2]' : 'bg-[#f5f3ff]'}`}>
            {isDanger ? (
              <FiAlertTriangle size={18} className="text-[#e04e4e]" />
            ) : (
              <FiInfo size={18} className="text-[#7054dc]" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-[15px] font-semibold text-[#232530]">
              {options.title || (isDanger ? 'Konfirmasi' : 'Konfirmasi')}
            </h3>
            <p className="mt-1 text-[13px] leading-[1.5] text-[#6b6f7e]">
              {options.message}
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            ref={cancelRef}
            type="button"
            onClick={() => close(false)}
            className="inline-flex h-[36px] items-center justify-center rounded-lg border border-[#e5e3ee] px-4 text-[13px] font-medium text-[#6b6f7e] transition-colors hover:bg-[#f5f4fb]"
          >
            {options.cancelText || 'Batal'}
          </button>
          <button
            type="button"
            onClick={() => close(true)}
            className={`inline-flex h-[36px] items-center justify-center rounded-lg px-5 text-[13px] font-semibold text-white transition-colors ${
              isDanger
                ? 'bg-[#e04e4e] hover:bg-[#c93c3c]'
                : 'bg-[#7054dc] hover:bg-[#5f46cc]'
            }`}
          >
            {options.confirmText || 'Ya, Lanjutkan'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function PopupProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmState, setConfirmState] = useState<{
    options: ConfirmOptions;
    resolve: (result: boolean) => void;
  } | null>(null);
  const idRef = useRef(0);
  const confirmStateRef = useRef(confirmState);
  confirmStateRef.current = confirmState;

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({ options, resolve });
    });
  }, []);

  // Empty deps: ref always holds the current confirmState so the callback
  // never becomes stale but also never re-creates on every confirm() call.
  const handleConfirmResolve = useCallback(
    (result: boolean) => {
      confirmStateRef.current?.resolve(result);
      setConfirmState(null);
    },
    [],
  );

  return (
    <PopupContext.Provider value={{ toast, confirm }}>
      {children}

      {/* Toast container */}
      <div className="fixed right-4 top-4 z-[9998] flex w-[360px] max-w-[calc(100vw-2rem)] flex-col gap-2">
        {toasts.map((t) => (
          <Toast key={t.id} item={t} onDismiss={dismissToast} />
        ))}
      </div>

      {/* Confirm dialog */}
      {confirmState && (
        <ConfirmDialog options={confirmState.options} onResolve={handleConfirmResolve} />
      )}
    </PopupContext.Provider>
  );
}
