import {
  PoseLandmarker,
  FilesetResolver,
  DrawingUtils,
  type NormalizedLandmark,
} from "@mediapipe/tasks-vision";

let poseLandmarker: PoseLandmarker | null = null;
let animationFrameId: number | null = null;

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
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: 640, height: 480 },
  });
  videoElement.srcObject = stream;
  await videoElement.play();

  // Process video frames
  const detectPose = async () => {
    if (!poseLandmarker || !videoElement) return;

    const startTimeMs = performance.now();
    const results = poseLandmarker.detectForVideo(videoElement, startTimeMs);

    // Convert results to match old API format
    const convertedResults: PoseResults = {
      image: videoElement,
      poseLandmarks: results.landmarks[0], // Get first pose landmarks
    };

    onResults(convertedResults);

    animationFrameId = requestAnimationFrame(detectPose);
  };

  detectPose();
};

export const stopPoseDetection = () => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  if (poseLandmarker) {
    poseLandmarker.close();
    poseLandmarker = null;
  }
};

export { DrawingUtils };
