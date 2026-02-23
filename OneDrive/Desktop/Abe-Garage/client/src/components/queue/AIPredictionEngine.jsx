import React, { useState, useEffect } from "react";
import {
  FaBrain,
  FaChartLine,
  FaClock,
  FaExclamationTriangle,
  FaCheckCircle,
  FaSync,
  FaLightbulb,
  FaArrowUp,
  FaArrowDown,
  FaRobot,
  FaMagic,
  FaBolt,
  FaEye,
  FaCog,
  FaCloudRain,
} from "react-icons/fa";
import "./AIPredictionEngine.css";

const AIPredictionEngine = ({
  serviceBays,
  queue,
  onPredictionUpdate,
  weatherData,
  trafficData,
}) => {
  const [predictions, setPredictions] = useState({});
  const [aiInsights, setAiInsights] = useState([]);
  const [confidenceScore, setConfidenceScore] = useState(85);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState(new Date());
  const [modelVersion, setModelVersion] = useState("v2.3.1");
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);

  // AI prediction models
  const predictionModels = {
    serviceTime: {
      name: "Service Time Predictor",
      accuracy: 92,
      description:
        "Predicts completion time based on service type, vehicle complexity, and mechanic efficiency",
    },
    queueOptimization: {
      name: "Queue Optimizer",
      accuracy: 88,
      description:
        "Optimizes bay assignments and service sequencing for maximum efficiency",
    },
    customerSatisfaction: {
      name: "Satisfaction Predictor",
      accuracy: 79,
      description:
        "Predicts customer satisfaction based on wait times and service quality indicators",
    },
    resourceUtilization: {
      name: "Resource Optimizer",
      accuracy: 91,
      description: "Predicts optimal resource allocation and capacity planning",
    },
  };

  useEffect(() => {
    if (serviceBays.length > 0 && queue.length > 0) {
      runPredictions();
    }
  }, [serviceBays, queue, weatherData, trafficData]);

  const runPredictions = async () => {
    setIsProcessing(true);

    try {
      // Simulate AI processing time
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const newPredictions = await generatePredictions();
      setPredictions(newPredictions);

      const insights = await generateInsights(newPredictions);
      setAiInsights(insights);

      setLastAnalysis(new Date());
      onPredictionUpdate?.(newPredictions);
    } catch (error) {
      console.error("Prediction error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const generatePredictions = async () => {
    // Mock AI predictions based on current data
    const serviceTimePredictions = {};
    const queueOptimizations = [];
    const satisfactionPredictions = {};

    // Predict service completion times
    serviceBays.forEach((bay) => {
      if (bay.status === "occupied") {
        const baseTime = calculateBaseServiceTime(bay);
        const mechanicEfficiency = getMechanicEfficiency(bay.assigned_mechanic);
        const vehicleComplexity = getVehicleComplexity(bay.vehicle_info);
        const weatherImpact = getWeatherImpact(weatherData);
        const trafficImpact = getTrafficImpact(trafficData);

        const predictedTime = Math.round(
          baseTime *
            mechanicEfficiency *
            vehicleComplexity *
            weatherImpact *
            trafficImpact
        );

        serviceTimePredictions[bay.id] = {
          predictedCompletion: predictedTime,
          confidence: 0.85 + Math.random() * 0.1,
          factors: {
            mechanicEfficiency,
            vehicleComplexity,
            weatherImpact,
            trafficImpact,
          },
        };
      }
    });

    // Generate queue optimizations
    const availableBays = serviceBays.filter((bay) => bay.is_available);
    queue.forEach((item, index) => {
      const optimizedPosition = calculateOptimalPosition(
        item,
        availableBays,
        index
      );
      queueOptimizations.push({
        appointmentId: item.appointment_id,
        currentPosition: item.queue_position,
        optimizedPosition: optimizedPosition.position,
        estimatedImprovement: optimizedPosition.improvement,
        reason: optimizedPosition.reason,
      });
    });

    // Predict customer satisfaction
    queue.forEach((item) => {
      const waitTime = item.estimated_wait_time;
      const serviceType = item.service_type;
      const priority = item.priority;

      let satisfactionScore = 85; // Base score

      // Adjust based on wait time
      if (waitTime > 60) satisfactionScore -= 20;
      else if (waitTime > 30) satisfactionScore -= 10;
      else if (waitTime > 15) satisfactionScore -= 5;

      // Adjust based on service type
      if (serviceType === "premium") satisfactionScore += 5;
      if (serviceType === "express") satisfactionScore += 3;

      // Adjust based on priority
      if (priority === "urgent") satisfactionScore += 8;
      if (priority === "high") satisfactionScore += 3;

      satisfactionPredictions[item.appointment_id] = {
        score: Math.max(0, Math.min(100, satisfactionScore)),
        factors: {
          waitTimeImpact:
            waitTime > 30 ? "Negative" : waitTime > 15 ? "Neutral" : "Positive",
          serviceTypeImpact: serviceType === "premium" ? "Positive" : "Neutral",
          priorityImpact:
            priority === "urgent"
              ? "High"
              : priority === "high"
              ? "Medium"
              : "Low",
        },
      };
    });

    return {
      serviceTime: serviceTimePredictions,
      queueOptimizations,
      satisfaction: satisfactionPredictions,
      overallEfficiency: calculateOverallEfficiency(),
      recommendations: generateRecommendations(serviceBays, queue),
    };
  };

  const generateInsights = async (predictionsData) => {
    const insights = [];

    // Service efficiency insights
    const occupiedBays = serviceBays.filter((bay) => bay.status === "occupied");
    const avgProgress =
      occupiedBays.reduce((sum, bay) => sum + (bay.service_progress || 0), 0) /
      occupiedBays.length;

    if (avgProgress > 75) {
      insights.push({
        type: "success",
        title: "High Service Efficiency",
        message: `Current services are ${avgProgress.toFixed(
          0
        )}% complete on average`,
        confidence: 0.92,
        icon: <FaCheckCircle />,
      });
    } else if (avgProgress < 40) {
      insights.push({
        type: "warning",
        title: "Services Running Behind",
        message: `Average service completion is only ${avgProgress.toFixed(
          0
        )}%`,
        confidence: 0.87,
        icon: <FaExclamationTriangle />,
      });
    }

    // Queue optimization insights
    const longWaitItems = queue.filter((item) => item.estimated_wait_time > 45);
    if (longWaitItems.length > 0) {
      insights.push({
        type: "info",
        title: "Queue Optimization Opportunity",
        message: `${longWaitItems.length} customers have wait times over 45 minutes`,
        confidence: 0.89,
        icon: <FaLightbulb />,
      });
    }

    // Resource utilization insights
    const utilizationRate = (occupiedBays.length / serviceBays.length) * 100;
    if (utilizationRate > 90) {
      insights.push({
        type: "success",
        title: "Optimal Resource Utilization",
        message: `Bay utilization at ${utilizationRate.toFixed(
          0
        )}% - excellent efficiency`,
        confidence: 0.94,
        icon: <FaArrowUp />,
      });
    } else if (utilizationRate < 60) {
      insights.push({
        type: "warning",
        title: "Under-utilized Resources",
        message: `Bay utilization at ${utilizationRate.toFixed(
          0
        )}% - consider promoting services`,
        confidence: 0.85,
        icon: <FaArrowDown />,
      });
    }

    // Weather impact insights
    if (weatherData && weatherData.condition === "Rain") {
      insights.push({
        type: "info",
        title: "Weather Impact Expected",
        message: "Rainy weather may increase service times by 10-15%",
        confidence: 0.78,
        icon: <FaCloudRain />,
      });
    }

    return insights;
  };

  // Helper functions for predictions
  const calculateBaseServiceTime = (bay) => {
    const serviceTypes = {
      "Oil Change": 30,
      "Brake Service": 90,
      "Full Service": 180,
      Diagnostic: 120,
      "Tire Rotation": 45,
      "Engine Repair": 240,
    };

    return serviceTypes[bay.service_type] || 60;
  };

  const getMechanicEfficiency = (mechanicName) => {
    const efficiencies = {
      "John Smith": 1.1,
      "Sarah Johnson": 1.05,
      "Mike Davis": 0.95,
      "Lisa Wilson": 1.15,
    };
    return efficiencies[mechanicName] || 1.0;
  };

  const getVehicleComplexity = (vehicleInfo) => {
    if (!vehicleInfo) return 1.0;

    const complexityFactors = {
      BMW: 1.2,
      Mercedes: 1.3,
      Audi: 1.25,
      Porsche: 1.4,
      Toyota: 0.9,
      Honda: 0.95,
      Ford: 1.0,
    };

    return complexityFactors[vehicleInfo.brand] || 1.0;
  };

  const getWeatherImpact = (weatherData) => {
    if (!weatherData) return 1.0;

    const conditions = {
      Sunny: 1.0,
      Cloudy: 1.05,
      Rain: 1.15,
      Snow: 1.25,
      "Extreme Heat": 1.1,
    };

    return conditions[weatherData.condition] || 1.0;
  };

  const getTrafficImpact = (trafficData) => {
    if (!trafficData) return 1.0;

    const delays = {
      Light: 1.0,
      Moderate: 1.05,
      Heavy: 1.15,
      Severe: 1.25,
    };

    return delays[trafficData.condition] || 1.0;
  };

  const calculateOptimalPosition = (item, availableBays, currentIndex) => {
    // Simple optimization logic
    const isUrgent = item.priority === "urgent";
    const serviceType = item.service_type;
    const waitTime = item.estimated_wait_time;

    if (isUrgent && waitTime > 30) {
      return {
        position: Math.max(1, currentIndex - 2),
        improvement: "15-20 minutes",
        reason: "Urgent service with long wait time",
      };
    }

    if (serviceType === "express" && availableBays.length > 0) {
      return {
        position: Math.max(1, currentIndex - 1),
        improvement: "5-10 minutes",
        reason: "Express service with available bay",
      };
    }

    return {
      position: currentIndex,
      improvement: "0 minutes",
      reason: "Current position is optimal",
    };
  };

  const calculateOverallEfficiency = () => {
    const occupiedBays = serviceBays.filter(
      (bay) => bay.status === "occupied"
    ).length;
    const totalBays = serviceBays.length;
    const queueLength = queue.length;

    // Simple efficiency calculation
    let efficiency = 0;

    // Bay utilization (40% weight)
    efficiency += (occupiedBays / totalBays) * 40;

    // Queue management (30% weight)
    if (queueLength === 0) efficiency += 30;
    else if (queueLength <= 3) efficiency += 25;
    else if (queueLength <= 6) efficiency += 20;
    else efficiency += 15;

    // Service progress (30% weight)
    const avgProgress =
      serviceBays
        .filter((bay) => bay.status === "occupied")
        .reduce((sum, bay) => sum + (bay.service_progress || 0), 0) /
      Math.max(1, occupiedBays);
    efficiency += (avgProgress / 100) * 30;

    return Math.round(efficiency);
  };

  const generateRecommendations = (bays, queueData) => {
    const recommendations = [];

    // Check for idle bays
    const availableBays = bays.filter((bay) => bay.is_available);
    if (availableBays.length > 1) {
      recommendations.push({
        type: "efficiency",
        title: "Consider Promotional Offers",
        message: `You have ${availableBays.length} available bays. Consider promoting express services.`,
        priority: "medium",
        potentialImpact: "Increase utilization by 15-20%",
      });
    }

    // Check for long queues
    if (queueData.length > 5) {
      recommendations.push({
        type: "service",
        title: "Queue Management",
        message:
          "Long queue detected. Consider adding temporary staff or extending service hours.",
        priority: "high",
        potentialImpact: "Reduce wait times by 25%",
      });
    }

    return recommendations;
  };

  const getInsightIcon = (type) => {
    switch (type) {
      case "success":
        return <FaCheckCircle className="insight-success" />;
      case "warning":
        return <FaExclamationTriangle className="insight-warning" />;
      case "info":
        return <FaLightbulb className="insight-info" />;
      default:
        return <FaLightbulb className="insight-default" />;
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.9) return "#10b981";
    if (confidence >= 0.8) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div className="ai-prediction-engine">
      {/* Header */}
      <div className="prediction-header">
        <div className="header-title">
          <div className="ai-icon">
            <FaBrain />
          </div>
          <div>
            <h2>AI Prediction Engine</h2>
            <p className="subtitle">
              Intelligent predictions and optimizations • Model {modelVersion}
            </p>
          </div>
        </div>

        <div className="header-stats">
          <div className="confidence-meter">
            <div className="confidence-label">Confidence</div>
            <div className="confidence-value">{confidenceScore}%</div>
            <div className="confidence-bar">
              <div
                className="confidence-fill"
                style={{ width: `${confidenceScore}%` }}
              ></div>
            </div>
          </div>

          <button
            className={`analyze-btn ${isProcessing ? "processing" : ""}`}
            onClick={runPredictions}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <FaSync className="spinning" />
                Analyzing...
              </>
            ) : (
              <>
                <FaBolt />
                Run Analysis
              </>
            )}
          </button>
        </div>
      </div>

      {/* AI Insights */}
      <div className="insights-section">
        <h3>AI Insights</h3>
        <div className="insights-grid">
          {aiInsights.map((insight, index) => (
            <div key={index} className={`insight-card ${insight.type}`}>
              <div className="insight-header">
                {getInsightIcon(insight.type)}
                <div className="insight-confidence">
                  <FaEye />
                  {Math.round(insight.confidence * 100)}%
                </div>
              </div>
              <h4>{insight.title}</h4>
              <p>{insight.message}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Predictions Grid */}
      <div className="predictions-section">
        <div className="predictions-grid">
          {/* Service Time Predictions */}
          <div className="prediction-card">
            <div className="card-header">
              <FaClock />
              <h3>Service Time Predictions</h3>
            </div>
            <div className="prediction-list">
              {Object.entries(predictions.serviceTime || {}).map(
                ([bayId, prediction]) => (
                  <div key={bayId} className="prediction-item">
                    <div className="prediction-main">
                      <span className="prediction-label">Bay {bayId}</span>
                      <span className="prediction-value">
                        {prediction.predictedCompletion}min
                      </span>
                    </div>
                    <div className="confidence-indicator">
                      <div
                        className="confidence-dot"
                        style={{
                          backgroundColor: getConfidenceColor(
                            prediction.confidence
                          ),
                        }}
                      ></div>
                      <span>{Math.round(prediction.confidence * 100)}%</span>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Queue Optimizations */}
          <div className="prediction-card">
            <div className="card-header">
              <FaChartLine />
              <h3>Queue Optimizations</h3>
            </div>
            <div className="prediction-list">
              {(predictions.queueOptimizations || []).map((opt, index) => (
                <div key={index} className="optimization-item">
                  <div className="optimization-main">
                    <span className="position-change">
                      #{opt.currentPosition} → #{opt.optimizedPosition}
                    </span>
                    <span className="improvement">
                      -{opt.estimatedImprovement}
                    </span>
                  </div>
                  <p className="optimization-reason">{opt.reason}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Satisfaction Predictions */}
          <div className="prediction-card">
            <div className="card-header">
              <FaCheckCircle />
              <h3>Satisfaction Predictions</h3>
            </div>
            <div className="prediction-list">
              {Object.entries(predictions.satisfaction || {}).map(
                ([id, satisfaction]) => (
                  <div key={id} className="satisfaction-item">
                    <div className="satisfaction-main">
                      <span className="satisfaction-score">
                        {satisfaction.score}/100
                      </span>
                      <div className="satisfaction-bar">
                        <div
                          className="satisfaction-fill"
                          style={{ width: `${satisfaction.score}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Overall Efficiency */}
          <div className="prediction-card efficiency-card">
            <div className="card-header">
              <FaArrowUp />
              <h3>Overall Efficiency</h3>
            </div>
            <div className="efficiency-display">
              <div className="efficiency-score">
                {predictions.overallEfficiency || 0}%
              </div>
              <div className="efficiency-label">Current Efficiency</div>
              <div className="efficiency-trend">
                <FaArrowUp className="trend-up" />
                <span>+5% from last hour</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {(predictions.recommendations || []).length > 0 && (
        <div className="recommendations-section">
          <h3>AI Recommendations</h3>
          <div className="recommendations-list">
            {predictions.recommendations.map((rec, index) => (
              <div
                key={index}
                className={`recommendation-card ${rec.priority}`}
              >
                <div className="recommendation-header">
                  <FaLightbulb className="recommendation-icon" />
                  <h4>{rec.title}</h4>
                  <span className={`priority-badge ${rec.priority}`}>
                    {rec.priority}
                  </span>
                </div>
                <p>{rec.message}</p>
                <div className="potential-impact">
                  <FaArrowUp />
                  <span>Potential Impact: {rec.potentialImpact}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Model Performance */}
      <div className="model-performance">
        <h3>Model Performance</h3>
        <div className="models-grid">
          {Object.entries(predictionModels).map(([key, model]) => (
            <div key={key} className="model-card">
              <h4>{model.name}</h4>
              <div className="model-accuracy">
                <div className="accuracy-bar">
                  <div
                    className="accuracy-fill"
                    style={{ width: `${model.accuracy}%` }}
                  ></div>
                </div>
                <span>{model.accuracy}% Accuracy</span>
              </div>
              <p className="model-description">{model.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Last Analysis Info */}
      <div className="analysis-info">
        <div className="last-analysis">
          <FaRobot />
          <span>Last analysis: {lastAnalysis.toLocaleTimeString()}</span>
        </div>
        <div className="analysis-status">
          <div
            className={`status-indicator ${
              isProcessing ? "processing" : "ready"
            }`}
          >
            <div className="status-dot"></div>
            {isProcessing ? "Processing..." : "Ready"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPredictionEngine;
