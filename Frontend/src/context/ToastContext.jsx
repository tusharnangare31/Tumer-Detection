import React, { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, AlertTriangle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toastHelpers = {
    success: (msg, dur) => addToast(msg, "success", dur),
    error: (msg, dur) => addToast(msg, "error", dur),
    info: (msg, dur) => addToast(msg, "info", dur),
    warning: (msg, dur) => addToast(msg, "warning", dur),
  };

  const getToastStyle = (type) => {
    switch (type) {
      case "success":
        return {
          bg: "bg-emerald-600/90 text-white",
          icon: <CheckCircle className="w-5 h-5 text-emerald-100" />,
        };
      case "error":
        return {
          bg: "bg-rose-600/90 text-white",
          icon: <AlertTriangle className="w-5 h-5 text-rose-100" />,
        };
      case "warning":
        return {
          bg: "bg-amber-600/90 text-white",
          icon: <AlertTriangle className="w-5 h-5 text-amber-100" />,
        };
      case "info":
      default:
        return {
          bg: "bg-blue-600/90 text-white",
          icon: <Info className="w-5 h-5 text-blue-100" />,
        };
    }
  };

  return (
    <ToastContext.Provider value={toastHelpers}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            const style = getToastStyle(toast.type);
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.15 } }}
                className={`flex items-start gap-3 p-4 rounded-2xl shadow-xl backdrop-blur-md border border-white/10 ${style.bg} pointer-events-auto`}
              >
                <div className="flex-shrink-0 mt-0.5">{style.icon}</div>
                <div className="flex-1 text-sm font-semibold leading-snug">{toast.message}</div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="flex-shrink-0 text-white/70 hover:text-white p-0.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X size={16} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
