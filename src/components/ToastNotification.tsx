import { useEffect } from "react";
import { useAppContext } from "@/context/AppContext";

const ToastNotification = () => {
  const { toast, clearToast } = useAppContext();

  useEffect(() => {
    if (toast) {
      const t = setTimeout(clearToast, 3500);
      return () => clearTimeout(t);
    }
  }, [toast, clearToast]);

  if (!toast) return null;

  const colorMap: Record<string, string> = {
    success: "border-l-emerald",
    error: "border-l-ruby",
    warning: "border-l-primary",
    info: "border-l-sapphire",
  };

  const iconMap: Record<string, string> = {
    success: "✓",
    error: "✕",
    warning: "⚠️",
    info: "ℹ",
  };

  return (
    <div className={`fixed bottom-6 right-6 z-[2000] bg-slate text-pearl-dark py-3.5 px-5 rounded-lg text-sm font-medium shadow-lg fade-up flex items-center gap-2.5 max-w-[360px] border-l-4 ${colorMap[toast.type] || colorMap.info}`}>
      <span>{iconMap[toast.type] || "ℹ"}</span>
      <span className="flex-1">{toast.message}</span>
      <button onClick={clearToast} className="ml-auto bg-transparent border-none text-pearl-dark cursor-pointer opacity-70 hover:opacity-100">✕</button>
    </div>
  );
};

export default ToastNotification;
