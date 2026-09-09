import React, { useState } from "react";
import { Eye, EyeOff, Key } from "lucide-react";

export const ApiKeyMasker = ({ apiKey }) => {
  const [showKey, setShowKey] = useState(false);

  const maskedKey = apiKey ? `${apiKey.substring(0, 5)}••••••••••••` : "sk_••••••••••••";

  return (
    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
      <div className="flex items-center gap-2 font-mono text-slate-300">
        <Key className="w-3.5 h-3.5 text-purple-400 shrink-0" />
        <span>API Key:</span>
        <span className="text-purple-300 font-semibold">{showKey ? apiKey : maskedKey}</span>
      </div>

      <button
        onClick={() => setShowKey(!showKey)}
        className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        title={showKey ? "Hide API key" : "Show API key"}
      >
        {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
};
