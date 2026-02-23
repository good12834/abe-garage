import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { servicesAPI } from "../services/api";
import {
  CalculatorIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
  CogIcon,
  CalendarIcon,
  ClockIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  StarIcon,
} from "@heroicons/react/24/outline";

export default function BudgetPlanner() {
  const { isAuthenticated } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [budgetData, setBudgetData] = useState({
    vehicleValue: "",
    monthlyBudget: "",
    selectedServices: [],
    maintenanceFrequency: "monthly",
    totalEstimatedCost: 0,
    savings: 0,
    // Enhanced features
    vehicleYear: "",
    currentMileage: "",
    vehicleMake: "",
    vehicleModel: "",
    savingsGoal: "",
    emergencyFund: "",
    preferredSeason: "all",
    maintenanceSchedule: [],
    costBreakdown: {},
    roiAnalysis: {},
  });

  const [activeTab, setActiveTab] = useState("calculator");
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = (await servicesAPI.getAllServices?.({
          active: true,
        })) || { data: { success: false } };
        if (response.data?.success && response.data?.data?.services) {
          setServices(response.data.data.services.slice(0, 8));
        }
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const calculateBudget = () => {
    let totalCost = 0;
    const frequencyMultiplier = {
      monthly: 1,
      quarterly: 3,
      biannually: 6,
      annually: 12,
    };

    budgetData.selectedServices.forEach((serviceId) => {
      const service = services.find((s) => s.id === serviceId);
      if (service) {
        totalCost +=
          (service.base_price || 0) *
          frequencyMultiplier[budgetData.maintenanceFrequency];
      }
    });

    const vehicleValue = parseFloat(budgetData.vehicleValue) || 0;
    const monthlyBudget = parseFloat(budgetData.monthlyBudget) || 0;
    const savings = monthlyBudget * 12 - totalCost;

    setBudgetData((prev) => ({
      ...prev,
      totalEstimatedCost: totalCost,
      savings: savings,
    }));
  };

  useEffect(() => {
    if (services.length > 0) {
      calculateBudget();
    }
  }, [budgetData.selectedServices, budgetData.maintenanceFrequency, services]);

  const toggleService = (serviceId) => {
    setBudgetData((prev) => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(serviceId)
        ? prev.selectedServices.filter((id) => id !== serviceId)
        : [...prev.selectedServices, serviceId],
    }));
  };

  const maintenanceOptions = [
    { value: "monthly", label: "Monthly", description: "Regular maintenance" },
    { value: "quarterly", label: "Quarterly", description: "Every 3 months" },
    {
      value: "biannually",
      label: "Bi-annually",
      description: "Every 6 months",
    },
    { value: "annually", label: "Annually", description: "Yearly maintenance" },
  ];

  const seasonalRecommendations = {
    winter: ["Battery Replacement", "Tire Installation", "Brake Inspection"],
    summer: [
      "Air Conditioning Service",
      "Car Wash & Detail",
      "Engine Diagnostics",
    ],
    spring: ["Oil Change", "Brake Pad Replacement", "Transmission Service"],
    fall: ["Tire Installation", "Engine Diagnostics", "Brake Inspection"],
    all: [],
  };

  const generateMaintenanceSchedule = () => {
    const schedule = [];
    const currentDate = new Date();
    const frequencyDays = {
      monthly: 30,
      quarterly: 90,
      biannually: 180,
      annually: 365,
    };

    budgetData.selectedServices.forEach((serviceId) => {
      const service = services.find((s) => s.id === serviceId);
      if (service) {
        for (let i = 0; i < 4; i++) {
          const nextDate = new Date(currentDate);
          nextDate.setDate(
            currentDate.getDate() +
              frequencyDays[budgetData.maintenanceFrequency] * i
          );
          schedule.push({
            service: service.name,
            date: nextDate.toLocaleDateString(),
            cost: service.base_price || 0,
          });
        }
      }
    });

    setBudgetData((prev) => ({ ...prev, maintenanceSchedule: schedule }));
  };

  const calculateROI = () => {
    const vehicleValue = parseFloat(budgetData.vehicleValue) || 0;
    const annualMaintenance = budgetData.totalEstimatedCost;
    const preventiveMaintenanceSavings = annualMaintenance * 0.3; // Estimated 30% savings from preventive care
    const resaleValueIncrease = vehicleValue * 0.05; // 5% increase in resale value

    return {
      annualSavings: preventiveMaintenanceSavings,
      resaleIncrease: resaleValueIncrease,
      totalROI: preventiveMaintenanceSavings + resaleValueIncrease,
      paybackPeriod:
        annualMaintenance > 0
          ? (annualMaintenance / preventiveMaintenanceSavings).toFixed(1)
          : 0,
    };
  };

  const tabs = [
    { id: "calculator", label: "Budget Calculator", icon: CalculatorIcon },
    { id: "schedule", label: "Maintenance Schedule", icon: CalendarIcon },
    { id: "analysis", label: "Cost Analysis", icon: ChartBarIcon },
    { id: "insights", label: "Smart Insights", icon: ArrowTrendingUpIcon },
  ];

  return (
    <div className="ag-home" style={{ paddingTop: "80px", minHeight: "100vh" }}>
      {/* Hero Section */}
      <section className="container ag-section">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="d-flex justify-content-center mb-4">
            <div
              className="ag-card-icon"
              style={{
                width: "100px",
                height: "100px",
                background: "linear-gradient(135deg, #1e3a8a, #3b82f6)",
              }}
            >
              <CalculatorIcon className="icon-svg-lg" />
            </div>
          </div>
          <h1
            className="ag-hero-title"
            style={{ fontSize: "3rem", marginBottom: "1rem" }}
          >
            Budget Planner
          </h1>
          <p
            className="ag-hero-sub"
            style={{ fontSize: "1.2rem", maxWidth: "600px", margin: "0 auto" }}
          >
            Plan your vehicle maintenance budget and save money with our
            intelligent cost calculator
          </p>
        </motion.div>
      </section>

      {/* Enhanced Budget Planner with Tabs */}
      <section className="container ag-section">
        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-5"
        >
          <div className="d-flex justify-content-center flex-wrap gap-2 mb-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`ag-btn ${
                  activeTab === tab.id ? "ag-btn-primary" : "ag-btn-outline"
                } d-flex align-items-center gap-2`}
                style={{ minWidth: "180px" }}
              >
                <tab.icon style={{ width: "18px", height: "18px" }} />
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        {activeTab === "calculator" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="row"
          >
            {/* Input Section */}
            <div className="col-lg-6">
              <div className="ag-card" style={{ padding: "2rem" }}>
                <h3
                  className="mb-4"
                  style={{ color: "#1e3a8a", fontWeight: "700" }}
                >
                  <CalculatorIcon
                    style={{
                      width: "24px",
                      height: "24px",
                      display: "inline",
                      marginRight: "10px",
                    }}
                  />
                  Budget Calculator
                </h3>

                <div className="mb-4">
                  <label className="form-label fw-bold">
                    Vehicle Value ($)
                  </label>
                  <input
                    type="number"
                    className="form-control form-control-lg"
                    placeholder="Enter your vehicle value"
                    value={budgetData.vehicleValue}
                    onChange={(e) =>
                      setBudgetData((prev) => ({
                        ...prev,
                        vehicleValue: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold">
                    Monthly Budget ($)
                  </label>
                  <input
                    type="number"
                    className="form-control form-control-lg"
                    placeholder="Monthly maintenance budget"
                    value={budgetData.monthlyBudget}
                    onChange={(e) =>
                      setBudgetData((prev) => ({
                        ...prev,
                        monthlyBudget: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold">
                    Maintenance Frequency
                  </label>
                  <select
                    className="form-select form-select-lg"
                    value={budgetData.maintenanceFrequency}
                    onChange={(e) =>
                      setBudgetData((prev) => ({
                        ...prev,
                        maintenanceFrequency: e.target.value,
                      }))
                    }
                  >
                    {maintenanceOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label} - {option.description}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="ag-btn ag-btn-outline w-100 mb-3"
                >
                  {showAdvanced ? "Hide" : "Show"} Advanced Options
                </button>

                {showAdvanced && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-top pt-3"
                  >
                    <div className="row">
                      <div className="col-md-6">
                        <label className="form-label fw-bold">
                          Vehicle Year
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="2020"
                          value={budgetData.vehicleYear}
                          onChange={(e) =>
                            setBudgetData((prev) => ({
                              ...prev,
                              vehicleYear: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">
                          Current Mileage
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="50000"
                          value={budgetData.currentMileage}
                          onChange={(e) =>
                            setBudgetData((prev) => ({
                              ...prev,
                              currentMileage: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                    <div className="mt-3">
                      <label className="form-label fw-bold">
                        Preferred Season
                      </label>
                      <select
                        className="form-select"
                        value={budgetData.preferredSeason}
                        onChange={(e) =>
                          setBudgetData((prev) => ({
                            ...prev,
                            preferredSeason: e.target.value,
                          }))
                        }
                      >
                        <option value="all">All Year</option>
                        <option value="winter">Winter Focus</option>
                        <option value="spring">Spring Focus</option>
                        <option value="summer">Summer Focus</option>
                        <option value="fall">Fall Focus</option>
                      </select>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Results Section */}
            <div className="col-lg-6">
              <div
                className="ag-card"
                style={{
                  padding: "2rem",
                  background: "linear-gradient(135deg, #f8fafc, #e2e8f0)",
                }}
              >
                <h3
                  className="mb-4"
                  style={{ color: "#1e3a8a", fontWeight: "700" }}
                >
                  <ChartBarIcon
                    style={{
                      width: "24px",
                      height: "24px",
                      display: "inline",
                      marginRight: "10px",
                    }}
                  />
                  Budget Analysis
                </h3>

                <div className="row text-center mb-4">
                  <div className="col-6">
                    <div
                      style={{
                        padding: "1.5rem",
                        background: "white",
                        borderRadius: "12px",
                        marginBottom: "1rem",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "2rem",
                          fontWeight: "700",
                          color: "#1e3a8a",
                        }}
                      >
                        ${budgetData.totalEstimatedCost.toLocaleString()}
                      </div>
                      <div style={{ color: "#64748b", fontSize: "0.9rem" }}>
                        Annual Cost
                      </div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div
                      style={{
                        padding: "1.5rem",
                        background: "white",
                        borderRadius: "12px",
                        marginBottom: "1rem",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "2rem",
                          fontWeight: "700",
                          color:
                            budgetData.savings >= 0 ? "#10b981" : "#ef4444",
                        }}
                      >
                        ${Math.abs(budgetData.savings).toLocaleString()}
                      </div>
                      <div style={{ color: "#64748b", fontSize: "0.9rem" }}>
                        {budgetData.savings >= 0 ? "Savings" : "Overspend"}
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    padding: "1rem",
                    background: "white",
                    borderRadius: "12px",
                  }}
                >
                  <h5 style={{ color: "#1e3a8a", marginBottom: "1rem" }}>
                    Smart Recommendation
                  </h5>
                  <p style={{ color: "#64748b", margin: 0 }}>
                    {budgetData.savings >= 0
                      ? "Excellent! You're within budget. Consider premium services or emergency fund."
                      : "Consider adjusting frequency or increasing budget. Preventive maintenance saves money long-term."}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "schedule" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="ag-card" style={{ padding: "2rem" }}>
              <h3
                className="mb-4"
                style={{ color: "#1e3a8a", fontWeight: "700" }}
              >
                <CalendarIcon
                  style={{
                    width: "24px",
                    height: "24px",
                    display: "inline",
                    marginRight: "10px",
                  }}
                />
                Maintenance Schedule
              </h3>

              <div className="text-center mb-4">
                <button
                  onClick={generateMaintenanceSchedule}
                  className="ag-btn ag-btn-primary"
                  disabled={budgetData.selectedServices.length === 0}
                >
                  Generate Schedule
                </button>
              </div>

              {budgetData.maintenanceSchedule.length > 0 ? (
                <div className="row">
                  {budgetData.maintenanceSchedule
                    .slice(0, 8)
                    .map((item, idx) => (
                      <div key={idx} className="col-md-6 mb-3">
                        <div
                          style={{
                            padding: "1rem",
                            background:
                              "linear-gradient(135deg, #f8fafc, #e2e8f0)",
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <strong style={{ color: "#1e3a8a" }}>
                                {item.service}
                              </strong>
                              <div
                                style={{ color: "#64748b", fontSize: "0.9rem" }}
                              >
                                {item.date}
                              </div>
                            </div>
                            <div
                              style={{ color: "#10b981", fontWeight: "600" }}
                            >
                              ${item.cost}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <ClockIcon
                    style={{
                      width: "48px",
                      height: "48px",
                      color: "#cbd5e1",
                      marginBottom: "1rem",
                    }}
                  />
                  <p style={{ color: "#64748b" }}>
                    Select services and generate your personalized maintenance
                    schedule
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === "analysis" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="row"
          >
            <div className="col-lg-6">
              <div className="ag-card" style={{ padding: "2rem" }}>
                <h3
                  className="mb-4"
                  style={{ color: "#1e3a8a", fontWeight: "700" }}
                >
                  <ArrowTrendingUpIcon
                    style={{
                      width: "24px",
                      height: "24px",
                      display: "inline",
                      marginRight: "10px",
                    }}
                  />
                  Cost Breakdown
                </h3>

                {budgetData.selectedServices.length > 0 ? (
                  budgetData.selectedServices.map((serviceId) => {
                    const service = services.find((s) => s.id === serviceId);
                    return service ? (
                      <div
                        key={serviceId}
                        className="d-flex justify-content-between align-items-center mb-3 p-3"
                        style={{ background: "#f8fafc", borderRadius: "8px" }}
                      >
                        <span style={{ fontWeight: "600", color: "#1e3a8a" }}>
                          {service.name}
                        </span>
                        <span style={{ color: "#10b981", fontWeight: "700" }}>
                          ${service.base_price || 0}
                        </span>
                      </div>
                    ) : null;
                  })
                ) : (
                  <p
                    style={{
                      color: "#64748b",
                      textAlign: "center",
                      padding: "2rem",
                    }}
                  >
                    Select services to see cost breakdown
                  </p>
                )}

                <hr />
                <div className="d-flex justify-content-between align-items-center">
                  <strong style={{ color: "#1e3a8a" }}>
                    Total Annual Cost
                  </strong>
                  <strong style={{ color: "#1e3a8a", fontSize: "1.2rem" }}>
                    ${budgetData.totalEstimatedCost.toLocaleString()}
                  </strong>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="ag-card" style={{ padding: "2rem" }}>
                <h3
                  className="mb-4"
                  style={{ color: "#1e3a8a", fontWeight: "700" }}
                >
                  <ShieldCheckIcon
                    style={{
                      width: "24px",
                      height: "24px",
                      display: "inline",
                      marginRight: "10px",
                    }}
                  />
                  ROI Analysis
                </h3>

                {(() => {
                  const roi = calculateROI();
                  return (
                    <div>
                      <div
                        className="mb-3 p-3"
                        style={{
                          background: "#f0f9ff",
                          borderRadius: "8px",
                          border: "1px solid #bae6fd",
                        }}
                      >
                        <div className="d-flex justify-content-between">
                          <span>Preventive Maintenance Savings</span>
                          <strong style={{ color: "#0369a1" }}>
                            ${roi.annualSavings.toLocaleString()}
                          </strong>
                        </div>
                      </div>

                      <div
                        className="mb-3 p-3"
                        style={{
                          background: "#f0fdf4",
                          borderRadius: "8px",
                          border: "1px solid #bbf7d0",
                        }}
                      >
                        <div className="d-flex justify-content-between">
                          <span>Resale Value Increase</span>
                          <strong style={{ color: "#166534" }}>
                            ${roi.resaleIncrease.toLocaleString()}
                          </strong>
                        </div>
                      </div>

                      <div
                        className="p-3"
                        style={{
                          background:
                            "linear-gradient(135deg, #fef3c7, #fde68a)",
                          borderRadius: "8px",
                          border: "1px solid #f59e0b",
                        }}
                      >
                        <div className="d-flex justify-content-between">
                          <span>
                            <strong>Total ROI</strong>
                          </span>
                          <strong style={{ color: "#92400e" }}>
                            ${roi.totalROI.toLocaleString()}
                          </strong>
                        </div>
                        <small style={{ color: "#92400e" }}>
                          Payback period: {roi.paybackPeriod} years
                        </small>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "insights" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="row"
          >
            <div className="col-lg-6">
              <div className="ag-card" style={{ padding: "2rem" }}>
                <h3
                  className="mb-4"
                  style={{ color: "#1e3a8a", fontWeight: "700" }}
                >
                  <StarIcon
                    style={{
                      width: "24px",
                      height: "24px",
                      display: "inline",
                      marginRight: "10px",
                    }}
                  />
                  Seasonal Recommendations
                </h3>

                <div className="mb-3">
                  <select
                    className="form-select"
                    value={budgetData.preferredSeason}
                    onChange={(e) =>
                      setBudgetData((prev) => ({
                        ...prev,
                        preferredSeason: e.target.value,
                      }))
                    }
                  >
                    <option value="all">All Seasons</option>
                    <option value="winter">Winter Maintenance</option>
                    <option value="spring">Spring Maintenance</option>
                    <option value="summer">Summer Maintenance</option>
                    <option value="fall">Fall Maintenance</option>
                  </select>
                </div>

                {seasonalRecommendations[budgetData.preferredSeason]?.length >
                0 ? (
                  <div>
                    <h5 style={{ color: "#1e3a8a", marginBottom: "1rem" }}>
                      Recommended for {budgetData.preferredSeason}:
                    </h5>
                    {seasonalRecommendations[budgetData.preferredSeason].map(
                      (service) => (
                        <div
                          key={service}
                          className="d-flex align-items-center mb-2"
                        >
                          <CheckCircleIcon
                            style={{
                              width: "16px",
                              height: "16px",
                              color: "#10b981",
                              marginRight: "8px",
                            }}
                          />
                          <span>{service}</span>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p style={{ color: "#64748b" }}>
                    General maintenance recommendations will be shown based on
                    your selections.
                  </p>
                )}
              </div>
            </div>

            <div className="col-lg-6">
              <div className="ag-card" style={{ padding: "2rem" }}>
                <h3
                  className="mb-4"
                  style={{ color: "#1e3a8a", fontWeight: "700" }}
                >
                  <ExclamationTriangleIcon
                    style={{
                      width: "24px",
                      height: "24px",
                      display: "inline",
                      marginRight: "10px",
                    }}
                  />
                  Emergency Fund Calculator
                </h3>

                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Emergency Fund Goal ($)
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Recommended: 10% of vehicle value"
                    value={budgetData.emergencyFund}
                    onChange={(e) =>
                      setBudgetData((prev) => ({
                        ...prev,
                        emergencyFund: e.target.value,
                      }))
                    }
                  />
                </div>

                <div
                  className="p-3"
                  style={{
                    background: "#fef2f2",
                    borderRadius: "8px",
                    border: "1px solid #fecaca",
                  }}
                >
                  <div className="d-flex justify-content-between mb-2">
                    <span>Recommended Emergency Fund:</span>
                    <strong style={{ color: "#dc2626" }}>
                      $
                      {(
                        parseFloat(budgetData.vehicleValue) * 0.1 || 0
                      ).toLocaleString()}
                    </strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Your Goal:</span>
                    <strong style={{ color: "#dc2626" }}>
                      $
                      {(
                        parseFloat(budgetData.emergencyFund) || 0
                      ).toLocaleString()}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </section>

      {/* Services Selection */}
      <section className="container ag-section">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mb-5"
        >
          <h2
            style={{
              color: "#1e3a8a",
              fontWeight: "700",
              marginBottom: "1rem",
            }}
          >
            Select Services to Include
          </h2>
          <p style={{ color: "#64748b", fontSize: "1.1rem" }}>
            Choose the maintenance services you want to include in your budget
            calculation
          </p>
        </motion.div>

        <div className="row gy-4">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="col-lg-4 col-md-6">
                  <div className="ag-card ag-card-skeleton" />
                </div>
              ))
            : services.map((service, idx) => (
                <motion.div
                  key={service.id || idx}
                  className="col-lg-4 col-md-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                >
                  <div
                    className={`ag-card ${
                      budgetData.selectedServices.includes(service.id)
                        ? "border-primary"
                        : ""
                    }`}
                    style={{
                      padding: "1.5rem",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      border: budgetData.selectedServices.includes(service.id)
                        ? "2px solid #1e3a8a"
                        : "1px solid #e2e8f0",
                    }}
                    onClick={() => toggleService(service.id)}
                  >
                    <div className="d-flex align-items-center mb-3">
                      <input
                        type="checkbox"
                        checked={budgetData.selectedServices.includes(
                          service.id
                        )}
                        onChange={() => toggleService(service.id)}
                        className="me-3"
                        style={{ transform: "scale(1.2)" }}
                      />
                      <div
                        className="ag-card-icon"
                        style={{ width: "50px", height: "50px", margin: 0 }}
                      >
                        <WrenchScrewdriverIcon className="icon-svg" />
                      </div>
                    </div>

                    <h5
                      style={{
                        color: "#1e3a8a",
                        fontWeight: "600",
                        marginBottom: "0.5rem",
                      }}
                    >
                      {service.name}
                    </h5>

                    <p
                      style={{
                        color: "#64748b",
                        fontSize: "0.9rem",
                        marginBottom: "1rem",
                      }}
                    >
                      {(service.description || "Professional service").slice(
                        0,
                        80
                      )}
                      {(service.description || "").length > 80 ? "..." : ""}
                    </p>

                    <div className="d-flex justify-content-between align-items-center">
                      <span
                        className="badge"
                        style={{
                          background:
                            "linear-gradient(135deg, #10b981, #059669)",
                          color: "white",
                        }}
                      >
                        From ${service.base_price || "—"}
                      </span>
                      <span style={{ color: "#64748b", fontSize: "0.8rem" }}>
                        {service.duration_minutes || "—"} min
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container ag-section">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center"
        >
          <div className="ag-cta p-5 rounded-3">
            <h3 className="mb-3">Ready to Book Your Service?</h3>
            <p className="mb-4" style={{ fontSize: "1.1rem" }}>
              Use your budget analysis to make informed decisions about your
              vehicle maintenance.
            </p>
            <div className="ag-cta-actions">
              <a
                href="/book-appointment"
                className="ag-btn ag-btn-primary ag-btn-lg"
              >
                Book Appointment
              </a>
              {!isAuthenticated && (
                <a href="/register" className="ag-btn ag-btn-outline ag-btn-lg">
                  Create Account
                </a>
              )}
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
