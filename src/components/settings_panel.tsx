interface SettingsPanelProps {
  isMonitoring: boolean;
  onToggle: () => void;
  sirenEnabled: boolean;
  onSirenToggle: () => void;
}

export default function SettingsPanel({
  isMonitoring,
  onToggle,
  sirenEnabled,
  onSirenToggle,
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

      <label className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors">
        <input
          type="checkbox"
          checked={sirenEnabled}
          onChange={onSirenToggle}
          className="w-5 h-5 rounded border-2 border-slate-400 bg-slate-600 checked:bg-blue-600 checked:border-blue-500 cursor-pointer"
        />
        <span className="text-slate-200 font-medium flex-1">
          Enable Siren Alarm
        </span>
      </label>

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
