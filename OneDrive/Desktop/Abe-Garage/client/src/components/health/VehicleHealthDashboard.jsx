import React, { useState, useEffect } from "react";
import {
  FaHeartbeat,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaCar,
  FaTools,
  FaWrench,
  FaBolt,
  FaCog,
  FaShieldAlt,
} from "react-icons/fa";
import { GiCarSeat, GiGearStick, GiSteeringWheel } from "react-icons/gi";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
} from "chart.js";
import api from "../../services/api";
import "./VehicleHealthDashboard.css";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
);

const VehicleHealthDashboard = ({ customerId, targetVehicle }) => {
  const [healthScores, setHealthScores] = useState([]);
  const [latestScore, setLatestScore] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  useEffect(() => {
    if (customerId) {
      fetchHealthScores();
    }
  }, [customerId, targetVehicle]);

  const fetchHealthScores = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/vehicle-health/customer/${customerId}`);

      if (response.data.success) {
        let scores = response.data.data.health_scores;
        let trendData = response.data.data.trends;

        // Filter by target vehicle if provided
        if (targetVehicle) {
          scores = scores.filter(score =>
            (score.vehicle_vin && targetVehicle.vin && score.vehicle_vin === targetVehicle.vin) ||
            (!score.vehicle_vin &&
              score.vehicle_brand?.toLowerCase() === targetVehicle.make?.toLowerCase() &&
              score.vehicle_model?.toLowerCase() === targetVehicle.model?.toLowerCase() &&
              score.vehicle_year == targetVehicle.year)
          );

          trendData = trendData.filter(t =>
            t.vehicle_brand?.toLowerCase() === targetVehicle.make?.toLowerCase() &&
            t.vehicle_model?.toLowerCase() === targetVehicle.model?.toLowerCase() &&
            t.vehicle_year == targetVehicle.year
          );
        }

        setHealthScores(scores);
        setTrends(trendData);

        if (scores.length > 0) {
          // Sort by date desc
          const sortedScores = [...scores].sort((a, b) => new Date(b.assessment_date) - new Date(a.assessment_date));
          setLatestScore(sortedScores[0]);
          setSelectedVehicle(sortedScores[0]);
        } else {
          setLatestScore(null);
          setSelectedVehicle(null);
        }
      } else {
        setError("Failed to load vehicle health data");
      }
    } catch (err) {
      console.error("Error fetching health scores:", err);
      setError("Error loading vehicle health data. Please try again.");
    } finally {
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Chart configurations
  const scoreTrendData = {
    labels: trends.map((t) => formatDate(t.assessment_date)).reverse(),
    datasets: [
      {
        label: "Health Score",
        data: trends.map((t) => t.overall_score).reverse(),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#3b82f6",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 6,
      },
    ],
  };

  const scoreTrendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Health Score Trend",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
      },
      x: {
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
      },
    },
  };

  const systemBreakdownData = latestScore?.score_breakdown
    ? {
      labels: Object.keys(latestScore.score_breakdown).map(
        (key) =>
          key.charAt(0).toUpperCase() +
          key.slice(1).replace(/([A-Z])/g, " $1")
      ),
      datasets: [
        {
          data: Object.values(latestScore.score_breakdown),
          backgroundColor: [
            "#3b82f6", // engine - blue
            "#10b981", // transmission - green
            "#f59e0b", // brakes - amber
            "#8b5cf6", // electrical - purple
            "#ef4444", // suspension - red
            "#06b6d4", // cooling - cyan
          ],
          borderWidth: 2,
          borderColor: "#ffffff",
        },
      ],
    }
    : null;

  const systemBreakdownOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
      },
      title: {
        display: true,
        text: "System Breakdown",
      },
    },
  };

  const getSystemIcon = (systemName) => {
    const icons = {
      engine: FaWrench,
      transmission: GiGearStick,
      brakes: FaShieldAlt,
      electrical: FaBattery,
      suspension: GiCarSeat,
      cooling: FaCog,
      steering: GiSteeringWheel,
    };

    const IconComponent = icons[systemName] || FaTools;
    return <IconComponent className="system-icon" />;
  };

  if (loading) {
    return (
      <div className="health-dashboard loading">
        <div className="loading-spinner"></div>
        <p>Loading vehicle health data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="health-dashboard error">
        <p>{error}</p>
        <button onClick={fetchHealthScores} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="health-dashboard">
      <div className="dashboard-header">
        <h2>
          <FaHeartbeat className="header-icon" />
          Vehicle Health Dashboard
        </h2>
        <p>Monitor your vehicle's condition and performance metrics</p>
      </div>

      {latestScore && (
        <div className="latest-score-section">
          <div className="score-overview">
            <div className="score-circle">
              <div
                className="score-ring"
                style={{
                  background: `conic-gradient(${getScoreColor(
                    latestScore.overall_score
                  )} ${latestScore.overall_score * 3.6}deg, #e5e7eb ${latestScore.overall_score * 3.6
                    }deg)`,
                }}
              >
                <div className="score-inner">
                  {getScoreIcon(latestScore.overall_score)}
                  <span className="score-value">
                    {latestScore.overall_score}
                  </span>
                  <span className="score-label">
                    {getScoreLabel(latestScore.overall_score)}
                  </span>
                </div>
              </div>
            </div>

            <div className="score-details">
              <h3>Overall Vehicle Health</h3>
              <div className="vehicle-info">
                <div className="vehicle-specs">
                  <span className="vehicle-brand">
                    {latestScore.vehicle_brand}
                  </span>
                  <span className="vehicle-model">
                    {latestScore.vehicle_model}
                  </span>
                  <span className="vehicle-year">
                    {latestScore.vehicle_year}
                  </span>
                </div>
                <div className="assessment-info">
                  <span className="assessment-date">
                    Last assessed: {formatDate(latestScore.assessment_date)}
                  </span>
                  <span className="assessor-name">
                    By: {latestScore.assessor_name || "System"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-content">
        <div className="charts-section">
          {trends.length > 0 && (
            <div className="chart-container">
              <Line data={scoreTrendData} options={scoreTrendOptions} />
            </div>
          )}

          {systemBreakdownData && (
            <div className="chart-container">
              <Doughnut
                data={systemBreakdownData}
                options={systemBreakdownOptions}
              />
            </div>
          )}
        </div>

        <div className="details-section">
          {latestScore?.score_breakdown && (
            <div className="system-breakdown">
              <h3>
                <FaTools className="section-icon" />
                System Breakdown
              </h3>
              <div className="systems-list">
                {Object.entries(latestScore.score_breakdown).map(
                  ([system, score]) => (
                    <div key={system} className="system-item">
                      <div className="system-header">
                        {getSystemIcon(system)}
                        <span className="system-name">
                          {system.charAt(0).toUpperCase() +
                            system.slice(1).replace(/([A-Z])/g, " $1")}
                        </span>
                        <span
                          className="system-score"
                          style={{ color: getScoreColor(score) }}
                        >
                          {score}/100
                        </span>
                      </div>
                      <div className="system-progress">
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
          )}

          {latestScore?.critical_issues &&
            latestScore.critical_issues.length > 0 && (
              <div className="critical-issues">
                <h3>
                  <FaExclamationTriangle className="section-icon" />
                  Critical Issues
                </h3>
                <div className="issues-list">
                  {latestScore.critical_issues.map((issue, index) => (
                    <div key={index} className="issue-item">
                      <div className="issue-severity critical"></div>
                      <div className="issue-content">
                        <h4>{issue.title || "Critical Issue"}</h4>
                        <p>{issue.description || issue}</p>
                        {issue.urgency && (
                          <span className="urgency-badge">{issue.urgency}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {latestScore?.recommendations &&
            latestScore.recommendations.length > 0 && (
              <div className="recommendations">
                <h3>
                  <FaCheckCircle className="section-icon" />
                  Recommendations
                </h3>
                <div className="recommendations-list">
                  {latestScore.recommendations.map((rec, index) => (
                    <div key={index} className="recommendation-item">
                      <div
                        className={`priority-badge ${rec.priority || "medium"}`}
                      >
                        {rec.priority || "medium"}
                      </div>
                      <div className="recommendation-content">
                        <h4>{rec.service || "Service Recommended"}</h4>
                        <p>{rec.reason}</p>
                        {rec.estimated_cost && (
                          <span className="cost-estimate">
                            Est. Cost: ${rec.estimated_cost}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {latestScore?.notes && (
            <div className="assessment-notes">
              <h3>
                <FaClock className="section-icon" />
                Assessment Notes
              </h3>
              <p>{latestScore.notes}</p>
            </div>
          )}
        </div>
      </div>

      {healthScores.length > 1 && (
        <div className="assessment-history">
          <h3>
            <FaCar className="section-icon" />
            Assessment History
          </h3>
          <div className="history-list">
            {healthScores.map((score) => (
              <div
                key={score.id}
                className={`history-item ${selectedVehicle?.id === score.id ? "selected" : ""
                  }`}
                onClick={() => setSelectedVehicle(score)}
              >
                <div className="history-date">
                  {formatDate(score.assessment_date)}
                </div>
                <div className="history-score">
                  <span
                    className="score-badge"
                    style={{
                      backgroundColor: getScoreColor(score.overall_score),
                    }}
                  >
                    {score.overall_score}
                  </span>
                </div>
                <div className="history-details">
                  <div className="vehicle-name">
                    {score.vehicle_year} {score.vehicle_brand}{" "}
                    {score.vehicle_model}
                  </div>
                  <div className="assessment-type">{score.assessment_type}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleHealthDashboard;
