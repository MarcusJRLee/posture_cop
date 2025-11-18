"use client";

import { useState } from "react";

interface SettingsPanelProps {
  isMonitoring: boolean;
  onToggle: () => void;
  sirenEnabled: boolean;
  onSirenToggle: () => void;
  notificationsEnabled: boolean;
  onNotificationsToggle: (enabled: boolean) => void;
}

export default function SettingsPanel({
  isMonitoring,
  onToggle,
  sirenEnabled,
  onSirenToggle,
  notificationsEnabled,
  onNotificationsToggle,
}: SettingsPanelProps) {
  // Initialize permission status using lazy initialization
  const [permissionStatus, setPermissionStatus] = useState<
    "default" | "granted" | "denied"
  >(() => {
    // Check if Notification API is supported
    if (typeof window !== "undefined" && "Notification" in window) {
      return Notification.permission;
    }
    return "default";
  });

  const handleNotificationToggle = async () => {
    if (!notificationsEnabled && permissionStatus === "default") {
      // First time enabling - request permission
      try {
        const permission = await Notification.requestPermission();
        setPermissionStatus(permission);
        if (permission === "granted") {
          onNotificationsToggle(true);
        }
      } catch (error) {
        console.error("Error requesting notification permission:", error);
      }
    } else if (!notificationsEnabled && permissionStatus === "granted") {
      // Permission already granted, just enable
      onNotificationsToggle(true);
    } else {
      // Disable notifications
      onNotificationsToggle(false);
    }
  };

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

      <div className="border-t border-slate-600 pt-4 space-y-3">
        <label className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors">
          <input
            type="checkbox"
            checked={sirenEnabled}
            onChange={onSirenToggle}
            className="w-5 h-5 rounded border-2 border-slate-400 bg-slate-600 checked:bg-blue-600 checked:border-blue-500 cursor-pointer"
          />
          <span className="text-slate-200 font-medium flex-1">
            Alarm Enabled
          </span>
        </label>

        <label className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors group">
          <input
            type="checkbox"
            checked={notificationsEnabled}
            onChange={handleNotificationToggle}
            className="w-5 h-5 rounded border-2 border-slate-400 bg-slate-600 checked:bg-blue-600 checked:border-blue-500 cursor-pointer transition-colors"
          />
          <span className="text-slate-200 font-medium flex-1">
            Enable Browser Notifications
          </span>
        </label>
        {permissionStatus === "denied" && (
          <p className="text-xs text-red-400 ml-8">
            Browser notifications are blocked. Please enable them in your
            browser settings.
          </p>
        )}
      </div>

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
