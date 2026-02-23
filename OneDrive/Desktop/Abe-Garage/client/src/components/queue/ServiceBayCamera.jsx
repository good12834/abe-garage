import React, { useState, useRef, useEffect } from "react";
import {
  FaVideo,
  FaVideoSlash,
  FaExpand,
  FaCompress,
  FaRecordVinyl,
  FaCamera,
  FaMicrophone,
  FaMicrophoneSlash,
  FaEye,
  FaEyeSlash,
  FaCog,
  FaWifi,
  FaSignal,
} from "react-icons/fa";
import "./ServiceBayCamera.css";

const ServiceBayCamera = ({
  bayId,
  bayName,
  isOccupied,
  vehicleInfo,
  onVideoToggle,
  onRecordingToggle,
  onScreenshot,
}) => {
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isMicrophoneEnabled, setIsMicrophoneEnabled] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoQuality, setVideoQuality] = useState("1080p");
  const [connectionStatus, setConnectionStatus] = useState("connected");
  const [viewerCount, setViewerCount] = useState(3);
  const [isNightVision, setIsNightVision] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [lastActivity, setLastActivity] = useState(new Date());

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const recordingInterval = useRef(null);

  // Mock video stream data
  const mockVideoSources = {
    1: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    2: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4",
    3: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4",
    default:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  };

  useEffect(() => {
    // Simulate connection status changes
    const connectionInterval = setInterval(() => {
      const statuses = ["connected", "connecting", "reconnecting"];
      const randomStatus =
        statuses[Math.floor(Math.random() * statuses.length)];
      if (Math.random() > 0.9) {
        // 10% chance of status change
        setConnectionStatus(randomStatus);
      }
    }, 5000);

    // Simulate viewer count changes
    const viewerInterval = setInterval(() => {
      const change = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
      setViewerCount((prev) => Math.max(0, prev + change));
    }, 10000);

    return () => {
      clearInterval(connectionInterval);
      clearInterval(viewerInterval);
    };
  }, []);

  useEffect(() => {
    if (isRecording) {
      recordingInterval.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(recordingInterval.current);
      setRecordingTime(0);
    }

    return () => {
      clearInterval(recordingInterval.current);
    };
  }, [isRecording]);

  const handleVideoToggle = () => {
    setIsVideoEnabled(!isVideoEnabled);
    onVideoToggle?.(bayId, !isVideoEnabled);
  };

  const handleRecordingToggle = () => {
    setIsRecording(!isRecording);
    onRecordingToggle?.(bayId, !isRecording);
    if (!isRecording) {
      setRecordingTime(0);
    }
  };

  const handleScreenshot = () => {
    if (canvasRef.current && videoRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext("2d");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `bay-${bayId}-screenshot-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
      });

      onScreenshot?.(bayId, blob);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatRecordingTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "#10b981";
      case "connecting":
        return "#f59e0b";
      case "reconnecting":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  return (
    <div className={`service-bay-camera ${isFullscreen ? "fullscreen" : ""}`}>
      {/* Video Container */}
      <div className="video-container">
        <video
          ref={videoRef}
          className={`camera-feed ${isNightVision ? "night-vision" : ""}`}
          autoPlay
          muted
          loop
          playsInline
        >
          <source
            src={mockVideoSources[bayId] || mockVideoSources.default}
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>

        {/* Video Overlay */}
        <div className="video-overlay">
          {/* Connection Status */}
          <div className="connection-indicator">
            <div
              className="status-dot"
              style={{ backgroundColor: getConnectionStatusColor() }}
            ></div>
            {connectionStatus === "connected" ? (
              <FaWifi className="connection-icon" />
            ) : (
              <FaSignal className="connection-icon" />
            )}
            <span className="connection-text">
              {connectionStatus.charAt(0).toUpperCase() +
                connectionStatus.slice(1)}
            </span>
          </div>

          {/* Recording Indicator */}
          {isRecording && (
            <div className="recording-indicator">
              <div className="recording-dot"></div>
              <span className="recording-text">
                REC {formatRecordingTime(recordingTime)}
              </span>
            </div>
          )}

          {/* Viewer Count */}
          <div className="viewer-count">
            <FaEye />
            <span>{viewerCount} watching</span>
          </div>

          {/* Bay Info */}
          <div className="bay-info-overlay">
            <h4>{bayName}</h4>
            {isOccupied && vehicleInfo && (
              <div className="vehicle-info">
                <span>
                  {vehicleInfo.year} {vehicleInfo.brand} {vehicleInfo.model}
                </span>
                <span className="license-plate">{vehicleInfo.plate}</span>
              </div>
            )}
          </div>
        </div>

        {/* Controls Overlay */}
        <div className="video-controls">
          <button
            className={`control-btn ${!isVideoEnabled ? "inactive" : ""}`}
            onClick={handleVideoToggle}
            title={isVideoEnabled ? "Turn off video" : "Turn on video"}
          >
            {isVideoEnabled ? <FaVideo /> : <FaVideoSlash />}
          </button>

          <button
            className={`control-btn ${!isMicrophoneEnabled ? "inactive" : ""}`}
            onClick={() => setIsMicrophoneEnabled(!isMicrophoneEnabled)}
            title={
              isMicrophoneEnabled ? "Mute microphone" : "Unmute microphone"
            }
          >
            {isMicrophoneEnabled ? <FaMicrophone /> : <FaMicrophoneSlash />}
          </button>

          <button
            className={`control-btn ${isRecording ? "recording" : ""}`}
            onClick={handleRecordingToggle}
            title={isRecording ? "Stop recording" : "Start recording"}
          >
            <FaRecordVinyl />
          </button>

          <button
            className="control-btn"
            onClick={handleScreenshot}
            title="Take screenshot"
          >
            <FaCamera />
          </button>

          <button
            className="control-btn"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? <FaCompress /> : <FaExpand />}
          </button>

          <div className="quality-selector">
            <select
              value={videoQuality}
              onChange={(e) => setVideoQuality(e.target.value)}
              className="quality-select"
            >
              <option value="720p">720p</option>
              <option value="1080p">1080p</option>
              <option value="4k">4K</option>
            </select>
          </div>
        </div>
      </div>

      {/* Camera Settings */}
      <div className="camera-settings">
        <div className="setting-item">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={isNightVision}
              onChange={(e) => setIsNightVision(e.target.checked)}
            />
            <span className="toggle-slider"></span>
            Night Vision
          </label>
        </div>

        <div className="setting-item">
          <span className="setting-label">Quality:</span>
          <select
            value={videoQuality}
            onChange={(e) => setVideoQuality(e.target.value)}
            className="setting-select"
          >
            <option value="720p">HD (720p)</option>
            <option value="1080p">Full HD (1080p)</option>
            <option value="4k">Ultra HD (4K)</option>
          </select>
        </div>

        <div className="setting-item">
          <span className="setting-label">Last Activity:</span>
          <span className="setting-value">
            {lastActivity.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Hidden canvas for screenshots */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
};

export default ServiceBayCamera;
