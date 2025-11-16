import type { PostureAnalysis } from "@/lib/posture_logic";

interface PostureScoreProps {
  analysis: PostureAnalysis;
}

export default function PostureScore({ analysis }: PostureScoreProps) {
  const {
    score,
    neckAngle,
    shoulderAngle,
    widthRatio,
    neckLengthRatio,
    neckAnglePenalty,
    shoulderAnglePenalty,
    widthRatioPenalty,
    neckLengthPenalty
  } = analysis;

  const color =
    score > 80
      ? "text-green-600"
      : score > 50
      ? "text-yellow-600"
      : "text-red-600";

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h3 className="text-lg font-semibold text-slate-700 mb-2">
        Posture Analysis
      </h3>
      <div className={`text-5xl font-bold text-center ${color}`}>
        {score}
      </div>
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

      <div className="mt-4 pt-4 border-t border-slate-200">
        <h4 className="text-sm font-semibold text-slate-600 mb-3">Component Measurements</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Neck Angle:</span>
            <span className="font-mono font-semibold text-slate-800">{neckAngle.toFixed(1)}°</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Shoulder Tilt:</span>
            <span className="font-mono font-semibold text-slate-800">{shoulderAngle.toFixed(1)}°</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Width Ratio:</span>
            <span className="font-mono font-semibold text-slate-800">{widthRatio.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Neck Length:</span>
            <span className="font-mono font-semibold text-slate-800">{neckLengthRatio.toFixed(2)}</span>
          </div>
        </div>

        <h4 className="text-sm font-semibold text-slate-600 mb-2 mt-3">Penalties</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Neck Angle:</span>
            <span className="font-mono font-semibold text-red-600">-{neckAnglePenalty.toFixed(1)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Shoulder Tilt:</span>
            <span className="font-mono font-semibold text-red-600">-{shoulderAnglePenalty.toFixed(1)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Width Ratio:</span>
            <span className="font-mono font-semibold text-red-600">-{widthRatioPenalty.toFixed(1)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Neck Length:</span>
            <span className="font-mono font-semibold text-red-600">-{neckLengthPenalty.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
