import React, { useState, useEffect } from "react";
import { FaSignal, FaExclamationTriangle } from "react-icons/fa";

const FloatingLiveIndicator = ({
  isConnected = true,
  position = "top-right",
  size = "large",
  showLabel = true,
  animate = true,
  className = "",
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [blinkState, setBlinkState] = useState(false);

  useEffect(() => {
    if (animate && isConnected) {
      const blinkInterval = setInterval(() => {
        setBlinkState((prev) => !prev);
      }, 1000);
      return () => clearInterval(blinkInterval);
    }
  }, [animate, isConnected]);

  const getPositionClasses = () => {
    switch (position) {
      case "top-left":
        return "floating-live-top-left";
      case "top-right":
        return "floating-live-top-right";
      case "bottom-left":
        return "floating-live-bottom-left";
      case "bottom-right":
        return "floating-live-bottom-right";
      default:
        return "floating-live-top-right";
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "small":
        return "floating-live-small";
      case "medium":
        return "floating-live-medium";
      case "large":
        return "floating-live-large";
      case "xl":
        return "floating-live-xl";
      default:
        return "floating-live-large";
    }
  };

  return (
    <div
      className={`floating-live-indicator ${getPositionClasses()} ${getSizeClasses()} ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? "auto" : "none",
      }}
    >
      <div className="floating-live-content">
        {/* Outer Glow Ring */}
        <div className="floating-live-glow"></div>

        {/* Inner Pulsing Ring */}
        <div className="floating-live-pulse-ring"></div>

        {/* Main Status Circle */}
        <div
          className={`floating-live-circle ${
            isConnected ? "connected" : "disconnected"
          }`}
        >
          <div className="floating-live-icon-container">
            {isConnected ? (
              <FaSignal className="floating-live-icon" />
            ) : (
              <FaExclamationTriangle className="floating-live-icon" />
            )}
          </div>

          {/* Animated Border */}
          <div className="floating-live-border"></div>
        </div>

        {/* Status Text */}
        {showLabel && (
          <div className="floating-live-label">
            <span
              className={`floating-live-text ${
                isConnected ? "connected" : "disconnected"
              }`}
            >
              {isConnected ? "LIVE" : "OFFLINE"}
            </span>
            <div className="floating-live-timestamp">
              {new Date().toLocaleTimeString()}
            </div>
          </div>
        )}

        {/* Particle Effects */}
        {isConnected && (
          <div className="floating-live-particles">
            {Array.from({ length: 12 }, (_, i) => (
              <div
                key={i}
                className={`floating-live-particle particle-${i}`}
                style={{
                  "--delay": `${i * 0.3}s`,
                  "--duration": `${2 + (i % 3) * 0.5}s`,
                }}
              ></div>
            ))}
          </div>
        )}

        {/* Blinking Effect */}
        {animate && isConnected && blinkState && (
          <div className="floating-live-blink"></div>
        )}
      </div>

      {/* Hide/Show Toggle */}
      <button
        className="floating-live-toggle"
        onClick={() => setIsVisible(!isVisible)}
        title={isVisible ? "Hide Indicator" : "Show Indicator"}
      >
        {isVisible ? "−" : "+"}
      </button>
    </div>
  );
};

export default FloatingLiveIndicator;
