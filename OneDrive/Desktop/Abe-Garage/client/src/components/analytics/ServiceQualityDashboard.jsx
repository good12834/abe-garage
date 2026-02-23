import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ChartBarIcon,
  TrophyIcon,
  ClockIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  StarIcon,
  TrendingUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  FunnelIcon,
  CalendarDaysIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
} from "recharts";
import { useAuth } from "../../context/AuthContext";

const ServiceQualityDashboard = () => {
  const { user } = useAuth();
  const [qualityData, setQualityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState("30days");
  const [selectedMetric, setSelectedMetric] = useState("overall");

  useEffect(() => {
    fetchQualityData();
  }, [selectedTimeframe, selectedMetric]);

  const fetchQualityData = async () => {
    try {
      setLoading(true);

      // Mock quality metrics data
      const mockData = {
        overallMetrics: {
          customerSatisfaction: 4.6,
          onTimeCompletion: 87,
          firstTimeFixRate: 92,
          averageServiceTime: 95,
          technicianEfficiency: 89,
          customerRetention: 78,
          netPromoterScore: 72,
          qualityScore: 85,
        },
        trends: [
          {
            month: "Jan",
            satisfaction: 4.2,
            onTime: 82,
            efficiency: 85,
            retention: 72,
          },
          {
            month: "Feb",
            satisfaction: 4.3,
            onTime: 84,
            efficiency: 86,
            retention: 74,
          },
          {
            month: "Mar",
            satisfaction: 4.4,
            onTime: 85,
            efficiency: 87,
            retention: 75,
          },
          {
            month: "Apr",
            satisfaction: 4.4,
            onTime: 86,
            efficiency: 88,
            retention: 76,
          },
          {
            month: "May",
            satisfaction: 4.5,
            onTime: 87,
            efficiency: 89,
            retention: 77,
          },
          {
            month: "Jun",
            satisfaction: 4.5,
            onTime: 87,
            efficiency: 89,
            retention: 78,
          },
          {
            month: "Jul",
            satisfaction: 4.6,
            onTime: 88,
            efficiency: 90,
            retention: 79,
          },
          {
            month: "Aug",
            satisfaction: 4.6,
            onTime: 88,
            efficiency: 90,
            retention: 79,
          },
          {
            month: "Sep",
            satisfaction: 4.6,
            onTime: 88,
            efficiency: 90,
            retention: 79,
          },
          {
            month: "Oct",
            satisfaction: 4.6,
            onTime: 87,
            efficiency: 89,
            retention: 78,
          },
          {
            month: "Nov",
            satisfaction: 4.6,
            onTime: 87,
            efficiency: 89,
            retention: 78,
          },
          {
            month: "Dec",
            satisfaction: 4.6,
            onTime: 87,
            efficiency: 89,
            retention: 78,
          },
        ],
        serviceTypePerformance: [
          {
            type: "Oil Change",
            satisfaction: 4.8,
            efficiency: 95,
            volume: 156,
            revenue: 7800,
          },
          {
            type: "Brake Service",
            satisfaction: 4.6,
            efficiency: 88,
            volume: 89,
            revenue: 12450,
          },
          {
            type: "Engine Repair",
            satisfaction: 4.4,
            efficiency: 82,
            volume: 45,
            revenue: 15750,
          },
          {
            type: "Transmission",
            satisfaction: 4.7,
            efficiency: 85,
            volume: 34,
            revenue: 18700,
          },
          {
            type: "Tire Service",
            satisfaction: 4.5,
            efficiency: 92,
            volume: 78,
            revenue: 5850,
          },
          {
            type: "AC Service",
            satisfaction: 4.6,
            efficiency: 87,
            volume: 56,
            revenue: 8400,
          },
        ],
        technicianPerformance: [
          {
            name: "John Smith",
            efficiency: 95,
            satisfaction: 4.8,
            volume: 89,
            specialty: "Engine",
          },
          {
            name: "Sarah Johnson",
            efficiency: 92,
            satisfaction: 4.7,
            volume: 76,
            specialty: "Brakes",
          },
          {
            name: "Mike Wilson",
            efficiency: 88,
            satisfaction: 4.6,
            volume: 82,
            specialty: "General",
          },
          {
            name: "Lisa Chen",
            efficiency: 90,
            satisfaction: 4.7,
            volume: 71,
            specialty: "Electrical",
          },
          {
            name: "David Brown",
            efficiency: 85,
            satisfaction: 4.5,
            volume: 65,
            specialty: "Transmission",
          },
        ],
        customerFeedback: {
          positiveThemes: [
            { theme: "Professional Service", count: 234, percentage: 45 },
            { theme: "Fair Pricing", count: 198, percentage: 38 },
            { theme: "Quick Turnaround", count: 187, percentage: 36 },
            { theme: "Clear Communication", count: 165, percentage: 32 },
            { theme: "Quality Work", count: 156, percentage: 30 },
          ],
          improvementAreas: [
            { area: "Wait Times", mentions: 45, impact: "medium" },
            { area: "Scheduling", mentions: 32, impact: "low" },
            { area: "Facility Cleanliness", mentions: 28, impact: "low" },
            { area: "Communication", mentions: 23, impact: "low" },
          ],
        },
        operationalMetrics: {
          dailyServiceVolume: 24,
          peakHours: ["10:00-11:00", "14:00-15:00"],
          averageWaitTime: 18,
          serviceBayUtilization: 78,
          partsAvailability: 94,
          customerComplaints: 3,
          returnCustomers: 67,
        },
        qualityIncidents: [
          {
            date: "2025-12-08",
            type: "quality_issue",
            description: "Incorrect oil type used",
            severity: "medium",
            resolved: true,
          },
          {
            date: "2025-12-05",
            type: "delay",
            description: "Extended service time due to part shortage",
            severity: "low",
            resolved: true,
          },
          {
            date: "2025-12-02",
            type: "communication",
            description: "Customer not informed of additional work needed",
            severity: "low",
            resolved: true,
          },
        ],
        benchmarkComparison: {
          industry: { satisfaction: 4.2, onTime: 85, efficiency: 87 },
          competitors: { satisfaction: 4.4, onTime: 83, efficiency: 85 },
          target: { satisfaction: 4.7, onTime: 90, efficiency: 92 },
        },
      };

      setTimeout(() => {
        setQualityData(mockData);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching quality data:", error);
      setLoading(false);
    }
  };

  const getScoreColor = (score, target) => {
    const percentage = (score / target) * 100;
    if (percentage >= 95) return "#10b981";
    if (percentage >= 85) return "#3b82f6";
    if (percentage >= 75) return "#f59e0b";
    return "#ef4444";
  };

  const getPerformanceLevel = (score) => {
    if (score >= 90) return { level: "Excellent", color: "#10b981" };
    if (score >= 80) return { level: "Good", color: "#3b82f6" };
    if (score >= 70) return { level: "Average", color: "#f59e0b" };
    return { level: "Needs Improvement", color: "#ef4444" };
  };

  const formatPercentage = (value) => `${value}%`;
  const formatRating = (value) => `${value.toFixed(1)}★`;

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  const radarData = [
    {
      metric: "Customer Satisfaction",
      value: qualityData?.overallMetrics.customerSatisfaction * 20,
    },
    {
      metric: "On-Time Completion",
      value: qualityData?.overallMetrics.onTimeCompletion,
    },
    {
      metric: "First Time Fix Rate",
      value: qualityData?.overallMetrics.firstTimeFixRate,
    },
    {
      metric: "Service Efficiency",
      value: qualityData?.overallMetrics.technicianEfficiency,
    },
    {
      metric: "Customer Retention",
      value: qualityData?.overallMetrics.customerRetention,
    },
  ];

  if (loading) {
    return (
      <div className="card h-100">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h6 className="mb-0">
            <ChartBarIcon className="me-2 text-primary" />
            Service Quality Dashboard
          </h6>
        </div>
        <div className="card-body text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mt-3">Analyzing quality metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="quality-dashboard">
      <div className="dashboard-header mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <h2>
            <ChartBarIcon className="me-3 text-primary" />
            Service Quality Dashboard
            <span className="badge bg-success ms-2">Real-time Analytics</span>
          </h2>
          <div className="d-flex gap-2">
            <select
              className="form-select form-select-sm"
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              style={{ width: "auto" }}
            >
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="90days">Last 90 days</option>
              <option value="1year">Last year</option>
            </select>
            <select
              className="form-select form-select-sm"
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              style={{ width: "auto" }}
            >
              <option value="overall">Overall Quality</option>
              <option value="satisfaction">Customer Satisfaction</option>
              <option value="efficiency">Operational Efficiency</option>
              <option value="financial">Financial Performance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="kpi-section mb-4">
        <div className="row g-3">
          <div className="col-md-3">
            <div className="card border-0 bg-primary text-white">
              <div className="card-body text-center">
                <StarIcon className="w-8 h-8 mx-auto mb-2" />
                <h3 className="mb-0">
                  {formatRating(
                    qualityData.overallMetrics.customerSatisfaction
                  )}
                </h3>
                <p className="mb-0">Customer Satisfaction</p>
                <small>Target: 4.7★</small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 bg-success text-white">
              <div className="card-body text-center">
                <ClockIcon className="w-8 h-8 mx-auto mb-2" />
                <h3 className="mb-0">
                  {formatPercentage(
                    qualityData.overallMetrics.onTimeCompletion
                  )}
                </h3>
                <p className="mb-0">On-Time Completion</p>
                <small>Target: 90%</small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 bg-info text-white">
              <div className="card-body text-center">
                <CheckCircleIcon className="w-8 h-8 mx-auto mb-2" />
                <h3 className="mb-0">
                  {formatPercentage(
                    qualityData.overallMetrics.firstTimeFixRate
                  )}
                </h3>
                <p className="mb-0">First-Time Fix Rate</p>
                <small>Target: 95%</small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 bg-warning text-white">
              <div className="card-body text-center">
                <TrophyIcon className="w-8 h-8 mx-auto mb-2" />
                <h3 className="mb-0">
                  {formatPercentage(qualityData.overallMetrics.qualityScore)}
                </h3>
                <p className="mb-0">Overall Quality Score</p>
                <small>Target: 90%</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trend Analysis */}
      <div className="trend-analysis mb-4">
        <div className="row g-3">
          <div className="col-md-8">
            <div className="card h-100">
              <div className="card-header">
                <h6 className="mb-0">Quality Trends Over Time</h6>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={qualityData.trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="satisfaction"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      name="Satisfaction"
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="efficiency"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Efficiency"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="onTime"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      name="On-Time %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100">
              <div className="card-header">
                <h6 className="mb-0">Quality Radar</h6>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10 }} />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 100]}
                      tick={{ fontSize: 8 }}
                    />
                    <Radar
                      name="Performance"
                      dataKey="value"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Service Type Performance */}
      <div className="service-performance mb-4">
        <div className="card">
          <div className="card-header">
            <h6 className="mb-0">Service Type Performance Analysis</h6>
          </div>
          <div className="card-body">
            <div className="row g-3">
              {qualityData.serviceTypePerformance.map((service, index) => (
                <div key={index} className="col-md-4">
                  <div className="border rounded-3 p-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="mb-0">{service.type}</h6>
                      <span className="badge bg-primary">
                        {service.volume} jobs
                      </span>
                    </div>
                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <small className="text-muted">Satisfaction</small>
                        <small className="fw-bold">
                          {formatRating(service.satisfaction)}
                        </small>
                      </div>
                      <div className="progress" style={{ height: "4px" }}>
                        <div
                          className="progress-bar bg-primary"
                          style={{
                            width: `${(service.satisfaction / 5) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <small className="text-muted">Efficiency</small>
                        <small className="fw-bold">
                          {formatPercentage(service.efficiency)}
                        </small>
                      </div>
                      <div className="progress" style={{ height: "4px" }}>
                        <div
                          className="progress-bar bg-success"
                          style={{ width: `${service.efficiency}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">
                        Revenue: ${service.revenue.toLocaleString()}
                      </small>
                      <small className="text-success fw-bold">
                        ${(service.revenue / service.volume).toFixed(0)}/job
                      </small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Technician Performance */}
      <div className="technician-performance mb-4">
        <div className="card">
          <div className="card-header">
            <h6 className="mb-0">Technician Performance Leaderboard</h6>
          </div>
          <div className="card-body">
            <div className="row g-3">
              {qualityData.technicianPerformance.map((tech, index) => (
                <div key={index} className="col-md-4">
                  <motion.div
                    className="technician-card border rounded-3 p-3"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="d-flex align-items-center mb-3">
                      <div className="ranking-badge bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3">
                        #{index + 1}
                      </div>
                      <div>
                        <h6 className="mb-0">{tech.name}</h6>
                        <small className="text-muted">{tech.specialty}</small>
                      </div>
                    </div>
                    <div className="performance-metrics">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <small className="text-muted">Efficiency</small>
                        <div className="d-flex align-items-center">
                          <span className="fw-bold me-2">
                            {formatPercentage(tech.efficiency)}
                          </span>
                          <div
                            className="progress"
                            style={{ width: "60px", height: "4px" }}
                          >
                            <div
                              className="progress-bar bg-primary"
                              style={{ width: `${tech.efficiency}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <small className="text-muted">Satisfaction</small>
                        <div className="d-flex align-items-center">
                          <span className="fw-bold me-2">
                            {formatRating(tech.satisfaction)}
                          </span>
                          <div
                            className="progress"
                            style={{ width: "60px", height: "4px" }}
                          >
                            <div
                              className="progress-bar bg-success"
                              style={{
                                width: `${(tech.satisfaction / 5) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">Jobs Completed</small>
                        <span className="fw-bold">{tech.volume}</span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Customer Feedback Analysis */}
      <div className="feedback-analysis mb-4">
        <div className="row g-3">
          <div className="col-md-6">
            <div className="card h-100">
              <div className="card-header">
                <h6 className="mb-0">Positive Feedback Themes</h6>
              </div>
              <div className="card-body">
                <div className="feedback-themes">
                  {qualityData.customerFeedback.positiveThemes.map(
                    (theme, index) => (
                      <div key={index} className="theme-item mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="fw-medium">{theme.theme}</span>
                          <span className="badge bg-success">
                            {theme.percentage}%
                          </span>
                        </div>
                        <div className="progress" style={{ height: "6px" }}>
                          <div
                            className="progress-bar bg-success"
                            style={{ width: `${theme.percentage}%` }}
                          ></div>
                        </div>
                        <small className="text-muted">
                          {theme.count} mentions
                        </small>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card h-100">
              <div className="card-header">
                <h6 className="mb-0">Areas for Improvement</h6>
              </div>
              <div className="card-body">
                <div className="improvement-areas">
                  {qualityData.customerFeedback.improvementAreas.map(
                    (area, index) => (
                      <div
                        key={index}
                        className="area-item mb-3 pb-3 border-bottom"
                      >
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="fw-medium">{area.area}</span>
                          <span
                            className={`badge ${
                              area.impact === "high"
                                ? "bg-danger"
                                : area.impact === "medium"
                                ? "bg-warning"
                                : "bg-info"
                            }`}
                          >
                            {area.impact} impact
                          </span>
                        </div>
                        <small className="text-muted">
                          {area.mentions} customer mentions
                        </small>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benchmark Comparison */}
      <div className="benchmark-comparison mb-4">
        <div className="card">
          <div className="card-header">
            <h6 className="mb-0">Industry Benchmark Comparison</h6>
          </div>
          <div className="card-body">
            <div className="row g-3">
              {Object.entries(qualityData.benchmarkComparison).map(
                ([key, data]) => (
                  <div key={key} className="col-md-4">
                    <div className="benchmark-group text-center p-3 border rounded-3">
                      <h6 className="mb-3 text-capitalize">
                        {key === "industry" ? "Industry Average" : key}
                      </h6>
                      <div className="benchmark-metrics">
                        <div className="metric-item mb-2">
                          <small className="text-muted d-block">
                            Satisfaction
                          </small>
                          <span className="fw-bold">
                            {formatRating(data.satisfaction)}
                          </span>
                        </div>
                        <div className="metric-item mb-2">
                          <small className="text-muted d-block">On-Time</small>
                          <span className="fw-bold">
                            {formatPercentage(data.onTime)}
                          </span>
                        </div>
                        <div className="metric-item">
                          <small className="text-muted d-block">
                            Efficiency
                          </small>
                          <span className="fw-bold">
                            {formatPercentage(data.efficiency)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quality Incidents */}
      <div className="quality-incidents">
        <div className="card">
          <div className="card-header">
            <div className="d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Recent Quality Incidents</h6>
              <span className="badge bg-warning">
                {qualityData.qualityIncidents.length} incidents
              </span>
            </div>
          </div>
          <div className="card-body">
            <div className="incidents-list">
              {qualityData.qualityIncidents.map((incident, index) => (
                <div
                  key={index}
                  className="incident-item mb-3 pb-3 border-bottom"
                >
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <div className="d-flex align-items-center mb-1">
                        <span className="badge bg-danger me-2">
                          {incident.type}
                        </span>
                        <span className="text-muted small">
                          {new Date(incident.date).toLocaleDateString()}
                        </span>
                      </div>
                      <h6 className="mb-1">{incident.description}</h6>
                    </div>
                    <div className="text-end">
                      <span
                        className={`badge ${
                          incident.severity === "high"
                            ? "bg-danger"
                            : incident.severity === "medium"
                            ? "bg-warning"
                            : "bg-info"
                        }`}
                      >
                        {incident.severity}
                      </span>
                      {incident.resolved && (
                        <div className="mt-1">
                          <CheckCircleIcon className="w-4 h-4 text-success" />
                          <small className="text-success">Resolved</small>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceQualityDashboard;
