import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  DocumentTextIcon,
  CpuChipIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  PrinterIcon,
  ShareIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  AdjustmentsHorizontalIcon,
  BeakerIcon,
  WrenchScrewdriverIcon,
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
  RadialBarChart,
  RadialBar,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { useAuth } from "../../context/AuthContext";

const DiagnosticReportGenerator = () => {
  const { user } = useAuth();
  const [diagnosticData, setDiagnosticData] = useState(null);
  const [reportHistory, setReportHistory] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedReportType, setSelectedReportType] = useState("full");
  const [showDetailedView, setShowDetailedView] = useState(false);

  useEffect(() => {
    fetchDiagnosticData();
  }, []);

  const fetchDiagnosticData = async () => {
    try {
      setLoading(true);

      // Mock diagnostic data
      const mockDiagnosticData = {
        vehicleInfo: {
          make: "Honda",
          model: "Civic",
          year: 2019,
          vin: "1HGCV1F16MA123456",
          mileage: 45230,
          lastService: "2024-10-15",
          customerName: "John Doe",
        },
        overallHealth: {
          score: 78,
          status: "good",
          criticalIssues: 1,
          warnings: 3,
          recommendations: 5,
        },
        systemAnalysis: {
          engine: {
            health: 85,
            status: "good",
            issues: [],
            metrics: [
              {
                parameter: "Oil Pressure",
                value: 45,
                unit: "PSI",
                normal: "40-60",
                status: "normal",
              },
              {
                parameter: "Engine Temp",
                value: 195,
                unit: "°F",
                normal: "180-220",
                status: "normal",
              },
              {
                parameter: "RPM",
                value: 2200,
                unit: "RPM",
                normal: "idle-6000",
                status: "normal",
              },
              {
                parameter: "Fuel Trim",
                value: 8,
                unit: "%",
                normal: "-10 to 10",
                status: "normal",
              },
            ],
          },
          transmission: {
            health: 72,
            status: "warning",
            issues: ["Slight delay in 2nd to 3rd gear shift"],
            metrics: [
              {
                parameter: "Fluid Temp",
                value: 185,
                unit: "°F",
                normal: "160-200",
                status: "normal",
              },
              {
                parameter: "Pressure",
                value: 85,
                unit: "PSI",
                normal: "80-120",
                status: "warning",
              },
              {
                parameter: "Shift Quality",
                value: 7,
                unit: "/10",
                normal: "8-10",
                status: "warning",
              },
            ],
          },
          brakes: {
            health: 91,
            status: "excellent",
            issues: [],
            metrics: [
              {
                parameter: "Pad Thickness",
                value: 8,
                unit: "mm",
                normal: ">3",
                status: "normal",
              },
              {
                parameter: "Rotor Wear",
                value: 2,
                unit: "mm",
                normal: "<6",
                status: "normal",
              },
              {
                parameter: "Brake Fluid",
                value: 95,
                unit: "%",
                normal: ">90",
                status: "normal",
              },
            ],
          },
          electrical: {
            health: 68,
            status: "warning",
            issues: [
              "Battery showing signs of weakness",
              "Alternator output slightly low",
            ],
            metrics: [
              {
                parameter: "Battery Voltage",
                value: 12.1,
                unit: "V",
                normal: "12.6-14.4",
                status: "low",
              },
              {
                parameter: "Alternator Output",
                value: 13.8,
                unit: "V",
                normal: "14.1-14.4",
                status: "low",
              },
              {
                parameter: "Starter Current",
                value: 180,
                unit: "A",
                normal: "150-200",
                status: "normal",
              },
            ],
          },
          suspension: {
            health: 82,
            status: "good",
            issues: [],
            metrics: [
              {
                parameter: "Tire Tread",
                value: 6,
                unit: "mm",
                normal: ">3",
                status: "normal",
              },
              {
                parameter: "Shock Absorbers",
                value: 8,
                unit: "/10",
                normal: "7-10",
                status: "normal",
              },
              {
                parameter: "Alignment",
                value: 9,
                unit: "/10",
                normal: "8-10",
                status: "normal",
              },
            ],
          },
          cooling: {
            health: 89,
            status: "good",
            issues: [],
            metrics: [
              {
                parameter: "Coolant Level",
                value: 95,
                unit: "%",
                normal: ">90",
                status: "normal",
              },
              {
                parameter: "Radiator Pressure",
                value: 16,
                unit: "PSI",
                normal: "12-18",
                status: "normal",
              },
              {
                parameter: "Thermostat",
                value: 185,
                unit: "°F",
                normal: "180-195",
                status: "normal",
              },
            ],
          },
        },
        obdCodes: [
          {
            code: "P0420",
            description: "Catalyst System Efficiency Below Threshold",
            severity: "medium",
            status: "pending",
          },
          {
            code: "B1234",
            description: "Battery Performance Low",
            severity: "low",
            status: "pending",
          },
        ],
        maintenanceSchedule: [
          {
            service: "Oil Change",
            dueDate: "2025-02-15",
            mileage: 50000,
            priority: "high",
          },
          {
            service: "Brake Inspection",
            dueDate: "2025-03-01",
            mileage: 52000,
            priority: "medium",
          },
          {
            service: "Transmission Service",
            dueDate: "2025-04-01",
            mileage: 55000,
            priority: "medium",
          },
          {
            service: "Coolant Flush",
            dueDate: "2025-06-01",
            mileage: 60000,
            priority: "low",
          },
        ],
        costEstimates: [
          {
            service: "Battery Replacement",
            estimatedCost: 180,
            urgency: "high",
          },
          {
            service: "Transmission Service",
            estimatedCost: 250,
            urgency: "medium",
          },
          {
            service: "Catalyst Replacement",
            estimatedCost: 850,
            urgency: "low",
          },
        ],
        recommendations: [
          {
            title: "Replace Battery",
            description:
              "Current battery is showing signs of weakness and should be replaced soon",
            priority: "high",
            estimatedCost: 180,
            timeFrame: "Within 2 weeks",
          },
          {
            title: "Transmission Service",
            description:
              "Fluid analysis indicates need for transmission service",
            priority: "medium",
            estimatedCost: 250,
            timeFrame: "Within 1 month",
          },
          {
            title: "Monitor O2 Sensor",
            description:
              "Catalyst efficiency code detected, monitor for progression",
            priority: "low",
            estimatedCost: 300,
            timeFrame: "Within 3 months",
          },
        ],
      };

      const mockReportHistory = [
        {
          id: 1,
          date: "2025-12-10",
          type: "full",
          score: 78,
          issues: 4,
          status: "completed",
        },
        {
          id: 2,
          date: "2025-10-15",
          type: "full",
          score: 82,
          issues: 2,
          status: "completed",
        },
        {
          id: 3,
          date: "2025-08-20",
          type: "quick",
          score: 85,
          issues: 1,
          status: "completed",
        },
      ];

      setTimeout(() => {
        setDiagnosticData(mockDiagnosticData);
        setReportHistory(mockReportHistory);
        setSelectedVehicle(mockDiagnosticData.vehicleInfo);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching diagnostic data:", error);
      setLoading(false);
    }
  };

  const getHealthColor = (score) => {
    if (score >= 90) return "#10b981"; // green
    if (score >= 75) return "#3b82f6"; // blue
    if (score >= 60) return "#f59e0b"; // amber
    return "#ef4444"; // red
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "excellent":
      case "good":
        return <CheckCircleIcon className="w-5 h-5 text-success" />;
      case "warning":
        return <ExclamationTriangleIcon className="w-5 h-5 text-warning" />;
      case "critical":
        return <ExclamationTriangleIcon className="w-5 h-5 text-danger" />;
      default:
        return <ClockIcon className="w-5 h-5 text-muted" />;
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const generateReport = () => {
    // In a real implementation, this would generate a PDF or send to a printing service
    console.log("Generating diagnostic report...");
    alert("Diagnostic report generated successfully!");
  };

  const shareReport = () => {
    if (navigator.share) {
      navigator.share({
        title: `Diagnostic Report - ${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}`,
        text: `Vehicle health score: ${diagnosticData.overallHealth.score}/100`,
        url: window.location.href,
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert("Report link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="card h-100">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h6 className="mb-0">
            <DocumentTextIcon className="me-2 text-primary" />
            Diagnostic Report Generator
          </h6>
        </div>
        <div className="card-body text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mt-3">Running diagnostics...</p>
        </div>
      </div>
    );
  }

  const systemData = Object.entries(diagnosticData.systemAnalysis).map(
    ([key, value]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      health: value.health,
      status: value.status,
      issues: value.issues.length,
    })
  );

  return (
    <div className="diagnostic-dashboard">
      <div className="dashboard-header mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <h2>
            <DocumentTextIcon className="me-3 text-primary" />
            Diagnostic Report Generator
            <span className="badge bg-success ms-2">OBD-II Powered</span>
          </h2>
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => setShowDetailedView(!showDetailedView)}
            >
              <EyeIcon className="w-4 h-4 me-1" />
              {showDetailedView ? "Simple View" : "Detailed View"}
            </button>
            <button
              className="btn btn-outline-success btn-sm"
              onClick={shareReport}
            >
              <ShareIcon className="w-4 h-4 me-1" />
              Share
            </button>
            <button className="btn btn-primary btn-sm" onClick={generateReport}>
              <PrinterIcon className="w-4 h-4 me-1" />
              Generate Report
            </button>
          </div>
        </div>
      </div>

      {/* Vehicle Overview */}
      <div className="vehicle-overview mb-4">
        <div className="card">
          <div className="card-body">
            <div className="row align-items-center">
              <div className="col-md-6">
                <h4>
                  {selectedVehicle.year} {selectedVehicle.make}{" "}
                  {selectedVehicle.model}
                </h4>
                <p className="text-muted mb-0">
                  VIN: {selectedVehicle.vin} • Mileage:{" "}
                  {selectedVehicle.mileage.toLocaleString()} miles
                </p>
                <p className="text-muted mb-0">
                  Last Service: {formatDate(selectedVehicle.lastService)}
                </p>
              </div>
              <div className="col-md-6">
                <div className="d-flex align-items-center justify-content-end">
                  <div className="text-center me-4">
                    <div
                      className="h2 mb-0"
                      style={{
                        color: getHealthColor(
                          diagnosticData.overallHealth.score
                        ),
                      }}
                    >
                      {diagnosticData.overallHealth.score}
                    </div>
                    <small className="text-muted">Health Score</small>
                  </div>
                  <div className="text-center me-4">
                    <div className="h4 mb-0 text-warning">
                      {diagnosticData.overallHealth.criticalIssues}
                    </div>
                    <small className="text-muted">Critical</small>
                  </div>
                  <div className="text-center">
                    <div className="h4 mb-0 text-info">
                      {diagnosticData.overallHealth.warnings}
                    </div>
                    <small className="text-muted">Warnings</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="system-health mb-4">
        <div className="row g-3">
          {Object.entries(diagnosticData.systemAnalysis).map(
            ([systemName, data]) => (
              <div key={systemName} className="col-md-4 col-lg-2">
                <motion.div
                  className="card h-100 border-0"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="card-body text-center">
                    <div className="d-flex justify-content-center mb-2">
                      {systemName === "engine" && (
                        <WrenchScrewdriverIcon className="w-8 h-8 text-primary" />
                      )}
                      {systemName === "transmission" && (
                        <AdjustmentsHorizontalIcon className="w-8 h-8 text-primary" />
                      )}
                      {systemName === "brakes" && (
                        <BoltIcon className="w-8 h-8 text-primary" />
                      )}
                      {systemName === "electrical" && (
                        <CpuChipIcon className="w-8 h-8 text-primary" />
                      )}
                      {systemName === "suspension" && (
                        <BeakerIcon className="w-8 h-8 text-primary" />
                      )}
                      {systemName === "cooling" && (
                        <BeakerIcon className="w-8 h-8 text-primary" />
                      )}
                    </div>
                    <h6 className="mb-2">
                      {systemName.charAt(0).toUpperCase() + systemName.slice(1)}
                    </h6>
                    <div className="d-flex align-items-center justify-content-center mb-2">
                      {getStatusIcon(data.status)}
                      <span className="ms-1 small text-capitalize">
                        {data.status}
                      </span>
                    </div>
                    <div className="progress mb-2" style={{ height: "6px" }}>
                      <div
                        className="progress-bar"
                        style={{
                          width: `${data.health}%`,
                          backgroundColor: getHealthColor(data.health),
                        }}
                      ></div>
                    </div>
                    <div
                      className="h6 mb-0"
                      style={{ color: getHealthColor(data.health) }}
                    >
                      {data.health}%
                    </div>
                    {data.issues.length > 0 && (
                      <small className="text-warning">
                        {data.issues.length} issue(s)
                      </small>
                    )}
                  </div>
                </motion.div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section mb-4">
        <div className="row g-3">
          <div className="col-md-6">
            <div className="card h-100">
              <div className="card-header">
                <h6 className="mb-0">System Health Overview</h6>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={systemData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey="health"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card h-100">
              <div className="card-header">
                <h6 className="mb-0">Overall Health Score</h6>
              </div>
              <div className="card-body d-flex align-items-center justify-content-center">
                <ResponsiveContainer width="100%" height={250}>
                  <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="60%"
                    outerRadius="90%"
                    data={[
                      {
                        name: "Health Score",
                        value: diagnosticData.overallHealth.score,
                        fill: getHealthColor(
                          diagnosticData.overallHealth.score
                        ),
                      },
                    ]}
                  >
                    <RadialBar
                      dataKey="value"
                      cornerRadius={10}
                      fill="#8884d8"
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="position-absolute text-center">
                  <div
                    className="h2 mb-0"
                    style={{
                      color: getHealthColor(diagnosticData.overallHealth.score),
                    }}
                  >
                    {diagnosticData.overallHealth.score}
                  </div>
                  <small className="text-muted">out of 100</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed System Analysis */}
      {showDetailedView && (
        <div className="detailed-analysis mb-4">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">Detailed System Analysis</h6>
            </div>
            <div className="card-body">
              <div className="accordion" id="systemAccordion">
                {Object.entries(diagnosticData.systemAnalysis).map(
                  ([systemName, data], index) => (
                    <div key={systemName} className="accordion-item">
                      <h2 className="accordion-header">
                        <button
                          className="accordion-button collapsed"
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target={`#collapse${index}`}
                        >
                          <div className="d-flex align-items-center justify-content-between w-100 me-3">
                            <div className="d-flex align-items-center">
                              {getStatusIcon(data.status)}
                              <span className="ms-2 fw-bold">
                                {systemName.charAt(0).toUpperCase() +
                                  systemName.slice(1)}
                              </span>
                              <span className="ms-2 badge bg-secondary">
                                {data.health}%
                              </span>
                            </div>
                            {data.issues.length > 0 && (
                              <span className="badge bg-warning">
                                {data.issues.length} issue(s)
                              </span>
                            )}
                          </div>
                        </button>
                      </h2>
                      <div
                        id={`collapse${index}`}
                        className="accordion-collapse collapse"
                        data-bs-parent="#systemAccordion"
                      >
                        <div className="accordion-body">
                          {data.issues.length > 0 && (
                            <div className="mb-3">
                              <h6 className="text-warning">Issues Detected:</h6>
                              <ul className="list-unstyled">
                                {data.issues.map((issue, idx) => (
                                  <li
                                    key={idx}
                                    className="d-flex align-items-center mb-1"
                                  >
                                    <ExclamationTriangleIcon className="w-4 h-4 text-warning me-2" />
                                    {issue}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          <div className="row g-3">
                            {data.metrics.map((metric, idx) => (
                              <div key={idx} className="col-md-6">
                                <div className="border rounded p-2">
                                  <div className="d-flex justify-content-between align-items-center">
                                    <span className="fw-medium">
                                      {metric.parameter}
                                    </span>
                                    <span
                                      className={`badge ${
                                        metric.status === "normal"
                                          ? "bg-success"
                                          : metric.status === "warning"
                                          ? "bg-warning"
                                          : "bg-danger"
                                      }`}
                                    >
                                      {metric.status}
                                    </span>
                                  </div>
                                  <div className="mt-1">
                                    <strong>
                                      {metric.value} {metric.unit}
                                    </strong>
                                    <small className="text-muted d-block">
                                      Normal: {metric.normal}
                                    </small>
                                  </div>
                                </div>
                              </div>
                            ))}
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
      )}

      {/* Recommendations & Maintenance */}
      <div className="recommendations-section mb-4">
        <div className="row g-3">
          <div className="col-md-6">
            <div className="card h-100">
              <div className="card-header">
                <h6 className="mb-0">Recommendations</h6>
              </div>
              <div className="card-body">
                <div className="recommendations-list">
                  {diagnosticData.recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className="recommendation-item mb-3 pb-3 border-bottom"
                    >
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="mb-0">{rec.title}</h6>
                        <span
                          className="badge"
                          style={{
                            backgroundColor: getPriorityColor(rec.priority),
                            color: "white",
                          }}
                        >
                          {rec.priority}
                        </span>
                      </div>
                      <p className="text-muted mb-2">{rec.description}</p>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <small className="text-muted d-block">
                            Est. Cost: ${rec.estimatedCost}
                          </small>
                          <small className="text-muted">
                            Timeline: {rec.timeFrame}
                          </small>
                        </div>
                        <button className="btn btn-primary btn-sm">
                          Schedule Service
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card h-100">
              <div className="card-header">
                <h6 className="mb-0">Maintenance Schedule</h6>
              </div>
              <div className="card-body">
                <div className="maintenance-list">
                  {diagnosticData.maintenanceSchedule.map((item, index) => (
                    <div
                      key={index}
                      className="maintenance-item mb-3 pb-3 border-bottom"
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="mb-0">{item.service}</h6>
                          <small className="text-muted">
                            Due: {formatDate(item.dueDate)} or{" "}
                            {item.mileage.toLocaleString()} miles
                          </small>
                        </div>
                        <span
                          className="badge"
                          style={{
                            backgroundColor: getPriorityColor(item.priority),
                            color: "white",
                          }}
                        >
                          {item.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Report History */}
      <div className="report-history">
        <div className="card">
          <div className="card-header">
            <h6 className="mb-0">Diagnostic Report History</h6>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Report Type</th>
                    <th>Health Score</th>
                    <th>Issues</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reportHistory.map((report) => (
                    <tr key={report.id}>
                      <td>{formatDate(report.date)}</td>
                      <td className="text-capitalize">{report.type}</td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            backgroundColor: getHealthColor(report.score),
                            color: "white",
                          }}
                        >
                          {report.score}
                        </span>
                      </td>
                      <td>{report.issues}</td>
                      <td>
                        <span className="badge bg-success">Completed</span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button className="btn btn-outline-primary">
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button className="btn btn-outline-success">
                            <DocumentArrowDownIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticReportGenerator;
