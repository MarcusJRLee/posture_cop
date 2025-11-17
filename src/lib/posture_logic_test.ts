import { describe, it, expect } from "@jest/globals";
import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import {
  calculateNeckAngle,
  calculateShoulderAngle,
  calculateShouldersEyesWidthRatio,
  calculateNeckLengthRatio,
  calculateShoulderHeight,
  getPostureAnalysis,
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
    allowAboveIdealRange: true,
  },
  shoulderHeightPenaltyCalcConfig: {
    idealValue: 25,
    tolerance: 5,
    penaltyFactor: 5,
    allowAboveIdealRange: true,
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
        2: { x: 0.55, y: 0.2 }, // rightEye
        5: { x: 0.45, y: 0.2 }, // leftEye
        11: { x: 0.6, y: 0.75 }, // rightShoulder
        12: { x: 0.4, y: 0.75 }, // leftShoulder
      });
      const ratio = calculateNeckLengthRatio(landmarks);

      expect(ratio).toBeCloseTo(2.75, 2);
    });
  });

  describe("calculateNeckAngle", () => {
    it("should calculate 90 degrees for vertical neck (ears directly above shoulders)", () => {
      const landmarks = createLandmarks({
        2: { x: 0.55, y: 0.1 }, // rightEye
        5: { x: 0.45, y: 0.1 }, // leftEye
        11: { x: 0.6, y: 0.75 }, // rightShoulder
        12: { x: 0.4, y: 0.75 }, // leftShoulder
      });
      const angle = calculateNeckAngle(landmarks);

      expect(angle).toBeCloseTo(90, 1);
    });
  });

  describe("calculateShoulderAngle", () => {
    it("should return 0 degrees for level shoulders", () => {
      const landmarks = createLandmarks({
        2: { x: 0.55, y: 0.1 }, // rightEye
        5: { x: 0.45, y: 0.1 }, // leftEye
        11: { x: 0.6, y: 0.75 }, // rightShoulder
        12: { x: 0.4, y: 0.75 }, // leftShoulder
      });
      const angle = calculateShoulderAngle(landmarks);

      expect(angle).toBeCloseTo(0, 1);
    });
  });

  describe("calculateShouldersEyesWidthRatio", () => {
    it("should calculate ratio when shoulders are wider than eyes", () => {
      const landmarks = createLandmarks({
        2: { x: 0.55, y: 0.1 }, // rightEye
        5: { x: 0.45, y: 0.1 }, // leftEye
        11: { x: 0.6, y: 0.75 }, // rightShoulder
        12: { x: 0.4, y: 0.75 }, // leftShoulder
      });
      const ratio = calculateShouldersEyesWidthRatio(landmarks);

      expect(ratio).toBeCloseTo(2.0, 1);
    });
  });

  describe("calculateShoulderHeight", () => {
    it("should calculate 0.25 when shoulders are at y=0.75", () => {
      const landmarks = createLandmarks({
        11: { x: 8, y: 0.75 }, // rightShoulder
        12: { x: 2, y: 0.75 }, // leftShoulder
      });
      const height = calculateShoulderHeight(landmarks);

      expect(height).toBeCloseTo(0.25, 2);
    });

    it("should calculate 0.5 when shoulders are at y=0.5 (middle of screen)", () => {
      const landmarks = createLandmarks({
        11: { x: 8, y: 0.5 }, // rightShoulder
        12: { x: 2, y: 0.5 }, // leftShoulder
      });
      const height = calculateShoulderHeight(landmarks);

      expect(height).toBeCloseTo(0.5, 2);
    });

    it("should calculate 0.75 when shoulders are at y=0.25 (upper part of screen)", () => {
      const landmarks = createLandmarks({
        11: { x: 8, y: 0.25 }, // rightShoulder
        12: { x: 2, y: 0.25 }, // leftShoulder
      });
      const height = calculateShoulderHeight(landmarks);

      expect(height).toBeCloseTo(0.75, 2);
    });
  });

  describe("getPostureAnalysis", () => {
    it("should return 100 for perfect posture", () => {
      // Create a custom config that matches these specific landmark measurements
      const perfectPostureConfig: PenaltyConfig = {
        neckLengthPenaltyCalcConfig: {
          idealValue: 3.25,
          tolerance: 0.5,
          penaltyFactor: 500,
          allowAboveIdealRange: true,
        },
        shoulderHeightPenaltyCalcConfig: {
          idealValue: 25, // 25% (shoulders at y=0.75 -> height=0.25 -> 25%)
          tolerance: 10,
          penaltyFactor: 5,
          allowAboveIdealRange: true,
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
          idealValue: 2.0,
          tolerance: 0.5,
          penaltyFactor: 50,
        },
      };

      const landmarks = createLandmarks({
        2: { x: 0.55, y: 0.1 }, // rightEye
        5: { x: 0.45, y: 0.1 }, // leftEye
        11: { x: 0.6, y: 0.75 }, // rightShoulder
        12: { x: 0.4, y: 0.75 }, // leftShoulder
      });

      const analysis = getPostureAnalysis(landmarks, perfectPostureConfig);

      expect(analysis.score).toBe(100);
      expect(analysis.shoulderHeight).toBe(25); // Verify it's in percentage
      expect(analysis.neckAnglePenalty).toBe(0);
      expect(analysis.shoulderAnglePenalty).toBe(0);
      expect(analysis.shouldersEyesWidthRatioPenalty).toBe(0);
      expect(analysis.neckLengthPenalty).toBe(0);
      expect(analysis.shoulderHeightPenalty).toBe(0);
    });

    it("should return 0 for very poor posture", () => {
      const landmarks = createLandmarks({
        2: { x: 0.55, y: 0.5 }, // rightEye
        5: { x: 0.45, y: 0.5 }, // leftEye
        11: { x: 0.6, y: 0.95 }, // rightShoulder (very low, tilted)
        12: { x: 0.4, y: 0.9 }, // leftShoulder
      });
      const analysis = getPostureAnalysis(landmarks, DEFAULT_PENALTY_CONFIG);
      expect(analysis.score).toBe(0);
    });

    it("should return a score between 0 and 100 for moderately poor posture", () => {
      // Create a config with lower penalties for moderate issues
      const moderateConfig: PenaltyConfig = {
        neckLengthPenaltyCalcConfig: {
          idealValue: 2.75,
          tolerance: 0.5,
          penaltyFactor: 50,
          allowAboveIdealRange: true,
        },
        shoulderHeightPenaltyCalcConfig: {
          idealValue: 15, // 15% (in percentage)
          tolerance: 5,
          penaltyFactor: 1,
          allowAboveIdealRange: true,
        },
        neckAnglePenaltyCalcConfig: {
          idealValue: 90,
          tolerance: 15,
          penaltyFactor: 1,
        },
        shoulderAnglePenaltyCalcConfig: {
          idealValue: 0,
          tolerance: 10,
          penaltyFactor: 1,
        },
        shouldersEyesWidthRatioPenaltyCalcConfig: {
          idealValue: 2.75,
          tolerance: 0.5,
          penaltyFactor: 10,
        },
      };

      const landmarks = createLandmarks({
        2: { x: 0.55, y: 0.3 }, // rightEye
        5: { x: 0.45, y: 0.3 }, // leftEye
        11: { x: 0.6, y: 0.85 }, // rightShoulder (somewhat low, height=15%)
        12: { x: 0.4, y: 0.85 }, // leftShoulder
      });
      const analysis = getPostureAnalysis(landmarks, moderateConfig);
      expect(analysis.score).toBeGreaterThan(0);
      expect(analysis.score).toBeLessThan(100);
    });
  });
});
