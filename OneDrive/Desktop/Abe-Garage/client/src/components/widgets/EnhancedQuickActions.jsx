import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./EnhancedQuickActions.css";
import {
  FaCalendarPlus,
  FaDownload,
  FaCar,
  FaCog,
  FaPhone,
  FaMapMarkerAlt,
  FaBell,
  FaCreditCard,
  FaHistory,
  FaTools,
  FaChartLine,
  FaCamera,
  FaQrcode,
  FaShieldAlt,
  FaStar,
  FaQuestionCircle,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

const EnhancedQuickActions = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("all");

  const quickActions = [
    // Service Booking
    {
      id: 1,
      title: "Book Service",
      description: "Schedule maintenance or repair",
      icon: <FaCalendarPlus className="action-icon" />,
      link: "/book-appointment",
      category: "service",
      color: "primary",
      priority: "high",
    },
    {
      id: 2,
      title: "Emergency Service",
      description: "Urgent vehicle assistance",
      icon: <FaTools className="action-icon" />,
      link: "/emergency-service",
      category: "service",
      color: "danger",
      priority: "high",
    },
    {
      id: 3,
      title: "Track My Car",
      description: "Real-time service tracking",
      icon: <FaCar className="action-icon" />,
      link: "/track-my-car",
      category: "service",
      color: "info",
      priority: "medium",
    },

    // Vehicle Management
    {
      id: 4,
      title: "Vehicle Profile",
      description: "Update car information",
      icon: <FaCog className="action-icon" />,
      link: "/customer/settings",
      category: "vehicle",
      color: "secondary",
      priority: "medium",
    },
    {
      id: 5,
      title: "Service History",
      description: "View past services",
      icon: <FaHistory className="action-icon" />,
      link: "/customer/vehicle-history",
      category: "vehicle",
      color: "dark",
      priority: "medium",
    },
    {
      id: 6,
      title: "Vehicle Health",
      description: "Check car condition",
      icon: <FaShieldAlt className="action-icon" />,
      link: "/vehicle-health",
      category: "vehicle",
      color: "success",
      priority: "high",
    },

    // Billing & Payments
    {
      id: 7,
      title: "Pay Invoice",
      description: "Pay outstanding bills",
      icon: <FaCreditCard className="action-icon" />,
      link: "/customer/invoices",
      category: "billing",
      color: "warning",
      priority: "high",
    },
    {
      id: 8,
      title: "Download Invoice",
      description: "Get receipt or invoice",
      icon: <FaDownload className="action-icon" />,
      link: "/customer/invoices",
      category: "billing",
      color: "success",
      priority: "medium",
    },
    {
      id: 9,
      title: "Payment History",
      description: "View transaction history",
      icon: <FaChartLine className="action-icon" />,
      link: "/payment-history",
      category: "billing",
      color: "primary",
      priority: "low",
    },

    // Support & Information
    {
      id: 10,
      title: "Contact Support",
      description: "Get help and assistance",
      icon: <FaPhone className="action-icon" />,
      link: "/contact",
      category: "support",
      color: "info",
      priority: "medium",
    },
    {
      id: 11,
      title: "Find Garage",
      description: "Locate nearest service center",
      icon: <FaMapMarkerAlt className="action-icon" />,
      link: "/locations",
      category: "support",
      color: "danger",
      priority: "low",
    },
    {
      id: 12,
      title: "Notifications",
      description: "View recent updates",
      icon: <FaBell className="action-icon" />,
      link: "/notifications",
      category: "support",
      color: "warning",
      priority: "medium",
    },

    // Special Features
    {
      id: 13,
      title: "AR Car Viewer",
      description: "View vehicle in AR/VR",
      icon: <FaCamera className="action-icon" />,
      link: "/ar-viewer",
      category: "special",
      color: "purple",
      priority: "low",
    },
    {
      id: 14,
      title: "QR Check-in",
      description: "Quick service check-in",
      icon: <FaQrcode className="action-icon" />,
      link: "/qr-checkin",
      category: "special",
      color: "dark",
      priority: "medium",
    },
    {
      id: 15,
      title: "Rate Service",
      description: "Review recent service",
      icon: <FaStar className="action-icon" />,
      link: "/rate-service",
      category: "special",
      color: "warning",
      priority: "low",
    },
    {
      id: 16,
      title: "Help Center",
      description: "FAQs and guides",
      icon: <FaQuestionCircle className="action-icon" />,
      link: "/help",
      category: "support",
      color: "secondary",
      priority: "low",
    },
  ];

  const categories = [
    { id: "all", name: "All Actions", count: quickActions.length },
    {
      id: "service",
      name: "Services",
      count: quickActions.filter((a) => a.category === "service").length,
    },
    {
      id: "vehicle",
      name: "Vehicle",
      count: quickActions.filter((a) => a.category === "vehicle").length,
    },
    {
      id: "billing",
      name: "Billing",
      count: quickActions.filter((a) => a.category === "billing").length,
    },
    {
      id: "support",
      name: "Support",
      count: quickActions.filter((a) => a.category === "support").length,
    },
    {
      id: "special",
      name: "Special",
      count: quickActions.filter((a) => a.category === "special").length,
    },
  ];

  const filteredActions =
    selectedCategory === "all"
      ? quickActions
      : quickActions.filter((action) => action.category === selectedCategory);

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "high":
        return <div className="priority-badge high"></div>;
      case "medium":
        return <div className="priority-badge medium"></div>;
      case "low":
        return <div className="priority-badge low"></div>;
      default:
        return null;
    }
  };

  const getColorClasses = (color) => {
    const colorMap = {
      primary: "btn-primary",
      secondary: "btn-secondary",
      success: "btn-success",
      danger: "btn-danger",
      warning: "btn-warning",
      info: "btn-info",
      dark: "btn-dark",
      purple: "btn-purple", // custom purple class
    };
    return colorMap[color] || "btn-primary";
  };

  return (
    <div className="quick-actions-widget">
      <div className="widget-header">
        <h4>Quick Actions</h4>
      </div>
      
      <div className="widget-body">
        {/* Category Filter */}
        <div className="category-filter">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`category-btn ${
                selectedCategory === category.id
                  ? "active"
                  : ""
              }`}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
              <span className="category-count">{category.count}</span>
            </button>
          ))}
        </div>

        {/* Quick Actions Grid */}
        <div className="actions-grid">
          {filteredActions.map((action) => (
            <Link
              key={action.id}
              to={action.link}
              className={`action-button ${getColorClasses(action.color)}`}
            >
              <div className="action-icon-container">
                {action.icon}
                {getPriorityIcon(action.priority)}
              </div>
              <div className="action-content">
                <div className="action-title">{action.title}</div>
                <div className="action-description">{action.description}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Emergency Contact Section */}
        <div className="emergency-section">
          <div className="emergency-content">
            <div className="emergency-info">
              <FaPhone className="emergency-icon" />
              <div className="emergency-text">
                <h6>24/7 Emergency Service</h6>
                <small>Available around the clock</small>
              </div>
            </div>
            <Link to="/emergency-service" className="btn btn-danger">
              Call Now
            </Link>
          </div>
        </div>

        {/* Recent Activity Suggestions */}
        <div className="suggestions-section">
          <h6>
            <FaBell className="me-2 text-warning" />
            Quick Suggestions
          </h6>
          <div className="suggestions-list">
            <div className="suggestion-item">
              <div className="suggestion-info">
                <FaCalendarPlus className="suggestion-icon text-primary" />
                <div className="suggestion-text">
                  <small className="fw-bold d-block">Schedule Oil Change</small>
                  <small className="text-muted">Due in 5 days</small>
                </div>
              </div>
              <Link
                to="/book-appointment?service=oil_change"
                className="btn btn-outline-primary btn-sm"
              >
                Book
              </Link>
            </div>

            <div className="suggestion-item">
              <div className="suggestion-info">
                <FaCreditCard className="suggestion-icon text-warning" />
                <div className="suggestion-text">
                  <small className="fw-bold d-block">Outstanding Invoice</small>
                  <small className="text-muted">$85.00 due</small>
                </div>
              </div>
              <Link
                to="/customer/invoices"
                className="btn btn-outline-warning btn-sm"
              >
                Pay
              </Link>
            </div>

            <div className="suggestion-item">
              <div className="suggestion-info">
                <FaStar className="suggestion-icon text-warning" />
                <div className="suggestion-text">
                  <small className="fw-bold d-block">Rate Recent Service</small>
                  <small className="text-muted">Help us improve</small>
                </div>
              </div>
              <Link
                to="/rate-service"
                className="btn btn-outline-success btn-sm"
              >
                Rate
              </Link>
            </div>
          </div>
        </div>

        {/* Action Statistics */}
        <div className="action-stats">
          <div className="stats-content">
            <div className="stats-info">
              <FaChartLine className="stats-icon text-primary" />
              <div className="stats-text">
                <small className="fw-bold text-primary d-block">
                  Most Used Actions
                </small>
                <small className="text-muted">
                  Book Service • Track Car • Pay Invoice
                </small>
              </div>
            </div>
            <Link
              to="/action-analytics"
              className="btn btn-outline-primary btn-sm"
            >
              View Stats
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedQuickActions;
