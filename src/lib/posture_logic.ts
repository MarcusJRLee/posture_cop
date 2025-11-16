import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

// Constants for neck angle penalty calculation.
const NECK_ANGLE_IDEAL = 90;
const NECK_ANGLE_TOLERANCE = 20;
const NECK_ANGLE_PENALTY_FACTOR = 2;

// Constants for shoulder angle penalty calculation.
const SHOULDER_ANGLE_IDEAL = 0;
const SHOULDER_ANGLE_TOLERANCE = 5;
const SHOULDER_ANGLE_PENALTY_FACTOR = 3;

// Constants for width ratio penalty calculation.
const WIDTH_RATIO_IDEAL = 6.0;
const WIDTH_RATIO_TOLERANCE = 0.8;
const WIDTH_RATIO_PENALTY_FACTOR = 100;

// Constants for neck length ratio penalty calculation.
//
// This seems to be the most useful measurement for the score.
const NECK_LENGTH_RATIO_IDEAL = 0.95;
const NECK_LENGTH_RATIO_TOLERANCE = 0.06;
const NECK_LENGTH_RATIO_PENALTY_FACTOR = 500;

/** Posture analysis result with all component measurements. */
export interface PostureAnalysis {
  // Overall score out of 100.
  score: number;
  // Measurements.
  neckAngle: number;
  shoulderAngle: number;
  widthRatio: number;
  neckLengthRatio: number;
  // Penalties for each measurement.
  neckAnglePenalty: number;
  shoulderAnglePenalty: number;
  widthRatioPenalty: number;
  neckLengthPenalty: number;
}

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
  idealValue: number,
  tolerance: number,
  penaltyFactor: number
): number {
  const deviation = Math.abs(value - idealValue);
  return deviation > tolerance ? (deviation - tolerance) * penaltyFactor : 0;
}

/** Calculate width ratio penalty based on deviation from ideal. */
function calculateWidthRatioPenalty(widthRatio: number): number {
  return calculatePenalty(
    widthRatio,
    WIDTH_RATIO_IDEAL,
    WIDTH_RATIO_TOLERANCE,
    WIDTH_RATIO_PENALTY_FACTOR
  );
}

/** Calculate neck angle penalty based on deviation from ideal. */
function calculateNeckAnglePenalty(neckAngle: number): number {
  return calculatePenalty(
    neckAngle,
    NECK_ANGLE_IDEAL,
    NECK_ANGLE_TOLERANCE,
    NECK_ANGLE_PENALTY_FACTOR
  );
}

/** Calculate shoulder angle penalty based on deviation from ideal. */
function calculateShoulderAnglePenalty(shoulderAngle: number): number {
  return calculatePenalty(
    shoulderAngle,
    SHOULDER_ANGLE_IDEAL,
    SHOULDER_ANGLE_TOLERANCE,
    SHOULDER_ANGLE_PENALTY_FACTOR
  );
}

/** Calculate neck length ratio penalty based on deviation from ideal. */
function calculateNeckLengthRatioPenalty(neckLengthRatio: number): number {
  return calculatePenalty(
    neckLengthRatio,
    NECK_LENGTH_RATIO_IDEAL,
    NECK_LENGTH_RATIO_TOLERANCE,
    NECK_LENGTH_RATIO_PENALTY_FACTOR
  );
}

/** Calculates the neck tilt angle based on pose landmarks. */
export function calculateNeckAngle(landmarks: NormalizedLandmark[]): number {
  const leftEar = landmarks[7];
  const rightEar = landmarks[8];
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
export function calculateWidthRatio(landmarks: NormalizedLandmark[]): number {
  const leftEye = landmarks[2];
  const rightEye = landmarks[5];
  const leftShoulder = landmarks[12];
  const rightShoulder = landmarks[11];

  const eyeWidth = calculateDistance(leftEye, rightEye);
  const shoulderWidth = calculateDistance(leftShoulder, rightShoulder);

  // Return shoulder width / eye width.
  return shoulderWidth / eyeWidth;
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

/** Analyze posture and return detailed breakdown. */
export function getPostureAnalysis(
  neckAngle: number,
  shoulderAngle: number,
  widthRatio: number,
  neckLengthRatio: number
): PostureAnalysis {
  let score = 100;

  // Good posture: neck should be vertical (~90 degrees).
  // Penalize deviation from vertical (90 degrees).
  const neckAnglePenalty = calculateNeckAnglePenalty(neckAngle);

  // Good posture: shoulders should be level (close to 0 degrees tilt)
  // Penalize shoulder tilt beyond 5 degrees
  const shoulderAnglePenalty = calculateShoulderAnglePenalty(shoulderAngle);

  // Good posture: width ratio should be between 2.5-3.5.
  // When you lean forward, head gets closer and ratio decreases
  const widthRatioPenalty = calculateWidthRatioPenalty(widthRatio);

  // Good posture: neck length ratio should be between 0.8-1.2
  // This changes when you lean forward or slouch
  const neckLengthPenalty = calculateNeckLengthRatioPenalty(neckLengthRatio);

  score -= neckAnglePenalty;
  score -= shoulderAnglePenalty;
  score -= widthRatioPenalty;
  score -= neckLengthPenalty;

  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    neckAngle,
    shoulderAngle,
    widthRatio,
    neckLengthRatio,
    neckAnglePenalty,
    shoulderAnglePenalty,
    widthRatioPenalty,
    neckLengthPenalty,
  };
}
