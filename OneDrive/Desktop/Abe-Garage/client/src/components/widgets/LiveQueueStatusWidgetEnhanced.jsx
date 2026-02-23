import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaCar,
  FaWrench,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaCog,
  FaUsers,
  FaHourglassHalf,
  FaMapMarkerAlt,
  FaWarehouse,
  FaSignal,
  FaBolt,
  FaShieldAlt,
} from "react-icons/fa";
import api from "../../services/api";
import socketService from "../../services/socket";
import { useAuth } from "../../context/AuthContext";
import LiveStatusIndicator from "../ui/LiveStatusIndicator";
import "../ui/LiveStatusIndicator.css";

const LiveQueueStatusWidgetEnhanced = () => {
  const { user } = useAuth();
  const [queueData, setQueueData] = useState({
    serviceBays: [],
    queue: [],
    loading: true,
    error: null,
    isConnected: false,
    lastUpdated: new Date(),
  });

  useEffect(() => {
    fetchQueueData();
    connectSocket();

    return () => {
      socketService.disconnect();
    };
  }, [user]);

  const connectSocket = () => {
    const socket = socketService.connect();

    if (socket) {
      setQueueData((prev) => ({ ...prev, isConnected: true }));

      socketService.on("socket_connected", () => {
        setQueueData((prev) => ({ ...prev, isConnected: true }));
      });

      socketService.on("socket_disconnected", () => {
        setQueueData((prev) => ({ ...prev, isConnected: false }));
      });

      // Listen for real-time service bay updates
      socketService.on("service_bay_status_update", (data) => {
        setQueueData((prev) => ({
          ...prev,
          serviceBays: prev.serviceBays.map((bay) =>
            bay.id === data.bay_id
              ? { ...bay, status: data.status, updated_at: new Date() }
              : bay
          ),
          lastUpdated: new Date(),
        }));
      });

      // Listen for queue updates
      socketService.on("queue_status_update", (data) => {
        setQueueData((prev) => ({
          ...prev,
          queue: prev.queue.map((item) =>
            item.appointment_id === data.appointment_id
              ? { ...item, queue_status: data.status }
              : item
          ),
          lastUpdated: new Date(),
        }));
      });
    }
  };

  const fetchQueueData = async () => {
    try {
      setQueueData((prev) => ({ ...prev, loading: true, error: null }));

      // Enhanced mock data with better visual indicators
      const mockServiceBays = [
        {
          id: 1,
          bay_number: "1",
          bay_name: "Premium Bay",
          bay_type: "premium",
          status: "occupied",
          is_available: false,
          service_type: "Full Service",
          vehicle_info: { brand: "BMW", model: "X5", year: "2022" },
          assigned_mechanic: "John Smith",
          estimated_completion_time: new Date(
            Date.now() + 30 * 60 * 1000
          ).toISOString(),
          service_progress: 75,
        },
        {
          id: 2,
          bay_number: "2",
          bay_name: "Express Bay",
          bay_type: "express",
          status: "available",
          is_available: true,
        },
        {
          id: 3,
          bay_number: "3",
          bay_name: "Diagnostic Bay",
          bay_type: "diagnostic",
          status: "occupied",
          is_available: false,
          service_type: "Engine Diagnostics",
          vehicle_info: { brand: "Mercedes", model: "E-Class", year: "2021" },
          assigned_mechanic: "Sarah Johnson",
          estimated_completion_time: new Date(
            Date.now() + 45 * 60 * 1000
          ).toISOString(),
          service_progress: 45,
        },
      ];

      const mockQueue = [
        {
          id: 1,
          queue_position: 1,
          customer_name: "Alice Johnson",
          customer_phone: "(555) 123-4567",
          car_year: "2022",
          car_brand: "Tesla",
          car_model: "Model 3",
          service_name: "Battery Check",
          queue_status: "waiting",
          priority: "high",
          estimated_wait_time: 15,
        },
        {
          id: 2,
          queue_position: 2,
          customer_name: "Bob Wilson",
          customer_phone: "(555) 234-5678",
          car_year: "2021",
          car_brand: "Ford",
          car_model: "Mustang",
          service_name: "Performance Tune",
          queue_status: "waiting",
          priority: "normal",
          estimated_wait_time: 30,
        },
      ];

      // Simulate API delay
      setTimeout(() => {
        setQueueData((prev) => ({
          ...prev,
          serviceBays: mockServiceBays,
          queue: mockQueue,
          loading: false,
          error: null,
          lastUpdated: new Date(),
        }));
      }, 800);
    } catch (err) {
      console.error("Error fetching queue data:", err);
      setQueueData((prev) => ({
        ...prev,
        error: "Failed to load queue data",
        loading: false,
      }));
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "available":
        return <FaCheckCircle className="text-success" />;
      case "occupied":
        return <FaWrench className="text-primary" />;
      case "maintenance":
        return <FaCog className="text-warning" />;
      case "out_of_service":
        return <FaExclamationTriangle className="text-danger" />;
      default:
        return <FaClock className="text-secondary" />;
    }
  };

  const getBayTypeIcon = (type) => {
    switch (type) {
      case "premium":
        return <FaShieldAlt className="text-purple" />;
      case "express":
        return <FaBolt className="text-orange" />;
      case "diagnostic":
        return <FaClock className="text-blue" />;
      default:
        return <FaWrench className="text-gray" />;
    }
  };

  const formatWaitTime = (minutes) => {
    if (minutes <= 0) return "Available";
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "#ef4444";
      case "high":
        return "#f59e0b";
      case "normal":
        return "#3b82f6";
      case "low":
        return "#6b7280";
      default:
        return "#6b7280";
    }
  };

  const formatTime = (timeString) => {
    return new Date(timeString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (queueData.loading) {
    return (
      <div className="card h-100">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h6 className="mb-0">
            <FaWarehouse className="me-2 text-primary" />
            Live Queue Status
          </h6>
          <LiveStatusIndicator isConnected={false} showText={false} />
        </div>
        <div className="card-body text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mt-2">Loading live data...</p>
        </div>
      </div>
    );
  }

  if (queueData.error) {
    return (
      <div className="card h-100">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h6 className="mb-0">
            <FaWarehouse className="me-2 text-primary" />
            Live Queue Status
          </h6>
          <LiveStatusIndicator isConnected={false} showText={false} />
        </div>
        <div className="card-body text-center">
          <FaExclamationTriangle
            className="text-warning mb-2"
            style={{ fontSize: "2rem" }}
          />
          <p className="text-muted mb-2">{queueData.error}</p>
          <button
            onClick={fetchQueueData}
            className="btn btn-outline-primary btn-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const availableBays = queueData.serviceBays.filter(
    (bay) => bay.is_available
  ).length;
  const occupiedBays = queueData.serviceBays.filter(
    (bay) => bay.status === "occupied"
  ).length;
  const totalBays = queueData.serviceBays.length;
  const waitingCount = queueData.queue.filter(
    (item) => item.queue_status === "waiting"
  ).length;

  return (
    <div className="card h-100 live-queue-widget">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h6 className="mb-0">
          <FaWarehouse className="me-2 text-primary" />
          Live Queue Status
        </h6>
        <div className="d-flex align-items-center gap-2">
          <LiveStatusIndicator
            isConnected={queueData.isConnected}
            showText={true}
            size="small"
            pulse={true}
          />
          <small className="text-muted">
            {queueData.lastUpdated.toLocaleTimeString()}
          </small>
        </div>
      </div>
      <div className="card-body">
        {/* Enhanced Summary Stats */}
        <div className="row g-2 mb-4">
          <div className="col-6">
            <div className="text-center p-3 bg-success bg-opacity-10 rounded border border-success border-opacity-20">
              <FaCheckCircle
                className="text-success mb-2"
                style={{ fontSize: "1.5rem" }}
              />
              <div className="fw-bold text-success fs-4">{availableBays}</div>
              <small className="text-muted">Available</small>
            </div>
          </div>
          <div className="col-6">
            <div className="text-center p-3 bg-primary bg-opacity-10 rounded border border-primary border-opacity-20">
              <FaWrench
                className="text-primary mb-2"
                style={{ fontSize: "1.5rem" }}
              />
              <div className="fw-bold text-primary fs-4">{occupiedBays}</div>
              <small className="text-muted">In Service</small>
            </div>
          </div>
        </div>

        {/* Service Bays Status with Enhanced Visual */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="mb-0">
              <FaCar className="me-1" />
              Service Bays
            </h6>
            <span className="badge bg-primary">{totalBays} Total</span>
          </div>
          <div className="row g-2">
            {queueData.serviceBays.slice(0, 3).map((bay) => (
              <div key={bay.id} className="col-4">
                <div
                  className={`border rounded p-2 text-center bay-card ${
                    bay.status === "available"
                      ? "border-success bg-success bg-opacity-5"
                      : "border-primary bg-primary bg-opacity-5"
                  }`}
                >
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <small className="fw-bold">#{bay.bay_number}</small>
                    <div className="d-flex align-items-center gap-1">
                      {getBayTypeIcon(bay.bay_type)}
                      {getStatusIcon(bay.status)}
                    </div>
                  </div>
                  <small className="text-muted d-block">{bay.bay_name}</small>
                  {bay.status === "occupied" &&
                    bay.estimated_completion_time && (
                      <div className="mt-1">
                        <div className="progress" style={{ height: "4px" }}>
                          <div
                            className="progress-bar bg-primary"
                            style={{ width: `${bay.service_progress || 0}%` }}
                          ></div>
                        </div>
                        <small className="text-primary">
                          ETA: {formatTime(bay.estimated_completion_time)}
                        </small>
                      </div>
                    )}
                  {bay.status === "available" && (
                    <small className="text-success fw-bold">Ready</small>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Queue with Enhanced Design */}
        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="mb-0">
              <FaHourglassHalf className="me-1" />
              Service Queue
            </h6>
            <span className="badge bg-warning">{waitingCount} waiting</span>
          </div>

          {queueData.queue.length === 0 ? (
            <div className="text-center py-3">
              <FaUsers
                className="text-muted mb-2"
                style={{ fontSize: "2rem" }}
              />
              <p className="text-muted mb-0">No vehicles waiting</p>
            </div>
          ) : (
            <div className="space-y-2">
              {queueData.queue.slice(0, 2).map((item) => (
                <div
                  key={item.id}
                  className="d-flex align-items-center justify-content-between p-3 bg-light rounded border"
                >
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <small className="fw-bold">{item.customer_name}</small>
                      <div
                        className="priority-indicator"
                        style={{
                          width: "10px",
                          height: "10px",
                          borderRadius: "50%",
                          backgroundColor: getPriorityColor(item.priority),
                          boxShadow: `0 0 8px ${getPriorityColor(
                            item.priority
                          )}`,
                        }}
                      ></div>
                    </div>
                    <small className="text-muted d-block">
                      {item.car_year} {item.car_brand} {item.car_model}
                    </small>
                    <small className="text-primary fw-medium">
                      {item.service_name}
                    </small>
                  </div>
                  <div className="text-end">
                    <div className="d-flex flex-column align-items-end">
                      <small className="fw-bold text-primary">
                        #{item.queue_position}
                      </small>
                      {item.estimated_wait_time && (
                        <small className="text-muted">
                          {formatWaitTime(item.estimated_wait_time)}
                        </small>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Enhanced Action Buttons */}
        <div className="d-grid gap-2">
          <Link to="/live-queue" className="btn btn-primary">
            <FaMapMarkerAlt className="me-2" />
            View Full Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LiveQueueStatusWidgetEnhanced;
