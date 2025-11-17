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

  const color =
    score > 80
      ? "text-green-600"
      : score > 50
      ? "text-yellow-600"
      : "text-red-600";

  const handleBaseline = () => {
    onConfigChange({
      neckAnglePenaltyCalcConfig: {
        ...config.neckAnglePenaltyCalcConfig,
        idealValue: Math.round(neckAngle),
      },
      shoulderAnglePenaltyCalcConfig: {
        ...config.shoulderAnglePenaltyCalcConfig,
        idealValue: Math.round(shoulderAngle),
      },
      shouldersEyesWidthRatioPenaltyCalcConfig: {
        ...config.shouldersEyesWidthRatioPenaltyCalcConfig,
        idealValue: Math.round(shouldersEyesWidthRatio * 100) / 100,
      },
      neckLengthPenaltyCalcConfig: {
        ...config.neckLengthPenaltyCalcConfig,
        idealValue: Math.round(neckLengthRatio * 100) / 100,
      },
      shoulderHeightPenaltyCalcConfig: {
        ...config.shoulderHeightPenaltyCalcConfig,
        idealValue: Math.round(shoulderHeight * 10) / 10, // Round to 1 decimal (already in percentage)
      },
    });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h3 className="text-lg font-semibold text-slate-700 mb-2">
        Posture Analysis
      </h3>
      <div className={`text-5xl font-bold text-center ${color}`}>{score}</div>
      <div className="mt-3 h-3 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${
            score > 80
              ? "bg-green-500"
              : score > 50
              ? "bg-yellow-500"
              : "bg-red-500"
          }`}
          style={{ width: `${score}%` }}
        />
      </div>

      <button
        onClick={handleBaseline}
        className="mt-3 w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
      >
        Baseline
      </button>

      <div className="mt-4 pt-4 border-t border-slate-200">
        <h4 className="text-sm font-semibold text-slate-600 mb-3">
          Component Measurements
        </h4>
        <div className="grid grid-cols-[1fr_4.5rem_4.5rem_4.5rem] gap-2 items-center mb-2 text-xs text-slate-500">
          <span></span>
          <span className="text-center">Current</span>
          <span className="text-center">Target</span>
          <span className="text-center">+/-</span>
        </div>
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-[1fr_4.5rem_4.5rem_4.5rem] gap-2 items-center">
            <span className="text-slate-600">Neck Length:</span>
            <span className="font-mono font-semibold text-slate-800 text-center">
              {neckLengthRatio.toFixed(2)}
            </span>
            <input
              type="number"
              value={config.neckLengthPenaltyCalcConfig.idealValue}
              onChange={(e) =>
                onConfigChange({
                  ...config,
                  neckLengthPenaltyCalcConfig: {
                    ...config.neckLengthPenaltyCalcConfig,
                    idealValue: parseFloat(e.target.value) || 0,
                  },
                })
              }
              className="w-full px-1 py-0.5 border border-slate-300 rounded text-xs text-center"
              step="0.01"
            />
            <input
              type="number"
              value={config.neckLengthPenaltyCalcConfig.tolerance}
              onChange={(e) =>
                onConfigChange({
                  ...config,
                  neckLengthPenaltyCalcConfig: {
                    ...config.neckLengthPenaltyCalcConfig,
                    tolerance: parseFloat(e.target.value) || 0,
                  },
                })
              }
              className="w-full px-1 py-0.5 border border-slate-300 rounded text-xs text-center"
              step="0.01"
            />
          </div>
          <div className="grid grid-cols-[1fr_4.5rem_4.5rem_4.5rem] gap-2 items-center">
            <span className="text-slate-600">Shoulder Height:</span>
            <span className="font-mono font-semibold text-slate-800 text-center">
              {shoulderHeight.toFixed(1)}%
            </span>
            <input
              type="number"
              value={config.shoulderHeightPenaltyCalcConfig.idealValue}
              onChange={(e) =>
                onConfigChange({
                  ...config,
                  shoulderHeightPenaltyCalcConfig: {
                    ...config.shoulderHeightPenaltyCalcConfig,
                    idealValue: parseFloat(e.target.value) || 0,
                  },
                })
              }
              className="w-full px-1 py-0.5 border border-slate-300 rounded text-xs text-center"
              step="1"
            />
            <input
              type="number"
              value={config.shoulderHeightPenaltyCalcConfig.tolerance}
              onChange={(e) =>
                onConfigChange({
                  ...config,
                  shoulderHeightPenaltyCalcConfig: {
                    ...config.shoulderHeightPenaltyCalcConfig,
                    tolerance: parseFloat(e.target.value) || 0,
                  },
                })
              }
              className="w-full px-1 py-0.5 border border-slate-300 rounded text-xs text-center"
              step="0.1"
            />
          </div>
          <div className="grid grid-cols-[1fr_4.5rem_4.5rem_4.5rem] gap-2 items-center">
            <span className="text-slate-600">Neck Angle:</span>
            <span className="font-mono font-semibold text-slate-800 text-center">
              {neckAngle.toFixed(1)}°
            </span>
            <input
              type="number"
              value={config.neckAnglePenaltyCalcConfig.idealValue}
              onChange={(e) =>
                onConfigChange({
                  ...config,
                  neckAnglePenaltyCalcConfig: {
                    ...config.neckAnglePenaltyCalcConfig,
                    idealValue: parseFloat(e.target.value) || 0,
                  },
                })
              }
              className="w-full px-1 py-0.5 border border-slate-300 rounded text-xs text-center"
              step="0.1"
            />
            <input
              type="number"
              value={config.neckAnglePenaltyCalcConfig.tolerance}
              onChange={(e) =>
                onConfigChange({
                  ...config,
                  neckAnglePenaltyCalcConfig: {
                    ...config.neckAnglePenaltyCalcConfig,
                    tolerance: parseFloat(e.target.value) || 0,
                  },
                })
              }
              className="w-full px-1 py-0.5 border border-slate-300 rounded text-xs text-center"
              step="0.1"
            />
          </div>
          <div className="grid grid-cols-[1fr_4.5rem_4.5rem_4.5rem] gap-2 items-center">
            <span className="text-slate-600">Shoulder Tilt:</span>
            <span className="font-mono font-semibold text-slate-800 text-center">
              {shoulderAngle.toFixed(1)}°
            </span>
            <input
              type="number"
              value={config.shoulderAnglePenaltyCalcConfig.idealValue}
              onChange={(e) =>
                onConfigChange({
                  ...config,
                  shoulderAnglePenaltyCalcConfig: {
                    ...config.shoulderAnglePenaltyCalcConfig,
                    idealValue: parseFloat(e.target.value) || 0,
                  },
                })
              }
              className="w-full px-1 py-0.5 border border-slate-300 rounded text-xs text-center"
              step="0.1"
            />
            <input
              type="number"
              value={config.shoulderAnglePenaltyCalcConfig.tolerance}
              onChange={(e) =>
                onConfigChange({
                  ...config,
                  shoulderAnglePenaltyCalcConfig: {
                    ...config.shoulderAnglePenaltyCalcConfig,
                    tolerance: parseFloat(e.target.value) || 0,
                  },
                })
              }
              className="w-full px-1 py-0.5 border border-slate-300 rounded text-xs text-center"
              step="0.1"
            />
          </div>
          <div className="grid grid-cols-[1fr_4.5rem_4.5rem_4.5rem] gap-2 items-center">
            <span className="text-slate-600">Width Ratio:</span>
            <span className="font-mono font-semibold text-slate-800 text-center">
              {shouldersEyesWidthRatio.toFixed(2)}
            </span>
            <input
              type="number"
              value={config.shouldersEyesWidthRatioPenaltyCalcConfig.idealValue}
              onChange={(e) =>
                onConfigChange({
                  ...config,
                  shouldersEyesWidthRatioPenaltyCalcConfig: {
                    ...config.shouldersEyesWidthRatioPenaltyCalcConfig,
                    idealValue: parseFloat(e.target.value) || 0,
                  },
                })
              }
              className="w-full px-1 py-0.5 border border-slate-300 rounded text-xs text-center"
              step="0.1"
            />
            <input
              type="number"
              value={config.shouldersEyesWidthRatioPenaltyCalcConfig.tolerance}
              onChange={(e) =>
                onConfigChange({
                  ...config,
                  shouldersEyesWidthRatioPenaltyCalcConfig: {
                    ...config.shouldersEyesWidthRatioPenaltyCalcConfig,
                    tolerance: parseFloat(e.target.value) || 0,
                  },
                })
              }
              className="w-full px-1 py-0.5 border border-slate-300 rounded text-xs text-center"
              step="0.1"
            />
          </div>
        </div>

        <h4 className="text-sm font-semibold text-slate-600 mb-2 mt-3 pt-3 border-t border-slate-200">
          Penalties
        </h4>
        <div className="grid grid-cols-[1fr_4.5rem_4.5rem] gap-2 items-center mb-2 text-xs text-slate-500">
          <span></span>
          <span className="text-center">Mult</span>
          <span className="text-center">Penalty</span>
        </div>
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-[1fr_4.5rem_4.5rem] gap-2 items-center">
            <span className="text-slate-600">Neck Length:</span>
            <input
              type="number"
              value={config.neckLengthPenaltyCalcConfig.penaltyFactor}
              onChange={(e) =>
                onConfigChange({
                  ...config,
                  neckLengthPenaltyCalcConfig: {
                    ...config.neckLengthPenaltyCalcConfig,
                    penaltyFactor: parseFloat(e.target.value) || 0,
                  },
                })
              }
              className="w-full px-1 py-0.5 border border-slate-300 rounded text-xs text-center"
              step="10"
            />
            <span className="font-mono font-semibold text-red-600 text-center">
              -{neckLengthPenalty.toFixed(1)}
            </span>
          </div>
          <div className="grid grid-cols-[1fr_4.5rem_4.5rem] gap-2 items-center">
            <span className="text-slate-600">Shoulder Height:</span>
            <input
              type="number"
              value={config.shoulderHeightPenaltyCalcConfig.penaltyFactor}
              onChange={(e) =>
                onConfigChange({
                  ...config,
                  shoulderHeightPenaltyCalcConfig: {
                    ...config.shoulderHeightPenaltyCalcConfig,
                    penaltyFactor: parseFloat(e.target.value) || 0,
                  },
                })
              }
              className="w-full px-1 py-0.5 border border-slate-300 rounded text-xs text-center"
              step="1"
            />
            <span className="font-mono font-semibold text-red-600 text-center">
              -{shoulderHeightPenalty.toFixed(1)}
            </span>
          </div>
          <div className="grid grid-cols-[1fr_4.5rem_4.5rem] gap-2 items-center">
            <span className="text-slate-600">Neck Angle:</span>
            <input
              type="number"
              value={config.neckAnglePenaltyCalcConfig.penaltyFactor}
              onChange={(e) =>
                onConfigChange({
                  ...config,
                  neckAnglePenaltyCalcConfig: {
                    ...config.neckAnglePenaltyCalcConfig,
                    penaltyFactor: parseFloat(e.target.value) || 0,
                  },
                })
              }
              className="w-full px-1 py-0.5 border border-slate-300 rounded text-xs text-center"
              step="0.1"
            />
            <span className="font-mono font-semibold text-red-600 text-center">
              -{neckAnglePenalty.toFixed(1)}
            </span>
          </div>
          <div className="grid grid-cols-[1fr_4.5rem_4.5rem] gap-2 items-center">
            <span className="text-slate-600">Shoulder Tilt:</span>
            <input
              type="number"
              value={config.shoulderAnglePenaltyCalcConfig.penaltyFactor}
              onChange={(e) =>
                onConfigChange({
                  ...config,
                  shoulderAnglePenaltyCalcConfig: {
                    ...config.shoulderAnglePenaltyCalcConfig,
                    penaltyFactor: parseFloat(e.target.value) || 0,
                  },
                })
              }
              className="w-full px-1 py-0.5 border border-slate-300 rounded text-xs text-center"
              step="0.1"
            />
            <span className="font-mono font-semibold text-red-600 text-center">
              -{shoulderAnglePenalty.toFixed(1)}
            </span>
          </div>
          <div className="grid grid-cols-[1fr_4.5rem_4.5rem] gap-2 items-center">
            <span className="text-slate-600">Width Ratio:</span>
            <input
              type="number"
              value={
                config.shouldersEyesWidthRatioPenaltyCalcConfig.penaltyFactor
              }
              onChange={(e) =>
                onConfigChange({
                  ...config,
                  shouldersEyesWidthRatioPenaltyCalcConfig: {
                    ...config.shouldersEyesWidthRatioPenaltyCalcConfig,
                    penaltyFactor: parseFloat(e.target.value) || 0,
                  },
                })
              }
              className="w-full px-1 py-0.5 border border-slate-300 rounded text-xs text-center"
              step="1"
            />
            <span className="font-mono font-semibold text-red-600 text-center">
              -{shouldersEyesWidthRatioPenalty.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
