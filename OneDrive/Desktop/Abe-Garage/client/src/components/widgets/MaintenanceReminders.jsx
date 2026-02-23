import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaBell,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaClock,
  FaDollarSign,
  FaCar,
  FaWrench,
  FaCheckCircle,
  FaFilter,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

const MaintenanceReminders = () => {
  const { user } = useAuth();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, due, upcoming, overdue

  useEffect(() => {
    fetchMaintenanceReminders();
  }, [user]);

  const fetchMaintenanceReminders = async () => {
    try {
      setLoading(true);

      // Mock data for demo
      const mockReminders = [
        {
          id: 1,
          service_type: "Oil Change",
          due_date: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
          ).toISOString(), // 7 days from now
          last_service_date: new Date(
            Date.now() - 3 * 30 * 24 * 60 * 60 * 1000
          ).toISOString(), // 3 months ago
          mileage_due: 5000,
          last_service_mileage: 45000,
          current_mileage: 48500,
          estimated_cost: 45,
          priority: "high",
          urgency: "due_soon",
          description: "Regular oil change recommended every 5,000 miles",
          vehicle_info: {
            year: 2020,
            brand: "Toyota",
            model: "Camry",
          },
        },
        {
          id: 2,
          service_type: "Tire Rotation",
          due_date: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(), // 30 days from now
          last_service_date: new Date(
            Date.now() - 6 * 30 * 24 * 60 * 60 * 1000
          ).toISOString(), // 6 months ago
          mileage_due: 6000,
          last_service_mileage: 42000,
          current_mileage: 48500,
          estimated_cost: 25,
          priority: "medium",
          urgency: "upcoming",
          description: "Tire rotation recommended every 6 months for even wear",
          vehicle_info: {
            year: 2020,
            brand: "Toyota",
            model: "Camry",
          },
        },
        {
          id: 3,
          service_type: "Brake Inspection",
          due_date: new Date(
            Date.now() - 5 * 24 * 60 * 60 * 1000
          ).toISOString(), // 5 days ago (overdue)
          last_service_date: new Date(
            Date.now() - 12 * 30 * 24 * 60 * 60 * 1000
          ).toISOString(), // 12 months ago
          mileage_due: 12000,
          last_service_mileage: 36500,
          current_mileage: 48500,
          estimated_cost: 85,
          priority: "critical",
          urgency: "overdue",
          description: "Annual brake inspection recommended for safety",
          vehicle_info: {
            year: 2020,
            brand: "Toyota",
            model: "Camry",
          },
        },
        {
          id: 4,
          service_type: "Air Filter Replacement",
          due_date: new Date(
            Date.now() + 90 * 24 * 60 * 60 * 1000
          ).toISOString(), // 90 days from now
          last_service_date: new Date(
            Date.now() - 11 * 30 * 24 * 60 * 60 * 1000
          ).toISOString(), // 11 months ago
          mileage_due: 15000,
          last_service_mileage: 33500,
          current_mileage: 48500,
          estimated_cost: 30,
          priority: "low",
          urgency: "future",
          description: "Engine air filter replacement recommended annually",
          vehicle_info: {
            year: 2020,
            brand: "Toyota",
            model: "Camry",
          },
        },
        {
          id: 5,
          service_type: "Transmission Service",
          due_date: new Date(
            Date.now() + 60 * 24 * 60 * 60 * 1000
          ).toISOString(), // 60 days from now
          last_service_date: new Date(
            Date.now() - 24 * 30 * 24 * 60 * 60 * 1000
          ).toISOString(), // 24 months ago
          mileage_due: 30000,
          last_service_mileage: 18500,
          current_mileage: 48500,
          estimated_cost: 150,
          priority: "medium",
          urgency: "upcoming",
          description: "Transmission service recommended every 30,000 miles",
          vehicle_info: {
            year: 2020,
            brand: "Toyota",
            model: "Camry",
          },
        },
      ];

      setTimeout(() => {
        setReminders(mockReminders);
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.error("Error fetching maintenance reminders:", err);
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case "overdue":
        return "#ef4444"; // red
      case "due_soon":
        return "#f59e0b"; // amber
      case "upcoming":
        return "#3b82f6"; // blue
      case "future":
        return "#10b981"; // green
      default:
        return "#6b7280"; // gray
    }
  };

  const getUrgencyLabel = (urgency) => {
    switch (urgency) {
      case "overdue":
        return "Overdue";
      case "due_soon":
        return "Due Soon";
      case "upcoming":
        return "Upcoming";
      case "future":
        return "Future";
      default:
        return "Scheduled";
    }
  };

  const getUrgencyIcon = (urgency) => {
    switch (urgency) {
      case "overdue":
        return <FaExclamationTriangle className="text-danger" />;
      case "due_soon":
        return <FaClock className="text-warning" />;
      case "upcoming":
        return <FaCalendarAlt className="text-primary" />;
      case "future":
        return <FaCheckCircle className="text-success" />;
      default:
        return <FaBell className="text-secondary" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `Overdue by ${Math.abs(diffDays)} days`;
    } else if (diffDays === 0) {
      return "Due today";
    } else if (diffDays === 1) {
      return "Due tomorrow";
    } else if (diffDays <= 7) {
      return `Due in ${diffDays} days`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  const calculateMileageDue = (reminder) => {
    const mileageSinceLast =
      reminder.current_mileage - reminder.last_service_mileage;
    const mileageUntilDue = reminder.mileage_due - mileageSinceLast;

    if (mileageUntilDue <= 0) {
      return "Overdue by mileage";
    } else if (mileageUntilDue <= 500) {
      return `${mileageUntilDue} miles due`;
    } else {
      return `${mileageUntilDue.toLocaleString()} miles until due`;
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "critical":
        return <FaExclamationTriangle className="text-danger" />;
      case "high":
        return <FaBell className="text-warning" />;
      case "medium":
        return <FaWrench className="text-primary" />;
      case "low":
        return <FaCheckCircle className="text-success" />;
      default:
        return <FaBell className="text-secondary" />;
    }
  };

  const filteredReminders = reminders.filter((reminder) => {
    switch (filter) {
      case "due":
        return (
          reminder.urgency === "due_soon" || reminder.urgency === "overdue"
        );
      case "upcoming":
        return reminder.urgency === "upcoming";
      case "overdue":
        return reminder.urgency === "overdue";
      default:
        return true;
    }
  });

  const getFilterCount = (filterType) => {
    switch (filterType) {
      case "due":
        return reminders.filter(
          (r) => r.urgency === "due_soon" || r.urgency === "overdue"
        ).length;
      case "upcoming":
        return reminders.filter((r) => r.urgency === "upcoming").length;
      case "overdue":
        return reminders.filter((r) => r.urgency === "overdue").length;
      default:
        return reminders.length;
    }
  };

  if (loading) {
    return (
      <div className="card h-100">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h6 className="mb-0">
            <FaBell className="me-2 text-primary" />
            Maintenance Reminders
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
          Maintenance Reminders
        </h6>
        <div className="dropdown">
          <button
            className="btn btn-outline-secondary btn-sm dropdown-toggle"
            type="button"
            data-bs-toggle="dropdown"
          >
            <FaFilter className="me-1" />
            {filter === "all" ? "All" : getUrgencyLabel(filter)}
          </button>
          <ul className="dropdown-menu">
            <li>
              <button
                className={`dropdown-item ${filter === "all" ? "active" : ""}`}
                onClick={() => setFilter("all")}
              >
                All ({getFilterCount("all")})
              </button>
            </li>
            <li>
              <button
                className={`dropdown-item ${filter === "due" ? "active" : ""}`}
                onClick={() => setFilter("due")}
              >
                Due Soon ({getFilterCount("due")})
              </button>
            </li>
            <li>
              <button
                className={`dropdown-item ${
                  filter === "upcoming" ? "active" : ""
                }`}
                onClick={() => setFilter("upcoming")}
              >
                Upcoming ({getFilterCount("upcoming")})
              </button>
            </li>
            <li>
              <button
                className={`dropdown-item ${
                  filter === "overdue" ? "active" : ""
                }`}
                onClick={() => setFilter("overdue")}
              >
                Overdue ({getFilterCount("overdue")})
              </button>
            </li>
          </ul>
        </div>
      </div>
      <div className="card-body">
        {filteredReminders.length === 0 ? (
          <div className="text-center py-4">
            <FaCheckCircle
              className="text-success mb-2"
              style={{ fontSize: "2rem" }}
            />
            <p className="text-muted mb-0">
              No maintenance reminders for the selected filter
            </p>
          </div>
        ) : (
          <div className="reminders-list">
            {filteredReminders.slice(0, 4).map((reminder) => (
              <div
                key={reminder.id}
                className="reminder-item mb-3 p-3 border rounded-3"
                style={{
                  borderLeft: `4px solid ${getUrgencyColor(reminder.urgency)}`,
                }}
              >
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div className="d-flex align-items-center">
                    {getPriorityIcon(reminder.priority)}
                    {reminder.service_type === "Oil Change" && (
                      <div
                        className="ms-2 me-2"
                        style={{ position: "relative" }}
                      >
                        <img
                          src="/pouring-golden-oil-from-bottle.jpg"
                          alt="Oil change"
                          style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            objectFit: "cover",
                            border: "2px solid #fbbf24",
                          }}
                        />
                        <div
                          className="position-absolute"
                          style={{
                            top: "-2px",
                            right: "-2px",
                            width: "8px",
                            height: "8px",
                            backgroundColor: "#fbbf24",
                            borderRadius: "50%",
                            border: "1px solid white",
                          }}
                        />
                      </div>
                    )}
                    {(reminder.service_type === "Engine Diagnostics" ||
                      reminder.service_type.includes("Engine") ||
                      reminder.service_type === "Spark Plug Replacement") && (
                      <div
                        className="ms-2 me-2"
                        style={{ position: "relative" }}
                      >
                        <img
                          src="/close-up-nozzles-diesel-engine-opened-bonnet.jpg"
                          alt="Engine diagnostics"
                          style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            objectFit: "cover",
                            border: "2px solid #ef4444",
                          }}
                        />
                        <div
                          className="position-absolute"
                          style={{
                            top: "-2px",
                            right: "-2px",
                            width: "8px",
                            height: "8px",
                            backgroundColor: "#ef4444",
                            borderRadius: "50%",
                            border: "1px solid white",
                          }}
                        />
                      </div>
                    )}
                    <h6 className="ms-2 mb-0">{reminder.service_type}</h6>
                  </div>
                  <div className="text-end">
                    <div className="d-flex align-items-center">
                      {getUrgencyIcon(reminder.urgency)}
                      <small
                        className="ms-1 fw-bold"
                        style={{ color: getUrgencyColor(reminder.urgency) }}
                      >
                        {getUrgencyLabel(reminder.urgency)}
                      </small>
                    </div>
                  </div>
                </div>

                <p className="text-muted small mb-2">{reminder.description}</p>

                <div className="row g-2 mb-2">
                  <div className="col-6">
                    <small className="text-muted d-block">Due Date</small>
                    <div className="d-flex align-items-center">
                      <FaCalendarAlt className="me-1 text-primary" />
                      <small className="fw-bold">
                        {formatDate(reminder.due_date)}
                      </small>
                    </div>
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-block">Mileage</small>
                    <div className="d-flex align-items-center">
                      <FaCar className="me-1 text-primary" />
                      <small className="fw-bold">
                        {calculateMileageDue(reminder)}
                      </small>
                    </div>
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <FaDollarSign className="me-1 text-success" />
                    <small className="fw-bold text-success">
                      ${reminder.estimated_cost}
                    </small>
                  </div>
                  <Link
                    to={`/book-appointment?service=${encodeURIComponent(
                      reminder.service_type
                    )}`}
                    className="btn btn-outline-primary btn-sm"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredReminders.length > 4 && (
          <div className="text-center mt-3">
            <Link
              to="/maintenance-reminders"
              className="btn btn-outline-secondary btn-sm"
            >
              View All {filteredReminders.length} Reminders
            </Link>
          </div>
        )}

        {filteredReminders.length === 0 && filter === "all" && (
          <div className="text-center mt-3">
            <Link to="/book-appointment" className="btn btn-primary btn-sm">
              <FaCalendarAlt className="me-1" />
              Schedule Maintenance
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaintenanceReminders;
