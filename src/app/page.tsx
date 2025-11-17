"use client";

import { useState } from "react";
import CameraFeed from "@/components/camera_feed";
import PostureScore from "@/components/posture_score";
import AlertPopup from "@/components/alert_popup";
import SettingsPanel from "@/components/settings_panel";
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
  const [alert, setAlert] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            Posture Cop
          </h1>
          <p className="text-slate-600">
            Real-time posture monitoring in your browser
          </p>
        </header>

        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <CameraFeed
              isActive={monitoring}
              penaltyConfig={penaltyConfig}
              onPostureUpdate={setPostureAnalysis}
              onAlert={setAlert}
            />
          </div>

          <div className="lg:col-span-2 space-y-6">
            <PostureScore
              analysis={postureAnalysis}
              config={penaltyConfig}
              onConfigChange={setPenaltyConfig}
            />
            <SettingsPanel
              isMonitoring={monitoring}
              onToggle={() => setMonitoring(!monitoring)}
            />
          </div>
        </div>

        {alert && <AlertPopup message={alert} onClose={() => setAlert(null)} />}
      </div>
    </div>
  );
}
