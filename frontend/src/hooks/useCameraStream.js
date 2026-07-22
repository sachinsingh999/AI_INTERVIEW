import { useInterview } from "../context/InterviewContext";
import { toast } from "../utils/toast";

export function useCameraStream() {
  const { cameraOn, setCameraOn, videoRef, streamRef } = useInterview();

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraOn(true);
    } catch {
      toast.error("Please authorize microphone and webcam permissions in browser.", "Media Blocked");
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraOn(false);
  };

  return { cameraOn, startCamera, stopCamera, videoRef };
}
