"use client";

import { useState } from "react";
import CameraFeed from "@/components/camera_feed";
import PostureScore from "@/components/posture_score";
import SettingsPanel from "@/components/settings_panel";
import CopMascot from "@/components/cop_mascot";
import {
  DEFAULT_POSTURE_ANALYSIS,
  type PostureAnalysis,
  DEFAULT_PENALTY_CONFIG,
  type PenaltyConfig,
} from "@/lib/posture_logic";

/** The main component for the home page. */
export default function Home() {
  const [monitoring, setMonitoring] = useState<boolean>(false);
  const [postureAnalysis, setPostureAnalysis] = useState<PostureAnalysis>(
    DEFAULT_POSTURE_ANALYSIS
  );
  const [penaltyConfig, setPenaltyConfig] =
    useState<PenaltyConfig>(DEFAULT_PENALTY_CONFIG);
  const [sirenEnabled, setSirenEnabled] = useState<boolean>(true);
  // Load notification preference from localStorage on mount using lazy initialization
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(
    () => {
      if (typeof window === "undefined") return false;
      const stored = localStorage.getItem("postureCopNotifications");
      return stored === "true";
    }
  );
  const [isAlarmPlaying, setIsAlarmPlaying] = useState<boolean>(false);

  // Save notification preference to localStorage when it changes
  const handleNotificationsToggle = (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    localStorage.setItem("postureCopNotifications", String(enabled));
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-800 via-slate-700 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8 relative">
          {/* Police Siren Background */}
          <div className="absolute inset-0 -mx-4 overflow-hidden rounded-xl z-2">
            <div className="absolute inset-0 bg-linear-to-r from-blue-600 via-transparent to-red-600 opacity-30 animate-pulse"></div>
            <div className="absolute left-0 top-0 bottom-0 w-1/3 bg-linear-to-r from-blue-500 to-transparent opacity-40"></div>
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-linear-to-l from-red-500 to-transparent opacity-40"></div>
          </div>

          {/* Content */}
          <div className="flex items-center justify-center">
            <CopMascot />
            <div className="relative py-6">
              <div className="flex items-center justify-center gap-4 mb-3">
                <h1 className="text-5xl font-bold text-white drop-shadow-lg tracking-tight">
                  Posture Cop
                </h1>
              </div>
              <p className="text-blue-100 text-lg font-semibold drop-shadow-md whitespace-nowrap">
                🚨 Keeping Your Posture in Check 🚨
              </p>
            </div>
            <CopMascot reflect />
          </div>
        </header>

        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <CameraFeed
              isActive={monitoring}
              penaltyConfig={penaltyConfig}
              onPostureUpdate={setPostureAnalysis}
              sirenEnabled={sirenEnabled}
              notificationsEnabled={notificationsEnabled}
              onAlarmStateChange={setIsAlarmPlaying}
            />
            <SettingsPanel
              isMonitoring={monitoring}
              onToggle={() => setMonitoring(!monitoring)}
              sirenEnabled={sirenEnabled}
              onSirenToggle={() => setSirenEnabled(!sirenEnabled)}
              notificationsEnabled={notificationsEnabled}
              onNotificationsToggle={handleNotificationsToggle}
              isAlarmPlaying={isAlarmPlaying}
            />
          </div>

          <div className="lg:col-span-2">
            <PostureScore
              analysis={postureAnalysis}
              config={penaltyConfig}
              onConfigChange={setPenaltyConfig}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
