import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaDollarSign,
  FaCalculator,
  FaChartLine,
  FaCalendarAlt,
  FaCar,
  FaLightbulb,
  FaExclamationTriangle,
  FaInfoCircle,
  FaCoins,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

const CostPredictionWidget = () => {
  const { user } = useAuth();
  const [budgetData, setBudgetData] = useState({
    loading: true,
    error: null,
    predictions: [],
    totalPredictedCost: 0,
    monthlyBudget: 0,
    currentSpend: 0,
    remainingBudget: 0,
    costBreakdown: {},
  });

  useEffect(() => {
    fetchCostPredictions();
  }, [user]);

  const fetchCostPredictions = async () => {
    try {
      setBudgetData((prev) => ({ ...prev, loading: true, error: null }));

      // Mock data for cost predictions
      const mockPredictions = [
        {
          id: 1,
          service_type: "Oil Change",
          predicted_cost: 45,
          confidence: 95,
          timeframe: "Next 30 days",
          frequency: "Every 5,000 miles",
          urgency: "high",
          description: "Regular maintenance required",
        },
        {
          id: 2,
          service_type: "Tire Rotation",
          predicted_cost: 25,
          confidence: 90,
          timeframe: "Next 60 days",
          frequency: "Every 6 months",
          urgency: "medium",
          description: "Recommended for tire longevity",
        },
        {
          id: 3,
          service_type: "Brake Service",
          predicted_cost: 180,
          confidence: 85,
          timeframe: "Next 90 days",
          frequency: "When needed",
          urgency: "medium",
          description: "Based on current brake pad wear",
        },
        {
          id: 4,
          service_type: "Air Filter",
          predicted_cost: 30,
          confidence: 88,
          timeframe: "Next 120 days",
          frequency: "Every 12 months",
          urgency: "low",
          description: "Annual replacement recommended",
        },
        {
          id: 5,
          service_type: "Transmission Service",
          predicted_cost: 150,
          confidence: 80,
          timeframe: "Next 6 months",
          frequency: "Every 30,000 miles",
          urgency: "low",
          description: "Major service interval approaching",
        },
        {
          id: 6,
          service_type: "Coolant System Service",
          predicted_cost: 95,
          confidence: 75,
          timeframe: "Next 8 months",
          frequency: "Every 2 years",
          urgency: "low",
          description: "Bi-annual cooling system maintenance",
        },
      ];

      const totalPredicted = mockPredictions.reduce(
        (sum, pred) => sum + pred.predicted_cost,
        0
      );
      const currentSpend = 285; // Mock current month spend
      const monthlyBudget = 150; // Mock monthly budget
      const remainingBudget = monthlyBudget - currentSpend;

      // Cost breakdown by category
      const costBreakdown = {
        routine_maintenance: mockPredictions
          .filter((p) =>
            ["Oil Change", "Tire Rotation", "Air Filter"].includes(
              p.service_type
            )
          )
          .reduce((sum, p) => sum + p.predicted_cost, 0),
        major_services: mockPredictions
          .filter((p) =>
            [
              "Brake Service",
              "Transmission Service",
              "Coolant System Service",
            ].includes(p.service_type)
          )
          .reduce((sum, p) => sum + p.predicted_cost, 0),
        emergency_repairs: 0, // No emergency repairs predicted
      };

      setTimeout(() => {
        setBudgetData({
          loading: false,
          error: null,
          predictions: mockPredictions,
          totalPredictedCost: totalPredicted,
          monthlyBudget,
          currentSpend,
          remainingBudget,
          costBreakdown,
        });
      }, 1000);
    } catch (err) {
      console.error("Error fetching cost predictions:", err);
      setBudgetData((prev) => ({
        ...prev,
        loading: false,
        error: "Failed to load cost predictions",
      }));
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case "high":
        return "#ef4444"; // red
      case "medium":
        return "#f59e0b"; // amber
      case "low":
        return "#10b981"; // green
      default:
        return "#6b7280"; // gray
    }
  };

  const getUrgencyIcon = (urgency) => {
    switch (urgency) {
      case "high":
        return <FaExclamationTriangle className="text-danger" />;
      case "medium":
        return <FaInfoCircle className="text-warning" />;
      case "low":
        return <FaLightbulb className="text-success" />;
      default:
        return <FaInfoCircle className="text-secondary" />;
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return "#10b981"; // green
    if (confidence >= 80) return "#3b82f6"; // blue
    if (confidence >= 70) return "#f59e0b"; // amber
    return "#ef4444"; // red
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getBudgetStatus = () => {
    const percentage =
      (budgetData.currentSpend / budgetData.monthlyBudget) * 100;
    if (percentage >= 90)
      return { status: "danger", color: "#ef4444", label: "Over Budget" };
    if (percentage >= 75)
      return { status: "warning", color: "#f59e0b", label: "Near Limit" };
    if (percentage >= 50)
      return { status: "info", color: "#3b82f6", label: "On Track" };
    return { status: "success", color: "#10b981", label: "Under Budget" };
  };

  if (budgetData.loading) {
    return (
      <div className="card h-100">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h6 className="mb-0">
            <FaCalculator className="me-2 text-primary" />
            Cost Prediction & Budgeting
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

  if (budgetData.error) {
    return (
      <div className="card h-100">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h6 className="mb-0">
            <FaCalculator className="me-2 text-primary" />
            Cost Prediction & Budgeting
          </h6>
        </div>
        <div className="card-body text-center">
          <FaExclamationTriangle
            className="text-warning mb-2"
            style={{ fontSize: "2rem" }}
          />
          <p className="text-muted mb-2">{budgetData.error}</p>
          <button
            onClick={fetchCostPredictions}
            className="btn btn-outline-primary btn-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const budgetStatus = getBudgetStatus();
  const budgetPercentage =
    (budgetData.currentSpend / budgetData.monthlyBudget) * 100;

  return (
    <div className="card h-100">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h6 className="mb-0">
          <FaCalculator className="me-2 text-primary" />
          Cost Prediction & Budgeting
        </h6>
        <small className="text-muted">AI-Powered Predictions</small>
      </div>
      <div className="card-body">
        {/* Budget Overview */}
        <div className="budget-overview mb-4">
          <div className="row g-3">
            <div className="col-6">
              <div className="text-center p-3 bg-light rounded">
                <FaCoins className="text-primary mb-2" />
                <div className="fw-bold text-primary fs-5">
                  {formatCurrency(budgetData.monthlyBudget)}
                </div>
                <small className="text-muted">Monthly Budget</small>
              </div>
            </div>
            <div className="col-6">
              <div className="text-center p-3 bg-light rounded">
                <FaChartLine className="text-success mb-2" />
                <div className="fw-bold text-success fs-5">
                  {formatCurrency(budgetData.totalPredictedCost)}
                </div>
                <small className="text-muted">Predicted 6-Month Cost</small>
              </div>
            </div>
          </div>

          {/* Budget Progress */}
          <div className="mt-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <small className="text-muted">Current Month Spending</small>
              <small className="fw-bold" style={{ color: budgetStatus.color }}>
                {budgetStatus.label}
              </small>
            </div>
            <div className="progress" style={{ height: "8px" }}>
              <div
                className="progress-bar"
                style={{
                  width: `${Math.min(budgetPercentage, 100)}%`,
                  backgroundColor: budgetStatus.color,
                }}
              ></div>
            </div>
            <div className="d-flex justify-content-between mt-1">
              <small className="text-muted">
                {formatCurrency(budgetData.currentSpend)} spent
              </small>
              <small className="text-muted">
                {formatCurrency(budgetData.remainingBudget)} remaining
              </small>
            </div>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="cost-breakdown mb-4">
          <h6 className="mb-2">
            <FaChartLine className="me-1" />
            Cost Breakdown (6 Months)
          </h6>
          <div className="row g-2">
            <div className="col-6">
              <div className="text-center p-2 border rounded">
                <small className="text-muted d-block">
                  Routine Maintenance
                </small>
                <div className="fw-bold text-primary">
                  {formatCurrency(budgetData.costBreakdown.routine_maintenance)}
                </div>
              </div>
            </div>
            <div className="col-6">
              <div className="text-center p-2 border rounded">
                <small className="text-muted d-block">Major Services</small>
                <div className="fw-bold text-warning">
                  {formatCurrency(budgetData.costBreakdown.major_services)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Predictions */}
        <div className="predictions-list">
          <h6 className="mb-2">
            <FaLightbulb className="me-1" />
            Upcoming Predictions
          </h6>
          {budgetData.predictions.slice(0, 3).map((prediction) => (
            <div
              key={prediction.id}
              className="prediction-item mb-2 p-2 border rounded"
            >
              <div className="d-flex justify-content-between align-items-start mb-1">
                <div className="d-flex align-items-center">
                  {getUrgencyIcon(prediction.urgency)}
                  <small className="ms-2 fw-bold">
                    {prediction.service_type}
                  </small>
                </div>
                <div className="text-end">
                  <div className="fw-bold text-primary">
                    {formatCurrency(prediction.predicted_cost)}
                  </div>
                  <small className="text-muted">
                    {prediction.confidence}% confidence
                  </small>
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <small className="text-muted">{prediction.timeframe}</small>
                <div
                  className="progress"
                  style={{ height: "4px", width: "60px" }}
                >
                  <div
                    className="progress-bar"
                    style={{
                      width: `${prediction.confidence}%`,
                      backgroundColor: getConfidenceColor(
                        prediction.confidence
                      ),
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="d-grid gap-2 mt-3">
          <Link
            to="/cost-calculator"
            className="btn btn-outline-primary btn-sm"
          >
            <FaCalculator className="me-1" />
            Detailed Cost Calculator
          </Link>
          <Link to="/budget-planner" className="btn btn-outline-success btn-sm">
            <FaCoins className="me-1" />
            Budget Planner
          </Link>
        </div>

        {/* Budget Tips */}
        <div className="budget-tips mt-3 p-2 bg-info bg-opacity-10 rounded">
          <div className="d-flex align-items-start">
            <FaInfoCircle className="text-info me-2 mt-1" />
            <div>
              <small className="fw-bold text-info d-block">Budget Tip</small>
              <small className="text-muted">
                Set aside{" "}
                {formatCurrency(Math.ceil(budgetData.totalPredictedCost / 6))}{" "}
                per month to cover predicted maintenance costs.
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostPredictionWidget;
