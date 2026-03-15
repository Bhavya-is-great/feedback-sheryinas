"use client";

import { createContext, useContext, useRef, useState } from "react";

const ToastContext = createContext(null);

const stackStyle = {
  position: "fixed",
  top: "24px",
  right: "24px",
  zIndex: 1000,
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  width: "min(360px, calc(100vw - 32px))",
};

const toastStyle = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: "12px",
  padding: "14px 16px",
  borderRadius: "18px",
  border: "1px solid rgba(255, 255, 255, 0.16)",
  background: "rgba(9, 9, 9, 0.96)",
  boxShadow: "0 18px 60px rgba(0, 0, 0, 0.28)",
  color: "#fff6ef",
};

const toneStyles = {
  success: { borderColor: "rgba(79, 201, 124, 0.45)" },
  error: { borderColor: "rgba(255, 107, 107, 0.48)" },
  info: { borderColor: "rgba(227, 89, 39, 0.48)" },
};

const textStyle = {
  margin: 0,
  fontSize: "0.95rem",
  lineHeight: 1.5,
};

const closeButtonStyle = {
  border: 0,
  background: "transparent",
  color: "inherit",
  cursor: "pointer",
  fontSize: "1rem",
  lineHeight: 1,
};

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider.");
  }

  return context;
}

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timeoutRefs = useRef(new Map());
  const nextToastIdRef = useRef(0);

  function dismissToast(id) {
    const timeoutId = timeoutRefs.current.get(id);

    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutRefs.current.delete(id);
    }

    setToasts((current) => current.filter((toast) => toast.id !== id));
  }

  function showToast(message, tone = "success") {
    nextToastIdRef.current += 1;
    const id = `toast-${nextToastIdRef.current}`;
    const nextToast = { id, message, tone };

    setToasts((current) => [...current, nextToast]);

    const timeoutId = setTimeout(() => {
      dismissToast(id);
    }, 4000);

    timeoutRefs.current.set(id, timeoutId);
  }

  const value = {
    success(message) {
      showToast(message, "success");
    },
    error(message) {
      showToast(message, "error");
    },
    info(message) {
      showToast(message, "info");
    },
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div style={stackStyle} aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{ ...toastStyle, ...toneStyles[toast.tone] }}
            role="status"
          >
            <p style={textStyle}>{toast.message}</p>
            <button
              type="button"
              style={closeButtonStyle}
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss notification"
            >
              x
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
