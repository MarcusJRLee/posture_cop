import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

/** Configuration for a single penalty calculation. */
export interface PenaltyCalculationConfig {
  idealValue: number;
  tolerance: number;
  penaltyFactor: number;
}

/** Configuration for penalty calculations. */
export interface PenaltyConfig {
  neckLengthPenaltyCalcConfig: PenaltyCalculationConfig;
  neckAnglePenaltyCalcConfig: PenaltyCalculationConfig;
  shoulderAnglePenaltyCalcConfig: PenaltyCalculationConfig;
  shouldersEyesWidthRatioPenaltyCalcConfig: PenaltyCalculationConfig;
}

/** Default penalty configuration. */
export const DEFAULT_PENALTY_CONFIG: PenaltyConfig = {
  neckLengthPenaltyCalcConfig: {
    idealValue: 0.95,
    tolerance: 0.07,
    penaltyFactor: 500,
  },
  neckAnglePenaltyCalcConfig: {
    idealValue: 90,
    tolerance: 5,
    penaltyFactor: 3,
  },
  shoulderAnglePenaltyCalcConfig: {
    idealValue: 0,
    tolerance: 5,
    penaltyFactor: 3,
  },
  shouldersEyesWidthRatioPenaltyCalcConfig: {
    idealValue: 5.5,
    tolerance: 0.5,
    penaltyFactor: 50,
  },
};

/** Posture analysis result with all component measurements. */
export interface PostureAnalysis {
  // Overall score out of 100.
  score: number;
  // Measurements.
  neckAngle: number;
  shoulderAngle: number;
  shouldersEyesWidthRatio: number;
  neckLengthRatio: number;
  // Penalties for each measurement.
  neckLengthPenalty: number;
  neckAnglePenalty: number;
  shoulderAnglePenalty: number;
  shouldersEyesWidthRatioPenalty: number;
}

/** Default posture analysis. */
export const DEFAULT_POSTURE_ANALYSIS: PostureAnalysis = {
  // Overall score out of 100.
  score: 100,
  // Measurements.
  neckAngle: 0,
  shoulderAngle: 0,
  shouldersEyesWidthRatio: 0,
  neckLengthRatio: 0,
  // Penalties for each measurement.
  neckLengthPenalty: 0,
  neckAnglePenalty: 0,
  shoulderAnglePenalty: 0,
  shouldersEyesWidthRatioPenalty: 0,
};

/** Calculates the Euclidean distance between two landmarks. */
function calculateDistance(
  p1: NormalizedLandmark,
  p2: NormalizedLandmark
): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/** Calculate width ratio penalty based on deviation from ideal. */
function calculatePenalty(
  value: number,
  penaltyCalculation: PenaltyCalculationConfig,
  allowAboveIdealRange: boolean = false
): number {
  if (allowAboveIdealRange && value > penaltyCalculation.idealValue) {
    return 0;
  }
  const factor = penaltyCalculation.penaltyFactor;
  const deviation = Math.abs(value - penaltyCalculation.idealValue);
  const diff = deviation - penaltyCalculation.tolerance;
  return diff > 0 ? diff * factor : 0;
}

/**
 * Calculate the neck length ratio, which is the distance between the eye line
 * and the shoulder line, normalized by shoulder width. This measurement changes
 * when you lean forward or backward.
 */
export function calculateNeckLengthRatio(
  landmarks: NormalizedLandmark[]
): number {
  const leftEye = landmarks[2];
  const rightEye = landmarks[5];
  const leftShoulder = landmarks[12];
  const rightShoulder = landmarks[11];

  // Calculate midpoints.
  const eyeMidY = (leftEye.y + rightEye.y) / 2;
  const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2;

  // Vertical distance between eye line and shoulder line.
  const neckLength = Math.abs(shoulderMidY - eyeMidY);

  // Normalize by shoulder width.
  const shoulderWidth = calculateDistance(leftShoulder, rightShoulder);

  // Return ratio (typical good posture ratio is around 0.8-1.2).
  return neckLength / shoulderWidth;
}

/** Calculates the neck tilt angle based on pose landmarks. */
export function calculateNeckAngle(landmarks: NormalizedLandmark[]): number {
  const leftEar = landmarks[2];
  const rightEar = landmarks[5];
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];

  const earMid = {
    x: (leftEar.x + rightEar.x) / 2,
    y: (leftEar.y + rightEar.y) / 2,
  };

  const shoulderMid = {
    x: (leftShoulder.x + rightShoulder.x) / 2,
    y: (leftShoulder.y + rightShoulder.y) / 2,
  };

  const dx = earMid.x - shoulderMid.x;
  const dy = earMid.y - shoulderMid.y;
  return Math.abs((Math.atan2(dy, dx) * 180) / Math.PI);
}

/**
 * Calculates the shoulder tilt angle (deviation from horizontal) based on
 * landmarks.
 */
export function calculateShoulderAngle(
  landmarks: NormalizedLandmark[]
): number {
  const leftShoulder = landmarks[12];
  const rightShoulder = landmarks[11];

  // Calculate angle of line connecting shoulders.
  const dx = rightShoulder.x - leftShoulder.x;
  const dy = rightShoulder.y - leftShoulder.y;

  // Get angle in degrees.
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

  // Return absolute deviation from horizontal (0 degrees). Shoulders should be
  // level, so we want angle close to 0.
  return Math.abs(angle);
}

/**
 * Calculate the shoulder-to-eye width ratio.
 * This ratio decreases when you lean forward (head moves closer to camera).
 */
export function calculateShouldersEyesWidthRatio(
  landmarks: NormalizedLandmark[]
): number {
  const leftEye = landmarks[2];
  const rightEye = landmarks[5];
  const leftShoulder = landmarks[12];
  const rightShoulder = landmarks[11];

  const eyeWidth = calculateDistance(leftEye, rightEye);
  const shoulderWidth = calculateDistance(leftShoulder, rightShoulder);

  // Return shoulder width / eye width.
  return shoulderWidth / eyeWidth;
}

/** Analyze posture and return detailed breakdown. */
export function getPostureAnalysis(
  landmarks: NormalizedLandmark[],
  config: PenaltyConfig
): PostureAnalysis {
  const neckLengthRatio = calculateNeckLengthRatio(landmarks);
  const neckAngle = calculateNeckAngle(landmarks);
  const shoulderAngle = calculateShoulderAngle(landmarks);
  const shouldersEyesWidthRatio = calculateShouldersEyesWidthRatio(landmarks);

  let score = 100;

  // Good posture: neck length ratio should be between 0.8-1.2
  // This changes when you lean forward or slouch
  const neckLengthPenalty = calculatePenalty(
    neckLengthRatio,
    config.neckLengthPenaltyCalcConfig,
    /* allowAboveIdealRange= */ true
  );

  // Good posture: neck should be vertical (~90 degrees).
  // Penalize deviation from vertical (90 degrees).
  const neckAnglePenalty = calculatePenalty(
    neckAngle,
    config.neckAnglePenaltyCalcConfig
  );

  // Good posture: shoulders should be level (close to 0 degrees tilt)
  // Penalize shoulder tilt beyond 5 degrees
  const shoulderAnglePenalty = calculatePenalty(
    shoulderAngle,
    config.shoulderAnglePenaltyCalcConfig
  );

  // Good posture: width ratio should be between 2.5-3.5.
  // When you lean forward, head gets closer and ratio decreases
  const shouldersEyesWidthRatioPenalty = calculatePenalty(
    shouldersEyesWidthRatio,
    config.shouldersEyesWidthRatioPenaltyCalcConfig
  );

  score -= neckAnglePenalty;
  score -= shoulderAnglePenalty;
  score -= shouldersEyesWidthRatioPenalty;
  score -= neckLengthPenalty;

  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    neckAngle,
    shoulderAngle,
    shouldersEyesWidthRatio,
    neckLengthRatio,
    neckAnglePenalty,
    shoulderAnglePenalty,
    shouldersEyesWidthRatioPenalty,
    neckLengthPenalty,
  };
}
