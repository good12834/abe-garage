import React, { useState, useEffect } from "react";
import "../styles/professional-styles.css";
import {
  FaChartLine,
  FaMousePointer,
  FaClock,
  FaStar,
  FaCalendarAlt,
  FaTools,
} from "react-icons/fa";

const ActionAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");

  useEffect(() => {
    // Mock analytics data
    const mockAnalytics = {
      totalActions: 247,
      mostUsedAction: "Book Service",
      averageSessionTime: "8m 32s",
      actionBreakdown: [
        {
          action: "Book Service",
          count: 45,
          percentage: 18.2,
          color: "#3b82f6",
        },
        {
          action: "Track My Car",
          count: 38,
          percentage: 15.4,
          color: "#10b981",
        },
        {
          action: "View Notifications",
          count: 32,
          percentage: 13.0,
          color: "#f59e0b",
        },
        {
          action: "Check Vehicle Health",
          count: 28,
          percentage: 11.3,
          color: "#ef4444",
        },
        {
          action: "View Invoices",
          count: 25,
          percentage: 10.1,
          color: "#8b5cf6",
        },
        {
          action: "Update Profile",
          count: 22,
          percentage: 8.9,
          color: "#06b6d4",
        },
        {
          action: "Rate Service",
          count: 18,
          percentage: 7.3,
          color: "#84cc16",
        },
        {
          action: "Emergency Service",
          count: 15,
          percentage: 6.1,
          color: "#f97316",
        },
        {
          action: "Contact Support",
          count: 12,
          percentage: 4.9,
          color: "#ec4899",
        },
        { action: "Other", count: 12, percentage: 4.9, color: "#6b7280" },
      ],
      weeklyActivity: [
        { day: "Mon", actions: 42 },
        { day: "Tue", actions: 38 },
        { day: "Wed", actions: 45 },
        { day: "Thu", actions: 35 },
        { day: "Fri", actions: 52 },
        { day: "Sat", actions: 18 },
        { day: "Sun", actions: 17 },
      ],
      peakHours: [
        { hour: "9 AM", actions: 12 },
        { hour: "10 AM", actions: 18 },
        { hour: "11 AM", actions: 22 },
        { hour: "12 PM", actions: 28 },
        { hour: "1 PM", actions: 25 },
        { hour: "2 PM", actions: 32 },
        { hour: "3 PM", actions: 29 },
        { hour: "4 PM", actions: 24 },
        { hour: "5 PM", actions: 19 },
        { hour: "6 PM", actions: 15 },
      ],
      recentActivity: [
        { action: "Booked Oil Change", time: "2 hours ago", type: "service" },
        {
          action: "Viewed Vehicle Health",
          time: "4 hours ago",
          type: "monitoring",
        },
        {
          action: "Checked Notifications",
          time: "6 hours ago",
          type: "communication",
        },
        { action: "Updated Profile", time: "1 day ago", type: "account" },
        {
          action: "Rated Recent Service",
          time: "2 days ago",
          type: "feedback",
        },
        { action: "Viewed Invoice", time: "3 days ago", type: "billing" },
        {
          action: "Tracked Car Location",
          time: "4 days ago",
          type: "monitoring",
        },
        { action: "Contacted Support", time: "5 days ago", type: "support" },
      ],
      insights: [
        {
          title: "Most Active Day",
          value: "Friday",
          description: "You perform 52 actions on average",
          icon: <FaCalendarAlt className="text-primary" />,
        },
        {
          title: "Peak Usage Time",
          value: "2:00 PM",
          description: "Highest activity during afternoon hours",
          icon: <FaClock className="text-success" />,
        },
        {
          title: "Preferred Service",
          value: "Book Service",
          description: "Most frequently used action",
          icon: <FaTools className="text-info" />,
        },
        {
          title: "Engagement Score",
          value: "8.7/10",
          description: "Based on your activity patterns",
          icon: <FaStar className="text-warning" />,
        },
      ],
    };

    setTimeout(() => {
      setAnalytics(mockAnalytics);
      setLoading(false);
    }, 1000);
  }, [timeRange]);

  const getActivityTypeColor = (type) => {
    switch (type) {
      case "service":
        return "text-primary";
      case "monitoring":
        return "text-success";
      case "communication":
        return "text-warning";
      case "account":
        return "text-info";
      case "feedback":
        return "text-danger";
      case "billing":
        return "text-secondary";
      case "support":
        return "text-dark";
      default:
        return "text-muted";
    }
  };

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading action analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="action-analytics-page">
      <div className="container-fluid py-4">
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h1 className="mb-2">
                  <FaChartLine className="text-primary me-3" />
                  Action Analytics
                </h1>
                <p className="text-muted mb-0">
                  Insights into your garage service usage patterns
                </p>
              </div>
              <div className="d-flex align-items-center gap-3">
                <select
                  className="form-select form-select-sm"
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="1y">Last year</option>
                </select>
                <div className="text-end">
                  <small className="text-muted d-block">Total Actions</small>
                  <small className="fw-medium text-primary fs-5">
                    {analytics.totalActions}
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Insights Cards */}
        <div className="row mb-4">
          {analytics.insights.map((insight, index) => (
            <div key={index} className="col-lg-3 col-md-6 mb-4">
              <div className="card h-100">
                <div className="card-body text-center">
                  <div className="mb-3">
                    <div className="icon-circle bg-light d-inline-flex align-items-center justify-content-center">
                      {insight.icon}
                    </div>
                  </div>
                  <h5 className="card-title fw-bold">{insight.title}</h5>
                  <h3 className="text-primary mb-2">{insight.value}</h3>
                  <p className="text-muted small mb-0">{insight.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="row">
          {/* Action Breakdown */}
          <div className="col-lg-6 mb-4">
            <div className="card h-100">
              <div className="card-header">
                <h5 className="mb-0">
                  <FaMousePointer className="me-2 text-primary" />
                  Action Breakdown
                </h5>
              </div>
              <div className="card-body">
                <div className="action-breakdown">
                  {analytics.actionBreakdown.map((item, index) => (
                    <div key={index} className="action-item mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="fw-medium">{item.action}</span>
                        <div className="d-flex align-items-center gap-2">
                          <span className="badge bg-primary">{item.count}</span>
                          <span className="text-muted small">
                            {item.percentage}%
                          </span>
                        </div>
                      </div>
                      <div className="progress" style={{ height: "8px" }}>
                        <div
                          className="progress-bar"
                          style={{
                            width: `${item.percentage}%`,
                            backgroundColor: item.color,
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Activity */}
          <div className="col-lg-6 mb-4">
            <div className="card h-100">
              <div className="card-header">
                <h5 className="mb-0">
                  <FaCalendarAlt className="me-2 text-success" />
                  Weekly Activity
                </h5>
              </div>
              <div className="card-body">
                <div className="weekly-activity">
                  {analytics.weeklyActivity.map((day, index) => (
                    <div key={index} className="day-activity mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="fw-medium">{day.day}</span>
                        <span className="badge bg-success">
                          {day.actions} actions
                        </span>
                      </div>
                      <div className="progress" style={{ height: "10px" }}>
                        <div
                          className="progress-bar bg-success"
                          style={{
                            width: `${(day.actions / 52) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          {/* Peak Hours */}
          <div className="col-lg-6 mb-4">
            <div className="card h-100">
              <div className="card-header">
                <h5 className="mb-0">
                  <FaClock className="me-2 text-warning" />
                  Peak Usage Hours
                </h5>
              </div>
              <div className="card-body">
                <div className="peak-hours">
                  {analytics.peakHours.map((hour, index) => (
                    <div
                      key={index}
                      className="hour-activity d-flex justify-content-between align-items-center mb-2"
                    >
                      <span className="fw-medium">{hour.hour}</span>
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className="activity-bar bg-warning"
                          style={{
                            width: `${hour.actions * 3}px`,
                            height: "8px",
                            borderRadius: "4px",
                          }}
                        ></div>
                        <span className="badge bg-warning text-dark">
                          {hour.actions}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="col-lg-6 mb-4">
            <div className="card h-100">
              <div className="card-header">
                <h5 className="mb-0">
                  <FaClock className="me-2 text-info" />
                  Recent Activity
                </h5>
              </div>
              <div className="card-body">
                <div
                  className="recent-activity"
                  style={{ maxHeight: "300px", overflowY: "auto" }}
                >
                  {analytics.recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      className="activity-item d-flex align-items-start mb-3 pb-3 border-bottom border-light"
                    >
                      <div
                        className={`activity-dot ${getActivityTypeColor(
                          activity.type
                        )} me-3 mt-1`}
                      ></div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-start">
                          <span className="fw-medium">{activity.action}</span>
                          <small className="text-muted">{activity.time}</small>
                        </div>
                        <span
                          className={`badge bg-light text-dark mt-1 ${getActivityTypeColor(
                            activity.type
                          )}`}
                        >
                          {activity.type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Patterns */}
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">
                  <FaChartLine className="me-2 text-primary" />
                  Usage Patterns & Recommendations
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6 mb-4">
                    <h6 className="fw-bold text-primary mb-3">
                      Your Usage Patterns
                    </h6>
                    <ul className="list-unstyled">
                      <li className="mb-2">
                        <i className="bi bi-check-circle text-success me-2"></i>
                        Most active during weekdays, especially Friday
                        afternoons
                      </li>
                      <li className="mb-2">
                        <i className="bi bi-check-circle text-success me-2"></i>
                        Prefers booking services over other actions
                      </li>
                      <li className="mb-2">
                        <i className="bi bi-check-circle text-success me-2"></i>
                        Regularly monitors vehicle health and notifications
                      </li>
                      <li className="mb-2">
                        <i className="bi bi-check-circle text-success me-2"></i>
                        High engagement with service booking and tracking
                        features
                      </li>
                    </ul>
                  </div>
                  <div className="col-md-6 mb-4">
                    <h6 className="fw-bold text-success mb-3">
                      Personalized Recommendations
                    </h6>
                    <ul className="list-unstyled">
                      <li className="mb-2">
                        <i className="bi bi-lightbulb text-warning me-2"></i>
                        Consider scheduling maintenance during your peak hours
                        (2 PM)
                      </li>
                      <li className="mb-2">
                        <i className="bi bi-lightbulb text-warning me-2"></i>
                        Enable push notifications for urgent service reminders
                      </li>
                      <li className="mb-2">
                        <i className="bi bi-lightbulb text-warning me-2"></i>
                        Try our predictive maintenance feature for proactive
                        care
                      </li>
                      <li className="mb-2">
                        <i className="bi bi-lightbulb text-warning me-2"></i>
                        Rate more services to help us improve our offerings
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionAnalytics;
