"use client";

import { useState, useEffect, useRef } from "react";

interface SettingsPanelProps {
  isMonitoring: boolean;
  onToggle: () => void;
  sirenEnabled: boolean;
  onSirenToggle: () => void;
  notificationsEnabled: boolean;
  onNotificationsToggle: (enabled: boolean) => void;
  isAlarmPlaying: boolean;
}

export default function SettingsPanel({
  isMonitoring,
  onToggle,
  sirenEnabled,
  onSirenToggle,
  notificationsEnabled,
  onNotificationsToggle,
  isAlarmPlaying,
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

  // Timer state - tracks accumulated time and pause time
  const [accumulatedSeconds, setAccumulatedSeconds] = useState(0);
  const [currentSeconds, setCurrentSeconds] = useState(0);
  const sessionStartTimeRef = useRef<number | null>(null);
  const pauseStartTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousMonitoringRef = useRef(isMonitoring);

  // Handle monitoring start/stop (resets timer on start)
  useEffect(() => {
    if (isMonitoring && !previousMonitoringRef.current) {
      // Monitoring just started - reset everything
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAccumulatedSeconds(0);
      setCurrentSeconds(0);
      sessionStartTimeRef.current = Date.now();
      pauseStartTimeRef.current = null;
    } else if (!isMonitoring && previousMonitoringRef.current) {
      // Monitoring just stopped - clear session
      sessionStartTimeRef.current = null;
      pauseStartTimeRef.current = null;
    }
    previousMonitoringRef.current = isMonitoring;
  }, [isMonitoring]);

  // Handle alarm state changes (pause/resume timer)
  useEffect(() => {
    if (isMonitoring) {
      if (isAlarmPlaying) {
        // Alarm just started - pause timer and record pause time
        if (sessionStartTimeRef.current && !pauseStartTimeRef.current) {
          const elapsed = Math.floor(
            (Date.now() - sessionStartTimeRef.current) / 1000
          );
          setAccumulatedSeconds(elapsed);
          pauseStartTimeRef.current = Date.now();
        }
      } else {
        // Alarm stopped or not playing - resume timer
        if (pauseStartTimeRef.current) {
          // We were paused, now resuming
          sessionStartTimeRef.current = Date.now();
          pauseStartTimeRef.current = null;
        } else if (!sessionStartTimeRef.current) {
          // First time starting (shouldn't happen, but handle it)
          sessionStartTimeRef.current = Date.now();
        }
      }
    }
  }, [isMonitoring, isAlarmPlaying]);

  // Update timer display
  useEffect(() => {
    if (isMonitoring && !isAlarmPlaying && sessionStartTimeRef.current) {
      // Timer is running - update display every second
      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor(
          (Date.now() - sessionStartTimeRef.current!) / 1000
        );
        setCurrentSeconds(accumulatedSeconds + elapsed);
      }, 100); // Update more frequently for smooth display

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    } else if (pauseStartTimeRef.current) {
      // Timer is paused - keep showing accumulated time
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentSeconds(accumulatedSeconds);
    }
  }, [isMonitoring, isAlarmPlaying, accumulatedSeconds]);

  // Format time as HH:MM:SS or MM:SS
  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

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

      <div className="border-t border-slate-600 pt-4">
        <div className="grid grid-cols-2 gap-x-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={sirenEnabled}
                onChange={onSirenToggle}
                className="w-5 h-5 rounded border-2 border-slate-400 bg-slate-600 checked:bg-blue-600 checked:border-blue-500 cursor-pointer"
              />
              <span className="text-slate-200 font-medium">Alarm Enabled</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={handleNotificationToggle}
                className="w-5 h-5 rounded border-2 border-slate-400 bg-slate-600 checked:bg-blue-600 checked:border-blue-500 cursor-pointer transition-colors"
              />
              <span className="text-slate-200 font-medium">
                Notifications Enabled
              </span>
            </label>
          </div>

          <div className="flex flex-col items-center justify-center">
            <div className="bg-slate-900 border-2 border-blue-600 rounded-lg px-4 py-2 shadow-inner">
              <div className="font-mono text-2xl font-bold text-blue-300 tracking-wider tabular-nums">
                {formatTime(currentSeconds)}
              </div>
            </div>
            <div className="text-xs text-blue-400 font-bold uppercase tracking-wide mt-2">
              Patrol Duration
            </div>
          </div>
        </div>
        {permissionStatus === "denied" && (
          <p className="text-xs text-red-400 mt-2">
            Browser notifications are blocked. Please enable them in your
            browser settings.
          </p>
        )}
      </div>
    </div>
  );
}
