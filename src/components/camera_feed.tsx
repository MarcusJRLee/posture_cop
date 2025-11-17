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
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const [warningCountdown, setWarningCountdown] = useState<number | null>(null);
  const [recoveryCountdown, setRecoveryCountdown] = useState<number | null>(null);
  const [isAlarmPlaying, setIsAlarmPlaying] = useState<boolean>(false);
  const [currentScore, setCurrentScore] = useState<number>(100);

  // Create siren sound using Web Audio API
  const startSiren = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    const audioContext = audioContextRef.current;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);

    // Create siren effect by modulating frequency
    const lfo = audioContext.createOscillator();
    const lfoGain = audioContext.createGain();
    lfo.frequency.setValueAtTime(2, audioContext.currentTime); // 2 Hz modulation
    lfoGain.gain.setValueAtTime(400, audioContext.currentTime); // Frequency deviation
    lfo.connect(lfoGain);
    lfoGain.connect(oscillator.frequency);
    lfo.start();

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.start();

    oscillatorRef.current = oscillator;
    gainNodeRef.current = gainNode;
  };

  const stopSiren = () => {
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
      oscillatorRef.current = null;
    }
    if (gainNodeRef.current) {
      gainNodeRef.current.disconnect();
      gainNodeRef.current = null;
    }
  };

  // Timer effect for warning countdown (score < 80)
  useEffect(() => {
    if (currentScore < 80 && warningCountdown === null && !isAlarmPlaying) {
      // Start warning countdown from 5 seconds
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWarningCountdown(5);
      setRecoveryCountdown(null);
    } else if (currentScore >= 90 && !isAlarmPlaying) {
      // Score is good, clear warning countdown
      setWarningCountdown(null);
    } else if (currentScore >= 90 && isAlarmPlaying && recoveryCountdown === null) {
      // Start recovery countdown from 2 seconds
      setRecoveryCountdown(2);
    } else if (currentScore < 90 && isAlarmPlaying) {
      // Score dropped again, clear recovery countdown
      setRecoveryCountdown(null);
    }
  }, [currentScore, warningCountdown, isAlarmPlaying, recoveryCountdown]);

  // Countdown interval effect
  useEffect(() => {
    if (warningCountdown !== null && warningCountdown > 0) {
      const timer = setTimeout(() => {
        setWarningCountdown(warningCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (warningCountdown === 0) {
      // Trigger alarm
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsAlarmPlaying(true);
      setWarningCountdown(null);
      startSiren();
    }
  }, [warningCountdown]);

  // Recovery countdown interval effect
  useEffect(() => {
    if (recoveryCountdown !== null && recoveryCountdown > 0) {
      const timer = setTimeout(() => {
        setRecoveryCountdown(recoveryCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (recoveryCountdown === 0) {
      // Stop alarm
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsAlarmPlaying(false);
      setRecoveryCountdown(null);
      stopSiren();
    }
  }, [recoveryCountdown]);

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

  const showCountdown = warningCountdown !== null || recoveryCountdown !== null || isAlarmPlaying;
  const countdownMessage = warningCountdown !== null
    ? `⚠️ Fix posture in ${warningCountdown}s`
    : recoveryCountdown !== null
    ? `✅ Hold steady... ${recoveryCountdown}s`
    : isAlarmPlaying
    ? "🚨 STRAIGHTEN YOUR BACK!"
    : "";

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
              onClose={() => {
                setWarningCountdown(null);
                setRecoveryCountdown(null);
                setIsAlarmPlaying(false);
                stopSiren();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
