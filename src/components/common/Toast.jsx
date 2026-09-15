import React from "react";
import { useApp } from "../../context/AppContext";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

export const ToastContainer = () => {
  const { toasts, removeToast } = useApp();

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let Icon = Info;
        let border = "border-blue-500/40 bg-slate-900/95 text-blue-300";
        let titleColor = "text-blue-100";
        let messageColor = "text-blue-200/80";

        if (toast.type === "success") {
          Icon = CheckCircle2;
          border = "border-emerald-500/50 bg-slate-900/95 text-emerald-300";
          titleColor = "text-emerald-400";
          messageColor = "text-emerald-200/80";
        } else if (toast.type === "warning") {
          Icon = AlertTriangle;
          border = "border-amber-500/50 bg-slate-900/95 text-amber-300";
          titleColor = "text-amber-400";
          messageColor = "text-amber-200/80";
        } else if (toast.type === "error") {
          Icon = AlertTriangle;
          border = "border-red-500/50 bg-slate-900/95 text-red-300";
          titleColor = "text-red-400";
          messageColor = "text-red-200/80";
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-2xl border shadow-2xl backdrop-blur-md flex items-start gap-3 transform transition-all duration-300 animate-in slide-in-from-bottom-3 ${border}`}
          >
            <Icon className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-0.5">
              <p className={`text-xs font-bold ${titleColor}`}>{toast.title}</p>
              <p className={`text-xs leading-snug ${messageColor}`}>{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
