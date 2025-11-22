import {
  PoseLandmarker,
  FilesetResolver,
  DrawingUtils,
  type NormalizedLandmark,
} from "@mediapipe/tasks-vision";

let poseLandmarker: PoseLandmarker | null = null;
let animationFrameId: number | null = null;
let videoStream: MediaStream | null = null;

/** Results from the pose detection. */
interface PoseResults {
  image: HTMLVideoElement;
  poseLandmarks: NormalizedLandmark[];
}

export const startPoseDetection = async (
  videoElement: HTMLVideoElement,
  onResults: (results: PoseResults) => void
) => {
  // Initialize the PoseLandmarker
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );

  poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    numPoses: 1,
    minPoseDetectionConfidence: 0.7,
    minPosePresenceConfidence: 0.7,
    minTrackingConfidence: 0.7,
  });

  // Start video stream
  videoStream = await navigator.mediaDevices.getUserMedia({
    video: { width: 640, height: 480 },
  });
  videoElement.srcObject = videoStream;
  await videoElement.play();

  // Process video frames with throttling (15fps instead of 60fps)
  const targetFps = 15;
  const frameDelay = 1000 / targetFps; // ~66ms between frames
  let lastFrameTime = 0;

  const detectPose = async () => {
    if (!poseLandmarker || !videoElement) return;

    const now = performance.now();
    const timeSinceLastFrame = now - lastFrameTime;

    // Only process frame if enough time has passed
    if (timeSinceLastFrame >= frameDelay) {
      lastFrameTime = now;

      const results = poseLandmarker.detectForVideo(videoElement, now);

      // Convert results to match old API format
      const convertedResults: PoseResults = {
        image: videoElement,
        poseLandmarks: results.landmarks[0], // Get first pose landmarks
      };

      onResults(convertedResults);
    }

    animationFrameId = requestAnimationFrame(detectPose);
  };

  detectPose();
};

export const stopPoseDetection = () => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  if (videoStream) {
    videoStream.getTracks().forEach((track) => track.stop());
    videoStream = null;
  }
  if (poseLandmarker) {
    poseLandmarker.close();
    poseLandmarker = null;
  }
};

export { DrawingUtils };
