# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository. Use this in conjuction with AGENT.md.

## Project Overview

Posture Cop is a real-time posture monitoring application that runs 100% client-side in the browser using MediaPipe's Pose Landmarker. The application uses computer vision to track neck and spine alignment, calculates a posture score (0-100), and provides visual and audio alerts for poor posture.

## Development Commands

```bash
# Install dependencies
npm install

# Development server (with turbo mode)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Run tests (Jest with React Testing Library, coverage enabled)
npm test

# Type check
npx tsc
```

## Architecture

### Data Flow

1. **Camera Feed** (`src/components/camera_feed.tsx`): Manages video capture and pose detection

   - Uses `useEffect` to start/stop MediaPipe pose detection based on `isActive` prop
   - Calls `startPoseDetection()` which initializes PoseLandmarker with GPU delegate
   - Processes video frames continuously via `requestAnimationFrame`
   - Extracts pose landmarks and passes them to posture calculation functions
   - Draws skeleton overlay on canvas using MediaPipe's DrawingUtils
   - Propagates posture analysis results and alerts to parent via callbacks

2. **Posture Logic** (`src/lib/posture_logic.ts`): Pure functions for posture calculations

   - Takes MediaPipe landmarks (33-point pose model) as input
   - Calculates 4 measurements from specific landmark indices:
     - `neckAngle`: Angle between ear midpoint and shoulder midpoint (ideal: ~90°)
     - `shoulderAngle`: Tilt of shoulder line from horizontal (ideal: ~0°)
     - `shouldersEyesWidthRatio`: Shoulder width / eye width ratio (ideal: ~6.0, decreases when leaning forward)
     - `neckLengthRatio`: Vertical distance from eyes to shoulders / shoulder width (ideal: ~0.95)
   - Each measurement has a configurable penalty calculation with `idealValue`, `tolerance`, and `penaltyFactor`
   - Returns `PostureAnalysis` object with score (100 minus all penalties) and detailed breakdown

3. **MediaPipe Integration** (`src/lib/mediapipe.ts`): Wrapper for MediaPipe pose detection

   - Loads PoseLandmarker model from CDN (lite model, float16, GPU-accelerated)
   - Manages video stream lifecycle (getUserMedia)
   - Runs pose detection on each frame using `detectForVideo()`
   - Converts MediaPipe results to internal format
   - Provides cleanup via `stopPoseDetection()` to cancel animation frames and close resources

4. **Main Page** (`src/app/page.tsx`): Orchestrates all components
   - Maintains global state: `monitoring`, `postureAnalysis`, `alert`
   - Passes down callbacks to receive updates from CameraFeed
   - Displays PostureScore panel with live metrics
   - Shows AlertPopup when score drops below 70

### Key Landmark Indices

MediaPipe returns 33 pose landmarks. This app uses:

- Eyes: `[2]` = left eye inner, `[5]` = right eye inner
- Ears: `[7]` = left ear, `[8]` = right ear
- Shoulders: `[11]` = left shoulder, `[12]` = right shoulder

These indices are hardcoded in `posture_logic.ts` calculation functions.

### Penalty Configuration

The default penalty config in `posture_logic.ts` is tuned for typical webcam usage:

- Neck angle penalty factor: 2 (moderate)
- Shoulder angle penalty factor: 3 (stricter on shoulder tilt)
- Width ratio penalty factor: 50 (very sensitive to forward leaning)
- Neck length penalty factor: 500 (extremely sensitive to slouching)

Adjust these in `DEFAULT_PENALTY_CONFIG` to change sensitivity.

## Testing

- Test files use `*_test.ts` or `*_test.tsx` naming convention (e.g., `posture_logic_test.ts`)
- Jest is configured with ts-jest preset and jsdom environment
- Coverage is enabled by default
- Tests run with: `npm test` or `npx jest --testMatch="**/*test.{ts,tsx}" --preset=ts-jest --testEnvironment=jsdom --coverage`

## Pre-commit Hooks

Husky is configured to run lint-staged on pre-commit:

- Automatically runs `eslint --fix` on staged `.js`, `.jsx`, `.ts`, `.tsx` files
- See `.husky/pre-commit` and `lint-staged` config in `package.json`

## Important Notes

- **Client-side only**: All processing happens in the browser using WebRTC and WebAssembly. No video is uploaded to any server.
- **MediaPipe CDN dependencies**: The app loads MediaPipe WASM files and the pose model from CDN at runtime. Network access is required on first load.
- **React Compiler enabled**: Next.js config has `reactCompiler: true` for optimized re-renders.
- **GPU acceleration**: MediaPipe uses GPU delegate when available for better performance.
- **Model initialization**: PoseLandmarker takes ~1-2 seconds to initialize on first use. The app does not show a loading state for this currently.
