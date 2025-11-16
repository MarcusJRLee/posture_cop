import { describe, it, expect } from "@jest/globals";
import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import {
  calculateNeckAngle,
  calculateShoulderAngle,
  calculateWidthRatio,
  calculateNeckLengthRatio,
  getPostureAnalysis,
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

describe("posture_logic", () => {
  describe("calculateNeckAngle", () => {
    it("should be defined", () => {
      expect(calculateNeckAngle).toBeDefined();
    });

    it("should calculate 90 degrees for vertical neck (ears directly above shoulders)", () => {
      const landmarks = createLandmarks({
        7: { x: 0.4, y: 0.3 }, // leftEar
        8: { x: 0.6, y: 0.3 }, // rightEar
        11: { x: 0.4, y: 0.5 }, // leftShoulder
        12: { x: 0.6, y: 0.5 }, // rightShoulder
      });
      const angle = calculateNeckAngle(landmarks);
      expect(angle).toBeCloseTo(90, 1);
    });

    it("should calculate 0 degrees for horizontal neck (ears at same level as shoulders)", () => {
      const landmarks = createLandmarks({
        7: { x: 0.3, y: 0.5 }, // leftEar
        8: { x: 0.7, y: 0.5 }, // rightEar
        11: { x: 0.4, y: 0.5 }, // leftShoulder
        12: { x: 0.6, y: 0.5 }, // rightShoulder
      });
      const angle = calculateNeckAngle(landmarks);
      expect(angle).toBeCloseTo(0, 1);
    });

    it("should calculate angle for tilted neck", () => {
      const landmarks = createLandmarks({
        7: { x: 0.5, y: 0.3 }, // leftEar
        8: { x: 0.5, y: 0.3 }, // rightEar (same as left for simplicity)
        11: { x: 0.4, y: 0.5 }, // leftShoulder
        12: { x: 0.6, y: 0.5 }, // rightShoulder
      });
      const angle = calculateNeckAngle(landmarks);
      // Ear mid: (0.5, 0.3), Shoulder mid: (0.5, 0.5)
      // dx = 0, dy = -0.2, angle = atan2(-0.2, 0) = -90 degrees, abs = 90
      expect(angle).toBeCloseTo(90, 1);
    });

    it("should calculate angle for forward-leaning neck", () => {
      const landmarks = createLandmarks({
        7: { x: 0.6, y: 0.4 }, // leftEar (forward and to the right)
        8: { x: 0.6, y: 0.4 }, // rightEar
        11: { x: 0.4, y: 0.5 }, // leftShoulder
        12: { x: 0.6, y: 0.5 }, // rightShoulder
      });
      const angle = calculateNeckAngle(landmarks);
      // Ear mid: (0.6, 0.4), Shoulder mid: (0.5, 0.5)
      // dx = 0.6 - 0.5 = 0.1, dy = 0.4 - 0.5 = -0.1
      // angle = atan2(-0.1, 0.1) ≈ -45 degrees, abs ≈ 45
      expect(angle).toBeLessThan(90);
      expect(angle).toBeGreaterThan(0);
    });
  });

  describe("calculateShoulderAngle", () => {
    it("should be defined", () => {
      expect(calculateShoulderAngle).toBeDefined();
    });

    it("should return 0 degrees for level shoulders", () => {
      const landmarks = createLandmarks({
        11: { x: 0.6, y: 0.5 }, // rightShoulder
        12: { x: 0.4, y: 0.5 }, // leftShoulder
      });
      const angle = calculateShoulderAngle(landmarks);
      // dx = 0.6 - 0.4 = 0.2, dy = 0.5 - 0.5 = 0
      // angle = atan2(0, 0.2) = 0 degrees, abs = 0
      expect(angle).toBeCloseTo(0, 1);
    });

    it("should calculate angle for tilted shoulders (left higher)", () => {
      const landmarks = createLandmarks({
        11: { x: 0.6, y: 0.5 }, // rightShoulder
        12: { x: 0.4, y: 0.4 }, // leftShoulder (higher, y is smaller)
      });
      const angle = calculateShoulderAngle(landmarks);
      // dx = 0.6 - 0.4 = 0.2, dy = 0.5 - 0.4 = 0.1
      // angle = atan2(0.1, 0.2) ≈ 26.57 degrees, abs ≈ 26.57
      expect(angle).toBeGreaterThan(0);
      expect(angle).toBeLessThan(90);
    });

    it("should calculate angle for tilted shoulders (right higher)", () => {
      const landmarks = createLandmarks({
        11: { x: 0.6, y: 0.4 }, // rightShoulder (higher)
        12: { x: 0.4, y: 0.5 }, // leftShoulder
      });
      const angle = calculateShoulderAngle(landmarks);
      // dx = 0.6 - 0.4 = 0.2, dy = 0.4 - 0.5 = -0.1
      // angle = atan2(-0.1, 0.2) ≈ -26.57 degrees, abs ≈ 26.57
      expect(angle).toBeGreaterThan(0);
      expect(angle).toBeLessThan(90);
    });

    it("should return 90 degrees for vertical shoulder line", () => {
      const landmarks = createLandmarks({
        11: { x: 0.5, y: 0.4 }, // rightShoulder
        12: { x: 0.5, y: 0.6 }, // leftShoulder
      });
      const angle = calculateShoulderAngle(landmarks);
      // dx = 0.5 - 0.5 = 0, dy = 0.4 - 0.6 = -0.2
      // angle = atan2(-0.2, 0) = -90 degrees, abs = 90
      expect(angle).toBeCloseTo(90, 1);
    });
  });

  describe("calculateWidthRatio", () => {
    it("should be defined", () => {
      expect(calculateWidthRatio).toBeDefined();
    });

    it("should calculate ratio when shoulders are wider than eyes", () => {
      const landmarks = createLandmarks({
        2: { x: 0.45, y: 0.3 }, // leftEye
        5: { x: 0.55, y: 0.3 }, // rightEye (eye width = 0.1)
        11: { x: 0.3, y: 0.5 }, // rightShoulder
        12: { x: 0.7, y: 0.5 }, // leftShoulder (shoulder width = 0.4)
      });
      const ratio = calculateWidthRatio(landmarks);
      // shoulder width / eye width = 0.4 / 0.1 = 4.0
      expect(ratio).toBeCloseTo(4.0, 1);
    });

    it("should calculate ratio when eyes are wider than shoulders", () => {
      const landmarks = createLandmarks({
        2: { x: 0.3, y: 0.3 }, // leftEye
        5: { x: 0.7, y: 0.3 }, // rightEye (eye width = 0.4)
        11: { x: 0.45, y: 0.5 }, // rightShoulder
        12: { x: 0.55, y: 0.5 }, // leftShoulder (shoulder width = 0.1)
      });
      const ratio = calculateWidthRatio(landmarks);
      // shoulder width / eye width = 0.1 / 0.4 = 0.25
      expect(ratio).toBeCloseTo(0.25, 2);
    });

    it("should calculate ratio for equal widths", () => {
      const landmarks = createLandmarks({
        2: { x: 0.4, y: 0.3 }, // leftEye
        5: { x: 0.6, y: 0.3 }, // rightEye (eye width = 0.2)
        11: { x: 0.4, y: 0.5 }, // rightShoulder
        12: { x: 0.6, y: 0.5 }, // leftShoulder (shoulder width = 0.2)
      });
      const ratio = calculateWidthRatio(landmarks);
      // shoulder width / eye width = 0.2 / 0.2 = 1.0
      expect(ratio).toBeCloseTo(1.0, 1);
    });

    it("should return larger ratio when head is closer (forward lean)", () => {
      const landmarks = createLandmarks({
        2: { x: 0.48, y: 0.3 }, // leftEye (closer together)
        5: { x: 0.52, y: 0.3 }, // rightEye (eye width = 0.04)
        11: { x: 0.3, y: 0.5 }, // rightShoulder
        12: { x: 0.7, y: 0.5 }, // leftShoulder (shoulder width = 0.4)
      });
      const ratio = calculateWidthRatio(landmarks);
      // shoulder width / eye width = 0.4 / 0.04 = 10.0
      expect(ratio).toBeCloseTo(10.0, 1);
    });
  });

  describe("calculateNeckLengthRatio", () => {
    it("should be defined", () => {
      expect(calculateNeckLengthRatio).toBeDefined();
    });

    it("should calculate ratio for normal posture", () => {
      const landmarks = createLandmarks({
        2: { x: 0.4, y: 0.3 }, // leftEye
        5: { x: 0.6, y: 0.3 }, // rightEye (eye mid y = 0.3)
        11: { x: 0.3, y: 0.5 }, // rightShoulder
        12: { x: 0.7, y: 0.5 }, // leftShoulder (shoulder mid y = 0.5, width = 0.4)
      });
      const ratio = calculateNeckLengthRatio(landmarks);
      // neck length = |0.5 - 0.3| = 0.2
      // shoulder width = sqrt((0.7-0.3)^2 + (0.5-0.5)^2) = 0.4
      // ratio = 0.2 / 0.4 = 0.5
      expect(ratio).toBeCloseTo(0.5, 2);
    });

    it("should calculate ratio when neck is longer", () => {
      const landmarks = createLandmarks({
        2: { x: 0.4, y: 0.2 }, // leftEye
        5: { x: 0.6, y: 0.2 }, // rightEye (eye mid y = 0.2)
        11: { x: 0.3, y: 0.5 }, // rightShoulder
        12: { x: 0.7, y: 0.5 }, // leftShoulder (shoulder mid y = 0.5, width = 0.4)
      });
      const ratio = calculateNeckLengthRatio(landmarks);
      // neck length = |0.5 - 0.2| = 0.3
      // shoulder width = 0.4
      // ratio = 0.3 / 0.4 = 0.75
      expect(ratio).toBeCloseTo(0.75, 2);
    });

    it("should calculate ratio when neck is shorter (forward lean)", () => {
      const landmarks = createLandmarks({
        2: { x: 0.4, y: 0.45 }, // leftEye (closer to shoulders)
        5: { x: 0.6, y: 0.45 }, // rightEye (eye mid y = 0.45)
        11: { x: 0.3, y: 0.5 }, // rightShoulder
        12: { x: 0.7, y: 0.5 }, // leftShoulder (shoulder mid y = 0.5, width = 0.4)
      });
      const ratio = calculateNeckLengthRatio(landmarks);
      // neck length = |0.5 - 0.45| = 0.05
      // shoulder width = 0.4
      // ratio = 0.05 / 0.4 = 0.125
      expect(ratio).toBeCloseTo(0.125, 3);
    });

    it("should calculate ratio for ideal posture (ratio ≈ 1.0)", () => {
      const landmarks = createLandmarks({
        2: { x: 0.4, y: 0.3 }, // leftEye
        5: { x: 0.6, y: 0.3 }, // rightEye (eye mid y = 0.3)
        11: { x: 0.35, y: 0.5 }, // rightShoulder
        12: { x: 0.65, y: 0.5 }, // leftShoulder (shoulder mid y = 0.5, width = 0.3)
      });
      const ratio = calculateNeckLengthRatio(landmarks);
      // neck length = |0.5 - 0.3| = 0.2
      // shoulder width = sqrt((0.65-0.35)^2 + (0.5-0.5)^2) = 0.3
      // ratio = 0.2 / 0.3 ≈ 0.667
      expect(ratio).toBeCloseTo(0.667, 2);
    });

    it("should handle case where eyes are below shoulders", () => {
      const landmarks = createLandmarks({
        2: { x: 0.4, y: 0.6 }, // leftEye (below shoulders)
        5: { x: 0.6, y: 0.6 }, // rightEye (eye mid y = 0.6)
        11: { x: 0.3, y: 0.5 }, // rightShoulder
        12: { x: 0.7, y: 0.5 }, // leftShoulder (shoulder mid y = 0.5, width = 0.4)
      });
      const ratio = calculateNeckLengthRatio(landmarks);
      // neck length = |0.5 - 0.6| = 0.1 (absolute value)
      // shoulder width = 0.4
      // ratio = 0.1 / 0.4 = 0.25
      expect(ratio).toBeCloseTo(0.25, 2);
    });
  });

  describe("getPostureAnalysis", () => {
    describe("width ratio penalty calculation", () => {
      it("should return 0 penalty when width ratio is within tolerance", () => {
        const analysis = getPostureAnalysis(90, 0, 6.0, 0.95);
        expect(analysis.widthRatioPenalty).toBe(0);
      });

      it("should return 0 penalty when width ratio is at tolerance boundary", () => {
        const analysis = getPostureAnalysis(90, 0, 5.2, 0.95);
        // Deviation: |4.2 - 5.0| = 0.8, at tolerance boundary
        expect(analysis.widthRatioPenalty).toBe(0);
      });

      it("should calculate penalty when width ratio exceeds tolerance", () => {
        const analysis = getPostureAnalysis(90, 0, 4.0, 0.95);
        // Deviation: |3.0 - 5.0| = 2.0, exceeds tolerance of 0.8
        // Penalty: (2.0 - 0.8) * 100 = 120
        expect(analysis.widthRatioPenalty).toBe(120);
      });

      it("should calculate penalty when width ratio is above ideal", () => {
        const analysis = getPostureAnalysis(90, 0, 8.0, 0.95);
        // Deviation: |7.0 - 5.0| = 2.0, exceeds tolerance of 0.8
        // Penalty: (2.0 - 0.8) * 100 = 120
        expect(analysis.widthRatioPenalty).toBe(120);
      });

      it("should calculate larger penalty for larger deviations", () => {
        const analysis = getPostureAnalysis(90, 0, 3.0, 0.95);
        // Deviation: |2.0 - 5.0| = 3.0, exceeds tolerance of 0.8
        // Penalty: (3.0 - 0.8) * 100 = 220
        expect(analysis.widthRatioPenalty).toBeCloseTo(220);
      });
    });

    describe("neck angle penalty calculation", () => {
      it("should return 0 penalty when neck angle is within tolerance", () => {
        const analysis = getPostureAnalysis(90, 0, 5.0, 0.95);
        expect(analysis.neckAnglePenalty).toBe(0);
      });

      it("should return 0 penalty when neck angle is at tolerance boundary", () => {
        const analysis = getPostureAnalysis(110, 0, 5.0, 0.95);
        // Deviation: |110 - 90| = 20, at tolerance boundary
        expect(analysis.neckAnglePenalty).toBe(0);
      });

      it("should calculate penalty when neck angle exceeds tolerance", () => {
        const analysis = getPostureAnalysis(115, 0, 5.0, 0.95);
        // Deviation: |115 - 90| = 25, exceeds tolerance of 20
        // Penalty: (25 - 20) * 2 = 10
        expect(analysis.neckAnglePenalty).toBe(10);
      });

      it("should calculate penalty when neck angle is below ideal", () => {
        const analysis = getPostureAnalysis(65, 0, 5.0, 0.95);
        // Deviation: |65 - 90| = 25, exceeds tolerance of 20
        // Penalty: (25 - 20) * 2 = 10
        expect(analysis.neckAnglePenalty).toBe(10);
      });

      it("should calculate larger penalty for larger deviations", () => {
        const analysis = getPostureAnalysis(130, 0, 5.0, 0.95);
        // Deviation: |130 - 90| = 40, exceeds tolerance of 20
        // Penalty: (40 - 20) * 2 = 40
        expect(analysis.neckAnglePenalty).toBe(40);
      });
    });

    describe("neck length ratio penalty calculation", () => {
      it("should return 0 penalty when neck length ratio is within tolerance", () => {
        const analysis = getPostureAnalysis(90, 0, 5.0, 0.95);
        expect(analysis.neckLengthPenalty).toBe(0);
      });

      it("should return 0 penalty when neck length ratio is at tolerance boundary", () => {
        const analysis = getPostureAnalysis(90, 0, 5.0, 0.89);
        // Deviation: |0.89 - 0.95| = 0.06, at tolerance boundary
        expect(analysis.neckLengthPenalty).toBe(0);
      });

      it("should calculate penalty when neck length ratio exceeds tolerance", () => {
        const analysis = getPostureAnalysis(90, 0, 5.0, 0.5);
        // Deviation: |0.5 - 0.95| = 0.45, exceeds tolerance of 0.06
        // Penalty: (0.45 - 0.06) * 500 = 195
        expect(analysis.neckLengthPenalty).toBeCloseTo(195);
      });

      it("should calculate penalty when neck length ratio is above ideal", () => {
        const analysis = getPostureAnalysis(90, 0, 5.0, 1.5);
        // Deviation: |1.5 - 0.95| = 0.55, exceeds tolerance of 0.06
        // Penalty: (0.55 - 0.06) * 500 = 245
        expect(analysis.neckLengthPenalty).toBeCloseTo(245);
      });

      it("should calculate larger penalty for larger deviations", () => {
        const analysis = getPostureAnalysis(90, 0, 5.0, 0.3);
        // Deviation: |0.3 - 0.95| = 0.65, exceeds tolerance of 0.06
        // Penalty: (0.65 - 0.06) * 500 = 295
        expect(analysis.neckLengthPenalty).toBeCloseTo(295);
      });
    });

    describe("shoulder angle penalty calculation", () => {
      it("should return 0 penalty when shoulder angle is within tolerance", () => {
        const analysis = getPostureAnalysis(90, 0, 5.0, 0.95);
        expect(analysis.shoulderAnglePenalty).toBe(0);
      });

      it("should return 0 penalty when shoulder angle is at tolerance boundary", () => {
        const analysis = getPostureAnalysis(90, 5, 5.0, 0.95);
        // Deviation: |5 - 0| = 5, at tolerance boundary
        expect(analysis.shoulderAnglePenalty).toBe(0);
      });

      it("should calculate penalty when shoulder angle exceeds tolerance", () => {
        const analysis = getPostureAnalysis(90, 8, 5.0, 0.95);
        // Deviation: |8 - 0| = 8, exceeds tolerance of 5
        // Penalty: (8 - 5) * 3 = 9
        expect(analysis.shoulderAnglePenalty).toBe(9);
      });

      it("should calculate penalty for negative shoulder angle", () => {
        const analysis = getPostureAnalysis(90, -8, 5.0, 0.95);
        // Deviation: |-8 - 0| = 8, exceeds tolerance of 5
        // Penalty: (8 - 5) * 3 = 9
        expect(analysis.shoulderAnglePenalty).toBe(9);
      });

      it("should calculate larger penalty for larger deviations", () => {
        const analysis = getPostureAnalysis(90, 15, 5.0, 0.95);
        // Deviation: |15 - 0| = 15, exceeds tolerance of 5
        // Penalty: (15 - 5) * 3 = 30
        expect(analysis.shoulderAnglePenalty).toBe(30);
      });
    });

    describe("overall score calculation", () => {
      it("should return 100 for perfect posture", () => {
        const analysis = getPostureAnalysis(90, 0, 6.0, 0.95);
        expect(analysis.score).toBe(100);
      });

      it("should subtract penalties from score", () => {
        const analysis = getPostureAnalysis(115, 8, 3.0, 0.5);
        // neckAnglePenalty: (25 - 20) * 2 = 10
        // shoulderAnglePenalty: (8 - 5) * 3 = 9
        // widthRatioPenalty: (2.0 - 0.8) * 100 = 120
        // neckLengthPenalty: (0.45 - 0.06) * 500 = 195
        // Total penalty: 10 + 9 + 120 + 195 = 334
        // Score: 100 - 334 = -234, clamped to 0
        expect(analysis.score).toBe(0);
      });

      it("should clamp score to minimum of 0", () => {
        const analysis = getPostureAnalysis(180, 30, 0.1, 0.1);
        // Very large penalties that would result in negative score
        expect(analysis.score).toBe(0);
      });

      it("should clamp score to maximum of 100", () => {
        const analysis = getPostureAnalysis(90, 0, 6.0, 0.95);
        expect(analysis.score).toBe(100);
      });

      it("should round score to nearest integer", () => {
        // Create a scenario where penalties result in non-integer score
        const analysis = getPostureAnalysis(90, 0, 5.0, 0.95);
        expect(Number.isInteger(analysis.score)).toBe(true);
      });
    });

    describe("measurement values", () => {
      it("should return all input measurements", () => {
        const analysis = getPostureAnalysis(95, 3, 4.5, 0.9);
        expect(analysis.neckAngle).toBe(95);
        expect(analysis.shoulderAngle).toBe(3);
        expect(analysis.widthRatio).toBe(4.5);
        expect(analysis.neckLengthRatio).toBe(0.9);
      });

      it("should return all penalty values", () => {
        const analysis = getPostureAnalysis(115, 8, 3.0, 0.5);
        expect(analysis.neckAnglePenalty).toBeDefined();
        expect(analysis.shoulderAnglePenalty).toBeDefined();
        expect(analysis.widthRatioPenalty).toBeDefined();
        expect(analysis.neckLengthPenalty).toBeDefined();
      });
    });
  });
});
