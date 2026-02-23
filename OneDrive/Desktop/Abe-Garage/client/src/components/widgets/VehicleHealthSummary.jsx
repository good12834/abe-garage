import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaHeartbeat,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaShieldAlt,
  FaCar,
} from "react-icons/fa";
import { GiGearStick, GiSteeringWheel } from "react-icons/gi";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const VehicleHealthSummary = () => {
  const { user } = useAuth();
  const [healthScore, setHealthScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVehicleHealth();
  }, [user]);

  const fetchVehicleHealth = async () => {
    try {
      setLoading(true);
      // Mock data for demo - replace with actual API call
      const mockHealthData = {
        overall_score: 85,
        vehicle_brand: "Toyota",
        vehicle_model: "Camry",
        vehicle_year: "2020",
        assessment_date: new Date().toISOString(),
        score_breakdown: {
          engine: 90,
          transmission: 85,
          brakes: 80,
          electrical: 88,
          suspension: 82,
          cooling: 87,
        },
        critical_issues: [],
        recommendations: [
          {
            service: "Oil Change",
            reason: "Due for regular maintenance",
            estimated_cost: 45,
            priority: "medium",
          },
          {
            service: "Tire Rotation",
            reason: "Recommended every 6 months",
            estimated_cost: 25,
            priority: "low",
          },
        ],
      };

      setTimeout(() => {
        setHealthScore(mockHealthData);
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.error("Error fetching vehicle health:", err);
      setError("Failed to load vehicle health data");
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "#10b981"; // green
    if (score >= 60) return "#f59e0b"; // amber
    if (score >= 40) return "#f97316"; // orange
    return "#ef4444"; // red
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Poor";
  };

  const getScoreIcon = (score) => {
    if (score >= 80) return <FaCheckCircle className="score-icon excellent" />;
    if (score >= 60) return <FaShieldAlt className="score-icon good" />;
    if (score >= 40) return <FaClock className="score-icon fair" />;
    return <FaExclamationTriangle className="score-icon poor" />;
  };

  const getSystemIcon = (systemName) => {
    const icons = {
      engine: <FaCar className="system-icon" />,
      transmission: <GiGearStick className="system-icon" />,
      brakes: <FaShieldAlt className="system-icon" />,
      electrical: <FaShieldAlt className="system-icon" />,
      suspension: <GiSteeringWheel className="system-icon" />,
      cooling: <FaShieldAlt className="system-icon" />,
    };
    return icons[systemName] || <FaShieldAlt className="system-icon" />;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="card h-100">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h6 className="mb-0">
            <FaHeartbeat className="me-2 text-primary" />
            Vehicle Health
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

  if (error) {
    return (
      <div className="card h-100">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h6 className="mb-0">
            <FaHeartbeat className="me-2 text-primary" />
            Vehicle Health
          </h6>
        </div>
        <div className="card-body text-center">
          <FaExclamationTriangle
            className="text-warning mb-2"
            style={{ fontSize: "2rem" }}
          />
          <p className="text-muted mb-2">{error}</p>
          <button
            onClick={fetchVehicleHealth}
            className="btn btn-outline-primary btn-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card h-100">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h6 className="mb-0">
          <FaHeartbeat className="me-2 text-primary" />
          Vehicle Health Summary
        </h6>
        <small className="text-muted">
          Updated {formatDate(healthScore.assessment_date)}
        </small>
      </div>
      <div className="card-body">
        {/* Health Score Circle */}
        <div className="text-center mb-4">
          <div
            className="d-inline-flex align-items-center justify-content-center rounded-circle position-relative"
            style={{
              width: "100px",
              height: "100px",
              background: `conic-gradient(${getScoreColor(
                healthScore.overall_score
              )} ${healthScore.overall_score * 3.6}deg, #e5e7eb ${
                healthScore.overall_score * 3.6
              }deg)`,
            }}
          >
            <div
              className="bg-white rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: "80px", height: "80px" }}
            >
              <div className="text-center">
                <div
                  className="fw-bold fs-4"
                  style={{ color: getScoreColor(healthScore.overall_score) }}
                >
                  {healthScore.overall_score}
                </div>
                <small className="text-muted">
                  {getScoreLabel(healthScore.overall_score)}
                </small>
              </div>
            </div>
          </div>
          <div className="mt-2">
            <h6 className="mb-1">
              {healthScore.vehicle_year} {healthScore.vehicle_brand}{" "}
              {healthScore.vehicle_model}
            </h6>
            <small className="text-muted">Overall Health Score</small>
          </div>
        </div>

        {/* System Breakdown */}
        <div className="mb-4">
          <h6 className="mb-3">System Health</h6>
          <div className="row g-2">
            {Object.entries(healthScore.score_breakdown).map(
              ([system, score]) => (
                <div key={system} className="col-6">
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <div className="d-flex align-items-center">
                      {getSystemIcon(system)}
                      <small className="ms-1 text-capitalize">{system}</small>
                    </div>
                    <small
                      className="fw-bold"
                      style={{ color: getScoreColor(score) }}
                    >
                      {score}
                    </small>
                  </div>
                  <div className="progress" style={{ height: "4px" }}>
                    <div
                      className="progress-bar"
                      style={{
                        width: `${score}%`,
                        backgroundColor: getScoreColor(score),
                      }}
                    ></div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* Recommendations */}
        {healthScore.recommendations &&
          healthScore.recommendations.length > 0 && (
            <div className="mb-3">
              <h6 className="mb-2">
                <FaClock className="me-1 text-warning" />
                Upcoming Recommendations
              </h6>
              {healthScore.recommendations.slice(0, 2).map((rec, index) => (
                <div
                  key={index}
                  className="d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded"
                >
                  <div>
                    <small className="fw-bold d-block">{rec.service}</small>
                    <small className="text-muted">{rec.reason}</small>
                  </div>
                  <div className="text-end">
                    <small className="fw-bold text-primary">
                      ${rec.estimated_cost}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          )}

        {/* Action Buttons */}
        <div className="d-grid gap-2">
          <Link to="/vehicle-health" className="btn btn-outline-primary btn-sm">
            <FaHeartbeat className="me-1" />
            View Full Report
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VehicleHealthSummary;
