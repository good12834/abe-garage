import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { appointmentsAPI } from "../services/api";

const TrackMyCar = () => {
  const { user } = useAuth();
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    loadCurrentAppointment();
    loadChatMessages();
  }, []);

  const loadCurrentAppointment = async () => {
    try {
      const response = await appointmentsAPI.getMyAppointments();
      // Find the most recent active appointment
      const activeAppointment = response.data.data.appointments
        .filter((a) => ["pending", "approved", "in_service"].includes(a.status))
        .sort(
          (a, b) => new Date(b.appointment_date) - new Date(a.appointment_date)
        )[0];

      setCurrentAppointment(activeAppointment);
    } catch (error) {
      console.error("Error loading appointment:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadChatMessages = async () => {
    // Mock chat messages - in real app, this would come from API
    setMessages([
      {
        id: 1,
        sender: "mechanic",
        senderName: "John Smith",
        message:
          "Your car is now in the diagnosis phase. We'll update you soon.",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        id: 2,
        sender: "customer",
        senderName: user?.first_name + " " + user?.last_name,
        message:
          "Thank you for the update. How long do you think it will take?",
        timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000), // 1.5 hours ago
      },
      {
        id: 3,
        sender: "mechanic",
        senderName: "John Smith",
        message: "We should have the diagnosis complete within the next hour.",
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      },
    ]);
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: messages.length + 1,
      sender: "customer",
      senderName: user?.first_name + " " + user?.last_name,
      message: newMessage,
      timestamp: new Date(),
    };

    setMessages([...messages, message]);
    setNewMessage("");

    // In real app, send to server
  };

  const getTimelineSteps = () => {
    return [
      {
        id: 1,
        title: "Appointment Confirmed",
        icon: "bi-calendar-check",
        completed: true,
      },
      {
        id: 2,
        title: "Diagnosis Started",
        icon: "bi-search",
        completed: currentAppointment?.status !== "pending",
      },
      {
        id: 3,
        title: "Parts Ordered",
        icon: "bi-box-seam",
        completed: currentAppointment?.status === "in_service",
      },
      {
        id: 4,
        title: "Repair In Progress",
        icon: "bi-wrench",
        completed: false,
      },
      {
        id: 5,
        title: "Quality Check",
        icon: "bi-check-circle",
        completed: false,
      },
      {
        id: 6,
        title: "Completed – Ready for Pickup",
        icon: "bi-car-front",
        completed: currentAppointment?.status === "completed",
      },
    ];
  };

  const getCurrentStep = () => {
    if (!currentAppointment) return 0;

    switch (currentAppointment.status) {
      case "pending":
        return 1;
      case "approved":
        return 2;
      case "in_service":
        return 4;
      case "completed":
        return 6;
      default:
        return 1;
    }
  };

  if (loading) {
    return (
      <div className="d-flex">
        <div className="sidebar">
          <div className="sidebar-header">
            <h5 className="mb-0">
              <i className="bi bi-tools me-2"></i>
              Abe Garage
            </h5>
          </div>
        </div>
        <div className="main-content flex-grow-1">
          <div className="container-fluid py-4">
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const timelineSteps = getTimelineSteps();
  const currentStep = getCurrentStep();

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h5 className="mb-0">
            <i className="bi bi-tools me-2"></i>
            Abe Garage
          </h5>
        </div>
        <nav className="sidebar-nav">
          <a href="/customer/dashboard" className="sidebar-link">
            <i className="bi bi-speedometer2 me-2"></i>
            Dashboard
          </a>
          <a href="/customer/appointments" className="sidebar-link">
            <i className="bi bi-calendar-check me-2"></i>
            My Appointments
          </a>
          <a href="/track-my-car" className="sidebar-link active">
            <i className="bi bi-car-front me-2"></i>
            Track My Car
          </a>
          <a href="/customer/vehicle-history" className="sidebar-link">
            <i className="bi bi-clock-history me-2"></i>
            Vehicle History
          </a>
          <a href="/customer/invoices" className="sidebar-link">
            <i className="bi bi-receipt me-2"></i>
            Invoices
          </a>
          <a href="/customer/settings" className="sidebar-link">
            <i className="bi bi-gear me-2"></i>
            Settings
          </a>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content flex-grow-1">
        <div className="container-fluid py-4">
          <div className="row">
            <div className="col-12">
              <h2 className="mb-4">
                <i className="bi bi-car-front me-2"></i>
                Track My Car
              </h2>
            </div>
          </div>

          {currentAppointment ? (
            <>
              {/* Progress Timeline */}
              <div className="row mb-4">
                <div className="col-12">
                  <div className="card">
                    <div className="card-header">
                      <h5 className="mb-0">
                        <i className="bi bi-bar-chart-steps me-2"></i>
                        Service Progress
                      </h5>
                    </div>
                    <div className="card-body">
                      <div className="progress-timeline">
                        {timelineSteps.map((step, index) => (
                          <div key={step.id} className="timeline-step">
                            <div className="timeline-connector"></div>
                            <div
                              className={`timeline-icon ${
                                step.completed || index + 1 <= currentStep
                                  ? "completed"
                                  : index + 1 === currentStep
                                  ? "current"
                                  : ""
                              }`}
                            >
                              <i className={`bi ${step.icon}`}></i>
                            </div>
                            <div className="timeline-content">
                              <h6
                                className={`timeline-title ${
                                  step.completed || index + 1 <= currentStep
                                    ? "completed"
                                    : ""
                                }`}
                              >
                                {step.title}
                              </h6>
                              {index + 1 === currentStep && (
                                <small className="text-muted">
                                  In Progress
                                </small>
                              )}
                              {step.completed && (
                                <small className="text-success">
                                  Completed
                                </small>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row">
                {/* Live Chat */}
                <div className="col-lg-8 mb-4">
                  <div className="card">
                    <div className="card-header">
                      <h5 className="mb-0">
                        <i className="bi bi-chat-dots me-2"></i>
                        Live Chat
                      </h5>
                    </div>
                    <div className="card-body">
                      <div
                        className="chat-messages"
                        style={{
                          height: "400px",
                          overflowY: "auto",
                          border: "1px solid #dee2e6",
                          borderRadius: "4px",
                          padding: "1rem",
                          marginBottom: "1rem",
                        }}
                      >
                        {messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`chat-message ${
                              msg.sender === "customer"
                                ? "customer"
                                : "mechanic"
                            }`}
                          >
                            <div className="message-header">
                              <strong>{msg.senderName}</strong>
                              <small className="text-muted ms-2">
                                {msg.timestamp.toLocaleTimeString()}
                              </small>
                            </div>
                            <div className="message-content">{msg.message}</div>
                          </div>
                        ))}
                      </div>
                      <div className="chat-input">
                        <div className="input-group">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Type your message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) =>
                              e.key === "Enter" && sendMessage()
                            }
                          />
                          <button
                            className="btn btn-primary"
                            onClick={sendMessage}
                          >
                            <i className="bi bi-send"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Before/After Images */}
                <div className="col-lg-4 mb-4">
                  <div className="card">
                    <div className="card-header">
                      <h5 className="mb-0">
                        <i className="bi bi-images me-2"></i>
                        Before/After Gallery
                      </h5>
                    </div>
                    <div className="card-body">
                      <div className="text-center">
                        <div className="mb-3">
                          <h6>Before Service</h6>
                          <img
                            src="https://plus.unsplash.com/premium_photo-1676747433317-de4e84df75ad?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8Z2FyYWdlfGVufDB8fDB8fHww"
                            alt="Before service"
                            className="img-fluid rounded"
                          />
                        </div>
                        <div className="mb-3">
                          <h6>After Service</h6>
                          <img
                            src="https://images.unsplash.com/photo-1704340142770-b52988e5b6eb?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDF8MHxzZWFyY2h8MTB8fGNhcnxlbnwwfHwwfHx8MA%3D%3D"
                            alt="After service"
                            className="img-fluid rounded"
                          />
                        </div>
                        <small className="text-muted">
                          Images will be uploaded by the mechanic during service
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="row">
              <div className="col-12">
                <div className="card">
                  <div className="card-body text-center py-5">
                    <i
                      className="bi bi-car-front text-muted"
                      style={{ fontSize: "4rem" }}
                    ></i>
                    <h4 className="mt-3">No Active Service</h4>
                    <p className="text-muted">
                      You don't have any active appointments to track.
                    </p>
                    <a href="/book-appointment" className="btn btn-primary">
                      <i className="bi bi-calendar-plus me-2"></i>
                      Book a Service
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackMyCar;
