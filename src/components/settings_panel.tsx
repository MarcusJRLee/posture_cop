interface SettingsPanelProps {
  isMonitoring: boolean;
  onToggle: () => void;
}

export default function SettingsPanel({
  isMonitoring,
  onToggle,
}: SettingsPanelProps) {
  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-2xl border-2 border-blue-900 space-y-4">
      <button
        onClick={onToggle}
        className={`w-full py-3 rounded-lg font-bold transition-all shadow-lg uppercase tracking-wide ${
          isMonitoring
            ? "bg-red-600 hover:bg-red-700 text-white border-2 border-red-500"
            : "bg-green-600 hover:bg-green-700 text-white border-2 border-green-500"
        }`}
      >
        {isMonitoring ? "🛑 Stop Patrol" : "🚨 Start Patrol"}
      </button>

      <div className="text-sm text-slate-300 space-y-2 border-t border-slate-600 pt-4">
        <p className="flex items-center gap-2">
          <span className="text-green-400">✓</span> 100% Browser-Based
        </p>
        <p className="flex items-center gap-2">
          <span className="text-green-400">✓</span> Privacy Protected
        </p>
        <p className="flex items-center gap-2">
          <span className="text-green-400">✓</span> Open Source
        </p>
      </div>
    </div>
  );
}
