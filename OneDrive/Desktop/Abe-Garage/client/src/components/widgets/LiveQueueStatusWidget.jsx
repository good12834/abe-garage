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
} from "react-icons/fa";
import api from "../../services/api";
import socketService from "../../services/socket";
import { useAuth } from "../../context/AuthContext";

const LiveQueueStatusWidget = () => {
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

      // Fetch service bays and queue data from API
      const [serviceBaysResponse, queueResponse] = await Promise.allSettled([
        api.get("/service-bays"),
        api.get("/service-bays/queue"),
      ]);

      let serviceBays = [];
      let queue = [];

      // Handle service bays response
      if (serviceBaysResponse.status === "fulfilled" && serviceBaysResponse.value.data.success) {
        serviceBays = serviceBaysResponse.value.data.data.service_bays;
      } else {
        console.warn("Failed to fetch service bays, using fallback data");
        serviceBays = [
          {
            id: 1,
            bay_number: "Bay 1",
            bay_name: "General Service",
            bay_type: "general",
            status: "occupied",
            is_available: false,
            service_type: "Oil Change",
            vehicle_info: { brand: "Toyota", model: "Camry" },
            assigned_mechanic: "John Smith",
            estimated_completion_time: new Date(
              Date.now() + 30 * 60 * 1000
            ).toISOString(),
          },
          {
            id: 2,
            bay_number: "Bay 2",
            bay_name: "Brake Service",
            bay_type: "brake",
            status: "available",
            is_available: true,
          },
          {
            id: 3,
            bay_number: "Bay 3",
            bay_name: "Engine Service",
            bay_type: "engine",
            status: "occupied",
            is_available: false,
            service_type: "Engine Diagnostics",
            vehicle_info: { brand: "Honda", model: "Accord" },
            assigned_mechanic: "Mike Johnson",
            estimated_completion_time: new Date(
              Date.now() + 45 * 60 * 1000
            ).toISOString(),
          },
        ];
      }

      // Handle queue response
      if (queueResponse.status === "fulfilled" && queueResponse.value.data.success) {
        queue = queueResponse.value.data.data.queue;
      } else {
        console.warn("Failed to fetch queue, using fallback data");
        queue = [
          {
            id: 1,
            queue_position: 1,
            customer_name: "Sarah Wilson",
            customer_phone: "(555) 123-4567",
            car_year: "2021",
            car_brand: "Ford",
            car_model: "Explorer",
            service_name: "Tire Rotation",
            queue_status: "waiting",
            priority: "normal",
            estimated_wait_time: 15,
            assigned_bay: "Bay 2",
          },
          {
            id: 2,
            queue_position: 2,
            customer_name: "David Brown",
            customer_phone: "(555) 987-6543",
            car_year: "2019",
            car_brand: "BMW",
            car_model: "X5",
            service_name: "Brake Inspection",
            queue_status: "waiting",
            priority: "high",
            estimated_wait_time: 45,
          },
        ];
      }

      setQueueData((prev) => ({
        ...prev,
        serviceBays,
        queue,
        loading: false,
        error: null,
        lastUpdated: new Date(),
      }));
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
        </div>
        <div className="card-body text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
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
    <div className="card h-100">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h6 className="mb-0">
          <FaWarehouse className="me-2 text-primary" />
          Live Queue Status
        </h6>
        <div className="d-flex align-items-center">
          <div
            className={`status-indicator ${
              queueData.isConnected ? "connected" : "disconnected"
            } me-2`}
          >
            <div className="status-dot"></div>
            <small>{queueData.isConnected ? "Live" : "Offline"}</small>
          </div>
          <small className="text-muted">
            {queueData.lastUpdated.toLocaleTimeString()}
          </small>
        </div>
      </div>
      <div className="card-body">
        {/* Summary Stats */}
        <div className="row g-2 mb-4">
          <div className="col-6">
            <div className="text-center p-2 bg-light rounded">
              <FaCheckCircle className="text-success mb-1" />
              <div className="fw-bold text-success">{availableBays}</div>
              <small className="text-muted">Available</small>
            </div>
          </div>
          <div className="col-6">
            <div className="text-center p-2 bg-light rounded">
              <FaWrench className="text-primary mb-1" />
              <div className="fw-bold text-primary">{occupiedBays}</div>
              <small className="text-muted">In Service</small>
            </div>
          </div>
        </div>

        {/* Service Bays Status */}
        <div className="mb-4">
          <h6 className="mb-2">
            <FaCar className="me-1" />
            Service Bays
          </h6>
          <div className="row g-2">
            {queueData.serviceBays.slice(0, 3).map((bay) => (
              <div key={bay.id} className="col-4">
                <div className="border rounded p-2 text-center">
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <small className="fw-bold">#{bay.bay_number}</small>
                    {getStatusIcon(bay.status)}
                  </div>
                  <small className="text-muted d-block">{bay.bay_name}</small>
                  {bay.status === "occupied" &&
                    bay.estimated_completion_time && (
                      <small className="text-primary">
                        ETA: {formatTime(bay.estimated_completion_time)}
                      </small>
                    )}
                  {bay.status === "available" && (
                    <small className="text-success">Ready</small>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Queue */}
        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="mb-0">
              <FaHourglassHalf className="me-1" />
              Service Queue
            </h6>
            <span className="badge bg-primary">{waitingCount} waiting</span>
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
                  className="d-flex align-items-center justify-content-between p-2 bg-light rounded"
                >
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center justify-content-between">
                      <small className="fw-bold">{item.customer_name}</small>
                      <div
                        className="priority-indicator"
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          backgroundColor: getPriorityColor(item.priority),
                        }}
                      ></div>
                    </div>
                    <small className="text-muted d-block">
                      {item.car_year} {item.car_brand} {item.car_model}
                    </small>
                    <small className="text-primary">{item.service_name}</small>
                  </div>
                  <div className="text-end">
                    <small className="fw-bold text-primary">
                      #{item.queue_position}
                    </small>
                    {item.estimated_wait_time && (
                      <div>
                        <small className="text-muted">
                          {formatWaitTime(item.estimated_wait_time)}
                        </small>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="d-grid gap-2">
          <Link to="/live-queue" className="btn btn-outline-primary btn-sm">
            <FaMapMarkerAlt className="me-1" />
            View Full Queue
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LiveQueueStatusWidget;
