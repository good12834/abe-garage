import React from "react";
import { FaSignal, FaWifi, FaExclamationTriangle } from "react-icons/fa";

const LiveStatusIndicator = ({
  isConnected = true,
  showText = true,
  size = "medium",
  variant = "default",
  pulse = true,
  className = "",
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case "small":
        return "w-2 h-2";
      case "large":
        return "w-4 h-4";
      default:
        return "w-3 h-3";
    }
  };

  const getTextSize = () => {
    switch (size) {
      case "small":
        return "text-xs";
      case "large":
        return "text-sm";
      default:
        return "text-xs";
    }
  };

  const getContainerClasses = () => {
    const baseClasses = "live-status-indicator";
    const statusClasses = isConnected
      ? "live-status-connected"
      : "live-status-disconnected";
    const pulseClasses = pulse && isConnected ? "live-status-pulse" : "";

    return `${baseClasses} ${statusClasses} ${pulseClasses} ${className}`;
  };

  return (
    <div className={getContainerClasses()}>
      <div className="live-status-dot-container">
        <div className={`live-status-dot ${getSizeClasses()}`}>
          {isConnected ? (
            <FaSignal className="live-status-icon" />
          ) : (
            <FaExclamationTriangle className="live-status-icon" />
          )}
        </div>
        {showText && (
          <span className={`live-status-text ${getTextSize()}`}>
            {isConnected ? "Live" : "Offline"}
          </span>
        )}
      </div>
    </div>
  );
};

export default LiveStatusIndicator;
