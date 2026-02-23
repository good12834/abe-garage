import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { appointmentsAPI } from "../services/api";
import { toast } from "react-toastify";
import { formatDateForDisplay, formatCurrency } from "../services/api";

const CustomerAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await appointmentsAPI.getMyAppointments();
        setAppointments(response.data.data.appointments);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        toast.error("Failed to load appointments");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: "badge bg-warning",
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

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="h3 mb-0">My Appointments</h1>
            <a href="/book-appointment" className="btn btn-primary">
              <i className="bi bi-plus-circle me-2"></i>
              Book New Appointment
            </a>
          </div>

          {appointments.length === 0 ? (
            <div className="text-center py-5">
              <i
                className="bi bi-calendar-x text-muted"
                style={{ fontSize: "3rem" }}
              ></i>
              <h4 className="mt-3 text-muted">No appointments found</h4>
              <p className="text-muted">
                You haven't booked any appointments yet.
              </p>
              <a href="/book-appointment" className="btn btn-primary">
                Book Your First Appointment
              </a>
            </div>
          ) : (
            <div className="row">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="col-lg-6 col-xl-4 mb-4">
                  <div className="card h-100 shadow-sm">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <h5 className="card-title mb-0">
                          {appointment.service_name}
                        </h5>
                        {getStatusBadge(appointment.status)}
                      </div>

                      <div className="mb-3">
                        <p className="mb-1">
                          <i className="bi bi-calendar me-2"></i>
                          {formatDateForDisplay(appointment.appointment_date)}
                        </p>
                        <p className="mb-1">
                          <i className="bi bi-clock me-2"></i>
                          Duration: {appointment.duration_minutes} minutes
                        </p>
                        <p className="mb-1">
                          <i className="bi bi-car-front me-2"></i>
                          {appointment.car_year} {appointment.car_brand}{" "}
                          {appointment.car_model}
                        </p>
                        {appointment.estimated_cost && (
                          <p className="mb-1">
                            <i className="bi bi-cash me-2"></i>
                            Estimated:{" "}
                            {formatCurrency(appointment.estimated_cost)}
                          </p>
                        )}
                        {appointment.final_cost && (
                          <p className="mb-1">
                            <i className="bi bi-check-circle me-2"></i>
                            Final: {formatCurrency(appointment.final_cost)}
                          </p>
                        )}
                      </div>

                      {appointment.problem_description && (
                        <div className="mb-3">
                          <strong>Problem Description:</strong>
                          <p className="mb-0 text-muted small">
                            {appointment.problem_description}
                          </p>
                        </div>
                      )}

                      {appointment.notes && (
                        <div className="mb-3">
                          <strong>Notes:</strong>
                          <p className="mb-0 text-muted small">
                            {appointment.notes}
                          </p>
                        </div>
                      )}

                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => navigate(`/customer/appointments/${appointment.id}`)}
                        >
                          <i className="bi bi-eye me-1"></i>
                          View Details
                        </button>
                        {appointment.status === "pending" && (
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => {
                              // Cancel appointment
                              toast.info("Cancel feature coming soon");
                            }}
                          >
                            <i className="bi bi-x-circle me-1"></i>
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerAppointments;
