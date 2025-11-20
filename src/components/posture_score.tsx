import { useState, useEffect, useRef, useCallback } from "react";
import type { PostureAnalysis, PenaltyConfig } from "@/lib/posture_logic";
interface PostureScoreProps {
  analysis: PostureAnalysis;
  config: PenaltyConfig;
  onConfigChange: (config: PenaltyConfig) => void;
}

export default function PostureScore({
  analysis,
  config,
  onConfigChange,
}: PostureScoreProps) {
  const {
    score,
    neckAngle,
    shoulderAngle,
    shouldersEyesWidthRatio,
    neckLengthRatio,
    shoulderHeight,
    neckAnglePenalty,
    shoulderAnglePenalty,
    shouldersEyesWidthRatioPenalty,
    neckLengthPenalty,
    shoulderHeightPenalty,
  } = analysis;

  // Smoothed score for the progress bar (exponential smoothing)
  const [smoothedScore, setSmoothedScore] = useState(score);

  // Local config state for debounced updates
  const [localConfig, setLocalConfig] = useState<PenaltyConfig>(config);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Update local config when prop changes (e.g., from "Set Baseline" button)
  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  // Debounce config updates to parent (wait 800ms after user stops typing)
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      onConfigChange(localConfig);
    }, 800);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [localConfig, onConfigChange]);

  // Helper to remove leading zeros from input value
  const removeLeadingZeros = useCallback((value: string): string => {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? "0" : parsed.toString();
  }, []);

  useEffect(() => {
    // Exponential smoothing: gradually move towards target score
    // Higher smoothing factor = faster response (0.15 = smooth but responsive)
    const smoothingFactor = 0.15;

    const interval = setInterval(() => {
      setSmoothedScore((prevScore) => {
        const diff = score - prevScore;
        // If very close, snap to exact value to avoid endless tiny updates
        if (Math.abs(diff) < 0.5) {
          return score;
        }
        return prevScore + diff * smoothingFactor;
      });
    }, 50); // Update every 50ms for smooth animation

    return () => clearInterval(interval);
  }, [score]);

  // Use smoothed score for progress bar colors and display
  const displayScore = Math.round(smoothedScore);

  const color =
    displayScore > 80
      ? "text-green-600"
      : displayScore > 50
      ? "text-yellow-600"
      : "text-[#f73535]";

  const barColor =
    displayScore > 80
      ? "bg-green-500"
      : displayScore > 50
      ? "bg-yellow-500"
      : "bg-red-500";

  const handleBaseline = () => {
    const newConfig = {
      neckAnglePenaltyCalcConfig: {
        ...localConfig.neckAnglePenaltyCalcConfig,
        idealValue: Math.round(neckAngle),
      },
      shoulderAnglePenaltyCalcConfig: {
        ...localConfig.shoulderAnglePenaltyCalcConfig,
        idealValue: Math.round(shoulderAngle),
      },
      shouldersEyesWidthRatioPenaltyCalcConfig: {
        ...localConfig.shouldersEyesWidthRatioPenaltyCalcConfig,
        idealValue: Math.round(shouldersEyesWidthRatio * 100) / 100,
      },
      neckLengthPenaltyCalcConfig: {
        ...localConfig.neckLengthPenaltyCalcConfig,
        idealValue: Math.round(neckLengthRatio * 100) / 100,
      },
      shoulderHeightPenaltyCalcConfig: {
        ...localConfig.shoulderHeightPenaltyCalcConfig,
        idealValue: Math.round(shoulderHeight * 10) / 10, // Round to 1 decimal (already in percentage)
      },
    };
    setLocalConfig(newConfig);
    // Clear debounce timer and apply immediately for baseline
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    onConfigChange(newConfig);
  };

  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-2xl border-2 border-blue-900">
      <h3 className="text-lg font-bold text-blue-400 mb-2 uppercase tracking-wide">
        🚔 Posture Report
      </h3>
      <div className={`text-5xl font-bold text-center ${color}`}>
        {displayScore}
      </div>
      <div className="mt-3 h-3 bg-slate-700 rounded-full overflow-hidden border border-slate-600">
        <div
          className={`h-full transition-colors duration-300 ${barColor}`}
          style={{ width: `${smoothedScore}%` }}
        />
      </div>

      <button
        onClick={handleBaseline}
        className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-lg border border-blue-500"
      >
        📋 Set Baseline
      </button>

      <div className="mt-4 pt-4 border-t border-slate-600">
        <h4 className="text-sm font-bold text-blue-400 mb-3 uppercase tracking-wide">
          📊 Measurements
        </h4>
        <div className="grid grid-cols-[1fr_4.5rem_4.5rem_4.5rem] gap-2 items-center mb-2 text-xs text-slate-400">
          <span></span>
          <span className="text-center">Current</span>
          <span className="text-center">Target</span>
          <span className="text-center">+/-</span>
        </div>
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-[1fr_4.5rem_4.5rem_4.5rem] gap-2 items-center">
            <span className="text-slate-300">Neck Length:</span>
            <span className="font-mono font-semibold text-white text-center">
              {neckLengthRatio.toFixed(2)}
            </span>
            <input
              type="number"
              value={localConfig.neckLengthPenaltyCalcConfig.idealValue}
              onChange={(e) =>
                setLocalConfig({
                  ...localConfig,
                  neckLengthPenaltyCalcConfig: {
                    ...localConfig.neckLengthPenaltyCalcConfig,
                    idealValue: parseFloat(e.target.value) || 0,
                  },
                })
              }
              onBlur={(e) => {
                e.target.value = removeLeadingZeros(e.target.value);
              }}
              className="w-full px-1 py-0.5 border border-slate-600 bg-slate-700 text-white rounded text-xs text-center"
              step="0.01"
            />
            <input
              type="number"
              value={localConfig.neckLengthPenaltyCalcConfig.tolerance}
              onChange={(e) =>
                setLocalConfig({
                  ...localConfig,
                  neckLengthPenaltyCalcConfig: {
                    ...localConfig.neckLengthPenaltyCalcConfig,
                    tolerance: parseFloat(e.target.value) || 0,
                  },
                })
              }
              onBlur={(e) => {
                e.target.value = removeLeadingZeros(e.target.value);
              }}
              className="w-full px-1 py-0.5 border border-slate-600 bg-slate-700 text-white rounded text-xs text-center"
              step="0.01"
            />
          </div>
          <div className="grid grid-cols-[1fr_4.5rem_4.5rem_4.5rem] gap-2 items-center">
            <span className="text-slate-300">Shoulder Height:</span>
            <span className="font-mono font-semibold text-white text-center">
              {shoulderHeight.toFixed(1)}%
            </span>
            <input
              type="number"
              value={localConfig.shoulderHeightPenaltyCalcConfig.idealValue}
              onChange={(e) =>
                setLocalConfig({
                  ...localConfig,
                  shoulderHeightPenaltyCalcConfig: {
                    ...localConfig.shoulderHeightPenaltyCalcConfig,
                    idealValue: parseFloat(e.target.value) || 0,
                  },
                })
              }
              onBlur={(e) => {
                e.target.value = removeLeadingZeros(e.target.value);
              }}
              className="w-full px-1 py-0.5 border border-slate-600 bg-slate-700 text-white rounded text-xs text-center"
              step="1"
            />
            <input
              type="number"
              value={localConfig.shoulderHeightPenaltyCalcConfig.tolerance}
              onChange={(e) =>
                setLocalConfig({
                  ...localConfig,
                  shoulderHeightPenaltyCalcConfig: {
                    ...localConfig.shoulderHeightPenaltyCalcConfig,
                    tolerance: parseFloat(e.target.value) || 0,
                  },
                })
              }
              onBlur={(e) => {
                e.target.value = removeLeadingZeros(e.target.value);
              }}
              className="w-full px-1 py-0.5 border border-slate-600 bg-slate-700 text-white rounded text-xs text-center"
              step="0.1"
            />
          </div>
          <div className="grid grid-cols-[1fr_4.5rem_4.5rem_4.5rem] gap-2 items-center">
            <span className="text-slate-300">Neck Angle:</span>
            <span className="font-mono font-semibold text-white text-center">
              {neckAngle.toFixed(1)}°
            </span>
            <input
              type="number"
              value={localConfig.neckAnglePenaltyCalcConfig.idealValue}
              onChange={(e) =>
                setLocalConfig({
                  ...localConfig,
                  neckAnglePenaltyCalcConfig: {
                    ...localConfig.neckAnglePenaltyCalcConfig,
                    idealValue: parseFloat(e.target.value) || 0,
                  },
                })
              }
              onBlur={(e) => {
                e.target.value = removeLeadingZeros(e.target.value);
              }}
              className="w-full px-1 py-0.5 border border-slate-600 bg-slate-700 text-white rounded text-xs text-center"
              step="0.1"
            />
            <input
              type="number"
              value={localConfig.neckAnglePenaltyCalcConfig.tolerance}
              onChange={(e) =>
                setLocalConfig({
                  ...localConfig,
                  neckAnglePenaltyCalcConfig: {
                    ...localConfig.neckAnglePenaltyCalcConfig,
                    tolerance: parseFloat(e.target.value) || 0,
                  },
                })
              }
              onBlur={(e) => {
                e.target.value = removeLeadingZeros(e.target.value);
              }}
              className="w-full px-1 py-0.5 border border-slate-600 bg-slate-700 text-white rounded text-xs text-center"
              step="0.1"
            />
          </div>
          <div className="grid grid-cols-[1fr_4.5rem_4.5rem_4.5rem] gap-2 items-center">
            <span className="text-slate-300">Shoulder Tilt:</span>
            <span className="font-mono font-semibold text-white text-center">
              {shoulderAngle.toFixed(1)}°
            </span>
            <input
              type="number"
              value={localConfig.shoulderAnglePenaltyCalcConfig.idealValue}
              onChange={(e) =>
                setLocalConfig({
                  ...localConfig,
                  shoulderAnglePenaltyCalcConfig: {
                    ...localConfig.shoulderAnglePenaltyCalcConfig,
                    idealValue: parseFloat(e.target.value) || 0,
                  },
                })
              }
              onBlur={(e) => {
                e.target.value = removeLeadingZeros(e.target.value);
              }}
              className="w-full px-1 py-0.5 border border-slate-600 bg-slate-700 text-white rounded text-xs text-center"
              step="0.1"
            />
            <input
              type="number"
              value={localConfig.shoulderAnglePenaltyCalcConfig.tolerance}
              onChange={(e) =>
                setLocalConfig({
                  ...localConfig,
                  shoulderAnglePenaltyCalcConfig: {
                    ...localConfig.shoulderAnglePenaltyCalcConfig,
                    tolerance: parseFloat(e.target.value) || 0,
                  },
                })
              }
              onBlur={(e) => {
                e.target.value = removeLeadingZeros(e.target.value);
              }}
              className="w-full px-1 py-0.5 border border-slate-600 bg-slate-700 text-white rounded text-xs text-center"
              step="0.1"
            />
          </div>
          <div className="grid grid-cols-[1fr_4.5rem_4.5rem_4.5rem] gap-2 items-center">
            <span className="text-slate-300">Neck Tilt Ratio:</span>
            <span className="font-mono font-semibold text-white text-center">
              {shouldersEyesWidthRatio.toFixed(2)}
            </span>
            <input
              type="number"
              value={
                localConfig.shouldersEyesWidthRatioPenaltyCalcConfig.idealValue
              }
              onChange={(e) =>
                setLocalConfig({
                  ...localConfig,
                  shouldersEyesWidthRatioPenaltyCalcConfig: {
                    ...localConfig.shouldersEyesWidthRatioPenaltyCalcConfig,
                    idealValue: parseFloat(e.target.value) || 0,
                  },
                })
              }
              onBlur={(e) => {
                e.target.value = removeLeadingZeros(e.target.value);
              }}
              className="w-full px-1 py-0.5 border border-slate-600 bg-slate-700 text-white rounded text-xs text-center"
              step="0.1"
            />
            <input
              type="number"
              value={
                localConfig.shouldersEyesWidthRatioPenaltyCalcConfig.tolerance
              }
              onChange={(e) =>
                setLocalConfig({
                  ...localConfig,
                  shouldersEyesWidthRatioPenaltyCalcConfig: {
                    ...localConfig.shouldersEyesWidthRatioPenaltyCalcConfig,
                    tolerance: parseFloat(e.target.value) || 0,
                  },
                })
              }
              onBlur={(e) => {
                e.target.value = removeLeadingZeros(e.target.value);
              }}
              className="w-full px-1 py-0.5 border border-slate-600 bg-slate-700 text-white rounded text-xs text-center"
              step="0.1"
            />
          </div>
        </div>

        <h4 className="text-sm font-bold text-blue-400 mb-2 mt-3 pt-3 border-t border-slate-600 uppercase tracking-wide">
          ⚠️ Penalties
        </h4>
        <div className="grid grid-cols-[1fr_4.5rem_4.5rem] gap-2 items-center mb-2 text-xs text-slate-400">
          <span></span>
          <span className="text-center">Mult</span>
          <span className="text-center">Penalty</span>
        </div>
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-[1fr_4.5rem_4.5rem] gap-2 items-center">
            <span className="text-slate-300">Neck Length:</span>
            <input
              type="number"
              value={localConfig.neckLengthPenaltyCalcConfig.penaltyFactor}
              onChange={(e) =>
                setLocalConfig({
                  ...localConfig,
                  neckLengthPenaltyCalcConfig: {
                    ...localConfig.neckLengthPenaltyCalcConfig,
                    penaltyFactor: parseFloat(e.target.value) || 0,
                  },
                })
              }
              onBlur={(e) => {
                e.target.value = removeLeadingZeros(e.target.value);
              }}
              className="w-full px-1 py-0.5 border border-slate-600 bg-slate-700 text-white rounded text-xs text-center"
              step="10"
            />
            <span className="font-mono font-semibold text-[#f73535] text-center">
              -{neckLengthPenalty.toFixed(1)}
            </span>
          </div>
          <div className="grid grid-cols-[1fr_4.5rem_4.5rem] gap-2 items-center">
            <span className="text-slate-300">Shoulder Height:</span>
            <input
              type="number"
              value={localConfig.shoulderHeightPenaltyCalcConfig.penaltyFactor}
              onChange={(e) =>
                setLocalConfig({
                  ...localConfig,
                  shoulderHeightPenaltyCalcConfig: {
                    ...localConfig.shoulderHeightPenaltyCalcConfig,
                    penaltyFactor: parseFloat(e.target.value) || 0,
                  },
                })
              }
              onBlur={(e) => {
                e.target.value = removeLeadingZeros(e.target.value);
              }}
              className="w-full px-1 py-0.5 border border-slate-600 bg-slate-700 text-white rounded text-xs text-center"
              step="1"
            />
            <span className="font-mono font-semibold text-[#f73535] text-center">
              -{shoulderHeightPenalty.toFixed(1)}
            </span>
          </div>
          <div className="grid grid-cols-[1fr_4.5rem_4.5rem] gap-2 items-center">
            <span className="text-slate-300">Neck Angle:</span>
            <input
              type="number"
              value={localConfig.neckAnglePenaltyCalcConfig.penaltyFactor}
              onChange={(e) =>
                setLocalConfig({
                  ...localConfig,
                  neckAnglePenaltyCalcConfig: {
                    ...localConfig.neckAnglePenaltyCalcConfig,
                    penaltyFactor: parseFloat(e.target.value) || 0,
                  },
                })
              }
              onBlur={(e) => {
                e.target.value = removeLeadingZeros(e.target.value);
              }}
              className="w-full px-1 py-0.5 border border-slate-600 bg-slate-700 text-white rounded text-xs text-center"
              step="0.1"
            />
            <span className="font-mono font-semibold text-[#f73535] text-center">
              -{neckAnglePenalty.toFixed(1)}
            </span>
          </div>
          <div className="grid grid-cols-[1fr_4.5rem_4.5rem] gap-2 items-center">
            <span className="text-slate-300">Shoulder Tilt:</span>
            <input
              type="number"
              value={localConfig.shoulderAnglePenaltyCalcConfig.penaltyFactor}
              onChange={(e) =>
                setLocalConfig({
                  ...localConfig,
                  shoulderAnglePenaltyCalcConfig: {
                    ...localConfig.shoulderAnglePenaltyCalcConfig,
                    penaltyFactor: parseFloat(e.target.value) || 0,
                  },
                })
              }
              onBlur={(e) => {
                e.target.value = removeLeadingZeros(e.target.value);
              }}
              className="w-full px-1 py-0.5 border border-slate-600 bg-slate-700 text-white rounded text-xs text-center"
              step="0.1"
            />
            <span className="font-mono font-semibold text-[#f73535] text-center">
              -{shoulderAnglePenalty.toFixed(1)}
            </span>
          </div>
          <div className="grid grid-cols-[1fr_4.5rem_4.5rem] gap-2 items-center">
            <span className="text-slate-300">Neck Tilt Ratio:</span>
            <input
              type="number"
              value={
                localConfig.shouldersEyesWidthRatioPenaltyCalcConfig
                  .penaltyFactor
              }
              onChange={(e) =>
                setLocalConfig({
                  ...localConfig,
                  shouldersEyesWidthRatioPenaltyCalcConfig: {
                    ...localConfig.shouldersEyesWidthRatioPenaltyCalcConfig,
                    penaltyFactor: parseFloat(e.target.value) || 0,
                  },
                })
              }
              onBlur={(e) => {
                e.target.value = removeLeadingZeros(e.target.value);
              }}
              className="w-full px-1 py-0.5 border border-slate-600 bg-slate-700 text-white rounded text-xs text-center"
              step="1"
            />
            <span className="font-mono font-semibold text-[#f73535] text-center">
              -{shouldersEyesWidthRatioPenalty.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Privacy and Open Source Info */}
        <div className="mt-4 pt-4 border-t border-slate-600">
          <div className="text-sm text-slate-300 space-y-1">
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
      </div>
    </div>
  );
}
