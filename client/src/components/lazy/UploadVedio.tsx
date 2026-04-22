import { useRef, useState } from "react";
import { API_ROUTES } from "../../lib/api";
import { Video } from "lucide-react";

const UploadVideo = ({
  videoUrl,
  setVideoUrl,
  setVideoDuration,
  width,
  height,
  text,
}: {
  videoUrl: string | null | undefined;
  setVideoUrl: Function;
  setVideoDuration: Function;
  width?: number | "full";
  height?: number | "full";
  text?: string;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<
    "idle" | "uploading" | "uploaded" | "error"
  >("idle");
  const [progress, setProgress] = useState<number>(0);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile || !selectedFile.type.startsWith("video/")) {
      alert("Please select a valid video file.");
      return;
    }

    const previewURL = URL.createObjectURL(selectedFile);
    setPreview(previewURL);
    setUploadState("uploading");
    setProgress(0);

    // ✅ Extract duration with proper metadata loading
    const tempVideo = document.createElement("video");
    tempVideo.preload = "metadata";
    tempVideo.src = previewURL;

    // Wait for metadata to load
    tempVideo.onloadedmetadata = () => {
      try {
        const durationSec = Math.round(tempVideo.duration);
        if (durationSec > 0) {
          setVideoDuration(durationSec); // ✅ send back duration in seconds
        } else {
          console.warn(
            "Duration is 0, video metadata may not have loaded properly"
          );
          setVideoDuration(1); // ✅ fallback to 1 second
        }
      } catch (err) {
        console.error("Error extracting duration:", err);
        setVideoDuration(1);
      }
    };

    tempVideo.onerror = () => {
      console.error("Error loading video metadata");
      setVideoDuration(1);
      URL.revokeObjectURL(tempVideo.src);
    };

    try {
      const sanitizedFileName = selectedFile.name.replace(
        /[^a-zA-Z0-9._-]/g,
        "_"
      );
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("fileName", sanitizedFileName);

      // Keep XMLHttpRequest for upload progress tracking
      const xhr = new XMLHttpRequest();
      xhr.open("POST", API_ROUTES.UPLOAD.PRE_SIGNED_URL, true);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setProgress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const { fileUrl } = JSON.parse(xhr.responseText);
          setVideoUrl(fileUrl);
          setProgress(100);
          setUploadState("uploaded");
        } else {
          setUploadState("error");
        }
      };

      xhr.onerror = () => {
        setUploadState("error");
      };

      xhr.send(formData);
    } catch (err) {
      console.error(err);
      setUploadState("error");
    }
  };

  return (
    <div
      className="flex flex-col items-center gap-2 w-fit"
      style={{
        width: width === "full" ? "100%" : `${width}px`,
        height: height === "full" ? "100%" : `${height}px`,
      }}
    >
      <div
        onClick={() => fileInputRef.current?.click()}
        className={`bg-gradient-to-br from-[var(--muted)] to-[var(--primary)]/50 rounded-xl p-6 border-2 border-dashed border-[var(--border)] hover:border-[var(--primary)] transition-colors duration-200 aspect-video ${
          uploadState === "uploading"
            ? "animate-pulse border-[var(--primary)]"
            : "border-[var(--border)]"
        }`}
        style={{
          width: width === "full" ? "100%" : `${width}px`,
          height: height === "full" ? "100%" : `${height}px`,
        }}
      >
        {preview || videoUrl ? (
          <video
            src={preview || videoUrl!}
            controls
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <div className="flex flex-col items-center gap-4 justify-center h-full">
            <Video size={48} className="text-[var(--muted-foreground)] mb-2" />
            <span className="text-sm text-[var(--muted-foreground)] whitespace-wrap">
              {text || "Click to upload video"}
            </span>
          </div>
        )}
      </div>

      <input
        type="file"
        accept="video/*"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
      />

      {uploadState === "uploading" && (
        <p className="text-[var(--primary)] text-sm">
          Uploading... {progress}%
        </p>
      )}
      {uploadState === "uploaded" && (
        <p className="text-[var(--primary)] text-sm">Uploaded successfully!</p>
      )}
      {uploadState === "error" && (
        <p className="text-[var(--destructive)] text-sm">
          Upload failed. Try again.
        </p>
      )}
    </div>
  );
};

export default UploadVideo;
