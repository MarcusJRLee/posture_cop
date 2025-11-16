interface SettingsPanelProps {
  isMonitoring: boolean;
  onToggle: () => void;
}

export default function SettingsPanel({ isMonitoring, onToggle }: SettingsPanelProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg space-y-4">
      <button
        onClick={onToggle}
        className={`w-full py-3 rounded-lg font-semibold transition-all ${
          isMonitoring
            ? "bg-red-500 hover:bg-red-600 text-white"
            : "bg-emerald-500 hover:bg-emerald-600 text-white"
        }`}
      >
        {isMonitoring ? "Stop Monitoring" : "Start Monitoring"}
      </button>

      <div className="text-sm text-slate-600 space-y-1">
        <p>✓ Runs 100% in your browser</p>
        <p>✓ No video uploaded</p>
        <p>✓ Free & open-source</p>
      </div>
    </div>
  );
}
