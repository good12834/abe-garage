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
  PlusIcon,
  MinusIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

export default function CostCalculator() {
  const { isAuthenticated } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedServices, setSelectedServices] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [laborHours, setLaborHours] = useState({});
  const [customDiscount, setCustomDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(8.25); // Default tax rate
  const [showBreakdown, setShowBreakdown] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = (await servicesAPI.getAllServices?.({
          active: true,
        })) || { data: { success: false } };
        if (response.data?.success && response.data?.data?.services) {
          setServices(response.data.data.services);
        }
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const addService = (service) => {
    if (!selectedServices.find((s) => s.id === service.id)) {
      setSelectedServices([...selectedServices, service]);
      setQuantities({ ...quantities, [service.id]: 1 });
      setLaborHours({
        ...laborHours,
        [service.id]: service.duration_minutes || 60,
      });
    }
  };

  const removeService = (serviceId) => {
    setSelectedServices(selectedServices.filter((s) => s.id !== serviceId));
    const newQuantities = { ...quantities };
    const newLaborHours = { ...laborHours };
    delete newQuantities[serviceId];
    delete newLaborHours[serviceId];
    setQuantities(newQuantities);
    setLaborHours(newLaborHours);
  };

  const updateQuantity = (serviceId, quantity) => {
    if (quantity >= 1) {
      setQuantities({ ...quantities, [serviceId]: quantity });
    }
  };

  const updateLaborHours = (serviceId, hours) => {
    if (hours >= 0) {
      setLaborHours({ ...laborHours, [serviceId]: hours });
    }
  };

  const calculateSubtotal = () => {
    return selectedServices.reduce((total, service) => {
      const quantity = quantities[service.id] || 1;
      const basePrice = service.base_price || 0;
      return total + basePrice * quantity;
    }, 0);
  };

  const calculateLaborCost = () => {
    return selectedServices.reduce((total, service) => {
      const hours = laborHours[service.id] || 0;
      const hourlyRate = 75; // Standard mechanic hourly rate
      return total + (hours * hourlyRate) / 60; // Convert minutes to hours
    }, 0);
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal() + calculateLaborCost();
    return subtotal * (customDiscount / 100);
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal() + calculateLaborCost();
    const discount = calculateDiscount();
    return (subtotal - discount) * (taxRate / 100);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal() + calculateLaborCost();
    const discount = calculateDiscount();
    const tax = calculateTax();
    return subtotal - discount + tax;
  };

  const getCostBreakdown = () => {
    return selectedServices.map((service) => {
      const quantity = quantities[service.id] || 1;
      const basePrice = service.base_price || 0;
      const laborCost = ((laborHours[service.id] || 0) * 75) / 60;
      const serviceTotal = basePrice * quantity + laborCost;

      return {
        service: service.name,
        parts: basePrice * quantity,
        labor: laborCost,
        total: serviceTotal,
      };
    });
  };

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
            Cost Calculator
          </h1>
          <p
            className="ag-hero-sub"
            style={{ fontSize: "1.2rem", maxWidth: "600px", margin: "0 auto" }}
          >
            Calculate precise costs for your vehicle services with detailed
            breakdowns and tax calculations
          </p>
        </motion.div>
      </section>

      <section className="container ag-section">
        <div className="row">
          {/* Services Selection */}
          <div className="col-lg-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="ag-card" style={{ padding: "2rem" }}>
                <h3
                  className="mb-4"
                  style={{ color: "#1e3a8a", fontWeight: "700" }}
                >
                  <WrenchScrewdriverIcon
                    style={{
                      width: "24px",
                      height: "24px",
                      display: "inline",
                      marginRight: "10px",
                    }}
                  />
                  Available Services
                </h3>

                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : (
                  <div className="row gy-3">
                    {services.map((service, idx) => (
                      <motion.div
                        key={service.id || idx}
                        className="col-md-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: idx * 0.05 }}
                      >
                        <div
                          className="ag-card"
                          style={{
                            padding: "1rem",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            border: selectedServices.find(
                              (s) => s.id === service.id
                            )
                              ? "2px solid #1e3a8a"
                              : "1px solid #e2e8f0",
                          }}
                        >
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div className="flex-grow-1">
                              <h6
                                style={{
                                  color: "#1e3a8a",
                                  fontWeight: "600",
                                  marginBottom: "0.5rem",
                                }}
                              >
                                {service.name}
                              </h6>
                              <p
                                style={{
                                  color: "#64748b",
                                  fontSize: "0.85rem",
                                  marginBottom: "0.5rem",
                                }}
                              >
                                {(
                                  service.description || "Professional service"
                                ).slice(0, 60)}
                                ...
                              </p>
                              <div className="d-flex justify-content-between align-items-center">
                                <span
                                  style={{
                                    color: "#10b981",
                                    fontWeight: "600",
                                  }}
                                >
                                  ${service.base_price || "—"}
                                </span>
                                <span
                                  style={{
                                    color: "#64748b",
                                    fontSize: "0.8rem",
                                  }}
                                >
                                  {service.duration_minutes || "—"} min
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() =>
                                selectedServices.find(
                                  (s) => s.id === service.id
                                )
                                  ? removeService(service.id)
                                  : addService(service)
                              }
                              className={`btn btn-sm ms-2 ${
                                selectedServices.find(
                                  (s) => s.id === service.id
                                )
                                  ? "btn-danger"
                                  : "btn-primary"
                              }`}
                            >
                              {selectedServices.find(
                                (s) => s.id === service.id
                              ) ? (
                                <XCircleIcon
                                  style={{ width: "16px", height: "16px" }}
                                />
                              ) : (
                                <PlusIcon
                                  style={{ width: "16px", height: "16px" }}
                                />
                              )}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Cost Calculator */}
          <div className="col-lg-4">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div
                className="ag-card"
                style={{ padding: "2rem", position: "sticky", top: "100px" }}
              >
                <h3
                  className="mb-4"
                  style={{ color: "#1e3a8a", fontWeight: "700" }}
                >
                  <CurrencyDollarIcon
                    style={{
                      width: "24px",
                      height: "24px",
                      display: "inline",
                      marginRight: "10px",
                    }}
                  />
                  Cost Calculator
                </h3>

                {/* Selected Services */}
                <div className="mb-4">
                  <h5 style={{ color: "#1e3a8a", marginBottom: "1rem" }}>
                    Selected Services
                  </h5>
                  {selectedServices.length === 0 ? (
                    <p style={{ color: "#64748b", fontStyle: "italic" }}>
                      No services selected
                    </p>
                  ) : (
                    selectedServices.map((service) => (
                      <div
                        key={service.id}
                        className="mb-3 p-2"
                        style={{ background: "#f8fafc", borderRadius: "8px" }}
                      >
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span style={{ fontWeight: "600", color: "#1e3a8a" }}>
                            {service.name}
                          </span>
                          <button
                            onClick={() => removeService(service.id)}
                            className="btn btn-sm btn-outline-danger"
                          >
                            <MinusIcon
                              style={{ width: "14px", height: "14px" }}
                            />
                          </button>
                        </div>

                        <div className="row g-2">
                          <div className="col-6">
                            <label
                              style={{ fontSize: "0.8rem", color: "#64748b" }}
                            >
                              Quantity
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={quantities[service.id] || 1}
                              onChange={(e) =>
                                updateQuantity(
                                  service.id,
                                  parseInt(e.target.value)
                                )
                              }
                              className="form-control form-control-sm"
                            />
                          </div>
                          <div className="col-6">
                            <label
                              style={{ fontSize: "0.8rem", color: "#64748b" }}
                            >
                              Labor Hours
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.5"
                              value={(laborHours[service.id] || 0) / 60}
                              onChange={(e) =>
                                updateLaborHours(
                                  service.id,
                                  parseFloat(e.target.value) * 60
                                )
                              }
                              className="form-control form-control-sm"
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Cost Settings */}
                <div className="mb-4">
                  <h5 style={{ color: "#1e3a8a", marginBottom: "1rem" }}>
                    Cost Settings
                  </h5>

                  <div className="mb-3">
                    <label style={{ fontSize: "0.9rem", color: "#64748b" }}>
                      Discount (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={customDiscount}
                      onChange={(e) =>
                        setCustomDiscount(parseFloat(e.target.value) || 0)
                      }
                      className="form-control"
                      placeholder="0"
                    />
                  </div>

                  <div className="mb-3">
                    <label style={{ fontSize: "0.9rem", color: "#64748b" }}>
                      Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      step="0.01"
                      value={taxRate}
                      onChange={(e) =>
                        setTaxRate(parseFloat(e.target.value) || 0)
                      }
                      className="form-control"
                      placeholder="8.25"
                    />
                  </div>
                </div>

                {/* Cost Summary */}
                <div
                  style={{ borderTop: "1px solid #e2e8f0", paddingTop: "1rem" }}
                >
                  <div className="d-flex justify-content-between mb-2">
                    <span>Parts & Materials:</span>
                    <span>${calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Labor:</span>
                    <span>${calculateLaborCost().toFixed(2)}</span>
                  </div>
                  <div
                    className="d-flex justify-content-between mb-2"
                    style={{ color: "#10b981" }}
                  >
                    <span>Discount:</span>
                    <span>-${calculateDiscount().toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <span>Tax:</span>
                    <span>${calculateTax().toFixed(2)}</span>
                  </div>
                  <hr />
                  <div
                    className="d-flex justify-content-between"
                    style={{
                      fontSize: "1.2rem",
                      fontWeight: "700",
                      color: "#1e3a8a",
                    }}
                  >
                    <span>Total:</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowBreakdown(!showBreakdown)}
                  className="ag-btn ag-btn-outline w-100 mt-3"
                >
                  {showBreakdown ? "Hide" : "Show"} Detailed Breakdown
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        {showBreakdown && selectedServices.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-4"
          >
            <div className="ag-card" style={{ padding: "2rem" }}>
              <h3
                className="mb-4"
                style={{ color: "#1e3a8a", fontWeight: "700" }}
              >
                <DocumentTextIcon
                  style={{
                    width: "24px",
                    height: "24px",
                    display: "inline",
                    marginRight: "10px",
                  }}
                />
                Detailed Cost Breakdown
              </h3>

              <div className="table-responsive">
                <table className="table table-hover">
                  <thead style={{ background: "#f8fafc" }}>
                    <tr>
                      <th style={{ color: "#1e3a8a" }}>Service</th>
                      <th style={{ color: "#1e3a8a", textAlign: "right" }}>
                        Parts
                      </th>
                      <th style={{ color: "#1e3a8a", textAlign: "right" }}>
                        Labor
                      </th>
                      <th style={{ color: "#1e3a8a", textAlign: "right" }}>
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {getCostBreakdown().map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: "600", color: "#1e3a8a" }}>
                          {item.service}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          ${item.parts.toFixed(2)}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          ${item.labor.toFixed(2)}
                        </td>
                        <td style={{ textAlign: "right", fontWeight: "600" }}>
                          ${item.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot style={{ borderTop: "2px solid #e2e8f0" }}>
                    <tr>
                      <td style={{ fontWeight: "700", color: "#1e3a8a" }}>
                        Grand Total
                      </td>
                      <td style={{ textAlign: "right", fontWeight: "700" }}>
                        $
                        {getCostBreakdown()
                          .reduce((sum, item) => sum + item.parts, 0)
                          .toFixed(2)}
                      </td>
                      <td style={{ textAlign: "right", fontWeight: "700" }}>
                        $
                        {getCostBreakdown()
                          .reduce((sum, item) => sum + item.labor, 0)
                          .toFixed(2)}
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                          fontWeight: "700",
                          color: "#1e3a8a",
                          fontSize: "1.1rem",
                        }}
                      >
                        ${calculateTotal().toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </section>

      {/* CTA Section */}
      <section className="container ag-section">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center"
        >
          <div className="ag-cta p-5 rounded-3">
            <h3 className="mb-3">Ready to Book Your Services?</h3>
            <p className="mb-4" style={{ fontSize: "1.1rem" }}>
              Use this detailed cost calculation to make informed decisions
              about your vehicle maintenance.
            </p>
            <div className="ag-cta-actions">
              <a
                href="/book-appointment"
                className="ag-btn ag-btn-primary ag-btn-lg"
              >
                Book Appointment
              </a>
              <a
                href="/budget-planner"
                className="ag-btn ag-btn-outline ag-btn-lg"
              >
                Budget Planner
              </a>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
