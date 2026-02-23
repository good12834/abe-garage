import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CubeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  TruckIcon,
  ChartBarIcon,
  FunnelIcon,
  PlusIcon,
  MinusIcon,
  ShoppingCartIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { useAuth } from "../../context/AuthContext";

const SmartPartsInventory = () => {
  const { user } = useAuth();
  const [inventoryData, setInventoryData] = useState(null);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [reorderSuggestions, setReorderSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  useEffect(() => {
    fetchInventoryData();
  }, [selectedCategory, sortBy]);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);

      // Mock inventory data
      const mockInventory = [
        {
          id: 1,
          name: "Oil Filter - Honda Civic 2018-2023",
          category: "filters",
          sku: "OIL-HC-001",
          currentStock: 15,
          minStock: 10,
          maxStock: 50,
          unitPrice: 12.99,
          supplier: "AutoParts Plus",
          lastOrderDate: "2024-11-15",
          estimatedUsage: 8,
          status: "normal",
          location: "A1-B2",
          compatibility: ["Honda Civic 2018-2023", "Honda Accord 2018-2023"],
        },
        {
          id: 2,
          name: "Brake Pads - Front Ceramic",
          category: "brakes",
          sku: "BRK-FC-045",
          currentStock: 3,
          minStock: 8,
          maxStock: 30,
          unitPrice: 45.99,
          supplier: "BrakeTech Supply",
          lastOrderDate: "2024-10-20",
          estimatedUsage: 5,
          status: "low",
          location: "B3-C1",
          compatibility: ["Most Honda models", "Most Toyota models"],
        },
        {
          id: 3,
          name: "Air Filter - Premium",
          category: "filters",
          sku: "AIR-PM-012",
          currentStock: 25,
          minStock: 5,
          maxStock: 20,
          unitPrice: 18.99,
          supplier: "FilterCorp",
          lastOrderDate: "2024-12-01",
          estimatedUsage: 12,
          status: "normal",
          location: "A1-C3",
          compatibility: ["Universal fit"],
        },
        {
          id: 4,
          name: "Spark Plugs - Iridium Set of 4",
          category: "engine",
          sku: "SPK-IR-008",
          currentStock: 2,
          minStock: 6,
          maxStock: 24,
          unitPrice: 32.99,
          supplier: "Ignition Systems Inc",
          lastOrderDate: "2024-09-30",
          estimatedUsage: 4,
          status: "critical",
          location: "D2-E1",
          compatibility: ["Honda Civic", "Toyota Corolla", "Nissan Sentra"],
        },
        {
          id: 5,
          name: "Transmission Fluid - ATF",
          category: "fluids",
          sku: "FLD-ATF-005",
          currentStock: 8,
          minStock: 10,
          maxStock: 40,
          unitPrice: 24.99,
          supplier: "Fluid Dynamics",
          lastOrderDate: "2024-11-20",
          estimatedUsage: 6,
          status: "low",
          location: "F1-G2",
          compatibility: ["Honda", "Toyota", "Nissan"],
        },
      ];

      const mockAlerts = mockInventory.filter(
        (item) => item.currentStock <= item.minStock
      );

      const mockReorders = [
        {
          id: 1,
          partId: 2,
          partName: "Brake Pads - Front Ceramic",
          suggestedQuantity: 25,
          urgency: "high",
          reason: "Stock below minimum threshold",
          estimatedCost: 1149.75,
          supplier: "BrakeTech Supply",
        },
        {
          id: 2,
          partId: 4,
          partName: "Spark Plugs - Iridium Set of 4",
          suggestedQuantity: 20,
          urgency: "critical",
          reason: "Critical stock level",
          estimatedCost: 659.8,
          supplier: "Ignition Systems Inc",
        },
      ];

      setTimeout(() => {
        setInventoryData(mockInventory);
        setLowStockAlerts(mockAlerts);
        setReorderSuggestions(mockReorders);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching inventory data:", error);
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "critical":
        return "#ef4444";
      case "low":
        return "#f59e0b";
      case "normal":
        return "#10b981";
      default:
        return "#6b7280";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "critical":
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
      case "low":
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      case "normal":
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStockLevel = (item) => {
    const percentage = (item.currentStock / item.maxStock) * 100;
    if (percentage <= 25) return "critical";
    if (percentage <= 50) return "low";
    return "normal";
  };

  const filteredInventory = inventoryData
    ? selectedCategory === "all"
      ? inventoryData
      : inventoryData.filter((item) => item.category === selectedCategory)
    : [];

  const categoryData = [
    { name: "Filters", value: 40, color: "#3b82f6" },
    { name: "Brakes", value: 25, color: "#ef4444" },
    { name: "Engine", value: 20, color: "#f59e0b" },
    { name: "Fluids", value: 15, color: "#10b981" },
  ];

  const stockTrendData = [
    { month: "Jul", totalValue: 15000, turnover: 85 },
    { month: "Aug", totalValue: 16200, turnover: 92 },
    { month: "Sep", totalValue: 15800, turnover: 88 },
    { month: "Oct", totalValue: 17100, turnover: 95 },
    { month: "Nov", totalValue: 16500, turnover: 90 },
    { month: "Dec", totalValue: 18200, turnover: 98 },
  ];

  if (loading) {
    return (
      <div className="card h-100">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h6 className="mb-0">
            <CubeIcon className="me-2 text-primary" />
            Smart Parts Inventory
          </h6>
        </div>
        <div className="card-body text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mt-3">Analyzing inventory data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="inventory-dashboard">
      <div className="dashboard-header mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <h2>
            <CubeIcon className="me-3 text-primary" />
            Smart Parts Inventory Management
          </h2>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-primary btn-sm">
              <PlusIcon className="w-4 h-4 me-1" />
              Add Part
            </button>
            <button className="btn btn-outline-success btn-sm">
              <TruckIcon className="w-4 h-4 me-1" />
              Create Order
            </button>
          </div>
        </div>
      </div>

      {/* Alert Summary */}
      {lowStockAlerts.length > 0 && (
        <div className="alert-section mb-4">
          <div className="row g-3">
            {lowStockAlerts.slice(0, 3).map((alert) => (
              <div key={alert.id} className="col-md-4">
                <div className="alert alert-warning border-0 rounded-3">
                  <div className="d-flex align-items-center">
                    {getStatusIcon(alert.status)}
                    <div className="ms-2">
                      <h6 className="mb-1">{alert.name}</h6>
                      <p className="mb-0 small">
                        Stock: {alert.currentStock} (Min: {alert.minStock})
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="metrics-grid mb-4">
        <div className="row g-3">
          <div className="col-md-3">
            <div className="card border-0 bg-primary text-white">
              <div className="card-body text-center">
                <h3>{inventoryData?.length || 0}</h3>
                <p className="mb-0">Total Parts</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 bg-warning text-white">
              <div className="card-body text-center">
                <h3>{lowStockAlerts.length}</h3>
                <p className="mb-0">Low Stock Items</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 bg-success text-white">
              <div className="card-body text-center">
                <h3>
                  $
                  {inventoryData
                    ?.reduce(
                      (sum, item) => sum + item.currentStock * item.unitPrice,
                      0
                    )
                    .toLocaleString() || 0}
                </h3>
                <p className="mb-0">Total Value</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 bg-info text-white">
              <div className="card-body text-center">
                <h3>{reorderSuggestions.length}</h3>
                <p className="mb-0">Reorder Suggestions</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section mb-4">
        <div className="row g-3">
          <div className="col-md-6">
            <div className="card h-100">
              <div className="card-header">
                <h6 className="mb-0">Inventory by Category</h6>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card h-100">
              <div className="card-header">
                <h6 className="mb-0">Stock Value Trend</h6>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={stockTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="totalValue"
                      stroke="#3b82f6"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reorder Suggestions */}
      {reorderSuggestions.length > 0 && (
        <div className="reorder-section mb-4">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="mb-0">
                <TruckIcon className="me-2" />
                Smart Reorder Suggestions
              </h6>
              <span className="badge bg-warning">
                {reorderSuggestions.length} Items
              </span>
            </div>
            <div className="card-body">
              <div className="row g-3">
                {reorderSuggestions.map((suggestion) => (
                  <div key={suggestion.id} className="col-md-6">
                    <div className="border rounded-3 p-3">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="mb-0">{suggestion.partName}</h6>
                        <span
                          className={`badge ${
                            suggestion.urgency === "critical"
                              ? "bg-danger"
                              : "bg-warning"
                          }`}
                        >
                          {suggestion.urgency}
                        </span>
                      </div>
                      <p className="text-muted small mb-2">
                        {suggestion.reason}
                      </p>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <small className="text-muted d-block">
                            Suggested Qty: {suggestion.suggestedQuantity}
                          </small>
                          <small className="text-muted">
                            Est. Cost: $
                            {suggestion.estimatedCost.toLocaleString()}
                          </small>
                        </div>
                        <button className="btn btn-primary btn-sm">
                          Create Order
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Table */}
      <div className="inventory-table">
        <div className="card">
          <div className="card-header">
            <div className="d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Parts Inventory</h6>
              <div className="d-flex gap-2">
                <select
                  className="form-select form-select-sm"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{ width: "auto" }}
                >
                  <option value="all">All Categories</option>
                  <option value="filters">Filters</option>
                  <option value="brakes">Brakes</option>
                  <option value="engine">Engine</option>
                  <option value="fluids">Fluids</option>
                </select>
                <select
                  className="form-select form-select-sm"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{ width: "auto" }}
                >
                  <option value="name">Sort by Name</option>
                  <option value="stock">Sort by Stock</option>
                  <option value="price">Sort by Price</option>
                  <option value="category">Sort by Category</option>
                </select>
              </div>
            </div>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Part</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th>Current Stock</th>
                    <th>Min/Max</th>
                    <th>Unit Price</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div>
                          <h6 className="mb-0">{item.name}</h6>
                          <small className="text-muted">
                            {item.compatibility.slice(0, 2).join(", ")}
                            {item.compatibility.length > 2 && "..."}
                          </small>
                        </div>
                      </td>
                      <td>
                        <code className="small">{item.sku}</code>
                      </td>
                      <td>
                        <span className="badge bg-secondary text-uppercase">
                          {item.category}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <span className="fw-bold me-2">
                            {item.currentStock}
                          </span>
                          <div
                            className="progress"
                            style={{ width: "60px", height: "4px" }}
                          >
                            <div
                              className="progress-bar"
                              style={{
                                width: `${Math.min(
                                  (item.currentStock / item.maxStock) * 100,
                                  100
                                )}%`,
                                backgroundColor: getStatusColor(item.status),
                              }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <small>
                          {item.minStock}/{item.maxStock}
                        </small>
                      </td>
                      <td>${item.unitPrice}</td>
                      <td>
                        <code className="small">{item.location}</code>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          {getStatusIcon(item.status)}
                          <span className="ms-1 small text-capitalize">
                            {item.status}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button className="btn btn-outline-primary">
                            <MinusIcon className="w-4 h-4" />
                          </button>
                          <button className="btn btn-outline-primary">
                            <PlusIcon className="w-4 h-4" />
                          </button>
                          <button className="btn btn-outline-info">
                            <DocumentTextIcon className="w-4 h-4" />
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

export default SmartPartsInventory;
