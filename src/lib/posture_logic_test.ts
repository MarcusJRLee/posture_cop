import { describe, it, expect } from "@jest/globals";
import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import {
  calculateNeckAngle,
  calculateShoulderAngle,
  calculateShouldersEyesWidthRatio,
  calculateNeckLengthRatio,
  getPostureAnalysis,
  PostureAnalysis,
  PenaltyConfig,
} from "./posture_logic";

// Helper to create mock landmarks array.
function createLandmarks(
  overrides: Partial<Record<number, Partial<NormalizedLandmark>>> = {}
): NormalizedLandmark[] {
  const landmarks: NormalizedLandmark[] = Array(33)
    .fill(null)
    .map(() => ({ x: 0, y: 0, z: 0, visibility: 1 }));
  Object.entries(overrides).forEach(([index, landmark]) => {
    landmarks[parseInt(index)] = {
      x: 0,
      y: 0,
      z: 0,
      visibility: 1,
      ...landmark,
    };
  });
  return landmarks;
}

/** Default penalty configuration for testing. */
export const DEFAULT_PENALTY_CONFIG: PenaltyConfig = {
  neckLengthPenaltyCalcConfig: {
    idealValue: 0.95,
    tolerance: 0.07,
    penaltyFactor: 500,
  },
  neckAnglePenaltyCalcConfig: {
    idealValue: 90,
    tolerance: 20,
    penaltyFactor: 2,
  },
  shoulderAnglePenaltyCalcConfig: {
    idealValue: 0,
    tolerance: 5,
    penaltyFactor: 3,
  },
  shouldersEyesWidthRatioPenaltyCalcConfig: {
    idealValue: 6.0,
    tolerance: 1,
    penaltyFactor: 50,
  },
};

describe("posture_logic", () => {
  describe("calculateNeckLengthRatio", () => {
    it("should calculate ratio for normal posture", () => {
      const landmarks = createLandmarks({
        2: { x: 5.5, y: 6 }, // rightEye
        5: { x: 4.5, y: 6 }, // leftEye
        11: { x: 8, y: 3 }, // rightShoulder
        12: { x: 2, y: 3 }, // leftShoulder
      });
      const ratio = calculateNeckLengthRatio(landmarks);

      expect(ratio).toBeCloseTo(0.5, 2);
    });
  });

  describe("calculateNeckAngle", () => {
    it("should calculate 90 degrees for vertical neck (ears directly above shoulders)", () => {
      const landmarks = createLandmarks({
        2: { x: 5.5, y: 9 }, // rightEye
        5: { x: 4.5, y: 9 }, // leftEye
        11: { x: 8, y: 3 }, // rightShoulder
        12: { x: 2, y: 3 }, // leftShoulder
      });
      const angle = calculateNeckAngle(landmarks);

      expect(angle).toBeCloseTo(90, 1);
    });
  });

  describe("calculateShoulderAngle", () => {
    it("should return 0 degrees for level shoulders", () => {
      const landmarks = createLandmarks({
        2: { x: 5.5, y: 9 }, // rightEye
        5: { x: 4.5, y: 9 }, // leftEye
        11: { x: 8, y: 3 }, // rightShoulder
        12: { x: 2, y: 3 }, // leftShoulder
      });
      const angle = calculateShoulderAngle(landmarks);

      expect(angle).toBeCloseTo(0, 1);
    });
  });

  describe("calculateShouldersEyesWidthRatio", () => {
    it("should calculate ratio when shoulders are wider than eyes", () => {
      const landmarks = createLandmarks({
        2: { x: 5.5, y: 9 }, // rightEye
        5: { x: 4.5, y: 9 }, // leftEye
        11: { x: 7, y: 3 }, // rightShoulder
        12: { x: 3, y: 3 }, // leftShoulder
      });
      const ratio = calculateShouldersEyesWidthRatio(landmarks);

      expect(ratio).toBeCloseTo(4.0, 1);
    });
  });

  describe("getPostureAnalysis", () => {
    it("should return 100 for perfect posture", () => {
      const landmarks = createLandmarks({
        2: { x: 5.5, y: 9 }, // rightEye
        5: { x: 4.5, y: 9 }, // leftEye
        11: { x: 8, y: 3 }, // rightShoulder
        12: { x: 2, y: 3 }, // leftShoulder
      });
      const expectedAnalysis: PostureAnalysis = {
        score: 100,
        neckAngle: 90,
        shoulderAngle: 0,
        shouldersEyesWidthRatio: 6.0,
        neckLengthRatio: 1,
        neckLengthPenalty: 0,
        neckAnglePenalty: 0,
        shoulderAnglePenalty: 0,
        shouldersEyesWidthRatioPenalty: 0,
      };
      const analysis = getPostureAnalysis(landmarks, DEFAULT_PENALTY_CONFIG);

      expect(analysis).toEqual(expectedAnalysis);
    });

    it("should return 0 for very poor posture", () => {
      const landmarks = createLandmarks({
        2: { x: 5.5, y: 7 }, // rightEye
        5: { x: 4.5, y: 7 }, // leftEye
        11: { x: 8, y: 4 }, // rightShoulder
        12: { x: 2, y: 3 }, // leftShoulder
      });
      const analysis = getPostureAnalysis(landmarks, DEFAULT_PENALTY_CONFIG);
      expect(analysis.score).toBe(0);
    });

    it("should return a score between 0 and 100 for moderately poor posture", () => {
      const landmarks = createLandmarks({
        2: { x: 5.5, y: 8 }, // rightEye
        5: { x: 4.5, y: 8 }, // leftEye
        11: { x: 8, y: 3.5 }, // rightShoulder
        12: { x: 2, y: 3 }, // leftShoulder
      });
      const analysis = getPostureAnalysis(landmarks, DEFAULT_PENALTY_CONFIG);
      expect(analysis.score).toBe(54);
    });
  });
});
