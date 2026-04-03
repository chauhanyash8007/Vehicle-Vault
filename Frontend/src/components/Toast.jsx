import { createContext, useCallback, useContext, useState } from "react";

const ToastCtx = createContext(null);
let _id = 0;

const ICONS = { success: "✓", error: "✕", warning: "⚠", info: "ℹ" };
const STYLES = {
  success: "bg-emerald-600 border-emerald-500",
  error: "bg-rose-600 border-rose-500",
  warning: "bg-amber-500 border-amber-400",
  info: "bg-brand-600 border-brand-500",
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const add = useCallback((message, type = "success") => {
    const id = ++_id;
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  }, []);

  const remove = useCallback(
    (id) => setToasts((p) => p.filter((t) => t.id !== id)),
    [],
  );

  return (
    <ToastCtx.Provider value={add}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium text-white shadow-card-lg animate-slide-up min-w-[260px] max-w-sm ${STYLES[t.type] || STYLES.success}`}
          >
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
              {ICONS[t.type] || ICONS.success}
            </span>
            <span className="flex-1 leading-snug">{t.message}</span>
            <button
              onClick={() => remove(t.id)}
              className="flex-shrink-0 rounded-lg p-0.5 text-white/60 hover:text-white transition"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be inside ToastProvider");
  return ctx;
}
