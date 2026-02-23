import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ChartBarIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  CpuChipIcon,
  BeakerIcon,
} from "@heroicons/react/24/outline";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useAuth } from "../../context/AuthContext";

const PredictiveMaintenanceWidget = ({ className = "" }) => {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState("3months");
  const [vehicleData, setVehicleData] = useState(null);

  useEffect(() => {
    fetchPredictiveData();
  }, [selectedTimeframe]);

  const fetchPredictiveData = async () => {
    try {
      setLoading(true);

      // Mock data - in real implementation, this would call an AI service
      const mockPredictions = [
        {
          id: 1,
          component: "Brake Pads",
          urgency: "high",
          predictedFailureDate: "2025-01-15",
          currentWearLevel: 75,
          estimatedMilesUntilFailure: 2500,
          riskScore: 85,
          recommendedAction: "Schedule replacement within 2 weeks",
          cost: 120,
          serviceHistory: "Last replaced: 18 months ago",
        },
        {
          id: 2,
          component: "Engine Oil",
          urgency: "medium",
          predictedFailureDate: "2025-02-01",
          currentWearLevel: 60,
          estimatedMilesUntilFailure: 3500,
          riskScore: 65,
          recommendedAction: "Schedule oil change within 1 month",
          cost: 45,
          serviceHistory: "Last changed: 4 months ago",
        },
        {
          id: 3,
          component: "Tire Tread",
          urgency: "medium",
          predictedFailureDate: "2025-03-01",
          currentWearLevel: 45,
          estimatedMilesUntilFailure: 5000,
          riskScore: 55,
          recommendedAction: "Monitor tread depth monthly",
          cost: 400,
          serviceHistory: "Tires installed: 2 years ago",
        },
        {
          id: 4,
          component: "Transmission Fluid",
          urgency: "low",
          predictedFailureDate: "2025-04-01",
          currentWearLevel: 35,
          estimatedMilesUntilFailure: 8000,
          riskScore: 35,
          recommendedAction: "Schedule service in 3-4 months",
          cost: 85,
          serviceHistory: "Last changed: 1.5 years ago",
        },
      ];

      // Simulate API delay
      setTimeout(() => {
        setPredictions(mockPredictions);
        setVehicleData({
          make: "Honda",
          model: "Civic",
          year: 2019,
          mileage: 45000,
          overallHealth: 82,
          nextService: "2025-01-10",
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching predictive maintenance data:", error);
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case "high":
        return "text-red-600 bg-red-100 border-red-200";
      case "medium":
        return "text-yellow-600 bg-yellow-100 border-yellow-200";
      case "low":
        return "text-green-600 bg-green-100 border-green-200";
      default:
        return "text-gray-600 bg-gray-100 border-gray-200";
    }
  };

  const getUrgencyIcon = (urgency) => {
    switch (urgency) {
      case "high":
        return <ExclamationTriangleIcon className="w-5 h-5" />;
      case "medium":
        return <ClockIcon className="w-5 h-5" />;
      case "low":
        return <CheckCircleIcon className="w-5 h-5" />;
      default:
        return <ClockIcon className="w-5 h-5" />;
    }
  };

  const getRiskScoreColor = (score) => {
    if (score >= 80) return "#ef4444";
    if (score >= 60) return "#f59e0b";
    if (score >= 40) return "#10b981";
    return "#6b7280";
  };

  const chartData = predictions.map((pred) => ({
    name: pred.component,
    riskScore: pred.riskScore,
    wearLevel: pred.currentWearLevel,
  }));

  const COLORS = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6"];

  const calculateTimeToFailure = (failureDate) => {
    const now = new Date();
    const failure = new Date(failureDate);
    const daysUntilFailure = Math.ceil((failure - now) / (1000 * 60 * 60 * 24));
    return daysUntilFailure;
  };

  if (loading) {
    return (
      <motion.div
        className={`card h-100 ${className}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="card-header d-flex justify-content-between align-items-center">
          <h6 className="mb-0">
            <CpuChipIcon className="me-2 text-primary" />
            AI Predictive Maintenance
          </h6>
        </div>
        <div className="card-body text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mt-3">Analyzing vehicle data...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`card h-100 ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="card-header d-flex justify-content-between align-items-center">
        <h6 className="mb-0">
          <CpuChipIcon className="me-2 text-primary" />
          AI Predictive Maintenance
          <span className="badge bg-success ms-2">ML Powered</span>
        </h6>
        <div className="d-flex align-items-center gap-2">
          <select
            className="form-select form-select-sm"
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            style={{ width: "auto" }}
          >
            <option value="1month">1 Month</option>
            <option value="3months">3 Months</option>
            <option value="6months">6 Months</option>
            <option value="1year">1 Year</option>
          </select>
        </div>
      </div>

      <div className="card-body">
        {/* Vehicle Overview */}
        {vehicleData && (
          <div className="mb-4 p-3 bg-light rounded-3">
            <div className="row align-items-center">
              <div className="col-md-8">
                <h6 className="mb-1">
                  {vehicleData.year} {vehicleData.make} {vehicleData.model}
                </h6>
                <p className="text-muted mb-0">
                  {vehicleData.mileage.toLocaleString()} miles | Overall Health:{" "}
                  {vehicleData.overallHealth}%
                </p>
              </div>
              <div className="col-md-4 text-end">
                <div className="h5 mb-0 text-success">
                  <BeakerIcon className="w-6 h-6 me-1" />
                  Health Score
                </div>
                <div className="display-6 text-success">
                  {vehicleData.overallHealth}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Risk Score Chart */}
        <div className="mb-4">
          <h6 className="mb-3">Component Risk Analysis</h6>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="riskScore"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getRiskScoreColor(entry.riskScore)}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [`${value}%`, name]}
                labelFormatter={(label) => `Component: ${label}`}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Predictions List */}
        <div className="predictions-list">
          <h6 className="mb-3">Predicted Maintenance Needs</h6>
          {predictions.map((prediction, index) => (
            <motion.div
              key={prediction.id}
              className={`prediction-item border rounded-3 p-3 mb-3 ${getUrgencyColor(
                prediction.urgency
              )}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="d-flex align-items-center">
                  {getUrgencyIcon(prediction.urgency)}
                  <h6 className="ms-2 mb-0">{prediction.component}</h6>
                </div>
                <div className="text-end">
                  <div className="fw-bold">{prediction.riskScore}%</div>
                  <small className="text-muted">Risk Score</small>
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <small className="text-muted d-block">
                    Predicted Failure
                  </small>
                  <div className="fw-medium">
                    {new Date(
                      prediction.predictedFailureDate
                    ).toLocaleDateString()}
                  </div>
                </div>
                <div className="col-md-6">
                  <small className="text-muted d-block">Estimated Miles</small>
                  <div className="fw-medium">
                    {prediction.estimatedMilesUntilFailure.toLocaleString()}{" "}
                    miles
                  </div>
                </div>
              </div>

              <div className="progress mb-3" style={{ height: "8px" }}>
                <div
                  className="progress-bar"
                  style={{
                    width: `${prediction.currentWearLevel}%`,
                    backgroundColor: getRiskScoreColor(prediction.riskScore),
                  }}
                ></div>
              </div>

              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted d-block">
                    Recommended Action
                  </small>
                  <div className="fw-medium small">
                    {prediction.recommendedAction}
                  </div>
                </div>
                <div className="text-end">
                  <div className="fw-bold">${prediction.cost}</div>
                  <small className="text-muted">Estimated Cost</small>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-4 pt-3 border-top">
          <div className="d-flex gap-2">
            <button className="btn btn-primary btn-sm flex-fill">
              <ClockIcon className="w-4 h-4 me-1" />
              Schedule Service
            </button>
            <button className="btn btn-outline-primary btn-sm flex-fill">
              <ChartBarIcon className="w-4 h-4 me-1" />
              View Report
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PredictiveMaintenanceWidget;
