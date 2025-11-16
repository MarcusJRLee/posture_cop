"use client";

import { useRef, useEffect } from "react";
import {
  startPoseDetection,
  stopPoseDetection,
  DrawingUtils,
} from "@/lib/mediapipe";
import {
  calculateNeckAngle,
  calculateShoulderAngle,
  calculateWidthRatio,
  calculateNeckLengthRatio,
  getPostureAnalysis,
  type PostureAnalysis,
  DEFAULT_PENALTY_CONFIG,
} from "@/lib/posture_logic";
import {
  PoseLandmarker,
  type NormalizedLandmark,
} from "@mediapipe/tasks-vision";

interface CameraFeedProps {
  isActive: boolean;
  onPostureUpdate: (analysis: PostureAnalysis) => void;
  onAlert: (message: string) => void;
}

interface PoseResults {
  image: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement;
  poseLandmarks?: NormalizedLandmark[];
}

export default function CameraFeed({
  isActive,
  onPostureUpdate,
  onAlert,
}: CameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
        const neckAngle = calculateNeckAngle(results.poseLandmarks);
        const shoulderAngle = calculateShoulderAngle(results.poseLandmarks);
        const widthRatio = calculateWidthRatio(results.poseLandmarks);
        const neckLengthRatio = calculateNeckLengthRatio(results.poseLandmarks);
        const analysis = getPostureAnalysis(
          neckAngle,
          shoulderAngle,
          widthRatio,
          neckLengthRatio,
          DEFAULT_PENALTY_CONFIG
        );

        onPostureUpdate(analysis);

        if (analysis.score < 70) {
          onAlert("🚨 Straighten your back!");
        }

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
  }, [isActive, onPostureUpdate, onAlert]);

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
    </div>
  );
}
