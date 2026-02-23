import React, { useState, useEffect } from "react";
import { Card, Badge, Alert, Spinner } from "react-bootstrap";
import {
  CheckCircle,
  Clock,
  Wrench,
  Star,
  Package,
} from "react-bootstrap-icons";
import socketService from "../services/socket";
import { toast } from "react-toastify";

const ProgressTracker = ({ appointmentId, isRealTime = true }) => {
  const [appointment, setAppointment] = useState(null);
  const [progressSteps, setProgressSteps] = useState([]);
  const [serviceUpdates, setServiceUpdates] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  // Progress steps configuration
  const steps = [
    {
      id: "diagnosis",
      name: "Diagnosis Started",
      description: "Our technician is examining your vehicle",
      icon: Wrench,
      color: "warning",
    },
    {
      id: "parts",
      name: "Parts Ordered",
      description: "Required parts have been ordered",
      icon: Package,
      color: "info",
    },
    {
      id: "repair",
      name: "Repair Ongoing",
      description: "Repairs are being performed on your vehicle",
      icon: Wrench,
      color: "primary",
    },
    {
      id: "quality",
      name: "Quality Check",
      description: "Final quality assurance and testing",
      icon: Star,
      color: "secondary",
    },
    {
      id: "ready",
      name: "Ready for Pickup",
      description: "Your vehicle is ready for collection",
      icon: CheckCircle,
      color: "success",
    },
  ];

  useEffect(() => {
    if (isRealTime) {
      initializeRealTimeTracking();
    } else {
      loadStaticProgress();
    }

    return () => {
      // Cleanup socket listeners
      if (isRealTime && isConnected) {
        socketService.leaveAppointment(appointmentId);
        socketService.cleanupAppointmentListeners(appointmentId);
      }
    };
  }, [appointmentId, isRealTime]);

  const initializeRealTimeTracking = () => {
    // Connect to socket and join appointment room
    const socket = socketService.connect();

    if (socket) {
      setIsConnected(true);
      socketService.joinAppointment(appointmentId);

      // Listen for progress updates
      socketService.onProgressUpdate(handleProgressUpdate);
      socketService.onAppointmentUpdate(handleAppointmentUpdate);

      // Load initial data
      loadAppointmentData();
    } else {
      console.warn("Socket not available, falling back to static mode");
      loadStaticProgress();
    }
  };

  const loadStaticProgress = async () => {
    try {
      // Load appointment data without real-time updates
      await loadAppointmentData();
    } catch (error) {
      console.error("Error loading appointment data:", error);
      toast.error("Failed to load appointment progress");
    } finally {
      setLoading(false);
    }
  };

  const loadAppointmentData = async () => {
    try {
      setLoading(true);

      // This would typically fetch from your API
      // For demo purposes, we'll simulate the data
      const mockAppointment = {
        id: appointmentId,
        status: "in_service",
        appointment_date: new Date().toISOString(),
        service_name: "Brake Service",
        car_info: "2020 Toyota Camry",
      };

      const mockProgressSteps = [
        {
          step_id: "diagnosis",
          status: "completed",
          completed_at: new Date(Date.now() - 4 * 60 * 60 * 1000),
        },
        {
          step_id: "parts",
          status: "completed",
          completed_at: new Date(Date.now() - 3 * 60 * 60 * 1000),
        },
        {
          step_id: "repair",
          status: "in_progress",
          started_at: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
        { step_id: "quality", status: "pending" },
        { step_id: "ready", status: "pending" },
      ];

      const mockUpdates = [
        {
          id: 1,
          status: "diagnosis",
          message: "Initial diagnosis completed. Brake pads need replacement.",
          updated_by: "John Smith",
          created_at: new Date(Date.now() - 4 * 60 * 60 * 1000),
        },
        {
          id: 2,
          status: "parts",
          message: "New brake pads ordered and received.",
          updated_by: "Sarah Johnson",
          created_at: new Date(Date.now() - 3 * 60 * 60 * 1000),
        },
        {
          id: 3,
          status: "repair",
          message: "Started replacing brake pads. Work is progressing well.",
          updated_by: "Mike Davis",
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
      ];

      setAppointment(mockAppointment);
      setProgressSteps(mockProgressSteps);
      setServiceUpdates(mockUpdates);
    } catch (error) {
      console.error("Error loading appointment data:", error);
      toast.error("Failed to load appointment progress");
    } finally {
      setLoading(false);
    }
  };

  const handleProgressUpdate = (update) => {
    console.log("Received progress update:", update);

    // Update progress steps
    setProgressSteps((prev) => {
      return prev.map((step) => {
        if (step.step_id === update.status) {
          return {
            ...step,
            status: "completed",
            completed_at: new Date(update.timestamp),
          };
        }
        return step;
      });
    });

    // Add new service update
    setServiceUpdates((prev) => [
      {
        id: Date.now(),
        status: update.status,
        message: update.message,
        updated_by: update.updatedBy?.name || "System",
        created_at: new Date(update.timestamp),
      },
      ...prev,
    ]);

    // Show notification
    const stepName =
      steps.find((s) => s.id === update.status)?.name || update.status;
    toast.success(`${stepName}: ${update.message}`, {
      autoClose: 5000,
    });
  };

  const handleAppointmentUpdate = (update) => {
    console.log("Received appointment update:", update);
    setAppointment((prev) => ({
      ...prev,
      status: update.status,
    }));
  };

  const getStepStatus = (stepId) => {
    const step = progressSteps.find((s) => s.step_id === stepId);
    if (!step) return "pending";

    if (step.status === "completed") return "completed";
    if (step.status === "in_progress") return "in_progress";
    return "pending";
  };

  const getStepIcon = (stepId, status) => {
    const stepConfig = steps.find((s) => s.id === stepId);
    if (!stepConfig) return Clock;

    if (status === "completed") return CheckCircle;
    if (status === "in_progress") return stepConfig.icon;
    return Clock;
  };

  const getStepColor = (status) => {
    switch (status) {
      case "completed":
        return "success";
      case "in_progress":
        return "warning";
      default:
        return "secondary";
    }
  };

  const formatTimeAgo = (date) => {
    if (!date) return "";

    const now = new Date();
    const diffMs = now - new Date(date);
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) return "Just now";
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  };

  if (loading) {
    return (
      <Card className="text-center p-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading progress...</p>
      </Card>
    );
  }

  return (
    <div className="progress-tracker">
      {/* Connection Status */}
      {isRealTime && (
        <Alert variant={isConnected ? "success" : "warning"} className="mb-3">
          <div className="d-flex align-items-center">
            <div
              className={`me-2 ${
                isConnected ? "bg-success" : "bg-warning"
              } rounded-circle`}
              style={{ width: "8px", height: "8px" }}
            ></div>
            <span>
              {isConnected
                ? "Real-time updates active"
                : "Real-time updates unavailable"}
            </span>
          </div>
        </Alert>
      )}

      {/* Appointment Info */}
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Service Progress</Card.Title>
          <div className="row">
            <div className="col-md-6">
              <p>
                <strong>Service:</strong> {appointment?.service_name}
              </p>
              <p>
                <strong>Vehicle:</strong> {appointment?.car_info}
              </p>
            </div>
            <div className="col-md-6">
              <p>
                <strong>Status:</strong>
                <Badge bg={getStepColor(appointment?.status)} className="ms-2">
                  {appointment?.status?.replace("_", " ").toUpperCase()}
                </Badge>
              </p>
              <p>
                <strong>Started:</strong>{" "}
                {appointment?.appointment_date
                  ? formatTimeAgo(appointment.appointment_date)
                  : "N/A"}
              </p>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Progress Steps */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Progress Tracking</h5>
        </Card.Header>
        <Card.Body>
          <div className="timeline">
            {steps.map((step, index) => {
              const status = getStepStatus(step.id);
              const StepIcon = getStepIcon(step.id, status);

              return (
                <div key={step.id} className={`timeline-item ${status}`}>
                  <div className="timeline-marker">
                    <StepIcon
                      size={20}
                      className={`text-${getStepColor(status)}`}
                    />
                  </div>
                  <div className="timeline-content">
                    <h6
                      className={`mb-1 ${
                        status === "in_progress"
                          ? "text-warning"
                          : status === "completed"
                          ? "text-success"
                          : "text-muted"
                      }`}
                    >
                      {step.name}
                    </h6>
                    <p className="text-muted mb-1">{step.description}</p>
                    {status === "completed" && (
                      <small className="text-success">
                        Completed{" "}
                        {formatTimeAgo(
                          progressSteps.find((s) => s.step_id === step.id)
                            ?.completed_at
                        )}
                      </small>
                    )}
                    {status === "in_progress" && (
                      <small className="text-warning">In progress...</small>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card.Body>
      </Card>

      {/* Service Updates */}
      {serviceUpdates.length > 0 && (
        <Card>
          <Card.Header>
            <h5 className="mb-0">Recent Updates</h5>
          </Card.Header>
          <Card.Body>
            <div className="updates-list">
              {serviceUpdates.map((update) => (
                <div
                  key={update.id}
                  className="update-item mb-3 pb-3 border-bottom d-flex"
                >
                  <div className="d-flex justify-content-between align-items-start w-100">
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center mb-1">
                        <Badge bg="secondary" className="me-2">
                          {update.status.replace("_", " ").toUpperCase()}
                        </Badge>
                        <small className="text-muted">
                          {formatTimeAgo(update.created_at)}
                        </small>
                      </div>
                      <p className="mb-1">{update.message}</p>
                      <small className="text-muted">
                        By {update.updated_by}
                      </small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Custom CSS for Timeline */}
      <style>{`
        .progress-tracker .timeline {
          position: relative;
        }
        .progress-tracker .timeline-item {
          display: flex;
          margin-bottom: 1.5rem;
          position: relative;
        }
        .progress-tracker .timeline-item:last-child {
          margin-bottom: 0;
        }
        .progress-tracker .timeline-marker {
          flex-shrink: 0;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: white;
          border: 2px solid #dee2e6;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 1rem;
          z-index: 1;
        }
        .progress-tracker .timeline-item.completed .timeline-marker {
          border-color: #28a745;
          background: #28a745;
        }
        .progress-tracker .timeline-item.completed .timeline-marker svg {
          color: white !important;
        }
        .progress-tracker .timeline-item.in_progress .timeline-marker {
          border-color: #ffc107;
          background: #ffc107;
        }
        .progress-tracker .timeline-item.in_progress .timeline-marker svg {
          color: white !important;
        }
        .progress-tracker .timeline-content {
          flex-grow: 1;
          padding-top: 4px;
        }
        .progress-tracker .timeline::before {
          content: "";
          position: absolute;
          left: 19px;
          top: 0;
          bottom: 0;
          width: 2px;
          background: #dee2e6;
          z-index: 0;
        }
        .progress-tracker .timeline-item:last-child::before {
          display: none;
        }
        .progress-tracker .timeline-item.completed::before {
          background: #28a745;
        }
        .progress-tracker .timeline-item.in_progress::before {
          background: #ffc107;
        }
      `}</style>
    </div>
  );
};

export default ProgressTracker;
