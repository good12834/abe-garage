import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { appointmentsAPI } from "../services/api";
import { toast } from "react-toastify";
import { formatDateForDisplay, formatCurrency } from "../services/api";
import ChatMessages from "../components/ChatMessages";

const AppointmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    const fetchAppointmentDetail = async () => {
      try {
        // Validate ID before making request
        if (!id || isNaN(id) || parseInt(id) <= 0) {
          toast.error("Invalid appointment ID");
          navigate("/customer/appointments");
          return;
        }

        const response = await appointmentsAPI.getAppointmentById(id);

        // Check if response has expected structure
        if (
          !response.data ||
          !response.data.data ||
          !response.data.data.appointment
        ) {
          throw new Error("Invalid response format from server");
        }

        setAppointment(response.data.data.appointment);
      } catch (error) {
        console.error("Error fetching appointment details:", error);

        // Provide more specific error messages
        if (error.response?.status === 400) {
          const errorMessage = error.response?.data?.error?.message;
          if (errorMessage === "Appointment not found") {
            toast.error(
              "Appointment not found. It may have been deleted or the ID is incorrect."
            );
            navigate("/customer/appointments");
          } else {
            toast.error("Invalid appointment ID or request format");
          }
        } else if (error.response?.status === 404) {
          toast.error("Appointment not found");
          navigate("/customer/appointments");
        } else if (error.response?.status === 401) {
          toast.error("Authentication required. Please login again.");
          navigate("/login");
        } else {
          toast.error("Failed to load appointment details");
        }
      } finally {
        setLoading(false);
      }
    };

    if (user && id) {
      fetchAppointmentDetail();
    }
  }, [id, user, navigate]);

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: "badge bg-warning text-dark",
      approved: "badge bg-info",
      in_service: "badge bg-primary",
      completed: "badge bg-success",
      cancelled: "badge bg-danger",
    };

    const statusText = {
      pending: "Pending",
      approved: "Approved",
      in_service: "In Service",
      completed: "Completed",
      cancelled: "Cancelled",
    };

    return (
      <span className={statusClasses[status] || "badge bg-secondary"}>
        {statusText[status] || status}
      </span>
    );
  };

  const getStatusIcon = (status) => {
    const iconMap = {
      pending: "bi-clock",
      approved: "bi-check-circle",
      in_service: "bi-gear",
      completed: "bi-check-circle-fill",
      cancelled: "bi-x-circle",
    };
    return iconMap[status] || "bi-question-circle";
  };

  const handleCancelAppointment = async () => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }

    try {
      await appointmentsAPI.cancelAppointment(
        appointment.id,
        "Cancelled by customer"
      );
      toast.success("Appointment cancelled successfully");
      // Refresh appointment data
      const response = await appointmentsAPI.getAppointmentById(id);
      setAppointment(response.data.data.appointment);
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast.error("Failed to cancel appointment");
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <h4>Appointment not found</h4>
          <Link to="/customer/appointments" className="btn btn-primary">
            Back to Appointments
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="appointment-detail">
      <div className="container-fluid py-4">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <nav aria-label="breadcrumb">
                  <ol className="breadcrumb mb-2">
                    <li className="breadcrumb-item">
                      <Link to="/customer/dashboard">Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item">
                      <Link to="/customer/appointments">Appointments</Link>
                    </li>
                    <li className="breadcrumb-item active">
                      Appointment #{appointment.id}
                    </li>
                  </ol>
                </nav>
                <h2 className="mb-0">{appointment.service_name}</h2>
                <p className="text-muted mb-0">Appointment #{appointment.id}</p>
              </div>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-outline-primary"
                  onClick={() => setShowChat(!showChat)}
                >
                  <i className="bi bi-chat me-2"></i>
                  {showChat ? "Hide" : "Show"} Chat
                </button>
                {appointment.status === "pending" && (
                  <button
                    className="btn btn-outline-danger"
                    onClick={handleCancelAppointment}
                  >
                    <i className="bi bi-x-circle me-2"></i>
                    Cancel Appointment
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          {/* Main Content */}
          <div className="col-lg-8">
            {/* Status Card */}
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">
                  <i
                    className={`bi ${getStatusIcon(appointment.status)} me-2`}
                  ></i>
                  Appointment Status
                </h5>
              </div>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="h4 mb-0">
                    {getStatusBadge(appointment.status)}
                  </span>
                  <small className="text-muted">
                    Last updated: {formatDateForDisplay(appointment.updated_at)}
                  </small>
                </div>

                {appointment.status === "in_service" && (
                  <div className="alert alert-primary">
                    <i className="bi bi-gear me-2"></i>
                    Your vehicle is currently being serviced. You can chat with
                    the mechanic for updates.
                  </div>
                )}

                {appointment.status === "completed" && (
                  <div className="alert alert-success">
                    <i className="bi bi-check-circle me-2"></i>
                    Service completed successfully! Check your invoices for
                    billing details.
                  </div>
                )}
              </div>
            </div>

            {/* Appointment Details */}
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="bi bi-info-circle me-2"></i>
                  Appointment Details
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-bold">Service</label>
                      <p className="mb-0">{appointment.service_name}</p>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-bold">Date & Time</label>
                      <p className="mb-0">
                        <i className="bi bi-calendar me-2"></i>
                        {formatDateForDisplay(appointment.appointment_date)}
                      </p>
                      <p className="mb-0">
                        <i className="bi bi-clock me-2"></i>
                        {new Date(
                          appointment.appointment_date
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-bold">Duration</label>
                      <p className="mb-0">
                        {appointment.duration_minutes} minutes
                      </p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-bold">Vehicle</label>
                      <p className="mb-0">
                        {appointment.car_year} {appointment.car_brand}{" "}
                        {appointment.car_model}
                      </p>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-bold">
                        Estimated Cost
                      </label>
                      <p className="mb-0">
                        {appointment.estimated_cost
                          ? formatCurrency(appointment.estimated_cost)
                          : "To be determined"}
                      </p>
                    </div>
                    {appointment.final_cost && (
                      <div className="mb-3">
                        <label className="form-label fw-bold">Final Cost</label>
                        <p className="mb-0 text-success fw-bold">
                          {formatCurrency(appointment.final_cost)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {appointment.problem_description && (
                  <div className="mb-3">
                    <label className="form-label fw-bold">
                      Problem Description
                    </label>
                    <p className="mb-0">{appointment.problem_description}</p>
                  </div>
                )}

                {appointment.notes && (
                  <div className="mb-3">
                    <label className="form-label fw-bold">
                      Additional Notes
                    </label>
                    <p className="mb-0">{appointment.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Service History */}
            {appointment.status === "completed" && (
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">
                    <i className="bi bi-tools me-2"></i>
                    Service Summary
                  </h5>
                </div>
                <div className="card-body">
                  <p className="text-muted">
                    Service completed on{" "}
                    {formatDateForDisplay(appointment.updated_at)}. For detailed
                    service history, visit your vehicle history page.
                  </p>
                  <Link
                    to="/customer/vehicle-history"
                    className="btn btn-outline-primary"
                  >
                    <i className="bi bi-clock-history me-2"></i>
                    View Service History
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Chat Sidebar */}
          <div className="col-lg-4">
            {showChat && (
              <div className="card">
                <div className="card-header">
                  <h6 className="mb-0">
                    <i className="bi bi-chat me-2"></i>
                    Chat with Mechanic
                  </h6>
                </div>
                <div className="card-body p-0">
                  <ChatMessages
                    appointmentId={appointment.id}
                    onClose={() => setShowChat(false)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetail;
