import React, { useState, useEffect } from "react";
import {
  FaCalendarAlt,
  FaWrench,
  FaExclamationTriangle,
  FaCheckCircle,
  FaCog,
  FaCamera,
  FaDollarSign,
  FaUser,
  FaTools,
} from "react-icons/fa";
import { GiGearStick, GiSteeringWheel } from "react-icons/gi";
import api from "../../services/api";
import "./ServiceHistoryTimeline.css";

const ServiceHistoryTimeline = () => {
  const [timelineEvents, setTimeline = () => TimelineEvents] = useState([]);
  const [servicesTimeline, setServicesTimeline] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedService, setSelectedService] = useState(null);

  const eventTypeIcons = {
    service_completed: FaCheckCircle,
    issue_found: FaExclamationTriangle,
    part_replaced: FaTools,
    recommendation_made: FaCog,
    follow_up_scheduled: FaCalendarAlt,
    warranty_expires: FaCalendarAlt,
  };

  const eventTypeColors = {
    service_completed: "#10b981", // green
    issue_found: "#ef4444", // red
    part_replaced: "#3b82f6", // blue
    recommendation_made: "#f59e0b", // amber
    follow_up_scheduled: "#8b5cf6", // purple
    warranty_expires: "#6b7280", // gray
  };

  const severityColors = {
    critical: "#ef4444",
    warning: "#f59e0b",
    info: "#3b82f6",
    success: "#10b981",
  };

  useEffect(() => {
    fetchTimelineData();
  }, []);

  const fetchTimelineData = async () => {
    try {
      setLoading(true);
      const response = await api.get("/service-timeline/customer/1"); // Using user ID 1 for demo

      if (response.data.success) {
        setTimelineEvents(response.data.data.timeline_events);
        setServicesTimeline(response.data.data.services_timeline);
        setSummary(response.data.data.summary);
      } else {
        setError("Failed to load service timeline data");
      }
    } catch (err) {
      console.error("Error fetching timeline data:", err);
      setError("Error loading service timeline data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEventIcon = (eventType) => {
    const IconComponent = eventTypeIcons[eventType] || FaWrench;
    return <IconComponent className="event-icon" />;
  };

  const filteredEvents =
    selectedFilter === "all"
      ? timelineEvents
      : timelineEvents.filter((event) => event.event_type === selectedFilter);

  const getServiceIcon = (serviceName) => {
    const name = serviceName.toLowerCase();
    if (name.includes("transmission"))
      return <GiGearStick className="service-icon" />;
    if (name.includes("brake"))
      return <FaExclamationTriangle className="service-icon" />;
    if (name.includes("engine")) return <FaWrench className="service-icon" />;
    if (name.includes("tire"))
      return <GiSteeringWheel className="service-icon" />;
    return <FaTools className="service-icon" />;
  };

  if (loading) {
    return (
      <div className="timeline-container loading">
        <div className="loading-spinner"></div>
        <p>Loading service timeline...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="timeline-container error">
        <p>{error}</p>
        <button onClick={fetchTimelineData} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="timeline-container">
      <div className="timeline-header">
        <h2>
          <FaCalendarAlt className="header-icon" />
          Service History Timeline
        </h2>
        <p>
          Track your vehicle's complete service history and maintenance events
        </p>
      </div>

      {summary && (
        <div className="timeline-summary">
          <div className="summary-stats">
            <div className="stat-item">
              <span className="stat-number">{summary.total_events}</span>
              <span className="stat-label">Total Events</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{summary.completed_services}</span>
              <span className="stat-label">Services Completed</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{summary.critical_events}</span>
              <span className="stat-label">Critical Issues</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {summary.recommendations_made}
              </span>
              <span className="stat-label">Recommendations</span>
            </div>
          </div>
        </div>
      )}

      <div className="timeline-content">
        <div className="timeline-main">
          <div className="filter-section">
            <h3>Filter Events</h3>
            <div className="filter-tabs">
              <button
                className={selectedFilter === "all" ? "active" : ""}
                onClick={() => setSelectedFilter("all")}
              >
                All Events
              </button>
              <button
                className={
                  selectedFilter === "service_completed" ? "active" : ""
                }
                onClick={() => setSelectedFilter("service_completed")}
              >
                Services
              </button>
              <button
                className={selectedFilter === "issue_found" ? "active" : ""}
                onClick={() => setSelectedFilter("issue_found")}
              >
                Issues
              </button>
              <button
                className={selectedFilter === "part_replaced" ? "active" : ""}
                onClick={() => setSelectedFilter("part_replaced")}
              >
                Parts
              </button>
              <button
                className={
                  selectedFilter === "recommendation_made" ? "active" : ""
                }
                onClick={() => setSelectedFilter("recommendation_made")}
              >
                Recommendations
              </button>
            </div>
          </div>

          <div className="timeline">
            {filteredEvents.length === 0 ? (
              <div className="empty-timeline">
                <FaCalendarAlt className="empty-icon" />
                <p>No timeline events found for the selected filter.</p>
              </div>
            ) : (
              filteredEvents.map((event, index) => (
                <div key={event.id} className="timeline-item">
                  <div className="timeline-marker">
                    <div
                      className="marker-circle"
                      style={{
                        backgroundColor: eventTypeColors[event.event_type],
                      }}
                    >
                      {getEventIcon(event.event_type)}
                    </div>
                    {index < filteredEvents.length - 1 && (
                      <div className="timeline-line"></div>
                    )}
                  </div>

                  <div className="timeline-content-item">
                    <div className="event-header">
                      <div className="event-title">
                        <h4>{event.event_title}</h4>
                        <div className="event-meta">
                          <span className="event-date">
                            {formatDate(event.event_date)}
                          </span>
                          {event.event_time && (
                            <span className="event-time">
                              {formatTime(event.event_time)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="event-severity">
                        <div
                          className="severity-indicator"
                          style={{
                            backgroundColor: severityColors[event.severity],
                          }}
                        ></div>
                        <span className="severity-label">{event.severity}</span>
                      </div>
                    </div>

                    <div className="event-details">
                      {event.event_description && (
                        <p className="event-description">
                          {event.event_description}
                        </p>
                      )}

                      <div className="event-info">
                        <div className="service-info">
                          <span className="info-label">Service:</span>
                          <span className="info-value">
                            {event.service_name}
                          </span>
                        </div>

                        <div className="vehicle-info">
                          <span className="info-label">Vehicle:</span>
                          <span className="info-value">
                            {event.car_year} {event.car_brand} {event.car_model}
                          </span>
                        </div>

                        {event.mechanic_name && (
                          <div className="mechanic-info">
                            <FaUser className="info-icon" />
                            <span className="info-value">
                              {event.mechanic_name}
                            </span>
                          </div>
                        )}

                        {event.service_cost && (
                          <div className="cost-info">
                            <FaDollarSign className="info-icon" />
                            <span className="info-value">
                              ${event.service_cost}
                            </span>
                          </div>
                        )}
                      </div>

                      {event.related_parts &&
                        event.related_parts.length > 0 && (
                          <div className="parts-section">
                            <h5>Parts Involved:</h5>
                            <div className="parts-list">
                              {event.related_parts.map((part, partIndex) => (
                                <span key={partIndex} className="part-tag">
                                  {part.name || part}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                      {event.before_photos &&
                        event.before_photos.length > 0 && (
                          <div className="photos-section">
                            <h5>
                              <FaCamera className="section-icon" />
                              Before Photos:
                            </h5>
                            <div className="photo-grid">
                              {event.before_photos.map((photo, photoIndex) => (
                                <img
                                  key={photoIndex}
                                  src={photo.url || photo}
                                  alt={`Before photo ${photoIndex + 1}`}
                                  className="timeline-photo"
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                      {event.after_photos && event.after_photos.length > 0 && (
                        <div className="photos-section">
                          <h5>
                            <FaCamera className="section-icon" />
                            After Photos:
                          </h5>
                          <div className="photo-grid">
                            {event.after_photos.map((photo, photoIndex) => (
                              <img
                                key={photoIndex}
                                src={photo.url || photo}
                                alt={`After photo ${photoIndex + 1}`}
                                className="timeline-photo"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {event.warranty_info && (
                        <div className="warranty-section">
                          <h5>Warranty Information:</h5>
                          <div className="warranty-info">
                            {event.warranty_info.duration && (
                              <span className="warranty-item">
                                Duration: {event.warranty_info.duration}
                              </span>
                            )}
                            {event.warranty_info.provider && (
                              <span className="warranty-item">
                                Provider: {event.warranty_info.provider}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="timeline-sidebar">
          <div className="services-overview">
            <h3>Services Overview</h3>
            <div className="services-list">
              {servicesTimeline.map((service) => (
                <div
                  key={service.service_history_id}
                  className={`service-card ${
                    selectedService?.service_history_id ===
                    service.service_history_id
                      ? "selected"
                      : ""
                  }`}
                  onClick={() => setSelectedService(service)}
                >
                  <div className="service-header">
                    {getServiceIcon(service.service_name)}
                    <div className="service-details">
                      <h4>{service.service_name}</h4>
                      <p className="service-date">
                        {formatDate(service.service_date)}
                      </p>
                    </div>
                  </div>

                  <div className="service-meta">
                    <div className="service-cost">
                      <FaDollarSign className="cost-icon" />
                      <span>${service.cost}</span>
                    </div>
                    <div className="event-count">
                      <FaCalendarAlt className="events-icon" />
                      <span>{service.event_count} events</span>
                    </div>
                  </div>

                  {service.critical_issues && (
                    <div className="critical-issues-badge">
                      <FaExclamationTriangle className="warning-icon" />
                      <span>Critical issues found</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceHistoryTimeline;
