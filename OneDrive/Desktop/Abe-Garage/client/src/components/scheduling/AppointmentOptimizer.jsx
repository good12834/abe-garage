import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CalendarDaysIcon,
  ClockIcon,
  ChartBarIcon,
  AdjustmentsHorizontalIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  UserGroupIcon,
  TruckIcon,
  SparklesIcon,
  BoltIcon,
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
} from "recharts";
import { useAuth } from "../../context/AuthContext";

const AppointmentOptimizer = () => {
  const { user } = useAuth();
  const [optimizationData, setOptimizationData] = useState(null);
  const [scheduleSuggestions, setScheduleSuggestions] = useState([]);
  const [capacityAnalysis, setCapacityAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState("week");
  const [optimizationMode, setOptimizationMode] = useState("efficiency");

  useEffect(() => {
    fetchOptimizationData();
  }, [selectedTimeframe, optimizationMode]);

  const fetchOptimizationData = async () => {
    try {
      setLoading(true);

      // Mock optimization data
      const mockData = {
        currentMetrics: {
          averageWaitTime: 23, // minutes
          onTimeRate: 87, // percentage
          capacityUtilization: 78, // percentage
          customerSatisfaction: 4.6, // out of 5
          technicianEfficiency: 92, // percentage
        },
        optimizationTargets: {
          reduceWaitTime: 15, // target minutes
          improveOnTimeRate: 95, // target percentage
          optimizeCapacity: 85, // target percentage
          increaseSatisfaction: 4.8, // target rating
        },
        timeSlotAnalysis: [
          {
            time: "8:00 AM",
            demand: 15,
            capacity: 20,
            efficiency: 75,
            waitTime: 8,
          },
          {
            time: "9:00 AM",
            demand: 25,
            capacity: 20,
            efficiency: 125,
            waitTime: 35,
          },
          {
            time: "10:00 AM",
            demand: 30,
            capacity: 25,
            efficiency: 120,
            waitTime: 28,
          },
          {
            time: "11:00 AM",
            demand: 28,
            capacity: 25,
            efficiency: 112,
            waitTime: 22,
          },
          {
            time: "12:00 PM",
            demand: 18,
            capacity: 20,
            efficiency: 90,
            waitTime: 12,
          },
          {
            time: "1:00 PM",
            demand: 22,
            capacity: 25,
            efficiency: 88,
            waitTime: 15,
          },
          {
            time: "2:00 PM",
            demand: 35,
            capacity: 25,
            efficiency: 140,
            waitTime: 42,
          },
          {
            time: "3:00 PM",
            demand: 32,
            capacity: 25,
            efficiency: 128,
            waitTime: 38,
          },
          {
            time: "4:00 PM",
            demand: 28,
            capacity: 25,
            efficiency: 112,
            waitTime: 25,
          },
          {
            time: "5:00 PM",
            demand: 20,
            capacity: 20,
            efficiency: 100,
            waitTime: 18,
          },
        ],
        weeklyPatterns: [
          { day: "Monday", bookings: 45, capacity: 60, efficiency: 75 },
          { day: "Tuesday", bookings: 52, capacity: 60, efficiency: 87 },
          { day: "Wednesday", bookings: 48, capacity: 60, efficiency: 80 },
          { day: "Thursday", bookings: 55, capacity: 60, efficiency: 92 },
          { day: "Friday", bookings: 58, capacity: 60, efficiency: 97 },
          { day: "Saturday", bookings: 35, capacity: 40, efficiency: 88 },
          { day: "Sunday", bookings: 20, capacity: 30, efficiency: 67 },
        ],
        serviceTypeDistribution: [
          { type: "Oil Change", duration: 30, frequency: 35, revenue: 45 },
          { type: "Brake Service", duration: 120, frequency: 20, revenue: 180 },
          {
            type: "Engine Diagnostics",
            duration: 90,
            frequency: 15,
            revenue: 150,
          },
          { type: "Tire Service", duration: 45, frequency: 18, revenue: 75 },
          { type: "Transmission", duration: 180, frequency: 8, revenue: 300 },
          { type: "AC Service", duration: 60, frequency: 12, revenue: 120 },
        ],
        technicianLoad: [
          {
            name: "John Smith",
            currentLoad: 85,
            efficiency: 92,
            specialty: "Engine",
          },
          {
            name: "Sarah Johnson",
            currentLoad: 78,
            efficiency: 88,
            specialty: "Brakes",
          },
          {
            name: "Mike Wilson",
            currentLoad: 92,
            efficiency: 95,
            specialty: "General",
          },
          {
            name: "Lisa Chen",
            currentLoad: 70,
            efficiency: 90,
            specialty: "Electrical",
          },
          {
            name: "David Brown",
            currentLoad: 88,
            efficiency: 87,
            specialty: "Transmission",
          },
        ],
      };

      const mockSuggestions = [
        {
          id: 1,
          type: "time_shift",
          title: "Move 9 AM appointments to 8 AM or 10 AM",
          description: "High demand at 9 AM causing 35-minute average waits",
          impact: "reduce_wait_time",
          savings: "12 minutes",
          confidence: 89,
          priority: "high",
          implementation: "immediate",
        },
        {
          id: 2,
          type: "capacity_boost",
          title: "Add technician during 2-3 PM peak hours",
          description: "Current capacity at 140%, causing longest waits",
          impact: "increase_capacity",
          savings: "18 minutes",
          confidence: 92,
          priority: "high",
          implementation: "next_week",
        },
        {
          id: 3,
          type: "service_batching",
          title: "Batch similar services together",
          description: "Group oil changes and tire rotations for efficiency",
          impact: "increase_efficiency",
          savings: "25% time",
          confidence: 85,
          priority: "medium",
          implementation: "this_week",
        },
        {
          id: 4,
          type: "incentive_pricing",
          title: "Offer discounts for off-peak appointments",
          description: "Shift demand from peak (2-3 PM) to shoulder periods",
          impact: "redistribute_demand",
          savings: "15% wait time",
          confidence: 78,
          priority: "medium",
          implementation: "next_month",
        },
      ];

      setTimeout(() => {
        setOptimizationData(mockData);
        setScheduleSuggestions(mockSuggestions);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching optimization data:", error);
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "#ef4444";
      case "medium":
        return "#f59e0b";
      case "low":
        return "#10b981";
      default:
        return "#6b7280";
    }
  };

  const getOptimizationIcon = (type) => {
    switch (type) {
      case "time_shift":
        return <ClockIcon className="w-5 h-5" />;
      case "capacity_boost":
        return <UserGroupIcon className="w-5 h-5" />;
      case "service_batching":
        return <BoltIcon className="w-5 h-5" />;
      case "incentive_pricing":
        return <SparklesIcon className="w-5 h-5" />;
      default:
        return <AdjustmentsHorizontalIcon className="w-5 h-5" />;
    }
  };

  const getImprovementColor = (current, target) => {
    const percentage = (current / target) * 100;
    if (percentage >= 95) return "#10b981";
    if (percentage >= 80) return "#f59e0b";
    return "#ef4444";
  };

  if (loading) {
    return (
      <div className="card h-100">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h6 className="mb-0">
            <CalendarDaysIcon className="me-2 text-primary" />
            Appointment Scheduling Optimizer
          </h6>
        </div>
        <div className="card-body text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mt-3">Analyzing scheduling patterns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="optimizer-dashboard">
      <div className="dashboard-header mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <h2>
            <CalendarDaysIcon className="me-3 text-primary" />
            Appointment Scheduling Optimizer
            <span className="badge bg-success ms-2">AI-Powered</span>
          </h2>
          <div className="d-flex gap-2">
            <select
              className="form-select form-select-sm"
              value={optimizationMode}
              onChange={(e) => setOptimizationMode(e.target.value)}
              style={{ width: "auto" }}
            >
              <option value="efficiency">Maximize Efficiency</option>
              <option value="capacity">Maximize Capacity</option>
              <option value="satisfaction">Maximize Satisfaction</option>
              <option value="revenue">Maximize Revenue</option>
            </select>
            <button className="btn btn-outline-primary btn-sm">
              <AdjustmentsHorizontalIcon className="w-4 h-4 me-1" />
              Configure
            </button>
          </div>
        </div>
      </div>

      {/* Current vs Target Metrics */}
      <div className="metrics-comparison mb-4">
        <div className="row g-3">
          <div className="col-md-3">
            <div className="card border-0">
              <div className="card-body text-center">
                <div className="d-flex align-items-center justify-content-center mb-2">
                  <ClockIcon className="w-6 h-6 text-primary me-2" />
                  <span className="text-muted">Wait Time</span>
                </div>
                <div className="d-flex align-items-center justify-content-center">
                  <span className="h4 me-2">
                    {optimizationData.currentMetrics.averageWaitTime}m
                  </span>
                  <span className="text-muted">→</span>
                  <span className="h4 ms-2 text-success">
                    {optimizationData.optimizationTargets.reduceWaitTime}m
                  </span>
                </div>
                <div className="progress mt-2" style={{ height: "6px" }}>
                  <div
                    className="progress-bar bg-success"
                    style={{
                      width: `${
                        (optimizationData.currentMetrics.averageWaitTime /
                          optimizationData.optimizationTargets.reduceWaitTime) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0">
              <div className="card-body text-center">
                <div className="d-flex align-items-center justify-content-center mb-2">
                  <CheckCircleIcon className="w-6 h-6 text-primary me-2" />
                  <span className="text-muted">On-Time Rate</span>
                </div>
                <div className="d-flex align-items-center justify-content-center">
                  <span className="h4 me-2">
                    {optimizationData.currentMetrics.onTimeRate}%
                  </span>
                  <span className="text-muted">→</span>
                  <span className="h4 ms-2 text-success">
                    {optimizationData.optimizationTargets.improveOnTimeRate}%
                  </span>
                </div>
                <div className="progress mt-2" style={{ height: "6px" }}>
                  <div
                    className="progress-bar bg-success"
                    style={{
                      width: `${
                        (optimizationData.currentMetrics.onTimeRate /
                          optimizationData.optimizationTargets
                            .improveOnTimeRate) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0">
              <div className="card-body text-center">
                <div className="d-flex align-items-center justify-content-center mb-2">
                  <ChartBarIcon className="w-6 h-6 text-primary me-2" />
                  <span className="text-muted">Capacity Utilization</span>
                </div>
                <div className="d-flex align-items-center justify-content-center">
                  <span className="h4 me-2">
                    {optimizationData.currentMetrics.capacityUtilization}%
                  </span>
                  <span className="text-muted">→</span>
                  <span className="h4 ms-2 text-success">
                    {optimizationData.optimizationTargets.optimizeCapacity}%
                  </span>
                </div>
                <div className="progress mt-2" style={{ height: "6px" }}>
                  <div
                    className="progress-bar bg-success"
                    style={{
                      width: `${
                        (optimizationData.currentMetrics.capacityUtilization /
                          optimizationData.optimizationTargets
                            .optimizeCapacity) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0">
              <div className="card-body text-center">
                <div className="d-flex align-items-center justify-content-center mb-2">
                  <SparklesIcon className="w-6 h-6 text-primary me-2" />
                  <span className="text-muted">Satisfaction</span>
                </div>
                <div className="d-flex align-items-center justify-content-center">
                  <span className="h4 me-2">
                    {optimizationData.currentMetrics.customerSatisfaction}★
                  </span>
                  <span className="text-muted">→</span>
                  <span className="h4 ms-2 text-success">
                    {optimizationData.optimizationTargets.increaseSatisfaction}★
                  </span>
                </div>
                <div className="progress mt-2" style={{ height: "6px" }}>
                  <div
                    className="progress-bar bg-success"
                    style={{
                      width: `${
                        (optimizationData.currentMetrics.customerSatisfaction /
                          optimizationData.optimizationTargets
                            .increaseSatisfaction) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section mb-4">
        <div className="row g-3">
          <div className="col-md-8">
            <div className="card h-100">
              <div className="card-header">
                <h6 className="mb-0">Daily Demand vs Capacity Analysis</h6>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={optimizationData.timeSlotAnalysis}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="demand"
                      stackId="1"
                      stroke="#ef4444"
                      fill="#ef4444"
                      fillOpacity={0.6}
                      name="Demand"
                    />
                    <Area
                      type="monotone"
                      dataKey="capacity"
                      stackId="2"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.6}
                      name="Capacity"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100">
              <div className="card-header">
                <h6 className="mb-0">Wait Time by Hour</h6>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={optimizationData.timeSlotAnalysis}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey="waitTime"
                      fill="#f59e0b"
                      name="Wait Time (min)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Patterns */}
      <div className="weekly-patterns mb-4">
        <div className="card">
          <div className="card-header">
            <h6 className="mb-0">Weekly Booking Patterns</h6>
          </div>
          <div className="card-body">
            <div className="row g-3">
              {optimizationData.weeklyPatterns.map((day, index) => (
                <div key={index} className="col-md-4 col-lg-3">
                  <div className="border rounded-3 p-3 text-center">
                    <h6 className="mb-2">{day.day}</h6>
                    <div className="mb-2">
                      <div className="progress" style={{ height: "8px" }}>
                        <div
                          className="progress-bar bg-primary"
                          style={{
                            width: `${(day.bookings / day.capacity) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="d-flex justify-content-between small text-muted">
                      <span>
                        {day.bookings}/{day.capacity}
                      </span>
                      <span>{day.efficiency}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Technician Load Analysis */}
      <div className="technician-load mb-4">
        <div className="card">
          <div className="card-header">
            <h6 className="mb-0">Technician Load Distribution</h6>
          </div>
          <div className="card-body">
            <div className="row g-3">
              {optimizationData.technicianLoad.map((tech, index) => (
                <div key={index} className="col-md-4">
                  <div className="border rounded-3 p-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <h6 className="mb-0">{tech.name}</h6>
                        <small className="text-muted">{tech.specialty}</small>
                      </div>
                      <div className="text-end">
                        <div className="fw-bold text-primary">
                          {tech.currentLoad}%
                        </div>
                        <small className="text-muted">Load</small>
                      </div>
                    </div>
                    <div className="progress mb-2" style={{ height: "6px" }}>
                      <div
                        className={`progress-bar ${
                          tech.currentLoad >= 90
                            ? "bg-danger"
                            : tech.currentLoad >= 80
                            ? "bg-warning"
                            : "bg-success"
                        }`}
                        style={{ width: `${tech.currentLoad}%` }}
                      ></div>
                    </div>
                    <div className="d-flex justify-content-between small">
                      <span>Efficiency: {tech.efficiency}%</span>
                      <span
                        className={
                          tech.currentLoad >= 90
                            ? "text-danger"
                            : tech.currentLoad >= 80
                            ? "text-warning"
                            : "text-success"
                        }
                      >
                        {tech.currentLoad >= 90
                          ? "Overloaded"
                          : tech.currentLoad >= 80
                          ? "High Load"
                          : "Optimal"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Suggestions */}
      <div className="ai-suggestions">
        <div className="card">
          <div className="card-header">
            <div className="d-flex justify-content-between align-items-center">
              <h6 className="mb-0">
                <SparklesIcon className="me-2" />
                AI-Powered Optimization Suggestions
              </h6>
              <span className="badge bg-primary">
                {scheduleSuggestions.length} Suggestions
              </span>
            </div>
          </div>
          <div className="card-body">
            <div className="row g-3">
              {scheduleSuggestions.map((suggestion) => (
                <div key={suggestion.id} className="col-md-6">
                  <motion.div
                    className="suggestion-card border rounded-3 p-3"
                    style={{
                      borderLeft: `4px solid ${getPriorityColor(
                        suggestion.priority
                      )}`,
                    }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div className="d-flex align-items-center">
                        <div
                          className="rounded-circle p-2 me-2"
                          style={{
                            backgroundColor: `${getPriorityColor(
                              suggestion.priority
                            )}20`,
                          }}
                        >
                          {getOptimizationIcon(suggestion.type)}
                        </div>
                        <h6 className="mb-0">{suggestion.title}</h6>
                      </div>
                      <div className="text-end">
                        <span
                          className="badge"
                          style={{
                            backgroundColor: getPriorityColor(
                              suggestion.priority
                            ),
                            color: "white",
                          }}
                        >
                          {suggestion.priority}
                        </span>
                      </div>
                    </div>

                    <p className="text-muted mb-3">{suggestion.description}</p>

                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <div className="d-flex align-items-center gap-3">
                          <div>
                            <small className="text-muted d-block">
                              Expected Impact
                            </small>
                            <span className="fw-bold text-success">
                              {suggestion.savings}
                            </span>
                          </div>
                          <div>
                            <small className="text-muted d-block">
                              Confidence
                            </small>
                            <span className="fw-bold">
                              {suggestion.confidence}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="d-flex gap-2">
                        <button className="btn btn-outline-primary btn-sm">
                          Apply
                        </button>
                        <button className="btn btn-outline-secondary btn-sm">
                          Details
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentOptimizer;
