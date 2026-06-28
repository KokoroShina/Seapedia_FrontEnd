"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, AlertCircle, X, Info } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  showToast: (type: ToastType, title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

const toastConfig: Record<
  ToastType,
  { icon: typeof CheckCircle; bgColor: string; borderColor: string; iconColor: string }
> = {
  success: {
    icon: CheckCircle,
    bgColor: "bg-gradient-to-br from-emerald-50 to-green-50",
    borderColor: "border-emerald-200",
    iconColor: "text-emerald-500",
  },
  error: {
    icon: XCircle,
    bgColor: "bg-gradient-to-br from-red-50 to-rose-50",
    borderColor: "border-red-200",
    iconColor: "text-red-500",
  },
  warning: {
    icon: AlertCircle,
    bgColor: "bg-gradient-to-br from-amber-50 to-yellow-50",
    borderColor: "border-amber-200",
    iconColor: "text-amber-500",
  },
  info: {
    icon: Info,
    bgColor: "bg-gradient-to-br from-ocean-50 to-cyan-50",
    borderColor: "border-ocean-200",
    iconColor: "text-ocean-500",
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (type: ToastType, title: string, message?: string) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      setToasts((prev) => [...prev, { id, type, title, message }]);

      // Auto dismiss after 4 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, 4000);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm">
        <AnimatePresence>
          {toasts.map((toast) => {
            const config = toastConfig[toast.type];
            const Icon = config.icon;

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 100, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 100, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={`${config.bgColor} ${config.borderColor} border rounded-2xl p-4 shadow-xl backdrop-blur-sm`}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`${config.iconColor} mt-0.5`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800">{toast.title}</p>
                    {toast.message && (
                      <p className="text-sm text-gray-600 mt-0.5">{toast.message}</p>
                    )}
                  </div>

                  {/* Close Button */}
                  <button
                    onClick={() => dismissToast(toast.id)}
                    className="p-1 hover:bg-white/50 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>

                {/* Progress Bar */}
                <motion.div
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{ duration: 4, ease: "linear" }}
                  className={`h-1 mt-3 rounded-full ${
                    toast.type === "success"
                      ? "bg-emerald-400"
                      : toast.type === "error"
                      ? "bg-red-400"
                      : toast.type === "warning"
                      ? "bg-amber-400"
                      : "bg-ocean-400"
                  }`}
                  style={{ transformOrigin: "left" }}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
