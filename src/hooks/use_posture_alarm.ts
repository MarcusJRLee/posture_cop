import { useRef, useEffect, useState } from "react";

interface PostureAlarmState {
  warningCountdown: number | null;
  recoveryCountdown: number | null;
  isAlarmPlaying: boolean;
  showCountdown: boolean;
  countdownMessage: string;
  dismissAlarm: () => void;
}

/**
 * Custom hook that manages posture alarm logic based on posture score.
 *
 * When score drops below 80, starts a 5-second warning countdown.
 * If score doesn't improve, triggers an alarm siren.
 * When score recovers to 90+, starts a 2-second recovery countdown before stopping the alarm.
 *
 * @param currentScore - The current posture score (0-100)
 * @param notificationsEnabled - Whether to show browser notifications when alarm triggers
 */
export function usePostureAlarm(
  currentScore: number,
  notificationsEnabled: boolean = false
): PostureAlarmState {
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const [warningCountdown, setWarningCountdown] = useState<number | null>(null);
  const [recoveryCountdown, setRecoveryCountdown] = useState<number | null>(null);
  const [isAlarmPlaying, setIsAlarmPlaying] = useState<boolean>(false);

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

  const dismissAlarm = () => {
    setWarningCountdown(null);
    setRecoveryCountdown(null);
    setIsAlarmPlaying(false);
    stopSiren();
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

      // Show browser notification if enabled and permission granted
      if (
        notificationsEnabled &&
        typeof window !== "undefined" &&
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        new Notification("🚨 Posture Cop Alert!", {
          body: "Your posture needs attention! Straighten your back now!",
          icon: "/favicon.ico",
          tag: "posture-alert",
          requireInteraction: false,
        });
      }
    }
  }, [warningCountdown, notificationsEnabled]);

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSiren();
    };
  }, []);

  const showCountdown = warningCountdown !== null || recoveryCountdown !== null || isAlarmPlaying;
  const countdownMessage = warningCountdown !== null
    ? `⚠️ Fix posture in ${warningCountdown}s`
    : recoveryCountdown !== null
    ? `✅ Hold steady... ${recoveryCountdown}s`
    : isAlarmPlaying
    ? "🚨 STRAIGHTEN YOUR BACK!"
    : "";

  return {
    warningCountdown,
    recoveryCountdown,
    isAlarmPlaying,
    showCountdown,
    countdownMessage,
    dismissAlarm,
  };
}
