import React, { useState, useEffect } from "react";
import {
  FaBell,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaTimes,
  FaCog,
} from "react-icons/fa";

const NotificationSystem = ({
  isEnabled = true,
  onNotificationClick,
  position = "top-right",
}) => {
  const [notifications, setNotifications] = useState([]);
  const [permission, setPermission] = useState("default");
  const [isEnabledState, setIsEnabledState] = useState(isEnabled);
  const [showSettings, setShowSettings] = useState(false);

  // Request notification permission on component mount
  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // Auto-remove notifications after 5 seconds
  useEffect(() => {
    const timers = notifications.map((notification) =>
      setTimeout(() => {
        removeNotification(notification.id);
      }, notification.duration || 5000)
    );

    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [notifications]);

  const requestPermission = async () => {
    if ("Notification" in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === "granted";
    }
    return false;
  };

  const showBrowserNotification = (title, options) => {
    if (permission === "granted" && isEnabledState) {
      const notification = new Notification(title, {
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        ...options,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
        if (onNotificationClick) {
          onNotificationClick(options.data);
        }
      };

      return notification;
    }
  };

  const addNotification = (type = "info", title, message, options = {}) => {
    const id = Date.now() + Math.random();
    const notification = {
      id,
      type,
      title,
      message,
      timestamp: new Date(),
      duration: options.duration || 5000,
      actions: options.actions || [],
      data: options.data || {},
    };

    setNotifications((prev) => [...prev, notification]);

    // Show browser notification
    if (permission === "granted") {
      const iconMap = {
        success: "/icons/success.png",
        warning: "/icons/warning.png",
        error: "/icons/error.png",
        info: "/icons/info.png",
      };

      showBrowserNotification(title, {
        body: message,
        icon: iconMap[type] || "/icons/info.png",
        data: options.data || {},
      });
    }

    return id;
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return <FaCheckCircle className="notification-icon success" />;
      case "warning":
        return <FaExclamationTriangle className="notification-icon warning" />;
      case "error":
        return <FaExclamationTriangle className="notification-icon error" />;
      default:
        return <FaInfoCircle className="notification-icon info" />;
    }
  };

  const getNotificationStyle = (type) => {
    const baseStyle = "notification-item";
    return `${baseStyle} notification-${type}`;
  };

  // Service-related notification creators
  const notifyServiceStarted = (vehicleInfo, bayNumber) => {
    return addNotification(
      "success",
      "Service Started",
      `Your ${vehicleInfo.brand} ${vehicleInfo.model} service has begun in Bay ${bayNumber}`,
      {
        data: { type: "service_started", vehicleInfo, bayNumber },
        actions: [
          { label: "View Details", action: "view_details" },
          { label: "Chat", action: "open_chat" },
        ],
      }
    );
  };

  const notifyServiceCompleted = (vehicleInfo) => {
    return addNotification(
      "success",
      "Service Completed",
      `Your ${vehicleInfo.brand} ${vehicleInfo.model} service is complete!`,
      {
        data: { type: "service_completed", vehicleInfo },
        actions: [
          { label: "View Report", action: "view_report" },
          { label: "Pay Now", action: "payment" },
        ],
      }
    );
  };

  const notifyDelay = (newEstimate, reason) => {
    return addNotification(
      "warning",
      "Service Delay",
      `Service delayed by ${newEstimate} minutes${reason ? `: ${reason}` : ""}`,
      {
        data: { type: "service_delay", newEstimate, reason },
        actions: [{ label: "Get Details", action: "view_details" }],
      }
    );
  };

  const notifyReadyForPickup = (vehicleInfo) => {
    return addNotification(
      "info",
      "Ready for Pickup",
      `Your ${vehicleInfo.brand} ${vehicleInfo.model} is ready for pickup`,
      {
        data: { type: "ready_for_pickup", vehicleInfo },
        actions: [
          { label: "Get Directions", action: "directions" },
          { label: "Schedule Pickup", action: "schedule_pickup" },
        ],
      }
    );
  };

  const notifyPaymentRequired = (amount, services) => {
    return addNotification(
      "info",
      "Payment Required",
      `Payment of $${amount} required for ${services.join(", ")}`,
      {
        data: { type: "payment_required", amount, services },
        actions: [
          { label: "Pay Now", action: "payment" },
          { label: "View Details", action: "view_details" },
        ],
      }
    );
  };

  const handleActionClick = (action, notificationData) => {
    if (onNotificationClick) {
      onNotificationClick({ action, data: notificationData });
    }
    removeNotification(notificationData.id);
  };

  if (!isEnabledState) {
    return (
      <div className="notification-settings">
        <button
          className="settings-toggle"
          onClick={() => setShowSettings(!showSettings)}
          title="Notification Settings"
        >
          <FaBell />
        </button>

        {showSettings && (
          <div className="notification-settings-panel">
            <h4>Notification Settings</h4>
            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={isEnabledState}
                  onChange={(e) => setIsEnabledState(e.target.checked)}
                />
                Enable Notifications
              </label>
            </div>

            {permission !== "granted" && (
              <div className="setting-item">
                <button className="permission-btn" onClick={requestPermission}>
                  Enable Browser Notifications
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  const positionClasses = {
    "top-right": "notifications-container top-right",
    "top-left": "notifications-container top-left",
    "bottom-right": "notifications-container bottom-right",
    "bottom-left": "notifications-container bottom-left",
  };

  return (
    <div className={positionClasses[position]}>
      {/* Settings Toggle */}
      <div className="notification-settings">
        <button
          className="settings-toggle"
          onClick={() => setShowSettings(!showSettings)}
          title="Notification Settings"
        >
          <FaCog />
        </button>

        {showSettings && (
          <div className="notification-settings-panel">
            <h4>Notification Settings</h4>
            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={isEnabledState}
                  onChange={(e) => setIsEnabledState(e.target.checked)}
                />
                Enable Notifications
              </label>
            </div>

            {permission !== "granted" && (
              <div className="setting-item">
                <button className="permission-btn" onClick={requestPermission}>
                  Enable Browser Notifications
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Notification Badge */}
      {notifications.length > 0 && (
        <div className="notification-badge">
          <FaBell />
          <span className="badge-count">{notifications.length}</span>
        </div>
      )}

      {/* Notifications List */}
      <div className="notifications-list">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={getNotificationStyle(notification.type)}
            onClick={() => handleActionClick("view", notification)}
          >
            <div className="notification-content">
              <div className="notification-header">
                {getNotificationIcon(notification.type)}
                <h4 className="notification-title">{notification.title}</h4>
                <button
                  className="notification-close"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeNotification(notification.id);
                  }}
                >
                  <FaTimes />
                </button>
              </div>

              <p className="notification-message">{notification.message}</p>

              {notification.actions.length > 0 && (
                <div className="notification-actions">
                  {notification.actions.map((action, idx) => (
                    <button
                      key={idx}
                      className="notification-action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleActionClick(action.action, notification);
                      }}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="notification-timestamp">
              {notification.timestamp.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Create a notification API for global access
const notificationAPI = {
  addNotification: null,
  removeNotification: null,
  notifyServiceStarted: null,
  notifyServiceCompleted: null,
  notifyDelay: null,
  notifyReadyForPickup: null,
  notifyPaymentRequired: null,
  requestPermission: null,
};

// Export the component and API
export default NotificationSystem;
export { notificationAPI };
