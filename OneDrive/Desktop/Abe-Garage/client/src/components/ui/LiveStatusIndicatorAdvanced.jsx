import React, { useState, useEffect } from "react";
import {
  FaSignal,
  FaWifi,
  FaExclamationTriangle,
  FaCircle,
} from "react-icons/fa";

const LiveStatusIndicatorAdvanced = ({
  isConnected = true,
  showText = true,
  size = "medium",
  variant = "neon",
  pulse = true,
  bounce = false,
  rotate = false,
  sound = false,
  className = "",
}) => {
  const [soundEnabled, setSoundEnabled] = useState(sound);
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    if (bounce || rotate) {
      const interval = setInterval(() => {
        setAnimationPhase((prev) => (prev + 1) % 360);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [bounce, rotate]);

  const playNotificationSound = () => {
    if (soundEnabled && isConnected) {
      try {
        const audioContext = new (window.AudioContext ||
          window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(a);

        oscillatorudioContext.destination.frequency.setValueAtTime(
          800,
          audioContext.currentTime
        );
        oscillator.type = "sine";

        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.3
        );

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      } catch (error) {
        console.log("Audio not supported");
      }
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "small":
        return "w-3 h-3";
      case "large":
        return "w-6 h-6";
      case "xl":
        return "w-8 h-8";
      default:
        return "w-4 h-4";
    }
  };

  const getTextSize = () => {
    switch (size) {
      case "small":
        return "text-xs";
      case "large":
        return "text-base";
      case "xl":
        return "text-lg";
      default:
        return "text-sm";
    }
  };

  const getContainerClasses = () => {
    const baseClasses = "live-status-indicator-advanced";
    const variantClasses = `variant-${variant}`;
    const animationClasses = [
      pulse && "live-pulse-advanced",
      bounce && "live-bounce-advanced",
      rotate && "live-rotate-advanced",
    ]
      .filter(Boolean)
      .join(" ");

    return `${baseClasses} ${variantClasses} ${animationClasses} ${className}`;
  };

  const getIconElement = () => {
    const iconClass = `live-status-icon-advanced ${getSizeClasses()}`;

    if (isConnected) {
      return <FaSignal className={iconClass} />;
    } else {
      return <FaExclamationTriangle className={iconClass} />;
    }
  };

  return (
    <div className={getContainerClasses()}>
      <div className="live-status-container-advanced">
        {/* Outer Ring Effects */}
        <div className="live-ring-outer"></div>
        <div className="live-ring-middle"></div>
        <div className="live-ring-inner"></div>

        {/* Main Status Dot */}
        <div
          className="live-status-dot-advanced"
          onClick={playNotificationSound}
        >
          {getIconElement()}
        </div>

        {/* Particle Effects */}
        <div className="live-particles">
          {Array.from({ length: 8 }, (_, i) => (
            <div
              key={i}
              className={`live-particle particle-${i}`}
              style={{
                "--delay": `${i * 0.2}s`,
                "--angle": `${i * 45}deg`,
              }}
            ></div>
          ))}
        </div>

        {/* Status Text */}
        {showText && (
          <span className={`live-status-text-advanced ${getTextSize()}`}>
            {isConnected ? (
              <span className="live-text-connected">
                <FaCircle className="live-text-dot" />
                LIVE
              </span>
            ) : (
              <span className="live-text-disconnected">OFFLINE</span>
            )}
          </span>
        )}
      </div>

      {/* Sound Toggle */}
      {sound && (
        <button
          className="sound-toggle-btn"
          onClick={() => setSoundEnabled(!soundEnabled)}
          title={soundEnabled ? "Sound On" : "Sound Off"}
        >
          {soundEnabled ? "🔊" : "🔇"}
        </button>
      )}
    </div>
  );
};

export default LiveStatusIndicatorAdvanced;
