import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaBell,
  FaCheck,
  FaTrash,
  FaExclamationTriangle,
  FaInfoCircle,
  FaCheckCircle,
  FaClock,
  FaCog,
  FaFilter,
  FaEnvelope,
  FaCar,
  FaDollarSign,
  FaCalendarAlt,
  FaWrench,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import socketService from "../../services/socket";

const NotificationCenter = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, unread, urgent, system
  const [selectedNotifications, setSelectedNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
    setupSocketListeners();

    return () => {
      // Cleanup socket listeners
    };
  }, [user]);

  const setupSocketListeners = () => {
    // Listen for real-time notifications
    socketService.onNotification((notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);

      // Mock notifications data
      const mockNotifications = [
        {
          id: 1,
          type: "appointment",
          title: "Appointment Approved",
          message:
            "Your oil change appointment for tomorrow at 2:00 PM has been approved.",
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          read: false,
          priority: "high",
          action_url: "/customer/appointments/123",
          icon: <FaCalendarAlt className="text-primary" />,
        },
        {
          id: 2,
          type: "payment",
          title: "Payment Received",
          message:
            "Payment of $85.00 for your recent brake service has been processed successfully.",
          created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
          read: false,
          priority: "medium",
          action_url: "/customer/invoices",
          icon: <FaDollarSign className="text-success" />,
        },
        {
          id: 3,
          type: "maintenance",
          title: "Maintenance Reminder",
          message:
            "Your vehicle is due for a tire rotation. Schedule now to maintain optimal performance.",
          created_at: new Date(
            Date.now() - 1 * 24 * 60 * 60 * 1000
          ).toISOString(), // 1 day ago
          read: true,
          priority: "medium",
          action_url: "/book-appointment?service=tire_rotation",
          icon: <FaCar className="text-warning" />,
        },
        {
          id: 4,
          type: "system",
          title: "System Update",
          message:
            "New features added to your dashboard: AI-powered cost predictions and maintenance reminders.",
          created_at: new Date(
            Date.now() - 2 * 24 * 60 * 60 * 1000
          ).toISOString(), // 2 days ago
          read: true,
          priority: "low",
          action_url: "/changelog",
          icon: <FaCog className="text-info" />,
        },
        {
          id: 5,
          type: "service",
          title: "Service Completed",
          message:
            "Your brake inspection service has been completed. Vehicle is ready for pickup.",
          created_at: new Date(
            Date.now() - 3 * 24 * 60 * 60 * 1000
          ).toISOString(), // 3 days ago
          read: true,
          priority: "high",
          action_url: "/customer/appointments/122",
          icon: <FaWrench className="text-success" />,
        },
        {
          id: 6,
          type: "urgent",
          title: "Critical Vehicle Issue",
          message:
            "Our diagnostic scan detected a potential transmission issue. Please schedule service immediately.",
          created_at: new Date(
            Date.now() - 4 * 24 * 60 * 60 * 1000
          ).toISOString(), // 4 days ago
          read: false,
          priority: "urgent",
          action_url: "/emergency-service",
          icon: <FaExclamationTriangle className="text-danger" />,
        },
        {
          id: 7,
          type: "billing",
          title: "Invoice Available",
          message:
            "New invoice #INV-2024-001 is available for your recent service visit.",
          created_at: new Date(
            Date.now() - 5 * 24 * 60 * 60 * 1000
          ).toISOString(), // 5 days ago
          read: true,
          priority: "medium",
          action_url: "/customer/invoices",
          icon: <FaEnvelope className="text-primary" />,
        },
      ];

      setTimeout(() => {
        setNotifications(mockNotifications);
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setLoading(false);
    }
  };

  const markAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (notificationId) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== notificationId)
    );
  };

  const toggleNotificationSelection = (notificationId) => {
    setSelectedNotifications((prev) =>
      prev.includes(notificationId)
        ? prev.filter((id) => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const deleteSelectedNotifications = () => {
    setNotifications((prev) =>
      prev.filter(
        (notification) => !selectedNotifications.includes(notification.id)
      )
    );
    setSelectedNotifications([]);
  };

  const getNotificationTypeColor = (type) => {
    switch (type) {
      case "urgent":
        return "#ef4444"; // red
      case "appointment":
        return "#3b82f6"; // blue
      case "payment":
        return "#10b981"; // green
      case "maintenance":
        return "#f59e0b"; // amber
      case "service":
        return "#8b5cf6"; // purple
      case "billing":
        return "#06b6d4"; // cyan
      case "system":
        return "#6b7280"; // gray
      default:
        return "#6b7280";
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "urgent":
        return <FaExclamationTriangle className="text-danger" />;
      case "high":
        return <FaBell className="text-warning" />;
      case "medium":
        return <FaInfoCircle className="text-primary" />;
      case "low":
        return <FaClock className="text-secondary" />;
      default:
        return <FaInfoCircle className="text-secondary" />;
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffHours < 1) {
      return "Just now";
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    switch (filter) {
      case "unread":
        return !notification.read;
      case "urgent":
        return (
          notification.priority === "urgent" || notification.priority === "high"
        );
      case "system":
        return notification.type === "system";
      default:
        return true;
    }
  });

  const unreadCount = notifications.filter((n) => !n.read).length;
  const urgentCount = notifications.filter(
    (n) => n.priority === "urgent" || n.priority === "high"
  ).length;

  const getFilterCount = (filterType) => {
    switch (filterType) {
      case "unread":
        return unreadCount;
      case "urgent":
        return urgentCount;
      case "system":
        return notifications.filter((n) => n.type === "system").length;
      default:
        return notifications.length;
    }
  };

  if (loading) {
    return (
      <div className="card h-100">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h6 className="mb-0">
            <FaBell className="me-2 text-primary" />
            Notification Center
          </h6>
        </div>
        <div className="card-body text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card h-100">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h6 className="mb-0">
          <FaBell className="me-2 text-primary" />
          Notification Center
          {unreadCount > 0 && (
            <span className="badge bg-danger ms-2">{unreadCount}</span>
          )}
        </h6>
        <div className="d-flex align-items-center gap-2">
          {selectedNotifications.length > 0 && (
            <button
              onClick={deleteSelectedNotifications}
              className="btn btn-outline-danger btn-sm"
            >
              <FaTrash className="me-1" />
              Delete ({selectedNotifications.length})
            </button>
          )}
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="btn btn-outline-success btn-sm"
            >
              <FaCheck className="me-1" />
              Mark All Read
            </button>
          )}
          <div className="dropdown">
            <button
              className="btn btn-outline-secondary btn-sm dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
            >
              <FaFilter className="me-1" />
              {filter === "all"
                ? "All"
                : filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
            <ul className="dropdown-menu">
              <li>
                <button
                  className={`dropdown-item ${
                    filter === "all" ? "active" : ""
                  }`}
                  onClick={() => setFilter("all")}
                >
                  All ({getFilterCount("all")})
                </button>
              </li>
              <li>
                <button
                  className={`dropdown-item ${
                    filter === "unread" ? "active" : ""
                  }`}
                  onClick={() => setFilter("unread")}
                >
                  Unread ({getFilterCount("unread")})
                </button>
              </li>
              <li>
                <button
                  className={`dropdown-item ${
                    filter === "urgent" ? "active" : ""
                  }`}
                  onClick={() => setFilter("urgent")}
                >
                  Urgent ({getFilterCount("urgent")})
                </button>
              </li>
              <li>
                <button
                  className={`dropdown-item ${
                    filter === "system" ? "active" : ""
                  }`}
                  onClick={() => setFilter("system")}
                >
                  System ({getFilterCount("system")})
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="card-body p-0">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-5">
            <FaBell className="text-muted mb-2" style={{ fontSize: "3rem" }} />
            <p className="text-muted mb-0">
              No notifications for the selected filter
            </p>
          </div>
        ) : (
          <div
            className="notifications-list"
            style={{ maxHeight: "400px", overflowY: "auto" }}
          >
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item d-flex align-items-start p-3 border-bottom ${
                  !notification.read ? "bg-light" : ""
                }`}
              >
                <div className="form-check me-3 mt-1">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={selectedNotifications.includes(notification.id)}
                    onChange={() =>
                      toggleNotificationSelection(notification.id)
                    }
                  />
                </div>

                <div className="notification-content flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start mb-1">
                    <div className="d-flex align-items-center">
                      {notification.icon}
                      <h6 className="ms-2 mb-0">{notification.title}</h6>
                      {!notification.read && (
                        <div className="unread-indicator ms-2"></div>
                      )}
                    </div>
                    <div className="d-flex align-items-center">
                      {getPriorityIcon(notification.priority)}
                      <small className="text-muted ms-2">
                        {formatTimeAgo(notification.created_at)}
                      </small>
                    </div>
                  </div>

                  <p className="text-muted mb-2 small">
                    {notification.message}
                  </p>

                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex gap-2">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="btn btn-outline-success btn-sm"
                        >
                          <FaCheck className="me-1" />
                          Mark Read
                        </button>
                      )}
                      {notification.action_url && (
                        <Link
                          to={notification.action_url}
                          className="btn btn-outline-primary btn-sm"
                        >
                          View Details
                        </Link>
                      )}
                    </div>
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="btn btn-outline-danger btn-sm"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredNotifications.length > 0 && (
          <div className="text-center p-3 border-top">
            <Link
              to="/notifications"
              className="btn btn-outline-primary btn-sm"
            >
              View All Notifications ({notifications.length})
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;
