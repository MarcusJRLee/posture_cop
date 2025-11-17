"use client";

import { useRef, useEffect, useState } from "react";
import {
  startPoseDetection,
  stopPoseDetection,
  DrawingUtils,
} from "@/lib/mediapipe";
import {
  getPostureAnalysis,
  type PostureAnalysis,
  type PenaltyConfig,
} from "@/lib/posture_logic";
import {
  PoseLandmarker,
  type NormalizedLandmark,
} from "@mediapipe/tasks-vision";
import AlertPopup from "@/components/alert_popup";
import { usePostureAlarm } from "@/hooks/use_posture_alarm";

interface CameraFeedProps {
  isActive: boolean;
  penaltyConfig: PenaltyConfig;
  onPostureUpdate: (analysis: PostureAnalysis) => void;
}

interface PoseResults {
  image: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement;
  poseLandmarks?: NormalizedLandmark[];
}

export default function CameraFeed({
  isActive,
  penaltyConfig,
  onPostureUpdate,
}: CameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentScore, setCurrentScore] = useState<number>(100);

  const {
    warningCountdown,
    recoveryCountdown,
    isAlarmPlaying,
    showCountdown,
    countdownMessage,
    dismissAlarm,
  } = usePostureAlarm(currentScore);

  useEffect(() => {
    if (!isActive || !videoRef.current) return;

    const onResults = (results: PoseResults) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

      if (results.poseLandmarks) {
        const analysis = getPostureAnalysis(
          results.poseLandmarks,
          penaltyConfig
        );

        onPostureUpdate(analysis);
        setCurrentScore(analysis.score);

        // Draw skeleton using new DrawingUtils API
        const drawingUtils = new DrawingUtils(ctx);

        // Draw connectors
        drawingUtils.drawConnectors(
          results.poseLandmarks,
          PoseLandmarker.POSE_CONNECTIONS,
          { color: "#00ff00", lineWidth: 4 }
        );

        // Draw landmarks
        drawingUtils.drawLandmarks(results.poseLandmarks, {
          color: "#ff0000",
          lineWidth: 2,
        });
      }
      ctx.restore();
    };

    startPoseDetection(videoRef.current, onResults);

    return () => stopPoseDetection();
  }, [isActive, penaltyConfig, onPostureUpdate]);

  return (
    <div className="relative bg-black rounded-xl overflow-hidden shadow-2xl">
      <video
        ref={videoRef}
        className="w-full h-auto hidden"
        autoPlay
        playsInline
      />
      <canvas ref={canvasRef} width={640} height={480} className="w-full" />
      {!isActive && (
        <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center">
          <p className="text-white text-xl">
            Click &ldquo;Start Monitoring&rdquo; to begin
          </p>
        </div>
      )}
      {showCountdown && (
        <div className="absolute inset-x-0 top-[75%] flex justify-center pointer-events-none z-10">
          <div className="pointer-events-auto">
            <AlertPopup
              message={countdownMessage}
              countdown={warningCountdown ?? recoveryCountdown ?? null}
              isAlarmActive={isAlarmPlaying}
              onClose={dismissAlarm}
            />
          </div>
        </div>
      )}
    </div>
  );
}
