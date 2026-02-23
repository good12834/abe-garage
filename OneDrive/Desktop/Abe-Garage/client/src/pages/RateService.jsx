import React, { useState, useEffect } from "react";
import "../styles/professional-styles.css";
import {
  FaStar,
  FaCheckCircle,
  FaClock,
  FaUser,
  FaCar,
  FaTools,
} from "react-icons/fa";

const RateService = () => {
  const [recentServices, setRecentServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for recent services that can be rated
    const mockServices = [
      {
        id: 1,
        service_name: "Oil Change & Filter Replacement",
        date: "2024-12-08",
        technician: "Mike Johnson",
        vehicle: "2020 Toyota Camry",
        status: "completed",
        canRate: true,
        rating: null,
      },
      {
        id: 2,
        service_name: "Brake Inspection & Pad Replacement",
        date: "2024-11-25",
        technician: "Sarah Davis",
        vehicle: "2020 Toyota Camry",
        status: "completed",
        canRate: true,
        rating: null,
      },
      {
        id: 3,
        service_name: "Tire Rotation & Balance",
        date: "2024-11-15",
        technician: "John Smith",
        vehicle: "2020 Toyota Camry",
        status: "completed",
        canRate: false,
        rating: 5,
      },
    ];

    setTimeout(() => {
      setRecentServices(mockServices);
      setLoading(false);
    }, 1000);
  }, []);

  const handleRatingSubmit = (e) => {
    e.preventDefault();
    if (!selectedService || rating === 0) return;

    // Update the service with the rating
    setRecentServices((prev) =>
      prev.map((service) =>
        service.id === selectedService.id
          ? { ...service, rating, canRate: false }
          : service
      )
    );

    setSubmitted(true);

    // Reset form after 2 seconds
    setTimeout(() => {
      setSelectedService(null);
      setRating(0);
      setHoverRating(0);
      setFeedback("");
      setSubmitted(false);
    }, 2000);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return "bg-success";
      case "in_progress":
        return "bg-warning";
      default:
        return "bg-secondary";
    }
  };

  const renderStars = (currentRating, interactive = true) => {
    return (
      <div className="rating-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={`star ${
              star <= (interactive ? hoverRating || rating : currentRating)
                ? "filled"
                : ""
            }`}
            onClick={interactive ? () => setRating(star) : undefined}
            onMouseEnter={interactive ? () => setHoverRating(star) : undefined}
            onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
            style={{ cursor: interactive ? "pointer" : "default" }}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading recent services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rate-service-page">
      <div className="container-fluid py-4">
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h1 className="mb-2">
                  <FaStar className="text-warning me-3" />
                  Rate Your Service
                </h1>
                <p className="text-muted mb-0">
                  Help us improve by rating your recent service experience
                </p>
              </div>
              <div className="text-end">
                <small className="text-muted d-block">
                  Your feedback matters
                </small>
                <small className="fw-medium text-primary">Rate & Review</small>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          {/* Recent Services List */}
          <div className="col-lg-6 mb-4">
            <div className="card h-100">
              <div className="card-header">
                <h5 className="mb-0">
                  <FaClock className="me-2 text-primary" />
                  Recent Services
                </h5>
              </div>
              <div className="card-body">
                {recentServices.length === 0 ? (
                  <div className="text-center py-4">
                    <FaTools
                      className="text-muted mb-3"
                      style={{ fontSize: "3rem" }}
                    />
                    <p className="text-muted">No recent services found</p>
                  </div>
                ) : (
                  <div className="services-list">
                    {recentServices.map((service) => (
                      <div
                        key={service.id}
                        className={`service-item p-3 mb-3 rounded border ${
                          selectedService?.id === service.id
                            ? "border-primary bg-light"
                            : "border"
                        }`}
                        style={{
                          cursor: service.canRate ? "pointer" : "default",
                        }}
                        onClick={() =>
                          service.canRate && setSelectedService(service)
                        }
                      >
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="mb-1">{service.service_name}</h6>
                          <span
                            className={`badge ${getStatusBadge(
                              service.status
                            )}`}
                          >
                            {service.status.replace("_", " ")}
                          </span>
                        </div>

                        <div className="service-details text-muted small mb-2">
                          <div className="d-flex align-items-center mb-1">
                            <FaCar className="me-2" />
                            {service.vehicle}
                          </div>
                          <div className="d-flex align-items-center mb-1">
                            <FaUser className="me-2" />
                            {service.technician}
                          </div>
                          <div className="d-flex align-items-center">
                            <FaClock className="me-2" />
                            {new Date(service.date).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="d-flex justify-content-between align-items-center">
                          {service.rating ? (
                            <div className="d-flex align-items-center">
                              <span className="me-2">Your rating:</span>
                              {renderStars(service.rating, false)}
                            </div>
                          ) : service.canRate ? (
                            <button
                              className="btn btn-outline-primary btn-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedService(service);
                              }}
                            >
                              Rate This Service
                            </button>
                          ) : (
                            <span className="text-muted small">
                              Already rated
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Rating Form */}
          <div className="col-lg-6 mb-4">
            <div className="card h-100">
              <div className="card-header">
                <h5 className="mb-0">
                  <FaStar className="me-2 text-warning" />
                  {submitted ? "Thank You!" : "Rate Your Experience"}
                </h5>
              </div>
              <div className="card-body">
                {submitted ? (
                  <div className="text-center py-4">
                    <FaCheckCircle
                      className="text-success mb-3"
                      style={{ fontSize: "4rem" }}
                    />
                    <h4 className="text-success mb-3">Rating Submitted!</h4>
                    <p className="text-muted">
                      Thank you for your feedback. Your rating helps us improve
                      our services.
                    </p>
                  </div>
                ) : selectedService ? (
                  <form onSubmit={handleRatingSubmit}>
                    <div className="selected-service-info mb-4 p-3 bg-light rounded">
                      <h6 className="mb-2">Service Details</h6>
                      <p className="mb-1 fw-medium">
                        {selectedService.service_name}
                      </p>
                      <p className="mb-1 text-muted small">
                        <FaCar className="me-1" />
                        {selectedService.vehicle}
                      </p>
                      <p className="mb-0 text-muted small">
                        <FaUser className="me-1" />
                        {selectedService.technician} •{" "}
                        {new Date(selectedService.date).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="rating-section mb-4">
                      <label className="form-label fw-medium">
                        How would you rate this service?
                      </label>
                      <div className="rating-input mb-2">
                        {renderStars(rating, true)}
                      </div>
                      <div className="rating-labels d-flex justify-content-between text-muted small">
                        <span>Poor</span>
                        <span>Excellent</span>
                      </div>
                    </div>

                    <div className="feedback-section mb-4">
                      <label
                        htmlFor="feedback"
                        className="form-label fw-medium"
                      >
                        Additional Comments (Optional)
                      </label>
                      <textarea
                        className="form-control"
                        id="feedback"
                        rows="4"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Tell us more about your experience..."
                      ></textarea>
                    </div>

                    <div className="d-flex gap-2">
                      <button
                        type="submit"
                        className="btn btn-primary flex-grow-1"
                        disabled={rating === 0}
                      >
                        <FaStar className="me-2" />
                        Submit Rating
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => {
                          setSelectedService(null);
                          setRating(0);
                          setHoverRating(0);
                          setFeedback("");
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center py-4">
                    <FaStar
                      className="text-muted mb-3"
                      style={{ fontSize: "3rem" }}
                    />
                    <h5 className="text-muted mb-2">
                      Select a Service to Rate
                    </h5>
                    <p className="text-muted small">
                      Choose a recent service from the list to leave your
                      feedback
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Rating Statistics */}
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">
                  <FaStar className="me-2 text-warning" />
                  Your Rating History
                </h5>
              </div>
              <div className="card-body">
                <div className="row text-center">
                  <div className="col-md-3 mb-3">
                    <div className="stat-item">
                      <div className="stat-number text-primary fs-2 fw-bold">
                        {recentServices.filter((s) => s.rating).length}
                      </div>
                      <div className="stat-label text-muted">
                        Services Rated
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="stat-item">
                      <div className="stat-number text-success fs-2 fw-bold">
                        {recentServices.filter((s) => s.rating >= 4).length}
                      </div>
                      <div className="stat-label text-muted">Highly Rated</div>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="stat-item">
                      <div className="stat-number text-warning fs-2 fw-bold">
                        {recentServices.filter((s) => s.rating === 3).length}
                      </div>
                      <div className="stat-label text-muted">
                        Average Rating
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="stat-item">
                      <div className="stat-number text-info fs-2 fw-bold">
                        {recentServices.length}
                      </div>
                      <div className="stat-label text-muted">
                        Total Services
                      </div>
                    </div>
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

export default RateService;
